const axios = require('axios');

async function testWebhookEndpoint() {
  try {
    const testPayload = {
      event: 'invitee.created',
      payload: {
        event: {
          uuid: 'test-event-uuid',
          uri: 'https://api.calendly.com/scheduled_events/test',
          name: 'Demo Meeting',
          start_time: new Date().toISOString(),
          event_type: {
            duration: 30
          },
          location: {
            join_url: 'https://meet.google.com/abc-defg-hij'
          }
        },
        invitee: {
          name: 'Test User',
          email: 'test@example.com',
          timezone: 'America/New_York',
          reschedule_url: 'https://calendly.com/reschedule/test',
          cancel_url: 'https://calendly.com/cancel/test',
          questions_and_answers: []
        }
      }
    };
    
    const response = await axios.post(
      'https://cf82ccda6315.ngrok-free.app/api/calendly/webhook',
      testPayload,
      {
        headers: {
          'Content-Type': 'application/json',
          'calendly-webhook-signature': 'test-signature',
          'calendly-webhook-timestamp': Date.now().toString()
        }
      }
    );
    
    console.log('✅ Webhook endpoint is accessible:', response.status);
    console.log('Response:', response.data);
  } catch (error) {
    console.error('❌ Webhook endpoint test failed:', error.response?.data || error.message);
    if (error.code === 'ECONNREFUSED') {
      console.log('\n🔍 Possible issues:');
      console.log('1. Backend server is not running');
      console.log('2. ngrok is not running or URL has changed');
      console.log('3. Firewall blocking the connection');
    }
  }
}

testWebhookEndpoint();