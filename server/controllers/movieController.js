const Movie = require('../models/Movie');
const Show = require('../models/Show');

// @desc    Get all movies with filtering, search, sorting, and pagination
// @route   GET /api/movies
// @access  Public
const getAllMovies = async (req, res, next) => {
  try {
    const {
      search,
      genre,
      language,
      status,
      sort,
      page = 1,
      limit = 12
    } = req.query;

    const query = {};

    // Filter by status (now_showing, coming_soon)
    if (status && status !== 'all') {
      query.status = status;
    }

    // Filter by genre
    if (genre && genre !== 'all') {
      query.genre = { $in: [new RegExp(genre, 'i')] };
    }

    // Filter by language
    if (language && language !== 'all') {
      query.language = { $in: [new RegExp(language, 'i')] };
    }

    // Text / regex search
    if (search && search.trim() !== '') {
      const searchRegex = new RegExp(search.trim(), 'i');
      query.$or = [
        { title: searchRegex },
        { description: searchRegex },
        { director: searchRegex },
        { cast: searchRegex }
      ];
    }

    // Sorting
    let sortQuery = { isFeatured: -1, rating: -1 };
    if (sort === 'release_desc') {
      sortQuery = { releaseDate: -1 };
    } else if (sort === 'rating_desc') {
      sortQuery = { rating: -1 };
    } else if (sort === 'title_asc') {
      sortQuery = { title: 1 };
    }

    const skip = (Number(page) - 1) * Number(limit);
    const total = await Movie.countDocuments(query);
    const movies = await Movie.find(query)
      .sort(sortQuery)
      .skip(skip)
      .limit(Number(limit));

    // Also get distinct genres & languages for frontend filters
    const allGenres = await Movie.distinct('genre');
    const allLanguages = await Movie.distinct('language');

    res.json({
      success: true,
      count: movies.length,
      total,
      totalPages: Math.ceil(total / Number(limit)),
      currentPage: Number(page),
      allGenres,
      allLanguages,
      movies
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get featured movies for hero slider
// @route   GET /api/movies/featured
// @access  Public
const getFeaturedMovies = async (req, res, next) => {
  try {
    const movies = await Movie.find({ isFeatured: true, status: 'now_showing' })
      .sort({ rating: -1 })
      .limit(5);

    res.json({
      success: true,
      movies
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single movie by ID with shows
// @route   GET /api/movies/:id
// @access  Public
const getMovieById = async (req, res, next) => {
  try {
    const movie = await Movie.findById(req.params.id);

    if (!movie) {
      return res.status(404).json({
        success: false,
        message: 'Movie not found'
      });
    }

    // Find all future shows for this movie
    const now = new Date();
    const shows = await Show.find({
      movie: movie._id,
      showDateTime: { $gte: now },
      status: { $ne: 'cancelled' }
    })
      .populate('theatre', 'name city location address amenities')
      .sort({ showDateTime: 1 });

    res.json({
      success: true,
      movie,
      shows
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new movie (Admin)
// @route   POST /api/movies
// @access  Private/Admin
const createMovie = async (req, res, next) => {
  try {
    const movie = await Movie.create(req.body);
    res.status(201).json({
      success: true,
      movie
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update movie (Admin)
// @route   PUT /api/movies/:id
// @access  Private/Admin
const updateMovie = async (req, res, next) => {
  try {
    const movie = await Movie.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    if (!movie) {
      return res.status(404).json({
        success: false,
        message: 'Movie not found'
      });
    }

    res.json({
      success: true,
      movie
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete movie (Admin)
// @route   DELETE /api/movies/:id
// @access  Private/Admin
const deleteMovie = async (req, res, next) => {
  try {
    const movie = await Movie.findById(req.params.id);

    if (!movie) {
      return res.status(404).json({
        success: false,
        message: 'Movie not found'
      });
    }

    // Delete associated shows as well
    await Show.deleteMany({ movie: movie._id });
    await movie.deleteOne();

    res.json({
      success: true,
      message: 'Movie and associated shows deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllMovies,
  getFeaturedMovies,
  getMovieById,
  createMovie,
  updateMovie,
  deleteMovie
};
