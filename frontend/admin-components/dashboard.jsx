// Admin/components/Dashboard.jsx
import React, { useEffect, useState } from "react";
import { ApiClient, useTranslation } from "adminjs";

const api = new ApiClient();

export default function Dashboard() {
  const { translateMessage } = useTranslation();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isNavOpen, setIsNavOpen] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        console.log("Fetching dashboard data...");
        
        // Try to get dashboard data from the handler
        const response = await api.getDashboard();
        console.log("Dashboard response:", response);
        setData(response.data);
        setError(null);
      } catch (err) {
        console.error("Dashboard error:", err);
        setError(err?.message || "Failed to load dashboard data");
        
        // Set fallback data
        setData({
          metrics: {
            usersCount: 0,
            clientsCount: 0,
            freelancersCount: 0,
            coursesCount: 0,
            plansCount: 0,
            projectsCount: 0,
            pendingAppointments: 0,
          },
          recentUsers: [],
          recentAppointments: [],
          chartData: { userTrends: [], appointmentStats: [] }
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    // Refresh every 30 seconds
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '400px',
        color: '#6b7280'
      }}>
        <div style={{
          width: '40px',
          height: '40px',
          border: '4px solid #e5e7eb',
          borderTop: '4px solid #8b5cf6',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite',
          marginBottom: '16px'
        }}></div>
        <p>Loading dashboard...</p>
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  const metrics = data?.metrics || {};
  const recentUsers = data?.recentUsers || [];
  const recentAppointments = data?.recentAppointments || [];

  const statsCards = [
    { title: "Total Users", value: metrics.usersCount || 0, color: "#8b5cf6", icon: "👥" },
    { title: "Active Clients", value: metrics.clientsCount || 0, color: "#10b981", icon: "👤" },
    { title: "Freelancers", value: metrics.freelancersCount || 0, color: "#f59e0b", icon: "💼" },
    { title: "Courses", value: metrics.coursesCount || 0, color: "#06b6d4", icon: "📚" },
    { title: "Plans", value: metrics.plansCount || 0, color: "#8b5cf6", icon: "💎" },
    { title: "Projects", value: metrics.projectsCount || 0, color: "#3b82f6", icon: "📋" },
    { title: "Pending Appointments", value: metrics.pendingAppointments || 0, color: "#ef4444", icon: "⏰" },
  ];

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    try {
      return new Date(dateString).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "2-digit"
      });
    } catch {
      return "-";
    }
  };

  const getRoleName = (roleId) => {
    switch (roleId) {
      case 2: return "Client";
      case 3: return "Freelancer";
      default: return "User";
    }
  };

  return (
    <div style={{
      padding: '24px',
      background: 'linear-gradient(135deg, #fef7ff 0%, #f0f9ff 100%)',
      minHeight: '100vh',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    }}>
      {/* Advanced Navigation Bar */}
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 50,
        background: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(10px)',
        borderBottom: '1px solid rgba(139, 92, 246, 0.1)',
        padding: '12px 24px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <img
            src="https://ti8ah.com/wp-content/uploads/2025/07/OrderzHouse-Logo-01-.png"
            alt="OrderzHouse"
            style={{ height: '36px', width: 'auto' }}
          />
          <div style={{
            height: '24px',
            width: '1px',
            background: 'rgba(139, 92, 246, 0.2)'
          }}></div>
          <div style={{
            display: 'flex',
            gap: '8px',
            alignItems: 'center'
          }}>
            <button 
              onClick={() => window.location.href = '/admin'}
              style={{
                padding: '6px 12px',
                borderRadius: '8px',
                background: '#8b5cf6',
                color: 'white',
                border: 'none',
                fontSize: '14px',
                fontWeight: '500',
                cursor: 'pointer'
              }}
            >
              Dashboard
            </button>
            <button 
              onClick={() => window.location.href = '/admin/resources/users'}
              style={{
                padding: '6px 12px',
                borderRadius: '8px',
                background: 'transparent',
                color: '#4b5563',
                border: 'none',
                fontSize: '14px',
                fontWeight: '500',
                cursor: 'pointer'
              }}
            >
              Users
            </button>
            <button 
              onClick={() => window.location.href = '/admin/resources/appointments'}
              style={{
                padding: '6px 12px',
                borderRadius: '8px',
                background: 'transparent',
                color: '#4b5563',
                border: 'none',
                fontSize: '14px',
                fontWeight: '500',
                cursor: 'pointer'
              }}
            >
              Appointments
            </button>
            <button 
              onClick={() => window.location.href = '/admin/resources/projects'}
              style={{
                padding: '6px 12px',
                borderRadius: '8px',
                background: 'transparent',
                color: '#4b5563',
                border: 'none',
                fontSize: '14px',
                fontWeight: '500',
                cursor: 'pointer'
              }}
            >
              Projects
            </button>
          </div>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button 
            onClick={() => window.location.href = '/admin/pages/analytics'}
            style={{
              padding: '8px 16px',
              borderRadius: '8px',
              background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)',
              color: 'white',
              border: 'none',
              fontSize: '14px',
              fontWeight: '500',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <span>📊</span>
            Analytics
          </button>
          
          <button 
            onClick={() => setIsNavOpen(!isNavOpen)}
            style={{
              padding: '8px',
              borderRadius: '8px',
              background: 'transparent',
              color: '#4b5563',
              border: '1px solid #e5e7eb',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M4 6H20M4 12H20M4 18H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>
        
        {/* Dropdown menu */}
        {isNavOpen && (
          <div style={{
            position: 'absolute',
            top: '100%',
            right: '24px',
            background: 'white',
            borderRadius: '12px',
            boxShadow: '0 10px 40px rgba(0, 0, 0, 0.1)',
            padding: '12px',
            minWidth: '200px',
            border: '1px solid #f3f4f6',
            zIndex: 60
          }}>
            <div style={{
              padding: '8px 12px',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '14px',
              color: '#4b5563'
            }}>
              Profile
            </div>
            <div style={{
              padding: '8px 12px',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '14px',
              color: '#4b5563'
            }}>
              Settings
            </div>
            <div style={{
              padding: '8px 12px',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '14px',
              color: '#ef4444'
            }}>
              Logout
            </div>
          </div>
        )}
      </div>

      {/* Main Content */}
      <div style={{ marginTop: '70px' }}>
        {/* Header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '32px',
          padding: '24px',
          background: 'white',
          borderRadius: '16px',
          boxShadow: '0 4px 20px rgba(139, 92, 246, 0.1)',
          border: '1px solid #e0e7ff'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div>
              <h1 style={{ margin: '0 0 4px 0', fontSize: '28px', fontWeight: '700', color: '#5b21b6' }}>
                OrderzHouse Dashboard
              </h1>
              <p style={{ margin: 0, color: '#7c3aed', fontSize: '14px' }}>
                Real-time business insights and management
              </p>
            </div>
          </div>
          
          {error && (
            <div style={{
              padding: '8px 12px',
              background: '#fee2e2',
              color: '#dc2626',
              borderRadius: '8px',
              fontSize: '12px',
              fontWeight: '500'
            }}>
              {error}
            </div>
          )}
        </div>

        {/* Stats Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '20px',
          marginBottom: '32px'
        }}>
          {statsCards.map((stat, index) => (
            <div
              key={index}
              style={{
                background: 'white',
                padding: '24px',
                borderRadius: '16px',
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.06)',
                border: '1px solid #f1f5f9',
                transition: 'all 0.3s ease',
                cursor: 'pointer'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.boxShadow = '0 8px 30px rgba(0, 0, 0, 0.1)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.06)';
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <div style={{
                  fontSize: '14px',
                  fontWeight: '500',
                  color: '#64748b',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em'
                }}>
                  {stat.title}
                </div>
                <div style={{ fontSize: '24px', opacity: '0.8' }}>
                  {stat.icon}
                </div>
              </div>
              <div style={{
                fontSize: '36px',
                fontWeight: '700',
                color: stat.color,
                marginBottom: '8px'
              }}>
                {stat.value}
              </div>
            </div>
          ))}
          
          {/* Analytics Card */}
          <div
            onClick={() => window.location.href = '/admin/pages/analytics'}
            style={{
              background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)',
              padding: '24px',
              borderRadius: '16px',
              boxShadow: '0 4px 20px rgba(139, 92, 246, 0.3)',
              border: '1px solid rgba(139, 92, 246, 0.2)',
              transition: 'all 0.3s ease',
              cursor: 'pointer',
              color: 'white',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-4px)';
              e.currentTarget.style.boxShadow = '0 8px 30px rgba(139, 92, 246, 0.4)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 4px 20px rgba(139, 92, 246, 0.3)';
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <div style={{
                fontSize: '14px',
                fontWeight: '500',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                opacity: '0.9'
              }}>
                Advanced Analytics
              </div>
              <div style={{ fontSize: '24px' }}>
                📊
              </div>
            </div>
            <div style={{
              fontSize: '36px',
              fontWeight: '700',
              marginBottom: '8px'
            }}>
              View Reports
            </div>
            <div style={{
              fontSize: '12px',
              opacity: '0.8',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}>
              Explore detailed analytics <span>→</span>
            </div>
          </div>
        </div>

        {/* Content Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
          gap: '24px'
        }}>
          {/* Recent Users */}
          <div style={{
            background: 'white',
            borderRadius: '16px',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.06)',
            border: '1px solid #f1f5f9',
            overflow: 'hidden'
          }}>
            <div style={{
              padding: '20px 24px',
              borderBottom: '1px solid #f3f4f6',
              background: '#fafafa'
            }}>
              <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '600', color: '#111827' }}>
                Recent Users
              </h3>
            </div>
            
            {recentUsers.length === 0 ? (
              <div style={{ padding: '40px 20px', textAlign: 'center', color: '#9ca3af', fontStyle: 'italic' }}>
                No recent users
              </div>
            ) : (
              <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                {recentUsers.map((user, i) => (
                  <div
                    key={i}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '12px 24px',
                      borderBottom: i === recentUsers.length - 1 ? 'none' : '1px solid #f3f4f6'
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: '500', color: '#111827' }}>
                        {user.first_name} {user.last_name}
                      </div>
                      <div style={{ fontSize: '12px', color: '#6b7280' }}>
                        {user.email}
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{
                        padding: '2px 8px',
                        borderRadius: '12px',
                        fontSize: '12px',
                        fontWeight: '500',
                        background: user.role_id === 2 ? '#dcfce7' : '#ede9fe',
                        color: user.role_id === 2 ? '#166534' : '#7c3aed'
                      }}>
                        {getRoleName(user.role_id)}
                      </div>
                      <div style={{ fontSize: '12px', color: '#9ca3af', marginTop: '4px' }}>
                        {formatDate(user.created_at)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Recent Appointments */}
          <div style={{
            background: 'white',
            borderRadius: '16px',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.06)',
            border: '1px solid #f1f5f9',
            overflow: 'hidden'
          }}>
            <div style={{
              padding: '20px 24px',
              borderBottom: '1px solid #f3f4f6',
              background: '#fafafa'
            }}>
              <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '600', color: '#111827' }}>
                Recent Appointments
              </h3>
            </div>
            
            {recentAppointments.length === 0 ? (
              <div style={{ padding: '40px 20px', textAlign: 'center', color: '#9ca3af', fontStyle: 'italic' }}>
                No recent appointments
              </div>
            ) : (
              <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                {recentAppointments.map((apt, i) => (
                  <div
                    key={i}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '12px 24px',
                      borderBottom: i === recentAppointments.length - 1 ? 'none' : '1px solid #f3f4f6'
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: '500', color: '#111827' }}>
                        Appointment #{apt.id}
                      </div>
                      <div style={{ fontSize: '12px', color: '#6b7280' }}>
                        {formatDate(apt.appointment_date)}
                      </div>
                    </div>
                    <div style={{
                      padding: '4px 8px',
                      borderRadius: '12px',
                      fontSize: '12px',
                      fontWeight: '500',
                      background: 
                        apt.status === 'pending' ? '#fef3c7' :
                        apt.status === 'accepted' ? '#dcfce7' :
                        apt.status === 'rejected' ? '#fee2e2' : '#f3f4f6',
                      color:
                        apt.status === 'pending' ? '#92400e' :
                        apt.status === 'accepted' ? '#065f46' :
                        apt.status === 'rejected' ? '#991b1b' : '#374151'
                    }}>
                      {(apt.status || 'pending').charAt(0).toUpperCase() + (apt.status || 'pending').slice(1)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Quick Actions */}
          <div style={{
            background: 'white',
            borderRadius: '16px',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.06)',
            border: '1px solid #f1f5f9',
            padding: '24px'
          }}>
            <h3 style={{ margin: '0 0 20px 0', fontSize: '18px', fontWeight: '600', color: '#111827' }}>
              Quick Actions
            </h3>
            <div style={{ display: 'grid', gap: '12px' }}>
              <button
                onClick={() => window.location.href = '/admin/resources/appointments'}
                style={{
                  padding: '12px 16px',
                  background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: '500',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
                onMouseEnter={(e) => {
                  e.target.style.transform = 'translateY(-1px)';
                  e.target.style.boxShadow = '0 4px 15px rgba(139, 92, 246, 0.4)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = 'none';
                }}
              >
                📅 Manage Appointments
              </button>
              
              <button
                onClick={() => window.location.href = '/admin/resources/clients'}
                style={{
                  padding: '12px 16px',
                  background: 'linear-gradient(135deg, #10b981, #059669)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: '500',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
                onMouseEnter={(e) => {
                  e.target.style.transform = 'translateY(-1px)';
                  e.target.style.boxShadow = '0 4px 15px rgba(16, 185, 129, 0.4)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = 'none';
                }}
              >
                👥 View Users
              </button>
              
              <button
                onClick={() => window.location.href = '/admin/resources/projects'}
                style={{
                  padding: '12px 16px',
                  background: 'linear-gradient(135deg, #3b82f6, #2563eb)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: '500',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
                onMouseEnter={(e) => {
                  e.target.style.transform = 'translateY(-1px)';
                  e.target.style.boxShadow = '0 4px 15px rgba(59, 130, 246, 0.4)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = 'none';
                }}
              >
                📋 Manage Projects
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}