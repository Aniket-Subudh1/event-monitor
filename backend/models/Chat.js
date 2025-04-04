const mongoose = require('mongoose');

const ChatMessageSchema = new mongoose.Schema({
  event: {
    type: mongoose.Schema.ObjectId,
    ref: 'Event',
    required: true
  },
  user: {
    type: String,
    required: true
  },
  userId: {
    type: String,
    default: null
  },
  message: {
    type: String,
    required: true
  },
  sentiment: {
    type: String,
    enum: ['positive', 'neutral', 'negative', null],
    default: null
  },
  sentimentScore: {
    type: Number,
    default: null
  },
  isProcessed: {
    type: Boolean,
    default: false
  },
  metadata: {
    platform: {
      type: String,
      default: 'web'
    },
    userAgent: String,
    ipAddress: String
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

ChatMessageSchema.index({ event: 1, createdAt: -1 });
ChatMessageSchema.index({ event: 1, user: 1 });
ChatMessageSchema.index({ event: 1, sentiment: 1 });

module.exports = mongoose.model('ChatMessage', ChatMessageSchema);