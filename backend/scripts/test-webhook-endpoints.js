const axios = require('axios');
require('dotenv').config();

async function testWebhookEndpoints() {
  console.log('🧪 Testing Webhook Endpoints\n');
  
  const baseUrl = 'https://2uepc2kf3f.execute-api.eu-west-2.amazonaws.com/prod';
  
  // Test Calendly webhook endpoint
  console.log('📅 Testing Calendly webhook endpoint...');
  try {
    const calendlyResponse = await axios.post(`${baseUrl}/api/webhook/calendly`, {
      event: 'test',
      payload: { test: true }
    }, {
      headers: {
        'Content-Type': 'application/json'
      },
      timeout: 10000
    });
    console.log(`✅ Calendly webhook endpoint working (Status: ${calendlyResponse.status})`);
  } catch (error) {
    console.log(`❌ Calendly webhook endpoint failed: ${error.message}`);
    if (error.response) {
      console.log(`Status: ${error.response.status}`);
      console.log(`Response: ${JSON.stringify(error.response.data, null, 2)}`);
    }
  }
  
  // Test Stripe webhook endpoint
  console.log('\n💳 Testing Stripe webhook endpoint...');
  try {
    const stripeResponse = await axios.post(`${baseUrl}/api/webhook/stripe`, {
      type: 'test',
      data: { test: true }
    }, {
      headers: {
        'Content-Type': 'application/json',
        'stripe-signature': 'test-signature'
      },
      timeout: 10000
    });
    console.log(`✅ Stripe webhook endpoint working (Status: ${stripeResponse.status})`);
  } catch (error) {
    console.log(`❌ Stripe webhook endpoint failed: ${error.message}`);
    if (error.response) {
      console.log(`Status: ${error.response.status}`);
      console.log(`Response: ${JSON.stringify(error.response.data, null, 2)}`);
    }
  }
  
  console.log('\n🎯 Webhook endpoint testing complete!');
  console.log('\n📋 Next steps:');
  console.log('1. Upload the latest backend-deployment.zip to Lambda');
  console.log('2. Run: node scripts/setup-aws-webhooks.js');
  console.log('3. Test with real webhook calls from Calendly/Stripe');
}

// Run the test
testWebhookEndpoints();
