import React, { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useBooking } from '../context/BookingContext';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import {
  CreditCard,
  QrCode,
  Building,
  ShieldCheck,
  Film,
  Lock,
  CheckCircle,
  Clock
} from 'lucide-react';

const Checkout = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { selectedShow, selectedSeats, pricing, clearBooking } = useBooking();

  const [paymentMethod, setPaymentMethod] = useState('card');
  const [processing, setProcessing] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Card form
  const [cardData, setCardData] = useState({
    number: '4532 •••• •••• 8821',
    name: user?.name || 'John Doe',
    expiry: '12/28',
    cvv: '992'
  });

  // UPI form
  const [upiId, setUpiId] = useState(`${user?.email?.split('@')[0] || 'cinema'}@okaxis`);

  // Netbanking
  const [bank, setBank] = useState('HDFC Bank');

  if (!selectedShow || selectedSeats.length === 0) {
    return <Navigate to="/movies" replace />;
  }

  const handlePayment = async (e) => {
    e.preventDefault();
    setProcessing(true);
    setErrorMsg('');

    try {
      // Simulate real bank authentication delay
      await new Promise((r) => setTimeout(r, 1500));

      const payload = {
        showId: selectedShow._id,
        seatNumbers: selectedSeats.map((s) => s.seatNumber),
        paymentMethod,
        paymentDetails: {
          cardLast4: paymentMethod === 'card' ? '8821' : null,
          upiId: paymentMethod === 'upi' ? upiId : null,
          bankName: paymentMethod === 'netbanking' ? bank : null
        }
      };

      const res = await api.post('/bookings', payload);

      if (res.data?.success) {
        const booking = res.data.booking;
        clearBooking();
        navigate(`/booking-confirmation/${booking._id}`, { state: { booking } });
      } else {
        setErrorMsg(res.data?.message || 'Payment processing failed');
      }
    } catch (err) {
      console.error('Payment error:', err);
      setErrorMsg(
        err.response?.data?.message ||
          'Payment gateway encountered an issue. Please try again or reselect seats.'
      );
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="container py-4 my-2" style={{ maxWidth: '960px' }}>
      <div className="text-center mb-4">
        <h2 className="fw-bold text-white d-flex align-items-center justify-content-center gap-2">
          <Lock size={22} className="text-danger" /> Secure Checkout
        </h2>
        <p className="text-secondary small">Complete your cinema reservation with encrypted payment</p>
      </div>

      {errorMsg && (
        <div className="alert alert-danger py-2 px-3 mb-4 rounded-3 small">
          {errorMsg}
        </div>
      )}

      <div className="row g-4">
        {/* Left: Payment Method Selection */}
        <div className="col-lg-7">
          <div className="cinema-card-static p-4">
            <h5 className="fw-bold text-white mb-3 pb-2 border-bottom border-secondary">
              Select Payment Method
            </h5>

            {/* Method Tabs */}
            <div className="d-flex gap-2 mb-4">
              <button
                type="button"
                className={`btn btn-sm flex-grow-1 p-2 rounded-3 d-flex align-items-center justify-content-center gap-2 ${
                  paymentMethod === 'card' ? 'btn-danger' : 'btn-dark border border-secondary text-secondary'
                }`}
                onClick={() => setPaymentMethod('card')}
              >
                <CreditCard size={16} /> Credit / Debit
              </button>

              <button
                type="button"
                className={`btn btn-sm flex-grow-1 p-2 rounded-3 d-flex align-items-center justify-content-center gap-2 ${
                  paymentMethod === 'upi' ? 'btn-danger' : 'btn-dark border border-secondary text-secondary'
                }`}
                onClick={() => setPaymentMethod('upi')}
              >
                <QrCode size={16} /> Instant UPI
              </button>

              <button
                type="button"
                className={`btn btn-sm flex-grow-1 p-2 rounded-3 d-flex align-items-center justify-content-center gap-2 ${
                  paymentMethod === 'netbanking' ? 'btn-danger' : 'btn-dark border border-secondary text-secondary'
                }`}
                onClick={() => setPaymentMethod('netbanking')}
              >
                <Building size={16} /> Net Banking
              </button>
            </div>

            {/* Payment Form Fields */}
            <form onSubmit={handlePayment}>
              {paymentMethod === 'card' && (
                <div className="d-flex flex-column gap-3">
                  <div>
                    <label className="form-label text-secondary small mb-1">Card Number</label>
                    <input
                      type="text"
                      className="form-control bg-dark border-secondary text-light"
                      value={cardData.number}
                      onChange={(e) => setCardData({ ...cardData, number: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <label className="form-label text-secondary small mb-1">Cardholder Name</label>
                    <input
                      type="text"
                      className="form-control bg-dark border-secondary text-light"
                      value={cardData.name}
                      onChange={(e) => setCardData({ ...cardData, name: e.target.value })}
                      required
                    />
                  </div>
                  <div className="row g-2">
                    <div className="col-6">
                      <label className="form-label text-secondary small mb-1">Expiry Date</label>
                      <input
                        type="text"
                        className="form-control bg-dark border-secondary text-light"
                        placeholder="MM/YY"
                        value={cardData.expiry}
                        onChange={(e) => setCardData({ ...cardData, expiry: e.target.value })}
                        required
                      />
                    </div>
                    <div className="col-6">
                      <label className="form-label text-secondary small mb-1">CVV / CVC</label>
                      <input
                        type="password"
                        maxLength="4"
                        className="form-control bg-dark border-secondary text-light"
                        placeholder="123"
                        value={cardData.cvv}
                        onChange={(e) => setCardData({ ...cardData, cvv: e.target.value })}
                        required
                      />
                    </div>
                  </div>
                </div>
              )}

              {paymentMethod === 'upi' && (
                <div className="text-center py-2">
                  <div className="p-3 bg-white d-inline-block rounded-3 mb-3 shadow">
                    <img
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=upi://pay?pa=imovies@upi&pn=IMovies&am=${pricing.totalAmount}`}
                      alt="UPI QR Code"
                      width="150"
                      height="150"
                    />
                  </div>
                  <p className="text-secondary small mb-3">Scan this dynamic QR code with any UPI app (GPay, PhonePe, Paytm)</p>
                  <div className="text-start">
                    <label className="form-label text-secondary small mb-1">Or enter UPI ID / VPA</label>
                    <input
                      type="text"
                      className="form-control bg-dark border-secondary text-light"
                      value={upiId}
                      onChange={(e) => setUpiId(e.target.value)}
                      placeholder="username@bank"
                    />
                  </div>
                </div>
              )}

              {paymentMethod === 'netbanking' && (
                <div>
                  <label className="form-label text-secondary small mb-2">Select Your Bank</label>
                  <select
                    className="form-select bg-dark border-secondary text-light mb-3"
                    value={bank}
                    onChange={(e) => setBank(e.target.value)}
                  >
                    <option value="HDFC Bank">HDFC Bank</option>
                    <option value="State Bank of India">State Bank of India</option>
                    <option value="ICICI Bank">ICICI Bank</option>
                    <option value="Axis Bank">Axis Bank</option>
                    <option value="Kotak Mahindra Bank">Kotak Mahindra Bank</option>
                  </select>
                  <p className="text-secondary small">
                    You will be securely redirected to the selected bank's authorization portal.
                  </p>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                className="btn btn-cinema w-100 py-3 mt-4 fw-bold fs-6 d-flex align-items-center justify-content-center gap-2"
                disabled={processing}
              >
                {processing ? (
                  <>
                    <span className="spinner-border spinner-border-sm" role="status"></span>
                    Authorizing Payment...
                  </>
                ) : (
                  <>
                    <Lock size={16} /> Pay ₹{pricing.totalAmount} & Confirm Booking
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Right: Booking Details Card */}
        <div className="col-lg-5">
          <div className="cinema-card-static p-4">
            <h5 className="fw-bold text-white mb-3 pb-2 border-bottom border-secondary d-flex align-items-center gap-2">
              <Film size={18} className="text-danger" /> Order Review
            </h5>

            <div className="d-flex gap-3 mb-3 pb-3 border-bottom border-secondary">
              <img
                src={selectedShow.movie?.poster}
                alt={selectedShow.movie?.title}
                className="rounded-2 object-fit-cover"
                style={{ width: '70px', height: '100px' }}
              />
              <div>
                <h6 className="fw-bold text-white mb-1">{selectedShow.movie?.title}</h6>
                <div className="badge bg-danger small py-0 mb-1">{selectedShow.format || 'IMAX 3D'}</div>
                <div className="text-secondary small" style={{ fontSize: '0.78rem' }}>
                  {selectedShow.theatre?.name}
                </div>
                <div className="text-secondary small" style={{ fontSize: '0.75rem' }}>
                  {new Date(selectedShow.showDateTime).toLocaleString([], {
                    weekday: 'short',
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </div>
              </div>
            </div>

            <div className="mb-3">
              <div className="text-secondary small mb-1">Seats Reserved:</div>
              <div className="d-flex flex-wrap gap-1">
                {selectedSeats.map((s) => (
                  <span key={s.seatNumber} className="badge bg-danger">
                    {s.seatNumber}
                  </span>
                ))}
              </div>
            </div>

            {/* Price breakdown */}
            <div className="d-flex flex-column gap-2 py-3 border-top border-secondary small">
              <div className="d-flex justify-content-between text-secondary">
                <span>Tickets Subtotal ({selectedSeats.length} seats)</span>
                <span className="text-light">₹{pricing.subtotal}</span>
              </div>
              <div className="d-flex justify-content-between text-secondary">
                <span>Convenience Fees</span>
                <span className="text-light">₹{pricing.convenienceFee}</span>
              </div>
              <div className="d-flex justify-content-between text-secondary">
                <span>GST (18%)</span>
                <span className="text-light">₹{pricing.taxAmount}</span>
              </div>
              <div className="d-flex justify-content-between pt-2 border-top border-secondary fs-6 fw-bold text-white">
                <span>Total Amount</span>
                <span className="text-danger fs-5">₹{pricing.totalAmount}</span>
              </div>
            </div>

            <div className="alert alert-dark border-secondary p-2 mt-3 rounded-2 text-center text-secondary small d-flex align-items-center justify-content-center gap-1">
              <ShieldCheck size={14} className="text-success" /> End-to-end encrypted cinema transaction
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
