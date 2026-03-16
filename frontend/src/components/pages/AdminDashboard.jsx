import React, { useEffect, useMemo, useState, useCallback } from 'react';
import { API_BASE } from '../../utils/apiBase';
import { motion } from 'framer-motion';
import { FiCheckCircle, FiEdit3, FiTrash2, FiRefreshCw, FiCalendar, FiMail, FiEye, FiSave, FiDollarSign, FiXCircle } from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import TodayTimetable from '../common/TodayTimetable';
import PaymentManagement from './PaymentManagement';
import '../../styles/pages/admin.scss';

const AdminDashboard = () => {
  const { accessToken } = useAuth();
  const token = useMemo(() => accessToken || localStorage.getItem('accessToken'), [accessToken]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ date: '', time: '', duration_minutes: 60, instructor_name: '', notes: '', status: 'scheduled', payment_method: 'Cash' });

  const [view, setView] = useState('bookings'); // bookings | users | contacts | timetable | payments | packages
  const [users, setUsers] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [packages, setPackages] = useState([]);
  const [messageModal, setMessageModal] = useState({ open: false, record: null });
  const [replyModal, setReplyModal] = useState({ open: false, record: null });
  const [replyMessage, setReplyMessage] = useState('');
  const [sendingReply, setSendingReply] = useState(false);
  const [rejectModal, setRejectModal] = useState({ open: false, booking: null });
  const [rejectionReason, setRejectionReason] = useState('');
  const [rejecting, setRejecting] = useState(false);
  const [verifying, setVerifying] = useState(null); // Track which booking is being verified
  const [packageModal, setPackageModal] = useState({ open: false, package: null });

  // Filters
  const [bookingFilters, setBookingFilters] = useState({ status: 'all', q: '', dateFrom: '', dateTo: '' });
  const [userFilters, setUserFilters] = useState({ role: 'all', active: 'all', verified: 'all', q: '' });
  const [contactFilters, setContactFilters] = useState({ status: 'all', q: '' });
  const [packageFilters, setPackageFilters] = useState({ type: 'all', q: '' });

  // Derived filtered data
  const filteredBookings = useMemo(() => {
    return bookings.filter(b => {
      const matchStatus = bookingFilters.status === 'all' || b.status === bookingFilters.status;
      const q = bookingFilters.q.trim().toLowerCase();
      const matchQ = !q || [String(b.student_id), b.instructor_name || '', b.notes || '', b.lesson_date || '', b.start_time || ''].some(v => String(v).toLowerCase().includes(q));
      // Date range filter
      let matchDate = true;
      if (bookingFilters.dateFrom) {
        try {
          matchDate = matchDate && new Date(b.lesson_date) >= new Date(bookingFilters.dateFrom);
        } catch (_) {}
      }
      if (bookingFilters.dateTo) {
        try {
          matchDate = matchDate && new Date(b.lesson_date) <= new Date(bookingFilters.dateTo);
        } catch (_) {}
      }
      return matchStatus && matchQ && matchDate;
    });
  }, [bookings, bookingFilters]);

  const filteredUsers = useMemo(() => {
    return users.filter(u => {
      const matchRole = userFilters.role === 'all' || u.user_type === userFilters.role;
      const q = userFilters.q.trim().toLowerCase();
      const matchQ = !q || [u.name || '', u.email || '', String(u.id)].some(v => String(v).toLowerCase().includes(q));
      return matchRole && matchQ;
    });
  }, [users, userFilters]);

  const filteredContacts = useMemo(() => {
    return contacts.filter(m => {
      const matchStatus = contactFilters.status === 'all' || m.status === contactFilters.status;
      const q = contactFilters.q.trim().toLowerCase();
      const matchQ = !q || [m.name || '', m.email || '', m.phone || '', m.subject || '', m.message || ''].some(v => String(v).toLowerCase().includes(q));
      return matchStatus && matchQ;
    });
  }, [contacts, contactFilters]);

  const filteredPackages = useMemo(() => {
    return packages.filter(p => {
      const matchType = packageFilters.type === 'all' || p.package_type === packageFilters.type;
      const q = packageFilters.q.trim().toLowerCase();
      const matchQ = !q || [p.name || '', p.description || '', String(p.price || '')].some(v => String(v).toLowerCase().includes(q));
      return matchType && matchQ;
    });
  }, [packages, packageFilters]);

  // Today's lesson count for badge
  const todayLessonsCount = useMemo(() => {
    const today = new Date().toISOString().slice(0, 10);
    return bookings.filter(b => b.date === today).length;
  }, [bookings]);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      setError(null);
      if (view === 'bookings') {
        const res = await fetch(`${API_BASE}/api/admin/bookings`, { headers: { Authorization: `Bearer ${token}` } });
        if (!res.ok) { const txt = await res.text(); throw new Error(`${res.status} ${res.statusText} - ${txt}`); }
        const data = await res.json();
        setBookings(Array.isArray(data.data) ? data.data : []);
      } else if (view === 'users') {
        const resU = await fetch(`${API_BASE}/api/admin/users`, { headers: { Authorization: `Bearer ${token}` } });
        if (!resU.ok) { const txt = await resU.text(); throw new Error(`${resU.status} ${resU.statusText} - ${txt}`); }
        const dataU = await resU.json();
        setUsers(Array.isArray(dataU.data) ? dataU.data : []);
      } else if (view === 'contacts') {
        const resC = await fetch(`${API_BASE}/api/contact/admin`, { headers: { Authorization: `Bearer ${token}` } });
        if (!resC.ok) { const txt = await resC.text(); throw new Error(`${resC.status} ${resC.statusText} - ${txt}`); }
        const dataC = await resC.json();
        setContacts(Array.isArray(dataC.data) ? dataC.data : []);
      } else if (view === 'packages') {
        const resP = await fetch(`${API_BASE}/api/packages`, { headers: { Authorization: `Bearer ${token}` } });
        if (!resP.ok) { const txt = await resP.text(); throw new Error(`${resP.status} ${resP.statusText} - ${txt}`); }
        const dataP = await resP.json();
        setPackages(Array.isArray(dataP.data) ? dataP.data : []);
      }
    } catch (e) {
      setError(e.message || 'Failed to load bookings');
    } finally {
      setLoading(false);
    }
  }, [token, view]);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { if (token) fetchAll(); }, [token, view]); // Remove fetchAll dependency to prevent infinite loop

  const startEdit = (b) => {
    setEditing(b.id);
    setForm({ date: b.date, time: b.time, duration_minutes: b.duration_minutes || 60, instructor_name: b.instructor_name || '', notes: b.notes || '', status: b.status, payment_method: b.payment_method || 'Cash' });
  };

  const saveEdit = async () => {
    if (String(editing).startsWith('user-')) {
      const userId = String(editing).replace('user-','');
      const payload = {
        name: form.name,
        email: form.email,
        user_type: form.user_type,
      };
      const res = await fetch(`${API_BASE}/api/admin/users/${userId}`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (data?.success) {
        setUsers(prev => prev.map(u => u.id === data.data.id ? data.data : u));
        setEditing(null);
      }
    } else {
      const res = await fetch(`${API_BASE}/api/admin/bookings/${editing}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(form)
      });
      const data = await res.json();
      if (data?.success) {
        setBookings((prev) => prev.map(b => b.id === editing ? data.data : b));
        setEditing(null);
      }
    }
  };

  const savePackage = async () => {
    if (!packageModal.package) return;
    const payload = {
      name: form.package_name,
      description: form.package_description,
      price: parseFloat(form.package_price),
      original_price: form.package_original_price ? parseFloat(form.package_original_price) : null,
      number_of_lessons: parseInt(form.package_number_of_lessons),
      duration_hours: form.package_duration_hours ? parseFloat(form.package_duration_hours) : null,
      package_type: form.package_type,
      is_popular: form.package_is_popular === true || form.package_is_popular === 'true',
      is_active: form.package_is_active !== false && form.package_is_active !== 'false',
      features: form.package_features || []
    };
    const res = await fetch(`${API_BASE}/api/packages/${packageModal.package.id}`, {
      method: 'PUT', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify(payload)
    });
    const data = await res.json();
    if (data?.success) {
      setPackages(prev => prev.map(p => p.id === data.data.id ? data.data : p));
      setPackageModal({ open: false, package: null });
    }
  };

  const verify = async (id) => {
    // Prevent double-clicks
    if (verifying === id) return;
    
    setVerifying(id);
    try {
      const res = await fetch(`${API_BASE}/api/admin/bookings/${id}/verify`, { method: 'PUT', headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      if (data?.success) {
        setBookings((prev) => prev.map(b => b.id === id ? data.data : b));
      } else {
        alert(data.message || 'Failed to verify booking');
      }
    } catch (error) {
      console.error('Verify booking error:', error);
      alert('Failed to verify booking. Please try again.');
    } finally {
      setVerifying(null);
    }
  };

  // const remove = async (id) => {
  //   const res = await fetch(`${API_BASE}/api/admin/bookings/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
  //   const data = await res.json();
  //   if (data?.success) setBookings((prev) => prev.filter(b => b.id !== id));
  // };

  const openRejectModal = (booking) => {
    setRejectModal({ open: true, booking });
    setRejectionReason('');
  };

  const closeRejectModal = () => {
    setRejectModal({ open: false, booking: null });
    setRejectionReason('');
  };

  const handleReject = async () => {
    if (!rejectModal.booking || !rejectionReason.trim()) return;
    
    setRejecting(true);
    try {
      const res = await fetch(`${API_BASE}/api/admin/bookings/${rejectModal.booking.id}/reject`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ rejection_reason: rejectionReason.trim() })
      });
      const data = await res.json();
      if (data?.success) {
        setBookings((prev) => prev.map(b => b.id === rejectModal.booking.id ? data.data : b));
        closeRejectModal();
      } else {
        alert(data.message || 'Failed to reject booking');
      }
    } catch (error) {
      alert('Failed to reject booking');
    } finally {
      setRejecting(false);
    }
  };

  // Timetable-specific handlers
  // const handleVerifyBooking = async (id) => {
  //   await verify(id);
  // };

  // const handleCancelBooking = async (id) => {
  //   const res = await fetch(`${API_BASE}/api/admin/bookings/${id}`, {
  //     method: 'PUT',
  //     headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
  //     body: JSON.stringify({ status: 'cancelled' })
  //   });
  //   const data = await res.json();
  //   if (data?.success) {
  //     setBookings((prev) => prev.map(b => b.id === id ? data.data : b));
  //   }
  // };

  // const handleCompleteBooking = async (id) => {
  //   const res = await fetch(`${API_BASE}/api/admin/bookings/${id}`, {
  //     method: 'PUT',
  //     headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
  //     body: JSON.stringify({ status: 'cancelled' })
  //   });
  //   const data = await res.json();
  //   if (data?.success) {
  //     setBookings((prev) => prev.map(b => b.id === id ? data.data : b));
  //   }
  // };

  // Reply handler
  const handleSendReply = async () => {
    if (!replyMessage.trim()) return;
    
    setSendingReply(true);
    try {
      const res = await fetch(`${API_BASE}/api/contact/admin/${replyModal.record.id}/reply`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json', 
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify({ replyMessage: replyMessage.trim() })
      });
      
      const data = await res.json();
      if (data?.success) {
        // Update contact status to in_progress
        setContacts(prev => prev.map(c => 
          c.id === replyModal.record.id 
            ? { ...c, status: 'in_progress' }
            : c
        ));
        
        setReplyModal({ open: false, record: null });
        setReplyMessage('');
        alert('Reply sent successfully!');
      } else {
        alert('Failed to send reply: ' + (data.message || 'Unknown error'));
      }
    } catch (error) {
      console.error('Send reply error:', error);
      alert('Failed to send reply. Please try again.');
    } finally {
      setSendingReply(false);
    }
  };

  return (
    <div className="dashboard-page">
      <div className="container">
        <motion.div className="dashboard-header" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          <h1>Admin Dashboard</h1>
          <p>Manage and verify bookings</p>
        </motion.div>

        <div className="admin-actions" style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
          <div style={{ display: 'flex', gap: 8 }}>
            <button className={`btn ${view==='bookings' ? 'btn-primary' : 'btn-outline'}`} onClick={()=>setView('bookings')}>Bookings</button>
            <button className={`btn ${view==='users' ? 'btn-primary' : 'btn-outline'}`} onClick={()=>setView('users')}>Users</button>
            <button className={`btn ${view==='contacts' ? 'btn-primary' : 'btn-outline'}`} onClick={()=>setView('contacts')}>Contacts</button>
            <button className={`btn ${view==='packages' ? 'btn-primary' : 'btn-outline'}`} onClick={()=>setView('packages')}>Packages</button>
            <button className={`btn ${view==='payments' ? 'btn-primary' : 'btn-outline'}`} onClick={()=>setView('payments')}>
              <FiDollarSign /> Payments
            </button>
            <button className={`btn ${view==='timetable' ? 'btn-primary' : 'btn-outline'}`} onClick={()=>setView('timetable')}>
              <FiCalendar /> Lessons Today
              {todayLessonsCount > 0 && (
                <span className="badge" style={{ 
                  backgroundColor: '#ef4444', 
                  color: 'white', 
                  fontSize: '11px', 
                  padding: '2px 6px', 
                  borderRadius: '10px', 
                  marginLeft: '6px' 
                }}>
                  {todayLessonsCount}
                </span>
              )}
            </button>
          </div>
          <button className="btn btn-outline" onClick={fetchAll}><FiRefreshCw /> Refresh</button>
        </div>

        {error && (
          <div className="alert alert-error" style={{ marginBottom: 12 }}>
            {error}
          </div>
        )}
        {loading && <p>Loading...</p>}

        {view === 'bookings' && (
        <div className="table-card">
          <div className="table-filters" style={{ display:'flex', gap:8, padding: '8px 8px 0 8px', flexWrap:'wrap' }}>
            <select value={bookingFilters.status} onChange={(e)=>setBookingFilters({ ...bookingFilters, status: e.target.value })}>
              <option value="all">All statuses</option>
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
              <option value="no_show">No Show</option>
              <option value="rescheduled">Rescheduled</option>
            </select>
            <div style={{ display:'flex', gap:6, alignItems:'center' }}>
              <label style={{ color:'#64748b' }}>From</label>
              <input type="date" value={bookingFilters.dateFrom} onChange={(e)=>setBookingFilters({ ...bookingFilters, dateFrom: e.target.value })} />
              <label style={{ color:'#64748b' }}>To</label>
              <input type="date" value={bookingFilters.dateTo} onChange={(e)=>setBookingFilters({ ...bookingFilters, dateTo: e.target.value })} />
            </div>
            <input className="input" placeholder="Search (user, instructor, notes)" value={bookingFilters.q} onChange={(e)=>setBookingFilters({ ...bookingFilters, q: e.target.value })} />
          </div>
          <div className="table-responsive">
            <table className="table table--styled table--admin">
            <thead>
              <tr>
                <th>Reference</th>
                <th>User</th>
                <th>Date</th>
                <th>Time</th>
                <th>Duration</th>
                <th>Payment Method</th>
                <th>Instructor</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredBookings.length === 0 && !loading && (
                <tr>
                  <td colSpan="10" style={{ textAlign: 'center', color: '#64748b' }}>No bookings found.</td>
                </tr>
              )}
              {filteredBookings.map(b => {
                // Format reference number
                const bookingReference = b.booking_reference || b.id || 'N/A';
                const referenceDisplay = typeof bookingReference === 'string' 
                  ? bookingReference.substring(0, 8).toUpperCase()
                  : bookingReference.toString().substring(0, 8).toUpperCase();
                
                return (
                  <tr key={b.id} style={editing === b.id ? { 
                    background: 'linear-gradient(to right, rgba(37, 99, 235, 0.08), rgba(124, 58, 237, 0.08))',
                    boxShadow: 'inset 0 0 0 1px rgba(37, 99, 235, 0.3)'
                  } : {}}>
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
                  <td>
                    <button className="link" onClick={()=>{ setView('users'); setUsers(prev => prev); }}>
                      {b.student ? b.student.name : `User #${b.student_id?.slice(0,8)}`}
                    </button>
                  </td>
                  <td>{editing === b.id ? (
                    <input 
                      type="date" 
                      value={form.date} 
                      onChange={(e)=>setForm({...form, date: e.target.value})}
                      style={{
                        padding: '6px 10px',
                        borderRadius: '8px',
                        border: '2px solid #e5e7eb',
                        fontSize: '13px',
                        fontWeight: '500'
                      }}
                    />
                  ) : (b.lesson_date || b.date)}</td>
                  <td>{editing === b.id ? (
                    <input 
                      type="time" 
                      value={form.time} 
                      onChange={(e)=>setForm({...form, time: e.target.value})}
                      style={{
                        padding: '6px 10px',
                        borderRadius: '8px',
                        border: '2px solid #e5e7eb',
                        fontSize: '13px',
                        fontWeight: '500'
                      }}
                    />
                  ) : (b.start_time?.slice(0,5) || b.time)}</td>
                  <td>{editing === b.id ? (
                    <select 
                      value={form.duration_minutes} 
                      onChange={(e)=>setForm({...form, duration_minutes: Number(e.target.value)})}
                      style={{
                        padding: '6px 10px',
                        borderRadius: '8px',
                        border: '2px solid #e5e7eb',
                        fontSize: '13px',
                        fontWeight: '500'
                      }}
                    >
                      <option value={60}>1h</option>
                      <option value={90}>1.5h</option>
                    </select>
                  ) : `${b.duration_minutes || 60}m`}</td>
                  <td>
                    {editing === b.id ? (
                      <select 
                        value={form.payment_method} 
                        onChange={(e)=>setForm({...form, payment_method: e.target.value})}
                        style={{
                          padding: '6px 10px',
                          borderRadius: '8px',
                          border: '2px solid #e5e7eb',
                          fontSize: '13px',
                          fontWeight: '500'
                        }}
                      >
                        <option value="Cash">Cash</option>
                        <option value="Paid Online">Paid Online</option>
                      </select>
                    ) : (
                      <span style={{ 
                        background: b.payment_method === 'Paid Online' ? '#10b981' : '#f59e0b', 
                        color: 'white', 
                        padding: '4px 10px', 
                        borderRadius: '12px', 
                        fontSize: '12px',
                        fontWeight: '500',
                        display: 'inline-block'
                      }}>
                        {b.payment_method || 'Cash'}
                      </span>
                    )}
                  </td>
                  <td>{editing === b.id ? (
                    <input 
                      type="text" 
                      value={form.instructor_name} 
                      onChange={(e)=>setForm({...form, instructor_name: e.target.value})}
                      style={{
                        padding: '6px 10px',
                        borderRadius: '8px',
                        border: '2px solid #e5e7eb',
                        fontSize: '13px',
                        fontWeight: '500'
                      }}
                    />
                  ) : (b.instructor_name || '-')}</td>
                  <td>{editing === b.id ? (
                    <select 
                      value={form.status} 
                      onChange={(e)=>setForm({...form, status: e.target.value})}
                      style={{
                        padding: '6px 10px',
                        borderRadius: '8px',
                        border: '2px solid #e5e7eb',
                        fontSize: '13px',
                        fontWeight: '500'
                      }}
                    >
                      <option value="scheduled">scheduled</option>
                      <option value="cancelled">cancelled</option>
                    </select>
                  ) : (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span>{b.status}</span>
                      {b.is_verified && (
                        <span style={{ 
                          background: '#10b981', 
                          color: 'white', 
                          padding: '2px 8px', 
                          borderRadius: '12px', 
                          fontSize: '11px',
                          fontWeight: '500'
                        }}>
                          ✓ Verified
                        </span>
                      )}
                    </div>
                  )}</td>
                  <td style={{ display: 'flex', gap: 6 }}>
                    {editing === b.id ? (
                      <button className="btn btn-sm btn-primary" onClick={saveEdit} title="Save">
                        <FiSave />
                      </button>
                    ) : (
                      <>
                        {/* Only show verify/reject if status is 'pending' */}
                        {b.status === 'pending' && (
                          <button 
                            className="btn btn-sm btn-outline" 
                            onClick={()=>verify(b.id)} 
                            title="Verify"
                            disabled={verifying === b.id}
                            style={{ opacity: verifying === b.id ? 0.6 : 1, cursor: verifying === b.id ? 'not-allowed' : 'pointer' }}
                          >
                            {verifying === b.id ? <FiRefreshCw className="animate-spin" /> : <FiCheckCircle />}
                          </button>
                        )}
                        {b.status === 'pending' && (
                          <button 
                            className="btn btn-sm btn-ghost" 
                            onClick={()=>openRejectModal(b)} 
                            title="Reject" 
                            style={{color: '#dc2626'}}
                            disabled={verifying === b.id}
                          >
                            <FiXCircle />
                          </button>
                        )}
                        
                        {/* Show delete button after booking is processed (confirmed or cancelled) */}
                        {(b.status === 'confirmed' || b.status === 'cancelled' || b.status === 'completed') && (
                          <button 
                            className="btn btn-sm btn-ghost" 
                            onClick={async () => {
                              if (!window.confirm(`Delete this ${b.status} booking?`)) return;
                              try {
                                const res = await fetch(`${API_BASE}/api/admin/bookings/${b.id}`, {
                                  method: 'DELETE',
                                  headers: { Authorization: `Bearer ${token}` }
                                });
                                const data = await res.json();
                                if (data?.success) {
                                  setBookings(prev => prev.filter(booking => booking.id !== b.id));
                                  alert('Booking deleted successfully');
                                } else {
                                  alert(data.message || 'Failed to delete booking');
                                }
                              } catch (error) {
                                alert('Failed to delete booking');
                              }
                            }}
                            title="Delete"
                            style={{color: '#dc2626'}}
                          >
                            <FiTrash2 />
                          </button>
                        )}
                        
                        <button className="btn btn-sm btn-outline" onClick={()=>startEdit(b)} title="Edit"><FiEdit3 /></button>
                      </>
                    )}
                  </td>
                </tr>
              );
              })}
            </tbody>
            </table>
          </div>
        </div>
        )}

        {view === 'users' && (
        <div className="table-card" style={{ marginTop: 12 }}>
          <div className="table-filters" style={{ display:'flex', gap:8, padding: '8px 8px 0 8px', flexWrap:'wrap' }}>
            <select value={userFilters.role} onChange={(e)=>setUserFilters({ ...userFilters, role: e.target.value })}>
              <option value="all">All roles</option>
              <option value="student">student</option>
              <option value="instructor">instructor</option>
              <option value="admin">admin</option>
            </select>
            <input className="input" placeholder="Search name/email/id" value={userFilters.q} onChange={(e)=>setUserFilters({ ...userFilters, q: e.target.value })} />
          </div>
          <div className="table-responsive">
            <table className="table table--styled table--admin">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Created</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.length === 0 && !loading && (
                  <tr>
                    <td colSpan="8" style={{ textAlign: 'center', color: '#64748b' }}>No users found.</td>
                  </tr>
                )}
                {filteredUsers.map((u, index) => {
                  const isEditing = editing === `user-${u.id}`;
                  return (
                  <tr key={u.id}>
                    <td>{index + 1}</td>
                    <td>
                      {isEditing ? (
                        <input className="input" type="text" value={form.name} onChange={(e)=>setForm({...form, name: e.target.value})} placeholder="Full Name" />
                      ) : (
                        <>{u.name || 'N/A'}</>
                      )}
                    </td>
                    <td>
                      {isEditing ? (
                        <input className="input" type="email" value={form.email} onChange={(e)=>setForm({...form, email: e.target.value})} />
                      ) : u.email}
                    </td>
                    <td>
                      {isEditing ? (
                        <select className="input" value={form.user_type} onChange={(e)=>setForm({...form, user_type: e.target.value})}>
                          <option value="student">student</option>
                          <option value="instructor">instructor</option>
                          <option value="admin">admin</option>
                        </select>
                      ) : u.user_type}
                    </td>
                    <td>{new Date(u.createdAt || u.created_at).toLocaleDateString()}</td>
                    <td style={{ display: 'flex', gap: 6 }}>
                      {isEditing ? (
                        <button className="btn btn-sm btn-primary" onClick={saveEdit} title="Save">
                          <FiSave />
                        </button>
                      ) : (
                        <>
                          <button className="btn btn-sm btn-outline" onClick={()=>{
                            setEditing(`user-${u.id}`);
                            setForm({
                              date: '', time: '', duration_minutes: 60, instructor_name: '', notes: '', status: 'scheduled',
                              name: u.name || '',
                              email: u.email,
                              user_type: u.user_type,
                            });
                          }} title="Edit">
                            <FiEdit3 />
                          </button>
                          <button className="btn btn-sm btn-ghost" onClick={async()=>{
                            if (!window.confirm('Delete this user?')) return;
                            const res = await fetch(`${API_BASE}/api/admin/users/${u.id}`, { method:'DELETE', headers: { Authorization: `Bearer ${token}` } });
                            const data = await res.json();
                            if (data?.success) setUsers(prev => prev.filter(x => x.id !== u.id));
                          }} title="Delete">
                            <FiTrash2 />
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                );})}
              </tbody>
            </table>
          </div>
        </div>
        )}

        {view === 'contacts' && (
        <div className="table-card" style={{ marginTop: 12 }}>
          <div className="table-filters" style={{ display:'flex', gap:8, padding: '8px 8px 0 8px', flexWrap:'wrap' }}>
            <select value={contactFilters.status} onChange={(e)=>setContactFilters({ ...contactFilters, status: e.target.value })}>
              <option value="all">All statuses</option>
              <option value="new">new</option>
              <option value="in_progress">in_progress</option>
              <option value="resolved">resolved</option>
            </select>
            <input className="input" placeholder="Search name/email/subject/message" value={contactFilters.q} onChange={(e)=>setContactFilters({ ...contactFilters, q: e.target.value })} />
          </div>
          <div className="table-responsive">
            <table className="table table--styled table--admin">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Subject</th>
                  <th>Message</th>
                  <th>Status</th>
                  <th>Created</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredContacts.length === 0 && !loading && (
                  <tr>
                    <td colSpan="9" style={{ textAlign: 'center', color: '#64748b' }}>No messages found.</td>
                  </tr>
                )}
                {filteredContacts.map(m => (
                  <tr key={m.id}>
                    <td>{m.id}</td>
                    <td>{m.name}</td>
                    <td>{m.email}</td>
                    <td>{m.phone || '-'}</td>
                    <td>{m.subject || '-'}</td>
                    <td style={{ maxWidth: 320, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      <button type="button" className="btn btn-sm btn-outline" title={m.message} onClick={()=> setMessageModal({ open: true, record: m })}>
                        <FiEye />
                      </button>
                    </td>
                    <td>
                      <select className={`status-select status-select--${m.status}`} value={m.status} onChange={async (e)=>{
                        const newStatus = e.target.value;
                        const res = await fetch(`${API_BASE}/api/contact/admin/${m.id}`, {
                          method: 'PUT', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ status: newStatus })
                        });
                        const data = await res.json();
                        if (data?.success) setContacts(prev => prev.map(x => x.id === m.id ? data.data : x));
                      }}>
                        <option value="new">new</option>
                        <option value="in_progress">in_progress</option>
                        <option value="resolved">resolved</option>
                      </select>
                    </td>
                    <td>{new Date(m.created_at || m.createdAt).toLocaleString()}</td>
                    <td style={{ display: 'flex', gap: 6 }}>
                      <button 
                        className="btn btn-sm btn-primary" 
                        title="Reply"
                        onClick={() => setReplyModal({ open: true, record: m })}
                      >
                        <FiMail />
                      </button>
                      <button 
                        className="btn btn-sm btn-ghost" 
                        title="Delete"
                        onClick={async()=>{
                          if (!window.confirm('Delete this message?')) return;
                          const res = await fetch(`${API_BASE}/api/contact/admin/${m.id}`, { method:'DELETE', headers: { Authorization: `Bearer ${token}` } });
                          const data = await res.json();
                          if (data?.success) setContacts(prev => prev.filter(x => x.id !== m.id));
                        }}
                      >
                        <FiTrash2 />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        )}

        {view === 'packages' && (
        <div className="table-card" style={{ marginTop: 12 }}>
          <div className="table-filters" style={{ display:'flex', gap:8, padding: '8px 8px 0 8px', flexWrap:'wrap' }}>
            <select value={packageFilters.type} onChange={(e)=>setPackageFilters({ ...packageFilters, type: e.target.value })}>
              <option value="all">All types</option>
              <option value="single">single</option>
              <option value="package">package</option>
              <option value="road_test">road_test</option>
            </select>
            <input className="input" placeholder="Search name/description/price" value={packageFilters.q} onChange={(e)=>setPackageFilters({ ...packageFilters, q: e.target.value })} />
          </div>
          <div className="table-responsive" style={{ maxHeight: '70vh', overflowY: 'auto' }}>
            <table className="table table--styled table--admin" style={{ fontSize: '13px' }}>
              <thead style={{ position: 'sticky', top: 0, background: '#f8fafc', zIndex: 10 }}>
                <tr>
                  <th style={{ minWidth: '120px', maxWidth: '150px' }}>Name</th>
                  <th style={{ minWidth: '150px', maxWidth: '200px' }}>Description</th>
                  <th style={{ minWidth: '80px', maxWidth: '100px' }}>Price</th>
                  <th style={{ minWidth: '100px', maxWidth: '120px' }}>Original</th>
                  <th style={{ minWidth: '70px', maxWidth: '80px' }}>Lessons</th>
                  <th style={{ minWidth: '80px', maxWidth: '90px' }}>Hours</th>
                  <th style={{ minWidth: '80px', maxWidth: '100px' }}>Type</th>
                  <th style={{ minWidth: '60px', maxWidth: '70px' }}>Popular</th>
                  <th style={{ minWidth: '60px', maxWidth: '70px' }}>Active</th>
                  <th style={{ minWidth: '100px', maxWidth: '120px' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredPackages.length === 0 && !loading && (
                  <tr>
                    <td colSpan="10" style={{ textAlign: 'center', color: '#64748b' }}>No packages found.</td>
                  </tr>
                )}
                {filteredPackages.map((p) => {
                  return (
                  <tr key={p.id}>
                    <td><strong style={{ fontSize: '13px' }}>{p.name}</strong></td>
                    <td>
                      <span style={{ 
                        maxWidth: '200px', 
                        display: 'block', 
                        whiteSpace: 'nowrap', 
                        overflow: 'hidden', 
                        textOverflow: 'ellipsis',
                        fontSize: '12px'
                      }}>
                        {p.description || '-'}
                      </span>
                    </td>
                    <td style={{ fontWeight: '600' }}>${parseFloat(p.price || 0).toFixed(2)}</td>
                    <td style={{ fontSize: '12px' }}>{p.original_price ? `$${parseFloat(p.original_price).toFixed(2)}` : '-'}</td>
                    <td>{p.number_of_lessons || '-'}</td>
                    <td>{p.duration_hours ? parseFloat(p.duration_hours).toFixed(1) : '-'}</td>
                    <td><span style={{ fontSize: '12px', padding: '2px 6px', background: '#e0e7ff', borderRadius: '4px' }}>{p.package_type || '-'}</span></td>
                    <td style={{ textAlign: 'center' }}>{p.is_popular ? '✓' : '-'}</td>
                    <td style={{ textAlign: 'center' }}>{p.is_active !== false ? '✓' : '✗'}</td>
                    <td style={{ display: 'flex', gap: 6 }}>
                      <button className="btn btn-sm btn-outline" onClick={()=>{
                        setPackageModal({ open: true, package: p });
                        setForm({
                          package_name: p.name || '',
                          package_description: p.description || '',
                          package_price: p.price || '',
                          package_original_price: p.original_price || '',
                          package_number_of_lessons: p.number_of_lessons || '',
                          package_duration_hours: p.duration_hours || '',
                          package_type: p.package_type || 'single',
                          package_is_popular: p.is_popular || false,
                          package_is_active: p.is_active !== false,
                          package_features: Array.isArray(p.features) ? p.features : []
                        });
                      }} title="Edit">
                        <FiEdit3 />
                      </button>
                      <button className="btn btn-sm btn-ghost" onClick={async()=>{
                        if (!window.confirm('Delete this package?')) return;
                        const res = await fetch(`${API_BASE}/api/packages/${p.id}`, { method:'DELETE', headers: { Authorization: `Bearer ${token}` } });
                        const data = await res.json();
                        if (data?.success) setPackages(prev => prev.filter(x => x.id !== p.id));
                      }} title="Delete">
                        <FiTrash2 />
                      </button>
                    </td>
                  </tr>
                );})}
              </tbody>
            </table>
          </div>
        </div>
        )}

        {view === 'payments' && (
          <PaymentManagement />
        )}

        {view === 'timetable' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <TodayTimetable
              bookings={bookings}
              onRefresh={fetchAll}
            />
          </motion.div>
        )}

        {messageModal.open && messageModal.record && (
          <div className="modal-overlay" onClick={()=>setMessageModal({ open:false, record:null })}>
            <div className="modal" onClick={(e)=>e.stopPropagation()}>
              <div className="modal-header">
                <h3>📩 Message #{messageModal.record.id}</h3>
              </div>
              <div className="modal-body">
                <div style={{ marginBottom: 6 }}><strong>Name:</strong> {messageModal.record.name}</div>
                <div style={{ marginBottom: 6 }}><strong>Email:</strong> {messageModal.record.email}</div>
                <div style={{ marginBottom: 6 }}><strong>Phone:</strong> {messageModal.record.phone || '-'}</div>
                <div style={{ marginBottom: 6 }}><strong>Subject:</strong> {messageModal.record.subject || '-'}</div>
                <div style={{ marginTop: 10 }}>
                  <strong>Message:</strong>
                  <div className="modal-message-box">{messageModal.record.message}</div>
                </div>
              </div>
              <div className="modal-footer">
                <button className="btn btn-primary" onClick={()=>setMessageModal({ open:false, record:null })}>Close</button>
              </div>
            </div>
          </div>
        )}

        {replyModal.open && replyModal.record && (
          <div className="modal-overlay" onClick={()=>setReplyModal({ open:false, record:null })}>
            <div className="modal" onClick={(e)=>e.stopPropagation()}>
              <div className="modal-header">
                <h3>📧 Reply to {replyModal.record.name}</h3>
              </div>
              <div className="modal-body">
                <div style={{ marginBottom: 16 }}>
                  <strong>Original Message:</strong>
                  <div style={{ background: '#f5f5f5', padding: 12, borderRadius: 6, marginTop: 8, fontSize: '14px' }}>
                    <strong>Subject:</strong> {replyModal.record.subject || 'No subject'}<br/>
                    <strong>Message:</strong> {replyModal.record.message}
                  </div>
                </div>
                
                <div style={{ marginBottom: 16 }}>
                  <label style={{ display: 'block', marginBottom: 8, fontWeight: 'bold' }}>
                    Your Reply:
                  </label>
                  <textarea
                    className="input"
                    rows="6"
                    value={replyMessage}
                    onChange={(e) => setReplyMessage(e.target.value)}
                    placeholder="Type your reply message here..."
                    style={{ width: '100%', resize: 'vertical' }}
                  />
                  <div style={{ fontSize: '12px', color: '#666', marginTop: 4 }}>
                    {replyMessage.length}/1000 characters
                  </div>
                </div>
              </div>
              <div className="modal-footer" style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
                <button 
                  className="btn btn-outline" 
                  onClick={()=>setReplyModal({ open:false, record:null })}
                  disabled={sendingReply}
                >
                  Cancel
                </button>
                <button 
                  className="btn btn-primary" 
                  onClick={handleSendReply}
                  disabled={!replyMessage.trim() || sendingReply}
                >
                  {sendingReply ? (
                    <>
                      <FiRefreshCw className="animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <FiMail />
                      Send Reply
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Reject Booking Modal */}
        {rejectModal.open && (
          <div className="modal-overlay" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
            <div className="modal" style={{ background: 'white', borderRadius: 8, padding: 24, maxWidth: 500, width: '90%', maxHeight: '90vh', overflow: 'auto' }}>
              <div className="modal-header" style={{ marginBottom: 20 }}>
                <h3 style={{ margin: 0, color: '#dc2626' }}>Reject Booking</h3>
                <p style={{ margin: '8px 0 0 0', color: '#64748b' }}>
                  Please provide a reason for rejecting this booking. The student will receive this explanation via email.
                </p>
              </div>
              <div className="modal-body">
                <div style={{ marginBottom: 16 }}>
                  <label className="label" style={{ display: 'block', marginBottom: 8, fontWeight: 500 }}>
                    Rejection Reason *
                  </label>
                  <textarea
                    className="input"
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    placeholder="Please explain why this booking is being rejected..."
                    rows={4}
                    style={{ width: '100%', resize: 'vertical' }}
                    maxLength={500}
                  />
                  <div style={{ fontSize: '12px', color: '#666', marginTop: 4 }}>
                    {rejectionReason.length}/500 characters
                  </div>
                </div>
                {rejectModal.booking && (
                  <div style={{ background: '#f8fafc', padding: 12, borderRadius: 6, marginBottom: 16 }}>
                    <h4 style={{ margin: '0 0 8px 0', fontSize: 14, color: '#374151' }}>Booking Details:</h4>
                    <div style={{ fontSize: 13, color: '#64748b' }}>
                      <div>Date: {rejectModal.booking.date}</div>
                      <div>Time: {rejectModal.booking.time}</div>
                      <div>Duration: {rejectModal.booking.duration_minutes || 60} minutes</div>
                      <div>Instructor: {rejectModal.booking.instructor_name || 'Not assigned'}</div>
                    </div>
                  </div>
                )}
              </div>
              <div className="modal-footer" style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
                <button 
                  className="btn btn-outline" 
                  onClick={closeRejectModal}
                  disabled={rejecting}
                >
                  Cancel
                </button>
                <button 
                  className="btn" 
                  onClick={handleReject}
                  disabled={!rejectionReason.trim() || rejecting}
                  style={{ background: '#dc2626', color: 'white' }}
                >
                  {rejecting ? (
                    <>
                      <FiRefreshCw className="animate-spin" />
                      Rejecting...
                    </>
                  ) : (
                    <>
                      <FiXCircle />
                      Reject Booking
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Package Edit Modal */}
        {packageModal.open && packageModal.package && (
          <div className="modal-overlay" onClick={()=>setPackageModal({ open: false, package: null })}>
            <div className="modal" onClick={(e)=>e.stopPropagation()} style={{ maxWidth: '600px', maxHeight: '90vh', overflowY: 'auto' }}>
              <div className="modal-header">
                <h3>Edit Package: {packageModal.package.name}</h3>
                <button className="btn btn-sm btn-ghost" onClick={()=>setPackageModal({ open: false, package: null })}>
                  <FiXCircle />
                </button>
              </div>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div>
                  <label className="label" style={{ display: 'block', marginBottom: '6px' }}>Package Name *</label>
                  <input 
                    className="input" 
                    type="text" 
                    value={form.package_name || ''} 
                    onChange={(e)=>setForm({...form, package_name: e.target.value})} 
                    placeholder="Package Name"
                    style={{ width: '100%' }}
                  />
                </div>
                
                <div>
                  <label className="label" style={{ display: 'block', marginBottom: '6px' }}>Description *</label>
                  <textarea 
                    className="input" 
                    rows="4" 
                    value={form.package_description || ''} 
                    onChange={(e)=>setForm({...form, package_description: e.target.value})} 
                    placeholder="Package description"
                    style={{ width: '100%', resize: 'vertical' }}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <label className="label" style={{ display: 'block', marginBottom: '6px' }}>Price (CAD) *</label>
                    <input 
                      className="input" 
                      type="number" 
                      step="0.01" 
                      value={form.package_price || ''} 
                      onChange={(e)=>setForm({...form, package_price: e.target.value})} 
                      placeholder="0.00"
                      style={{ width: '100%' }}
                    />
                  </div>
                  
                  <div>
                    <label className="label" style={{ display: 'block', marginBottom: '6px' }}>Original Price (CAD)</label>
                    <input 
                      className="input" 
                      type="number" 
                      step="0.01" 
                      value={form.package_original_price || ''} 
                      onChange={(e)=>setForm({...form, package_original_price: e.target.value})} 
                      placeholder="0.00"
                      style={{ width: '100%' }}
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
                  <div>
                    <label className="label" style={{ display: 'block', marginBottom: '6px' }}>Number of Lessons *</label>
                    <input 
                      className="input" 
                      type="number" 
                      value={form.package_number_of_lessons || ''} 
                      onChange={(e)=>setForm({...form, package_number_of_lessons: e.target.value})} 
                      placeholder="1"
                      style={{ width: '100%' }}
                    />
                  </div>
                  
                  <div>
                    <label className="label" style={{ display: 'block', marginBottom: '6px' }}>Duration (hours)</label>
                    <input 
                      className="input" 
                      type="number" 
                      step="0.5" 
                      value={form.package_duration_hours || ''} 
                      onChange={(e)=>setForm({...form, package_duration_hours: e.target.value})} 
                      placeholder="1.0"
                      style={{ width: '100%' }}
                    />
                  </div>
                  
                  <div>
                    <label className="label" style={{ display: 'block', marginBottom: '6px' }}>Package Type *</label>
                    <select 
                      className="input" 
                      value={form.package_type || ''} 
                      onChange={(e)=>setForm({...form, package_type: e.target.value})}
                      style={{ width: '100%' }}
                    >
                      <option value="single">single</option>
                      <option value="package">package</option>
                      <option value="road_test">road_test</option>
                    </select>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '24px', alignItems: 'center' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                    <input 
                      type="checkbox" 
                      checked={form.package_is_popular === true || form.package_is_popular === 'true'} 
                      onChange={(e)=>setForm({...form, package_is_popular: e.target.checked})} 
                    />
                    <span>Mark as Popular</span>
                  </label>
                  
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                    <input 
                      type="checkbox" 
                      checked={form.package_is_active !== false && form.package_is_active !== 'false'} 
                      onChange={(e)=>setForm({...form, package_is_active: e.target.checked})} 
                    />
                    <span>Active</span>
                  </label>
                </div>
              </div>
              <div className="modal-footer" style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
                <button 
                  className="btn btn-outline" 
                  onClick={()=>setPackageModal({ open: false, package: null })}
                >
                  Cancel
                </button>
                <button 
                  className="btn btn-primary" 
                  onClick={savePackage}
                >
                  <FiSave style={{ marginRight: '6px' }} />
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;


