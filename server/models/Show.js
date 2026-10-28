const mongoose = require('mongoose');

const seatSchema = new mongoose.Schema(
  {
    seatNumber: {
      type: String,
      required: true
    },
    row: {
      type: String,
      required: true
    },
    col: {
      type: Number,
      required: true
    },
    tier: {
      type: String,
      enum: ['silver', 'gold', 'platinum'],
      required: true
    },
    price: {
      type: Number,
      required: true
    },
    status: {
      type: String,
      enum: ['available', 'locked', 'booked'],
      default: 'available'
    },
    lockedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    },
    lockedUntil: {
      type: Date,
      default: null
    },
    bookedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    }
  },
  { _id: false }
);

const showSchema = new mongoose.Schema(
  {
    movie: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Movie',
      required: [true, 'Movie reference is required'],
      index: true
    },
    theatre: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Theatre',
      required: [true, 'Theatre reference is required'],
      index: true
    },
    screenName: {
      type: String,
      required: true,
      default: 'Audi 1'
    },
    showDateTime: {
      type: Date,
      required: [true, 'Show date and time are required'],
      index: true
    },
    format: {
      type: String,
      enum: ['2D', '3D', 'IMAX 2D', 'IMAX 3D', '4DX', 'Dolby Cinema'],
      default: 'IMAX 3D'
    },
    language: {
      type: String,
      default: 'English'
    },
    priceTiers: {
      silver: {
        type: Number,
        default: 200
      },
      gold: {
        type: Number,
        default: 320
      },
      platinum: {
        type: Number,
        default: 480
      }
    },
    seats: [seatSchema],
    totalSeats: {
      type: Number,
      default: 0
    },
    availableSeatsCount: {
      type: Number,
      default: 0
    },
    status: {
      type: String,
      enum: ['scheduled', 'housefull', 'completed', 'cancelled'],
      default: 'scheduled'
    }
  },
  {
    timestamps: true
  }
);

showSchema.index({ movie: 1, showDateTime: 1 });
showSchema.index({ theatre: 1, showDateTime: 1 });

module.exports = mongoose.model('Show', showSchema);
