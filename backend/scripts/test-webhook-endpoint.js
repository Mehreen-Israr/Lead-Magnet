require('dotenv').config();
const express = require('express');
const app = express();

// Test webhook endpoint
app.use('/api/billing/webhook', express.raw({type: 'application/json'}), (req, res) => {
  console.log('🔔 Webhook received!');
  console.log('Headers:', req.headers);
  console.log('Body length:', req.body?.length);
  console.log('Body type:', typeof req.body);
  
  res.json({received: true, timestamp: new Date().toISOString()});
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Webhook test server running on port ${PORT}`);
  console.log(`📡 Webhook endpoint: http://localhost:${PORT}/api/billing/webhook`);
  console.log('🔧 Configure this URL in your Stripe dashboard webhooks');
});