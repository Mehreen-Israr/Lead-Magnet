const mongoose = require('mongoose');
const Package = require('./models/Package');

async function testPackages() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/leadmagnet');
    console.log('✅ Connected to MongoDB');
    
    const packages = await Package.find({ isActive: true });
    console.log('📦 Found packages:', packages.length);
    
    if (packages.length === 0) {
      console.log('⚠️ No packages found. Run: node scripts/quick-seed.js');
    } else {
      packages.forEach(pkg => {
        console.log(`- ${pkg.name} (${pkg.platform}): $${pkg.price}/${pkg.billingPeriod}`);
      });
    }
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

testPackages();
