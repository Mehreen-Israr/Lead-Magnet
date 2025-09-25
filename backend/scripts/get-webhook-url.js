const axios = require('axios');
require('dotenv').config();

async function getWebhookUrl() {
  console.log('🔗 Getting Webhook URL Options\n');
  
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
        console.log('\n🔄 Alternative: Deploy to cloud service (Heroku, Railway, Render)');
      } else {
        console.log('✅ ngrok is available');
        console.log('\n🚀 To get your webhook URL:');
        console.log('1. Start your backend: npm start');
        console.log('2. In another terminal: ngrok http 10000');
        console.log('3. Copy the https URL (e.g., https://abc123.ngrok.io)');
        console.log('4. Your webhook URL will be: https://abc123.ngrok.io/api/calendly/webhook');
      }
    });
  } catch (error) {
    console.log('❌ Error checking ngrok:', error.message);
  }
  
  // Check if server is running
  console.log('\n2. Checking if server is running...');
  try {
    const response = await axios.get('http://localhost:10000/health', { timeout: 5000 });
    console.log('✅ Backend server is running');
    console.log('📍 Server URL: http://localhost:10000');
  } catch (error) {
    console.log('❌ Backend server is not running');
    console.log('\n🚀 To start your server:');
    console.log('cd backend && npm start');
  }
  
  // Show current webhook URL if set
  console.log('\n3. Current webhook configuration:');
  if (process.env.WEBHOOK_URL) {
    console.log(`✅ WEBHOOK_URL is set: ${process.env.WEBHOOK_URL}`);
    
    // Test if it's accessible
    try {
      const response = await axios.get(process.env.WEBHOOK_URL, { timeout: 10000 });
      console.log(`✅ Webhook URL is accessible (Status: ${response.status})`);
    } catch (error) {
      console.log(`❌ Webhook URL is not accessible: ${error.message}`);
      console.log('\n🔧 Possible solutions:');
      console.log('1. Use ngrok: ngrok http 10000');
      console.log('2. Deploy to cloud service');
      console.log('3. Check if URL is correct');
    }
  } else {
    console.log('❌ WEBHOOK_URL is not set in .env file');
    console.log('\n📝 Add this to your .env file:');
    console.log('WEBHOOK_URL=https://your-domain.com/api/calendly/webhook');
  }
  
  console.log('\n📋 Next Steps:');
  console.log('1. Get a public URL (ngrok or cloud deployment)');
  console.log('2. Set WEBHOOK_URL in your .env file');
  console.log('3. Run: node scripts/setup-webhook-proper.js');
  console.log('4. Test with: node scripts/test-booking-flow.js');
}

getWebhookUrl();
