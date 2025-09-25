const axios = require('axios');
require('dotenv').config();

async function testWebhookWithoutSignature() {
  console.log('🧪 Testing Webhook Without Signature Verification\n');
  
  const webhookUrl = 'https://leadmagnet-backend.onrender.com/api/calendly/webhook';
  
  // Simulate a real Calendly webhook payload
  const payload = {
    event: 'invitee.created',
    payload: {
      event: {
        uuid: 'test-event-' + Date.now(),
        uri: 'https://api.calendly.com/scheduled_events/test',
        name: 'Demo Meeting',
        start_time: new Date().toISOString(),
        event_type: {
          duration: 30
        },
        location: {
          join_url: 'https://meet.google.com/test-meeting'
        }
      },
      invitee: {
        name: 'Test User',
        email: 'test5@example.com',
        timezone: 'America/New_York',
        reschedule_url: 'https://calendly.com/reschedule/test',
        cancel_url: 'https://calendly.com/cancel/test',
        questions_and_answers: [
          { question: 'Company', answer: 'Test Company' },
          { question: 'Phone', answer: '+1234567890' }
        ]
      }
    }
  };
  
  try {
    console.log('📡 Sending webhook to:', webhookUrl);
    console.log('📦 Payload:', JSON.stringify(payload, null, 2));
    
    const response = await axios.post(webhookUrl, payload, {
      headers: {
        'Content-Type': 'application/json',
        'calendly-webhook-signature': 'test-signature',
        'calendly-webhook-timestamp': Date.now().toString()
      },
      timeout: 15000
    });
    
    console.log('\n✅ Webhook sent successfully!');
    console.log('Response:', response.data);
    
  } catch (error) {
    console.log('\n❌ Webhook test failed:');
    console.log('Status:', error.response?.status);
    console.log('Response:', error.response?.data);
    console.log('Error:', error.message);
    
    if (error.response?.data?.message === 'Invalid webhook signature') {
      console.log('\n🔍 The webhook is rejecting requests due to signature verification');
      console.log('This means:');
      console.log('1. The webhook endpoint is working');
      console.log('2. But signature verification is failing');
      console.log('3. Calendly might not be sending proper signatures');
    }
  }
  
  // Check if booking was created anyway
  console.log('\n🔍 Checking database for new booking...');
  
  try {
    const mongoose = require('mongoose');
    const Booking = require('../models/Booking');
    
    await mongoose.connect(process.env.MONGODB_URI);
    
    const testBookings = await Booking.find({ 
      'attendee.email': 'test5@example.com' 
    }).sort({ createdAt: -1 });
    
    if (testBookings.length > 0) {
      console.log(`✅ Found ${testBookings.length} test booking(s):`);
      testBookings.forEach((booking, index) => {
        console.log(`\nBooking ${index + 1}:`);
        console.log(`- ID: ${booking._id}`);
        console.log(`- Attendee: ${booking.attendee.name} (${booking.attendee.email})`);
        console.log(`- Meeting: ${booking.meetingType} - ${booking.meetingTitle}`);
        console.log(`- Status: ${booking.status}`);
        console.log(`- Created: ${booking.createdAt}`);
      });
    } else {
      console.log('❌ No test bookings found in database');
    }
    
    await mongoose.disconnect();
    
  } catch (error) {
    console.log('❌ Database check failed:', error.message);
  }
  
  console.log('\n📋 Next Steps:');
  console.log('1. The webhook endpoint is working but rejecting signatures');
  console.log('2. This suggests Calendly is not sending webhooks');
  console.log('3. Check if you have active event types in Calendly');
  console.log('4. Try booking from a different email/account');
  console.log('5. Check Calendly webhook logs in your account');
}

testWebhookWithoutSignature();
