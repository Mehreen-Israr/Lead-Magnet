require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');

async function testSubscriptionWebhook() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Find a user with a subscription
    const user = await User.findOne({ 
      'subscription.stripeCustomerId': { $exists: true } 
    });

    if (!user) {
      console.log('❌ No user found with subscription data');
      return;
    }

    console.log('👤 Found user:', user.email);
    console.log('📊 Current subscription data:');
    console.log(JSON.stringify(user.subscription, null, 2));

    // Test the subscription retrieval endpoint logic
    if (user.subscription && user.subscription.stripeSubscriptionId && user.subscription.status === 'active') {
      console.log('✅ User has active subscription');
      console.log(`📦 Package: ${user.subscription.packageName || 'Unknown'}`);
      console.log(`📅 Status: ${user.subscription.status}`);
      console.log(`🆔 Subscription ID: ${user.subscription.stripeSubscriptionId}`);
    } else {
      console.log('❌ User does not have active subscription');
      console.log('Subscription data:', user.subscription);
    }

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('✅ Disconnected from MongoDB');
  }
}

testSubscriptionWebhook();
