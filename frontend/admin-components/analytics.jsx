// Admin/components/Analytics.jsx
import React, { useState, useEffect } from "react";
import { ApiClient } from "adminjs";

const api = new ApiClient();

export default function Analytics() {
  const [activeTab, setActiveTab] = useState('overview');
  const [dateRange, setDateRange] = useState('30d');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);

  const fetchAnalyticsData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/admin/analytics?range=${dateRange}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch analytics data');
      }
      
      const analyticsData = await response.json();
      setData(analyticsData);
    } catch (err) {
      console.error('Analytics fetch error:', err);
      setError('Failed to load analytics data');
      setData({
        overview: {},
        appointments: { overview: {}, appointmentStats: [], topFreelancers: [], recentAppointments: [] },
        users: { overview: {}, userGrowth: [], userDistribution: [], recentUsers: [] },
        projectStats: { byStatus: [] },
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalyticsData();
  }, [dateRange]);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount || 0);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  };

  const formatPercentage = (value) => {
    return `${(value || 0).toFixed(1)}%`;
  };

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '400px',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: '40px',
            height: '40px',
            border: '4px solid #e5e7eb',
            borderTop: '4px solid #3b82f6',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 16px'
          }}></div>
          <p style={{ color: '#6b7280' }}>Loading analytics...</p>
          <style>{`
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
          `}</style>
        </div>
      </div>
    );
  }

  return (
    <div style={{ 
      padding: '24px', 
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      backgroundColor: '#f8fafc',
      minHeight: '100vh'
    }}>
      {/* Header */}
      <div style={{ marginBottom: '32px' }}>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          marginBottom: '24px'
        }}>
          <div>
            <h1 style={{ 
              margin: '0 0 8px 0', 
              fontSize: '28px', 
              fontWeight: '700',
              color: '#1e293b'
            }}>
              Analytics Dashboard
            </h1>
            <p style={{ margin: '0', color: '#64748b', fontSize: '16px' }}>
              Comprehensive business insights and metrics
            </p>
          </div>
          
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              style={{
                padding: '8px 12px',
                border: '1px solid #d1d5db',
                borderRadius: '8px',
                fontSize: '14px',
                backgroundColor: 'white',
                cursor: 'pointer'
              }}
            >
              <option value="7d">7 Days</option>
              <option value="30d">30 Days</option>
              <option value="90d">90 Days</option>
              <option value="1y">1 Year</option>
            </select>
            
            <button
              onClick={fetchAnalyticsData}
              style={{
                padding: '8px 16px',
                backgroundColor: '#3b82f6',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '500'
              }}
            >
              Refresh
            </button>
          </div>
        </div>

        {error && (
          <div style={{
            padding: '12px 16px',
            backgroundColor: '#fee2e2',
            border: '1px solid #fecaca',
            borderRadius: '8px',
            color: '#991b1b',
            marginBottom: '24px',
            fontSize: '14px'
          }}>
            {error}
          </div>
        )}

        <div style={{ borderBottom: '1px solid #e5e7eb' }}>
          <div style={{ display: 'flex', gap: '32px' }}>
            {[
              { id: 'overview', label: 'Overview' },
              { id: 'appointments', label: 'Appointments' },
              { id: 'users', label: 'Users' },
              { id: 'projects', label: 'Projects' },
              { id: 'financial', label: 'Financial' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  padding: '12px 0',
                  border: 'none',
                  background: 'none',
                  fontSize: '14px',
                  fontWeight: '500',
                  color: activeTab === tab.id ? '#3b82f6' : '#6b7280',
                  borderBottom: activeTab === tab.id ? '2px solid #3b82f6' : '2px solid transparent',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div style={{ minHeight: '400px' }}>
        {activeTab === 'overview' && (
          <div>
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', 
              gap: '20px',
              marginBottom: '32px'
            }}>
              <div style={{
                padding: '24px',
                backgroundColor: 'white',
                borderRadius: '12px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                border: '1px solid #e5e7eb'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ marginBottom: '8px', fontSize: '14px', color: '#6b7280', fontWeight: '500' }}>
                      Total Users
                    </div>
                    <div style={{ fontSize: '28px', fontWeight: '700', color: '#1e293b' }}>
                      {(data?.overview?.totalUsers || 0).toLocaleString()}
                    </div>
                    <div style={{ fontSize: '12px', color: '#10b981', marginTop: '4px', fontWeight: '500' }}>
                      +{data?.overview?.newUsersToday || 0} today
                    </div>
                  </div>
                  <div style={{ 
                    padding: '12px', 
                    backgroundColor: '#dbeafe', 
                    borderRadius: '12px',
                    fontSize: '24px'
                  }}>
                    👥
                  </div>
                </div>
              </div>

              <div style={{
                padding: '24px',
                backgroundColor: 'white',
                borderRadius: '12px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                border: '1px solid #e5e7eb'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ marginBottom: '8px', fontSize: '14px', color: '#6b7280', fontWeight: '500' }}>
                      Total Appointments
                    </div>
                    <div style={{ fontSize: '28px', fontWeight: '700', color: '#1e293b' }}>
                      {(data?.appointments?.overview?.totalAppointments || 0).toLocaleString()}
                    </div>
                    <div style={{ fontSize: '12px', color: '#10b981', marginTop: '4px', fontWeight: '500' }}>
                      {data?.appointments?.overview?.appointmentsToday || 0} today
                    </div>
                  </div>
                  <div style={{ 
                    padding: '12px', 
                    backgroundColor: '#dcfce7', 
                    borderRadius: '12px',
                    fontSize: '24px'
                  }}>
                    📅
                  </div>
                </div>
              </div>

              <div style={{
                padding: '24px',
                backgroundColor: 'white',
                borderRadius: '12px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                border: '1px solid #e5e7eb'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ marginBottom: '8px', fontSize: '14px', color: '#6b7280', fontWeight: '500' }}>
                      Active Projects
                    </div>
                    <div style={{ fontSize: '28px', fontWeight: '700', color: '#1e293b' }}>
                      {(data?.overview?.activeProjects || 0).toLocaleString()}
                    </div>
                    <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '4px', fontWeight: '500' }}>
                      {data?.overview?.completedProjects || 0} completed
                    </div>
                  </div>
                  <div style={{ 
                    padding: '12px', 
                    backgroundColor: '#f3e8ff', 
                    borderRadius: '12px',
                    fontSize: '24px'
                  }}>
                    💼
                  </div>
                </div>
              </div>

              <div style={{
                padding: '24px',
                backgroundColor: 'white',
                borderRadius: '12px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                border: '1px solid #e5e7eb'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ marginBottom: '8px', fontSize: '14px', color: '#6b7280', fontWeight: '500' }}>
                      Total Revenue
                    </div>
                    <div style={{ fontSize: '28px', fontWeight: '700', color: '#1e293b' }}>
                      {formatCurrency(data?.overview?.totalRevenue || 0)}
                    </div>
                    <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '4px', fontWeight: '500' }}>
                      {formatCurrency(data?.overview?.monthlyRevenue || 0)} this month
                    </div>
                  </div>
                  <div style={{ 
                    padding: '12px', 
                    backgroundColor: '#fef3c7', 
                    borderRadius: '12px',
                    fontSize: '24px'
                  }}>
                    💰
                  </div>
                </div>
              </div>
            </div>

            <div style={{
              backgroundColor: 'white',
              borderRadius: '12px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
              border: '1px solid #e5e7eb',
              overflow: 'hidden'
            }}>
              <div style={{ 
                padding: '20px 24px', 
                borderBottom: '1px solid #e5e7eb',
                backgroundColor: '#f8fafc'
              }}>
                <h3 style={{ margin: '0', fontSize: '18px', fontWeight: '600', color: '#1e293b' }}>
                  Recent Appointments
                </h3>
              </div>
              
              <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                {data?.appointments?.recentAppointments?.length > 0 ? (
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead style={{ backgroundColor: '#f8fafc', position: 'sticky', top: 0 }}>
                      <tr>
                        <th style={{ textAlign: 'left', padding: '12px 24px', fontSize: '14px', fontWeight: '600', color: '#374151' }}>
                          Type
                        </th>
                        <th style={{ textAlign: 'left', padding: '12px 24px', fontSize: '14px', fontWeight: '600', color: '#374151' }}>
                          Status
                        </th>
                        <th style={{ textAlign: 'left', padding: '12px 24px', fontSize: '14px', fontWeight: '600', color: '#374151' }}>
                          Date
                        </th>
                        <th style={{ textAlign: 'left', padding: '12px 24px', fontSize: '14px', fontWeight: '600', color: '#374151' }}>
                          Freelancer
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.appointments.recentAppointments.slice(0, 10).map((appointment, index) => (
                        <tr key={index} style={{ 
                          borderBottom: '1px solid #f3f4f6',
                          transition: 'background-color 0.2s'
                        }}>
                          <td style={{ padding: '16px 24px', fontSize: '14px', fontWeight: '500' }}>
                            {appointment.appointment_type || 'Appointment'}
                          </td>
                          <td style={{ padding: '16px 24px', fontSize: '14px' }}>
                            <span style={{
                              padding: '4px 12px',
                              borderRadius: '20px',
                              fontSize: '12px',
                              fontWeight: '600',
                              backgroundColor: 
                                appointment.status === 'pending' ? '#fef3c7' :
                                appointment.status === 'accepted' ? '#dcfce7' :
                                appointment.status === 'rejected' ? '#fee2e2' : '#f3f4f6',
                              color:
                                appointment.status === 'pending' ? '#92400e' :
                                appointment.status === 'accepted' ? '#065f46' :
                                appointment.status === 'rejected' ? '#991b1b' : '#374151'
                            }}>
                              {(appointment.status || 'pending').charAt(0).toUpperCase() + (appointment.status || 'pending').slice(1)}
                            </span>
                          </td>
                          <td style={{ padding: '16px 24px', fontSize: '14px', color: '#6b7280' }}>
                            {appointment.created_at ? formatDate(appointment.created_at) : '-'}
                          </td>
                          <td style={{ padding: '16px 24px', fontSize: '14px', fontWeight: '500' }}>
                            {appointment.freelancer_first_name} {appointment.freelancer_last_name}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <div style={{ textAlign: 'center', padding: '48px 24px', color: '#6b7280' }}>
                    <div style={{ fontSize: '48px', marginBottom: '16px' }}>📅</div>
                    <p style={{ margin: '0', fontSize: '16px', fontWeight: '500' }}>No recent appointments found</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'appointments' && (
          <div>
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
              gap: '16px',
              marginBottom: '32px'
            }}>
              <div style={{
                padding: '20px',
                backgroundColor: 'white',
                borderRadius: '12px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                border: '1px solid #e5e7eb'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
                  <div style={{ width: '8px', height: '8px', backgroundColor: '#f59e0b', borderRadius: '50%', marginRight: '8px' }}></div>
                  <span style={{ fontSize: '14px', color: '#6b7280', fontWeight: '500' }}>Pending</span>
                </div>
                <div style={{ fontSize: '24px', fontWeight: '700', color: '#1e293b' }}>
                  {data?.appointments?.overview?.pendingAppointments || 0}
                </div>
              </div>
              
              <div style={{
                padding: '20px',
                backgroundColor: 'white',
                borderRadius: '12px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                border: '1px solid #e5e7eb'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
                  <div style={{ width: '8px', height: '8px', backgroundColor: '#10b981', borderRadius: '50%', marginRight: '8px' }}></div>
                  <span style={{ fontSize: '14px', color: '#6b7280', fontWeight: '500' }}>Accepted</span>
                </div>
                <div style={{ fontSize: '24px', fontWeight: '700', color: '#1e293b' }}>
                  {data?.appointments?.overview?.acceptedAppointments || 0}
                </div>
              </div>
              
              <div style={{
                padding: '20px',
                backgroundColor: 'white',
                borderRadius: '12px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                border: '1px solid #e5e7eb'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
                  <div style={{ width: '8px', height: '8px', backgroundColor: '#ef4444', borderRadius: '50%', marginRight: '8px' }}></div>
                  <span style={{ fontSize: '14px', color: '#6b7280', fontWeight: '500' }}>Rejected</span>
                </div>
                <div style={{ fontSize: '24px', fontWeight: '700', color: '#1e293b' }}>
                  {data?.appointments?.overview?.rejectedAppointments || 0}
                </div>
              </div>
              
              <div style={{
                padding: '20px',
                backgroundColor: 'white',
                borderRadius: '12px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                border: '1px solid #e5e7eb'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
                  <div style={{ width: '8px', height: '8px', backgroundColor: '#3b82f6', borderRadius: '50%', marginRight: '8px' }}></div>
                  <span style={{ fontSize: '14px', color: '#6b7280', fontWeight: '500' }}>Acceptance Rate</span>
                </div>
                <div style={{ fontSize: '24px', fontWeight: '700', color: '#1e293b' }}>
                  {formatPercentage(data?.appointments?.overview?.acceptanceRate || 0)}
                </div>
              </div>
            </div>

            {data?.appointments?.topFreelancers?.length > 0 && (
              <div style={{
                backgroundColor: 'white',
                borderRadius: '12px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                border: '1px solid #e5e7eb',
                overflow: 'hidden'
              }}>
                <div style={{ 
                  padding: '20px 24px', 
                  borderBottom: '1px solid #e5e7eb',
                  backgroundColor: '#f8fafc'
                }}>
                  <h3 style={{ margin: '0', fontSize: '18px', fontWeight: '600', color: '#1e293b' }}>
                    Top Performing Freelancers
                  </h3>
                </div>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead style={{ backgroundColor: '#f8fafc' }}>
                    <tr>
                      <th style={{ textAlign: 'left', padding: '12px 24px', fontSize: '14px', fontWeight: '600', color: '#374151' }}>
                        Freelancer
                      </th>
                      <th style={{ textAlign: 'left', padding: '12px 24px', fontSize: '14px', fontWeight: '600', color: '#374151' }}>
                        Total
                      </th>
                      <th style={{ textAlign: 'left', padding: '12px 24px', fontSize: '14px', fontWeight: '600', color: '#374151' }}>
                        Accepted
                      </th>
                      <th style={{ textAlign: 'left', padding: '12px 24px', fontSize: '14px', fontWeight: '600', color: '#374151' }}>
                        Success Rate
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.appointments.topFreelancers.map((freelancer, index) => (
                      <tr key={index} style={{ borderBottom: '1px solid #f3f4f6' }}>
                        <td style={{ padding: '16px 24px', fontSize: '14px' }}>
                          <div style={{ display: 'flex', alignItems: 'center' }}>
                            <div style={{
                              width: '40px',
                              height: '40px',
                              backgroundColor: '#3b82f6',
                              borderRadius: '50%',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              color: 'white',
                              fontWeight: '600',
                              fontSize: '16px',
                              marginRight: '12px'
                            }}>
                              {freelancer.first_name?.[0]}{freelancer.last_name?.[0]}
                            </div>
                            <div>
                              <div style={{ fontWeight: '600', color: '#1e293b' }}>
                                {freelancer.first_name} {freelancer.last_name}
                              </div>
                              <div style={{ fontSize: '12px', color: '#6b7280' }}>
                                {freelancer.email}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td style={{ padding: '16px 24px', fontSize: '16px', fontWeight: '600', color: '#1e293b' }}>
                          {freelancer.total_appointments}
                        </td>
                        <td style={{ padding: '16px 24px', fontSize: '16px', fontWeight: '600', color: '#10b981' }}>
                          {freelancer.accepted_appointments}
                        </td>
                        <td style={{ padding: '16px 24px', fontSize: '16px', fontWeight: '600', color: '#3b82f6' }}>
                          {formatPercentage(freelancer.acceptance_rate)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {activeTab === 'users' && (
          <div>
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
              gap: '16px',
              marginBottom: '32px'
            }}>
              <div style={{
                padding: '20px',
                backgroundColor: 'white',
                borderRadius: '12px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                border: '1px solid #e5e7eb'
              }}>
                <div style={{ fontSize: '14px', color: '#6b7280', marginBottom: '8px', fontWeight: '500' }}>Total Users</div>
                <div style={{ fontSize: '24px', fontWeight: '700', color: '#1e293b' }}>
                  {(data?.users?.overview?.totalUsers || 0).toLocaleString()}
                </div>
              </div>
              
              <div style={{
                padding: '20px',
                backgroundColor: 'white',
                borderRadius: '12px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                border: '1px solid #e5e7eb'
              }}>
                <div style={{ fontSize: '14px', color: '#3b82f6', marginBottom: '8px', fontWeight: '500' }}>Clients</div>
                <div style={{ fontSize: '24px', fontWeight: '700', color: '#1e293b' }}>
                  {(data?.users?.overview?.totalClients || 0).toLocaleString()}
                </div>
              </div>
              
              <div style={{
                padding: '20px',
                backgroundColor: 'white',
                borderRadius: '12px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                border: '1px solid #e5e7eb'
              }}>
                <div style={{ fontSize: '14px', color: '#8b5cf6', marginBottom: '8px', fontWeight: '500' }}>Freelancers</div>
                <div style={{ fontSize: '24px', fontWeight: '700', color: '#1e293b' }}>
                  {(data?.users?.overview?.totalFreelancers || 0).toLocaleString()}
                </div>
              </div>
              
              <div style={{
                padding: '20px',
                backgroundColor: 'white',
                borderRadius: '12px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                border: '1px solid #e5e7eb'
              }}>
                <div style={{ fontSize: '14px', color: '#10b981', marginBottom: '8px', fontWeight: '500' }}>New This Month</div>
                <div style={{ fontSize: '24px', fontWeight: '700', color: '#1e293b' }}>
                  {(data?.users?.overview?.newUsersMonth || 0).toLocaleString()}
                </div>
              </div>
            </div>

            {data?.users?.recentUsers?.length > 0 && (
              <div style={{
                backgroundColor: 'white',
                borderRadius: '12px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                border: '1px solid #e5e7eb',
                overflow: 'hidden'
              }}>
                <div style={{ 
                  padding: '20px 24px', 
                  borderBottom: '1px solid #e5e7eb',
                  backgroundColor: '#f8fafc'
                }}>
                  <h3 style={{ margin: '0', fontSize: '18px', fontWeight: '600', color: '#1e293b' }}>
                    Recent User Registrations
                  </h3>
                </div>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead style={{ backgroundColor: '#f8fafc' }}>
                    <tr>
                      <th style={{ textAlign: 'left', padding: '12px 24px', fontSize: '14px', fontWeight: '600', color: '#374151' }}>
                        User
                      </th>
                      <th style={{ textAlign: 'left', padding: '12px 24px', fontSize: '14px', fontWeight: '600', color: '#374151' }}>
                        Email
                      </th>
                      <th style={{ textAlign: 'left', padding: '12px 24px', fontSize: '14px', fontWeight: '600', color: '#374151' }}>
                        Role
                      </th>
                      <th style={{ textAlign: 'left', padding: '12px 24px', fontSize: '14px', fontWeight: '600', color: '#374151' }}>
                        Joined
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.users.recentUsers.slice(0, 10).map((user, index) => (
                      <tr key={index} style={{ borderBottom: '1px solid #f3f4f6' }}>
                        <td style={{ padding: '16px 24px', fontSize: '14px', fontWeight: '600', color: '#1e293b' }}>
                          {user.first_name} {user.last_name}
                        </td>
                        <td style={{ padding: '16px 24px', fontSize: '14px', color: '#6b7280' }}>
                          {user.email}
                        </td>
                        <td style={{ padding: '16px 24px', fontSize: '14px' }}>
                          <span style={{
                            padding: '4px 12px',
                            borderRadius: '20px',
                            fontSize: '12px',
                            fontWeight: '600',
                            backgroundColor: user.role_id === 2 ? '#dbeafe' : user.role_id === 3 ? '#f3e8ff' : '#f3f4f6',
                            color: user.role_id === 2 ? '#1e40af' : user.role_id === 3 ? '#7c3aed' : '#374151'
                          }}>
                            {user.role_id === 2 ? 'Client' : user.role_id === 3 ? 'Freelancer' : 'User'}
                          </span>
                        </td>
                        <td style={{ padding: '16px 24px', fontSize: '14px', color: '#6b7280' }}>
                          {user.created_at ? formatDate(user.created_at) : '-'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {activeTab === 'projects' && (
          <div>
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', 
              gap: '16px',
              marginBottom: '32px'
            }}>
              <div style={{
                padding: '20px',
                backgroundColor: 'white',
                borderRadius: '12px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                border: '1px solid #e5e7eb'
              }}>
                <div style={{ fontSize: '14px', color: '#6b7280', marginBottom: '8px', fontWeight: '500' }}>Draft</div>
                <div style={{ fontSize: '24px', fontWeight: '700', color: '#1e293b' }}>
                  {data?.overview?.draftProjects || 0}
                </div>
              </div>
              
              <div style={{
                padding: '20px',
                backgroundColor: 'white',
                borderRadius: '12px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                border: '1px solid #e5e7eb'
              }}>
                <div style={{ fontSize: '14px', color: '#3b82f6', marginBottom: '8px', fontWeight: '500' }}>Active</div>
                <div style={{ fontSize: '24px', fontWeight: '700', color: '#1e293b' }}>
                  {data?.overview?.activeProjects || 0}
                </div>
              </div>
              
              <div style={{
                padding: '20px',
                backgroundColor: 'white',
                borderRadius: '12px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                border: '1px solid #e5e7eb'
              }}>
                <div style={{ fontSize: '14px', color: '#10b981', marginBottom: '8px', fontWeight: '500' }}>Completed</div>
                <div style={{ fontSize: '24px', fontWeight: '700', color: '#1e293b' }}>
                  {data?.overview?.completedProjects || 0}
                </div>
              </div>
              
              <div style={{
                padding: '20px',
                backgroundColor: 'white',
                borderRadius: '12px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                border: '1px solid #e5e7eb'
              }}>
                <div style={{ fontSize: '14px', color: '#1e293b', marginBottom: '8px', fontWeight: '500' }}>Total</div>
                <div style={{ fontSize: '24px', fontWeight: '700', color: '#1e293b' }}>
                  {data?.overview?.totalProjects || 0}
                </div>
              </div>
            </div>

            {data?.projectStats?.byStatus?.length > 0 && (
              <div style={{
                backgroundColor: 'white',
                borderRadius: '12px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                border: '1px solid #e5e7eb',
                padding: '24px'
              }}>
                <h3 style={{ margin: '0 0 24px 0', fontSize: '18px', fontWeight: '600', color: '#1e293b' }}>
                  Project Status Distribution
                </h3>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px' }}>
                  {data.projectStats.byStatus.map((status, index) => (
                    <div key={index} style={{
                      display: 'flex',
                      alignItems: 'center',
                      padding: '12px 16px',
                      backgroundColor: '#f8fafc',
                      borderRadius: '8px',
                      border: '1px solid #e2e8f0'
                    }}>
                      <div style={{
                        width: '12px',
                        height: '12px',
                        backgroundColor: status.color,
                        borderRadius: '3px',
                        marginRight: '8px'
                      }}></div>
                      <span style={{ fontSize: '14px', fontWeight: '500', color: '#374151' }}>
                        {status.status}: {status.count}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'financial' && (
          <div>
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
              gap: '16px',
              marginBottom: '32px'
            }}>
              <div style={{
                padding: '20px',
                backgroundColor: 'white',
                borderRadius: '12px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                border: '1px solid #e5e7eb'
              }}>
                <div style={{ fontSize: '14px', color: '#6b7280', marginBottom: '8px', fontWeight: '500' }}>Total Revenue</div>
                <div style={{ fontSize: '24px', fontWeight: '700', color: '#1e293b' }}>
                  {formatCurrency(data?.overview?.totalRevenue || 0)}
                </div>
              </div>
              
              <div style={{
                padding: '20px',
                backgroundColor: 'white',
                borderRadius: '12px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                border: '1px solid #e5e7eb'
              }}>
                <div style={{ fontSize: '14px', color: '#6b7280', marginBottom: '8px', fontWeight: '500' }}>Transactions</div>
                <div style={{ fontSize: '24px', fontWeight: '700', color: '#1e293b' }}>
                  {(data?.overview?.totalTransactions || 0).toLocaleString()}
                </div>
              </div>
              
              <div style={{
                padding: '20px',
                backgroundColor: 'white',
                borderRadius: '12px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                border: '1px solid #e5e7eb'
              }}>
                <div style={{ fontSize: '14px', color: '#6b7280', marginBottom: '8px', fontWeight: '500' }}>Monthly Revenue</div>
                <div style={{ fontSize: '24px', fontWeight: '700', color: '#1e293b' }}>
                  {formatCurrency(data?.overview?.monthlyRevenue || 0)}
                </div>
              </div>
              
              <div style={{
                padding: '20px',
                backgroundColor: 'white',
                borderRadius: '12px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                border: '1px solid #e5e7eb'
              }}>
                <div style={{ fontSize: '14px', color: '#6b7280', marginBottom: '8px', fontWeight: '500' }}>Avg Transaction</div>
                <div style={{ fontSize: '24px', fontWeight: '700', color: '#1e293b' }}>
                  {formatCurrency(data?.overview?.avgTransaction || 0)}
                </div>
              </div>
            </div>

            <div style={{
              backgroundColor: 'white',
              borderRadius: '12px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
              border: '1px solid #e5e7eb',
              padding: '24px'
            }}>
              <h3 style={{ margin: '0 0 16px 0', fontSize: '18px', fontWeight: '600', color: '#1e293b' }}>
                Financial Overview
              </h3>
              <p style={{ margin: '0', color: '#6b7280', fontSize: '14px' }}>
                Financial analytics provide insights into revenue trends, payment patterns, and transaction data.
                {data?.overview?.totalRevenue > 0 
                  ? ` Current total revenue stands at ${formatCurrency(data.overview.totalRevenue)} across ${(data.overview.totalTransactions || 0).toLocaleString()} transactions.`
                  : ' No payment data available yet.'
                }
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}