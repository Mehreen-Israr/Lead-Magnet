const axios = require('axios');
const Booking = require('../models/Booking');
require('dotenv').config();

async function importCalendlyBookings() {
  console.log('📅 Manual Calendly Booking Import\n');
  
  try {
    // Get recent events from Calendly API
    console.log('🔍 Fetching recent Calendly events...');
    
    const response = await axios.get(
      'https://api.calendly.com/scheduled_events',
      {
        headers: {
          'Authorization': `Bearer ${process.env.CALENDLY_API_TOKEN}`,
          'Content-Type': 'application/json'
        },
        params: {
          user: 'https://api.calendly.com/users/me',
          count: 20,
          sort: 'start_time:desc'
        }
      }
    );
    
    console.log(`Found ${response.data.collection.length} recent events`);
    
    for (const event of response.data.collection) {
      try {
        // Get event details
        const eventDetails = await axios.get(event.uri, {
          headers: {
            'Authorization': `Bearer ${process.env.CALENDLY_API_TOKEN}`,
            'Content-Type': 'application/json'
          }
        });
        
        // Get invitees for this event
        const inviteesResponse = await axios.get(
          'https://api.calendly.com/scheduled_events/' + event.uri.split('/').pop() + '/invitees',
          {
            headers: {
              'Authorization': `Bearer ${process.env.CALENDLY_API_TOKEN}`,
              'Content-Type': 'application/json'
            }
          }
        );
        
        for (const invitee of inviteesResponse.data.collection) {
          // Check if booking already exists
          const existingBooking = await Booking.findOne({
            calendlyEventId: event.uri.split('/').pop()
          });
          
          if (!existingBooking) {
            // Create new booking
            const booking = new Booking({
              calendlyEventId: event.uri.split('/').pop(),
              calendlyEventUri: event.uri,
              meetingType: 'demo',
              meetingTitle: event.name || 'Meeting',
              scheduledTime: new Date(event.start_time),
              duration: event.duration || 30,
              timezone: event.timezone || 'UTC',
              attendee: {
                name: invitee.name || 'Unknown',
                email: invitee.email,
                phone: invitee.questions_and_answers?.find(q => q.question.toLowerCase().includes('phone'))?.answer,
                company: invitee.questions_and_answers?.find(q => q.question.toLowerCase().includes('company'))?.answer,
                notes: invitee.questions_and_answers?.find(q => q.question.toLowerCase().includes('notes'))?.answer
              },
              status: invitee.status === 'active' ? 'scheduled' : 'cancelled',
              meetingUrl: event.location?.join_url,
              rescheduleUrl: invitee.reschedule_url,
              cancelUrl: invitee.cancel_url,
              leadSource: 'calendly_manual_import'
            });
            
            await booking.save();
            console.log(`✅ Imported booking: ${invitee.name} (${invitee.email})`);
          } else {
            console.log(`⏭️  Booking already exists: ${invitee.name} (${invitee.email})`);
          }
        }
        
      } catch (error) {
        console.log(`❌ Error processing event ${event.uri}: ${error.message}`);
      }
    }
    
    console.log('\n🎉 Manual import complete!');
    console.log('\n📋 Next steps:');
    console.log('1. Run this script regularly to import new bookings');
    console.log('2. Set up a cron job to run this every hour');
    console.log('3. Or upgrade Calendly for automatic webhooks');
    
  } catch (error) {
    console.log(`❌ Error importing bookings: ${error.message}`);
    
    if (error.response?.status === 401) {
      console.log('\n🔑 Authentication Error:');
      console.log('- Check your CALENDLY_API_TOKEN in .env file');
      console.log('- Make sure the token is valid and not expired');
    }
  }
}

// Run the import
importCalendlyBookings();
