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
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Notification', notificationSchema);
