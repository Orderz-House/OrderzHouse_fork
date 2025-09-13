import React, { useState, useEffect, useCallback } from 'react';
import Loader from "../admin-components/loader/loader.jsx"; 

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
  const [dateFilter, setDateFilter] = useState('all'); // all, today, tomorrow, this_week

  // Jordan timezone utilities
  const getJordanTime = (date = new Date()) => {
    const utc = date.getTime() + (date.getTimezoneOffset() * 60000);
    return new Date(utc + (3 * 60 * 60000)); // UTC+3
  };

  const getJordanDateString = (date = new Date()) => {
    return getJordanTime(date).toISOString().split('T')[0];
  };

  const isToday = (dateString) => {
    const today = getJordanDateString();
    const appointmentDate = getJordanDateString(new Date(dateString));
    return appointmentDate === today;
  };

  const isTomorrow = (dateString) => {
    const tomorrow = new Date(getJordanTime());
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowString = tomorrow.toISOString().split('T')[0];
    const appointmentDate = getJordanDateString(new Date(dateString));
    return appointmentDate === tomorrowString;
  };

  const isThisWeek = (dateString) => {
    const today = getJordanTime();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay()); // Start from Sunday
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6); // End on Saturday
    
    const appointmentDate = getJordanTime(new Date(dateString));
    return appointmentDate >= startOfWeek && appointmentDate <= endOfWeek;
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
    
    // Set up real-time polling for appointments every 30 seconds
    const interval = setInterval(() => {
      fetchAppointments();
    }, 30000);

    return () => clearInterval(interval);
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
    const jordanTime = new Date(date.getTime() + (3 * 60 * 60 * 1000));
    return jordanTime.toISOString().slice(0, 16);
  };

  const getFilteredAppointments = (status) => {
    let filtered = appointments.filter(appointment => appointment.status === status);
    
    // Apply date filter
    if (dateFilter !== 'all') {
      filtered = filtered.filter(appointment => {
        switch (dateFilter) {
          case 'today':
            return isToday(appointment.appointment_date);
          case 'tomorrow':
            return isTomorrow(appointment.appointment_date);
          case 'this_week':
            return isThisWeek(appointment.appointment_date);
          default:
            return true;
        }
      });
    }
    
    // Apply search filter
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
    return appointments.filter(appointment => isToday(appointment.appointment_date));
  };

  const getWeekAppointments = () => {
    return appointments.filter(appointment => isThisWeek(appointment.appointment_date));
  };

  const pendingAppointments = getFilteredAppointments('pending');
  const acceptedAppointments = getFilteredAppointments('accepted');
  const rejectedAppointments = getFilteredAppointments('rejected');
  const todayAppointments = getTodayAppointments();
  const weekAppointments = getWeekAppointments();

  if (loading && appointments.length === 0) {
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
      backgroundColor: '#ffffff',
      minHeight: '100vh',
      padding: '24px',
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
      color: '#374151'
    }}>
      <style>
        {`
          .appointment-row:hover {
            background-color: #f9fafb;
            transition: all 0.2s ease;
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

          <h1 style={{
            fontSize: '2rem',
            fontWeight: '700',
            margin: '0',
            color: '#111827'
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

      {/* Main Appointments Table */}
      <div style={{
        backgroundColor: 'white',
        borderRadius: '12px',
        padding: '24px',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
        border: '1px solid #e5e7eb',
        marginBottom: '32px'
      }}>
        {/* Tabs */}
        <div style={{
          display: 'flex',
          gap: '4px',
          marginBottom: '20px',
          backgroundColor: '#f9fafb',
          padding: '4px',
          borderRadius: '8px',
          width: 'fit-content'
        }}>
          {[
            { key: 'pending', label: 'Pending', color: '#f59e0b', bgColor: '#fef3c7' },
            { key: 'accepted', label: 'Accepted', color: '#10b981', bgColor: '#d1fae5' },
            { key: 'rejected', label: 'Rejected', color: '#ef4444', bgColor: '#fee2e2' }
          ].map(({ key, label, color, bgColor }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className="tab-button"
              style={{
                padding: '10px 20px',
                border: 'none',
                borderRadius: '6px',
                backgroundColor: activeTab === key ? color : 'transparent',
                color: activeTab === key ? '#ffffff' : '#6b7280',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '600'
              }}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Filters */}
        <div style={{
          display: 'flex',
          gap: '12px',
          marginBottom: '20px',
          alignItems: 'center',
          flexWrap: 'wrap'
        }}>
          {/* Search */}
          <input
            type="text"
            placeholder="Search appointments..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              flex: '1',
              minWidth: '200px',
              maxWidth: '400px',
              padding: '10px 16px',
              border: '1px solid #d1d5db',
              borderRadius: '8px',
              fontSize: '14px',
              outline: 'none',
              backgroundColor: '#ffffff'
            }}
          />

          {/* Date Filter */}
          <select
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            style={{
              padding: '10px 16px',
              border: '1px solid #d1d5db',
              borderRadius: '8px',
              fontSize: '14px',
              backgroundColor: '#ffffff',
              color: '#374151',
              cursor: 'pointer',
              outline: 'none'
            }}
          >
            <option value="all">All Dates</option>
            <option value="today">Today</option>
            <option value="tomorrow">Tomorrow</option>
            <option value="this_week">This Week</option>
          </select>
        </div>

        {/* Appointments Table */}
        <div style={{
          backgroundColor: '#ffffff',
          border: '1px solid #e5e7eb',
          borderRadius: '8px',
          overflow: 'hidden'
        }}>
          {/* Header */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '80px 1fr 160px 120px',
            gap: '16px',
            padding: '16px',
            backgroundColor: '#f9fafb',
            borderBottom: '1px solid #e5e7eb',
            fontSize: '12px',
            fontWeight: '600',
            color: '#6b7280',
            textTransform: 'uppercase'
          }}>
            <div>ID</div>
            <div>User Details</div>
            <div>Date & Time</div>
            <div>Actions</div>
          </div>

          {(() => {
            const currentAppointments = getCurrentAppointments();
            
            if (currentAppointments.length === 0) {
              return (
                <div style={{
                  textAlign: 'center',
                  padding: '48px',
                  color: '#6b7280'
                }}>
                  <p style={{ margin: 0, fontSize: '16px', fontWeight: '500' }}>
                    No {activeTab} appointments found
                  </p>
                  <p style={{ margin: '8px 0 0 0', fontSize: '14px' }}>
                    {dateFilter !== 'all' ? `Try changing the date filter` : 'Appointments will appear here'}
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
                  gridTemplateColumns: '80px 1fr 160px 120px',
                  gap: '16px',
                  padding: '16px',
                  borderBottom: '1px solid #f3f4f6',
                  alignItems: 'center',
                  fontSize: '14px',
                  cursor: 'pointer'
                }}
              >
                <div style={{ 
                  fontWeight: '600', 
                  color: '#111827',
                  background: '#f3f4f6',
                  padding: '4px 8px',
                  borderRadius: '6px',
                  textAlign: 'center',
                  fontSize: '12px'
                }}>
                  #{appointment.id}
                </div>
                
                <div>
                  <div style={{ fontWeight: '600', marginBottom: '4px', color: '#111827' }}>
                    User #{appointment.freelancer_id}
                  </div>
                  <div style={{ fontSize: '12px', color: '#6b7280' }}>
                    {appointment.freelancer_email || 'No email provided'}
                  </div>
                </div>
                
                <div style={{ 
                  fontSize: '12px', 
                  color: '#374151',
                  background: isToday(appointment.appointment_date) ? '#dcfce7' : 
                             isTomorrow(appointment.appointment_date) ? '#fef3c7' : '#f9fafb',
                  padding: '8px',
                  borderRadius: '6px',
                  textAlign: 'center'
                }}>
                  {new Date(appointment.appointment_date).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                    timeZone: 'Asia/Amman'
                  })}
                  {isToday(appointment.appointment_date) && (
                    <div style={{ fontSize: '10px', color: '#059669', fontWeight: '600', marginTop: '2px' }}>TODAY</div>
                  )}
                  {isTomorrow(appointment.appointment_date) && (
                    <div style={{ fontSize: '10px', color: '#d97706', fontWeight: '600', marginTop: '2px' }}>TOMORROW</div>
                  )}
                </div>
                
                <div style={{ display: 'flex', gap: '6px', justifyContent: 'center' }}>
                  {activeTab === 'pending' && (
                    <>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleAction(appointment.id, 'accept');
                        }}
                        disabled={actionLoading}
                        style={{
                          padding: '6px 10px',
                          fontSize: '12px',
                          border: 'none',
                          backgroundColor: '#10b981',
                          color: 'white',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          fontWeight: '600'
                        }}
                      >
                        ✓
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleAction(appointment.id, 'reject');
                        }}
                        disabled={actionLoading}
                        style={{
                          padding: '6px 10px',
                          fontSize: '12px',
                          border: 'none',
                          backgroundColor: '#ef4444',
                          color: 'white',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          fontWeight: '600'
                        }}
                      >
                        ✕
                      </button>
                    </>
                  )}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleViewAppointment(appointment);
                    }}
                    style={{
                      padding: '6px 12px',
                      fontSize: '11px',
                      border: '1px solid #374151',
                      backgroundColor: 'transparent',
                      color: '#374151',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontWeight: '600'
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

      {/* Today and This Week Containers */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '24px'
      }}>
        
        {/* Today's Appointments */}
        <div style={{
          backgroundColor: 'white',
          border: '1px solid #e5e7eb',
          borderRadius: '12px',
          overflow: 'hidden',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
           marginBottom: '48px' 
        }}>
          <div style={{
            padding: '16px',
            backgroundColor: '#f9fafb',
            borderBottom: '1px solid #e5e7eb'
          }}>
            <h3 style={{
              margin: 0,
              fontSize: '16px',
              fontWeight: '600',
              color: '#111827'
            }}>
              Today ({todayAppointments.length})
            </h3>
          </div>
          
          <div style={{ maxHeight: '300px', overflow: 'auto' }}>
            {todayAppointments.length === 0 ? (
              <div style={{
                textAlign: 'center',
                padding: '24px',
                color: '#6b7280',
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
                    borderBottom: '1px solid #f3f4f6',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                  onClick={() => handleViewAppointment(appointment)}
                  onMouseOver={(e) => e.target.style.backgroundColor = '#f9fafb'}
                  onMouseOut={(e) => e.target.style.backgroundColor = 'transparent'}
                >
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '4px'
                  }}>
                    <span style={{ fontSize: '13px', fontWeight: '600', color: '#111827' }}>
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
                      {appointment.status.toUpperCase()}
                    </span>
                  </div>
                  <div style={{ fontSize: '12px', color: '#6b7280' }}>
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
          backgroundColor: 'white',
          border: '1px solid #e5e7eb',
          borderRadius: '12px',
          overflow: 'hidden',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)', 
           marginBottom: '48px' 
        }}>
          <div style={{
            padding: '16px',
            backgroundColor: '#f9fafb',
            borderBottom: '1px solid #e5e7eb'
          }}>
            <h3 style={{
              margin: 0,
              fontSize: '16px',
              fontWeight: '600',
              color: '#111827'
            }}>
              This Week ({weekAppointments.length})
            </h3>
          </div>
          
          <div style={{ maxHeight: '300px', overflow: 'auto' }}>
            {weekAppointments.length === 0 ? (
              <div style={{
                textAlign: 'center',
                padding: '24px',
                color: '#6b7280',
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
                    borderBottom: '1px solid #f3f4f6',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                  onClick={() => handleViewAppointment(appointment)}
                  onMouseOver={(e) => e.target.style.backgroundColor = '#f9fafb'}
                  onMouseOut={(e) => e.target.style.backgroundColor = 'transparent'}
                >
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '4px'
                  }}>
                    <span style={{ fontSize: '13px', fontWeight: '600', color: '#111827' }}>
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
                      {appointment.status.toUpperCase()}
                    </span>
                  </div>
                  <div style={{ fontSize: '12px', color: '#6b7280' }}>
                    {new Date(appointment.appointment_date).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                      timeZone: 'Asia/Amman'
                    })}
                    {isToday(appointment.appointment_date) && (
                      <span style={{ 
                        marginLeft: '8px', 
                        padding: '1px 4px', 
                        backgroundColor: '#dcfce7', 
                        color: '#059669',
                        borderRadius: '4px',
                        fontSize: '9px',
                        fontWeight: '600'
                      }}>
                        TODAY
                      </span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
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
            borderRadius: '12px',
            padding: '32px',
            maxWidth: '600px',
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
                fontSize: '24px',
                fontWeight: '600',
                color: '#111827'
              }}>
                Appointment #{selectedAppointment.id}
              </h3>
              <button
                onClick={() => {
                  setShowModal(false);
                  setSelectedAppointment(null);
                }}
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
                ×
              </button>
            </div>

            <div style={{ marginBottom: '24px' }}>
              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '20px',
                marginBottom: '20px'
              }}>
                <div style={{
                  padding: '16px',
                  backgroundColor: '#f9fafb',
                  borderRadius: '8px',
                  border: '1px solid #e5e7eb'
                }}>
                  <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '6px', fontWeight: '600', textTransform: 'uppercase' }}>
                    Date & Time
                  </div>
                  <div style={{ fontSize: '16px', color: '#111827', fontWeight: '500' }}>
                    {formatDate(selectedAppointment.appointment_date)}
                  </div>
                  {isToday(selectedAppointment.appointment_date) && (
                    <div style={{ 
                      fontSize: '10px', 
                      color: '#059669', 
                      fontWeight: '600',
                      marginTop: '4px',
                      padding: '2px 6px',
                      backgroundColor: '#dcfce7',
                      borderRadius: '4px',
                      width: 'fit-content'
                    }}>
                      TODAY
                    </div>
                  )}
                </div>
                <div style={{
                  padding: '16px',
                  backgroundColor: '#f9fafb',
                  borderRadius: '8px',
                  border: '1px solid #e5e7eb'
                }}>
                  <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '6px', fontWeight: '600', textTransform: 'uppercase' }}>
                    Status
                  </div>
                  <div style={{ 
                    fontSize: '14px', 
                    fontWeight: '600',
                    textTransform: 'capitalize',
                    padding: '6px 12px',
                    borderRadius: '6px',
                    width: 'fit-content',
                    backgroundColor: selectedAppointment.status === 'pending' ? '#fef3c7' : 
                                    selectedAppointment.status === 'accepted' ? '#d1fae5' : '#fee2e2',
                    color: selectedAppointment.status === 'pending' ? '#92400e' : 
                           selectedAppointment.status === 'accepted' ? '#065f46' : '#991b1b'
                  }}>
                    {selectedAppointment.status}
                  </div>
                </div>
              </div>

              <div style={{ 
                marginBottom: '20px',
                padding: '16px',
                backgroundColor: '#f9fafb',
                borderRadius: '8px',
                border: '1px solid #e5e7eb'
              }}>
                <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '8px', fontWeight: '600', textTransform: 'uppercase' }}>
                  User Details
                </div>
                <div style={{ fontSize: '14px', color: '#111827', lineHeight: '1.6' }}>
                  <div style={{ marginBottom: '6px' }}>
                    <strong>ID:</strong> {selectedAppointment.freelancer_id}
                  </div>
                  <div style={{ marginBottom: '6px' }}>
                    <strong>Email:</strong> {selectedAppointment.freelancer_email || 'Not provided'}
                  </div>
                  <div>
                    <strong>Phone:</strong> {selectedAppointment.freelancer_phone || 'Not provided'}
                  </div>
                </div>
              </div>

              <div style={{
                padding: '16px',
                backgroundColor: '#f9fafb',
                borderRadius: '8px',
                border: '1px solid #e5e7eb'
              }}>
                <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '8px', fontWeight: '600', textTransform: 'uppercase' }}>
                  Message
                </div>
                <div style={{
                  fontSize: '14px',
                  color: '#374151',
                  lineHeight: '1.6',
                  padding: '12px',
                  backgroundColor: 'white',
                  borderRadius: '6px',
                  border: '1px solid #d1d5db',
                  minHeight: '60px',
                  fontStyle: selectedAppointment.message ? 'normal' : 'italic'
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
              borderTop: '1px solid #e5e7eb'
            }}>
              {selectedAppointment.status === 'pending' && (
                <>
                  <button
                    onClick={() => handleAction(selectedAppointment.id, 'accept')}
                    disabled={actionLoading}
                    style={{
                      padding: '10px 20px',
                      backgroundColor: '#10b981',
                      color: 'white',
                      border: 'none',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontSize: '14px',
                      fontWeight: '600',
                      transition: 'all 0.2s ease'
                    }}
                    onMouseOver={(e) => !actionLoading && (e.target.style.backgroundColor = '#059669')}
                    onMouseOut={(e) => !actionLoading && (e.target.style.backgroundColor = '#10b981')}
                  >
                    Accept
                  </button>
                  <button
                    onClick={() => handleAction(selectedAppointment.id, 'reject')}
                    disabled={actionLoading}
                    style={{
                      padding: '10px 20px',
                      backgroundColor: '#ef4444',
                      color: 'white',
                      border: 'none',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontSize: '14px',
                      fontWeight: '600',
                      transition: 'all 0.2s ease'
                    }}
                    onMouseOver={(e) => !actionLoading && (e.target.style.backgroundColor = '#dc2626')}
                    onMouseOut={(e) => !actionLoading && (e.target.style.backgroundColor = '#ef4444')}
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
                  padding: '10px 20px',
                  backgroundColor: '#374151',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '600',
                  transition: 'all 0.2s ease'
                }}
                onMouseOver={(e) => !actionLoading && (e.target.style.backgroundColor = '#111827')}
                onMouseOut={(e) => !actionLoading && (e.target.style.backgroundColor = '#374151')}
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
          backgroundColor: 'rgba(0, 0, 0, 0.6)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1001,
          padding: '20px'
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            padding: '32px',
            maxWidth: '450px',
            width: '100%',
            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.3)'
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
                color: '#111827'
              }}>
                Reschedule Appointment #{selectedAppointment.id}
              </h3>
              <button
                onClick={() => {
                  setShowRescheduleModal(false);
                  setNewDate('');
                }}
                style={{
                  background: '#374151',
                  border: 'none',
                  fontSize: '16px',
                  cursor: 'pointer',
                  color: 'white',
                  width: '28px',
                  height: '28px',
                  borderRadius: '4px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                ×
              </button>
            </div>

            <div style={{ marginBottom: '24px' }}>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: '600',
                color: '#111827',
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
                  padding: '12px',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  fontSize: '14px',
                  outline: 'none',
                  boxSizing: 'border-box',
                  backgroundColor: '#ffffff',
                  color: '#374151'
                }}
              />
              <div style={{
                fontSize: '12px',
                color: '#6b7280',
                marginTop: '8px',
                padding: '8px',
                backgroundColor: '#f9fafb',
                borderRadius: '4px',
                border: '1px solid #e5e7eb'
              }}>
                <strong>Current:</strong> {formatDate(selectedAppointment.appointment_date)}
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
                  padding: '10px 16px',
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
                onClick={() => handleReschedule(selectedAppointment.id, newDate)}
                disabled={actionLoading || !newDate}
                style={{
                  padding: '10px 16px',
                  backgroundColor: newDate ? '#374151' : '#d1d5db',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: newDate ? 'pointer' : 'not-allowed',
                  fontSize: '14px',
                  fontWeight: '600',
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