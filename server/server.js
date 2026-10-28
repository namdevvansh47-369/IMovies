const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

const { connectDB } = require('./config/db');
const { seedDatabase } = require('./config/seedData');
const errorHandler = require('./middleware/errorHandler');

// Route imports
const authRoutes = require('./routes/authRoutes');
const movieRoutes = require('./routes/movieRoutes');
const theatreRoutes = require('./routes/theatreRoutes');
const showRoutes = require('./routes/showRoutes');
const bookingRoutes = require('./routes/bookingRoutes');
const adminRoutes = require('./routes/adminRoutes');
const notificationRoutes = require('./routes/notificationRoutes');

const app = express();
const server = http.createServer(app);

// Initialize Socket.io
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE']
  }
});

// Attach io to express app so controllers can emit events
app.set('io', io);

// Initialize Socket handlers
require('./sockets/seatSocket')(io);

// Core Middlewares
app.use(cors({ origin: '*' }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));
}

// Rate Limiting (200 requests per 15 minutes window)
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again after 15 minutes'
  },
  standardHeaders: true,
  legacyHeaders: false
});
app.use('/api', limiter);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'IMovies Cinema API is healthy and operational',
    timestamp: new Date().toISOString()
  });
});

// Mount API routes
app.use('/api/auth', authRoutes);
app.use('/api/movies', movieRoutes);
app.use('/api/theatres', theatreRoutes);
app.use('/api/shows', showRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/notifications', notificationRoutes);

const path = require('path');

// Serve static frontend build if available
const clientDistPath = path.join(__dirname, '../client/dist');
const fs = require('fs');

if (fs.existsSync(clientDistPath)) {
  app.use(express.static(clientDistPath));

  app.get('*', (req, res, next) => {
    if (req.originalUrl.startsWith('/api') || req.originalUrl.startsWith('/socket.io')) {
      return next();
    }
    res.sendFile(path.join(clientDistPath, 'index.html'));
  });
} else {
  // 404 handler for unknown routes if client build is absent
  app.use('*', (req, res) => {
    res.status(404).json({
      success: false,
      message: `API endpoint '${req.originalUrl}' not found`
    });
  });
}

// Centralized Error Handling Middleware
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

// Start server
const startServer = async () => {
  await connectDB();
  await seedDatabase();

  server.listen(PORT, () => {
    console.log(`================================================`);
    console.log(`🎬 IMovies Backend Server running on port ${PORT}`);
    console.log(`📡 WebSocket Gateway initialized for live seat sync`);
    console.log(`🏥 Health Check: http://localhost:${PORT}/api/health`);
    console.log(`================================================`);
  });
};

startServer();

module.exports = { app, server };
