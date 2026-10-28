const express = require('express');
const router = express.Router();
const {
  getAllMovies,
  getFeaturedMovies,
  getMovieById,
  createMovie,
  updateMovie,
  deleteMovie
} = require('../controllers/movieController');
const { protect } = require('../middleware/authMiddleware');
const { adminOnly } = require('../middleware/adminMiddleware');

router.get('/', getAllMovies);
router.get('/featured', getFeaturedMovies);
router.get('/:id', getMovieById);

// Admin endpoints
router.post('/', protect, adminOnly, createMovie);
router.put('/:id', protect, adminOnly, updateMovie);
router.delete('/:id', protect, adminOnly, deleteMovie);

module.exports = router;
