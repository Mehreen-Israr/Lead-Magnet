const mongoose = require('mongoose');
const Package = require('../models/Package');
require('dotenv').config();

const samplePackages = [
  {
    name: "Instagram Growth",
    platform: "Instagram",
    description: "Grow your Instagram presence with targeted outreach and engagement strategies",
    price: 359,
    originalPrice: 599,
    currency: "USD",
    billingPeriod: "monthly",
    discount: 40,
    features: [
      "Content scheduling",
      "Hashtag optimization", 
      "Basic analytics",
      "Email support"
    ],
    trialDays: 14,
    logo: "/instagram.png",
    stripePriceId: process.env.STRIPE_PRICE_INSTAGRAM_MONTHLY || "price_instagram_monthly",
    isActive: true,
    isPopular: false,
    sortOrder: 1
  },
  {
    name: "LinkedIn Starter",
    platform: "LinkedIn", 
    description: "Professional networking at scale to connect with decision-makers",
    price: 299,
    originalPrice: 499,
    currency: "USD",
    billingPeriod: "monthly",
    discount: 40,
    features: [
      "1000 leads/month",
      "Basic analytics",
      "Email support",
      "Secure Payments"
    ],
    trialDays: 14,
    logo: "/linkedin.png",
    stripePriceId: process.env.STRIPE_PRICE_LINKEDIN_MONTHLY || "price_linkedin_monthly",
    isActive: true,
    isPopular: false,
    sortOrder: 2
  },
  {
    name: "X Growth",
    platform: "Twitter/X",
    description: "Harness the power of real-time conversations on X (Twitter)",
    price: 359,
    originalPrice: 599,
    currency: "USD", 
    billingPeriod: "monthly",
    discount: 40,
    features: [
      "Unlimited posts",
      "Advanced analytics",
      "Priority support", 
      "Dedicated dashboard"
    ],
    trialDays: 14,
    logo: "/twitter.png",
    stripePriceId: process.env.STRIPE_PRICE_X_MONTHLY || "price_x_monthly",
    isActive: true,
    isPopular: false,
    sortOrder: 3
  },
  {
    name: "Premium Service",
    platform: "All Platforms",
    description: "Complete multi-platform solution for maximum reach and growth",
    price: 1060,
    originalPrice: 1697,
    currency: "USD",
    billingPeriod: "monthly", 
    discount: 60,
    features: [
      "Support for 5 Channels",
      "Scalable Business Growth",
      "Priority Support",
      "Multi-Platform Campaign"
    ],
    trialDays: 14,
    logo: "/premium.png",
    stripePriceId: process.env.STRIPE_PRICE_PREMIUM_MONTHLY || "price_premium_monthly",
    isActive: true,
    isPopular: true,
    sortOrder: 4
  },
  {
    name: "Facebook Pro",
    platform: "Facebook",
    description: "Advanced Facebook advertising and engagement strategies",
    price: 449,
    originalPrice: 699,
    currency: "USD",
    billingPeriod: "monthly",
    discount: 35,
    features: [
      "Advanced targeting",
      "Campaign optimization", 
      "Detailed analytics",
      "24/7 Support"
    ],
    trialDays: 14,
    logo: "/logo192.png",
    stripePriceId: process.env.STRIPE_PRICE_FACEBOOK_MONTHLY || "price_facebook_monthly",
    isActive: true,
    isPopular: false,
    sortOrder: 5
  },
  {
    name: "Enterprise Suite",
    platform: "All Platforms",
    description: "Complete enterprise solution with unlimited everything",
    price: 2499,
    originalPrice: 3999,
    currency: "USD",
    billingPeriod: "monthly",
    discount: 37,
    features: [
      "Unlimited everything",
      "Custom integrations",
      "Dedicated manager", 
      "White-label solution"
    ],
    trialDays: 30,
    logo: "/premium.png",
    stripePriceId: process.env.STRIPE_PRICE_ENTERPRISE_MONTHLY || "price_enterprise_monthly",
    isActive: true,
    isPopular: false,
    sortOrder: 6
  }
];

async function seedPackages() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/leadmagnet');
    console.log('✅ Connected to MongoDB');

    // Clear existing packages
    await Package.deleteMany({});
    console.log('🗑️ Cleared existing packages');

    // Insert sample packages
    const createdPackages = await Package.insertMany(samplePackages);
    console.log(`✅ Created ${createdPackages.length} packages`);

    // Display created packages
    createdPackages.forEach(pkg => {
      console.log(`- ${pkg.name} (${pkg.platform}): $${pkg.price}/${pkg.billingPeriod}`);
    });

    console.log('🎉 Database seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
}

// Run the seeding function
seedPackages();
