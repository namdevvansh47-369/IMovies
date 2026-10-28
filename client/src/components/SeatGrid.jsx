import React from 'react';
import { useBooking } from '../context/BookingContext';
import { useAuth } from '../context/AuthContext';
import { Clock, Info } from 'lucide-react';

const SeatGrid = ({ show, onSeatClick }) => {
  const { selectedSeats, holdTimer } = useBooking();
  const { user } = useAuth();

  if (!show || !show.seats) {
    return <div className="text-center py-5 text-secondary">Loading seat layout...</div>;
  }

  // Format seconds into MM:SS
  const formatTimer = (seconds) => {
    if (seconds === null || seconds === undefined) return '';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Group seats by tier and row
  const tiersOrder = ['platinum', 'gold', 'silver'];
  const tierLabels = {
    platinum: `Platinum Recliner (₹${show.priceTiers?.platinum || 480})`,
    gold: `Gold Executive (₹${show.priceTiers?.gold || 320})`,
    silver: `Silver Classic (₹${show.priceTiers?.silver || 200})`
  };

  // Group seats by tier, then by row
  const groupedSeats = {};
  tiersOrder.forEach((t) => {
    groupedSeats[t] = {};
  });

  show.seats.forEach((seat) => {
    const t = seat.tier || 'gold';
    if (!groupedSeats[t]) groupedSeats[t] = {};
    if (!groupedSeats[t][seat.row]) groupedSeats[t][seat.row] = [];
    groupedSeats[t][seat.row].push(seat);
  });

  // Sort columns in each row
  Object.keys(groupedSeats).forEach((tier) => {
    Object.keys(groupedSeats[tier]).forEach((row) => {
      groupedSeats[tier][row].sort((a, b) => a.col - b.col);
    });
  });

  return (
    <div className="cinema-card-static p-4 shadow-sm text-center">
      {/* Screen Curved Header */}
      <div className="cinema-screen-container">
        <div className="cinema-screen-curve"></div>
        <div className="screen-text">All Eyes This Way • Cinema Screen</div>
      </div>

      {/* Seat Hold Timer Banner */}
      {selectedSeats.length > 0 && holdTimer !== null && (
        <div className="alert alert-warning py-2 px-3 d-inline-flex align-items-center gap-2 mb-4 rounded-pill small border-warning">
          <Clock size={16} className="text-warning-emphasis" />
          <span>
            Seats held for <strong>{formatTimer(holdTimer)}</strong> minutes. Complete reservation before timeout.
          </span>
        </div>
      )}

      {/* Seating Layout by Tier */}
      <div className="seat-layout-matrix d-flex flex-column gap-4 my-3 overflow-x-auto pb-3">
        {tiersOrder.map((tier) => {
          const rowsInTier = Object.keys(groupedSeats[tier] || {}).sort();
          if (rowsInTier.length === 0) return null;

          return (
            <div key={tier} className="tier-section">
              <div className="tier-header small fw-bold text-uppercase text-secondary mb-2 letter-spacing-1 d-flex align-items-center justify-content-center gap-2">
                <span className="border-top border-secondary flex-grow-1" style={{ maxWidth: 80 }}></span>
                <span>{tierLabels[tier]}</span>
                <span className="border-top border-secondary flex-grow-1" style={{ maxWidth: 80 }}></span>
              </div>

              <div className="d-flex flex-column gap-1 align-items-center">
                {rowsInTier.map((rowLetter) => {
                  const seatsInRow = groupedSeats[tier][rowLetter];

                  return (
                    <div key={rowLetter} className="d-flex align-items-center gap-1">
                      {/* Row Label */}
                      <span className="fw-bold small text-secondary me-2" style={{ width: 20 }}>
                        {rowLetter}
                      </span>

                      {/* Row Seats */}
                      <div className="d-flex align-items-center">
                        {seatsInRow.map((seat, idx) => {
                          const isSelected = selectedSeats.some(
                            (s) => s.seatNumber === seat.seatNumber
                          );
                          const isBooked = seat.status === 'booked';
                          const isLocked =
                            seat.status === 'locked' &&
                            seat.lockedBy &&
                            seat.lockedBy.toString() !== user?._id?.toString();

                          let seatClass = `seat-btn seat-${seat.tier}`;
                          if (isSelected) {
                            seatClass = 'seat-btn seat-selected';
                          } else if (isBooked) {
                            seatClass = 'seat-btn seat-booked';
                          } else if (isLocked) {
                            seatClass = 'seat-btn seat-locked';
                          }

                          // Optional aisle gap in the middle
                          const showAisle = idx === Math.floor(seatsInRow.length / 2);

                          return (
                            <React.Fragment key={seat.seatNumber}>
                              {showAisle && <div style={{ width: 24 }}></div>}
                              <button
                                type="button"
                                className={seatClass}
                                disabled={isBooked || isLocked}
                                title={`${seat.seatNumber} • ${seat.tier.toUpperCase()} • ₹${seat.price}`}
                                onClick={() => onSeatClick(seat)}
                              >
                                {seat.col}
                              </button>
                            </React.Fragment>
                          );
                        })}
                      </div>

                      <span className="fw-bold small text-secondary ms-2" style={{ width: 20 }}>
                        {rowLetter}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="d-flex flex-wrap justify-content-center align-items-center gap-4 pt-3 border-top border-secondary small text-secondary">
        <div className="d-flex align-items-center gap-2">
          <span className="seat-btn seat-silver" style={{ width: 20, height: 20, fontSize: 10 }}></span>
          <span>Available</span>
        </div>
        <div className="d-flex align-items-center gap-2">
          <span className="seat-btn seat-selected" style={{ width: 20, height: 20, fontSize: 10 }}></span>
          <span className="text-success fw-semibold">Selected</span>
        </div>
        <div className="d-flex align-items-center gap-2">
          <span className="seat-btn seat-locked" style={{ width: 20, height: 20, fontSize: 10 }}></span>
          <span className="text-warning">Held in real-time</span>
        </div>
        <div className="d-flex align-items-center gap-2">
          <span className="seat-btn seat-booked" style={{ width: 20, height: 20, fontSize: 10 }}></span>
          <span>Booked</span>
        </div>
      </div>
    </div>
  );
};

export default SeatGrid;
