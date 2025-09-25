const mongoose = require('mongoose');
const Booking = require('../models/Booking');
require('dotenv').config();

async function monitorWebhook() {
  console.log('👀 Monitoring Webhook for New Bookings\n');
  
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');
    
    // Get current count
    const currentCount = await Booking.countDocuments();
    console.log(`📊 Current bookings in database: ${currentCount}`);
    
    // Get recent bookings (last 5 minutes)
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    const recentBookings = await Booking.find({
      createdAt: { $gte: fiveMinutesAgo }
    }).sort({ createdAt: -1 });
    
    if (recentBookings.length > 0) {
      console.log(`\n🆕 Found ${recentBookings.length} recent booking(s):`);
      recentBookings.forEach((booking, index) => {
        console.log(`\n📅 Booking ${index + 1}:`);
        console.log(`- ID: ${booking._id}`);
        console.log(`- Attendee: ${booking.attendee.name} (${booking.attendee.email})`);
        console.log(`- Meeting: ${booking.meetingType} - ${booking.meetingTitle}`);
        console.log(`- Scheduled: ${booking.scheduledTime}`);
        console.log(`- Status: ${booking.status}`);
        console.log(`- Created: ${booking.createdAt}`);
        console.log(`- Source: ${booking.leadSource}`);
        
        // Check if it's a real Calendly booking
        if (booking.calendlyEventId && booking.calendlyEventId.startsWith('direct_')) {
          console.log('✅ This appears to be a REAL Calendly booking!');
        } else {
          console.log('⚠️  This appears to be a test/manual booking');
        }
      });
    } else {
      console.log('\n❌ No recent bookings found');
      console.log('This means:');
      console.log('1. No new bookings in the last 5 minutes');
      console.log('2. Webhook might not be working');
      console.log('3. Calendly might not be sending webhooks');
    }
    
    // Check for real Calendly bookings
    const realBookings = await Booking.find({
      calendlyEventId: { $regex: /^direct_/ }
    }).sort({ createdAt: -1 });
    
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
    
    console.log('\n📋 To test your webhook:');
    console.log('1. Go to: https://calendly.com/leadmagnet-notifications/30min');
    console.log('2. Book a meeting with a DIFFERENT email address');
    console.log('3. Wait 1-2 minutes');
    console.log('4. Run this script again to check for new bookings');
    
  } catch (error) {
    console.error('❌ Error monitoring webhook:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('\n✅ Database disconnected');
  }
}

monitorWebhook();
