import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiEdit3, FiTrash2, FiPlus, FiSave, FiX, FiStar, FiRefreshCw, FiPackage } from 'react-icons/fi';
import { API_BASE } from '../../utils/apiBase';

const EMPTY_FORM = {
  name: '',
  description: '',
  number_of_lessons: 1,
  price: '',
  original_price: '',
  duration_hours: '',
  validity_days: 365,
  package_type: 'package',
  is_popular: false,
  is_active: true,
  features: '',
};

const PACKAGE_TYPES = ['single', 'package', 'road_test', 'standard'];

const PackageManagement = ({ token }) => {
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  // 'none' | 'create' | 'edit'
  const [formMode, setFormMode] = useState('none');
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const showSuccess = (msg) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(null), 3500);
  };

  const fetchPackages = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/api/packages`);
      const data = await res.json();
      if (data.success) {
        setPackages(data.data);
      } else {
        setError('Failed to load packages.');
      }
    } catch {
      setError('Network error while loading packages.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchPackages(); }, [fetchPackages]);

  const openCreate = () => {
    setForm(EMPTY_FORM);
    setEditingId(null);
    setFormMode('create');
  };

  const openEdit = (pkg) => {
    setForm({
      name: pkg.name || '',
      description: pkg.description || '',
      number_of_lessons: pkg.number_of_lessons ?? 1,
      price: pkg.price ?? '',
      original_price: pkg.original_price ?? '',
      duration_hours: pkg.duration_hours ?? '',
      validity_days: pkg.validity_days ?? 365,
      package_type: pkg.package_type || 'package',
      is_popular: pkg.is_popular || false,
      is_active: pkg.is_active !== false,
      features: Array.isArray(pkg.features) ? pkg.features.join(', ') : '',
    });
    setEditingId(pkg.id);
    setFormMode('edit');
  };

  const cancelForm = () => {
    setFormMode('none');
    setEditingId(null);
    setForm(EMPTY_FORM);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const buildPayload = () => ({
    name: form.name.trim(),
    description: form.description.trim(),
    number_of_lessons: parseInt(form.number_of_lessons, 10) || 1,
    price: parseFloat(form.price) || 0,
    original_price: form.original_price !== '' ? parseFloat(form.original_price) : null,
    duration_hours: form.duration_hours !== '' ? parseFloat(form.duration_hours) : null,
    validity_days: parseInt(form.validity_days, 10) || 365,
    package_type: form.package_type,
    is_popular: form.is_popular,
    is_active: form.is_active,
    features: form.features
      ? form.features.split(',').map((f) => f.trim()).filter(Boolean)
      : [],
  });

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) { setError('Package name is required.'); return; }
    if (!form.price) { setError('Price is required.'); return; }

    setSaving(true);
    setError(null);
    try {
      const isEdit = formMode === 'edit';
      const url = isEdit
        ? `${API_BASE}/api/packages/${editingId}`
        : `${API_BASE}/api/packages`;
      const res = await fetch(url, {
        method: isEdit ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(buildPayload()),
      });
      const data = await res.json();
      if (data.success) {
        showSuccess(isEdit ? 'Package updated successfully.' : 'Package created successfully.');
        cancelForm();
        fetchPackages();
      } else {
        setError(data.message || 'Failed to save package.');
      }
    } catch {
      setError('Network error while saving.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      const res = await fetch(`${API_BASE}/api/packages/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        showSuccess('Package deleted.');
        setDeleteConfirm(null);
        fetchPackages();
      } else {
        setError(data.message || 'Failed to delete package.');
      }
    } catch {
      setError('Network error while deleting.');
    }
  };

  const fieldStyle = {
    width: '100%',
    padding: '8px 10px',
    border: '1.5px solid #d1d5db',
    borderRadius: '6px',
    fontSize: '14px',
    boxSizing: 'border-box',
    marginTop: '4px',
    color: '#1f2937',
    background: '#fff',
  };

  const labelStyle = {
    display: 'block',
    fontSize: '12px',
    fontWeight: '600',
    color: '#374151',
    marginBottom: '2px',
  };

  const gridStyle = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
    gap: '14px',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      style={{ padding: '8px 0' }}
    >
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
        <h2 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: 8, fontSize: '20px' }}>
          <FiPackage /> Package Management
        </h2>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn btn-outline" onClick={fetchPackages} disabled={loading} title="Refresh">
            <FiRefreshCw style={{ animation: loading ? 'spin 1s linear infinite' : 'none' }} />
          </button>
          {formMode === 'none' && (
            <button className="btn btn-primary" onClick={openCreate}>
              <FiPlus /> Add Package
            </button>
          )}
        </div>
      </div>

      {/* Feedback */}
      {error && (
        <div style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626', padding: '10px 14px', borderRadius: '8px', marginBottom: '16px', fontSize: '14px' }}>
          {error}
          <button onClick={() => setError(null)} style={{ float: 'right', background: 'none', border: 'none', cursor: 'pointer', color: '#dc2626', fontWeight: 700 }}>×</button>
        </div>
      )}
      {successMsg && (
        <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', color: '#15803d', padding: '10px 14px', borderRadius: '8px', marginBottom: '16px', fontSize: '14px' }}>
          {successMsg}
        </div>
      )}

      {/* Create / Edit Form */}
      <AnimatePresence>
        {formMode !== 'none' && (
          <motion.div
            key="form"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            style={{ overflow: 'hidden', marginBottom: '24px' }}
          >
            <form
              onSubmit={handleSave}
              style={{ background: '#f8fafc', border: '1.5px solid #e2e8f0', borderRadius: '12px', padding: '24px' }}
            >
              <h3 style={{ margin: '0 0 20px 0', fontSize: '17px', color: '#1e293b' }}>
                {formMode === 'create' ? 'Create New Package' : 'Edit Package'}
              </h3>

              <div style={gridStyle}>
                <div>
                  <label style={labelStyle}>Package Name *</label>
                  <input style={fieldStyle} name="name" value={form.name} onChange={handleChange} placeholder="e.g. Package A" required />
                </div>

                <div>
                  <label style={labelStyle}>Package Type</label>
                  <select style={fieldStyle} name="package_type" value={form.package_type} onChange={handleChange}>
                    {PACKAGE_TYPES.map((t) => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={labelStyle}>Price (CAD) *</label>
                  <input style={fieldStyle} name="price" type="number" min="0" step="0.01" value={form.price} onChange={handleChange} placeholder="0.00" required />
                </div>

                <div>
                  <label style={labelStyle}>Original Price (CAD)</label>
                  <input style={fieldStyle} name="original_price" type="number" min="0" step="0.01" value={form.original_price} onChange={handleChange} placeholder="Leave blank if no original price" />
                </div>

                <div>
                  <label style={labelStyle}>Number of Lessons</label>
                  <input style={fieldStyle} name="number_of_lessons" type="number" min="1" value={form.number_of_lessons} onChange={handleChange} />
                </div>

                <div>
                  <label style={labelStyle}>Duration (hours)</label>
                  <input style={fieldStyle} name="duration_hours" type="number" min="0" step="0.5" value={form.duration_hours} onChange={handleChange} placeholder="e.g. 1.5" />
                </div>

                <div>
                  <label style={labelStyle}>Validity (days)</label>
                  <input style={fieldStyle} name="validity_days" type="number" min="1" value={form.validity_days} onChange={handleChange} />
                </div>
              </div>

              <div style={{ marginTop: '14px' }}>
                <label style={labelStyle}>Description</label>
                <textarea
                  style={{ ...fieldStyle, minHeight: '80px', resize: 'vertical' }}
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  placeholder="Brief description of the package"
                />
              </div>

              <div style={{ marginTop: '14px' }}>
                <label style={labelStyle}>Features (comma-separated)</label>
                <input
                  style={fieldStyle}
                  name="features"
                  value={form.features}
                  onChange={handleChange}
                  placeholder="e.g. Four 90-minute lessons, 6 hours behind the wheel"
                />
              </div>

              <div style={{ display: 'flex', gap: '24px', marginTop: '16px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '14px', cursor: 'pointer' }}>
                  <input type="checkbox" name="is_popular" checked={form.is_popular} onChange={handleChange} />
                  Mark as Popular
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '14px', cursor: 'pointer' }}>
                  <input type="checkbox" name="is_active" checked={form.is_active} onChange={handleChange} />
                  Active (visible to customers)
                </label>
              </div>

              <div style={{ display: 'flex', gap: 10, marginTop: '20px' }}>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  <FiSave /> {saving ? 'Saving…' : (formMode === 'create' ? 'Create Package' : 'Save Changes')}
                </button>
                <button type="button" className="btn btn-outline" onClick={cancelForm} disabled={saving}>
                  <FiX /> Cancel
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Packages Table */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px', color: '#6b7280' }}>Loading packages…</div>
      ) : packages.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 20px', color: '#6b7280', background: '#f9fafb', borderRadius: '10px', border: '1px dashed #d1d5db' }}>
          <FiPackage style={{ fontSize: '40px', marginBottom: '12px', opacity: 0.4 }} />
          <p style={{ margin: 0, fontSize: '16px' }}>No packages found.</p>
          <p style={{ margin: '6px 0 0', fontSize: '13px' }}>Click "Add Package" to create your first one.</p>
        </div>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
            <thead>
              <tr style={{ background: '#f1f5f9', borderBottom: '2px solid #e2e8f0' }}>
                {['Name', 'Type', 'Price', 'Lessons', 'Duration', 'Popular', 'Active', 'Actions'].map((h) => (
                  <th key={h} style={{ padding: '10px 12px', textAlign: 'left', fontWeight: '600', color: '#374151', whiteSpace: 'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {packages.map((pkg, idx) => (
                <motion.tr
                  key={pkg.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.03 }}
                  style={{ borderBottom: '1px solid #e5e7eb', background: idx % 2 === 0 ? '#fff' : '#fafafa' }}
                >
                  <td style={{ padding: '10px 12px', fontWeight: '500', color: '#1f2937' }}>
                    {pkg.name}
                    {pkg.is_popular && (
                      <FiStar style={{ color: '#f59e0b', marginLeft: '6px', verticalAlign: 'middle', fontSize: '13px' }} title="Popular" />
                    )}
                  </td>
                  <td style={{ padding: '10px 12px', color: '#6b7280' }}>
                    <span style={{ background: '#e0f2fe', color: '#0369a1', padding: '2px 8px', borderRadius: '10px', fontSize: '12px', fontWeight: '500' }}>
                      {pkg.package_type || '—'}
                    </span>
                  </td>
                  <td style={{ padding: '10px 12px', fontWeight: '600', color: '#059669' }}>
                    ${parseFloat(pkg.price).toFixed(2)}
                  </td>
                  <td style={{ padding: '10px 12px', color: '#374151', textAlign: 'center' }}>
                    {pkg.number_of_lessons}
                  </td>
                  <td style={{ padding: '10px 12px', color: '#374151' }}>
                    {pkg.duration_hours ? `${pkg.duration_hours}h` : '—'}
                  </td>
                  <td style={{ padding: '10px 12px', textAlign: 'center' }}>
                    {pkg.is_popular
                      ? <span style={{ color: '#f59e0b', fontWeight: '700' }}>★</span>
                      : <span style={{ color: '#d1d5db' }}>—</span>}
                  </td>
                  <td style={{ padding: '10px 12px', textAlign: 'center' }}>
                    <span style={{
                      display: 'inline-block',
                      width: '10px',
                      height: '10px',
                      borderRadius: '50%',
                      background: pkg.is_active !== false ? '#22c55e' : '#d1d5db',
                    }} title={pkg.is_active !== false ? 'Active' : 'Inactive'} />
                  </td>
                  <td style={{ padding: '10px 12px', whiteSpace: 'nowrap' }}>
                    <button
                      className="btn btn-outline"
                      style={{ padding: '5px 10px', marginRight: '6px', fontSize: '13px' }}
                      onClick={() => openEdit(pkg)}
                      title="Edit"
                    >
                      <FiEdit3 />
                    </button>
                    <button
                      className="btn"
                      style={{ padding: '5px 10px', fontSize: '13px', background: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626', borderRadius: '6px', cursor: 'pointer' }}
                      onClick={() => setDeleteConfirm(pkg)}
                      title="Delete"
                    >
                      <FiTrash2 />
                    </button>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {deleteConfirm && (
          <motion.div
            key="delete-modal"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000,
            }}
            onClick={() => setDeleteConfirm(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              style={{ background: '#fff', borderRadius: '12px', padding: '28px 32px', maxWidth: '420px', width: '90%', boxShadow: '0 20px 60px rgba(0,0,0,0.2)' }}
              onClick={(e) => e.stopPropagation()}
            >
              <h3 style={{ margin: '0 0 10px', color: '#dc2626', fontSize: '18px' }}>Delete Package</h3>
              <p style={{ margin: '0 0 20px', color: '#374151' }}>
                Are you sure you want to delete <strong>{deleteConfirm.name}</strong>? This action cannot be undone.
              </p>
              <div style={{ display: 'flex', gap: 10 }}>
                <button
                  className="btn"
                  style={{ background: '#dc2626', color: '#fff', border: 'none', padding: '8px 18px', borderRadius: '7px', cursor: 'pointer', fontWeight: '600' }}
                  onClick={() => handleDelete(deleteConfirm.id)}
                >
                  Yes, Delete
                </button>
                <button className="btn btn-outline" onClick={() => setDeleteConfirm(null)}>
                  Cancel
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default PackageManagement;
