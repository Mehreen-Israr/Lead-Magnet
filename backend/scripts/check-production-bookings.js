const mongoose = require('mongoose');
const Booking = require('../models/Booking');
require('dotenv').config();

async function checkProductionBookings() {
  console.log('🔍 Checking Production Database for Recent Bookings\n');
  
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');
    
    // Get recent bookings (last 24 hours)
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const recentBookings = await Booking.find({
      createdAt: { $gte: yesterday }
    }).sort({ createdAt: -1 });
    
    console.log(`📊 Found ${recentBookings.length} recent booking(s):`);
    
    if (recentBookings.length > 0) {
      recentBookings.forEach((booking, index) => {
        console.log(`\n📅 Booking ${index + 1}:`);
        console.log(`- ID: ${booking._id}`);
        console.log(`- Attendee: ${booking.attendee.name} (${booking.attendee.email})`);
        console.log(`- Meeting: ${booking.meetingType} - ${booking.meetingTitle}`);
        console.log(`- Scheduled: ${booking.scheduledTime}`);
        console.log(`- Status: ${booking.status}`);
        console.log(`- Created: ${booking.createdAt}`);
        console.log(`- Source: ${booking.leadSource}`);
        
        if (booking.calendlyEventId && booking.calendlyEventId.startsWith('direct_')) {
          console.log('✅ This appears to be a real Calendly booking!');
        }
      });
    } else {
      console.log('❌ No recent bookings found');
      console.log('\nThis means:');
      console.log('1. The booking didn\'t trigger the webhook');
      console.log('2. The webhook failed to process');
      console.log('3. The booking went to a different database');
    }
    
    // Check total bookings
    const totalBookings = await Booking.countDocuments();
    console.log(`\n📊 Total bookings in database: ${totalBookings}`);
    
    // Check for bookings with real Calendly event IDs
    const realBookings = await Booking.find({
      calendlyEventId: { $regex: /^direct_/ }
    });
    
    console.log(`\n🎯 Real Calendly bookings: ${realBookings.length}`);
    
    if (realBookings.length > 0) {
      console.log('✅ Found real Calendly bookings!');
      realBookings.forEach((booking, index) => {
        console.log(`${index + 1}. ${booking.attendee.name} - ${booking.meetingTitle} (${booking.createdAt})`);
      });
    } else {
      console.log('❌ No real Calendly bookings found');
      console.log('All bookings appear to be test/manual entries');
    }
    
  } catch (error) {
    console.error('❌ Error checking bookings:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('\n✅ Database disconnected');
  }
}

checkProductionBookings();
