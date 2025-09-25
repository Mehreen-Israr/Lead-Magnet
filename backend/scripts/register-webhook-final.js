require('dotenv').config();
const axios = require('axios');

async function registerWebhook() {
  try {
    console.log('🔗 Registering webhook with Calendly...');
    
    // Get organization UUID first
    console.log('📋 Getting organization UUID...');
    const meResponse = await axios.get('https://api.calendly.com/users/me', {
      headers: {
        'Authorization': `Bearer ${process.env.CALENDLY_API_TOKEN}`,
        'Content-Type': 'application/json'
      }
    });
    
    const orgUri = meResponse.data.resource.current_organization;
    console.log('✅ Organization URI:', orgUri);
    
    // Register webhook
    console.log('🔗 Registering webhook...');
    const webhookResponse = await axios.post('https://api.calendly.com/webhook_subscriptions', {
      url: 'https://leadmagnet-backend.onrender.com/webhook/calendly',
      events: ['invitee.created', 'invitee.canceled'],
      organization: orgUri,
      scope: 'organization'
    }, {
      headers: {
        'Authorization': `Bearer ${process.env.CALENDLY_API_TOKEN}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ Webhook registered successfully!');
    console.log('📋 Webhook ID:', webhookResponse.data.resource.uuid);
    console.log('📋 Webhook URL:', webhookResponse.data.resource.url);
    console.log('📋 Events:', webhookResponse.data.resource.events);
    
  } catch (error) {
    console.error('❌ Error registering webhook:', error.response?.data || error.message);
  }
}

registerWebhook();
