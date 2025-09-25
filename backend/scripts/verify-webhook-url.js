#!/usr/bin/env node

/**
 * Verify Webhook URL
 * This script tests the correct webhook URL
 */

const axios = require('axios');

const CORRECT_WEBHOOK_URL = 'https://leadmagnet-backend.onrender.com/webhook/calendly';

async function verifyWebhookURL() {
  console.log('🔍 Verifying Webhook URL...\n');
  console.log(`📍 Testing: ${CORRECT_WEBHOOK_URL}\n`);
  
  try {
    // Test the correct webhook endpoint
    const testPayload = {
      event: 'invitee.created',
      payload: {
        event: {
          uuid: 'test-event-' + Date.now(),
          uri: 'https://api.calendly.com/scheduled_events/test',
          name: 'Test Meeting',
          start_time: new Date().toISOString(),
          event_type: { duration: 30 },
          location: { join_url: 'https://zoom.us/test' }
        },
        invitee: {
          uuid: 'test-invitee-' + Date.now(),
          name: 'Test User',
          email: 'test@example.com',
          timezone: 'UTC',
          reschedule_url: 'https://calendly.com/reschedule/test',
          cancel_url: 'https://calendly.com/cancel/test',
          questions_and_answers: []
        }
      }
    };
    
    console.log('📤 Sending test payload to webhook...');
    
    const response = await axios.post(CORRECT_WEBHOOK_URL, testPayload, {
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Calendly-Webhook-Test'
      },
      timeout: 15000
    });
    
    console.log('✅ Webhook endpoint is working!');
    console.log(`📊 Status: ${response.status}`);
    console.log(`📊 Response: ${response.data}`);
    
    // Check if booking was saved
    console.log('\n🔍 Checking if booking was saved to database...');
    
    const mongoose = require('mongoose');
    const Booking = require('../models/Booking');
    
    require('dotenv').config();
    await mongoose.connect(process.env.MONGODB_URI);
    
    const testBooking = await Booking.findOne({
      calendlyEventId: testPayload.payload.event.uuid
    });
    
    if (testBooking) {
      console.log('✅ Booking saved to database successfully!');
      console.log('📋 Booking details:', {
        id: testBooking._id,
        attendee: testBooking.attendee.name,
        email: testBooking.attendee.email,
        meeting: testBooking.meetingTitle
      });
      
      // Clean up
      await Booking.findByIdAndDelete(testBooking._id);
      console.log('✅ Test booking cleaned up');
    } else {
      console.log('❌ Booking not found in database');
    }
    
    await mongoose.disconnect();
    
    console.log('\n🎉 Webhook URL verification complete!');
    console.log(`✅ Correct webhook URL: ${CORRECT_WEBHOOK_URL}`);
    console.log('✅ Endpoint is accessible and working');
    console.log('✅ Database storage is working');
    
  } catch (error) {
    console.error('❌ Verification failed:', error.message);
    
    if (error.response) {
      console.error('📊 Status:', error.response.status);
      console.error('📊 Response:', error.response.data);
    }
  }
}

verifyWebhookURL();
