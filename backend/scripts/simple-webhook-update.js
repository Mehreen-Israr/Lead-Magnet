const axios = require('axios');
require('dotenv').config();

async function simpleWebhookUpdate() {
  console.log('🔄 Simple Webhook URL Update\n');
  
  // New AWS Lambda webhook URL
  const newWebhookUrl = 'https://2uepc2kf3f.execute-api.eu-west-2.amazonaws.com/prod/api/webhook/calendly';
  
  console.log('🔗 New webhook URL:', newWebhookUrl);
  console.log('📝 This will update your existing webhook to point to AWS Lambda\n');
  
  try {
    // Check if we can access the new webhook endpoint
    console.log('🔍 Testing new webhook endpoint...');
    try {
      const testResponse = await axios.get(newWebhookUrl, { timeout: 5000 });
      console.log(`✅ New webhook endpoint is accessible (Status: ${testResponse.status})`);
    } catch (error) {
      console.log(`⚠️  New webhook endpoint test failed: ${error.message}`);
      console.log('This is normal - the endpoint might not respond to GET requests');
    }
    
    // List existing webhooks
    console.log('\n📋 Checking existing webhooks...');
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
      console.log('\n💡 This might be why your webhooks stopped working!');
      console.log('You may need to recreate the webhook with the new URL.');
    }
    
    console.log('\n🎯 Next steps:');
    console.log('1. If you see existing webhooks, they need to be updated to the new URL');
    console.log('2. If no webhooks are found, you need to create a new one');
    console.log('3. The webhook should point to:', newWebhookUrl);
    console.log('4. Events should include: invitee.created, invitee.canceled, invitee_no_show.created');
    
  } catch (error) {
    console.log(`❌ Error checking webhooks: ${error.response?.data || error.message}`);
    
    if (error.response?.status === 401) {
      console.log('\n🔑 Authentication Error:');
      console.log('- Check your CALENDLY_API_TOKEN in .env file');
      console.log('- Make sure the token is valid and not expired');
    } else if (error.response?.status === 403) {
      console.log('\n🚫 Permission Error:');
      console.log('- Your Calendly account may need to be upgraded');
      console.log('- Check if you have the right permissions for webhooks');
    }
  }
}

// Run the function
simpleWebhookUpdate();
