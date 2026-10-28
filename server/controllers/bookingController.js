const QRCode = require('qrcode');
const Booking = require('../models/Booking');
const Show = require('../models/Show');
const Payment = require('../models/Payment');
const Notification = require('../models/Notification');

// Helper to generate a unique readable booking ID
const generateBookingId = () => {
  const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const randomStr = Math.random().toString(36).substring(2, 7).toUpperCase();
  return `IMV-${dateStr}-${randomStr}`;
};

// @desc    Create new booking and process payment
// @route   POST /api/bookings
// @access  Private
const createBooking = async (req, res, next) => {
  try {
    const {
      showId,
      seatNumbers, // Array of seatNumber strings, e.g. ['A1', 'A2']
      paymentMethod = 'card',
      paymentDetails = {}
    } = req.body;

    if (!showId || !seatNumbers || seatNumbers.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Please provide showId and at least one seat to book'
      });
    }

    const show = await Show.findById(showId)
      .populate('movie', 'title poster duration rating certificate')
      .populate('theatre', 'name city location address');

    if (!show) {
      return res.status(404).json({ success: false, message: 'Show not found' });
    }

    if (show.status === 'cancelled') {
      return res.status(400).json({ success: false, message: 'This show has been cancelled' });
    }

    // Verify seat availability
    const requestedSeats = [];
    const unavailableSeats = [];

    for (const seatNum of seatNumbers) {
      const seat = show.seats.find((s) => s.seatNumber === seatNum);

      if (!seat) {
        return res.status(400).json({
          success: false,
          message: `Seat ${seatNum} does not exist in this auditorium layout`
        });
      }

      // Check if booked
      if (seat.status === 'booked') {
        unavailableSeats.push(seatNum);
        continue;
      }

      // Check if locked by someone else
      if (
        seat.status === 'locked' &&
        seat.lockedBy &&
        seat.lockedBy.toString() !== req.user._id.toString() &&
        seat.lockedUntil &&
        new Date(seat.lockedUntil) > new Date()
      ) {
        unavailableSeats.push(seatNum);
        continue;
      }

      requestedSeats.push({
        seatNumber: seat.seatNumber,
        row: seat.row,
        col: seat.col,
        tier: seat.tier,
        price: seat.price
      });
    }

    if (unavailableSeats.length > 0) {
      return res.status(409).json({
        success: false,
        message: `Seats [${unavailableSeats.join(', ')}] are already booked or locked by another user. Please choose different seats.`
      });
    }

    // Calculate financials
    const subtotal = requestedSeats.reduce((acc, curr) => acc + curr.price, 0);
    const convenienceFee = requestedSeats.length * 20; // 20 per ticket
    const taxAmount = Math.round((subtotal + convenienceFee) * 0.18); // 18% GST
    const totalAmount = subtotal + convenienceFee + taxAmount;

    // Generate transaction ID & booking ID
    const transactionId = `TXN-${Date.now()}-${Math.floor(Math.random() * 90000 + 10000)}`;
    const bookingId = generateBookingId();

    // Generate QR Code containing verified entry payload
    const qrPayload = JSON.stringify({
      bookingId,
      movie: show.movie.title,
      theatre: show.theatre.name,
      screen: show.screenName,
      showDateTime: show.showDateTime,
      seats: requestedSeats.map((s) => s.seatNumber),
      totalAmount,
      user: req.user.name,
      verified: true
    });

    const qrCodeDataUrl = await QRCode.toDataURL(qrPayload, {
      errorCorrectionLevel: 'H',
      margin: 2,
      width: 250,
      color: {
        dark: '#0f172a',
        light: '#ffffff'
      }
    });

    // Create booking
    const booking = await Booking.create({
      bookingId,
      user: req.user._id,
      show: show._id,
      movie: show.movie._id,
      theatre: show.theatre._id,
      seats: requestedSeats,
      subtotal,
      convenienceFee,
      taxAmount,
      totalAmount,
      paymentStatus: 'paid',
      paymentMethod,
      transactionId,
      bookingStatus: 'confirmed',
      qrCode: qrCodeDataUrl
    });

    // Record payment
    await Payment.create({
      booking: booking._id,
      user: req.user._id,
      amount: totalAmount,
      currency: 'INR',
      paymentMethod,
      transactionId,
      status: 'success',
      paymentDetails
    });

    // Update show seats in DB to 'booked'
    show.seats.forEach((seat) => {
      if (seatNumbers.includes(seat.seatNumber)) {
        seat.status = 'booked';
        seat.bookedBy = req.user._id;
        seat.lockedBy = null;
        seat.lockedUntil = null;
      }
    });

    show.availableSeatsCount = show.seats.filter((s) => s.status === 'available').length;
    if (show.availableSeatsCount === 0) {
      show.status = 'housefull';
    }
    await show.save();

    // Emit real-time socket event if io is attached to req.app
    const io = req.app.get('io');
    if (io) {
      io.to(`show_${show._id}`).emit('seats_updated', {
        showId: show._id,
        bookedSeats: seatNumbers,
        seats: show.seats
      });
    }

    // Send user in-app notification
    await Notification.create({
      user: req.user._id,
      title: 'Booking Confirmed!',
      message: `Your booking for "${show.movie.title}" (${requestedSeats.map((s) => s.seatNumber).join(', ')}) at ${show.theatre.name} is confirmed!`,
      type: 'booking',
      metadata: {
        bookingId: booking.bookingId,
        movieTitle: show.movie.title
      }
    });

    const populatedBooking = await Booking.findById(booking._id)
      .populate('movie')
      .populate('theatre')
      .populate('show');

    res.status(201).json({
      success: true,
      booking: populatedBooking
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get logged in user's bookings
// @route   GET /api/bookings/my-bookings
// @access  Private
const getUserBookings = async (req, res, next) => {
  try {
    const bookings = await Booking.find({ user: req.user._id })
      .populate('movie', 'title poster duration certificate genre language')
      .populate('theatre', 'name city location address')
      .populate('show', 'showDateTime screenName format')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: bookings.length,
      bookings
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get booking by ID
// @route   GET /api/bookings/:id
// @access  Private
const getBookingById = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('movie')
      .populate('theatre')
      .populate('show')
      .populate('user', 'name email phone');

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    // Verify ownership or admin
    if (
      booking.user._id.toString() !== req.user._id.toString() &&
      req.user.role !== 'admin'
    ) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this booking'
      });
    }

    res.json({
      success: true,
      booking
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Cancel booking
// @route   PUT /api/bookings/:id/cancel
// @access  Private
const cancelBooking = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('show')
      .populate('movie');

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    // Verify ownership or admin
    if (
      booking.user.toString() !== req.user._id.toString() &&
      req.user.role !== 'admin'
    ) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to cancel this booking'
      });
    }

    if (booking.bookingStatus === 'cancelled') {
      return res.status(400).json({
        success: false,
        message: 'This booking is already cancelled'
      });
    }

    // Check show time: allow cancellation if show has not started
    if (booking.show && new Date(booking.show.showDateTime) < new Date()) {
      return res.status(400).json({
        success: false,
        message: 'Cannot cancel past or ongoing shows'
      });
    }

    booking.bookingStatus = 'cancelled';
    booking.cancellationReason = req.body.reason || 'User cancelled reservation';
    // 90% refund policy (10% cancellation charge)
    booking.refundAmount = Math.round(booking.totalAmount * 0.9);
    booking.paymentStatus = 'refunded';
    await booking.save();

    // Release seats on the show
    if (booking.show) {
      const show = await Show.findById(booking.show._id);
      if (show) {
        const releasedSeatNumbers = booking.seats.map((s) => s.seatNumber);

        show.seats.forEach((seat) => {
          if (releasedSeatNumbers.includes(seat.seatNumber)) {
            seat.status = 'available';
            seat.bookedBy = null;
            seat.lockedBy = null;
            seat.lockedUntil = null;
          }
        });

        show.availableSeatsCount = show.seats.filter(
          (s) => s.status === 'available'
        ).length;
        if (show.status === 'housefull') {
          show.status = 'scheduled';
        }
        await show.save();

        // Emit real-time socket event
        const io = req.app.get('io');
        if (io) {
          io.to(`show_${show._id}`).emit('seats_updated', {
            showId: show._id,
            releasedSeats: releasedSeatNumbers,
            seats: show.seats
          });
        }
      }
    }

    // Create notification
    await Notification.create({
      user: booking.user,
      title: 'Booking Cancelled',
      message: `Your booking ${booking.bookingId} for "${booking.movie.title}" has been cancelled. Refund of ₹${booking.refundAmount} has been initiated.`,
      type: 'cancellation',
      metadata: {
        bookingId: booking.bookingId,
        refundAmount: booking.refundAmount
      }
    });

    res.json({
      success: true,
      message: 'Booking cancelled successfully. Refund initiated.',
      booking
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createBooking,
  getUserBookings,
  getBookingById,
  cancelBooking
};
