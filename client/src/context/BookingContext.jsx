import React, { createContext, useContext, useState, useEffect } from 'react';

const BookingContext = createContext();

export const BookingProvider = ({ children }) => {
  const [selectedShow, setSelectedShow] = useState(null);
  const [selectedSeats, setSelectedSeats] = useState([]); // [{ seatNumber, tier, price, row, col }]
  const [holdTimer, setHoldTimer] = useState(null); // remaining seconds
  const [city, setCity] = useState(localStorage.getItem('imovies_city') || 'Mumbai');

  // Change active city and persist
  const changeCity = (newCity) => {
    setCity(newCity);
    localStorage.setItem('imovies_city', newCity);
  };

  const initShowBooking = (show) => {
    setSelectedShow(show);
    setSelectedSeats([]);
    setHoldTimer(300); // 5 minutes initial countdown
  };

  const toggleSeat = (seat) => {
    const exists = selectedSeats.find((s) => s.seatNumber === seat.seatNumber);
    if (exists) {
      setSelectedSeats(selectedSeats.filter((s) => s.seatNumber !== seat.seatNumber));
    } else {
      if (selectedSeats.length >= 10) {
        alert('You can select a maximum of 10 seats per booking.');
        return;
      }
      setSelectedSeats([...selectedSeats, seat]);
    }
  };

  const clearBooking = () => {
    setSelectedSeats([]);
    setSelectedShow(null);
    setHoldTimer(null);
  };

  // Calculate pricing breakdown
  const subtotal = selectedSeats.reduce((acc, curr) => acc + (curr.price || 0), 0);
  const convenienceFee = selectedSeats.length > 0 ? selectedSeats.length * 20 : 0;
  const taxAmount = selectedSeats.length > 0 ? Math.round((subtotal + convenienceFee) * 0.18) : 0;
  const totalAmount = subtotal + convenienceFee + taxAmount;

  // Countdown timer effect
  useEffect(() => {
    let interval = null;
    if (holdTimer !== null && holdTimer > 0 && selectedSeats.length > 0) {
      interval = setInterval(() => {
        setHoldTimer((prev) => (prev > 0 ? prev - 1 : 0));
      }, 1000);
    } else if (holdTimer === 0 && selectedSeats.length > 0) {
      alert('Your seat reservation timer has expired. Please re-select your seats.');
      setSelectedSeats([]);
    }
    return () => clearInterval(interval);
  }, [holdTimer, selectedSeats.length]);

  const value = {
    selectedShow,
    setSelectedShow,
    selectedSeats,
    setSelectedSeats,
    toggleSeat,
    initShowBooking,
    clearBooking,
    city,
    changeCity,
    holdTimer,
    pricing: {
      subtotal,
      convenienceFee,
      taxAmount,
      totalAmount
    }
  };

  return <BookingContext.Provider value={value}>{children}</BookingContext.Provider>;
};

export const useBooking = () => {
  const context = useContext(BookingContext);
  if (!context) {
    throw new Error('useBooking must be used within a BookingProvider');
  }
  return context;
};
