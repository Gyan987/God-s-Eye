const mongoose = require('mongoose');

const lostItemSchema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    item_name: {
      type: String,
      required: true,
      trim: true
    },
    category: {
      type: String,
      enum: ['phone', 'wallet', 'bag', 'documents', 'keys', 'pets', 'other'],
      required: true
    },
    description: {
      type: String,
      required: true
    },
    location_lost: {
      type: String,
      required: true
    },
    date_lost: {
      type: Date,
      required: true
    },
    image: {
      type: String,
      default: ''
    },
    reward: {
      type: String,
      default: ''
    },
    contact_phone: {
      type: String,
      default: ''
    },
    contact_email: {
      type: String,
      default: ''
    },
    status: {
      type: String,
      enum: ['open', 'matched', 'returned'],
      default: 'open'
    },
    flagged_fake: {
      type: Boolean,
      default: false
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('LostItem', lostItemSchema);
