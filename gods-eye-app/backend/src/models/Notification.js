const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    title: {
      type: String,
      required: true
    },
    message: {
      type: String,
      required: true
    },
    item_type: {
      type: String,
      enum: ['lost', 'found'],
      required: true
    },
    item_id: {
      type: mongoose.Schema.Types.ObjectId,
      required: true
    },
    seen: {
      type: Boolean,
      default: false
    },
    match_count: {
      type: Number,
      default: 0
    },
    match_quality: {
      type: String,
      enum: ['excellent', 'very-good', 'good', 'moderate', 'low'],
      default: 'moderate'
    },
    action_url: {
      type: String,
      default: ''
    }
  },
  { timestamps: true }
);

// Index for efficient querying
notificationSchema.index({ user_id: 1, createdAt: -1 });
notificationSchema.index({ user_id: 1, seen: 1 });

module.exports = mongoose.model('Notification', notificationSchema);
