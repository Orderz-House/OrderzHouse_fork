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
  }, []);

  // Real-time data updates every 10 seconds
  useEffect(() => {
    const refreshInterval = setInterval(() => {
      if (!fetchingRef.current && mountedRef.current) {
        fetchDashboardData();
      }
    }, 10000);
    return () => clearInterval(refreshInterval);
  }, [fetchDashboardData]);

  // Real-time log updates every 5 seconds
  useEffect(() => {
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
  }, []);

  const handleRefresh = useCallback(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  if (loading && !data) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '400px',
        fontSize: '16px',
        color: '#6b7280'
      }}>
        Loading Dashboard...
      </div>
    );
  }

  const metrics = data?.metrics || {};

  const statsCards = [
    { title: "Total Users", value: metrics.usersCount || 0, link: "/admin/resources/users", color: "#3b82f6" },
    { title: "Clients", value: metrics.clientsCount || 0, link: "/admin/resources/clients", color: "#10b981" },
    { title: "Freelancers", value: metrics.freelancersCount || 0, link: "/admin/resources/freelancers", color: "#f59e0b" },
    { title: "Active Projects", value: metrics.projectsCount || 0, link: "/admin/resources/projects", color: "#ef4444" },
    { title: "Pending Appointments", value: metrics.pendingAppointments || 0, link: "/admin/resources/appointments", color: "#8b5cf6" },
    { title: "Courses", value: metrics.coursesCount || 0, link: "/admin/resources/courses", color: "#06b6d4" },
    { title: "Plans", value: metrics.plansCount || 0, link: "/admin/resources/plans", color: "#84cc16" },
    { title: "Total Revenue", value: `$${(metrics.totalRevenue || 0).toLocaleString()}`, link: "/admin/resources/payments", color: "#22c55e" },
    { title: "Analytics", value: "View Reports", link: "/admin/pages/analytics", color: "#6366f1" },
  ];

  const handleCardClick = (link) => {
    window.location.href = link;
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

  const dashboardTitleStyle = {
    fontSize: '16px',
    fontWeight: '500',
    color: '#000000',
    margin: '0'
  };

  const refreshButtonStyle = {
    backgroundColor: '#f8f9fa',
    border: '1px solid #e9ecef',
    borderRadius: '6px',
    padding: '8px',
    cursor: 'pointer',
    transition: 'all 0.2s',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#000000'
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
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
  };

  const cardTitleStyle = {
    fontSize: '12px',
    fontWeight: '500',
    color: '#6b7280',
    margin: '0 0 8px 0',
    textTransform: 'uppercase',
    letterSpacing: '0.8px'
  };

  const cardValueStyle = () => ({
    fontSize: '28px',
    fontWeight: '700',
    color: '#000000',
    margin: '0'
  });

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
    color: '#000000',
    margin: '0',
    padding: '16px 20px',
    backgroundColor: '#f8f9fa',
    borderBottom: '1px solid #e9ecef'
  };

  const logItemStyle = {
    padding: '16px 20px',
    borderBottom: '1px solid #f1f3f4'
  };

  const logItemNameStyle = {
    fontWeight: '600',
    color: '#000000',
    fontSize: '14px',
    marginBottom: '4px'
  };

  const logItemActionStyle = {
    color: '#000000',
    fontSize: '13px',
    marginBottom: '4px',
    opacity: '0.8'
  };

  const logItemTimeStyle = {
    fontSize: '12px',
    color: '#000000',
    opacity: '0.6'
  };

  const emptyStateStyle = {
    textAlign: 'center',
    color: '#000000',
    opacity: '0.6',
    fontStyle: 'italic',
    padding: '30px 20px'
  };

  return (
    <div style={containerStyle}>
      <div style={headerStyle}>
 <h1 style={{ fontSize: "1.5rem", fontWeight: "bold", margin: 0, color: "#1e293b" }}>
      Admin Dashboard
    </h1>        <button 
          onClick={handleRefresh} 
          style={refreshButtonStyle}
          onMouseOver={(e) => e.target.style.backgroundColor = '#e9ecef'}
          onMouseOut={(e) => e.target.style.backgroundColor = '#f8f9fa'}
          title="Refresh Dashboard"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/>
            <path d="M21 3v5h-5"/>
            <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/>
            <path d="M3 21v-5h5"/>
          </svg>
        </button>
      </div>

      <div style={metricsGridStyle}>
        {statsCards.map((card, index) => (
          <div 
            key={index} 
            onClick={() => handleCardClick(card.link)} 
            style={cardStyle}
            onMouseOver={(e) => {
              e.currentTarget.style.borderColor = card.color;
              e.currentTarget.style.boxShadow = `0 4px 12px ${card.color}20`;
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.borderColor = '#e5e7eb';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            <h3 style={cardTitleStyle}>{card.title}</h3>
            <p style={cardValueStyle()}>{card.value}</p>
          </div>
        ))}
      </div>

      <div style={logsContainerStyle}>
        <div style={logSectionStyle}>
          <h3 style={logHeaderStyle}>Admin Activity ({adminLogs.length})</h3>
          {adminLogs.length === 0 ? (
            <div style={emptyStateStyle}>No recent admin activity</div>
          ) : (
            adminLogs.map((log, i) => (
              <div key={log.id || i} style={{
                ...logItemStyle,
                borderBottom: i === adminLogs.length - 1 ? 'none' : '1px solid #f3f4f6'
              }}>
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
          <h3 style={logHeaderStyle}>User Activity ({userLogs.length})</h3>
          {userLogs.length === 0 ? (
            <div style={emptyStateStyle}>No recent user activity</div>
          ) : (
            userLogs.map((log, i) => (
              <div key={log.id || i} style={{
                ...logItemStyle,
                borderBottom: i === userLogs.length - 1 ? 'none' : '1px solid #f3f4f6'
              }}>
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