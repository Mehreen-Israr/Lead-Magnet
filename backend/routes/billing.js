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
    const { plan, priceId, successUrl, cancelUrl } = req.body;
    
    console.log('🔍 Billing request:', { plan, priceId, successUrl, cancelUrl });
    
    let tierConfig;
    
    // Handle direct priceId (new approach)
    if (priceId) {
      tierConfig = { priceId };
    } 
    // Handle plan-based approach (legacy)
    else if (plan && SUBSCRIPTION_TIERS[plan]) {
      tierConfig = SUBSCRIPTION_TIERS[plan];
    } else {
      return res.status(400).json({ success: false, message: 'Invalid subscription plan or priceId' });
    }
    
    // Skip free plan check for priceId approach
    if (plan === 'free' && !priceId) {
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
    
    // Check if existing customer ID is valid
    if (customerId) {
      try {
        await stripe.customers.retrieve(customerId);
        console.log('✅ Existing customer ID is valid:', customerId);
      } catch (error) {
        console.log('⚠️  Existing customer ID is invalid, creating new one');
        customerId = null;
      }
    }
    
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
      console.log('✅ Created new customer:', customerId);
    }

    const priceToUse = priceId || tierConfig.priceId;
    console.log('💰 Using price ID:', priceToUse);
    
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      customer: customerId,
      line_items: [{ price: priceToUse, quantity: 1 }],
      allow_promotion_codes: true,
      subscription_data: {
        trial_period_days: 14,
        metadata: {
          userId: String(req.user._id),
          plan: plan,
          userEmail: req.user.email,
          source: 'leadmagnet_website'
        }
      },
      payment_method_types: ['card'],
      success_url: successUrl || `${process.env.FRONTEND_URL}/subscriptions?status=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: cancelUrl || `${process.env.FRONTEND_URL}/subscriptions?status=cancel`,
      billing_address_collection: 'required',
      customer_update: {
        address: 'auto',
        name: 'auto'
      },
      // Professional customization
      custom_fields: [
        {
          key: 'company',
          label: {
            type: 'custom',
            custom: 'Company Name (Optional)'
          },
          type: 'text',
          optional: true
        }
      ],
      // Enhanced metadata for better tracking
      metadata: {
        userId: String(req.user._id),
        userEmail: req.user.email,
        plan: plan,
        source: 'leadmagnet_website',
        timestamp: new Date().toISOString()
      },
      // Professional appearance
      locale: 'auto',
      automatic_tax: {
        enabled: true
      }
    });

    res.json({ success: true, url: session.url, sessionId: session.id });
  } catch (error) {
    console.error('❌ Create checkout session error:', error);
    console.error('Error details:', {
      message: error.message,
      type: error.type,
      code: error.code,
      priceId: req.body.priceId || 'unknown',
      plan: req.body.plan || 'unknown'
    });
    
    let errorMessage = 'Failed to create checkout session';
    if (error.type === 'StripeInvalidRequestError') {
      errorMessage = 'Invalid price ID or Stripe configuration error';
    } else if (error.type === 'StripeAuthenticationError') {
      errorMessage = 'Stripe authentication failed';
    }
    
    res.status(500).json({ success: false, message: errorMessage });
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
      packageName: user.subscription.packageName || tierInfo.name, // Use stored package name
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

// Cancel subscription endpoint
router.post('/cancel-subscription', protect, async (req, res) => {
  try {
    const { subscriptionId } = req.body;
    
    if (!subscriptionId) {
      return res.status(400).json({ 
        success: false, 
        message: 'Subscription ID is required' 
      });
    }

    console.log('🚫 Cancelling subscription:', subscriptionId);

    // Cancel the subscription in Stripe
    const subscription = await stripe.subscriptions.update(subscriptionId, {
      cancel_at_period_end: true
    });

    console.log('✅ Subscription cancelled in Stripe:', subscription.id);

    // Update user subscription in database
    const user = await User.findOne({
      'subscription.stripeSubscriptionId': subscriptionId
    });

    if (user) {
      user.subscription = {
        ...user.subscription,
        status: 'canceled',
        cancelAtPeriodEnd: true,
        updatedAt: new Date()
      };
      
      await user.save();
      console.log('✅ User subscription updated in database:', user.email);
    }

    res.json({ 
      success: true, 
      message: 'Subscription cancelled successfully',
      subscription: {
        id: subscription.id,
        status: subscription.status,
        cancelAtPeriodEnd: subscription.cancel_at_period_end,
        currentPeriodEnd: new Date(subscription.current_period_end * 1000)
      }
    });

  } catch (error) {
    console.error('❌ Cancel subscription error:', error);
    
    let errorMessage = 'Failed to cancel subscription';
    if (error.type === 'StripeInvalidRequestError') {
      errorMessage = 'Invalid subscription ID';
    } else if (error.type === 'StripeAuthenticationError') {
      errorMessage = 'Stripe authentication failed';
    }
    
    res.status(500).json({ 
      success: false, 
      message: errorMessage 
    });
  }
});

// Stripe webhook handler with raw body parsing
const webhookHandler = async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  console.log('🔔 Stripe webhook received');
  console.log('Headers:', req.headers);
  console.log('Body length:', req.body?.length);

  if (!process.env.STRIPE_WEBHOOK_SECRET) {
    console.error('❌ STRIPE_WEBHOOK_SECRET not configured');
    return res.status(500).send('Webhook secret not configured');
  }

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
    console.log('✅ Webhook signature verified, event type:', event.type);
  } catch (err) {
    console.error('❌ Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed':
        const session = event.data.object;
        console.log('✅ Checkout session completed:', session.id);
        
        // Update user subscription status using new schema
        if (session.customer_email) {
          try {
            const user = await User.findOne({ email: session.customer_email });
            if (user) {
              user.subscription = user.subscription || {};
              user.subscription.status = 'active';
              user.subscription.stripeCustomerId = session.customer;
              user.subscription.stripeSubscriptionId = session.subscription;
              user.subscription.updatedAt = new Date();
              await user.save();
              console.log('✅ User subscription updated:', user.email);
              
              // Also fetch and update the full subscription details
              if (session.subscription) {
                try {
                  const stripeSubscription = await stripe.subscriptions.retrieve(session.subscription);
                  await handleSubscriptionUpdate(stripeSubscription);
                  console.log('✅ Full subscription details updated for:', user.email);
                } catch (error) {
                  console.error('❌ Error fetching full subscription details:', error);
                }
              }
            }
          } catch (error) {
            console.error('❌ Error updating user subscription:', error);
          }
        }
        break;
        
      case 'customer.subscription.created':
      case 'customer.subscription.updated':
        await handleSubscriptionUpdate(event.data.object);
        break;
      case 'customer.subscription.deleted':
        await handleSubscriptionCanceled(event.data.object);
        break;
      case 'customer.subscription.canceled':
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
};

// Helper functions for webhook handling
async function handleSubscriptionUpdate(subscription) {
  const user = await User.findOne({
    'subscription.stripeCustomerId': subscription.customer
  });
  
  if (user) {
    const plan = subscription.metadata?.plan || 'pro';
    const stripePriceId = subscription.items.data[0]?.price?.id;
    
    // Get package name from database using Stripe Price ID
    let packageName = plan; // fallback to plan name
    if (stripePriceId) {
      try {
        const Package = require('../models/Package');
        const packageData = await Package.findOne({ stripePriceId: stripePriceId });
        if (packageData) {
          packageName = packageData.name;
        }
      } catch (error) {
        console.error('Error fetching package name:', error);
      }
    }
    
    user.subscription = {
      ...user.subscription,
      plan: plan,
      packageName: packageName, // Store the actual package name
      status: subscription.status,
      stripeSubscriptionId: subscription.id,
      stripePriceId: stripePriceId,
      currentPeriodStart: new Date(subscription.current_period_start * 1000),
      currentPeriodEnd: new Date(subscription.current_period_end * 1000),
      trialStart: subscription.trial_start ? new Date(subscription.trial_start * 1000) : null,
      trialEnd: subscription.trial_end ? new Date(subscription.trial_end * 1000) : null,
      cancelAtPeriodEnd: subscription.cancel_at_period_end,
      updatedAt: new Date()
    };
    
    await user.save();
    console.log(`✅ Updated user subscription: ${packageName} (${plan})`);
  }
}

async function handleSubscriptionCanceled(subscription) {
  const user = await User.findOne({
    'subscription.stripeSubscriptionId': subscription.id
  });
  
  if (user) {
    user.subscription = {
      ...user.subscription,
      status: 'canceled',
      cancelAtPeriodEnd: subscription.cancel_at_period_end,
      canceledAt: new Date(subscription.canceled_at * 1000),
      updatedAt: new Date()
    };
    
    await user.save();
    console.log(`✅ Subscription cancelled for user: ${user.email}`);
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

// Change billing cycle endpoint
router.post('/change-billing-cycle', protect, async (req, res) => {
  try {
    const { subscriptionId, newBillingCycle } = req.body;
    
    if (!subscriptionId || !newBillingCycle) {
      return res.status(400).json({ 
        success: false, 
        message: 'Subscription ID and new billing cycle are required' 
      });
    }

    console.log('🔄 Changing billing cycle:', { subscriptionId, newBillingCycle });

    // Find the user with this subscription
    const user = await User.findOne({
      'subscription.stripeSubscriptionId': subscriptionId
    });

    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'Subscription not found' 
      });
    }

    // Get the current subscription from Stripe
    const currentSubscription = await stripe.subscriptions.retrieve(subscriptionId);
    
    // Map billing cycles to Stripe price IDs
    const billingCycleMap = {
      'monthly': process.env.STRIPE_PRICE_X_MONTHLY || 'price_x_monthly',
      'quarterly': process.env.STRIPE_PRICE_X_QUARTERLY || 'price_x_quarterly', 
      'yearly': process.env.STRIPE_PRICE_X_YEARLY || 'price_x_yearly'
    };

    const newPriceId = billingCycleMap[newBillingCycle];
    
    if (!newPriceId) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid billing cycle' 
      });
    }

    // Update the subscription in Stripe
    const updatedSubscription = await stripe.subscriptions.update(subscriptionId, {
      items: [{
        id: currentSubscription.items.data[0].id,
        price: newPriceId,
      }],
      proration_behavior: 'create_prorations'
    });

    console.log('✅ Billing cycle updated in Stripe:', updatedSubscription.id);

    // Update user subscription in database
    user.subscription = {
      ...user.subscription,
      stripePriceId: newPriceId,
      billingCycle: newBillingCycle,
      updatedAt: new Date()
    };
    
    await user.save();
    console.log('✅ User subscription updated in database:', user.email);

    res.json({ 
      success: true, 
      message: 'Billing cycle updated successfully',
      subscription: {
        id: updatedSubscription.id,
        status: updatedSubscription.status,
        currentPeriodEnd: new Date(updatedSubscription.current_period_end * 1000),
        billingCycle: newBillingCycle
      }
    });

  } catch (error) {
    console.error('❌ Change billing cycle error:', error);
    
    let errorMessage = 'Failed to update billing cycle';
    if (error.type === 'StripeInvalidRequestError') {
      errorMessage = 'Invalid subscription or billing cycle';
    } else if (error.type === 'StripeAuthenticationError') {
      errorMessage = 'Stripe authentication failed';
    }
    
    res.status(500).json({ 
      success: false, 
      message: errorMessage 
    });
  }
});

module.exports = { router, webhookHandler };


