require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const Package = require('../models/Package');

async function manualSubscriptionUpdate() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Find the user
    const user = await User.findOne({ email: 'anna@gmail.com' });
    if (!user) {
      console.log('❌ User not found');
      return;
    }

    console.log('👤 Found user:', user.email);

    // Get the Instagram Growth package (since that's what they subscribed to)
    const packageData = await Package.findOne({ name: 'Instagram Growth' });
    if (!packageData) {
      console.log('❌ Instagram Growth package not found');
      return;
    }

    console.log('📦 Found package:', packageData.name);
    console.log('💰 Price ID:', packageData.stripePriceId);

    // Update user subscription manually
    user.subscription = {
      ...user.subscription,
      plan: 'instagram_growth',
      packageName: 'Instagram Growth',
      status: 'active',
      stripeSubscriptionId: 'sub_manual_update_' + Date.now(), // Temporary ID
      stripePriceId: packageData.stripePriceId,
      currentPeriodStart: new Date(),
      currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
      trialStart: new Date(),
      trialEnd: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days trial
      cancelAtPeriodEnd: false,
      updatedAt: new Date()
    };

    await user.save();
    console.log('✅ User subscription updated manually');
    console.log('📊 New subscription data:');
    console.log(JSON.stringify(user.subscription, null, 2));

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('✅ Disconnected from MongoDB');
  }
}

manualSubscriptionUpdate();
