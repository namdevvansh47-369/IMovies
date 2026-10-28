const mongoose = require('mongoose');

const bookingSeatSchema = new mongoose.Schema(
  {
    seatNumber: { type: String, required: true },
    row: { type: String, required: true },
    col: { type: Number, required: true },
    tier: { type: String, required: true },
    price: { type: Number, required: true }
  },
  { _id: false }
);

const bookingSchema = new mongoose.Schema(
  {
    bookingId: {
      type: String,
      required: true,
      unique: true,
      index: true
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    show: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Show',
      required: true
    },
    movie: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Movie',
      required: true
    },
    theatre: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Theatre',
      required: true
    },
    seats: [bookingSeatSchema],
    subtotal: {
      type: Number,
      required: true
    },
    convenienceFee: {
      type: Number,
      default: 40
    },
    taxAmount: {
      type: Number,
      default: 0
    },
    totalAmount: {
      type: Number,
      required: true
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'paid', 'failed', 'refunded'],
      default: 'paid'
    },
    paymentMethod: {
      type: String,
      enum: ['card', 'upi', 'netbanking', 'wallet'],
      default: 'card'
    },
    transactionId: {
      type: String,
      required: true
    },
    bookingStatus: {
      type: String,
      enum: ['confirmed', 'cancelled'],
      default: 'confirmed',
      index: true
    },
    qrCode: {
      type: String // base64 QR code image
    },
    cancellationReason: {
      type: String,
      default: ''
    },
    refundAmount: {
      type: Number,
      default: 0
    }
  },
  {
    timestamps: true
  }
);

bookingSchema.index({ user: 1, createdAt: -1 });

module.exports = mongoose.model('Booking', bookingSchema);
