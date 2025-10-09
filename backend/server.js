require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY || '');

const app = express();

/* -------------------------- Stripe Webhook Routes (MUST BE FIRST) -------------------------- */
const { webhookHandler } = require('./routes/billing');
app.use('/billing/webhook', express.raw({ type: 'application/json' }), webhookHandler);
app.use('/api/webhook/stripe', express.raw({ type: 'application/json' }), webhookHandler);

/* ------------------------------- Security -------------------------------- */
app.use(helmet());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  trustProxy: 1,
  keyGenerator: (req) => req.headers['x-forwarded-for'] || req.ip || 'unknown',
  skip: (req) => !req.headers['x-forwarded-for'] && !req.ip,
});
app.use(limiter);

/* ------------------------------- CORS ------------------------------------ */
// More permissive CORS for production
app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    const allowedOrigins = [
      "https://app.magnetleads.ai", // ✅ Custom domain
      "https://lead-magnet-frontend.onrender.com",
      "https://lead-magnet-oc4d.vercel.app",
      "http://localhost:3000",
      "https://lead-magnet.onrender.com",
      "https://main.d1yrlzw4i6kxpc.amplifyapp.com"
    ];
    
    // Check if origin is in allowed list or matches wildcard patterns
    if (allowedOrigins.includes(origin) || 
        origin.includes('.onrender.com') ||
        origin.includes('.vercel.app') ||
        origin.includes('.amplifyapp.com')) {
      return callback(null, true);
    }
    
    return callback(new Error('Not allowed by CORS'));
  },
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  credentials: true,
  optionsSuccessStatus: 200,
  allowedHeaders: ["Content-Type", "Authorization", "Accept", "Origin", "X-Requested-With"],
  exposedHeaders: ["Content-Length", "X-Foo", "X-Bar"]
}));


/* ------------------------------ Body Parsers ------------------------------ */
// Enhanced JSON parsing for Lambda
app.use(express.json({ 
  limit: '10mb',
  type: 'application/json'
}));
app.use(express.urlencoded({ 
  extended: true,
  limit: '10mb'
}));

// Additional middleware for Lambda compatibility
app.use((req, res, next) => {
  console.log('Request received:', req.method, req.url);
  console.log('Request body:', req.body);
  console.log('Request headers:', req.headers);
  next();
});

// Database connection check middleware
app.use((req, res, next) => {
  // Skip database check for webhook endpoints (they handle their own errors)
  if (req.path.includes('/webhook')) {
    return next();
  }
  
  // Check if MongoDB is connected
  if (mongoose.connection.readyState !== 1) {
    console.log('⚠️ Database not connected, attempting to reconnect...');
    connectDB().then(() => {
      next();
    }).catch((err) => {
      console.error('❌ Failed to reconnect to database:', err);
      res.status(503).json({
        success: false,
        message: 'Database connection failed',
        error: 'Service temporarily unavailable'
      });
    });
  } else {
    next();
  }
});

/* ---------------------------- Mongo Connection ---------------------------- */
if (!process.env.MONGODB_URI) {
  console.error('❌ MONGODB_URI not defined.');
  process.exit(1);
}

// Enhanced MongoDB connection for Lambda
const connectDB = async () => {
  try {
    const options = {
      maxPoolSize: 10, // Maintain up to 10 socket connections
      serverSelectionTimeoutMS: 5000, // Keep trying to send operations for 5 seconds
      socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
      connectTimeoutMS: 10000, // Give up initial connection after 10 seconds
      heartbeatFrequencyMS: 10000, // Send a ping every 10 seconds
      retryWrites: true,
      retryReads: true
    };

    await mongoose.connect(process.env.MONGODB_URI, options);
    console.log('✅ MongoDB connected successfully');
    
    // Handle connection events
    mongoose.connection.on('error', (err) => {
      console.error('❌ MongoDB connection error:', err);
    });
    
    mongoose.connection.on('disconnected', () => {
      console.log('⚠️ MongoDB disconnected');
    });
    
    mongoose.connection.on('reconnected', () => {
      console.log('✅ MongoDB reconnected');
    });
    
  } catch (err) {
    console.error('❌ MongoDB connection error:', err);
    // Don't exit process in Lambda, just log the error
  }
};

// Connect to MongoDB
connectDB();

/* ------------------------------ Health Routes ----------------------------- */
app.get('/', (req, res) => {
  res.json({ message: 'Lead Magnet API root is live.' });
});

app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
    database: mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected'
  });
});

/* ------------------------------ API ROUTES -------------------------------- */
// Mount API routes at /api prefix for consistency
app.use('/api/auth', require('./routes/auth'));
app.use('/api/contact', require('./routes/contact'));
app.use('/api/calendly', require('./routes/calendly'));
app.use('/api/billing', require('./routes/billing').router);
app.use('/api/packages', require('./routes/packages'));
app.use('/api/webhook', require('./routes/webhook'));

// Also mount at root for backward compatibility
app.use('/auth', require('./routes/auth'));
app.use('/contact', require('./routes/contact'));
app.use('/calendly', require('./routes/calendly'));
app.use('/billing', require('./routes/billing').router);
app.use('/packages', require('./routes/packages'));
app.use('/webhook', require('./routes/webhook'));

/* ------------------------------ 404 Handler ------------------------------- */
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
    path: req.path
  });
});

/* -------------------------- Global Error Handler -------------------------- */
app.use((err, req, res, next) => {
  console.error('❌ Global error handler:', err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error'
  });
});

module.exports = app; // ✅ export app, not handler
