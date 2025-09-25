#!/usr/bin/env node

/**
 * Test Webhook Endpoint Directly
 * This script tests if the webhook endpoint is accessible and working
 */

require('dotenv').config();
const axios = require('axios');

const WEBHOOK_URL = process.env.WEBHOOK_URL || 'https://leadmagnet-backend.onrender.com/webhook/calendly';

async function testWebhookEndpoint() {
  console.log('🧪 Testing Webhook Endpoint...\n');
  console.log(`📍 Testing URL: ${WEBHOOK_URL}\n`);
  
  try {
    // Test 1: Basic connectivity
    console.log('1️⃣ Testing basic connectivity...');
    const healthResponse = await axios.get(WEBHOOK_URL.replace('/webhook/calendly', '/health'), {
      timeout: 10000
    });
    console.log('✅ Backend is accessible:', healthResponse.data);
    console.log('');
    
    // Test 2: Webhook endpoint with test payload
    console.log('2️⃣ Testing webhook endpoint...');
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
          questions_and_answers: [
            {
              question: 'Phone number',
              answer: '+1234567890'
            },
            {
              question: 'Company',
              answer: 'Test Company'
            }
          ]
        }
      }
    };
    
    console.log('📤 Sending test payload:', JSON.stringify(testPayload, null, 2));
    console.log('');
    
    const response = await axios.post(WEBHOOK_URL, testPayload, {
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Calendly-Webhook-Test'
      },
      timeout: 15000
    });
    
    console.log('✅ Webhook endpoint responded successfully!');
    console.log(`📊 Status: ${response.status}`);
    console.log(`📊 Response: ${response.data}`);
    console.log('');
    
    // Test 3: Check if booking was created in database
    console.log('3️⃣ Checking if booking was stored in database...');
    
    const mongoose = require('mongoose');
    const Booking = require('../models/Booking');
    
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Database connected');
    
    // Look for the test booking
    const testBooking = await Booking.findOne({
      calendlyEventId: testPayload.payload.event.uuid
    });
    
    if (testBooking) {
      console.log('✅ Test booking found in database!');
      console.log('📋 Booking details:', {
        id: testBooking._id,
        attendee: testBooking.attendee.name,
        email: testBooking.attendee.email,
        meeting: testBooking.meetingTitle,
        status: testBooking.status
      });
      
      // Clean up test booking
      await Booking.findByIdAndDelete(testBooking._id);
      console.log('✅ Test booking cleaned up');
    } else {
      console.log('❌ Test booking not found in database');
      console.log('This means the webhook received the request but failed to save to database');
    }
    
    await mongoose.disconnect();
    console.log('🔌 Database disconnected');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    
    if (error.response) {
      console.error('📊 Response status:', error.response.status);
      console.error('📊 Response data:', error.response.data);
    }
    
    if (error.code === 'ECONNREFUSED') {
      console.error('🔌 Connection refused - backend might not be running');
    } else if (error.code === 'ENOTFOUND') {
      console.error('🌐 DNS error - check if the URL is correct');
    } else if (error.code === 'ETIMEDOUT') {
      console.error('⏰ Request timeout - backend might be slow to respond');
    }
  }
}

// Run the test
testWebhookEndpoint();
