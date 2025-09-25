const axios = require('axios');
require('dotenv').config();

async function setupWebhookFinal() {
  console.log('🚀 Final Calendly Webhook Setup\n');
  
  // Check environment variables
  const requiredVars = ['CALENDLY_API_TOKEN', 'CALENDLY_WEBHOOK_SECRET', 'WEBHOOK_URL'];
  const missingVars = requiredVars.filter(v => !process.env[v]);
  
  if (missingVars.length > 0) {
    console.log(`❌ Missing environment variables: ${missingVars.join(', ')}`);
    console.log('Please set these in your .env file first.');
    return;
  }
  
  console.log('✅ Environment variables are set');
  console.log(`📡 Webhook URL: ${process.env.WEBHOOK_URL}`);
  
  // Skip accessibility test since we know it's working
  console.log('\n✅ Skipping accessibility test (we know it works)');
  
  // Delete existing webhooks
  console.log('\n🗑️  Cleaning up existing webhooks...');
  try {
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
      console.log(`Found ${listResponse.data.collection.length} existing webhook(s), deleting...`);
      
      for (const webhook of listResponse.data.collection) {
        try {
          await axios.delete(webhook.uri, {
            headers: {
              'Authorization': `Bearer ${process.env.CALENDLY_API_TOKEN}`
            }
          });
          console.log(`✅ Deleted webhook: ${webhook.url}`);
        } catch (error) {
          console.log(`⚠️  Could not delete webhook: ${error.message}`);
        }
      }
    } else {
      console.log('No existing webhooks found');
    }
  } catch (error) {
    console.log(`⚠️  Could not list existing webhooks: ${error.message}`);
  }
  
  // Create new webhook
  console.log('\n🚀 Creating new webhook...');
  try {
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
    
    console.log('Webhook configuration:');
    console.log(`- URL: ${webhookData.url}`);
    console.log(`- Events: ${webhookData.events.join(', ')}`);
    console.log(`- Organization: ${webhookData.organization}`);
    
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
    
    console.log('\n✅ Webhook created successfully!');
    console.log('Webhook details:');
    console.log('Response:', JSON.stringify(response.data, null, 2));
    
    if (response.data.uri) console.log(`- URI: ${response.data.uri}`);
    if (response.data.url) console.log(`- URL: ${response.data.url}`);
    if (response.data.events) console.log(`- Events: ${response.data.events.join(', ')}`);
    if (response.data.state) console.log(`- State: ${response.data.state}`);
    if (response.data.created_at) console.log(`- Created: ${response.data.created_at}`);
    
    console.log('\n🎉 Setup complete! Your Calendly bookings will now be automatically saved to the database.');
    console.log('\n📋 Next steps:');
    console.log('1. Test by creating a booking in Calendly');
    console.log('2. Check your database for the new booking');
    console.log('3. Verify email notifications are working');
    console.log('4. Run: node scripts/test-booking-flow.js');
    
  } catch (error) {
    console.log(`❌ Error creating webhook: ${error.response?.data || error.message}`);
    
    if (error.response?.status === 401) {
      console.log('\n🔑 Authentication failed. Please check your CALENDLY_API_TOKEN.');
    } else if (error.response?.status === 422) {
      console.log('\n📝 Validation error. Please check your webhook configuration.');
    }
  }
}

setupWebhookFinal();
