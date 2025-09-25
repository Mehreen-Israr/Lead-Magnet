const axios = require('axios');
require('dotenv').config();

async function setupLocalWebhook() {
  console.log('🔧 Setting up Local Development Webhook\n');
  
  // Check if ngrok is available
  console.log('1. Checking for ngrok...');
  try {
    const { exec } = require('child_process');
    exec('ngrok version', (error, stdout, stderr) => {
      if (error) {
        console.log('❌ ngrok not found');
        console.log('\n📥 To install ngrok:');
        console.log('1. Go to https://ngrok.com/download');
        console.log('2. Download and install ngrok');
        console.log('3. Or install via npm: npm install -g ngrok');
        console.log('\n🔄 Alternative: Use production webhook instead');
      } else {
        console.log('✅ ngrok is available');
        console.log('\n🚀 To setup local webhook:');
        console.log('1. Start your backend: npm start');
        console.log('2. In another terminal: ngrok http 5000');
        console.log('3. Copy the https URL (e.g., https://abc123.ngrok.io)');
        console.log('4. Update WEBHOOK_URL in .env to: https://abc123.ngrok.io/api/calendly/webhook');
        console.log('5. Run: node scripts/setup-webhook-proper.js');
      }
    });
  } catch (error) {
    console.log('❌ Error checking ngrok:', error.message);
  }
  
  console.log('\n2. Current webhook configuration:');
  console.log(`WEBHOOK_URL: ${process.env.WEBHOOK_URL}`);
  
  if (process.env.WEBHOOK_URL && process.env.WEBHOOK_URL.includes('localhost')) {
    console.log('⚠️  Warning: Using localhost URL. This won\'t work for Calendly webhooks!');
    console.log('   Calendly needs a publicly accessible URL.');
  } else if (process.env.WEBHOOK_URL && process.env.WEBHOOK_URL.includes('ngrok')) {
    console.log('✅ Using ngrok URL - this should work for local development');
  } else if (process.env.WEBHOOK_URL && process.env.WEBHOOK_URL.includes('onrender.com')) {
    console.log('✅ Using production URL - this will work for production bookings');
  }
  
  console.log('\n3. Testing local backend...');
  try {
    const response = await axios.get('http://localhost:5000/health', { timeout: 5000 });
    console.log('✅ Local backend is running:', response.data.status);
  } catch (error) {
    console.log('❌ Local backend is not running');
    console.log('   Start it with: npm start');
  }
  
  console.log('\n📋 Solutions:');
  console.log('1. **Use Production Webhook (Easiest):**');
  console.log('   - Book from your production frontend URL');
  console.log('   - Webhook will go to production backend');
  console.log('   - Bookings will be saved to production database');
  
  console.log('\n2. **Setup Local Webhook (For Development):**');
  console.log('   - Install ngrok: https://ngrok.com/download');
  console.log('   - Start backend: npm start');
  console.log('   - Expose with ngrok: ngrok http 5000');
  console.log('   - Update WEBHOOK_URL to ngrok URL');
  console.log('   - Register webhook with Calendly');
  
  console.log('\n3. **Check Production Database:**');
  console.log('   - Your booking might be in the production database');
  console.log('   - Check: https://cloud.mongodb.com/');
}

setupLocalWebhook();
