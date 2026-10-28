const mongoose = require('mongoose');

const movieSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Movie title is required'],
      trim: true,
      index: true
    },
    description: {
      type: String,
      required: [true, 'Movie description is required'],
      trim: true
    },
    poster: {
      type: String,
      required: [true, 'Movie poster URL is required']
    },
    banner: {
      type: String,
      required: [true, 'Movie banner URL is required']
    },
    trailerUrl: {
      type: String,
      default: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'
    },
    genre: {
      type: [String],
      required: [true, 'At least one genre is required'],
      index: true
    },
    language: {
      type: [String],
      required: [true, 'At least one language is required'],
      index: true
    },
    duration: {
      type: Number, // in minutes
      required: [true, 'Duration in minutes is required']
    },
    releaseDate: {
      type: Date,
      required: [true, 'Release date is required']
    },
    rating: {
      type: Number,
      default: 8.0,
      min: 0,
      max: 10
    },
    votesCount: {
      type: Number,
      default: 1200
    },
    director: {
      type: String,
      default: 'Director Name'
    },
    cast: {
      type: [String],
      default: []
    },
    certificate: {
      type: String,
      enum: ['U', 'UA', 'A', 'PG', 'PG-13', 'R'],
      default: 'UA'
    },
    status: {
      type: String,
      enum: ['now_showing', 'coming_soon'],
      default: 'now_showing',
      index: true
    },
    isFeatured: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true
  }
);

// Compound text index with language_override set to 'none' so 'language' field isn't treated as override
movieSchema.index({ title: 'text', description: 'text', director: 'text' }, { language_override: 'none' });

module.exports = mongoose.model('Movie', movieSchema);
