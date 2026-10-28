const mongoose = require('mongoose');

const theatreSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Theatre name is required'],
      trim: true,
      index: true
    },
    city: {
      type: String,
      required: [true, 'City is required'],
      trim: true,
      index: true
    },
    location: {
      type: String,
      required: [true, 'Location area is required'],
      trim: true
    },
    address: {
      type: String,
      required: [true, 'Address is required']
    },
    screens: [
      {
        screenId: {
          type: String,
          default: () => new mongoose.Types.ObjectId().toString()
        },
        name: {
          type: String,
          required: true,
          default: 'Audi 1'
        },
        soundSystem: {
          type: String,
          default: 'Dolby Atmos 7.1'
        },
        displayType: {
          type: String,
          default: 'IMAX with Laser 4K'
        },
        rows: {
          type: Number,
          default: 8
        },
        cols: {
          type: Number,
          default: 12
        },
        totalSeats: {
          type: Number,
          default: 96
        }
      }
    ],
    amenities: {
      type: [String],
      default: ['Dolby Atmos', 'Recliner Seats', 'Gourmet Food', 'Valet Parking', 'Wheelchair Accessible']
    },
    isActive: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true
  }
);

theatreSchema.index({ city: 1, name: 1 });

module.exports = mongoose.model('Theatre', theatreSchema);
