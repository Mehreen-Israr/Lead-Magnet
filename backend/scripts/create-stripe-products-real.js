require('dotenv').config();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

async function createStripeProducts() {
  console.log('🚀 Creating Stripe Products and Prices...\n');
  
  console.log('🔍 Environment check:');
  console.log('STRIPE_SECRET_KEY exists:', !!process.env.STRIPE_SECRET_KEY);
  console.log('STRIPE_SECRET_KEY starts with sk_:', process.env.STRIPE_SECRET_KEY?.startsWith('sk_'));
  console.log('STRIPE_SECRET_KEY length:', process.env.STRIPE_SECRET_KEY?.length);

  if (!process.env.STRIPE_SECRET_KEY) {
    console.error('❌ STRIPE_SECRET_KEY not found in environment variables');
    console.log('Available env vars:', Object.keys(process.env).filter(key => key.includes('STRIPE')));
    return;
  }

  try {
    // Test Stripe connection first
    console.log('🔍 Testing Stripe connection...');
    const account = await stripe.accounts.retrieve();
    console.log('✅ Stripe connection successful! Account:', account.id);
    
    // Create products and prices for each package
    const packages = [
      {
        name: 'Instagram Growth',
        description: 'Instagram Growth Package - Content scheduling, Hashtag optimization, Basic analytics, Email support',
        price: 35900, // $359.00 in cents
        currency: 'usd',
        interval: 'month'
      },
      {
        name: 'LinkedIn Starter', 
        description: 'LinkedIn Starter Package - 1000 leads/month, Basic analytics, Email support, Secure Payments',
        price: 35000, // $350.00 in cents
        currency: 'usd',
        interval: 'month'
      },
      {
        name: 'X Growth',
        description: 'X Growth Package - Unlimited posts, Advanced analytics, Priority support, Dedicated dashboard',
        price: 35900, // $359.00 in cents
        currency: 'usd',
        interval: 'month'
      },
      {
        name: 'Premium Service',
        description: 'Premium Service Package - Support for 5 Channels, Scalable Business Growth, Priority Support, Multi-Platform Campaign',
        price: 106000, // $1060.00 in cents
        currency: 'usd',
        interval: 'month'
      }
    ];

    const results = [];

    for (const pkg of packages) {
      console.log(`📦 Creating product: ${pkg.name}`);
      
      // Create product
      const product = await stripe.products.create({
        name: pkg.name,
        description: pkg.description,
        metadata: {
          package: pkg.name.toLowerCase().replace(/\s+/g, '_')
        }
      });

      console.log(`   ✅ Product created: ${product.id}`);

      // Create price
      const price = await stripe.prices.create({
        product: product.id,
        unit_amount: pkg.price,
        currency: pkg.currency,
        recurring: {
          interval: pkg.interval
        },
        metadata: {
          package: pkg.name.toLowerCase().replace(/\s+/g, '_')
        }
      });

      console.log(`   ✅ Price created: ${price.id}`);

      results.push({
        name: pkg.name,
        productId: product.id,
        priceId: price.id,
        amount: pkg.price / 100,
        currency: pkg.currency
      });
    }

    console.log('\n🎉 All products and prices created successfully!\n');
    console.log('📋 Update your .env file with these Price IDs:\n');
    
    results.forEach((result, index) => {
      const envVar = `STRIPE_PRICE_${result.name.toUpperCase().replace(/\s+/g, '_')}_MONTHLY`;
      console.log(`${envVar}=${result.priceId}`);
    });

    console.log('\n📋 Update your database packages with these Price IDs:\n');
    results.forEach((result) => {
      console.log(`Package: ${result.name}`);
      console.log(`Price ID: ${result.priceId}`);
      console.log(`Amount: $${result.amount} ${result.currency.toUpperCase()}`);
      console.log('');
    });

  } catch (error) {
    console.error('❌ Error creating Stripe products:', error.message);
  }
}

createStripeProducts();
