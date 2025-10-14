import React, { useState, useEffect } from 'react';
// import {
//   Users,
//   UserCheck,
//   Briefcase,
//   TrendingUp,
//   Globe,
//   Crown,
//   RefreshCw
// } from 'lucide-react';
// import {
//   PieChart,
//   Pie,
//   Cell,
//   BarChart,
//   Bar,
//   XAxis,
//   YAxis,
//   CartesianGrid,
//   Tooltip,
//   ResponsiveContainer,
//   LineChart,
//   Line,
// } from 'recharts';

const UsersAnalytics = () => {
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('30d');
  const [data, setData] = useState({
    userStats: { freelancers: 0, clients: 0, admins: 0 },
    freelancerCategories: [],
    planPreferences: [],
    countryData: [],
    userTrends: []
  });

  // Fetch all users analytics in one call
  const loadData = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/analytics/users?timeRange=${timeRange}`, {
        method: 'GET',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' }
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed to fetch');
      setData(json);
    } catch (err) {
      console.error('Error fetching analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [timeRange]);

  // Chart colors
  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#f97316', '#06b6d4'];

  const userTypeData = [
    { name: 'Freelancers', value: data.userStats.freelancers, color: '#3b82f6' },
    { name: 'Clients', value: data.userStats.clients, color: '#10b981' },
    { name: 'Admins', value: data.userStats.admins, color: '#f59e0b' }
  ];

  const styles = {
    container: { padding: '24px', backgroundColor: '#f8fafc', minHeight: '100vh', fontFamily: 'system-ui, -apple-system, sans-serif' },
    header: { marginBottom: '32px' },
    title: { fontSize: '28px', fontWeight: '700', color: '#1e293b', marginBottom: '8px' },
    subtitle: { fontSize: '16px', color: '#64748b', margin: '0' },
    debugPanel: { backgroundColor: '#fefce8', border: '1px solid #facc15', borderRadius: '8px', padding: '16px', marginBottom: '24px' },
    debugTitle: { fontWeight: '600', color: '#a16207', marginBottom: '8px', fontSize: '14px' },
    debugContent: { fontSize: '12px', color: '#a16207', lineHeight: '1.5' },
    debugButton: { marginTop: '8px', padding: '4px 8px', backgroundColor: '#fde047', color: '#a16207', border: 'none', borderRadius: '4px', fontSize: '11px', cursor: 'pointer' },
    controls: { display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' },
    label: { fontSize: '14px', fontWeight: '500', color: '#374151' },
    select: { padding: '8px 12px', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '14px', backgroundColor: '#ffffff', color: '#374151' },
    refreshButton: { display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', backgroundColor: '#3b82f6', color: '#ffffff', border: 'none', borderRadius: '8px', fontSize: '14px', cursor: 'pointer', fontWeight: '500' },
    loadingContainer: { display: 'flex', alignItems: 'center', justifyContent: 'center', height: '256px', fontSize: '16px', color: '#6b7280' },
    loadingContent: { display: 'flex', alignItems: 'center', gap: '8px' },
    statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px', marginBottom: '32px' },
    statCard: { backgroundColor: '#ffffff', padding: '24px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', border: '1px solid #e5e7eb' },
    statCardContent: { display: 'flex', alignItems: 'center', justifyContent: 'space-between' },
    statInfo: { display: 'flex', flexDirection: 'column' },
    statLabel: { fontSize: '14px', color: '#6b7280', marginBottom: '4px' },
    statValue: { fontSize: '24px', fontWeight: '700', color: '#111827' },
    chartsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '32px', marginBottom: '32px' },
    chartCard: { backgroundColor: '#ffffff', padding: '24px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', border: '1px solid #e5e7eb' },
    chartHeader: { display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' },
    chartTitle: { fontSize: '18px', fontWeight: '600', color: '#111827' },
    chartContainer: { height: '256px', width: '100%' },
    noDataMessage: { display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#9ca3af', fontSize: '14px' },
    trendsCard: { backgroundColor: '#ffffff', padding: '24px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', border: '1px solid #e5e7eb', marginTop: '32px' }
  };

  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.loadingContent}>
          <RefreshCw size={20} style={{ animation: 'spin 1s linear infinite' }} />
          Loading analytics...
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <h1 style={styles.title}>Users Analytics</h1>
        <p style={styles.subtitle}>Comprehensive insights into user demographics and behavior</p>
      </div>

      {/* Debug Panel */}
      <div style={styles.debugPanel}>
        <h3 style={styles.debugTitle}>Debug Info</h3>
        <div style={styles.debugContent}>
          <p><strong>User Stats:</strong> F:{data.userStats.freelancers}, C:{data.userStats.clients}, A:{data.userStats.admins}</p>
          <p><strong>Categories:</strong> {data.freelancerCategories.length} items</p>
          <p><strong>Plans:</strong> {data.planPreferences.length} items</p>
          <p><strong>Countries:</strong> {data.countryData.length} items</p>
          <p><strong>Trends:</strong> {data.userTrends.length} items</p>
          <button style={styles.debugButton} onClick={() => console.log('Current data state:', data)}>Log Data</button>
        </div>
      </div>

      {/* Controls */}
      <div style={styles.controls}>
        <label style={styles.label}>Time Range:</label>
        <select style={styles.select} value={timeRange} onChange={e => setTimeRange(e.target.value)}>
          <option value="7d">Last 7 days</option>
          <option value="30d">Last 30 days</option>
          <option value="90d">Last 3 months</option>
          <option value="1y">Last year</option>
        </select>
        <button style={styles.refreshButton} onClick={loadData}>
          <RefreshCw size={16} /> Refresh
        </button>
      </div>

      {/* User Overview Stats */}
      <div style={styles.statsGrid}>
        {userTypeData.map((item, i) => (
          <div key={i} style={styles.statCard}>
            <div style={styles.statCardContent}>
              <div style={styles.statInfo}>
                <p style={styles.statLabel}>{item.name}</p>
                <p style={styles.statValue}>{item.value.toLocaleString()}</p>
              </div>
              {item.name === 'Freelancers' && <Briefcase color={item.color} size={24} />}
              {item.name === 'Clients' && <UserCheck color={item.color} size={24} />}
              {item.name === 'Admins' && <Crown color={item.color} size={24} />}
            </div>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div style={styles.chartsGrid}>
        {/* User Types Pie Chart */}
        <ChartCard title="User Distribution" Icon={Users} data={userTypeData} dataKey="value" labelKey="name" colors={COLORS} />

        {/* Freelancer Categories */}
        <ChartCard title="Freelancer Categories" Icon={Briefcase} data={data.freelancerCategories} dataKey="count" labelKey="category" barColor="#8b5cf6" />

        {/* Plan Preferences */}
        <ChartCard title="Plan Preferences" Icon={Crown} data={data.planPreferences} dataKey="freelancers" labelKey="plan" barColor="#f59e0b" />

        {/* Top Countries */}
        <ChartCard title="Top Countries" Icon={Globe} data={data.countryData.slice(0, 5)} dataKey="users" labelKey="country" barColor="#10b981" />
      </div>

      {/* Registration Trends */}
      {data.userTrends.length > 0 && (
        <div style={styles.trendsCard}>
          <div style={styles.chartHeader}>
            <TrendingUp color="#3b82f6" size={20} />
            <h3 style={styles.chartTitle}>Registration Trends</h3>
          </div>
          <div style={styles.chartContainer}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data.userTrends}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="period" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="freelancers" stroke="#3b82f6" strokeWidth={2} />
                <Line type="monotone" dataKey="clients" stroke="#10b981" strokeWidth={2} />
                <Line type="monotone" dataKey="total" stroke="#8b5cf6" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
};

export default UsersAnalytics;

// Reusable ChartCard component
const ChartCard = ({ title, Icon, data, dataKey, labelKey, colors, barColor }) => {
  if (!data || data.length === 0) return (
    <div style={{ backgroundColor: '#fff', padding: '24px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', border: '1px solid #e5e7eb' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
        <Icon size={20} /> <h3 style={{ fontSize: '18px', fontWeight: 600 }}> {title} </h3>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '256px', color: '#9ca3af' }}>No data available</div>
    </div>
  );

  return (
    <div style={{ backgroundColor: '#fff', padding: '24px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', border: '1px solid #e5e7eb' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
        <Icon size={20} /> <h3 style={{ fontSize: '18px', fontWeight: 600 }}> {title} </h3>
      </div>
      <div style={{ height: '256px', width: '100%' }}>
        {colors ? (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={data} dataKey={dataKey} nameKey={labelKey} cx="50%" cy="50%" innerRadius={40} outerRadius={80}>
                {data.map((entry, index) => <Cell key={index} fill={colors[index % colors.length]} />)}
              </Pie>
              <Tooltip formatter={(value) => [value.toLocaleString(), labelKey]} />
            </PieChart>
          </ResponsiveContainer>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey={labelKey} angle={-45} textAnchor="end" height={60} />
              <YAxis />
              <Tooltip />
              <Bar dataKey={dataKey} fill={barColor || '#3b82f6'} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
};
