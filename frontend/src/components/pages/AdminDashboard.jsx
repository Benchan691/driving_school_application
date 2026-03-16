import React, { useEffect, useMemo, useState, useCallback } from 'react';
import { API_BASE } from '../../utils/apiBase';
import { motion } from 'framer-motion';
import { FiCheckCircle, FiEdit3, FiTrash2, FiRefreshCw, FiCalendar, FiMail, FiEye, FiSave, FiDollarSign, FiXCircle, FiLayers } from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import TodayTimetable from '../common/TodayTimetable';
import PaymentManagement from './PaymentManagement';
import PackageManagement from './PackageManagement';
import '../../styles/pages/admin.scss';

const AdminDashboard = () => {
  const { accessToken } = useAuth();
  const token = useMemo(() => accessToken || localStorage.getItem('accessToken'), [accessToken]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ date: '', time: '', duration_minutes: 60, notes: '', status: 'scheduled' });

  const [view, setView] = useState('bookings'); // bookings | contacts | timetable | payments | packages
  const [contacts, setContacts] = useState([]);
  const [messageModal, setMessageModal] = useState({ open: false, record: null });
  const [replyModal, setReplyModal] = useState({ open: false, record: null });
  const [replyMessage, setReplyMessage] = useState('');
  const [sendingReply, setSendingReply] = useState(false);
  const [rejectModal, setRejectModal] = useState({ open: false, booking: null });
  const [rejectionReason, setRejectionReason] = useState('');
  const [rejecting, setRejecting] = useState(false);
  const [verifying, setVerifying] = useState(null); // Track which booking is being verified

  // Filters
  const [bookingFilters, setBookingFilters] = useState({ status: 'all', q: '', dateFrom: '', dateTo: '' });
  const [contactFilters, setContactFilters] = useState({ status: 'all', q: '' });

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

  const filteredContacts = useMemo(() => {
    return contacts.filter(m => {
      const matchStatus = contactFilters.status === 'all' || m.status === contactFilters.status;
      const q = contactFilters.q.trim().toLowerCase();
      const matchQ = !q || [m.name || '', m.email || '', m.phone || '', m.subject || '', m.message || ''].some(v => String(v).toLowerCase().includes(q));
      return matchStatus && matchQ;
    });
  }, [contacts, contactFilters]);

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
      } else if (view === 'contacts') {
        const resC = await fetch(`${API_BASE}/api/contact/admin`, { headers: { Authorization: `Bearer ${token}` } });
        if (!resC.ok) { const txt = await resC.text(); throw new Error(`${resC.status} ${resC.statusText} - ${txt}`); }
        const dataC = await resC.json();
        setContacts(Array.isArray(dataC.data) ? dataC.data : []);
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
    setForm({ date: b.date, time: b.time, duration_minutes: b.duration_minutes || 60, notes: b.notes || '', status: b.status });
  };

  const saveEdit = async () => {
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
            <button className={`btn ${view==='contacts' ? 'btn-primary' : 'btn-outline'}`} onClick={()=>setView('contacts')}>Contacts</button>
            <button className={`btn ${view==='payments' ? 'btn-primary' : 'btn-outline'}`} onClick={()=>setView('payments')}>
              <FiDollarSign /> Payments
            </button>
            <button className={`btn ${view==='packages' ? 'btn-primary' : 'btn-outline'}`} onClick={()=>setView('packages')}>
              <FiLayers /> Packages
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
                <th>Email</th>
                <th>Phone</th>
                <th>Date</th>
                <th>Time</th>
                <th>Duration</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredBookings.length === 0 && !loading && (
                <tr>
                  <td colSpan="9" style={{ textAlign: 'center', color: '#64748b' }}>No bookings found.</td>
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
                    {b.student
                      ? b.student.name
                      : b.guest_name
                        ? <>{b.guest_name} <span style={{ fontSize: '11px', background: '#f1f5f9', color: '#64748b', padding: '2px 6px', borderRadius: '4px', fontWeight: 600 }}>Guest</span></>
                        : `User #${b.student_id?.slice(0,8)}`}
                  </td>
                  <td style={{ fontSize: '13px', color: '#374151' }}>{b.student?.email || b.guest_email || '-'}</td>
                  <td style={{ fontSize: '13px', color: '#374151' }}>{b.student?.phone || b.guest_phone || '-'}</td>
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

        {view === 'payments' && (
          <PaymentManagement />
        )}

        {view === 'packages' && (
          <PackageManagement token={token} />
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
      </div>
    </div>
  );
};

export default AdminDashboard;


