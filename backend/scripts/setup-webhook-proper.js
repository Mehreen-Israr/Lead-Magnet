const axios = require('axios');
require('dotenv').config();

async function setupWebhookProper() {
  console.log('🔧 Setting up Calendly Webhook\n');
  
  // Check required environment variables
  const requiredVars = ['CALENDLY_API_TOKEN', 'CALENDLY_WEBHOOK_SECRET', 'WEBHOOK_URL'];
  const missingVars = requiredVars.filter(v => !process.env[v]);
  
  if (missingVars.length > 0) {
    console.log(`❌ Missing required environment variables: ${missingVars.join(', ')}`);
    console.log('\nPlease add these to your .env file:');
    console.log('CALENDLY_API_TOKEN=your_calendly_api_token');
    console.log('CALENDLY_WEBHOOK_SECRET=your_webhook_secret');
    console.log('WEBHOOK_URL=https://your-domain.com/api/calendly/webhook');
    return;
  }
  
  console.log('✅ Environment variables are set');
  console.log(`📡 Webhook URL: ${process.env.WEBHOOK_URL}`);
  
  // First, delete any existing webhooks
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
  
  // Test webhook URL accessibility
  console.log('\n🔍 Testing webhook URL accessibility...');
  try {
    const testResponse = await axios.get(process.env.WEBHOOK_URL, { timeout: 10000 });
    console.log(`✅ Webhook URL is accessible (Status: ${testResponse.status})`);
  } catch (error) {
    console.log(`❌ Webhook URL is not accessible: ${error.message}`);
    console.log('\n⚠️  IMPORTANT: Your webhook URL must be accessible from the internet!');
    console.log('Solutions:');
    console.log('1. Deploy your backend to a cloud service (Heroku, Railway, Render, etc.)');
    console.log('2. Use ngrok for local development: ngrok http 10000');
    console.log('3. Use a tunneling service like ngrok, localtunnel, etc.');
    return;
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
    console.log(`- URI: ${response.data.uri}`);
    console.log(`- URL: ${response.data.url}`);
    console.log(`- Events: ${response.data.events.join(', ')}`);
    console.log(`- State: ${response.data.state}`);
    console.log(`- Created: ${response.data.created_at}`);
    
    console.log('\n🎉 Setup complete! Your Calendly bookings will now be automatically saved to the database.');
    console.log('\n📋 Next steps:');
    console.log('1. Test by creating a booking in Calendly');
    console.log('2. Check your database for the new booking');
    console.log('3. Verify email notifications are working');
    
  } catch (error) {
    console.log(`❌ Error creating webhook: ${error.response?.data || error.message}`);
    
    if (error.response?.status === 401) {
      console.log('\n🔑 Authentication failed. Please check your CALENDLY_API_TOKEN.');
    } else if (error.response?.status === 422) {
      console.log('\n📝 Validation error. Please check your webhook configuration.');
    }
  }
}

setupWebhookProper();
