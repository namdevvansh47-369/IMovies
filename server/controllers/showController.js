const Show = require('../models/Show');
const Theatre = require('../models/Theatre');
const Movie = require('../models/Movie');

// Helper to generate a full grid seat layout
const generateSeatLayout = (rowsCount = 8, colsCount = 12, priceTiers = { silver: 200, gold: 320, platinum: 480 }) => {
  const seats = [];
  const rowLabels = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

  for (let r = 0; r < rowsCount; r++) {
    const rowChar = rowLabels[r];
    // Assign tiers based on row position
    let tier = 'gold';
    let price = priceTiers.gold || 320;

    if (r < 2) {
      tier = 'silver';
      price = priceTiers.silver || 200;
    } else if (r >= rowsCount - 2) {
      tier = 'platinum';
      price = priceTiers.platinum || 480;
    }

    for (let c = 1; c <= colsCount; c++) {
      seats.push({
        seatNumber: `${rowChar}${c}`,
        row: rowChar,
        col: c,
        tier,
        price,
        status: 'available',
        lockedBy: null,
        lockedUntil: null,
        bookedBy: null
      });
    }
  }

  return seats;
};

// @desc    Get shows with filtering by movie, theatre, date, city
// @route   GET /api/shows
// @access  Public
const getShows = async (req, res, next) => {
  try {
    const { movie, theatre, date, city } = req.query;
    const query = { status: { $ne: 'cancelled' } };

    if (movie) {
      query.movie = movie;
    }

    if (theatre) {
      query.theatre = theatre;
    }

    if (date) {
      const startDate = new Date(date);
      startDate.setHours(0, 0, 0, 0);
      const endDate = new Date(date);
      endDate.setHours(23, 59, 59, 999);
      query.showDateTime = { $gte: startDate, $lte: endDate };
    } else {
      // Default to future shows
      query.showDateTime = { $gte: new Date() };
    }

    let shows = await Show.find(query)
      .populate('movie', 'title poster genre duration certificate rating banner')
      .populate('theatre', 'name city location address amenities')
      .sort({ showDateTime: 1 });

    // Optional filter by city if theatre city is populated
    if (city && city !== 'all') {
      shows = shows.filter(
        (show) => show.theatre && show.theatre.city.toLowerCase() === city.toLowerCase()
      );
    }

    res.json({
      success: true,
      count: shows.length,
      shows
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get show details by ID with current seat availability
// @route   GET /api/shows/:id
// @access  Public
const getShowById = async (req, res, next) => {
  try {
    const show = await Show.findById(req.params.id)
      .populate('movie', 'title poster duration rating certificate genre language banner trailerUrl')
      .populate('theatre', 'name city location address screens amenities');

    if (!show) {
      return res.status(404).json({
        success: false,
        message: 'Show not found'
      });
    }

    // Auto-release expired locks
    const now = new Date();
    let updated = false;

    show.seats.forEach((seat) => {
      if (
        seat.status === 'locked' &&
        seat.lockedUntil &&
        new Date(seat.lockedUntil) < now
      ) {
        seat.status = 'available';
        seat.lockedBy = null;
        seat.lockedUntil = null;
        updated = true;
      }
    });

    if (updated) {
      show.availableSeatsCount = show.seats.filter(
        (s) => s.status === 'available'
      ).length;
      await show.save();
    }

    res.json({
      success: true,
      show
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a new show schedule (Admin)
// @route   POST /api/shows
// @access  Private/Admin
const createShow = async (req, res, next) => {
  try {
    const {
      movie,
      theatre,
      screenName,
      showDateTime,
      format,
      language,
      priceTiers,
      rows = 8,
      cols = 12
    } = req.body;

    const theatreObj = await Theatre.findById(theatre);
    if (!theatreObj) {
      return res.status(404).json({ success: false, message: 'Theatre not found' });
    }

    const movieObj = await Movie.findById(movie);
    if (!movieObj) {
      return res.status(404).json({ success: false, message: 'Movie not found' });
    }

    // Generate seats
    const seats = generateSeatLayout(
      Number(rows) || 8,
      Number(cols) || 12,
      priceTiers || { silver: 200, gold: 320, platinum: 480 }
    );

    const show = await Show.create({
      movie,
      theatre,
      screenName: screenName || 'Audi 1',
      showDateTime: new Date(showDateTime),
      format: format || 'IMAX 3D',
      language: language || movieObj.language[0] || 'English',
      priceTiers: priceTiers || { silver: 200, gold: 320, platinum: 480 },
      seats,
      totalSeats: seats.length,
      availableSeatsCount: seats.length,
      status: 'scheduled'
    });

    const populatedShow = await Show.findById(show._id)
      .populate('movie', 'title poster duration')
      .populate('theatre', 'name city location');

    res.status(201).json({
      success: true,
      show: populatedShow
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update show (Admin)
// @route   PUT /api/shows/:id
// @access  Private/Admin
const updateShow = async (req, res, next) => {
  try {
    const show = await Show.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    if (!show) {
      return res.status(404).json({ success: false, message: 'Show not found' });
    }

    res.json({
      success: true,
      show
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete show (Admin)
// @route   DELETE /api/shows/:id
// @access  Private/Admin
const deleteShow = async (req, res, next) => {
  try {
    const show = await Show.findById(req.params.id);
    if (!show) {
      return res.status(404).json({ success: false, message: 'Show not found' });
    }

    await show.deleteOne();
    res.json({
      success: true,
      message: 'Show deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getShows,
  getShowById,
  createShow,
  updateShow,
  deleteShow,
  generateSeatLayout
};
