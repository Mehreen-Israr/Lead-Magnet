const axios = require('axios');
require('dotenv').config();

async function deleteAllWebhooks() {
  console.log('🗑️  Deleting All Existing Webhooks\n');
  
  try {
    // Get all webhooks
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
      console.log(`Found ${response.data.collection.length} webhook(s) to delete:`);
      
      for (const webhook of response.data.collection) {
        try {
          console.log(`Deleting: ${webhook.callback_url}`);
          await axios.delete(webhook.uri, {
            headers: {
              'Authorization': `Bearer ${process.env.CALENDLY_API_TOKEN}`
            }
          });
          console.log(`✅ Deleted: ${webhook.callback_url}`);
        } catch (error) {
          console.log(`❌ Failed to delete: ${error.message}`);
        }
      }
      
      console.log('\n✅ All webhooks deleted successfully!');
    } else {
      console.log('✅ No webhooks found to delete');
    }
    
  } catch (error) {
    console.log('❌ Error deleting webhooks:', error.response?.data || error.message);
  }
}

deleteAllWebhooks();
