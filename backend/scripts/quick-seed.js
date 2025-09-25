const mongoose = require('mongoose');
const Package = require('../models/Package');

// Simple packages for testing
const testPackages = [
  {
    name: "Instagram Growth",
    platform: "Instagram",
    price: 359,
    originalPrice: 599,
    billingPeriod: "monthly",
    features: ["Content scheduling", "Hashtag optimization", "Basic analytics", "Email support"],
    trialDays: 14,
    logo: "/instagram.png",
    isActive: true,
    isPopular: false
  },
  {
    name: "LinkedIn Starter", 
    platform: "LinkedIn",
    price: 299,
    originalPrice: 499,
    billingPeriod: "monthly",
    features: ["1000 leads/month", "Basic analytics", "Email support", "Secure Payments"],
    trialDays: 14,
    logo: "/linkedin.png",
    isActive: true,
    isPopular: false
  },
  {
    name: "Premium Service",
    platform: "All Platforms", 
    price: 1060,
    originalPrice: 1697,
    billingPeriod: "monthly",
    features: ["Support for 5 Channels", "Scalable Business Growth", "Priority Support", "Multi-Platform Campaign"],
    trialDays: 14,
    logo: "/premium.png",
    isActive: true,
    isPopular: true
  }
];

async function quickSeed() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/leadmagnet');
    console.log('✅ Connected to MongoDB');
    
    // Clear and insert
    await Package.deleteMany({});
    await Package.insertMany(testPackages);
    console.log('✅ Seeded 3 test packages');
    
    // Verify
    const count = await Package.countDocuments();
    console.log(`📦 Total packages in database: ${count}`);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

quickSeed();
