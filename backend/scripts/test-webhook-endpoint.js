const axios = require('axios');

async function testWebhookEndpoint() {
  console.log('🧪 Testing Webhook Endpoint\n');
  
  const webhookUrl = 'https://leadmagnet-backend.onrender.com/webhook/calendly';
  
  // Test payload (simulating Calendly webhook)
  const testPayload = {
    event: 'invitee.created',
    payload: {
      event: {
        uuid: 'test-event-' + Date.now(),
        uri: 'https://api.calendly.com/scheduled_events/test',
        name: 'Test Meeting',
        start_time: new Date().toISOString(),
        event_type: {
          duration: 30
        },
        location: {
          join_url: 'https://meet.google.com/test'
        }
      },
      invitee: {
        name: 'Test User',
        email: 'test@example.com',
        timezone: 'America/New_York',
        reschedule_url: 'https://calendly.com/reschedule',
        cancel_url: 'https://calendly.com/cancel',
        questions_and_answers: [
          { question: 'Company', answer: 'Test Company' },
          { question: 'Phone', answer: '+1234567890' }
        ]
      }
    }
  };
  
  try {
    console.log('📡 Sending test webhook...');
    console.log('URL:', webhookUrl);
    console.log('Payload:', JSON.stringify(testPayload, null, 2));
    
    const response = await axios.post(webhookUrl, testPayload, {
      headers: {
        'Content-Type': 'application/json'
      },
      timeout: 10000
    });
    
    console.log('\n✅ Webhook test successful!');
    console.log('Response:', response.data);
    
  } catch (error) {
    console.log('\n❌ Webhook test failed:');
    console.log('Status:', error.response?.status);
    console.log('Response:', error.response?.data);
    console.log('Error:', error.message);
  }
}

testWebhookEndpoint();
