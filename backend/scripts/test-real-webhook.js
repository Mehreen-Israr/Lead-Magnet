const axios = require('axios');
const crypto = require('crypto');
require('dotenv').config();

async function testRealWebhook() {
  console.log('🧪 Testing Real Calendly Webhook Simulation\n');
  
  const webhookUrl = 'https://leadmagnet-backend.onrender.com/api/calendly/webhook';
  const webhookSecret = process.env.CALENDLY_WEBHOOK_SECRET;
  
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
        email: 'test@example.com',
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
  
  const timestamp = Date.now().toString();
  const payloadString = JSON.stringify(payload);
  
  // Create proper Calendly signature
  const signature = crypto
    .createHmac('sha256', webhookSecret)
    .update(timestamp + payloadString)
    .digest('base64');
  
  try {
    console.log('📡 Sending webhook to:', webhookUrl);
    console.log('📦 Payload:', JSON.stringify(payload, null, 2));
    
    const response = await axios.post(webhookUrl, payload, {
      headers: {
        'Content-Type': 'application/json',
        'calendly-webhook-signature': signature,
        'calendly-webhook-timestamp': timestamp
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
  }
  
  console.log('\n🔍 Checking if booking was created...');
  
  // Check database for new booking
  try {
    const mongoose = require('mongoose');
    const Booking = require('../models/Booking');
    
    await mongoose.connect(process.env.MONGODB_URI);
    
    const testBookings = await Booking.find({ 
      'attendee.email': 'test@example.com' 
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
}

testRealWebhook();
