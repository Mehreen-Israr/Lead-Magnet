const axios = require('axios');
require('dotenv').config();

async function testProductionWebhook() {
  console.log('🧪 Testing Production Webhook\n');
  
  const webhookUrl = 'https://leadmagnet-backend.onrender.com/api/calendly/webhook';
  
  try {
    console.log('1. Testing webhook endpoint accessibility...');
    
    // Test with a simple POST request
    const response = await axios.post(webhookUrl, {
      event: 'test',
      payload: { test: 'data' }
    }, {
      headers: {
        'Content-Type': 'application/json',
        'calendly-webhook-signature': 'test-signature',
        'calendly-webhook-timestamp': Date.now().toString()
      },
      timeout: 15000 // 15 second timeout
    });
    
    console.log('✅ Webhook endpoint is accessible');
    console.log('Response:', response.data);
    
  } catch (error) {
    if (error.response) {
      console.log('✅ Webhook endpoint is accessible (got response)');
      console.log('Status:', error.response.status);
      console.log('Response:', error.response.data);
      
      if (error.response.data.message === 'Invalid webhook signature') {
        console.log('✅ This is expected - webhook is working but needs proper Calendly signature');
      }
    } else if (error.code === 'ECONNREFUSED') {
      console.log('❌ Connection refused - backend might be down');
    } else if (error.code === 'ETIMEDOUT') {
      console.log('❌ Request timed out - backend might be slow to respond');
    } else {
      console.log('❌ Error:', error.message);
    }
  }
  
  console.log('\n2. Testing health endpoint...');
  try {
    const healthResponse = await axios.get('https://leadmagnet-backend.onrender.com/health', {
      timeout: 10000
    });
    console.log('✅ Health endpoint working:', healthResponse.data);
  } catch (error) {
    console.log('❌ Health endpoint failed:', error.message);
  }
  
  console.log('\n3. Testing packages endpoint...');
  try {
    const packagesResponse = await axios.get('https://leadmagnet-backend.onrender.com/api/packages', {
      timeout: 10000
    });
    console.log('✅ Packages endpoint working');
    console.log('Packages found:', packagesResponse.data.count);
  } catch (error) {
    console.log('❌ Packages endpoint failed:', error.message);
  }
  
  console.log('\n📋 Next Steps:');
  console.log('1. If webhook endpoint is accessible, run: node scripts/setup-webhook-proper.js');
  console.log('2. If not accessible, check your Render deployment');
  console.log('3. Make sure your latest code is deployed to Render');
}

testProductionWebhook();
