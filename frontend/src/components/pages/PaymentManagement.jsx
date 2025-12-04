import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { API_BASE } from '../../utils/apiBase';
import { motion } from 'framer-motion';
import { FiTrash2, FiRefreshCw } from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';

const PaymentManagement = () => {
  const { accessToken } = useAuth();
  const token = useMemo(() => accessToken || localStorage.getItem('accessToken'), [accessToken]);
  
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Filters
  const [filters, setFilters] = useState({
    package: 'all',
    user: 'all',
    dateFrom: '',
    dateTo: '',
    search: ''
  });

  // Filtered payments
  const filteredPayments = useMemo(() => {
    return payments.filter(payment => {
      const matchPackage = filters.package === 'all' || payment.package_name === filters.package;
      
      const matchUser = filters.user === 'all' || payment.user_id === filters.user;
      
      const searchTerm = filters.search.toLowerCase();
      const matchSearch = !searchTerm || 
        payment.user?.name?.toLowerCase().includes(searchTerm) ||
        payment.user?.email?.toLowerCase().includes(searchTerm) ||
        payment.package_name?.toLowerCase().includes(searchTerm);
      
      let matchDate = true;
      if (filters.dateFrom) {
        matchDate = matchDate && new Date(payment.purchase_date) >= new Date(filters.dateFrom);
      }
      if (filters.dateTo) {
        matchDate = matchDate && new Date(payment.purchase_date) <= new Date(filters.dateTo);
      }
      
      return matchPackage && matchUser && matchSearch && matchDate;
    });
  }, [payments, filters]);

  const fetchPayments = useCallback(async () => {
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
      }
    } catch (e) {
      setError(e.message || 'Failed to load payments');
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (token) {
      fetchPayments();
    }
  }, [token, fetchPayments]);

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
        await fetchPayments();
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

  const getUserOptions = () => {
    const users = payments.map(p => ({
      id: p.user_id,
      name: p.user?.name || p.user?.email || 'Unknown'
    }));
    // Remove duplicates by user_id
    const uniqueUsers = users.filter((user, index, self) => 
      index === self.findIndex(u => u.id === user.id)
    );
    return uniqueUsers.sort((a, b) => a.name.localeCompare(b.name));
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
          <p>Manage payments and user packages</p>
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
              value={filters.user} 
              onChange={(e) => setFilters({ ...filters, user: e.target.value })}
            >
              <option value="all">All Users</option>
              {getUserOptions().map(user => (
                <option key={user.id} value={user.id}>{user.name}</option>
              ))}
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
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredPayments.length === 0 && !loading && (
                  <tr>
                    <td colSpan="5" style={{ textAlign: 'center', color: '#64748b' }}>
                      No payments found.
                    </td>
                  </tr>
                )}
                {filteredPayments.map(payment => (
                  <tr key={payment.id}>
                    <td>
                      <div className="user-info">
                        <div className="user-name">
                          {payment.user?.name || 'Unknown'}
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
                    <td style={{ display: 'flex', gap: 6 }}>
                      <button 
                        className="btn btn-sm btn-ghost" 
                        onClick={() => deletePayment(payment.id)}
                        title="Delete"
                      >
                        <FiTrash2 />
                      </button>
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
