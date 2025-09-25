const mongoose = require('mongoose');
const Booking = require('../models/Booking');
require('dotenv').config();

async function testBookingFlow() {
  console.log('🧪 Testing Calendly Booking Flow\n');
  
  // Connect to database
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');
  } catch (error) {
    console.log(`❌ Database connection failed: ${error.message}`);
    return;
  }
  
  // Check existing bookings
  console.log('\n📊 Current bookings in database:');
  try {
    const bookings = await Booking.find().sort({ createdAt: -1 }).limit(5);
    console.log(`Found ${bookings.length} booking(s):`);
    
    if (bookings.length === 0) {
      console.log('❌ No bookings found in database');
      console.log('\nThis means:');
      console.log('1. No webhooks have been received yet');
      console.log('2. Webhook is not properly configured');
      console.log('3. Calendly is not sending webhooks to your endpoint');
    } else {
      bookings.forEach((booking, index) => {
        console.log(`\nBooking ${index + 1}:`);
        console.log(`- ID: ${booking._id}`);
        console.log(`- Attendee: ${booking.attendee.name} (${booking.attendee.email})`);
        console.log(`- Meeting: ${booking.meetingType} - ${booking.meetingTitle}`);
        console.log(`- Scheduled: ${booking.scheduledTime}`);
        console.log(`- Status: ${booking.status}`);
        console.log(`- Created: ${booking.createdAt}`);
      });
    }
  } catch (error) {
    console.log(`❌ Error fetching bookings: ${error.message}`);
  }
  
  // Test webhook endpoint
  console.log('\n🔍 Testing webhook endpoint...');
  try {
    const axios = require('axios');
    const testPayload = {
      event: 'invitee.created',
      payload: {
        event: {
          uuid: 'test-event-' + Date.now(),
          uri: 'https://api.calendly.com/scheduled_events/test',
          name: 'Test Demo Meeting',
          start_time: new Date().toISOString(),
          event_type: { duration: 30 },
          location: { join_url: 'https://meet.google.com/test-meeting' }
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
    
    const response = await axios.post(
      process.env.WEBHOOK_URL || 'http://localhost:10000/api/calendly/webhook',
      testPayload,
      {
        headers: {
          'Content-Type': 'application/json',
          'calendly-webhook-signature': 'test-signature',
          'calendly-webhook-timestamp': Date.now().toString()
        },
        timeout: 10000
      }
    );
    
    console.log(`✅ Webhook endpoint responded (Status: ${response.status})`);
    
    // Check if test booking was created
    console.log('\n🔍 Checking if test booking was created...');
    const testBookings = await Booking.find({ 
      'attendee.email': 'test@example.com' 
    }).sort({ createdAt: -1 });
    
    if (testBookings.length > 0) {
      console.log(`✅ Test booking created successfully!`);
      console.log(`- Booking ID: ${testBookings[0]._id}`);
      console.log(`- Attendee: ${testBookings[0].attendee.name}`);
      console.log(`- Meeting Type: ${testBookings[0].meetingType}`);
    } else {
      console.log('❌ Test booking was not created');
      console.log('This indicates the webhook handler is not working properly');
    }
    
  } catch (error) {
    console.log(`❌ Webhook test failed: ${error.message}`);
    console.log('\nPossible issues:');
    console.log('1. Server is not running');
    console.log('2. Webhook URL is incorrect');
    console.log('3. CORS issues');
    console.log('4. Authentication/authorization issues');
  }
  
  // Analytics
  console.log('\n📈 Booking Analytics:');
  try {
    const totalBookings = await Booking.countDocuments();
    const scheduledBookings = await Booking.countDocuments({ status: 'scheduled' });
    const completedBookings = await Booking.countDocuments({ status: 'completed' });
    const cancelledBookings = await Booking.countDocuments({ status: 'cancelled' });
    
    console.log(`- Total bookings: ${totalBookings}`);
    console.log(`- Scheduled: ${scheduledBookings}`);
    console.log(`- Completed: ${completedBookings}`);
    console.log(`- Cancelled: ${cancelledBookings}`);
    
    if (totalBookings > 0) {
      const meetingTypes = await Booking.aggregate([
        { $group: { _id: '$meetingType', count: { $sum: 1 } } }
      ]);
      console.log('\nMeeting types:');
      meetingTypes.forEach(type => {
        console.log(`- ${type._id}: ${type.count}`);
      });
    }
  } catch (error) {
    console.log(`❌ Error getting analytics: ${error.message}`);
  }
  
  console.log('\n📋 Troubleshooting Steps:');
  console.log('1. Make sure your server is running');
  console.log('2. Verify webhook URL is accessible from internet');
  console.log('3. Check Calendly webhook configuration');
  console.log('4. Test with a real Calendly booking');
  console.log('5. Check server logs for webhook errors');
  
  await mongoose.disconnect();
  console.log('\n✅ Database disconnected');
}

testBookingFlow();
