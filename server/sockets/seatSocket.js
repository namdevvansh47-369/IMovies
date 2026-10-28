const Show = require('../models/Show');

module.exports = function (io) {
  io.on('connection', (socket) => {
    console.log(`[Socket] New client connected: ${socket.id}`);

    // Join room for a specific show
    socket.on('join_show', async (showId) => {
      const room = `show_${showId}`;
      socket.join(room);
      console.log(`[Socket] Client ${socket.id} joined room ${room}`);
    });

    // Leave room
    socket.on('leave_show', (showId) => {
      const room = `show_${showId}`;
      socket.leave(room);
      console.log(`[Socket] Client ${socket.id} left room ${room}`);
    });

    // User attempts to lock/hold seats temporarily while on seat selection screen
    socket.on('lock_seats', async ({ showId, seatNumbers, userId }) => {
      try {
        const show = await Show.findById(showId);
        if (!show) return;

        const lockedUntil = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes hold
        const successfullyLocked = [];

        show.seats.forEach((seat) => {
          if (seatNumbers.includes(seat.seatNumber)) {
            // Can lock only if available or currently held by same user or previous lock expired
            const isAvailable =
              seat.status === 'available' ||
              (seat.status === 'locked' &&
                (seat.lockedBy?.toString() === userId ||
                  (seat.lockedUntil && new Date(seat.lockedUntil) < new Date())));

            if (isAvailable) {
              seat.status = 'locked';
              seat.lockedBy = userId;
              seat.lockedUntil = lockedUntil;
              successfullyLocked.push(seat.seatNumber);
            }
          }
        });

        await show.save();

        // Broadcast to everyone in the show room
        io.to(`show_${showId}`).emit('seats_locked', {
          showId,
          lockedSeats: successfullyLocked,
          lockedBy: userId,
          lockedUntil
        });
      } catch (err) {
        console.error('Error locking seats via socket:', err.message);
      }
    });

    // User deselects seats
    socket.on('release_seats', async ({ showId, seatNumbers, userId }) => {
      try {
        const show = await Show.findById(showId);
        if (!show) return;

        const released = [];
        show.seats.forEach((seat) => {
          if (seatNumbers.includes(seat.seatNumber)) {
            if (seat.status === 'locked' && (!userId || seat.lockedBy?.toString() === userId)) {
              seat.status = 'available';
              seat.lockedBy = null;
              seat.lockedUntil = null;
              released.push(seat.seatNumber);
            }
          }
        });

        await show.save();

        io.to(`show_${showId}`).emit('seats_released', {
          showId,
          releasedSeats: released
        });
      } catch (err) {
        console.error('Error releasing seats via socket:', err.message);
      }
    });

    socket.on('disconnect', () => {
      console.log(`[Socket] Client disconnected: ${socket.id}`);
    });
  });

  // Background interval to release expired seat locks every 30 seconds
  setInterval(async () => {
    try {
      const now = new Date();
      const showsWithExpiredLocks = await Show.find({
        'seats.status': 'locked',
        'seats.lockedUntil': { $lt: now }
      });

      for (const show of showsWithExpiredLocks) {
        const releasedSeats = [];
        show.seats.forEach((seat) => {
          if (seat.status === 'locked' && seat.lockedUntil && new Date(seat.lockedUntil) < now) {
            seat.status = 'available';
            seat.lockedBy = null;
            seat.lockedUntil = null;
            releasedSeats.push(seat.seatNumber);
          }
        });

        if (releasedSeats.length > 0) {
          show.availableSeatsCount = show.seats.filter((s) => s.status === 'available').length;
          await show.save();

          io.to(`show_${show._id}`).emit('seats_released', {
            showId: show._id,
            releasedSeats
          });
        }
      }
    } catch (err) {
      // Ignore background interval errors
    }
  }, 30000);
};
