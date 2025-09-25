import React, { useEffect, useState } from "react";
import { Plus, Edit2, Trash2, X, Save, Search, Download, ChevronDown } from "lucide-react";
import Loader from "../admin-components/loader/loader.jsx";

const API_BASE = "http://localhost:5000/admins";

const AdminsManagement = ({ onBack }) => {
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [editingAdmin, setEditingAdmin] = useState(null);
  const [deletingAdmin, setDeletingAdmin] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [showActionsDropdown, setShowActionsDropdown] = useState(false);
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    username: "",
    password: "",
    phone_number: "",
  });

  // Fetch all admins
  const fetchAdmins = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API_BASE}/role/1`);
      console.log('Response status:', res.status);
      
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      
      const data = await res.json();
      console.log('API Response:', data);
      
      // Handle different response formats
      if (Array.isArray(data)) {
        setAdmins(data);
      } else if (data.success && data.users) {
        setAdmins(data.users);
      } else if (data.users) {
        setAdmins(data.users);
      } else {
        console.error('Unexpected data structure:', data);
        setError("Unexpected data format from server");
      }
    } catch (err) {
      console.error('Fetch error:', err);
      setError(`Failed to fetch admins: ${err.message}`);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchAdmins();
  }, []);

  // Filter admins based on search term
  const filteredAdmins = admins.filter(admin =>
    `${admin.first_name} ${admin.last_name}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    admin.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    admin.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (admin.phone_number && admin.phone_number.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Export to CSV
  const exportToCSV = () => {
    const headers = ['ID', 'First Name', 'Last Name', 'Email', 'Role', 'Created At'];
    const csvContent = [
      headers.join(','),
      ...filteredAdmins.map(admin => [
        admin.id || admin.user_id,
        admin.first_name,
        admin.last_name,
        admin.email,
        'Admin',
        new Date(admin.created_at).toLocaleDateString()
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'admin_users.csv';
    a.click();
    window.URL.revokeObjectURL(url);
    setShowActionsDropdown(false);
  };

  // Open modal for create or edit
  const openModal = (admin = null) => {
    setEditingAdmin(admin);
    if (admin) {
      setFormData({
        first_name: admin.first_name || "",
        last_name: admin.last_name || "",
        email: admin.email || "",
        username: admin.username || "",
        password: "",
        phone_number: admin.phone_number || "",
      });
    } else {
      setFormData({ 
        first_name: "", 
        last_name: "", 
        email: "", 
        username: "", 
        password: "",
        phone_number: ""
      });
    }
    setModalOpen(true);
    setShowActionsDropdown(false);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingAdmin(null);
    setFormData({ 
      first_name: "", 
      last_name: "", 
      email: "", 
      username: "", 
      password: "",
      phone_number: ""
    });
    setError("");
  };

  const openDeleteModal = (admin) => {
    setDeletingAdmin(admin);
    setDeleteModalOpen(true);
  };

  const closeDeleteModal = () => {
    setDeleteModalOpen(false);
    setDeletingAdmin(null);
  };

  // Handle input change
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Create or update admin
  const handleSubmit = async () => {
    try {
      const method = editingAdmin ? "PUT" : "POST";
      const url = editingAdmin ? `${API_BASE}/${editingAdmin.id}` : API_BASE;
      const body = { ...formData, role_id: 1 };

      if (editingAdmin && !body.password) {
        delete body.password;
      }

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json();
      console.log('Submit response:', data);
      
      if (res.ok || data.success) {
        fetchAdmins();
        closeModal();
      } else {
        setError(data.error || data.message || "Operation failed");
      }
    } catch (err) {
      console.error('Submit error:', err);
      setError(`Operation failed: ${err.message}`);
    }
  };

  // Delete admin
  const handleDelete = async () => {
    if (!deletingAdmin) return;
    
    try {
      const res = await fetch(`${API_BASE}/${deletingAdmin.id || deletingAdmin.user_id}`, { method: "DELETE" });
      
      if (res.ok) {
        fetchAdmins();
        closeDeleteModal();
      } else {
        const data = await res.json();
        setError(data.error || data.message || "Failed to delete admin");
        closeDeleteModal();
      }
    } catch (err) {
      console.error('Delete error:', err);
      setError(`Failed to delete admin: ${err.message}`);
      closeDeleteModal();
    }
  };

  if (loading && admins.length === 0) {
    return (
      <div style={{
        backgroundColor: '#ffffff',
        minHeight: '100vh',
        padding: '32px',
        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center'
      }}>
        <Loader />
      </div>
    );
  }

  return (
    <div style={{
      backgroundColor: '#f8f9fa',
      minHeight: '100vh',
      padding: '32px',
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
      color: '#374151'
    }}>
      <style>
        {`
          .admin-row:hover {
            background-color: #f8f9fa;
            transition: all 0.3s ease;
          }
          .action-button {
            transition: all 0.2s ease;
            opacity: 0.8;
          }
          .action-button:hover {
            opacity: 1;
            transform: translateY(-1px);
          }
          .dropdown {
            position: relative;
            display: inline-block;
          }
          .dropdown-content {
            display: ${showActionsDropdown ? 'block' : 'none'};
            position: absolute;
            right: 0;
            background-color: white;
            min-width: 200px;
            box-shadow: 0px 12px 24px rgba(0,0,0,0.15);
            border-radius: 8px;
            z-index: 1000;
            border: 1px solid #e5e7eb;
            animation: fadeIn 0.2s ease;
          }
          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(-8px); }
            to { opacity: 1; transform: translateY(0); }
          }
          .dropdown-content button {
            color: #374151;
            padding: 12px 16px;
            text-decoration: none;
            display: block;
            background: none;
            border: none;
            width: 100%;
            text-align: left;
            cursor: pointer;
            font-size: 14px;
            transition: background-color 0.2s ease;
          }
          .dropdown-content button:hover {
            background-color: #f3f4f6;
          }
          .dropdown-content button:first-child {
            border-top-left-radius: 8px;
            border-top-right-radius: 8px;
          }
          .dropdown-content button:last-child {
            border-bottom-left-radius: 8px;
            border-bottom-right-radius: 8px;
          }
          .table-container {
            transition: all 0.3s ease;
          }
          .search-input:focus {
            border-color: #3b82f6;
            box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
          }
        `}
      </style>

      {/* Header */}
      <div style={{ marginBottom: '32px' }}>
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '32px' }}>
          <button
            onClick={onBack}
            style={{
              background: 'none', 
              border: 'none',
              fontSize: '24px',
              cursor: 'pointer',
              marginRight: '16px',
              color: '#6b7280', 
              padding: '8px',
              borderRadius: '8px',
              transition: 'all 0.2s ease'
            }}
            onMouseOver={(e) => e.target.style.color = '#111827'} 
            onMouseOut={(e) => e.target.style.color = '#6b7280'}
          >
            ←
          </button>
          <div>
            <h1 style={{
              fontSize: '2.5rem',
              fontWeight: '700',
              margin: '0 0 8px 0',
              color: '#111827'
            }}>
              Admins management
            </h1>
          </div>
        </div>

        {/* Search and Actions Row */}
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          marginBottom: '24px',
          gap: '16px'
        }}>
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '16px',
            flex: 1
          }}>
            <div style={{ position: 'relative', width: '400px' }}>
              <Search 
                style={{ 
                  position: 'absolute', 
                  left: '14px', 
                  top: '50%', 
                  transform: 'translateY(-50%)', 
                  width: '18px', 
                  height: '18px', 
                  color: '#9ca3af' 
                }} 
              />
              <input
                type="text"
                placeholder="Search"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
                style={{
                  width: '100%',
                  padding: '12px 16px 12px 46px',
                  border: '1px solid #d1d5db',
                  borderRadius: '10px',
                  fontSize: '15px',
                  outline: 'none',
                  backgroundColor: '#ffffff',
                  boxSizing: 'border-box',
                  transition: 'all 0.2s ease'
                }}
              />
            </div>

            <div className="dropdown">
              <button
                onClick={() => setShowActionsDropdown(!showActionsDropdown)}
                style={{
                  backgroundColor: '#ffffff',
                  color: '#374151',
                  border: '1px solid #d1d5db',
                  padding: '12px 20px',
                  borderRadius: '10px',
                  fontSize: '15px',
                  fontWeight: '500',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  transition: 'all 0.2s ease',
                  boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
                }}
                onMouseOver={(e) => e.target.style.borderColor = '#9ca3af'}
                onMouseOut={(e) => e.target.style.borderColor = '#d1d5db'}
              >
                Actions
                <ChevronDown style={{ width: '16px', height: '16px' }} />
              </button>
              <div className="dropdown-content">
                <button onClick={() => openModal()}>
                  <Plus style={{ width: '16px', height: '16px', display: 'inline', marginRight: '8px' }} />
                  Add User
                </button>
                <button onClick={exportToCSV}>
                  <Download style={{ width: '16px', height: '16px', display: 'inline', marginRight: '8px' }} />
                  Export Data
                </button>
              </div>
            </div>
          </div>

          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '16px'
          }}>
            <p style={{
              margin: '0',
              fontSize: '14px',
              color: '#6b7280',
              whiteSpace: 'nowrap'
            }}>
              Rows per page: 10 • 1-{Math.min(10, filteredAdmins.length)} of {filteredAdmins.length} rows
            </p>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div style={{
          backgroundColor: '#fef2f2',
          border: '1px solid #fecaca',
          borderRadius: '12px',
          padding: '16px 20px',
          marginBottom: '24px',
          color: '#dc2626',
          fontSize: '14px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          animation: 'fadeIn 0.3s ease'
        }}>
          {error}
          <button
            onClick={() => setError(null)}
            style={{
              background: 'none',
              border: 'none',
              color: '#dc2626',
              cursor: 'pointer',
              fontSize: '20px',
              padding: '4px',
              borderRadius: '6px'
            }}
          >
            ×
          </button>
        </div>
      )}

      {/* Main Table */}
      <div className="table-container" style={{
        backgroundColor: 'white',
        border: '1px solid #e5e7eb',
        borderRadius: '16px',
        overflow: 'hidden',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)'
      }}>
        {/* Table Header */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '60px 80px 140px 140px 240px 140px 140px 120px',
          gap: '0',
          padding: '20px 24px',
          backgroundColor: '#f9fafb',
          borderBottom: '1px solid #e5e7eb',
          fontSize: '12px',
          fontWeight: '600',
          color: '#6b7280',
          textTransform: 'uppercase',
          letterSpacing: '0.05em'
        }}>
          <div></div>
          <div>USER ID</div>
          <div>FIRST NAME</div>
          <div>LAST NAME</div>
          <div>EMAIL</div>
          <div>ROLE</div>
          <div>CREATED AT</div>
          <div>ACTIONS</div>
        </div>

        {/* Table Body */}
        {filteredAdmins.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '60px',
            color: '#6b7280'
          }}>
            <p style={{ margin: 0, fontSize: '18px', fontWeight: '500' }}>
              {searchTerm ? 'No matching admin users found' : 'No admin users found'}
            </p>
            <p style={{ margin: '12px 0 0 0', fontSize: '14px' }}>
              {searchTerm ? 'Try adjusting your search terms' : 'Add your first admin user to get started'}
            </p>
          </div>
        ) : (
          filteredAdmins.slice(0, 10).map((admin, index) => (
            <div
              key={admin.id || admin.user_id}
              className="admin-row"
              style={{
                display: 'grid',
                gridTemplateColumns: '60px 80px 140px 140px 240px 140px 140px 120px',
                gap: '0',
                padding: '20px 24px',
                borderBottom: '1px solid #f3f4f6',
                alignItems: 'center',
                fontSize: '14px'
              }}
            >
              {/* Row Number */}
              <div style={{ 
                fontWeight: '600', 
                color: '#9ca3af',
                fontSize: '13px'
              }}>
                {index + 1}
              </div>

              {/* User ID */}
              <div style={{ 
                fontWeight: '600', 
                color: '#4f46e5',
                fontSize: '13px'
              }}>
                {admin.id || admin.user_id}
              </div>

              {/* First Name */}
              <div style={{ 
                fontWeight: '500', 
                color: '#111827',
                fontSize: '14px'
              }}>
                {admin.first_name}
              </div>

              {/* Last Name */}
              <div style={{ 
                fontWeight: '500', 
                color: '#111827',
                fontSize: '14px'
              }}>
                {admin.last_name}
              </div>
              
              {/* Email */}
              <div style={{ 
                fontSize: '14px', 
                color: '#6b7280'
              }}>
                {admin.email}
              </div>
              
              {/* Role */}
              <div>
                <span style={{
                  display: 'inline-block',
                  backgroundColor: '#dbeafe',
                  color: '#1e40af',
                  padding: '6px 12px',
                  borderRadius: '20px',
                  fontSize: '12px',
                  fontWeight: '500'
                }}>
                  Admin
                </span>
              </div>

              {/* Created At */}
              <div style={{ 
                fontSize: '14px', 
                color: '#6b7280',
                fontWeight: '400'
              }}>
                {new Date(admin.created_at).toLocaleDateString('en-US', {
                  month: 'short',
                  day: '2-digit',
                  year: 'numeric'
                })}
              </div>
              
              {/* Actions */}
              <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-start' }}>
                <button
                  onClick={() => openModal(admin)}
                  className="action-button"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: '#f3f4f6',
                    color: '#6b7280',
                    padding: '8px',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontSize: '12px',
                    fontWeight: '600',
                    width: '36px',
                    height: '36px'
                  }}
                  title="Edit admin"
                >
                  <Edit2 style={{ width: '16px', height: '16px' }} />
                </button>
                <button
                  onClick={() => openDeleteModal(admin)}
                  className="action-button"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: '#fef2f2',
                    color: '#ef4444',
                    padding: '8px',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontSize: '12px',
                    fontWeight: '600',
                    width: '36px',
                    height: '36px'
                  }}
                  title="Delete admin"
                >
                  <Trash2 style={{ width: '16px', height: '16px' }} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add/Edit Modal */}
      {modalOpen && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000,
          padding: '20px',
          animation: 'fadeIn 0.3s ease'
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '16px',
            padding: '32px',
            maxWidth: '500px',
            width: '100%',
            maxHeight: '90vh',
            overflow: 'auto',
            boxShadow: '0 20px 25px rgba(0, 0, 0, 0.2)'
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '24px',
              paddingBottom: '16px',
              borderBottom: '1px solid #e5e7eb'
            }}>
              <h3 style={{
                margin: 0,
                fontSize: '20px',
                fontWeight: '600',
                color: '#111827'
              }}>
                {editingAdmin ? "Edit Admin" : "Add New Admin"}
              </h3>
              <button
                onClick={closeModal}
                style={{
                  background: '#6b7280',
                  border: 'none',
                  fontSize: '18px',
                  cursor: 'pointer',
                  color: 'white',
                  width: '32px',
                  height: '32px',
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <X size={20} />
              </button>
            </div>

            <div style={{ marginBottom: '24px' }}>
              <div style={{ marginBottom: '16px' }}>
                <label style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: '600',
                  color: '#111827',
                  marginBottom: '8px'
                }}>
                  First Name *
                </label>
                <input
                  type="text"
                  name="first_name"
                  placeholder="Enter first name"
                  value={formData.first_name}
                  onChange={handleChange}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '8px',
                    fontSize: '14px',
                    outline: 'none',
                    boxSizing: 'border-box',
                    backgroundColor: '#ffffff'
                  }}
                  required
                />
              </div>
              
              <div style={{ marginBottom: '16px' }}>
                <label style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: '600',
                  color: '#111827',
                  marginBottom: '8px'
                }}>
                  Last Name *
                </label>
                <input
                  type="text"
                  name="last_name"
                  placeholder="Enter last name"
                  value={formData.last_name}
                  onChange={handleChange}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '8px',
                    fontSize: '14px',
                    outline: 'none',
                    boxSizing: 'border-box',
                    backgroundColor: '#ffffff'
                  }}
                  required
                />
              </div>
              
              <div style={{ marginBottom: '16px' }}>
                <label style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: '600',
                  color: '#111827',
                  marginBottom: '8px'
                }}>
                  Email *
                </label>
                <input
                  type="email"
                  name="email"
                  placeholder="Enter email address"
                  value={formData.email}
                  onChange={handleChange}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '8px',
                    fontSize: '14px',
                    outline: 'none',
                    boxSizing: 'border-box',
                    backgroundColor: '#ffffff'
                  }}
                  required
                />
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: '600',
                  color: '#111827',
                  marginBottom: '8px'
                }}>
                  Phone Number
                </label>
                <input
                  type="tel"
                  name="phone_number"
                  placeholder="Enter phone number"
                  value={formData.phone_number}
                  onChange={handleChange}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '8px',
                    fontSize: '14px',
                    outline: 'none',
                    boxSizing: 'border-box',
                    backgroundColor: '#ffffff'
                  }}
                />
              </div>
              
              <div style={{ marginBottom: '16px' }}>
                <label style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: '600',
                  color: '#111827',
                  marginBottom: '8px'
                }}>
                  Username *
                </label>
                <input
                  type="text"
                  name="username"
                  placeholder="Enter username"
                  value={formData.username}
                  onChange={handleChange}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '8px',
                    fontSize: '14px',
                    outline: 'none',
                    boxSizing: 'border-box',
                    backgroundColor: '#ffffff'
                  }}
                  required
                />
              </div>
              
              <div style={{ marginBottom: '16px' }}>
                <label style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: '600',
                  color: '#111827',
                  marginBottom: '8px'
                }}>
                  Password {editingAdmin ? '(Optional)' : '*'}
                </label>
                <input
                  type="password"
                  name="password"
                  placeholder={editingAdmin ? "Leave blank to keep current password" : "Enter password"}
                  value={formData.password}
                  onChange={handleChange}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '8px',
                    fontSize: '14px',
                    outline: 'none',
                    boxSizing: 'border-box',
                    backgroundColor: '#ffffff'
                  }}
                  required={!editingAdmin}
                />
              </div>
            </div>
            
            <div style={{
              display: 'flex',
              gap: '12px',
              justifyContent: 'flex-end',
              paddingTop: '16px',
              borderTop: '1px solid #e5e7eb'
            }}>
              <button
                onClick={closeModal}
                style={{
                  padding: '12px 24px',
                  backgroundColor: '#6b7280',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '600'
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                style={{
                  padding: '12px 24px',
                  backgroundColor: '#3b82f6',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '600',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                <Save style={{ width: '16px', height: '16px' }} />
                {editingAdmin ? "Update Admin" : "Create Admin"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteModalOpen && deletingAdmin && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000,
          padding: '20px',
          animation: 'fadeIn 0.3s ease'
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '16px',
            padding: '32px',
            maxWidth: '450px',
            width: '100%',
            boxShadow: '0 20px 25px rgba(0, 0, 0, 0.2)'
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '24px',
              paddingBottom: '16px',
              borderBottom: '1px solid #e5e7eb'
            }}>
              <h3 style={{
                margin: 0,
                fontSize: '18px',
                fontWeight: '600',
                color: '#dc2626'
              }}>
                Delete Admin User
              </h3>
              <button
                onClick={closeDeleteModal}
                style={{
                  background: '#6b7280',
                  border: 'none',
                  fontSize: '18px',
                  cursor: 'pointer',
                  color: 'white',
                  width: '32px',
                  height: '32px',
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <X size={20} />
              </button>
            </div>

            <div style={{ marginBottom: '24px' }}>
              <p style={{
                margin: '0 0 16px 0',
                fontSize: '14px',
                color: '#374151',
                lineHeight: '1.6'
              }}>
                Are you sure you want to delete this admin user? This action cannot be undone.
              </p>
              
              <div style={{
                backgroundColor: '#fef2f2',
                border: '1px solid #fecaca',
                borderRadius: '12px',
                padding: '16px',
                marginTop: '16px'
              }}>
                <div style={{
                  fontSize: '14px',
                  fontWeight: '600',
                  color: '#111827',
                  marginBottom: '8px'
                }}>
                  Admin Details:
                </div>
                <div style={{ fontSize: '14px', color: '#374151', lineHeight: '1.5' }}>
                  <div><strong>Name:</strong> {deletingAdmin.first_name} {deletingAdmin.last_name}</div>
                  <div><strong>Email:</strong> {deletingAdmin.email}</div>
                  <div><strong>Username:</strong> {deletingAdmin.username}</div>
                </div>
              </div>
            </div>

            <div style={{
              display: 'flex',
              gap: '12px',
              justifyContent: 'flex-end'
            }}>
              <button
                onClick={closeDeleteModal}
                style={{
                  padding: '12px 24px',
                  backgroundColor: '#6b7280',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '600'
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                style={{
                  padding: '12px 24px',
                  backgroundColor: '#dc2626',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '600',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                <Trash2 style={{ width: '16px', height: '16px' }} />
                Delete Admin
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminsManagement;