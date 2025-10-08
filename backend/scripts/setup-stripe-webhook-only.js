const axios = require('axios');
require('dotenv').config();

async function setupStripeWebhookOnly() {
  console.log('💳 Setting up Stripe Webhook for AWS Lambda Backend\n');
  
  // AWS Lambda backend URL
  const awsStripeWebhookUrl = 'https://2uepc2kf3f.execute-api.eu-west-2.amazonaws.com/prod/api/webhook/stripe';
  
  console.log('🔗 Stripe webhook URL:', awsStripeWebhookUrl);
  
  try {
    // Test AWS webhook endpoint first
    console.log('\n🔍 Testing AWS Stripe webhook endpoint...');
    try {
      const testResponse = await axios.get(awsStripeWebhookUrl, { timeout: 10000 });
      console.log(`✅ AWS Stripe webhook endpoint is accessible (Status: ${testResponse.status})`);
    } catch (error) {
      console.log(`⚠️  AWS Stripe webhook endpoint test failed: ${error.message}`);
      console.log('This is normal - the endpoint might not respond to GET requests');
    }
    
    // List existing Stripe webhooks
    console.log('\n📋 Listing existing Stripe webhooks...');
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
      } else {
        console.log('No existing Stripe webhooks found');
      }
    } catch (error) {
      console.log(`⚠️  Error listing Stripe webhooks: ${error.message}`);
    }
    
    // Create new Stripe webhook with correct format
    console.log('\n🔗 Creating new Stripe webhook...');
    const webhookData = new URLSearchParams();
    webhookData.append('url', awsStripeWebhookUrl);
    webhookData.append('enabled_events[]', 'checkout.session.completed');
    webhookData.append('enabled_events[]', 'customer.subscription.created');
    webhookData.append('enabled_events[]', 'customer.subscription.updated');
    webhookData.append('enabled_events[]', 'customer.subscription.deleted');
    webhookData.append('enabled_events[]', 'invoice.payment_succeeded');
    webhookData.append('enabled_events[]', 'invoice.payment_failed');
    
    console.log('Stripe webhook configuration:');
    console.log(`- URL: ${awsStripeWebhookUrl}`);
    console.log('- Events: checkout.session.completed, customer.subscription.*, invoice.payment_*');
    
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
    
    console.log('\n✅ Stripe webhook created successfully!');
    console.log('Webhook details:');
    console.log(`- ID: ${response.data.id}`);
    console.log(`- URL: ${response.data.url}`);
    console.log(`- Events: ${response.data.enabled_events.join(', ')}`);
    console.log(`- Status: ${response.data.status}`);
    console.log(`- Secret: ${response.data.secret}`);
    
    console.log('\n🔑 IMPORTANT: Update your .env file with the new webhook secret:');
    console.log(`STRIPE_WEBHOOK_SECRET=${response.data.secret}`);
    
    console.log('\n🎉 Stripe webhook setup complete!');
    console.log('\n📋 Next steps:');
    console.log('1. Update your .env file with the webhook secret above');
    console.log('2. Upload the latest backend-deployment.zip to Lambda');
    console.log('3. Test by creating a subscription in your app');
    console.log('4. Check CloudWatch logs for webhook activity');
    
  } catch (error) {
    console.log(`❌ Error setting up Stripe webhook: ${error.response?.data || error.message}`);
    
    if (error.response?.data) {
      console.log('Full error details:', JSON.stringify(error.response.data, null, 2));
    }
    
    if (error.response?.status === 401) {
      console.log('\n🔑 Authentication Error:');
      console.log('- Check your STRIPE_SECRET_KEY in .env file');
      console.log('- Make sure the key is valid and not expired');
    } else if (error.response?.status === 400) {
      console.log('\n⚠️  Bad Request Error:');
      console.log('- Check the webhook URL format');
      console.log('- Verify the events are valid');
    }
  }
}

// Run the function
setupStripeWebhookOnly();
