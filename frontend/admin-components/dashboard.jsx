import React, { useEffect, useState, useMemo } from "react";
import { ApiClient, useTranslation } from "adminjs";

const api = new ApiClient();

export default function Dashboard() {
  const { translateMessage } = useTranslation();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await api.getDashboard();
        setData(response.data);
        setError(null);
      } catch (err) {
        setError(err?.message || "Failed to load dashboard data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, [refreshKey]);

  const metrics = useMemo(() => {
    if (!data?.metrics) return [];
    const { metrics: m } = data;
    return [
      { title: "Total Users", value: m.usersCount, color: "#3b82f6", icon: "👥", change: "+12%", resourceId: "clients" },
      { title: "Active Clients", value: m.clientsCount, color: "#10b981", icon: "👤", change: "+8%", resourceId: "clients" },
      { title: "Freelancers", value: m.freelancersCount, color: "#8b5cf6", icon: "💼", change: "+15%", resourceId: "freelancers" },
      { title: "Courses", value: m.coursesCount, color: "#f59e0b", icon: "📚", change: "+3%", resourceId: "courses" },
      { title: "Plans", value: m.plansCount, color: "#06b6d4", icon: "💎", change: "0%", resourceId: "plans" },
      { title: "Pending", value: m.pendingAppointments, color: "#ef4444", icon: "⏰", urgent: true, resourceId: "appointments" },
    ];
  }, [data]);

  const navigateToResource = (resourceId) => {
    if (resourceId) {
      window.location.href = `/admin/resources/${resourceId}`;
    }
  };

  const navigateToAnalytics = () => {
    window.location.href = '/admin/analytics';
  };

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="loading-spinner"></div>
        <p>Loading dashboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard-error">
        <div className="error-icon">⚠️</div>
        <h3>Dashboard Error</h3>
        <p>{error}</p>
        <button onClick={() => setRefreshKey(k => k + 1)}>Retry</button>
      </div>
    );
  }

  const { recentUsers = [], recentPlans = [], recentAppointments = [] } = data || {};

  return (
    <div className="dashboard-container">
      <style jsx>{`
        .dashboard-container {
          padding: 24px;
          background: #f8fafc;
          min-height: 100vh;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }
        
        .dashboard-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 32px;
          padding: 24px;
          background: white;
          border-radius: 16px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.05);
          border: 1px solid #e5e7eb;
        }
        
        .header-content {
          display: flex;
          align-items: center;
          gap: 16px;
        }
        
        .logo {
          height: 48px;
          width: auto;
        }
        
        .header-text h1 {
          margin: 0 0 4px 0;
          font-size: 28px;
          font-weight: 700;
          color: #111827;
        }
        
        .header-text p {
          margin: 0;
          color: #6b7280;
          font-size: 14px;
        }
        
        .refresh-btn {
          padding: 8px 16px;
          background: #3b82f6;
          color: white;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          font-size: 14px;
          transition: background 0.2s;
        }
        
        .refresh-btn:hover {
          background: #2563eb;
        }
        
        .metrics-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 20px;
          margin-bottom: 32px;
        }
        
        .metric-card {
          background: white;
          border-radius: 16px;
          padding: 24px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.05);
          border: 1px solid #e5e7eb;
          transition: all 0.2s ease;
          position: relative;
          overflow: hidden;
        }
        
        .metric-card.clickable {
          cursor: pointer;
          transition: all 0.2s ease;
        }
        
        .metric-card.clickable:hover {
          transform: translateY(-4px);
          box-shadow: 0 12px 40px rgba(0,0,0,0.15);
        }
        
        .metric-card.urgent {
          border-left: 4px solid #ef4444;
          animation: pulse 2s infinite;
        }
        
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.8; }
        }
        
        .metric-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 12px;
        }
        
        .metric-title {
          font-size: 14px;
          font-weight: 500;
          color: #6b7280;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }
        
        .metric-icon {
          font-size: 24px;
          opacity: 0.8;
        }
        
        .metric-value {
          font-size: 36px;
          font-weight: 700;
          margin-bottom: 8px;
          background: linear-gradient(135deg, var(--color) 0%, var(--color)80 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        
        .metric-change {
          font-size: 12px;
          font-weight: 600;
          padding: 2px 8px;
          border-radius: 12px;
          background: #f0f9ff;
          color: #0284c7;
        }
        
        .content-grid {
          display: grid;
          grid-template-columns: 1fr 1fr 1fr;
          gap: 24px;
        }
        
        .content-card {
          background: white;
          border-radius: 16px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.05);
          border: 1px solid #e5e7eb;
          overflow: hidden;
        }
        
        .content-card.clickable {
          cursor: pointer;
          transition: all 0.2s ease;
        }
        
        .content-card.clickable:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(0,0,0,0.1);
        }
        
        .card-header {
          padding: 20px 24px;
          border-bottom: 1px solid #f3f4f6;
          background: #fafafa;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        
        .card-action {
          font-size: 18px;
          color: #3b82f6;
          font-weight: bold;
          opacity: 0.7;
          transition: opacity 0.2s;
        }
        
        .content-card:hover .card-action {
          opacity: 1;
        }
        
        .analytics-section {
          margin-top: 40px;
          padding: 24px;
          background: white;
          border-radius: 16px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.05);
          border: 1px solid #e5e7eb;
        }
        
        .section-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 24px;
        }
        
        .section-header h2 {
          margin: 0;
          font-size: 24px;
          font-weight: 700;
          color: #111827;
        }
        
        .analytics-btn {
          padding: 10px 20px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border: none;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
        }
        
        .analytics-btn:hover {
          transform: translateY(-1px);
          box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
        }
        
        .charts-preview {
          display: grid;
          grid-template-columns: 2fr 1fr;
          gap: 24px;
        }
        
        .chart-card {
          padding: 20px;
          background: #f8fafc;
          border-radius: 12px;
          border: 1px solid #e5e7eb;
        }
        
        .chart-card h4 {
          margin: 0 0 16px 0;
          font-size: 16px;
          font-weight: 600;
          color: #374151;
        }
        
        .mini-chart {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        
        .trend-item {
          display: grid;
          grid-template-columns: 60px 1fr 30px;
          align-items: center;
          gap: 12px;
          font-size: 12px;
          color: #6b7280;
        }
        
        .trend-bar {
          height: 8px;
          background: #e5e7eb;
          border-radius: 4px;
          overflow: hidden;
        }
        
        .trend-fill {
          height: 100%;
          background: linear-gradient(90deg, #3b82f6 0%, #8b5cf6 100%);
          border-radius: 4px;
          transition: width 0.5s ease;
        }
        
        .status-overview {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        
        .status-item {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 14px;
          color: #374151;
        }
        
        .status-dot {
          width: 12px;
          height: 12px;
          border-radius: 50%;
        }
        
        .status-dot.status-pending {
          background: #f59e0b;
        }
        
        .status-dot.status-confirmed {
          background: #10b981;
        }
        
        .status-dot.status-completed {
          background: #3b82f6;
        }
        
        .status-dot.status-cancelled {
          background: #ef4444;
        }
        
        .card-title {
          font-size: 18px;
          font-weight: 600;
          color: #111827;
          margin: 0;
        }
        
        .data-table {
          width: 100%;
          border-collapse: collapse;
        }
        
        .data-table th {
          text-align: left;
          font-size: 12px;
          font-weight: 600;
          color: #6b7280;
          padding: 12px 16px;
          background: #f9fafb;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }
        
        .data-table td {
          padding: 12px 16px;
          font-size: 14px;
          color: #374151;
          border-top: 1px solid #f3f4f6;
        }
        
        .data-table tr:hover {
          background: #f9fafb;
        }
        
        .role-badge {
          padding: 2px 8px;
          border-radius: 12px;
          font-size: 12px;
          font-weight: 500;
        }
        
        .role-client {
          background: #dcfce7;
          color: #166534;
        }
        
        .role-freelancer {
          background: #ede9fe;
          color: #7c3aed;
        }
        
        .status-badge {
          padding: 2px 8px;
          border-radius: 12px;
          font-size: 12px;
          font-weight: 500;
        }
        
        .status-pending {
          background: #fef3c7;
          color: #92400e;
        }
        
        .status-confirmed {
          background: #dcfce7;
          color: #166534;
        }
        
        .status-completed {
          background: #dbeafe;
          color: #1d4ed8;
        }
        
        .status-cancelled {
          background: #fee2e2;
          color: #dc2626;
        }
        
        .empty-state {
          padding: 40px 20px;
          text-align: center;
          color: #9ca3af;
          font-style: italic;
        }
        
        .dashboard-loading {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: 400px;
          color: #6b7280;
        }
        
        .loading-spinner {
          width: 40px;
          height: 40px;
          border: 4px solid #e5e7eb;
          border-top: 4px solid #3b82f6;
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin-bottom: 16px;
        }
        
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        .dashboard-error {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: 400px;
          color: #ef4444;
          text-align: center;
        }
        
        .error-icon {
          font-size: 48px;
          margin-bottom: 16px;
        }
        
        .dashboard-error button {
          margin-top: 16px;
          padding: 8px 16px;
          background: #ef4444;
          color: white;
          border: none;
          border-radius: 8px;
          cursor: pointer;
        }
      `}</style>

      <header className="dashboard-header">
        <div className="header-content">
          <img
            src="https://ti8ah.com/wp-content/uploads/2025/07/OrderzHouse-Logo-01-.png"
            alt="OrderzHouse"
            className="logo"
          />
          <div className="header-text">
            <h1>{translateMessage("dashboard")}</h1>
            <p>Real-time business insights and management</p>
          </div>
        </div>
        <button
          className="refresh-btn"
          onClick={() => setRefreshKey(k => k + 1)}
        >
          Refresh
        </button>
      </header>

      <div className="metrics-grid">
        {metrics.map((metric, index) => (
          <div
            key={index}
            className={`metric-card ${metric.urgent ? 'urgent' : ''} clickable`}
            style={{ '--color': metric.color, '--color80': metric.color + 'cc' }}
            onClick={() => navigateToResource(metric.resourceId)}
          >
            <div className="metric-header">
              <div className="metric-title">{metric.title}</div>
              <div className="metric-icon">{metric.icon}</div>
            </div>
            <div className="metric-value">{metric.value ?? 0}</div>
            <div className="metric-change">{metric.change}</div>
          </div>
        ))}
      </div>

      <div className="content-grid">
        <div className="content-card clickable" onClick={() => navigateToResource('clients')}>
          <div className="card-header">
            <h3 className="card-title">Recent Users</h3>
            <div className="card-action">→</div>
          </div>
          {recentUsers.length === 0 ? (
            <div className="empty-state">No recent users</div>
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Role</th>
                  <th>Joined</th>
                </tr>
              </thead>
              <tbody>
                {recentUsers.map((user, i) => (
                  <tr key={i}>
                    <td>{user.first_name || "-"}</td>
                    <td>
                      <span className={`role-badge role-${getRoleClass(user.role_id)}`}>
                        {getRoleName(user.role_id)}
                      </span>
                    </td>
                    <td>{formatDate(user.created_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <div className="content-card clickable" onClick={() => navigateToResource('plans')}>
          <div className="card-header">
            <h3 className="card-title">Subscription Plans</h3>
            <div className="card-action">→</div>
          </div>
          {recentPlans.length === 0 ? (
            <div className="empty-state">No plans available</div>
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th>Plan</th>
                  <th>Price</th>
                  <th>Duration</th>
                </tr>
              </thead>
              <tbody>
                {recentPlans.map((plan, i) => (
                  <tr key={i}>
                    <td>{plan.name || "-"}</td>
                    <td>${plan.price || 0}</td>
                    <td>{plan.duration || 0}d</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <div className="content-card clickable" onClick={() => navigateToResource('appointments')}>
          <div className="card-header">
            <h3 className="card-title">Recent Appointments</h3>
            <div className="card-action">→</div>
          </div>
          {recentAppointments.length === 0 ? (
            <div className="empty-state">No recent appointments</div>
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th>Status</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {recentAppointments.map((apt, i) => (
                  <tr key={i}>
                    <td>
                      <span className={`status-badge status-${apt.status || 'pending'}`}>
                        {(apt.status || 'pending').charAt(0).toUpperCase() + (apt.status || 'pending').slice(1)}
                      </span>
                    </td>
                    <td>{formatDate(apt.appointment_date)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      <div className="analytics-section">
        <div className="section-header">
          <h2>Advanced Analytics</h2>
          <button 
            className="analytics-btn"
            onClick={() => navigateToAnalytics()}
          >
            View Full Analytics
          </button>
        </div>
        
        {data?.chartData && (
          <div className="charts-preview">
            <div className="chart-card">
              <h4>User Growth Trend</h4>
              <div className="mini-chart">
                {data.chartData.userTrends?.map((trend, i) => (
                  <div key={i} className="trend-item">
                    <span>{trend.date}</span>
                    <div className="trend-bar">
                      <div 
                        className="trend-fill" 
                        style={{width: `${Math.max(trend.clients + trend.freelancers, 1) * 10}%`}}
                      ></div>
                    </div>
                    <span>{trend.clients + trend.freelancers}</span>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="chart-card">
              <h4>Appointment Status</h4>
              <div className="status-overview">
                {data.chartData.appointmentStats?.map((stat, i) => (
                  <div key={i} className="status-item">
                    <span className={`status-dot status-${stat.status}`}></span>
                    <span>{stat.status}: {stat.count}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function getRoleName(roleId) {
  switch (roleId) {
    case 2: return "Client";
    case 3: return "Freelancer";
    default: return "User";
  }
}

function getRoleClass(roleId) {
  switch (roleId) {
    case 2: return "client";
    case 3: return "freelancer";
    default: return "user";
  }
}

function formatDate(dateString) {
  if (!dateString) return "-";
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "2-digit"
    });
  } catch {
    return "-";
  }
}