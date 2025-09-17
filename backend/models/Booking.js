const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  // Calendly Event Data
  calendlyEventId: {
    type: String,
    required: true,
    unique: true
  },
  calendlyEventUri: {
    type: String,
    required: true
  },
  
  // Meeting Details
  meetingType: {
    type: String,
    enum: ['demo', 'consultation', 'strategy'],
    required: true
  },
  meetingTitle: {
    type: String,
    required: true
  },
  scheduledTime: {
    type: Date,
    required: true
  },
  duration: {
    type: Number, // in minutes
    required: true
  },
  timezone: {
    type: String,
    required: true
  },
  
  // Attendee Information
  attendee: {
    name: {
      type: String,
      required: true
    },
    email: {
      type: String,
      required: true,
      lowercase: true
    },
    phone: String,
    company: String,
    notes: String
  },
  
  // Meeting Status
  status: {
    type: String,
    enum: ['scheduled', 'completed', 'cancelled', 'no_show'],
    default: 'scheduled'
  },
  
  // Additional Data
  meetingUrl: String,
  joinUrl: String,
  rescheduleUrl: String,
  cancelUrl: String,
  
  // UTM Tracking
  utm: {
    source: String,
    medium: String,
    campaign: String,
    term: String,
    content: String
  },
  
  // Internal Tracking
  leadSource: {
    type: String,
    default: 'contact_page'
  },
  followUpSent: {
    type: Boolean,
    default: false
  },
  reminderSent: {
    type: Boolean,
    default: false
  },
  
  // Metadata
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the updatedAt field before saving
bookingSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Indexes for better query performance
bookingSchema.index({ calendlyEventId: 1 });
bookingSchema.index({ 'attendee.email': 1 });
bookingSchema.index({ scheduledTime: 1 });
bookingSchema.index({ status: 1 });
bookingSchema.index({ meetingType: 1 });
bookingSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Booking', bookingSchema);