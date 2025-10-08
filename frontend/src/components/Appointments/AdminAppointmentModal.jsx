import React, { useState, useEffect } from 'react';
import { X, Calendar, MessageCircle, User } from 'lucide-react';
import { useAppointments } from '../../hook/useAppointments';
import axios from 'axios';
import { useSelector } from 'react-redux';

const AdminAppointmentModal = ({ onClose, onSuccess }) => {
  const { createAppointmentByAdmin, loading, error } = useAppointments();
  const { token } = useSelector((state) => state.auth);
  const [freelancers, setFreelancers] = useState([]);
  const [formData, setFormData] = useState({
    freelancer_id: '',
    appointment_date: '',
    message: '',
    appointment_type: 'online'
  });

  useEffect(() => {
    // Fetch freelancers for the dropdown
    const fetchFreelancers = async () => {
      try {
        const response = await axios.get('http://localhost:5000/users/allfreelance', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setFreelancers(response.data.freelancers || []);
      } catch (err) {
        console.error('Failed to fetch freelancers:', err);
        // If the endpoint doesn't exist, you might need to create it
      }
    };
    fetchFreelancers();
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await createAppointmentByAdmin(formData);
    if (result.success) {
      onSuccess();
    }
  };

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl max-w-md w-full p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900 flex items-center">
            <Calendar className="w-6 h-6 mr-2 text-green-600" />
            Create Appointment (Admin)
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {error && (
          <div className="bg-red-50 text-red-700 p-3 rounded-lg mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Freelancer Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
              <User className="w-4 h-4 mr-2" />
              Select Freelancer
            </label>
            <select
              name="freelancer_id"
              value={formData.freelancer_id}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
            >
              <option value="">Choose a freelancer</option>
              {freelancers.map((freelancer) => (
                <option key={freelancer.id} value={freelancer.id}>
                  {freelancer.first_name} {freelancer.last_name} ({freelancer.email})
                </option>
              ))}
            </select>
          </div>

          {/* Appointment Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Appointment Type
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, appointment_type: 'online' }))}
                className={`p-3 border rounded-lg text-center transition-all ${
                  formData.appointment_type === 'online'
                    ? 'border-green-500 bg-green-50 text-green-700'
                    : 'border-gray-300 text-gray-600 hover:border-gray-400'
                }`}
              >
                🌐 Online
              </button>
              <button
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, appointment_type: 'in_company' }))}
                className={`p-3 border rounded-lg text-center transition-all ${
                  formData.appointment_type === 'in_company'
                    ? 'border-green-500 bg-green-50 text-green-700'
                    : 'border-gray-300 text-gray-600 hover:border-gray-400'
                }`}
              >
                🏢 In Company
              </button>
            </div>
          </div>

          {/* Date & Time */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Date & Time
            </label>
            <input
              type="datetime-local"
              name="appointment_date"
              value={formData.appointment_date}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
            />
          </div>

          {/* Message */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
              <MessageCircle className="w-4 h-4 mr-2" />
              Message (Optional)
            </label>
            <textarea
              name="message"
              value={formData.message}
              onChange={handleChange}
              rows="3"
              placeholder="Add any additional information..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 resize-none"
            />
          </div>

          {/* Buttons */}
          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !formData.appointment_date || !formData.freelancer_id}
              className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'Creating...' : 'Create Appointment'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminAppointmentModal;