const express = require('express');
const router = express.Router();
const {
  getAllTheatres,
  getCities,
  getTheatreById,
  createTheatre,
  updateTheatre,
  deleteTheatre
} = require('../controllers/theatreController');
const { protect } = require('../middleware/authMiddleware');
const { adminOnly } = require('../middleware/adminMiddleware');

router.get('/', getAllTheatres);
router.get('/cities', getCities);
router.get('/:id', getTheatreById);

// Admin endpoints
router.post('/', protect, adminOnly, createTheatre);
router.put('/:id', protect, adminOnly, updateTheatre);
router.delete('/:id', protect, adminOnly, deleteTheatre);

module.exports = router;
