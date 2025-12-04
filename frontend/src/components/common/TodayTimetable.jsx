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
  
  // Get selected date's bookings - show confirmed and pending bookings
  const dateBookings = useMemo(() => {
    const filtered = bookings.filter(booking => {
      const bookingDate = booking.lesson_date || booking.date;
      const bookingStatus = booking.status;
      
      // Show bookings that are confirmed or pending (not cancelled)
      return bookingDate === selectedDateStr && 
             (bookingStatus === 'confirmed' || bookingStatus === 'pending');
    });
    
    // Debug logging
    console.log('TodayTimetable Debug:', {
      selectedDateStr,
      totalBookings: bookings.length,
      dateBookings: filtered.length,
      allBookingsForDate: bookings.filter(b => (b.lesson_date || b.date) === selectedDateStr),
      confirmedBookingsForDate: bookings.filter(b => (b.lesson_date || b.date) === selectedDateStr && b.status === 'confirmed')
    });
    
    return filtered;
  }, [bookings, selectedDateStr]);

  // Create a map of time slots to bookings, spanning multiple slots based on duration
  const slotBookingsMap = useMemo(() => {
    const map = new Map();
    
    dateBookings.forEach(booking => {
      const startTime = booking.start_time?.slice(0, 5) || booking.time;
      const duration = booking.end_time && booking.start_time ? 
        (new Date(`2000-01-01T${booking.end_time}`) - new Date(`2000-01-01T${booking.start_time}`)) / 60000 :
        (booking.duration_minutes || 60);
      
      // Calculate how many 30-minute slots this booking spans
      const [startHour, startMin] = startTime.split(':').map(Number);
      const startMinutes = startHour * 60 + startMin;
      const endMinutes = startMinutes + duration;
      
      // Mark all slots that fall within this booking's time range
      allSlots.forEach(slot => {
        const [slotHour, slotMin] = slot.split(':').map(Number);
        const slotMinutes = slotHour * 60 + slotMin;
        
        // Check if this slot falls within the booking duration
        if (slotMinutes >= startMinutes && slotMinutes < endMinutes) {
          // Store booking with indicator if it's the first slot
          map.set(slot, {
            ...booking,
            isFirstSlot: slot === startTime,
            spanCount: Math.ceil(duration / 30) // How many slots total
          });
        }
      });
    });
    
    return map;
  }, [dateBookings, allSlots]);


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
                      {booking.isFirstSlot ? (
                        <>
                          <div className="student-name">
                            {booking.student ? (booking.student.name || `User #${booking.student.id?.slice(0, 8)}`) : 
                             booking.user ? (booking.user.name || `User #${booking.user.id?.slice(0, 8)}`) : 
                             `User #${(booking.student_id || booking.user_id)?.slice(0, 8)}`}
                          </div>
                          {booking.notes && (
                            <div className="booking-notes" title={booking.notes}>
                              📝 {booking.notes.length > 20 ? `${booking.notes.substring(0, 20)}...` : booking.notes}
                            </div>
                          )}
                          <div style={{ fontSize: '11px', color: '#64748b', marginTop: '4px' }}>
                            Status: {booking.status}
                          </div>
                        </>
                      ) : (
                        <div style={{ color: '#94a3b8', fontSize: '13px', fontStyle: 'italic' }}>
                          ↑ Continued
                        </div>
                      )}
                    </div>
                  ) : (
                    <span className="available">Available</span>
                  )}
                </div>

                <div className="instructor-info">
                  {booking ? (
                    booking.isFirstSlot ? 
                      (booking.instructor?.user?.first_name || booking.instructor_name || 'TBD') : 
                      '↑'
                  ) : '-'}
                </div>

                <div className="duration-info">
                  {booking ? (
                    booking.isFirstSlot ? (
                      (() => {
                        const start = new Date(`2000-01-01T${booking.start_time || booking.time}`);
                        const end = new Date(`2000-01-01T${booking.end_time || booking.time}`);
                        const durationMinutes = (end - start) / 60000 || 60;
                        return `${durationMinutes}m`;
                      })()
                    ) : '↑'
                  ) : '-'}
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
