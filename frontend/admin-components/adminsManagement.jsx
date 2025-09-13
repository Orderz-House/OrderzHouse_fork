import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Eye, X } from 'lucide-react';

const AdminManagement = () => {
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingAdmin, setEditingAdmin] = useState(null);
  const [viewingAdmin, setViewingAdmin] = useState(null);
  const [error, setError] = useState('');

  const getAuthToken = () => localStorage.getItem('token');

  useEffect(() => {
    fetchAdmins();
  }, []);

  const fetchAdmins = async () => {
    setLoading(true);
    setError('');
    try {
      const token = getAuthToken();
      const response = await fetch('/api/users/view', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      if (data.success) {
        const adminUsers = data.users.filter(user => user.role_id === 1 && !user.is_deleted);
        setAdmins(adminUsers);
      } else {
        setError(data.message || 'Failed to fetch admins');
      }
    } catch (error) {
      console.error('Error fetching admins:', error);
      setError('Network error occurred');
    } finally {
      setLoading(false);
    }
  };

  const CreateAdminModal = () => {
    const [formData, setFormData] = useState({
      first_name: '',
      last_name: '',
      email: '',
      password: '',
      username: '',
      phone_number: '',
      country: '',
      role_id: 1,
      category_id: null
    });
    const [creating, setCreating] = useState(false);

    const handleSubmit = async (e) => {
      e.preventDefault();
      setCreating(true);
      setError('');

      try {
        const response = await fetch('/api/users/register', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(formData)
        });

        const data = await response.json();
        if (data.success) {
          fetchAdmins(); // Refresh list
          setShowCreateModal(false);
          setFormData({
            first_name: '',
            last_name: '',
            email: '',
            password: '',
            username: '',
            phone_number: '',
            country: '',
            role_id: 1,
            category_id: null
          });
        } else {
          setError(data.message || 'Failed to create admin');
        }
      } catch (error) {
        console.error('Error creating admin:', error);
        setError('Network error occurred');
      } finally {
        setCreating(false);
      }
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-8 w-full max-w-md max-h-[90vh] overflow-y-auto">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-semibold text-gray-800">Create New Admin</h3>
            <button
              onClick={() => setShowCreateModal(false)}
              className="text-gray-500 hover:text-gray-700 transition-colors"
            >
              <X size={20} />
            </button>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Input fields */}
            {['first_name','last_name','email','password','username','phone_number','country'].map((field) => (
              <div key={field}>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {field.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                </label>
                <input
                  type={field === 'password' ? 'password' : 'text'}
                  required
                  value={formData[field]}
                  onChange={(e) => setFormData({ ...formData, [field]: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-gray-500"
                />
              </div>
            ))}
            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={creating}
                className="flex-1 px-4 py-2 bg-gray-800 text-white rounded-md hover:bg-gray-900 transition-colors disabled:opacity-50"
              >
                {creating ? 'Creating...' : 'Create Admin'}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  const EditAdminModal = ({ admin }) => {
    const [formData, setFormData] = useState({
      first_name: admin.first_name || '',
      last_name: admin.last_name || '',
      email: admin.email || '',
      username: admin.username || '',
      phone_number: admin.phone_number || '',
      country: admin.country || '',
      role_id: 1
    });
    const [updating, setUpdating] = useState(false);

    const handleSubmit = async (e) => {
      e.preventDefault();
      setUpdating(true);
      setError('');

      try {
        const token = getAuthToken();
        const response = await fetch(`/users/edit/${admin.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(formData)
        });

        const data = await response.json();
        if (data.success) {
          fetchAdmins();
          setEditingAdmin(null);
        } else {
          setError(data.message || 'Failed to update admin');
        }
      } catch (error) {
        console.error('Error updating admin:', error);
        setError('Network error occurred');
      } finally {
        setUpdating(false);
      }
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-8 w-full max-w-md max-h-[90vh] overflow-y-auto">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-semibold text-gray-800">Edit Admin</h3>
            <button
              onClick={() => setEditingAdmin(null)}
              className="text-gray-500 hover:text-gray-700 transition-colors"
            >
              <X size={20} />
            </button>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Input fields */}
            {['first_name','last_name','email','username','phone_number','country'].map((field) => (
              <div key={field}>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {field.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                </label>
                <input
                  type="text"
                  required
                  value={formData[field]}
                  onChange={(e) => setFormData({ ...formData, [field]: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-gray-500"
                />
              </div>
            ))}
            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={() => setEditingAdmin(null)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={updating}
                className="flex-1 px-4 py-2 bg-gray-800 text-white rounded-md hover:bg-gray-900 transition-colors disabled:opacity-50"
              >
                {updating ? 'Updating...' : 'Update Admin'}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  const ViewAdminModal = ({ admin }) => {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-8 w-full max-w-md">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-semibold text-gray-800">Admin Details</h3>
            <button
              onClick={() => setViewingAdmin(null)}
              className="text-gray-500 hover:text-gray-700 transition-colors"
            >
              <X size={20} />
            </button>
          </div>
          <div className="space-y-4">
            {[
              { label: 'Full Name', value: `${admin.first_name} ${admin.last_name}` },
              { label: 'Email', value: admin.email },
              { label: 'Username', value: admin.username },
              { label: 'Phone', value: admin.phone_number },
              { label: 'Country', value: admin.country },
              { label: 'Created', value: new Date(admin.created_at).toLocaleDateString() }
            ].map((item, i) => (
              <div key={i}>
                <label className="block text-sm font-medium text-gray-700">{item.label}</label>
                <p className="text-gray-900 font-medium">{item.value}</p>
              </div>
            ))}
            <button
              onClick={() => setViewingAdmin(null)}
              className="w-full mt-6 px-4 py-2 bg-gray-800 text-white rounded-md hover:bg-gray-900 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  };

  const handleDeleteAdmin = async (adminId) => {
    if (!window.confirm('Are you sure you want to delete this admin?')) return;

    try {
      const token = getAuthToken();
      const response = await fetch(`/users/delete/${adminId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      if (data.success) fetchAdmins();
      else setError(data.message || 'Failed to delete admin');
    } catch (error) {
      console.error('Error deleting admin:', error);
      setError('Network error occurred');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-800"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Admin Management</h1>
              <p className="text-gray-600 mt-1">Manage system administrators</p>
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-2 bg-gray-800 text-white px-4 py-2 rounded-md hover:bg-gray-900 transition-colors"
            >
              <Plus size={16} />
              Create Admin
            </button>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-6">
            {error}
          </div>
        )}

        {/* Admin Table */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          {admins.length === 0 ? (
            <div className="p-12 text-center">
              <div className="text-gray-400 mb-4">
                <Plus size={48} className="mx-auto" />
              </div>
              <h3 className="text-lg font-medium text-gray-800 mb-2">No Admins Found</h3>
              <p className="text-gray-600 mb-6">Get started by creating the first admin account.</p>
              <button
                onClick={() => setShowCreateModal(true)}
                className="bg-gray-800 text-white px-6 py-2 rounded-md hover:bg-gray-900 transition-colors"
              >
                Create First Admin
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Admin</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {admins.map((admin) => (
                    <tr key={admin.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{admin.first_name} {admin.last_name}</div>
                          <div className="text-sm text-gray-500">@{admin.username}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{admin.email}</div>
                        <div className="text-sm text-gray-500">{admin.phone_number}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{admin.country}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(admin.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end gap-2">
                          <button onClick={() => setViewingAdmin(admin)} className="text-gray-600 hover:text-gray-800 transition-colors p-1" title="View Details"><Eye size={16} /></button>
                          <button onClick={() => setEditingAdmin(admin)} className="text-gray-600 hover:text-gray-800 transition-colors p-1" title="Edit Admin"><Edit2 size={16} /></button>
                          <button onClick={() => handleDeleteAdmin(admin.id)} className="text-red-600 hover:text-red-800 transition-colors p-1" title="Delete Admin"><Trash2 size={16} /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Stats Footer */}
        <div className="mt-6 bg-white rounded-lg shadow-sm p-6 text-center text-gray-600">
          <p>Total Admins: <span className="font-semibold text-gray-800">{admins.length}</span></p>
        </div>
      </div>

      {/* Modals */}
      {showCreateModal && <CreateAdminModal />}
      {editingAdmin && <EditAdminModal admin={editingAdmin} />}
      {viewingAdmin && <ViewAdminModal admin={viewingAdmin} />}
    </div>
  );
};

export default AdminManagement;
