(function (React, adminjs) {
  'use strict';

  function _interopDefault (e) { return e && e.__esModule ? e : { default: e }; }

  var React__default = /*#__PURE__*/_interopDefault(React);

  // Admin/components/Dashboard.jsx
  const api = new adminjs.ApiClient();
  function Dashboard() {
    const {
      translateMessage
    } = adminjs.useTranslation();
    const [data, setData] = React.useState(null);
    const [loading, setLoading] = React.useState(true);
    const [error, setError] = React.useState(null);
    const [adminLogs, setAdminLogs] = React.useState([]);
    const [userLogs, setUserLogs] = React.useState([]);
    const fetchingRef = React.useRef(false);
    const mountedRef = React.useRef(true);
    const fetchDashboardData = React.useCallback(async () => {
      if (fetchingRef.current) return;
      fetchingRef.current = true;
      try {
        const response = await api.getDashboard();
        if (!mountedRef.current) return;
        if (response?.data) {
          setData(response.data);
          const allLogs = response.data.recentLogs || [];
          const admins = allLogs.filter(log => log.role_id === 1 || log.first_name === "System").slice(0, 5);
          const users = allLogs.filter(log => log.role_id !== 1 && log.first_name !== "System").slice(0, 5);
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
    React.useEffect(() => {
      mountedRef.current = true;
      fetchDashboardData();
      return () => {
        mountedRef.current = false;
      };
    }, []);

    // Real-time data updates every 10 seconds
    React.useEffect(() => {
      const refreshInterval = setInterval(() => {
        if (!fetchingRef.current && mountedRef.current) {
          fetchDashboardData();
        }
      }, 10000);
      return () => clearInterval(refreshInterval);
    }, [fetchDashboardData]);

    // Real-time log updates every 5 seconds
    React.useEffect(() => {
      const logInterval = setInterval(async () => {
        if (!mountedRef.current || fetchingRef.current) return;
        try {
          const response = await fetch("/api/admin/dashboard/logs");
          if (response.ok) {
            const newLogs = await response.json();
            if (mountedRef.current && newLogs?.recentLogs) {
              const allLogs = newLogs.recentLogs;
              const admins = allLogs.filter(log => log.role_id === 1 || log.first_name === "System").slice(0, 5);
              const users = allLogs.filter(log => log.role_id !== 1 && log.first_name !== "System").slice(0, 5);
              setAdminLogs(admins);
              setUserLogs(users);
            }
          }
        } catch {}
      }, 5000);
      return () => clearInterval(logInterval);
    }, []);
    const handleRefresh = React.useCallback(() => {
      fetchDashboardData();
    }, [fetchDashboardData]);
    if (loading && !data) {
      return /*#__PURE__*/React__default.default.createElement("div", {
        style: {
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '400px',
          fontSize: '16px',
          color: '#6b7280'
        }
      }, "Loading Dashboard...");
    }
    const metrics = data?.metrics || {};
    const statsCards = [{
      title: "Total Admins",
      value: metrics.adminsCount || 0,
      link: "/admin/resources/admins",
      color: "#3b82f6"
    }, {
      title: "Clients",
      value: metrics.clientsCount || 0,
      link: "/admin/resources/clients",
      color: "#10b981"
    }, {
      title: "Freelancers",
      value: metrics.freelancersCount || 0,
      link: "/admin/resources/freelancers",
      color: "#f59e0b"
    }, {
      title: "Active Projects",
      value: metrics.projectsCount || 0,
      link: "/admin/resources/projects",
      color: "#ef4444"
    }, {
      title: "Pending Appointments",
      value: metrics.pendingAppointments || 0,
      link: "/admin/resources/appointments",
      color: "#8b5cf6"
    }, {
      title: "Courses",
      value: metrics.coursesCount || 0,
      link: "/admin/resources/courses",
      color: "#06b6d4"
    }, {
      title: "Plans",
      value: metrics.plansCount || 0,
      link: "/admin/resources/plans",
      color: "#84cc16"
    }, {
      title: "Total Revenue",
      value: `$${(metrics.totalRevenue || 0).toLocaleString()}`,
      link: "/admin/resources/payments",
      color: "#22c55e"
    }, {
      title: "Analytics",
      value: "View Reports",
      link: "/admin/pages/analytics",
      color: "#6366f1"
    }];
    const handleCardClick = link => {
      window.location.href = link;
    };
    const getTimeAgo = dateString => {
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
    return /*#__PURE__*/React__default.default.createElement("div", {
      style: containerStyle
    }, /*#__PURE__*/React__default.default.createElement("div", {
      style: headerStyle
    }, /*#__PURE__*/React__default.default.createElement("h1", {
      style: {
        fontSize: "1.5rem",
        fontWeight: "bold",
        margin: 0,
        color: "#1e293b"
      }
    }, "Admin Dashboard"), "        ", /*#__PURE__*/React__default.default.createElement("button", {
      onClick: handleRefresh,
      style: refreshButtonStyle,
      onMouseOver: e => e.target.style.backgroundColor = '#e9ecef',
      onMouseOut: e => e.target.style.backgroundColor = '#f8f9fa',
      title: "Refresh Dashboard"
    }, /*#__PURE__*/React__default.default.createElement("svg", {
      width: "16",
      height: "16",
      viewBox: "0 0 24 24",
      fill: "none",
      stroke: "currentColor",
      strokeWidth: "2"
    }, /*#__PURE__*/React__default.default.createElement("path", {
      d: "M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"
    }), /*#__PURE__*/React__default.default.createElement("path", {
      d: "M21 3v5h-5"
    }), /*#__PURE__*/React__default.default.createElement("path", {
      d: "M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"
    }), /*#__PURE__*/React__default.default.createElement("path", {
      d: "M3 21v-5h5"
    })))), /*#__PURE__*/React__default.default.createElement("div", {
      style: metricsGridStyle
    }, statsCards.map((card, index) => /*#__PURE__*/React__default.default.createElement("div", {
      key: index,
      onClick: () => handleCardClick(card.link),
      style: cardStyle,
      onMouseOver: e => {
        e.currentTarget.style.borderColor = card.color;
        e.currentTarget.style.boxShadow = `0 4px 12px ${card.color}20`;
      },
      onMouseOut: e => {
        e.currentTarget.style.borderColor = '#e5e7eb';
        e.currentTarget.style.boxShadow = 'none';
      }
    }, /*#__PURE__*/React__default.default.createElement("h3", {
      style: cardTitleStyle
    }, card.title), /*#__PURE__*/React__default.default.createElement("p", {
      style: cardValueStyle()
    }, card.value)))), /*#__PURE__*/React__default.default.createElement("div", {
      style: logsContainerStyle
    }, /*#__PURE__*/React__default.default.createElement("div", {
      style: logSectionStyle
    }, /*#__PURE__*/React__default.default.createElement("h3", {
      style: logHeaderStyle
    }, "Admin Activity (", adminLogs.length, ")"), adminLogs.length === 0 ? /*#__PURE__*/React__default.default.createElement("div", {
      style: emptyStateStyle
    }, "No recent admin activity") : adminLogs.map((log, i) => /*#__PURE__*/React__default.default.createElement("div", {
      key: log.id || i,
      style: {
        ...logItemStyle,
        borderBottom: i === adminLogs.length - 1 ? 'none' : '1px solid #f3f4f6'
      }
    }, /*#__PURE__*/React__default.default.createElement("div", {
      style: logItemNameStyle
    }, log.first_name, " ", log.last_name), /*#__PURE__*/React__default.default.createElement("div", {
      style: logItemActionStyle
    }, log.action), /*#__PURE__*/React__default.default.createElement("div", {
      style: logItemTimeStyle
    }, getTimeAgo(log.created_at))))), /*#__PURE__*/React__default.default.createElement("div", {
      style: logSectionStyle
    }, /*#__PURE__*/React__default.default.createElement("h3", {
      style: logHeaderStyle
    }, "User Activity (", userLogs.length, ")"), userLogs.length === 0 ? /*#__PURE__*/React__default.default.createElement("div", {
      style: emptyStateStyle
    }, "No recent user activity") : userLogs.map((log, i) => /*#__PURE__*/React__default.default.createElement("div", {
      key: log.id || i,
      style: {
        ...logItemStyle,
        borderBottom: i === userLogs.length - 1 ? 'none' : '1px solid #f3f4f6'
      }
    }, /*#__PURE__*/React__default.default.createElement("div", {
      style: logItemNameStyle
    }, log.first_name, " ", log.last_name), /*#__PURE__*/React__default.default.createElement("div", {
      style: logItemActionStyle
    }, log.action), /*#__PURE__*/React__default.default.createElement("div", {
      style: logItemTimeStyle
    }, getTimeAgo(log.created_at)))))));
  }

  // Admin/components/Analytics.jsx
  new adminjs.ApiClient();
  function Analytics() {
    const [activeTab, setActiveTab] = React.useState('overview');
    const [dateRange, setDateRange] = React.useState('30d');
    const [loading, setLoading] = React.useState(false);
    const [error, setError] = React.useState(null);
    const [data, setData] = React.useState(null);
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
          appointments: {
            overview: {},
            appointmentStats: [],
            topFreelancers: [],
            recentAppointments: []
          },
          users: {
            overview: {},
            userGrowth: [],
            userDistribution: [],
            recentUsers: []
          },
          projectStats: {
            byStatus: []
          }
        });
      } finally {
        setLoading(false);
      }
    };
    React.useEffect(() => {
      fetchAnalyticsData();
    }, [dateRange]);
    const formatCurrency = amount => {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD'
      }).format(amount || 0);
    };
    const formatDate = dateString => {
      return new Date(dateString).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric'
      });
    };
    const formatPercentage = value => {
      return `${(value || 0).toFixed(1)}%`;
    };
    if (loading) {
      return /*#__PURE__*/React__default.default.createElement("div", {
        style: {
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '400px',
          fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
        }
      }, /*#__PURE__*/React__default.default.createElement("div", {
        style: {
          textAlign: 'center'
        }
      }, /*#__PURE__*/React__default.default.createElement("div", {
        style: {
          width: '40px',
          height: '40px',
          border: '4px solid #e5e7eb',
          borderTop: '4px solid #3b82f6',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite',
          margin: '0 auto 16px'
        }
      }), /*#__PURE__*/React__default.default.createElement("p", {
        style: {
          color: '#6b7280'
        }
      }, "Loading analytics..."), /*#__PURE__*/React__default.default.createElement("style", null, `
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
          `)));
    }
    return /*#__PURE__*/React__default.default.createElement("div", {
      style: {
        padding: '24px',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        backgroundColor: '#f8fafc',
        minHeight: '100vh'
      }
    }, /*#__PURE__*/React__default.default.createElement("div", {
      style: {
        marginBottom: '32px'
      }
    }, /*#__PURE__*/React__default.default.createElement("div", {
      style: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '24px'
      }
    }, /*#__PURE__*/React__default.default.createElement("div", null, /*#__PURE__*/React__default.default.createElement("h1", {
      style: {
        margin: '0 0 8px 0',
        fontSize: '28px',
        fontWeight: '700',
        color: '#1e293b'
      }
    }, "Analytics Dashboard"), /*#__PURE__*/React__default.default.createElement("p", {
      style: {
        margin: '0',
        color: '#64748b',
        fontSize: '16px'
      }
    }, "Comprehensive business insights and metrics")), /*#__PURE__*/React__default.default.createElement("div", {
      style: {
        display: 'flex',
        gap: '12px',
        alignItems: 'center'
      }
    }, /*#__PURE__*/React__default.default.createElement("select", {
      value: dateRange,
      onChange: e => setDateRange(e.target.value),
      style: {
        padding: '8px 12px',
        border: '1px solid #d1d5db',
        borderRadius: '8px',
        fontSize: '14px',
        backgroundColor: 'white',
        cursor: 'pointer'
      }
    }, /*#__PURE__*/React__default.default.createElement("option", {
      value: "7d"
    }, "7 Days"), /*#__PURE__*/React__default.default.createElement("option", {
      value: "30d"
    }, "30 Days"), /*#__PURE__*/React__default.default.createElement("option", {
      value: "90d"
    }, "90 Days"), /*#__PURE__*/React__default.default.createElement("option", {
      value: "1y"
    }, "1 Year")), /*#__PURE__*/React__default.default.createElement("button", {
      onClick: fetchAnalyticsData,
      style: {
        padding: '8px 16px',
        backgroundColor: '#3b82f6',
        color: 'white',
        border: 'none',
        borderRadius: '8px',
        cursor: 'pointer',
        fontSize: '14px',
        fontWeight: '500'
      }
    }, "Refresh"))), error && /*#__PURE__*/React__default.default.createElement("div", {
      style: {
        padding: '12px 16px',
        backgroundColor: '#fee2e2',
        border: '1px solid #fecaca',
        borderRadius: '8px',
        color: '#991b1b',
        marginBottom: '24px',
        fontSize: '14px'
      }
    }, error), /*#__PURE__*/React__default.default.createElement("div", {
      style: {
        borderBottom: '1px solid #e5e7eb'
      }
    }, /*#__PURE__*/React__default.default.createElement("div", {
      style: {
        display: 'flex',
        gap: '32px'
      }
    }, [{
      id: 'overview',
      label: 'Overview'
    }, {
      id: 'appointments',
      label: 'Appointments'
    }, {
      id: 'users',
      label: 'Users'
    }, {
      id: 'projects',
      label: 'Projects'
    }, {
      id: 'financial',
      label: 'Financial'
    }].map(tab => /*#__PURE__*/React__default.default.createElement("button", {
      key: tab.id,
      onClick: () => setActiveTab(tab.id),
      style: {
        padding: '12px 0',
        border: 'none',
        background: 'none',
        fontSize: '14px',
        fontWeight: '500',
        color: activeTab === tab.id ? '#3b82f6' : '#6b7280',
        borderBottom: activeTab === tab.id ? '2px solid #3b82f6' : '2px solid transparent',
        cursor: 'pointer',
        transition: 'all 0.2s'
      }
    }, tab.label))))), /*#__PURE__*/React__default.default.createElement("div", {
      style: {
        minHeight: '400px'
      }
    }, activeTab === 'overview' && /*#__PURE__*/React__default.default.createElement("div", null, /*#__PURE__*/React__default.default.createElement("div", {
      style: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
        gap: '20px',
        marginBottom: '32px'
      }
    }, /*#__PURE__*/React__default.default.createElement("div", {
      style: {
        padding: '24px',
        backgroundColor: 'white',
        borderRadius: '12px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        border: '1px solid #e5e7eb'
      }
    }, /*#__PURE__*/React__default.default.createElement("div", {
      style: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }
    }, /*#__PURE__*/React__default.default.createElement("div", null, /*#__PURE__*/React__default.default.createElement("div", {
      style: {
        marginBottom: '8px',
        fontSize: '14px',
        color: '#6b7280',
        fontWeight: '500'
      }
    }, "Total Users"), /*#__PURE__*/React__default.default.createElement("div", {
      style: {
        fontSize: '28px',
        fontWeight: '700',
        color: '#1e293b'
      }
    }, (data?.overview?.totalUsers || 0).toLocaleString()), /*#__PURE__*/React__default.default.createElement("div", {
      style: {
        fontSize: '12px',
        color: '#10b981',
        marginTop: '4px',
        fontWeight: '500'
      }
    }, "+", data?.overview?.newUsersToday || 0, " today")), /*#__PURE__*/React__default.default.createElement("div", {
      style: {
        padding: '12px',
        backgroundColor: '#dbeafe',
        borderRadius: '12px',
        fontSize: '24px'
      }
    }, "\uD83D\uDC65"))), /*#__PURE__*/React__default.default.createElement("div", {
      style: {
        padding: '24px',
        backgroundColor: 'white',
        borderRadius: '12px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        border: '1px solid #e5e7eb'
      }
    }, /*#__PURE__*/React__default.default.createElement("div", {
      style: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }
    }, /*#__PURE__*/React__default.default.createElement("div", null, /*#__PURE__*/React__default.default.createElement("div", {
      style: {
        marginBottom: '8px',
        fontSize: '14px',
        color: '#6b7280',
        fontWeight: '500'
      }
    }, "Total Appointments"), /*#__PURE__*/React__default.default.createElement("div", {
      style: {
        fontSize: '28px',
        fontWeight: '700',
        color: '#1e293b'
      }
    }, (data?.appointments?.overview?.totalAppointments || 0).toLocaleString()), /*#__PURE__*/React__default.default.createElement("div", {
      style: {
        fontSize: '12px',
        color: '#10b981',
        marginTop: '4px',
        fontWeight: '500'
      }
    }, data?.appointments?.overview?.appointmentsToday || 0, " today")), /*#__PURE__*/React__default.default.createElement("div", {
      style: {
        padding: '12px',
        backgroundColor: '#dcfce7',
        borderRadius: '12px',
        fontSize: '24px'
      }
    }, "\uD83D\uDCC5"))), /*#__PURE__*/React__default.default.createElement("div", {
      style: {
        padding: '24px',
        backgroundColor: 'white',
        borderRadius: '12px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        border: '1px solid #e5e7eb'
      }
    }, /*#__PURE__*/React__default.default.createElement("div", {
      style: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }
    }, /*#__PURE__*/React__default.default.createElement("div", null, /*#__PURE__*/React__default.default.createElement("div", {
      style: {
        marginBottom: '8px',
        fontSize: '14px',
        color: '#6b7280',
        fontWeight: '500'
      }
    }, "Active Projects"), /*#__PURE__*/React__default.default.createElement("div", {
      style: {
        fontSize: '28px',
        fontWeight: '700',
        color: '#1e293b'
      }
    }, (data?.overview?.activeProjects || 0).toLocaleString()), /*#__PURE__*/React__default.default.createElement("div", {
      style: {
        fontSize: '12px',
        color: '#6b7280',
        marginTop: '4px',
        fontWeight: '500'
      }
    }, data?.overview?.completedProjects || 0, " completed")), /*#__PURE__*/React__default.default.createElement("div", {
      style: {
        padding: '12px',
        backgroundColor: '#f3e8ff',
        borderRadius: '12px',
        fontSize: '24px'
      }
    }, "\uD83D\uDCBC"))), /*#__PURE__*/React__default.default.createElement("div", {
      style: {
        padding: '24px',
        backgroundColor: 'white',
        borderRadius: '12px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        border: '1px solid #e5e7eb'
      }
    }, /*#__PURE__*/React__default.default.createElement("div", {
      style: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }
    }, /*#__PURE__*/React__default.default.createElement("div", null, /*#__PURE__*/React__default.default.createElement("div", {
      style: {
        marginBottom: '8px',
        fontSize: '14px',
        color: '#6b7280',
        fontWeight: '500'
      }
    }, "Total Revenue"), /*#__PURE__*/React__default.default.createElement("div", {
      style: {
        fontSize: '28px',
        fontWeight: '700',
        color: '#1e293b'
      }
    }, formatCurrency(data?.overview?.totalRevenue || 0)), /*#__PURE__*/React__default.default.createElement("div", {
      style: {
        fontSize: '12px',
        color: '#6b7280',
        marginTop: '4px',
        fontWeight: '500'
      }
    }, formatCurrency(data?.overview?.monthlyRevenue || 0), " this month")), /*#__PURE__*/React__default.default.createElement("div", {
      style: {
        padding: '12px',
        backgroundColor: '#fef3c7',
        borderRadius: '12px',
        fontSize: '24px'
      }
    }, "\uD83D\uDCB0")))), /*#__PURE__*/React__default.default.createElement("div", {
      style: {
        backgroundColor: 'white',
        borderRadius: '12px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        border: '1px solid #e5e7eb',
        overflow: 'hidden'
      }
    }, /*#__PURE__*/React__default.default.createElement("div", {
      style: {
        padding: '20px 24px',
        borderBottom: '1px solid #e5e7eb',
        backgroundColor: '#f8fafc'
      }
    }, /*#__PURE__*/React__default.default.createElement("h3", {
      style: {
        margin: '0',
        fontSize: '18px',
        fontWeight: '600',
        color: '#1e293b'
      }
    }, "Recent Appointments")), /*#__PURE__*/React__default.default.createElement("div", {
      style: {
        maxHeight: '400px',
        overflowY: 'auto'
      }
    }, data?.appointments?.recentAppointments?.length > 0 ? /*#__PURE__*/React__default.default.createElement("table", {
      style: {
        width: '100%',
        borderCollapse: 'collapse'
      }
    }, /*#__PURE__*/React__default.default.createElement("thead", {
      style: {
        backgroundColor: '#f8fafc',
        position: 'sticky',
        top: 0
      }
    }, /*#__PURE__*/React__default.default.createElement("tr", null, /*#__PURE__*/React__default.default.createElement("th", {
      style: {
        textAlign: 'left',
        padding: '12px 24px',
        fontSize: '14px',
        fontWeight: '600',
        color: '#374151'
      }
    }, "Type"), /*#__PURE__*/React__default.default.createElement("th", {
      style: {
        textAlign: 'left',
        padding: '12px 24px',
        fontSize: '14px',
        fontWeight: '600',
        color: '#374151'
      }
    }, "Status"), /*#__PURE__*/React__default.default.createElement("th", {
      style: {
        textAlign: 'left',
        padding: '12px 24px',
        fontSize: '14px',
        fontWeight: '600',
        color: '#374151'
      }
    }, "Date"), /*#__PURE__*/React__default.default.createElement("th", {
      style: {
        textAlign: 'left',
        padding: '12px 24px',
        fontSize: '14px',
        fontWeight: '600',
        color: '#374151'
      }
    }, "Freelancer"))), /*#__PURE__*/React__default.default.createElement("tbody", null, data.appointments.recentAppointments.slice(0, 10).map((appointment, index) => /*#__PURE__*/React__default.default.createElement("tr", {
      key: index,
      style: {
        borderBottom: '1px solid #f3f4f6',
        transition: 'background-color 0.2s'
      }
    }, /*#__PURE__*/React__default.default.createElement("td", {
      style: {
        padding: '16px 24px',
        fontSize: '14px',
        fontWeight: '500'
      }
    }, appointment.appointment_type || 'Appointment'), /*#__PURE__*/React__default.default.createElement("td", {
      style: {
        padding: '16px 24px',
        fontSize: '14px'
      }
    }, /*#__PURE__*/React__default.default.createElement("span", {
      style: {
        padding: '4px 12px',
        borderRadius: '20px',
        fontSize: '12px',
        fontWeight: '600',
        backgroundColor: appointment.status === 'pending' ? '#fef3c7' : appointment.status === 'accepted' ? '#dcfce7' : appointment.status === 'rejected' ? '#fee2e2' : '#f3f4f6',
        color: appointment.status === 'pending' ? '#92400e' : appointment.status === 'accepted' ? '#065f46' : appointment.status === 'rejected' ? '#991b1b' : '#374151'
      }
    }, (appointment.status || 'pending').charAt(0).toUpperCase() + (appointment.status || 'pending').slice(1))), /*#__PURE__*/React__default.default.createElement("td", {
      style: {
        padding: '16px 24px',
        fontSize: '14px',
        color: '#6b7280'
      }
    }, appointment.created_at ? formatDate(appointment.created_at) : '-'), /*#__PURE__*/React__default.default.createElement("td", {
      style: {
        padding: '16px 24px',
        fontSize: '14px',
        fontWeight: '500'
      }
    }, appointment.freelancer_first_name, " ", appointment.freelancer_last_name))))) : /*#__PURE__*/React__default.default.createElement("div", {
      style: {
        textAlign: 'center',
        padding: '48px 24px',
        color: '#6b7280'
      }
    }, /*#__PURE__*/React__default.default.createElement("div", {
      style: {
        fontSize: '48px',
        marginBottom: '16px'
      }
    }, "\uD83D\uDCC5"), /*#__PURE__*/React__default.default.createElement("p", {
      style: {
        margin: '0',
        fontSize: '16px',
        fontWeight: '500'
      }
    }, "No recent appointments found"))))), activeTab === 'appointments' && /*#__PURE__*/React__default.default.createElement("div", null, /*#__PURE__*/React__default.default.createElement("div", {
      style: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '16px',
        marginBottom: '32px'
      }
    }, /*#__PURE__*/React__default.default.createElement("div", {
      style: {
        padding: '20px',
        backgroundColor: 'white',
        borderRadius: '12px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        border: '1px solid #e5e7eb'
      }
    }, /*#__PURE__*/React__default.default.createElement("div", {
      style: {
        display: 'flex',
        alignItems: 'center',
        marginBottom: '8px'
      }
    }, /*#__PURE__*/React__default.default.createElement("div", {
      style: {
        width: '8px',
        height: '8px',
        backgroundColor: '#f59e0b',
        borderRadius: '50%',
        marginRight: '8px'
      }
    }), /*#__PURE__*/React__default.default.createElement("span", {
      style: {
        fontSize: '14px',
        color: '#6b7280',
        fontWeight: '500'
      }
    }, "Pending")), /*#__PURE__*/React__default.default.createElement("div", {
      style: {
        fontSize: '24px',
        fontWeight: '700',
        color: '#1e293b'
      }
    }, data?.appointments?.overview?.pendingAppointments || 0)), /*#__PURE__*/React__default.default.createElement("div", {
      style: {
        padding: '20px',
        backgroundColor: 'white',
        borderRadius: '12px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        border: '1px solid #e5e7eb'
      }
    }, /*#__PURE__*/React__default.default.createElement("div", {
      style: {
        display: 'flex',
        alignItems: 'center',
        marginBottom: '8px'
      }
    }, /*#__PURE__*/React__default.default.createElement("div", {
      style: {
        width: '8px',
        height: '8px',
        backgroundColor: '#10b981',
        borderRadius: '50%',
        marginRight: '8px'
      }
    }), /*#__PURE__*/React__default.default.createElement("span", {
      style: {
        fontSize: '14px',
        color: '#6b7280',
        fontWeight: '500'
      }
    }, "Accepted")), /*#__PURE__*/React__default.default.createElement("div", {
      style: {
        fontSize: '24px',
        fontWeight: '700',
        color: '#1e293b'
      }
    }, data?.appointments?.overview?.acceptedAppointments || 0)), /*#__PURE__*/React__default.default.createElement("div", {
      style: {
        padding: '20px',
        backgroundColor: 'white',
        borderRadius: '12px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        border: '1px solid #e5e7eb'
      }
    }, /*#__PURE__*/React__default.default.createElement("div", {
      style: {
        display: 'flex',
        alignItems: 'center',
        marginBottom: '8px'
      }
    }, /*#__PURE__*/React__default.default.createElement("div", {
      style: {
        width: '8px',
        height: '8px',
        backgroundColor: '#ef4444',
        borderRadius: '50%',
        marginRight: '8px'
      }
    }), /*#__PURE__*/React__default.default.createElement("span", {
      style: {
        fontSize: '14px',
        color: '#6b7280',
        fontWeight: '500'
      }
    }, "Rejected")), /*#__PURE__*/React__default.default.createElement("div", {
      style: {
        fontSize: '24px',
        fontWeight: '700',
        color: '#1e293b'
      }
    }, data?.appointments?.overview?.rejectedAppointments || 0)), /*#__PURE__*/React__default.default.createElement("div", {
      style: {
        padding: '20px',
        backgroundColor: 'white',
        borderRadius: '12px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        border: '1px solid #e5e7eb'
      }
    }, /*#__PURE__*/React__default.default.createElement("div", {
      style: {
        display: 'flex',
        alignItems: 'center',
        marginBottom: '8px'
      }
    }, /*#__PURE__*/React__default.default.createElement("div", {
      style: {
        width: '8px',
        height: '8px',
        backgroundColor: '#3b82f6',
        borderRadius: '50%',
        marginRight: '8px'
      }
    }), /*#__PURE__*/React__default.default.createElement("span", {
      style: {
        fontSize: '14px',
        color: '#6b7280',
        fontWeight: '500'
      }
    }, "Acceptance Rate")), /*#__PURE__*/React__default.default.createElement("div", {
      style: {
        fontSize: '24px',
        fontWeight: '700',
        color: '#1e293b'
      }
    }, formatPercentage(data?.appointments?.overview?.acceptanceRate || 0)))), data?.appointments?.topFreelancers?.length > 0 && /*#__PURE__*/React__default.default.createElement("div", {
      style: {
        backgroundColor: 'white',
        borderRadius: '12px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        border: '1px solid #e5e7eb',
        overflow: 'hidden'
      }
    }, /*#__PURE__*/React__default.default.createElement("div", {
      style: {
        padding: '20px 24px',
        borderBottom: '1px solid #e5e7eb',
        backgroundColor: '#f8fafc'
      }
    }, /*#__PURE__*/React__default.default.createElement("h3", {
      style: {
        margin: '0',
        fontSize: '18px',
        fontWeight: '600',
        color: '#1e293b'
      }
    }, "Top Performing Freelancers")), /*#__PURE__*/React__default.default.createElement("table", {
      style: {
        width: '100%',
        borderCollapse: 'collapse'
      }
    }, /*#__PURE__*/React__default.default.createElement("thead", {
      style: {
        backgroundColor: '#f8fafc'
      }
    }, /*#__PURE__*/React__default.default.createElement("tr", null, /*#__PURE__*/React__default.default.createElement("th", {
      style: {
        textAlign: 'left',
        padding: '12px 24px',
        fontSize: '14px',
        fontWeight: '600',
        color: '#374151'
      }
    }, "Freelancer"), /*#__PURE__*/React__default.default.createElement("th", {
      style: {
        textAlign: 'left',
        padding: '12px 24px',
        fontSize: '14px',
        fontWeight: '600',
        color: '#374151'
      }
    }, "Total"), /*#__PURE__*/React__default.default.createElement("th", {
      style: {
        textAlign: 'left',
        padding: '12px 24px',
        fontSize: '14px',
        fontWeight: '600',
        color: '#374151'
      }
    }, "Accepted"), /*#__PURE__*/React__default.default.createElement("th", {
      style: {
        textAlign: 'left',
        padding: '12px 24px',
        fontSize: '14px',
        fontWeight: '600',
        color: '#374151'
      }
    }, "Success Rate"))), /*#__PURE__*/React__default.default.createElement("tbody", null, data.appointments.topFreelancers.map((freelancer, index) => /*#__PURE__*/React__default.default.createElement("tr", {
      key: index,
      style: {
        borderBottom: '1px solid #f3f4f6'
      }
    }, /*#__PURE__*/React__default.default.createElement("td", {
      style: {
        padding: '16px 24px',
        fontSize: '14px'
      }
    }, /*#__PURE__*/React__default.default.createElement("div", {
      style: {
        display: 'flex',
        alignItems: 'center'
      }
    }, /*#__PURE__*/React__default.default.createElement("div", {
      style: {
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
      }
    }, freelancer.first_name?.[0], freelancer.last_name?.[0]), /*#__PURE__*/React__default.default.createElement("div", null, /*#__PURE__*/React__default.default.createElement("div", {
      style: {
        fontWeight: '600',
        color: '#1e293b'
      }
    }, freelancer.first_name, " ", freelancer.last_name), /*#__PURE__*/React__default.default.createElement("div", {
      style: {
        fontSize: '12px',
        color: '#6b7280'
      }
    }, freelancer.email)))), /*#__PURE__*/React__default.default.createElement("td", {
      style: {
        padding: '16px 24px',
        fontSize: '16px',
        fontWeight: '600',
        color: '#1e293b'
      }
    }, freelancer.total_appointments), /*#__PURE__*/React__default.default.createElement("td", {
      style: {
        padding: '16px 24px',
        fontSize: '16px',
        fontWeight: '600',
        color: '#10b981'
      }
    }, freelancer.accepted_appointments), /*#__PURE__*/React__default.default.createElement("td", {
      style: {
        padding: '16px 24px',
        fontSize: '16px',
        fontWeight: '600',
        color: '#3b82f6'
      }
    }, formatPercentage(freelancer.acceptance_rate)))))))), activeTab === 'users' && /*#__PURE__*/React__default.default.createElement("div", null, /*#__PURE__*/React__default.default.createElement("div", {
      style: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '16px',
        marginBottom: '32px'
      }
    }, /*#__PURE__*/React__default.default.createElement("div", {
      style: {
        padding: '20px',
        backgroundColor: 'white',
        borderRadius: '12px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        border: '1px solid #e5e7eb'
      }
    }, /*#__PURE__*/React__default.default.createElement("div", {
      style: {
        fontSize: '14px',
        color: '#6b7280',
        marginBottom: '8px',
        fontWeight: '500'
      }
    }, "Total Users"), /*#__PURE__*/React__default.default.createElement("div", {
      style: {
        fontSize: '24px',
        fontWeight: '700',
        color: '#1e293b'
      }
    }, (data?.users?.overview?.totalUsers || 0).toLocaleString())), /*#__PURE__*/React__default.default.createElement("div", {
      style: {
        padding: '20px',
        backgroundColor: 'white',
        borderRadius: '12px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        border: '1px solid #e5e7eb'
      }
    }, /*#__PURE__*/React__default.default.createElement("div", {
      style: {
        fontSize: '14px',
        color: '#3b82f6',
        marginBottom: '8px',
        fontWeight: '500'
      }
    }, "Clients"), /*#__PURE__*/React__default.default.createElement("div", {
      style: {
        fontSize: '24px',
        fontWeight: '700',
        color: '#1e293b'
      }
    }, (data?.users?.overview?.totalClients || 0).toLocaleString())), /*#__PURE__*/React__default.default.createElement("div", {
      style: {
        padding: '20px',
        backgroundColor: 'white',
        borderRadius: '12px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        border: '1px solid #e5e7eb'
      }
    }, /*#__PURE__*/React__default.default.createElement("div", {
      style: {
        fontSize: '14px',
        color: '#8b5cf6',
        marginBottom: '8px',
        fontWeight: '500'
      }
    }, "Freelancers"), /*#__PURE__*/React__default.default.createElement("div", {
      style: {
        fontSize: '24px',
        fontWeight: '700',
        color: '#1e293b'
      }
    }, (data?.users?.overview?.totalFreelancers || 0).toLocaleString())), /*#__PURE__*/React__default.default.createElement("div", {
      style: {
        padding: '20px',
        backgroundColor: 'white',
        borderRadius: '12px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        border: '1px solid #e5e7eb'
      }
    }, /*#__PURE__*/React__default.default.createElement("div", {
      style: {
        fontSize: '14px',
        color: '#10b981',
        marginBottom: '8px',
        fontWeight: '500'
      }
    }, "New This Month"), /*#__PURE__*/React__default.default.createElement("div", {
      style: {
        fontSize: '24px',
        fontWeight: '700',
        color: '#1e293b'
      }
    }, (data?.users?.overview?.newUsersMonth || 0).toLocaleString()))), data?.users?.recentUsers?.length > 0 && /*#__PURE__*/React__default.default.createElement("div", {
      style: {
        backgroundColor: 'white',
        borderRadius: '12px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        border: '1px solid #e5e7eb',
        overflow: 'hidden'
      }
    }, /*#__PURE__*/React__default.default.createElement("div", {
      style: {
        padding: '20px 24px',
        borderBottom: '1px solid #e5e7eb',
        backgroundColor: '#f8fafc'
      }
    }, /*#__PURE__*/React__default.default.createElement("h3", {
      style: {
        margin: '0',
        fontSize: '18px',
        fontWeight: '600',
        color: '#1e293b'
      }
    }, "Recent User Registrations")), /*#__PURE__*/React__default.default.createElement("table", {
      style: {
        width: '100%',
        borderCollapse: 'collapse'
      }
    }, /*#__PURE__*/React__default.default.createElement("thead", {
      style: {
        backgroundColor: '#f8fafc'
      }
    }, /*#__PURE__*/React__default.default.createElement("tr", null, /*#__PURE__*/React__default.default.createElement("th", {
      style: {
        textAlign: 'left',
        padding: '12px 24px',
        fontSize: '14px',
        fontWeight: '600',
        color: '#374151'
      }
    }, "User"), /*#__PURE__*/React__default.default.createElement("th", {
      style: {
        textAlign: 'left',
        padding: '12px 24px',
        fontSize: '14px',
        fontWeight: '600',
        color: '#374151'
      }
    }, "Email"), /*#__PURE__*/React__default.default.createElement("th", {
      style: {
        textAlign: 'left',
        padding: '12px 24px',
        fontSize: '14px',
        fontWeight: '600',
        color: '#374151'
      }
    }, "Role"), /*#__PURE__*/React__default.default.createElement("th", {
      style: {
        textAlign: 'left',
        padding: '12px 24px',
        fontSize: '14px',
        fontWeight: '600',
        color: '#374151'
      }
    }, "Joined"))), /*#__PURE__*/React__default.default.createElement("tbody", null, data.users.recentUsers.slice(0, 10).map((user, index) => /*#__PURE__*/React__default.default.createElement("tr", {
      key: index,
      style: {
        borderBottom: '1px solid #f3f4f6'
      }
    }, /*#__PURE__*/React__default.default.createElement("td", {
      style: {
        padding: '16px 24px',
        fontSize: '14px',
        fontWeight: '600',
        color: '#1e293b'
      }
    }, user.first_name, " ", user.last_name), /*#__PURE__*/React__default.default.createElement("td", {
      style: {
        padding: '16px 24px',
        fontSize: '14px',
        color: '#6b7280'
      }
    }, user.email), /*#__PURE__*/React__default.default.createElement("td", {
      style: {
        padding: '16px 24px',
        fontSize: '14px'
      }
    }, /*#__PURE__*/React__default.default.createElement("span", {
      style: {
        padding: '4px 12px',
        borderRadius: '20px',
        fontSize: '12px',
        fontWeight: '600',
        backgroundColor: user.role_id === 2 ? '#dbeafe' : user.role_id === 3 ? '#f3e8ff' : '#f3f4f6',
        color: user.role_id === 2 ? '#1e40af' : user.role_id === 3 ? '#7c3aed' : '#374151'
      }
    }, user.role_id === 2 ? 'Client' : user.role_id === 3 ? 'Freelancer' : 'User')), /*#__PURE__*/React__default.default.createElement("td", {
      style: {
        padding: '16px 24px',
        fontSize: '14px',
        color: '#6b7280'
      }
    }, user.created_at ? formatDate(user.created_at) : '-'))))))), activeTab === 'projects' && /*#__PURE__*/React__default.default.createElement("div", null, /*#__PURE__*/React__default.default.createElement("div", {
      style: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
        gap: '16px',
        marginBottom: '32px'
      }
    }, /*#__PURE__*/React__default.default.createElement("div", {
      style: {
        padding: '20px',
        backgroundColor: 'white',
        borderRadius: '12px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        border: '1px solid #e5e7eb'
      }
    }, /*#__PURE__*/React__default.default.createElement("div", {
      style: {
        fontSize: '14px',
        color: '#6b7280',
        marginBottom: '8px',
        fontWeight: '500'
      }
    }, "Draft"), /*#__PURE__*/React__default.default.createElement("div", {
      style: {
        fontSize: '24px',
        fontWeight: '700',
        color: '#1e293b'
      }
    }, data?.overview?.draftProjects || 0)), /*#__PURE__*/React__default.default.createElement("div", {
      style: {
        padding: '20px',
        backgroundColor: 'white',
        borderRadius: '12px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        border: '1px solid #e5e7eb'
      }
    }, /*#__PURE__*/React__default.default.createElement("div", {
      style: {
        fontSize: '14px',
        color: '#3b82f6',
        marginBottom: '8px',
        fontWeight: '500'
      }
    }, "Active"), /*#__PURE__*/React__default.default.createElement("div", {
      style: {
        fontSize: '24px',
        fontWeight: '700',
        color: '#1e293b'
      }
    }, data?.overview?.activeProjects || 0)), /*#__PURE__*/React__default.default.createElement("div", {
      style: {
        padding: '20px',
        backgroundColor: 'white',
        borderRadius: '12px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        border: '1px solid #e5e7eb'
      }
    }, /*#__PURE__*/React__default.default.createElement("div", {
      style: {
        fontSize: '14px',
        color: '#10b981',
        marginBottom: '8px',
        fontWeight: '500'
      }
    }, "Completed"), /*#__PURE__*/React__default.default.createElement("div", {
      style: {
        fontSize: '24px',
        fontWeight: '700',
        color: '#1e293b'
      }
    }, data?.overview?.completedProjects || 0)), /*#__PURE__*/React__default.default.createElement("div", {
      style: {
        padding: '20px',
        backgroundColor: 'white',
        borderRadius: '12px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        border: '1px solid #e5e7eb'
      }
    }, /*#__PURE__*/React__default.default.createElement("div", {
      style: {
        fontSize: '14px',
        color: '#1e293b',
        marginBottom: '8px',
        fontWeight: '500'
      }
    }, "Total"), /*#__PURE__*/React__default.default.createElement("div", {
      style: {
        fontSize: '24px',
        fontWeight: '700',
        color: '#1e293b'
      }
    }, data?.overview?.totalProjects || 0))), data?.projectStats?.byStatus?.length > 0 && /*#__PURE__*/React__default.default.createElement("div", {
      style: {
        backgroundColor: 'white',
        borderRadius: '12px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        border: '1px solid #e5e7eb',
        padding: '24px'
      }
    }, /*#__PURE__*/React__default.default.createElement("h3", {
      style: {
        margin: '0 0 24px 0',
        fontSize: '18px',
        fontWeight: '600',
        color: '#1e293b'
      }
    }, "Project Status Distribution"), /*#__PURE__*/React__default.default.createElement("div", {
      style: {
        display: 'flex',
        flexWrap: 'wrap',
        gap: '16px'
      }
    }, data.projectStats.byStatus.map((status, index) => /*#__PURE__*/React__default.default.createElement("div", {
      key: index,
      style: {
        display: 'flex',
        alignItems: 'center',
        padding: '12px 16px',
        backgroundColor: '#f8fafc',
        borderRadius: '8px',
        border: '1px solid #e2e8f0'
      }
    }, /*#__PURE__*/React__default.default.createElement("div", {
      style: {
        width: '12px',
        height: '12px',
        backgroundColor: status.color,
        borderRadius: '3px',
        marginRight: '8px'
      }
    }), /*#__PURE__*/React__default.default.createElement("span", {
      style: {
        fontSize: '14px',
        fontWeight: '500',
        color: '#374151'
      }
    }, status.status, ": ", status.count)))))), activeTab === 'financial' && /*#__PURE__*/React__default.default.createElement("div", null, /*#__PURE__*/React__default.default.createElement("div", {
      style: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '16px',
        marginBottom: '32px'
      }
    }, /*#__PURE__*/React__default.default.createElement("div", {
      style: {
        padding: '20px',
        backgroundColor: 'white',
        borderRadius: '12px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        border: '1px solid #e5e7eb'
      }
    }, /*#__PURE__*/React__default.default.createElement("div", {
      style: {
        fontSize: '14px',
        color: '#6b7280',
        marginBottom: '8px',
        fontWeight: '500'
      }
    }, "Total Revenue"), /*#__PURE__*/React__default.default.createElement("div", {
      style: {
        fontSize: '24px',
        fontWeight: '700',
        color: '#1e293b'
      }
    }, formatCurrency(data?.overview?.totalRevenue || 0))), /*#__PURE__*/React__default.default.createElement("div", {
      style: {
        padding: '20px',
        backgroundColor: 'white',
        borderRadius: '12px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        border: '1px solid #e5e7eb'
      }
    }, /*#__PURE__*/React__default.default.createElement("div", {
      style: {
        fontSize: '14px',
        color: '#6b7280',
        marginBottom: '8px',
        fontWeight: '500'
      }
    }, "Transactions"), /*#__PURE__*/React__default.default.createElement("div", {
      style: {
        fontSize: '24px',
        fontWeight: '700',
        color: '#1e293b'
      }
    }, (data?.overview?.totalTransactions || 0).toLocaleString())), /*#__PURE__*/React__default.default.createElement("div", {
      style: {
        padding: '20px',
        backgroundColor: 'white',
        borderRadius: '12px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        border: '1px solid #e5e7eb'
      }
    }, /*#__PURE__*/React__default.default.createElement("div", {
      style: {
        fontSize: '14px',
        color: '#6b7280',
        marginBottom: '8px',
        fontWeight: '500'
      }
    }, "Monthly Revenue"), /*#__PURE__*/React__default.default.createElement("div", {
      style: {
        fontSize: '24px',
        fontWeight: '700',
        color: '#1e293b'
      }
    }, formatCurrency(data?.overview?.monthlyRevenue || 0))), /*#__PURE__*/React__default.default.createElement("div", {
      style: {
        padding: '20px',
        backgroundColor: 'white',
        borderRadius: '12px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        border: '1px solid #e5e7eb'
      }
    }, /*#__PURE__*/React__default.default.createElement("div", {
      style: {
        fontSize: '14px',
        color: '#6b7280',
        marginBottom: '8px',
        fontWeight: '500'
      }
    }, "Avg Transaction"), /*#__PURE__*/React__default.default.createElement("div", {
      style: {
        fontSize: '24px',
        fontWeight: '700',
        color: '#1e293b'
      }
    }, formatCurrency(data?.overview?.avgTransaction || 0)))), /*#__PURE__*/React__default.default.createElement("div", {
      style: {
        backgroundColor: 'white',
        borderRadius: '12px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        border: '1px solid #e5e7eb',
        padding: '24px'
      }
    }, /*#__PURE__*/React__default.default.createElement("h3", {
      style: {
        margin: '0 0 16px 0',
        fontSize: '18px',
        fontWeight: '600',
        color: '#1e293b'
      }
    }, "Financial Overview"), /*#__PURE__*/React__default.default.createElement("p", {
      style: {
        margin: '0',
        color: '#6b7280',
        fontSize: '14px'
      }
    }, "Financial analytics provide insights into revenue trends, payment patterns, and transaction data.", data?.overview?.totalRevenue > 0 ? ` Current total revenue stands at ${formatCurrency(data.overview.totalRevenue)} across ${(data.overview.totalTransactions || 0).toLocaleString()} transactions.` : ' No payment data available yet.')))));
  }

  const RelatedMaterials = ({
    record
  }) => {
    const materials = record.params?.course_materials || [];
    const courseId = record.params?.id;
    if (!materials.length) {
      return /*#__PURE__*/React__default.default.createElement("div", {
        style: {
          background: '#f8f9fa',
          padding: '16px',
          borderRadius: '8px',
          marginBottom: '16px'
        }
      }, /*#__PURE__*/React__default.default.createElement("h3", {
        style: {
          fontSize: '18px',
          fontWeight: '600',
          marginBottom: '8px'
        }
      }, "Course Materials"), /*#__PURE__*/React__default.default.createElement("p", {
        style: {
          color: '#6b7280',
          marginBottom: '16px'
        }
      }, "No materials uploaded yet."), /*#__PURE__*/React__default.default.createElement("a", {
        href: `/admin/resources/course_materials/actions/new?course_id=${courseId}`,
        style: {
          background: '#3b82f6',
          color: 'white',
          padding: '8px 16px',
          borderRadius: '6px',
          textDecoration: 'none',
          display: 'inline-block',
          fontSize: '14px'
        }
      }, "Add Material"));
    }
    return /*#__PURE__*/React__default.default.createElement("div", {
      style: {
        background: '#f8f9fa',
        padding: '16px',
        borderRadius: '8px',
        marginBottom: '16px'
      }
    }, /*#__PURE__*/React__default.default.createElement("div", {
      style: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '12px'
      }
    }, /*#__PURE__*/React__default.default.createElement("h3", {
      style: {
        fontSize: '18px',
        fontWeight: '600',
        margin: 0
      }
    }, "Course Materials (", materials.length, ")"), /*#__PURE__*/React__default.default.createElement("a", {
      href: `/admin/resources/course_materials/actions/new?course_id=${courseId}`,
      style: {
        background: '#3b82f6',
        color: 'white',
        padding: '6px 12px',
        borderRadius: '6px',
        textDecoration: 'none',
        fontSize: '12px'
      }
    }, "Add Material")), /*#__PURE__*/React__default.default.createElement("div", {
      style: {
        display: 'flex',
        flexDirection: 'column',
        gap: '8px'
      }
    }, materials.map(material => /*#__PURE__*/React__default.default.createElement("div", {
      key: material.id,
      style: {
        background: 'white',
        padding: '12px',
        borderRadius: '6px',
        border: '1px solid #e5e7eb'
      }
    }, /*#__PURE__*/React__default.default.createElement("p", {
      style: {
        fontWeight: '500',
        margin: '0 0 4px 0'
      }
    }, "Material #", material.id), /*#__PURE__*/React__default.default.createElement("a", {
      href: material.file_url,
      target: "_blank",
      rel: "noopener noreferrer",
      style: {
        color: '#3b82f6',
        fontSize: '14px',
        textDecoration: 'none'
      }
    }, material.file_url)))));
  };

  AdminJS.UserComponents = {};
  AdminJS.UserComponents.Dashboard = Dashboard;
  AdminJS.UserComponents.Analytics = Analytics;
  AdminJS.UserComponents.RelatedMaterials = RelatedMaterials;
  AdminJS.UserComponents.RelatedEnrollments = RelatedMaterials;

})(React, AdminJS);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYnVuZGxlLmpzIiwic291cmNlcyI6WyIuLi8uLi9mcm9udGVuZC9hZG1pbi1jb21wb25lbnRzL2Rhc2hib2FyZC5qc3giLCIuLi8uLi9mcm9udGVuZC9hZG1pbi1jb21wb25lbnRzL2FuYWx5dGljcy5qc3giLCIuLi8uLi9mcm9udGVuZC9hZG1pbi1jb21wb25lbnRzL2NvdXJzZS1jb21wb25lbnRzLmpzeCIsImVudHJ5LmpzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIEFkbWluL2NvbXBvbmVudHMvRGFzaGJvYXJkLmpzeFxyXG5pbXBvcnQgUmVhY3QsIHsgdXNlRWZmZWN0LCB1c2VTdGF0ZSwgdXNlQ2FsbGJhY2ssIHVzZVJlZiB9IGZyb20gXCJyZWFjdFwiO1xyXG5pbXBvcnQgeyBBcGlDbGllbnQsIHVzZVRyYW5zbGF0aW9uIH0gZnJvbSBcImFkbWluanNcIjtcclxuXHJcbmNvbnN0IGFwaSA9IG5ldyBBcGlDbGllbnQoKTtcclxuXHJcbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIERhc2hib2FyZCgpIHtcclxuICBjb25zdCB7IHRyYW5zbGF0ZU1lc3NhZ2UgfSA9IHVzZVRyYW5zbGF0aW9uKCk7XHJcbiAgY29uc3QgW2RhdGEsIHNldERhdGFdID0gdXNlU3RhdGUobnVsbCk7XHJcbiAgY29uc3QgW2xvYWRpbmcsIHNldExvYWRpbmddID0gdXNlU3RhdGUodHJ1ZSk7XHJcbiAgY29uc3QgW2Vycm9yLCBzZXRFcnJvcl0gPSB1c2VTdGF0ZShudWxsKTtcclxuICBjb25zdCBbYWRtaW5Mb2dzLCBzZXRBZG1pbkxvZ3NdID0gdXNlU3RhdGUoW10pO1xyXG4gIGNvbnN0IFt1c2VyTG9ncywgc2V0VXNlckxvZ3NdID0gdXNlU3RhdGUoW10pO1xyXG4gIGNvbnN0IGZldGNoaW5nUmVmID0gdXNlUmVmKGZhbHNlKTtcclxuICBjb25zdCBtb3VudGVkUmVmID0gdXNlUmVmKHRydWUpO1xyXG5cclxuICBjb25zdCBmZXRjaERhc2hib2FyZERhdGEgPSB1c2VDYWxsYmFjayhhc3luYyAoKSA9PiB7XHJcbiAgICBpZiAoZmV0Y2hpbmdSZWYuY3VycmVudCkgcmV0dXJuO1xyXG5cclxuICAgIGZldGNoaW5nUmVmLmN1cnJlbnQgPSB0cnVlO1xyXG5cclxuICAgIHRyeSB7XHJcbiAgICAgIGNvbnN0IHJlc3BvbnNlID0gYXdhaXQgYXBpLmdldERhc2hib2FyZCgpO1xyXG4gICAgICBpZiAoIW1vdW50ZWRSZWYuY3VycmVudCkgcmV0dXJuO1xyXG5cclxuICAgICAgaWYgKHJlc3BvbnNlPy5kYXRhKSB7XHJcbiAgICAgICAgc2V0RGF0YShyZXNwb25zZS5kYXRhKTtcclxuXHJcbiAgICAgICAgY29uc3QgYWxsTG9ncyA9IHJlc3BvbnNlLmRhdGEucmVjZW50TG9ncyB8fCBbXTtcclxuICAgICAgICBjb25zdCBhZG1pbnMgPSBhbGxMb2dzLmZpbHRlcihcclxuICAgICAgICAgIChsb2cpID0+IGxvZy5yb2xlX2lkID09PSAxIHx8IGxvZy5maXJzdF9uYW1lID09PSBcIlN5c3RlbVwiXHJcbiAgICAgICAgKS5zbGljZSgwLCA1KTtcclxuICAgICAgICBjb25zdCB1c2VycyA9IGFsbExvZ3MuZmlsdGVyKFxyXG4gICAgICAgICAgKGxvZykgPT4gbG9nLnJvbGVfaWQgIT09IDEgJiYgbG9nLmZpcnN0X25hbWUgIT09IFwiU3lzdGVtXCJcclxuICAgICAgICApLnNsaWNlKDAsIDUpO1xyXG5cclxuICAgICAgICBzZXRBZG1pbkxvZ3MoYWRtaW5zKTtcclxuICAgICAgICBzZXRVc2VyTG9ncyh1c2Vycyk7XHJcbiAgICAgICAgc2V0RXJyb3IobnVsbCk7XHJcbiAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiTm8gZGF0YSByZWNlaXZlZCBmcm9tIEFQSVwiKTtcclxuICAgICAgfVxyXG4gICAgfSBjYXRjaCAoZXJyKSB7XHJcbiAgICAgIGlmICghbW91bnRlZFJlZi5jdXJyZW50KSByZXR1cm47XHJcbiAgICAgIHNldEVycm9yKGVycj8ubWVzc2FnZSB8fCBcIkZhaWxlZCB0byBsb2FkIGRhc2hib2FyZCBkYXRhXCIpO1xyXG4gICAgfSBmaW5hbGx5IHtcclxuICAgICAgaWYgKG1vdW50ZWRSZWYuY3VycmVudCkgc2V0TG9hZGluZyhmYWxzZSk7XHJcbiAgICAgIGZldGNoaW5nUmVmLmN1cnJlbnQgPSBmYWxzZTtcclxuICAgIH1cclxuICB9LCBbXSk7XHJcblxyXG4gIHVzZUVmZmVjdCgoKSA9PiB7XHJcbiAgICBtb3VudGVkUmVmLmN1cnJlbnQgPSB0cnVlO1xyXG4gICAgZmV0Y2hEYXNoYm9hcmREYXRhKCk7XHJcbiAgICByZXR1cm4gKCkgPT4ge1xyXG4gICAgICBtb3VudGVkUmVmLmN1cnJlbnQgPSBmYWxzZTtcclxuICAgIH07XHJcbiAgfSwgW10pO1xyXG5cclxuICAvLyBSZWFsLXRpbWUgZGF0YSB1cGRhdGVzIGV2ZXJ5IDEwIHNlY29uZHNcclxuICB1c2VFZmZlY3QoKCkgPT4ge1xyXG4gICAgY29uc3QgcmVmcmVzaEludGVydmFsID0gc2V0SW50ZXJ2YWwoKCkgPT4ge1xyXG4gICAgICBpZiAoIWZldGNoaW5nUmVmLmN1cnJlbnQgJiYgbW91bnRlZFJlZi5jdXJyZW50KSB7XHJcbiAgICAgICAgZmV0Y2hEYXNoYm9hcmREYXRhKCk7XHJcbiAgICAgIH1cclxuICAgIH0sIDEwMDAwKTtcclxuICAgIHJldHVybiAoKSA9PiBjbGVhckludGVydmFsKHJlZnJlc2hJbnRlcnZhbCk7XHJcbiAgfSwgW2ZldGNoRGFzaGJvYXJkRGF0YV0pO1xyXG5cclxuICAvLyBSZWFsLXRpbWUgbG9nIHVwZGF0ZXMgZXZlcnkgNSBzZWNvbmRzXHJcbiAgdXNlRWZmZWN0KCgpID0+IHtcclxuICAgIGNvbnN0IGxvZ0ludGVydmFsID0gc2V0SW50ZXJ2YWwoYXN5bmMgKCkgPT4ge1xyXG4gICAgICBpZiAoIW1vdW50ZWRSZWYuY3VycmVudCB8fCBmZXRjaGluZ1JlZi5jdXJyZW50KSByZXR1cm47XHJcbiAgICAgIHRyeSB7XHJcbiAgICAgICAgY29uc3QgcmVzcG9uc2UgPSBhd2FpdCBmZXRjaChcIi9hcGkvYWRtaW4vZGFzaGJvYXJkL2xvZ3NcIik7XHJcbiAgICAgICAgaWYgKHJlc3BvbnNlLm9rKSB7XHJcbiAgICAgICAgICBjb25zdCBuZXdMb2dzID0gYXdhaXQgcmVzcG9uc2UuanNvbigpO1xyXG4gICAgICAgICAgaWYgKG1vdW50ZWRSZWYuY3VycmVudCAmJiBuZXdMb2dzPy5yZWNlbnRMb2dzKSB7XHJcbiAgICAgICAgICAgIGNvbnN0IGFsbExvZ3MgPSBuZXdMb2dzLnJlY2VudExvZ3M7XHJcbiAgICAgICAgICAgIGNvbnN0IGFkbWlucyA9IGFsbExvZ3MuZmlsdGVyKFxyXG4gICAgICAgICAgICAgIChsb2cpID0+IGxvZy5yb2xlX2lkID09PSAxIHx8IGxvZy5maXJzdF9uYW1lID09PSBcIlN5c3RlbVwiXHJcbiAgICAgICAgICAgICkuc2xpY2UoMCwgNSk7XHJcbiAgICAgICAgICAgIGNvbnN0IHVzZXJzID0gYWxsTG9ncy5maWx0ZXIoXHJcbiAgICAgICAgICAgICAgKGxvZykgPT4gbG9nLnJvbGVfaWQgIT09IDEgJiYgbG9nLmZpcnN0X25hbWUgIT09IFwiU3lzdGVtXCJcclxuICAgICAgICAgICAgKS5zbGljZSgwLCA1KTtcclxuICAgICAgICAgICAgc2V0QWRtaW5Mb2dzKGFkbWlucyk7XHJcbiAgICAgICAgICAgIHNldFVzZXJMb2dzKHVzZXJzKTtcclxuICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgIH0gY2F0Y2gge31cclxuICAgIH0sIDUwMDApO1xyXG4gICAgcmV0dXJuICgpID0+IGNsZWFySW50ZXJ2YWwobG9nSW50ZXJ2YWwpO1xyXG4gIH0sIFtdKTtcclxuXHJcbiAgY29uc3QgaGFuZGxlUmVmcmVzaCA9IHVzZUNhbGxiYWNrKCgpID0+IHtcclxuICAgIGZldGNoRGFzaGJvYXJkRGF0YSgpO1xyXG4gIH0sIFtmZXRjaERhc2hib2FyZERhdGFdKTtcclxuXHJcbiAgaWYgKGxvYWRpbmcgJiYgIWRhdGEpIHtcclxuICAgIHJldHVybiAoXHJcbiAgICAgIDxkaXYgc3R5bGU9e3tcclxuICAgICAgICBkaXNwbGF5OiAnZmxleCcsXHJcbiAgICAgICAganVzdGlmeUNvbnRlbnQ6ICdjZW50ZXInLFxyXG4gICAgICAgIGFsaWduSXRlbXM6ICdjZW50ZXInLFxyXG4gICAgICAgIGhlaWdodDogJzQwMHB4JyxcclxuICAgICAgICBmb250U2l6ZTogJzE2cHgnLFxyXG4gICAgICAgIGNvbG9yOiAnIzZiNzI4MCdcclxuICAgICAgfX0+XHJcbiAgICAgICAgTG9hZGluZyBEYXNoYm9hcmQuLi5cclxuICAgICAgPC9kaXY+XHJcbiAgICApO1xyXG4gIH1cclxuXHJcbiAgY29uc3QgbWV0cmljcyA9IGRhdGE/Lm1ldHJpY3MgfHwge307XHJcblxyXG4gIGNvbnN0IHN0YXRzQ2FyZHMgPSBbXHJcbiAgICB7IHRpdGxlOiBcIlRvdGFsIEFkbWluc1wiLCB2YWx1ZTogbWV0cmljcy5hZG1pbnNDb3VudCB8fCAwLCBsaW5rOiBcIi9hZG1pbi9yZXNvdXJjZXMvYWRtaW5zXCIsIGNvbG9yOiBcIiMzYjgyZjZcIiB9LFxyXG4gICAgeyB0aXRsZTogXCJDbGllbnRzXCIsIHZhbHVlOiBtZXRyaWNzLmNsaWVudHNDb3VudCB8fCAwLCBsaW5rOiBcIi9hZG1pbi9yZXNvdXJjZXMvY2xpZW50c1wiLCBjb2xvcjogXCIjMTBiOTgxXCIgfSxcclxuICAgIHsgdGl0bGU6IFwiRnJlZWxhbmNlcnNcIiwgdmFsdWU6IG1ldHJpY3MuZnJlZWxhbmNlcnNDb3VudCB8fCAwLCBsaW5rOiBcIi9hZG1pbi9yZXNvdXJjZXMvZnJlZWxhbmNlcnNcIiwgY29sb3I6IFwiI2Y1OWUwYlwiIH0sXHJcbiAgICB7IHRpdGxlOiBcIkFjdGl2ZSBQcm9qZWN0c1wiLCB2YWx1ZTogbWV0cmljcy5wcm9qZWN0c0NvdW50IHx8IDAsIGxpbms6IFwiL2FkbWluL3Jlc291cmNlcy9wcm9qZWN0c1wiLCBjb2xvcjogXCIjZWY0NDQ0XCIgfSxcclxuICAgIHsgdGl0bGU6IFwiUGVuZGluZyBBcHBvaW50bWVudHNcIiwgdmFsdWU6IG1ldHJpY3MucGVuZGluZ0FwcG9pbnRtZW50cyB8fCAwLCBsaW5rOiBcIi9hZG1pbi9yZXNvdXJjZXMvYXBwb2ludG1lbnRzXCIsIGNvbG9yOiBcIiM4YjVjZjZcIiB9LFxyXG4gICAgeyB0aXRsZTogXCJDb3Vyc2VzXCIsIHZhbHVlOiBtZXRyaWNzLmNvdXJzZXNDb3VudCB8fCAwLCBsaW5rOiBcIi9hZG1pbi9yZXNvdXJjZXMvY291cnNlc1wiLCBjb2xvcjogXCIjMDZiNmQ0XCIgfSxcclxuICAgIHsgdGl0bGU6IFwiUGxhbnNcIiwgdmFsdWU6IG1ldHJpY3MucGxhbnNDb3VudCB8fCAwLCBsaW5rOiBcIi9hZG1pbi9yZXNvdXJjZXMvcGxhbnNcIiwgY29sb3I6IFwiIzg0Y2MxNlwiIH0sXHJcbiAgICB7IHRpdGxlOiBcIlRvdGFsIFJldmVudWVcIiwgdmFsdWU6IGAkJHsobWV0cmljcy50b3RhbFJldmVudWUgfHwgMCkudG9Mb2NhbGVTdHJpbmcoKX1gLCBsaW5rOiBcIi9hZG1pbi9yZXNvdXJjZXMvcGF5bWVudHNcIiwgY29sb3I6IFwiIzIyYzU1ZVwiIH0sXHJcbiAgICB7IHRpdGxlOiBcIkFuYWx5dGljc1wiLCB2YWx1ZTogXCJWaWV3IFJlcG9ydHNcIiwgbGluazogXCIvYWRtaW4vcGFnZXMvYW5hbHl0aWNzXCIsIGNvbG9yOiBcIiM2MzY2ZjFcIiB9LFxyXG4gIF07XHJcblxyXG4gIGNvbnN0IGhhbmRsZUNhcmRDbGljayA9IChsaW5rKSA9PiB7XHJcbiAgICB3aW5kb3cubG9jYXRpb24uaHJlZiA9IGxpbms7XHJcbiAgfTtcclxuXHJcbiAgY29uc3QgZ2V0VGltZUFnbyA9IChkYXRlU3RyaW5nKSA9PiB7XHJcbiAgICBpZiAoIWRhdGVTdHJpbmcpIHJldHVybiBcIlwiO1xyXG4gICAgdHJ5IHtcclxuICAgICAgY29uc3Qgbm93ID0gbmV3IERhdGUoKTtcclxuICAgICAgY29uc3QgbG9nVGltZSA9IG5ldyBEYXRlKGRhdGVTdHJpbmcpO1xyXG4gICAgICBjb25zdCBkaWZmTXMgPSBub3cgLSBsb2dUaW1lO1xyXG4gICAgICBjb25zdCBkaWZmU2VjcyA9IE1hdGguZmxvb3IoZGlmZk1zIC8gMTAwMCk7XHJcbiAgICAgIGlmIChkaWZmU2VjcyA8IDYwKSByZXR1cm4gYCR7ZGlmZlNlY3N9cyBhZ29gO1xyXG4gICAgICBjb25zdCBkaWZmTWlucyA9IE1hdGguZmxvb3IoZGlmZlNlY3MgLyA2MCk7XHJcbiAgICAgIGlmIChkaWZmTWlucyA8IDYwKSByZXR1cm4gYCR7ZGlmZk1pbnN9bSBhZ29gO1xyXG4gICAgICBjb25zdCBkaWZmSG91cnMgPSBNYXRoLmZsb29yKGRpZmZNaW5zIC8gNjApO1xyXG4gICAgICBpZiAoZGlmZkhvdXJzIDwgMjQpIHJldHVybiBgJHtkaWZmSG91cnN9aCBhZ29gO1xyXG4gICAgICByZXR1cm4gbG9nVGltZS50b0xvY2FsZURhdGVTdHJpbmcoKTtcclxuICAgIH0gY2F0Y2gge1xyXG4gICAgICByZXR1cm4gXCJcIjtcclxuICAgIH1cclxuICB9O1xyXG5cclxuICBjb25zdCBjb250YWluZXJTdHlsZSA9IHtcclxuICAgIGJhY2tncm91bmRDb2xvcjogJyNmZmZmZmYnLFxyXG4gICAgbWluSGVpZ2h0OiAnMTAwdmgnLFxyXG4gICAgcGFkZGluZzogJzIwcHgnLFxyXG4gICAgZm9udEZhbWlseTogJy1hcHBsZS1zeXN0ZW0sIEJsaW5rTWFjU3lzdGVtRm9udCwgXCJTZWdvZSBVSVwiLCBSb2JvdG8sIFwiSGVsdmV0aWNhIE5ldWVcIiwgQXJpYWwsIHNhbnMtc2VyaWYnXHJcbiAgfTtcclxuXHJcbiAgY29uc3QgaGVhZGVyU3R5bGUgPSB7XHJcbiAgICBkaXNwbGF5OiAnZmxleCcsXHJcbiAgICBqdXN0aWZ5Q29udGVudDogJ3NwYWNlLWJldHdlZW4nLFxyXG4gICAgYWxpZ25JdGVtczogJ2NlbnRlcicsXHJcbiAgICBtYXJnaW5Cb3R0b206ICczMHB4JyxcclxuICAgIHBhZGRpbmdCb3R0b206ICcyMHB4JyxcclxuICAgIGJvcmRlckJvdHRvbTogJzFweCBzb2xpZCAjZTVlN2ViJ1xyXG4gIH07XHJcblxyXG4gIGNvbnN0IGRhc2hib2FyZFRpdGxlU3R5bGUgPSB7XHJcbiAgICBmb250U2l6ZTogJzE2cHgnLFxyXG4gICAgZm9udFdlaWdodDogJzUwMCcsXHJcbiAgICBjb2xvcjogJyMwMDAwMDAnLFxyXG4gICAgbWFyZ2luOiAnMCdcclxuICB9O1xyXG5cclxuICBjb25zdCByZWZyZXNoQnV0dG9uU3R5bGUgPSB7XHJcbiAgICBiYWNrZ3JvdW5kQ29sb3I6ICcjZjhmOWZhJyxcclxuICAgIGJvcmRlcjogJzFweCBzb2xpZCAjZTllY2VmJyxcclxuICAgIGJvcmRlclJhZGl1czogJzZweCcsXHJcbiAgICBwYWRkaW5nOiAnOHB4JyxcclxuICAgIGN1cnNvcjogJ3BvaW50ZXInLFxyXG4gICAgdHJhbnNpdGlvbjogJ2FsbCAwLjJzJyxcclxuICAgIGRpc3BsYXk6ICdmbGV4JyxcclxuICAgIGFsaWduSXRlbXM6ICdjZW50ZXInLFxyXG4gICAganVzdGlmeUNvbnRlbnQ6ICdjZW50ZXInLFxyXG4gICAgY29sb3I6ICcjMDAwMDAwJ1xyXG4gIH07XHJcblxyXG4gIGNvbnN0IG1ldHJpY3NHcmlkU3R5bGUgPSB7XHJcbiAgICBkaXNwbGF5OiAnZ3JpZCcsXHJcbiAgICBncmlkVGVtcGxhdGVDb2x1bW5zOiAncmVwZWF0KGF1dG8tZml0LCBtaW5tYXgoMjgwcHgsIDFmcikpJyxcclxuICAgIGdhcDogJzI0cHgnLFxyXG4gICAgbWFyZ2luQm90dG9tOiAnNDBweCdcclxuICB9O1xyXG5cclxuICBjb25zdCBjYXJkU3R5bGUgPSB7XHJcbiAgICBiYWNrZ3JvdW5kQ29sb3I6ICcjZmZmZmZmJyxcclxuICAgIHBhZGRpbmc6ICcyNHB4JyxcclxuICAgIGJvcmRlcjogJzFweCBzb2xpZCAjZTllY2VmJyxcclxuICAgIGJvcmRlclJhZGl1czogJzhweCcsXHJcbiAgICBjdXJzb3I6ICdwb2ludGVyJyxcclxuICAgIHRyYW5zaXRpb246ICdhbGwgMC4ycyBlYXNlJyxcclxuICAgIGJveFNoYWRvdzogJzAgMXB4IDNweCByZ2JhKDAsIDAsIDAsIDAuMSknXHJcbiAgfTtcclxuXHJcbiAgY29uc3QgY2FyZFRpdGxlU3R5bGUgPSB7XHJcbiAgICBmb250U2l6ZTogJzEycHgnLFxyXG4gICAgZm9udFdlaWdodDogJzUwMCcsXHJcbiAgICBjb2xvcjogJyM2YjcyODAnLFxyXG4gICAgbWFyZ2luOiAnMCAwIDhweCAwJyxcclxuICAgIHRleHRUcmFuc2Zvcm06ICd1cHBlcmNhc2UnLFxyXG4gICAgbGV0dGVyU3BhY2luZzogJzAuOHB4J1xyXG4gIH07XHJcblxyXG4gIGNvbnN0IGNhcmRWYWx1ZVN0eWxlID0gKCkgPT4gKHtcclxuICAgIGZvbnRTaXplOiAnMjhweCcsXHJcbiAgICBmb250V2VpZ2h0OiAnNzAwJyxcclxuICAgIGNvbG9yOiAnIzAwMDAwMCcsXHJcbiAgICBtYXJnaW46ICcwJ1xyXG4gIH0pO1xyXG5cclxuICBjb25zdCBsb2dzQ29udGFpbmVyU3R5bGUgPSB7XHJcbiAgICBkaXNwbGF5OiAnZ3JpZCcsXHJcbiAgICBncmlkVGVtcGxhdGVDb2x1bW5zOiAnMWZyIDFmcicsXHJcbiAgICBnYXA6ICcyNHB4J1xyXG4gIH07XHJcblxyXG4gIGNvbnN0IGxvZ1NlY3Rpb25TdHlsZSA9IHtcclxuICAgIGJhY2tncm91bmRDb2xvcjogJyNmZmZmZmYnLFxyXG4gICAgYm9yZGVyOiAnMXB4IHNvbGlkICNlOWVjZWYnLFxyXG4gICAgYm9yZGVyUmFkaXVzOiAnOHB4JyxcclxuICAgIG92ZXJmbG93OiAnaGlkZGVuJyxcclxuICAgIGJveFNoYWRvdzogJzAgMXB4IDNweCByZ2JhKDAsIDAsIDAsIDAuMSknXHJcbiAgfTtcclxuXHJcbiAgY29uc3QgbG9nSGVhZGVyU3R5bGUgPSB7XHJcbiAgICBmb250U2l6ZTogJzE2cHgnLFxyXG4gICAgZm9udFdlaWdodDogJzYwMCcsXHJcbiAgICBjb2xvcjogJyMwMDAwMDAnLFxyXG4gICAgbWFyZ2luOiAnMCcsXHJcbiAgICBwYWRkaW5nOiAnMTZweCAyMHB4JyxcclxuICAgIGJhY2tncm91bmRDb2xvcjogJyNmOGY5ZmEnLFxyXG4gICAgYm9yZGVyQm90dG9tOiAnMXB4IHNvbGlkICNlOWVjZWYnXHJcbiAgfTtcclxuXHJcbiAgY29uc3QgbG9nSXRlbVN0eWxlID0ge1xyXG4gICAgcGFkZGluZzogJzE2cHggMjBweCcsXHJcbiAgICBib3JkZXJCb3R0b206ICcxcHggc29saWQgI2YxZjNmNCdcclxuICB9O1xyXG5cclxuICBjb25zdCBsb2dJdGVtTmFtZVN0eWxlID0ge1xyXG4gICAgZm9udFdlaWdodDogJzYwMCcsXHJcbiAgICBjb2xvcjogJyMwMDAwMDAnLFxyXG4gICAgZm9udFNpemU6ICcxNHB4JyxcclxuICAgIG1hcmdpbkJvdHRvbTogJzRweCdcclxuICB9O1xyXG5cclxuICBjb25zdCBsb2dJdGVtQWN0aW9uU3R5bGUgPSB7XHJcbiAgICBjb2xvcjogJyMwMDAwMDAnLFxyXG4gICAgZm9udFNpemU6ICcxM3B4JyxcclxuICAgIG1hcmdpbkJvdHRvbTogJzRweCcsXHJcbiAgICBvcGFjaXR5OiAnMC44J1xyXG4gIH07XHJcblxyXG4gIGNvbnN0IGxvZ0l0ZW1UaW1lU3R5bGUgPSB7XHJcbiAgICBmb250U2l6ZTogJzEycHgnLFxyXG4gICAgY29sb3I6ICcjMDAwMDAwJyxcclxuICAgIG9wYWNpdHk6ICcwLjYnXHJcbiAgfTtcclxuXHJcbiAgY29uc3QgZW1wdHlTdGF0ZVN0eWxlID0ge1xyXG4gICAgdGV4dEFsaWduOiAnY2VudGVyJyxcclxuICAgIGNvbG9yOiAnIzAwMDAwMCcsXHJcbiAgICBvcGFjaXR5OiAnMC42JyxcclxuICAgIGZvbnRTdHlsZTogJ2l0YWxpYycsXHJcbiAgICBwYWRkaW5nOiAnMzBweCAyMHB4J1xyXG4gIH07XHJcblxyXG4gIHJldHVybiAoXHJcbiAgICA8ZGl2IHN0eWxlPXtjb250YWluZXJTdHlsZX0+XHJcbiAgICAgIDxkaXYgc3R5bGU9e2hlYWRlclN0eWxlfT5cclxuIDxoMSBzdHlsZT17eyBmb250U2l6ZTogXCIxLjVyZW1cIiwgZm9udFdlaWdodDogXCJib2xkXCIsIG1hcmdpbjogMCwgY29sb3I6IFwiIzFlMjkzYlwiIH19PlxyXG4gICAgICBBZG1pbiBEYXNoYm9hcmRcclxuICAgIDwvaDE+ICAgICAgICA8YnV0dG9uIFxyXG4gICAgICAgICAgb25DbGljaz17aGFuZGxlUmVmcmVzaH0gXHJcbiAgICAgICAgICBzdHlsZT17cmVmcmVzaEJ1dHRvblN0eWxlfVxyXG4gICAgICAgICAgb25Nb3VzZU92ZXI9eyhlKSA9PiBlLnRhcmdldC5zdHlsZS5iYWNrZ3JvdW5kQ29sb3IgPSAnI2U5ZWNlZid9XHJcbiAgICAgICAgICBvbk1vdXNlT3V0PXsoZSkgPT4gZS50YXJnZXQuc3R5bGUuYmFja2dyb3VuZENvbG9yID0gJyNmOGY5ZmEnfVxyXG4gICAgICAgICAgdGl0bGU9XCJSZWZyZXNoIERhc2hib2FyZFwiXHJcbiAgICAgICAgPlxyXG4gICAgICAgICAgPHN2ZyB3aWR0aD1cIjE2XCIgaGVpZ2h0PVwiMTZcIiB2aWV3Qm94PVwiMCAwIDI0IDI0XCIgZmlsbD1cIm5vbmVcIiBzdHJva2U9XCJjdXJyZW50Q29sb3JcIiBzdHJva2VXaWR0aD1cIjJcIj5cclxuICAgICAgICAgICAgPHBhdGggZD1cIk0zIDEyYTkgOSAwIDAgMSA5LTkgOS43NSA5Ljc1IDAgMCAxIDYuNzQgMi43NEwyMSA4XCIvPlxyXG4gICAgICAgICAgICA8cGF0aCBkPVwiTTIxIDN2NWgtNVwiLz5cclxuICAgICAgICAgICAgPHBhdGggZD1cIk0yMSAxMmE5IDkgMCAwIDEtOSA5IDkuNzUgOS43NSAwIDAgMS02Ljc0LTIuNzRMMyAxNlwiLz5cclxuICAgICAgICAgICAgPHBhdGggZD1cIk0zIDIxdi01aDVcIi8+XHJcbiAgICAgICAgICA8L3N2Zz5cclxuICAgICAgICA8L2J1dHRvbj5cclxuICAgICAgPC9kaXY+XHJcblxyXG4gICAgICA8ZGl2IHN0eWxlPXttZXRyaWNzR3JpZFN0eWxlfT5cclxuICAgICAgICB7c3RhdHNDYXJkcy5tYXAoKGNhcmQsIGluZGV4KSA9PiAoXHJcbiAgICAgICAgICA8ZGl2IFxyXG4gICAgICAgICAgICBrZXk9e2luZGV4fSBcclxuICAgICAgICAgICAgb25DbGljaz17KCkgPT4gaGFuZGxlQ2FyZENsaWNrKGNhcmQubGluayl9IFxyXG4gICAgICAgICAgICBzdHlsZT17Y2FyZFN0eWxlfVxyXG4gICAgICAgICAgICBvbk1vdXNlT3Zlcj17KGUpID0+IHtcclxuICAgICAgICAgICAgICBlLmN1cnJlbnRUYXJnZXQuc3R5bGUuYm9yZGVyQ29sb3IgPSBjYXJkLmNvbG9yO1xyXG4gICAgICAgICAgICAgIGUuY3VycmVudFRhcmdldC5zdHlsZS5ib3hTaGFkb3cgPSBgMCA0cHggMTJweCAke2NhcmQuY29sb3J9MjBgO1xyXG4gICAgICAgICAgICB9fVxyXG4gICAgICAgICAgICBvbk1vdXNlT3V0PXsoZSkgPT4ge1xyXG4gICAgICAgICAgICAgIGUuY3VycmVudFRhcmdldC5zdHlsZS5ib3JkZXJDb2xvciA9ICcjZTVlN2ViJztcclxuICAgICAgICAgICAgICBlLmN1cnJlbnRUYXJnZXQuc3R5bGUuYm94U2hhZG93ID0gJ25vbmUnO1xyXG4gICAgICAgICAgICB9fVxyXG4gICAgICAgICAgPlxyXG4gICAgICAgICAgICA8aDMgc3R5bGU9e2NhcmRUaXRsZVN0eWxlfT57Y2FyZC50aXRsZX08L2gzPlxyXG4gICAgICAgICAgICA8cCBzdHlsZT17Y2FyZFZhbHVlU3R5bGUoKX0+e2NhcmQudmFsdWV9PC9wPlxyXG4gICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgKSl9XHJcbiAgICAgIDwvZGl2PlxyXG5cclxuICAgICAgPGRpdiBzdHlsZT17bG9nc0NvbnRhaW5lclN0eWxlfT5cclxuICAgICAgICA8ZGl2IHN0eWxlPXtsb2dTZWN0aW9uU3R5bGV9PlxyXG4gICAgICAgICAgPGgzIHN0eWxlPXtsb2dIZWFkZXJTdHlsZX0+QWRtaW4gQWN0aXZpdHkgKHthZG1pbkxvZ3MubGVuZ3RofSk8L2gzPlxyXG4gICAgICAgICAge2FkbWluTG9ncy5sZW5ndGggPT09IDAgPyAoXHJcbiAgICAgICAgICAgIDxkaXYgc3R5bGU9e2VtcHR5U3RhdGVTdHlsZX0+Tm8gcmVjZW50IGFkbWluIGFjdGl2aXR5PC9kaXY+XHJcbiAgICAgICAgICApIDogKFxyXG4gICAgICAgICAgICBhZG1pbkxvZ3MubWFwKChsb2csIGkpID0+IChcclxuICAgICAgICAgICAgICA8ZGl2IGtleT17bG9nLmlkIHx8IGl9IHN0eWxlPXt7XHJcbiAgICAgICAgICAgICAgICAuLi5sb2dJdGVtU3R5bGUsXHJcbiAgICAgICAgICAgICAgICBib3JkZXJCb3R0b206IGkgPT09IGFkbWluTG9ncy5sZW5ndGggLSAxID8gJ25vbmUnIDogJzFweCBzb2xpZCAjZjNmNGY2J1xyXG4gICAgICAgICAgICAgIH19PlxyXG4gICAgICAgICAgICAgICAgPGRpdiBzdHlsZT17bG9nSXRlbU5hbWVTdHlsZX0+XHJcbiAgICAgICAgICAgICAgICAgIHtsb2cuZmlyc3RfbmFtZX0ge2xvZy5sYXN0X25hbWV9XHJcbiAgICAgICAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgICAgICAgIDxkaXYgc3R5bGU9e2xvZ0l0ZW1BY3Rpb25TdHlsZX0+e2xvZy5hY3Rpb259PC9kaXY+XHJcbiAgICAgICAgICAgICAgICA8ZGl2IHN0eWxlPXtsb2dJdGVtVGltZVN0eWxlfT5cclxuICAgICAgICAgICAgICAgICAge2dldFRpbWVBZ28obG9nLmNyZWF0ZWRfYXQpfVxyXG4gICAgICAgICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgICAgICkpXHJcbiAgICAgICAgICApfVxyXG4gICAgICAgIDwvZGl2PlxyXG5cclxuICAgICAgICA8ZGl2IHN0eWxlPXtsb2dTZWN0aW9uU3R5bGV9PlxyXG4gICAgICAgICAgPGgzIHN0eWxlPXtsb2dIZWFkZXJTdHlsZX0+VXNlciBBY3Rpdml0eSAoe3VzZXJMb2dzLmxlbmd0aH0pPC9oMz5cclxuICAgICAgICAgIHt1c2VyTG9ncy5sZW5ndGggPT09IDAgPyAoXHJcbiAgICAgICAgICAgIDxkaXYgc3R5bGU9e2VtcHR5U3RhdGVTdHlsZX0+Tm8gcmVjZW50IHVzZXIgYWN0aXZpdHk8L2Rpdj5cclxuICAgICAgICAgICkgOiAoXHJcbiAgICAgICAgICAgIHVzZXJMb2dzLm1hcCgobG9nLCBpKSA9PiAoXHJcbiAgICAgICAgICAgICAgPGRpdiBrZXk9e2xvZy5pZCB8fCBpfSBzdHlsZT17e1xyXG4gICAgICAgICAgICAgICAgLi4ubG9nSXRlbVN0eWxlLFxyXG4gICAgICAgICAgICAgICAgYm9yZGVyQm90dG9tOiBpID09PSB1c2VyTG9ncy5sZW5ndGggLSAxID8gJ25vbmUnIDogJzFweCBzb2xpZCAjZjNmNGY2J1xyXG4gICAgICAgICAgICAgIH19PlxyXG4gICAgICAgICAgICAgICAgPGRpdiBzdHlsZT17bG9nSXRlbU5hbWVTdHlsZX0+XHJcbiAgICAgICAgICAgICAgICAgIHtsb2cuZmlyc3RfbmFtZX0ge2xvZy5sYXN0X25hbWV9XHJcbiAgICAgICAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgICAgICAgIDxkaXYgc3R5bGU9e2xvZ0l0ZW1BY3Rpb25TdHlsZX0+e2xvZy5hY3Rpb259PC9kaXY+XHJcbiAgICAgICAgICAgICAgICA8ZGl2IHN0eWxlPXtsb2dJdGVtVGltZVN0eWxlfT5cclxuICAgICAgICAgICAgICAgICAge2dldFRpbWVBZ28obG9nLmNyZWF0ZWRfYXQpfVxyXG4gICAgICAgICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgICAgICkpXHJcbiAgICAgICAgICApfVxyXG4gICAgICAgIDwvZGl2PlxyXG4gICAgICA8L2Rpdj5cclxuICAgIDwvZGl2PlxyXG4gICk7XHJcbn0iLCIvLyBBZG1pbi9jb21wb25lbnRzL0FuYWx5dGljcy5qc3hcclxuaW1wb3J0IFJlYWN0LCB7IHVzZVN0YXRlLCB1c2VFZmZlY3QgfSBmcm9tIFwicmVhY3RcIjtcclxuaW1wb3J0IHsgQXBpQ2xpZW50IH0gZnJvbSBcImFkbWluanNcIjtcclxuXHJcbmNvbnN0IGFwaSA9IG5ldyBBcGlDbGllbnQoKTtcclxuXHJcbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIEFuYWx5dGljcygpIHtcclxuICBjb25zdCBbYWN0aXZlVGFiLCBzZXRBY3RpdmVUYWJdID0gdXNlU3RhdGUoJ292ZXJ2aWV3Jyk7XHJcbiAgY29uc3QgW2RhdGVSYW5nZSwgc2V0RGF0ZVJhbmdlXSA9IHVzZVN0YXRlKCczMGQnKTtcclxuICBjb25zdCBbbG9hZGluZywgc2V0TG9hZGluZ10gPSB1c2VTdGF0ZShmYWxzZSk7XHJcbiAgY29uc3QgW2Vycm9yLCBzZXRFcnJvcl0gPSB1c2VTdGF0ZShudWxsKTtcclxuICBjb25zdCBbZGF0YSwgc2V0RGF0YV0gPSB1c2VTdGF0ZShudWxsKTtcclxuXHJcbiAgY29uc3QgZmV0Y2hBbmFseXRpY3NEYXRhID0gYXN5bmMgKCkgPT4ge1xyXG4gICAgc2V0TG9hZGluZyh0cnVlKTtcclxuICAgIHNldEVycm9yKG51bGwpO1xyXG4gICAgXHJcbiAgICB0cnkge1xyXG4gICAgICBjb25zdCByZXNwb25zZSA9IGF3YWl0IGZldGNoKGAvYXBpL2FkbWluL2FuYWx5dGljcz9yYW5nZT0ke2RhdGVSYW5nZX1gKTtcclxuICAgICAgXHJcbiAgICAgIGlmICghcmVzcG9uc2Uub2spIHtcclxuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ0ZhaWxlZCB0byBmZXRjaCBhbmFseXRpY3MgZGF0YScpO1xyXG4gICAgICB9XHJcbiAgICAgIFxyXG4gICAgICBjb25zdCBhbmFseXRpY3NEYXRhID0gYXdhaXQgcmVzcG9uc2UuanNvbigpO1xyXG4gICAgICBzZXREYXRhKGFuYWx5dGljc0RhdGEpO1xyXG4gICAgfSBjYXRjaCAoZXJyKSB7XHJcbiAgICAgIGNvbnNvbGUuZXJyb3IoJ0FuYWx5dGljcyBmZXRjaCBlcnJvcjonLCBlcnIpO1xyXG4gICAgICBzZXRFcnJvcignRmFpbGVkIHRvIGxvYWQgYW5hbHl0aWNzIGRhdGEnKTtcclxuICAgICAgc2V0RGF0YSh7XHJcbiAgICAgICAgb3ZlcnZpZXc6IHt9LFxyXG4gICAgICAgIGFwcG9pbnRtZW50czogeyBvdmVydmlldzoge30sIGFwcG9pbnRtZW50U3RhdHM6IFtdLCB0b3BGcmVlbGFuY2VyczogW10sIHJlY2VudEFwcG9pbnRtZW50czogW10gfSxcclxuICAgICAgICB1c2VyczogeyBvdmVydmlldzoge30sIHVzZXJHcm93dGg6IFtdLCB1c2VyRGlzdHJpYnV0aW9uOiBbXSwgcmVjZW50VXNlcnM6IFtdIH0sXHJcbiAgICAgICAgcHJvamVjdFN0YXRzOiB7IGJ5U3RhdHVzOiBbXSB9LFxyXG4gICAgICB9KTtcclxuICAgIH0gZmluYWxseSB7XHJcbiAgICAgIHNldExvYWRpbmcoZmFsc2UpO1xyXG4gICAgfVxyXG4gIH07XHJcblxyXG4gIHVzZUVmZmVjdCgoKSA9PiB7XHJcbiAgICBmZXRjaEFuYWx5dGljc0RhdGEoKTtcclxuICB9LCBbZGF0ZVJhbmdlXSk7XHJcblxyXG4gIGNvbnN0IGZvcm1hdEN1cnJlbmN5ID0gKGFtb3VudCkgPT4ge1xyXG4gICAgcmV0dXJuIG5ldyBJbnRsLk51bWJlckZvcm1hdCgnZW4tVVMnLCB7XHJcbiAgICAgIHN0eWxlOiAnY3VycmVuY3knLFxyXG4gICAgICBjdXJyZW5jeTogJ1VTRCdcclxuICAgIH0pLmZvcm1hdChhbW91bnQgfHwgMCk7XHJcbiAgfTtcclxuXHJcbiAgY29uc3QgZm9ybWF0RGF0ZSA9IChkYXRlU3RyaW5nKSA9PiB7XHJcbiAgICByZXR1cm4gbmV3IERhdGUoZGF0ZVN0cmluZykudG9Mb2NhbGVEYXRlU3RyaW5nKCdlbi1VUycsIHtcclxuICAgICAgbW9udGg6ICdzaG9ydCcsXHJcbiAgICAgIGRheTogJ251bWVyaWMnXHJcbiAgICB9KTtcclxuICB9O1xyXG5cclxuICBjb25zdCBmb3JtYXRQZXJjZW50YWdlID0gKHZhbHVlKSA9PiB7XHJcbiAgICByZXR1cm4gYCR7KHZhbHVlIHx8IDApLnRvRml4ZWQoMSl9JWA7XHJcbiAgfTtcclxuXHJcbiAgaWYgKGxvYWRpbmcpIHtcclxuICAgIHJldHVybiAoXHJcbiAgICAgIDxkaXYgc3R5bGU9e3sgXHJcbiAgICAgICAgZGlzcGxheTogJ2ZsZXgnLCBcclxuICAgICAgICBqdXN0aWZ5Q29udGVudDogJ2NlbnRlcicsIFxyXG4gICAgICAgIGFsaWduSXRlbXM6ICdjZW50ZXInLCBcclxuICAgICAgICBtaW5IZWlnaHQ6ICc0MDBweCcsXHJcbiAgICAgICAgZm9udEZhbWlseTogJy1hcHBsZS1zeXN0ZW0sIEJsaW5rTWFjU3lzdGVtRm9udCwgXCJTZWdvZSBVSVwiLCBSb2JvdG8sIHNhbnMtc2VyaWYnXHJcbiAgICAgIH19PlxyXG4gICAgICAgIDxkaXYgc3R5bGU9e3sgdGV4dEFsaWduOiAnY2VudGVyJyB9fT5cclxuICAgICAgICAgIDxkaXYgc3R5bGU9e3tcclxuICAgICAgICAgICAgd2lkdGg6ICc0MHB4JyxcclxuICAgICAgICAgICAgaGVpZ2h0OiAnNDBweCcsXHJcbiAgICAgICAgICAgIGJvcmRlcjogJzRweCBzb2xpZCAjZTVlN2ViJyxcclxuICAgICAgICAgICAgYm9yZGVyVG9wOiAnNHB4IHNvbGlkICMzYjgyZjYnLFxyXG4gICAgICAgICAgICBib3JkZXJSYWRpdXM6ICc1MCUnLFxyXG4gICAgICAgICAgICBhbmltYXRpb246ICdzcGluIDFzIGxpbmVhciBpbmZpbml0ZScsXHJcbiAgICAgICAgICAgIG1hcmdpbjogJzAgYXV0byAxNnB4J1xyXG4gICAgICAgICAgfX0+PC9kaXY+XHJcbiAgICAgICAgICA8cCBzdHlsZT17eyBjb2xvcjogJyM2YjcyODAnIH19PkxvYWRpbmcgYW5hbHl0aWNzLi4uPC9wPlxyXG4gICAgICAgICAgPHN0eWxlPntgXHJcbiAgICAgICAgICAgIEBrZXlmcmFtZXMgc3BpbiB7XHJcbiAgICAgICAgICAgICAgMCUgeyB0cmFuc2Zvcm06IHJvdGF0ZSgwZGVnKTsgfVxyXG4gICAgICAgICAgICAgIDEwMCUgeyB0cmFuc2Zvcm06IHJvdGF0ZSgzNjBkZWcpOyB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgIGB9PC9zdHlsZT5cclxuICAgICAgICA8L2Rpdj5cclxuICAgICAgPC9kaXY+XHJcbiAgICApO1xyXG4gIH1cclxuXHJcbiAgcmV0dXJuIChcclxuICAgIDxkaXYgc3R5bGU9e3sgXHJcbiAgICAgIHBhZGRpbmc6ICcyNHB4JywgXHJcbiAgICAgIGZvbnRGYW1pbHk6ICctYXBwbGUtc3lzdGVtLCBCbGlua01hY1N5c3RlbUZvbnQsIFwiU2Vnb2UgVUlcIiwgUm9ib3RvLCBzYW5zLXNlcmlmJyxcclxuICAgICAgYmFja2dyb3VuZENvbG9yOiAnI2Y4ZmFmYycsXHJcbiAgICAgIG1pbkhlaWdodDogJzEwMHZoJ1xyXG4gICAgfX0+XHJcbiAgICAgIHsvKiBIZWFkZXIgKi99XHJcbiAgICAgIDxkaXYgc3R5bGU9e3sgbWFyZ2luQm90dG9tOiAnMzJweCcgfX0+XHJcbiAgICAgICAgPGRpdiBzdHlsZT17eyBcclxuICAgICAgICAgIGRpc3BsYXk6ICdmbGV4JywgXHJcbiAgICAgICAgICBqdXN0aWZ5Q29udGVudDogJ3NwYWNlLWJldHdlZW4nLCBcclxuICAgICAgICAgIGFsaWduSXRlbXM6ICdjZW50ZXInLFxyXG4gICAgICAgICAgbWFyZ2luQm90dG9tOiAnMjRweCdcclxuICAgICAgICB9fT5cclxuICAgICAgICAgIDxkaXY+XHJcbiAgICAgICAgICAgIDxoMSBzdHlsZT17eyBcclxuICAgICAgICAgICAgICBtYXJnaW46ICcwIDAgOHB4IDAnLCBcclxuICAgICAgICAgICAgICBmb250U2l6ZTogJzI4cHgnLCBcclxuICAgICAgICAgICAgICBmb250V2VpZ2h0OiAnNzAwJyxcclxuICAgICAgICAgICAgICBjb2xvcjogJyMxZTI5M2InXHJcbiAgICAgICAgICAgIH19PlxyXG4gICAgICAgICAgICAgIEFuYWx5dGljcyBEYXNoYm9hcmRcclxuICAgICAgICAgICAgPC9oMT5cclxuICAgICAgICAgICAgPHAgc3R5bGU9e3sgbWFyZ2luOiAnMCcsIGNvbG9yOiAnIzY0NzQ4YicsIGZvbnRTaXplOiAnMTZweCcgfX0+XHJcbiAgICAgICAgICAgICAgQ29tcHJlaGVuc2l2ZSBidXNpbmVzcyBpbnNpZ2h0cyBhbmQgbWV0cmljc1xyXG4gICAgICAgICAgICA8L3A+XHJcbiAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgIFxyXG4gICAgICAgICAgPGRpdiBzdHlsZT17eyBkaXNwbGF5OiAnZmxleCcsIGdhcDogJzEycHgnLCBhbGlnbkl0ZW1zOiAnY2VudGVyJyB9fT5cclxuICAgICAgICAgICAgPHNlbGVjdFxyXG4gICAgICAgICAgICAgIHZhbHVlPXtkYXRlUmFuZ2V9XHJcbiAgICAgICAgICAgICAgb25DaGFuZ2U9eyhlKSA9PiBzZXREYXRlUmFuZ2UoZS50YXJnZXQudmFsdWUpfVxyXG4gICAgICAgICAgICAgIHN0eWxlPXt7XHJcbiAgICAgICAgICAgICAgICBwYWRkaW5nOiAnOHB4IDEycHgnLFxyXG4gICAgICAgICAgICAgICAgYm9yZGVyOiAnMXB4IHNvbGlkICNkMWQ1ZGInLFxyXG4gICAgICAgICAgICAgICAgYm9yZGVyUmFkaXVzOiAnOHB4JyxcclxuICAgICAgICAgICAgICAgIGZvbnRTaXplOiAnMTRweCcsXHJcbiAgICAgICAgICAgICAgICBiYWNrZ3JvdW5kQ29sb3I6ICd3aGl0ZScsXHJcbiAgICAgICAgICAgICAgICBjdXJzb3I6ICdwb2ludGVyJ1xyXG4gICAgICAgICAgICAgIH19XHJcbiAgICAgICAgICAgID5cclxuICAgICAgICAgICAgICA8b3B0aW9uIHZhbHVlPVwiN2RcIj43IERheXM8L29wdGlvbj5cclxuICAgICAgICAgICAgICA8b3B0aW9uIHZhbHVlPVwiMzBkXCI+MzAgRGF5czwvb3B0aW9uPlxyXG4gICAgICAgICAgICAgIDxvcHRpb24gdmFsdWU9XCI5MGRcIj45MCBEYXlzPC9vcHRpb24+XHJcbiAgICAgICAgICAgICAgPG9wdGlvbiB2YWx1ZT1cIjF5XCI+MSBZZWFyPC9vcHRpb24+XHJcbiAgICAgICAgICAgIDwvc2VsZWN0PlxyXG4gICAgICAgICAgICBcclxuICAgICAgICAgICAgPGJ1dHRvblxyXG4gICAgICAgICAgICAgIG9uQ2xpY2s9e2ZldGNoQW5hbHl0aWNzRGF0YX1cclxuICAgICAgICAgICAgICBzdHlsZT17e1xyXG4gICAgICAgICAgICAgICAgcGFkZGluZzogJzhweCAxNnB4JyxcclxuICAgICAgICAgICAgICAgIGJhY2tncm91bmRDb2xvcjogJyMzYjgyZjYnLFxyXG4gICAgICAgICAgICAgICAgY29sb3I6ICd3aGl0ZScsXHJcbiAgICAgICAgICAgICAgICBib3JkZXI6ICdub25lJyxcclxuICAgICAgICAgICAgICAgIGJvcmRlclJhZGl1czogJzhweCcsXHJcbiAgICAgICAgICAgICAgICBjdXJzb3I6ICdwb2ludGVyJyxcclxuICAgICAgICAgICAgICAgIGZvbnRTaXplOiAnMTRweCcsXHJcbiAgICAgICAgICAgICAgICBmb250V2VpZ2h0OiAnNTAwJ1xyXG4gICAgICAgICAgICAgIH19XHJcbiAgICAgICAgICAgID5cclxuICAgICAgICAgICAgICBSZWZyZXNoXHJcbiAgICAgICAgICAgIDwvYnV0dG9uPlxyXG4gICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgPC9kaXY+XHJcblxyXG4gICAgICAgIHtlcnJvciAmJiAoXHJcbiAgICAgICAgICA8ZGl2IHN0eWxlPXt7XHJcbiAgICAgICAgICAgIHBhZGRpbmc6ICcxMnB4IDE2cHgnLFxyXG4gICAgICAgICAgICBiYWNrZ3JvdW5kQ29sb3I6ICcjZmVlMmUyJyxcclxuICAgICAgICAgICAgYm9yZGVyOiAnMXB4IHNvbGlkICNmZWNhY2EnLFxyXG4gICAgICAgICAgICBib3JkZXJSYWRpdXM6ICc4cHgnLFxyXG4gICAgICAgICAgICBjb2xvcjogJyM5OTFiMWInLFxyXG4gICAgICAgICAgICBtYXJnaW5Cb3R0b206ICcyNHB4JyxcclxuICAgICAgICAgICAgZm9udFNpemU6ICcxNHB4J1xyXG4gICAgICAgICAgfX0+XHJcbiAgICAgICAgICAgIHtlcnJvcn1cclxuICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICl9XHJcblxyXG4gICAgICAgIDxkaXYgc3R5bGU9e3sgYm9yZGVyQm90dG9tOiAnMXB4IHNvbGlkICNlNWU3ZWInIH19PlxyXG4gICAgICAgICAgPGRpdiBzdHlsZT17eyBkaXNwbGF5OiAnZmxleCcsIGdhcDogJzMycHgnIH19PlxyXG4gICAgICAgICAgICB7W1xyXG4gICAgICAgICAgICAgIHsgaWQ6ICdvdmVydmlldycsIGxhYmVsOiAnT3ZlcnZpZXcnIH0sXHJcbiAgICAgICAgICAgICAgeyBpZDogJ2FwcG9pbnRtZW50cycsIGxhYmVsOiAnQXBwb2ludG1lbnRzJyB9LFxyXG4gICAgICAgICAgICAgIHsgaWQ6ICd1c2VycycsIGxhYmVsOiAnVXNlcnMnIH0sXHJcbiAgICAgICAgICAgICAgeyBpZDogJ3Byb2plY3RzJywgbGFiZWw6ICdQcm9qZWN0cycgfSxcclxuICAgICAgICAgICAgICB7IGlkOiAnZmluYW5jaWFsJywgbGFiZWw6ICdGaW5hbmNpYWwnIH1cclxuICAgICAgICAgICAgXS5tYXAodGFiID0+IChcclxuICAgICAgICAgICAgICA8YnV0dG9uXHJcbiAgICAgICAgICAgICAgICBrZXk9e3RhYi5pZH1cclxuICAgICAgICAgICAgICAgIG9uQ2xpY2s9eygpID0+IHNldEFjdGl2ZVRhYih0YWIuaWQpfVxyXG4gICAgICAgICAgICAgICAgc3R5bGU9e3tcclxuICAgICAgICAgICAgICAgICAgcGFkZGluZzogJzEycHggMCcsXHJcbiAgICAgICAgICAgICAgICAgIGJvcmRlcjogJ25vbmUnLFxyXG4gICAgICAgICAgICAgICAgICBiYWNrZ3JvdW5kOiAnbm9uZScsXHJcbiAgICAgICAgICAgICAgICAgIGZvbnRTaXplOiAnMTRweCcsXHJcbiAgICAgICAgICAgICAgICAgIGZvbnRXZWlnaHQ6ICc1MDAnLFxyXG4gICAgICAgICAgICAgICAgICBjb2xvcjogYWN0aXZlVGFiID09PSB0YWIuaWQgPyAnIzNiODJmNicgOiAnIzZiNzI4MCcsXHJcbiAgICAgICAgICAgICAgICAgIGJvcmRlckJvdHRvbTogYWN0aXZlVGFiID09PSB0YWIuaWQgPyAnMnB4IHNvbGlkICMzYjgyZjYnIDogJzJweCBzb2xpZCB0cmFuc3BhcmVudCcsXHJcbiAgICAgICAgICAgICAgICAgIGN1cnNvcjogJ3BvaW50ZXInLFxyXG4gICAgICAgICAgICAgICAgICB0cmFuc2l0aW9uOiAnYWxsIDAuMnMnXHJcbiAgICAgICAgICAgICAgICB9fVxyXG4gICAgICAgICAgICAgID5cclxuICAgICAgICAgICAgICAgIHt0YWIubGFiZWx9XHJcbiAgICAgICAgICAgICAgPC9idXR0b24+XHJcbiAgICAgICAgICAgICkpfVxyXG4gICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgPC9kaXY+XHJcbiAgICAgIDwvZGl2PlxyXG5cclxuICAgICAgPGRpdiBzdHlsZT17eyBtaW5IZWlnaHQ6ICc0MDBweCcgfX0+XHJcbiAgICAgICAge2FjdGl2ZVRhYiA9PT0gJ292ZXJ2aWV3JyAmJiAoXHJcbiAgICAgICAgICA8ZGl2PlxyXG4gICAgICAgICAgICA8ZGl2IHN0eWxlPXt7IFxyXG4gICAgICAgICAgICAgIGRpc3BsYXk6ICdncmlkJywgXHJcbiAgICAgICAgICAgICAgZ3JpZFRlbXBsYXRlQ29sdW1uczogJ3JlcGVhdChhdXRvLWZpdCwgbWlubWF4KDI0MHB4LCAxZnIpKScsIFxyXG4gICAgICAgICAgICAgIGdhcDogJzIwcHgnLFxyXG4gICAgICAgICAgICAgIG1hcmdpbkJvdHRvbTogJzMycHgnXHJcbiAgICAgICAgICAgIH19PlxyXG4gICAgICAgICAgICAgIDxkaXYgc3R5bGU9e3tcclxuICAgICAgICAgICAgICAgIHBhZGRpbmc6ICcyNHB4JyxcclxuICAgICAgICAgICAgICAgIGJhY2tncm91bmRDb2xvcjogJ3doaXRlJyxcclxuICAgICAgICAgICAgICAgIGJvcmRlclJhZGl1czogJzEycHgnLFxyXG4gICAgICAgICAgICAgICAgYm94U2hhZG93OiAnMCAxcHggM3B4IHJnYmEoMCwwLDAsMC4xKScsXHJcbiAgICAgICAgICAgICAgICBib3JkZXI6ICcxcHggc29saWQgI2U1ZTdlYidcclxuICAgICAgICAgICAgICB9fT5cclxuICAgICAgICAgICAgICAgIDxkaXYgc3R5bGU9e3sgZGlzcGxheTogJ2ZsZXgnLCBhbGlnbkl0ZW1zOiAnY2VudGVyJywganVzdGlmeUNvbnRlbnQ6ICdzcGFjZS1iZXR3ZWVuJyB9fT5cclxuICAgICAgICAgICAgICAgICAgPGRpdj5cclxuICAgICAgICAgICAgICAgICAgICA8ZGl2IHN0eWxlPXt7IG1hcmdpbkJvdHRvbTogJzhweCcsIGZvbnRTaXplOiAnMTRweCcsIGNvbG9yOiAnIzZiNzI4MCcsIGZvbnRXZWlnaHQ6ICc1MDAnIH19PlxyXG4gICAgICAgICAgICAgICAgICAgICAgVG90YWwgVXNlcnNcclxuICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgICAgICAgICAgICA8ZGl2IHN0eWxlPXt7IGZvbnRTaXplOiAnMjhweCcsIGZvbnRXZWlnaHQ6ICc3MDAnLCBjb2xvcjogJyMxZTI5M2InIH19PlxyXG4gICAgICAgICAgICAgICAgICAgICAgeyhkYXRhPy5vdmVydmlldz8udG90YWxVc2VycyB8fCAwKS50b0xvY2FsZVN0cmluZygpfVxyXG4gICAgICAgICAgICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICAgICAgICAgICAgIDxkaXYgc3R5bGU9e3sgZm9udFNpemU6ICcxMnB4JywgY29sb3I6ICcjMTBiOTgxJywgbWFyZ2luVG9wOiAnNHB4JywgZm9udFdlaWdodDogJzUwMCcgfX0+XHJcbiAgICAgICAgICAgICAgICAgICAgICAre2RhdGE/Lm92ZXJ2aWV3Py5uZXdVc2Vyc1RvZGF5IHx8IDB9IHRvZGF5XHJcbiAgICAgICAgICAgICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICAgICAgICAgICA8ZGl2IHN0eWxlPXt7IFxyXG4gICAgICAgICAgICAgICAgICAgIHBhZGRpbmc6ICcxMnB4JywgXHJcbiAgICAgICAgICAgICAgICAgICAgYmFja2dyb3VuZENvbG9yOiAnI2RiZWFmZScsIFxyXG4gICAgICAgICAgICAgICAgICAgIGJvcmRlclJhZGl1czogJzEycHgnLFxyXG4gICAgICAgICAgICAgICAgICAgIGZvbnRTaXplOiAnMjRweCdcclxuICAgICAgICAgICAgICAgICAgfX0+XHJcbiAgICAgICAgICAgICAgICAgICAg8J+RpVxyXG4gICAgICAgICAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICAgICAgIDwvZGl2PlxyXG5cclxuICAgICAgICAgICAgICA8ZGl2IHN0eWxlPXt7XHJcbiAgICAgICAgICAgICAgICBwYWRkaW5nOiAnMjRweCcsXHJcbiAgICAgICAgICAgICAgICBiYWNrZ3JvdW5kQ29sb3I6ICd3aGl0ZScsXHJcbiAgICAgICAgICAgICAgICBib3JkZXJSYWRpdXM6ICcxMnB4JyxcclxuICAgICAgICAgICAgICAgIGJveFNoYWRvdzogJzAgMXB4IDNweCByZ2JhKDAsMCwwLDAuMSknLFxyXG4gICAgICAgICAgICAgICAgYm9yZGVyOiAnMXB4IHNvbGlkICNlNWU3ZWInXHJcbiAgICAgICAgICAgICAgfX0+XHJcbiAgICAgICAgICAgICAgICA8ZGl2IHN0eWxlPXt7IGRpc3BsYXk6ICdmbGV4JywgYWxpZ25JdGVtczogJ2NlbnRlcicsIGp1c3RpZnlDb250ZW50OiAnc3BhY2UtYmV0d2VlbicgfX0+XHJcbiAgICAgICAgICAgICAgICAgIDxkaXY+XHJcbiAgICAgICAgICAgICAgICAgICAgPGRpdiBzdHlsZT17eyBtYXJnaW5Cb3R0b206ICc4cHgnLCBmb250U2l6ZTogJzE0cHgnLCBjb2xvcjogJyM2YjcyODAnLCBmb250V2VpZ2h0OiAnNTAwJyB9fT5cclxuICAgICAgICAgICAgICAgICAgICAgIFRvdGFsIEFwcG9pbnRtZW50c1xyXG4gICAgICAgICAgICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICAgICAgICAgICAgIDxkaXYgc3R5bGU9e3sgZm9udFNpemU6ICcyOHB4JywgZm9udFdlaWdodDogJzcwMCcsIGNvbG9yOiAnIzFlMjkzYicgfX0+XHJcbiAgICAgICAgICAgICAgICAgICAgICB7KGRhdGE/LmFwcG9pbnRtZW50cz8ub3ZlcnZpZXc/LnRvdGFsQXBwb2ludG1lbnRzIHx8IDApLnRvTG9jYWxlU3RyaW5nKCl9XHJcbiAgICAgICAgICAgICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgICAgICAgICAgICAgPGRpdiBzdHlsZT17eyBmb250U2l6ZTogJzEycHgnLCBjb2xvcjogJyMxMGI5ODEnLCBtYXJnaW5Ub3A6ICc0cHgnLCBmb250V2VpZ2h0OiAnNTAwJyB9fT5cclxuICAgICAgICAgICAgICAgICAgICAgIHtkYXRhPy5hcHBvaW50bWVudHM/Lm92ZXJ2aWV3Py5hcHBvaW50bWVudHNUb2RheSB8fCAwfSB0b2RheVxyXG4gICAgICAgICAgICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgICAgICAgICAgPGRpdiBzdHlsZT17eyBcclxuICAgICAgICAgICAgICAgICAgICBwYWRkaW5nOiAnMTJweCcsIFxyXG4gICAgICAgICAgICAgICAgICAgIGJhY2tncm91bmRDb2xvcjogJyNkY2ZjZTcnLCBcclxuICAgICAgICAgICAgICAgICAgICBib3JkZXJSYWRpdXM6ICcxMnB4JyxcclxuICAgICAgICAgICAgICAgICAgICBmb250U2l6ZTogJzI0cHgnXHJcbiAgICAgICAgICAgICAgICAgIH19PlxyXG4gICAgICAgICAgICAgICAgICAgIPCfk4VcclxuICAgICAgICAgICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgICAgICA8L2Rpdj5cclxuXHJcbiAgICAgICAgICAgICAgPGRpdiBzdHlsZT17e1xyXG4gICAgICAgICAgICAgICAgcGFkZGluZzogJzI0cHgnLFxyXG4gICAgICAgICAgICAgICAgYmFja2dyb3VuZENvbG9yOiAnd2hpdGUnLFxyXG4gICAgICAgICAgICAgICAgYm9yZGVyUmFkaXVzOiAnMTJweCcsXHJcbiAgICAgICAgICAgICAgICBib3hTaGFkb3c6ICcwIDFweCAzcHggcmdiYSgwLDAsMCwwLjEpJyxcclxuICAgICAgICAgICAgICAgIGJvcmRlcjogJzFweCBzb2xpZCAjZTVlN2ViJ1xyXG4gICAgICAgICAgICAgIH19PlxyXG4gICAgICAgICAgICAgICAgPGRpdiBzdHlsZT17eyBkaXNwbGF5OiAnZmxleCcsIGFsaWduSXRlbXM6ICdjZW50ZXInLCBqdXN0aWZ5Q29udGVudDogJ3NwYWNlLWJldHdlZW4nIH19PlxyXG4gICAgICAgICAgICAgICAgICA8ZGl2PlxyXG4gICAgICAgICAgICAgICAgICAgIDxkaXYgc3R5bGU9e3sgbWFyZ2luQm90dG9tOiAnOHB4JywgZm9udFNpemU6ICcxNHB4JywgY29sb3I6ICcjNmI3MjgwJywgZm9udFdlaWdodDogJzUwMCcgfX0+XHJcbiAgICAgICAgICAgICAgICAgICAgICBBY3RpdmUgUHJvamVjdHNcclxuICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgICAgICAgICAgICA8ZGl2IHN0eWxlPXt7IGZvbnRTaXplOiAnMjhweCcsIGZvbnRXZWlnaHQ6ICc3MDAnLCBjb2xvcjogJyMxZTI5M2InIH19PlxyXG4gICAgICAgICAgICAgICAgICAgICAgeyhkYXRhPy5vdmVydmlldz8uYWN0aXZlUHJvamVjdHMgfHwgMCkudG9Mb2NhbGVTdHJpbmcoKX1cclxuICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgICAgICAgICAgICA8ZGl2IHN0eWxlPXt7IGZvbnRTaXplOiAnMTJweCcsIGNvbG9yOiAnIzZiNzI4MCcsIG1hcmdpblRvcDogJzRweCcsIGZvbnRXZWlnaHQ6ICc1MDAnIH19PlxyXG4gICAgICAgICAgICAgICAgICAgICAge2RhdGE/Lm92ZXJ2aWV3Py5jb21wbGV0ZWRQcm9qZWN0cyB8fCAwfSBjb21wbGV0ZWRcclxuICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgICAgICAgICAgIDxkaXYgc3R5bGU9e3sgXHJcbiAgICAgICAgICAgICAgICAgICAgcGFkZGluZzogJzEycHgnLCBcclxuICAgICAgICAgICAgICAgICAgICBiYWNrZ3JvdW5kQ29sb3I6ICcjZjNlOGZmJywgXHJcbiAgICAgICAgICAgICAgICAgICAgYm9yZGVyUmFkaXVzOiAnMTJweCcsXHJcbiAgICAgICAgICAgICAgICAgICAgZm9udFNpemU6ICcyNHB4J1xyXG4gICAgICAgICAgICAgICAgICB9fT5cclxuICAgICAgICAgICAgICAgICAgICDwn5K8XHJcbiAgICAgICAgICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgICAgICAgPC9kaXY+XHJcblxyXG4gICAgICAgICAgICAgIDxkaXYgc3R5bGU9e3tcclxuICAgICAgICAgICAgICAgIHBhZGRpbmc6ICcyNHB4JyxcclxuICAgICAgICAgICAgICAgIGJhY2tncm91bmRDb2xvcjogJ3doaXRlJyxcclxuICAgICAgICAgICAgICAgIGJvcmRlclJhZGl1czogJzEycHgnLFxyXG4gICAgICAgICAgICAgICAgYm94U2hhZG93OiAnMCAxcHggM3B4IHJnYmEoMCwwLDAsMC4xKScsXHJcbiAgICAgICAgICAgICAgICBib3JkZXI6ICcxcHggc29saWQgI2U1ZTdlYidcclxuICAgICAgICAgICAgICB9fT5cclxuICAgICAgICAgICAgICAgIDxkaXYgc3R5bGU9e3sgZGlzcGxheTogJ2ZsZXgnLCBhbGlnbkl0ZW1zOiAnY2VudGVyJywganVzdGlmeUNvbnRlbnQ6ICdzcGFjZS1iZXR3ZWVuJyB9fT5cclxuICAgICAgICAgICAgICAgICAgPGRpdj5cclxuICAgICAgICAgICAgICAgICAgICA8ZGl2IHN0eWxlPXt7IG1hcmdpbkJvdHRvbTogJzhweCcsIGZvbnRTaXplOiAnMTRweCcsIGNvbG9yOiAnIzZiNzI4MCcsIGZvbnRXZWlnaHQ6ICc1MDAnIH19PlxyXG4gICAgICAgICAgICAgICAgICAgICAgVG90YWwgUmV2ZW51ZVxyXG4gICAgICAgICAgICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICAgICAgICAgICAgIDxkaXYgc3R5bGU9e3sgZm9udFNpemU6ICcyOHB4JywgZm9udFdlaWdodDogJzcwMCcsIGNvbG9yOiAnIzFlMjkzYicgfX0+XHJcbiAgICAgICAgICAgICAgICAgICAgICB7Zm9ybWF0Q3VycmVuY3koZGF0YT8ub3ZlcnZpZXc/LnRvdGFsUmV2ZW51ZSB8fCAwKX1cclxuICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgICAgICAgICAgICA8ZGl2IHN0eWxlPXt7IGZvbnRTaXplOiAnMTJweCcsIGNvbG9yOiAnIzZiNzI4MCcsIG1hcmdpblRvcDogJzRweCcsIGZvbnRXZWlnaHQ6ICc1MDAnIH19PlxyXG4gICAgICAgICAgICAgICAgICAgICAge2Zvcm1hdEN1cnJlbmN5KGRhdGE/Lm92ZXJ2aWV3Py5tb250aGx5UmV2ZW51ZSB8fCAwKX0gdGhpcyBtb250aFxyXG4gICAgICAgICAgICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgICAgICAgICAgPGRpdiBzdHlsZT17eyBcclxuICAgICAgICAgICAgICAgICAgICBwYWRkaW5nOiAnMTJweCcsIFxyXG4gICAgICAgICAgICAgICAgICAgIGJhY2tncm91bmRDb2xvcjogJyNmZWYzYzcnLCBcclxuICAgICAgICAgICAgICAgICAgICBib3JkZXJSYWRpdXM6ICcxMnB4JyxcclxuICAgICAgICAgICAgICAgICAgICBmb250U2l6ZTogJzI0cHgnXHJcbiAgICAgICAgICAgICAgICAgIH19PlxyXG4gICAgICAgICAgICAgICAgICAgIPCfkrBcclxuICAgICAgICAgICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgICAgPC9kaXY+XHJcblxyXG4gICAgICAgICAgICA8ZGl2IHN0eWxlPXt7XHJcbiAgICAgICAgICAgICAgYmFja2dyb3VuZENvbG9yOiAnd2hpdGUnLFxyXG4gICAgICAgICAgICAgIGJvcmRlclJhZGl1czogJzEycHgnLFxyXG4gICAgICAgICAgICAgIGJveFNoYWRvdzogJzAgMXB4IDNweCByZ2JhKDAsMCwwLDAuMSknLFxyXG4gICAgICAgICAgICAgIGJvcmRlcjogJzFweCBzb2xpZCAjZTVlN2ViJyxcclxuICAgICAgICAgICAgICBvdmVyZmxvdzogJ2hpZGRlbidcclxuICAgICAgICAgICAgfX0+XHJcbiAgICAgICAgICAgICAgPGRpdiBzdHlsZT17eyBcclxuICAgICAgICAgICAgICAgIHBhZGRpbmc6ICcyMHB4IDI0cHgnLCBcclxuICAgICAgICAgICAgICAgIGJvcmRlckJvdHRvbTogJzFweCBzb2xpZCAjZTVlN2ViJyxcclxuICAgICAgICAgICAgICAgIGJhY2tncm91bmRDb2xvcjogJyNmOGZhZmMnXHJcbiAgICAgICAgICAgICAgfX0+XHJcbiAgICAgICAgICAgICAgICA8aDMgc3R5bGU9e3sgbWFyZ2luOiAnMCcsIGZvbnRTaXplOiAnMThweCcsIGZvbnRXZWlnaHQ6ICc2MDAnLCBjb2xvcjogJyMxZTI5M2InIH19PlxyXG4gICAgICAgICAgICAgICAgICBSZWNlbnQgQXBwb2ludG1lbnRzXHJcbiAgICAgICAgICAgICAgICA8L2gzPlxyXG4gICAgICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICAgICAgIFxyXG4gICAgICAgICAgICAgIDxkaXYgc3R5bGU9e3sgbWF4SGVpZ2h0OiAnNDAwcHgnLCBvdmVyZmxvd1k6ICdhdXRvJyB9fT5cclxuICAgICAgICAgICAgICAgIHtkYXRhPy5hcHBvaW50bWVudHM/LnJlY2VudEFwcG9pbnRtZW50cz8ubGVuZ3RoID4gMCA/IChcclxuICAgICAgICAgICAgICAgICAgPHRhYmxlIHN0eWxlPXt7IHdpZHRoOiAnMTAwJScsIGJvcmRlckNvbGxhcHNlOiAnY29sbGFwc2UnIH19PlxyXG4gICAgICAgICAgICAgICAgICAgIDx0aGVhZCBzdHlsZT17eyBiYWNrZ3JvdW5kQ29sb3I6ICcjZjhmYWZjJywgcG9zaXRpb246ICdzdGlja3knLCB0b3A6IDAgfX0+XHJcbiAgICAgICAgICAgICAgICAgICAgICA8dHI+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIDx0aCBzdHlsZT17eyB0ZXh0QWxpZ246ICdsZWZ0JywgcGFkZGluZzogJzEycHggMjRweCcsIGZvbnRTaXplOiAnMTRweCcsIGZvbnRXZWlnaHQ6ICc2MDAnLCBjb2xvcjogJyMzNzQxNTEnIH19PlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgIFR5cGVcclxuICAgICAgICAgICAgICAgICAgICAgICAgPC90aD5cclxuICAgICAgICAgICAgICAgICAgICAgICAgPHRoIHN0eWxlPXt7IHRleHRBbGlnbjogJ2xlZnQnLCBwYWRkaW5nOiAnMTJweCAyNHB4JywgZm9udFNpemU6ICcxNHB4JywgZm9udFdlaWdodDogJzYwMCcsIGNvbG9yOiAnIzM3NDE1MScgfX0+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgU3RhdHVzXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIDwvdGg+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIDx0aCBzdHlsZT17eyB0ZXh0QWxpZ246ICdsZWZ0JywgcGFkZGluZzogJzEycHggMjRweCcsIGZvbnRTaXplOiAnMTRweCcsIGZvbnRXZWlnaHQ6ICc2MDAnLCBjb2xvcjogJyMzNzQxNTEnIH19PlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgIERhdGVcclxuICAgICAgICAgICAgICAgICAgICAgICAgPC90aD5cclxuICAgICAgICAgICAgICAgICAgICAgICAgPHRoIHN0eWxlPXt7IHRleHRBbGlnbjogJ2xlZnQnLCBwYWRkaW5nOiAnMTJweCAyNHB4JywgZm9udFNpemU6ICcxNHB4JywgZm9udFdlaWdodDogJzYwMCcsIGNvbG9yOiAnIzM3NDE1MScgfX0+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgRnJlZWxhbmNlclxyXG4gICAgICAgICAgICAgICAgICAgICAgICA8L3RoPlxyXG4gICAgICAgICAgICAgICAgICAgICAgPC90cj5cclxuICAgICAgICAgICAgICAgICAgICA8L3RoZWFkPlxyXG4gICAgICAgICAgICAgICAgICAgIDx0Ym9keT5cclxuICAgICAgICAgICAgICAgICAgICAgIHtkYXRhLmFwcG9pbnRtZW50cy5yZWNlbnRBcHBvaW50bWVudHMuc2xpY2UoMCwgMTApLm1hcCgoYXBwb2ludG1lbnQsIGluZGV4KSA9PiAoXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIDx0ciBrZXk9e2luZGV4fSBzdHlsZT17eyBcclxuICAgICAgICAgICAgICAgICAgICAgICAgICBib3JkZXJCb3R0b206ICcxcHggc29saWQgI2YzZjRmNicsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgdHJhbnNpdGlvbjogJ2JhY2tncm91bmQtY29sb3IgMC4ycydcclxuICAgICAgICAgICAgICAgICAgICAgICAgfX0+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgPHRkIHN0eWxlPXt7IHBhZGRpbmc6ICcxNnB4IDI0cHgnLCBmb250U2l6ZTogJzE0cHgnLCBmb250V2VpZ2h0OiAnNTAwJyB9fT5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHthcHBvaW50bWVudC5hcHBvaW50bWVudF90eXBlIHx8ICdBcHBvaW50bWVudCd9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgPC90ZD5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICA8dGQgc3R5bGU9e3sgcGFkZGluZzogJzE2cHggMjRweCcsIGZvbnRTaXplOiAnMTRweCcgfX0+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8c3BhbiBzdHlsZT17e1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICBwYWRkaW5nOiAnNHB4IDEycHgnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICBib3JkZXJSYWRpdXM6ICcyMHB4JyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZm9udFNpemU6ICcxMnB4JyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZm9udFdlaWdodDogJzYwMCcsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJhY2tncm91bmRDb2xvcjogXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYXBwb2ludG1lbnQuc3RhdHVzID09PSAncGVuZGluZycgPyAnI2ZlZjNjNycgOlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFwcG9pbnRtZW50LnN0YXR1cyA9PT0gJ2FjY2VwdGVkJyA/ICcjZGNmY2U3JyA6XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYXBwb2ludG1lbnQuc3RhdHVzID09PSAncmVqZWN0ZWQnID8gJyNmZWUyZTInIDogJyNmM2Y0ZjYnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb2xvcjpcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhcHBvaW50bWVudC5zdGF0dXMgPT09ICdwZW5kaW5nJyA/ICcjOTI0MDBlJyA6XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYXBwb2ludG1lbnQuc3RhdHVzID09PSAnYWNjZXB0ZWQnID8gJyMwNjVmNDYnIDpcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhcHBvaW50bWVudC5zdGF0dXMgPT09ICdyZWplY3RlZCcgPyAnIzk5MWIxYicgOiAnIzM3NDE1MSdcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH19PlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICB7KGFwcG9pbnRtZW50LnN0YXR1cyB8fCAncGVuZGluZycpLmNoYXJBdCgwKS50b1VwcGVyQ2FzZSgpICsgKGFwcG9pbnRtZW50LnN0YXR1cyB8fCAncGVuZGluZycpLnNsaWNlKDEpfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPC9zcGFuPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgIDwvdGQ+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgPHRkIHN0eWxlPXt7IHBhZGRpbmc6ICcxNnB4IDI0cHgnLCBmb250U2l6ZTogJzE0cHgnLCBjb2xvcjogJyM2YjcyODAnIH19PlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAge2FwcG9pbnRtZW50LmNyZWF0ZWRfYXQgPyBmb3JtYXREYXRlKGFwcG9pbnRtZW50LmNyZWF0ZWRfYXQpIDogJy0nfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgIDwvdGQ+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgPHRkIHN0eWxlPXt7IHBhZGRpbmc6ICcxNnB4IDI0cHgnLCBmb250U2l6ZTogJzE0cHgnLCBmb250V2VpZ2h0OiAnNTAwJyB9fT5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHthcHBvaW50bWVudC5mcmVlbGFuY2VyX2ZpcnN0X25hbWV9IHthcHBvaW50bWVudC5mcmVlbGFuY2VyX2xhc3RfbmFtZX1cclxuICAgICAgICAgICAgICAgICAgICAgICAgICA8L3RkPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICA8L3RyPlxyXG4gICAgICAgICAgICAgICAgICAgICAgKSl9XHJcbiAgICAgICAgICAgICAgICAgICAgPC90Ym9keT5cclxuICAgICAgICAgICAgICAgICAgPC90YWJsZT5cclxuICAgICAgICAgICAgICAgICkgOiAoXHJcbiAgICAgICAgICAgICAgICAgIDxkaXYgc3R5bGU9e3sgdGV4dEFsaWduOiAnY2VudGVyJywgcGFkZGluZzogJzQ4cHggMjRweCcsIGNvbG9yOiAnIzZiNzI4MCcgfX0+XHJcbiAgICAgICAgICAgICAgICAgICAgPGRpdiBzdHlsZT17eyBmb250U2l6ZTogJzQ4cHgnLCBtYXJnaW5Cb3R0b206ICcxNnB4JyB9fT7wn5OFPC9kaXY+XHJcbiAgICAgICAgICAgICAgICAgICAgPHAgc3R5bGU9e3sgbWFyZ2luOiAnMCcsIGZvbnRTaXplOiAnMTZweCcsIGZvbnRXZWlnaHQ6ICc1MDAnIH19Pk5vIHJlY2VudCBhcHBvaW50bWVudHMgZm91bmQ8L3A+XHJcbiAgICAgICAgICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICAgICAgICAgKX1cclxuICAgICAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICApfVxyXG5cclxuICAgICAgICB7YWN0aXZlVGFiID09PSAnYXBwb2ludG1lbnRzJyAmJiAoXHJcbiAgICAgICAgICA8ZGl2PlxyXG4gICAgICAgICAgICA8ZGl2IHN0eWxlPXt7IFxyXG4gICAgICAgICAgICAgIGRpc3BsYXk6ICdncmlkJywgXHJcbiAgICAgICAgICAgICAgZ3JpZFRlbXBsYXRlQ29sdW1uczogJ3JlcGVhdChhdXRvLWZpdCwgbWlubWF4KDIwMHB4LCAxZnIpKScsIFxyXG4gICAgICAgICAgICAgIGdhcDogJzE2cHgnLFxyXG4gICAgICAgICAgICAgIG1hcmdpbkJvdHRvbTogJzMycHgnXHJcbiAgICAgICAgICAgIH19PlxyXG4gICAgICAgICAgICAgIDxkaXYgc3R5bGU9e3tcclxuICAgICAgICAgICAgICAgIHBhZGRpbmc6ICcyMHB4JyxcclxuICAgICAgICAgICAgICAgIGJhY2tncm91bmRDb2xvcjogJ3doaXRlJyxcclxuICAgICAgICAgICAgICAgIGJvcmRlclJhZGl1czogJzEycHgnLFxyXG4gICAgICAgICAgICAgICAgYm94U2hhZG93OiAnMCAxcHggM3B4IHJnYmEoMCwwLDAsMC4xKScsXHJcbiAgICAgICAgICAgICAgICBib3JkZXI6ICcxcHggc29saWQgI2U1ZTdlYidcclxuICAgICAgICAgICAgICB9fT5cclxuICAgICAgICAgICAgICAgIDxkaXYgc3R5bGU9e3sgZGlzcGxheTogJ2ZsZXgnLCBhbGlnbkl0ZW1zOiAnY2VudGVyJywgbWFyZ2luQm90dG9tOiAnOHB4JyB9fT5cclxuICAgICAgICAgICAgICAgICAgPGRpdiBzdHlsZT17eyB3aWR0aDogJzhweCcsIGhlaWdodDogJzhweCcsIGJhY2tncm91bmRDb2xvcjogJyNmNTllMGInLCBib3JkZXJSYWRpdXM6ICc1MCUnLCBtYXJnaW5SaWdodDogJzhweCcgfX0+PC9kaXY+XHJcbiAgICAgICAgICAgICAgICAgIDxzcGFuIHN0eWxlPXt7IGZvbnRTaXplOiAnMTRweCcsIGNvbG9yOiAnIzZiNzI4MCcsIGZvbnRXZWlnaHQ6ICc1MDAnIH19PlBlbmRpbmc8L3NwYW4+XHJcbiAgICAgICAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgICAgICAgIDxkaXYgc3R5bGU9e3sgZm9udFNpemU6ICcyNHB4JywgZm9udFdlaWdodDogJzcwMCcsIGNvbG9yOiAnIzFlMjkzYicgfX0+XHJcbiAgICAgICAgICAgICAgICAgIHtkYXRhPy5hcHBvaW50bWVudHM/Lm92ZXJ2aWV3Py5wZW5kaW5nQXBwb2ludG1lbnRzIHx8IDB9XHJcbiAgICAgICAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgICAgICBcclxuICAgICAgICAgICAgICA8ZGl2IHN0eWxlPXt7XHJcbiAgICAgICAgICAgICAgICBwYWRkaW5nOiAnMjBweCcsXHJcbiAgICAgICAgICAgICAgICBiYWNrZ3JvdW5kQ29sb3I6ICd3aGl0ZScsXHJcbiAgICAgICAgICAgICAgICBib3JkZXJSYWRpdXM6ICcxMnB4JyxcclxuICAgICAgICAgICAgICAgIGJveFNoYWRvdzogJzAgMXB4IDNweCByZ2JhKDAsMCwwLDAuMSknLFxyXG4gICAgICAgICAgICAgICAgYm9yZGVyOiAnMXB4IHNvbGlkICNlNWU3ZWInXHJcbiAgICAgICAgICAgICAgfX0+XHJcbiAgICAgICAgICAgICAgICA8ZGl2IHN0eWxlPXt7IGRpc3BsYXk6ICdmbGV4JywgYWxpZ25JdGVtczogJ2NlbnRlcicsIG1hcmdpbkJvdHRvbTogJzhweCcgfX0+XHJcbiAgICAgICAgICAgICAgICAgIDxkaXYgc3R5bGU9e3sgd2lkdGg6ICc4cHgnLCBoZWlnaHQ6ICc4cHgnLCBiYWNrZ3JvdW5kQ29sb3I6ICcjMTBiOTgxJywgYm9yZGVyUmFkaXVzOiAnNTAlJywgbWFyZ2luUmlnaHQ6ICc4cHgnIH19PjwvZGl2PlxyXG4gICAgICAgICAgICAgICAgICA8c3BhbiBzdHlsZT17eyBmb250U2l6ZTogJzE0cHgnLCBjb2xvcjogJyM2YjcyODAnLCBmb250V2VpZ2h0OiAnNTAwJyB9fT5BY2NlcHRlZDwvc3Bhbj5cclxuICAgICAgICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICAgICAgICAgPGRpdiBzdHlsZT17eyBmb250U2l6ZTogJzI0cHgnLCBmb250V2VpZ2h0OiAnNzAwJywgY29sb3I6ICcjMWUyOTNiJyB9fT5cclxuICAgICAgICAgICAgICAgICAge2RhdGE/LmFwcG9pbnRtZW50cz8ub3ZlcnZpZXc/LmFjY2VwdGVkQXBwb2ludG1lbnRzIHx8IDB9XHJcbiAgICAgICAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgICAgICBcclxuICAgICAgICAgICAgICA8ZGl2IHN0eWxlPXt7XHJcbiAgICAgICAgICAgICAgICBwYWRkaW5nOiAnMjBweCcsXHJcbiAgICAgICAgICAgICAgICBiYWNrZ3JvdW5kQ29sb3I6ICd3aGl0ZScsXHJcbiAgICAgICAgICAgICAgICBib3JkZXJSYWRpdXM6ICcxMnB4JyxcclxuICAgICAgICAgICAgICAgIGJveFNoYWRvdzogJzAgMXB4IDNweCByZ2JhKDAsMCwwLDAuMSknLFxyXG4gICAgICAgICAgICAgICAgYm9yZGVyOiAnMXB4IHNvbGlkICNlNWU3ZWInXHJcbiAgICAgICAgICAgICAgfX0+XHJcbiAgICAgICAgICAgICAgICA8ZGl2IHN0eWxlPXt7IGRpc3BsYXk6ICdmbGV4JywgYWxpZ25JdGVtczogJ2NlbnRlcicsIG1hcmdpbkJvdHRvbTogJzhweCcgfX0+XHJcbiAgICAgICAgICAgICAgICAgIDxkaXYgc3R5bGU9e3sgd2lkdGg6ICc4cHgnLCBoZWlnaHQ6ICc4cHgnLCBiYWNrZ3JvdW5kQ29sb3I6ICcjZWY0NDQ0JywgYm9yZGVyUmFkaXVzOiAnNTAlJywgbWFyZ2luUmlnaHQ6ICc4cHgnIH19PjwvZGl2PlxyXG4gICAgICAgICAgICAgICAgICA8c3BhbiBzdHlsZT17eyBmb250U2l6ZTogJzE0cHgnLCBjb2xvcjogJyM2YjcyODAnLCBmb250V2VpZ2h0OiAnNTAwJyB9fT5SZWplY3RlZDwvc3Bhbj5cclxuICAgICAgICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICAgICAgICAgPGRpdiBzdHlsZT17eyBmb250U2l6ZTogJzI0cHgnLCBmb250V2VpZ2h0OiAnNzAwJywgY29sb3I6ICcjMWUyOTNiJyB9fT5cclxuICAgICAgICAgICAgICAgICAge2RhdGE/LmFwcG9pbnRtZW50cz8ub3ZlcnZpZXc/LnJlamVjdGVkQXBwb2ludG1lbnRzIHx8IDB9XHJcbiAgICAgICAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgICAgICBcclxuICAgICAgICAgICAgICA8ZGl2IHN0eWxlPXt7XHJcbiAgICAgICAgICAgICAgICBwYWRkaW5nOiAnMjBweCcsXHJcbiAgICAgICAgICAgICAgICBiYWNrZ3JvdW5kQ29sb3I6ICd3aGl0ZScsXHJcbiAgICAgICAgICAgICAgICBib3JkZXJSYWRpdXM6ICcxMnB4JyxcclxuICAgICAgICAgICAgICAgIGJveFNoYWRvdzogJzAgMXB4IDNweCByZ2JhKDAsMCwwLDAuMSknLFxyXG4gICAgICAgICAgICAgICAgYm9yZGVyOiAnMXB4IHNvbGlkICNlNWU3ZWInXHJcbiAgICAgICAgICAgICAgfX0+XHJcbiAgICAgICAgICAgICAgICA8ZGl2IHN0eWxlPXt7IGRpc3BsYXk6ICdmbGV4JywgYWxpZ25JdGVtczogJ2NlbnRlcicsIG1hcmdpbkJvdHRvbTogJzhweCcgfX0+XHJcbiAgICAgICAgICAgICAgICAgIDxkaXYgc3R5bGU9e3sgd2lkdGg6ICc4cHgnLCBoZWlnaHQ6ICc4cHgnLCBiYWNrZ3JvdW5kQ29sb3I6ICcjM2I4MmY2JywgYm9yZGVyUmFkaXVzOiAnNTAlJywgbWFyZ2luUmlnaHQ6ICc4cHgnIH19PjwvZGl2PlxyXG4gICAgICAgICAgICAgICAgICA8c3BhbiBzdHlsZT17eyBmb250U2l6ZTogJzE0cHgnLCBjb2xvcjogJyM2YjcyODAnLCBmb250V2VpZ2h0OiAnNTAwJyB9fT5BY2NlcHRhbmNlIFJhdGU8L3NwYW4+XHJcbiAgICAgICAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgICAgICAgIDxkaXYgc3R5bGU9e3sgZm9udFNpemU6ICcyNHB4JywgZm9udFdlaWdodDogJzcwMCcsIGNvbG9yOiAnIzFlMjkzYicgfX0+XHJcbiAgICAgICAgICAgICAgICAgIHtmb3JtYXRQZXJjZW50YWdlKGRhdGE/LmFwcG9pbnRtZW50cz8ub3ZlcnZpZXc/LmFjY2VwdGFuY2VSYXRlIHx8IDApfVxyXG4gICAgICAgICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgICAgIDwvZGl2PlxyXG5cclxuICAgICAgICAgICAge2RhdGE/LmFwcG9pbnRtZW50cz8udG9wRnJlZWxhbmNlcnM/Lmxlbmd0aCA+IDAgJiYgKFxyXG4gICAgICAgICAgICAgIDxkaXYgc3R5bGU9e3tcclxuICAgICAgICAgICAgICAgIGJhY2tncm91bmRDb2xvcjogJ3doaXRlJyxcclxuICAgICAgICAgICAgICAgIGJvcmRlclJhZGl1czogJzEycHgnLFxyXG4gICAgICAgICAgICAgICAgYm94U2hhZG93OiAnMCAxcHggM3B4IHJnYmEoMCwwLDAsMC4xKScsXHJcbiAgICAgICAgICAgICAgICBib3JkZXI6ICcxcHggc29saWQgI2U1ZTdlYicsXHJcbiAgICAgICAgICAgICAgICBvdmVyZmxvdzogJ2hpZGRlbidcclxuICAgICAgICAgICAgICB9fT5cclxuICAgICAgICAgICAgICAgIDxkaXYgc3R5bGU9e3sgXHJcbiAgICAgICAgICAgICAgICAgIHBhZGRpbmc6ICcyMHB4IDI0cHgnLCBcclxuICAgICAgICAgICAgICAgICAgYm9yZGVyQm90dG9tOiAnMXB4IHNvbGlkICNlNWU3ZWInLFxyXG4gICAgICAgICAgICAgICAgICBiYWNrZ3JvdW5kQ29sb3I6ICcjZjhmYWZjJ1xyXG4gICAgICAgICAgICAgICAgfX0+XHJcbiAgICAgICAgICAgICAgICAgIDxoMyBzdHlsZT17eyBtYXJnaW46ICcwJywgZm9udFNpemU6ICcxOHB4JywgZm9udFdlaWdodDogJzYwMCcsIGNvbG9yOiAnIzFlMjkzYicgfX0+XHJcbiAgICAgICAgICAgICAgICAgICAgVG9wIFBlcmZvcm1pbmcgRnJlZWxhbmNlcnNcclxuICAgICAgICAgICAgICAgICAgPC9oMz5cclxuICAgICAgICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICAgICAgICAgPHRhYmxlIHN0eWxlPXt7IHdpZHRoOiAnMTAwJScsIGJvcmRlckNvbGxhcHNlOiAnY29sbGFwc2UnIH19PlxyXG4gICAgICAgICAgICAgICAgICA8dGhlYWQgc3R5bGU9e3sgYmFja2dyb3VuZENvbG9yOiAnI2Y4ZmFmYycgfX0+XHJcbiAgICAgICAgICAgICAgICAgICAgPHRyPlxyXG4gICAgICAgICAgICAgICAgICAgICAgPHRoIHN0eWxlPXt7IHRleHRBbGlnbjogJ2xlZnQnLCBwYWRkaW5nOiAnMTJweCAyNHB4JywgZm9udFNpemU6ICcxNHB4JywgZm9udFdlaWdodDogJzYwMCcsIGNvbG9yOiAnIzM3NDE1MScgfX0+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIEZyZWVsYW5jZXJcclxuICAgICAgICAgICAgICAgICAgICAgIDwvdGg+XHJcbiAgICAgICAgICAgICAgICAgICAgICA8dGggc3R5bGU9e3sgdGV4dEFsaWduOiAnbGVmdCcsIHBhZGRpbmc6ICcxMnB4IDI0cHgnLCBmb250U2l6ZTogJzE0cHgnLCBmb250V2VpZ2h0OiAnNjAwJywgY29sb3I6ICcjMzc0MTUxJyB9fT5cclxuICAgICAgICAgICAgICAgICAgICAgICAgVG90YWxcclxuICAgICAgICAgICAgICAgICAgICAgIDwvdGg+XHJcbiAgICAgICAgICAgICAgICAgICAgICA8dGggc3R5bGU9e3sgdGV4dEFsaWduOiAnbGVmdCcsIHBhZGRpbmc6ICcxMnB4IDI0cHgnLCBmb250U2l6ZTogJzE0cHgnLCBmb250V2VpZ2h0OiAnNjAwJywgY29sb3I6ICcjMzc0MTUxJyB9fT5cclxuICAgICAgICAgICAgICAgICAgICAgICAgQWNjZXB0ZWRcclxuICAgICAgICAgICAgICAgICAgICAgIDwvdGg+XHJcbiAgICAgICAgICAgICAgICAgICAgICA8dGggc3R5bGU9e3sgdGV4dEFsaWduOiAnbGVmdCcsIHBhZGRpbmc6ICcxMnB4IDI0cHgnLCBmb250U2l6ZTogJzE0cHgnLCBmb250V2VpZ2h0OiAnNjAwJywgY29sb3I6ICcjMzc0MTUxJyB9fT5cclxuICAgICAgICAgICAgICAgICAgICAgICAgU3VjY2VzcyBSYXRlXHJcbiAgICAgICAgICAgICAgICAgICAgICA8L3RoPlxyXG4gICAgICAgICAgICAgICAgICAgIDwvdHI+XHJcbiAgICAgICAgICAgICAgICAgIDwvdGhlYWQ+XHJcbiAgICAgICAgICAgICAgICAgIDx0Ym9keT5cclxuICAgICAgICAgICAgICAgICAgICB7ZGF0YS5hcHBvaW50bWVudHMudG9wRnJlZWxhbmNlcnMubWFwKChmcmVlbGFuY2VyLCBpbmRleCkgPT4gKFxyXG4gICAgICAgICAgICAgICAgICAgICAgPHRyIGtleT17aW5kZXh9IHN0eWxlPXt7IGJvcmRlckJvdHRvbTogJzFweCBzb2xpZCAjZjNmNGY2JyB9fT5cclxuICAgICAgICAgICAgICAgICAgICAgICAgPHRkIHN0eWxlPXt7IHBhZGRpbmc6ICcxNnB4IDI0cHgnLCBmb250U2l6ZTogJzE0cHgnIH19PlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgIDxkaXYgc3R5bGU9e3sgZGlzcGxheTogJ2ZsZXgnLCBhbGlnbkl0ZW1zOiAnY2VudGVyJyB9fT5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxkaXYgc3R5bGU9e3tcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgd2lkdGg6ICc0MHB4JyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaGVpZ2h0OiAnNDBweCcsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJhY2tncm91bmRDb2xvcjogJyMzYjgyZjYnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICBib3JkZXJSYWRpdXM6ICc1MCUnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkaXNwbGF5OiAnZmxleCcsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFsaWduSXRlbXM6ICdjZW50ZXInLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICBqdXN0aWZ5Q29udGVudDogJ2NlbnRlcicsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbG9yOiAnd2hpdGUnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICBmb250V2VpZ2h0OiAnNjAwJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZm9udFNpemU6ICcxNnB4JyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbWFyZ2luUmlnaHQ6ICcxMnB4J1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfX0+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHtmcmVlbGFuY2VyLmZpcnN0X25hbWU/LlswXX17ZnJlZWxhbmNlci5sYXN0X25hbWU/LlswXX1cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPGRpdj5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPGRpdiBzdHlsZT17eyBmb250V2VpZ2h0OiAnNjAwJywgY29sb3I6ICcjMWUyOTNiJyB9fT5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB7ZnJlZWxhbmNlci5maXJzdF9uYW1lfSB7ZnJlZWxhbmNlci5sYXN0X25hbWV9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8ZGl2IHN0eWxlPXt7IGZvbnRTaXplOiAnMTJweCcsIGNvbG9yOiAnIzZiNzI4MCcgfX0+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAge2ZyZWVsYW5jZXIuZW1haWx9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIDwvdGQ+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIDx0ZCBzdHlsZT17eyBwYWRkaW5nOiAnMTZweCAyNHB4JywgZm9udFNpemU6ICcxNnB4JywgZm9udFdlaWdodDogJzYwMCcsIGNvbG9yOiAnIzFlMjkzYicgfX0+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAge2ZyZWVsYW5jZXIudG90YWxfYXBwb2ludG1lbnRzfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICA8L3RkPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICA8dGQgc3R5bGU9e3sgcGFkZGluZzogJzE2cHggMjRweCcsIGZvbnRTaXplOiAnMTZweCcsIGZvbnRXZWlnaHQ6ICc2MDAnLCBjb2xvcjogJyMxMGI5ODEnIH19PlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgIHtmcmVlbGFuY2VyLmFjY2VwdGVkX2FwcG9pbnRtZW50c31cclxuICAgICAgICAgICAgICAgICAgICAgICAgPC90ZD5cclxuICAgICAgICAgICAgICAgICAgICAgICAgPHRkIHN0eWxlPXt7IHBhZGRpbmc6ICcxNnB4IDI0cHgnLCBmb250U2l6ZTogJzE2cHgnLCBmb250V2VpZ2h0OiAnNjAwJywgY29sb3I6ICcjM2I4MmY2JyB9fT5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICB7Zm9ybWF0UGVyY2VudGFnZShmcmVlbGFuY2VyLmFjY2VwdGFuY2VfcmF0ZSl9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIDwvdGQ+XHJcbiAgICAgICAgICAgICAgICAgICAgICA8L3RyPlxyXG4gICAgICAgICAgICAgICAgICAgICkpfVxyXG4gICAgICAgICAgICAgICAgICA8L3Rib2R5PlxyXG4gICAgICAgICAgICAgICAgPC90YWJsZT5cclxuICAgICAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgICAgKX1cclxuICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICl9XHJcblxyXG4gICAgICAgIHthY3RpdmVUYWIgPT09ICd1c2VycycgJiYgKFxyXG4gICAgICAgICAgPGRpdj5cclxuICAgICAgICAgICAgPGRpdiBzdHlsZT17eyBcclxuICAgICAgICAgICAgICBkaXNwbGF5OiAnZ3JpZCcsIFxyXG4gICAgICAgICAgICAgIGdyaWRUZW1wbGF0ZUNvbHVtbnM6ICdyZXBlYXQoYXV0by1maXQsIG1pbm1heCgyMDBweCwgMWZyKSknLCBcclxuICAgICAgICAgICAgICBnYXA6ICcxNnB4JyxcclxuICAgICAgICAgICAgICBtYXJnaW5Cb3R0b206ICczMnB4J1xyXG4gICAgICAgICAgICB9fT5cclxuICAgICAgICAgICAgICA8ZGl2IHN0eWxlPXt7XHJcbiAgICAgICAgICAgICAgICBwYWRkaW5nOiAnMjBweCcsXHJcbiAgICAgICAgICAgICAgICBiYWNrZ3JvdW5kQ29sb3I6ICd3aGl0ZScsXHJcbiAgICAgICAgICAgICAgICBib3JkZXJSYWRpdXM6ICcxMnB4JyxcclxuICAgICAgICAgICAgICAgIGJveFNoYWRvdzogJzAgMXB4IDNweCByZ2JhKDAsMCwwLDAuMSknLFxyXG4gICAgICAgICAgICAgICAgYm9yZGVyOiAnMXB4IHNvbGlkICNlNWU3ZWInXHJcbiAgICAgICAgICAgICAgfX0+XHJcbiAgICAgICAgICAgICAgICA8ZGl2IHN0eWxlPXt7IGZvbnRTaXplOiAnMTRweCcsIGNvbG9yOiAnIzZiNzI4MCcsIG1hcmdpbkJvdHRvbTogJzhweCcsIGZvbnRXZWlnaHQ6ICc1MDAnIH19PlRvdGFsIFVzZXJzPC9kaXY+XHJcbiAgICAgICAgICAgICAgICA8ZGl2IHN0eWxlPXt7IGZvbnRTaXplOiAnMjRweCcsIGZvbnRXZWlnaHQ6ICc3MDAnLCBjb2xvcjogJyMxZTI5M2InIH19PlxyXG4gICAgICAgICAgICAgICAgICB7KGRhdGE/LnVzZXJzPy5vdmVydmlldz8udG90YWxVc2VycyB8fCAwKS50b0xvY2FsZVN0cmluZygpfVxyXG4gICAgICAgICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgICAgICAgXHJcbiAgICAgICAgICAgICAgPGRpdiBzdHlsZT17e1xyXG4gICAgICAgICAgICAgICAgcGFkZGluZzogJzIwcHgnLFxyXG4gICAgICAgICAgICAgICAgYmFja2dyb3VuZENvbG9yOiAnd2hpdGUnLFxyXG4gICAgICAgICAgICAgICAgYm9yZGVyUmFkaXVzOiAnMTJweCcsXHJcbiAgICAgICAgICAgICAgICBib3hTaGFkb3c6ICcwIDFweCAzcHggcmdiYSgwLDAsMCwwLjEpJyxcclxuICAgICAgICAgICAgICAgIGJvcmRlcjogJzFweCBzb2xpZCAjZTVlN2ViJ1xyXG4gICAgICAgICAgICAgIH19PlxyXG4gICAgICAgICAgICAgICAgPGRpdiBzdHlsZT17eyBmb250U2l6ZTogJzE0cHgnLCBjb2xvcjogJyMzYjgyZjYnLCBtYXJnaW5Cb3R0b206ICc4cHgnLCBmb250V2VpZ2h0OiAnNTAwJyB9fT5DbGllbnRzPC9kaXY+XHJcbiAgICAgICAgICAgICAgICA8ZGl2IHN0eWxlPXt7IGZvbnRTaXplOiAnMjRweCcsIGZvbnRXZWlnaHQ6ICc3MDAnLCBjb2xvcjogJyMxZTI5M2InIH19PlxyXG4gICAgICAgICAgICAgICAgICB7KGRhdGE/LnVzZXJzPy5vdmVydmlldz8udG90YWxDbGllbnRzIHx8IDApLnRvTG9jYWxlU3RyaW5nKCl9XHJcbiAgICAgICAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgICAgICBcclxuICAgICAgICAgICAgICA8ZGl2IHN0eWxlPXt7XHJcbiAgICAgICAgICAgICAgICBwYWRkaW5nOiAnMjBweCcsXHJcbiAgICAgICAgICAgICAgICBiYWNrZ3JvdW5kQ29sb3I6ICd3aGl0ZScsXHJcbiAgICAgICAgICAgICAgICBib3JkZXJSYWRpdXM6ICcxMnB4JyxcclxuICAgICAgICAgICAgICAgIGJveFNoYWRvdzogJzAgMXB4IDNweCByZ2JhKDAsMCwwLDAuMSknLFxyXG4gICAgICAgICAgICAgICAgYm9yZGVyOiAnMXB4IHNvbGlkICNlNWU3ZWInXHJcbiAgICAgICAgICAgICAgfX0+XHJcbiAgICAgICAgICAgICAgICA8ZGl2IHN0eWxlPXt7IGZvbnRTaXplOiAnMTRweCcsIGNvbG9yOiAnIzhiNWNmNicsIG1hcmdpbkJvdHRvbTogJzhweCcsIGZvbnRXZWlnaHQ6ICc1MDAnIH19PkZyZWVsYW5jZXJzPC9kaXY+XHJcbiAgICAgICAgICAgICAgICA8ZGl2IHN0eWxlPXt7IGZvbnRTaXplOiAnMjRweCcsIGZvbnRXZWlnaHQ6ICc3MDAnLCBjb2xvcjogJyMxZTI5M2InIH19PlxyXG4gICAgICAgICAgICAgICAgICB7KGRhdGE/LnVzZXJzPy5vdmVydmlldz8udG90YWxGcmVlbGFuY2VycyB8fCAwKS50b0xvY2FsZVN0cmluZygpfVxyXG4gICAgICAgICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgICAgICAgXHJcbiAgICAgICAgICAgICAgPGRpdiBzdHlsZT17e1xyXG4gICAgICAgICAgICAgICAgcGFkZGluZzogJzIwcHgnLFxyXG4gICAgICAgICAgICAgICAgYmFja2dyb3VuZENvbG9yOiAnd2hpdGUnLFxyXG4gICAgICAgICAgICAgICAgYm9yZGVyUmFkaXVzOiAnMTJweCcsXHJcbiAgICAgICAgICAgICAgICBib3hTaGFkb3c6ICcwIDFweCAzcHggcmdiYSgwLDAsMCwwLjEpJyxcclxuICAgICAgICAgICAgICAgIGJvcmRlcjogJzFweCBzb2xpZCAjZTVlN2ViJ1xyXG4gICAgICAgICAgICAgIH19PlxyXG4gICAgICAgICAgICAgICAgPGRpdiBzdHlsZT17eyBmb250U2l6ZTogJzE0cHgnLCBjb2xvcjogJyMxMGI5ODEnLCBtYXJnaW5Cb3R0b206ICc4cHgnLCBmb250V2VpZ2h0OiAnNTAwJyB9fT5OZXcgVGhpcyBNb250aDwvZGl2PlxyXG4gICAgICAgICAgICAgICAgPGRpdiBzdHlsZT17eyBmb250U2l6ZTogJzI0cHgnLCBmb250V2VpZ2h0OiAnNzAwJywgY29sb3I6ICcjMWUyOTNiJyB9fT5cclxuICAgICAgICAgICAgICAgICAgeyhkYXRhPy51c2Vycz8ub3ZlcnZpZXc/Lm5ld1VzZXJzTW9udGggfHwgMCkudG9Mb2NhbGVTdHJpbmcoKX1cclxuICAgICAgICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICAgICA8L2Rpdj5cclxuXHJcbiAgICAgICAgICAgIHtkYXRhPy51c2Vycz8ucmVjZW50VXNlcnM/Lmxlbmd0aCA+IDAgJiYgKFxyXG4gICAgICAgICAgICAgIDxkaXYgc3R5bGU9e3tcclxuICAgICAgICAgICAgICAgIGJhY2tncm91bmRDb2xvcjogJ3doaXRlJyxcclxuICAgICAgICAgICAgICAgIGJvcmRlclJhZGl1czogJzEycHgnLFxyXG4gICAgICAgICAgICAgICAgYm94U2hhZG93OiAnMCAxcHggM3B4IHJnYmEoMCwwLDAsMC4xKScsXHJcbiAgICAgICAgICAgICAgICBib3JkZXI6ICcxcHggc29saWQgI2U1ZTdlYicsXHJcbiAgICAgICAgICAgICAgICBvdmVyZmxvdzogJ2hpZGRlbidcclxuICAgICAgICAgICAgICB9fT5cclxuICAgICAgICAgICAgICAgIDxkaXYgc3R5bGU9e3sgXHJcbiAgICAgICAgICAgICAgICAgIHBhZGRpbmc6ICcyMHB4IDI0cHgnLCBcclxuICAgICAgICAgICAgICAgICAgYm9yZGVyQm90dG9tOiAnMXB4IHNvbGlkICNlNWU3ZWInLFxyXG4gICAgICAgICAgICAgICAgICBiYWNrZ3JvdW5kQ29sb3I6ICcjZjhmYWZjJ1xyXG4gICAgICAgICAgICAgICAgfX0+XHJcbiAgICAgICAgICAgICAgICAgIDxoMyBzdHlsZT17eyBtYXJnaW46ICcwJywgZm9udFNpemU6ICcxOHB4JywgZm9udFdlaWdodDogJzYwMCcsIGNvbG9yOiAnIzFlMjkzYicgfX0+XHJcbiAgICAgICAgICAgICAgICAgICAgUmVjZW50IFVzZXIgUmVnaXN0cmF0aW9uc1xyXG4gICAgICAgICAgICAgICAgICA8L2gzPlxyXG4gICAgICAgICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgICAgICAgICA8dGFibGUgc3R5bGU9e3sgd2lkdGg6ICcxMDAlJywgYm9yZGVyQ29sbGFwc2U6ICdjb2xsYXBzZScgfX0+XHJcbiAgICAgICAgICAgICAgICAgIDx0aGVhZCBzdHlsZT17eyBiYWNrZ3JvdW5kQ29sb3I6ICcjZjhmYWZjJyB9fT5cclxuICAgICAgICAgICAgICAgICAgICA8dHI+XHJcbiAgICAgICAgICAgICAgICAgICAgICA8dGggc3R5bGU9e3sgdGV4dEFsaWduOiAnbGVmdCcsIHBhZGRpbmc6ICcxMnB4IDI0cHgnLCBmb250U2l6ZTogJzE0cHgnLCBmb250V2VpZ2h0OiAnNjAwJywgY29sb3I6ICcjMzc0MTUxJyB9fT5cclxuICAgICAgICAgICAgICAgICAgICAgICAgVXNlclxyXG4gICAgICAgICAgICAgICAgICAgICAgPC90aD5cclxuICAgICAgICAgICAgICAgICAgICAgIDx0aCBzdHlsZT17eyB0ZXh0QWxpZ246ICdsZWZ0JywgcGFkZGluZzogJzEycHggMjRweCcsIGZvbnRTaXplOiAnMTRweCcsIGZvbnRXZWlnaHQ6ICc2MDAnLCBjb2xvcjogJyMzNzQxNTEnIH19PlxyXG4gICAgICAgICAgICAgICAgICAgICAgICBFbWFpbFxyXG4gICAgICAgICAgICAgICAgICAgICAgPC90aD5cclxuICAgICAgICAgICAgICAgICAgICAgIDx0aCBzdHlsZT17eyB0ZXh0QWxpZ246ICdsZWZ0JywgcGFkZGluZzogJzEycHggMjRweCcsIGZvbnRTaXplOiAnMTRweCcsIGZvbnRXZWlnaHQ6ICc2MDAnLCBjb2xvcjogJyMzNzQxNTEnIH19PlxyXG4gICAgICAgICAgICAgICAgICAgICAgICBSb2xlXHJcbiAgICAgICAgICAgICAgICAgICAgICA8L3RoPlxyXG4gICAgICAgICAgICAgICAgICAgICAgPHRoIHN0eWxlPXt7IHRleHRBbGlnbjogJ2xlZnQnLCBwYWRkaW5nOiAnMTJweCAyNHB4JywgZm9udFNpemU6ICcxNHB4JywgZm9udFdlaWdodDogJzYwMCcsIGNvbG9yOiAnIzM3NDE1MScgfX0+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIEpvaW5lZFxyXG4gICAgICAgICAgICAgICAgICAgICAgPC90aD5cclxuICAgICAgICAgICAgICAgICAgICA8L3RyPlxyXG4gICAgICAgICAgICAgICAgICA8L3RoZWFkPlxyXG4gICAgICAgICAgICAgICAgICA8dGJvZHk+XHJcbiAgICAgICAgICAgICAgICAgICAge2RhdGEudXNlcnMucmVjZW50VXNlcnMuc2xpY2UoMCwgMTApLm1hcCgodXNlciwgaW5kZXgpID0+IChcclxuICAgICAgICAgICAgICAgICAgICAgIDx0ciBrZXk9e2luZGV4fSBzdHlsZT17eyBib3JkZXJCb3R0b206ICcxcHggc29saWQgI2YzZjRmNicgfX0+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIDx0ZCBzdHlsZT17eyBwYWRkaW5nOiAnMTZweCAyNHB4JywgZm9udFNpemU6ICcxNHB4JywgZm9udFdlaWdodDogJzYwMCcsIGNvbG9yOiAnIzFlMjkzYicgfX0+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAge3VzZXIuZmlyc3RfbmFtZX0ge3VzZXIubGFzdF9uYW1lfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICA8L3RkPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICA8dGQgc3R5bGU9e3sgcGFkZGluZzogJzE2cHggMjRweCcsIGZvbnRTaXplOiAnMTRweCcsIGNvbG9yOiAnIzZiNzI4MCcgfX0+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAge3VzZXIuZW1haWx9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIDwvdGQ+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIDx0ZCBzdHlsZT17eyBwYWRkaW5nOiAnMTZweCAyNHB4JywgZm9udFNpemU6ICcxNHB4JyB9fT5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICA8c3BhbiBzdHlsZT17e1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcGFkZGluZzogJzRweCAxMnB4JyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJvcmRlclJhZGl1czogJzIwcHgnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZm9udFNpemU6ICcxMnB4JyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZvbnRXZWlnaHQ6ICc2MDAnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYmFja2dyb3VuZENvbG9yOiB1c2VyLnJvbGVfaWQgPT09IDIgPyAnI2RiZWFmZScgOiB1c2VyLnJvbGVfaWQgPT09IDMgPyAnI2YzZThmZicgOiAnI2YzZjRmNicsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb2xvcjogdXNlci5yb2xlX2lkID09PSAyID8gJyMxZTQwYWYnIDogdXNlci5yb2xlX2lkID09PSAzID8gJyM3YzNhZWQnIDogJyMzNzQxNTEnXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgfX0+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB7dXNlci5yb2xlX2lkID09PSAyID8gJ0NsaWVudCcgOiB1c2VyLnJvbGVfaWQgPT09IDMgPyAnRnJlZWxhbmNlcicgOiAnVXNlcid9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgPC9zcGFuPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICA8L3RkPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICA8dGQgc3R5bGU9e3sgcGFkZGluZzogJzE2cHggMjRweCcsIGZvbnRTaXplOiAnMTRweCcsIGNvbG9yOiAnIzZiNzI4MCcgfX0+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAge3VzZXIuY3JlYXRlZF9hdCA/IGZvcm1hdERhdGUodXNlci5jcmVhdGVkX2F0KSA6ICctJ31cclxuICAgICAgICAgICAgICAgICAgICAgICAgPC90ZD5cclxuICAgICAgICAgICAgICAgICAgICAgIDwvdHI+XHJcbiAgICAgICAgICAgICAgICAgICAgKSl9XHJcbiAgICAgICAgICAgICAgICAgIDwvdGJvZHk+XHJcbiAgICAgICAgICAgICAgICA8L3RhYmxlPlxyXG4gICAgICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICAgICApfVxyXG4gICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgKX1cclxuXHJcbiAgICAgICAge2FjdGl2ZVRhYiA9PT0gJ3Byb2plY3RzJyAmJiAoXHJcbiAgICAgICAgICA8ZGl2PlxyXG4gICAgICAgICAgICA8ZGl2IHN0eWxlPXt7IFxyXG4gICAgICAgICAgICAgIGRpc3BsYXk6ICdncmlkJywgXHJcbiAgICAgICAgICAgICAgZ3JpZFRlbXBsYXRlQ29sdW1uczogJ3JlcGVhdChhdXRvLWZpdCwgbWlubWF4KDE4MHB4LCAxZnIpKScsIFxyXG4gICAgICAgICAgICAgIGdhcDogJzE2cHgnLFxyXG4gICAgICAgICAgICAgIG1hcmdpbkJvdHRvbTogJzMycHgnXHJcbiAgICAgICAgICAgIH19PlxyXG4gICAgICAgICAgICAgIDxkaXYgc3R5bGU9e3tcclxuICAgICAgICAgICAgICAgIHBhZGRpbmc6ICcyMHB4JyxcclxuICAgICAgICAgICAgICAgIGJhY2tncm91bmRDb2xvcjogJ3doaXRlJyxcclxuICAgICAgICAgICAgICAgIGJvcmRlclJhZGl1czogJzEycHgnLFxyXG4gICAgICAgICAgICAgICAgYm94U2hhZG93OiAnMCAxcHggM3B4IHJnYmEoMCwwLDAsMC4xKScsXHJcbiAgICAgICAgICAgICAgICBib3JkZXI6ICcxcHggc29saWQgI2U1ZTdlYidcclxuICAgICAgICAgICAgICB9fT5cclxuICAgICAgICAgICAgICAgIDxkaXYgc3R5bGU9e3sgZm9udFNpemU6ICcxNHB4JywgY29sb3I6ICcjNmI3MjgwJywgbWFyZ2luQm90dG9tOiAnOHB4JywgZm9udFdlaWdodDogJzUwMCcgfX0+RHJhZnQ8L2Rpdj5cclxuICAgICAgICAgICAgICAgIDxkaXYgc3R5bGU9e3sgZm9udFNpemU6ICcyNHB4JywgZm9udFdlaWdodDogJzcwMCcsIGNvbG9yOiAnIzFlMjkzYicgfX0+XHJcbiAgICAgICAgICAgICAgICAgIHtkYXRhPy5vdmVydmlldz8uZHJhZnRQcm9qZWN0cyB8fCAwfVxyXG4gICAgICAgICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgICAgICAgXHJcbiAgICAgICAgICAgICAgPGRpdiBzdHlsZT17e1xyXG4gICAgICAgICAgICAgICAgcGFkZGluZzogJzIwcHgnLFxyXG4gICAgICAgICAgICAgICAgYmFja2dyb3VuZENvbG9yOiAnd2hpdGUnLFxyXG4gICAgICAgICAgICAgICAgYm9yZGVyUmFkaXVzOiAnMTJweCcsXHJcbiAgICAgICAgICAgICAgICBib3hTaGFkb3c6ICcwIDFweCAzcHggcmdiYSgwLDAsMCwwLjEpJyxcclxuICAgICAgICAgICAgICAgIGJvcmRlcjogJzFweCBzb2xpZCAjZTVlN2ViJ1xyXG4gICAgICAgICAgICAgIH19PlxyXG4gICAgICAgICAgICAgICAgPGRpdiBzdHlsZT17eyBmb250U2l6ZTogJzE0cHgnLCBjb2xvcjogJyMzYjgyZjYnLCBtYXJnaW5Cb3R0b206ICc4cHgnLCBmb250V2VpZ2h0OiAnNTAwJyB9fT5BY3RpdmU8L2Rpdj5cclxuICAgICAgICAgICAgICAgIDxkaXYgc3R5bGU9e3sgZm9udFNpemU6ICcyNHB4JywgZm9udFdlaWdodDogJzcwMCcsIGNvbG9yOiAnIzFlMjkzYicgfX0+XHJcbiAgICAgICAgICAgICAgICAgIHtkYXRhPy5vdmVydmlldz8uYWN0aXZlUHJvamVjdHMgfHwgMH1cclxuICAgICAgICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICAgICAgIFxyXG4gICAgICAgICAgICAgIDxkaXYgc3R5bGU9e3tcclxuICAgICAgICAgICAgICAgIHBhZGRpbmc6ICcyMHB4JyxcclxuICAgICAgICAgICAgICAgIGJhY2tncm91bmRDb2xvcjogJ3doaXRlJyxcclxuICAgICAgICAgICAgICAgIGJvcmRlclJhZGl1czogJzEycHgnLFxyXG4gICAgICAgICAgICAgICAgYm94U2hhZG93OiAnMCAxcHggM3B4IHJnYmEoMCwwLDAsMC4xKScsXHJcbiAgICAgICAgICAgICAgICBib3JkZXI6ICcxcHggc29saWQgI2U1ZTdlYidcclxuICAgICAgICAgICAgICB9fT5cclxuICAgICAgICAgICAgICAgIDxkaXYgc3R5bGU9e3sgZm9udFNpemU6ICcxNHB4JywgY29sb3I6ICcjMTBiOTgxJywgbWFyZ2luQm90dG9tOiAnOHB4JywgZm9udFdlaWdodDogJzUwMCcgfX0+Q29tcGxldGVkPC9kaXY+XHJcbiAgICAgICAgICAgICAgICA8ZGl2IHN0eWxlPXt7IGZvbnRTaXplOiAnMjRweCcsIGZvbnRXZWlnaHQ6ICc3MDAnLCBjb2xvcjogJyMxZTI5M2InIH19PlxyXG4gICAgICAgICAgICAgICAgICB7ZGF0YT8ub3ZlcnZpZXc/LmNvbXBsZXRlZFByb2plY3RzIHx8IDB9XHJcbiAgICAgICAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgICAgICBcclxuICAgICAgICAgICAgICA8ZGl2IHN0eWxlPXt7XHJcbiAgICAgICAgICAgICAgICBwYWRkaW5nOiAnMjBweCcsXHJcbiAgICAgICAgICAgICAgICBiYWNrZ3JvdW5kQ29sb3I6ICd3aGl0ZScsXHJcbiAgICAgICAgICAgICAgICBib3JkZXJSYWRpdXM6ICcxMnB4JyxcclxuICAgICAgICAgICAgICAgIGJveFNoYWRvdzogJzAgMXB4IDNweCByZ2JhKDAsMCwwLDAuMSknLFxyXG4gICAgICAgICAgICAgICAgYm9yZGVyOiAnMXB4IHNvbGlkICNlNWU3ZWInXHJcbiAgICAgICAgICAgICAgfX0+XHJcbiAgICAgICAgICAgICAgICA8ZGl2IHN0eWxlPXt7IGZvbnRTaXplOiAnMTRweCcsIGNvbG9yOiAnIzFlMjkzYicsIG1hcmdpbkJvdHRvbTogJzhweCcsIGZvbnRXZWlnaHQ6ICc1MDAnIH19PlRvdGFsPC9kaXY+XHJcbiAgICAgICAgICAgICAgICA8ZGl2IHN0eWxlPXt7IGZvbnRTaXplOiAnMjRweCcsIGZvbnRXZWlnaHQ6ICc3MDAnLCBjb2xvcjogJyMxZTI5M2InIH19PlxyXG4gICAgICAgICAgICAgICAgICB7ZGF0YT8ub3ZlcnZpZXc/LnRvdGFsUHJvamVjdHMgfHwgMH1cclxuICAgICAgICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICAgICA8L2Rpdj5cclxuXHJcbiAgICAgICAgICAgIHtkYXRhPy5wcm9qZWN0U3RhdHM/LmJ5U3RhdHVzPy5sZW5ndGggPiAwICYmIChcclxuICAgICAgICAgICAgICA8ZGl2IHN0eWxlPXt7XHJcbiAgICAgICAgICAgICAgICBiYWNrZ3JvdW5kQ29sb3I6ICd3aGl0ZScsXHJcbiAgICAgICAgICAgICAgICBib3JkZXJSYWRpdXM6ICcxMnB4JyxcclxuICAgICAgICAgICAgICAgIGJveFNoYWRvdzogJzAgMXB4IDNweCByZ2JhKDAsMCwwLDAuMSknLFxyXG4gICAgICAgICAgICAgICAgYm9yZGVyOiAnMXB4IHNvbGlkICNlNWU3ZWInLFxyXG4gICAgICAgICAgICAgICAgcGFkZGluZzogJzI0cHgnXHJcbiAgICAgICAgICAgICAgfX0+XHJcbiAgICAgICAgICAgICAgICA8aDMgc3R5bGU9e3sgbWFyZ2luOiAnMCAwIDI0cHggMCcsIGZvbnRTaXplOiAnMThweCcsIGZvbnRXZWlnaHQ6ICc2MDAnLCBjb2xvcjogJyMxZTI5M2InIH19PlxyXG4gICAgICAgICAgICAgICAgICBQcm9qZWN0IFN0YXR1cyBEaXN0cmlidXRpb25cclxuICAgICAgICAgICAgICAgIDwvaDM+XHJcbiAgICAgICAgICAgICAgICA8ZGl2IHN0eWxlPXt7IGRpc3BsYXk6ICdmbGV4JywgZmxleFdyYXA6ICd3cmFwJywgZ2FwOiAnMTZweCcgfX0+XHJcbiAgICAgICAgICAgICAgICAgIHtkYXRhLnByb2plY3RTdGF0cy5ieVN0YXR1cy5tYXAoKHN0YXR1cywgaW5kZXgpID0+IChcclxuICAgICAgICAgICAgICAgICAgICA8ZGl2IGtleT17aW5kZXh9IHN0eWxlPXt7XHJcbiAgICAgICAgICAgICAgICAgICAgICBkaXNwbGF5OiAnZmxleCcsXHJcbiAgICAgICAgICAgICAgICAgICAgICBhbGlnbkl0ZW1zOiAnY2VudGVyJyxcclxuICAgICAgICAgICAgICAgICAgICAgIHBhZGRpbmc6ICcxMnB4IDE2cHgnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgYmFja2dyb3VuZENvbG9yOiAnI2Y4ZmFmYycsXHJcbiAgICAgICAgICAgICAgICAgICAgICBib3JkZXJSYWRpdXM6ICc4cHgnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgYm9yZGVyOiAnMXB4IHNvbGlkICNlMmU4ZjAnXHJcbiAgICAgICAgICAgICAgICAgICAgfX0+XHJcbiAgICAgICAgICAgICAgICAgICAgICA8ZGl2IHN0eWxlPXt7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHdpZHRoOiAnMTJweCcsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGhlaWdodDogJzEycHgnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBiYWNrZ3JvdW5kQ29sb3I6IHN0YXR1cy5jb2xvcixcclxuICAgICAgICAgICAgICAgICAgICAgICAgYm9yZGVyUmFkaXVzOiAnM3B4JyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgbWFyZ2luUmlnaHQ6ICc4cHgnXHJcbiAgICAgICAgICAgICAgICAgICAgICB9fT48L2Rpdj5cclxuICAgICAgICAgICAgICAgICAgICAgIDxzcGFuIHN0eWxlPXt7IGZvbnRTaXplOiAnMTRweCcsIGZvbnRXZWlnaHQ6ICc1MDAnLCBjb2xvcjogJyMzNzQxNTEnIH19PlxyXG4gICAgICAgICAgICAgICAgICAgICAgICB7c3RhdHVzLnN0YXR1c306IHtzdGF0dXMuY291bnR9XHJcbiAgICAgICAgICAgICAgICAgICAgICA8L3NwYW4+XHJcbiAgICAgICAgICAgICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgICAgICAgICAgICkpfVxyXG4gICAgICAgICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgICAgICl9XHJcbiAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICApfVxyXG5cclxuICAgICAgICB7YWN0aXZlVGFiID09PSAnZmluYW5jaWFsJyAmJiAoXHJcbiAgICAgICAgICA8ZGl2PlxyXG4gICAgICAgICAgICA8ZGl2IHN0eWxlPXt7IFxyXG4gICAgICAgICAgICAgIGRpc3BsYXk6ICdncmlkJywgXHJcbiAgICAgICAgICAgICAgZ3JpZFRlbXBsYXRlQ29sdW1uczogJ3JlcGVhdChhdXRvLWZpdCwgbWlubWF4KDIwMHB4LCAxZnIpKScsIFxyXG4gICAgICAgICAgICAgIGdhcDogJzE2cHgnLFxyXG4gICAgICAgICAgICAgIG1hcmdpbkJvdHRvbTogJzMycHgnXHJcbiAgICAgICAgICAgIH19PlxyXG4gICAgICAgICAgICAgIDxkaXYgc3R5bGU9e3tcclxuICAgICAgICAgICAgICAgIHBhZGRpbmc6ICcyMHB4JyxcclxuICAgICAgICAgICAgICAgIGJhY2tncm91bmRDb2xvcjogJ3doaXRlJyxcclxuICAgICAgICAgICAgICAgIGJvcmRlclJhZGl1czogJzEycHgnLFxyXG4gICAgICAgICAgICAgICAgYm94U2hhZG93OiAnMCAxcHggM3B4IHJnYmEoMCwwLDAsMC4xKScsXHJcbiAgICAgICAgICAgICAgICBib3JkZXI6ICcxcHggc29saWQgI2U1ZTdlYidcclxuICAgICAgICAgICAgICB9fT5cclxuICAgICAgICAgICAgICAgIDxkaXYgc3R5bGU9e3sgZm9udFNpemU6ICcxNHB4JywgY29sb3I6ICcjNmI3MjgwJywgbWFyZ2luQm90dG9tOiAnOHB4JywgZm9udFdlaWdodDogJzUwMCcgfX0+VG90YWwgUmV2ZW51ZTwvZGl2PlxyXG4gICAgICAgICAgICAgICAgPGRpdiBzdHlsZT17eyBmb250U2l6ZTogJzI0cHgnLCBmb250V2VpZ2h0OiAnNzAwJywgY29sb3I6ICcjMWUyOTNiJyB9fT5cclxuICAgICAgICAgICAgICAgICAge2Zvcm1hdEN1cnJlbmN5KGRhdGE/Lm92ZXJ2aWV3Py50b3RhbFJldmVudWUgfHwgMCl9XHJcbiAgICAgICAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgICAgICBcclxuICAgICAgICAgICAgICA8ZGl2IHN0eWxlPXt7XHJcbiAgICAgICAgICAgICAgICBwYWRkaW5nOiAnMjBweCcsXHJcbiAgICAgICAgICAgICAgICBiYWNrZ3JvdW5kQ29sb3I6ICd3aGl0ZScsXHJcbiAgICAgICAgICAgICAgICBib3JkZXJSYWRpdXM6ICcxMnB4JyxcclxuICAgICAgICAgICAgICAgIGJveFNoYWRvdzogJzAgMXB4IDNweCByZ2JhKDAsMCwwLDAuMSknLFxyXG4gICAgICAgICAgICAgICAgYm9yZGVyOiAnMXB4IHNvbGlkICNlNWU3ZWInXHJcbiAgICAgICAgICAgICAgfX0+XHJcbiAgICAgICAgICAgICAgICA8ZGl2IHN0eWxlPXt7IGZvbnRTaXplOiAnMTRweCcsIGNvbG9yOiAnIzZiNzI4MCcsIG1hcmdpbkJvdHRvbTogJzhweCcsIGZvbnRXZWlnaHQ6ICc1MDAnIH19PlRyYW5zYWN0aW9uczwvZGl2PlxyXG4gICAgICAgICAgICAgICAgPGRpdiBzdHlsZT17eyBmb250U2l6ZTogJzI0cHgnLCBmb250V2VpZ2h0OiAnNzAwJywgY29sb3I6ICcjMWUyOTNiJyB9fT5cclxuICAgICAgICAgICAgICAgICAgeyhkYXRhPy5vdmVydmlldz8udG90YWxUcmFuc2FjdGlvbnMgfHwgMCkudG9Mb2NhbGVTdHJpbmcoKX1cclxuICAgICAgICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICAgICAgIFxyXG4gICAgICAgICAgICAgIDxkaXYgc3R5bGU9e3tcclxuICAgICAgICAgICAgICAgIHBhZGRpbmc6ICcyMHB4JyxcclxuICAgICAgICAgICAgICAgIGJhY2tncm91bmRDb2xvcjogJ3doaXRlJyxcclxuICAgICAgICAgICAgICAgIGJvcmRlclJhZGl1czogJzEycHgnLFxyXG4gICAgICAgICAgICAgICAgYm94U2hhZG93OiAnMCAxcHggM3B4IHJnYmEoMCwwLDAsMC4xKScsXHJcbiAgICAgICAgICAgICAgICBib3JkZXI6ICcxcHggc29saWQgI2U1ZTdlYidcclxuICAgICAgICAgICAgICB9fT5cclxuICAgICAgICAgICAgICAgIDxkaXYgc3R5bGU9e3sgZm9udFNpemU6ICcxNHB4JywgY29sb3I6ICcjNmI3MjgwJywgbWFyZ2luQm90dG9tOiAnOHB4JywgZm9udFdlaWdodDogJzUwMCcgfX0+TW9udGhseSBSZXZlbnVlPC9kaXY+XHJcbiAgICAgICAgICAgICAgICA8ZGl2IHN0eWxlPXt7IGZvbnRTaXplOiAnMjRweCcsIGZvbnRXZWlnaHQ6ICc3MDAnLCBjb2xvcjogJyMxZTI5M2InIH19PlxyXG4gICAgICAgICAgICAgICAgICB7Zm9ybWF0Q3VycmVuY3koZGF0YT8ub3ZlcnZpZXc/Lm1vbnRobHlSZXZlbnVlIHx8IDApfVxyXG4gICAgICAgICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgICAgICAgXHJcbiAgICAgICAgICAgICAgPGRpdiBzdHlsZT17e1xyXG4gICAgICAgICAgICAgICAgcGFkZGluZzogJzIwcHgnLFxyXG4gICAgICAgICAgICAgICAgYmFja2dyb3VuZENvbG9yOiAnd2hpdGUnLFxyXG4gICAgICAgICAgICAgICAgYm9yZGVyUmFkaXVzOiAnMTJweCcsXHJcbiAgICAgICAgICAgICAgICBib3hTaGFkb3c6ICcwIDFweCAzcHggcmdiYSgwLDAsMCwwLjEpJyxcclxuICAgICAgICAgICAgICAgIGJvcmRlcjogJzFweCBzb2xpZCAjZTVlN2ViJ1xyXG4gICAgICAgICAgICAgIH19PlxyXG4gICAgICAgICAgICAgICAgPGRpdiBzdHlsZT17eyBmb250U2l6ZTogJzE0cHgnLCBjb2xvcjogJyM2YjcyODAnLCBtYXJnaW5Cb3R0b206ICc4cHgnLCBmb250V2VpZ2h0OiAnNTAwJyB9fT5BdmcgVHJhbnNhY3Rpb248L2Rpdj5cclxuICAgICAgICAgICAgICAgIDxkaXYgc3R5bGU9e3sgZm9udFNpemU6ICcyNHB4JywgZm9udFdlaWdodDogJzcwMCcsIGNvbG9yOiAnIzFlMjkzYicgfX0+XHJcbiAgICAgICAgICAgICAgICAgIHtmb3JtYXRDdXJyZW5jeShkYXRhPy5vdmVydmlldz8uYXZnVHJhbnNhY3Rpb24gfHwgMCl9XHJcbiAgICAgICAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgICAgPC9kaXY+XHJcblxyXG4gICAgICAgICAgICA8ZGl2IHN0eWxlPXt7XHJcbiAgICAgICAgICAgICAgYmFja2dyb3VuZENvbG9yOiAnd2hpdGUnLFxyXG4gICAgICAgICAgICAgIGJvcmRlclJhZGl1czogJzEycHgnLFxyXG4gICAgICAgICAgICAgIGJveFNoYWRvdzogJzAgMXB4IDNweCByZ2JhKDAsMCwwLDAuMSknLFxyXG4gICAgICAgICAgICAgIGJvcmRlcjogJzFweCBzb2xpZCAjZTVlN2ViJyxcclxuICAgICAgICAgICAgICBwYWRkaW5nOiAnMjRweCdcclxuICAgICAgICAgICAgfX0+XHJcbiAgICAgICAgICAgICAgPGgzIHN0eWxlPXt7IG1hcmdpbjogJzAgMCAxNnB4IDAnLCBmb250U2l6ZTogJzE4cHgnLCBmb250V2VpZ2h0OiAnNjAwJywgY29sb3I6ICcjMWUyOTNiJyB9fT5cclxuICAgICAgICAgICAgICAgIEZpbmFuY2lhbCBPdmVydmlld1xyXG4gICAgICAgICAgICAgIDwvaDM+XHJcbiAgICAgICAgICAgICAgPHAgc3R5bGU9e3sgbWFyZ2luOiAnMCcsIGNvbG9yOiAnIzZiNzI4MCcsIGZvbnRTaXplOiAnMTRweCcgfX0+XHJcbiAgICAgICAgICAgICAgICBGaW5hbmNpYWwgYW5hbHl0aWNzIHByb3ZpZGUgaW5zaWdodHMgaW50byByZXZlbnVlIHRyZW5kcywgcGF5bWVudCBwYXR0ZXJucywgYW5kIHRyYW5zYWN0aW9uIGRhdGEuXHJcbiAgICAgICAgICAgICAgICB7ZGF0YT8ub3ZlcnZpZXc/LnRvdGFsUmV2ZW51ZSA+IDAgXHJcbiAgICAgICAgICAgICAgICAgID8gYCBDdXJyZW50IHRvdGFsIHJldmVudWUgc3RhbmRzIGF0ICR7Zm9ybWF0Q3VycmVuY3koZGF0YS5vdmVydmlldy50b3RhbFJldmVudWUpfSBhY3Jvc3MgJHsoZGF0YS5vdmVydmlldy50b3RhbFRyYW5zYWN0aW9ucyB8fCAwKS50b0xvY2FsZVN0cmluZygpfSB0cmFuc2FjdGlvbnMuYFxyXG4gICAgICAgICAgICAgICAgICA6ICcgTm8gcGF5bWVudCBkYXRhIGF2YWlsYWJsZSB5ZXQuJ1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgIDwvcD5cclxuICAgICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICApfVxyXG4gICAgICA8L2Rpdj5cclxuICAgIDwvZGl2PlxyXG4gICk7XHJcbn0iLCJpbXBvcnQgUmVhY3QgZnJvbSAncmVhY3QnO1xyXG5cclxuY29uc3QgUmVsYXRlZE1hdGVyaWFscyA9ICh7IHJlY29yZCB9KSA9PiB7XHJcbiAgY29uc3QgbWF0ZXJpYWxzID0gcmVjb3JkLnBhcmFtcz8uY291cnNlX21hdGVyaWFscyB8fCBbXTtcclxuICBjb25zdCBjb3Vyc2VJZCA9IHJlY29yZC5wYXJhbXM/LmlkO1xyXG5cclxuICBpZiAoIW1hdGVyaWFscy5sZW5ndGgpIHtcclxuICAgIHJldHVybiAoXHJcbiAgICAgIDxkaXYgc3R5bGU9e3sgXHJcbiAgICAgICAgYmFja2dyb3VuZDogJyNmOGY5ZmEnLCBcclxuICAgICAgICBwYWRkaW5nOiAnMTZweCcsIFxyXG4gICAgICAgIGJvcmRlclJhZGl1czogJzhweCcsIFxyXG4gICAgICAgIG1hcmdpbkJvdHRvbTogJzE2cHgnIFxyXG4gICAgICB9fT5cclxuICAgICAgICA8aDMgc3R5bGU9e3sgZm9udFNpemU6ICcxOHB4JywgZm9udFdlaWdodDogJzYwMCcsIG1hcmdpbkJvdHRvbTogJzhweCcgfX0+XHJcbiAgICAgICAgICBDb3Vyc2UgTWF0ZXJpYWxzXHJcbiAgICAgICAgPC9oMz5cclxuICAgICAgICA8cCBzdHlsZT17eyBjb2xvcjogJyM2YjcyODAnLCBtYXJnaW5Cb3R0b206ICcxNnB4JyB9fT5cclxuICAgICAgICAgIE5vIG1hdGVyaWFscyB1cGxvYWRlZCB5ZXQuXHJcbiAgICAgICAgPC9wPlxyXG4gICAgICAgIDxhIFxyXG4gICAgICAgICAgaHJlZj17YC9hZG1pbi9yZXNvdXJjZXMvY291cnNlX21hdGVyaWFscy9hY3Rpb25zL25ldz9jb3Vyc2VfaWQ9JHtjb3Vyc2VJZH1gfVxyXG4gICAgICAgICAgc3R5bGU9e3tcclxuICAgICAgICAgICAgYmFja2dyb3VuZDogJyMzYjgyZjYnLFxyXG4gICAgICAgICAgICBjb2xvcjogJ3doaXRlJyxcclxuICAgICAgICAgICAgcGFkZGluZzogJzhweCAxNnB4JyxcclxuICAgICAgICAgICAgYm9yZGVyUmFkaXVzOiAnNnB4JyxcclxuICAgICAgICAgICAgdGV4dERlY29yYXRpb246ICdub25lJyxcclxuICAgICAgICAgICAgZGlzcGxheTogJ2lubGluZS1ibG9jaycsXHJcbiAgICAgICAgICAgIGZvbnRTaXplOiAnMTRweCdcclxuICAgICAgICAgIH19XHJcbiAgICAgICAgPlxyXG4gICAgICAgICAgQWRkIE1hdGVyaWFsXHJcbiAgICAgICAgPC9hPlxyXG4gICAgICA8L2Rpdj5cclxuICAgICk7XHJcbiAgfVxyXG5cclxuICByZXR1cm4gKFxyXG4gICAgPGRpdiBzdHlsZT17eyBcclxuICAgICAgYmFja2dyb3VuZDogJyNmOGY5ZmEnLCBcclxuICAgICAgcGFkZGluZzogJzE2cHgnLCBcclxuICAgICAgYm9yZGVyUmFkaXVzOiAnOHB4JywgXHJcbiAgICAgIG1hcmdpbkJvdHRvbTogJzE2cHgnIFxyXG4gICAgfX0+XHJcbiAgICAgIDxkaXYgc3R5bGU9e3sgXHJcbiAgICAgICAgZGlzcGxheTogJ2ZsZXgnLCBcclxuICAgICAgICBqdXN0aWZ5Q29udGVudDogJ3NwYWNlLWJldHdlZW4nLCBcclxuICAgICAgICBhbGlnbkl0ZW1zOiAnY2VudGVyJywgXHJcbiAgICAgICAgbWFyZ2luQm90dG9tOiAnMTJweCcgXHJcbiAgICAgIH19PlxyXG4gICAgICAgIDxoMyBzdHlsZT17eyBmb250U2l6ZTogJzE4cHgnLCBmb250V2VpZ2h0OiAnNjAwJywgbWFyZ2luOiAwIH19PlxyXG4gICAgICAgICAgQ291cnNlIE1hdGVyaWFscyAoe21hdGVyaWFscy5sZW5ndGh9KVxyXG4gICAgICAgIDwvaDM+XHJcbiAgICAgICAgPGEgXHJcbiAgICAgICAgICBocmVmPXtgL2FkbWluL3Jlc291cmNlcy9jb3Vyc2VfbWF0ZXJpYWxzL2FjdGlvbnMvbmV3P2NvdXJzZV9pZD0ke2NvdXJzZUlkfWB9XHJcbiAgICAgICAgICBzdHlsZT17e1xyXG4gICAgICAgICAgICBiYWNrZ3JvdW5kOiAnIzNiODJmNicsXHJcbiAgICAgICAgICAgIGNvbG9yOiAnd2hpdGUnLFxyXG4gICAgICAgICAgICBwYWRkaW5nOiAnNnB4IDEycHgnLFxyXG4gICAgICAgICAgICBib3JkZXJSYWRpdXM6ICc2cHgnLFxyXG4gICAgICAgICAgICB0ZXh0RGVjb3JhdGlvbjogJ25vbmUnLFxyXG4gICAgICAgICAgICBmb250U2l6ZTogJzEycHgnXHJcbiAgICAgICAgICB9fVxyXG4gICAgICAgID5cclxuICAgICAgICAgIEFkZCBNYXRlcmlhbFxyXG4gICAgICAgIDwvYT5cclxuICAgICAgPC9kaXY+XHJcbiAgICAgIFxyXG4gICAgICA8ZGl2IHN0eWxlPXt7IGRpc3BsYXk6ICdmbGV4JywgZmxleERpcmVjdGlvbjogJ2NvbHVtbicsIGdhcDogJzhweCcgfX0+XHJcbiAgICAgICAge21hdGVyaWFscy5tYXAoKG1hdGVyaWFsKSA9PiAoXHJcbiAgICAgICAgICA8ZGl2IFxyXG4gICAgICAgICAgICBrZXk9e21hdGVyaWFsLmlkfSBcclxuICAgICAgICAgICAgc3R5bGU9e3sgXHJcbiAgICAgICAgICAgICAgYmFja2dyb3VuZDogJ3doaXRlJywgXHJcbiAgICAgICAgICAgICAgcGFkZGluZzogJzEycHgnLCBcclxuICAgICAgICAgICAgICBib3JkZXJSYWRpdXM6ICc2cHgnLCBcclxuICAgICAgICAgICAgICBib3JkZXI6ICcxcHggc29saWQgI2U1ZTdlYidcclxuICAgICAgICAgICAgfX1cclxuICAgICAgICAgID5cclxuICAgICAgICAgICAgPHAgc3R5bGU9e3sgZm9udFdlaWdodDogJzUwMCcsIG1hcmdpbjogJzAgMCA0cHggMCcgfX0+XHJcbiAgICAgICAgICAgICAgTWF0ZXJpYWwgI3ttYXRlcmlhbC5pZH1cclxuICAgICAgICAgICAgPC9wPlxyXG4gICAgICAgICAgICA8YSBcclxuICAgICAgICAgICAgICBocmVmPXttYXRlcmlhbC5maWxlX3VybH0gXHJcbiAgICAgICAgICAgICAgdGFyZ2V0PVwiX2JsYW5rXCIgXHJcbiAgICAgICAgICAgICAgcmVsPVwibm9vcGVuZXIgbm9yZWZlcnJlclwiXHJcbiAgICAgICAgICAgICAgc3R5bGU9e3sgY29sb3I6ICcjM2I4MmY2JywgZm9udFNpemU6ICcxNHB4JywgdGV4dERlY29yYXRpb246ICdub25lJyB9fVxyXG4gICAgICAgICAgICA+XHJcbiAgICAgICAgICAgICAge21hdGVyaWFsLmZpbGVfdXJsfVxyXG4gICAgICAgICAgICA8L2E+XHJcbiAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICApKX1cclxuICAgICAgPC9kaXY+XHJcbiAgICA8L2Rpdj5cclxuICApO1xyXG59O1xyXG5cclxuY29uc3QgUmVsYXRlZEVucm9sbG1lbnRzID0gKHsgcmVjb3JkIH0pID0+IHtcclxuICBjb25zdCBlbnJvbGxtZW50cyA9IHJlY29yZC5wYXJhbXM/LmNvdXJzZV9lbnJvbGxtZW50cyB8fCBbXTtcclxuICBjb25zdCBjb3Vyc2VJZCA9IHJlY29yZC5wYXJhbXM/LmlkO1xyXG5cclxuICBpZiAoIWVucm9sbG1lbnRzLmxlbmd0aCkge1xyXG4gICAgcmV0dXJuIChcclxuICAgICAgPGRpdiBzdHlsZT17eyBcclxuICAgICAgICBiYWNrZ3JvdW5kOiAnI2Y4ZjlmYScsIFxyXG4gICAgICAgIHBhZGRpbmc6ICcxNnB4JywgXHJcbiAgICAgICAgYm9yZGVyUmFkaXVzOiAnOHB4JywgXHJcbiAgICAgICAgbWFyZ2luQm90dG9tOiAnMTZweCcgXHJcbiAgICAgIH19PlxyXG4gICAgICAgIDxoMyBzdHlsZT17eyBmb250U2l6ZTogJzE4cHgnLCBmb250V2VpZ2h0OiAnNjAwJywgbWFyZ2luQm90dG9tOiAnOHB4JyB9fT5cclxuICAgICAgICAgIENvdXJzZSBFbnJvbGxtZW50c1xyXG4gICAgICAgIDwvaDM+XHJcbiAgICAgICAgPHAgc3R5bGU9e3sgY29sb3I6ICcjNmI3MjgwJywgbWFyZ2luQm90dG9tOiAnMTZweCcgfX0+XHJcbiAgICAgICAgICBObyBlbnJvbGxtZW50cyB5ZXQuXHJcbiAgICAgICAgPC9wPlxyXG4gICAgICAgIDxhIFxyXG4gICAgICAgICAgaHJlZj17YC9hZG1pbi9yZXNvdXJjZXMvY291cnNlX2Vucm9sbG1lbnRzL2FjdGlvbnMvbmV3P2NvdXJzZV9pZD0ke2NvdXJzZUlkfWB9XHJcbiAgICAgICAgICBzdHlsZT17e1xyXG4gICAgICAgICAgICBiYWNrZ3JvdW5kOiAnIzEwYjk4MScsXHJcbiAgICAgICAgICAgIGNvbG9yOiAnd2hpdGUnLFxyXG4gICAgICAgICAgICBwYWRkaW5nOiAnOHB4IDE2cHgnLFxyXG4gICAgICAgICAgICBib3JkZXJSYWRpdXM6ICc2cHgnLFxyXG4gICAgICAgICAgICB0ZXh0RGVjb3JhdGlvbjogJ25vbmUnLFxyXG4gICAgICAgICAgICBkaXNwbGF5OiAnaW5saW5lLWJsb2NrJyxcclxuICAgICAgICAgICAgZm9udFNpemU6ICcxNHB4J1xyXG4gICAgICAgICAgfX1cclxuICAgICAgICA+XHJcbiAgICAgICAgICBBZGQgRW5yb2xsbWVudFxyXG4gICAgICAgIDwvYT5cclxuICAgICAgPC9kaXY+XHJcbiAgICApO1xyXG4gIH1cclxuXHJcbiAgcmV0dXJuIChcclxuICAgIDxkaXYgc3R5bGU9e3sgXHJcbiAgICAgIGJhY2tncm91bmQ6ICcjZjhmOWZhJywgXHJcbiAgICAgIHBhZGRpbmc6ICcxNnB4JywgXHJcbiAgICAgIGJvcmRlclJhZGl1czogJzhweCcsIFxyXG4gICAgICBtYXJnaW5Cb3R0b206ICcxNnB4JyBcclxuICAgIH19PlxyXG4gICAgICA8ZGl2IHN0eWxlPXt7IFxyXG4gICAgICAgIGRpc3BsYXk6ICdmbGV4JywgXHJcbiAgICAgICAganVzdGlmeUNvbnRlbnQ6ICdzcGFjZS1iZXR3ZWVuJywgXHJcbiAgICAgICAgYWxpZ25JdGVtczogJ2NlbnRlcicsIFxyXG4gICAgICAgIG1hcmdpbkJvdHRvbTogJzEycHgnIFxyXG4gICAgICB9fT5cclxuICAgICAgICA8aDMgc3R5bGU9e3sgZm9udFNpemU6ICcxOHB4JywgZm9udFdlaWdodDogJzYwMCcsIG1hcmdpbjogMCB9fT5cclxuICAgICAgICAgIEVucm9sbG1lbnRzICh7ZW5yb2xsbWVudHMubGVuZ3RofSlcclxuICAgICAgICA8L2gzPlxyXG4gICAgICAgIDxhIFxyXG4gICAgICAgICAgaHJlZj17YC9hZG1pbi9yZXNvdXJjZXMvY291cnNlX2Vucm9sbG1lbnRzL2FjdGlvbnMvbmV3P2NvdXJzZV9pZD0ke2NvdXJzZUlkfWB9XHJcbiAgICAgICAgICBzdHlsZT17e1xyXG4gICAgICAgICAgICBiYWNrZ3JvdW5kOiAnIzEwYjk4MScsXHJcbiAgICAgICAgICAgIGNvbG9yOiAnd2hpdGUnLFxyXG4gICAgICAgICAgICBwYWRkaW5nOiAnNnB4IDEycHgnLFxyXG4gICAgICAgICAgICBib3JkZXJSYWRpdXM6ICc2cHgnLFxyXG4gICAgICAgICAgICB0ZXh0RGVjb3JhdGlvbjogJ25vbmUnLFxyXG4gICAgICAgICAgICBmb250U2l6ZTogJzEycHgnXHJcbiAgICAgICAgICB9fVxyXG4gICAgICAgID5cclxuICAgICAgICAgIEFkZCBFbnJvbGxtZW50XHJcbiAgICAgICAgPC9hPlxyXG4gICAgICA8L2Rpdj5cclxuICAgICAgXHJcbiAgICAgIDxkaXYgc3R5bGU9e3sgZGlzcGxheTogJ2ZsZXgnLCBmbGV4RGlyZWN0aW9uOiAnY29sdW1uJywgZ2FwOiAnOHB4JyB9fT5cclxuICAgICAgICB7ZW5yb2xsbWVudHMubWFwKChlbnJvbGxtZW50KSA9PiAoXHJcbiAgICAgICAgICA8ZGl2IFxyXG4gICAgICAgICAgICBrZXk9e2Vucm9sbG1lbnQuaWR9IFxyXG4gICAgICAgICAgICBzdHlsZT17eyBcclxuICAgICAgICAgICAgICBiYWNrZ3JvdW5kOiAnd2hpdGUnLCBcclxuICAgICAgICAgICAgICBwYWRkaW5nOiAnMTJweCcsIFxyXG4gICAgICAgICAgICAgIGJvcmRlclJhZGl1czogJzZweCcsIFxyXG4gICAgICAgICAgICAgIGJvcmRlcjogJzFweCBzb2xpZCAjZTVlN2ViJ1xyXG4gICAgICAgICAgICB9fVxyXG4gICAgICAgICAgPlxyXG4gICAgICAgICAgICA8ZGl2IHN0eWxlPXt7IG1hcmdpbkJvdHRvbTogJzhweCcgfX0+XHJcbiAgICAgICAgICAgICAgPHAgc3R5bGU9e3sgZm9udFdlaWdodDogJzUwMCcsIG1hcmdpbjogJzAgMCA0cHggMCcgfX0+XHJcbiAgICAgICAgICAgICAgICB7ZW5yb2xsbWVudC5mcmVlbGFuY2VyX25hbWUgfHwgYFVzZXIgIyR7ZW5yb2xsbWVudC5mcmVlbGFuY2VyX2lkfWB9XHJcbiAgICAgICAgICAgICAgPC9wPlxyXG4gICAgICAgICAgICAgIDxwIHN0eWxlPXt7IGZvbnRTaXplOiAnMTRweCcsIGNvbG9yOiAnIzZiNzI4MCcsIG1hcmdpbjogJzAgMCA0cHggMCcgfX0+XHJcbiAgICAgICAgICAgICAgICB7ZW5yb2xsbWVudC5mcmVlbGFuY2VyX2VtYWlsIHx8ICdObyBlbWFpbCd9XHJcbiAgICAgICAgICAgICAgPC9wPlxyXG4gICAgICAgICAgICAgIDxwIHN0eWxlPXt7IGZvbnRTaXplOiAnMTRweCcsIGNvbG9yOiAnIzZiNzI4MCcsIG1hcmdpbjogMCB9fT5cclxuICAgICAgICAgICAgICAgIEVucm9sbGVkOiB7bmV3IERhdGUoZW5yb2xsbWVudC5lbnJvbGxlZF9hdCkudG9Mb2NhbGVEYXRlU3RyaW5nKCl9XHJcbiAgICAgICAgICAgICAgPC9wPlxyXG4gICAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgICAgXHJcbiAgICAgICAgICAgIDxkaXYgc3R5bGU9e3sgbWFyZ2luQm90dG9tOiAnOHB4JyB9fT5cclxuICAgICAgICAgICAgICA8c3BhbiBzdHlsZT17eyBcclxuICAgICAgICAgICAgICAgIGZvbnRTaXplOiAnMTJweCcsIFxyXG4gICAgICAgICAgICAgICAgZm9udFdlaWdodDogJzUwMCcsIFxyXG4gICAgICAgICAgICAgICAgY29sb3I6ICcjMWU0MGFmJyxcclxuICAgICAgICAgICAgICAgIGJhY2tncm91bmQ6ICcjZGJlYWZlJyxcclxuICAgICAgICAgICAgICAgIHBhZGRpbmc6ICcycHggNnB4JyxcclxuICAgICAgICAgICAgICAgIGJvcmRlclJhZGl1czogJzRweCdcclxuICAgICAgICAgICAgICB9fT5cclxuICAgICAgICAgICAgICAgIHtlbnJvbGxtZW50LnByb2dyZXNzIHx8IDB9JSBDb21wbGV0ZVxyXG4gICAgICAgICAgICAgIDwvc3Bhbj5cclxuICAgICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgICAgIFxyXG4gICAgICAgICAgICA8ZGl2IHN0eWxlPXt7IFxyXG4gICAgICAgICAgICAgIHdpZHRoOiAnMTAwJScsIFxyXG4gICAgICAgICAgICAgIGJhY2tncm91bmQ6ICcjZTVlN2ViJywgXHJcbiAgICAgICAgICAgICAgYm9yZGVyUmFkaXVzOiAnNHB4JywgXHJcbiAgICAgICAgICAgICAgaGVpZ2h0OiAnNnB4J1xyXG4gICAgICAgICAgICB9fT5cclxuICAgICAgICAgICAgICA8ZGl2IFxyXG4gICAgICAgICAgICAgICAgc3R5bGU9e3sgXHJcbiAgICAgICAgICAgICAgICAgIGJhY2tncm91bmQ6ICcjM2I4MmY2JywgXHJcbiAgICAgICAgICAgICAgICAgIGhlaWdodDogJzZweCcsIFxyXG4gICAgICAgICAgICAgICAgICBib3JkZXJSYWRpdXM6ICc0cHgnLFxyXG4gICAgICAgICAgICAgICAgICB3aWR0aDogYCR7ZW5yb2xsbWVudC5wcm9ncmVzcyB8fCAwfSVgXHJcbiAgICAgICAgICAgICAgICB9fVxyXG4gICAgICAgICAgICAgIC8+XHJcbiAgICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgKSl9XHJcbiAgICAgIDwvZGl2PlxyXG4gICAgPC9kaXY+XHJcbiAgKTtcclxufTtcclxuXHJcbmV4cG9ydCB7IFJlbGF0ZWRNYXRlcmlhbHMsIFJlbGF0ZWRFbnJvbGxtZW50cyB9O1xyXG5leHBvcnQgZGVmYXVsdCBSZWxhdGVkTWF0ZXJpYWxzOyIsIkFkbWluSlMuVXNlckNvbXBvbmVudHMgPSB7fVxuaW1wb3J0IERhc2hib2FyZCBmcm9tICcuLi8uLi9mcm9udGVuZC9hZG1pbi1jb21wb25lbnRzL2Rhc2hib2FyZCdcbkFkbWluSlMuVXNlckNvbXBvbmVudHMuRGFzaGJvYXJkID0gRGFzaGJvYXJkXG5pbXBvcnQgQW5hbHl0aWNzIGZyb20gJy4uLy4uL2Zyb250ZW5kL2FkbWluLWNvbXBvbmVudHMvYW5hbHl0aWNzJ1xuQWRtaW5KUy5Vc2VyQ29tcG9uZW50cy5BbmFseXRpY3MgPSBBbmFseXRpY3NcbmltcG9ydCBSZWxhdGVkTWF0ZXJpYWxzIGZyb20gJy4uLy4uL2Zyb250ZW5kL2FkbWluLWNvbXBvbmVudHMvY291cnNlLWNvbXBvbmVudHMnXG5BZG1pbkpTLlVzZXJDb21wb25lbnRzLlJlbGF0ZWRNYXRlcmlhbHMgPSBSZWxhdGVkTWF0ZXJpYWxzXG5pbXBvcnQgUmVsYXRlZEVucm9sbG1lbnRzIGZyb20gJy4uLy4uL2Zyb250ZW5kL2FkbWluLWNvbXBvbmVudHMvY291cnNlLWNvbXBvbmVudHMnXG5BZG1pbkpTLlVzZXJDb21wb25lbnRzLlJlbGF0ZWRFbnJvbGxtZW50cyA9IFJlbGF0ZWRFbnJvbGxtZW50cyJdLCJuYW1lcyI6WyJhcGkiLCJBcGlDbGllbnQiLCJEYXNoYm9hcmQiLCJ0cmFuc2xhdGVNZXNzYWdlIiwidXNlVHJhbnNsYXRpb24iLCJkYXRhIiwic2V0RGF0YSIsInVzZVN0YXRlIiwibG9hZGluZyIsInNldExvYWRpbmciLCJlcnJvciIsInNldEVycm9yIiwiYWRtaW5Mb2dzIiwic2V0QWRtaW5Mb2dzIiwidXNlckxvZ3MiLCJzZXRVc2VyTG9ncyIsImZldGNoaW5nUmVmIiwidXNlUmVmIiwibW91bnRlZFJlZiIsImZldGNoRGFzaGJvYXJkRGF0YSIsInVzZUNhbGxiYWNrIiwiY3VycmVudCIsInJlc3BvbnNlIiwiZ2V0RGFzaGJvYXJkIiwiYWxsTG9ncyIsInJlY2VudExvZ3MiLCJhZG1pbnMiLCJmaWx0ZXIiLCJsb2ciLCJyb2xlX2lkIiwiZmlyc3RfbmFtZSIsInNsaWNlIiwidXNlcnMiLCJFcnJvciIsImVyciIsIm1lc3NhZ2UiLCJ1c2VFZmZlY3QiLCJyZWZyZXNoSW50ZXJ2YWwiLCJzZXRJbnRlcnZhbCIsImNsZWFySW50ZXJ2YWwiLCJsb2dJbnRlcnZhbCIsImZldGNoIiwib2siLCJuZXdMb2dzIiwianNvbiIsImhhbmRsZVJlZnJlc2giLCJSZWFjdCIsImNyZWF0ZUVsZW1lbnQiLCJzdHlsZSIsImRpc3BsYXkiLCJqdXN0aWZ5Q29udGVudCIsImFsaWduSXRlbXMiLCJoZWlnaHQiLCJmb250U2l6ZSIsImNvbG9yIiwibWV0cmljcyIsInN0YXRzQ2FyZHMiLCJ0aXRsZSIsInZhbHVlIiwiYWRtaW5zQ291bnQiLCJsaW5rIiwiY2xpZW50c0NvdW50IiwiZnJlZWxhbmNlcnNDb3VudCIsInByb2plY3RzQ291bnQiLCJwZW5kaW5nQXBwb2ludG1lbnRzIiwiY291cnNlc0NvdW50IiwicGxhbnNDb3VudCIsInRvdGFsUmV2ZW51ZSIsInRvTG9jYWxlU3RyaW5nIiwiaGFuZGxlQ2FyZENsaWNrIiwid2luZG93IiwibG9jYXRpb24iLCJocmVmIiwiZ2V0VGltZUFnbyIsImRhdGVTdHJpbmciLCJub3ciLCJEYXRlIiwibG9nVGltZSIsImRpZmZNcyIsImRpZmZTZWNzIiwiTWF0aCIsImZsb29yIiwiZGlmZk1pbnMiLCJkaWZmSG91cnMiLCJ0b0xvY2FsZURhdGVTdHJpbmciLCJjb250YWluZXJTdHlsZSIsImJhY2tncm91bmRDb2xvciIsIm1pbkhlaWdodCIsInBhZGRpbmciLCJmb250RmFtaWx5IiwiaGVhZGVyU3R5bGUiLCJtYXJnaW5Cb3R0b20iLCJwYWRkaW5nQm90dG9tIiwiYm9yZGVyQm90dG9tIiwicmVmcmVzaEJ1dHRvblN0eWxlIiwiYm9yZGVyIiwiYm9yZGVyUmFkaXVzIiwiY3Vyc29yIiwidHJhbnNpdGlvbiIsIm1ldHJpY3NHcmlkU3R5bGUiLCJncmlkVGVtcGxhdGVDb2x1bW5zIiwiZ2FwIiwiY2FyZFN0eWxlIiwiYm94U2hhZG93IiwiY2FyZFRpdGxlU3R5bGUiLCJmb250V2VpZ2h0IiwibWFyZ2luIiwidGV4dFRyYW5zZm9ybSIsImxldHRlclNwYWNpbmciLCJjYXJkVmFsdWVTdHlsZSIsImxvZ3NDb250YWluZXJTdHlsZSIsImxvZ1NlY3Rpb25TdHlsZSIsIm92ZXJmbG93IiwibG9nSGVhZGVyU3R5bGUiLCJsb2dJdGVtU3R5bGUiLCJsb2dJdGVtTmFtZVN0eWxlIiwibG9nSXRlbUFjdGlvblN0eWxlIiwib3BhY2l0eSIsImxvZ0l0ZW1UaW1lU3R5bGUiLCJlbXB0eVN0YXRlU3R5bGUiLCJ0ZXh0QWxpZ24iLCJmb250U3R5bGUiLCJvbkNsaWNrIiwib25Nb3VzZU92ZXIiLCJlIiwidGFyZ2V0Iiwib25Nb3VzZU91dCIsIndpZHRoIiwidmlld0JveCIsImZpbGwiLCJzdHJva2UiLCJzdHJva2VXaWR0aCIsImQiLCJtYXAiLCJjYXJkIiwiaW5kZXgiLCJrZXkiLCJjdXJyZW50VGFyZ2V0IiwiYm9yZGVyQ29sb3IiLCJsZW5ndGgiLCJpIiwiaWQiLCJsYXN0X25hbWUiLCJhY3Rpb24iLCJjcmVhdGVkX2F0IiwiQW5hbHl0aWNzIiwiYWN0aXZlVGFiIiwic2V0QWN0aXZlVGFiIiwiZGF0ZVJhbmdlIiwic2V0RGF0ZVJhbmdlIiwiZmV0Y2hBbmFseXRpY3NEYXRhIiwiYW5hbHl0aWNzRGF0YSIsImNvbnNvbGUiLCJvdmVydmlldyIsImFwcG9pbnRtZW50cyIsImFwcG9pbnRtZW50U3RhdHMiLCJ0b3BGcmVlbGFuY2VycyIsInJlY2VudEFwcG9pbnRtZW50cyIsInVzZXJHcm93dGgiLCJ1c2VyRGlzdHJpYnV0aW9uIiwicmVjZW50VXNlcnMiLCJwcm9qZWN0U3RhdHMiLCJieVN0YXR1cyIsImZvcm1hdEN1cnJlbmN5IiwiYW1vdW50IiwiSW50bCIsIk51bWJlckZvcm1hdCIsImN1cnJlbmN5IiwiZm9ybWF0IiwiZm9ybWF0RGF0ZSIsIm1vbnRoIiwiZGF5IiwiZm9ybWF0UGVyY2VudGFnZSIsInRvRml4ZWQiLCJib3JkZXJUb3AiLCJhbmltYXRpb24iLCJvbkNoYW5nZSIsImxhYmVsIiwidGFiIiwiYmFja2dyb3VuZCIsInRvdGFsVXNlcnMiLCJtYXJnaW5Ub3AiLCJuZXdVc2Vyc1RvZGF5IiwidG90YWxBcHBvaW50bWVudHMiLCJhcHBvaW50bWVudHNUb2RheSIsImFjdGl2ZVByb2plY3RzIiwiY29tcGxldGVkUHJvamVjdHMiLCJtb250aGx5UmV2ZW51ZSIsIm1heEhlaWdodCIsIm92ZXJmbG93WSIsImJvcmRlckNvbGxhcHNlIiwicG9zaXRpb24iLCJ0b3AiLCJhcHBvaW50bWVudCIsImFwcG9pbnRtZW50X3R5cGUiLCJzdGF0dXMiLCJjaGFyQXQiLCJ0b1VwcGVyQ2FzZSIsImZyZWVsYW5jZXJfZmlyc3RfbmFtZSIsImZyZWVsYW5jZXJfbGFzdF9uYW1lIiwibWFyZ2luUmlnaHQiLCJhY2NlcHRlZEFwcG9pbnRtZW50cyIsInJlamVjdGVkQXBwb2ludG1lbnRzIiwiYWNjZXB0YW5jZVJhdGUiLCJmcmVlbGFuY2VyIiwiZW1haWwiLCJ0b3RhbF9hcHBvaW50bWVudHMiLCJhY2NlcHRlZF9hcHBvaW50bWVudHMiLCJhY2NlcHRhbmNlX3JhdGUiLCJ0b3RhbENsaWVudHMiLCJ0b3RhbEZyZWVsYW5jZXJzIiwibmV3VXNlcnNNb250aCIsInVzZXIiLCJkcmFmdFByb2plY3RzIiwidG90YWxQcm9qZWN0cyIsImZsZXhXcmFwIiwiY291bnQiLCJ0b3RhbFRyYW5zYWN0aW9ucyIsImF2Z1RyYW5zYWN0aW9uIiwiUmVsYXRlZE1hdGVyaWFscyIsInJlY29yZCIsIm1hdGVyaWFscyIsInBhcmFtcyIsImNvdXJzZV9tYXRlcmlhbHMiLCJjb3Vyc2VJZCIsInRleHREZWNvcmF0aW9uIiwiZmxleERpcmVjdGlvbiIsIm1hdGVyaWFsIiwiZmlsZV91cmwiLCJyZWwiLCJBZG1pbkpTIiwiVXNlckNvbXBvbmVudHMiLCJSZWxhdGVkRW5yb2xsbWVudHMiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7RUFBQTtFQUlBLE1BQU1BLEdBQUcsR0FBRyxJQUFJQyxpQkFBUyxFQUFFO0VBRVosU0FBU0MsU0FBU0EsR0FBRztJQUNsQyxNQUFNO0VBQUVDLElBQUFBO0tBQWtCLEdBQUdDLHNCQUFjLEVBQUU7SUFDN0MsTUFBTSxDQUFDQyxJQUFJLEVBQUVDLE9BQU8sQ0FBQyxHQUFHQyxjQUFRLENBQUMsSUFBSSxDQUFDO0lBQ3RDLE1BQU0sQ0FBQ0MsT0FBTyxFQUFFQyxVQUFVLENBQUMsR0FBR0YsY0FBUSxDQUFDLElBQUksQ0FBQztJQUM1QyxNQUFNLENBQUNHLEtBQUssRUFBRUMsUUFBUSxDQUFDLEdBQUdKLGNBQVEsQ0FBQyxJQUFJLENBQUM7SUFDeEMsTUFBTSxDQUFDSyxTQUFTLEVBQUVDLFlBQVksQ0FBQyxHQUFHTixjQUFRLENBQUMsRUFBRSxDQUFDO0lBQzlDLE1BQU0sQ0FBQ08sUUFBUSxFQUFFQyxXQUFXLENBQUMsR0FBR1IsY0FBUSxDQUFDLEVBQUUsQ0FBQztFQUM1QyxFQUFBLE1BQU1TLFdBQVcsR0FBR0MsWUFBTSxDQUFDLEtBQUssQ0FBQztFQUNqQyxFQUFBLE1BQU1DLFVBQVUsR0FBR0QsWUFBTSxDQUFDLElBQUksQ0FBQztFQUUvQixFQUFBLE1BQU1FLGtCQUFrQixHQUFHQyxpQkFBVyxDQUFDLFlBQVk7TUFDakQsSUFBSUosV0FBVyxDQUFDSyxPQUFPLEVBQUU7TUFFekJMLFdBQVcsQ0FBQ0ssT0FBTyxHQUFHLElBQUk7TUFFMUIsSUFBSTtFQUNGLE1BQUEsTUFBTUMsUUFBUSxHQUFHLE1BQU10QixHQUFHLENBQUN1QixZQUFZLEVBQUU7RUFDekMsTUFBQSxJQUFJLENBQUNMLFVBQVUsQ0FBQ0csT0FBTyxFQUFFO1FBRXpCLElBQUlDLFFBQVEsRUFBRWpCLElBQUksRUFBRTtFQUNsQkMsUUFBQUEsT0FBTyxDQUFDZ0IsUUFBUSxDQUFDakIsSUFBSSxDQUFDO1VBRXRCLE1BQU1tQixPQUFPLEdBQUdGLFFBQVEsQ0FBQ2pCLElBQUksQ0FBQ29CLFVBQVUsSUFBSSxFQUFFO1VBQzlDLE1BQU1DLE1BQU0sR0FBR0YsT0FBTyxDQUFDRyxNQUFNLENBQzFCQyxHQUFHLElBQUtBLEdBQUcsQ0FBQ0MsT0FBTyxLQUFLLENBQUMsSUFBSUQsR0FBRyxDQUFDRSxVQUFVLEtBQUssUUFDbkQsQ0FBQyxDQUFDQyxLQUFLLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQztVQUNiLE1BQU1DLEtBQUssR0FBR1IsT0FBTyxDQUFDRyxNQUFNLENBQ3pCQyxHQUFHLElBQUtBLEdBQUcsQ0FBQ0MsT0FBTyxLQUFLLENBQUMsSUFBSUQsR0FBRyxDQUFDRSxVQUFVLEtBQUssUUFDbkQsQ0FBQyxDQUFDQyxLQUFLLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQztVQUVibEIsWUFBWSxDQUFDYSxNQUFNLENBQUM7VUFDcEJYLFdBQVcsQ0FBQ2lCLEtBQUssQ0FBQztVQUNsQnJCLFFBQVEsQ0FBQyxJQUFJLENBQUM7RUFDaEIsTUFBQSxDQUFDLE1BQU07RUFDTCxRQUFBLE1BQU0sSUFBSXNCLEtBQUssQ0FBQywyQkFBMkIsQ0FBQztFQUM5QyxNQUFBO01BQ0YsQ0FBQyxDQUFDLE9BQU9DLEdBQUcsRUFBRTtFQUNaLE1BQUEsSUFBSSxDQUFDaEIsVUFBVSxDQUFDRyxPQUFPLEVBQUU7RUFDekJWLE1BQUFBLFFBQVEsQ0FBQ3VCLEdBQUcsRUFBRUMsT0FBTyxJQUFJLCtCQUErQixDQUFDO0VBQzNELElBQUEsQ0FBQyxTQUFTO0VBQ1IsTUFBQSxJQUFJakIsVUFBVSxDQUFDRyxPQUFPLEVBQUVaLFVBQVUsQ0FBQyxLQUFLLENBQUM7UUFDekNPLFdBQVcsQ0FBQ0ssT0FBTyxHQUFHLEtBQUs7RUFDN0IsSUFBQTtJQUNGLENBQUMsRUFBRSxFQUFFLENBQUM7RUFFTmUsRUFBQUEsZUFBUyxDQUFDLE1BQU07TUFDZGxCLFVBQVUsQ0FBQ0csT0FBTyxHQUFHLElBQUk7RUFDekJGLElBQUFBLGtCQUFrQixFQUFFO0VBQ3BCLElBQUEsT0FBTyxNQUFNO1FBQ1hELFVBQVUsQ0FBQ0csT0FBTyxHQUFHLEtBQUs7TUFDNUIsQ0FBQztJQUNILENBQUMsRUFBRSxFQUFFLENBQUM7O0VBRU47RUFDQWUsRUFBQUEsZUFBUyxDQUFDLE1BQU07RUFDZCxJQUFBLE1BQU1DLGVBQWUsR0FBR0MsV0FBVyxDQUFDLE1BQU07UUFDeEMsSUFBSSxDQUFDdEIsV0FBVyxDQUFDSyxPQUFPLElBQUlILFVBQVUsQ0FBQ0csT0FBTyxFQUFFO0VBQzlDRixRQUFBQSxrQkFBa0IsRUFBRTtFQUN0QixNQUFBO01BQ0YsQ0FBQyxFQUFFLEtBQUssQ0FBQztFQUNULElBQUEsT0FBTyxNQUFNb0IsYUFBYSxDQUFDRixlQUFlLENBQUM7RUFDN0MsRUFBQSxDQUFDLEVBQUUsQ0FBQ2xCLGtCQUFrQixDQUFDLENBQUM7O0VBRXhCO0VBQ0FpQixFQUFBQSxlQUFTLENBQUMsTUFBTTtFQUNkLElBQUEsTUFBTUksV0FBVyxHQUFHRixXQUFXLENBQUMsWUFBWTtRQUMxQyxJQUFJLENBQUNwQixVQUFVLENBQUNHLE9BQU8sSUFBSUwsV0FBVyxDQUFDSyxPQUFPLEVBQUU7UUFDaEQsSUFBSTtFQUNGLFFBQUEsTUFBTUMsUUFBUSxHQUFHLE1BQU1tQixLQUFLLENBQUMsMkJBQTJCLENBQUM7VUFDekQsSUFBSW5CLFFBQVEsQ0FBQ29CLEVBQUUsRUFBRTtFQUNmLFVBQUEsTUFBTUMsT0FBTyxHQUFHLE1BQU1yQixRQUFRLENBQUNzQixJQUFJLEVBQUU7RUFDckMsVUFBQSxJQUFJMUIsVUFBVSxDQUFDRyxPQUFPLElBQUlzQixPQUFPLEVBQUVsQixVQUFVLEVBQUU7RUFDN0MsWUFBQSxNQUFNRCxPQUFPLEdBQUdtQixPQUFPLENBQUNsQixVQUFVO2NBQ2xDLE1BQU1DLE1BQU0sR0FBR0YsT0FBTyxDQUFDRyxNQUFNLENBQzFCQyxHQUFHLElBQUtBLEdBQUcsQ0FBQ0MsT0FBTyxLQUFLLENBQUMsSUFBSUQsR0FBRyxDQUFDRSxVQUFVLEtBQUssUUFDbkQsQ0FBQyxDQUFDQyxLQUFLLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQztjQUNiLE1BQU1DLEtBQUssR0FBR1IsT0FBTyxDQUFDRyxNQUFNLENBQ3pCQyxHQUFHLElBQUtBLEdBQUcsQ0FBQ0MsT0FBTyxLQUFLLENBQUMsSUFBSUQsR0FBRyxDQUFDRSxVQUFVLEtBQUssUUFDbkQsQ0FBQyxDQUFDQyxLQUFLLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQztjQUNibEIsWUFBWSxDQUFDYSxNQUFNLENBQUM7Y0FDcEJYLFdBQVcsQ0FBQ2lCLEtBQUssQ0FBQztFQUNwQixVQUFBO0VBQ0YsUUFBQTtRQUNGLENBQUMsQ0FBQyxNQUFNLENBQUM7TUFDWCxDQUFDLEVBQUUsSUFBSSxDQUFDO0VBQ1IsSUFBQSxPQUFPLE1BQU1PLGFBQWEsQ0FBQ0MsV0FBVyxDQUFDO0lBQ3pDLENBQUMsRUFBRSxFQUFFLENBQUM7RUFFTixFQUFBLE1BQU1LLGFBQWEsR0FBR3pCLGlCQUFXLENBQUMsTUFBTTtFQUN0Q0QsSUFBQUEsa0JBQWtCLEVBQUU7RUFDdEIsRUFBQSxDQUFDLEVBQUUsQ0FBQ0Esa0JBQWtCLENBQUMsQ0FBQztFQUV4QixFQUFBLElBQUlYLE9BQU8sSUFBSSxDQUFDSCxJQUFJLEVBQUU7TUFDcEIsb0JBQ0V5QyxzQkFBQSxDQUFBQyxhQUFBLENBQUEsS0FBQSxFQUFBO0VBQUtDLE1BQUFBLEtBQUssRUFBRTtFQUNWQyxRQUFBQSxPQUFPLEVBQUUsTUFBTTtFQUNmQyxRQUFBQSxjQUFjLEVBQUUsUUFBUTtFQUN4QkMsUUFBQUEsVUFBVSxFQUFFLFFBQVE7RUFDcEJDLFFBQUFBLE1BQU0sRUFBRSxPQUFPO0VBQ2ZDLFFBQUFBLFFBQVEsRUFBRSxNQUFNO0VBQ2hCQyxRQUFBQSxLQUFLLEVBQUU7RUFDVDtFQUFFLEtBQUEsRUFBQyxzQkFFRSxDQUFDO0VBRVYsRUFBQTtFQUVBLEVBQUEsTUFBTUMsT0FBTyxHQUFHbEQsSUFBSSxFQUFFa0QsT0FBTyxJQUFJLEVBQUU7SUFFbkMsTUFBTUMsVUFBVSxHQUFHLENBQ2pCO0VBQUVDLElBQUFBLEtBQUssRUFBRSxjQUFjO0VBQUVDLElBQUFBLEtBQUssRUFBRUgsT0FBTyxDQUFDSSxXQUFXLElBQUksQ0FBQztFQUFFQyxJQUFBQSxJQUFJLEVBQUUseUJBQXlCO0VBQUVOLElBQUFBLEtBQUssRUFBRTtFQUFVLEdBQUMsRUFDN0c7RUFBRUcsSUFBQUEsS0FBSyxFQUFFLFNBQVM7RUFBRUMsSUFBQUEsS0FBSyxFQUFFSCxPQUFPLENBQUNNLFlBQVksSUFBSSxDQUFDO0VBQUVELElBQUFBLElBQUksRUFBRSwwQkFBMEI7RUFBRU4sSUFBQUEsS0FBSyxFQUFFO0VBQVUsR0FBQyxFQUMxRztFQUFFRyxJQUFBQSxLQUFLLEVBQUUsYUFBYTtFQUFFQyxJQUFBQSxLQUFLLEVBQUVILE9BQU8sQ0FBQ08sZ0JBQWdCLElBQUksQ0FBQztFQUFFRixJQUFBQSxJQUFJLEVBQUUsOEJBQThCO0VBQUVOLElBQUFBLEtBQUssRUFBRTtFQUFVLEdBQUMsRUFDdEg7RUFBRUcsSUFBQUEsS0FBSyxFQUFFLGlCQUFpQjtFQUFFQyxJQUFBQSxLQUFLLEVBQUVILE9BQU8sQ0FBQ1EsYUFBYSxJQUFJLENBQUM7RUFBRUgsSUFBQUEsSUFBSSxFQUFFLDJCQUEyQjtFQUFFTixJQUFBQSxLQUFLLEVBQUU7RUFBVSxHQUFDLEVBQ3BIO0VBQUVHLElBQUFBLEtBQUssRUFBRSxzQkFBc0I7RUFBRUMsSUFBQUEsS0FBSyxFQUFFSCxPQUFPLENBQUNTLG1CQUFtQixJQUFJLENBQUM7RUFBRUosSUFBQUEsSUFBSSxFQUFFLCtCQUErQjtFQUFFTixJQUFBQSxLQUFLLEVBQUU7RUFBVSxHQUFDLEVBQ25JO0VBQUVHLElBQUFBLEtBQUssRUFBRSxTQUFTO0VBQUVDLElBQUFBLEtBQUssRUFBRUgsT0FBTyxDQUFDVSxZQUFZLElBQUksQ0FBQztFQUFFTCxJQUFBQSxJQUFJLEVBQUUsMEJBQTBCO0VBQUVOLElBQUFBLEtBQUssRUFBRTtFQUFVLEdBQUMsRUFDMUc7RUFBRUcsSUFBQUEsS0FBSyxFQUFFLE9BQU87RUFBRUMsSUFBQUEsS0FBSyxFQUFFSCxPQUFPLENBQUNXLFVBQVUsSUFBSSxDQUFDO0VBQUVOLElBQUFBLElBQUksRUFBRSx3QkFBd0I7RUFBRU4sSUFBQUEsS0FBSyxFQUFFO0VBQVUsR0FBQyxFQUNwRztFQUFFRyxJQUFBQSxLQUFLLEVBQUUsZUFBZTtFQUFFQyxJQUFBQSxLQUFLLEVBQUUsQ0FBQSxDQUFBLEVBQUksQ0FBQ0gsT0FBTyxDQUFDWSxZQUFZLElBQUksQ0FBQyxFQUFFQyxjQUFjLEVBQUUsQ0FBQSxDQUFFO0VBQUVSLElBQUFBLElBQUksRUFBRSwyQkFBMkI7RUFBRU4sSUFBQUEsS0FBSyxFQUFFO0VBQVUsR0FBQyxFQUMxSTtFQUFFRyxJQUFBQSxLQUFLLEVBQUUsV0FBVztFQUFFQyxJQUFBQSxLQUFLLEVBQUUsY0FBYztFQUFFRSxJQUFBQSxJQUFJLEVBQUUsd0JBQXdCO0VBQUVOLElBQUFBLEtBQUssRUFBRTtFQUFVLEdBQUMsQ0FDaEc7SUFFRCxNQUFNZSxlQUFlLEdBQUlULElBQUksSUFBSztFQUNoQ1UsSUFBQUEsTUFBTSxDQUFDQyxRQUFRLENBQUNDLElBQUksR0FBR1osSUFBSTtJQUM3QixDQUFDO0lBRUQsTUFBTWEsVUFBVSxHQUFJQyxVQUFVLElBQUs7RUFDakMsSUFBQSxJQUFJLENBQUNBLFVBQVUsRUFBRSxPQUFPLEVBQUU7TUFDMUIsSUFBSTtFQUNGLE1BQUEsTUFBTUMsR0FBRyxHQUFHLElBQUlDLElBQUksRUFBRTtFQUN0QixNQUFBLE1BQU1DLE9BQU8sR0FBRyxJQUFJRCxJQUFJLENBQUNGLFVBQVUsQ0FBQztFQUNwQyxNQUFBLE1BQU1JLE1BQU0sR0FBR0gsR0FBRyxHQUFHRSxPQUFPO1FBQzVCLE1BQU1FLFFBQVEsR0FBR0MsSUFBSSxDQUFDQyxLQUFLLENBQUNILE1BQU0sR0FBRyxJQUFJLENBQUM7RUFDMUMsTUFBQSxJQUFJQyxRQUFRLEdBQUcsRUFBRSxFQUFFLE9BQU8sQ0FBQSxFQUFHQSxRQUFRLENBQUEsS0FBQSxDQUFPO1FBQzVDLE1BQU1HLFFBQVEsR0FBR0YsSUFBSSxDQUFDQyxLQUFLLENBQUNGLFFBQVEsR0FBRyxFQUFFLENBQUM7RUFDMUMsTUFBQSxJQUFJRyxRQUFRLEdBQUcsRUFBRSxFQUFFLE9BQU8sQ0FBQSxFQUFHQSxRQUFRLENBQUEsS0FBQSxDQUFPO1FBQzVDLE1BQU1DLFNBQVMsR0FBR0gsSUFBSSxDQUFDQyxLQUFLLENBQUNDLFFBQVEsR0FBRyxFQUFFLENBQUM7RUFDM0MsTUFBQSxJQUFJQyxTQUFTLEdBQUcsRUFBRSxFQUFFLE9BQU8sQ0FBQSxFQUFHQSxTQUFTLENBQUEsS0FBQSxDQUFPO0VBQzlDLE1BQUEsT0FBT04sT0FBTyxDQUFDTyxrQkFBa0IsRUFBRTtFQUNyQyxJQUFBLENBQUMsQ0FBQyxNQUFNO0VBQ04sTUFBQSxPQUFPLEVBQUU7RUFDWCxJQUFBO0lBQ0YsQ0FBQztFQUVELEVBQUEsTUFBTUMsY0FBYyxHQUFHO0VBQ3JCQyxJQUFBQSxlQUFlLEVBQUUsU0FBUztFQUMxQkMsSUFBQUEsU0FBUyxFQUFFLE9BQU87RUFDbEJDLElBQUFBLE9BQU8sRUFBRSxNQUFNO0VBQ2ZDLElBQUFBLFVBQVUsRUFBRTtLQUNiO0VBRUQsRUFBQSxNQUFNQyxXQUFXLEdBQUc7RUFDbEJ6QyxJQUFBQSxPQUFPLEVBQUUsTUFBTTtFQUNmQyxJQUFBQSxjQUFjLEVBQUUsZUFBZTtFQUMvQkMsSUFBQUEsVUFBVSxFQUFFLFFBQVE7RUFDcEJ3QyxJQUFBQSxZQUFZLEVBQUUsTUFBTTtFQUNwQkMsSUFBQUEsYUFBYSxFQUFFLE1BQU07RUFDckJDLElBQUFBLFlBQVksRUFBRTtLQUNmO0VBU0QsRUFBQSxNQUFNQyxrQkFBa0IsR0FBRztFQUN6QlIsSUFBQUEsZUFBZSxFQUFFLFNBQVM7RUFDMUJTLElBQUFBLE1BQU0sRUFBRSxtQkFBbUI7RUFDM0JDLElBQUFBLFlBQVksRUFBRSxLQUFLO0VBQ25CUixJQUFBQSxPQUFPLEVBQUUsS0FBSztFQUNkUyxJQUFBQSxNQUFNLEVBQUUsU0FBUztFQUNqQkMsSUFBQUEsVUFBVSxFQUFFLFVBQVU7RUFDdEJqRCxJQUFBQSxPQUFPLEVBQUUsTUFBTTtFQUNmRSxJQUFBQSxVQUFVLEVBQUUsUUFBUTtFQUNwQkQsSUFBQUEsY0FBYyxFQUFFLFFBQVE7RUFDeEJJLElBQUFBLEtBQUssRUFBRTtLQUNSO0VBRUQsRUFBQSxNQUFNNkMsZ0JBQWdCLEdBQUc7RUFDdkJsRCxJQUFBQSxPQUFPLEVBQUUsTUFBTTtFQUNmbUQsSUFBQUEsbUJBQW1CLEVBQUUsc0NBQXNDO0VBQzNEQyxJQUFBQSxHQUFHLEVBQUUsTUFBTTtFQUNYVixJQUFBQSxZQUFZLEVBQUU7S0FDZjtFQUVELEVBQUEsTUFBTVcsU0FBUyxHQUFHO0VBQ2hCaEIsSUFBQUEsZUFBZSxFQUFFLFNBQVM7RUFDMUJFLElBQUFBLE9BQU8sRUFBRSxNQUFNO0VBQ2ZPLElBQUFBLE1BQU0sRUFBRSxtQkFBbUI7RUFDM0JDLElBQUFBLFlBQVksRUFBRSxLQUFLO0VBQ25CQyxJQUFBQSxNQUFNLEVBQUUsU0FBUztFQUNqQkMsSUFBQUEsVUFBVSxFQUFFLGVBQWU7RUFDM0JLLElBQUFBLFNBQVMsRUFBRTtLQUNaO0VBRUQsRUFBQSxNQUFNQyxjQUFjLEdBQUc7RUFDckJuRCxJQUFBQSxRQUFRLEVBQUUsTUFBTTtFQUNoQm9ELElBQUFBLFVBQVUsRUFBRSxLQUFLO0VBQ2pCbkQsSUFBQUEsS0FBSyxFQUFFLFNBQVM7RUFDaEJvRCxJQUFBQSxNQUFNLEVBQUUsV0FBVztFQUNuQkMsSUFBQUEsYUFBYSxFQUFFLFdBQVc7RUFDMUJDLElBQUFBLGFBQWEsRUFBRTtLQUNoQjtJQUVELE1BQU1DLGNBQWMsR0FBR0EsT0FBTztFQUM1QnhELElBQUFBLFFBQVEsRUFBRSxNQUFNO0VBQ2hCb0QsSUFBQUEsVUFBVSxFQUFFLEtBQUs7RUFDakJuRCxJQUFBQSxLQUFLLEVBQUUsU0FBUztFQUNoQm9ELElBQUFBLE1BQU0sRUFBRTtFQUNWLEdBQUMsQ0FBQztFQUVGLEVBQUEsTUFBTUksa0JBQWtCLEdBQUc7RUFDekI3RCxJQUFBQSxPQUFPLEVBQUUsTUFBTTtFQUNmbUQsSUFBQUEsbUJBQW1CLEVBQUUsU0FBUztFQUM5QkMsSUFBQUEsR0FBRyxFQUFFO0tBQ047RUFFRCxFQUFBLE1BQU1VLGVBQWUsR0FBRztFQUN0QnpCLElBQUFBLGVBQWUsRUFBRSxTQUFTO0VBQzFCUyxJQUFBQSxNQUFNLEVBQUUsbUJBQW1CO0VBQzNCQyxJQUFBQSxZQUFZLEVBQUUsS0FBSztFQUNuQmdCLElBQUFBLFFBQVEsRUFBRSxRQUFRO0VBQ2xCVCxJQUFBQSxTQUFTLEVBQUU7S0FDWjtFQUVELEVBQUEsTUFBTVUsY0FBYyxHQUFHO0VBQ3JCNUQsSUFBQUEsUUFBUSxFQUFFLE1BQU07RUFDaEJvRCxJQUFBQSxVQUFVLEVBQUUsS0FBSztFQUNqQm5ELElBQUFBLEtBQUssRUFBRSxTQUFTO0VBQ2hCb0QsSUFBQUEsTUFBTSxFQUFFLEdBQUc7RUFDWGxCLElBQUFBLE9BQU8sRUFBRSxXQUFXO0VBQ3BCRixJQUFBQSxlQUFlLEVBQUUsU0FBUztFQUMxQk8sSUFBQUEsWUFBWSxFQUFFO0tBQ2Y7RUFFRCxFQUFBLE1BQU1xQixZQUFZLEdBQUc7RUFDbkIxQixJQUFBQSxPQUFPLEVBQUUsV0FBVztFQUNwQkssSUFBQUEsWUFBWSxFQUFFO0tBQ2Y7RUFFRCxFQUFBLE1BQU1zQixnQkFBZ0IsR0FBRztFQUN2QlYsSUFBQUEsVUFBVSxFQUFFLEtBQUs7RUFDakJuRCxJQUFBQSxLQUFLLEVBQUUsU0FBUztFQUNoQkQsSUFBQUEsUUFBUSxFQUFFLE1BQU07RUFDaEJzQyxJQUFBQSxZQUFZLEVBQUU7S0FDZjtFQUVELEVBQUEsTUFBTXlCLGtCQUFrQixHQUFHO0VBQ3pCOUQsSUFBQUEsS0FBSyxFQUFFLFNBQVM7RUFDaEJELElBQUFBLFFBQVEsRUFBRSxNQUFNO0VBQ2hCc0MsSUFBQUEsWUFBWSxFQUFFLEtBQUs7RUFDbkIwQixJQUFBQSxPQUFPLEVBQUU7S0FDVjtFQUVELEVBQUEsTUFBTUMsZ0JBQWdCLEdBQUc7RUFDdkJqRSxJQUFBQSxRQUFRLEVBQUUsTUFBTTtFQUNoQkMsSUFBQUEsS0FBSyxFQUFFLFNBQVM7RUFDaEIrRCxJQUFBQSxPQUFPLEVBQUU7S0FDVjtFQUVELEVBQUEsTUFBTUUsZUFBZSxHQUFHO0VBQ3RCQyxJQUFBQSxTQUFTLEVBQUUsUUFBUTtFQUNuQmxFLElBQUFBLEtBQUssRUFBRSxTQUFTO0VBQ2hCK0QsSUFBQUEsT0FBTyxFQUFFLEtBQUs7RUFDZEksSUFBQUEsU0FBUyxFQUFFLFFBQVE7RUFDbkJqQyxJQUFBQSxPQUFPLEVBQUU7S0FDVjtJQUVELG9CQUNFMUMsc0JBQUEsQ0FBQUMsYUFBQSxDQUFBLEtBQUEsRUFBQTtFQUFLQyxJQUFBQSxLQUFLLEVBQUVxQztLQUFlLGVBQ3pCdkMsc0JBQUEsQ0FBQUMsYUFBQSxDQUFBLEtBQUEsRUFBQTtFQUFLQyxJQUFBQSxLQUFLLEVBQUUwQztLQUFZLGVBQzdCNUMsc0JBQUEsQ0FBQUMsYUFBQSxDQUFBLElBQUEsRUFBQTtFQUFJQyxJQUFBQSxLQUFLLEVBQUU7RUFBRUssTUFBQUEsUUFBUSxFQUFFLFFBQVE7RUFBRW9ELE1BQUFBLFVBQVUsRUFBRSxNQUFNO0VBQUVDLE1BQUFBLE1BQU0sRUFBRSxDQUFDO0VBQUVwRCxNQUFBQSxLQUFLLEVBQUU7RUFBVTtFQUFFLEdBQUEsRUFBQyxpQkFFN0UsQ0FBQyxFQUFBLFVBQVEsZUFBQVIsc0JBQUEsQ0FBQUMsYUFBQSxDQUFBLFFBQUEsRUFBQTtFQUNQMkUsSUFBQUEsT0FBTyxFQUFFN0UsYUFBYztFQUN2QkcsSUFBQUEsS0FBSyxFQUFFOEMsa0JBQW1CO01BQzFCNkIsV0FBVyxFQUFHQyxDQUFDLElBQUtBLENBQUMsQ0FBQ0MsTUFBTSxDQUFDN0UsS0FBSyxDQUFDc0MsZUFBZSxHQUFHLFNBQVU7TUFDL0R3QyxVQUFVLEVBQUdGLENBQUMsSUFBS0EsQ0FBQyxDQUFDQyxNQUFNLENBQUM3RSxLQUFLLENBQUNzQyxlQUFlLEdBQUcsU0FBVTtFQUM5RDdCLElBQUFBLEtBQUssRUFBQztLQUFtQixlQUV6Qlgsc0JBQUEsQ0FBQUMsYUFBQSxDQUFBLEtBQUEsRUFBQTtFQUFLZ0YsSUFBQUEsS0FBSyxFQUFDLElBQUk7RUFBQzNFLElBQUFBLE1BQU0sRUFBQyxJQUFJO0VBQUM0RSxJQUFBQSxPQUFPLEVBQUMsV0FBVztFQUFDQyxJQUFBQSxJQUFJLEVBQUMsTUFBTTtFQUFDQyxJQUFBQSxNQUFNLEVBQUMsY0FBYztFQUFDQyxJQUFBQSxXQUFXLEVBQUM7S0FBRyxlQUMvRnJGLHNCQUFBLENBQUFDLGFBQUEsQ0FBQSxNQUFBLEVBQUE7RUFBTXFGLElBQUFBLENBQUMsRUFBQztFQUFvRCxHQUFDLENBQUMsZUFDOUR0RixzQkFBQSxDQUFBQyxhQUFBLENBQUEsTUFBQSxFQUFBO0VBQU1xRixJQUFBQSxDQUFDLEVBQUM7RUFBWSxHQUFDLENBQUMsZUFDdEJ0RixzQkFBQSxDQUFBQyxhQUFBLENBQUEsTUFBQSxFQUFBO0VBQU1xRixJQUFBQSxDQUFDLEVBQUM7RUFBcUQsR0FBQyxDQUFDLGVBQy9EdEYsc0JBQUEsQ0FBQUMsYUFBQSxDQUFBLE1BQUEsRUFBQTtFQUFNcUYsSUFBQUEsQ0FBQyxFQUFDO0VBQVksR0FBQyxDQUNsQixDQUNDLENBQ0wsQ0FBQyxlQUVOdEYsc0JBQUEsQ0FBQUMsYUFBQSxDQUFBLEtBQUEsRUFBQTtFQUFLQyxJQUFBQSxLQUFLLEVBQUVtRDtLQUFpQixFQUMxQjNDLFVBQVUsQ0FBQzZFLEdBQUcsQ0FBQyxDQUFDQyxJQUFJLEVBQUVDLEtBQUssa0JBQzFCekYsc0JBQUEsQ0FBQUMsYUFBQSxDQUFBLEtBQUEsRUFBQTtFQUNFeUYsSUFBQUEsR0FBRyxFQUFFRCxLQUFNO01BQ1hiLE9BQU8sRUFBRUEsTUFBTXJELGVBQWUsQ0FBQ2lFLElBQUksQ0FBQzFFLElBQUksQ0FBRTtFQUMxQ1osSUFBQUEsS0FBSyxFQUFFc0QsU0FBVTtNQUNqQnFCLFdBQVcsRUFBR0MsQ0FBQyxJQUFLO1FBQ2xCQSxDQUFDLENBQUNhLGFBQWEsQ0FBQ3pGLEtBQUssQ0FBQzBGLFdBQVcsR0FBR0osSUFBSSxDQUFDaEYsS0FBSztRQUM5Q3NFLENBQUMsQ0FBQ2EsYUFBYSxDQUFDekYsS0FBSyxDQUFDdUQsU0FBUyxHQUFHLENBQUEsV0FBQSxFQUFjK0IsSUFBSSxDQUFDaEYsS0FBSyxDQUFBLEVBQUEsQ0FBSTtNQUNoRSxDQUFFO01BQ0Z3RSxVQUFVLEVBQUdGLENBQUMsSUFBSztFQUNqQkEsTUFBQUEsQ0FBQyxDQUFDYSxhQUFhLENBQUN6RixLQUFLLENBQUMwRixXQUFXLEdBQUcsU0FBUztFQUM3Q2QsTUFBQUEsQ0FBQyxDQUFDYSxhQUFhLENBQUN6RixLQUFLLENBQUN1RCxTQUFTLEdBQUcsTUFBTTtFQUMxQyxJQUFBO0tBQUUsZUFFRnpELHNCQUFBLENBQUFDLGFBQUEsQ0FBQSxJQUFBLEVBQUE7RUFBSUMsSUFBQUEsS0FBSyxFQUFFd0Q7RUFBZSxHQUFBLEVBQUU4QixJQUFJLENBQUM3RSxLQUFVLENBQUMsZUFDNUNYLHNCQUFBLENBQUFDLGFBQUEsQ0FBQSxHQUFBLEVBQUE7TUFBR0MsS0FBSyxFQUFFNkQsY0FBYztLQUFHLEVBQUV5QixJQUFJLENBQUM1RSxLQUFTLENBQ3hDLENBQ04sQ0FDRSxDQUFDLGVBRU5aLHNCQUFBLENBQUFDLGFBQUEsQ0FBQSxLQUFBLEVBQUE7RUFBS0MsSUFBQUEsS0FBSyxFQUFFOEQ7S0FBbUIsZUFDN0JoRSxzQkFBQSxDQUFBQyxhQUFBLENBQUEsS0FBQSxFQUFBO0VBQUtDLElBQUFBLEtBQUssRUFBRStEO0tBQWdCLGVBQzFCakUsc0JBQUEsQ0FBQUMsYUFBQSxDQUFBLElBQUEsRUFBQTtFQUFJQyxJQUFBQSxLQUFLLEVBQUVpRTtFQUFlLEdBQUEsRUFBQyxrQkFBZ0IsRUFBQ3JHLFNBQVMsQ0FBQytILE1BQU0sRUFBQyxHQUFLLENBQUMsRUFDbEUvSCxTQUFTLENBQUMrSCxNQUFNLEtBQUssQ0FBQyxnQkFDckI3RixzQkFBQSxDQUFBQyxhQUFBLENBQUEsS0FBQSxFQUFBO0VBQUtDLElBQUFBLEtBQUssRUFBRXVFO0VBQWdCLEdBQUEsRUFBQywwQkFBNkIsQ0FBQyxHQUUzRDNHLFNBQVMsQ0FBQ3lILEdBQUcsQ0FBQyxDQUFDekcsR0FBRyxFQUFFZ0gsQ0FBQyxrQkFDbkI5RixzQkFBQSxDQUFBQyxhQUFBLENBQUEsS0FBQSxFQUFBO0VBQUt5RixJQUFBQSxHQUFHLEVBQUU1RyxHQUFHLENBQUNpSCxFQUFFLElBQUlELENBQUU7RUFBQzVGLElBQUFBLEtBQUssRUFBRTtFQUM1QixNQUFBLEdBQUdrRSxZQUFZO1FBQ2ZyQixZQUFZLEVBQUUrQyxDQUFDLEtBQUtoSSxTQUFTLENBQUMrSCxNQUFNLEdBQUcsQ0FBQyxHQUFHLE1BQU0sR0FBRztFQUN0RDtLQUFFLGVBQ0E3RixzQkFBQSxDQUFBQyxhQUFBLENBQUEsS0FBQSxFQUFBO0VBQUtDLElBQUFBLEtBQUssRUFBRW1FO0VBQWlCLEdBQUEsRUFDMUJ2RixHQUFHLENBQUNFLFVBQVUsRUFBQyxHQUFDLEVBQUNGLEdBQUcsQ0FBQ2tILFNBQ25CLENBQUMsZUFDTmhHLHNCQUFBLENBQUFDLGFBQUEsQ0FBQSxLQUFBLEVBQUE7RUFBS0MsSUFBQUEsS0FBSyxFQUFFb0U7RUFBbUIsR0FBQSxFQUFFeEYsR0FBRyxDQUFDbUgsTUFBWSxDQUFDLGVBQ2xEakcsc0JBQUEsQ0FBQUMsYUFBQSxDQUFBLEtBQUEsRUFBQTtFQUFLQyxJQUFBQSxLQUFLLEVBQUVzRTtFQUFpQixHQUFBLEVBQzFCN0MsVUFBVSxDQUFDN0MsR0FBRyxDQUFDb0gsVUFBVSxDQUN2QixDQUNGLENBQ04sQ0FFQSxDQUFDLGVBRU5sRyxzQkFBQSxDQUFBQyxhQUFBLENBQUEsS0FBQSxFQUFBO0VBQUtDLElBQUFBLEtBQUssRUFBRStEO0tBQWdCLGVBQzFCakUsc0JBQUEsQ0FBQUMsYUFBQSxDQUFBLElBQUEsRUFBQTtFQUFJQyxJQUFBQSxLQUFLLEVBQUVpRTtFQUFlLEdBQUEsRUFBQyxpQkFBZSxFQUFDbkcsUUFBUSxDQUFDNkgsTUFBTSxFQUFDLEdBQUssQ0FBQyxFQUNoRTdILFFBQVEsQ0FBQzZILE1BQU0sS0FBSyxDQUFDLGdCQUNwQjdGLHNCQUFBLENBQUFDLGFBQUEsQ0FBQSxLQUFBLEVBQUE7RUFBS0MsSUFBQUEsS0FBSyxFQUFFdUU7RUFBZ0IsR0FBQSxFQUFDLHlCQUE0QixDQUFDLEdBRTFEekcsUUFBUSxDQUFDdUgsR0FBRyxDQUFDLENBQUN6RyxHQUFHLEVBQUVnSCxDQUFDLGtCQUNsQjlGLHNCQUFBLENBQUFDLGFBQUEsQ0FBQSxLQUFBLEVBQUE7RUFBS3lGLElBQUFBLEdBQUcsRUFBRTVHLEdBQUcsQ0FBQ2lILEVBQUUsSUFBSUQsQ0FBRTtFQUFDNUYsSUFBQUEsS0FBSyxFQUFFO0VBQzVCLE1BQUEsR0FBR2tFLFlBQVk7UUFDZnJCLFlBQVksRUFBRStDLENBQUMsS0FBSzlILFFBQVEsQ0FBQzZILE1BQU0sR0FBRyxDQUFDLEdBQUcsTUFBTSxHQUFHO0VBQ3JEO0tBQUUsZUFDQTdGLHNCQUFBLENBQUFDLGFBQUEsQ0FBQSxLQUFBLEVBQUE7RUFBS0MsSUFBQUEsS0FBSyxFQUFFbUU7RUFBaUIsR0FBQSxFQUMxQnZGLEdBQUcsQ0FBQ0UsVUFBVSxFQUFDLEdBQUMsRUFBQ0YsR0FBRyxDQUFDa0gsU0FDbkIsQ0FBQyxlQUNOaEcsc0JBQUEsQ0FBQUMsYUFBQSxDQUFBLEtBQUEsRUFBQTtFQUFLQyxJQUFBQSxLQUFLLEVBQUVvRTtFQUFtQixHQUFBLEVBQUV4RixHQUFHLENBQUNtSCxNQUFZLENBQUMsZUFDbERqRyxzQkFBQSxDQUFBQyxhQUFBLENBQUEsS0FBQSxFQUFBO0VBQUtDLElBQUFBLEtBQUssRUFBRXNFO0tBQWlCLEVBQzFCN0MsVUFBVSxDQUFDN0MsR0FBRyxDQUFDb0gsVUFBVSxDQUN2QixDQUNGLENBQ04sQ0FFQSxDQUNGLENBQ0YsQ0FBQztFQUVWOztFQzVXQTtFQUlZLElBQUkvSSxpQkFBUztFQUVWLFNBQVNnSixTQUFTQSxHQUFHO0lBQ2xDLE1BQU0sQ0FBQ0MsU0FBUyxFQUFFQyxZQUFZLENBQUMsR0FBRzVJLGNBQVEsQ0FBQyxVQUFVLENBQUM7SUFDdEQsTUFBTSxDQUFDNkksU0FBUyxFQUFFQyxZQUFZLENBQUMsR0FBRzlJLGNBQVEsQ0FBQyxLQUFLLENBQUM7SUFDakQsTUFBTSxDQUFDQyxPQUFPLEVBQUVDLFVBQVUsQ0FBQyxHQUFHRixjQUFRLENBQUMsS0FBSyxDQUFDO0lBQzdDLE1BQU0sQ0FBQ0csS0FBSyxFQUFFQyxRQUFRLENBQUMsR0FBR0osY0FBUSxDQUFDLElBQUksQ0FBQztJQUN4QyxNQUFNLENBQUNGLElBQUksRUFBRUMsT0FBTyxDQUFDLEdBQUdDLGNBQVEsQ0FBQyxJQUFJLENBQUM7RUFFdEMsRUFBQSxNQUFNK0ksa0JBQWtCLEdBQUcsWUFBWTtNQUNyQzdJLFVBQVUsQ0FBQyxJQUFJLENBQUM7TUFDaEJFLFFBQVEsQ0FBQyxJQUFJLENBQUM7TUFFZCxJQUFJO1FBQ0YsTUFBTVcsUUFBUSxHQUFHLE1BQU1tQixLQUFLLENBQUMsQ0FBQSwyQkFBQSxFQUE4QjJHLFNBQVMsRUFBRSxDQUFDO0VBRXZFLE1BQUEsSUFBSSxDQUFDOUgsUUFBUSxDQUFDb0IsRUFBRSxFQUFFO0VBQ2hCLFFBQUEsTUFBTSxJQUFJVCxLQUFLLENBQUMsZ0NBQWdDLENBQUM7RUFDbkQsTUFBQTtFQUVBLE1BQUEsTUFBTXNILGFBQWEsR0FBRyxNQUFNakksUUFBUSxDQUFDc0IsSUFBSSxFQUFFO1FBQzNDdEMsT0FBTyxDQUFDaUosYUFBYSxDQUFDO01BQ3hCLENBQUMsQ0FBQyxPQUFPckgsR0FBRyxFQUFFO0VBQ1pzSCxNQUFBQSxPQUFPLENBQUM5SSxLQUFLLENBQUMsd0JBQXdCLEVBQUV3QixHQUFHLENBQUM7UUFDNUN2QixRQUFRLENBQUMsK0JBQStCLENBQUM7RUFDekNMLE1BQUFBLE9BQU8sQ0FBQztVQUNObUosUUFBUSxFQUFFLEVBQUU7RUFDWkMsUUFBQUEsWUFBWSxFQUFFO1lBQUVELFFBQVEsRUFBRSxFQUFFO0VBQUVFLFVBQUFBLGdCQUFnQixFQUFFLEVBQUU7RUFBRUMsVUFBQUEsY0FBYyxFQUFFLEVBQUU7RUFBRUMsVUFBQUEsa0JBQWtCLEVBQUU7V0FBSTtFQUNoRzdILFFBQUFBLEtBQUssRUFBRTtZQUFFeUgsUUFBUSxFQUFFLEVBQUU7RUFBRUssVUFBQUEsVUFBVSxFQUFFLEVBQUU7RUFBRUMsVUFBQUEsZ0JBQWdCLEVBQUUsRUFBRTtFQUFFQyxVQUFBQSxXQUFXLEVBQUU7V0FBSTtFQUM5RUMsUUFBQUEsWUFBWSxFQUFFO0VBQUVDLFVBQUFBLFFBQVEsRUFBRTtFQUFHO0VBQy9CLE9BQUMsQ0FBQztFQUNKLElBQUEsQ0FBQyxTQUFTO1FBQ1J6SixVQUFVLENBQUMsS0FBSyxDQUFDO0VBQ25CLElBQUE7SUFDRixDQUFDO0VBRUQyQixFQUFBQSxlQUFTLENBQUMsTUFBTTtFQUNka0gsSUFBQUEsa0JBQWtCLEVBQUU7RUFDdEIsRUFBQSxDQUFDLEVBQUUsQ0FBQ0YsU0FBUyxDQUFDLENBQUM7SUFFZixNQUFNZSxjQUFjLEdBQUlDLE1BQU0sSUFBSztFQUNqQyxJQUFBLE9BQU8sSUFBSUMsSUFBSSxDQUFDQyxZQUFZLENBQUMsT0FBTyxFQUFFO0VBQ3BDdEgsTUFBQUEsS0FBSyxFQUFFLFVBQVU7RUFDakJ1SCxNQUFBQSxRQUFRLEVBQUU7RUFDWixLQUFDLENBQUMsQ0FBQ0MsTUFBTSxDQUFDSixNQUFNLElBQUksQ0FBQyxDQUFDO0lBQ3hCLENBQUM7SUFFRCxNQUFNSyxVQUFVLEdBQUkvRixVQUFVLElBQUs7TUFDakMsT0FBTyxJQUFJRSxJQUFJLENBQUNGLFVBQVUsQ0FBQyxDQUFDVSxrQkFBa0IsQ0FBQyxPQUFPLEVBQUU7RUFDdERzRixNQUFBQSxLQUFLLEVBQUUsT0FBTztFQUNkQyxNQUFBQSxHQUFHLEVBQUU7RUFDUCxLQUFDLENBQUM7SUFDSixDQUFDO0lBRUQsTUFBTUMsZ0JBQWdCLEdBQUlsSCxLQUFLLElBQUs7TUFDbEMsT0FBTyxDQUFBLEVBQUcsQ0FBQ0EsS0FBSyxJQUFJLENBQUMsRUFBRW1ILE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQSxDQUFBLENBQUc7SUFDdEMsQ0FBQztFQUVELEVBQUEsSUFBSXJLLE9BQU8sRUFBRTtNQUNYLG9CQUNFc0Msc0JBQUEsQ0FBQUMsYUFBQSxDQUFBLEtBQUEsRUFBQTtFQUFLQyxNQUFBQSxLQUFLLEVBQUU7RUFDVkMsUUFBQUEsT0FBTyxFQUFFLE1BQU07RUFDZkMsUUFBQUEsY0FBYyxFQUFFLFFBQVE7RUFDeEJDLFFBQUFBLFVBQVUsRUFBRSxRQUFRO0VBQ3BCb0MsUUFBQUEsU0FBUyxFQUFFLE9BQU87RUFDbEJFLFFBQUFBLFVBQVUsRUFBRTtFQUNkO09BQUUsZUFDQTNDLHNCQUFBLENBQUFDLGFBQUEsQ0FBQSxLQUFBLEVBQUE7RUFBS0MsTUFBQUEsS0FBSyxFQUFFO0VBQUV3RSxRQUFBQSxTQUFTLEVBQUU7RUFBUztPQUFFLGVBQ2xDMUUsc0JBQUEsQ0FBQUMsYUFBQSxDQUFBLEtBQUEsRUFBQTtFQUFLQyxNQUFBQSxLQUFLLEVBQUU7RUFDVitFLFFBQUFBLEtBQUssRUFBRSxNQUFNO0VBQ2IzRSxRQUFBQSxNQUFNLEVBQUUsTUFBTTtFQUNkMkMsUUFBQUEsTUFBTSxFQUFFLG1CQUFtQjtFQUMzQitFLFFBQUFBLFNBQVMsRUFBRSxtQkFBbUI7RUFDOUI5RSxRQUFBQSxZQUFZLEVBQUUsS0FBSztFQUNuQitFLFFBQUFBLFNBQVMsRUFBRSx5QkFBeUI7RUFDcENyRSxRQUFBQSxNQUFNLEVBQUU7RUFDVjtFQUFFLEtBQU0sQ0FBQyxlQUNUNUQsc0JBQUEsQ0FBQUMsYUFBQSxDQUFBLEdBQUEsRUFBQTtFQUFHQyxNQUFBQSxLQUFLLEVBQUU7RUFBRU0sUUFBQUEsS0FBSyxFQUFFO0VBQVU7RUFBRSxLQUFBLEVBQUMsc0JBQXVCLENBQUMsZUFDeERSLHNCQUFBLENBQUFDLGFBQUEsQ0FBQSxPQUFBLEVBQUEsSUFBQSxFQUFRO0FBQ2xCO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsVUFBQSxDQUFtQixDQUNOLENBQ0YsQ0FBQztFQUVWLEVBQUE7SUFFQSxvQkFDRUQsc0JBQUEsQ0FBQUMsYUFBQSxDQUFBLEtBQUEsRUFBQTtFQUFLQyxJQUFBQSxLQUFLLEVBQUU7RUFDVndDLE1BQUFBLE9BQU8sRUFBRSxNQUFNO0VBQ2ZDLE1BQUFBLFVBQVUsRUFBRSxtRUFBbUU7RUFDL0VILE1BQUFBLGVBQWUsRUFBRSxTQUFTO0VBQzFCQyxNQUFBQSxTQUFTLEVBQUU7RUFDYjtLQUFFLGVBRUF6QyxzQkFBQSxDQUFBQyxhQUFBLENBQUEsS0FBQSxFQUFBO0VBQUtDLElBQUFBLEtBQUssRUFBRTtFQUFFMkMsTUFBQUEsWUFBWSxFQUFFO0VBQU87S0FBRSxlQUNuQzdDLHNCQUFBLENBQUFDLGFBQUEsQ0FBQSxLQUFBLEVBQUE7RUFBS0MsSUFBQUEsS0FBSyxFQUFFO0VBQ1ZDLE1BQUFBLE9BQU8sRUFBRSxNQUFNO0VBQ2ZDLE1BQUFBLGNBQWMsRUFBRSxlQUFlO0VBQy9CQyxNQUFBQSxVQUFVLEVBQUUsUUFBUTtFQUNwQndDLE1BQUFBLFlBQVksRUFBRTtFQUNoQjtFQUFFLEdBQUEsZUFDQTdDLHNCQUFBLENBQUFDLGFBQUEsQ0FBQSxLQUFBLEVBQUEsSUFBQSxlQUNFRCxzQkFBQSxDQUFBQyxhQUFBLENBQUEsSUFBQSxFQUFBO0VBQUlDLElBQUFBLEtBQUssRUFBRTtFQUNUMEQsTUFBQUEsTUFBTSxFQUFFLFdBQVc7RUFDbkJyRCxNQUFBQSxRQUFRLEVBQUUsTUFBTTtFQUNoQm9ELE1BQUFBLFVBQVUsRUFBRSxLQUFLO0VBQ2pCbkQsTUFBQUEsS0FBSyxFQUFFO0VBQ1Q7RUFBRSxHQUFBLEVBQUMscUJBRUMsQ0FBQyxlQUNMUixzQkFBQSxDQUFBQyxhQUFBLENBQUEsR0FBQSxFQUFBO0VBQUdDLElBQUFBLEtBQUssRUFBRTtFQUFFMEQsTUFBQUEsTUFBTSxFQUFFLEdBQUc7RUFBRXBELE1BQUFBLEtBQUssRUFBRSxTQUFTO0VBQUVELE1BQUFBLFFBQVEsRUFBRTtFQUFPO0VBQUUsR0FBQSxFQUFDLDZDQUU1RCxDQUNBLENBQUMsZUFFTlAsc0JBQUEsQ0FBQUMsYUFBQSxDQUFBLEtBQUEsRUFBQTtFQUFLQyxJQUFBQSxLQUFLLEVBQUU7RUFBRUMsTUFBQUEsT0FBTyxFQUFFLE1BQU07RUFBRW9ELE1BQUFBLEdBQUcsRUFBRSxNQUFNO0VBQUVsRCxNQUFBQSxVQUFVLEVBQUU7RUFBUztLQUFFLGVBQ2pFTCxzQkFBQSxDQUFBQyxhQUFBLENBQUEsUUFBQSxFQUFBO0VBQ0VXLElBQUFBLEtBQUssRUFBRTBGLFNBQVU7TUFDakI0QixRQUFRLEVBQUdwRCxDQUFDLElBQUt5QixZQUFZLENBQUN6QixDQUFDLENBQUNDLE1BQU0sQ0FBQ25FLEtBQUssQ0FBRTtFQUM5Q1YsSUFBQUEsS0FBSyxFQUFFO0VBQ0x3QyxNQUFBQSxPQUFPLEVBQUUsVUFBVTtFQUNuQk8sTUFBQUEsTUFBTSxFQUFFLG1CQUFtQjtFQUMzQkMsTUFBQUEsWUFBWSxFQUFFLEtBQUs7RUFDbkIzQyxNQUFBQSxRQUFRLEVBQUUsTUFBTTtFQUNoQmlDLE1BQUFBLGVBQWUsRUFBRSxPQUFPO0VBQ3hCVyxNQUFBQSxNQUFNLEVBQUU7RUFDVjtLQUFFLGVBRUZuRCxzQkFBQSxDQUFBQyxhQUFBLENBQUEsUUFBQSxFQUFBO0VBQVFXLElBQUFBLEtBQUssRUFBQztFQUFJLEdBQUEsRUFBQyxRQUFjLENBQUMsZUFDbENaLHNCQUFBLENBQUFDLGFBQUEsQ0FBQSxRQUFBLEVBQUE7RUFBUVcsSUFBQUEsS0FBSyxFQUFDO0VBQUssR0FBQSxFQUFDLFNBQWUsQ0FBQyxlQUNwQ1osc0JBQUEsQ0FBQUMsYUFBQSxDQUFBLFFBQUEsRUFBQTtFQUFRVyxJQUFBQSxLQUFLLEVBQUM7RUFBSyxHQUFBLEVBQUMsU0FBZSxDQUFDLGVBQ3BDWixzQkFBQSxDQUFBQyxhQUFBLENBQUEsUUFBQSxFQUFBO0VBQVFXLElBQUFBLEtBQUssRUFBQztFQUFJLEdBQUEsRUFBQyxRQUFjLENBQzNCLENBQUMsZUFFVFosc0JBQUEsQ0FBQUMsYUFBQSxDQUFBLFFBQUEsRUFBQTtFQUNFMkUsSUFBQUEsT0FBTyxFQUFFNEIsa0JBQW1CO0VBQzVCdEcsSUFBQUEsS0FBSyxFQUFFO0VBQ0x3QyxNQUFBQSxPQUFPLEVBQUUsVUFBVTtFQUNuQkYsTUFBQUEsZUFBZSxFQUFFLFNBQVM7RUFDMUJoQyxNQUFBQSxLQUFLLEVBQUUsT0FBTztFQUNkeUMsTUFBQUEsTUFBTSxFQUFFLE1BQU07RUFDZEMsTUFBQUEsWUFBWSxFQUFFLEtBQUs7RUFDbkJDLE1BQUFBLE1BQU0sRUFBRSxTQUFTO0VBQ2pCNUMsTUFBQUEsUUFBUSxFQUFFLE1BQU07RUFDaEJvRCxNQUFBQSxVQUFVLEVBQUU7RUFDZDtLQUFFLEVBQ0gsU0FFTyxDQUNMLENBQ0YsQ0FBQyxFQUVML0YsS0FBSyxpQkFDSm9DLHNCQUFBLENBQUFDLGFBQUEsQ0FBQSxLQUFBLEVBQUE7RUFBS0MsSUFBQUEsS0FBSyxFQUFFO0VBQ1Z3QyxNQUFBQSxPQUFPLEVBQUUsV0FBVztFQUNwQkYsTUFBQUEsZUFBZSxFQUFFLFNBQVM7RUFDMUJTLE1BQUFBLE1BQU0sRUFBRSxtQkFBbUI7RUFDM0JDLE1BQUFBLFlBQVksRUFBRSxLQUFLO0VBQ25CMUMsTUFBQUEsS0FBSyxFQUFFLFNBQVM7RUFDaEJxQyxNQUFBQSxZQUFZLEVBQUUsTUFBTTtFQUNwQnRDLE1BQUFBLFFBQVEsRUFBRTtFQUNaO0VBQUUsR0FBQSxFQUNDM0MsS0FDRSxDQUNOLGVBRURvQyxzQkFBQSxDQUFBQyxhQUFBLENBQUEsS0FBQSxFQUFBO0VBQUtDLElBQUFBLEtBQUssRUFBRTtFQUFFNkMsTUFBQUEsWUFBWSxFQUFFO0VBQW9CO0tBQUUsZUFDaEQvQyxzQkFBQSxDQUFBQyxhQUFBLENBQUEsS0FBQSxFQUFBO0VBQUtDLElBQUFBLEtBQUssRUFBRTtFQUFFQyxNQUFBQSxPQUFPLEVBQUUsTUFBTTtFQUFFb0QsTUFBQUEsR0FBRyxFQUFFO0VBQU87RUFBRSxHQUFBLEVBQzFDLENBQ0M7RUFBRXdDLElBQUFBLEVBQUUsRUFBRSxVQUFVO0VBQUVvQyxJQUFBQSxLQUFLLEVBQUU7RUFBVyxHQUFDLEVBQ3JDO0VBQUVwQyxJQUFBQSxFQUFFLEVBQUUsY0FBYztFQUFFb0MsSUFBQUEsS0FBSyxFQUFFO0VBQWUsR0FBQyxFQUM3QztFQUFFcEMsSUFBQUEsRUFBRSxFQUFFLE9BQU87RUFBRW9DLElBQUFBLEtBQUssRUFBRTtFQUFRLEdBQUMsRUFDL0I7RUFBRXBDLElBQUFBLEVBQUUsRUFBRSxVQUFVO0VBQUVvQyxJQUFBQSxLQUFLLEVBQUU7RUFBVyxHQUFDLEVBQ3JDO0VBQUVwQyxJQUFBQSxFQUFFLEVBQUUsV0FBVztFQUFFb0MsSUFBQUEsS0FBSyxFQUFFO0tBQWEsQ0FDeEMsQ0FBQzVDLEdBQUcsQ0FBQzZDLEdBQUcsaUJBQ1BwSSxzQkFBQSxDQUFBQyxhQUFBLENBQUEsUUFBQSxFQUFBO01BQ0V5RixHQUFHLEVBQUUwQyxHQUFHLENBQUNyQyxFQUFHO01BQ1puQixPQUFPLEVBQUVBLE1BQU15QixZQUFZLENBQUMrQixHQUFHLENBQUNyQyxFQUFFLENBQUU7RUFDcEM3RixJQUFBQSxLQUFLLEVBQUU7RUFDTHdDLE1BQUFBLE9BQU8sRUFBRSxRQUFRO0VBQ2pCTyxNQUFBQSxNQUFNLEVBQUUsTUFBTTtFQUNkb0YsTUFBQUEsVUFBVSxFQUFFLE1BQU07RUFDbEI5SCxNQUFBQSxRQUFRLEVBQUUsTUFBTTtFQUNoQm9ELE1BQUFBLFVBQVUsRUFBRSxLQUFLO1FBQ2pCbkQsS0FBSyxFQUFFNEYsU0FBUyxLQUFLZ0MsR0FBRyxDQUFDckMsRUFBRSxHQUFHLFNBQVMsR0FBRyxTQUFTO1FBQ25EaEQsWUFBWSxFQUFFcUQsU0FBUyxLQUFLZ0MsR0FBRyxDQUFDckMsRUFBRSxHQUFHLG1CQUFtQixHQUFHLHVCQUF1QjtFQUNsRjVDLE1BQUFBLE1BQU0sRUFBRSxTQUFTO0VBQ2pCQyxNQUFBQSxVQUFVLEVBQUU7RUFDZDtLQUFFLEVBRURnRixHQUFHLENBQUNELEtBQ0MsQ0FDVCxDQUNFLENBQ0YsQ0FDRixDQUFDLGVBRU5uSSxzQkFBQSxDQUFBQyxhQUFBLENBQUEsS0FBQSxFQUFBO0VBQUtDLElBQUFBLEtBQUssRUFBRTtFQUFFdUMsTUFBQUEsU0FBUyxFQUFFO0VBQVE7S0FBRSxFQUNoQzJELFNBQVMsS0FBSyxVQUFVLGlCQUN2QnBHLHNCQUFBLENBQUFDLGFBQUEsQ0FBQSxLQUFBLEVBQUEsSUFBQSxlQUNFRCxzQkFBQSxDQUFBQyxhQUFBLENBQUEsS0FBQSxFQUFBO0VBQUtDLElBQUFBLEtBQUssRUFBRTtFQUNWQyxNQUFBQSxPQUFPLEVBQUUsTUFBTTtFQUNmbUQsTUFBQUEsbUJBQW1CLEVBQUUsc0NBQXNDO0VBQzNEQyxNQUFBQSxHQUFHLEVBQUUsTUFBTTtFQUNYVixNQUFBQSxZQUFZLEVBQUU7RUFDaEI7S0FBRSxlQUNBN0Msc0JBQUEsQ0FBQUMsYUFBQSxDQUFBLEtBQUEsRUFBQTtFQUFLQyxJQUFBQSxLQUFLLEVBQUU7RUFDVndDLE1BQUFBLE9BQU8sRUFBRSxNQUFNO0VBQ2ZGLE1BQUFBLGVBQWUsRUFBRSxPQUFPO0VBQ3hCVSxNQUFBQSxZQUFZLEVBQUUsTUFBTTtFQUNwQk8sTUFBQUEsU0FBUyxFQUFFLDJCQUEyQjtFQUN0Q1IsTUFBQUEsTUFBTSxFQUFFO0VBQ1Y7S0FBRSxlQUNBakQsc0JBQUEsQ0FBQUMsYUFBQSxDQUFBLEtBQUEsRUFBQTtFQUFLQyxJQUFBQSxLQUFLLEVBQUU7RUFBRUMsTUFBQUEsT0FBTyxFQUFFLE1BQU07RUFBRUUsTUFBQUEsVUFBVSxFQUFFLFFBQVE7RUFBRUQsTUFBQUEsY0FBYyxFQUFFO0VBQWdCO0VBQUUsR0FBQSxlQUNyRkosc0JBQUEsQ0FBQUMsYUFBQSxDQUFBLEtBQUEsRUFBQSxJQUFBLGVBQ0VELHNCQUFBLENBQUFDLGFBQUEsQ0FBQSxLQUFBLEVBQUE7RUFBS0MsSUFBQUEsS0FBSyxFQUFFO0VBQUUyQyxNQUFBQSxZQUFZLEVBQUUsS0FBSztFQUFFdEMsTUFBQUEsUUFBUSxFQUFFLE1BQU07RUFBRUMsTUFBQUEsS0FBSyxFQUFFLFNBQVM7RUFBRW1ELE1BQUFBLFVBQVUsRUFBRTtFQUFNO0VBQUUsR0FBQSxFQUFDLGFBRXZGLENBQUMsZUFDTjNELHNCQUFBLENBQUFDLGFBQUEsQ0FBQSxLQUFBLEVBQUE7RUFBS0MsSUFBQUEsS0FBSyxFQUFFO0VBQUVLLE1BQUFBLFFBQVEsRUFBRSxNQUFNO0VBQUVvRCxNQUFBQSxVQUFVLEVBQUUsS0FBSztFQUFFbkQsTUFBQUEsS0FBSyxFQUFFO0VBQVU7RUFBRSxHQUFBLEVBQ25FLENBQUNqRCxJQUFJLEVBQUVvSixRQUFRLEVBQUUyQixVQUFVLElBQUksQ0FBQyxFQUFFaEgsY0FBYyxFQUM5QyxDQUFDLGVBQ050QixzQkFBQSxDQUFBQyxhQUFBLENBQUEsS0FBQSxFQUFBO0VBQUtDLElBQUFBLEtBQUssRUFBRTtFQUFFSyxNQUFBQSxRQUFRLEVBQUUsTUFBTTtFQUFFQyxNQUFBQSxLQUFLLEVBQUUsU0FBUztFQUFFK0gsTUFBQUEsU0FBUyxFQUFFLEtBQUs7RUFBRTVFLE1BQUFBLFVBQVUsRUFBRTtFQUFNO0VBQUUsR0FBQSxFQUFDLEdBQ3RGLEVBQUNwRyxJQUFJLEVBQUVvSixRQUFRLEVBQUU2QixhQUFhLElBQUksQ0FBQyxFQUFDLFFBQ2xDLENBQ0YsQ0FBQyxlQUNOeEksc0JBQUEsQ0FBQUMsYUFBQSxDQUFBLEtBQUEsRUFBQTtFQUFLQyxJQUFBQSxLQUFLLEVBQUU7RUFDVndDLE1BQUFBLE9BQU8sRUFBRSxNQUFNO0VBQ2ZGLE1BQUFBLGVBQWUsRUFBRSxTQUFTO0VBQzFCVSxNQUFBQSxZQUFZLEVBQUUsTUFBTTtFQUNwQjNDLE1BQUFBLFFBQVEsRUFBRTtFQUNaO0VBQUUsR0FBQSxFQUFDLGNBRUUsQ0FDRixDQUNGLENBQUMsZUFFTlAsc0JBQUEsQ0FBQUMsYUFBQSxDQUFBLEtBQUEsRUFBQTtFQUFLQyxJQUFBQSxLQUFLLEVBQUU7RUFDVndDLE1BQUFBLE9BQU8sRUFBRSxNQUFNO0VBQ2ZGLE1BQUFBLGVBQWUsRUFBRSxPQUFPO0VBQ3hCVSxNQUFBQSxZQUFZLEVBQUUsTUFBTTtFQUNwQk8sTUFBQUEsU0FBUyxFQUFFLDJCQUEyQjtFQUN0Q1IsTUFBQUEsTUFBTSxFQUFFO0VBQ1Y7S0FBRSxlQUNBakQsc0JBQUEsQ0FBQUMsYUFBQSxDQUFBLEtBQUEsRUFBQTtFQUFLQyxJQUFBQSxLQUFLLEVBQUU7RUFBRUMsTUFBQUEsT0FBTyxFQUFFLE1BQU07RUFBRUUsTUFBQUEsVUFBVSxFQUFFLFFBQVE7RUFBRUQsTUFBQUEsY0FBYyxFQUFFO0VBQWdCO0VBQUUsR0FBQSxlQUNyRkosc0JBQUEsQ0FBQUMsYUFBQSxDQUFBLEtBQUEsRUFBQSxJQUFBLGVBQ0VELHNCQUFBLENBQUFDLGFBQUEsQ0FBQSxLQUFBLEVBQUE7RUFBS0MsSUFBQUEsS0FBSyxFQUFFO0VBQUUyQyxNQUFBQSxZQUFZLEVBQUUsS0FBSztFQUFFdEMsTUFBQUEsUUFBUSxFQUFFLE1BQU07RUFBRUMsTUFBQUEsS0FBSyxFQUFFLFNBQVM7RUFBRW1ELE1BQUFBLFVBQVUsRUFBRTtFQUFNO0VBQUUsR0FBQSxFQUFDLG9CQUV2RixDQUFDLGVBQ04zRCxzQkFBQSxDQUFBQyxhQUFBLENBQUEsS0FBQSxFQUFBO0VBQUtDLElBQUFBLEtBQUssRUFBRTtFQUFFSyxNQUFBQSxRQUFRLEVBQUUsTUFBTTtFQUFFb0QsTUFBQUEsVUFBVSxFQUFFLEtBQUs7RUFBRW5ELE1BQUFBLEtBQUssRUFBRTtFQUFVO0VBQUUsR0FBQSxFQUNuRSxDQUFDakQsSUFBSSxFQUFFcUosWUFBWSxFQUFFRCxRQUFRLEVBQUU4QixpQkFBaUIsSUFBSSxDQUFDLEVBQUVuSCxjQUFjLEVBQ25FLENBQUMsZUFDTnRCLHNCQUFBLENBQUFDLGFBQUEsQ0FBQSxLQUFBLEVBQUE7RUFBS0MsSUFBQUEsS0FBSyxFQUFFO0VBQUVLLE1BQUFBLFFBQVEsRUFBRSxNQUFNO0VBQUVDLE1BQUFBLEtBQUssRUFBRSxTQUFTO0VBQUUrSCxNQUFBQSxTQUFTLEVBQUUsS0FBSztFQUFFNUUsTUFBQUEsVUFBVSxFQUFFO0VBQU07RUFBRSxHQUFBLEVBQ3JGcEcsSUFBSSxFQUFFcUosWUFBWSxFQUFFRCxRQUFRLEVBQUUrQixpQkFBaUIsSUFBSSxDQUFDLEVBQUMsUUFDbkQsQ0FDRixDQUFDLGVBQ04xSSxzQkFBQSxDQUFBQyxhQUFBLENBQUEsS0FBQSxFQUFBO0VBQUtDLElBQUFBLEtBQUssRUFBRTtFQUNWd0MsTUFBQUEsT0FBTyxFQUFFLE1BQU07RUFDZkYsTUFBQUEsZUFBZSxFQUFFLFNBQVM7RUFDMUJVLE1BQUFBLFlBQVksRUFBRSxNQUFNO0VBQ3BCM0MsTUFBQUEsUUFBUSxFQUFFO0VBQ1o7RUFBRSxHQUFBLEVBQUMsY0FFRSxDQUNGLENBQ0YsQ0FBQyxlQUVOUCxzQkFBQSxDQUFBQyxhQUFBLENBQUEsS0FBQSxFQUFBO0VBQUtDLElBQUFBLEtBQUssRUFBRTtFQUNWd0MsTUFBQUEsT0FBTyxFQUFFLE1BQU07RUFDZkYsTUFBQUEsZUFBZSxFQUFFLE9BQU87RUFDeEJVLE1BQUFBLFlBQVksRUFBRSxNQUFNO0VBQ3BCTyxNQUFBQSxTQUFTLEVBQUUsMkJBQTJCO0VBQ3RDUixNQUFBQSxNQUFNLEVBQUU7RUFDVjtLQUFFLGVBQ0FqRCxzQkFBQSxDQUFBQyxhQUFBLENBQUEsS0FBQSxFQUFBO0VBQUtDLElBQUFBLEtBQUssRUFBRTtFQUFFQyxNQUFBQSxPQUFPLEVBQUUsTUFBTTtFQUFFRSxNQUFBQSxVQUFVLEVBQUUsUUFBUTtFQUFFRCxNQUFBQSxjQUFjLEVBQUU7RUFBZ0I7RUFBRSxHQUFBLGVBQ3JGSixzQkFBQSxDQUFBQyxhQUFBLENBQUEsS0FBQSxFQUFBLElBQUEsZUFDRUQsc0JBQUEsQ0FBQUMsYUFBQSxDQUFBLEtBQUEsRUFBQTtFQUFLQyxJQUFBQSxLQUFLLEVBQUU7RUFBRTJDLE1BQUFBLFlBQVksRUFBRSxLQUFLO0VBQUV0QyxNQUFBQSxRQUFRLEVBQUUsTUFBTTtFQUFFQyxNQUFBQSxLQUFLLEVBQUUsU0FBUztFQUFFbUQsTUFBQUEsVUFBVSxFQUFFO0VBQU07RUFBRSxHQUFBLEVBQUMsaUJBRXZGLENBQUMsZUFDTjNELHNCQUFBLENBQUFDLGFBQUEsQ0FBQSxLQUFBLEVBQUE7RUFBS0MsSUFBQUEsS0FBSyxFQUFFO0VBQUVLLE1BQUFBLFFBQVEsRUFBRSxNQUFNO0VBQUVvRCxNQUFBQSxVQUFVLEVBQUUsS0FBSztFQUFFbkQsTUFBQUEsS0FBSyxFQUFFO0VBQVU7RUFBRSxHQUFBLEVBQ25FLENBQUNqRCxJQUFJLEVBQUVvSixRQUFRLEVBQUVnQyxjQUFjLElBQUksQ0FBQyxFQUFFckgsY0FBYyxFQUNsRCxDQUFDLGVBQ050QixzQkFBQSxDQUFBQyxhQUFBLENBQUEsS0FBQSxFQUFBO0VBQUtDLElBQUFBLEtBQUssRUFBRTtFQUFFSyxNQUFBQSxRQUFRLEVBQUUsTUFBTTtFQUFFQyxNQUFBQSxLQUFLLEVBQUUsU0FBUztFQUFFK0gsTUFBQUEsU0FBUyxFQUFFLEtBQUs7RUFBRTVFLE1BQUFBLFVBQVUsRUFBRTtFQUFNO0VBQUUsR0FBQSxFQUNyRnBHLElBQUksRUFBRW9KLFFBQVEsRUFBRWlDLGlCQUFpQixJQUFJLENBQUMsRUFBQyxZQUNyQyxDQUNGLENBQUMsZUFDTjVJLHNCQUFBLENBQUFDLGFBQUEsQ0FBQSxLQUFBLEVBQUE7RUFBS0MsSUFBQUEsS0FBSyxFQUFFO0VBQ1Z3QyxNQUFBQSxPQUFPLEVBQUUsTUFBTTtFQUNmRixNQUFBQSxlQUFlLEVBQUUsU0FBUztFQUMxQlUsTUFBQUEsWUFBWSxFQUFFLE1BQU07RUFDcEIzQyxNQUFBQSxRQUFRLEVBQUU7RUFDWjtFQUFFLEdBQUEsRUFBQyxjQUVFLENBQ0YsQ0FDRixDQUFDLGVBRU5QLHNCQUFBLENBQUFDLGFBQUEsQ0FBQSxLQUFBLEVBQUE7RUFBS0MsSUFBQUEsS0FBSyxFQUFFO0VBQ1Z3QyxNQUFBQSxPQUFPLEVBQUUsTUFBTTtFQUNmRixNQUFBQSxlQUFlLEVBQUUsT0FBTztFQUN4QlUsTUFBQUEsWUFBWSxFQUFFLE1BQU07RUFDcEJPLE1BQUFBLFNBQVMsRUFBRSwyQkFBMkI7RUFDdENSLE1BQUFBLE1BQU0sRUFBRTtFQUNWO0tBQUUsZUFDQWpELHNCQUFBLENBQUFDLGFBQUEsQ0FBQSxLQUFBLEVBQUE7RUFBS0MsSUFBQUEsS0FBSyxFQUFFO0VBQUVDLE1BQUFBLE9BQU8sRUFBRSxNQUFNO0VBQUVFLE1BQUFBLFVBQVUsRUFBRSxRQUFRO0VBQUVELE1BQUFBLGNBQWMsRUFBRTtFQUFnQjtFQUFFLEdBQUEsZUFDckZKLHNCQUFBLENBQUFDLGFBQUEsQ0FBQSxLQUFBLEVBQUEsSUFBQSxlQUNFRCxzQkFBQSxDQUFBQyxhQUFBLENBQUEsS0FBQSxFQUFBO0VBQUtDLElBQUFBLEtBQUssRUFBRTtFQUFFMkMsTUFBQUEsWUFBWSxFQUFFLEtBQUs7RUFBRXRDLE1BQUFBLFFBQVEsRUFBRSxNQUFNO0VBQUVDLE1BQUFBLEtBQUssRUFBRSxTQUFTO0VBQUVtRCxNQUFBQSxVQUFVLEVBQUU7RUFBTTtFQUFFLEdBQUEsRUFBQyxlQUV2RixDQUFDLGVBQ04zRCxzQkFBQSxDQUFBQyxhQUFBLENBQUEsS0FBQSxFQUFBO0VBQUtDLElBQUFBLEtBQUssRUFBRTtFQUFFSyxNQUFBQSxRQUFRLEVBQUUsTUFBTTtFQUFFb0QsTUFBQUEsVUFBVSxFQUFFLEtBQUs7RUFBRW5ELE1BQUFBLEtBQUssRUFBRTtFQUFVO0VBQUUsR0FBQSxFQUNuRTZHLGNBQWMsQ0FBQzlKLElBQUksRUFBRW9KLFFBQVEsRUFBRXRGLFlBQVksSUFBSSxDQUFDLENBQzlDLENBQUMsZUFDTnJCLHNCQUFBLENBQUFDLGFBQUEsQ0FBQSxLQUFBLEVBQUE7RUFBS0MsSUFBQUEsS0FBSyxFQUFFO0VBQUVLLE1BQUFBLFFBQVEsRUFBRSxNQUFNO0VBQUVDLE1BQUFBLEtBQUssRUFBRSxTQUFTO0VBQUUrSCxNQUFBQSxTQUFTLEVBQUUsS0FBSztFQUFFNUUsTUFBQUEsVUFBVSxFQUFFO0VBQU07RUFBRSxHQUFBLEVBQ3JGMEQsY0FBYyxDQUFDOUosSUFBSSxFQUFFb0osUUFBUSxFQUFFa0MsY0FBYyxJQUFJLENBQUMsQ0FBQyxFQUFDLGFBQ2xELENBQ0YsQ0FBQyxlQUNON0ksc0JBQUEsQ0FBQUMsYUFBQSxDQUFBLEtBQUEsRUFBQTtFQUFLQyxJQUFBQSxLQUFLLEVBQUU7RUFDVndDLE1BQUFBLE9BQU8sRUFBRSxNQUFNO0VBQ2ZGLE1BQUFBLGVBQWUsRUFBRSxTQUFTO0VBQzFCVSxNQUFBQSxZQUFZLEVBQUUsTUFBTTtFQUNwQjNDLE1BQUFBLFFBQVEsRUFBRTtFQUNaO0tBQUUsRUFBQyxjQUVFLENBQ0YsQ0FDRixDQUNGLENBQUMsZUFFTlAsc0JBQUEsQ0FBQUMsYUFBQSxDQUFBLEtBQUEsRUFBQTtFQUFLQyxJQUFBQSxLQUFLLEVBQUU7RUFDVnNDLE1BQUFBLGVBQWUsRUFBRSxPQUFPO0VBQ3hCVSxNQUFBQSxZQUFZLEVBQUUsTUFBTTtFQUNwQk8sTUFBQUEsU0FBUyxFQUFFLDJCQUEyQjtFQUN0Q1IsTUFBQUEsTUFBTSxFQUFFLG1CQUFtQjtFQUMzQmlCLE1BQUFBLFFBQVEsRUFBRTtFQUNaO0tBQUUsZUFDQWxFLHNCQUFBLENBQUFDLGFBQUEsQ0FBQSxLQUFBLEVBQUE7RUFBS0MsSUFBQUEsS0FBSyxFQUFFO0VBQ1Z3QyxNQUFBQSxPQUFPLEVBQUUsV0FBVztFQUNwQkssTUFBQUEsWUFBWSxFQUFFLG1CQUFtQjtFQUNqQ1AsTUFBQUEsZUFBZSxFQUFFO0VBQ25CO0tBQUUsZUFDQXhDLHNCQUFBLENBQUFDLGFBQUEsQ0FBQSxJQUFBLEVBQUE7RUFBSUMsSUFBQUEsS0FBSyxFQUFFO0VBQUUwRCxNQUFBQSxNQUFNLEVBQUUsR0FBRztFQUFFckQsTUFBQUEsUUFBUSxFQUFFLE1BQU07RUFBRW9ELE1BQUFBLFVBQVUsRUFBRSxLQUFLO0VBQUVuRCxNQUFBQSxLQUFLLEVBQUU7RUFBVTtFQUFFLEdBQUEsRUFBQyxxQkFFL0UsQ0FDRCxDQUFDLGVBRU5SLHNCQUFBLENBQUFDLGFBQUEsQ0FBQSxLQUFBLEVBQUE7RUFBS0MsSUFBQUEsS0FBSyxFQUFFO0VBQUU0SSxNQUFBQSxTQUFTLEVBQUUsT0FBTztFQUFFQyxNQUFBQSxTQUFTLEVBQUU7RUFBTztFQUFFLEdBQUEsRUFDbkR4TCxJQUFJLEVBQUVxSixZQUFZLEVBQUVHLGtCQUFrQixFQUFFbEIsTUFBTSxHQUFHLENBQUMsZ0JBQ2pEN0Ysc0JBQUEsQ0FBQUMsYUFBQSxDQUFBLE9BQUEsRUFBQTtFQUFPQyxJQUFBQSxLQUFLLEVBQUU7RUFBRStFLE1BQUFBLEtBQUssRUFBRSxNQUFNO0VBQUUrRCxNQUFBQSxjQUFjLEVBQUU7RUFBVztLQUFFLGVBQzFEaEosc0JBQUEsQ0FBQUMsYUFBQSxDQUFBLE9BQUEsRUFBQTtFQUFPQyxJQUFBQSxLQUFLLEVBQUU7RUFBRXNDLE1BQUFBLGVBQWUsRUFBRSxTQUFTO0VBQUV5RyxNQUFBQSxRQUFRLEVBQUUsUUFBUTtFQUFFQyxNQUFBQSxHQUFHLEVBQUU7RUFBRTtFQUFFLEdBQUEsZUFDdkVsSixzQkFBQSxDQUFBQyxhQUFBLENBQUEsSUFBQSxFQUFBLElBQUEsZUFDRUQsc0JBQUEsQ0FBQUMsYUFBQSxDQUFBLElBQUEsRUFBQTtFQUFJQyxJQUFBQSxLQUFLLEVBQUU7RUFBRXdFLE1BQUFBLFNBQVMsRUFBRSxNQUFNO0VBQUVoQyxNQUFBQSxPQUFPLEVBQUUsV0FBVztFQUFFbkMsTUFBQUEsUUFBUSxFQUFFLE1BQU07RUFBRW9ELE1BQUFBLFVBQVUsRUFBRSxLQUFLO0VBQUVuRCxNQUFBQSxLQUFLLEVBQUU7RUFBVTtFQUFFLEdBQUEsRUFBQyxNQUUzRyxDQUFDLGVBQ0xSLHNCQUFBLENBQUFDLGFBQUEsQ0FBQSxJQUFBLEVBQUE7RUFBSUMsSUFBQUEsS0FBSyxFQUFFO0VBQUV3RSxNQUFBQSxTQUFTLEVBQUUsTUFBTTtFQUFFaEMsTUFBQUEsT0FBTyxFQUFFLFdBQVc7RUFBRW5DLE1BQUFBLFFBQVEsRUFBRSxNQUFNO0VBQUVvRCxNQUFBQSxVQUFVLEVBQUUsS0FBSztFQUFFbkQsTUFBQUEsS0FBSyxFQUFFO0VBQVU7RUFBRSxHQUFBLEVBQUMsUUFFM0csQ0FBQyxlQUNMUixzQkFBQSxDQUFBQyxhQUFBLENBQUEsSUFBQSxFQUFBO0VBQUlDLElBQUFBLEtBQUssRUFBRTtFQUFFd0UsTUFBQUEsU0FBUyxFQUFFLE1BQU07RUFBRWhDLE1BQUFBLE9BQU8sRUFBRSxXQUFXO0VBQUVuQyxNQUFBQSxRQUFRLEVBQUUsTUFBTTtFQUFFb0QsTUFBQUEsVUFBVSxFQUFFLEtBQUs7RUFBRW5ELE1BQUFBLEtBQUssRUFBRTtFQUFVO0VBQUUsR0FBQSxFQUFDLE1BRTNHLENBQUMsZUFDTFIsc0JBQUEsQ0FBQUMsYUFBQSxDQUFBLElBQUEsRUFBQTtFQUFJQyxJQUFBQSxLQUFLLEVBQUU7RUFBRXdFLE1BQUFBLFNBQVMsRUFBRSxNQUFNO0VBQUVoQyxNQUFBQSxPQUFPLEVBQUUsV0FBVztFQUFFbkMsTUFBQUEsUUFBUSxFQUFFLE1BQU07RUFBRW9ELE1BQUFBLFVBQVUsRUFBRSxLQUFLO0VBQUVuRCxNQUFBQSxLQUFLLEVBQUU7RUFBVTtFQUFFLEdBQUEsRUFBQyxZQUUzRyxDQUNGLENBQ0MsQ0FBQyxlQUNSUixzQkFBQSxDQUFBQyxhQUFBLENBQUEsT0FBQSxFQUFBLElBQUEsRUFDRzFDLElBQUksQ0FBQ3FKLFlBQVksQ0FBQ0csa0JBQWtCLENBQUM5SCxLQUFLLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDc0csR0FBRyxDQUFDLENBQUM0RCxXQUFXLEVBQUUxRCxLQUFLLGtCQUN4RXpGLHNCQUFBLENBQUFDLGFBQUEsQ0FBQSxJQUFBLEVBQUE7RUFBSXlGLElBQUFBLEdBQUcsRUFBRUQsS0FBTTtFQUFDdkYsSUFBQUEsS0FBSyxFQUFFO0VBQ3JCNkMsTUFBQUEsWUFBWSxFQUFFLG1CQUFtQjtFQUNqQ0ssTUFBQUEsVUFBVSxFQUFFO0VBQ2Q7S0FBRSxlQUNBcEQsc0JBQUEsQ0FBQUMsYUFBQSxDQUFBLElBQUEsRUFBQTtFQUFJQyxJQUFBQSxLQUFLLEVBQUU7RUFBRXdDLE1BQUFBLE9BQU8sRUFBRSxXQUFXO0VBQUVuQyxNQUFBQSxRQUFRLEVBQUUsTUFBTTtFQUFFb0QsTUFBQUEsVUFBVSxFQUFFO0VBQU07S0FBRSxFQUN0RXdGLFdBQVcsQ0FBQ0MsZ0JBQWdCLElBQUksYUFDL0IsQ0FBQyxlQUNMcEosc0JBQUEsQ0FBQUMsYUFBQSxDQUFBLElBQUEsRUFBQTtFQUFJQyxJQUFBQSxLQUFLLEVBQUU7RUFBRXdDLE1BQUFBLE9BQU8sRUFBRSxXQUFXO0VBQUVuQyxNQUFBQSxRQUFRLEVBQUU7RUFBTztLQUFFLGVBQ3BEUCxzQkFBQSxDQUFBQyxhQUFBLENBQUEsTUFBQSxFQUFBO0VBQU1DLElBQUFBLEtBQUssRUFBRTtFQUNYd0MsTUFBQUEsT0FBTyxFQUFFLFVBQVU7RUFDbkJRLE1BQUFBLFlBQVksRUFBRSxNQUFNO0VBQ3BCM0MsTUFBQUEsUUFBUSxFQUFFLE1BQU07RUFDaEJvRCxNQUFBQSxVQUFVLEVBQUUsS0FBSztRQUNqQm5CLGVBQWUsRUFDYjJHLFdBQVcsQ0FBQ0UsTUFBTSxLQUFLLFNBQVMsR0FBRyxTQUFTLEdBQzVDRixXQUFXLENBQUNFLE1BQU0sS0FBSyxVQUFVLEdBQUcsU0FBUyxHQUM3Q0YsV0FBVyxDQUFDRSxNQUFNLEtBQUssVUFBVSxHQUFHLFNBQVMsR0FBRyxTQUFTO1FBQzNEN0ksS0FBSyxFQUNIMkksV0FBVyxDQUFDRSxNQUFNLEtBQUssU0FBUyxHQUFHLFNBQVMsR0FDNUNGLFdBQVcsQ0FBQ0UsTUFBTSxLQUFLLFVBQVUsR0FBRyxTQUFTLEdBQzdDRixXQUFXLENBQUNFLE1BQU0sS0FBSyxVQUFVLEdBQUcsU0FBUyxHQUFHO0VBQ3BEO0VBQUUsR0FBQSxFQUNDLENBQUNGLFdBQVcsQ0FBQ0UsTUFBTSxJQUFJLFNBQVMsRUFBRUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDQyxXQUFXLEVBQUUsR0FBRyxDQUFDSixXQUFXLENBQUNFLE1BQU0sSUFBSSxTQUFTLEVBQUVwSyxLQUFLLENBQUMsQ0FBQyxDQUNsRyxDQUNKLENBQUMsZUFDTGUsc0JBQUEsQ0FBQUMsYUFBQSxDQUFBLElBQUEsRUFBQTtFQUFJQyxJQUFBQSxLQUFLLEVBQUU7RUFBRXdDLE1BQUFBLE9BQU8sRUFBRSxXQUFXO0VBQUVuQyxNQUFBQSxRQUFRLEVBQUUsTUFBTTtFQUFFQyxNQUFBQSxLQUFLLEVBQUU7RUFBVTtFQUFFLEdBQUEsRUFDckUySSxXQUFXLENBQUNqRCxVQUFVLEdBQUd5QixVQUFVLENBQUN3QixXQUFXLENBQUNqRCxVQUFVLENBQUMsR0FBRyxHQUM3RCxDQUFDLGVBQ0xsRyxzQkFBQSxDQUFBQyxhQUFBLENBQUEsSUFBQSxFQUFBO0VBQUlDLElBQUFBLEtBQUssRUFBRTtFQUFFd0MsTUFBQUEsT0FBTyxFQUFFLFdBQVc7RUFBRW5DLE1BQUFBLFFBQVEsRUFBRSxNQUFNO0VBQUVvRCxNQUFBQSxVQUFVLEVBQUU7RUFBTTtFQUFFLEdBQUEsRUFDdEV3RixXQUFXLENBQUNLLHFCQUFxQixFQUFDLEdBQUMsRUFBQ0wsV0FBVyxDQUFDTSxvQkFDL0MsQ0FDRixDQUNMLENBQ0ksQ0FDRixDQUFDLGdCQUVSekosc0JBQUEsQ0FBQUMsYUFBQSxDQUFBLEtBQUEsRUFBQTtFQUFLQyxJQUFBQSxLQUFLLEVBQUU7RUFBRXdFLE1BQUFBLFNBQVMsRUFBRSxRQUFRO0VBQUVoQyxNQUFBQSxPQUFPLEVBQUUsV0FBVztFQUFFbEMsTUFBQUEsS0FBSyxFQUFFO0VBQVU7S0FBRSxlQUMxRVIsc0JBQUEsQ0FBQUMsYUFBQSxDQUFBLEtBQUEsRUFBQTtFQUFLQyxJQUFBQSxLQUFLLEVBQUU7RUFBRUssTUFBQUEsUUFBUSxFQUFFLE1BQU07RUFBRXNDLE1BQUFBLFlBQVksRUFBRTtFQUFPO0VBQUUsR0FBQSxFQUFDLGNBQU8sQ0FBQyxlQUNoRTdDLHNCQUFBLENBQUFDLGFBQUEsQ0FBQSxHQUFBLEVBQUE7RUFBR0MsSUFBQUEsS0FBSyxFQUFFO0VBQUUwRCxNQUFBQSxNQUFNLEVBQUUsR0FBRztFQUFFckQsTUFBQUEsUUFBUSxFQUFFLE1BQU07RUFBRW9ELE1BQUFBLFVBQVUsRUFBRTtFQUFNO0VBQUUsR0FBQSxFQUFDLDhCQUErQixDQUM1RixDQUVKLENBQ0YsQ0FDRixDQUNOLEVBRUF5QyxTQUFTLEtBQUssY0FBYyxpQkFDM0JwRyxzQkFBQSxDQUFBQyxhQUFBLENBQUEsS0FBQSxFQUFBLElBQUEsZUFDRUQsc0JBQUEsQ0FBQUMsYUFBQSxDQUFBLEtBQUEsRUFBQTtFQUFLQyxJQUFBQSxLQUFLLEVBQUU7RUFDVkMsTUFBQUEsT0FBTyxFQUFFLE1BQU07RUFDZm1ELE1BQUFBLG1CQUFtQixFQUFFLHNDQUFzQztFQUMzREMsTUFBQUEsR0FBRyxFQUFFLE1BQU07RUFDWFYsTUFBQUEsWUFBWSxFQUFFO0VBQ2hCO0tBQUUsZUFDQTdDLHNCQUFBLENBQUFDLGFBQUEsQ0FBQSxLQUFBLEVBQUE7RUFBS0MsSUFBQUEsS0FBSyxFQUFFO0VBQ1Z3QyxNQUFBQSxPQUFPLEVBQUUsTUFBTTtFQUNmRixNQUFBQSxlQUFlLEVBQUUsT0FBTztFQUN4QlUsTUFBQUEsWUFBWSxFQUFFLE1BQU07RUFDcEJPLE1BQUFBLFNBQVMsRUFBRSwyQkFBMkI7RUFDdENSLE1BQUFBLE1BQU0sRUFBRTtFQUNWO0tBQUUsZUFDQWpELHNCQUFBLENBQUFDLGFBQUEsQ0FBQSxLQUFBLEVBQUE7RUFBS0MsSUFBQUEsS0FBSyxFQUFFO0VBQUVDLE1BQUFBLE9BQU8sRUFBRSxNQUFNO0VBQUVFLE1BQUFBLFVBQVUsRUFBRSxRQUFRO0VBQUV3QyxNQUFBQSxZQUFZLEVBQUU7RUFBTTtLQUFFLGVBQ3pFN0Msc0JBQUEsQ0FBQUMsYUFBQSxDQUFBLEtBQUEsRUFBQTtFQUFLQyxJQUFBQSxLQUFLLEVBQUU7RUFBRStFLE1BQUFBLEtBQUssRUFBRSxLQUFLO0VBQUUzRSxNQUFBQSxNQUFNLEVBQUUsS0FBSztFQUFFa0MsTUFBQUEsZUFBZSxFQUFFLFNBQVM7RUFBRVUsTUFBQUEsWUFBWSxFQUFFLEtBQUs7RUFBRXdHLE1BQUFBLFdBQVcsRUFBRTtFQUFNO0VBQUUsR0FBTSxDQUFDLGVBQ3hIMUosc0JBQUEsQ0FBQUMsYUFBQSxDQUFBLE1BQUEsRUFBQTtFQUFNQyxJQUFBQSxLQUFLLEVBQUU7RUFBRUssTUFBQUEsUUFBUSxFQUFFLE1BQU07RUFBRUMsTUFBQUEsS0FBSyxFQUFFLFNBQVM7RUFBRW1ELE1BQUFBLFVBQVUsRUFBRTtFQUFNO0VBQUUsR0FBQSxFQUFDLFNBQWEsQ0FDbEYsQ0FBQyxlQUNOM0Qsc0JBQUEsQ0FBQUMsYUFBQSxDQUFBLEtBQUEsRUFBQTtFQUFLQyxJQUFBQSxLQUFLLEVBQUU7RUFBRUssTUFBQUEsUUFBUSxFQUFFLE1BQU07RUFBRW9ELE1BQUFBLFVBQVUsRUFBRSxLQUFLO0VBQUVuRCxNQUFBQSxLQUFLLEVBQUU7RUFBVTtFQUFFLEdBQUEsRUFDbkVqRCxJQUFJLEVBQUVxSixZQUFZLEVBQUVELFFBQVEsRUFBRXpGLG1CQUFtQixJQUFJLENBQ25ELENBQ0YsQ0FBQyxlQUVObEIsc0JBQUEsQ0FBQUMsYUFBQSxDQUFBLEtBQUEsRUFBQTtFQUFLQyxJQUFBQSxLQUFLLEVBQUU7RUFDVndDLE1BQUFBLE9BQU8sRUFBRSxNQUFNO0VBQ2ZGLE1BQUFBLGVBQWUsRUFBRSxPQUFPO0VBQ3hCVSxNQUFBQSxZQUFZLEVBQUUsTUFBTTtFQUNwQk8sTUFBQUEsU0FBUyxFQUFFLDJCQUEyQjtFQUN0Q1IsTUFBQUEsTUFBTSxFQUFFO0VBQ1Y7S0FBRSxlQUNBakQsc0JBQUEsQ0FBQUMsYUFBQSxDQUFBLEtBQUEsRUFBQTtFQUFLQyxJQUFBQSxLQUFLLEVBQUU7RUFBRUMsTUFBQUEsT0FBTyxFQUFFLE1BQU07RUFBRUUsTUFBQUEsVUFBVSxFQUFFLFFBQVE7RUFBRXdDLE1BQUFBLFlBQVksRUFBRTtFQUFNO0tBQUUsZUFDekU3QyxzQkFBQSxDQUFBQyxhQUFBLENBQUEsS0FBQSxFQUFBO0VBQUtDLElBQUFBLEtBQUssRUFBRTtFQUFFK0UsTUFBQUEsS0FBSyxFQUFFLEtBQUs7RUFBRTNFLE1BQUFBLE1BQU0sRUFBRSxLQUFLO0VBQUVrQyxNQUFBQSxlQUFlLEVBQUUsU0FBUztFQUFFVSxNQUFBQSxZQUFZLEVBQUUsS0FBSztFQUFFd0csTUFBQUEsV0FBVyxFQUFFO0VBQU07RUFBRSxHQUFNLENBQUMsZUFDeEgxSixzQkFBQSxDQUFBQyxhQUFBLENBQUEsTUFBQSxFQUFBO0VBQU1DLElBQUFBLEtBQUssRUFBRTtFQUFFSyxNQUFBQSxRQUFRLEVBQUUsTUFBTTtFQUFFQyxNQUFBQSxLQUFLLEVBQUUsU0FBUztFQUFFbUQsTUFBQUEsVUFBVSxFQUFFO0VBQU07RUFBRSxHQUFBLEVBQUMsVUFBYyxDQUNuRixDQUFDLGVBQ04zRCxzQkFBQSxDQUFBQyxhQUFBLENBQUEsS0FBQSxFQUFBO0VBQUtDLElBQUFBLEtBQUssRUFBRTtFQUFFSyxNQUFBQSxRQUFRLEVBQUUsTUFBTTtFQUFFb0QsTUFBQUEsVUFBVSxFQUFFLEtBQUs7RUFBRW5ELE1BQUFBLEtBQUssRUFBRTtFQUFVO0VBQUUsR0FBQSxFQUNuRWpELElBQUksRUFBRXFKLFlBQVksRUFBRUQsUUFBUSxFQUFFZ0Qsb0JBQW9CLElBQUksQ0FDcEQsQ0FDRixDQUFDLGVBRU4zSixzQkFBQSxDQUFBQyxhQUFBLENBQUEsS0FBQSxFQUFBO0VBQUtDLElBQUFBLEtBQUssRUFBRTtFQUNWd0MsTUFBQUEsT0FBTyxFQUFFLE1BQU07RUFDZkYsTUFBQUEsZUFBZSxFQUFFLE9BQU87RUFDeEJVLE1BQUFBLFlBQVksRUFBRSxNQUFNO0VBQ3BCTyxNQUFBQSxTQUFTLEVBQUUsMkJBQTJCO0VBQ3RDUixNQUFBQSxNQUFNLEVBQUU7RUFDVjtLQUFFLGVBQ0FqRCxzQkFBQSxDQUFBQyxhQUFBLENBQUEsS0FBQSxFQUFBO0VBQUtDLElBQUFBLEtBQUssRUFBRTtFQUFFQyxNQUFBQSxPQUFPLEVBQUUsTUFBTTtFQUFFRSxNQUFBQSxVQUFVLEVBQUUsUUFBUTtFQUFFd0MsTUFBQUEsWUFBWSxFQUFFO0VBQU07S0FBRSxlQUN6RTdDLHNCQUFBLENBQUFDLGFBQUEsQ0FBQSxLQUFBLEVBQUE7RUFBS0MsSUFBQUEsS0FBSyxFQUFFO0VBQUUrRSxNQUFBQSxLQUFLLEVBQUUsS0FBSztFQUFFM0UsTUFBQUEsTUFBTSxFQUFFLEtBQUs7RUFBRWtDLE1BQUFBLGVBQWUsRUFBRSxTQUFTO0VBQUVVLE1BQUFBLFlBQVksRUFBRSxLQUFLO0VBQUV3RyxNQUFBQSxXQUFXLEVBQUU7RUFBTTtFQUFFLEdBQU0sQ0FBQyxlQUN4SDFKLHNCQUFBLENBQUFDLGFBQUEsQ0FBQSxNQUFBLEVBQUE7RUFBTUMsSUFBQUEsS0FBSyxFQUFFO0VBQUVLLE1BQUFBLFFBQVEsRUFBRSxNQUFNO0VBQUVDLE1BQUFBLEtBQUssRUFBRSxTQUFTO0VBQUVtRCxNQUFBQSxVQUFVLEVBQUU7RUFBTTtFQUFFLEdBQUEsRUFBQyxVQUFjLENBQ25GLENBQUMsZUFDTjNELHNCQUFBLENBQUFDLGFBQUEsQ0FBQSxLQUFBLEVBQUE7RUFBS0MsSUFBQUEsS0FBSyxFQUFFO0VBQUVLLE1BQUFBLFFBQVEsRUFBRSxNQUFNO0VBQUVvRCxNQUFBQSxVQUFVLEVBQUUsS0FBSztFQUFFbkQsTUFBQUEsS0FBSyxFQUFFO0VBQVU7RUFBRSxHQUFBLEVBQ25FakQsSUFBSSxFQUFFcUosWUFBWSxFQUFFRCxRQUFRLEVBQUVpRCxvQkFBb0IsSUFBSSxDQUNwRCxDQUNGLENBQUMsZUFFTjVKLHNCQUFBLENBQUFDLGFBQUEsQ0FBQSxLQUFBLEVBQUE7RUFBS0MsSUFBQUEsS0FBSyxFQUFFO0VBQ1Z3QyxNQUFBQSxPQUFPLEVBQUUsTUFBTTtFQUNmRixNQUFBQSxlQUFlLEVBQUUsT0FBTztFQUN4QlUsTUFBQUEsWUFBWSxFQUFFLE1BQU07RUFDcEJPLE1BQUFBLFNBQVMsRUFBRSwyQkFBMkI7RUFDdENSLE1BQUFBLE1BQU0sRUFBRTtFQUNWO0tBQUUsZUFDQWpELHNCQUFBLENBQUFDLGFBQUEsQ0FBQSxLQUFBLEVBQUE7RUFBS0MsSUFBQUEsS0FBSyxFQUFFO0VBQUVDLE1BQUFBLE9BQU8sRUFBRSxNQUFNO0VBQUVFLE1BQUFBLFVBQVUsRUFBRSxRQUFRO0VBQUV3QyxNQUFBQSxZQUFZLEVBQUU7RUFBTTtLQUFFLGVBQ3pFN0Msc0JBQUEsQ0FBQUMsYUFBQSxDQUFBLEtBQUEsRUFBQTtFQUFLQyxJQUFBQSxLQUFLLEVBQUU7RUFBRStFLE1BQUFBLEtBQUssRUFBRSxLQUFLO0VBQUUzRSxNQUFBQSxNQUFNLEVBQUUsS0FBSztFQUFFa0MsTUFBQUEsZUFBZSxFQUFFLFNBQVM7RUFBRVUsTUFBQUEsWUFBWSxFQUFFLEtBQUs7RUFBRXdHLE1BQUFBLFdBQVcsRUFBRTtFQUFNO0VBQUUsR0FBTSxDQUFDLGVBQ3hIMUosc0JBQUEsQ0FBQUMsYUFBQSxDQUFBLE1BQUEsRUFBQTtFQUFNQyxJQUFBQSxLQUFLLEVBQUU7RUFBRUssTUFBQUEsUUFBUSxFQUFFLE1BQU07RUFBRUMsTUFBQUEsS0FBSyxFQUFFLFNBQVM7RUFBRW1ELE1BQUFBLFVBQVUsRUFBRTtFQUFNO0VBQUUsR0FBQSxFQUFDLGlCQUFxQixDQUMxRixDQUFDLGVBQ04zRCxzQkFBQSxDQUFBQyxhQUFBLENBQUEsS0FBQSxFQUFBO0VBQUtDLElBQUFBLEtBQUssRUFBRTtFQUFFSyxNQUFBQSxRQUFRLEVBQUUsTUFBTTtFQUFFb0QsTUFBQUEsVUFBVSxFQUFFLEtBQUs7RUFBRW5ELE1BQUFBLEtBQUssRUFBRTtFQUFVO0VBQUUsR0FBQSxFQUNuRXNILGdCQUFnQixDQUFDdkssSUFBSSxFQUFFcUosWUFBWSxFQUFFRCxRQUFRLEVBQUVrRCxjQUFjLElBQUksQ0FBQyxDQUNoRSxDQUNGLENBQ0YsQ0FBQyxFQUVMdE0sSUFBSSxFQUFFcUosWUFBWSxFQUFFRSxjQUFjLEVBQUVqQixNQUFNLEdBQUcsQ0FBQyxpQkFDN0M3RixzQkFBQSxDQUFBQyxhQUFBLENBQUEsS0FBQSxFQUFBO0VBQUtDLElBQUFBLEtBQUssRUFBRTtFQUNWc0MsTUFBQUEsZUFBZSxFQUFFLE9BQU87RUFDeEJVLE1BQUFBLFlBQVksRUFBRSxNQUFNO0VBQ3BCTyxNQUFBQSxTQUFTLEVBQUUsMkJBQTJCO0VBQ3RDUixNQUFBQSxNQUFNLEVBQUUsbUJBQW1CO0VBQzNCaUIsTUFBQUEsUUFBUSxFQUFFO0VBQ1o7S0FBRSxlQUNBbEUsc0JBQUEsQ0FBQUMsYUFBQSxDQUFBLEtBQUEsRUFBQTtFQUFLQyxJQUFBQSxLQUFLLEVBQUU7RUFDVndDLE1BQUFBLE9BQU8sRUFBRSxXQUFXO0VBQ3BCSyxNQUFBQSxZQUFZLEVBQUUsbUJBQW1CO0VBQ2pDUCxNQUFBQSxlQUFlLEVBQUU7RUFDbkI7S0FBRSxlQUNBeEMsc0JBQUEsQ0FBQUMsYUFBQSxDQUFBLElBQUEsRUFBQTtFQUFJQyxJQUFBQSxLQUFLLEVBQUU7RUFBRTBELE1BQUFBLE1BQU0sRUFBRSxHQUFHO0VBQUVyRCxNQUFBQSxRQUFRLEVBQUUsTUFBTTtFQUFFb0QsTUFBQUEsVUFBVSxFQUFFLEtBQUs7RUFBRW5ELE1BQUFBLEtBQUssRUFBRTtFQUFVO0VBQUUsR0FBQSxFQUFDLDRCQUUvRSxDQUNELENBQUMsZUFDTlIsc0JBQUEsQ0FBQUMsYUFBQSxDQUFBLE9BQUEsRUFBQTtFQUFPQyxJQUFBQSxLQUFLLEVBQUU7RUFBRStFLE1BQUFBLEtBQUssRUFBRSxNQUFNO0VBQUUrRCxNQUFBQSxjQUFjLEVBQUU7RUFBVztLQUFFLGVBQzFEaEosc0JBQUEsQ0FBQUMsYUFBQSxDQUFBLE9BQUEsRUFBQTtFQUFPQyxJQUFBQSxLQUFLLEVBQUU7RUFBRXNDLE1BQUFBLGVBQWUsRUFBRTtFQUFVO0VBQUUsR0FBQSxlQUMzQ3hDLHNCQUFBLENBQUFDLGFBQUEsQ0FBQSxJQUFBLEVBQUEsSUFBQSxlQUNFRCxzQkFBQSxDQUFBQyxhQUFBLENBQUEsSUFBQSxFQUFBO0VBQUlDLElBQUFBLEtBQUssRUFBRTtFQUFFd0UsTUFBQUEsU0FBUyxFQUFFLE1BQU07RUFBRWhDLE1BQUFBLE9BQU8sRUFBRSxXQUFXO0VBQUVuQyxNQUFBQSxRQUFRLEVBQUUsTUFBTTtFQUFFb0QsTUFBQUEsVUFBVSxFQUFFLEtBQUs7RUFBRW5ELE1BQUFBLEtBQUssRUFBRTtFQUFVO0VBQUUsR0FBQSxFQUFDLFlBRTNHLENBQUMsZUFDTFIsc0JBQUEsQ0FBQUMsYUFBQSxDQUFBLElBQUEsRUFBQTtFQUFJQyxJQUFBQSxLQUFLLEVBQUU7RUFBRXdFLE1BQUFBLFNBQVMsRUFBRSxNQUFNO0VBQUVoQyxNQUFBQSxPQUFPLEVBQUUsV0FBVztFQUFFbkMsTUFBQUEsUUFBUSxFQUFFLE1BQU07RUFBRW9ELE1BQUFBLFVBQVUsRUFBRSxLQUFLO0VBQUVuRCxNQUFBQSxLQUFLLEVBQUU7RUFBVTtFQUFFLEdBQUEsRUFBQyxPQUUzRyxDQUFDLGVBQ0xSLHNCQUFBLENBQUFDLGFBQUEsQ0FBQSxJQUFBLEVBQUE7RUFBSUMsSUFBQUEsS0FBSyxFQUFFO0VBQUV3RSxNQUFBQSxTQUFTLEVBQUUsTUFBTTtFQUFFaEMsTUFBQUEsT0FBTyxFQUFFLFdBQVc7RUFBRW5DLE1BQUFBLFFBQVEsRUFBRSxNQUFNO0VBQUVvRCxNQUFBQSxVQUFVLEVBQUUsS0FBSztFQUFFbkQsTUFBQUEsS0FBSyxFQUFFO0VBQVU7RUFBRSxHQUFBLEVBQUMsVUFFM0csQ0FBQyxlQUNMUixzQkFBQSxDQUFBQyxhQUFBLENBQUEsSUFBQSxFQUFBO0VBQUlDLElBQUFBLEtBQUssRUFBRTtFQUFFd0UsTUFBQUEsU0FBUyxFQUFFLE1BQU07RUFBRWhDLE1BQUFBLE9BQU8sRUFBRSxXQUFXO0VBQUVuQyxNQUFBQSxRQUFRLEVBQUUsTUFBTTtFQUFFb0QsTUFBQUEsVUFBVSxFQUFFLEtBQUs7RUFBRW5ELE1BQUFBLEtBQUssRUFBRTtFQUFVO0tBQUUsRUFBQyxjQUUzRyxDQUNGLENBQ0MsQ0FBQyxlQUNSUixzQkFBQSxDQUFBQyxhQUFBLENBQUEsT0FBQSxFQUFBLElBQUEsRUFDRzFDLElBQUksQ0FBQ3FKLFlBQVksQ0FBQ0UsY0FBYyxDQUFDdkIsR0FBRyxDQUFDLENBQUN1RSxVQUFVLEVBQUVyRSxLQUFLLGtCQUN0RHpGLHNCQUFBLENBQUFDLGFBQUEsQ0FBQSxJQUFBLEVBQUE7RUFBSXlGLElBQUFBLEdBQUcsRUFBRUQsS0FBTTtFQUFDdkYsSUFBQUEsS0FBSyxFQUFFO0VBQUU2QyxNQUFBQSxZQUFZLEVBQUU7RUFBb0I7S0FBRSxlQUMzRC9DLHNCQUFBLENBQUFDLGFBQUEsQ0FBQSxJQUFBLEVBQUE7RUFBSUMsSUFBQUEsS0FBSyxFQUFFO0VBQUV3QyxNQUFBQSxPQUFPLEVBQUUsV0FBVztFQUFFbkMsTUFBQUEsUUFBUSxFQUFFO0VBQU87S0FBRSxlQUNwRFAsc0JBQUEsQ0FBQUMsYUFBQSxDQUFBLEtBQUEsRUFBQTtFQUFLQyxJQUFBQSxLQUFLLEVBQUU7RUFBRUMsTUFBQUEsT0FBTyxFQUFFLE1BQU07RUFBRUUsTUFBQUEsVUFBVSxFQUFFO0VBQVM7S0FBRSxlQUNwREwsc0JBQUEsQ0FBQUMsYUFBQSxDQUFBLEtBQUEsRUFBQTtFQUFLQyxJQUFBQSxLQUFLLEVBQUU7RUFDVitFLE1BQUFBLEtBQUssRUFBRSxNQUFNO0VBQ2IzRSxNQUFBQSxNQUFNLEVBQUUsTUFBTTtFQUNka0MsTUFBQUEsZUFBZSxFQUFFLFNBQVM7RUFDMUJVLE1BQUFBLFlBQVksRUFBRSxLQUFLO0VBQ25CL0MsTUFBQUEsT0FBTyxFQUFFLE1BQU07RUFDZkUsTUFBQUEsVUFBVSxFQUFFLFFBQVE7RUFDcEJELE1BQUFBLGNBQWMsRUFBRSxRQUFRO0VBQ3hCSSxNQUFBQSxLQUFLLEVBQUUsT0FBTztFQUNkbUQsTUFBQUEsVUFBVSxFQUFFLEtBQUs7RUFDakJwRCxNQUFBQSxRQUFRLEVBQUUsTUFBTTtFQUNoQm1KLE1BQUFBLFdBQVcsRUFBRTtFQUNmO0tBQUUsRUFDQ0ksVUFBVSxDQUFDOUssVUFBVSxHQUFHLENBQUMsQ0FBQyxFQUFFOEssVUFBVSxDQUFDOUQsU0FBUyxHQUFHLENBQUMsQ0FDbEQsQ0FBQyxlQUNOaEcsc0JBQUEsQ0FBQUMsYUFBQSxDQUFBLEtBQUEsRUFBQSxJQUFBLGVBQ0VELHNCQUFBLENBQUFDLGFBQUEsQ0FBQSxLQUFBLEVBQUE7RUFBS0MsSUFBQUEsS0FBSyxFQUFFO0VBQUV5RCxNQUFBQSxVQUFVLEVBQUUsS0FBSztFQUFFbkQsTUFBQUEsS0FBSyxFQUFFO0VBQVU7RUFBRSxHQUFBLEVBQ2pEc0osVUFBVSxDQUFDOUssVUFBVSxFQUFDLEdBQUMsRUFBQzhLLFVBQVUsQ0FBQzlELFNBQ2pDLENBQUMsZUFDTmhHLHNCQUFBLENBQUFDLGFBQUEsQ0FBQSxLQUFBLEVBQUE7RUFBS0MsSUFBQUEsS0FBSyxFQUFFO0VBQUVLLE1BQUFBLFFBQVEsRUFBRSxNQUFNO0VBQUVDLE1BQUFBLEtBQUssRUFBRTtFQUFVO0tBQUUsRUFDaERzSixVQUFVLENBQUNDLEtBQ1QsQ0FDRixDQUNGLENBQ0gsQ0FBQyxlQUNML0osc0JBQUEsQ0FBQUMsYUFBQSxDQUFBLElBQUEsRUFBQTtFQUFJQyxJQUFBQSxLQUFLLEVBQUU7RUFBRXdDLE1BQUFBLE9BQU8sRUFBRSxXQUFXO0VBQUVuQyxNQUFBQSxRQUFRLEVBQUUsTUFBTTtFQUFFb0QsTUFBQUEsVUFBVSxFQUFFLEtBQUs7RUFBRW5ELE1BQUFBLEtBQUssRUFBRTtFQUFVO0VBQUUsR0FBQSxFQUN4RnNKLFVBQVUsQ0FBQ0Usa0JBQ1YsQ0FBQyxlQUNMaEssc0JBQUEsQ0FBQUMsYUFBQSxDQUFBLElBQUEsRUFBQTtFQUFJQyxJQUFBQSxLQUFLLEVBQUU7RUFBRXdDLE1BQUFBLE9BQU8sRUFBRSxXQUFXO0VBQUVuQyxNQUFBQSxRQUFRLEVBQUUsTUFBTTtFQUFFb0QsTUFBQUEsVUFBVSxFQUFFLEtBQUs7RUFBRW5ELE1BQUFBLEtBQUssRUFBRTtFQUFVO0VBQUUsR0FBQSxFQUN4RnNKLFVBQVUsQ0FBQ0cscUJBQ1YsQ0FBQyxlQUNMakssc0JBQUEsQ0FBQUMsYUFBQSxDQUFBLElBQUEsRUFBQTtFQUFJQyxJQUFBQSxLQUFLLEVBQUU7RUFBRXdDLE1BQUFBLE9BQU8sRUFBRSxXQUFXO0VBQUVuQyxNQUFBQSxRQUFRLEVBQUUsTUFBTTtFQUFFb0QsTUFBQUEsVUFBVSxFQUFFLEtBQUs7RUFBRW5ELE1BQUFBLEtBQUssRUFBRTtFQUFVO0tBQUUsRUFDeEZzSCxnQkFBZ0IsQ0FBQ2dDLFVBQVUsQ0FBQ0ksZUFBZSxDQUMxQyxDQUNGLENBQ0wsQ0FDSSxDQUNGLENBQ0osQ0FFSixDQUNOLEVBRUE5RCxTQUFTLEtBQUssT0FBTyxpQkFDcEJwRyxzQkFBQSxDQUFBQyxhQUFBLENBQUEsS0FBQSxFQUFBLElBQUEsZUFDRUQsc0JBQUEsQ0FBQUMsYUFBQSxDQUFBLEtBQUEsRUFBQTtFQUFLQyxJQUFBQSxLQUFLLEVBQUU7RUFDVkMsTUFBQUEsT0FBTyxFQUFFLE1BQU07RUFDZm1ELE1BQUFBLG1CQUFtQixFQUFFLHNDQUFzQztFQUMzREMsTUFBQUEsR0FBRyxFQUFFLE1BQU07RUFDWFYsTUFBQUEsWUFBWSxFQUFFO0VBQ2hCO0tBQUUsZUFDQTdDLHNCQUFBLENBQUFDLGFBQUEsQ0FBQSxLQUFBLEVBQUE7RUFBS0MsSUFBQUEsS0FBSyxFQUFFO0VBQ1Z3QyxNQUFBQSxPQUFPLEVBQUUsTUFBTTtFQUNmRixNQUFBQSxlQUFlLEVBQUUsT0FBTztFQUN4QlUsTUFBQUEsWUFBWSxFQUFFLE1BQU07RUFDcEJPLE1BQUFBLFNBQVMsRUFBRSwyQkFBMkI7RUFDdENSLE1BQUFBLE1BQU0sRUFBRTtFQUNWO0tBQUUsZUFDQWpELHNCQUFBLENBQUFDLGFBQUEsQ0FBQSxLQUFBLEVBQUE7RUFBS0MsSUFBQUEsS0FBSyxFQUFFO0VBQUVLLE1BQUFBLFFBQVEsRUFBRSxNQUFNO0VBQUVDLE1BQUFBLEtBQUssRUFBRSxTQUFTO0VBQUVxQyxNQUFBQSxZQUFZLEVBQUUsS0FBSztFQUFFYyxNQUFBQSxVQUFVLEVBQUU7RUFBTTtFQUFFLEdBQUEsRUFBQyxhQUFnQixDQUFDLGVBQzdHM0Qsc0JBQUEsQ0FBQUMsYUFBQSxDQUFBLEtBQUEsRUFBQTtFQUFLQyxJQUFBQSxLQUFLLEVBQUU7RUFBRUssTUFBQUEsUUFBUSxFQUFFLE1BQU07RUFBRW9ELE1BQUFBLFVBQVUsRUFBRSxLQUFLO0VBQUVuRCxNQUFBQSxLQUFLLEVBQUU7RUFBVTtFQUFFLEdBQUEsRUFDbkUsQ0FBQ2pELElBQUksRUFBRTJCLEtBQUssRUFBRXlILFFBQVEsRUFBRTJCLFVBQVUsSUFBSSxDQUFDLEVBQUVoSCxjQUFjLEVBQ3JELENBQ0YsQ0FBQyxlQUVOdEIsc0JBQUEsQ0FBQUMsYUFBQSxDQUFBLEtBQUEsRUFBQTtFQUFLQyxJQUFBQSxLQUFLLEVBQUU7RUFDVndDLE1BQUFBLE9BQU8sRUFBRSxNQUFNO0VBQ2ZGLE1BQUFBLGVBQWUsRUFBRSxPQUFPO0VBQ3hCVSxNQUFBQSxZQUFZLEVBQUUsTUFBTTtFQUNwQk8sTUFBQUEsU0FBUyxFQUFFLDJCQUEyQjtFQUN0Q1IsTUFBQUEsTUFBTSxFQUFFO0VBQ1Y7S0FBRSxlQUNBakQsc0JBQUEsQ0FBQUMsYUFBQSxDQUFBLEtBQUEsRUFBQTtFQUFLQyxJQUFBQSxLQUFLLEVBQUU7RUFBRUssTUFBQUEsUUFBUSxFQUFFLE1BQU07RUFBRUMsTUFBQUEsS0FBSyxFQUFFLFNBQVM7RUFBRXFDLE1BQUFBLFlBQVksRUFBRSxLQUFLO0VBQUVjLE1BQUFBLFVBQVUsRUFBRTtFQUFNO0VBQUUsR0FBQSxFQUFDLFNBQVksQ0FBQyxlQUN6RzNELHNCQUFBLENBQUFDLGFBQUEsQ0FBQSxLQUFBLEVBQUE7RUFBS0MsSUFBQUEsS0FBSyxFQUFFO0VBQUVLLE1BQUFBLFFBQVEsRUFBRSxNQUFNO0VBQUVvRCxNQUFBQSxVQUFVLEVBQUUsS0FBSztFQUFFbkQsTUFBQUEsS0FBSyxFQUFFO0VBQVU7RUFBRSxHQUFBLEVBQ25FLENBQUNqRCxJQUFJLEVBQUUyQixLQUFLLEVBQUV5SCxRQUFRLEVBQUV3RCxZQUFZLElBQUksQ0FBQyxFQUFFN0ksY0FBYyxFQUN2RCxDQUNGLENBQUMsZUFFTnRCLHNCQUFBLENBQUFDLGFBQUEsQ0FBQSxLQUFBLEVBQUE7RUFBS0MsSUFBQUEsS0FBSyxFQUFFO0VBQ1Z3QyxNQUFBQSxPQUFPLEVBQUUsTUFBTTtFQUNmRixNQUFBQSxlQUFlLEVBQUUsT0FBTztFQUN4QlUsTUFBQUEsWUFBWSxFQUFFLE1BQU07RUFDcEJPLE1BQUFBLFNBQVMsRUFBRSwyQkFBMkI7RUFDdENSLE1BQUFBLE1BQU0sRUFBRTtFQUNWO0tBQUUsZUFDQWpELHNCQUFBLENBQUFDLGFBQUEsQ0FBQSxLQUFBLEVBQUE7RUFBS0MsSUFBQUEsS0FBSyxFQUFFO0VBQUVLLE1BQUFBLFFBQVEsRUFBRSxNQUFNO0VBQUVDLE1BQUFBLEtBQUssRUFBRSxTQUFTO0VBQUVxQyxNQUFBQSxZQUFZLEVBQUUsS0FBSztFQUFFYyxNQUFBQSxVQUFVLEVBQUU7RUFBTTtFQUFFLEdBQUEsRUFBQyxhQUFnQixDQUFDLGVBQzdHM0Qsc0JBQUEsQ0FBQUMsYUFBQSxDQUFBLEtBQUEsRUFBQTtFQUFLQyxJQUFBQSxLQUFLLEVBQUU7RUFBRUssTUFBQUEsUUFBUSxFQUFFLE1BQU07RUFBRW9ELE1BQUFBLFVBQVUsRUFBRSxLQUFLO0VBQUVuRCxNQUFBQSxLQUFLLEVBQUU7RUFBVTtFQUFFLEdBQUEsRUFDbkUsQ0FBQ2pELElBQUksRUFBRTJCLEtBQUssRUFBRXlILFFBQVEsRUFBRXlELGdCQUFnQixJQUFJLENBQUMsRUFBRTlJLGNBQWMsRUFDM0QsQ0FDRixDQUFDLGVBRU50QixzQkFBQSxDQUFBQyxhQUFBLENBQUEsS0FBQSxFQUFBO0VBQUtDLElBQUFBLEtBQUssRUFBRTtFQUNWd0MsTUFBQUEsT0FBTyxFQUFFLE1BQU07RUFDZkYsTUFBQUEsZUFBZSxFQUFFLE9BQU87RUFDeEJVLE1BQUFBLFlBQVksRUFBRSxNQUFNO0VBQ3BCTyxNQUFBQSxTQUFTLEVBQUUsMkJBQTJCO0VBQ3RDUixNQUFBQSxNQUFNLEVBQUU7RUFDVjtLQUFFLGVBQ0FqRCxzQkFBQSxDQUFBQyxhQUFBLENBQUEsS0FBQSxFQUFBO0VBQUtDLElBQUFBLEtBQUssRUFBRTtFQUFFSyxNQUFBQSxRQUFRLEVBQUUsTUFBTTtFQUFFQyxNQUFBQSxLQUFLLEVBQUUsU0FBUztFQUFFcUMsTUFBQUEsWUFBWSxFQUFFLEtBQUs7RUFBRWMsTUFBQUEsVUFBVSxFQUFFO0VBQU07RUFBRSxHQUFBLEVBQUMsZ0JBQW1CLENBQUMsZUFDaEgzRCxzQkFBQSxDQUFBQyxhQUFBLENBQUEsS0FBQSxFQUFBO0VBQUtDLElBQUFBLEtBQUssRUFBRTtFQUFFSyxNQUFBQSxRQUFRLEVBQUUsTUFBTTtFQUFFb0QsTUFBQUEsVUFBVSxFQUFFLEtBQUs7RUFBRW5ELE1BQUFBLEtBQUssRUFBRTtFQUFVO0VBQUUsR0FBQSxFQUNuRSxDQUFDakQsSUFBSSxFQUFFMkIsS0FBSyxFQUFFeUgsUUFBUSxFQUFFMEQsYUFBYSxJQUFJLENBQUMsRUFBRS9JLGNBQWMsRUFDeEQsQ0FDRixDQUNGLENBQUMsRUFFTC9ELElBQUksRUFBRTJCLEtBQUssRUFBRWdJLFdBQVcsRUFBRXJCLE1BQU0sR0FBRyxDQUFDLGlCQUNuQzdGLHNCQUFBLENBQUFDLGFBQUEsQ0FBQSxLQUFBLEVBQUE7RUFBS0MsSUFBQUEsS0FBSyxFQUFFO0VBQ1ZzQyxNQUFBQSxlQUFlLEVBQUUsT0FBTztFQUN4QlUsTUFBQUEsWUFBWSxFQUFFLE1BQU07RUFDcEJPLE1BQUFBLFNBQVMsRUFBRSwyQkFBMkI7RUFDdENSLE1BQUFBLE1BQU0sRUFBRSxtQkFBbUI7RUFDM0JpQixNQUFBQSxRQUFRLEVBQUU7RUFDWjtLQUFFLGVBQ0FsRSxzQkFBQSxDQUFBQyxhQUFBLENBQUEsS0FBQSxFQUFBO0VBQUtDLElBQUFBLEtBQUssRUFBRTtFQUNWd0MsTUFBQUEsT0FBTyxFQUFFLFdBQVc7RUFDcEJLLE1BQUFBLFlBQVksRUFBRSxtQkFBbUI7RUFDakNQLE1BQUFBLGVBQWUsRUFBRTtFQUNuQjtLQUFFLGVBQ0F4QyxzQkFBQSxDQUFBQyxhQUFBLENBQUEsSUFBQSxFQUFBO0VBQUlDLElBQUFBLEtBQUssRUFBRTtFQUFFMEQsTUFBQUEsTUFBTSxFQUFFLEdBQUc7RUFBRXJELE1BQUFBLFFBQVEsRUFBRSxNQUFNO0VBQUVvRCxNQUFBQSxVQUFVLEVBQUUsS0FBSztFQUFFbkQsTUFBQUEsS0FBSyxFQUFFO0VBQVU7RUFBRSxHQUFBLEVBQUMsMkJBRS9FLENBQ0QsQ0FBQyxlQUNOUixzQkFBQSxDQUFBQyxhQUFBLENBQUEsT0FBQSxFQUFBO0VBQU9DLElBQUFBLEtBQUssRUFBRTtFQUFFK0UsTUFBQUEsS0FBSyxFQUFFLE1BQU07RUFBRStELE1BQUFBLGNBQWMsRUFBRTtFQUFXO0tBQUUsZUFDMURoSixzQkFBQSxDQUFBQyxhQUFBLENBQUEsT0FBQSxFQUFBO0VBQU9DLElBQUFBLEtBQUssRUFBRTtFQUFFc0MsTUFBQUEsZUFBZSxFQUFFO0VBQVU7RUFBRSxHQUFBLGVBQzNDeEMsc0JBQUEsQ0FBQUMsYUFBQSxDQUFBLElBQUEsRUFBQSxJQUFBLGVBQ0VELHNCQUFBLENBQUFDLGFBQUEsQ0FBQSxJQUFBLEVBQUE7RUFBSUMsSUFBQUEsS0FBSyxFQUFFO0VBQUV3RSxNQUFBQSxTQUFTLEVBQUUsTUFBTTtFQUFFaEMsTUFBQUEsT0FBTyxFQUFFLFdBQVc7RUFBRW5DLE1BQUFBLFFBQVEsRUFBRSxNQUFNO0VBQUVvRCxNQUFBQSxVQUFVLEVBQUUsS0FBSztFQUFFbkQsTUFBQUEsS0FBSyxFQUFFO0VBQVU7RUFBRSxHQUFBLEVBQUMsTUFFM0csQ0FBQyxlQUNMUixzQkFBQSxDQUFBQyxhQUFBLENBQUEsSUFBQSxFQUFBO0VBQUlDLElBQUFBLEtBQUssRUFBRTtFQUFFd0UsTUFBQUEsU0FBUyxFQUFFLE1BQU07RUFBRWhDLE1BQUFBLE9BQU8sRUFBRSxXQUFXO0VBQUVuQyxNQUFBQSxRQUFRLEVBQUUsTUFBTTtFQUFFb0QsTUFBQUEsVUFBVSxFQUFFLEtBQUs7RUFBRW5ELE1BQUFBLEtBQUssRUFBRTtFQUFVO0VBQUUsR0FBQSxFQUFDLE9BRTNHLENBQUMsZUFDTFIsc0JBQUEsQ0FBQUMsYUFBQSxDQUFBLElBQUEsRUFBQTtFQUFJQyxJQUFBQSxLQUFLLEVBQUU7RUFBRXdFLE1BQUFBLFNBQVMsRUFBRSxNQUFNO0VBQUVoQyxNQUFBQSxPQUFPLEVBQUUsV0FBVztFQUFFbkMsTUFBQUEsUUFBUSxFQUFFLE1BQU07RUFBRW9ELE1BQUFBLFVBQVUsRUFBRSxLQUFLO0VBQUVuRCxNQUFBQSxLQUFLLEVBQUU7RUFBVTtFQUFFLEdBQUEsRUFBQyxNQUUzRyxDQUFDLGVBQ0xSLHNCQUFBLENBQUFDLGFBQUEsQ0FBQSxJQUFBLEVBQUE7RUFBSUMsSUFBQUEsS0FBSyxFQUFFO0VBQUV3RSxNQUFBQSxTQUFTLEVBQUUsTUFBTTtFQUFFaEMsTUFBQUEsT0FBTyxFQUFFLFdBQVc7RUFBRW5DLE1BQUFBLFFBQVEsRUFBRSxNQUFNO0VBQUVvRCxNQUFBQSxVQUFVLEVBQUUsS0FBSztFQUFFbkQsTUFBQUEsS0FBSyxFQUFFO0VBQVU7RUFBRSxHQUFBLEVBQUMsUUFFM0csQ0FDRixDQUNDLENBQUMsZUFDUlIsc0JBQUEsQ0FBQUMsYUFBQSxDQUFBLE9BQUEsRUFBQSxJQUFBLEVBQ0cxQyxJQUFJLENBQUMyQixLQUFLLENBQUNnSSxXQUFXLENBQUNqSSxLQUFLLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDc0csR0FBRyxDQUFDLENBQUMrRSxJQUFJLEVBQUU3RSxLQUFLLGtCQUNuRHpGLHNCQUFBLENBQUFDLGFBQUEsQ0FBQSxJQUFBLEVBQUE7RUFBSXlGLElBQUFBLEdBQUcsRUFBRUQsS0FBTTtFQUFDdkYsSUFBQUEsS0FBSyxFQUFFO0VBQUU2QyxNQUFBQSxZQUFZLEVBQUU7RUFBb0I7S0FBRSxlQUMzRC9DLHNCQUFBLENBQUFDLGFBQUEsQ0FBQSxJQUFBLEVBQUE7RUFBSUMsSUFBQUEsS0FBSyxFQUFFO0VBQUV3QyxNQUFBQSxPQUFPLEVBQUUsV0FBVztFQUFFbkMsTUFBQUEsUUFBUSxFQUFFLE1BQU07RUFBRW9ELE1BQUFBLFVBQVUsRUFBRSxLQUFLO0VBQUVuRCxNQUFBQSxLQUFLLEVBQUU7RUFBVTtFQUFFLEdBQUEsRUFDeEY4SixJQUFJLENBQUN0TCxVQUFVLEVBQUMsR0FBQyxFQUFDc0wsSUFBSSxDQUFDdEUsU0FDdEIsQ0FBQyxlQUNMaEcsc0JBQUEsQ0FBQUMsYUFBQSxDQUFBLElBQUEsRUFBQTtFQUFJQyxJQUFBQSxLQUFLLEVBQUU7RUFBRXdDLE1BQUFBLE9BQU8sRUFBRSxXQUFXO0VBQUVuQyxNQUFBQSxRQUFRLEVBQUUsTUFBTTtFQUFFQyxNQUFBQSxLQUFLLEVBQUU7RUFBVTtFQUFFLEdBQUEsRUFDckU4SixJQUFJLENBQUNQLEtBQ0osQ0FBQyxlQUNML0osc0JBQUEsQ0FBQUMsYUFBQSxDQUFBLElBQUEsRUFBQTtFQUFJQyxJQUFBQSxLQUFLLEVBQUU7RUFBRXdDLE1BQUFBLE9BQU8sRUFBRSxXQUFXO0VBQUVuQyxNQUFBQSxRQUFRLEVBQUU7RUFBTztLQUFFLGVBQ3BEUCxzQkFBQSxDQUFBQyxhQUFBLENBQUEsTUFBQSxFQUFBO0VBQU1DLElBQUFBLEtBQUssRUFBRTtFQUNYd0MsTUFBQUEsT0FBTyxFQUFFLFVBQVU7RUFDbkJRLE1BQUFBLFlBQVksRUFBRSxNQUFNO0VBQ3BCM0MsTUFBQUEsUUFBUSxFQUFFLE1BQU07RUFDaEJvRCxNQUFBQSxVQUFVLEVBQUUsS0FBSztFQUNqQm5CLE1BQUFBLGVBQWUsRUFBRThILElBQUksQ0FBQ3ZMLE9BQU8sS0FBSyxDQUFDLEdBQUcsU0FBUyxHQUFHdUwsSUFBSSxDQUFDdkwsT0FBTyxLQUFLLENBQUMsR0FBRyxTQUFTLEdBQUcsU0FBUztFQUM1RnlCLE1BQUFBLEtBQUssRUFBRThKLElBQUksQ0FBQ3ZMLE9BQU8sS0FBSyxDQUFDLEdBQUcsU0FBUyxHQUFHdUwsSUFBSSxDQUFDdkwsT0FBTyxLQUFLLENBQUMsR0FBRyxTQUFTLEdBQUc7RUFDM0U7S0FBRSxFQUNDdUwsSUFBSSxDQUFDdkwsT0FBTyxLQUFLLENBQUMsR0FBRyxRQUFRLEdBQUd1TCxJQUFJLENBQUN2TCxPQUFPLEtBQUssQ0FBQyxHQUFHLFlBQVksR0FBRyxNQUNqRSxDQUNKLENBQUMsZUFDTGlCLHNCQUFBLENBQUFDLGFBQUEsQ0FBQSxJQUFBLEVBQUE7RUFBSUMsSUFBQUEsS0FBSyxFQUFFO0VBQUV3QyxNQUFBQSxPQUFPLEVBQUUsV0FBVztFQUFFbkMsTUFBQUEsUUFBUSxFQUFFLE1BQU07RUFBRUMsTUFBQUEsS0FBSyxFQUFFO0VBQVU7RUFBRSxHQUFBLEVBQ3JFOEosSUFBSSxDQUFDcEUsVUFBVSxHQUFHeUIsVUFBVSxDQUFDMkMsSUFBSSxDQUFDcEUsVUFBVSxDQUFDLEdBQUcsR0FDL0MsQ0FDRixDQUNMLENBQ0ksQ0FDRixDQUNKLENBRUosQ0FDTixFQUVBRSxTQUFTLEtBQUssVUFBVSxpQkFDdkJwRyxzQkFBQSxDQUFBQyxhQUFBLENBQUEsS0FBQSxFQUFBLElBQUEsZUFDRUQsc0JBQUEsQ0FBQUMsYUFBQSxDQUFBLEtBQUEsRUFBQTtFQUFLQyxJQUFBQSxLQUFLLEVBQUU7RUFDVkMsTUFBQUEsT0FBTyxFQUFFLE1BQU07RUFDZm1ELE1BQUFBLG1CQUFtQixFQUFFLHNDQUFzQztFQUMzREMsTUFBQUEsR0FBRyxFQUFFLE1BQU07RUFDWFYsTUFBQUEsWUFBWSxFQUFFO0VBQ2hCO0tBQUUsZUFDQTdDLHNCQUFBLENBQUFDLGFBQUEsQ0FBQSxLQUFBLEVBQUE7RUFBS0MsSUFBQUEsS0FBSyxFQUFFO0VBQ1Z3QyxNQUFBQSxPQUFPLEVBQUUsTUFBTTtFQUNmRixNQUFBQSxlQUFlLEVBQUUsT0FBTztFQUN4QlUsTUFBQUEsWUFBWSxFQUFFLE1BQU07RUFDcEJPLE1BQUFBLFNBQVMsRUFBRSwyQkFBMkI7RUFDdENSLE1BQUFBLE1BQU0sRUFBRTtFQUNWO0tBQUUsZUFDQWpELHNCQUFBLENBQUFDLGFBQUEsQ0FBQSxLQUFBLEVBQUE7RUFBS0MsSUFBQUEsS0FBSyxFQUFFO0VBQUVLLE1BQUFBLFFBQVEsRUFBRSxNQUFNO0VBQUVDLE1BQUFBLEtBQUssRUFBRSxTQUFTO0VBQUVxQyxNQUFBQSxZQUFZLEVBQUUsS0FBSztFQUFFYyxNQUFBQSxVQUFVLEVBQUU7RUFBTTtFQUFFLEdBQUEsRUFBQyxPQUFVLENBQUMsZUFDdkczRCxzQkFBQSxDQUFBQyxhQUFBLENBQUEsS0FBQSxFQUFBO0VBQUtDLElBQUFBLEtBQUssRUFBRTtFQUFFSyxNQUFBQSxRQUFRLEVBQUUsTUFBTTtFQUFFb0QsTUFBQUEsVUFBVSxFQUFFLEtBQUs7RUFBRW5ELE1BQUFBLEtBQUssRUFBRTtFQUFVO0VBQUUsR0FBQSxFQUNuRWpELElBQUksRUFBRW9KLFFBQVEsRUFBRTRELGFBQWEsSUFBSSxDQUMvQixDQUNGLENBQUMsZUFFTnZLLHNCQUFBLENBQUFDLGFBQUEsQ0FBQSxLQUFBLEVBQUE7RUFBS0MsSUFBQUEsS0FBSyxFQUFFO0VBQ1Z3QyxNQUFBQSxPQUFPLEVBQUUsTUFBTTtFQUNmRixNQUFBQSxlQUFlLEVBQUUsT0FBTztFQUN4QlUsTUFBQUEsWUFBWSxFQUFFLE1BQU07RUFDcEJPLE1BQUFBLFNBQVMsRUFBRSwyQkFBMkI7RUFDdENSLE1BQUFBLE1BQU0sRUFBRTtFQUNWO0tBQUUsZUFDQWpELHNCQUFBLENBQUFDLGFBQUEsQ0FBQSxLQUFBLEVBQUE7RUFBS0MsSUFBQUEsS0FBSyxFQUFFO0VBQUVLLE1BQUFBLFFBQVEsRUFBRSxNQUFNO0VBQUVDLE1BQUFBLEtBQUssRUFBRSxTQUFTO0VBQUVxQyxNQUFBQSxZQUFZLEVBQUUsS0FBSztFQUFFYyxNQUFBQSxVQUFVLEVBQUU7RUFBTTtFQUFFLEdBQUEsRUFBQyxRQUFXLENBQUMsZUFDeEczRCxzQkFBQSxDQUFBQyxhQUFBLENBQUEsS0FBQSxFQUFBO0VBQUtDLElBQUFBLEtBQUssRUFBRTtFQUFFSyxNQUFBQSxRQUFRLEVBQUUsTUFBTTtFQUFFb0QsTUFBQUEsVUFBVSxFQUFFLEtBQUs7RUFBRW5ELE1BQUFBLEtBQUssRUFBRTtFQUFVO0VBQUUsR0FBQSxFQUNuRWpELElBQUksRUFBRW9KLFFBQVEsRUFBRWdDLGNBQWMsSUFBSSxDQUNoQyxDQUNGLENBQUMsZUFFTjNJLHNCQUFBLENBQUFDLGFBQUEsQ0FBQSxLQUFBLEVBQUE7RUFBS0MsSUFBQUEsS0FBSyxFQUFFO0VBQ1Z3QyxNQUFBQSxPQUFPLEVBQUUsTUFBTTtFQUNmRixNQUFBQSxlQUFlLEVBQUUsT0FBTztFQUN4QlUsTUFBQUEsWUFBWSxFQUFFLE1BQU07RUFDcEJPLE1BQUFBLFNBQVMsRUFBRSwyQkFBMkI7RUFDdENSLE1BQUFBLE1BQU0sRUFBRTtFQUNWO0tBQUUsZUFDQWpELHNCQUFBLENBQUFDLGFBQUEsQ0FBQSxLQUFBLEVBQUE7RUFBS0MsSUFBQUEsS0FBSyxFQUFFO0VBQUVLLE1BQUFBLFFBQVEsRUFBRSxNQUFNO0VBQUVDLE1BQUFBLEtBQUssRUFBRSxTQUFTO0VBQUVxQyxNQUFBQSxZQUFZLEVBQUUsS0FBSztFQUFFYyxNQUFBQSxVQUFVLEVBQUU7RUFBTTtFQUFFLEdBQUEsRUFBQyxXQUFjLENBQUMsZUFDM0czRCxzQkFBQSxDQUFBQyxhQUFBLENBQUEsS0FBQSxFQUFBO0VBQUtDLElBQUFBLEtBQUssRUFBRTtFQUFFSyxNQUFBQSxRQUFRLEVBQUUsTUFBTTtFQUFFb0QsTUFBQUEsVUFBVSxFQUFFLEtBQUs7RUFBRW5ELE1BQUFBLEtBQUssRUFBRTtFQUFVO0VBQUUsR0FBQSxFQUNuRWpELElBQUksRUFBRW9KLFFBQVEsRUFBRWlDLGlCQUFpQixJQUFJLENBQ25DLENBQ0YsQ0FBQyxlQUVONUksc0JBQUEsQ0FBQUMsYUFBQSxDQUFBLEtBQUEsRUFBQTtFQUFLQyxJQUFBQSxLQUFLLEVBQUU7RUFDVndDLE1BQUFBLE9BQU8sRUFBRSxNQUFNO0VBQ2ZGLE1BQUFBLGVBQWUsRUFBRSxPQUFPO0VBQ3hCVSxNQUFBQSxZQUFZLEVBQUUsTUFBTTtFQUNwQk8sTUFBQUEsU0FBUyxFQUFFLDJCQUEyQjtFQUN0Q1IsTUFBQUEsTUFBTSxFQUFFO0VBQ1Y7S0FBRSxlQUNBakQsc0JBQUEsQ0FBQUMsYUFBQSxDQUFBLEtBQUEsRUFBQTtFQUFLQyxJQUFBQSxLQUFLLEVBQUU7RUFBRUssTUFBQUEsUUFBUSxFQUFFLE1BQU07RUFBRUMsTUFBQUEsS0FBSyxFQUFFLFNBQVM7RUFBRXFDLE1BQUFBLFlBQVksRUFBRSxLQUFLO0VBQUVjLE1BQUFBLFVBQVUsRUFBRTtFQUFNO0VBQUUsR0FBQSxFQUFDLE9BQVUsQ0FBQyxlQUN2RzNELHNCQUFBLENBQUFDLGFBQUEsQ0FBQSxLQUFBLEVBQUE7RUFBS0MsSUFBQUEsS0FBSyxFQUFFO0VBQUVLLE1BQUFBLFFBQVEsRUFBRSxNQUFNO0VBQUVvRCxNQUFBQSxVQUFVLEVBQUUsS0FBSztFQUFFbkQsTUFBQUEsS0FBSyxFQUFFO0VBQVU7S0FBRSxFQUNuRWpELElBQUksRUFBRW9KLFFBQVEsRUFBRTZELGFBQWEsSUFBSSxDQUMvQixDQUNGLENBQ0YsQ0FBQyxFQUVMak4sSUFBSSxFQUFFNEosWUFBWSxFQUFFQyxRQUFRLEVBQUV2QixNQUFNLEdBQUcsQ0FBQyxpQkFDdkM3RixzQkFBQSxDQUFBQyxhQUFBLENBQUEsS0FBQSxFQUFBO0VBQUtDLElBQUFBLEtBQUssRUFBRTtFQUNWc0MsTUFBQUEsZUFBZSxFQUFFLE9BQU87RUFDeEJVLE1BQUFBLFlBQVksRUFBRSxNQUFNO0VBQ3BCTyxNQUFBQSxTQUFTLEVBQUUsMkJBQTJCO0VBQ3RDUixNQUFBQSxNQUFNLEVBQUUsbUJBQW1CO0VBQzNCUCxNQUFBQSxPQUFPLEVBQUU7RUFDWDtLQUFFLGVBQ0ExQyxzQkFBQSxDQUFBQyxhQUFBLENBQUEsSUFBQSxFQUFBO0VBQUlDLElBQUFBLEtBQUssRUFBRTtFQUFFMEQsTUFBQUEsTUFBTSxFQUFFLFlBQVk7RUFBRXJELE1BQUFBLFFBQVEsRUFBRSxNQUFNO0VBQUVvRCxNQUFBQSxVQUFVLEVBQUUsS0FBSztFQUFFbkQsTUFBQUEsS0FBSyxFQUFFO0VBQVU7RUFBRSxHQUFBLEVBQUMsNkJBRXhGLENBQUMsZUFDTFIsc0JBQUEsQ0FBQUMsYUFBQSxDQUFBLEtBQUEsRUFBQTtFQUFLQyxJQUFBQSxLQUFLLEVBQUU7RUFBRUMsTUFBQUEsT0FBTyxFQUFFLE1BQU07RUFBRXNLLE1BQUFBLFFBQVEsRUFBRSxNQUFNO0VBQUVsSCxNQUFBQSxHQUFHLEVBQUU7RUFBTztFQUFFLEdBQUEsRUFDNURoRyxJQUFJLENBQUM0SixZQUFZLENBQUNDLFFBQVEsQ0FBQzdCLEdBQUcsQ0FBQyxDQUFDOEQsTUFBTSxFQUFFNUQsS0FBSyxrQkFDNUN6RixzQkFBQSxDQUFBQyxhQUFBLENBQUEsS0FBQSxFQUFBO0VBQUt5RixJQUFBQSxHQUFHLEVBQUVELEtBQU07RUFBQ3ZGLElBQUFBLEtBQUssRUFBRTtFQUN0QkMsTUFBQUEsT0FBTyxFQUFFLE1BQU07RUFDZkUsTUFBQUEsVUFBVSxFQUFFLFFBQVE7RUFDcEJxQyxNQUFBQSxPQUFPLEVBQUUsV0FBVztFQUNwQkYsTUFBQUEsZUFBZSxFQUFFLFNBQVM7RUFDMUJVLE1BQUFBLFlBQVksRUFBRSxLQUFLO0VBQ25CRCxNQUFBQSxNQUFNLEVBQUU7RUFDVjtLQUFFLGVBQ0FqRCxzQkFBQSxDQUFBQyxhQUFBLENBQUEsS0FBQSxFQUFBO0VBQUtDLElBQUFBLEtBQUssRUFBRTtFQUNWK0UsTUFBQUEsS0FBSyxFQUFFLE1BQU07RUFDYjNFLE1BQUFBLE1BQU0sRUFBRSxNQUFNO1FBQ2RrQyxlQUFlLEVBQUU2RyxNQUFNLENBQUM3SSxLQUFLO0VBQzdCMEMsTUFBQUEsWUFBWSxFQUFFLEtBQUs7RUFDbkJ3RyxNQUFBQSxXQUFXLEVBQUU7RUFDZjtFQUFFLEdBQU0sQ0FBQyxlQUNUMUosc0JBQUEsQ0FBQUMsYUFBQSxDQUFBLE1BQUEsRUFBQTtFQUFNQyxJQUFBQSxLQUFLLEVBQUU7RUFBRUssTUFBQUEsUUFBUSxFQUFFLE1BQU07RUFBRW9ELE1BQUFBLFVBQVUsRUFBRSxLQUFLO0VBQUVuRCxNQUFBQSxLQUFLLEVBQUU7RUFBVTtLQUFFLEVBQ3BFNkksTUFBTSxDQUFDQSxNQUFNLEVBQUMsSUFBRSxFQUFDQSxNQUFNLENBQUNxQixLQUNyQixDQUNILENBQ04sQ0FDRSxDQUNGLENBRUosQ0FDTixFQUVBdEUsU0FBUyxLQUFLLFdBQVcsaUJBQ3hCcEcsc0JBQUEsQ0FBQUMsYUFBQSxDQUFBLEtBQUEsRUFBQSxJQUFBLGVBQ0VELHNCQUFBLENBQUFDLGFBQUEsQ0FBQSxLQUFBLEVBQUE7RUFBS0MsSUFBQUEsS0FBSyxFQUFFO0VBQ1ZDLE1BQUFBLE9BQU8sRUFBRSxNQUFNO0VBQ2ZtRCxNQUFBQSxtQkFBbUIsRUFBRSxzQ0FBc0M7RUFDM0RDLE1BQUFBLEdBQUcsRUFBRSxNQUFNO0VBQ1hWLE1BQUFBLFlBQVksRUFBRTtFQUNoQjtLQUFFLGVBQ0E3QyxzQkFBQSxDQUFBQyxhQUFBLENBQUEsS0FBQSxFQUFBO0VBQUtDLElBQUFBLEtBQUssRUFBRTtFQUNWd0MsTUFBQUEsT0FBTyxFQUFFLE1BQU07RUFDZkYsTUFBQUEsZUFBZSxFQUFFLE9BQU87RUFDeEJVLE1BQUFBLFlBQVksRUFBRSxNQUFNO0VBQ3BCTyxNQUFBQSxTQUFTLEVBQUUsMkJBQTJCO0VBQ3RDUixNQUFBQSxNQUFNLEVBQUU7RUFDVjtLQUFFLGVBQ0FqRCxzQkFBQSxDQUFBQyxhQUFBLENBQUEsS0FBQSxFQUFBO0VBQUtDLElBQUFBLEtBQUssRUFBRTtFQUFFSyxNQUFBQSxRQUFRLEVBQUUsTUFBTTtFQUFFQyxNQUFBQSxLQUFLLEVBQUUsU0FBUztFQUFFcUMsTUFBQUEsWUFBWSxFQUFFLEtBQUs7RUFBRWMsTUFBQUEsVUFBVSxFQUFFO0VBQU07RUFBRSxHQUFBLEVBQUMsZUFBa0IsQ0FBQyxlQUMvRzNELHNCQUFBLENBQUFDLGFBQUEsQ0FBQSxLQUFBLEVBQUE7RUFBS0MsSUFBQUEsS0FBSyxFQUFFO0VBQUVLLE1BQUFBLFFBQVEsRUFBRSxNQUFNO0VBQUVvRCxNQUFBQSxVQUFVLEVBQUUsS0FBSztFQUFFbkQsTUFBQUEsS0FBSyxFQUFFO0VBQVU7RUFBRSxHQUFBLEVBQ25FNkcsY0FBYyxDQUFDOUosSUFBSSxFQUFFb0osUUFBUSxFQUFFdEYsWUFBWSxJQUFJLENBQUMsQ0FDOUMsQ0FDRixDQUFDLGVBRU5yQixzQkFBQSxDQUFBQyxhQUFBLENBQUEsS0FBQSxFQUFBO0VBQUtDLElBQUFBLEtBQUssRUFBRTtFQUNWd0MsTUFBQUEsT0FBTyxFQUFFLE1BQU07RUFDZkYsTUFBQUEsZUFBZSxFQUFFLE9BQU87RUFDeEJVLE1BQUFBLFlBQVksRUFBRSxNQUFNO0VBQ3BCTyxNQUFBQSxTQUFTLEVBQUUsMkJBQTJCO0VBQ3RDUixNQUFBQSxNQUFNLEVBQUU7RUFDVjtLQUFFLGVBQ0FqRCxzQkFBQSxDQUFBQyxhQUFBLENBQUEsS0FBQSxFQUFBO0VBQUtDLElBQUFBLEtBQUssRUFBRTtFQUFFSyxNQUFBQSxRQUFRLEVBQUUsTUFBTTtFQUFFQyxNQUFBQSxLQUFLLEVBQUUsU0FBUztFQUFFcUMsTUFBQUEsWUFBWSxFQUFFLEtBQUs7RUFBRWMsTUFBQUEsVUFBVSxFQUFFO0VBQU07RUFBRSxHQUFBLEVBQUMsY0FBaUIsQ0FBQyxlQUM5RzNELHNCQUFBLENBQUFDLGFBQUEsQ0FBQSxLQUFBLEVBQUE7RUFBS0MsSUFBQUEsS0FBSyxFQUFFO0VBQUVLLE1BQUFBLFFBQVEsRUFBRSxNQUFNO0VBQUVvRCxNQUFBQSxVQUFVLEVBQUUsS0FBSztFQUFFbkQsTUFBQUEsS0FBSyxFQUFFO0VBQVU7RUFBRSxHQUFBLEVBQ25FLENBQUNqRCxJQUFJLEVBQUVvSixRQUFRLEVBQUVnRSxpQkFBaUIsSUFBSSxDQUFDLEVBQUVySixjQUFjLEVBQ3JELENBQ0YsQ0FBQyxlQUVOdEIsc0JBQUEsQ0FBQUMsYUFBQSxDQUFBLEtBQUEsRUFBQTtFQUFLQyxJQUFBQSxLQUFLLEVBQUU7RUFDVndDLE1BQUFBLE9BQU8sRUFBRSxNQUFNO0VBQ2ZGLE1BQUFBLGVBQWUsRUFBRSxPQUFPO0VBQ3hCVSxNQUFBQSxZQUFZLEVBQUUsTUFBTTtFQUNwQk8sTUFBQUEsU0FBUyxFQUFFLDJCQUEyQjtFQUN0Q1IsTUFBQUEsTUFBTSxFQUFFO0VBQ1Y7S0FBRSxlQUNBakQsc0JBQUEsQ0FBQUMsYUFBQSxDQUFBLEtBQUEsRUFBQTtFQUFLQyxJQUFBQSxLQUFLLEVBQUU7RUFBRUssTUFBQUEsUUFBUSxFQUFFLE1BQU07RUFBRUMsTUFBQUEsS0FBSyxFQUFFLFNBQVM7RUFBRXFDLE1BQUFBLFlBQVksRUFBRSxLQUFLO0VBQUVjLE1BQUFBLFVBQVUsRUFBRTtFQUFNO0VBQUUsR0FBQSxFQUFDLGlCQUFvQixDQUFDLGVBQ2pIM0Qsc0JBQUEsQ0FBQUMsYUFBQSxDQUFBLEtBQUEsRUFBQTtFQUFLQyxJQUFBQSxLQUFLLEVBQUU7RUFBRUssTUFBQUEsUUFBUSxFQUFFLE1BQU07RUFBRW9ELE1BQUFBLFVBQVUsRUFBRSxLQUFLO0VBQUVuRCxNQUFBQSxLQUFLLEVBQUU7RUFBVTtFQUFFLEdBQUEsRUFDbkU2RyxjQUFjLENBQUM5SixJQUFJLEVBQUVvSixRQUFRLEVBQUVrQyxjQUFjLElBQUksQ0FBQyxDQUNoRCxDQUNGLENBQUMsZUFFTjdJLHNCQUFBLENBQUFDLGFBQUEsQ0FBQSxLQUFBLEVBQUE7RUFBS0MsSUFBQUEsS0FBSyxFQUFFO0VBQ1Z3QyxNQUFBQSxPQUFPLEVBQUUsTUFBTTtFQUNmRixNQUFBQSxlQUFlLEVBQUUsT0FBTztFQUN4QlUsTUFBQUEsWUFBWSxFQUFFLE1BQU07RUFDcEJPLE1BQUFBLFNBQVMsRUFBRSwyQkFBMkI7RUFDdENSLE1BQUFBLE1BQU0sRUFBRTtFQUNWO0tBQUUsZUFDQWpELHNCQUFBLENBQUFDLGFBQUEsQ0FBQSxLQUFBLEVBQUE7RUFBS0MsSUFBQUEsS0FBSyxFQUFFO0VBQUVLLE1BQUFBLFFBQVEsRUFBRSxNQUFNO0VBQUVDLE1BQUFBLEtBQUssRUFBRSxTQUFTO0VBQUVxQyxNQUFBQSxZQUFZLEVBQUUsS0FBSztFQUFFYyxNQUFBQSxVQUFVLEVBQUU7RUFBTTtFQUFFLEdBQUEsRUFBQyxpQkFBb0IsQ0FBQyxlQUNqSDNELHNCQUFBLENBQUFDLGFBQUEsQ0FBQSxLQUFBLEVBQUE7RUFBS0MsSUFBQUEsS0FBSyxFQUFFO0VBQUVLLE1BQUFBLFFBQVEsRUFBRSxNQUFNO0VBQUVvRCxNQUFBQSxVQUFVLEVBQUUsS0FBSztFQUFFbkQsTUFBQUEsS0FBSyxFQUFFO0VBQVU7RUFBRSxHQUFBLEVBQ25FNkcsY0FBYyxDQUFDOUosSUFBSSxFQUFFb0osUUFBUSxFQUFFaUUsY0FBYyxJQUFJLENBQUMsQ0FDaEQsQ0FDRixDQUNGLENBQUMsZUFFTjVLLHNCQUFBLENBQUFDLGFBQUEsQ0FBQSxLQUFBLEVBQUE7RUFBS0MsSUFBQUEsS0FBSyxFQUFFO0VBQ1ZzQyxNQUFBQSxlQUFlLEVBQUUsT0FBTztFQUN4QlUsTUFBQUEsWUFBWSxFQUFFLE1BQU07RUFDcEJPLE1BQUFBLFNBQVMsRUFBRSwyQkFBMkI7RUFDdENSLE1BQUFBLE1BQU0sRUFBRSxtQkFBbUI7RUFDM0JQLE1BQUFBLE9BQU8sRUFBRTtFQUNYO0tBQUUsZUFDQTFDLHNCQUFBLENBQUFDLGFBQUEsQ0FBQSxJQUFBLEVBQUE7RUFBSUMsSUFBQUEsS0FBSyxFQUFFO0VBQUUwRCxNQUFBQSxNQUFNLEVBQUUsWUFBWTtFQUFFckQsTUFBQUEsUUFBUSxFQUFFLE1BQU07RUFBRW9ELE1BQUFBLFVBQVUsRUFBRSxLQUFLO0VBQUVuRCxNQUFBQSxLQUFLLEVBQUU7RUFBVTtFQUFFLEdBQUEsRUFBQyxvQkFFeEYsQ0FBQyxlQUNMUixzQkFBQSxDQUFBQyxhQUFBLENBQUEsR0FBQSxFQUFBO0VBQUdDLElBQUFBLEtBQUssRUFBRTtFQUFFMEQsTUFBQUEsTUFBTSxFQUFFLEdBQUc7RUFBRXBELE1BQUFBLEtBQUssRUFBRSxTQUFTO0VBQUVELE1BQUFBLFFBQVEsRUFBRTtFQUFPO0VBQUUsR0FBQSxFQUFDLG1HQUU3RCxFQUFDaEQsSUFBSSxFQUFFb0osUUFBUSxFQUFFdEYsWUFBWSxHQUFHLENBQUMsR0FDN0Isb0NBQW9DZ0csY0FBYyxDQUFDOUosSUFBSSxDQUFDb0osUUFBUSxDQUFDdEYsWUFBWSxDQUFDLENBQUEsUUFBQSxFQUFXLENBQUM5RCxJQUFJLENBQUNvSixRQUFRLENBQUNnRSxpQkFBaUIsSUFBSSxDQUFDLEVBQUVySixjQUFjLEVBQUUsZ0JBQWdCLEdBQ2hLLGlDQUVILENBQ0EsQ0FDRixDQUVKLENBQ0YsQ0FBQztFQUVWOztFQ24zQkEsTUFBTXVKLGdCQUFnQixHQUFHQSxDQUFDO0VBQUVDLEVBQUFBO0VBQU8sQ0FBQyxLQUFLO0lBQ3ZDLE1BQU1DLFNBQVMsR0FBR0QsTUFBTSxDQUFDRSxNQUFNLEVBQUVDLGdCQUFnQixJQUFJLEVBQUU7RUFDdkQsRUFBQSxNQUFNQyxRQUFRLEdBQUdKLE1BQU0sQ0FBQ0UsTUFBTSxFQUFFakYsRUFBRTtFQUVsQyxFQUFBLElBQUksQ0FBQ2dGLFNBQVMsQ0FBQ2xGLE1BQU0sRUFBRTtNQUNyQixvQkFDRTdGLHNCQUFBLENBQUFDLGFBQUEsQ0FBQSxLQUFBLEVBQUE7RUFBS0MsTUFBQUEsS0FBSyxFQUFFO0VBQ1ZtSSxRQUFBQSxVQUFVLEVBQUUsU0FBUztFQUNyQjNGLFFBQUFBLE9BQU8sRUFBRSxNQUFNO0VBQ2ZRLFFBQUFBLFlBQVksRUFBRSxLQUFLO0VBQ25CTCxRQUFBQSxZQUFZLEVBQUU7RUFDaEI7T0FBRSxlQUNBN0Msc0JBQUEsQ0FBQUMsYUFBQSxDQUFBLElBQUEsRUFBQTtFQUFJQyxNQUFBQSxLQUFLLEVBQUU7RUFBRUssUUFBQUEsUUFBUSxFQUFFLE1BQU07RUFBRW9ELFFBQUFBLFVBQVUsRUFBRSxLQUFLO0VBQUVkLFFBQUFBLFlBQVksRUFBRTtFQUFNO0VBQUUsS0FBQSxFQUFDLGtCQUVyRSxDQUFDLGVBQ0w3QyxzQkFBQSxDQUFBQyxhQUFBLENBQUEsR0FBQSxFQUFBO0VBQUdDLE1BQUFBLEtBQUssRUFBRTtFQUFFTSxRQUFBQSxLQUFLLEVBQUUsU0FBUztFQUFFcUMsUUFBQUEsWUFBWSxFQUFFO0VBQU87RUFBRSxLQUFBLEVBQUMsNEJBRW5ELENBQUMsZUFDSjdDLHNCQUFBLENBQUFDLGFBQUEsQ0FBQSxHQUFBLEVBQUE7UUFDRXlCLElBQUksRUFBRSxDQUFBLHdEQUFBLEVBQTJEd0osUUFBUSxDQUFBLENBQUc7RUFDNUVoTCxNQUFBQSxLQUFLLEVBQUU7RUFDTG1JLFFBQUFBLFVBQVUsRUFBRSxTQUFTO0VBQ3JCN0gsUUFBQUEsS0FBSyxFQUFFLE9BQU87RUFDZGtDLFFBQUFBLE9BQU8sRUFBRSxVQUFVO0VBQ25CUSxRQUFBQSxZQUFZLEVBQUUsS0FBSztFQUNuQmlJLFFBQUFBLGNBQWMsRUFBRSxNQUFNO0VBQ3RCaEwsUUFBQUEsT0FBTyxFQUFFLGNBQWM7RUFDdkJJLFFBQUFBLFFBQVEsRUFBRTtFQUNaO09BQUUsRUFDSCxjQUVFLENBQ0EsQ0FBQztFQUVWLEVBQUE7SUFFQSxvQkFDRVAsc0JBQUEsQ0FBQUMsYUFBQSxDQUFBLEtBQUEsRUFBQTtFQUFLQyxJQUFBQSxLQUFLLEVBQUU7RUFDVm1JLE1BQUFBLFVBQVUsRUFBRSxTQUFTO0VBQ3JCM0YsTUFBQUEsT0FBTyxFQUFFLE1BQU07RUFDZlEsTUFBQUEsWUFBWSxFQUFFLEtBQUs7RUFDbkJMLE1BQUFBLFlBQVksRUFBRTtFQUNoQjtLQUFFLGVBQ0E3QyxzQkFBQSxDQUFBQyxhQUFBLENBQUEsS0FBQSxFQUFBO0VBQUtDLElBQUFBLEtBQUssRUFBRTtFQUNWQyxNQUFBQSxPQUFPLEVBQUUsTUFBTTtFQUNmQyxNQUFBQSxjQUFjLEVBQUUsZUFBZTtFQUMvQkMsTUFBQUEsVUFBVSxFQUFFLFFBQVE7RUFDcEJ3QyxNQUFBQSxZQUFZLEVBQUU7RUFDaEI7S0FBRSxlQUNBN0Msc0JBQUEsQ0FBQUMsYUFBQSxDQUFBLElBQUEsRUFBQTtFQUFJQyxJQUFBQSxLQUFLLEVBQUU7RUFBRUssTUFBQUEsUUFBUSxFQUFFLE1BQU07RUFBRW9ELE1BQUFBLFVBQVUsRUFBRSxLQUFLO0VBQUVDLE1BQUFBLE1BQU0sRUFBRTtFQUFFO0tBQUUsRUFBQyxvQkFDM0MsRUFBQ21ILFNBQVMsQ0FBQ2xGLE1BQU0sRUFBQyxHQUNsQyxDQUFDLGVBQ0w3RixzQkFBQSxDQUFBQyxhQUFBLENBQUEsR0FBQSxFQUFBO01BQ0V5QixJQUFJLEVBQUUsQ0FBQSx3REFBQSxFQUEyRHdKLFFBQVEsQ0FBQSxDQUFHO0VBQzVFaEwsSUFBQUEsS0FBSyxFQUFFO0VBQ0xtSSxNQUFBQSxVQUFVLEVBQUUsU0FBUztFQUNyQjdILE1BQUFBLEtBQUssRUFBRSxPQUFPO0VBQ2RrQyxNQUFBQSxPQUFPLEVBQUUsVUFBVTtFQUNuQlEsTUFBQUEsWUFBWSxFQUFFLEtBQUs7RUFDbkJpSSxNQUFBQSxjQUFjLEVBQUUsTUFBTTtFQUN0QjVLLE1BQUFBLFFBQVEsRUFBRTtFQUNaO0VBQUUsR0FBQSxFQUNILGNBRUUsQ0FDQSxDQUFDLGVBRU5QLHNCQUFBLENBQUFDLGFBQUEsQ0FBQSxLQUFBLEVBQUE7RUFBS0MsSUFBQUEsS0FBSyxFQUFFO0VBQUVDLE1BQUFBLE9BQU8sRUFBRSxNQUFNO0VBQUVpTCxNQUFBQSxhQUFhLEVBQUUsUUFBUTtFQUFFN0gsTUFBQUEsR0FBRyxFQUFFO0VBQU07S0FBRSxFQUNsRXdILFNBQVMsQ0FBQ3hGLEdBQUcsQ0FBRThGLFFBQVEsaUJBQ3RCckwsc0JBQUEsQ0FBQUMsYUFBQSxDQUFBLEtBQUEsRUFBQTtNQUNFeUYsR0FBRyxFQUFFMkYsUUFBUSxDQUFDdEYsRUFBRztFQUNqQjdGLElBQUFBLEtBQUssRUFBRTtFQUNMbUksTUFBQUEsVUFBVSxFQUFFLE9BQU87RUFDbkIzRixNQUFBQSxPQUFPLEVBQUUsTUFBTTtFQUNmUSxNQUFBQSxZQUFZLEVBQUUsS0FBSztFQUNuQkQsTUFBQUEsTUFBTSxFQUFFO0VBQ1Y7S0FBRSxlQUVGakQsc0JBQUEsQ0FBQUMsYUFBQSxDQUFBLEdBQUEsRUFBQTtFQUFHQyxJQUFBQSxLQUFLLEVBQUU7RUFBRXlELE1BQUFBLFVBQVUsRUFBRSxLQUFLO0VBQUVDLE1BQUFBLE1BQU0sRUFBRTtFQUFZO0tBQUUsRUFBQyxZQUMxQyxFQUFDeUgsUUFBUSxDQUFDdEYsRUFDbkIsQ0FBQyxlQUNKL0Ysc0JBQUEsQ0FBQUMsYUFBQSxDQUFBLEdBQUEsRUFBQTtNQUNFeUIsSUFBSSxFQUFFMkosUUFBUSxDQUFDQyxRQUFTO0VBQ3hCdkcsSUFBQUEsTUFBTSxFQUFDLFFBQVE7RUFDZndHLElBQUFBLEdBQUcsRUFBQyxxQkFBcUI7RUFDekJyTCxJQUFBQSxLQUFLLEVBQUU7RUFBRU0sTUFBQUEsS0FBSyxFQUFFLFNBQVM7RUFBRUQsTUFBQUEsUUFBUSxFQUFFLE1BQU07RUFBRTRLLE1BQUFBLGNBQWMsRUFBRTtFQUFPO0VBQUUsR0FBQSxFQUVyRUUsUUFBUSxDQUFDQyxRQUNULENBQ0EsQ0FDTixDQUNFLENBQ0YsQ0FBQztFQUVWLENBQUM7O0VDaEdERSxPQUFPLENBQUNDLGNBQWMsR0FBRyxFQUFFO0VBRTNCRCxPQUFPLENBQUNDLGNBQWMsQ0FBQ3JPLFNBQVMsR0FBR0EsU0FBUztFQUU1Q29PLE9BQU8sQ0FBQ0MsY0FBYyxDQUFDdEYsU0FBUyxHQUFHQSxTQUFTO0VBRTVDcUYsT0FBTyxDQUFDQyxjQUFjLENBQUNaLGdCQUFnQixHQUFHQSxnQkFBZ0I7RUFFMURXLE9BQU8sQ0FBQ0MsY0FBYyxDQUFDQyxrQkFBa0IsR0FBR0EsZ0JBQWtCOzs7Ozs7In0=
