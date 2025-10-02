import React, { useMemo, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { FiClock, FiAlertCircle, FiRefreshCw } from 'react-icons/fi';
import { getTimeSlotsForDate } from '../../utils/schoolConfig';

const TodayTimetable = ({ bookings = [], onRefresh }) => {
  // Helper function to format dates in local timezone (avoiding timezone issues)
  const formatDateLocal = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const today = useMemo(() => new Date(), []);
  const [selectedDate, setSelectedDate] = useState(today);
  const selectedDateStr = useMemo(() => formatDateLocal(selectedDate), [selectedDate]);
  const [lastRefresh, setLastRefresh] = useState(Date.now());

  // Auto-refresh every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      if (onRefresh) {
        onRefresh();
        setLastRefresh(Date.now());
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [onRefresh]);
  
  // Get all available time slots for selected date
  const allSlots = useMemo(() => getTimeSlotsForDate(selectedDate), [selectedDate]);
  
  // Get selected date's bookings - only scheduled and verified
  const dateBookings = useMemo(() => {
    const filtered = bookings.filter(booking => 
      booking.date === selectedDateStr && 
      booking.status === 'scheduled' && 
      booking.is_verified
    );
    
    // Debug logging
    console.log('TodayTimetable Debug:', {
      selectedDateStr,
      totalBookings: bookings.length,
      dateBookings: filtered.length,
      allBookingsForDate: bookings.filter(b => b.date === selectedDateStr),
      verifiedBookingsForDate: bookings.filter(b => b.date === selectedDateStr && b.is_verified)
    });
    
    return filtered;
  }, [bookings, selectedDateStr]);

  // Create a map of time slots to bookings for easy lookup
  const slotBookingsMap = useMemo(() => {
    const map = new Map();
    dateBookings.forEach(booking => {
      map.set(booking.time, booking);
    });
    return map;
  }, [dateBookings]);


  return (
    <div className="today-timetable">
      <div className="timetable-header">
        <h3>
          <FiClock />
          Daily Schedule ({selectedDate.toLocaleDateString('en-US', { 
            weekday: 'long', 
            month: 'short', 
            day: 'numeric' 
          })})
        </h3>
        <div className="timetable-stats">
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <label style={{ fontSize: '14px', color: '#64748b' }}>Date:</label>
              <input 
                type="date" 
                value={selectedDateStr}
                onChange={(e) => setSelectedDate(new Date(e.target.value))}
                className="input"
                style={{ padding: '4px 8px', fontSize: '14px' }}
              />
            </div>
            <span className="stat-item scheduled">
              <FiClock />
              {dateBookings.length} Lessons
            </span>
            {onRefresh && (
              <button 
                className="btn btn-sm btn-outline" 
                onClick={() => {
                  onRefresh();
                  setLastRefresh(Date.now());
                }}
                title={`Last refreshed: ${new Date(lastRefresh).toLocaleTimeString()}`}
              >
                <FiRefreshCw />
                Refresh
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="timetable-grid">
        <div className="timetable-columns">
          <div className="column-header">Time</div>
          <div className="column-header">Student</div>
          <div className="column-header">Instructor</div>
          <div className="column-header">Duration</div>
        </div>

        <div className="timetable-slots">
          {allSlots.map((slot) => {
            const booking = slotBookingsMap.get(slot);
            const slotDateTime = new Date(`${selectedDateStr}T${slot}:00`);
            const now = new Date();
            const isPast = slotDateTime < now;
            const isCurrent = Math.abs(slotDateTime - now) < 30 * 60 * 1000; // Within 30 minutes

            return (
              <motion.div
                key={slot}
                className={`timetable-row ${isPast ? 'past' : ''} ${isCurrent ? 'current' : ''}`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <div className="time-slot">
                  <span className="time">{slot}</span>
                  {isCurrent && (
                    <span className="current-indicator">
                      <FiAlertCircle />
                      Now
                    </span>
                  )}
                </div>

                <div className="student-info">
                  {booking ? (
                    <div>
                      <div className="student-name">
                        {booking.user ? `${booking.user.first_name} ${booking.user.last_name}` : `User #${booking.user_id}`}
                      </div>
                      {booking.notes && (
                        <div className="booking-notes" title={booking.notes}>
                          📝 {booking.notes.length > 20 ? `${booking.notes.substring(0, 20)}...` : booking.notes}
                        </div>
                      )}
                    </div>
                  ) : (
                    <span className="available">Available</span>
                  )}
                </div>

                <div className="instructor-info">
                  {booking ? (booking.instructor_name || 'TBD') : '-'}
                </div>

                <div className="duration-info">
                  {booking ? `${booking.duration_minutes || 60}m` : '-'}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {dateBookings.length === 0 && (
        <div className="no-bookings">
          <FiClock />
          <p>No lessons scheduled for {selectedDate.toLocaleDateString('en-US', { 
            weekday: 'long', 
            month: 'short', 
            day: 'numeric' 
          })}</p>
        </div>
      )}
    </div>
  );
};

export default TodayTimetable;
