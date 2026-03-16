import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { FiCalendar, FiClock, FiUser, FiMail, FiPhone } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { API_BASE } from '../../utils/apiBase';
import { getTimeSlotsForDate } from '../../utils/schoolConfig';
import { useAuth } from '../../context/AuthContext';
import '../../styles/pages/dashboard.scss';

const PublicBooking = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  // Helper function to get current time in Vancouver timezone
  const getVancouverTime = () => {
    const now = new Date();
    const vancouverTime = new Date(now.toLocaleString('en-US', { timeZone: 'America/Vancouver' }));
    return vancouverTime;
  };

  // Helper function to format dates WITHOUT timezone conversion
  const formatDateLocal = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const [form, setForm] = useState({
    name: '',
    email: '',
    emailConfirm: '',
    phone: '',
    date: '',
    time: '',
    notes: '',
    duration: 60
  });
  const [submitting, setSubmitting] = useState(false);
  const [bookings, setBookings] = useState([]); // For checking availability

  // Auto-fill form when user is logged in
  useEffect(() => {
    if (user) {
      setForm(prev => ({
        ...prev,
        name: user.name || '',
        email: user.email || '',
        emailConfirm: user.email || '',
        phone: user.phone || ''
      }));
    }
  }, [user]);
  
  // Initialize calendar to Vancouver time
  const [calendarDate, setCalendarDate] = useState(() => {
    const now = new Date();
    return new Date(now.toLocaleString('en-US', { timeZone: 'America/Vancouver' }));
  });

  const selectedDateStr = useMemo(() => formatDateLocal(calendarDate), [calendarDate]);
  
  const today = useMemo(() => { 
    const vancouverTime = getVancouverTime();
    vancouverTime.setHours(0, 0, 0, 0); 
    return vancouverTime; 
  }, []);
  
  const todayStr = useMemo(() => {
    const vancouverTime = getVancouverTime();
    return formatDateLocal(vancouverTime);
  }, []);

  // Build daily availability based on business hours and selected date
  const allSlots = useMemo(() => getTimeSlotsForDate(calendarDate), [calendarDate]);

  // Fetch existing bookings to check availability
  const fetchBookings = useCallback(async (date) => {
    if (!date) return;
    try {
      const res = await fetch(`${API_BASE}/api/bookings/availability?date=${date}`);
      const data = await res.json();
      if (data?.success) {
        setBookings(data.data || []);
      } else {
        console.error('Failed to fetch bookings:', data.message);
        setBookings([]);
      }
    } catch (error) {
      console.error('Error fetching bookings:', error);
      setBookings([]);
    }
  }, []);

  // Fetch bookings when date changes
  useEffect(() => {
    if (selectedDateStr) {
      fetchBookings(selectedDateStr);
    }
  }, [selectedDateStr, fetchBookings]);

  // Helper function to check if a time slot overlaps with any booking
  const isSlotBooked = (slot, bookings) => {
    if (!bookings || bookings.length === 0) return false;
    
    const [slotHour, slotMin] = slot.split(':').map(Number);
    const slotMinutes = slotHour * 60 + slotMin;
    
    // Time slots are typically 30 minutes, so check if slot overlaps with booking
    // A slot is booked if the slot start time falls within the booking's time range
    return bookings.some(booking => {
      const startTime = booking.start_time || booking.time;
      const endTime = booking.end_time;
      
      if (!startTime) return false;
      
      // Handle time format (HH:MM:SS or HH:MM)
      const startTimeStr = typeof startTime === 'string' ? startTime : String(startTime);
      const startParts = startTimeStr.split(':').map(Number);
      const startMinutes = startParts[0] * 60 + (startParts[1] || 0);
      
      let endMinutes;
      if (endTime) {
        const endTimeStr = typeof endTime === 'string' ? endTime : String(endTime);
        const endParts = endTimeStr.split(':').map(Number);
        endMinutes = endParts[0] * 60 + (endParts[1] || 0);
      } else if (booking.duration_minutes) {
        // Calculate end time from duration_minutes if end_time is not available
        endMinutes = startMinutes + booking.duration_minutes;
      } else {
        // Default to 60 minutes if neither end_time nor duration_minutes is available
        endMinutes = startMinutes + 60;
      }
      
      // Check if slot start time falls within booking time range
      // Slot is booked if: slotStart >= bookingStart && slotStart < bookingEnd
      return slotMinutes >= startMinutes && slotMinutes < endMinutes;
    });
  };

  // Filter available slots based on existing bookings
  const availableSlots = useMemo(() => {
    // Filter bookings for the selected date with confirmed or pending status
    const selectedDateBookings = bookings.filter(b => {
      const bookingDate = b.lesson_date || b.date;
      const bookingStatus = b.status;
      return bookingDate === selectedDateStr && 
             (bookingStatus === 'confirmed' || bookingStatus === 'pending');
    });
    
    // Filter out slots that overlap with any booking
    let slots = allSlots.filter(slot => !isSlotBooked(slot, selectedDateBookings));
    
    // If selected date is today, filter out past time slots (using Vancouver time)
    const isToday = selectedDateStr === todayStr;
    if (isToday) {
      const vancouverTime = getVancouverTime();
      const currentHour = vancouverTime.getHours();
      const currentMinute = vancouverTime.getMinutes();
      const currentTimeInMinutes = currentHour * 60 + currentMinute;
      
      slots = slots.filter(slot => {
        const [slotHour, slotMinute] = slot.split(':').map(Number);
        const slotTimeInMinutes = slotHour * 60 + slotMinute;
        return slotTimeInMinutes > currentTimeInMinutes;
      });
    }
    
    return slots;
  }, [bookings, selectedDateStr, allSlots, todayStr]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!form.name || !form.email || !form.emailConfirm || !form.date || !form.time) {
      toast.error('Please fill in all required fields');
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(form.email)) {
      toast.error('Please enter a valid email address');
      return;
    }

    // Validate email confirmation
    if (form.email !== form.emailConfirm) {
      toast.error('Email addresses do not match. Please check and try again.');
      return;
    }

    // Check if the selected date is in the past (using Vancouver time)
    const selectedDate = new Date(form.date + 'T00:00:00');
    const vancouverToday = getVancouverTime();
    vancouverToday.setHours(0, 0, 0, 0);
    
    if (selectedDate < vancouverToday) {
      toast.error('Cannot book lessons for past dates (Vancouver time)');
      return;
    }
    
    // Check if the selected time is in the past (for today only, using Vancouver time)
    if (form.date === todayStr) {
      const [selectedHour, selectedMinute] = form.time.split(':').map(Number);
      const selectedTimeInMinutes = selectedHour * 60 + selectedMinute;
      const vancouverNow = getVancouverTime();
      const currentTimeInMinutes = vancouverNow.getHours() * 60 + vancouverNow.getMinutes();
      
      if (selectedTimeInMinutes <= currentTimeInMinutes) {
        toast.error('Cannot book lessons for past times (Vancouver time). Please select a future time slot.');
        return;
      }
    }

    setSubmitting(true);
    try {
      const res = await fetch(`${API_BASE}/api/bookings/public`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          phone: form.phone || undefined,
          date: form.date,
          time: form.time,
          notes: form.notes || '',
          duration_minutes: Number(form.duration) === 90 ? 90 : 60
        })
      });

      const data = await res.json();
      
      if (data?.success) {
        // Navigate to confirmation page with booking data
        navigate('/booking-confirmation', {
          state: {
            booking: data.data,
            isNewUser: data.data.is_new_user
          }
        });
      } else {
        toast.error(data.message || 'Failed to create booking');
      }
    } catch (error) {
      console.error('Booking error:', error);
      toast.error('Failed to create booking. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="dashboard-container" style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h1 style={{ fontSize: '2.5rem', marginBottom: '0.5rem', color: '#1e40af' }}>
            Book a Driving Lesson
          </h1>
          <p style={{ fontSize: '1.1rem', color: '#64748b' }}>
            No account required! Fill out the form below to book your lesson.
          </p>
        </div>

        <div style={{ 
          background: '#eff6ff', 
          border: '1px solid #3b82f6', 
          borderRadius: '8px', 
          padding: '16px', 
          marginBottom: '2rem',
          fontSize: '14px',
          color: '#1e40af'
        }}>
          ⏰ <strong>Important:</strong> All times are in Vancouver/Pacific Time (Canada).
          <br />
          <strong>Current Vancouver Time:</strong> {new Date().toLocaleString('en-US', { 
            timeZone: 'America/Vancouver',
            dateStyle: 'medium',
            timeStyle: 'short'
          })}
          <br />
          <small>Please adjust your booking time accordingly if you're in a different timezone.</small>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '2rem' }}>
          {/* Calendar */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <div className="booking-card">
              <div className="booking-card__header">
                <FiCalendar />
                <h4>Select Date</h4>
              </div>
              <Calendar
                onChange={(date) => {
                  setCalendarDate(date);
                  setForm({ ...form, date: formatDateLocal(date) });
                }}
                value={calendarDate}
                minDate={today}
                className="booking-calendar"
              />
            </div>

            {/* Time Slots */}
            <div className="booking-card" style={{ marginTop: '1rem' }}>
              <div className="booking-card__header">
                <FiClock />
                <h4>Available Times</h4>
              </div>
              <div className="time-slots">
                {availableSlots.map(slot => (
                  <button
                    key={slot}
                    type="button"
                    className={`time-slot ${form.time === slot ? 'time-slot--selected' : ''}`}
                    onClick={() => setForm({ ...form, time: slot })}
                  >
                    {slot}
                  </button>
                ))}
                {availableSlots.length === 0 && (
                  <div style={{ textAlign: 'center', padding: '20px' }}>
                    <span className="muted">No available slots for this date.</span>
                    <br />
                    <small style={{ color: '#64748b' }}>Try selecting a different date.</small>
                  </div>
                )}
              </div>
            </div>
          </motion.div>

          {/* Booking Form */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <form className="booking-form" onSubmit={handleSubmit}>
              <div className="booking-card__header">
                <FiUser />
                <h4>Your Information</h4>
              </div>

              {user && (
                <div style={{ 
                  background: '#dcfce7', 
                  border: '1px solid #16a34a', 
                  borderRadius: '8px', 
                  padding: '12px', 
                  marginBottom: '16px',
                  fontSize: '13px',
                  color: '#166534'
                }}>
                  ✓ <strong>Logged in as {user.name || user.email}</strong> - Your information has been pre-filled. You can edit if needed.
                </div>
              )}

              <div className="form-grid">
                <div className="form-field form-field--full">
                  <label className="label">
                    <FiUser style={{ marginRight: '8px' }} />
                    Full Name *
                  </label>
                  <input
                    className="input"
                    type="text"
                    placeholder="John Doe"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    required
                    minLength={2}
                  />
                  <small className="hint">Enter your first and last name</small>
                </div>

                <div className="form-field form-field--full">
                  <label className="label">
                    <FiMail style={{ marginRight: '8px' }} />
                    Email Address *
                  </label>
                  <input
                    className="input"
                    type="email"
                    placeholder="john@example.com"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    required
                  />
                  <small className="hint">We'll send booking confirmation to this email</small>
                </div>

                <div className="form-field form-field--full">
                  <label className="label">
                    <FiMail style={{ marginRight: '8px' }} />
                    Confirm Email Address *
                  </label>
                  <input
                    className="input"
                    type="email"
                    placeholder="john@example.com"
                    value={form.emailConfirm}
                    onChange={(e) => setForm({ ...form, emailConfirm: e.target.value })}
                    required
                  />
                  <small className="hint">Please re-enter your email address to confirm</small>
                  {form.emailConfirm && form.email !== form.emailConfirm && (
                    <small style={{ color: '#ef4444', display: 'block', marginTop: '4px' }}>
                      Email addresses do not match
                    </small>
                  )}
                </div>

                <div className="form-field form-field--full">
                  <label className="label">
                    <FiPhone style={{ marginRight: '8px' }} />
                    Phone Number (Optional)
                  </label>
                  <input
                    className="input"
                    type="tel"
                    placeholder="+1 (604) 123-4567"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  />
                  <small className="hint">Help us contact you if needed</small>
                </div>

                <div className="form-field">
                  <label className="label">Date *</label>
                  <input
                    className="input"
                    type="date"
                    value={form.date || selectedDateStr}
                    min={todayStr}
                    onChange={(e) => {
                      const selectedDate = e.target.value;
                      setForm({ ...form, date: selectedDate });
                      const [year, month, day] = selectedDate.split('-').map(Number);
                      const newCalendarDate = new Date(year, month - 1, day, 12, 0, 0);
                      setCalendarDate(newCalendarDate);
                    }}
                    required
                  />
                  <small className="hint">Syncs with calendar</small>
                </div>

                <div className="form-field">
                  <label className="label">Time *</label>
                  <input
                    className="input"
                    type="time"
                    value={form.time}
                    onChange={(e) => setForm({ ...form, time: e.target.value })}
                    required
                  />
                  <small className="hint">Click a slot or enter manually</small>
                </div>

                <div className="form-field">
                  <label className="label">Duration *</label>
                  <select
                    className="input"
                    value={form.duration}
                    onChange={(e) => setForm({ ...form, duration: Number(e.target.value) })}
                    required
                  >
                    <option value={60}>1 hour</option>
                    <option value={90}>1.5 hours</option>
                  </select>
                </div>

                <div className="form-field form-field--full">
                  <label className="label">Notes (Optional)</label>
                  <textarea
                    className="input"
                    rows="3"
                    placeholder="Any special requests or notes"
                    value={form.notes}
                    onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  />
                </div>
              </div>

              <div style={{ 
                background: '#fef3c7', 
                border: '1px solid #f59e0b', 
                borderRadius: '8px', 
                padding: '12px', 
                marginBottom: '16px',
                fontSize: '13px',
                color: '#92400e'
              }}>
                ℹ️ <strong>Note:</strong> If you don't have an account, we'll create one for you automatically. 
                You'll receive login credentials via email.
              </div>

              <div className="actions">
                <button type="submit" className="btn btn-primary" disabled={submitting}>
                  {submitting ? 'Booking...' : 'Book Lesson'}
                </button>
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={() => navigate('/login')}
                  style={{ marginLeft: '12px' }}
                >
                  Already have an account? Login
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
};

export default PublicBooking;

