import React, { useState } from 'react';
import { X, Calendar, AlertCircle } from 'lucide-react';
import { useAppointments } from './hook/useAppointments';

const RescheduleModal = ({ appointmentId, onClose, onSuccess, validateDate }) => {
  const { rescheduleAppointment, loading, error } = useAppointments();
  const [newDate, setNewDate] = useState('');
  const [dateError, setDateError] = useState('');

  // Validate date in real-time
  const validateDateTime = (dateTime) => {
    if (!dateTime) return true;
    
    const selectedDate = new Date(dateTime);
    const now = new Date();
    
    if (selectedDate <= now) {
      setDateError('Cannot reschedule to a past date. Please select a future date and time.');
      return false;
    }
    
    setDateError('');
    return true;
  };

  const handleDateChange = (e) => {
    const selectedDate = e.target.value;
    setNewDate(selectedDate);
    validateDateTime(selectedDate);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Final validation before submission
    if (!validateDateTime(newDate)) {
      return;
    }
    
    const result = await rescheduleAppointment(appointmentId, newDate);
    if (result.success) {
      onSuccess(newDate);
    }
  };

  // Set minimum datetime to current time
  const getMinDateTime = () => {
    const now = new Date();
    now.setMinutes(now.getMinutes() + 1);
    return now.toISOString().slice(0, 16);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl max-w-md w-full p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900 flex items-center">
            <Calendar className="w-6 h-6 mr-2 text-blue-600" />
            Reschedule Appointment
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
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              New Date & Time *
            </label>
            <input
              type="datetime-local"
              value={newDate}
              onChange={handleDateChange}
              required
              min={getMinDateTime()}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                dateError ? 'border-red-300' : 'border-gray-300'
              }`}
            />
            {dateError && (
              <div className="flex items-center space-x-2 mt-2 text-red-600 text-sm">
                <AlertCircle className="w-4 h-4" />
                <span>{dateError}</span>
              </div>
            )}
            <p className="text-xs text-gray-500 mt-1">
              Select a new date and time for this appointment
            </p>
          </div>

          {/* Action Buttons */}
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
              disabled={loading || !newDate || !!dateError}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'Rescheduling...' : 'Reschedule Appointment'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RescheduleModal;