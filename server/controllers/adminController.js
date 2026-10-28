const Booking = require('../models/Booking');
const Movie = require('../models/Movie');
const Theatre = require('../models/Theatre');
const Show = require('../models/Show');
const User = require('../models/User');

// @desc    Get admin overview analytics and statistics
// @route   GET /api/admin/dashboard
// @access  Private/Admin
const getDashboardStats = async (req, res, next) => {
  try {
    const totalUsers = await User.countDocuments({ role: 'user' });
    const totalMovies = await Movie.countDocuments();
    const totalTheatres = await Theatre.countDocuments({ isActive: true });
    const totalShows = await Show.countDocuments({ status: { $ne: 'cancelled' } });

    // Aggregate booking statistics
    const confirmedBookings = await Booking.find({ bookingStatus: 'confirmed' });
    const totalRevenue = confirmedBookings.reduce((sum, b) => sum + (b.totalAmount || 0), 0);
    const totalTicketsSold = confirmedBookings.reduce(
      (sum, b) => sum + (b.seats ? b.seats.length : 0),
      0
    );

    // Recent 10 bookings
    const recentBookings = await Booking.find()
      .populate('user', 'name email')
      .populate('movie', 'title poster')
      .populate('theatre', 'name city')
      .sort({ createdAt: -1 })
      .limit(10);

    // Revenue breakdown by movie
    const revenueByMovie = await Booking.aggregate([
      { $match: { bookingStatus: 'confirmed' } },
      {
        $group: {
          _id: '$movie',
          totalRevenue: { $sum: '$totalAmount' },
          ticketsCount: { $sum: { $size: '$seats' } }
        }
      },
      {
        $lookup: {
          from: 'movies',
          localField: '_id',
          foreignField: '_id',
          as: 'movieDetails'
        }
      },
      { $unwind: '$movieDetails' },
      {
        $project: {
          title: '$movieDetails.title',
          poster: '$movieDetails.poster',
          totalRevenue: 1,
          ticketsCount: 1
        }
      },
      { $sort: { totalRevenue: -1 } },
      { $limit: 5 }
    ]);

    res.json({
      success: true,
      stats: {
        totalRevenue,
        totalTicketsSold,
        totalBookings: confirmedBookings.length,
        totalMovies,
        totalTheatres,
        totalShows,
        totalUsers
      },
      revenueByMovie,
      recentBookings
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all bookings (Admin)
// @route   GET /api/admin/bookings
// @access  Private/Admin
const getAllBookings = async (req, res, next) => {
  try {
    const { status, search, page = 1, limit = 20 } = req.query;
    const query = {};

    if (status && status !== 'all') {
      query.bookingStatus = status;
    }

    if (search && search.trim() !== '') {
      query.bookingId = new RegExp(search.trim(), 'i');
    }

    const skip = (Number(page) - 1) * Number(limit);
    const total = await Booking.countDocuments(query);
    const bookings = await Booking.find(query)
      .populate('user', 'name email phone')
      .populate('movie', 'title poster')
      .populate('theatre', 'name city location')
      .populate('show', 'showDateTime screenName format')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    res.json({
      success: true,
      count: bookings.length,
      total,
      totalPages: Math.ceil(total / Number(limit)),
      currentPage: Number(page),
      bookings
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDashboardStats,
  getAllBookings
};
