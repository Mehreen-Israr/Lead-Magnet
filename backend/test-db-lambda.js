const mongoose = require('mongoose');
const Package = require('./models/Package');
require('dotenv').config();

async function testDatabaseForLambda() {
  try {
    console.log('🔍 Testing database connection for Lambda...');
    console.log('MONGODB_URI:', process.env.MONGODB_URI ? 'Set' : 'Not set');
    
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB connected successfully');
    console.log('Connection state:', mongoose.connection.readyState);
    
    // Test fetching packages
    const packages = await Package.find({ isActive: true });
    console.log(`✅ Found ${packages.length} packages`);
    
    if (packages.length > 0) {
      console.log('📦 Sample package:', {
        name: packages[0].name,
        platform: packages[0].platform,
        isActive: packages[0].isActive
      });
    }
    
    await mongoose.disconnect();
    console.log('✅ Database test completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('❌ Database test failed:', error);
    process.exit(1);
  }
}

testDatabaseForLambda();
