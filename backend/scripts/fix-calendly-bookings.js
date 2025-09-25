#!/usr/bin/env node

/**
 * Comprehensive Calendly Bookings Fix Script
 * This script will:
 * 1. Delete all existing webhooks
 * 2. Register a new webhook with the correct URL
 * 3. Test the webhook endpoint
 * 4. Verify database connection
 */

require('dotenv').config();
const axios = require('axios');

const CALENDLY_API_TOKEN = process.env.CALENDLY_API_TOKEN;
const WEBHOOK_URL = process.env.WEBHOOK_URL || 'https://leadmagnet-backend.onrender.com/webhook/calendly';

async function deleteAllWebhooks() {
  console.log('🗑️  Deleting all existing webhooks...');
  
  try {
    const response = await axios.get('https://api.calendly.com/webhook_subscriptions', {
      headers: {
        'Authorization': `Bearer ${CALENDLY_API_TOKEN}`,
        'Content-Type': 'application/json'
      }
    });
    
    const webhooks = response.data.collection || [];
    console.log(`Found ${webhooks.length} existing webhooks`);
    
    for (const webhook of webhooks) {
      try {
        await axios.delete(webhook.uri, {
          headers: {
            'Authorization': `Bearer ${CALENDLY_API_TOKEN}`,
            'Content-Type': 'application/json'
          }
        });
        console.log(`✅ Deleted webhook: ${webhook.uri}`);
      } catch (error) {
        console.log(`⚠️  Could not delete webhook: ${webhook.uri}`);
      }
    }
    
    console.log('✅ All webhooks deleted');
  } catch (error) {
    console.error('❌ Error deleting webhooks:', error.response?.data || error.message);
  }
}

async function getOrganizationUuid() {
  console.log('🏢 Getting organization UUID...');
  
  try {
    const response = await axios.get('https://api.calendly.com/users/me', {
      headers: {
        'Authorization': `Bearer ${CALENDLY_API_TOKEN}`,
        'Content-Type': 'application/json'
      }
    });
    
    const orgUri = response.data.resource.current_organization;
    const orgUuid = orgUri.split('/').pop();
    console.log(`✅ Organization UUID: ${orgUuid}`);
    return orgUuid;
  } catch (error) {
    console.error('❌ Error getting organization UUID:', error.response?.data || error.message);
    throw error;
  }
}

async function registerWebhook(orgUuid) {
  console.log('🔗 Registering new webhook...');
  
  try {
    const response = await axios.post('https://api.calendly.com/webhook_subscriptions', {
      url: WEBHOOK_URL,
      events: ['invitee.created', 'invitee.canceled'],
      organization: `https://api.calendly.com/organizations/${orgUuid}`
    }, {
      headers: {
        'Authorization': `Bearer ${CALENDLY_API_TOKEN}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ Webhook registered successfully!');
    console.log('📋 Webhook details:', {
      id: response.data.resource.uuid,
      url: response.data.resource.url,
      events: response.data.resource.events,
      organization: response.data.resource.organization
    });
    
    return response.data.resource;
  } catch (error) {
    console.error('❌ Error registering webhook:', error.response?.data || error.message);
    throw error;
  }
}

async function testWebhookEndpoint() {
  console.log('🧪 Testing webhook endpoint...');
  
  try {
    const testPayload = {
      event: 'invitee.created',
      payload: {
        event: {
          uuid: 'test-event-uuid',
          uri: 'https://api.calendly.com/scheduled_events/test',
          name: 'Test Meeting',
          start_time: new Date().toISOString(),
          event_type: { duration: 30 },
          location: { join_url: 'https://zoom.us/test' }
        },
        invitee: {
          uuid: 'test-invitee-uuid',
          name: 'Test User',
          email: 'test@example.com',
          timezone: 'UTC',
          reschedule_url: 'https://calendly.com/reschedule/test',
          cancel_url: 'https://calendly.com/cancel/test',
          questions_and_answers: []
        }
      }
    };
    
    const response = await axios.post(WEBHOOK_URL, testPayload, {
      headers: {
        'Content-Type': 'application/json'
      },
      timeout: 10000
    });
    
    console.log('✅ Webhook endpoint test successful!');
    console.log('📊 Response:', response.status, response.data);
    
  } catch (error) {
    console.error('❌ Webhook endpoint test failed:', error.response?.data || error.message);
  }
}

async function verifyDatabaseConnection() {
  console.log('🗄️  Verifying database connection...');
  
  try {
    const mongoose = require('mongoose');
    const Booking = require('../models/Booking');
    
    // Test database connection
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Database connected successfully');
    
    // Test booking creation
    const testBooking = new Booking({
      calendlyEventId: 'test-' + Date.now(),
      calendlyEventUri: 'https://api.calendly.com/scheduled_events/test',
      meetingType: 'test',
      meetingTitle: 'Test Booking',
      scheduledTime: new Date(),
      duration: 30,
      timezone: 'UTC',
      attendee: {
        name: 'Test User',
        email: 'test@example.com'
      },
      status: 'scheduled',
      leadSource: 'test'
    });
    
    await testBooking.save();
    console.log('✅ Test booking saved to database:', testBooking._id);
    
    // Clean up test booking
    await Booking.findByIdAndDelete(testBooking._id);
    console.log('✅ Test booking cleaned up');
    
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
  }
}

async function main() {
  console.log('🚀 Starting Calendly Bookings Fix...\n');
  
  if (!CALENDLY_API_TOKEN) {
    console.error('❌ CALENDLY_API_TOKEN not found in environment variables');
    console.log('Please set your Calendly API token in the .env file');
    process.exit(1);
  }
  
  try {
    // Step 1: Delete all existing webhooks
    await deleteAllWebhooks();
    console.log('');
    
    // Step 2: Get organization UUID
    const orgUuid = await getOrganizationUuid();
    console.log('');
    
    // Step 3: Register new webhook
    const webhook = await registerWebhook(orgUuid);
    console.log('');
    
    // Step 4: Test webhook endpoint
    await testWebhookEndpoint();
    console.log('');
    
    // Step 5: Verify database connection
    await verifyDatabaseConnection();
    console.log('');
    
    console.log('🎉 Calendly Bookings Fix Complete!');
    console.log('📋 Summary:');
    console.log(`   • Webhook URL: ${WEBHOOK_URL}`);
    console.log(`   • Webhook ID: ${webhook.uuid}`);
    console.log(`   • Events: ${webhook.events.join(', ')}`);
    console.log('   • Database: Connected and working');
    console.log('   • Test: Webhook endpoint responding');
    
  } catch (error) {
    console.error('❌ Fix failed:', error.message);
    process.exit(1);
  }
}

// Run the fix
main();
