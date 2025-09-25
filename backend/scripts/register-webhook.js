const axios = require('axios');
require('dotenv').config();

async function registerWebhook() {
  console.log('🚀 Registering Clean Calendly Webhook\n');
  
  // Your webhook URL
  const webhookUrl = 'https://leadmagnet-backend.onrender.com/webhook/calendly';
  
  try {
    // Delete existing webhooks first
    console.log('🗑️  Cleaning up existing webhooks...');
    const listResponse = await axios.get(
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
    
    if (listResponse.data.collection && listResponse.data.collection.length > 0) {
      for (const webhook of listResponse.data.collection) {
        try {
          await axios.delete(webhook.uri, {
            headers: {
              'Authorization': `Bearer ${process.env.CALENDLY_API_TOKEN}`
            }
          });
          console.log(`✅ Deleted: ${webhook.callback_url}`);
        } catch (error) {
          console.log(`⚠️  Could not delete: ${error.message}`);
        }
      }
    }
    
    // Register new webhook
    console.log('\n🔗 Registering new webhook...');
    console.log(`URL: ${webhookUrl}`);
    
    const webhookData = {
      url: webhookUrl,
      events: ['invitee.created', 'invitee.canceled'],
      organization: 'https://api.calendly.com/organizations/206138fd-d4b4-447e-8980-2ae3861efcb3',
      scope: 'organization'
    };
    
    const response = await axios.post(
      'https://api.calendly.com/webhook_subscriptions',
      webhookData,
      {
        headers: {
          'Authorization': `Bearer ${process.env.CALENDLY_API_TOKEN}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    console.log('✅ Webhook registered successfully!');
    console.log('Webhook details:');
    console.log(`- URL: ${response.data.resource.callback_url}`);
    console.log(`- State: ${response.data.resource.state}`);
    console.log(`- Events: ${response.data.resource.events.join(', ')}`);
    
    console.log('\n🎯 Test your webhook:');
    console.log('1. Go to: https://calendly.com/leadmagnet-notifications/30min');
    console.log('2. Book a meeting with a different email');
    console.log('3. Check your database for the new booking');
    
  } catch (error) {
    console.error('❌ Error registering webhook:', error.response?.data || error.message);
  }
}

registerWebhook();
