const mongoose = require('mongoose');

const packageSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Package name is required'],
    trim: true,
    maxlength: [100, 'Package name cannot exceed 100 characters']
  },
  platform: {
    type: String,
    required: [true, 'Platform is required'],
    trim: true,
    maxlength: [50, 'Platform name cannot exceed 50 characters']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  price: {
    type: Number,
    required: [true, 'Price is required'],
    min: [0, 'Price cannot be negative']
  },
  originalPrice: {
    type: Number,
    min: [0, 'Original price cannot be negative']
  },
  currency: {
    type: String,
    default: 'USD',
    enum: ['USD', 'EUR', 'GBP', 'CAD', 'AUD']
  },
  billingPeriod: {
    type: String,
    required: [true, 'Billing period is required'],
    enum: ['monthly', 'yearly', 'one-time'],
    default: 'monthly'
  },
  discount: {
    type: Number,
    min: [0, 'Discount cannot be negative'],
    max: [100, 'Discount cannot exceed 100%']
  },
  features: [{
    type: String,
    trim: true,
    maxlength: [200, 'Feature description cannot exceed 200 characters']
  }],
  trialDays: {
    type: Number,
    default: 14,
    min: [0, 'Trial days cannot be negative']
  },
  logo: {
    type: String,
    trim: true
  },
  stripePriceId: {
    type: String,
    trim: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isPopular: {
    type: Boolean,
    default: false
  },
  sortOrder: {
    type: Number,
    default: 0
  },
  metadata: {
    type: Map,
    of: String
  },
  pricing: {
    currency: {
      type: String,
      default: 'USD'
    },
    amount: {
      type: Number,
      default: 0
    },
    discount: {
      type: String,
      default: ''
    },
    popular: {
      type: Boolean,
      default: false
    },
    trialDays: {
      type: Number,
      default: 0
    },
    monthly: {
      amount: {
        type: Number,
        required: true
      },
      discount: {
        type: String,
        default: ''
      }
    },
    quarterly: {
      amount: {
        type: Number,
        required: true
      },
      discount: {
        type: String,
        default: ''
      },
      autoCalculated: {
        type: Boolean,
        default: false
      }
    },
    yearly: {
      amount: {
        type: Number,
        required: true
      },
      discount: {
        type: String,
        default: ''
      },
      autoCalculated: {
        type: Boolean,
        default: false
      }
    }
  }
}, {
  timestamps: true
});

// Index for efficient queries
packageSchema.index({ isActive: 1, sortOrder: 1 });
packageSchema.index({ platform: 1, isActive: 1 });

// Virtual for formatted price
packageSchema.virtual('formattedPrice').get(function() {
  return `$${this.price}`;
});

// Virtual for formatted original price
packageSchema.virtual('formattedOriginalPrice').get(function() {
  return this.originalPrice ? `$${this.originalPrice}` : null;
});

// Virtual for discount percentage
packageSchema.virtual('discountPercentage').get(function() {
  if (this.originalPrice && this.originalPrice > this.price) {
    return Math.round(((this.originalPrice - this.price) / this.originalPrice) * 100);
  }
  return this.discount || 0;
});

// Ensure virtual fields are serialized
packageSchema.set('toJSON', { virtuals: true });
packageSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Package', packageSchema);