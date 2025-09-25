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
    
    // Extract data from Calendly payload - the structure is different
    const payload = event.payload;
    const scheduledEvent = payload.scheduled_event;
    
    // Create booking record
    const booking = new Booking({
      calendlyEventId: scheduledEvent.uri.split('/').pop(), // Extract UUID from URI
      calendlyEventUri: scheduledEvent.uri,
      meetingType: 'demo', // Default type
      meetingTitle: scheduledEvent.name || 'Meeting',
      scheduledTime: new Date(scheduledEvent.start_time),
      duration: 30, // Default duration
      timezone: payload.timezone || 'UTC',
      attendee: {
        name: payload.name || 'Unknown',
        email: payload.email,
        phone: payload.questions_and_answers?.find(q => q.question.toLowerCase().includes('phone'))?.answer,
        company: payload.questions_and_answers?.find(q => q.question.toLowerCase().includes('company'))?.answer,
        notes: payload.questions_and_answers?.find(q => q.question.toLowerCase().includes('notes'))?.answer
      },
      status: 'scheduled',
      meetingUrl: scheduledEvent.location?.join_url,
      rescheduleUrl: payload.reschedule_url,
      cancelUrl: payload.cancel_url,
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
    
    const payload = event.payload;
    const scheduledEvent = payload.scheduled_event;
    
    // Update booking status to cancelled
    await Booking.findOneAndUpdate(
      { calendlyEventId: scheduledEvent.uri.split('/').pop() },
      { status: 'cancelled' }
    );
    
    console.log('✅ Booking cancelled:', scheduledEvent.uri.split('/').pop());
    
  } catch (error) {
    console.error('❌ Error cancelling booking:', error);
  }
}

module.exports = router;
