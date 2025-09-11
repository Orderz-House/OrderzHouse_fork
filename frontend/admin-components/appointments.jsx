import React, { useState, useEffect, useCallback } from 'react';

const AppointmentsDashboard = ({ onBack }) => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('pending');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [showRescheduleModal, setShowRescheduleModal] = useState(false);
  const [newDate, setNewDate] = useState('');

  // Jordan timezone offset (UTC+3)
  const JORDAN_TIMEZONE_OFFSET = 3 * 60; // 3 hours in minutes

  const getJordanTime = (date = new Date()) => {
    const utc = date.getTime() + (date.getTimezoneOffset() * 60000);
    return new Date(utc + (JORDAN_TIMEZONE_OFFSET * 60000));
  };

  const getJordanDateString = (date = new Date()) => {
    return getJordanTime(date).toISOString().split('T')[0];
  };

  const getWeekRange = () => {
    const today = getJordanTime();
    const dayOfWeek = today.getDay(); // 0 = Sunday, 1 = Monday, etc.
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - dayOfWeek); // Start from Sunday
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6); // End on Saturday
    
    return {
      start: startOfWeek.toISOString().split('T')[0],
      end: endOfWeek.toISOString().split('T')[0]
    };
  };

  const fetchAppointments = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch('/appointments/get');
      const data = await response.json();
      
      if (data.success) {
        setAppointments(data.appointments);
        setError(null);
      } else {
        setError(data.message || 'Failed to fetch appointments');
      }
    } catch (err) {
      setError('Failed to fetch appointments');
      console.error('Error fetching appointments:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAppointments();
  }, [fetchAppointments]);

  const handleAction = async (appointmentId, action) => {
    setActionLoading(true);
    try {
      const response = await fetch(`/appointments/${action}/${appointmentId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      const data = await response.json();
      
      if (data.success) {
        setAppointments(prev => 
          prev.map(apt => 
            apt.id === appointmentId 
              ? { ...apt, status: action === 'accept' ? 'accepted' : 'rejected' }
              : apt
          )
        );
        setShowModal(false);
        setSelectedAppointment(null);
      } else {
        setError(data.message || `Failed to ${action} appointment`);
      }
    } catch (err) {
      setError(`Failed to ${action} appointment`);
      console.error(`Error ${action} appointment:`, err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleReschedule = async (appointmentId, newDateTime) => {
    setActionLoading(true);
    try {
      const response = await fetch(`/appointments/reschedule/${appointmentId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ appointment_date: newDateTime })
      });
      
      const data = await response.json();
      
      if (data.success) {
        setAppointments(prev => 
          prev.map(apt => 
            apt.id === appointmentId 
              ? { ...apt, appointment_date: newDateTime }
              : apt
          )
        );
        setShowRescheduleModal(false);
        setShowModal(false);
        setSelectedAppointment(null);
        setNewDate('');
      } else {
        setError(data.message || 'Failed to reschedule appointment');
      }
    } catch (err) {
      setError('Failed to reschedule appointment');
      console.error('Error rescheduling appointment:', err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleViewAppointment = (appointment) => {
    setSelectedAppointment(appointment);
    setShowModal(true);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'Asia/Amman'
    });
  };

  const formatDateForInput = (dateString) => {
    const date = new Date(dateString);
    // Convert to Jordan time for the input
    const jordanTime = new Date(date.getTime() + (JORDAN_TIMEZONE_OFFSET * 60 * 60 * 1000));
    return jordanTime.toISOString().slice(0, 16);
  };

  const getFilteredAppointments = (status) => {
    let filtered = appointments.filter(appointment => appointment.status === status);
    
    if (searchTerm) {
      filtered = filtered.filter(appointment =>
        appointment.freelancer_id.toString().includes(searchTerm) ||
        (appointment.freelancer_email && appointment.freelancer_email.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (appointment.freelancer_phone && appointment.freelancer_phone.includes(searchTerm)) ||
        (appointment.message && appointment.message.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }
    
    return filtered;
  };

  const getTodayAppointments = () => {
    const todayString = getJordanDateString();
    
    return appointments.filter(appointment => {
      const appointmentDate = new Date(appointment.appointment_date);
      const appointmentJordanDate = getJordanTime(appointmentDate);
      const appointmentDateString = appointmentJordanDate.toISOString().split('T')[0];
      return appointmentDateString === todayString;
    });
  };

  const getWeekAppointments = () => {
    const { start, end } = getWeekRange();
    
    return appointments.filter(appointment => {
      const appointmentDate = new Date(appointment.appointment_date);
      const appointmentJordanDate = getJordanTime(appointmentDate);
      const appointmentDateString = appointmentJordanDate.toISOString().split('T')[0];
      return appointmentDateString >= start && appointmentDateString <= end;
    });
  };

  const pendingAppointments = getFilteredAppointments('pending');
  const acceptedAppointments = getFilteredAppointments('accepted');
  const rejectedAppointments = getFilteredAppointments('rejected');
  const todayAppointments = getTodayAppointments();
  const weekAppointments = getWeekAppointments();

  if (loading) {
    return (
      <div style={{
        backgroundColor: '#f8fafc',
        minHeight: '100vh',
        padding: '32px',
        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center'
      }}>
        <div style={{ 
          width: '40px', 
          height: '40px', 
          border: '4px solid #e2e8f0',
          borderTop: '4px solid #3b82f6',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite',
          marginBottom: '16px'
        }}></div>
        <div style={{ fontSize: '16px', color: '#64748b' }}>Loading Appointments...</div>
      </div>
    );
  }

  const getCurrentAppointments = () => {
    switch (activeTab) {
      case 'pending':
        return pendingAppointments;
      case 'accepted':
        return acceptedAppointments;
      case 'rejected':
        return rejectedAppointments;
      default:
        return [];
    }
  };

  return (
    <div style={{
      backgroundColor: '#f8fafc',
      minHeight: '100vh',
      padding: '24px',
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
      color: '#334155'
    }}>
      <style>
        {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
          .appointment-row:hover {
            background-color: #f8fafc;
          }
          .tab-button {
            transition: all 0.2s ease;
          }
          .tab-button:hover {
            transform: translateY(-1px);
          }
        `}
      </style>

      {/* Header */}
      <div style={{ marginBottom: '32px' }}>
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
          <button
            onClick={onBack}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '24px',
              cursor: 'pointer',
              marginRight: '12px',
              color: '#64748b',
              padding: '8px',
              borderRadius: '8px'
            }}
          >
            ←
          </button>
          <h1 style={{
            fontSize: '2rem',
            fontWeight: '700',
            margin: '0',
            color: '#0f172a'
          }}>
            Appointments
          </h1>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div style={{
          backgroundColor: '#fef2f2',
          border: '1px solid #fecaca',
          borderRadius: '8px',
          padding: '12px 16px',
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
              fontSize: '18px'
            }}
          >
            ×
          </button>
        </div>
      )}

      {/* Main Layout */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '2fr 1fr',
        gap: '24px'
      }}>
        
        {/* Left Column - Main Appointments */}
        <div>
          {/* Tabs */}
          <div style={{
            display: 'flex',
            gap: '4px',
            marginBottom: '20px',
            backgroundColor: '#f1f5f9',
            padding: '4px',
            borderRadius: '8px',
            width: 'fit-content'
          }}>
            {[
              { key: 'pending', label: 'Pending', color: '#f59e0b' },
              { key: 'accepted', label: 'Accepted', color: '#10b981' },
              { key: 'rejected', label: 'Rejected', color: '#ef4444' }
            ].map(({ key, label, color }) => (
              <button
                key={key}
                onClick={() => setActiveTab(key)}
                className="tab-button"
                style={{
                  padding: '10px 20px',
                  border: 'none',
                  borderRadius: '6px',
                  backgroundColor: activeTab === key ? color : 'transparent',
                  color: activeTab === key ? '#ffffff' : '#64748b',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '600'
                }}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Search */}
          <div style={{ marginBottom: '20px' }}>
            <input
              type="text"
              placeholder="Search appointments..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: '100%',
                padding: '12px 16px',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                fontSize: '14px',
                outline: 'none',
                backgroundColor: '#ffffff'
              }}
            />
          </div>

          {/* Appointments List */}
          <div style={{
            backgroundColor: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: '8px',
            overflow: 'hidden'
          }}>
            {/* Header */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: '60px 1fr 140px 100px',
              gap: '16px',
              padding: '16px',
              backgroundColor: '#f8fafc',
              borderBottom: '1px solid #e2e8f0',
              fontSize: '12px',
              fontWeight: '600',
              color: '#64748b',
              textTransform: 'uppercase'
            }}>
              <div>ID</div>
              <div>Details</div>
              <div>Date</div>
              <div>Actions</div>
            </div>

            {(() => {
              const currentAppointments = getCurrentAppointments();
              
              if (currentAppointments.length === 0) {
                return (
                  <div style={{
                    textAlign: 'center',
                    padding: '40px',
                    color: '#64748b'
                  }}>
                    <p style={{ margin: 0, fontSize: '14px' }}>
                      No {activeTab} appointments found
                    </p>
                  </div>
                );
              }

              return currentAppointments.map((appointment) => (
                <div
                  key={appointment.id}
                  className="appointment-row"
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '60px 1fr 140px 100px',
                    gap: '16px',
                    padding: '16px',
                    borderBottom: '1px solid #f1f5f9',
                    alignItems: 'center',
                    fontSize: '14px'
                  }}
                >
                  <div style={{ fontWeight: '600', color: '#0f172a' }}>
                    #{appointment.id}
                  </div>
                  
                  <div>
                    <div style={{ fontWeight: '600', marginBottom: '4px' }}>
                      User #{appointment.freelancer_id}
                    </div>
                    <div style={{ fontSize: '12px', color: '#64748b' }}>
                      {appointment.freelancer_email || 'No email'}
                    </div>
                  </div>
                  
                  <div style={{ fontSize: '12px', color: '#334155' }}>
                    {new Date(appointment.appointment_date).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                      timeZone: 'Asia/Amman'
                    })}
                  </div>
                  
                  <div style={{ display: 'flex', gap: '8px' }}>
                    {activeTab === 'pending' && (
                      <>
                        <button
                          onClick={() => handleAction(appointment.id, 'accept')}
                          disabled={actionLoading}
                          style={{
                            padding: '4px 8px',
                            fontSize: '11px',
                            border: 'none',
                            backgroundColor: '#10b981',
                            color: 'white',
                            borderRadius: '4px',
                            cursor: 'pointer'
                          }}
                        >
                          ✓
                        </button>
                        <button
                          onClick={() => handleAction(appointment.id, 'reject')}
                          disabled={actionLoading}
                          style={{
                            padding: '4px 8px',
                            fontSize: '11px',
                            border: 'none',
                            backgroundColor: '#ef4444',
                            color: 'white',
                            borderRadius: '4px',
                            cursor: 'pointer'
                          }}
                        >
                          ✕
                        </button>
                      </>
                    )}
                    <button
                      onClick={() => handleViewAppointment(appointment)}
                      style={{
                        padding: '4px 8px',
                        fontSize: '11px',
                        border: '1px solid #3b82f6',
                        backgroundColor: 'transparent',
                        color: '#3b82f6',
                        borderRadius: '4px',
                        cursor: 'pointer'
                      }}
                    >
                      View
                    </button>
                  </div>
                </div>
              ));
            })()}
          </div>
        </div>

        {/* Right Column - Quick Views */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* Today's Appointments */}
          <div style={{
            backgroundColor: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: '8px',
            overflow: 'hidden'
          }}>
            <div style={{
              padding: '16px',
              backgroundColor: '#f8fafc',
              borderBottom: '1px solid #e2e8f0'
            }}>
              <h3 style={{
                margin: 0,
                fontSize: '16px',
                fontWeight: '600',
                color: '#0f172a'
              }}>
                Today ({todayAppointments.length})
              </h3>
            </div>
            
            <div style={{ maxHeight: '200px', overflow: 'auto' }}>
              {todayAppointments.length === 0 ? (
                <div style={{
                  textAlign: 'center',
                  padding: '20px',
                  color: '#64748b',
                  fontSize: '14px'
                }}>
                  No appointments today
                </div>
              ) : (
                todayAppointments.map((appointment) => (
                  <div
                    key={appointment.id}
                    style={{
                      padding: '12px 16px',
                      borderBottom: '1px solid #f1f5f9',
                      cursor: 'pointer'
                    }}
                    onClick={() => handleViewAppointment(appointment)}
                  >
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginBottom: '4px'
                    }}>
                      <span style={{ fontSize: '13px', fontWeight: '600' }}>
                        #{appointment.id}
                      </span>
                      <span style={{
                        padding: '2px 6px',
                        borderRadius: '4px',
                        fontSize: '10px',
                        fontWeight: '500',
                        backgroundColor: appointment.status === 'pending' ? '#fef3c7' : 
                                        appointment.status === 'accepted' ? '#d1fae5' : '#fee2e2',
                        color: appointment.status === 'pending' ? '#92400e' : 
                               appointment.status === 'accepted' ? '#065f46' : '#991b1b'
                      }}>
                        {appointment.status}
                      </span>
                    </div>
                    <div style={{ fontSize: '12px', color: '#64748b' }}>
                      {new Date(appointment.appointment_date).toLocaleTimeString('en-US', {
                        hour: '2-digit',
                        minute: '2-digit',
                        timeZone: 'Asia/Amman'
                      })}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* This Week's Appointments */}
          <div style={{
            backgroundColor: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: '8px',
            overflow: 'hidden'
          }}>
            <div style={{
              padding: '16px',
              backgroundColor: '#f8fafc',
              borderBottom: '1px solid #e2e8f0'
            }}>
              <h3 style={{
                margin: 0,
                fontSize: '16px',
                fontWeight: '600',
                color: '#0f172a'
              }}>
                This Week ({weekAppointments.length})
              </h3>
            </div>
            
            <div style={{ maxHeight: '200px', overflow: 'auto' }}>
              {weekAppointments.length === 0 ? (
                <div style={{
                  textAlign: 'center',
                  padding: '20px',
                  color: '#64748b',
                  fontSize: '14px'
                }}>
                  No appointments this week
                </div>
              ) : (
                weekAppointments.map((appointment) => (
                  <div
                    key={appointment.id}
                    style={{
                      padding: '12px 16px',
                      borderBottom: '1px solid #f1f5f9',
                      cursor: 'pointer'
                    }}
                    onClick={() => handleViewAppointment(appointment)}
                  >
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginBottom: '4px'
                    }}>
                      <span style={{ fontSize: '13px', fontWeight: '600' }}>
                        #{appointment.id}
                      </span>
                      <span style={{
                        padding: '2px 6px',
                        borderRadius: '4px',
                        fontSize: '10px',
                        fontWeight: '500',
                        backgroundColor: appointment.status === 'pending' ? '#fef3c7' : 
                                        appointment.status === 'accepted' ? '#d1fae5' : '#fee2e2',
                        color: appointment.status === 'pending' ? '#92400e' : 
                               appointment.status === 'accepted' ? '#065f46' : '#991b1b'
                      }}>
                        {appointment.status}
                      </span>
                    </div>
                    <div style={{ fontSize: '12px', color: '#64748b' }}>
                      {new Date(appointment.appointment_date).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                        timeZone: 'Asia/Amman'
                      })}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Refresh Button */}
          <button
            onClick={fetchAppointments}
            disabled={loading}
            style={{
              backgroundColor: '#3b82f6',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              padding: '12px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '500',
              opacity: loading ? 0.6 : 1
            }}
          >
            Refresh
          </button>
        </div>
      </div>

      {/* View Modal */}
      {showModal && selectedAppointment && (
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
            borderRadius: '8px',
            padding: '24px',
            maxWidth: '600px',
            width: '100%',
            maxHeight: '90vh',
            overflow: 'auto'
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '20px',
              paddingBottom: '16px',
              borderBottom: '1px solid #e2e8f0'
            }}>
              <h3 style={{
                margin: 0,
                fontSize: '20px',
                fontWeight: '600',
                color: '#0f172a'
              }}>
                Appointment #{selectedAppointment.id}
              </h3>
              <button
                onClick={() => {
                  setShowModal(false);
                  setSelectedAppointment(null);
                }}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '20px',
                  cursor: 'pointer',
                  color: '#64748b'
                }}
              >
                ×
              </button>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '16px',
                marginBottom: '16px'
              }}>
                <div>
                  <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '4px', fontWeight: '600' }}>
                    DATE & TIME
                  </div>
                  <div style={{ fontSize: '14px', color: '#0f172a' }}>
                    {formatDate(selectedAppointment.appointment_date)}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '4px', fontWeight: '600' }}>
                    STATUS
                  </div>
                  <div style={{ fontSize: '14px', color: '#0f172a', textTransform: 'capitalize' }}>
                    {selectedAppointment.status}
                  </div>
                </div>
              </div>

              <div style={{ marginBottom: '16px' }}>
                <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '4px', fontWeight: '600' }}>
                  USER DETAILS
                </div>
                <div style={{ fontSize: '14px', color: '#0f172a' }}>
                  <div>ID: {selectedAppointment.freelancer_id}</div>
                  <div>Email: {selectedAppointment.freelancer_email || 'Not provided'}</div>
                  <div>Phone: {selectedAppointment.freelancer_phone || 'Not provided'}</div>
                </div>
              </div>

              <div>
                <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '8px', fontWeight: '600' }}>
                  MESSAGE
                </div>
                <div style={{
                  fontSize: '14px',
                  color: '#334155',
                  lineHeight: '1.5',
                  padding: '12px',
                  backgroundColor: '#f8fafc',
                  borderRadius: '6px',
                  border: '1px solid #e2e8f0',
                  minHeight: '60px'
                }}>
                  {selectedAppointment.message || 'No message provided'}
                </div>
              </div>
            </div>

            <div style={{
              display: 'flex',
              gap: '12px',
              justifyContent: 'flex-end',
              paddingTop: '16px',
              borderTop: '1px solid #e2e8f0'
            }}>
              {selectedAppointment.status === 'pending' && (
                <>
                  <button
                    onClick={() => handleAction(selectedAppointment.id, 'accept')}
                    disabled={actionLoading}
                    style={{
                      padding: '8px 16px',
                      backgroundColor: '#10b981',
                      color: 'white',
                      border: 'none',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontSize: '14px',
                      fontWeight: '500'
                    }}
                  >
                    Accept
                  </button>
                  <button
                    onClick={() => handleAction(selectedAppointment.id, 'reject')}
                    disabled={actionLoading}
                    style={{
                      padding: '8px 16px',
                      backgroundColor: '#ef4444',
                      color: 'white',
                      border: 'none',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontSize: '14px',
                      fontWeight: '500'
                    }}
                  >
                    Reject
                  </button>
                </>
              )}
              <button
                onClick={() => {
                  setNewDate(formatDateForInput(selectedAppointment.appointment_date));
                  setShowRescheduleModal(true);
                }}
                disabled={actionLoading}
                style={{
                  padding: '8px 16px',
                  backgroundColor: '#3b82f6',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '500'
                }}
              >
                Reschedule
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reschedule Modal */}
      {showRescheduleModal && selectedAppointment && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.7)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1001,
          padding: '20px'
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '8px',
            padding: '24px',
            maxWidth: '400px',
            width: '100%',
            boxShadow: '0 10px 25px rgba(0, 0, 0, 0.2)'
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '20px',
              paddingBottom: '16px',
              borderBottom: '1px solid #e2e8f0'
            }}>
              <h3 style={{
                margin: 0,
                fontSize: '18px',
                fontWeight: '600',
                color: '#0f172a'
              }}>
                Reschedule Appointment #{selectedAppointment.id}
              </h3>
              <button
                onClick={() => {
                  setShowRescheduleModal(false);
                  setNewDate('');
                }}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '20px',
                  cursor: 'pointer',
                  color: '#64748b',
                  padding: '4px',
                  borderRadius: '4px'
                }}
              >
                ×
              </button>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: '600',
                color: '#0f172a',
                marginBottom: '8px'
              }}>
                New Date & Time
              </label>
              <input
                type="datetime-local"
                value={newDate}
                onChange={(e) => setNewDate(e.target.value)}
                min={new Date().toISOString().slice(0, 16)}
                style={{
                  width: '100%',
                  padding: '10px',
                  border: '1px solid #e2e8f0',
                  borderRadius: '6px',
                  fontSize: '14px',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
              />
              <div style={{
                fontSize: '12px',
                color: '#64748b',
                marginTop: '8px',
                padding: '8px',
                backgroundColor: '#f8fafc',
                borderRadius: '4px',
                border: '1px solid #e2e8f0'
              }}>
                Current: {formatDate(selectedAppointment.appointment_date)}
              </div>
            </div>

            <div style={{
              display: 'flex',
              gap: '12px',
              justifyContent: 'flex-end'
            }}>
              <button
                onClick={() => {
                  setShowRescheduleModal(false);
                  setNewDate('');
                }}
                style={{
                  padding: '8px 16px',
                  backgroundColor: '#ef4444',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '500'
                }}
              >
                Cancel
              </button>
              <button
                onClick={() => handleReschedule(selectedAppointment.id, newDate)}
                disabled={actionLoading || !newDate}
                style={{
                  padding: '8px 16px',
                  backgroundColor: newDate ? '#3b82f6' : '#d1d5db',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: newDate ? 'pointer' : 'not-allowed',
                  fontSize: '14px',
                  fontWeight: '500',
                  opacity: actionLoading ? 0.6 : 1
                }}
              >
                {actionLoading ? 'Rescheduling...' : 'Reschedule'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AppointmentsDashboard;