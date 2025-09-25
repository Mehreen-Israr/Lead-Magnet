const axios = require('axios');
require('dotenv').config();

async function fixWebhookIssue() {
  console.log('🔧 Fixing Webhook Issue\n');
  
  // Step 1: Check if you have active event types
  console.log('1. Checking Calendly Event Types...');
  try {
    const response = await axios.get('https://api.calendly.com/event_types', {
      headers: {
        'Authorization': `Bearer ${process.env.CALENDLY_API_TOKEN}`,
        'Content-Type': 'application/json'
      },
      params: {
        user: 'https://api.calendly.com/users/eec5f68f-084b-4fb7-935f-f114234bebf2'
      }
    });
    
    if (response.data.collection && response.data.collection.length > 0) {
      console.log(`✅ Found ${response.data.collection.length} event type(s):`);
      response.data.collection.forEach((eventType, index) => {
        console.log(`${index + 1}. ${eventType.name} (${eventType.slug})`);
        console.log(`   - Active: ${eventType.active}`);
        console.log(`   - URL: ${eventType.scheduling_url}`);
      });
    } else {
      console.log('❌ No event types found');
      console.log('You need to create event types in Calendly first!');
    }
  } catch (error) {
    console.log('❌ Error checking event types:', error.response?.data || error.message);
  }
  
  // Step 2: Delete and recreate webhook with correct secret
  console.log('\n2. Recreating Webhook with Correct Secret...');
  try {
    // Delete existing webhooks
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
      console.log('🗑️  Deleting existing webhooks...');
      for (const webhook of listResponse.data.collection) {
        try {
          await axios.delete(webhook.uri, {
            headers: {
              'Authorization': `Bearer ${process.env.CALENDLY_API_TOKEN}`
            }
          });
          console.log(`✅ Deleted webhook: ${webhook.callback_url}`);
        } catch (error) {
          console.log(`⚠️  Could not delete webhook: ${error.message}`);
        }
      }
    }
    
    // Create new webhook
    console.log('\n🚀 Creating new webhook...');
    const webhookData = {
      url: process.env.WEBHOOK_URL,
      events: [
        'invitee.created',
        'invitee.canceled',
        'invitee_no_show.created'
      ],
      organization: 'https://api.calendly.com/organizations/206138fd-d4b4-447e-8980-2ae3861efcb3',
      scope: 'organization',
      signing_key: process.env.CALENDLY_WEBHOOK_SECRET
    };
    
    const createResponse = await axios.post(
      'https://api.calendly.com/webhook_subscriptions',
      webhookData,
      {
        headers: {
          'Authorization': `Bearer ${process.env.CALENDLY_API_TOKEN}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    console.log('✅ New webhook created successfully!');
    console.log('Webhook details:');
    console.log(`- URL: ${createResponse.data.resource.callback_url}`);
    console.log(`- State: ${createResponse.data.resource.state}`);
    console.log(`- Events: ${createResponse.data.resource.events.join(', ')}`);
    
  } catch (error) {
    console.log('❌ Error recreating webhook:', error.response?.data || error.message);
  }
  
  // Step 3: Test webhook endpoint
  console.log('\n3. Testing Webhook Endpoint...');
  try {
    const response = await axios.get('https://leadmagnet-backend.onrender.com/health', {
      timeout: 10000
    });
    console.log('✅ Backend is accessible:', response.data.status);
  } catch (error) {
    console.log('❌ Backend is not accessible:', error.message);
  }
  
  console.log('\n📋 Next Steps:');
  console.log('1. Make sure you have active event types in Calendly');
  console.log('2. Book a meeting using your Calendly link');
  console.log('3. Check if webhook is triggered');
  console.log('4. Check your database for the new booking');
  console.log('5. Check your email for notifications');
  
  console.log('\n🔗 Calendly Links:');
  console.log('- Event Types: https://calendly.com/event_types');
  console.log('- Webhooks: https://calendly.com/integrations/api_webhooks');
  console.log('- Your Calendly Link: Check your Calendly account for your booking link');
}

fixWebhookIssue();
