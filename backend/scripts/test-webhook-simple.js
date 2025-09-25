const axios = require('axios');
require('dotenv').config();

async function testWebhookSimple() {
  console.log('🧪 Simple Webhook Test (No Signature)\n');
  
  const webhookUrl = 'https://leadmagnet-backend.onrender.com/api/calendly/webhook';
  
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
        email: 'test4@example.com',
        timezone: 'America/New_York',
        reschedule_url: 'https://calendly.com/reschedule',
        cancel_url: 'https://calendly.com/cancel',
        questions_and_answers: []
      }
    }
  };
  
  try {
    console.log('📡 Sending webhook to:', webhookUrl);
    console.log('📦 Payload:', JSON.stringify(payload, null, 2));
    
    const response = await axios.post(webhookUrl, payload, {
      headers: {
        'Content-Type': 'application/json'
        // No signature headers - let it skip verification
      },
      timeout: 5000
    });
    
    console.log('\n✅ Webhook sent successfully!');
    console.log('Response:', response.data);
    
  } catch (error) {
    console.log('\n❌ Webhook test failed:');
    console.log('Status:', error.response?.status);
    console.log('Response:', error.response?.data);
    console.log('Error:', error.message);
    
    if (error.code === 'ECONNABORTED') {
      console.log('\n⏰ Request timed out - webhook handler might be hanging');
    }
  }
  
  // Check if booking was created anyway
  console.log('\n🔍 Checking database for new booking...');
  
  try {
    const mongoose = require('mongoose');
    const Booking = require('../models/Booking');
    
    await mongoose.connect(process.env.MONGODB_URI);
    
    const testBookings = await Booking.find({ 
      'attendee.email': 'test4@example.com' 
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

testWebhookSimple();
