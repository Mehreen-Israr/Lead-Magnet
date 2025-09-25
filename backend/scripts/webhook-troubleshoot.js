const axios = require('axios');
require('dotenv').config();

async function troubleshootWebhook() {
  console.log('🔍 Calendly Webhook Troubleshooting\n');
  
  // Check environment variables
  console.log('1. Checking Environment Variables:');
  const requiredVars = ['CALENDLY_API_TOKEN', 'CALENDLY_WEBHOOK_SECRET', 'WEBHOOK_URL'];
  const missingVars = requiredVars.filter(v => !process.env[v]);
  
  if (missingVars.length > 0) {
    console.log(`❌ Missing environment variables: ${missingVars.join(', ')}`);
    console.log('Please set these in your .env file:');
    missingVars.forEach(v => console.log(`   ${v}=your_value_here`));
    return;
  } else {
    console.log('✅ All required environment variables are set');
  }
  
  // Test webhook URL accessibility
  console.log('\n2. Testing Webhook URL Accessibility:');
  try {
    const webhookUrl = process.env.WEBHOOK_URL;
    console.log(`Testing: ${webhookUrl}`);
    
    const response = await axios.get(webhookUrl, { timeout: 10000 });
    console.log(`✅ Webhook URL is accessible (Status: ${response.status})`);
  } catch (error) {
    console.log(`❌ Webhook URL is not accessible: ${error.message}`);
    console.log('\nPossible solutions:');
    console.log('- Make sure your server is running');
    console.log('- Check if the URL is correct');
    console.log('- Ensure the server is accessible from the internet');
    console.log('- If using localhost, use ngrok or similar tunneling service');
  }
  
  // List existing webhooks
  console.log('\n3. Checking Existing Webhooks:');
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
      console.log(`✅ Found ${response.data.collection.length} existing webhook(s):`);
      response.data.collection.forEach((webhook, index) => {
        console.log(`\nWebhook ${index + 1}:`);
        console.log(`- URL: ${webhook.url}`);
        console.log(`- Events: ${webhook.events.join(', ')}`);
        console.log(`- State: ${webhook.state}`);
        console.log(`- Created: ${webhook.created_at}`);
        
        if (webhook.state !== 'active') {
          console.log(`⚠️  Warning: This webhook is not active!`);
        }
      });
    } else {
      console.log('❌ No webhooks found. You need to create one.');
    }
  } catch (error) {
    console.log(`❌ Error checking webhooks: ${error.response?.data || error.message}`);
  }
  
  // Test webhook endpoint
  console.log('\n4. Testing Webhook Endpoint:');
  try {
    const testPayload = {
      event: 'invitee.created',
      payload: {
        event: {
          uuid: 'test-event-uuid',
          uri: 'https://api.calendly.com/scheduled_events/test',
          name: 'Test Meeting',
          start_time: new Date().toISOString(),
          event_type: { duration: 30 },
          location: { join_url: 'https://meet.google.com/test' }
        },
        invitee: {
          name: 'Test User',
          email: 'test@example.com',
          timezone: 'America/New_York',
          reschedule_url: 'https://calendly.com/reschedule/test',
          cancel_url: 'https://calendly.com/cancel/test',
          questions_and_answers: []
        }
      }
    };
    
    const response = await axios.post(
      process.env.WEBHOOK_URL,
      testPayload,
      {
        headers: {
          'Content-Type': 'application/json',
          'calendly-webhook-signature': 'test-signature',
          'calendly-webhook-timestamp': Date.now().toString()
        },
        timeout: 10000
      }
    );
    
    console.log(`✅ Webhook endpoint responded successfully (Status: ${response.status})`);
  } catch (error) {
    console.log(`❌ Webhook endpoint test failed: ${error.message}`);
    console.log('\nPossible issues:');
    console.log('- Server is not running');
    console.log('- Webhook endpoint is not accessible');
    console.log('- CORS issues');
    console.log('- Authentication issues');
  }
  
  console.log('\n📋 Next Steps:');
  console.log('1. If webhook URL is not accessible, set up a public URL (ngrok, deploy to cloud, etc.)');
  console.log('2. If no webhooks exist, run: node scripts/setup-webhook.js');
  console.log('3. If webhooks exist but are inactive, check Calendly dashboard');
  console.log('4. Test with a real Calendly booking to verify end-to-end flow');
}

troubleshootWebhook();
