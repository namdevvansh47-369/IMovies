const Theatre = require('../models/Theatre');
const Show = require('../models/Show');

// @desc    Get all theatres with optional city filter
// @route   GET /api/theatres
// @access  Public
const getAllTheatres = async (req, res, next) => {
  try {
    const { city, search } = req.query;
    const query = { isActive: true };

    if (city && city !== 'all') {
      query.city = new RegExp(`^${city}$`, 'i');
    }

    if (search && search.trim() !== '') {
      query.$or = [
        { name: new RegExp(search.trim(), 'i') },
        { location: new RegExp(search.trim(), 'i') }
      ];
    }

    const theatres = await Theatre.find(query).sort({ name: 1 });
    res.json({
      success: true,
      count: theatres.length,
      theatres
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all unique cities
// @route   GET /api/theatres/cities
// @access  Public
const getCities = async (req, res, next) => {
  try {
    const cities = await Theatre.distinct('city', { isActive: true });
    res.json({
      success: true,
      cities
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get theatre by ID with current shows
// @route   GET /api/theatres/:id
// @access  Public
const getTheatreById = async (req, res, next) => {
  try {
    const theatre = await Theatre.findById(req.params.id);
    if (!theatre) {
      return res.status(404).json({
        success: false,
        message: 'Theatre not found'
      });
    }

    const now = new Date();
    const shows = await Show.find({
      theatre: theatre._id,
      showDateTime: { $gte: now },
      status: { $ne: 'cancelled' }
    })
      .populate('movie', 'title poster genre duration certificate rating')
      .sort({ showDateTime: 1 });

    res.json({
      success: true,
      theatre,
      shows
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new theatre (Admin)
// @route   POST /api/theatres
// @access  Private/Admin
const createTheatre = async (req, res, next) => {
  try {
    const theatre = await Theatre.create(req.body);
    res.status(201).json({
      success: true,
      theatre
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update theatre (Admin)
// @route   PUT /api/theatres/:id
// @access  Private/Admin
const updateTheatre = async (req, res, next) => {
  try {
    const theatre = await Theatre.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    if (!theatre) {
      return res.status(404).json({
        success: false,
        message: 'Theatre not found'
      });
    }

    res.json({
      success: true,
      theatre
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete theatre (Admin)
// @route   DELETE /api/theatres/:id
// @access  Private/Admin
const deleteTheatre = async (req, res, next) => {
  try {
    const theatre = await Theatre.findById(req.params.id);
    if (!theatre) {
      return res.status(404).json({
        success: false,
        message: 'Theatre not found'
      });
    }

    await Show.deleteMany({ theatre: theatre._id });
    await theatre.deleteOne();

    res.json({
      success: true,
      message: 'Theatre and associated shows deleted'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllTheatres,
  getCities,
  getTheatreById,
  createTheatre,
  updateTheatre,
  deleteTheatre
};
