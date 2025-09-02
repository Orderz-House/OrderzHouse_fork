// Admin/components/Dashboard.jsx
import React, { useEffect, useState, useCallback, useRef } from "react";
import { ApiClient, useTranslation } from "adminjs";

const api = new ApiClient();

export default function Dashboard() {
  const { translateMessage } = useTranslation();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [adminLogs, setAdminLogs] = useState([]);
  const [userLogs, setUserLogs] = useState([]);
  const [lastFetch, setLastFetch] = useState(null);
  const fetchingRef = useRef(false);
  const mountedRef = useRef(true);

  // Memoized fetch function
  const fetchDashboardData = useCallback(async () => {
    if (fetchingRef.current) return;
    
    fetchingRef.current = true;
    const fetchTime = Date.now();
    
    if (lastFetch && (fetchTime - lastFetch) < 5000) {
      fetchingRef.current = false;
      return;
    }

    try {
      console.log("Fetching dashboard data...");
      
      const response = await api.getDashboard();
      console.log("Dashboard response received:", response);
      
      if (!mountedRef.current) return;
      
      if (response?.data) {
        setData(response.data);
        
        // Separate admin logs from user logs
        const allLogs = response.data.recentLogs || [];
        const admins = allLogs.filter(log => log.role_id === 1 || log.first_name === 'System');
        const users = allLogs.filter(log => log.role_id !== 1 && log.first_name !== 'System');
        
        setAdminLogs(admins);
        setUserLogs(users);
        setError(null);
        setLastFetch(fetchTime);
        console.log("Dashboard data updated - Admin logs:", admins.length, "User logs:", users.length);
      } else {
        throw new Error("No data received from API");
      }
    } catch (err) {
      console.error("Dashboard error:", err);
      
      if (!mountedRef.current) return;
      
      setError(err?.message || "Failed to load dashboard data");
    } finally {
      if (mountedRef.current) {
        setLoading(false);
      }
      fetchingRef.current = false;
    }
  }, [lastFetch]);

  // Initial data fetch
  useEffect(() => {
    mountedRef.current = true;
    fetchDashboardData();

    return () => {
      mountedRef.current = false;
    };
  }, []);

  // Auto-refresh every 30 seconds
  useEffect(() => {
    const refreshInterval = setInterval(() => {
      if (!fetchingRef.current && mountedRef.current) {
        console.log("Auto-refreshing dashboard...");
        fetchDashboardData();
      }
    }, 30000);

    return () => clearInterval(refreshInterval);
  }, [fetchDashboardData]);

  // Separate logs polling every 10 seconds
  useEffect(() => {
    const logInterval = setInterval(async () => {
      if (!mountedRef.current || fetchingRef.current) return;
      
      try {
        console.log("Fetching latest logs...");
        const response = await fetch('/api/admin/dashboard/logs');
        if (response.ok) {
          const newLogs = await response.json();
          if (mountedRef.current && newLogs?.recentLogs) {
            // Separate logs by user type
            const allLogs = newLogs.recentLogs;
            const admins = allLogs.filter(log => log.role_id === 1 || log.first_name === 'System');
            const users = allLogs.filter(log => log.role_id !== 1 && log.first_name !== 'System');
            
            console.log("Logs updated - Admin:", admins.length, "User:", users.length);
            setAdminLogs(admins);
            setUserLogs(users);
          }
        }
      } catch (error) {
        console.error('Failed to fetch logs:', error);
      }
    }, 10000); // 10 seconds

    return () => clearInterval(logInterval);
  }, []);

  const handleRefresh = useCallback(() => {
    setLastFetch(null);
    fetchDashboardData();
  }, [fetchDashboardData]);

  if (loading && !data) {
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
          width: '50px',
          height: '50px',
          border: '4px solid #e5e7eb',
          borderTop: '4px solid #3b82f6',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite',
          marginBottom: '20px'
        }}></div>
        <p style={{ fontSize: '16px', fontWeight: '500' }}>Loading Dashboard...</p>
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

  const statsCards = [
    { 
      title: "Total Users", 
      value: metrics.usersCount || 0, 
      icon: "👥", 
      color: "#3B82F6", 
      link: "/admin/resources/users"
    },
    { 
      title: "Clients", 
      value: metrics.clientsCount || 0, 
      icon: "🏢", 
      color: "#8B5CF6", 
      link: "/admin/resources/clients"
    },
    { 
      title: "Freelancers", 
      value: metrics.freelancersCount || 0, 
      icon: "👨‍💻", 
      color: "#F59E0B", 
      link: "/admin/resources/freelancers"
    },
    { 
      title: "Active Projects", 
      value: metrics.projectsCount || 0, 
      icon: "💼", 
      color: "#10B981", 
      link: "/admin/resources/projects"
    },
    { 
      title: "Pending Appointments", 
      value: metrics.pendingAppointments || 0, 
      icon: "📅", 
      color: "#EF4444", 
      link: "/admin/resources/appointments"
    },
    { 
      title: "Courses", 
      value: metrics.coursesCount || 0, 
      icon: "📚", 
      color: "#06B6D4", 
      link: "/admin/resources/courses"
    },
    { 
      title: "Plans", 
      value: metrics.plansCount || 0, 
      icon: "📊", 
      color: "#EC4899", 
      link: "/admin/resources/plans"
    },
    { 
      title: "Total Revenue", 
      value: `$${(metrics.totalRevenue || 0).toLocaleString()}`, 
      icon: "💰", 
      color: "#84CC16", 
      link: "/admin/resources/payments"
    },
    { 
      title: "Analytics", 
      value: "View Reports", 
      icon: "📈", 
      color: "#6366F1", 
      link: "/admin/pages/analytics"
    },
  ];

  const handleCardClick = (link) => {
    window.location.href = link;
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return "-";
    try {
      const date = new Date(dateString);
      const now = new Date();
      
      // If it's today, show time with "Today"
      if (date.toDateString() === now.toDateString()) {
        return `Today at ${date.toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
          hour12: true
        })}`;
      }
      
      // If it's yesterday
      const yesterday = new Date(now);
      yesterday.setDate(yesterday.getDate() - 1);
      if (date.toDateString() === yesterday.toDateString()) {
        return `Yesterday at ${date.toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
          hour12: true
        })}`;
      }
      
      // Otherwise show full date and time
      return date.toLocaleString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true
      });
    } catch {
      return "-";
    }
  };

  const getActionIcon = (action) => {
    if (!action) return "📝";
    
    const actionLower = action.toLowerCase();
    if (actionLower.includes('login')) return "🔐";
    if (actionLower.includes('created') || actionLower.includes('new')) return "➕";
    if (actionLower.includes('updated') || actionLower.includes('edit')) return "✏️";
    if (actionLower.includes('deleted') || actionLower.includes('delete')) return "🗑️";
    if (actionLower.includes('view') || actionLower.includes('get')) return "👁️";
    
    return "📝";
  };

  const getTimeAgo = (dateString) => {
  if (!dateString) return "";

  try {
    const now = new Date();
    const logTime = new Date(dateString);
    const diffMs = now - logTime;
    const diffSecs = Math.floor(diffMs / 1000);

    if (diffSecs < 30) return "Just now";
    if (diffSecs < 60) return `${diffSecs}s ago`;

    const diffMins = Math.floor(diffSecs / 60);
    if (diffMins < 60) return `${diffMins}m ago`;

    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;

    const diffDays = Math.floor(diffHours / 24);
    if (diffDays < 7) return `${diffDays}d ago`;

    return logTime.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  } catch {
    return "";
  }
};

  const getLogTypeColor = (action) => {
    if (!action) return '#6b7280';
    const actionLower = action.toLowerCase();
    if (actionLower.includes('login') && actionLower.includes('successful')) return '#10b981';
    if (actionLower.includes('login') || actionLower.includes('failed')) return '#ef4444';
    if (actionLower.includes('created')) return '#10b981';
    if (actionLower.includes('updated')) return '#f59e0b';
    if (actionLower.includes('deleted')) return '#ef4444';
    return '#3b82f6';
  };

  // Test logging function
  const testLogging = async () => {
    try {
      const response = await fetch('/api/admin/test-log', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      if (response.ok) {
        console.log('Test log created successfully');
        // Refresh logs after 1 second
        setTimeout(() => {
          fetchDashboardData();
        }, 1000);
      }
    } catch (error) {
      console.error('Failed to create test log:', error);
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
        marginBottom: '32px',
        flexWrap: 'wrap',
        gap: '16px'
      }}>
        <div>
          <h1 style={{ 
            margin: '0', 
            fontSize: '28px', 
            fontWeight: '700', 
            color: '#1e293b'
          }}>
            OrderzHouse Admin Dashboard
          </h1>
          <p style={{ 
            margin: '8px 0 0', 
            fontSize: '14px', 
            color: '#64748b',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <span style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              background: error ? '#ef4444' : '#10b981'
            }}></span>
            {error ? `Error: ${error}` : 
             lastFetch ? `Last updated: ${new Date(lastFetch).toLocaleTimeString()}` : 'Loading...'}
          </p>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button
            onClick={testLogging}
            style={{
              padding: '8px 16px',
              background: '#10b981',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              fontSize: '12px',
              fontWeight: '500',
              cursor: 'pointer'
            }}
          >
            Test Logging
          </button>
          
          <button
            onClick={handleRefresh}
            disabled={loading}
            style={{
              padding: '10px 20px',
              background: loading ? '#94a3b8' : '#3b82f6',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: '600',
              cursor: loading ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            {loading ? 'Refreshing...' : '🔄 Refresh'}
          </button>
          
          {error && (
            <div style={{
              padding: '8px 16px',
              background: '#fee2e2',
              color: '#dc2626',
              borderRadius: '8px',
              fontSize: '13px',
              fontWeight: '500'
            }}>
              ⚠️ Error
            </div>
          )}
        </div>
      </div>

      {/* Stats Cards Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
        gap: '20px',
        marginBottom: '40px'
      }}>
        {statsCards.map((card, index) => (
          <div
            key={index}
            onClick={() => handleCardClick(card.link)}
            style={{
              background: 'white',
              borderRadius: '12px',
              boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05), 0 1px 3px rgba(0, 0, 0, 0.1)',
              padding: '20px',
              display: 'flex',
              flexDirection: 'column',
              transition: 'all 0.2s',
              cursor: 'pointer',
              position: 'relative',
              overflow: 'hidden'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 8px 12px rgba(0, 0, 0, 0.1), 0 4px 6px rgba(0, 0, 0, 0.05)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.05), 0 1px 3px rgba(0, 0, 0, 0.1)';
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
              <div style={{
                width: '48px',
                height: '48px',
                borderRadius: '12px',
                background: `${card.color}20`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '20px'
              }}>
                {card.icon}
              </div>
              
              <div style={{
                width: '4px',
                height: '60px',
                background: card.color,
                position: 'absolute',
                right: 0,
                top: 0
              }}></div>
            </div>
            
            <div style={{ marginTop: 'auto' }}>
              <div style={{
                fontSize: '13px',
                color: '#64748b',
                fontWeight: '500',
                marginBottom: '4px',
                textTransform: 'uppercase',
                letterSpacing: '0.5px'
              }}>
                {card.title}
              </div>
              <div style={{
                fontSize: '28px',
                fontWeight: '700',
                color: '#1e293b',
                lineHeight: '1.2'
              }}>
                {card.value}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Two Log Sections */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '24px',
        marginBottom: '20px'
      }}>
        {/* Admin Activity Logs */}
        <div style={{
          background: 'white',
          borderRadius: '12px',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05), 0 1px 3px rgba(0, 0, 0, 0.1)',
          overflow: 'hidden'
        }}>
          <div style={{
            padding: '20px 24px',
            borderBottom: '1px solid #e2e8f0',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '600' }}>
                  🔑 Admin Activity Logs
                </h3>
                <p style={{ margin: '4px 0 0', fontSize: '12px', opacity: 0.9 }}>
                  Administrative actions ({adminLogs.length} entries)
                </p>
              </div>
              
              <button
                onClick={() => window.location.href = '/admin/resources/logs'}
                style={{
                  padding: '6px 12px',
                  background: 'rgba(255, 255, 255, 0.2)',
                  color: 'white',
                  border: '1px solid rgba(255, 255, 255, 0.3)',
                  borderRadius: '6px',
                  fontSize: '11px',
                  fontWeight: '500',
                  cursor: 'pointer'
                }}
              >
                View All
              </button>
            </div>
          </div>
          
          {adminLogs.length === 0 ? (
            <div style={{ 
              padding: '40px 24px', 
              textAlign: 'center', 
              color: '#64748b', 
              fontSize: '14px',
              background: '#f8fafc'
            }}>
              <div style={{ fontSize: '36px', marginBottom: '12px', opacity: 0.5 }}>🔐</div>
              <div style={{ fontWeight: '500', marginBottom: '4px' }}>No admin activity</div>
              <div>Admin actions will appear here</div>
            </div>
          ) : (
            <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
              {adminLogs.map((log, i) => (
                <div
                  key={log.id || i}
                  style={{
                    padding: '14px 20px',
                    borderBottom: i === adminLogs.length - 1 ? 'none' : '1px solid #f1f5f9',
                    transition: 'background 0.2s',
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '10px'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = '#f8fafc';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'white';
                  }}
                >
                  <div style={{
                    fontSize: '18px',
                    marginTop: '1px'
                  }}>
                    {getActionIcon(log.action)}
                  </div>
                  
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '4px' }}>
                      <div style={{ 
                        fontWeight: '600', 
                        color: '#1e293b', 
                        fontSize: '13px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px'
                      }}>
                        {log.first_name && log.last_name ? `${log.first_name} ${log.last_name}` : 'System Admin'}
                        
                        <span style={{
                          background: getLogTypeColor(log.action),
                          color: 'white',
                          padding: '1px 4px',
                          borderRadius: '3px',
                          fontSize: '9px',
                          fontWeight: '600'
                        }}>
                          {log.action?.includes('login') ? 'AUTH' :
                           log.action?.includes('created') ? 'CREATE' :
                           log.action?.includes('updated') ? 'UPDATE' :
                           log.action?.includes('deleted') ? 'DELETE' : 'ACTION'}
                        </span>
                      </div>
                      
                      <div style={{ 
                        fontSize: '11px', 
                        color: '#64748b',
                        fontWeight: '500',
                        whiteSpace: 'nowrap'
                      }}>
                        {getTimeAgo(log.created_at)}
                      </div>
                    </div>
                    
                    <div style={{ 
                      fontSize: '12px', 
                      color: '#475569', 
                      lineHeight: '1.3',
                      marginBottom: '4px',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical'
                    }}>
                      {log.action || 'No action description'}
                    </div>
                    
                    <div style={{ 
                      fontSize: '10px', 
                      color: '#9ca3af',
                      fontWeight: '500'
                    }}>
                      {formatDateTime(log.created_at)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* User Activity Logs */}
        <div style={{
          background: 'white',
          borderRadius: '12px',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05), 0 1px 3px rgba(0, 0, 0, 0.1)',
          overflow: 'hidden'
        }}>
          <div style={{
            padding: '20px 24px',
            borderBottom: '1px solid #e2e8f0',
            background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
            color: 'white'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '600' }}>
                  👥 User Activity Logs
                </h3>
                <p style={{ margin: '4px 0 0', fontSize: '12px', opacity: 0.9 }}>
                  User actions ({userLogs.length} entries)
                </p>
              </div>
              
              <button
                onClick={() => window.location.href = '/admin/resources/logs'}
                style={{
                  padding: '6px 12px',
                  background: 'rgba(255, 255, 255, 0.2)',
                  color: 'white',
                  border: '1px solid rgba(255, 255, 255, 0.3)',
                  borderRadius: '6px',
                  fontSize: '11px',
                  fontWeight: '500',
                  cursor: 'pointer'
                }}
              >
                View All
              </button>
            </div>
          </div>
          
          {userLogs.length === 0 ? (
            <div style={{ 
              padding: '40px 24px', 
              textAlign: 'center', 
              color: '#64748b', 
              fontSize: '14px',
              background: '#f8fafc'
            }}>
              <div style={{ fontSize: '36px', marginBottom: '12px', opacity: 0.5 }}>👤</div>
              <div style={{ fontWeight: '500', marginBottom: '4px' }}>No user activity</div>
              <div>User actions will appear here</div>
            </div>
          ) : (
            <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
              {userLogs.map((log, i) => (
                <div
                  key={log.id || i}
                  style={{
                    padding: '14px 20px',
                    borderBottom: i === userLogs.length - 1 ? 'none' : '1px solid #f1f5f9',
                    transition: 'background 0.2s',
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '10px'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = '#f8fafc';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'white';
                  }}
                >
                  <div style={{
                    fontSize: '18px',
                    marginTop: '1px'
                  }}>
                    {getActionIcon(log.action)}
                  </div>
                  
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '4px' }}>
                      <div style={{ 
                        fontWeight: '600', 
                        color: '#1e293b', 
                        fontSize: '13px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px'
                      }}>
                        {log.first_name && log.last_name ? `${log.first_name} ${log.last_name}` : 'Unknown User'}
                        
                        <span style={{
                          background: log.role_id === 2 ? '#8b5cf6' : log.role_id === 3 ? '#f59e0b' : '#6b7280',
                          color: 'white',
                          padding: '1px 4px',
                          borderRadius: '3px',
                          fontSize: '9px',
                          fontWeight: '600'
                        }}>
                          {log.role_id === 2 ? 'CLIENT' : log.role_id === 3 ? 'FREELANCER' : 'USER'}
                        </span>
                      </div>
                      
                      <div style={{ 
                        fontSize: '11px', 
                        color: '#64748b',
                        fontWeight: '500',
                        whiteSpace: 'nowrap'
                      }}>
                        {getTimeAgo(log.created_at)}
                      </div>
                    </div>
                    
                    <div style={{ 
                      fontSize: '12px', 
                      color: '#475569', 
                      lineHeight: '1.3',
                      marginBottom: '4px',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical'
                    }}>
                      {log.action || 'No action description'}
                    </div>
                    
                    <div style={{ 
                      fontSize: '10px', 
                      color: '#9ca3af',
                      fontWeight: '500'
                    }}>
                      {formatDateTime(log.created_at)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}