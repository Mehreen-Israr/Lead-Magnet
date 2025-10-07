require('dotenv').config();
const express = require('express');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY || '');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

const app = express();

// Security middleware
app.use(helmet());

// Rate limiting - configured for Lambda/API Gateway
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  trustProxy: 1, // Trust the first proxy (API Gateway)
  keyGenerator: (req, res) => {
    // Use the IP from X-Forwarded-For header, which API Gateway provides
    return req.headers['x-forwarded-for'] || req.ip || 'unknown';
  },
  skip: (req, res) => {
    // Skip rate limiting if we can't determine IP
    return !req.headers['x-forwarded-for'] && !req.ip;
  }
});
app.use(limiter);

// CORS middleware
app.use(cors({
  origin: [
    "https://lead-magnet-frontend.onrender.com",
    "https://lead-magnet-oc4d.vercel.app",
    "http://localhost:3000",
    "https://lead-magnet.onrender.com",
    "https://*.onrender.com",
    "https://*.vercel.app",
    "https://main.d1yrlzw4i6kxpc.amplifyapp.com"
  ],
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  credentials: true,
  optionsSuccessStatus: 200
}));

// Stripe webhook route — must be before body parsers
const { webhookHandler } = require('./routes/billing');
app.use('/api/billing/webhook', express.raw({ type: 'application/json' }), webhookHandler);

// JSON and URL-encoded parsers
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// MongoDB connection (single, clean connection)
if (!process.env.MONGODB_URI) {
  console.error('❌ MONGODB_URI not defined.');
  process.exit(1);
}

mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('✅ MongoDB connected successfully'))
  .catch(err => console.error('❌ MongoDB connection error:', err));

// Routes
app.get('/', (req, res) => {
  res.json({ message: 'Lead Magnet API is running!' });
});

app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development'
  });
});

app.use('/api/auth', require('./routes/auth'));
app.use('/api/contact', require('./routes/contact'));
app.use('/api/calendly', require('./routes/calendly'));
app.use('/api/billing', require('./routes/billing').router);
app.use('/api/packages', require('./routes/packages'));
app.use('/webhook', require('./routes/webhook'));

// 404 handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Route not found', path: req.path });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('❌ Global error handler:', err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error'
  });
});

module.exports = app; // ✅ Export app for Lambda
