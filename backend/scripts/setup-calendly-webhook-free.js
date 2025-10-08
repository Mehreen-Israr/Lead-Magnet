const axios = require('axios');
require('dotenv').config();

async function setupCalendlyWebhookFree() {
  console.log('📅 Setting up Calendly Webhook (Free Account Workaround)\n');
  
  console.log('🚨 IMPORTANT: Calendly webhooks require a paid plan (Standard $8/month)');
  console.log('However, you can still store bookings using these alternatives:\n');
  
  console.log('📋 Option 1: Manual Import (Recommended for now)');
  console.log('Run this script regularly to import new bookings:');
  console.log('node scripts/manual-booking-import.js\n');
  
  console.log('📋 Option 2: Upgrade Calendly Plan');
  console.log('1. Go to Calendly Settings → Billing');
  console.log('2. Upgrade to Standard plan ($8/month)');
  console.log('3. Run: node scripts/setup-aws-webhooks.js\n');
  
  console.log('📋 Option 3: Use Calendly API Directly');
  console.log('Set up a cron job to check for new bookings every hour:');
  console.log('*/60 * * * * cd /path/to/backend && node scripts/manual-booking-import.js\n');
  
  console.log('🔧 Current Setup:');
  console.log('- Your backend is ready to receive webhooks');
  console.log('- Database models are configured');
  console.log('- Just need Calendly webhook access\n');
  
  console.log('💡 Recommendation:');
  console.log('1. Use manual import for now (free)');
  console.log('2. Upgrade to Calendly Standard when you have more bookings');
  console.log('3. Set up automatic webhooks after upgrade');
  
  console.log('\n🚀 To start manual import now:');
  console.log('node scripts/manual-booking-import.js');
}

// Run the setup
setupCalendlyWebhookFree();
