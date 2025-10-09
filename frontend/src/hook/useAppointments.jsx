import { useState } from 'react';
import { useSelector } from 'react-redux';
import axios from 'axios';

export const useAppointments = () => {
  const { token, userData } = useSelector((state) => state.auth);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const API_BASE = 'http://localhost:5000';

  const getConfig = () => ({
    headers: { 
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    withCredentials: true // Important for CORS
  });

  // Debug function
  const debugRequest = (method, endpoint, data = null) => {
    console.log(`🚀 ${method} ${API_BASE}${endpoint}`);
    console.log('🔐 Token:', token ? 'Present' : 'Missing');
    console.log('👤 User ID:', userData?.id);
    if (data) console.log('📦 Data:', data);
  };

  // Get all appointments (for admin)
  const fetchAllAppointments = async () => {
    setLoading(true);
    setError('');
    try {
      debugRequest('GET', '/appointments/get');
      const response = await axios.get(`${API_BASE}/appointments/get`, getConfig());
      setAppointments(response.data.appointments || []);
      return { success: true, data: response.data };
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Failed to fetch appointments';
      setError(errorMsg);
      console.error('❌ Fetch all error:', err.response?.data);
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  };

  // Get freelancer's appointments
  const fetchMyAppointments = async () => {
    setLoading(true);
    setError('');
    try {
      debugRequest('GET', '/appointments/my');
      const response = await axios.get(`${API_BASE}/appointments/my`, getConfig());
      setAppointments(response.data.appointments || []);
      return { success: true, data: response.data };
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Failed to fetch your appointments';
      setError(errorMsg);
      console.error('❌ Fetch my error:', err.response?.data);
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  };

  // Create appointment (for freelancer)
  const createAppointment = async (appointmentData) => {
    setLoading(true);
    setError('');
    try {
      debugRequest('POST', '/appointments/', appointmentData);
      const response = await axios.post(`${API_BASE}/appointments/`, appointmentData, getConfig());
      setAppointments(prev => [response.data.appointment, ...prev]);
      return { success: true, data: response.data };
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Failed to create appointment';
      setError(errorMsg);
      console.error('❌ Create error:', err.response?.data);
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  };

  // Create appointment by admin
  const createAppointmentByAdmin = async (appointmentData) => {
    setLoading(true);
    setError('');
    try {
      debugRequest('POST', '/appointments/admin/appointments', appointmentData);
      const response = await axios.post(`${API_BASE}/appointments/admin/appointments`, appointmentData, getConfig());
      setAppointments(prev => [response.data.appointment, ...prev]);
      return { success: true, data: response.data };
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Failed to create appointment';
      setError(errorMsg);
      console.error('❌ Create admin error:', err.response?.data);
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  };

  // Accept appointment
  const acceptAppointment = async (appointmentId) => {
    setError('');
    try {
      debugRequest('PATCH', `/appointments/accept/${appointmentId}`);
      const response = await axios.patch(`${API_BASE}/appointments/accept/${appointmentId}`, {}, getConfig());
      setAppointments(prev => 
        prev.map(apt => 
          apt.id === appointmentId ? { ...apt, status: 'accepted' } : apt
        )
      );
      return { success: true, data: response.data };
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Failed to accept appointment';
      setError(errorMsg);
      console.error('❌ Accept error:', err.response?.data);
      return { success: false, error: errorMsg };
    }
  };

  // Reject appointment
  const rejectAppointment = async (appointmentId) => {
    setError('');
    try {
      debugRequest('PATCH', `/appointments/reject/${appointmentId}`);
      const response = await axios.patch(`${API_BASE}/appointments/reject/${appointmentId}`, {}, getConfig());
      setAppointments(prev => 
        prev.map(apt => 
          apt.id === appointmentId ? { ...apt, status: 'rejected' } : apt
        )
      );
      return { success: true, data: response.data };
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Failed to reject appointment';
      setError(errorMsg);
      console.error('❌ Reject error:', err.response?.data);
      return { success: false, error: errorMsg };
    }
  };

  // Reschedule appointment
  const rescheduleAppointment = async (appointmentId, newDate) => {
    setError('');
    try {
      debugRequest('PATCH', `/appointments/reschedule/${appointmentId}`, { appointment_date: newDate });
      const response = await axios.patch(
        `${API_BASE}/appointments/reschedule/${appointmentId}`, 
        { appointment_date: newDate },
        getConfig()
      );
      setAppointments(prev => 
        prev.map(apt => 
          apt.id === appointmentId ? { ...apt, appointment_date: newDate } : apt
        )
      );
      return { success: true, data: response.data };
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Failed to reschedule appointment';
      setError(errorMsg);
      console.error('❌ Reschedule error:', err.response?.data);
      return { success: false, error: errorMsg };
    }
  };

  return {
    appointments,
    loading,
    error,
    setError,
    fetchAllAppointments,
    fetchMyAppointments,
    createAppointment,
    acceptAppointment,
    rejectAppointment,
    rescheduleAppointment,
    createAppointmentByAdmin
  };
};