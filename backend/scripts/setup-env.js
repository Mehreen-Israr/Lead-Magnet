const fs = require('fs');
const path = require('path');

console.log('🔧 Calendly Environment Setup\n');

const envPath = path.join(__dirname, '..', '.env');

// Check if .env file exists
if (!fs.existsSync(envPath)) {
  console.log('❌ .env file not found!');
  console.log('📝 Creating .env file...');
  
  const envContent = `# Calendly Configuration
CALENDLY_API_TOKEN=your_calendly_api_token_here
CALENDLY_WEBHOOK_SECRET=your_webhook_secret_here
WEBHOOK_URL=https://leadmagnet-backend.onrender.com/api/calendly/webhook

# Email Configuration
EMAIL_HOST=your_smtp_host
EMAIL_PORT=587
EMAIL_USER=your_email_user
EMAIL_PASS=your_email_password
EMAIL_FROM=noreply@yourdomain.com
ADMIN_EMAIL=admin@yourdomain.com

# Database
MONGODB_URI=your_mongodb_connection_string

# Other Configuration
NODE_ENV=development
PORT=5000
`;

  fs.writeFileSync(envPath, envContent);
  console.log('✅ .env file created!');
} else {
  console.log('✅ .env file exists');
}

console.log('\n📋 Next Steps:');
console.log('1. Open backend/.env file');
console.log('2. Replace placeholder values with your actual credentials:');
console.log('   - Get CALENDLY_API_TOKEN from Calendly settings');
console.log('   - Get CALENDLY_WEBHOOK_SECRET from Calendly webhook settings');
console.log('   - Set your email configuration');
console.log('   - Set your MongoDB connection string');
console.log('3. Run: node scripts/test-calendly-setup.js');
console.log('4. Run: node scripts/setup-webhook-proper.js');

console.log('\n🔗 Calendly Setup Links:');
console.log('- API Tokens: https://calendly.com/integrations/api_webhooks');
console.log('- Webhook Settings: https://calendly.com/integrations/api_webhooks');
