require('dotenv').config();
const express = require('express');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY || '');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

const app = express();
const PORT = process.env.PORT || 10000;

// Security middleware
app.use(helmet());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use(limiter);

// Middleware
app.use(cors({
  origin: [
    "https://lead-magnet-frontend.onrender.com", // your new Render frontend
    "https://lead-magnet-oc4d.vercel.app", // your Vercel frontend (keep for backup)
    "http://localhost:3000" // allow local dev frontend
  ],
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  credentials: true
}));

// Stripe webhook BEFORE body parsers to use raw body
app.post('/api/billing/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  try {
    const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;
    let event = req.body;

    if (endpointSecret) {
      const signature = req.headers['stripe-signature'];
      try {
        event = stripe.webhooks.constructEvent(req.body, signature, endpointSecret);
      } catch (err) {
        console.error('❌ Webhook signature verification failed.', err.message);
        return res.status(400).send(`Webhook Error: ${err.message}`);
      }
    }

    const User = require('./models/User');

    switch (event.type) {
      case 'checkout.session.completed':
        // Handled on subscription events
        break;
      case 'customer.subscription.created':
      case 'customer.subscription.updated': {
        const subscription = event.data.object;
        const customerId = subscription.customer;
        const stripePriceId = subscription.items?.data?.[0]?.price?.id;
        const status = subscription.status;
        const currentPeriodEnd = subscription.current_period_end ? new Date(subscription.current_period_end * 1000) : undefined;
        const trialEnd = subscription.trial_end ? new Date(subscription.trial_end * 1000) : undefined;

        const user = await User.findOne({ 'subscription.stripeCustomerId': customerId });
        if (user) {
          const priceToPlan = {
            [process.env.STRIPE_PRICE_PRO_MONTHLY || '']: 'pro',
            [process.env.STRIPE_PRICE_BUSINESS_MONTHLY || '']: 'business',
            [process.env.STRIPE_PRICE_ENTERPRISE_MONTHLY || '']: 'enterprise'
          };
          const plan = priceToPlan[stripePriceId] || user.subscription.plan || 'free';
          user.subscription.plan = plan;
          user.subscription.status = status;
          user.subscription.stripeSubscriptionId = subscription.id;
          user.subscription.stripePriceId = stripePriceId;
          user.subscription.currentPeriodEnd = currentPeriodEnd;
          user.subscription.trialEnd = trialEnd;
          await user.save();
        }
        break;
      }
      case 'customer.subscription.deleted': {
        const subscription = event.data.object;
        const customerId = subscription.customer;
        const user = await User.findOne({ 'subscription.stripeCustomerId': customerId });
        if (user) {
          user.subscription.status = 'canceled';
          user.subscription.endDate = new Date();
          await user.save();
        }
        break;
      }
      default:
        break;
    }

    res.json({ received: true });
  } catch (error) {
    console.error('🔥 Webhook error:', error);
    res.status(400).send('Webhook handler failed');
  }
});

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// MongoDB Connection - Strict Environment Variable Validation
if (!process.env.MONGODB_URI) {
  console.error('❌ FATAL ERROR: MONGODB_URI environment variable is not defined');
  console.error('Please set MONGODB_URI in your .env file');
  process.exit(1);
}

console.log('🔗 Attempting to connect to MongoDB...');
mongoose.connect(process.env.MONGODB_URI)
.then(() => {
  console.log('✅ MongoDB Connected Successfully');
  console.log(`📍 Connected to: ${process.env.MONGODB_URI.replace(/\/\/.*@/, '//***:***@')}`); // Hide credentials in logs
})
.catch(err => {
  console.error('❌ MongoDB connection error:', err.message);
  console.error('🔧 Please check your MONGODB_URI environment variable');
  process.exit(1);
});

// Routes
app.get('/', (req, res) => {
  res.json({ message: 'LeadMagnet API is running!' });
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// API Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/contact', require('./routes/contact'));
app.use('/api/calendly', require('./routes/calendly'));
app.use('/api/billing', require('./routes/billing'));

// Handle 404 routes (Express 5 compatible)
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('🔥 Error:', err.stack);

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const errors = Object.values(err.errors).map(e => e.message);
    return res.status(400).json({
      success: false,
      message: 'Validation Error',
      errors
    });
  }

  // Mongoose duplicate key error
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    return res.status(400).json({
      success: false,
      message: `${field} already exists`
    });
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      success: false,
      message: 'Invalid token'
    });
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      success: false,
      message: 'Token expired'
    });
  }

  // Default error
  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || 'Internal Server Error'
  });
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received. Shutting down gracefully...');
  mongoose.connection.close().then(() => {
    console.log('MongoDB connection closed.');
    process.exit(0);
  }).catch((err) => {
    console.error('Error closing MongoDB connection:', err);
    process.exit(1);
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT received. Shutting down gracefully...');
  mongoose.connection.close().then(() => {
    console.log('MongoDB connection closed.');
    process.exit(0);
  }).catch((err) => {
    console.error('Error closing MongoDB connection:', err);
    process.exit(1);
  });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔗 API Base URL: https://lead-magnet-bb.onrender.com`);
  console.log(`📋 Available routes:`);
  console.log(`   GET  /              - API status`);
  console.log(`   GET  /health        - Health check`);
  console.log(`   POST /api/auth/*    - Authentication routes`);
  console.log(`   POST /api/contact   - Contact form submission`);
  console.log(`   GET  /api/contact   - Get contacts (Admin)`);
});
