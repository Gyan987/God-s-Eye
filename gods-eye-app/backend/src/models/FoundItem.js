const mongoose = require('mongoose');

const foundItemSchema = new mongoose.Schema(
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
    location_found: {
      type: String,
      required: true
    },
    date_found: {
      type: Date,
      required: true
    },
    image: {
      type: String,
      default: ''
    },
    finder_contact_email: {
      type: String,
      default: ''
    },
    finder_phone: {
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

module.exports = mongoose.model('FoundItem', foundItemSchema);
