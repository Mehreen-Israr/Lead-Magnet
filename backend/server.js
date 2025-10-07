require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY || '');

const app = express();

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
app.use(cors({
  origin: [
    "https://lead-magnet-frontend.onrender.com",
    "https://lead-magnet-oc4d.vercel.app",
    "http://localhost:3000",
    "https://lead-magnet.onrender.com",
    "https://*.onrender.com",
    "https://*.vercel.app",
    "https://main.d1yrlzw4i6kxpc.amplifyapp.com",
    "https://*.amplifyapp.com"
  ],
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  credentials: true,
  optionsSuccessStatus: 200
}));

/* -------------------------- Stripe Webhook Route -------------------------- */
const { webhookHandler } = require('./routes/billing');
app.use('/billing/webhook', express.raw({ type: 'application/json' }), webhookHandler);

/* ------------------------------ Body Parsers ------------------------------ */
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

/* ---------------------------- Mongo Connection ---------------------------- */
if (!process.env.MONGODB_URI) {
  console.error('❌ MONGODB_URI not defined.');
  process.exit(1);
}

mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('✅ MongoDB connected successfully'))
  .catch(err => console.error('❌ MongoDB connection error:', err));

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
