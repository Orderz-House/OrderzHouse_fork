// Admin/components/Dashboard.jsx
import React, { useEffect, useState, useCallback, useRef } from "react";
import { ApiClient, useTranslation } from "adminjs";
import CoursesManagement from "../admin-components/course-components.jsx";

const api = new ApiClient();

export default function Dashboard() {
  const { translateMessage } = useTranslation();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [adminLogs, setAdminLogs] = useState([]);
  const [userLogs, setUserLogs] = useState([]);
  const [currentView, setCurrentView] = useState('dashboard'); 
  const fetchingRef = useRef(false);
  const mountedRef = useRef(true);

  const fetchDashboardData = useCallback(async () => {
    if (fetchingRef.current) return;

    fetchingRef.current = true;

    try {
      const response = await api.getDashboard();
      if (!mountedRef.current) return;

      if (response?.data) {
        setData(response.data);

        const allLogs = response.data.recentLogs || [];
        const admins = allLogs.filter(
          (log) => log.role_id === 1 || log.first_name === "System"
        ).slice(0, 5);
        const users = allLogs.filter(
          (log) => log.role_id !== 1 && log.first_name !== "System"
        ).slice(0, 5);

        setAdminLogs(admins);
        setUserLogs(users);
        setError(null);
      } else {
        throw new Error("No data received from API");
      }
    } catch (err) {
      if (!mountedRef.current) return;
      setError(err?.message || "Failed to load dashboard data");
    } finally {
      if (mountedRef.current) setLoading(false);
      fetchingRef.current = false;
    }
  }, []);

  useEffect(() => {
    mountedRef.current = true;
    fetchDashboardData();
    return () => {
      mountedRef.current = false;
    };
  }, [fetchDashboardData]);

  // Real-time data updates every 10 seconds
  useEffect(() => {
    if (currentView !== 'dashboard') return; // Only refresh when on dashboard view
    
    const refreshInterval = setInterval(() => {
      if (!fetchingRef.current && mountedRef.current) {
        fetchDashboardData();
      }
    }, 10000);
    return () => clearInterval(refreshInterval);
  }, [fetchDashboardData, currentView]);

  // Real-time log updates every 5 seconds
  useEffect(() => {
    if (currentView !== 'dashboard') return; // Only refresh when on dashboard view
    
    const logInterval = setInterval(async () => {
      if (!mountedRef.current || fetchingRef.current) return;
      try {
        const response = await fetch("/api/admin/dashboard/logs");
        if (response.ok) {
          const newLogs = await response.json();
          if (mountedRef.current && newLogs?.recentLogs) {
            const allLogs = newLogs.recentLogs;
            const admins = allLogs.filter(
              (log) => log.role_id === 1 || log.first_name === "System"
            ).slice(0, 5);
            const users = allLogs.filter(
              (log) => log.role_id !== 1 && log.first_name !== "System"
            ).slice(0, 5);
            setAdminLogs(admins);
            setUserLogs(users);
          }
        }
      } catch {}
    }, 5000);
    return () => clearInterval(logInterval);
  }, [currentView]);

  const handleRefresh = useCallback(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  // Show courses management if currentView is 'courses'
  if (currentView === 'courses') {
    return <CoursesManagement onBack={() => setCurrentView('dashboard')} />;
  }

  // Show error state
  if (error && !data) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        height: '400px',
        fontSize: '16px',
        color: '#ef4444',
        textAlign: 'center'
      }}>
        <div style={{ fontSize: '48px', marginBottom: '16px' }}>⚠️</div>
        <h3 style={{ margin: '0 0 8px 0', color: '#ef4444' }}>Failed to load dashboard</h3>
        <p style={{ margin: '0 0 16px 0', color: '#6b7280' }}>{error}</p>
        <button 
          onClick={handleRefresh}
          style={{
            background: '#3b82f6',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            padding: '8px 16px',
            cursor: 'pointer',
            fontSize: '14px'
          }}
        >
          Retry
        </button>
      </div>
    );
  }

  if (loading && !data) {
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
        Loading Dashboard...
      </div>
    );
  }

  const metrics = data?.metrics || {};

  const statsCards = [
    { title: "Total Admins", value: metrics.adminsCount || 0, link: "/admin/resources/admins", color: "#3b82f6", icon: "👥" },
    { title: "Clients", value: metrics.clientsCount || 0, link: "/admin/resources/clients", color: "#10b981", icon: "🏢" },
    { title: "Freelancers", value: metrics.freelancersCount || 0, link: "/admin/resources/freelancers", color: "#f59e0b", icon: "💼" },
    { title: "Active Projects", value: metrics.projectsCount || 0, link: "/admin/resources/projects", color: "#ef4444", icon: "🚀" },
    { title: "Pending Appointments", value: metrics.pendingAppointments || 0, link: "/admin/resources/appointments", color: "#8b5cf6", icon: "📅" },
    { title: "Courses", value: metrics.coursesCount || 0, action: 'courses', color: "#06b6d4", icon: "📚" }, // Changed to action
    { title: "Plans", value: metrics.plansCount || 0, link: "/admin/resources/plans", color: "#84cc16", icon: "📋" },
    { title: "Total Revenue", value: `$${(metrics.totalRevenue || 0).toLocaleString()}`, link: "/admin/resources/payments", color: "#22c55e", icon: "💰" },
    { title: "Analytics", value: "View Reports", link: "/admin/pages/analytics", color: "#6366f1", icon: "📊" },
  ];

  const handleCardClick = (card) => {
    if (card.action === 'courses') {
      setCurrentView('courses');
    } else if (card.link) {
      window.location.href = card.link;
    }
  };

  const getTimeAgo = (dateString) => {
    if (!dateString) return "";
    try {
      const now = new Date();
      const logTime = new Date(dateString);
      const diffMs = now - logTime;
      const diffSecs = Math.floor(diffMs / 1000);
      if (diffSecs < 60) return `${diffSecs}s ago`;
      const diffMins = Math.floor(diffSecs / 60);
      if (diffMins < 60) return `${diffMins}m ago`;
      const diffHours = Math.floor(diffMins / 60);
      if (diffHours < 24) return `${diffHours}h ago`;
      const diffDays = Math.floor(diffHours / 24);
      if (diffDays < 7) return `${diffDays}d ago`;
      return logTime.toLocaleDateString();
    } catch {
      return "";
    }
  };

  const containerStyle = {
    backgroundColor: '#ffffff',
    minHeight: '100vh',
    padding: '20px',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'
  };

  const headerStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '30px',
    paddingBottom: '20px',
    borderBottom: '1px solid #e5e7eb'
  };

  const refreshButtonStyle = {
    backgroundColor: '#f8f9fa',
    border: '1px solid #e9ecef',
    borderRadius: '6px',
    padding: '8px 12px',
    cursor: 'pointer',
    transition: 'all 0.2s',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#374151',
    fontSize: '14px',
    gap: '8px'
  };

  const metricsGridStyle = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
    gap: '24px',
    marginBottom: '40px'
  };

  const cardStyle = {
    backgroundColor: '#ffffff',
    padding: '24px',
    border: '1px solid #e9ecef',
    borderRadius: '8px',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
    position: 'relative',
    overflow: 'hidden'
  };

  const cardTitleStyle = {
    fontSize: '12px',
    fontWeight: '500',
    color: '#6b7280',
    margin: '0 0 8px 0',
    textTransform: 'uppercase',
    letterSpacing: '0.8px'
  };

  const cardValueStyle = {
    fontSize: '28px',
    fontWeight: '700',
    color: '#000000',
    margin: '0',
    display: 'flex',
    alignItems: 'center',
    gap: '12px'
  };

  const cardIconStyle = {
    fontSize: '24px',
    opacity: 0.8
  };

  const logsContainerStyle = {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '24px'
  };

  const logSectionStyle = {
    backgroundColor: '#ffffff',
    border: '1px solid #e9ecef',
    borderRadius: '8px',
    overflow: 'hidden',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
  };

  const logHeaderStyle = {
    fontSize: '16px',
    fontWeight: '600',
    color: '#1e293b',
    margin: '0',
    padding: '16px 20px',
    backgroundColor: '#f8f9fa',
    borderBottom: '1px solid #e9ecef',
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  };

  const logItemStyle = {
    padding: '16px 20px',
    borderBottom: '1px solid #f1f3f4',
    transition: 'background-color 0.2s'
  };

  const logItemNameStyle = {
    fontWeight: '600',
    color: '#1e293b',
    fontSize: '14px',
    marginBottom: '4px'
  };

  const logItemActionStyle = {
    color: '#6b7280',
    fontSize: '13px',
    marginBottom: '4px'
  };

  const logItemTimeStyle = {
    fontSize: '12px',
    color: '#9ca3af'
  };

  const emptyStateStyle = {
    textAlign: 'center',
    color: '#6b7280',
    fontStyle: 'italic',
    padding: '40px 20px'
  };

  return (
    <div style={containerStyle}>
      <style>
        {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
          
          .log-item:hover {
            background-color: #f9fafb !important;
          }
        `}
      </style>
      
      <div style={headerStyle}>
        <div>
          <h1 style={{ fontSize: "1.5rem", fontWeight: "bold", margin: 0, color: "#1e293b" }}>
            Admin Dashboard
          </h1>
          <p style={{ margin: '4px 0 0 0', color: '#6b7280', fontSize: '14px' }}>
            Welcome back! Here's what's happening today.
          </p>
        </div>
        <button 
          onClick={handleRefresh} 
          style={refreshButtonStyle}
          onMouseOver={(e) => {
            e.target.style.backgroundColor = '#e9ecef';
            e.target.style.transform = 'translateY(-1px)';
          }}
          onMouseOut={(e) => {
            e.target.style.backgroundColor = '#f8f9fa';
            e.target.style.transform = 'translateY(0)';
          }}
          title="Refresh Dashboard"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/>
            <path d="M21 3v5h-5"/>
            <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/>
            <path d="M3 21v-5h5"/>
          </svg>
          Refresh
        </button>
      </div>

      <div style={metricsGridStyle}>
        {statsCards.map((card, index) => (
          <div 
            key={index} 
            onClick={() => handleCardClick(card)} 
            style={cardStyle}
            onMouseOver={(e) => {
              e.currentTarget.style.borderColor = card.color;
              e.currentTarget.style.boxShadow = `0 8px 25px ${card.color}20`;
              e.currentTarget.style.transform = 'translateY(-4px)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.borderColor = '#e9ecef';
              e.currentTarget.style.boxShadow = '0 1px 3px rgba(0, 0, 0, 0.1)';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            <h3 style={cardTitleStyle}>{card.title}</h3>
            <div style={cardValueStyle}>
              <span style={cardIconStyle}>{card.icon}</span>
              <span>{card.value}</span>
            </div>
            
            {/* Card accent bar */}
            <div style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              height: '4px',
              background: card.color,
              opacity: 0.6
            }} />
          </div>
        ))}
      </div>

      <div style={logsContainerStyle}>
        <div style={logSectionStyle}>
          <h3 style={logHeaderStyle}>
            <span>🔧</span>
            Admin Activity ({adminLogs.length})
          </h3>
          {adminLogs.length === 0 ? (
            <div style={emptyStateStyle}>
              <div style={{ fontSize: '32px', marginBottom: '8px' }}>🤫</div>
              No recent admin activity
            </div>
          ) : (
            adminLogs.map((log, i) => (
              <div 
                key={log.id || i} 
                className="log-item"
                style={{
                  ...logItemStyle,
                  borderBottom: i === adminLogs.length - 1 ? 'none' : '1px solid #f3f4f6'
                }}
              >
                <div style={logItemNameStyle}>
                  {log.first_name} {log.last_name}
                </div>
                <div style={logItemActionStyle}>{log.action}</div>
                <div style={logItemTimeStyle}>
                  {getTimeAgo(log.created_at)}
                </div>
              </div>
            ))
          )}
        </div>

        <div style={logSectionStyle}>
          <h3 style={logHeaderStyle}>
            <span>👥</span>
            User Activity ({userLogs.length})
          </h3>
          {userLogs.length === 0 ? (
            <div style={emptyStateStyle}>
              <div style={{ fontSize: '32px', marginBottom: '8px' }}>😴</div>
              No recent user activity
            </div>
          ) : (
            userLogs.map((log, i) => (
              <div 
                key={log.id || i} 
                className="log-item"
                style={{
                  ...logItemStyle,
                  borderBottom: i === userLogs.length - 1 ? 'none' : '1px solid #f3f4f6'
                }}
              >
                <div style={logItemNameStyle}>
                  {log.first_name} {log.last_name}
                </div>
                <div style={logItemActionStyle}>{log.action}</div>
                <div style={logItemTimeStyle}>
                  {getTimeAgo(log.created_at)}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}