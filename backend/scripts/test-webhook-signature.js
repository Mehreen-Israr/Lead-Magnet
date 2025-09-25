const axios = require('axios');
const crypto = require('crypto');
require('dotenv').config();

async function testWebhookSignature() {
  console.log('🔐 Testing Webhook Signature\n');
  
  const webhookUrl = 'https://leadmagnet-backend.onrender.com/api/calendly/webhook';
  const webhookSecret = process.env.CALENDLY_WEBHOOK_SECRET;
  
  console.log('Webhook Secret:', webhookSecret ? 'Set' : 'Not set');
  
  const payload = {
    event: 'invitee.created',
    payload: {
      event: {
        uuid: 'test-event-' + Date.now(),
        uri: 'https://api.calendly.com/scheduled_events/test',
        name: 'Demo Meeting',
        start_time: new Date().toISOString(),
        event_type: { duration: 30 },
        location: { join_url: 'https://meet.google.com/test' }
      },
      invitee: {
        name: 'Test User',
        email: 'test3@example.com',
        timezone: 'America/New_York',
        reschedule_url: 'https://calendly.com/reschedule',
        cancel_url: 'https://calendly.com/cancel',
        questions_and_answers: []
      }
    }
  };
  
  const timestamp = Date.now().toString();
  const payloadString = JSON.stringify(payload);
  
  // Create signature exactly like Calendly does
  const signature = crypto
    .createHmac('sha256', webhookSecret)
    .update(timestamp + payloadString)
    .digest('base64');
  
  console.log('Timestamp:', timestamp);
  console.log('Signature:', signature);
  console.log('Payload length:', payloadString.length);
  
  try {
    const response = await axios.post(webhookUrl, payload, {
      headers: {
        'Content-Type': 'application/json',
        'calendly-webhook-signature': signature,
        'calendly-webhook-timestamp': timestamp
      },
      timeout: 10000
    });
    
    console.log('\n✅ Webhook accepted!');
    console.log('Response:', response.data);
    
  } catch (error) {
    console.log('\n❌ Webhook rejected:');
    console.log('Status:', error.response?.status);
    console.log('Response:', error.response?.data);
    
    if (error.response?.data?.message === 'Invalid webhook signature') {
      console.log('\n🔍 Signature verification failed. This might be because:');
      console.log('1. Webhook secret is incorrect');
      console.log('2. Signature algorithm is different');
      console.log('3. Timestamp format is wrong');
    }
  }
}

testWebhookSignature();
