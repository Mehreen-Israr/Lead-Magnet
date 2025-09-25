const axios = require('axios');
require('dotenv').config();

async function debugWebhookIssue() {
  console.log('🔍 Debugging Webhook Issue\n');
  
  // Check environment variables
  console.log('1. Environment Variables:');
  console.log(`CALENDLY_API_TOKEN: ${process.env.CALENDLY_API_TOKEN ? 'Set' : 'Not set'}`);
  console.log(`CALENDLY_WEBHOOK_SECRET: ${process.env.CALENDLY_WEBHOOK_SECRET ? 'Set' : 'Not set'}`);
  console.log(`WEBHOOK_URL: ${process.env.WEBHOOK_URL}`);
  
  if (!process.env.CALENDLY_API_TOKEN) {
    console.log('\n❌ CALENDLY_API_TOKEN is not set!');
    console.log('Please get a new token from Calendly settings.');
    return;
  }
  
  // Test API token
  console.log('\n2. Testing Calendly API Token...');
  try {
    const response = await axios.get('https://api.calendly.com/users/me', {
      headers: {
        'Authorization': `Bearer ${process.env.CALENDLY_API_TOKEN}`,
        'Content-Type': 'application/json'
      }
    });
    console.log('✅ API token is valid');
    console.log('User:', response.data.resource.name);
    console.log('Email:', response.data.resource.email);
  } catch (error) {
    console.log('❌ API token is invalid or expired');
    console.log('Error:', error.response?.data || error.message);
    console.log('\n🔧 To fix this:');
    console.log('1. Go to https://calendly.com/integrations/api_webhooks');
    console.log('2. Create a new API token');
    console.log('3. Update CALENDLY_API_TOKEN in your .env file');
    return;
  }
  
  // Check webhook status
  console.log('\n3. Checking Webhook Status...');
  try {
    const response = await axios.get(
      'https://api.calendly.com/webhook_subscriptions',
      {
        headers: {
          'Authorization': `Bearer ${process.env.CALENDLY_API_TOKEN}`,
          'Content-Type': 'application/json'
        },
        params: {
          organization: 'https://api.calendly.com/organizations/206138fd-d4b4-447e-8980-2ae3861efcb3',
          scope: 'organization'
        }
      }
    );
    
    if (response.data.collection && response.data.collection.length > 0) {
      console.log('✅ Webhook is registered:');
      const webhook = response.data.collection[0];
      console.log(`- URL: ${webhook.callback_url}`);
      console.log(`- State: ${webhook.state}`);
      console.log(`- Events: ${webhook.events.join(', ')}`);
      console.log(`- Created: ${webhook.created_at}`);
      
      if (webhook.state === 'active') {
        console.log('\n✅ Webhook is ACTIVE');
      } else {
        console.log(`\n⚠️  Webhook state is: ${webhook.state}`);
      }
    } else {
      console.log('❌ No webhooks found');
      console.log('The webhook was not properly registered');
    }
  } catch (error) {
    console.log('❌ Error checking webhook:', error.response?.data || error.message);
  }
  
  // Test webhook endpoint
  console.log('\n4. Testing Webhook Endpoint...');
  try {
    const response = await axios.get('https://leadmagnet-backend.onrender.com/health', {
      timeout: 10000
    });
    console.log('✅ Backend is accessible:', response.data.status);
  } catch (error) {
    console.log('❌ Backend is not accessible:', error.message);
  }
  
  // Test webhook endpoint with POST
  console.log('\n5. Testing Webhook Endpoint with POST...');
  try {
    const response = await axios.post('https://leadmagnet-backend.onrender.com/api/calendly/webhook', {
      event: 'test',
      payload: { test: 'data' }
    }, {
      headers: {
        'Content-Type': 'application/json'
      },
      timeout: 10000
    });
    console.log('✅ Webhook endpoint responds:', response.data);
  } catch (error) {
    console.log('❌ Webhook endpoint error:', error.response?.data || error.message);
  }
  
  console.log('\n📋 Possible Issues:');
  console.log('1. API token is invalid/expired');
  console.log('2. Webhook is not properly registered');
  console.log('3. Webhook endpoint is not accessible');
  console.log('4. Calendly is not sending webhooks');
  console.log('5. Webhook signature verification is failing');
  
  console.log('\n🔧 Solutions:');
  console.log('1. Get a new Calendly API token');
  console.log('2. Re-register the webhook');
  console.log('3. Check webhook endpoint accessibility');
  console.log('4. Test with a real Calendly booking');
}

debugWebhookIssue();
