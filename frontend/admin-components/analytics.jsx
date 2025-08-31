import React, { useEffect, useState } from "react";
import { ApiClient, useTranslation } from "adminjs";

const api = new ApiClient();

export default function Analytics() {
  const { translateMessage } = useTranslation();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedRange, setSelectedRange] = useState("7d");

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Fetch from your API endpoint
        const response = await fetch(`/api/admin/analytics?range=${selectedRange}`, {
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
          },
          credentials: 'same-origin'
        });
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const analyticsData = await response.json();
        setData(analyticsData);
        setError(null);
      } catch (err) {
        console.error("Analytics fetch error:", err);
        setError(err?.message || "Failed to load analytics data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [selectedRange]);

  const handleRangeChange = (range) => {
    setSelectedRange(range);
  };

  if (loading) {
    return (
      <div className="analytics-loading">
        <div className="loading-spinner"></div>
        <p>Loading analytics...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="analytics-error">
        <div className="error-icon">⚠️</div>
        <h3>Analytics Error</h3>
        <p>{error}</p>
        <button onClick={() => window.location.reload()}>Reload Page</button>
      </div>
    );
  }

  const { tableStats = [], userGrowth = [], userDistribution = [], appointmentStats = [] } = data || {};

  return (
    <div className="analytics-container">
      <style jsx>{`
        .analytics-container {
          padding: 24px;
          background: #f8fafc;
          min-height: 100vh;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }
        
        .analytics-header {
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
        
        .analytics-header h1 {
          margin: 0;
          font-size: 32px;
          font-weight: 700;
          color: #111827;
        }
        
        .range-selector {
          display: flex;
          gap: 8px;
        }
        
        .range-btn {
          padding: 8px 16px;
          background: #f3f4f6;
          color: #374151;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          font-size: 14px;
          transition: all 0.2s;
        }
        
        .range-btn.active {
          background: #3b82f6;
          color: white;
        }
        
        .range-btn:hover:not(.active) {
          background: #e5e7eb;
        }
        
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 20px;
          margin-bottom: 32px;
        }
        
        .stat-card {
          background: white;
          border-radius: 16px;
          padding: 24px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.05);
          border: 1px solid #e5e7eb;
        }
        
        .stat-card h3 {
          margin: 0 0 16px 0;
          font-size: 18px;
          font-weight: 600;
          color: #111827;
          text-transform: capitalize;
        }
        
        .stat-metrics {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        
        .metric-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 8px 0;
          border-bottom: 1px solid #f3f4f6;
        }
        
        .metric-row:last-child {
          border-bottom: none;
        }
        
        .metric-label {
          font-size: 14px;
          color: #6b7280;
        }
        
        .metric-value {
          font-size: 16px;
          font-weight: 600;
          color: #111827;
        }
        
        .charts-section {
          display: grid;
          grid-template-columns: 2fr 1fr;
          gap: 24px;
          margin-bottom: 32px;
        }
        
        .chart-card {
          background: white;
          border-radius: 16px;
          padding: 24px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.05);
          border: 1px solid #e5e7eb;
        }
        
        .chart-card h3 {
          margin: 0 0 20px 0;
          font-size: 20px;
          font-weight: 600;
          color: #111827;
        }
        
        .growth-chart {
          display: flex;
          flex-direction: column;
          gap: 12px;
          max-height: 300px;
          overflow-y: auto;
        }
        
        .growth-item {
          display: grid;
          grid-template-columns: 80px 1fr 60px;
          align-items: center;
          gap: 12px;
          padding: 8px 0;
        }
        
        .growth-date {
          font-size: 12px;
          color: #6b7280;
          font-weight: 500;
        }
        
        .growth-bar {
          height: 12px;
          background: #f3f4f6;
          border-radius: 6px;
          overflow: hidden;
          position: relative;
        }
        
        .growth-fill {
          height: 100%;
          background: linear-gradient(90deg, #3b82f6 0%, #8b5cf6 100%);
          border-radius: 6px;
          transition: width 0.5s ease;
        }
        
        .growth-total {
          font-size: 12px;
          font-weight: 600;
          color: #111827;
        }
        
        .distribution-chart {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }
        
        .distribution-item {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 12px 16px;
          background: #f8fafc;
          border-radius: 8px;
          border-left: 4px solid #3b82f6;
        }
        
        .distribution-item.freelancer {
          border-left-color: #8b5cf6;
        }
        
        .distribution-name {
          font-size: 14px;
          font-weight: 500;
          color: #374151;
        }
        
        .distribution-value {
          font-size: 18px;
          font-weight: 700;
          color: #111827;
        }
        
        .appointments-section {
          background: white;
          border-radius: 16px;
          padding: 24px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.05);
          border: 1px solid #e5e7eb;
        }
        
        .appointments-section h3 {
          margin: 0 0 20px 0;
          font-size: 20px;
          font-weight: 600;
          color: #111827;
        }
        
        .appointment-stats {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 16px;
        }
        
        .appointment-stat {
          padding: 16px;
          border-radius: 12px;
          text-align: center;
          border: 2px solid transparent;
        }
        
        .appointment-stat.pending {
          background: #fef3c7;
          border-color: #f59e0b;
          color: #92400e;
        }
        
        .appointment-stat.confirmed {
          background: #dcfce7;
          border-color: #10b981;
          color: #166534;
        }
        
        .appointment-stat.completed {
          background: #dbeafe;
          border-color: #3b82f6;
          color: #1d4ed8;
        }
        
        .appointment-stat.cancelled {
          background: #fee2e2;
          border-color: #ef4444;
          color: #dc2626;
        }
        
        .appointment-count {
          font-size: 24px;
          font-weight: 700;
          margin-bottom: 4px;
        }
        
        .appointment-label {
          font-size: 14px;
          font-weight: 500;
          text-transform: capitalize;
        }
        
        .analytics-loading {
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
        
        .analytics-error {
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
        
        .analytics-error button {
          margin-top: 16px;
          padding: 8px 16px;
          background: #ef4444;
          color: white;
          border: none;
          border-radius: 8px;
          cursor: pointer;
        }
      `}</style>

      <header className="analytics-header">
        <h1>Advanced Analytics</h1>
        <div className="range-selector">
          <button 
            className={`range-btn ${selectedRange === '7d' ? 'active' : ''}`}
            onClick={() => handleRangeChange('7d')}
          >
            7 Days
          </button>
          <button 
            className={`range-btn ${selectedRange === '30d' ? 'active' : ''}`}
            onClick={() => handleRangeChange('30d')}
          >
            30 Days
          </button>
          <button 
            className={`range-btn ${selectedRange === '90d' ? 'active' : ''}`}
            onClick={() => handleRangeChange('90d')}
          >
            90 Days
          </button>
          <button 
            className={`range-btn ${selectedRange === '1y' ? 'active' : ''}`}
            onClick={() => handleRangeChange('1y')}
          >
            1 Year
          </button>
        </div>
      </header>

      <div className="stats-grid">
        {tableStats.map((stat, index) => (
          <div key={index} className="stat-card">
            <h3>{stat.name}</h3>
            <div className="stat-metrics">
              <div className="metric-row">
                <span className="metric-label">Total Count</span>
                <span className="metric-value">{stat.count || 0}</span>
              </div>
              <div className="metric-row">
                <span className="metric-label">24h Growth</span>
                <span className="metric-value">+{stat.growth24h || 0}</span>
              </div>
              <div className="metric-row">
                <span className="metric-label">7d Growth</span>
                <span className="metric-value">+{stat.growth7d || 0}</span>
              </div>
              <div className="metric-row">
                <span className="metric-label">Avg Daily</span>
                <span className="metric-value">{stat.avgdailygrowth || 0}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="charts-section">
        <div className="chart-card">
          <h3>User Growth Trends</h3>
          <div className="growth-chart">
            {userGrowth.length === 0 ? (
              <p style={{color: '#9ca3af', fontStyle: 'italic'}}>No growth data available</p>
            ) : (
              userGrowth.map((item, index) => {
                const total = item.clients + item.freelancers;
                const maxTotal = Math.max(...userGrowth.map(g => g.clients + g.freelancers), 1);
                const percentage = (total / maxTotal) * 100;
                
                return (
                  <div key={index} className="growth-item">
                    <span className="growth-date">{item.date}</span>
                    <div className="growth-bar">
                      <div 
                        className="growth-fill" 
                        style={{width: `${percentage}%`}}
                      ></div>
                    </div>
                    <span className="growth-total">{total}</span>
                  </div>
                );
              })
            )}
          </div>
        </div>

        <div className="chart-card">
          <h3>User Distribution</h3>
          <div className="distribution-chart">
            {userDistribution.length === 0 ? (
              <p style={{color: '#9ca3af', fontStyle: 'italic'}}>No distribution data available</p>
            ) : (
              userDistribution.map((item, index) => (
                <div 
                  key={index} 
                  className={`distribution-item ${item.name.toLowerCase().includes('freelancer') ? 'freelancer' : ''}`}
                >
                  <span className="distribution-name">{item.name}</span>
                  <span className="distribution-value">{item.value}</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <div className="appointments-section">
        <h3>Appointment Statistics</h3>
        <div className="appointment-stats">
          {appointmentStats.length === 0 ? (
            <p style={{color: '#9ca3af', fontStyle: 'italic'}}>No appointment data available</p>
          ) : (
            appointmentStats.map((stat, index) => (
              <div key={index} className={`appointment-stat ${stat.status || 'pending'}`}>
                <div className="appointment-count">{stat.count || 0}</div>
                <div className="appointment-label">{stat.status || 'Unknown'}</div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}