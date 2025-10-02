import React, { useEffect, useMemo, useState } from 'react';
import { API_BASE } from '../../utils/apiBase';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import '../../styles/pages/progress.scss';

const Progress = () => {
  const { accessToken } = useAuth();
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
        if (filters.when === 'upcoming' && !(b.date >= today && b.status !== 'cancelled')) return false;
        if (filters.when === 'past' && !(b.date < today)) return false;
        if (filters.status !== 'all' && b.status !== filters.status) return false;
        if (filters.verification === 'verified' && !b.is_verified) return false;
        if (filters.verification === 'pending' && b.is_verified) return false;
        if (filters.search) {
          const q = filters.search.toLowerCase();
          const text = `${b.date} ${b.time} ${b.instructor_name || ''} ${b.notes || ''}`.toLowerCase();
          if (!text.includes(q)) return false;
        }
        return true;
      })
      .sort((a,b)=> (a.date.localeCompare(b.date)) || (a.time.localeCompare(b.time)));
  }, [all, filters]);

  return (
    <div className="dashboard-page progress-page">
      <div className="container">
        <motion.div className="dashboard-header" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          <h1>Your Progress</h1>
          <p>All your lessons (past and future)</p>
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
                  <th>Verified</th>
                  <th>Notes</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(b => (
                  <tr key={b.id}>
                    <td>{b.date}</td>
                    <td>{b.time}</td>
                    <td>{b.duration_minutes || 60} min</td>
                    <td>{b.instructor_name || '-'}</td>
                    <td>
                      <span className={`badge badge--status badge--${b.status}`}>{b.status}</span>
                    </td>
                    <td>
                      <span className={`badge badge--verify ${b.is_verified ? 'badge--ok' : 'badge--pending'}`}>
                        {b.is_verified ? 'Verified' : 'Pending'}
                      </span>
                    </td>
                    <td>{b.notes || '-'}</td>
                  </tr>
                ))}
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


