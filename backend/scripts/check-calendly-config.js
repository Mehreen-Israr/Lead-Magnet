const axios = require('axios');
require('dotenv').config();

async function checkCalendlyConfig() {
  console.log('🔍 Checking Calendly Configuration...\n');

  if (!process.env.CALENDLY_API_TOKEN) {
    console.error('❌ CALENDLY_API_TOKEN not found in environment variables');
    return;
  }

  try {
    // Check user info
    console.log('1. Checking Calendly user info...');
    const userResponse = await axios.get('https://api.calendly.com/users/me', {
      headers: {
        'Authorization': `Bearer ${process.env.CALENDLY_API_TOKEN}`,
        'Content-Type': 'application/json'
      }
    });

    console.log('✅ User info:', {
      name: userResponse.data.resource.name,
      email: userResponse.data.resource.email,
      uri: userResponse.data.resource.uri
    });

    // Check event types
    console.log('\n2. Checking event types...');
    const eventTypesResponse = await axios.get('https://api.calendly.com/event_types', {
      headers: {
        'Authorization': `Bearer ${process.env.CALENDLY_API_TOKEN}`,
        'Content-Type': 'application/json'
      },
      params: {
        user: userResponse.data.resource.uri
      }
    });

    const eventTypes = eventTypesResponse.data.collection;
    console.log(`✅ Found ${eventTypes.length} event types:`);
    
    eventTypes.forEach((eventType, index) => {
      console.log(`   ${index + 1}. ${eventType.name}`);
      console.log(`      - URI: ${eventType.uri}`);
      console.log(`      - Active: ${eventType.active}`);
      console.log(`      - Slug: ${eventType.slug}`);
      console.log(`      - Duration: ${eventType.duration} minutes`);
      console.log('');
    });

    // Check webhook subscriptions
    console.log('3. Checking webhook subscriptions...');
    const webhooksResponse = await axios.get('https://api.calendly.com/webhook_subscriptions', {
      headers: {
        'Authorization': `Bearer ${process.env.CALENDLY_API_TOKEN}`,
        'Content-Type': 'application/json'
      }
    });

    const webhooks = webhooksResponse.data.collection;
    console.log(`✅ Found ${webhooks.length} webhook subscriptions:`);
    
    webhooks.forEach((webhook, index) => {
      console.log(`   ${index + 1}. URL: ${webhook.url}`);
      console.log(`      - Events: ${webhook.events.join(', ')}`);
      console.log(`      - Active: ${webhook.status === 'active'}`);
      console.log('');
    });

    // Test the specific URL
    console.log('4. Testing Calendly URL...');
    const testUrl = 'https://calendly.com/leadmagnet-notifications/30min';
    console.log(`Testing URL: ${testUrl}`);
    
    try {
      const testResponse = await axios.get(testUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      });
      console.log('✅ Calendly URL is accessible');
    } catch (error) {
      console.log('❌ Calendly URL is not accessible:', error.message);
    }

  } catch (error) {
    console.error('❌ Error checking Calendly configuration:', error.response?.data || error.message);
  }
}

checkCalendlyConfig();
