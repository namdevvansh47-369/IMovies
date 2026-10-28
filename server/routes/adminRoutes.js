const express = require('express');
const router = express.Router();
const {
  getDashboardStats,
  getAllBookings
} = require('../controllers/adminController');
const { protect } = require('../middleware/authMiddleware');
const { adminOnly } = require('../middleware/adminMiddleware');

router.use(protect);
router.use(adminOnly);

router.get('/dashboard', getDashboardStats);
router.get('/bookings', getAllBookings);

module.exports = router;
