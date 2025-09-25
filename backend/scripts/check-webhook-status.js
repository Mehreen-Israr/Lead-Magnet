const axios = require('axios');
require('dotenv').config();

async function checkWebhookStatus() {
  console.log('🔍 Checking Calendly Webhook Status\n');
  
  try {
    // Check webhook status
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
      console.log('✅ Webhook is registered with Calendly:');
      const webhook = response.data.collection[0];
      console.log(`- URL: ${webhook.callback_url}`);
      console.log(`- State: ${webhook.state}`);
      console.log(`- Events: ${webhook.events.join(', ')}`);
      console.log(`- Created: ${webhook.created_at}`);
      console.log(`- Updated: ${webhook.updated_at}`);
      
      if (webhook.state === 'active') {
        console.log('\n✅ Webhook is ACTIVE and should receive events');
        console.log('\n📋 To test:');
        console.log('1. Go to your Calendly account');
        console.log('2. Create a test booking');
        console.log('3. Check your database for the new booking');
        console.log('4. Check your email for notifications');
      } else {
        console.log(`\n⚠️  Webhook state is: ${webhook.state}`);
        console.log('This might prevent webhooks from being sent');
      }
    } else {
      console.log('❌ No webhooks found');
    }
    
  } catch (error) {
    console.log('❌ Error checking webhook status:', error.response?.data || error.message);
  }
  
  console.log('\n🔍 Testing webhook endpoint accessibility...');
  
  try {
    const testResponse = await axios.get('https://leadmagnet-backend.onrender.com/health', {
      timeout: 5000
    });
    console.log('✅ Backend is accessible:', testResponse.data.status);
  } catch (error) {
    console.log('❌ Backend is not accessible:', error.message);
  }
  
  console.log('\n📋 Next Steps:');
  console.log('1. Make sure your Calendly account has active event types');
  console.log('2. Create a test booking in Calendly');
  console.log('3. Check if webhook is triggered');
  console.log('4. If not, check Calendly webhook logs');
}

checkWebhookStatus();
