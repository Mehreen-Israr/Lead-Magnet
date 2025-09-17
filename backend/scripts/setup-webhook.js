const axios = require('axios');
require('dotenv').config();

async function setupWebhook() {
  try {
    const response = await axios.post(
      'https://api.calendly.com/webhook_subscriptions',
      {
        url: 'https://cf82ccda6315.ngrok-free.app/api/calendly/webhook',
        events: [
          'invitee.created',
          'invitee.canceled',
          'invitee_no_show.created'
        ],
        organization: 'https://api.calendly.com/organizations/206138fd-d4b4-447e-8980-2ae3861efcb3',
        scope: 'organization',
        signing_key: process.env.CALENDLY_WEBHOOK_SECRET
      },
      {
        headers: {
          'Authorization': `Bearer ${process.env.CALENDLY_API_TOKEN}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    console.log('Webhook created successfully:', response.data);
  } catch (error) {
    console.error('Error creating webhook:', error.response?.data || error.message);
  }
}

setupWebhook();