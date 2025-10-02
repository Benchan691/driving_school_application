import React, { useEffect, useState, useMemo } from 'react';
import { API_BASE } from '../../utils/apiBase';
import { motion } from 'framer-motion';
import { FiEdit3, FiTrash2, FiSave, FiX, FiRefreshCw, FiDollarSign, FiUsers, FiCalendar } from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';

const PaymentManagement = () => {
  const { accessToken } = useAuth();
  const token = useMemo(() => accessToken || localStorage.getItem('accessToken'), [accessToken]);
  
  const [payments, setPayments] = useState([]);
  const [quotaStats, setQuotaStats] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [editing, setEditing] = useState(null);
  const [editForm, setEditForm] = useState({ lessons_used: 0 });
  
  // Filters
  const [filters, setFilters] = useState({
    package: 'all',
    status: 'all',
    dateFrom: '',
    dateTo: '',
    search: ''
  });

  // Filtered payments
  const filteredPayments = useMemo(() => {
    return payments.filter(payment => {
      const matchPackage = filters.package === 'all' || payment.package_name === filters.package;
      const matchStatus = filters.status === 'all' || 
        (filters.status === 'active' ? payment.is_active : !payment.is_active);
      
      const searchTerm = filters.search.toLowerCase();
      const matchSearch = !searchTerm || 
        payment.user?.first_name?.toLowerCase().includes(searchTerm) ||
        payment.user?.last_name?.toLowerCase().includes(searchTerm) ||
        payment.user?.email?.toLowerCase().includes(searchTerm) ||
        payment.package_name?.toLowerCase().includes(searchTerm);
      
      let matchDate = true;
      if (filters.dateFrom) {
        matchDate = matchDate && new Date(payment.purchase_date) >= new Date(filters.dateFrom);
      }
      if (filters.dateTo) {
        matchDate = matchDate && new Date(payment.purchase_date) <= new Date(filters.dateTo);
      }
      
      return matchPackage && matchStatus && matchSearch && matchDate;
    });
  }, [payments, filters]);

  const fetchPayments = async () => {
    setLoading(true);
    try {
      setError(null);
      const res = await fetch(`${API_BASE}/api/admin/payments`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (!res.ok) {
        const txt = await res.text();
        throw new Error(`${res.status} ${res.statusText} - ${txt}`);
      }
      
      const data = await res.json();
      if (data.success) {
        setPayments(data.data.payments || []);
        setQuotaStats(data.data.quotaStats || []);
      }
    } catch (e) {
      setError(e.message || 'Failed to load payments');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchPayments();
    }
  }, [token]);

  const startEdit = (payment) => {
    setEditing(payment.id);
    setEditForm({ lessons_used: payment.lessons_used });
  };

  const saveEdit = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/admin/payments/${editing}/quota`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(editForm)
      });
      
      const data = await res.json();
      if (data.success) {
        setPayments(prev => prev.map(p => p.id === editing ? data.data : p));
        setEditing(null);
        await fetchPayments(); // Refresh to get updated quota stats
      } else {
        alert('Failed to update quota: ' + (data.message || 'Unknown error'));
      }
    } catch (error) {
      console.error('Update quota error:', error);
      alert('Failed to update quota. Please try again.');
    }
  };

  const deletePayment = async (id) => {
    if (!window.confirm('Are you sure you want to delete this payment record? This action cannot be undone.')) {
      return;
    }
    
    try {
      const res = await fetch(`${API_BASE}/api/admin/payments/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      
      const data = await res.json();
      if (data.success) {
        setPayments(prev => prev.filter(p => p.id !== id));
        await fetchPayments(); // Refresh to get updated quota stats
      } else {
        alert('Failed to delete payment: ' + (data.message || 'Unknown error'));
      }
    } catch (error) {
      console.error('Delete payment error:', error);
      alert('Failed to delete payment. Please try again.');
    }
  };

  const getPackageOptions = () => {
    const packages = [...new Set(payments.map(p => p.package_name))];
    return packages.sort();
  };

  return (
    <div className="payment-management">
      <div className="container">
        <motion.div 
          className="dashboard-header" 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ duration: 0.6 }}
        >
          <h1>Payment Management</h1>
          <p>Manage payments and track package quotas</p>
        </motion.div>

        {/* Quota Statistics */}
        <motion.div 
          className="quota-stats"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          <h3>Package Quota Statistics</h3>
          <div className="stats-grid">
            {quotaStats.map(stat => (
              <div key={stat.package_name} className="stat-card">
                <div className="stat-header">
                  <FiDollarSign className="stat-icon" />
                  <h4>{stat.package_name}</h4>
                </div>
                <div className="stat-content">
                  <div className="stat-item">
                    <span className="stat-label">Total Purchased:</span>
                    <span className="stat-value">{stat.total_purchased || 0}</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-label">Lessons Used:</span>
                    <span className="stat-value">{stat.total_used || 0}</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-label">Total Lessons:</span>
                    <span className="stat-value">{stat.total_lessons || 0}</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-label">Remaining:</span>
                    <span className="stat-value">
                      {(stat.total_lessons || 0) - (stat.total_used || 0)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Filters */}
        <motion.div 
          className="table-filters"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <div className="filters-row">
            <select 
              value={filters.package} 
              onChange={(e) => setFilters({ ...filters, package: e.target.value })}
            >
              <option value="all">All Packages</option>
              {getPackageOptions().map(pkg => (
                <option key={pkg} value={pkg}>{pkg}</option>
              ))}
            </select>
            
            <select 
              value={filters.status} 
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
            
            <div className="date-filters">
              <input 
                type="date" 
                placeholder="From Date"
                value={filters.dateFrom}
                onChange={(e) => setFilters({ ...filters, dateFrom: e.target.value })}
              />
              <input 
                type="date" 
                placeholder="To Date"
                value={filters.dateTo}
                onChange={(e) => setFilters({ ...filters, dateTo: e.target.value })}
              />
            </div>
            
            <input 
              className="input" 
              placeholder="Search user or package..." 
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
            />
            
            <button className="btn btn-outline" onClick={fetchPayments}>
              <FiRefreshCw /> Refresh
            </button>
          </div>
        </motion.div>

        {error && (
          <div className="alert alert-error" style={{ marginBottom: 12 }}>
            {error}
          </div>
        )}
        
        {loading && <p>Loading...</p>}

        {/* Payments Table */}
        <motion.div 
          className="table-card"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <div className="table-responsive">
            <table className="table table--styled table--admin">
              <thead>
                <tr>
                  <th>User</th>
                  <th>Package</th>
                  <th>Purchase Date</th>
                  <th>Price</th>
                  <th>Lessons Used</th>
                  <th>Lessons Remaining</th>
                  <th>Status</th>
                  <th>Expiry Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredPayments.length === 0 && !loading && (
                  <tr>
                    <td colSpan="9" style={{ textAlign: 'center', color: '#64748b' }}>
                      No payments found.
                    </td>
                  </tr>
                )}
                {filteredPayments.map(payment => (
                  <tr key={payment.id}>
                    <td>
                      <div className="user-info">
                        <div className="user-name">
                          {payment.user?.first_name} {payment.user?.last_name}
                        </div>
                        <div className="user-email">{payment.user?.email}</div>
                      </div>
                    </td>
                    <td>
                      <div className="package-info">
                        <div className="package-name">{payment.package_name}</div>
                        <div className="package-details">
                          {payment.total_lessons} lessons total
                        </div>
                      </div>
                    </td>
                    <td>{new Date(payment.purchase_date).toLocaleDateString()}</td>
                    <td>${payment.purchase_price || 0}</td>
                    <td>
                      {editing === payment.id ? (
                        <input 
                          type="number" 
                          min="0" 
                          max={payment.total_lessons}
                          value={editForm.lessons_used}
                          onChange={(e) => setEditForm({ lessons_used: parseInt(e.target.value) || 0 })}
                          className="input"
                          style={{ width: '80px' }}
                        />
                      ) : (
                        payment.lessons_used
                      )}
                    </td>
                    <td>{payment.lessons_remaining}</td>
                    <td>
                      <span className={`status-badge ${payment.is_active ? 'active' : 'inactive'}`}>
                        {payment.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td>{new Date(payment.expiry_date).toLocaleDateString()}</td>
                    <td style={{ display: 'flex', gap: 6 }}>
                      {editing === payment.id ? (
                        <>
                          <button 
                            className="btn btn-sm btn-primary" 
                            onClick={saveEdit}
                            title="Save"
                          >
                            <FiSave />
                          </button>
                          <button 
                            className="btn btn-sm btn-ghost" 
                            onClick={() => setEditing(null)}
                            title="Cancel"
                          >
                            <FiX />
                          </button>
                        </>
                      ) : (
                        <>
                          <button 
                            className="btn btn-sm btn-outline" 
                            onClick={() => startEdit(payment)}
                            title="Edit Quota"
                          >
                            <FiEdit3 />
                          </button>
                          <button 
                            className="btn btn-sm btn-ghost" 
                            onClick={() => deletePayment(payment.id)}
                            title="Delete"
                          >
                            <FiTrash2 />
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default PaymentManagement;
