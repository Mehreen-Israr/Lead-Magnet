const axios = require('axios');
require('dotenv').config();

async function updateWebhookUrlOnly() {
  console.log('🔄 Updating Calendly Webhook URL to AWS Lambda\n');
  
  // New AWS Lambda webhook URL
  const newWebhookUrl = 'https://2uepc2kf3f.execute-api.eu-west-2.amazonaws.com/prod/api/webhook/calendly';
  
  console.log('🔗 New webhook URL:', newWebhookUrl);
  console.log('📝 This will replace your old Render webhook with the new AWS Lambda webhook\n');
  
  try {
    // List existing webhooks
    console.log('📋 Checking existing webhooks...');
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
      console.log(`Found ${listResponse.data.collection.length} existing webhooks:`);
      for (const webhook of listResponse.data.collection) {
        console.log(`- URL: ${webhook.callback_url}`);
        console.log(`- Events: ${webhook.events.join(', ')}`);
        console.log(`- State: ${webhook.state}`);
        console.log('---');
      }
    } else {
      console.log('No existing webhooks found');
    }
    
    // Delete old webhooks
    console.log('\n🗑️  Deleting old webhooks...');
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
    
    // Create new webhook with AWS URL
    console.log('\n🔗 Creating new webhook with AWS Lambda URL...');
    const webhookData = {
      url: newWebhookUrl,
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
    
    console.log('\n✅ Webhook updated successfully!');
    console.log('New webhook details:');
    console.log(`- URI: ${response.data.uri}`);
    console.log(`- URL: ${response.data.url}`);
    console.log(`- Events: ${response.data.events.join(', ')}`);
    console.log(`- State: ${response.data.state}`);
    console.log(`- Created: ${response.data.created_at}`);
    
    console.log('\n🎉 Your Calendly webhook is now pointing to AWS Lambda!');
    console.log('\n📋 Next steps:');
    console.log('1. Test by creating a booking in Calendly');
    console.log('2. Check CloudWatch logs for webhook activity');
    console.log('3. Verify the booking is stored in your database');
    
  } catch (error) {
    console.log(`❌ Error updating webhook: ${error.response?.data || error.message}`);
    
    if (error.response?.data) {
      console.log('Full error details:', JSON.stringify(error.response.data, null, 2));
    }
    
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
updateWebhookUrlOnly();
