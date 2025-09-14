import React, { useEffect, useState } from "react";
import { Plus, Edit2, Trash2, X, Save } from "lucide-react";
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
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    username: "",
    password: "",
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
      });
    } else {
      setFormData({ first_name: "", last_name: "", email: "", username: "", password: "" });
    }
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingAdmin(null);
    setFormData({ first_name: "", last_name: "", email: "", username: "", password: "" });
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
      backgroundColor: '#ffffff',
      minHeight: '100vh',
      padding: '24px',
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
      color: '#374151'
    }}>
      <style>
        {`
          .admin-row:hover {
            background-color: #f9fafb;
            transition: all 0.2s ease;
          }
          .action-button {
            transition: all 0.2s ease;
          }
          .action-button:hover {
            transform: translateY(-1px);
          }
        `}
      </style>

      {/* Header */}
      <div style={{ marginBottom: '32px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <button
              onClick={onBack}
              style={{
                background: 'transparent', 
                border: 'none',
                fontSize: '20px',
                cursor: 'pointer',
                marginRight: '12px',
                color: 'black', 
                padding: '10px 12px',
                borderRadius: '8px',
                transition: 'all 0.2s ease'
              }}
              onMouseOver={(e) => e.target.style.color = '#111827'} 
              onMouseOut={(e) => e.target.style.color = 'black'}
            >
              ←
            </button>
            <div>
              <h1 style={{
                fontSize: '2rem',
                fontWeight: '700',
                margin: '0',
                color: '#111827'
              }}>
                Admin Users
              </h1>
              <p style={{
                margin: '4px 0 0 0',
                fontSize: '14px',
                color: '#6b7280'
              }}>
                Total Admins: {admins.length}
              </p>
            </div>
          </div>
          
          <button
            onClick={() => openModal()}
            style={{
              backgroundColor: '#3b82f6',
              color: 'white',
              border: 'none',
              padding: '12px 24px',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: '600',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              transition: 'all 0.2s ease',
              boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
            }}
            onMouseOver={(e) => e.target.style.backgroundColor = '#2563eb'}
            onMouseOut={(e) => e.target.style.backgroundColor = '#3b82f6'}
          >
            <Plus style={{ width: '16px', height: '16px' }} />
            Add Admin
          </button>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div style={{
          backgroundColor: '#fef2f2',
          border: '1px solid #fecaca',
          borderRadius: '8px',
          padding: '16px 20px',
          marginBottom: '24px',
          color: '#dc2626',
          fontSize: '14px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
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
      <div style={{
        backgroundColor: 'white',
        border: '1px solid #e5e7eb',
        borderRadius: '12px',
        overflow: 'hidden',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
      }}>
        {/* Header */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '60px 80px 1fr 1fr 200px 120px 120px',
          gap: '16px',
          padding: '16px',
          backgroundColor: '#f9fafb',
          borderBottom: '1px solid #e5e7eb',
          fontSize: '12px',
          fontWeight: '600',
          color: '#6b7280',
          textTransform: 'uppercase'
        }}>
          <div>#</div>
          <div>ID</div>
          <div>Name</div>
          <div>Email</div>
          <div>Username</div>
          <div>Role</div>
          <div>Actions</div>
        </div>

        {admins.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '48px',
            color: '#6b7280'
          }}>
            <p style={{ margin: 0, fontSize: '16px', fontWeight: '500' }}>
              No admin users found
            </p>
            <p style={{ margin: '8px 0 0 0', fontSize: '14px' }}>
              Add your first admin user to get started
            </p>
          </div>
        ) : (
          admins.map((admin, index) => (
            <div
              key={admin.id || admin.user_id}
              className="admin-row"
              style={{
                display: 'grid',
                gridTemplateColumns: '60px 80px 1fr 1fr 200px 120px 120px',
                gap: '16px',
                padding: '16px',
                borderBottom: '1px solid #f3f4f6',
                alignItems: 'center',
                fontSize: '14px'
              }}
            >
              <div style={{ 
                fontWeight: '600', 
                color: '#111827',
                fontSize: '12px'
              }}>
                {index + 1}
              </div>
              
              <div style={{ 
                fontWeight: '600', 
                color: '#111827',
                background: '#f3f4f6',
                padding: '4px 8px',
                borderRadius: '6px',
                textAlign: 'center',
                fontSize: '12px'
              }}>
                #{admin.id || admin.user_id}
              </div>
              
              <div style={{ fontWeight: '600', color: '#111827' }}>
                {admin.first_name} {admin.last_name}
              </div>
              
              <div style={{ fontSize: '14px', color: '#6b7280' }}>
                {admin.email}
              </div>
              
              <div style={{ 
                fontSize: '14px', 
                color: '#374151',
                fontWeight: '500'
              }}>
                {admin.username}
              </div>
              
              <div>
                <span style={{
                  display: 'inline-block',
                  backgroundColor: '#d1fae5',
                  color: '#065f46',
                  padding: '4px 12px',
                  borderRadius: '20px',
                  fontSize: '12px',
                  fontWeight: '500'
                }}>
                  Admin
                </span>
              </div>
              
              <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                <button
                  onClick={() => openModal(admin)}
                  className="action-button"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: '#fbbf24',
                    color: 'white',
                    padding: '8px',
                    border: 'none',
                    borderRadius: '6px',
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
                    backgroundColor: '#ef4444',
                    color: 'white',
                    padding: '8px',
                    border: 'none',
                    borderRadius: '6px',
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
          padding: '20px'
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            padding: '32px',
            maxWidth: '500px',
            width: '100%',
            maxHeight: '90vh',
            overflow: 'auto',
            boxShadow: '0 10px 25px rgba(0, 0, 0, 0.2)'
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
                  background: '#374151',
                  border: 'none',
                  fontSize: '18px',
                  cursor: 'pointer',
                  color: 'white',
                  width: '32px',
                  height: '32px',
                  borderRadius: '6px',
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
                    borderRadius: '6px',
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
                    borderRadius: '6px',
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
                    borderRadius: '6px',
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
                    borderRadius: '6px',
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
                    borderRadius: '6px',
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
                  padding: '10px 20px',
                  backgroundColor: '#6b7280',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
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
                  padding: '10px 20px',
                  backgroundColor: '#3b82f6',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '600',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
                onMouseOver={(e) => e.target.style.backgroundColor = '#2563eb'}
                onMouseOut={(e) => e.target.style.backgroundColor = '#3b82f6'}
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
          padding: '20px'
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            padding: '32px',
            maxWidth: '450px',
            width: '100%',
            boxShadow: '0 10px 25px rgba(0, 0, 0, 0.2)'
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
                  background: '#374151',
                  border: 'none',
                  fontSize: '18px',
                  cursor: 'pointer',
                  color: 'white',
                  width: '32px',
                  height: '32px',
                  borderRadius: '6px',
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
                borderRadius: '8px',
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
                  padding: '10px 20px',
                  backgroundColor: '#6b7280',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
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
                  padding: '10px 20px',
                  backgroundColor: '#dc2626',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '600',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
                onMouseOver={(e) => e.target.style.backgroundColor = '#b91c1c'}
                onMouseOut={(e) => e.target.style.backgroundColor = '#dc2626'}
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