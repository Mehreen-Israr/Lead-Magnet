const mongoose = require('mongoose');
const Booking = require('../models/Booking');
require('dotenv').config();

async function createTestBooking() {
  console.log('📅 Creating Test Booking in Database\n');
  
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');
    
    // Create a test booking manually
    const testBooking = new Booking({
      calendlyEventId: 'test-event-' + Date.now(),
      calendlyEventUri: 'https://api.calendly.com/scheduled_events/test',
      meetingType: 'demo',
      meetingTitle: 'Test Demo Meeting',
      scheduledTime: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
      duration: 30,
      timezone: 'America/New_York',
      attendee: {
        name: 'Test User',
        email: 'test@example.com',
        phone: '+1234567890',
        company: 'Test Company',
        notes: 'This is a test booking created manually'
      },
      status: 'scheduled',
      meetingUrl: 'https://meet.google.com/test-meeting',
      rescheduleUrl: 'https://calendly.com/reschedule/test',
      cancelUrl: 'https://calendly.com/cancel/test',
      utm: {
        source: 'test',
        medium: 'manual',
        campaign: 'webhook-test'
      },
      leadSource: 'test_booking'
    });
    
    await testBooking.save();
    console.log('✅ Test booking created successfully!');
    console.log('Booking ID:', testBooking._id);
    console.log('Attendee:', testBooking.attendee.name);
    console.log('Email:', testBooking.attendee.email);
    console.log('Meeting:', testBooking.meetingTitle);
    console.log('Scheduled:', testBooking.scheduledTime);
    
    // Check total bookings
    const totalBookings = await Booking.countDocuments();
    console.log(`\n📊 Total bookings in database: ${totalBookings}`);
    
    // Show recent bookings
    const recentBookings = await Booking.find()
      .sort({ createdAt: -1 })
      .limit(3);
    
    console.log('\n📋 Recent bookings:');
    recentBookings.forEach((booking, index) => {
      console.log(`${index + 1}. ${booking.attendee.name} (${booking.attendee.email}) - ${booking.meetingTitle}`);
    });
    
  } catch (error) {
    console.error('❌ Error creating test booking:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('\n✅ Database disconnected');
  }
}

createTestBooking();
