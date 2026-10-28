const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema(
  {
    booking: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Booking',
      required: true,
      index: true
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    amount: {
      type: Number,
      required: true
    },
    currency: {
      type: String,
      default: 'INR'
    },
    paymentMethod: {
      type: String,
      enum: ['card', 'upi', 'netbanking', 'wallet'],
      required: true
    },
    transactionId: {
      type: String,
      required: true,
      unique: true,
      index: true
    },
    status: {
      type: String,
      enum: ['success', 'failed', 'refunded'],
      default: 'success'
    },
    paymentDetails: {
      cardLast4: String,
      upiId: String,
      bankName: String
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Payment', paymentSchema);
