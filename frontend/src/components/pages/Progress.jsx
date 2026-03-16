import React, { useEffect, useMemo, useState } from 'react';
import { API_BASE } from '../../utils/apiBase';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { FiArrowLeft } from 'react-icons/fi';
import '../../styles/pages/progress.scss';

const Progress = () => {
  const { accessToken } = useAuth();
  const navigate = useNavigate();
  const token = useMemo(() => accessToken || localStorage.getItem('accessToken'), [accessToken]);
  const [all, setAll] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    when: 'all', // all | upcoming | past
    status: 'all', // all | scheduled | cancelled
    verification: 'all', // all | verified | pending
    search: ''
  });

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
      const res = await fetch(`${API_BASE}/api/bookings`, { headers: { Authorization: `Bearer ${token}` } });
        const data = await res.json();
        if (data?.success) setAll(Array.isArray(data.data) ? data.data : []);
      } finally { setLoading(false); }
    };
    if (token) load();
  }, [token]);

  const filtered = useMemo(() => {
    const today = new Date().toISOString().slice(0,10);
    return all
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
        return dateA.localeCompare(dateB) || timeA.localeCompare(timeB);
      });
  }, [all, filters]);

  return (
    <div className="dashboard-page progress-page">
      <div className="container">
        <motion.div className="dashboard-header" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h1>Your Progress</h1>
              <p>All your lessons (past and future)</p>
            </div>
            <button 
              className="btn btn-outline" 
              onClick={() => navigate('/dashboard')}
              style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
            >
              <FiArrowLeft />
              Return to Dashboard
            </button>
          </div>
        </motion.div>

        <div className="filters" style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 12 }}>
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
              <option value="scheduled">Scheduled</option>
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

        {loading && <p>Loading...</p>}
        {!loading && filtered.length === 0 && <p>No lessons match your filters.</p>}

        {!loading && filtered.length > 0 && (
          <div className="table-card">
            <div className="table-responsive">
              <table className="table table--styled">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Time</th>
                  <th>Duration</th>
                  <th>Instructor</th>
                  <th>Status</th>
                  <th>Notes</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(b => {
                  const duration = b.end_time && b.start_time ? 
                    (new Date(`2000-01-01T${b.end_time}`) - new Date(`2000-01-01T${b.start_time}`)) / 60000 : 
                    (b.duration_minutes || 60);
                  return (
                  <tr key={b.id}>
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
                );})}
              </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Progress;


