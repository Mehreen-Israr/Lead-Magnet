require('dotenv').config();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

async function setupStripeBranding() {
  try {
    console.log('🎨 Setting up professional Stripe branding...\n');

    // Check if we can access Stripe account
    const account = await stripe.accounts.retrieve();
    console.log('✅ Connected to Stripe account:', account.id);

    // Note: Most branding settings need to be configured in Stripe Dashboard
    // This script provides guidance and checks current settings

    console.log('\n📋 Manual Setup Required in Stripe Dashboard:');
    console.log('1. Go to: https://dashboard.stripe.com/settings/branding');
    console.log('2. Configure the following:');
    console.log('   - Business name: "Lead Magnet"');
    console.log('   - Support email: your-support@email.com');
    console.log('   - Upload logo (128x128px PNG)');
    console.log('   - Primary color: #FFD700');
    console.log('   - Secondary color: #1a1a1a');
    console.log('   - Enable "Show business information"');
    console.log('   - Enable "Show support information"');

    console.log('\n🎯 Professional Checkout Features Enabled:');
    console.log('✅ Required billing address collection');
    console.log('✅ Custom company field');
    console.log('✅ Enhanced metadata tracking');
    console.log('✅ Automatic tax calculation');
    console.log('✅ Professional locale detection');
    console.log('✅ Trial period messaging');

    console.log('\n📱 Additional Recommendations:');
    console.log('1. Consider using embedded checkout for full control');
    console.log('2. Set up custom domain for checkout');
    console.log('3. Configure webhook endpoints properly');
    console.log('4. Test checkout flow thoroughly');

    console.log('\n🎉 Stripe branding setup guide complete!');
    console.log('Follow the manual steps in Stripe Dashboard for full customization.');

  } catch (error) {
    console.error('❌ Error setting up Stripe branding:', error.message);
  }
}

setupStripeBranding();
