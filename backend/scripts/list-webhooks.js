const axios = require('axios');
require('dotenv').config();

async function listWebhooks() {
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
    
    console.log('Existing webhooks:', JSON.stringify(response.data, null, 2));
    
    if (response.data.collection && response.data.collection.length > 0) {
      console.log('\n=== WEBHOOK DETAILS ===');
      response.data.collection.forEach((webhook, index) => {
        console.log(`\nWebhook ${index + 1}:`);
        console.log(`- URI: ${webhook.uri}`);
        console.log(`- URL: ${webhook.url}`);
        console.log(`- Events: ${webhook.events.join(', ')}`);
        console.log(`- State: ${webhook.state}`);
        console.log(`- Created: ${webhook.created_at}`);
      });
    } else {
      console.log('\nNo webhooks found.');
    }
  } catch (error) {
    console.error('Error listing webhooks:', error.response?.data || error.message);
  }
}

listWebhooks();