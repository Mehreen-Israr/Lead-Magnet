const mongoose = require('mongoose');

const packageSchema = new mongoose.Schema({
  // Basic package information
  name: {
    type: String,
    required: true,
    trim: true
  },
  platform: {
    type: String,
    required: true,
    enum: ['Instagram', 'LinkedIn', 'Twitter/X', 'Multi-Platform', 'All Platforms']
  },
  
  // Pricing information
  pricing: {
    monthly: {
      price: { type: Number, required: true },
      originalPrice: { type: Number },
      stripePriceId: { type: String, required: true }
    },
    quarterly: {
      price: { type: Number },
      originalPrice: { type: Number },
      stripePriceId: { type: String }
    },
    yearly: {
      price: { type: Number },
      originalPrice: { type: Number },
      stripePriceId: { type: String }
    }
  },
  
  currency: {
    type: String,
    default: 'USD'
  },
  
  // Display information
  discount: {
    type: String // e.g., "40% OFF", "60% OFF"
  },
  popular: {
    type: Boolean,
    default: false
  },
  
  // Trial information
  trialDays: {
    type: Number,
    default: 14
  },
  
  // Features list
  features: [{
    type: String,
    required: true
  }],
  
  // Visual elements
  logo: {
    type: String, // Path to logo image
    required: true
  },
  description: {
    type: String,
    required: true
  },
  
  // Stripe integration
  stripeProductId: {
    type: String
  },
  
  // Package status and ordering
  isActive: {
    type: Boolean,
    default: true
  },
  sortOrder: {
    type: Number,
    default: 0
  },
  
  // Admin metadata
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

// Indexes for efficient queries
packageSchema.index({ platform: 1, isActive: 1 });
packageSchema.index({ popular: -1, sortOrder: 1 });
packageSchema.index({ 'pricing.monthly.stripePriceId': 1 });
packageSchema.index({ 'pricing.quarterly.stripePriceId': 1 });
packageSchema.index({ 'pricing.yearly.stripePriceId': 1 });

// Virtual for formatted price display
packageSchema.virtual('monthlyFormattedPrice').get(function() {
  return `$${this.pricing.monthly.price}`;
});

// Virtual for discount calculation
packageSchema.virtual('monthlyDiscountPercentage').get(function() {
  const monthly = this.pricing.monthly;
  if (monthly.originalPrice && monthly.originalPrice > monthly.price) {
    return Math.round(((monthly.originalPrice - monthly.price) / monthly.originalPrice) * 100);
  }
  return 0;
});

// Static method to get active packages
packageSchema.statics.getActivePackages = function() {
  return this.find({ isActive: true }).sort({ popular: -1, sortOrder: 1 });
};

// Static method to get packages by platform
packageSchema.statics.getByPlatform = function(platform) {
  return this.find({ platform, isActive: true }).sort({ sortOrder: 1 });
};

// Static method to find by Stripe Price ID
packageSchema.statics.findByStripePriceId = function(priceId) {
  return this.findOne({
    $or: [
      { 'pricing.monthly.stripePriceId': priceId },
      { 'pricing.quarterly.stripePriceId': priceId },
      { 'pricing.yearly.stripePriceId': priceId }
    ]
  });
};

// Instance method to get pricing for specific billing cycle
packageSchema.methods.getPricing = function(billingCycle = 'monthly') {
  return this.pricing[billingCycle] || this.pricing.monthly;
};

// Instance method to check if package has discount for specific billing cycle
packageSchema.methods.hasDiscount = function(billingCycle = 'monthly') {
  const pricing = this.getPricing(billingCycle);
  return pricing.originalPrice && pricing.originalPrice > pricing.price;
};

// Instance method to get all available billing cycles
packageSchema.methods.getAvailableBillingCycles = function() {
  const cycles = [];
  if (this.pricing.monthly && this.pricing.monthly.stripePriceId) cycles.push('monthly');
  if (this.pricing.quarterly && this.pricing.quarterly.stripePriceId) cycles.push('quarterly');
  if (this.pricing.yearly && this.pricing.yearly.stripePriceId) cycles.push('yearly');
  return cycles;
};

module.exports = mongoose.model('Package', packageSchema);