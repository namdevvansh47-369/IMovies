import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { Bell, CheckCheck, Clock, Ticket } from 'lucide-react';

const NotificationDropdown = () => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);

  const fetchNotifications = async () => {
    try {
      const res = await api.get('/notifications');
      if (res.data?.success) {
        setNotifications(res.data.notifications || []);
        setUnreadCount(res.data.unreadCount || 0);
      }
    } catch (err) {
      // Ignore
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 20000); // Polling every 20s
    return () => clearInterval(interval);
  }, []);

  const handleMarkAllRead = async () => {
    try {
      await api.put('/notifications/read-all');
      setNotifications(notifications.map((n) => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="position-relative">
      <button
        className="btn btn-dark btn-sm rounded-circle p-2 position-relative border border-secondary"
        onClick={() => setIsOpen(!isOpen)}
        title="Notifications"
        type="button"
      >
        <Bell size={18} className="text-light" />
        {unreadCount > 0 && (
          <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger" style={{ fontSize: '0.65rem' }}>
            {unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div
          className="position-absolute end-0 mt-2 p-0 cinema-card-static shadow-lg text-light"
          style={{ width: '330px', zIndex: 1100, maxHeight: '420px', overflowY: 'auto' }}
        >
          <div className="d-flex justify-content-between align-items-center p-3 border-bottom border-secondary">
            <h6 className="m-0 fw-bold d-flex align-items-center gap-2">
              <Bell size={16} className="text-danger" /> Notifications
            </h6>
            {unreadCount > 0 && (
              <button
                className="btn btn-link btn-sm text-decoration-none text-info p-0 d-flex align-items-center gap-1"
                style={{ fontSize: '0.78rem' }}
                onClick={handleMarkAllRead}
              >
                <CheckCheck size={14} /> Mark all read
              </button>
            )}
          </div>

          <div className="list-group list-group-flush">
            {notifications.length === 0 ? (
              <div className="p-4 text-center text-secondary small">
                No notifications right now.
              </div>
            ) : (
              notifications.map((n) => (
                <div
                  key={n._id}
                  className={`list-group-item bg-transparent text-light border-secondary p-3 ${
                    !n.read ? 'bg-black bg-opacity-25' : ''
                  }`}
                >
                  <div className="d-flex justify-content-between align-items-start mb-1">
                    <span className="fw-semibold small d-flex align-items-center gap-1">
                      <Ticket size={14} className="text-danger" /> {n.title}
                    </span>
                    {!n.read && (
                      <span className="badge bg-danger rounded-circle p-1" style={{ width: 6, height: 6 }}></span>
                    )}
                  </div>
                  <p className="small text-secondary mb-1" style={{ fontSize: '0.8rem', lineHeight: '1.3' }}>
                    {n.message}
                  </p>
                  <div className="text-muted d-flex align-items-center gap-1" style={{ fontSize: '0.7rem' }}>
                    <Clock size={11} /> {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationDropdown;
