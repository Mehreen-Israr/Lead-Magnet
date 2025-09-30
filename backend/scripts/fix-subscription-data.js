require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const Package = require('../models/Package');

async function fixSubscriptionData() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Find users with incomplete subscription data
    const usersWithIncompleteSubs = await User.find({
      'subscription.plan': { $ne: 'free' },
      'subscription.stripeSubscriptionId': { $exists: false }
    });

    console.log(`🔍 Found ${usersWithIncompleteSubs.length} users with incomplete subscription data`);

    for (const user of usersWithIncompleteSubs) {
      console.log(`\n👤 Processing user: ${user.email}`);
      console.log('Current subscription:', user.subscription);

      // Try to find a matching package based on plan name
      let packageData = null;
      
      // Convert plan name to package name format
      const planToPackageMap = {
        'instagram_growth': 'Instagram Growth',
        'linkedin_starter': 'LinkedIn Starter', 
        'x_growth': 'X Growth',
        'twitter_growth': 'X Growth',
        'premium_service': 'Premium Service'
      };

      const packageName = planToPackageMap[user.subscription.plan] || user.subscription.plan;
      packageData = await Package.findOne({ name: packageName });

      if (packageData) {
        console.log(`📦 Found package: ${packageData.name}`);
        console.log(`💰 Price ID: ${packageData.stripePriceId}`);

        // Update user subscription with complete data
        const now = new Date();
        const trialEnd = new Date(now);
        trialEnd.setDate(now.getDate() + 14); // 14-day trial

        const currentPeriodEnd = new Date(now);
        currentPeriodEnd.setMonth(now.getMonth() + 1); // 1 month subscription

        user.subscription = {
          ...user.subscription,
          packageName: packageData.name,
          stripePriceId: packageData.stripePriceId,
          stripeSubscriptionId: `sub_fixed_${Date.now()}_${user._id}`, // Generate a fixed ID
          currentPeriodStart: now,
          currentPeriodEnd: currentPeriodEnd,
          trialStart: now,
          trialEnd: trialEnd,
          cancelAtPeriodEnd: false,
          updatedAt: now
        };

        await user.save();
        console.log(`✅ Updated subscription for ${user.email}`);
        console.log('New subscription data:', user.subscription);
      } else {
        console.log(`❌ No package found for plan: ${user.subscription.plan}`);
      }
    }

    console.log('\n🎉 Subscription data fix complete!');

  } catch (error) {
    console.error('❌ Error fixing subscription data:', error);
  } finally {
    await mongoose.disconnect();
    console.log('✅ Disconnected from MongoDB');
  }
}

fixSubscriptionData();
