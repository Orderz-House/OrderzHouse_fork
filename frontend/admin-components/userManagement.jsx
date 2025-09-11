import React, { useState, useEffect } from 'react';
import {
  Users, UserCheck, UserX, Edit3, Trash2, Plus, Search,
  CheckCircle, XCircle, ArrowLeft, Star, Save, X
} from 'lucide-react';

const UserManagementDashboard = ({ initialTab = 'admins', onBack }) => {
  const [activeTab, setActiveTab] = useState(initialTab);
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [editingUser, setEditingUser] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('');

  // Mock API call helper - replace with your actual API endpoints
  const apiCall = async (endpoint, options = {}) => {
    try {
      // Replace this with your actual API call
      console.log(`API Call: ${endpoint}`, options);
      
      // Mock response for demonstration
      if (endpoint.includes('users')) {
        return {
          success: true,
          data: generateMockUsers()
        };
      }
      
      return { success: true, data: {} };
    } catch (error) {
      console.error('API Error:', error);
      return { success: false, error: error.message };
    }
  };

  // Generate mock users for demonstration
  const generateMockUsers = () => {
    const mockUsers = [];
    const roleId = activeTab === 'admins' ? 1 : activeTab === 'clients' ? 2 : 3;
    
    for (let i = 1; i <= 20; i++) {
      mockUsers.push({
        id: i,
        first_name: `User${i}`,
        last_name: `Last${i}`,
        email: `user${i}@example.com`,
        role_id: roleId,
        country: ['USA', 'Canada', 'UK', 'Germany', 'France'][Math.floor(Math.random() * 5)],
        is_deleted: Math.random() > 0.8,
        is_verified: roleId === 3 ? Math.random() > 0.3 : true,
        rating: roleId === 3 ? (Math.random() * 2 + 3).toFixed(1) : null,
        rating_count: roleId === 3 ? Math.floor(Math.random() * 50) + 1 : null,
        created_at: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString()
      });
    }
    
    return mockUsers;
  };

  const loadUsers = async () => {
    setLoading(true);
    try {
      const roleId = activeTab === 'admins' ? 1 : activeTab === 'clients' ? 2 : 3;
      const response = await apiCall(`/api/users?role=${roleId}`);
      
      if (response.success) {
        setUsers(response.data);
      }
    } catch (error) {
      console.error('Error loading users:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterUsers = () => {
    let filtered = [...users];

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(user =>
        user.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply status filter
    switch (filterStatus) {
      case 'active':
        filtered = filtered.filter(user => !user.is_deleted);
        break;
      case 'inactive':
        filtered = filtered.filter(user => user.is_deleted);
        break;
      case 'verified':
        filtered = filtered.filter(user => user.is_verified);
        break;
      case 'unverified':
        filtered = filtered.filter(user => !user.is_verified);
        break;
    }

    setFilteredUsers(filtered);
  };

  const handleEdit = (user) => {
    setEditingUser(user);
    setModalType('edit');
    setShowModal(true);
  };

  const handleDelete = async (user) => {
    if (window.confirm(`Are you sure you want to ${user.is_deleted ? 'activate' : 'deactivate'} this user?`)) {
      try {
        const response = await apiCall(`/api/users/${user.id}`, {
          method: 'PATCH',
          body: JSON.stringify({ is_deleted: !user.is_deleted })
        });

        if (response.success) {
          loadUsers(); // Reload users
        }
      } catch (error) {
        console.error('Error updating user status:', error);
      }
    }
  };

  const handleVerify = async (user, verified) => {
    try {
      const response = await apiCall(`/api/users/${user.id}/verify`, {
        method: 'PATCH',
        body: JSON.stringify({ is_verified: verified })
      });

      if (response.success) {
        loadUsers(); // Reload users
      }
    } catch (error) {
      console.error('Error updating verification status:', error);
    }
  };

  useEffect(() => {
    loadUsers();
  }, [activeTab]);

  useEffect(() => {
    filterUsers();
  }, [users, searchTerm, filterStatus]);

  const getRoleText = (roleId) => {
    switch (roleId) {
      case 1: return 'Admin';
      case 2: return 'Client';
      case 3: return 'Freelancer';
      default: return 'Unknown';
    }
  };

  const getRoleBadgeColor = (roleId) => {
    switch (roleId) {
      case 1: return 'bg-red-100 text-red-800';
      case 2: return 'bg-blue-100 text-blue-800';
      case 3: return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const EditModal = () => {
    const [formData, setFormData] = useState(editingUser || {});

    const handleSave = async () => {
      try {
        const response = await apiCall(`/api/users/${editingUser.id}`, {
          method: 'PUT',
          body: JSON.stringify(formData)
        });

        if (response.success) {
          setShowModal(false);
          setEditingUser(null);
          loadUsers();
        }
      } catch (error) {
        console.error('Error updating user:', error);
      }
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Edit User</h3>
            <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
              <input
                type="text"
                value={formData.first_name || ''}
                onChange={(e) => setFormData({...formData, first_name: e.target.value})}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
              <input
                type="text"
                value={formData.last_name || ''}
                onChange={(e) => setFormData({...formData, last_name: e.target.value})}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                value={formData.email || ''}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
              <input
                type="text"
                value={formData.country || ''}
                onChange={(e) => setFormData({...formData, country: e.target.value})}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>
          </div>

          <div className="flex justify-end space-x-3 mt-6">
            <button
              onClick={() => setShowModal(false)}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 flex items-center space-x-2"
            >
              <Save className="h-4 w-4" />
              <span>Save</span>
            </button>
          </div>
        </div>
      </div>
    );
  };

  const UserRow = ({ user }) => (
    <tr className="hover:bg-gray-50">
      {/* avatar + name */}
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center">
          <div className="h-10 w-10 flex-shrink-0">
            <div className="h-10 w-10 rounded-full bg-teal-100 flex items-center justify-center">
              <span className="text-sm font-medium text-teal-800">
                {user.first_name?.[0]}{user.last_name?.[0]}
              </span>
            </div>
          </div>
          <div className="ml-4">
            <div className="text-sm font-medium text-gray-900">
              {user.first_name} {user.last_name}
            </div>
            <div className="text-sm text-gray-500">{user.email}</div>
          </div>
        </div>
      </td>

      {/* role */}
      <td className="px-6 py-4 whitespace-nowrap">
        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRoleBadgeColor(user.role_id)}`}>
          {getRoleText(user.role_id)}
        </span>
      </td>

      {/* country */}
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
        {user.country}
      </td>

      {/* status */}
      <td className="px-6 py-4 whitespace-nowrap">
        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
          user.is_deleted ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
        }`}>
          {user.is_deleted ? 'Inactive' : 'Active'}
        </span>
      </td>

      {/* freelancer-specific fields */}
      {user.role_id === 3 && (
        <>
          <td className="px-6 py-4 whitespace-nowrap">
            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
              user.is_verified ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
            }`}>
              {user.is_verified ? 'Verified' : 'Pending'}
            </span>
          </td>
          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
            <div className="flex items-center">
              <Star className="h-4 w-4 text-yellow-400 mr-1" />
              {user.rating ? `${user.rating} (${user.rating_count || 0})` : 'No ratings'}
            </div>
          </td>
        </>
      )}

      {/* created date */}
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
        {user.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A'}
      </td>

      {/* actions */}
      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
        <div className="flex items-center justify-end space-x-2">
          <button onClick={() => handleEdit(user)} className="text-teal-600 hover:text-teal-900">
            <Edit3 className="h-4 w-4" />
          </button>
          <button onClick={() => handleDelete(user)} className={`${user.is_deleted ? 'text-green-600 hover:text-green-900' : 'text-red-600 hover:text-red-900'}`}>
            {user.is_deleted ? <UserCheck className="h-4 w-4" /> : <UserX className="h-4 w-4" />}
          </button>
          {user.role_id === 3 && !user.is_verified && (
            <button onClick={() => handleVerify(user, true)} className="text-green-600 hover:text-green-900">
              <CheckCircle className="h-4 w-4" />
            </button>
          )}
          {user.role_id === 3 && user.is_verified && (
            <button onClick={() => handleVerify(user, false)} className="text-red-600 hover:text-red-900">
              <XCircle className="h-4 w-4" />
            </button>
          )}
        </div>
      </td>
    </tr>
  );

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center space-x-4">
          <button onClick={onBack || (() => setActiveTab(initialTab))} className="p-2 text-gray-500 hover:text-gray-700">
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 capitalize">{activeTab} Management</h1>
            <p className="text-gray-600 mt-2">Manage all {activeTab} in your system</p>
          </div>
        </div>
        <button className="bg-teal-600 text-white px-4 py-2 rounded-lg hover:bg-teal-700 flex items-center space-x-2">
          <Plus className="h-4 w-4" />
          <span>Add {getRoleText(activeTab === 'admins' ? 1 : activeTab === 'clients' ? 2 : 3)}</span>
        </button>
      </div>

      {/* Tab Navigation */}
      <div className="mb-6">
        <nav className="flex space-x-8">
          {['admins', 'clients', 'freelancers'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`py-2 px-1 border-b-2 font-medium text-sm capitalize ${
                activeTab === tab
                  ? 'border-teal-500 text-teal-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab}
            </button>
          ))}
        </nav>
      </div>

      {/* filters */}
      <div className="bg-white rounded-lg shadow border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <input
                  type="text"
                  placeholder="Search users..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                />
              </div>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                {activeTab === 'freelancers' && (
                  <>
                    <option value="verified">Verified</option>
                    <option value="unverified">Unverified</option>
                  </>
                )}
              </select>
            </div>
          </div>
        </div>

        {/* table */}
        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600 mx-auto"></div>
            <p className="text-gray-500 mt-2">Loading...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Country</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  {activeTab === 'freelancers' && (
                    <>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Verification</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rating</th>
                    </>
                  )}
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredUsers.map((user) => (
                  <UserRow key={user.id} user={user} />
                ))}
              </tbody>
            </table>
            {filteredUsers.length === 0 && (
              <div className="p-8 text-center text-gray-500">
                No users found matching your criteria.
              </div>
            )}
          </div>
        )}
      </div>

      {showModal && <EditModal />}
    </div>
  );
};

export default UserManagementDashboard;