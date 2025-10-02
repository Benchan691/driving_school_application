import React, { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { FiUser, FiCalendar, FiBookOpen, FiAward, FiSettings, FiPlus, FiTrash2 } from 'react-icons/fi';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import '../../styles/pages/dashboard.scss';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { API_BASE } from '../../utils/apiBase';
import { getTimeSlotsForDate } from '../../utils/schoolConfig';

const Dashboard = () => {
  const { user } = useAuth();

  // Helper function to format dates in local timezone (avoiding timezone issues)
  const formatDateLocal = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // -----------------------------
  // Booking management (real backend API)
  // -----------------------------
  const [bookings, setBookings] = useState([]);
  const [form, setForm] = useState({ date: '', time: '', notes: '', duration: 60 });
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(false);
  const [calendarDate, setCalendarDate] = useState(new Date());

  const token = useMemo(() => localStorage.getItem('accessToken'), []);
  const navigate = useNavigate();

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/bookings`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data?.success) setBookings(data.data);
    } catch {}
    setLoading(false);
  };


  useEffect(() => {
    if (token) {
      fetchBookings();
    }
  }, [token]);

  // Build daily availability based on business hours and selected date
  const allSlots = useMemo(() => getTimeSlotsForDate(calendarDate), [calendarDate]);
  const selectedDateStr = useMemo(() => formatDateLocal(calendarDate), [calendarDate]);
  const today = useMemo(() => { 
    const d = new Date(); 
    // Set to start of day in local timezone to avoid timezone issues
    d.setHours(0, 0, 0, 0); 
    return d; 
  }, []);
  const todayStr = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return formatDateLocal(d);
  }, []);

  // -----------------------------
  // Derived stats from bookings (live from backend)
  // -----------------------------
  const now = useMemo(() => new Date(), []);
  const toDateTime = (b) => {
    try {
      const [hh, mm] = (b.time || '00:00').split(':').map(Number);
      const d = new Date(b.date + 'T00:00:00');
      d.setHours(hh || 0, mm || 0, 0, 0);
      return d;
    } catch {
      return new Date(b.date + 'T00:00:00');
    }
  };

  const lessonsCompleted = useMemo(() => {
    return bookings.filter(b => {
      const dt = toDateTime(b);
      const isPast = dt < now;
      const isCancelled = b.status === 'cancelled';
      // Treat verified past lessons as completed when explicit status isn't present
      const markedCompleted = isPast && b.is_verified && !isCancelled;
      return markedCompleted;
    }).length;
  }, [bookings, now]);

  const upcomingLessons = useMemo(() => {
    return bookings.filter(b => {
      const dt = toDateTime(b);
      const isFuture = dt >= now;
      const isCancelled = b.status === 'cancelled';
      return isFuture && !isCancelled;
    }).length;
  }, [bookings, now]);

  const progressScore = useMemo(() => {
    const total = lessonsCompleted + upcomingLessons;
    if (!total) return 0;
    return Math.round((lessonsCompleted / total) * 100);
  }, [lessonsCompleted, upcomingLessons]);

  const overlaps = (startA, durA, startB, durB) => {
    const toMins = (hhmm) => { const [h,m] = hhmm.split(':').map(Number); return h*60+m; };
    const a1 = toMins(startA), a2 = a1 + durA;
    const b1 = toMins(startB), b2 = b1 + durB;
    return Math.max(a1, b1) < Math.max(Math.min(a2, b2), Math.min(a1, b1));
  };

  const availableSlots = useMemo(() => {
    // Only verified bookings block the time
    const dayBookings = bookings.filter(b => b.date === selectedDateStr && b.is_verified);
    const duration = Number(form.duration) === 90 ? 90 : 60;
    return allSlots.filter(slot => !dayBookings.some(b => overlaps(slot, duration, b.time, b.duration_minutes || 60)));
  }, [bookings, selectedDateStr, form.duration]);

  const resetForm = () => {
    setForm({ date: '', time: '', notes: '', duration: 60 });
    setCalendarDate(new Date()); // Reset calendar to today
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!form.date || !form.time) {
      toast.error('Please fill in all required fields');
      return;
    }
    
    // Check if the selected date is in the past
    const selectedDate = new Date(form.date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (selectedDate < today) {
      toast.error('Cannot book lessons for past dates');
      return;
    }
    
    setSubmitting(true);
    try {
      const res = await fetch(`${API_BASE}/api/bookings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          date: form.date,
          time: form.time,
          instructor_name: 'Instructor',
          notes: form.notes || '',
          duration_minutes: Number(form.duration) === 90 ? 90 : 60
        })
      });
      const data = await res.json();
      if (data?.success) {
        setBookings((prev) => [data.data, ...prev]);
        resetForm();
        toast.success('Your booking has been scheduled! Please check your email for confirmation.');
        setTimeout(() => navigate('/'), 900);
      } else {
        toast.error(data.message || 'Failed to create booking');
      }
    } catch (error) {
      toast.error('Failed to create booking');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = async (id) => {
    try {
      const res = await fetch(`${API_BASE}/api/bookings/${id}/cancel`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data?.success) setBookings((prev) => prev.map(b => b.id === id ? data.data : b));
    } catch {}
  };

  const handleDelete = async (id) => {
    try {
      const res = await fetch(`${API_BASE}/api/bookings/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data?.success) setBookings((prev) => prev.filter(b => b.id !== id));
    } catch {}
  };

  return (
    <div className="dashboard-page">
      <div className="container">
        <motion.div
          className="dashboard-header"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1>Welcome back, {user?.first_name || 'User'}! 👋</h1>
          <p>Here's your driving school dashboard</p>
        </motion.div>

        <div className="dashboard-stats grid grid-4">
          <motion.div
            className="stat-card"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            viewport={{ once: true }}
          >
            <div className="stat-icon">
              <FiBookOpen />
            </div>
            <div className="stat-content">
              <h3>{lessonsCompleted}</h3>
              <p>Lessons Completed</p>
            </div>
          </motion.div>

          <motion.div
            className="stat-card"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
          >
            <div className="stat-icon">
              <FiCalendar />
            </div>
            <div className="stat-content">
              <h3>{upcomingLessons}</h3>
              <p>Upcoming Lessons</p>
            </div>
          </motion.div>

          <motion.div
            className="stat-card"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            viewport={{ once: true }}
          >
            <div className="stat-icon">
              <FiAward />
            </div>
            <div className="stat-content">
              <h3>{progressScore}%</h3>
              <p>Progress Score</p>
            </div>
          </motion.div>

          
        </div>


        <div className="dashboard-content grid grid-2">
          <motion.div
            className="recent-lessons"
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            viewport={{ once: true }}
          >
            <h3>Your Bookings</h3>
            <div className="booking-card">
              <div className="booking-card__header">
                <FiCalendar />
                <h4>Select a date</h4>
              </div>
              <div className="calendar-wrapper">
                <Calendar 
                  value={calendarDate} 
                  onChange={(d) => {
                    setCalendarDate(d);
                    setForm(prev => ({ ...prev, date: formatDateLocal(d) }));
                  }} 
                  minDetail="month" 
                  showNeighboringMonth={false} 
                  minDate={today} 
                />
              </div>
              <div className="availability">
                <div className="availability__header">
                  <h5>Available time slots</h5>
                  <span className="availability__date">{form.date || selectedDateStr}</span>
                  {form.date && form.date !== selectedDateStr && (
                    <span className="availability__warning" style={{ 
                      fontSize: '12px', 
                      color: '#f59e0b', 
                      marginLeft: '8px' 
                    }}>
                      ⚠️ Date mismatch with calendar
                    </span>
                  )}
                </div>
                <div className="slots">
                  {availableSlots.map((slot) => (
                    <button 
                      key={slot} 
                      type="button" 
                      className={`chip ${form.time === slot && (form.date || selectedDateStr) === selectedDateStr ? 'chip--active' : ''}`} 
                      onClick={() => {
                        const currentDate = form.date || selectedDateStr;
                        setForm((f) => ({ ...f, date: currentDate, time: slot }));
                      }}
                    >
                      {slot}
                    </button>
                  ))}
                  {availableSlots.length === 0 && (
                    <div style={{ textAlign: 'center', padding: '20px' }}>
                      <span className="muted">No available slots for this date.</span>
                      <br />
                      <small style={{ color: '#64748b' }}>Try selecting a different date from the calendar above.</small>
                    </div>
                  )}
                </div>
              </div>

              <form className="booking-form" onSubmit={handleCreate}>
                <div className="booking-card__header" style={{ marginTop: 16 }}>
                  <FiBookOpen />
                  <h4>Book a lesson</h4>
                </div>
                <div className="form-grid">
                  <div className="form-field">
                    <label className="label">Date</label>
                    <input 
                      className="input" 
                      type="date" 
                      value={form.date || selectedDateStr} 
                      min={todayStr} 
                      onChange={(e) => {
                        const selectedDate = e.target.value;
                        // Update both form and calendar date
                        setForm({ ...form, date: selectedDate });
                        setCalendarDate(new Date(selectedDate));
                      }} 
                      required 
                    />
                    <small className="hint">Pick from the calendar or adjust here</small>
                  </div>
                  <div className="form-field">
                    <label className="label">Time</label>
                    <input className="input" type="time" value={form.time} onChange={(e) => setForm({ ...form, time: e.target.value })} required />
                    <small className="hint">Click a slot above to auto-fill</small>
                  </div>
                  <div className="form-field">
                    <label className="label">Duration</label>
                    <select className="input" value={form.duration} onChange={(e) => setForm({ ...form, duration: Number(e.target.value) })}>
                      <option value={60}>1 hour</option>
                      <option value={90}>1.5 hours</option>
                    </select>
                    <small className="hint">Longer lessons reduce available slots</small>
                  </div>
                  
                  
                  <div className="form-field form-field--full">
                    <label className="label">Notes</label>
                    <input className="input" type="text" placeholder="Any special requests or notes" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
                  </div>
                </div>
                <div className="actions">
                  <button type="submit" className="btn btn-primary" disabled={submitting}>
                    <FiPlus /> Create Booking
                  </button>
                </div>
              </form>
            </div>

            {/* lesson-list removed per request */}
          </motion.div>

          <motion.div
            className="quick-actions"
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            viewport={{ once: true }}
          >
            <h3>Quick Actions</h3>
            <div className="action-buttons">
              <button className="btn btn-primary btn-block">
                <FiCalendar />
                Book New Lesson
              </button>
               <button className="btn btn-outline btn-block" onClick={() => navigate('/progress')}>
                 <FiBookOpen />
                 View Progress
               </button>
             <button className="btn btn-outline btn-block" onClick={() => navigate('/profile')}>
                <FiSettings />
                Account Settings
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;