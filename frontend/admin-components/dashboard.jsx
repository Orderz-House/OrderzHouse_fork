import React, { useEffect, useState, useCallback, useRef } from "react";
import { ApiClient, useTranslation } from "adminjs";
import CoursesManagement from "../admin-components/course-components.jsx";
import AppointmentsDashboard from "../admin-components/appointments.jsx";
import UserManagementDashboard from "../admin-components/userManagement.jsx";
import AdminProjectsDashboard from "../admin-components/projectManagement.jsx";
import AdminManagement from "../admin-components/adminsManagement.jsx";
import PlansManager from "../admin-components/plansManagement.jsx";
// import ClientsManagement from "../admin-components/clientsManagement.jsx";
// import FreelancersManagement from "../admin-components/freelancersManagement.jsx";
import Loader from "../admin-components/loader/loader.jsx"; 

const api = new ApiClient();

export default function Dashboard() {
  const { translateMessage } = useTranslation();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [adminLogs, setAdminLogs] = useState([]);
  const [userLogs, setUserLogs] = useState([]);
  const [currentView, setCurrentView] = useState('dashboard'); 
  const [visibleCards, setVisibleCards] = useState(new Set());
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

  useEffect(() => {
    if (data && !loading) {
      const timer = setTimeout(() => {
        setVisibleCards(new Set([0, 1, 2, 3, 4, 5, 6, 7, 8]));
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [data, loading]);

  // Real-time log updates every 5 seconds
  useEffect(() => {
    if (currentView !== 'dashboard') return;
    
    const logInterval = setInterval(async () => {
      if (!mountedRef.current || fetchingRef.current) return;
      try {
        const response = await fetch("/admin/dashboard/logs");
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
    setVisibleCards(new Set());
    fetchDashboardData();
  }, [fetchDashboardData]);

  const handleBackToDashboard = () => {
    setCurrentView('dashboard');
  };

  // Component rendering based on current view
  if (currentView === 'appointments') {
    return <AppointmentsDashboard onBack={handleBackToDashboard} />;
  }

  if (currentView === 'courses') {
    return <CoursesManagement onBack={handleBackToDashboard} />;
  }

  if (currentView === 'projects') {
    return <AdminProjectsDashboard onBack={handleBackToDashboard} />;
  }

  if (currentView === 'admins') {
    return <AdminManagement onBack={handleBackToDashboard} />;
  }

  if (currentView === 'clients') {
    return <ClientsManagement onBack={handleBackToDashboard} />;
  }

  if (currentView === 'freelancers') {
    return <FreelancersManagement onBack={handleBackToDashboard} />;
  }

  if (currentView === 'plans') {
    return <PlansManager onBack={handleBackToDashboard} />;
  }

  if (error && !data) {
    return (
      <div className="error-container">
        <div className="error-content">
          <div className="error-icon">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2">
              <circle cx="12" cy="12" r="10"/>
              <line x1="15" y1="9" x2="9" y2="15"/>
              <line x1="9" y1="9" x2="15" y2="15"/>
            </svg>
          </div>
          <h3>Failed to load dashboard</h3>
          <p>{error}</p>
          <button onClick={handleRefresh} className="retry-button">
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (loading && !data) {
    return <Loader />;
  }

  const metrics = data?.metrics || {};

  const quickActions = [
    { 
      title: "Admin Management", 
      description: "Manage admin accounts and permissions",
      action: 'admins',
      color: "#a78bfa", 
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
          <circle cx="9" cy="7" r="4"/>
          <path d="M22 21v-2a4 4 0 0 0-3-3.87"/>
          <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
        </svg>
      )
    },
    { 
      title: "Client Portal", 
      description: "View and manage client accounts",
      action: 'clients',
      color: "#86efac", 
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
          <polyline points="9,22 9,12 15,12 15,22"/>
        </svg>
      )
    },
    { 
      title: "Freelancer Network", 
      description: "Manage freelancer profiles and status",
      action: 'freelancers',
      color: "#fca5a5", 
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="2" y="3" width="20" height="14" rx="2" ry="2"/>
          <line x1="8" y1="21" x2="16" y2="21"/>
          <line x1="12" y1="17" x2="12" y2="21"/>
        </svg>
      )
    },
    { 
      title: "Project Management", 
      description: "Track and manage active projects",
      action: 'projects', 
      color: "#c4b5fd", 
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
        </svg>
      )
    },
    { 
      title: "Appointments", 
      description: "Schedule and manage appointments",
      action: 'appointments', 
      color: "#fdba74", 
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
          <line x1="16" y1="2" x2="16" y2="6"/>
          <line x1="8" y1="2" x2="8" y2="6"/>
          <line x1="3" y1="10" x2="21" y2="10"/>
        </svg>
      )
    },
    { 
      title: "Course Management", 
      description: "Create and manage training courses",
      action: 'courses', 
      color: "#7dd3fc", 
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/>
          <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
        </svg>
      )
    },
    { 
      title: "Subscription Plans", 
      description: "Manage pricing and plan features",
      action: 'plans',
      color: "#a7f3d0", 
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
          <polyline points="14,2 14,8 20,8"/>
          <line x1="16" y1="13" x2="8" y2="13"/>
          <line x1="16" y1="17" x2="8" y2="17"/>
          <polyline points="10,9 9,9 8,9"/>
        </svg>
      )
    },
    { 
      title: "Financial Reports", 
      description: "View revenue and payment analytics",
      link: "/admin/resources/payments", 
      color: "#bbf7d0", 
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <line x1="12" y1="1" x2="12" y2="23"/>
          <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
        </svg>
      )
    },
    // { 
    //   title: "Analytics Dashboard", 
    //   description: "Comprehensive business insights",
    //   link: "/admin/pages/analytics", 
    //   color: "#ddd6fe", 
    //   icon: (
    //     <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    //       <polyline points="22,12 18,12 15,21 9,3 6,12 2,12"/>
    //     </svg>
    //   )
    // },
  ];

  const getTimeAgo = (dateString) => {
    if (!dateString) return "";
    try {
      const now = new Date();
      const logTime = new Date(dateString);
      
      if (isNaN(logTime.getTime())) {
        return "Invalid date";
      }
      
      const diffMs = now - logTime;
      const diffSecs = Math.floor(diffMs / 1000);
      const diffMins = Math.floor(diffSecs / 60);
      const diffHours = Math.floor(diffMins / 60);
      const diffDays = Math.floor(diffHours / 24);
      
      if (diffSecs < 60) {
        return diffSecs <= 1 ? "just now" : `${diffSecs}s ago`;
      } else if (diffMins < 60) {
        return `${diffMins}m ago`;
      } else if (diffHours < 24) {
        return `${diffHours}h ago`;
      } else if (diffDays < 7) {
        return diffDays === 1 ? "1 day ago" : `${diffDays} days ago`;
      } else if (diffDays < 30) {
        const weeks = Math.floor(diffDays / 7);
        return weeks === 1 ? "1 week ago" : `${weeks} weeks ago`;
      } else {
        return logTime.toLocaleDateString();
      }
    } catch (error) {
      console.error('Error calculating time ago:', error, 'for date:', dateString);
      return "unknown time";
    }
  };

  const recentUpdates = [...userLogs, ...adminLogs]
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    .slice(0, 3)
    .map(log => ({
      title: `${log.first_name} ${log.last_name}`,
      description: log.action,
      time: getTimeAgo(log.created_at),
      type: log.role_id === 1 || log.first_name === "System" ? "admin" : "user",
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
          <circle cx="12" cy="7" r="4"/>
        </svg>
      )
    }));

  const handleCardClick = (card) => {
    if (card.action === 'courses') {
      setCurrentView('courses');
    } else if (card.action === 'appointments') {
      setCurrentView('appointments');
    } else if (card.action === 'projects') {
      setCurrentView('projects');
    } else if (card.action === 'admins') {
      setCurrentView('admins');
    } else if (card.action === 'clients') {
      setCurrentView('clients');
    } else if (card.action === 'freelancers') {
      setCurrentView('freelancers');
    } else if (card.action === 'plans') {
      setCurrentView('plans');
    } else if (card.link) {
      window.location.href = card.link;
    }
  };

  return (
    <div className="dashboard-container">
      <style>
        {`
          @keyframes fadeInUp {
            from {
              opacity: 0;
              transform: translateY(20px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }

          @keyframes slideInRight {
            from {
              opacity: 0;
              transform: translateX(20px);
            }
            to {
              opacity: 1;
              transform: translateX(0);
            }
          }

          .dashboard-container {
            background-color: #f8fafc;
            min-height: 100vh;
            padding: 32px;
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
            color: #334155;
          }

          .header {
            margin-bottom: 40px;
            animation: fadeInUp 0.6s ease-out;
          }

          .header-content h1 {
            font-size: 2.5rem;
            font-weight: 700;
            margin: 0 0 8px 0;
            color: #0f172a;
            letter-spacing: -0.025em;
          }

          .header-content p {
            margin: 0;
            color: #64748b;
            font-size: 16px;
            font-weight: 400;
          }

          .main-grid {
            display: grid;
            grid-template-columns: 2fr 1fr;
            gap: 32px;
            margin-bottom: 32px;
          }

          .quick-actions-section {
            animation: fadeInUp 0.6s ease-out 0.1s both;
          }

          .section-title {
            font-size: 1.25rem;
            font-weight: 600;
            color: #0f172a;
            margin: 0 0 24px 0;
            display: flex;
            align-items: center;
            gap: 8px;
          }

          .quick-actions-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
            gap: 20px;
          }

          .action-card {
            background: white;
            padding: 24px;
            border-radius: 12px;
            cursor: pointer;
            transition: all 0.2s ease;
            border: 1px solid #e2e8f0;
            position: relative;
            overflow: hidden;
            opacity: 0;
            transform: translateY(20px);
          }

          .action-card.visible {
            animation: fadeInUp 0.5s ease-out forwards;
          }

          .action-card:hover {
            transform: translateY(-2px);
            box-shadow: 0 8px 25px rgba(0, 0, 0, 0.08);
            border-color: #cbd5e1;
          }

          .action-card::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            height: 3px;
            background: var(--card-color);
            transform: scaleX(0);
            transition: transform 0.2s ease;
          }

          .action-card:hover::before {
            transform: scaleX(1);
          }

          .card-header {
            display: flex;
            align-items: flex-start;
            gap: 16px;
            margin-bottom: 12px;
          }

          .card-icon {
            width: 48px;
            height: 48px;
            border-radius: 10px;
            display: flex;
            align-items: center;
            justify-content: center;
            background: var(--card-color);
            color: white;
            flex-shrink: 0;
            transition: transform 0.2s ease;
          }

          .action-card:hover .card-icon {
            transform: scale(1.05);
          }

          .card-content h3 {
            font-size: 1rem;
            font-weight: 600;
            color: #0f172a;
            margin: 0 0 4px 0;
            line-height: 1.4;
          }

          .card-content p {
            font-size: 14px;
            color: #64748b;
            margin: 0;
            line-height: 1.4;
          }

          .updates-section {
            animation: slideInRight 0.6s ease-out 0.2s both;
          }

          .updates-container {
            background: white;
            border-radius: 12px;
            border: 1px solid #e2e8f0;
            overflow: hidden;
          }

          .updates-header {
            padding: 20px;
            border-bottom: 1px solid #f1f5f9;
            background: #fafbfc;
          }

          .updates-list {
            max-height: 400px;
            overflow-y: auto;
          }

          .update-item {
            padding: 16px 20px;
            border-bottom: 1px solid #f1f5f9;
            transition: background-color 0.2s ease;
          }

          .update-item:hover {
            background: #f8fafc;
          }

          .update-item:last-child {
            border-bottom: none;
          }

          .update-header {
            display: flex;
            align-items: center;
            gap: 12px;
            margin-bottom: 8px;
          }

          .update-icon {
            width: 32px;
            height: 32px;
            border-radius: 8px;
            display: flex;
            align-items: center;
            justify-content: center;
            background: #f1f5f9;
            color: #64748b;
            flex-shrink: 0;
          }

          .update-content h4 {
            font-size: 14px;
            font-weight: 600;
            color: #0f172a;
            margin: 0;
          }

          .update-description {
            font-size: 13px;
            color: #64748b;
            margin: 4px 0 0 0;
            line-height: 1.4;
          }

          .update-time {
            font-size: 12px;
            color: #94a3b8;
            margin-top: 8px;
          }

          .stats-overview {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 20px;
            animation: fadeInUp 0.6s ease-out 0.3s both;
          }

          .stat-card {
            background: white;
            padding: 24px;
            border-radius: 12px;
            border: 1px solid #e2e8f0;
            text-align: center;
            transition: all 0.2s ease;
          }

          .stat-card:hover {
            transform: translateY(-1px);
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
          }

          .stat-value {
            font-size: 2rem;
            font-weight: 700;
            color: #0f172a;
            margin-bottom: 8px;
            display: block;
          }

          .stat-label {
            font-size: 14px;
            color: #64748b;
            font-weight: 500;
          }

          .error-container {
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100vh;
            background-color: #f8fafc;
          }

          .error-content {
            background: white;
            padding: 48px;
            border-radius: 16px;
            text-align: center;
            box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
            border: 1px solid #e2e8f0;
            max-width: 400px;
          }

          .error-icon {
            margin-bottom: 16px;
            display: flex;
            justify-content: center;
          }

          .error-content h3 {
            margin: 0 0 12px 0;
            color: #ef4444;
            font-size: 1.25rem;
            font-weight: 600;
          }

          .error-content p {
            margin: 0 0 24px 0;
            color: #64748b;
            font-size: 14px;
          }

          .retry-button {
            background: #4f46e5;
            color: white;
            border: none;
            border-radius: 8px;
            padding: 12px 24px;
            cursor: pointer;
            font-weight: 500;
            font-size: 14px;
            transition: all 0.2s ease;
          }

          .retry-button:hover {
            background: #4338ca;
            transform: translateY(-1px);
            box-shadow: 0 4px 8px rgba(79, 70, 229, 0.3);
          }

          @media (max-width: 1024px) {
            .main-grid {
              grid-template-columns: 1fr;
            }
            
            .dashboard-container {
              padding: 20px;
            }
          }

          @media (max-width: 768px) {
            .quick-actions-grid {
              grid-template-columns: 1fr;
            }
            
            .stats-overview {
              grid-template-columns: repeat(2, 1fr);
            }
            
            .header-content h1 {
              font-size: 2rem;
            }
          }
        `}
      </style>
      
      <div className="header">
        <div className="header-content">
          <h1>Admin Dashboard</h1>
        </div>
      </div>

      <div className="main-grid">
        <div className="quick-actions-section">
          <h2 className="section-title">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
              <rect x="7" y="7" width="3" height="9"/>
              <rect x="14" y="7" width="3" height="5"/>
            </svg>
            Quick Actions
          </h2>
          <div className="quick-actions-grid">
            {quickActions.map((card, index) => (
              <div 
                key={index} 
                onClick={() => handleCardClick(card)} 
                className={`action-card ${visibleCards.has(index) ? 'visible' : ''}`}
                style={{
                  '--card-color': card.color,
                  animationDelay: `${index * 0.05}s`
                }}
              >
                <div className="card-header">
                  <div className="card-icon">
                    {card.icon}
                  </div>
                  <div className="card-content">
                    <h3>{card.title}</h3>
                    <p>{card.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="updates-section">
          <h2 className="section-title">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="22,12 18,12 15,21 9,3 6,12 2,12"/>
            </svg>
            Recent Updates
          </h2>
          <div className="updates-container">
            <div className="updates-header">
              <h3 className="section-title" style={{ margin: 0, fontSize: '1rem' }}>
                System Activity
              </h3>
            </div>
            <div className="updates-list">
              {recentUpdates.length === 0 ? (
                <div className="update-item">
                  <div className="update-header">
                    <div className="update-icon">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"/>
                        <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"/>
                        <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"/>
                        <line x1="2" y1="2" x2="22" y2="22"/>
                      </svg>
                    </div>
                    <div className="update-content">
                      <h4>No recent activity</h4>
                    </div>
                  </div>
                  <p className="update-description">No user activity recorded yet</p>
                  <div className="update-time">Refreshing every 3 seconds...</div>
                </div>
              ) : (
                recentUpdates.map((update, index) => (
                  <div key={`${update.title}-${update.time}-${index}`} className={`update-item ${update.type}`}>
                    <div className="update-header">
                      <div className="update-icon">
                        {update.icon}
                      </div>
                      <div className="update-content">
                        <h4>{update.title}</h4>
                      </div>
                    </div>
                    <p className="update-description">{update.description}</p>
                    <div className="update-time">{update.time}</div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="stats-overview">
        <div className="stat-card">
          <span className="stat-value">{metrics.adminsCount || 0}</span>
          <span className="stat-label">Total Admins</span>
        </div>
        <div className="stat-card">
          <span className="stat-value">{metrics.clientsCount || 0}</span>
          <span className="stat-label">Active Clients</span>
        </div>
        <div className="stat-card">
          <span className="stat-value">{metrics.freelancersCount || 0}</span>
          <span className="stat-label">Freelancers</span>
        </div>
        <div className="stat-card">
          <span className="stat-value">{metrics.projectsCount || 0}</span>
          <span className="stat-label">Active Projects</span>
        </div>
        <div className="stat-card">
          <span className="stat-value">${(metrics.totalRevenue || 0).toLocaleString()}</span>
          <span className="stat-label">Total Revenue</span>
        </div>
      </div>
    </div>
  );
}