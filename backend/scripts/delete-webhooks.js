const axios = require('axios');
require('dotenv').config();

async function deleteAllWebhooks() {
  try {
    // First, list all webhooks
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
      console.log(`Found ${listResponse.data.collection.length} webhooks to delete...`);
      
      for (const webhook of listResponse.data.collection) {
        try {
          await axios.delete(webhook.uri, {
            headers: {
              'Authorization': `Bearer ${process.env.CALENDLY_API_TOKEN}`
            }
          });
          console.log(`✅ Deleted webhook: ${webhook.url}`);
        } catch (deleteError) {
          console.error(`❌ Failed to delete webhook ${webhook.url}:`, deleteError.response?.data || deleteError.message);
        }
      }
    } else {
      console.log('No webhooks found to delete.');
    }
  } catch (error) {
    console.error('Error deleting webhooks:', error.response?.data || error.message);
  }
}

deleteAllWebhooks();