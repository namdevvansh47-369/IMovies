const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    title: {
      type: String,
      required: true
    },
    message: {
      type: String,
      required: true
    },
    type: {
      type: String,
      enum: ['booking', 'cancellation', 'reminder', 'promotion', 'system'],
      default: 'system'
    },
    read: {
      type: Boolean,
      default: false
    },
    metadata: {
      type: Object,
      default: {}
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Notification', notificationSchema);
