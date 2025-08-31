// Admin/components/Dashboard.jsx
import React, { useEffect, useState } from "react";
import { ApiClient, useTranslation } from "adminjs";

const api = new ApiClient();

export default function Dashboard() {
  const { translateMessage } = useTranslation();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        console.log("Fetching dashboard data...");
        
        const response = await api.getDashboard();
        console.log("Dashboard response:", response);
        setData(response.data);
        setError(null);
      } catch (err) {
        console.error("Dashboard error:", err);
        setError(err?.message || "Failed to load dashboard data");
        
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
          borderTop: '4px solid #3b82f6',
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
    { title: "Total Users", value: metrics.usersCount || 0 },
    { title: "Active Clients", value: metrics.clientsCount || 0 },
    { title: "Freelancers", value: metrics.freelancersCount || 0 },
    { title: "Courses", value: metrics.coursesCount || 0 },
    { title: "Plans", value: metrics.plansCount || 0 },
    { title: "Projects", value: metrics.projectsCount || 0 },
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
      background: '#f8fafc',
      minHeight: '100vh',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '24px'
      }}>
        <div>
          <h1 style={{ margin: '0', fontSize: '24px', fontWeight: '600', color: '#1e293b' }}>
            Dashboard
          </h1>
        </div>
        
        {error && (
          <div style={{
            padding: '6px 12px',
            background: '#fee2e2',
            color: '#dc2626',
            borderRadius: '6px',
            fontSize: '12px',
            fontWeight: '500'
          }}>
            {error}
          </div>
        )}
      </div>

      {/* Stats Overview */}
      <div style={{
        background: 'white',
        borderRadius: '8px',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
        marginBottom: '24px',
        padding: '20px'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h2 style={{ margin: 0, fontSize: '16px', fontWeight: '600', color: '#1e293b' }}>
            Overview
          </h2>
        </div>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
          gap: '16px'
        }}>
          {statsCards.map((stat, index) => (
            <div
              key={index}
              style={{
                textAlign: 'center',
                padding: '16px 12px'
              }}
            >
              <div style={{
                fontSize: '24px',
                fontWeight: '700',
                color: '#1e293b',
                marginBottom: '4px'
              }}>
                {stat.value}
              </div>
              <div style={{
                fontSize: '12px',
                color: '#64748b',
                fontWeight: '500'
              }}>
                {stat.title}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Main Content Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '2fr 1fr',
        gap: '24px'
      }}>
        {/* Recent Activity */}
        <div style={{
          display: 'grid',
          gap: '24px'
        }}>
          {/* Recent Appointments */}
          <div style={{
            background: 'white',
            borderRadius: '8px',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
            overflow: 'hidden'
          }}>
            <div style={{
              padding: '16px 20px',
              borderBottom: '1px solid #e2e8f0'
            }}>
              <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '600', color: '#1e293b' }}>
                Recent Appointments
              </h3>
            </div>
            
            {recentAppointments.length === 0 ? (
              <div style={{ padding: '24px', textAlign: 'center', color: '#64748b', fontSize: '14px' }}>
                No recent appointments
              </div>
            ) : (
              <div>
                {recentAppointments.slice(0, 5).map((apt, i) => (
                  <div
                    key={i}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '12px 20px',
                      borderBottom: i === recentAppointments.slice(0, 5).length - 1 ? 'none' : '1px solid #f1f5f9'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{
                        width: '8px',
                        height: '8px',
                        borderRadius: '50%',
                        background: 
                          apt.status === 'pending' ? '#f59e0b' :
                          apt.status === 'accepted' ? '#10b981' :
                          apt.status === 'rejected' ? '#ef4444' : '#6b7280'
                      }}></div>
                      <div>
                        <div style={{ fontWeight: '500', color: '#1e293b', fontSize: '14px' }}>
                          Appointment #{apt.id}
                        </div>
                        <div style={{ fontSize: '12px', color: '#64748b' }}>
                          {formatDate(apt.appointment_date)}
                        </div>
                      </div>
                    </div>
                    <div style={{
                      padding: '2px 8px',
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

          {/* Recent Users */}
          <div style={{
            background: 'white',
            borderRadius: '8px',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
            overflow: 'hidden'
          }}>
            <div style={{
              padding: '16px 20px',
              borderBottom: '1px solid #e2e8f0'
            }}>
              <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '600', color: '#1e293b' }}>
                Recent Users
              </h3>
            </div>
            
            {recentUsers.length === 0 ? (
              <div style={{ padding: '24px', textAlign: 'center', color: '#64748b', fontSize: '14px' }}>
                No recent users
              </div>
            ) : (
              <div>
                {recentUsers.slice(0, 5).map((user, i) => (
                  <div
                    key={i}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '12px 20px',
                      borderBottom: i === recentUsers.slice(0, 5).length - 1 ? 'none' : '1px solid #f1f5f9'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '50%',
                        background: user.role_id === 2 ? '#10b981' : '#3b82f6',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '12px',
                        fontWeight: '600',
                        color: 'white'
                      }}>
                        {user.first_name?.charAt(0)}{user.last_name?.charAt(0)}
                      </div>
                      <div>
                        <div style={{ fontWeight: '500', color: '#1e293b', fontSize: '14px' }}>
                          {user.first_name} {user.last_name}
                        </div>
                        <div style={{ fontSize: '12px', color: '#64748b' }}>
                          {user.email}
                        </div>
                      </div>
                    </div>
                    <div style={{
                      padding: '2px 8px',
                      borderRadius: '12px',
                      fontSize: '12px',
                      fontWeight: '500',
                      background: user.role_id === 2 ? '#dcfce7' : '#dbeafe',
                      color: user.role_id === 2 ? '#166534' : '#1e40af'
                    }}>
                      {getRoleName(user.role_id)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div style={{
          display: 'grid',
          gap: '24px'
        }}>
          {/* Quick Actions */}
          <div style={{
            background: 'white',
            borderRadius: '8px',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
            padding: '20px'
          }}>
            <h3 style={{ margin: '0 0 16px 0', fontSize: '16px', fontWeight: '600', color: '#1e293b' }}>
              Quick Actions
            </h3>
            <div style={{ display: 'grid', gap: '8px' }}>
              <button
                onClick={() => window.location.href = '/admin/resources/appointments'}
                style={{
                  padding: '10px 12px',
                  background: '#3b82f6',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  fontSize: '14px',
                  fontWeight: '500',
                  cursor: 'pointer',
                  textAlign: 'left'
                }}
              >
                Manage Appointments
              </button>
              
              <button
                onClick={() => window.location.href = '/admin/resources/clients'}
                style={{
                  padding: '10px 12px',
                  background: '#10b981',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  fontSize: '14px',
                  fontWeight: '500',
                  cursor: 'pointer',
                  textAlign: 'left'
                }}
              >
                View Users
              </button>
              
              <button
                onClick={() => window.location.href = '/admin/resources/projects'}
                style={{
                  padding: '10px 12px',
                  background: '#8b5cf6',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  fontSize: '14px',
                  fontWeight: '500',
                  cursor: 'pointer',
                  textAlign: 'left'
                }}
              >
                Manage Projects
              </button>

              <button
                onClick={() => window.location.href = '/admin/pages/analytics'}
                style={{
                  padding: '10px 12px',
                  background: '#f59e0b',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  fontSize: '14px',
                  fontWeight: '500',
                  cursor: 'pointer',
                  textAlign: 'left'
                }}
              >
                View Analytics
              </button>
            </div>
          </div>

          {/* Status Summary */}
          <div style={{
            background: 'white',
            borderRadius: '8px',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
            padding: '20px'
          }}>
            <h3 style={{ margin: '0 0 16px 0', fontSize: '16px', fontWeight: '600', color: '#1e293b' }}>
              Status
            </h3>
            <div style={{ display: 'grid', gap: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '14px', color: '#64748b' }}>Pending Appointments</span>
                <span style={{ fontSize: '16px', fontWeight: '600', color: '#f59e0b' }}>
                  {metrics.pendingAppointments || 0}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '14px', color: '#64748b' }}>Total Users</span>
                <span style={{ fontSize: '16px', fontWeight: '600', color: '#3b82f6' }}>
                  {metrics.usersCount || 0}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '14px', color: '#64748b' }}>Active Projects</span>
                <span style={{ fontSize: '16px', fontWeight: '600', color: '#10b981' }}>
                  {metrics.projectsCount || 0}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}