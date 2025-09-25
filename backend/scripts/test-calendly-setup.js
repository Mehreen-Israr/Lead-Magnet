require('dotenv').config();

console.log('🧪 Testing Calendly Setup\n');

// Check environment variables
console.log('1. Environment Variables:');
const requiredVars = [
  'CALENDLY_API_TOKEN',
  'CALENDLY_WEBHOOK_SECRET', 
  'WEBHOOK_URL',
  'MONGODB_URI',
  'EMAIL_HOST',
  'EMAIL_USER',
  'EMAIL_FROM'
];

let allSet = true;
requiredVars.forEach(varName => {
  const value = process.env[varName];
  if (value && value !== 'your_value_here' && value !== 'your_calendly_api_token_here') {
    console.log(`✅ ${varName}: ${value.substring(0, 10)}...`);
  } else {
    console.log(`❌ ${varName}: Not set or using placeholder`);
    allSet = false;
  }
});

if (!allSet) {
  console.log('\n❌ Missing or invalid environment variables!');
  console.log('\n📝 Please update your .env file with:');
  console.log('CALENDLY_API_TOKEN=your_actual_token_here');
  console.log('CALENDLY_WEBHOOK_SECRET=your_actual_secret_here');
  console.log('WEBHOOK_URL=https://leadmagnet-backend.onrender.com/api/calendly/webhook');
  console.log('EMAIL_HOST=your_smtp_host');
  console.log('EMAIL_USER=your_email_user');
  console.log('EMAIL_PASS=your_email_password');
  console.log('EMAIL_FROM=noreply@yourdomain.com');
  console.log('ADMIN_EMAIL=admin@yourdomain.com');
  process.exit(1);
}

console.log('\n✅ All environment variables are set!');

// Test webhook URL format
console.log('\n2. Webhook URL Check:');
const webhookUrl = process.env.WEBHOOK_URL;
if (webhookUrl.includes('localhost')) {
  console.log('⚠️  Warning: Using localhost URL. This won\'t work for Calendly webhooks!');
  console.log('   Calendly needs a publicly accessible URL.');
  console.log('   Use: https://leadmagnet-backend.onrender.com/api/calendly/webhook');
} else if (webhookUrl.includes('leadmagnet-backend.onrender.com')) {
  console.log('✅ Using production webhook URL');
} else {
  console.log('✅ Using custom webhook URL');
}

console.log('\n3. Next Steps:');
console.log('1. Make sure your backend is deployed to Render');
console.log('2. Test webhook endpoint: node scripts/test-webhook.js');
console.log('3. Register webhook: node scripts/setup-webhook-proper.js');
console.log('4. Test booking flow: node scripts/test-booking-flow.js');

console.log('\n🎯 Your webhook URL should be:');
console.log(`   ${webhookUrl}`);
console.log('\n📋 Make sure this URL is accessible from the internet!');
