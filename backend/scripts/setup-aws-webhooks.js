const axios = require('axios');
require('dotenv').config();

async function setupAWSWebhooks() {
  console.log('🚀 Setting up Webhooks for AWS Lambda Backend\n');
  
  // AWS Lambda backend URLs
  const awsCalendlyWebhookUrl = 'https://2uepc2kf3f.execute-api.eu-west-2.amazonaws.com/prod/api/webhook/calendly';
  const awsStripeWebhookUrl = 'https://2uepc2kf3f.execute-api.eu-west-2.amazonaws.com/prod/api/webhook/stripe';
  
  console.log('🔗 Calendly webhook URL:', awsCalendlyWebhookUrl);
  console.log('🔗 Stripe webhook URL:', awsStripeWebhookUrl);
  
  // Test AWS endpoints first
  console.log('\n🔍 Testing AWS webhook endpoints...');
  
  try {
    const calendlyTest = await axios.get(awsCalendlyWebhookUrl, { timeout: 5000 });
    console.log(`✅ Calendly webhook endpoint accessible (Status: ${calendlyTest.status})`);
  } catch (error) {
    console.log(`⚠️  Calendly webhook endpoint test failed: ${error.message}`);
  }
  
  try {
    const stripeTest = await axios.get(awsStripeWebhookUrl, { timeout: 5000 });
    console.log(`✅ Stripe webhook endpoint accessible (Status: ${stripeTest.status})`);
  } catch (error) {
    console.log(`⚠️  Stripe webhook endpoint test failed: ${error.message}`);
  }
  
  // Setup Calendly webhook
  console.log('\n📅 Setting up Calendly webhook...');
  await setupCalendlyWebhook(awsCalendlyWebhookUrl);
  
  // Setup Stripe webhook
  console.log('\n💳 Setting up Stripe webhook...');
  await setupStripeWebhook(awsStripeWebhookUrl);
  
  console.log('\n🎉 AWS webhook setup complete!');
  console.log('\n📋 Next steps:');
  console.log('1. Test Calendly by creating a booking');
  console.log('2. Test Stripe by creating a subscription');
  console.log('3. Check your database for new records');
  console.log('4. Monitor CloudWatch logs for webhook activity');
}

async function setupCalendlyWebhook(webhookUrl) {
  try {
    // Delete existing Calendly webhooks
    console.log('🗑️  Cleaning up existing Calendly webhooks...');
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
    } catch (error) {
      console.log(`⚠️  Error listing Calendly webhooks: ${error.message}`);
    }
    
    // Create new Calendly webhook
    console.log('🔗 Creating new Calendly webhook...');
    const webhookData = {
      url: webhookUrl,
      events: [
        'invitee.created',
        'invitee.canceled',
        'invitee_no_show.created'
      ],
      organization: 'https://api.calendly.com/organizations/206138fd-d4b4-447e-8980-2ae3861efcb3',
      scope: 'organization',
      signing_key: process.env.CALENDLY_WEBHOOK_SECRET
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
    
    console.log('✅ Calendly webhook created successfully!');
    console.log(`- URI: ${response.data.uri}`);
    console.log(`- URL: ${response.data.url}`);
    console.log(`- Events: ${response.data.events.join(', ')}`);
    console.log(`- State: ${response.data.state}`);
    
  } catch (error) {
    console.log(`❌ Error setting up Calendly webhook: ${error.response?.data || error.message}`);
    if (error.response?.data) {
      console.log('Full error details:', JSON.stringify(error.response.data, null, 2));
    }
  }
}

async function setupStripeWebhook(webhookUrl) {
  try {
    // List existing Stripe webhooks
    console.log('📋 Listing existing Stripe webhooks...');
    try {
      const listResponse = await axios.get(
        'https://api.stripe.com/v1/webhook_endpoints',
        {
          headers: {
            'Authorization': `Bearer ${process.env.STRIPE_SECRET_KEY}`,
            'Content-Type': 'application/x-www-form-urlencoded'
          }
        }
      );
      
      if (listResponse.data.data && listResponse.data.data.length > 0) {
        console.log(`Found ${listResponse.data.data.length} existing Stripe webhooks`);
        for (const webhook of listResponse.data.data) {
          console.log(`- ID: ${webhook.id}, URL: ${webhook.url}, Status: ${webhook.status}`);
        }
      }
    } catch (error) {
      console.log(`⚠️  Error listing Stripe webhooks: ${error.message}`);
    }
    
    // Create new Stripe webhook
    console.log('🔗 Creating new Stripe webhook...');
    const webhookData = new URLSearchParams();
    webhookData.append('url', webhookUrl);
    webhookData.append('enabled_events[]', 'checkout.session.completed');
    webhookData.append('enabled_events[]', 'customer.subscription.created');
    webhookData.append('enabled_events[]', 'customer.subscription.updated');
    webhookData.append('enabled_events[]', 'customer.subscription.deleted');
    webhookData.append('enabled_events[]', 'invoice.payment_succeeded');
    webhookData.append('enabled_events[]', 'invoice.payment_failed');
    
    const response = await axios.post(
      'https://api.stripe.com/v1/webhook_endpoints',
      webhookData.toString(),
      {
        headers: {
          'Authorization': `Bearer ${process.env.STRIPE_SECRET_KEY}`,
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      }
    );
    
    console.log('✅ Stripe webhook created successfully!');
    console.log(`- ID: ${response.data.id}`);
    console.log(`- URL: ${response.data.url}`);
    console.log(`- Events: ${response.data.enabled_events.join(', ')}`);
    console.log(`- Status: ${response.data.status}`);
    console.log(`- Secret: ${response.data.secret}`);
    
    console.log('\n🔑 IMPORTANT: Update your .env file with the new webhook secret:');
    console.log(`STRIPE_WEBHOOK_SECRET=${response.data.secret}`);
    
  } catch (error) {
    console.log(`❌ Error setting up Stripe webhook: ${error.response?.data || error.message}`);
    if (error.response?.data) {
      console.log('Full error details:', JSON.stringify(error.response.data, null, 2));
    }
  }
}

// Run the function
setupAWSWebhooks();
