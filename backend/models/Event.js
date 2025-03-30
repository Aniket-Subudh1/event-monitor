const mongoose = require('mongoose');

const EventSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add an event name'],
    trim: true,
    maxlength: [100, 'Name cannot be more than 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Please add a description'],
    maxlength: [500, 'Description cannot be more than 500 characters']
  },
  startDate: {
    type: Date,
    required: [true, 'Please add a start date']
  },
  endDate: {
    type: Date,
    required: [true, 'Please add an end date']
  },
  location: {
    type: String,
    required: [true, 'Please add a location']
  },
  owner: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  },
  organizers: [{
    type: mongoose.Schema.ObjectId,
    ref: 'User'
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  socialTracking: {
    hashtags: [String],
    mentions: [String],
    keywords: [String]
  },
  locationMap: {
    areas: [{
      name: String,
      description: String,
      keywords: [String] 
    }]
  },
  alertSettings: {
    negativeSentimentThreshold: {
      type: Number,
      default: -0.5, 
      min: -1,
      max: 0
    },
    issueAlertThreshold: {
      type: Number,
      default: 3,
      min: 1
    },
    autoResolveTime: {
      type: Number,
      default: 60, 
      min: 5
    }
  },
  integrations: {
    twitter: {
      enabled: { type: Boolean, default: true }
    },
    instagram: {
      enabled: { type: Boolean, default: false }
    },
    linkedin: {
      enabled: { type: Boolean, default: false }
    }
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

EventSchema.index({ owner: 1 });
EventSchema.index({ startDate: 1, endDate: 1 });
EventSchema.index({ isActive: 1 });

EventSchema.pre('save', function(next) {
  if (this.startDate > this.endDate) {
    return next(new Error('End date must be after start date'));
  }
  next();
});

module.exports = mongoose.model('Event', EventSchema);