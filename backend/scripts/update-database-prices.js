const mongoose = require('mongoose');
require('dotenv').config();

// Connect to MongoDB
async function connectDB() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
}

// Package schema (assuming it exists)
const PackageSchema = new mongoose.Schema({
  name: String,
  description: String,
  price: Number,
  originalPrice: Number,
  discount: String,
  features: [String],
  stripePriceId: String,
  isPopular: Boolean,
  trialDays: Number,
  logo: String
});

const Package = mongoose.model('Package', PackageSchema);

async function updateDatabasePrices() {
  await connectDB();

  const priceUpdates = [
    {
      name: 'Instagram Growth',
      stripePriceId: 'price_1SCyF7ImmPMv5c50wRlstWJB'
    },
    {
      name: 'LinkedIn Starter', 
      stripePriceId: 'price_1SCyF8ImmPMv5c50UYCXgBUv'
    },
    {
      name: 'X Growth',
      stripePriceId: 'price_1SCyF9ImmPMv5c50pHD1Fh6Y'
    },
    {
      name: 'Premium service',
      stripePriceId: 'price_1SCyFAImmPMv5c50OywtE6PN'
    }
  ];

  console.log('🔄 Updating database packages with real Stripe Price IDs...\n');

  for (const update of priceUpdates) {
    try {
      const result = await Package.updateOne(
        { name: update.name },
        { $set: { stripePriceId: update.stripePriceId } }
      );

      if (result.matchedCount > 0) {
        console.log(`✅ Updated ${update.name}: ${update.stripePriceId}`);
      } else {
        console.log(`⚠️  Package not found: ${update.name}`);
      }
    } catch (error) {
      console.error(`❌ Error updating ${update.name}:`, error.message);
    }
  }

  console.log('\n🎉 Database update complete!');
  console.log('\n📋 Summary:');
  console.log('- Instagram Growth: price_1SCyF7ImmPMv5c50wRlstWJB');
  console.log('- LinkedIn Starter: price_1SCyF8ImmPMv5c50UYCXgBUv');
  console.log('- X Growth: price_1SCyF9ImmPMv5c50pHD1Fh6Y');
  console.log('- Premium service: price_1SCyFAImmPMv5c50OywtE6PN');

  await mongoose.disconnect();
  console.log('\n✅ Disconnected from MongoDB');
}

updateDatabasePrices();
