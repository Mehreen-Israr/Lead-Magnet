#!/usr/bin/env node

/**
 * Test Booking Storage Script
 * This script tests if bookings are being stored in the database
 */

require('dotenv').config();
const mongoose = require('mongoose');
const Booking = require('../models/Booking');

async function testBookingStorage() {
  console.log('🧪 Testing Booking Storage...\n');
  
  try {
    // Connect to database
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Database connected');
    
    // Check existing bookings
    const existingBookings = await Booking.find().sort({ createdAt: -1 });
    console.log(`📊 Found ${existingBookings.length} existing bookings`);
    
    if (existingBookings.length > 0) {
      console.log('\n📋 Recent bookings:');
      existingBookings.slice(0, 5).forEach((booking, index) => {
        console.log(`${index + 1}. ${booking.attendee.name} (${booking.attendee.email})`);
        console.log(`   Meeting: ${booking.meetingTitle}`);
        console.log(`   Date: ${booking.scheduledTime}`);
        console.log(`   Status: ${booking.status}`);
        console.log(`   Source: ${booking.leadSource}`);
        console.log('');
      });
    }
    
    // Test creating a new booking
    console.log('🧪 Testing new booking creation...');
    const testBooking = new Booking({
      calendlyEventId: 'test-' + Date.now(),
      calendlyEventUri: 'https://api.calendly.com/scheduled_events/test',
      meetingType: 'demo',
      meetingTitle: 'Test Meeting',
      scheduledTime: new Date(),
      duration: 30,
      timezone: 'UTC',
      attendee: {
        name: 'Test User',
        email: 'test@example.com',
        phone: '+1234567890',
        company: 'Test Company',
        notes: 'This is a test booking'
      },
      status: 'scheduled',
      meetingUrl: 'https://zoom.us/test',
      rescheduleUrl: 'https://calendly.com/reschedule/test',
      cancelUrl: 'https://calendly.com/cancel/test',
      leadSource: 'test_script'
    });
    
    await testBooking.save();
    console.log('✅ Test booking created:', testBooking._id);
    
    // Clean up test booking
    await Booking.findByIdAndDelete(testBooking._id);
    console.log('✅ Test booking cleaned up');
    
    console.log('\n🎉 Booking storage test completed successfully!');
    console.log('📋 Database is working correctly for storing bookings');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Database disconnected');
  }
}

// Run the test
testBookingStorage();
