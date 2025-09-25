const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const User = require('../models/User');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

// Subscription tier configuration
const SUBSCRIPTION_TIERS = {
  free: {
    name: 'Free',
    priceId: null,
    price: 0,
    features: ['Basic features', 'Limited usage']
  },
  pro: {
    name: 'Pro',
    priceId: process.env.STRIPE_PRICE_PRO_MONTHLY,
    price: 29.99,
    features: ['Advanced features', 'Priority support']
  },
  business: {
    name: 'Business', 
    priceId: process.env.STRIPE_PRICE_BUSINESS_MONTHLY,
    price: 99.99,
    features: ['All Pro features', 'Team collaboration', 'Advanced analytics']
  },
  enterprise: {
    name: 'Enterprise',
    priceId: process.env.STRIPE_PRICE_ENTERPRISE_MONTHLY,
    price: 299.99,
    features: ['All Business features', 'Custom integrations', 'Dedicated support']
  }
};

// Create Checkout Session for subscription with 14-day trial
router.post('/create-checkout-session', protect, async (req, res) => {
  try {
    const { plan, successUrl, cancelUrl } = req.body;
    
    if (!plan || !SUBSCRIPTION_TIERS[plan]) {
      return res.status(400).json({ success: false, message: 'Invalid subscription plan' });
    }

    const tierConfig = SUBSCRIPTION_TIERS[plan];
    
    if (plan === 'free') {
      // Handle free tier - just update user subscription
      req.user.subscription = {
        ...req.user.subscription,
        plan: 'free',
        status: 'active',
        currentPeriodStart: new Date(),
        currentPeriodEnd: null,
        updatedAt: new Date()
      };
      await req.user.save();
      
      return res.json({ 
        success: true, 
        message: 'Free plan activated',
        redirectUrl: successUrl || `${process.env.FRONTEND_URL}/subscriptions?status=success`
      });
    }

    // Ensure Stripe customer exists for user
    let customerId = req.user.subscription?.stripeCustomerId;
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: req.user.email,
        name: `${req.user.firstName || ''} ${req.user.lastName || ''}`.trim() || undefined,
        metadata: { userId: String(req.user._id) }
      });
      customerId = customer.id;
      
      req.user.subscription = req.user.subscription || {};
      req.user.subscription.stripeCustomerId = customerId;
      await req.user.save();
    }

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      customer: customerId,
      line_items: [{ price: tierConfig.priceId, quantity: 1 }],
      allow_promotion_codes: true,
      subscription_data: {
        trial_period_days: 14,
        payment_settings: {
          save_default_payment_method: 'on_subscription'
        },
        metadata: {
          userId: String(req.user._id),
          plan: plan
        }
      },
      payment_method_types: ['card'],
      payment_method_options: {
        card: {
          setup_future_usage: 'off_session'
        }
      },
      success_url: successUrl || `${process.env.FRONTEND_URL}/subscriptions?status=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: cancelUrl || `${process.env.FRONTEND_URL}/subscriptions?status=cancel`,
      billing_address_collection: 'auto',
      customer_update: {
        address: 'auto',
        name: 'auto'
      }
    });

    res.json({ success: true, url: session.url, sessionId: session.id });
  } catch (error) {
    console.error('Create checkout session error:', error);
    res.status(500).json({ success: false, message: 'Failed to create checkout session' });
  }
});

// Get subscription tiers and pricing
router.get('/tiers', async (req, res) => {
  try {
    const tiers = Object.entries(SUBSCRIPTION_TIERS).map(([key, config]) => ({
      id: key,
      name: config.name,
      price: config.price,
      features: config.features,
      priceId: config.priceId
    }));
    
    res.json({ success: true, tiers });
  } catch (error) {
    console.error('Get tiers error:', error);
    res.status(500).json({ success: false, message: 'Failed to get subscription tiers' });
  }
});

// Get user's active subscriptions
router.get('/subscriptions', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Check if user has an active subscription
    if (!user.subscription || !user.subscription.stripeSubscriptionId || user.subscription.status !== 'active') {
      return res.json({ success: true, subscriptions: [] });
    }

    // Fetch subscription details from Stripe
    const stripeSubscription = await stripe.subscriptions.retrieve(user.subscription.stripeSubscriptionId);
    
    // Get the subscription tier info
    const tierInfo = SUBSCRIPTION_TIERS[user.subscription.plan] || {
      name: 'Unknown Plan',
      price: 0,
      features: []
    };

    const subscription = {
      id: stripeSubscription.id,
      plan: user.subscription.plan,
      name: tierInfo.name,
      price: tierInfo.price,
      status: stripeSubscription.status,
      currentPeriodStart: new Date(stripeSubscription.current_period_start * 1000),
      currentPeriodEnd: new Date(stripeSubscription.current_period_end * 1000),
      nextBilling: new Date(stripeSubscription.current_period_end * 1000),
      features: tierInfo.features,
      billingCycle: stripeSubscription.items.data[0]?.price?.recurring?.interval || 'month',
      cancelAtPeriodEnd: stripeSubscription.cancel_at_period_end,
      // Mock usage data - replace with real usage tracking later
      usage: {
        leadsGenerated: Math.floor(Math.random() * 1000),
        emailsSent: Math.floor(Math.random() * 5000),
        campaignsActive: Math.floor(Math.random() * 10)
      }
    };

    res.json({ success: true, subscriptions: [subscription] });
  } catch (error) {
    console.error('Get subscriptions error:', error);
    res.status(500).json({ success: false, message: 'Failed to get subscriptions' });
  }
});

// Stripe webhook handler
router.post('/webhook', express.raw({type: 'application/json'}), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  try {
    switch (event.type) {
      case 'customer.subscription.created':
      case 'customer.subscription.updated':
        await handleSubscriptionUpdate(event.data.object);
        break;
      case 'customer.subscription.deleted':
        await handleSubscriptionCanceled(event.data.object);
        break;
      case 'invoice.payment_succeeded':
        await handlePaymentSucceeded(event.data.object);
        break;
      case 'invoice.payment_failed':
        await handlePaymentFailed(event.data.object);
        break;
    }

    res.json({received: true});
  } catch (error) {
    console.error('Webhook handler error:', error);
    res.status(500).json({error: 'Webhook handler failed'});
  }
});

// Helper functions for webhook handling
async function handleSubscriptionUpdate(subscription) {
  const user = await User.findOne({
    'subscription.stripeCustomerId': subscription.customer
  });
  
  if (user) {
    const plan = subscription.metadata?.plan || 'pro';
    
    user.subscription = {
      ...user.subscription,
      plan: plan,
      status: subscription.status,
      stripeSubscriptionId: subscription.id,
      stripePriceId: subscription.items.data[0]?.price?.id,
      currentPeriodStart: new Date(subscription.current_period_start * 1000),
      currentPeriodEnd: new Date(subscription.current_period_end * 1000),
      trialStart: subscription.trial_start ? new Date(subscription.trial_start * 1000) : null,
      trialEnd: subscription.trial_end ? new Date(subscription.trial_end * 1000) : null,
      cancelAtPeriodEnd: subscription.cancel_at_period_end,
      updatedAt: new Date()
    };
    
    await user.save();
  }
}

async function handleSubscriptionCanceled(subscription) {
  const user = await User.findOne({
    'subscription.stripeSubscriptionId': subscription.id
  });
  
  if (user) {
    user.subscription.status = 'canceled';
    user.subscription.plan = 'free';
    user.subscription.updatedAt = new Date();
    await user.save();
  }
}

async function handlePaymentSucceeded(invoice) {
  // Handle successful payment - could send confirmation email
  console.log('Payment succeeded for invoice:', invoice.id);
}

async function handlePaymentFailed(invoice) {
  // Handle failed payment - could send notification email
  console.log('Payment failed for invoice:', invoice.id);
}

module.exports = router;


