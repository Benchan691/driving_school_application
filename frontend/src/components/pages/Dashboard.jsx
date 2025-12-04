import React, { useEffect, useMemo, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { FiCalendar, FiBookOpen, FiAward, FiSettings } from 'react-icons/fi';
import '../../styles/pages/dashboard.scss';
import { useNavigate } from 'react-router-dom';
import { API_BASE } from '../../utils/apiBase';

const Dashboard = () => {
  const { user } = useAuth();


  // -----------------------------
  // Booking management (real backend API)
  // -----------------------------
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    when: 'all', // all | upcoming | past
    status: 'all', // all | scheduled | cancelled
    verification: 'all', // all | verified | pending
    search: ''
  });

  const token = useMemo(() => localStorage.getItem('accessToken'), []);
  const navigate = useNavigate();

  const fetchBookings = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/bookings`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data?.success) setBookings(Array.isArray(data.data) ? data.data : []);
    } catch (error) {
      console.error('Failed to fetch bookings:', error);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (token) {
      fetchBookings();
    }
  }, [token, fetchBookings]);

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

  const filteredBookings = useMemo(() => {
    const today = new Date().toISOString().slice(0,10);
    return bookings
      .filter(b => {
        const bookingDate = b.lesson_date || b.date;
        if (filters.when === 'upcoming' && !(bookingDate >= today && b.status !== 'cancelled')) return false;
        if (filters.when === 'past' && !(bookingDate < today)) return false;
        if (filters.status !== 'all' && b.status !== filters.status) return false;
        if (filters.verification === 'verified' && b.status !== 'confirmed') return false;
        if (filters.verification === 'pending' && b.status === 'confirmed') return false;
        if (filters.search) {
          const q = filters.search.toLowerCase();
          const bookingTime = b.start_time?.slice(0,5) || b.time;
          const text = `${bookingDate} ${bookingTime} ${b.instructor_name || ''} ${b.notes || ''}`.toLowerCase();
          if (!text.includes(q)) return false;
        }
        return true;
      })
      .sort((a,b)=> {
        const dateA = a.lesson_date || a.date || '';
        const dateB = b.lesson_date || b.date || '';
        const timeA = a.start_time?.slice(0,5) || a.time || '';
        const timeB = b.start_time?.slice(0,5) || b.time || '';
        return dateB.localeCompare(dateA) || timeB.localeCompare(timeA); // Most recent first
      });
  }, [bookings, filters]);

  return (
    <div className="dashboard-page">
      <div className="container">
        <motion.div
          className="dashboard-header"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1>Welcome back, {user?.name?.split(' ')[0] || 'User'}! 👋</h1>
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


        <div className="dashboard-content">
          <motion.div
            className="progress-section"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            viewport={{ once: true }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h3>Your Lessons</h3>
              <button className="btn btn-primary" onClick={() => navigate('/book')}>
                <FiCalendar />
                Book a Lesson
              </button>
            </div>

            <div className="filters" style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 24 }}>
              <div>
                <label className="label">When</label>
                <select className="input" value={filters.when} onChange={(e)=>setFilters({ ...filters, when: e.target.value })}>
                  <option value="all">All</option>
                  <option value="upcoming">Upcoming</option>
                  <option value="past">Past</option>
                </select>
              </div>
              <div>
                <label className="label">Status</label>
                <select className="input" value={filters.status} onChange={(e)=>setFilters({ ...filters, status: e.target.value })}>
                  <option value="all">All</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="pending">Pending</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
              <div>
                <label className="label">Verification</label>
                <select className="input" value={filters.verification} onChange={(e)=>setFilters({ ...filters, verification: e.target.value })}>
                  <option value="all">All</option>
                  <option value="verified">Verified</option>
                  <option value="pending">Pending</option>
                </select>
              </div>
              <div style={{ flex: 1, minWidth: 180 }}>
                <label className="label">Search</label>
                <input className="input" type="text" placeholder="Search by date, time, instructor, notes" value={filters.search} onChange={(e)=>setFilters({ ...filters, search: e.target.value })} />
              </div>
            </div>

            {loading && <p style={{ textAlign: 'center', padding: '40px' }}>Loading lessons...</p>}
            {!loading && filteredBookings.length === 0 && (
              <div style={{ textAlign: 'center', padding: '40px', background: '#f8f9fa', borderRadius: '8px' }}>
                <p style={{ color: '#64748b', marginBottom: '16px' }}>No lessons match your filters.</p>
                <button className="btn btn-primary" onClick={() => navigate('/book')}>
                  <FiCalendar />
                  Book Your First Lesson
                </button>
              </div>
            )}

            {!loading && filteredBookings.length > 0 && (
              <div className="table-card">
                <div className="table-responsive">
                  <table className="table table--styled">
                    <thead>
                      <tr>
                        <th>Reference</th>
                        <th>Date</th>
                        <th>Time</th>
                        <th>Duration</th>
                        <th>Instructor</th>
                        <th>Status</th>
                        <th>Notes</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredBookings.map(b => {
                        const duration = b.end_time && b.start_time ? 
                          (new Date(`2000-01-01T${b.end_time}`) - new Date(`2000-01-01T${b.start_time}`)) / 60000 : 
                          (b.duration_minutes || 60);
                        
                        // Format reference number
                        const bookingReference = b.booking_reference || b.id || 'N/A';
                        const referenceDisplay = typeof bookingReference === 'string' 
                          ? bookingReference.substring(0, 8).toUpperCase()
                          : bookingReference.toString().substring(0, 8).toUpperCase();
                        
                        return (
                          <tr key={b.id}>
                            <td>
                              <code style={{
                                background: '#f1f5f9',
                                padding: '4px 8px',
                                borderRadius: '4px',
                                fontSize: '12px',
                                fontFamily: 'monospace',
                                color: '#475569',
                                fontWeight: '600'
                              }}>
                                {referenceDisplay}
                              </code>
                            </td>
                            <td>{b.lesson_date || b.date}</td>
                            <td>{b.start_time?.slice(0,5) || b.time}</td>
                            <td>{duration} min</td>
                            <td>{b.instructor_name || '-'}</td>
                            <td>
                              <span 
                                className={`badge badge--status badge--${b.status}`}
                                style={{
                                  background: b.status === 'confirmed' ? '#10b981' : 
                                              b.status === 'pending' ? '#f59e0b' : 
                                              b.status === 'cancelled' ? '#ef4444' : 
                                              b.status === 'completed' ? '#6366f1' : '#64748b',
                                  color: 'white',
                                  padding: '4px 12px',
                                  borderRadius: '12px',
                                  fontSize: '12px',
                                  fontWeight: '500',
                                  display: 'inline-block'
                                }}
                              >
                                {b.status}
                              </span>
                            </td>
                            <td>{b.notes || '-'}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;