const axios = require('axios');
require('dotenv').config();

async function updateWebhooksToAWS() {
  console.log('🚀 Updating Webhooks to AWS Lambda Backend\n');
  
  // AWS Lambda backend URL
  const awsWebhookUrl = 'https://2uepc2kf3f.execute-api.eu-west-2.amazonaws.com/prod/api/webhook';
  
  console.log('🔗 New webhook URL:', awsWebhookUrl);
  
  try {
    // Test AWS webhook endpoint first
    console.log('\n🔍 Testing AWS webhook endpoint...');
    try {
      const testResponse = await axios.get(awsWebhookUrl, { timeout: 10000 });
      console.log(`✅ AWS webhook endpoint is accessible (Status: ${testResponse.status})`);
    } catch (error) {
      console.log(`⚠️  AWS webhook endpoint test failed: ${error.message}`);
      console.log('This is normal - the endpoint might not respond to GET requests');
    }
    
    // Delete existing webhooks first
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
        console.log(`Found ${listResponse.data.collection.length} existing webhooks`);
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
      } else {
        console.log('No existing webhooks found');
      }
    } catch (error) {
      console.log(`⚠️  Error listing webhooks: ${error.message}`);
    }
    
    // Register new webhook with AWS URL
    console.log('\n🔗 Registering new webhook with AWS...');
    const webhookData = {
      url: awsWebhookUrl,
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
    
    console.log('\n✅ Webhook registered successfully with AWS!');
    console.log('Webhook details:');
    console.log(`- URI: ${response.data.uri}`);
    console.log(`- URL: ${response.data.url}`);
    console.log(`- Events: ${response.data.events.join(', ')}`);
    console.log(`- State: ${response.data.state}`);
    console.log(`- Created: ${response.data.created_at}`);
    
    console.log('\n🎉 AWS webhook setup complete!');
    console.log('\n📋 Next steps:');
    console.log('1. Test by creating a booking in Calendly');
    console.log('2. Check your database for the new booking');
    console.log('3. Verify the webhook is working with AWS Lambda');
    console.log('4. Run: node scripts/test-booking-flow.js');
    
  } catch (error) {
    console.log(`❌ Error setting up AWS webhook: ${error.response?.data || error.message}`);
    
    if (error.response?.status === 401) {
      console.log('\n🔑 Authentication Error:');
      console.log('- Check your CALENDLY_API_TOKEN in .env file');
      console.log('- Make sure the token is valid and not expired');
    } else if (error.response?.status === 400) {
      console.log('\n⚠️  Bad Request Error:');
      console.log('- Check the webhook URL format');
      console.log('- Verify the organization URI is correct');
    }
  }
}

// Run the function
updateWebhooksToAWS();
