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

    // Handle the event
    switch (event.type) {
      case 'checkout.session.completed':
        const session = event.data.object;
        console.log('✅ Checkout session completed:', session.id);
        
        // Update user subscription status
        if (session.customer_email) {
          try {
            const user = await User.findOne({ email: session.customer_email });
            if (user) {
              user.subscriptionStatus = 'active';
              user.stripeCustomerId = session.customer;
              user.subscriptionId = session.subscription;
              await user.save();
              console.log('✅ User subscription updated:', user.email);
            }
          } catch (error) {
            console.error('❌ Error updating user subscription:', error);
          }
        }
        break;
        
      case 'customer.subscription.updated':
        const subscription = event.data.object;
        console.log('📝 Subscription updated:', subscription.id);
        
        try {
          const user = await User.findOne({ subscriptionId: subscription.id });
          if (user) {
            user.subscriptionStatus = subscription.status;
            await user.save();
            console.log('✅ User subscription status updated:', user.email, subscription.status);
          }
        } catch (error) {
          console.error('❌ Error updating subscription status:', error);
        }
        break;
        
      case 'customer.subscription.deleted':
        const deletedSubscription = event.data.object;
        console.log('🗑️ Subscription deleted:', deletedSubscription.id);
        
        try {
          const user = await User.findOne({ subscriptionId: deletedSubscription.id });
          if (user) {
            user.subscriptionStatus = 'cancelled';
            await user.save();
            console.log('✅ User subscription cancelled:', user.email);
          }
        } catch (error) {
          console.error('❌ Error cancelling subscription:', error);
        }
        break;
        
      default:
        console.log(`Unhandled event type ${event.type}`);
    }

    res.json({ received: true });
  } catch (error) {
    console.error('❌ Webhook error:', error);
    res.status(500).json({ error: 'Webhook handler failed' });
  }
});

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Database connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/leadmagnet')
  .then(() => console.log('✅ Connected to MongoDB'))
  .catch(err => console.error('❌ MongoDB connection error:', err));
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

app.get('/', (req, res) => {
  res.json({ message: 'Lead Magnet API is running!' });
});

app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Test endpoint for packages
app.get('/test-packages', async (req, res) => {
  try {
    const Package = require('./models/Package');
    const packages = await Package.find({ isActive: true });
    res.json({
      success: true,
      count: packages.length,
      packages: packages.map(p => ({ name: p.name, platform: p.platform, price: p.price }))
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/contact', require('./routes/contact'));
app.use('/api/calendly', require('./routes/calendly'));
app.use('/api/billing', require('./routes/billing'));
app.use('/api/packages', require('./routes/packages'));
app.use('/webhook', require('./routes/webhook'));

// 404 handler
app.use((req, res) => {
  res.status(404).json({ 
    success: false, 
    message: 'Route not found',
    path: req.path
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('❌ Global error handler:', err);
  
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
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received');
  mongoose.connection.close(() => {
    console.log('MongoDB connection closed.');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT received');
  mongoose.connection.close(() => {
    console.log('MongoDB connection closed.');
    process.exit(0);
  });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔗 Health check: http://localhost:${PORT}/health`);
});
