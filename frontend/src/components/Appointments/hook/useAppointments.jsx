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
    }
  });

  // Get all appointments (for admin)
  const fetchAllAppointments = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await axios.get(`${API_BASE}/appointments/get`, getConfig());
      setAppointments(response.data.appointments || []);
      return { success: true, data: response.data };
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Failed to fetch appointments';
      setError(errorMsg);
      console.error('Fetch all appointments error:', err.response?.data);
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
      const response = await axios.get(`${API_BASE}/appointments/my`, getConfig());
      setAppointments(response.data.appointments || []);
      return { success: true, data: response.data };
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Failed to fetch your appointments';
      setError(errorMsg);
      console.error('Fetch my appointments error:', err.response?.data);
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
      const response = await axios.post(
        `${API_BASE}/appointments/`, 
        appointmentData, 
        getConfig()
      );
      setAppointments(prev => [response.data.appointment, ...prev]);
      return { success: true, data: response.data };
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Failed to create appointment';
      setError(errorMsg);
      console.error('Create appointment error:', err.response?.data);
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
      const response = await axios.post(
        `${API_BASE}/appointments/admin/appointments`, 
        appointmentData, 
        getConfig()
      );
      setAppointments(prev => [response.data.appointment, ...prev]);
      return { success: true, data: response.data };
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Failed to create appointment';
      setError(errorMsg);
      console.error('Create admin appointment error:', err.response?.data);
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  };

  // Accept appointment
  const acceptAppointment = async (appointmentId) => {
    setError('');
    try {
      const response = await axios.patch(
        `${API_BASE}/appointments/accept/${appointmentId}`, 
        {}, 
        getConfig()
      );
      setAppointments(prev => 
        prev.map(apt => 
          apt.id === appointmentId ? { ...apt, status: 'accepted' } : apt
        )
      );
      return { success: true, data: response.data };
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Failed to accept appointment';
      setError(errorMsg);
      console.error('Accept appointment error:', err.response?.data);
      return { success: false, error: errorMsg };
    }
  };

  // Reject appointment
  const rejectAppointment = async (appointmentId) => {
    setError('');
    try {
      const response = await axios.patch(
        `${API_BASE}/appointments/reject/${appointmentId}`, 
        {}, 
        getConfig()
      );
      setAppointments(prev => 
        prev.map(apt => 
          apt.id === appointmentId ? { ...apt, status: 'rejected' } : apt
        )
      );
      return { success: true, data: response.data };
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Failed to reject appointment';
      setError(errorMsg);
      console.error('Reject appointment error:', err.response?.data);
      return { success: false, error: errorMsg };
    }
  };

  // Mark appointment as completed
  const markAppointmentCompleted = async (appointmentId) => {
  console.log('🔍 [DEBUG] Starting markAppointmentCompleted for ID:', appointmentId);
  console.log('🔍 [DEBUG] API_BASE:', API_BASE);
  console.log('🔍 [DEBUG] Token exists:', !!token);
  
  setError('');
  try {
    const url = `${API_BASE}/appointments/complete/${appointmentId}`;
    console.log('🔍 [DEBUG] Calling URL:', url);
    
    const response = await axios.patch(
      url,
      {},
      getConfig()
    );
    
    console.log('🔍 [DEBUG] Success response:', response.data);
    
    // Update local state
    setAppointments(prev => 
      prev.map(apt => 
        apt.id === appointmentId ? { ...apt, status: 'completed' } : apt
      )
    );
    
    return { success: true, data: response.data };
  } catch (err) {
    console.error('🔍 [DEBUG] Full error object:', err);
    console.error('🔍 [DEBUG] Error response:', err.response);
    console.error('🔍 [DEBUG] Error message:', err.message);
    console.error('🔍 [DEBUG] Error code:', err.code);
    
    const errorMsg = err.response?.data?.message || err.message || 'Failed to mark appointment as completed';
    setError(errorMsg);
    return { success: false, error: errorMsg };
  }
};

  // Reschedule appointment
  const rescheduleAppointment = async (appointmentId, newDate) => {
    setError('');
    try {
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
      console.error('Reschedule appointment error:', err.response?.data);
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
    createAppointmentByAdmin,
    markAppointmentCompleted
  };
};