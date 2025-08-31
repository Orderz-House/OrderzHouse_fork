// Admin/components/AppointmentDashboard.jsx
import React, { useState, useEffect } from 'react';
import { ApiClient, useCurrentAdmin } from 'adminjs';

const AppointmentDashboard = () => {
  const [currentAdmin] = useCurrentAdmin();
  const [appointments, setAppointments] = useState([]);
  const [stats, setStats] = useState({
    pending: 0,
    accepted: 0,
    rejected: 0,
    cancelled: 0
  });
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('all');
  const [selectedItems, setSelectedItems] = useState([]);
  const [notification, setNotification] = useState(null);

  const api = new ApiClient();

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const response = await api.resourceAction({
        resourceId: 'appointments',
        actionName: 'list'
      });
      
      const appointmentData = response.data.records;
      setAppointments(appointmentData);
      
      const newStats = appointmentData.reduce((acc, appointment) => {
        const status = appointment.params.status;
        acc[status] = (acc[status] || 0) + 1;
        return acc;
      }, { pending: 0, accepted: 0, rejected: 0, cancelled: 0 });
      
      setStats(newStats);
    } catch (error) {
      console.error('Error fetching appointments:', error);
      showNotification('Error loading appointments', 'error');
    } finally {
      setLoading(false);
    }
  };

  const updateAppointmentStatus = async (appointmentId, newStatus) => {
    try {
      await api.recordAction({
        resourceId: 'appointments',
        recordId: appointmentId,
        actionName: 'edit',
        data: { status: newStatus }
      });
      
      await fetchAppointments();
      showNotification(`Appointment ${newStatus} successfully!`, 'success');
    } catch (error) {
      console.error('Error updating appointment:', error);
      showNotification('Error updating appointment', 'error');
    }
  };

  const bulkUpdateStatus = async (status) => {
    try {
      const updatePromises = selectedItems.map(id => 
        api.recordAction({
          resourceId: 'appointments',
          recordId: id,
          actionName: 'edit',
          data: { status }
        })
      );
      
      await Promise.all(updatePromises);
      await fetchAppointments();
      setSelectedItems([]);
      showNotification(`${selectedItems.length} appointments ${status} successfully!`, 'success');
    } catch (error) {
      console.error('Error bulk updating appointments:', error);
      showNotification('Error updating appointments', 'error');
    }
  };

  const showNotification = (message, type) => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const filteredAppointments = appointments.filter(appointment => 
    activeFilter === 'all' || appointment.params.status === activeFilter
  );

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusIcon = (status) => {
    const icons = {
      pending: '🟡',
      accepted: '✅',
      rejected: '❌',
      cancelled: '🚫'
    };
    return icons[status] || '❓';
  };

  const getTypeIcon = (type) => {
    const icons = {
      online: '💻',
      'in-person': '🤝',
      phone: '📞'
    };
    return icons[type] || '📅';
  };

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '400px',
        background: 'linear-gradient(135deg, #fef7ff 0%, #f0f9ff 100%)',
        borderRadius: '20px'
      }}>
        <div style={{ textAlign: 'center', color: '#7c3aed' }}>
          <div style={{ fontSize: '24px', marginBottom: '12px' }}>⏳</div>
          <div>Loading appointments...</div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ 
      fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      background: 'linear-gradient(135deg, #fef7ff 0%, #f0f9ff 100%)',
      minHeight: '100vh',
      padding: '20px'
    }}>
      {notification && (
        <div style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          padding: '16px 20px',
          borderRadius: '12px',
          color: 'white',
          fontWeight: '600',
          zIndex: 1000,
          background: notification.type === 'success' 
            ? 'linear-gradient(135deg, #10b981, #059669)'
            : 'linear-gradient(135deg, #f87171, #ef4444)'
        }}>
          {notification.message}
        </div>
      )}

      <div style={{
        background: 'linear-gradient(135deg, #e8f4fd 0%, #f3e8ff 100%)',
        padding: '30px',
        borderRadius: '20px',
        marginBottom: '30px',
        boxShadow: '0 4px 20px rgba(139, 92, 246, 0.1)',
        border: '1px solid #e0e7ff'
      }}>
        <h1 style={{ 
          fontSize: '32px', 
          fontWeight: '700', 
          color: '#5b21b6', 
          margin: '0 0 8px 0',
          display: 'flex',
          alignItems: 'center',
          gap: '12px'
        }}>
          📅 Appointment Management
        </h1>
        <p style={{ color: '#7c3aed', fontSize: '16px', opacity: '0.8', margin: 0 }}>
          Manage and track all appointment requests with ease
        </p>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: '20px',
        marginBottom: '30px'
      }}>
        {Object.entries(stats).map(([status, count]) => (
          <div key={status} style={{
            background: 'white',
            padding: '24px',
            borderRadius: '16px',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.06)',
            borderLeft: `5px solid ${
              status === 'pending' ? '#f59e0b' :
              status === 'accepted' ? '#10b981' :
              status === 'rejected' ? '#f87171' : '#9ca3af'
            }`,
            transition: 'all 0.3s ease',
            cursor: 'pointer'
          }}
          onClick={() => setActiveFilter(status)}
          onMouseEnter={(e) => {
            e.target.style.transform = 'translateY(-4px)';
            e.target.style.boxShadow = '0 8px 30px rgba(0, 0, 0, 0.1)';
          }}
          onMouseLeave={(e) => {
            e.target.style.transform = 'translateY(0)';
            e.target.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.06)';
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ 
                  fontSize: '36px', 
                  fontWeight: '800', 
                  marginBottom: '4px',
                  background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text'
                }}>
                  {count}
                </div>
                <div style={{ color: '#64748b', fontSize: '15px', fontWeight: '500' }}>
                  {getStatusIcon(status)} {status.charAt(0).toUpperCase() + status.slice(1)} Appointments
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div style={{
        background: 'white',
        padding: '20px',
        borderRadius: '16px',
        marginBottom: '20px',
        boxShadow: '0 2px 10px rgba(0, 0, 0, 0.04)',
        border: '1px solid #f1f5f9'
      }}>
        <div style={{ 
          fontWeight: '600', 
          color: '#334155', 
          marginBottom: '16px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          🔍 Quick Filters
        </div>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          {['all', 'pending', 'accepted', 'rejected', 'cancelled'].map(filter => (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              style={{
                padding: '10px 18px',
                background: activeFilter === filter 
                  ? 'linear-gradient(135deg, #8b5cf6, #7c3aed)'
                  : 'linear-gradient(135deg, #f8fafc, #f1f5f9)',
                border: `2px solid ${activeFilter === filter ? '#7c3aed' : '#e2e8f0'}`,
                borderRadius: '25px',
                fontSize: '14px',
                fontWeight: '500',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                color: activeFilter === filter ? 'white' : '#475569',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
              onMouseEnter={(e) => {
                if (activeFilter !== filter) {
                  e.target.style.transform = 'translateY(-2px)';
                  e.target.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.1)';
                }
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = 'none';
              }}
            >
              {filter === 'all' ? '📋' : getStatusIcon(filter)} 
              {filter.charAt(0).toUpperCase() + filter.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div style={{
        background: 'white',
        borderRadius: '20px',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.06)',
        overflow: 'hidden',
        border: '1px solid #f1f5f9'
      }}>
        <div style={{
          background: 'linear-gradient(135deg, #faf5ff, #f3e8ff)',
          padding: '20px 24px',
          borderBottom: '2px solid #e9d5ff',
          fontWeight: '700',
          color: '#581c87',
          fontSize: '18px',
          display: 'flex',
          alignItems: 'center',
          gap: '10px'
        }}>
          📊 Appointments Dashboard ({filteredAppointments.length} items)
        </div>

        {selectedItems.length > 0 && (
          <div style={{
            background: 'linear-gradient(135deg, #fef3c7, #fde68a)',
            padding: '16px 24px',
            borderBottom: '1px solid #f59e0b'
          }}>
            <div style={{
              fontSize: '14px',
              color: '#92400e',
              fontWeight: '600',
              marginBottom: '12px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              ☑️ {selectedItems.length} appointments selected
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                onClick={() => bulkUpdateStatus('accepted')}
                style={{
                  padding: '8px 16px',
                  background: 'linear-gradient(135deg, #10b981, #059669)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '10px',
                  fontSize: '12px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease'
                }}
              >
                ✅ Accept Selected
              </button>
              <button
                onClick={() => bulkUpdateStatus('rejected')}
                style={{
                  padding: '8px 16px',
                  background: 'linear-gradient(135deg, #f87171, #ef4444)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '10px',
                  fontSize: '12px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease'
                }}
              >
                ❌ Reject Selected
              </button>
            </div>
          </div>
        )}

        {filteredAppointments.length === 0 ? (
          <div style={{ 
            textAlign: 'center', 
            padding: '60px 20px', 
            color: '#94a3b8' 
          }}>
            <div style={{ fontSize: '64px', marginBottom: '16px', opacity: '0.5' }}>📅</div>
            <h3>No appointments found</h3>
            <p>No appointments match the current filter criteria.</p>
          </div>
        ) : (
          filteredAppointments.map((appointment, index) => {
            const appointmentId = appointment.id;
            const params = appointment.params;
            
            return (
              <div
                key={appointmentId}
                style={{
                  padding: '20px 24px',
                  borderBottom: index === filteredAppointments.length - 1 ? 'none' : '1px solid #f8fafc',
                  display: 'flex',
                  alignItems: 'center',
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => {
                  e.target.style.background = 'linear-gradient(135deg, #faf5ff, #ffffff)';
                  e.target.style.transform = 'translateX(4px)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = 'transparent';
                  e.target.style.transform = 'translateX(0)';
                }}
              >
                <input
                  type="checkbox"
                  checked={selectedItems.includes(appointmentId)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSelectedItems([...selectedItems, appointmentId]);
                    } else {
                      setSelectedItems(selectedItems.filter(id => id !== appointmentId));
                    }
                  }}
                  style={{
                    marginRight: '20px',
                    width: '18px',
                    height: '18px',
                    accentColor: '#8b5cf6'
                  }}
                />

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{
                    fontWeight: '700',
                    color: '#1e293b',
                    marginBottom: '6px',
                    fontSize: '16px'
                  }}>
                    #{appointmentId} - Appointment Request
                  </div>
                  
                  <div style={{
                    fontSize: '14px',
                    color: '#64748b',
                    marginBottom: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '16px',
                    flexWrap: 'wrap'
                  }}>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '4px 8px',
                      background: '#f8fafc',
                      borderRadius: '8px',
                      fontSize: '12px'
                    }}>
                      👤 Freelancer ID: {params.freelancer_id}
                    </div>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '4px 8px',
                      background: '#f8fafc',
                      borderRadius: '8px',
                      fontSize: '12px'
                    }}>
                      {getTypeIcon(params.appointment_type)} {params.appointment_type}
                    </div>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '4px 8px',
                      background: '#f8fafc',
                      borderRadius: '8px',
                      fontSize: '12px'
                    }}>
                      📅 {formatDate(params.appointment_date)}
                    </div>
                  </div>
                  
                  <div style={{
                    display: 'flex',
                    gap: '20px',
                    fontSize: '12px',
                    color: '#94a3b8',
                    marginTop: '4px'
                  }}>
                    <span>📅 Created: {formatDate(params.created_at)}</span>
                    {params.message && (
                      <span>💬 "{params.message.substring(0, 50)}..."</span>
                    )}
                  </div>
                </div>

                <div style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '8px 16px',
                  borderRadius: '20px',
                  fontSize: '13px',
                  fontWeight: '600',
                  margin: '0 16px',
                  minWidth: '110px',
                  justifyContent: 'center',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                  background: 
                    params.status === 'pending' ? 'linear-gradient(135deg, #fef3c7, #fde68a)' :
                    params.status === 'accepted' ? 'linear-gradient(135deg, #d1fae5, #a7f3d0)' :
                    params.status === 'rejected' ? 'linear-gradient(135deg, #fee2e2, #fecaca)' :
                    'linear-gradient(135deg, #f3f4f6, #e5e7eb)',
                  color:
                    params.status === 'pending' ? '#92400e' :
                    params.status === 'accepted' ? '#065f46' :
                    params.status === 'rejected' ? '#991b1b' :
                    '#374151',
                  boxShadow: `0 2px 8px ${
                    params.status === 'pending' ? 'rgba(245, 158, 11, 0.2)' :
                    params.status === 'accepted' ? 'rgba(16, 185, 129, 0.2)' :
                    params.status === 'rejected' ? 'rgba(248, 113, 113, 0.2)' :
                    'rgba(156, 163, 175, 0.2)'
                  }`
                }}>
                  {getStatusIcon(params.status)} {params.status}
                </div>

                <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
                  {params.status === 'pending' && (
                    <>
                      <button
                        onClick={() => updateAppointmentStatus(appointmentId, 'accepted')}
                        style={{
                          padding: '8px 16px',
                          border: 'none',
                          borderRadius: '10px',
                          fontSize: '12px',
                          fontWeight: '600',
                          cursor: 'pointer',
                          transition: 'all 0.3s ease',
                          background: 'linear-gradient(135deg, #10b981, #059669)',
                          color: 'white',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          textTransform: 'uppercase',
                          letterSpacing: '0.5px'
                        }}
                        onMouseEnter={(e) => {
                          e.target.style.transform = 'translateY(-2px)';
                          e.target.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)';
                        }}
                        onMouseLeave={(e) => {
                          e.target.style.transform = 'translateY(0)';
                          e.target.style.boxShadow = 'none';
                        }}
                      >
                        ✅ Accept
                      </button>
                      <button
                        onClick={() => updateAppointmentStatus(appointmentId, 'rejected')}
                        style={{
                          padding: '8px 16px',
                          border: 'none',
                          borderRadius: '10px',
                          fontSize: '12px',
                          fontWeight: '600',
                          cursor: 'pointer',
                          transition: 'all 0.3s ease',
                          background: 'linear-gradient(135deg, #f87171, #ef4444)',
                          color: 'white',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          textTransform: 'uppercase',
                          letterSpacing: '0.5px'
                        }}
                        onMouseEnter={(e) => {
                          e.target.style.transform = 'translateY(-2px)';
                          e.target.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)';
                        }}
                        onMouseLeave={(e) => {
                          e.target.style.transform = 'translateY(0)';
                          e.target.style.boxShadow = 'none';
                        }}
                      >
                        ❌ Reject
                      </button>
                    </>
                  )}
                  {params.status === 'accepted' && (
                    <button
                      onClick={() => updateAppointmentStatus(appointmentId, 'cancelled')}
                      style={{
                        padding: '8px 16px',
                        border: 'none',
                        borderRadius: '10px',
                        fontSize: '12px',
                        fontWeight: '600',
                        cursor: 'pointer',
                        transition: 'all 0.3s ease',
                        background: 'linear-gradient(135deg, #9ca3af, #6b7280)',
                        color: 'white',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px'
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.transform = 'translateY(-2px)';
                        e.target.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)';
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.transform = 'translateY(0)';
                        e.target.style.boxShadow = 'none';
                      }}
                    >
                      🚫 Cancel
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default AppointmentDashboard;