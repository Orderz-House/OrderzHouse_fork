import React, { useState, useEffect, useCallback } from 'react';

const AppointmentsDashboard = ({ onBack }) => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [showRescheduleModal, setShowRescheduleModal] = useState(false);
  const [newDate, setNewDate] = useState('');
  const [userDetails, setUserDetails] = useState(null);
  const [userLoading, setUserLoading] = useState(false);

  const fetchAppointments = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch('/appointments/get');
      const data = await response.json();
      
      if (data.success) {
        setAppointments(data.appointments);
        setError(null);
        // Debug: Log the first appointment to see what fields are available
        if (data.appointments.length > 0) {
          console.log('First appointment data:', data.appointments[0]);
        }
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

  const fetchUserDetails = async (userId) => {
    setUserLoading(true);
    try {
      const response = await fetch(`/users/${userId}`);
      const data = await response.json();
      
      if (data.success) {
        setUserDetails(data.user);
      } else {
        console.error('Failed to fetch user details:', data.message);
        setUserDetails(null);
      }
    } catch (err) {
      console.error('Error fetching user details:', err);
      setUserDetails(null);
    } finally {
      setUserLoading(false);
    }
  };

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
        setUserDetails(null);
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
        setUserDetails(null);
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
    
    // Fetch full user details when opening modal
    if (appointment.user_id || appointment.freelancer_id) {
      fetchUserDetails(appointment.user_id || appointment.freelancer_id);
    }
  };

  const filteredAppointments = appointments.filter(appointment => {
    const matchesFilter = filter === 'all' || appointment.status === filter;
    const matchesSearch = !searchTerm || 
      appointment.freelancer_id.toString().includes(searchTerm) ||
      (appointment.freelancer_email && appointment.freelancer_email.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (appointment.freelancer_phone && appointment.freelancer_phone.includes(searchTerm)) ||
      (appointment.message && appointment.message.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesFilter && matchesSearch;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return '#3b82f6'; // Blue
      case 'accepted': return '#10b981'; // Green
      case 'rejected': return '#6b7280'; // Gray
      default: return '#6b7280';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDateForInput = (dateString) => {
    const date = new Date(dateString);
    return date.toISOString().slice(0, 16);
  };

  const getAppointmentStats = () => {
    return {
      total: appointments.length,
      pending: appointments.filter(a => a.status === 'pending').length,
      accepted: appointments.filter(a => a.status === 'accepted').length,
      rejected: appointments.filter(a => a.status === 'rejected').length
    };
  };

  const stats = getAppointmentStats();

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        height: '400px',
        fontSize: '16px',
        color: '#6b7280'
      }}>
        <div style={{ 
          width: '40px', 
          height: '40px', 
          border: '4px solid #e5e7eb',
          borderTop: '4px solid #3b82f6',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite',
          marginBottom: '16px'
        }}></div>
        Loading Appointments...
      </div>
    );
  }

  return (
    <div style={{
      backgroundColor: '#ffffff',
      minHeight: '100vh',
      padding: '20px',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    }}>
      {/* Include Flaticon CSS */}
      <link rel="stylesheet" href="https://cdn-uicons.flaticon.com/uicons-regular-rounded/css/uicons-regular-rounded.css" />
      
      <style>
        {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
          .appointment-row:hover {
            background-color: #f9fafb;
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
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '30px',
        paddingBottom: '20px',
        borderBottom: '1px solid #e5e7eb'
      }}>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <button
            onClick={onBack}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '24px',
              cursor: 'pointer',
              marginRight: '12px',
              color: '#6b7280',
              padding: '4px',
              borderRadius: '4px'
            }}
            onMouseOver={(e) => e.target.style.backgroundColor = '#f3f4f6'}
            onMouseOut={(e) => e.target.style.backgroundColor = 'transparent'}
          >
            ← Back
          </button>
          <div>
            <h1 style={{
              fontSize: '24px',
              fontWeight: 'bold',
              color: '#1e293b',
              margin: 0,
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <i className="fi fi-rr-calendar" style={{ fontSize: '20px' }}></i>
              Appointments Management
            </h1>
          </div>
        </div>
        <button
          onClick={fetchAppointments}
          disabled={loading}
          style={{
            backgroundColor: '#3b82f6',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            padding: '8px 16px',
            cursor: 'pointer',
            fontSize: '14px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            opacity: loading ? 0.6 : 1
          }}
        >
          <i className="fi fi-rr-refresh"></i>
          Refresh
        </button>
      </div>

      {/* Stats Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '20px',
        marginBottom: '30px'
      }}>
        {[
          { title: 'Total Appointments', value: stats.total, color: '#6b7280', icon: 'fi-rr-list' },
          { title: 'Pending Review', value: stats.pending, color: '#3b82f6', icon: 'fi-rr-clock' },
          { title: 'Accepted', value: stats.accepted, color: '#10b981', icon: 'fi-rr-check' },
          { title: 'Rejected', value: stats.rejected, color: '#6b7280', icon: 'fi-rr-cross' }
        ].map((stat, index) => (
          <div
            key={index}
            style={{
              backgroundColor: '#ffffff',
              padding: '20px',
              border: '1px solid #e9ecef',
              borderRadius: '8px',
              boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
              position: 'relative',
              overflow: 'hidden'
            }}
          >
            <div style={{
              fontSize: '12px',
              fontWeight: '500',
              color: '#6b7280',
              marginBottom: '8px',
              textTransform: 'uppercase',
              letterSpacing: '0.8px'
            }}>
              {stat.title}
            </div>
            <div style={{
              fontSize: '24px',
              fontWeight: '700',
              color: '#000000',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <i className={`fi ${stat.icon}`} style={{ fontSize: '20px', color: stat.color }}></i>
              {stat.value}
            </div>
            <div style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              height: '3px',
              backgroundColor: stat.color,
              opacity: 0.6
            }} />
          </div>
        ))}
      </div>

      {/* Filters and Search */}
      <div style={{
        display: 'flex',
        gap: '16px',
        marginBottom: '24px',
        flexWrap: 'wrap',
        alignItems: 'center'
      }}>
        <div style={{ display: 'flex', gap: '8px' }}>
          {['all', 'pending', 'accepted', 'rejected'].map(status => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              style={{
                padding: '8px 16px',
                border: '1px solid #e5e7eb',
                borderRadius: '6px',
                backgroundColor: filter === status ? '#3b82f6' : '#ffffff',
                color: filter === status ? '#ffffff' : '#374151',
                cursor: 'pointer',
                fontSize: '14px',
                textTransform: 'capitalize',
                transition: 'all 0.2s ease'
              }}
            >
              {status === 'all' ? 'All Status' : status}
            </button>
          ))}
        </div>
        <div style={{ position: 'relative' }}>
          <i className="fi fi-rr-search" style={{
            position: 'absolute',
            left: '12px',
            top: '50%',
            transform: 'translateY(-50%)',
            color: '#6b7280',
            fontSize: '14px'
          }}></i>
          <input
            type="text"
            placeholder="Search by ID, email, phone, or message..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              padding: '8px 12px 8px 36px',
              border: '1px solid #e5e7eb',
              borderRadius: '6px',
              fontSize: '14px',
              minWidth: '300px',
              outline: 'none',
              transition: 'border-color 0.2s ease'
            }}
            onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
            onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
          />
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div style={{
          backgroundColor: '#fef2f2',
          border: '1px solid #fecaca',
          borderRadius: '6px',
          padding: '12px',
          marginBottom: '20px',
          color: '#dc2626',
          fontSize: '14px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <i className="fi fi-rr-exclamation"></i>
          {error}
          <button
            onClick={() => setError(null)}
            style={{
              marginLeft: 'auto',
              background: 'none',
              border: 'none',
              color: '#dc2626',
              cursor: 'pointer',
              fontSize: '16px'
            }}
          >
            <i className="fi fi-rr-cross"></i>
          </button>
        </div>
      )}

      {/* Appointments Table */}
      <div style={{
        backgroundColor: '#ffffff',
        border: '1px solid #e5e7eb',
        borderRadius: '8px',
        overflow: 'hidden',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
      }}>
        {/* Fixed Table Header */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '80px 250px 180px 1fr 120px 120px 180px',
          gap: '16px',
          padding: '16px',
          backgroundColor: '#f8f9fa',
          borderBottom: '1px solid #e5e7eb',
          fontSize: '12px',
          fontWeight: '600',
          color: '#374151',
          textTransform: 'uppercase',
          letterSpacing: '0.5px'
        }}>
          <div>ID</div>
          <div>Freelancer</div>
          <div>Date & Time</div>
          <div>Message</div>
          <div>Type</div>
          <div>Status</div>
          <div>Actions</div>
        </div>

        {filteredAppointments.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '60px 40px',
            color: '#6b7280',
            fontSize: '16px'
          }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>
              <i className="fi fi-rr-calendar" style={{ color: '#e5e7eb' }}></i>
            </div>
            <h3 style={{ margin: '0 0 8px 0', color: '#374151' }}>
              {searchTerm || filter !== 'all' ? 'No appointments match your filters' : 'No appointments found'}
            </h3>
            <p style={{ margin: 0, fontSize: '14px' }}>
              {searchTerm || filter !== 'all' ? 'Try adjusting your search criteria' : 'Appointments will appear here once created'}
            </p>
          </div>
        ) : (
          filteredAppointments.map((appointment) => (
            <div
              key={appointment.id}
              className="appointment-row"
              style={{
                display: 'grid',
                gridTemplateColumns: '80px 250px 180px 1fr 120px 120px 180px',
                gap: '16px',
                padding: '16px',
                borderBottom: '1px solid #f1f3f4',
                alignItems: 'center',
                fontSize: '14px'
              }}
            >
              <div style={{ fontWeight: '600', color: '#1e293b' }}>
                #{appointment.id}
              </div>
              
              <div style={{ color: '#374151' }}>
                <div style={{ fontWeight: '600', fontSize: '13px', marginBottom: '2px' }}>
                  ID: {appointment.freelancer_id}
                </div>
                <div style={{ fontSize: '11px', color: '#6b7280' }}>
                  {appointment.freelancer_email || 'No email'} <br />
                  📞 {appointment.freelancer_phone || 'No phone'}
                </div>
              </div>
              
              <div style={{ color: '#374151', fontSize: '12px' }}>
                {formatDate(appointment.appointment_date)}
              </div>
              
              <div style={{
                color: '#6b7280',
                fontSize: '12px',
                maxWidth: '250px',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap'
              }}>
                {appointment.message || 'No message provided'}
              </div>
              
              <div>
                <span style={{
                  padding: '4px 8px',
                  borderRadius: '12px',
                  fontSize: '11px',
                  fontWeight: '500',
                  backgroundColor: appointment.appointment_type === 'online' ? '#dbeafe' : '#f3f4f6',
                  color: appointment.appointment_type === 'online' ? '#1d4ed8' : '#374151',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  width: 'fit-content'
                }}>
                  <i className={appointment.appointment_type === 'online' ? 'fi fi-rr-globe' : 'fi fi-rr-building'}></i>
                  {appointment.appointment_type === 'online' ? 'Online' : 'In Company'}
                </span>
              </div>
              
              <div>
                <span style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  padding: '4px 8px',
                  borderRadius: '12px',
                  fontSize: '11px',
                  fontWeight: '500',
                  backgroundColor: `${getStatusColor(appointment.status)}20`,
                  color: getStatusColor(appointment.status),
                  width: 'fit-content'
                }}>
                  <i className={
                    appointment.status === 'pending' ? 'fi fi-rr-clock' :
                    appointment.status === 'accepted' ? 'fi fi-rr-check' : 'fi fi-rr-cross'
                  }></i>
                  {appointment.status}
                </span>
              </div>
              
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                {appointment.status === 'pending' && (
                  <>
                    <button
                      onClick={() => handleAction(appointment.id, 'accept')}
                      className="action-button"
                      disabled={actionLoading}
                      style={{
                        padding: '4px 8px',
                        fontSize: '11px',
                        border: '1px solid #10b981',
                        backgroundColor: '#10b981',
                        color: 'white',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}
                    >
                      <i className="fi fi-rr-check"></i>
                      Accept
                    </button>
                    <button
                      onClick={() => handleAction(appointment.id, 'reject')}
                      className="action-button"
                      disabled={actionLoading}
                      style={{
                        padding: '4px 8px',
                        fontSize: '11px',
                        border: '1px solid #6b7280',
                        backgroundColor: '#6b7280',
                        color: 'white',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}
                    >
                      <i className="fi fi-rr-cross"></i>
                      Reject
                    </button>
                  </>
                )}
                <button
                  onClick={() => handleViewAppointment(appointment)}
                  className="action-button"
                  style={{
                    padding: '4px 8px',
                    fontSize: '11px',
                    border: '1px solid #3b82f6',
                    backgroundColor: 'transparent',
                    color: '#3b82f6',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}
                >
                  <i className="fi fi-rr-eye"></i>
                  View
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Main Modal */}
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
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '8px',
            padding: '24px',
            maxWidth: '700px',
            width: '90%',
            maxHeight: '80vh',
            overflow: 'auto'
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '20px',
              paddingBottom: '16px',
              borderBottom: '1px solid #e5e7eb'
            }}>
              <h3 style={{ margin: 0, fontSize: '20px', fontWeight: '600', color: '#1e293b', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <i className="fi fi-rr-calendar"></i>
                Appointment Details #{selectedAppointment.id}
              </h3>
              <button
                onClick={() => {
                  setShowModal(false);
                  setSelectedAppointment(null);
                  setUserDetails(null);
                }}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '20px',
                  cursor: 'pointer',
                  color: '#6b7280',
                  padding: '4px',
                  borderRadius: '4px'
                }}
                onMouseOver={(e) => e.target.style.backgroundColor = '#f3f4f6'}
                onMouseOut={(e) => e.target.style.backgroundColor = 'transparent'}
              >
                <i className="fi fi-rr-cross"></i>
              </button>
            </div>

            <div style={{ marginBottom: '24px' }}>
              {/* Appointment Basic Info */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '16px',
                marginBottom: '16px'
              }}>
                <div style={{
                  padding: '12px',
                  backgroundColor: '#f8f9fa',
                  borderRadius: '6px'
                }}>
                  <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px', fontWeight: '500' }}>
                    APPOINTMENT DATE
                  </div>
                  <div style={{ fontSize: '14px', color: '#374151', fontWeight: '600' }}>
                    {formatDate(selectedAppointment.appointment_date)}
                  </div>
                </div>
                <div style={{
                  padding: '12px',
                  backgroundColor: '#f8f9fa',
                  borderRadius: '6px'
                }}>
                  <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px', fontWeight: '500' }}>
                    CREATED
                  </div>
                  <div style={{ fontSize: '14px', color: '#374151' }}>
                    {formatDate(selectedAppointment.created_at)}
                  </div>
                </div>
              </div>

              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '16px',
                marginBottom: '16px'
              }}>
                <div style={{
                  padding: '12px',
                  backgroundColor: '#f8f9fa',
                  borderRadius: '6px'
                }}>
                  <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px', fontWeight: '500' }}>
                    APPOINTMENT TYPE
                  </div>
                  <div style={{ fontSize: '14px', color: '#374151', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <i className={selectedAppointment.appointment_type === 'online' ? 'fi fi-rr-globe' : 'fi fi-rr-building'}></i>
                    {selectedAppointment.appointment_type === 'online' ? 'Online Meeting' : 'In-Person at Company'}
                  </div>
                </div>
                <div style={{
                  padding: '12px',
                  backgroundColor: '#f8f9fa',
                  borderRadius: '6px'
                }}>
                  <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px', fontWeight: '500' }}>
                    STATUS
                  </div>
                  <div style={{ fontSize: '14px', color: getStatusColor(selectedAppointment.status), fontWeight: '600', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <i className={
                      selectedAppointment.status === 'pending' ? 'fi fi-rr-clock' :
                      selectedAppointment.status === 'accepted' ? 'fi fi-rr-check' : 'fi fi-rr-cross'
                    }></i>
                    {selectedAppointment.status.charAt(0).toUpperCase() + selectedAppointment.status.slice(1)}
                  </div>
                </div>
              </div>

              {/* User Information */}
              <div style={{
                padding: '16px',
                backgroundColor: '#f8f9fa',
                borderRadius: '6px',
                marginBottom: '16px'
              }}>
                <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '12px', fontWeight: '500', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <i className="fi fi-rr-user"></i>
                  USER INFORMATION
                </div>
                
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                  gap: '16px'
                }}>
                  <div>
                    <div style={{ fontSize: '11px', color: '#6b7280', marginBottom: '4px', fontWeight: '500' }}>NAME</div>
                    <div style={{ fontSize: '14px', color: '#374151', fontWeight: '600' }}>
                      {selectedAppointment.first_name && selectedAppointment.last_name 
                        ? `${selectedAppointment.first_name} ${selectedAppointment.last_name}` 
                        : 'Name not available'}
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: '11px', color: '#6b7280', marginBottom: '4px', fontWeight: '500' }}>USER ID</div>
                    <div style={{ fontSize: '14px', color: '#374151', fontWeight: '600' }}>
                      #{selectedAppointment.freelancer_id}
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: '11px', color: '#6b7280', marginBottom: '4px', fontWeight: '500' }}>EMAIL</div>
                    <div style={{ fontSize: '14px', color: '#374151' }}>
                      {selectedAppointment.freelancer_email || 'Not provided'}
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: '11px', color: '#6b7280', marginBottom: '4px', fontWeight: '500' }}>PHONE</div>
                    <div style={{ fontSize: '14px', color: '#374151' }}>
                      {selectedAppointment.freelancer_phone || 'Not provided'}
                    </div>
                  </div>
                </div>
              </div>

              {/* Appointment Message */}
              <div style={{
                padding: '12px',
                backgroundColor: '#f8f9fa',
                borderRadius: '6px'
              }}>
                <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '8px', fontWeight: '500', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <i className="fi fi-rr-comment"></i>
                  APPOINTMENT MESSAGE
                </div>
                <div style={{
                  fontSize: '14px',
                  color: '#374151',
                  lineHeight: '1.5',
                  padding: '12px',
                  backgroundColor: '#ffffff',
                  borderRadius: '4px',
                  border: '1px solid #e5e7eb',
                  minHeight: '60px',
                  whiteSpace: 'pre-wrap'
                }}>
                  {selectedAppointment.message || 'No message provided for this appointment.'}
                </div>
              </div>
            </div>

            {/* Action Buttons */}
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
                      fontWeight: '500',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      opacity: actionLoading ? 0.6 : 1
                    }}
                  >
                    <i className="fi fi-rr-check"></i>
                    {actionLoading ? 'Processing...' : 'Accept Appointment'}
                  </button>
                  <button
                    onClick={() => handleAction(selectedAppointment.id, 'reject')}
                    disabled={actionLoading}
                    style={{
                      padding: '10px 20px',
                      backgroundColor: '#6b7280',
                      color: 'white',
                      border: 'none',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontSize: '14px',
                      fontWeight: '500',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      opacity: actionLoading ? 0.6 : 1
                    }}
                  >
                    <i className="fi fi-rr-cross"></i>
                    {actionLoading ? 'Processing...' : 'Reject Appointment'}
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
                  backgroundColor: '#3b82f6',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '500',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  opacity: actionLoading ? 0.6 : 1
                }}
              >
                <i className="fi fi-rr-calendar"></i>
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
          zIndex: 1001
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '8px',
            padding: '24px',
            maxWidth: '500px',
            width: '90%'
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '20px',
              paddingBottom: '16px',
              borderBottom: '1px solid #e5e7eb'
            }}>
              <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '600', color: '#1e293b', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <i className="fi fi-rr-calendar"></i>
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
                  color: '#6b7280'
                }}
              >
                <i className="fi fi-rr-cross"></i>
              </button>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: '500',
                color: '#374151',
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
                  padding: '10px 12px',
                  border: '1px solid #e5e7eb',
                  borderRadius: '6px',
                  fontSize: '14px',
                  outline: 'none'
                }}
                onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
                onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
              />
              <div style={{
                fontSize: '12px',
                color: '#6b7280',
                marginTop: '4px'
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
                  backgroundColor: '#6b7280',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <i className="fi fi-rr-cross"></i>
                Cancel
              </button>
              <button
                onClick={() => handleReschedule(selectedAppointment.id, newDate)}
                disabled={actionLoading || !newDate}
                style={{
                  padding: '8px 16px',
                  backgroundColor: newDate ? '#3b82f6' : '#9ca3af',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: newDate ? 'pointer' : 'not-allowed',
                  fontSize: '14px',
                  opacity: actionLoading ? 0.6 : 1,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <i className="fi fi-rr-calendar"></i>
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