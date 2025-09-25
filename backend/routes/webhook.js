const express = require('express');
const router = express.Router();
const Booking = require('../models/Booking');

// Simple Calendly webhook endpoint
router.post('/calendly', async (req, res) => {
  try {
    console.log('🔔 Calendly webhook received:', JSON.stringify(req.body, null, 2));
    
    // Always respond quickly first
    res.status(200).send('OK');
    
    // Process the webhook asynchronously
    const event = req.body;
    
    if (event.event === 'invitee.created') {
      await handleBookingCreated(event);
    } else if (event.event === 'invitee.canceled') {
      await handleBookingCanceled(event);
    } else {
      console.log('Unhandled event type:', event.event);
    }
    
  } catch (error) {
    console.error('❌ Webhook error:', error);
    // Don't send error response since we already sent 200
  }
});

async function handleBookingCreated(event) {
  try {
    console.log('📅 Processing new booking...');
    
    // Extract data from Calendly payload
    const { event: eventData, invitee } = event.payload;
    
    // Create booking record
    const booking = new Booking({
      calendlyEventId: eventData.uuid,
      calendlyEventUri: eventData.uri,
      meetingType: 'demo', // Default type
      meetingTitle: eventData.name || 'Meeting',
      scheduledTime: new Date(eventData.start_time),
      duration: eventData.event_type?.duration || 30,
      timezone: invitee.timezone || 'UTC',
      attendee: {
        name: invitee.name || 'Unknown',
        email: invitee.email,
        phone: invitee.questions_and_answers?.find(q => q.question.toLowerCase().includes('phone'))?.answer,
        company: invitee.questions_and_answers?.find(q => q.question.toLowerCase().includes('company'))?.answer,
        notes: invitee.questions_and_answers?.find(q => q.question.toLowerCase().includes('notes'))?.answer
      },
      status: 'scheduled',
      meetingUrl: eventData.location?.join_url,
      rescheduleUrl: invitee.reschedule_url,
      cancelUrl: invitee.cancel_url,
      leadSource: 'calendly_webhook'
    });
    
    await booking.save();
    console.log('✅ Booking saved to database:', booking._id);
    
  } catch (error) {
    console.error('❌ Error saving booking:', error);
  }
}

async function handleBookingCanceled(event) {
  try {
    console.log('❌ Processing booking cancellation...');
    
    const { event: eventData } = event.payload;
    
    // Update booking status to cancelled
    await Booking.findOneAndUpdate(
      { calendlyEventId: eventData.uuid },
      { status: 'cancelled' }
    );
    
    console.log('✅ Booking cancelled:', eventData.uuid);
    
  } catch (error) {
    console.error('❌ Error cancelling booking:', error);
  }
}

module.exports = router;
