const axios = require('axios');
require('dotenv').config();

async function testCalendlyAccount() {
  console.log('🔍 Testing Calendly Account Configuration...\n');

  if (!process.env.CALENDLY_API_TOKEN) {
    console.error('❌ CALENDLY_API_TOKEN not found in environment variables');
    return;
  }

  try {
    // 1. Test API Token
    console.log('1. Testing Calendly API Token...');
    const userResponse = await axios.get('https://api.calendly.com/users/me', {
      headers: {
        'Authorization': `Bearer ${process.env.CALENDLY_API_TOKEN}`,
        'Content-Type': 'application/json'
      }
    });

    console.log('✅ API Token is valid');
    console.log('   User:', userResponse.data.resource.name);
    console.log('   Email:', userResponse.data.resource.email);

    // 2. Check Event Types
    console.log('\n2. Checking Event Types...');
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
      console.log(`      - Active: ${eventType.active}`);
      console.log(`      - Slug: ${eventType.slug}`);
      console.log(`      - Duration: ${eventType.duration} minutes`);
      console.log(`      - URI: ${eventType.uri}`);
      console.log('');
    });

    // 3. Test Public URLs
    console.log('3. Testing Public Calendly URLs...');
    const testUrls = [
      'https://calendly.com/leadmagnet-notifications',
      'https://calendly.com/leadmagnet-notifications/demo',
      'https://calendly.com/leadmagnet-notifications/30min'
    ];

    for (const url of testUrls) {
      try {
        const response = await axios.get(url, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
          }
        });
        console.log(`✅ ${url} - Accessible (${response.status})`);
      } catch (error) {
        console.log(`❌ ${url} - Error: ${error.message}`);
      }
    }

    // 4. Check if account has proper permissions
    console.log('\n4. Checking Account Permissions...');
    try {
      const orgResponse = await axios.get('https://api.calendly.com/organizations', {
        headers: {
          'Authorization': `Bearer ${process.env.CALENDLY_API_TOKEN}`,
          'Content-Type': 'application/json'
        }
      });
      
      const orgs = orgResponse.data.collection;
      console.log(`✅ Found ${orgs.length} organizations:`);
      orgs.forEach((org, index) => {
        console.log(`   ${index + 1}. ${org.name} (${org.uri})`);
      });
    } catch (error) {
      console.log('❌ Error checking organizations:', error.response?.data || error.message);
    }

    // 5. Test specific event type availability
    console.log('\n5. Testing Event Type Availability...');
    for (const eventType of eventTypes) {
      if (eventType.active) {
        const publicUrl = `https://calendly.com/leadmagnet-notifications/${eventType.slug}`;
        try {
          const response = await axios.get(publicUrl, {
            headers: {
              'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            }
          });
          console.log(`✅ ${eventType.name} (${eventType.slug}) - Accessible`);
        } catch (error) {
          console.log(`❌ ${eventType.name} (${eventType.slug}) - Error: ${error.message}`);
        }
      }
    }

  } catch (error) {
    console.error('❌ Error testing Calendly account:', error.response?.data || error.message);
  }
}

testCalendlyAccount();
