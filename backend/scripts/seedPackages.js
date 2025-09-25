const mongoose = require('mongoose');
const Package = require('../models/Package');
require('dotenv').config();

const packages = [
  {
    name: "Instagram Growth",
    platform: "Instagram",
    pricing: {
      monthly: {
        price: 359,
        originalPrice: 599,
        stripePriceId: process.env.STRIPE_PRICE_INSTAGRAM_OUTREACH_MONTHLY || 'price_instagram_monthly'
      },
      quarterly: {
        price: 1000,
        originalPrice: 1700,
        stripePriceId: process.env.STRIPE_PRICE_INSTAGRAM_OUTREACH_QUARTERLY || 'price_instagram_quarterly'
      },
      yearly: {
        price: 3800,
        originalPrice: 6500,
        stripePriceId: process.env.STRIPE_PRICE_INSTAGRAM_OUTREACH_YEARLY || 'price_instagram_yearly'
      }
    },
    discount: "40% OFF",
    popular: false,
    trialDays: 14,
    features: [
      "Content scheduling",
      "Hashtag optimization",
      "Basic analytics",
      "Email support"
    ],
    logo: "/instagram.png",
    description: "The user connects with their ideal audience on Instagram through targeted outreach and engagement strategies.",
    isActive: true,
    sortOrder: 1
  },
  {
    name: "LinkedIn Starter",
    platform: "LinkedIn",
    pricing: {
      monthly: {
        price: 299,
        originalPrice: 499,
        stripePriceId: process.env.STRIPE_PRICE_LINKEDIN_STARTER_MONTHLY || 'price_linkedin_monthly'
      },
      quarterly: {
        price: 850,
        originalPrice: 1400,
        stripePriceId: process.env.STRIPE_PRICE_LINKEDIN_STARTER_QUARTERLY || 'price_linkedin_quarterly'
      },
      yearly: {
        price: 3200,
        originalPrice: 5400,
        stripePriceId: process.env.STRIPE_PRICE_LINKEDIN_STARTER_YEARLY || 'price_linkedin_yearly'
      }
    },
    discount: "40% OFF",
    popular: false,
    trialDays: 14,
    features: [
      "1000 leads/month",
      "Basic analytics",
      "Email support",
      "Secure Payments"
    ],
    logo: "/linkedin.png",
    description: "Professional networking at scale to connect with decision-makers and industry leaders on the world's largest professional platform.",
    isActive: true,
    sortOrder: 2
  },
  {
    name: "X Growth",
    platform: "Twitter/X",
    pricing: {
      monthly: {
        price: 279,
        originalPrice: 599,
        stripePriceId: process.env.STRIPE_PRICE_TWITTER_GROWTH_MONTHLY || 'price_twitter_monthly'
      },
      quarterly: {
        price: 800,
        originalPrice: 1700,
        stripePriceId: process.env.STRIPE_PRICE_TWITTER_GROWTH_QUARTERLY || 'price_twitter_quarterly'
      },
      yearly: {
        price: 3000,
        originalPrice: 6500,
        stripePriceId: process.env.STRIPE_PRICE_TWITTER_GROWTH_YEARLY || 'price_twitter_yearly'
      }
    },
    discount: "40% OFF",
    popular: false,
    trialDays: 14,
    features: [
      "Unlimited posts",
      "Advanced analytics",
      "Priority support",
      "Dedicated dashboard"
    ],
    logo: "/twitter.png",
    description: "Harness the power of real-time conversations on X (Twitter) to engage with prospects and build your brand presence.",
    isActive: true,
    sortOrder: 3
  },
  {
    name: "Premium Service",
    platform: "Multi-Platform",
    pricing: {
      monthly: {
        price: 1060,
        originalPrice: 1697,
        stripePriceId: process.env.STRIPE_PRICE_PREMIUM_SERVICE_MONTHLY || 'price_premium_monthly'
      },
      quarterly: {
        price: 3000,
        originalPrice: 4800,
        stripePriceId: process.env.STRIPE_PRICE_PREMIUM_SERVICE_QUARTERLY || 'price_premium_quarterly'
      },
      yearly: {
        price: 11500,
        originalPrice: 18500,
        stripePriceId: process.env.STRIPE_PRICE_PREMIUM_SERVICE_YEARLY || 'price_premium_yearly'
      }
    },
    discount: "60% OFF",
    popular: true,
    trialDays: 14,
    features: [
      "Support for 5 Channels",
      "Scalable Business Growth",
      "Priority Support",
      "Multi-Platform Campaign",
      "Advanced Automation workflows",
      "Access to advanced analytics and reporting"
    ],
    logo: "/premium.png",
    description: "Comprehensive multi-platform solution for businesses looking to scale across all social media channels.",
    isActive: true,
    sortOrder: 4
  }
];

async function seedPackages() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');
    
    // Clear existing packages
    await Package.deleteMany({});
    console.log('Cleared existing packages');
    
    // Insert new packages
    const createdPackages = await Package.insertMany(packages);
    console.log(`Created ${createdPackages.length} packages`);
    
    console.log('Packages seeded successfully!');
    console.log('\nCreated packages:');
    createdPackages.forEach(pkg => {
      console.log(`- ${pkg.name} (${pkg.platform}) - $${pkg.pricing.monthly.price}/month`);
    });
    
    process.exit(0);
  } catch (error) {
    console.error('Error seeding packages:', error);
    process.exit(1);
  }
}

seedPackages();