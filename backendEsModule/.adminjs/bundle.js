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
      title: "Total Users",
      value: metrics.usersCount || 0,
      link: "/admin/resources/users",
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

  AdminJS.UserComponents = {};
  AdminJS.UserComponents.Dashboard = Dashboard;
  AdminJS.UserComponents.Analytics = Analytics;

})(React, AdminJS);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYnVuZGxlLmpzIiwic291cmNlcyI6WyIuLi8uLi9mcm9udGVuZC9hZG1pbi1jb21wb25lbnRzL2Rhc2hib2FyZC5qc3giLCIuLi8uLi9mcm9udGVuZC9hZG1pbi1jb21wb25lbnRzL2FuYWx5dGljcy5qc3giLCJlbnRyeS5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBBZG1pbi9jb21wb25lbnRzL0Rhc2hib2FyZC5qc3hcclxuaW1wb3J0IFJlYWN0LCB7IHVzZUVmZmVjdCwgdXNlU3RhdGUsIHVzZUNhbGxiYWNrLCB1c2VSZWYgfSBmcm9tIFwicmVhY3RcIjtcclxuaW1wb3J0IHsgQXBpQ2xpZW50LCB1c2VUcmFuc2xhdGlvbiB9IGZyb20gXCJhZG1pbmpzXCI7XHJcblxyXG5jb25zdCBhcGkgPSBuZXcgQXBpQ2xpZW50KCk7XHJcblxyXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBEYXNoYm9hcmQoKSB7XHJcbiAgY29uc3QgeyB0cmFuc2xhdGVNZXNzYWdlIH0gPSB1c2VUcmFuc2xhdGlvbigpO1xyXG4gIGNvbnN0IFtkYXRhLCBzZXREYXRhXSA9IHVzZVN0YXRlKG51bGwpO1xyXG4gIGNvbnN0IFtsb2FkaW5nLCBzZXRMb2FkaW5nXSA9IHVzZVN0YXRlKHRydWUpO1xyXG4gIGNvbnN0IFtlcnJvciwgc2V0RXJyb3JdID0gdXNlU3RhdGUobnVsbCk7XHJcbiAgY29uc3QgW2FkbWluTG9ncywgc2V0QWRtaW5Mb2dzXSA9IHVzZVN0YXRlKFtdKTtcclxuICBjb25zdCBbdXNlckxvZ3MsIHNldFVzZXJMb2dzXSA9IHVzZVN0YXRlKFtdKTtcclxuICBjb25zdCBmZXRjaGluZ1JlZiA9IHVzZVJlZihmYWxzZSk7XHJcbiAgY29uc3QgbW91bnRlZFJlZiA9IHVzZVJlZih0cnVlKTtcclxuXHJcbiAgY29uc3QgZmV0Y2hEYXNoYm9hcmREYXRhID0gdXNlQ2FsbGJhY2soYXN5bmMgKCkgPT4ge1xyXG4gICAgaWYgKGZldGNoaW5nUmVmLmN1cnJlbnQpIHJldHVybjtcclxuXHJcbiAgICBmZXRjaGluZ1JlZi5jdXJyZW50ID0gdHJ1ZTtcclxuXHJcbiAgICB0cnkge1xyXG4gICAgICBjb25zdCByZXNwb25zZSA9IGF3YWl0IGFwaS5nZXREYXNoYm9hcmQoKTtcclxuICAgICAgaWYgKCFtb3VudGVkUmVmLmN1cnJlbnQpIHJldHVybjtcclxuXHJcbiAgICAgIGlmIChyZXNwb25zZT8uZGF0YSkge1xyXG4gICAgICAgIHNldERhdGEocmVzcG9uc2UuZGF0YSk7XHJcblxyXG4gICAgICAgIGNvbnN0IGFsbExvZ3MgPSByZXNwb25zZS5kYXRhLnJlY2VudExvZ3MgfHwgW107XHJcbiAgICAgICAgY29uc3QgYWRtaW5zID0gYWxsTG9ncy5maWx0ZXIoXHJcbiAgICAgICAgICAobG9nKSA9PiBsb2cucm9sZV9pZCA9PT0gMSB8fCBsb2cuZmlyc3RfbmFtZSA9PT0gXCJTeXN0ZW1cIlxyXG4gICAgICAgICkuc2xpY2UoMCwgNSk7XHJcbiAgICAgICAgY29uc3QgdXNlcnMgPSBhbGxMb2dzLmZpbHRlcihcclxuICAgICAgICAgIChsb2cpID0+IGxvZy5yb2xlX2lkICE9PSAxICYmIGxvZy5maXJzdF9uYW1lICE9PSBcIlN5c3RlbVwiXHJcbiAgICAgICAgKS5zbGljZSgwLCA1KTtcclxuXHJcbiAgICAgICAgc2V0QWRtaW5Mb2dzKGFkbWlucyk7XHJcbiAgICAgICAgc2V0VXNlckxvZ3ModXNlcnMpO1xyXG4gICAgICAgIHNldEVycm9yKG51bGwpO1xyXG4gICAgICB9IGVsc2Uge1xyXG4gICAgICAgIHRocm93IG5ldyBFcnJvcihcIk5vIGRhdGEgcmVjZWl2ZWQgZnJvbSBBUElcIik7XHJcbiAgICAgIH1cclxuICAgIH0gY2F0Y2ggKGVycikge1xyXG4gICAgICBpZiAoIW1vdW50ZWRSZWYuY3VycmVudCkgcmV0dXJuO1xyXG4gICAgICBzZXRFcnJvcihlcnI/Lm1lc3NhZ2UgfHwgXCJGYWlsZWQgdG8gbG9hZCBkYXNoYm9hcmQgZGF0YVwiKTtcclxuICAgIH0gZmluYWxseSB7XHJcbiAgICAgIGlmIChtb3VudGVkUmVmLmN1cnJlbnQpIHNldExvYWRpbmcoZmFsc2UpO1xyXG4gICAgICBmZXRjaGluZ1JlZi5jdXJyZW50ID0gZmFsc2U7XHJcbiAgICB9XHJcbiAgfSwgW10pO1xyXG5cclxuICB1c2VFZmZlY3QoKCkgPT4ge1xyXG4gICAgbW91bnRlZFJlZi5jdXJyZW50ID0gdHJ1ZTtcclxuICAgIGZldGNoRGFzaGJvYXJkRGF0YSgpO1xyXG4gICAgcmV0dXJuICgpID0+IHtcclxuICAgICAgbW91bnRlZFJlZi5jdXJyZW50ID0gZmFsc2U7XHJcbiAgICB9O1xyXG4gIH0sIFtdKTtcclxuXHJcbiAgLy8gUmVhbC10aW1lIGRhdGEgdXBkYXRlcyBldmVyeSAxMCBzZWNvbmRzXHJcbiAgdXNlRWZmZWN0KCgpID0+IHtcclxuICAgIGNvbnN0IHJlZnJlc2hJbnRlcnZhbCA9IHNldEludGVydmFsKCgpID0+IHtcclxuICAgICAgaWYgKCFmZXRjaGluZ1JlZi5jdXJyZW50ICYmIG1vdW50ZWRSZWYuY3VycmVudCkge1xyXG4gICAgICAgIGZldGNoRGFzaGJvYXJkRGF0YSgpO1xyXG4gICAgICB9XHJcbiAgICB9LCAxMDAwMCk7XHJcbiAgICByZXR1cm4gKCkgPT4gY2xlYXJJbnRlcnZhbChyZWZyZXNoSW50ZXJ2YWwpO1xyXG4gIH0sIFtmZXRjaERhc2hib2FyZERhdGFdKTtcclxuXHJcbiAgLy8gUmVhbC10aW1lIGxvZyB1cGRhdGVzIGV2ZXJ5IDUgc2Vjb25kc1xyXG4gIHVzZUVmZmVjdCgoKSA9PiB7XHJcbiAgICBjb25zdCBsb2dJbnRlcnZhbCA9IHNldEludGVydmFsKGFzeW5jICgpID0+IHtcclxuICAgICAgaWYgKCFtb3VudGVkUmVmLmN1cnJlbnQgfHwgZmV0Y2hpbmdSZWYuY3VycmVudCkgcmV0dXJuO1xyXG4gICAgICB0cnkge1xyXG4gICAgICAgIGNvbnN0IHJlc3BvbnNlID0gYXdhaXQgZmV0Y2goXCIvYXBpL2FkbWluL2Rhc2hib2FyZC9sb2dzXCIpO1xyXG4gICAgICAgIGlmIChyZXNwb25zZS5vaykge1xyXG4gICAgICAgICAgY29uc3QgbmV3TG9ncyA9IGF3YWl0IHJlc3BvbnNlLmpzb24oKTtcclxuICAgICAgICAgIGlmIChtb3VudGVkUmVmLmN1cnJlbnQgJiYgbmV3TG9ncz8ucmVjZW50TG9ncykge1xyXG4gICAgICAgICAgICBjb25zdCBhbGxMb2dzID0gbmV3TG9ncy5yZWNlbnRMb2dzO1xyXG4gICAgICAgICAgICBjb25zdCBhZG1pbnMgPSBhbGxMb2dzLmZpbHRlcihcclxuICAgICAgICAgICAgICAobG9nKSA9PiBsb2cucm9sZV9pZCA9PT0gMSB8fCBsb2cuZmlyc3RfbmFtZSA9PT0gXCJTeXN0ZW1cIlxyXG4gICAgICAgICAgICApLnNsaWNlKDAsIDUpO1xyXG4gICAgICAgICAgICBjb25zdCB1c2VycyA9IGFsbExvZ3MuZmlsdGVyKFxyXG4gICAgICAgICAgICAgIChsb2cpID0+IGxvZy5yb2xlX2lkICE9PSAxICYmIGxvZy5maXJzdF9uYW1lICE9PSBcIlN5c3RlbVwiXHJcbiAgICAgICAgICAgICkuc2xpY2UoMCwgNSk7XHJcbiAgICAgICAgICAgIHNldEFkbWluTG9ncyhhZG1pbnMpO1xyXG4gICAgICAgICAgICBzZXRVc2VyTG9ncyh1c2Vycyk7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICB9IGNhdGNoIHt9XHJcbiAgICB9LCA1MDAwKTtcclxuICAgIHJldHVybiAoKSA9PiBjbGVhckludGVydmFsKGxvZ0ludGVydmFsKTtcclxuICB9LCBbXSk7XHJcblxyXG4gIGNvbnN0IGhhbmRsZVJlZnJlc2ggPSB1c2VDYWxsYmFjaygoKSA9PiB7XHJcbiAgICBmZXRjaERhc2hib2FyZERhdGEoKTtcclxuICB9LCBbZmV0Y2hEYXNoYm9hcmREYXRhXSk7XHJcblxyXG4gIGlmIChsb2FkaW5nICYmICFkYXRhKSB7XHJcbiAgICByZXR1cm4gKFxyXG4gICAgICA8ZGl2IHN0eWxlPXt7XHJcbiAgICAgICAgZGlzcGxheTogJ2ZsZXgnLFxyXG4gICAgICAgIGp1c3RpZnlDb250ZW50OiAnY2VudGVyJyxcclxuICAgICAgICBhbGlnbkl0ZW1zOiAnY2VudGVyJyxcclxuICAgICAgICBoZWlnaHQ6ICc0MDBweCcsXHJcbiAgICAgICAgZm9udFNpemU6ICcxNnB4JyxcclxuICAgICAgICBjb2xvcjogJyM2YjcyODAnXHJcbiAgICAgIH19PlxyXG4gICAgICAgIExvYWRpbmcgRGFzaGJvYXJkLi4uXHJcbiAgICAgIDwvZGl2PlxyXG4gICAgKTtcclxuICB9XHJcblxyXG4gIGNvbnN0IG1ldHJpY3MgPSBkYXRhPy5tZXRyaWNzIHx8IHt9O1xyXG5cclxuICBjb25zdCBzdGF0c0NhcmRzID0gW1xyXG4gICAgeyB0aXRsZTogXCJUb3RhbCBVc2Vyc1wiLCB2YWx1ZTogbWV0cmljcy51c2Vyc0NvdW50IHx8IDAsIGxpbms6IFwiL2FkbWluL3Jlc291cmNlcy91c2Vyc1wiLCBjb2xvcjogXCIjM2I4MmY2XCIgfSxcclxuICAgIHsgdGl0bGU6IFwiQ2xpZW50c1wiLCB2YWx1ZTogbWV0cmljcy5jbGllbnRzQ291bnQgfHwgMCwgbGluazogXCIvYWRtaW4vcmVzb3VyY2VzL2NsaWVudHNcIiwgY29sb3I6IFwiIzEwYjk4MVwiIH0sXHJcbiAgICB7IHRpdGxlOiBcIkZyZWVsYW5jZXJzXCIsIHZhbHVlOiBtZXRyaWNzLmZyZWVsYW5jZXJzQ291bnQgfHwgMCwgbGluazogXCIvYWRtaW4vcmVzb3VyY2VzL2ZyZWVsYW5jZXJzXCIsIGNvbG9yOiBcIiNmNTllMGJcIiB9LFxyXG4gICAgeyB0aXRsZTogXCJBY3RpdmUgUHJvamVjdHNcIiwgdmFsdWU6IG1ldHJpY3MucHJvamVjdHNDb3VudCB8fCAwLCBsaW5rOiBcIi9hZG1pbi9yZXNvdXJjZXMvcHJvamVjdHNcIiwgY29sb3I6IFwiI2VmNDQ0NFwiIH0sXHJcbiAgICB7IHRpdGxlOiBcIlBlbmRpbmcgQXBwb2ludG1lbnRzXCIsIHZhbHVlOiBtZXRyaWNzLnBlbmRpbmdBcHBvaW50bWVudHMgfHwgMCwgbGluazogXCIvYWRtaW4vcmVzb3VyY2VzL2FwcG9pbnRtZW50c1wiLCBjb2xvcjogXCIjOGI1Y2Y2XCIgfSxcclxuICAgIHsgdGl0bGU6IFwiQ291cnNlc1wiLCB2YWx1ZTogbWV0cmljcy5jb3Vyc2VzQ291bnQgfHwgMCwgbGluazogXCIvYWRtaW4vcmVzb3VyY2VzL2NvdXJzZXNcIiwgY29sb3I6IFwiIzA2YjZkNFwiIH0sXHJcbiAgICB7IHRpdGxlOiBcIlBsYW5zXCIsIHZhbHVlOiBtZXRyaWNzLnBsYW5zQ291bnQgfHwgMCwgbGluazogXCIvYWRtaW4vcmVzb3VyY2VzL3BsYW5zXCIsIGNvbG9yOiBcIiM4NGNjMTZcIiB9LFxyXG4gICAgeyB0aXRsZTogXCJUb3RhbCBSZXZlbnVlXCIsIHZhbHVlOiBgJCR7KG1ldHJpY3MudG90YWxSZXZlbnVlIHx8IDApLnRvTG9jYWxlU3RyaW5nKCl9YCwgbGluazogXCIvYWRtaW4vcmVzb3VyY2VzL3BheW1lbnRzXCIsIGNvbG9yOiBcIiMyMmM1NWVcIiB9LFxyXG4gICAgeyB0aXRsZTogXCJBbmFseXRpY3NcIiwgdmFsdWU6IFwiVmlldyBSZXBvcnRzXCIsIGxpbms6IFwiL2FkbWluL3BhZ2VzL2FuYWx5dGljc1wiLCBjb2xvcjogXCIjNjM2NmYxXCIgfSxcclxuICBdO1xyXG5cclxuICBjb25zdCBoYW5kbGVDYXJkQ2xpY2sgPSAobGluaykgPT4ge1xyXG4gICAgd2luZG93LmxvY2F0aW9uLmhyZWYgPSBsaW5rO1xyXG4gIH07XHJcblxyXG4gIGNvbnN0IGdldFRpbWVBZ28gPSAoZGF0ZVN0cmluZykgPT4ge1xyXG4gICAgaWYgKCFkYXRlU3RyaW5nKSByZXR1cm4gXCJcIjtcclxuICAgIHRyeSB7XHJcbiAgICAgIGNvbnN0IG5vdyA9IG5ldyBEYXRlKCk7XHJcbiAgICAgIGNvbnN0IGxvZ1RpbWUgPSBuZXcgRGF0ZShkYXRlU3RyaW5nKTtcclxuICAgICAgY29uc3QgZGlmZk1zID0gbm93IC0gbG9nVGltZTtcclxuICAgICAgY29uc3QgZGlmZlNlY3MgPSBNYXRoLmZsb29yKGRpZmZNcyAvIDEwMDApO1xyXG4gICAgICBpZiAoZGlmZlNlY3MgPCA2MCkgcmV0dXJuIGAke2RpZmZTZWNzfXMgYWdvYDtcclxuICAgICAgY29uc3QgZGlmZk1pbnMgPSBNYXRoLmZsb29yKGRpZmZTZWNzIC8gNjApO1xyXG4gICAgICBpZiAoZGlmZk1pbnMgPCA2MCkgcmV0dXJuIGAke2RpZmZNaW5zfW0gYWdvYDtcclxuICAgICAgY29uc3QgZGlmZkhvdXJzID0gTWF0aC5mbG9vcihkaWZmTWlucyAvIDYwKTtcclxuICAgICAgaWYgKGRpZmZIb3VycyA8IDI0KSByZXR1cm4gYCR7ZGlmZkhvdXJzfWggYWdvYDtcclxuICAgICAgcmV0dXJuIGxvZ1RpbWUudG9Mb2NhbGVEYXRlU3RyaW5nKCk7XHJcbiAgICB9IGNhdGNoIHtcclxuICAgICAgcmV0dXJuIFwiXCI7XHJcbiAgICB9XHJcbiAgfTtcclxuXHJcbiAgY29uc3QgY29udGFpbmVyU3R5bGUgPSB7XHJcbiAgICBiYWNrZ3JvdW5kQ29sb3I6ICcjZmZmZmZmJyxcclxuICAgIG1pbkhlaWdodDogJzEwMHZoJyxcclxuICAgIHBhZGRpbmc6ICcyMHB4JyxcclxuICAgIGZvbnRGYW1pbHk6ICctYXBwbGUtc3lzdGVtLCBCbGlua01hY1N5c3RlbUZvbnQsIFwiU2Vnb2UgVUlcIiwgUm9ib3RvLCBcIkhlbHZldGljYSBOZXVlXCIsIEFyaWFsLCBzYW5zLXNlcmlmJ1xyXG4gIH07XHJcblxyXG4gIGNvbnN0IGhlYWRlclN0eWxlID0ge1xyXG4gICAgZGlzcGxheTogJ2ZsZXgnLFxyXG4gICAganVzdGlmeUNvbnRlbnQ6ICdzcGFjZS1iZXR3ZWVuJyxcclxuICAgIGFsaWduSXRlbXM6ICdjZW50ZXInLFxyXG4gICAgbWFyZ2luQm90dG9tOiAnMzBweCcsXHJcbiAgICBwYWRkaW5nQm90dG9tOiAnMjBweCcsXHJcbiAgICBib3JkZXJCb3R0b206ICcxcHggc29saWQgI2U1ZTdlYidcclxuICB9O1xyXG5cclxuICBjb25zdCBkYXNoYm9hcmRUaXRsZVN0eWxlID0ge1xyXG4gICAgZm9udFNpemU6ICcxNnB4JyxcclxuICAgIGZvbnRXZWlnaHQ6ICc1MDAnLFxyXG4gICAgY29sb3I6ICcjMDAwMDAwJyxcclxuICAgIG1hcmdpbjogJzAnXHJcbiAgfTtcclxuXHJcbiAgY29uc3QgcmVmcmVzaEJ1dHRvblN0eWxlID0ge1xyXG4gICAgYmFja2dyb3VuZENvbG9yOiAnI2Y4ZjlmYScsXHJcbiAgICBib3JkZXI6ICcxcHggc29saWQgI2U5ZWNlZicsXHJcbiAgICBib3JkZXJSYWRpdXM6ICc2cHgnLFxyXG4gICAgcGFkZGluZzogJzhweCcsXHJcbiAgICBjdXJzb3I6ICdwb2ludGVyJyxcclxuICAgIHRyYW5zaXRpb246ICdhbGwgMC4ycycsXHJcbiAgICBkaXNwbGF5OiAnZmxleCcsXHJcbiAgICBhbGlnbkl0ZW1zOiAnY2VudGVyJyxcclxuICAgIGp1c3RpZnlDb250ZW50OiAnY2VudGVyJyxcclxuICAgIGNvbG9yOiAnIzAwMDAwMCdcclxuICB9O1xyXG5cclxuICBjb25zdCBtZXRyaWNzR3JpZFN0eWxlID0ge1xyXG4gICAgZGlzcGxheTogJ2dyaWQnLFxyXG4gICAgZ3JpZFRlbXBsYXRlQ29sdW1uczogJ3JlcGVhdChhdXRvLWZpdCwgbWlubWF4KDI4MHB4LCAxZnIpKScsXHJcbiAgICBnYXA6ICcyNHB4JyxcclxuICAgIG1hcmdpbkJvdHRvbTogJzQwcHgnXHJcbiAgfTtcclxuXHJcbiAgY29uc3QgY2FyZFN0eWxlID0ge1xyXG4gICAgYmFja2dyb3VuZENvbG9yOiAnI2ZmZmZmZicsXHJcbiAgICBwYWRkaW5nOiAnMjRweCcsXHJcbiAgICBib3JkZXI6ICcxcHggc29saWQgI2U5ZWNlZicsXHJcbiAgICBib3JkZXJSYWRpdXM6ICc4cHgnLFxyXG4gICAgY3Vyc29yOiAncG9pbnRlcicsXHJcbiAgICB0cmFuc2l0aW9uOiAnYWxsIDAuMnMgZWFzZScsXHJcbiAgICBib3hTaGFkb3c6ICcwIDFweCAzcHggcmdiYSgwLCAwLCAwLCAwLjEpJ1xyXG4gIH07XHJcblxyXG4gIGNvbnN0IGNhcmRUaXRsZVN0eWxlID0ge1xyXG4gICAgZm9udFNpemU6ICcxMnB4JyxcclxuICAgIGZvbnRXZWlnaHQ6ICc1MDAnLFxyXG4gICAgY29sb3I6ICcjNmI3MjgwJyxcclxuICAgIG1hcmdpbjogJzAgMCA4cHggMCcsXHJcbiAgICB0ZXh0VHJhbnNmb3JtOiAndXBwZXJjYXNlJyxcclxuICAgIGxldHRlclNwYWNpbmc6ICcwLjhweCdcclxuICB9O1xyXG5cclxuICBjb25zdCBjYXJkVmFsdWVTdHlsZSA9ICgpID0+ICh7XHJcbiAgICBmb250U2l6ZTogJzI4cHgnLFxyXG4gICAgZm9udFdlaWdodDogJzcwMCcsXHJcbiAgICBjb2xvcjogJyMwMDAwMDAnLFxyXG4gICAgbWFyZ2luOiAnMCdcclxuICB9KTtcclxuXHJcbiAgY29uc3QgbG9nc0NvbnRhaW5lclN0eWxlID0ge1xyXG4gICAgZGlzcGxheTogJ2dyaWQnLFxyXG4gICAgZ3JpZFRlbXBsYXRlQ29sdW1uczogJzFmciAxZnInLFxyXG4gICAgZ2FwOiAnMjRweCdcclxuICB9O1xyXG5cclxuICBjb25zdCBsb2dTZWN0aW9uU3R5bGUgPSB7XHJcbiAgICBiYWNrZ3JvdW5kQ29sb3I6ICcjZmZmZmZmJyxcclxuICAgIGJvcmRlcjogJzFweCBzb2xpZCAjZTllY2VmJyxcclxuICAgIGJvcmRlclJhZGl1czogJzhweCcsXHJcbiAgICBvdmVyZmxvdzogJ2hpZGRlbicsXHJcbiAgICBib3hTaGFkb3c6ICcwIDFweCAzcHggcmdiYSgwLCAwLCAwLCAwLjEpJ1xyXG4gIH07XHJcblxyXG4gIGNvbnN0IGxvZ0hlYWRlclN0eWxlID0ge1xyXG4gICAgZm9udFNpemU6ICcxNnB4JyxcclxuICAgIGZvbnRXZWlnaHQ6ICc2MDAnLFxyXG4gICAgY29sb3I6ICcjMDAwMDAwJyxcclxuICAgIG1hcmdpbjogJzAnLFxyXG4gICAgcGFkZGluZzogJzE2cHggMjBweCcsXHJcbiAgICBiYWNrZ3JvdW5kQ29sb3I6ICcjZjhmOWZhJyxcclxuICAgIGJvcmRlckJvdHRvbTogJzFweCBzb2xpZCAjZTllY2VmJ1xyXG4gIH07XHJcblxyXG4gIGNvbnN0IGxvZ0l0ZW1TdHlsZSA9IHtcclxuICAgIHBhZGRpbmc6ICcxNnB4IDIwcHgnLFxyXG4gICAgYm9yZGVyQm90dG9tOiAnMXB4IHNvbGlkICNmMWYzZjQnXHJcbiAgfTtcclxuXHJcbiAgY29uc3QgbG9nSXRlbU5hbWVTdHlsZSA9IHtcclxuICAgIGZvbnRXZWlnaHQ6ICc2MDAnLFxyXG4gICAgY29sb3I6ICcjMDAwMDAwJyxcclxuICAgIGZvbnRTaXplOiAnMTRweCcsXHJcbiAgICBtYXJnaW5Cb3R0b206ICc0cHgnXHJcbiAgfTtcclxuXHJcbiAgY29uc3QgbG9nSXRlbUFjdGlvblN0eWxlID0ge1xyXG4gICAgY29sb3I6ICcjMDAwMDAwJyxcclxuICAgIGZvbnRTaXplOiAnMTNweCcsXHJcbiAgICBtYXJnaW5Cb3R0b206ICc0cHgnLFxyXG4gICAgb3BhY2l0eTogJzAuOCdcclxuICB9O1xyXG5cclxuICBjb25zdCBsb2dJdGVtVGltZVN0eWxlID0ge1xyXG4gICAgZm9udFNpemU6ICcxMnB4JyxcclxuICAgIGNvbG9yOiAnIzAwMDAwMCcsXHJcbiAgICBvcGFjaXR5OiAnMC42J1xyXG4gIH07XHJcblxyXG4gIGNvbnN0IGVtcHR5U3RhdGVTdHlsZSA9IHtcclxuICAgIHRleHRBbGlnbjogJ2NlbnRlcicsXHJcbiAgICBjb2xvcjogJyMwMDAwMDAnLFxyXG4gICAgb3BhY2l0eTogJzAuNicsXHJcbiAgICBmb250U3R5bGU6ICdpdGFsaWMnLFxyXG4gICAgcGFkZGluZzogJzMwcHggMjBweCdcclxuICB9O1xyXG5cclxuICByZXR1cm4gKFxyXG4gICAgPGRpdiBzdHlsZT17Y29udGFpbmVyU3R5bGV9PlxyXG4gICAgICA8ZGl2IHN0eWxlPXtoZWFkZXJTdHlsZX0+XHJcbiA8aDEgc3R5bGU9e3sgZm9udFNpemU6IFwiMS41cmVtXCIsIGZvbnRXZWlnaHQ6IFwiYm9sZFwiLCBtYXJnaW46IDAsIGNvbG9yOiBcIiMxZTI5M2JcIiB9fT5cclxuICAgICAgQWRtaW4gRGFzaGJvYXJkXHJcbiAgICA8L2gxPiAgICAgICAgPGJ1dHRvbiBcclxuICAgICAgICAgIG9uQ2xpY2s9e2hhbmRsZVJlZnJlc2h9IFxyXG4gICAgICAgICAgc3R5bGU9e3JlZnJlc2hCdXR0b25TdHlsZX1cclxuICAgICAgICAgIG9uTW91c2VPdmVyPXsoZSkgPT4gZS50YXJnZXQuc3R5bGUuYmFja2dyb3VuZENvbG9yID0gJyNlOWVjZWYnfVxyXG4gICAgICAgICAgb25Nb3VzZU91dD17KGUpID0+IGUudGFyZ2V0LnN0eWxlLmJhY2tncm91bmRDb2xvciA9ICcjZjhmOWZhJ31cclxuICAgICAgICAgIHRpdGxlPVwiUmVmcmVzaCBEYXNoYm9hcmRcIlxyXG4gICAgICAgID5cclxuICAgICAgICAgIDxzdmcgd2lkdGg9XCIxNlwiIGhlaWdodD1cIjE2XCIgdmlld0JveD1cIjAgMCAyNCAyNFwiIGZpbGw9XCJub25lXCIgc3Ryb2tlPVwiY3VycmVudENvbG9yXCIgc3Ryb2tlV2lkdGg9XCIyXCI+XHJcbiAgICAgICAgICAgIDxwYXRoIGQ9XCJNMyAxMmE5IDkgMCAwIDEgOS05IDkuNzUgOS43NSAwIDAgMSA2Ljc0IDIuNzRMMjEgOFwiLz5cclxuICAgICAgICAgICAgPHBhdGggZD1cIk0yMSAzdjVoLTVcIi8+XHJcbiAgICAgICAgICAgIDxwYXRoIGQ9XCJNMjEgMTJhOSA5IDAgMCAxLTkgOSA5Ljc1IDkuNzUgMCAwIDEtNi43NC0yLjc0TDMgMTZcIi8+XHJcbiAgICAgICAgICAgIDxwYXRoIGQ9XCJNMyAyMXYtNWg1XCIvPlxyXG4gICAgICAgICAgPC9zdmc+XHJcbiAgICAgICAgPC9idXR0b24+XHJcbiAgICAgIDwvZGl2PlxyXG5cclxuICAgICAgPGRpdiBzdHlsZT17bWV0cmljc0dyaWRTdHlsZX0+XHJcbiAgICAgICAge3N0YXRzQ2FyZHMubWFwKChjYXJkLCBpbmRleCkgPT4gKFxyXG4gICAgICAgICAgPGRpdiBcclxuICAgICAgICAgICAga2V5PXtpbmRleH0gXHJcbiAgICAgICAgICAgIG9uQ2xpY2s9eygpID0+IGhhbmRsZUNhcmRDbGljayhjYXJkLmxpbmspfSBcclxuICAgICAgICAgICAgc3R5bGU9e2NhcmRTdHlsZX1cclxuICAgICAgICAgICAgb25Nb3VzZU92ZXI9eyhlKSA9PiB7XHJcbiAgICAgICAgICAgICAgZS5jdXJyZW50VGFyZ2V0LnN0eWxlLmJvcmRlckNvbG9yID0gY2FyZC5jb2xvcjtcclxuICAgICAgICAgICAgICBlLmN1cnJlbnRUYXJnZXQuc3R5bGUuYm94U2hhZG93ID0gYDAgNHB4IDEycHggJHtjYXJkLmNvbG9yfTIwYDtcclxuICAgICAgICAgICAgfX1cclxuICAgICAgICAgICAgb25Nb3VzZU91dD17KGUpID0+IHtcclxuICAgICAgICAgICAgICBlLmN1cnJlbnRUYXJnZXQuc3R5bGUuYm9yZGVyQ29sb3IgPSAnI2U1ZTdlYic7XHJcbiAgICAgICAgICAgICAgZS5jdXJyZW50VGFyZ2V0LnN0eWxlLmJveFNoYWRvdyA9ICdub25lJztcclxuICAgICAgICAgICAgfX1cclxuICAgICAgICAgID5cclxuICAgICAgICAgICAgPGgzIHN0eWxlPXtjYXJkVGl0bGVTdHlsZX0+e2NhcmQudGl0bGV9PC9oMz5cclxuICAgICAgICAgICAgPHAgc3R5bGU9e2NhcmRWYWx1ZVN0eWxlKCl9PntjYXJkLnZhbHVlfTwvcD5cclxuICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICkpfVxyXG4gICAgICA8L2Rpdj5cclxuXHJcbiAgICAgIDxkaXYgc3R5bGU9e2xvZ3NDb250YWluZXJTdHlsZX0+XHJcbiAgICAgICAgPGRpdiBzdHlsZT17bG9nU2VjdGlvblN0eWxlfT5cclxuICAgICAgICAgIDxoMyBzdHlsZT17bG9nSGVhZGVyU3R5bGV9PkFkbWluIEFjdGl2aXR5ICh7YWRtaW5Mb2dzLmxlbmd0aH0pPC9oMz5cclxuICAgICAgICAgIHthZG1pbkxvZ3MubGVuZ3RoID09PSAwID8gKFxyXG4gICAgICAgICAgICA8ZGl2IHN0eWxlPXtlbXB0eVN0YXRlU3R5bGV9Pk5vIHJlY2VudCBhZG1pbiBhY3Rpdml0eTwvZGl2PlxyXG4gICAgICAgICAgKSA6IChcclxuICAgICAgICAgICAgYWRtaW5Mb2dzLm1hcCgobG9nLCBpKSA9PiAoXHJcbiAgICAgICAgICAgICAgPGRpdiBrZXk9e2xvZy5pZCB8fCBpfSBzdHlsZT17e1xyXG4gICAgICAgICAgICAgICAgLi4ubG9nSXRlbVN0eWxlLFxyXG4gICAgICAgICAgICAgICAgYm9yZGVyQm90dG9tOiBpID09PSBhZG1pbkxvZ3MubGVuZ3RoIC0gMSA/ICdub25lJyA6ICcxcHggc29saWQgI2YzZjRmNidcclxuICAgICAgICAgICAgICB9fT5cclxuICAgICAgICAgICAgICAgIDxkaXYgc3R5bGU9e2xvZ0l0ZW1OYW1lU3R5bGV9PlxyXG4gICAgICAgICAgICAgICAgICB7bG9nLmZpcnN0X25hbWV9IHtsb2cubGFzdF9uYW1lfVxyXG4gICAgICAgICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgICAgICAgICA8ZGl2IHN0eWxlPXtsb2dJdGVtQWN0aW9uU3R5bGV9Pntsb2cuYWN0aW9ufTwvZGl2PlxyXG4gICAgICAgICAgICAgICAgPGRpdiBzdHlsZT17bG9nSXRlbVRpbWVTdHlsZX0+XHJcbiAgICAgICAgICAgICAgICAgIHtnZXRUaW1lQWdvKGxvZy5jcmVhdGVkX2F0KX1cclxuICAgICAgICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICAgICApKVxyXG4gICAgICAgICAgKX1cclxuICAgICAgICA8L2Rpdj5cclxuXHJcbiAgICAgICAgPGRpdiBzdHlsZT17bG9nU2VjdGlvblN0eWxlfT5cclxuICAgICAgICAgIDxoMyBzdHlsZT17bG9nSGVhZGVyU3R5bGV9PlVzZXIgQWN0aXZpdHkgKHt1c2VyTG9ncy5sZW5ndGh9KTwvaDM+XHJcbiAgICAgICAgICB7dXNlckxvZ3MubGVuZ3RoID09PSAwID8gKFxyXG4gICAgICAgICAgICA8ZGl2IHN0eWxlPXtlbXB0eVN0YXRlU3R5bGV9Pk5vIHJlY2VudCB1c2VyIGFjdGl2aXR5PC9kaXY+XHJcbiAgICAgICAgICApIDogKFxyXG4gICAgICAgICAgICB1c2VyTG9ncy5tYXAoKGxvZywgaSkgPT4gKFxyXG4gICAgICAgICAgICAgIDxkaXYga2V5PXtsb2cuaWQgfHwgaX0gc3R5bGU9e3tcclxuICAgICAgICAgICAgICAgIC4uLmxvZ0l0ZW1TdHlsZSxcclxuICAgICAgICAgICAgICAgIGJvcmRlckJvdHRvbTogaSA9PT0gdXNlckxvZ3MubGVuZ3RoIC0gMSA/ICdub25lJyA6ICcxcHggc29saWQgI2YzZjRmNidcclxuICAgICAgICAgICAgICB9fT5cclxuICAgICAgICAgICAgICAgIDxkaXYgc3R5bGU9e2xvZ0l0ZW1OYW1lU3R5bGV9PlxyXG4gICAgICAgICAgICAgICAgICB7bG9nLmZpcnN0X25hbWV9IHtsb2cubGFzdF9uYW1lfVxyXG4gICAgICAgICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgICAgICAgICA8ZGl2IHN0eWxlPXtsb2dJdGVtQWN0aW9uU3R5bGV9Pntsb2cuYWN0aW9ufTwvZGl2PlxyXG4gICAgICAgICAgICAgICAgPGRpdiBzdHlsZT17bG9nSXRlbVRpbWVTdHlsZX0+XHJcbiAgICAgICAgICAgICAgICAgIHtnZXRUaW1lQWdvKGxvZy5jcmVhdGVkX2F0KX1cclxuICAgICAgICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICAgICApKVxyXG4gICAgICAgICAgKX1cclxuICAgICAgICA8L2Rpdj5cclxuICAgICAgPC9kaXY+XHJcbiAgICA8L2Rpdj5cclxuICApO1xyXG59IiwiLy8gQWRtaW4vY29tcG9uZW50cy9BbmFseXRpY3MuanN4XHJcbmltcG9ydCBSZWFjdCwgeyB1c2VTdGF0ZSwgdXNlRWZmZWN0IH0gZnJvbSBcInJlYWN0XCI7XHJcbmltcG9ydCB7IEFwaUNsaWVudCB9IGZyb20gXCJhZG1pbmpzXCI7XHJcblxyXG5jb25zdCBhcGkgPSBuZXcgQXBpQ2xpZW50KCk7XHJcblxyXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBBbmFseXRpY3MoKSB7XHJcbiAgY29uc3QgW2FjdGl2ZVRhYiwgc2V0QWN0aXZlVGFiXSA9IHVzZVN0YXRlKCdvdmVydmlldycpO1xyXG4gIGNvbnN0IFtkYXRlUmFuZ2UsIHNldERhdGVSYW5nZV0gPSB1c2VTdGF0ZSgnMzBkJyk7XHJcbiAgY29uc3QgW2xvYWRpbmcsIHNldExvYWRpbmddID0gdXNlU3RhdGUoZmFsc2UpO1xyXG4gIGNvbnN0IFtlcnJvciwgc2V0RXJyb3JdID0gdXNlU3RhdGUobnVsbCk7XHJcbiAgY29uc3QgW2RhdGEsIHNldERhdGFdID0gdXNlU3RhdGUobnVsbCk7XHJcblxyXG4gIGNvbnN0IGZldGNoQW5hbHl0aWNzRGF0YSA9IGFzeW5jICgpID0+IHtcclxuICAgIHNldExvYWRpbmcodHJ1ZSk7XHJcbiAgICBzZXRFcnJvcihudWxsKTtcclxuICAgIFxyXG4gICAgdHJ5IHtcclxuICAgICAgY29uc3QgcmVzcG9uc2UgPSBhd2FpdCBmZXRjaChgL2FwaS9hZG1pbi9hbmFseXRpY3M/cmFuZ2U9JHtkYXRlUmFuZ2V9YCk7XHJcbiAgICAgIFxyXG4gICAgICBpZiAoIXJlc3BvbnNlLm9rKSB7XHJcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdGYWlsZWQgdG8gZmV0Y2ggYW5hbHl0aWNzIGRhdGEnKTtcclxuICAgICAgfVxyXG4gICAgICBcclxuICAgICAgY29uc3QgYW5hbHl0aWNzRGF0YSA9IGF3YWl0IHJlc3BvbnNlLmpzb24oKTtcclxuICAgICAgc2V0RGF0YShhbmFseXRpY3NEYXRhKTtcclxuICAgIH0gY2F0Y2ggKGVycikge1xyXG4gICAgICBjb25zb2xlLmVycm9yKCdBbmFseXRpY3MgZmV0Y2ggZXJyb3I6JywgZXJyKTtcclxuICAgICAgc2V0RXJyb3IoJ0ZhaWxlZCB0byBsb2FkIGFuYWx5dGljcyBkYXRhJyk7XHJcbiAgICAgIHNldERhdGEoe1xyXG4gICAgICAgIG92ZXJ2aWV3OiB7fSxcclxuICAgICAgICBhcHBvaW50bWVudHM6IHsgb3ZlcnZpZXc6IHt9LCBhcHBvaW50bWVudFN0YXRzOiBbXSwgdG9wRnJlZWxhbmNlcnM6IFtdLCByZWNlbnRBcHBvaW50bWVudHM6IFtdIH0sXHJcbiAgICAgICAgdXNlcnM6IHsgb3ZlcnZpZXc6IHt9LCB1c2VyR3Jvd3RoOiBbXSwgdXNlckRpc3RyaWJ1dGlvbjogW10sIHJlY2VudFVzZXJzOiBbXSB9LFxyXG4gICAgICAgIHByb2plY3RTdGF0czogeyBieVN0YXR1czogW10gfSxcclxuICAgICAgfSk7XHJcbiAgICB9IGZpbmFsbHkge1xyXG4gICAgICBzZXRMb2FkaW5nKGZhbHNlKTtcclxuICAgIH1cclxuICB9O1xyXG5cclxuICB1c2VFZmZlY3QoKCkgPT4ge1xyXG4gICAgZmV0Y2hBbmFseXRpY3NEYXRhKCk7XHJcbiAgfSwgW2RhdGVSYW5nZV0pO1xyXG5cclxuICBjb25zdCBmb3JtYXRDdXJyZW5jeSA9IChhbW91bnQpID0+IHtcclxuICAgIHJldHVybiBuZXcgSW50bC5OdW1iZXJGb3JtYXQoJ2VuLVVTJywge1xyXG4gICAgICBzdHlsZTogJ2N1cnJlbmN5JyxcclxuICAgICAgY3VycmVuY3k6ICdVU0QnXHJcbiAgICB9KS5mb3JtYXQoYW1vdW50IHx8IDApO1xyXG4gIH07XHJcblxyXG4gIGNvbnN0IGZvcm1hdERhdGUgPSAoZGF0ZVN0cmluZykgPT4ge1xyXG4gICAgcmV0dXJuIG5ldyBEYXRlKGRhdGVTdHJpbmcpLnRvTG9jYWxlRGF0ZVN0cmluZygnZW4tVVMnLCB7XHJcbiAgICAgIG1vbnRoOiAnc2hvcnQnLFxyXG4gICAgICBkYXk6ICdudW1lcmljJ1xyXG4gICAgfSk7XHJcbiAgfTtcclxuXHJcbiAgY29uc3QgZm9ybWF0UGVyY2VudGFnZSA9ICh2YWx1ZSkgPT4ge1xyXG4gICAgcmV0dXJuIGAkeyh2YWx1ZSB8fCAwKS50b0ZpeGVkKDEpfSVgO1xyXG4gIH07XHJcblxyXG4gIGlmIChsb2FkaW5nKSB7XHJcbiAgICByZXR1cm4gKFxyXG4gICAgICA8ZGl2IHN0eWxlPXt7IFxyXG4gICAgICAgIGRpc3BsYXk6ICdmbGV4JywgXHJcbiAgICAgICAganVzdGlmeUNvbnRlbnQ6ICdjZW50ZXInLCBcclxuICAgICAgICBhbGlnbkl0ZW1zOiAnY2VudGVyJywgXHJcbiAgICAgICAgbWluSGVpZ2h0OiAnNDAwcHgnLFxyXG4gICAgICAgIGZvbnRGYW1pbHk6ICctYXBwbGUtc3lzdGVtLCBCbGlua01hY1N5c3RlbUZvbnQsIFwiU2Vnb2UgVUlcIiwgUm9ib3RvLCBzYW5zLXNlcmlmJ1xyXG4gICAgICB9fT5cclxuICAgICAgICA8ZGl2IHN0eWxlPXt7IHRleHRBbGlnbjogJ2NlbnRlcicgfX0+XHJcbiAgICAgICAgICA8ZGl2IHN0eWxlPXt7XHJcbiAgICAgICAgICAgIHdpZHRoOiAnNDBweCcsXHJcbiAgICAgICAgICAgIGhlaWdodDogJzQwcHgnLFxyXG4gICAgICAgICAgICBib3JkZXI6ICc0cHggc29saWQgI2U1ZTdlYicsXHJcbiAgICAgICAgICAgIGJvcmRlclRvcDogJzRweCBzb2xpZCAjM2I4MmY2JyxcclxuICAgICAgICAgICAgYm9yZGVyUmFkaXVzOiAnNTAlJyxcclxuICAgICAgICAgICAgYW5pbWF0aW9uOiAnc3BpbiAxcyBsaW5lYXIgaW5maW5pdGUnLFxyXG4gICAgICAgICAgICBtYXJnaW46ICcwIGF1dG8gMTZweCdcclxuICAgICAgICAgIH19PjwvZGl2PlxyXG4gICAgICAgICAgPHAgc3R5bGU9e3sgY29sb3I6ICcjNmI3MjgwJyB9fT5Mb2FkaW5nIGFuYWx5dGljcy4uLjwvcD5cclxuICAgICAgICAgIDxzdHlsZT57YFxyXG4gICAgICAgICAgICBAa2V5ZnJhbWVzIHNwaW4ge1xyXG4gICAgICAgICAgICAgIDAlIHsgdHJhbnNmb3JtOiByb3RhdGUoMGRlZyk7IH1cclxuICAgICAgICAgICAgICAxMDAlIHsgdHJhbnNmb3JtOiByb3RhdGUoMzYwZGVnKTsgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICBgfTwvc3R5bGU+XHJcbiAgICAgICAgPC9kaXY+XHJcbiAgICAgIDwvZGl2PlxyXG4gICAgKTtcclxuICB9XHJcblxyXG4gIHJldHVybiAoXHJcbiAgICA8ZGl2IHN0eWxlPXt7IFxyXG4gICAgICBwYWRkaW5nOiAnMjRweCcsIFxyXG4gICAgICBmb250RmFtaWx5OiAnLWFwcGxlLXN5c3RlbSwgQmxpbmtNYWNTeXN0ZW1Gb250LCBcIlNlZ29lIFVJXCIsIFJvYm90bywgc2Fucy1zZXJpZicsXHJcbiAgICAgIGJhY2tncm91bmRDb2xvcjogJyNmOGZhZmMnLFxyXG4gICAgICBtaW5IZWlnaHQ6ICcxMDB2aCdcclxuICAgIH19PlxyXG4gICAgICB7LyogSGVhZGVyICovfVxyXG4gICAgICA8ZGl2IHN0eWxlPXt7IG1hcmdpbkJvdHRvbTogJzMycHgnIH19PlxyXG4gICAgICAgIDxkaXYgc3R5bGU9e3sgXHJcbiAgICAgICAgICBkaXNwbGF5OiAnZmxleCcsIFxyXG4gICAgICAgICAganVzdGlmeUNvbnRlbnQ6ICdzcGFjZS1iZXR3ZWVuJywgXHJcbiAgICAgICAgICBhbGlnbkl0ZW1zOiAnY2VudGVyJyxcclxuICAgICAgICAgIG1hcmdpbkJvdHRvbTogJzI0cHgnXHJcbiAgICAgICAgfX0+XHJcbiAgICAgICAgICA8ZGl2PlxyXG4gICAgICAgICAgICA8aDEgc3R5bGU9e3sgXHJcbiAgICAgICAgICAgICAgbWFyZ2luOiAnMCAwIDhweCAwJywgXHJcbiAgICAgICAgICAgICAgZm9udFNpemU6ICcyOHB4JywgXHJcbiAgICAgICAgICAgICAgZm9udFdlaWdodDogJzcwMCcsXHJcbiAgICAgICAgICAgICAgY29sb3I6ICcjMWUyOTNiJ1xyXG4gICAgICAgICAgICB9fT5cclxuICAgICAgICAgICAgICBBbmFseXRpY3MgRGFzaGJvYXJkXHJcbiAgICAgICAgICAgIDwvaDE+XHJcbiAgICAgICAgICAgIDxwIHN0eWxlPXt7IG1hcmdpbjogJzAnLCBjb2xvcjogJyM2NDc0OGInLCBmb250U2l6ZTogJzE2cHgnIH19PlxyXG4gICAgICAgICAgICAgIENvbXByZWhlbnNpdmUgYnVzaW5lc3MgaW5zaWdodHMgYW5kIG1ldHJpY3NcclxuICAgICAgICAgICAgPC9wPlxyXG4gICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgICBcclxuICAgICAgICAgIDxkaXYgc3R5bGU9e3sgZGlzcGxheTogJ2ZsZXgnLCBnYXA6ICcxMnB4JywgYWxpZ25JdGVtczogJ2NlbnRlcicgfX0+XHJcbiAgICAgICAgICAgIDxzZWxlY3RcclxuICAgICAgICAgICAgICB2YWx1ZT17ZGF0ZVJhbmdlfVxyXG4gICAgICAgICAgICAgIG9uQ2hhbmdlPXsoZSkgPT4gc2V0RGF0ZVJhbmdlKGUudGFyZ2V0LnZhbHVlKX1cclxuICAgICAgICAgICAgICBzdHlsZT17e1xyXG4gICAgICAgICAgICAgICAgcGFkZGluZzogJzhweCAxMnB4JyxcclxuICAgICAgICAgICAgICAgIGJvcmRlcjogJzFweCBzb2xpZCAjZDFkNWRiJyxcclxuICAgICAgICAgICAgICAgIGJvcmRlclJhZGl1czogJzhweCcsXHJcbiAgICAgICAgICAgICAgICBmb250U2l6ZTogJzE0cHgnLFxyXG4gICAgICAgICAgICAgICAgYmFja2dyb3VuZENvbG9yOiAnd2hpdGUnLFxyXG4gICAgICAgICAgICAgICAgY3Vyc29yOiAncG9pbnRlcidcclxuICAgICAgICAgICAgICB9fVxyXG4gICAgICAgICAgICA+XHJcbiAgICAgICAgICAgICAgPG9wdGlvbiB2YWx1ZT1cIjdkXCI+NyBEYXlzPC9vcHRpb24+XHJcbiAgICAgICAgICAgICAgPG9wdGlvbiB2YWx1ZT1cIjMwZFwiPjMwIERheXM8L29wdGlvbj5cclxuICAgICAgICAgICAgICA8b3B0aW9uIHZhbHVlPVwiOTBkXCI+OTAgRGF5czwvb3B0aW9uPlxyXG4gICAgICAgICAgICAgIDxvcHRpb24gdmFsdWU9XCIxeVwiPjEgWWVhcjwvb3B0aW9uPlxyXG4gICAgICAgICAgICA8L3NlbGVjdD5cclxuICAgICAgICAgICAgXHJcbiAgICAgICAgICAgIDxidXR0b25cclxuICAgICAgICAgICAgICBvbkNsaWNrPXtmZXRjaEFuYWx5dGljc0RhdGF9XHJcbiAgICAgICAgICAgICAgc3R5bGU9e3tcclxuICAgICAgICAgICAgICAgIHBhZGRpbmc6ICc4cHggMTZweCcsXHJcbiAgICAgICAgICAgICAgICBiYWNrZ3JvdW5kQ29sb3I6ICcjM2I4MmY2JyxcclxuICAgICAgICAgICAgICAgIGNvbG9yOiAnd2hpdGUnLFxyXG4gICAgICAgICAgICAgICAgYm9yZGVyOiAnbm9uZScsXHJcbiAgICAgICAgICAgICAgICBib3JkZXJSYWRpdXM6ICc4cHgnLFxyXG4gICAgICAgICAgICAgICAgY3Vyc29yOiAncG9pbnRlcicsXHJcbiAgICAgICAgICAgICAgICBmb250U2l6ZTogJzE0cHgnLFxyXG4gICAgICAgICAgICAgICAgZm9udFdlaWdodDogJzUwMCdcclxuICAgICAgICAgICAgICB9fVxyXG4gICAgICAgICAgICA+XHJcbiAgICAgICAgICAgICAgUmVmcmVzaFxyXG4gICAgICAgICAgICA8L2J1dHRvbj5cclxuICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgIDwvZGl2PlxyXG5cclxuICAgICAgICB7ZXJyb3IgJiYgKFxyXG4gICAgICAgICAgPGRpdiBzdHlsZT17e1xyXG4gICAgICAgICAgICBwYWRkaW5nOiAnMTJweCAxNnB4JyxcclxuICAgICAgICAgICAgYmFja2dyb3VuZENvbG9yOiAnI2ZlZTJlMicsXHJcbiAgICAgICAgICAgIGJvcmRlcjogJzFweCBzb2xpZCAjZmVjYWNhJyxcclxuICAgICAgICAgICAgYm9yZGVyUmFkaXVzOiAnOHB4JyxcclxuICAgICAgICAgICAgY29sb3I6ICcjOTkxYjFiJyxcclxuICAgICAgICAgICAgbWFyZ2luQm90dG9tOiAnMjRweCcsXHJcbiAgICAgICAgICAgIGZvbnRTaXplOiAnMTRweCdcclxuICAgICAgICAgIH19PlxyXG4gICAgICAgICAgICB7ZXJyb3J9XHJcbiAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICApfVxyXG5cclxuICAgICAgICA8ZGl2IHN0eWxlPXt7IGJvcmRlckJvdHRvbTogJzFweCBzb2xpZCAjZTVlN2ViJyB9fT5cclxuICAgICAgICAgIDxkaXYgc3R5bGU9e3sgZGlzcGxheTogJ2ZsZXgnLCBnYXA6ICczMnB4JyB9fT5cclxuICAgICAgICAgICAge1tcclxuICAgICAgICAgICAgICB7IGlkOiAnb3ZlcnZpZXcnLCBsYWJlbDogJ092ZXJ2aWV3JyB9LFxyXG4gICAgICAgICAgICAgIHsgaWQ6ICdhcHBvaW50bWVudHMnLCBsYWJlbDogJ0FwcG9pbnRtZW50cycgfSxcclxuICAgICAgICAgICAgICB7IGlkOiAndXNlcnMnLCBsYWJlbDogJ1VzZXJzJyB9LFxyXG4gICAgICAgICAgICAgIHsgaWQ6ICdwcm9qZWN0cycsIGxhYmVsOiAnUHJvamVjdHMnIH0sXHJcbiAgICAgICAgICAgICAgeyBpZDogJ2ZpbmFuY2lhbCcsIGxhYmVsOiAnRmluYW5jaWFsJyB9XHJcbiAgICAgICAgICAgIF0ubWFwKHRhYiA9PiAoXHJcbiAgICAgICAgICAgICAgPGJ1dHRvblxyXG4gICAgICAgICAgICAgICAga2V5PXt0YWIuaWR9XHJcbiAgICAgICAgICAgICAgICBvbkNsaWNrPXsoKSA9PiBzZXRBY3RpdmVUYWIodGFiLmlkKX1cclxuICAgICAgICAgICAgICAgIHN0eWxlPXt7XHJcbiAgICAgICAgICAgICAgICAgIHBhZGRpbmc6ICcxMnB4IDAnLFxyXG4gICAgICAgICAgICAgICAgICBib3JkZXI6ICdub25lJyxcclxuICAgICAgICAgICAgICAgICAgYmFja2dyb3VuZDogJ25vbmUnLFxyXG4gICAgICAgICAgICAgICAgICBmb250U2l6ZTogJzE0cHgnLFxyXG4gICAgICAgICAgICAgICAgICBmb250V2VpZ2h0OiAnNTAwJyxcclxuICAgICAgICAgICAgICAgICAgY29sb3I6IGFjdGl2ZVRhYiA9PT0gdGFiLmlkID8gJyMzYjgyZjYnIDogJyM2YjcyODAnLFxyXG4gICAgICAgICAgICAgICAgICBib3JkZXJCb3R0b206IGFjdGl2ZVRhYiA9PT0gdGFiLmlkID8gJzJweCBzb2xpZCAjM2I4MmY2JyA6ICcycHggc29saWQgdHJhbnNwYXJlbnQnLFxyXG4gICAgICAgICAgICAgICAgICBjdXJzb3I6ICdwb2ludGVyJyxcclxuICAgICAgICAgICAgICAgICAgdHJhbnNpdGlvbjogJ2FsbCAwLjJzJ1xyXG4gICAgICAgICAgICAgICAgfX1cclxuICAgICAgICAgICAgICA+XHJcbiAgICAgICAgICAgICAgICB7dGFiLmxhYmVsfVxyXG4gICAgICAgICAgICAgIDwvYnV0dG9uPlxyXG4gICAgICAgICAgICApKX1cclxuICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgIDwvZGl2PlxyXG4gICAgICA8L2Rpdj5cclxuXHJcbiAgICAgIDxkaXYgc3R5bGU9e3sgbWluSGVpZ2h0OiAnNDAwcHgnIH19PlxyXG4gICAgICAgIHthY3RpdmVUYWIgPT09ICdvdmVydmlldycgJiYgKFxyXG4gICAgICAgICAgPGRpdj5cclxuICAgICAgICAgICAgPGRpdiBzdHlsZT17eyBcclxuICAgICAgICAgICAgICBkaXNwbGF5OiAnZ3JpZCcsIFxyXG4gICAgICAgICAgICAgIGdyaWRUZW1wbGF0ZUNvbHVtbnM6ICdyZXBlYXQoYXV0by1maXQsIG1pbm1heCgyNDBweCwgMWZyKSknLCBcclxuICAgICAgICAgICAgICBnYXA6ICcyMHB4JyxcclxuICAgICAgICAgICAgICBtYXJnaW5Cb3R0b206ICczMnB4J1xyXG4gICAgICAgICAgICB9fT5cclxuICAgICAgICAgICAgICA8ZGl2IHN0eWxlPXt7XHJcbiAgICAgICAgICAgICAgICBwYWRkaW5nOiAnMjRweCcsXHJcbiAgICAgICAgICAgICAgICBiYWNrZ3JvdW5kQ29sb3I6ICd3aGl0ZScsXHJcbiAgICAgICAgICAgICAgICBib3JkZXJSYWRpdXM6ICcxMnB4JyxcclxuICAgICAgICAgICAgICAgIGJveFNoYWRvdzogJzAgMXB4IDNweCByZ2JhKDAsMCwwLDAuMSknLFxyXG4gICAgICAgICAgICAgICAgYm9yZGVyOiAnMXB4IHNvbGlkICNlNWU3ZWInXHJcbiAgICAgICAgICAgICAgfX0+XHJcbiAgICAgICAgICAgICAgICA8ZGl2IHN0eWxlPXt7IGRpc3BsYXk6ICdmbGV4JywgYWxpZ25JdGVtczogJ2NlbnRlcicsIGp1c3RpZnlDb250ZW50OiAnc3BhY2UtYmV0d2VlbicgfX0+XHJcbiAgICAgICAgICAgICAgICAgIDxkaXY+XHJcbiAgICAgICAgICAgICAgICAgICAgPGRpdiBzdHlsZT17eyBtYXJnaW5Cb3R0b206ICc4cHgnLCBmb250U2l6ZTogJzE0cHgnLCBjb2xvcjogJyM2YjcyODAnLCBmb250V2VpZ2h0OiAnNTAwJyB9fT5cclxuICAgICAgICAgICAgICAgICAgICAgIFRvdGFsIFVzZXJzXHJcbiAgICAgICAgICAgICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgICAgICAgICAgICAgPGRpdiBzdHlsZT17eyBmb250U2l6ZTogJzI4cHgnLCBmb250V2VpZ2h0OiAnNzAwJywgY29sb3I6ICcjMWUyOTNiJyB9fT5cclxuICAgICAgICAgICAgICAgICAgICAgIHsoZGF0YT8ub3ZlcnZpZXc/LnRvdGFsVXNlcnMgfHwgMCkudG9Mb2NhbGVTdHJpbmcoKX1cclxuICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgICAgICAgICAgICA8ZGl2IHN0eWxlPXt7IGZvbnRTaXplOiAnMTJweCcsIGNvbG9yOiAnIzEwYjk4MScsIG1hcmdpblRvcDogJzRweCcsIGZvbnRXZWlnaHQ6ICc1MDAnIH19PlxyXG4gICAgICAgICAgICAgICAgICAgICAgK3tkYXRhPy5vdmVydmlldz8ubmV3VXNlcnNUb2RheSB8fCAwfSB0b2RheVxyXG4gICAgICAgICAgICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgICAgICAgICAgPGRpdiBzdHlsZT17eyBcclxuICAgICAgICAgICAgICAgICAgICBwYWRkaW5nOiAnMTJweCcsIFxyXG4gICAgICAgICAgICAgICAgICAgIGJhY2tncm91bmRDb2xvcjogJyNkYmVhZmUnLCBcclxuICAgICAgICAgICAgICAgICAgICBib3JkZXJSYWRpdXM6ICcxMnB4JyxcclxuICAgICAgICAgICAgICAgICAgICBmb250U2l6ZTogJzI0cHgnXHJcbiAgICAgICAgICAgICAgICAgIH19PlxyXG4gICAgICAgICAgICAgICAgICAgIPCfkaVcclxuICAgICAgICAgICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgICAgICA8L2Rpdj5cclxuXHJcbiAgICAgICAgICAgICAgPGRpdiBzdHlsZT17e1xyXG4gICAgICAgICAgICAgICAgcGFkZGluZzogJzI0cHgnLFxyXG4gICAgICAgICAgICAgICAgYmFja2dyb3VuZENvbG9yOiAnd2hpdGUnLFxyXG4gICAgICAgICAgICAgICAgYm9yZGVyUmFkaXVzOiAnMTJweCcsXHJcbiAgICAgICAgICAgICAgICBib3hTaGFkb3c6ICcwIDFweCAzcHggcmdiYSgwLDAsMCwwLjEpJyxcclxuICAgICAgICAgICAgICAgIGJvcmRlcjogJzFweCBzb2xpZCAjZTVlN2ViJ1xyXG4gICAgICAgICAgICAgIH19PlxyXG4gICAgICAgICAgICAgICAgPGRpdiBzdHlsZT17eyBkaXNwbGF5OiAnZmxleCcsIGFsaWduSXRlbXM6ICdjZW50ZXInLCBqdXN0aWZ5Q29udGVudDogJ3NwYWNlLWJldHdlZW4nIH19PlxyXG4gICAgICAgICAgICAgICAgICA8ZGl2PlxyXG4gICAgICAgICAgICAgICAgICAgIDxkaXYgc3R5bGU9e3sgbWFyZ2luQm90dG9tOiAnOHB4JywgZm9udFNpemU6ICcxNHB4JywgY29sb3I6ICcjNmI3MjgwJywgZm9udFdlaWdodDogJzUwMCcgfX0+XHJcbiAgICAgICAgICAgICAgICAgICAgICBUb3RhbCBBcHBvaW50bWVudHNcclxuICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgICAgICAgICAgICA8ZGl2IHN0eWxlPXt7IGZvbnRTaXplOiAnMjhweCcsIGZvbnRXZWlnaHQ6ICc3MDAnLCBjb2xvcjogJyMxZTI5M2InIH19PlxyXG4gICAgICAgICAgICAgICAgICAgICAgeyhkYXRhPy5hcHBvaW50bWVudHM/Lm92ZXJ2aWV3Py50b3RhbEFwcG9pbnRtZW50cyB8fCAwKS50b0xvY2FsZVN0cmluZygpfVxyXG4gICAgICAgICAgICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICAgICAgICAgICAgIDxkaXYgc3R5bGU9e3sgZm9udFNpemU6ICcxMnB4JywgY29sb3I6ICcjMTBiOTgxJywgbWFyZ2luVG9wOiAnNHB4JywgZm9udFdlaWdodDogJzUwMCcgfX0+XHJcbiAgICAgICAgICAgICAgICAgICAgICB7ZGF0YT8uYXBwb2ludG1lbnRzPy5vdmVydmlldz8uYXBwb2ludG1lbnRzVG9kYXkgfHwgMH0gdG9kYXlcclxuICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgICAgICAgICAgIDxkaXYgc3R5bGU9e3sgXHJcbiAgICAgICAgICAgICAgICAgICAgcGFkZGluZzogJzEycHgnLCBcclxuICAgICAgICAgICAgICAgICAgICBiYWNrZ3JvdW5kQ29sb3I6ICcjZGNmY2U3JywgXHJcbiAgICAgICAgICAgICAgICAgICAgYm9yZGVyUmFkaXVzOiAnMTJweCcsXHJcbiAgICAgICAgICAgICAgICAgICAgZm9udFNpemU6ICcyNHB4J1xyXG4gICAgICAgICAgICAgICAgICB9fT5cclxuICAgICAgICAgICAgICAgICAgICDwn5OFXHJcbiAgICAgICAgICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgICAgICAgPC9kaXY+XHJcblxyXG4gICAgICAgICAgICAgIDxkaXYgc3R5bGU9e3tcclxuICAgICAgICAgICAgICAgIHBhZGRpbmc6ICcyNHB4JyxcclxuICAgICAgICAgICAgICAgIGJhY2tncm91bmRDb2xvcjogJ3doaXRlJyxcclxuICAgICAgICAgICAgICAgIGJvcmRlclJhZGl1czogJzEycHgnLFxyXG4gICAgICAgICAgICAgICAgYm94U2hhZG93OiAnMCAxcHggM3B4IHJnYmEoMCwwLDAsMC4xKScsXHJcbiAgICAgICAgICAgICAgICBib3JkZXI6ICcxcHggc29saWQgI2U1ZTdlYidcclxuICAgICAgICAgICAgICB9fT5cclxuICAgICAgICAgICAgICAgIDxkaXYgc3R5bGU9e3sgZGlzcGxheTogJ2ZsZXgnLCBhbGlnbkl0ZW1zOiAnY2VudGVyJywganVzdGlmeUNvbnRlbnQ6ICdzcGFjZS1iZXR3ZWVuJyB9fT5cclxuICAgICAgICAgICAgICAgICAgPGRpdj5cclxuICAgICAgICAgICAgICAgICAgICA8ZGl2IHN0eWxlPXt7IG1hcmdpbkJvdHRvbTogJzhweCcsIGZvbnRTaXplOiAnMTRweCcsIGNvbG9yOiAnIzZiNzI4MCcsIGZvbnRXZWlnaHQ6ICc1MDAnIH19PlxyXG4gICAgICAgICAgICAgICAgICAgICAgQWN0aXZlIFByb2plY3RzXHJcbiAgICAgICAgICAgICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgICAgICAgICAgICAgPGRpdiBzdHlsZT17eyBmb250U2l6ZTogJzI4cHgnLCBmb250V2VpZ2h0OiAnNzAwJywgY29sb3I6ICcjMWUyOTNiJyB9fT5cclxuICAgICAgICAgICAgICAgICAgICAgIHsoZGF0YT8ub3ZlcnZpZXc/LmFjdGl2ZVByb2plY3RzIHx8IDApLnRvTG9jYWxlU3RyaW5nKCl9XHJcbiAgICAgICAgICAgICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgICAgICAgICAgICAgPGRpdiBzdHlsZT17eyBmb250U2l6ZTogJzEycHgnLCBjb2xvcjogJyM2YjcyODAnLCBtYXJnaW5Ub3A6ICc0cHgnLCBmb250V2VpZ2h0OiAnNTAwJyB9fT5cclxuICAgICAgICAgICAgICAgICAgICAgIHtkYXRhPy5vdmVydmlldz8uY29tcGxldGVkUHJvamVjdHMgfHwgMH0gY29tcGxldGVkXHJcbiAgICAgICAgICAgICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICAgICAgICAgICA8ZGl2IHN0eWxlPXt7IFxyXG4gICAgICAgICAgICAgICAgICAgIHBhZGRpbmc6ICcxMnB4JywgXHJcbiAgICAgICAgICAgICAgICAgICAgYmFja2dyb3VuZENvbG9yOiAnI2YzZThmZicsIFxyXG4gICAgICAgICAgICAgICAgICAgIGJvcmRlclJhZGl1czogJzEycHgnLFxyXG4gICAgICAgICAgICAgICAgICAgIGZvbnRTaXplOiAnMjRweCdcclxuICAgICAgICAgICAgICAgICAgfX0+XHJcbiAgICAgICAgICAgICAgICAgICAg8J+SvFxyXG4gICAgICAgICAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICAgICAgIDwvZGl2PlxyXG5cclxuICAgICAgICAgICAgICA8ZGl2IHN0eWxlPXt7XHJcbiAgICAgICAgICAgICAgICBwYWRkaW5nOiAnMjRweCcsXHJcbiAgICAgICAgICAgICAgICBiYWNrZ3JvdW5kQ29sb3I6ICd3aGl0ZScsXHJcbiAgICAgICAgICAgICAgICBib3JkZXJSYWRpdXM6ICcxMnB4JyxcclxuICAgICAgICAgICAgICAgIGJveFNoYWRvdzogJzAgMXB4IDNweCByZ2JhKDAsMCwwLDAuMSknLFxyXG4gICAgICAgICAgICAgICAgYm9yZGVyOiAnMXB4IHNvbGlkICNlNWU3ZWInXHJcbiAgICAgICAgICAgICAgfX0+XHJcbiAgICAgICAgICAgICAgICA8ZGl2IHN0eWxlPXt7IGRpc3BsYXk6ICdmbGV4JywgYWxpZ25JdGVtczogJ2NlbnRlcicsIGp1c3RpZnlDb250ZW50OiAnc3BhY2UtYmV0d2VlbicgfX0+XHJcbiAgICAgICAgICAgICAgICAgIDxkaXY+XHJcbiAgICAgICAgICAgICAgICAgICAgPGRpdiBzdHlsZT17eyBtYXJnaW5Cb3R0b206ICc4cHgnLCBmb250U2l6ZTogJzE0cHgnLCBjb2xvcjogJyM2YjcyODAnLCBmb250V2VpZ2h0OiAnNTAwJyB9fT5cclxuICAgICAgICAgICAgICAgICAgICAgIFRvdGFsIFJldmVudWVcclxuICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgICAgICAgICAgICA8ZGl2IHN0eWxlPXt7IGZvbnRTaXplOiAnMjhweCcsIGZvbnRXZWlnaHQ6ICc3MDAnLCBjb2xvcjogJyMxZTI5M2InIH19PlxyXG4gICAgICAgICAgICAgICAgICAgICAge2Zvcm1hdEN1cnJlbmN5KGRhdGE/Lm92ZXJ2aWV3Py50b3RhbFJldmVudWUgfHwgMCl9XHJcbiAgICAgICAgICAgICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgICAgICAgICAgICAgPGRpdiBzdHlsZT17eyBmb250U2l6ZTogJzEycHgnLCBjb2xvcjogJyM2YjcyODAnLCBtYXJnaW5Ub3A6ICc0cHgnLCBmb250V2VpZ2h0OiAnNTAwJyB9fT5cclxuICAgICAgICAgICAgICAgICAgICAgIHtmb3JtYXRDdXJyZW5jeShkYXRhPy5vdmVydmlldz8ubW9udGhseVJldmVudWUgfHwgMCl9IHRoaXMgbW9udGhcclxuICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgICAgICAgICAgIDxkaXYgc3R5bGU9e3sgXHJcbiAgICAgICAgICAgICAgICAgICAgcGFkZGluZzogJzEycHgnLCBcclxuICAgICAgICAgICAgICAgICAgICBiYWNrZ3JvdW5kQ29sb3I6ICcjZmVmM2M3JywgXHJcbiAgICAgICAgICAgICAgICAgICAgYm9yZGVyUmFkaXVzOiAnMTJweCcsXHJcbiAgICAgICAgICAgICAgICAgICAgZm9udFNpemU6ICcyNHB4J1xyXG4gICAgICAgICAgICAgICAgICB9fT5cclxuICAgICAgICAgICAgICAgICAgICDwn5KwXHJcbiAgICAgICAgICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgICAgIDwvZGl2PlxyXG5cclxuICAgICAgICAgICAgPGRpdiBzdHlsZT17e1xyXG4gICAgICAgICAgICAgIGJhY2tncm91bmRDb2xvcjogJ3doaXRlJyxcclxuICAgICAgICAgICAgICBib3JkZXJSYWRpdXM6ICcxMnB4JyxcclxuICAgICAgICAgICAgICBib3hTaGFkb3c6ICcwIDFweCAzcHggcmdiYSgwLDAsMCwwLjEpJyxcclxuICAgICAgICAgICAgICBib3JkZXI6ICcxcHggc29saWQgI2U1ZTdlYicsXHJcbiAgICAgICAgICAgICAgb3ZlcmZsb3c6ICdoaWRkZW4nXHJcbiAgICAgICAgICAgIH19PlxyXG4gICAgICAgICAgICAgIDxkaXYgc3R5bGU9e3sgXHJcbiAgICAgICAgICAgICAgICBwYWRkaW5nOiAnMjBweCAyNHB4JywgXHJcbiAgICAgICAgICAgICAgICBib3JkZXJCb3R0b206ICcxcHggc29saWQgI2U1ZTdlYicsXHJcbiAgICAgICAgICAgICAgICBiYWNrZ3JvdW5kQ29sb3I6ICcjZjhmYWZjJ1xyXG4gICAgICAgICAgICAgIH19PlxyXG4gICAgICAgICAgICAgICAgPGgzIHN0eWxlPXt7IG1hcmdpbjogJzAnLCBmb250U2l6ZTogJzE4cHgnLCBmb250V2VpZ2h0OiAnNjAwJywgY29sb3I6ICcjMWUyOTNiJyB9fT5cclxuICAgICAgICAgICAgICAgICAgUmVjZW50IEFwcG9pbnRtZW50c1xyXG4gICAgICAgICAgICAgICAgPC9oMz5cclxuICAgICAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgICAgICBcclxuICAgICAgICAgICAgICA8ZGl2IHN0eWxlPXt7IG1heEhlaWdodDogJzQwMHB4Jywgb3ZlcmZsb3dZOiAnYXV0bycgfX0+XHJcbiAgICAgICAgICAgICAgICB7ZGF0YT8uYXBwb2ludG1lbnRzPy5yZWNlbnRBcHBvaW50bWVudHM/Lmxlbmd0aCA+IDAgPyAoXHJcbiAgICAgICAgICAgICAgICAgIDx0YWJsZSBzdHlsZT17eyB3aWR0aDogJzEwMCUnLCBib3JkZXJDb2xsYXBzZTogJ2NvbGxhcHNlJyB9fT5cclxuICAgICAgICAgICAgICAgICAgICA8dGhlYWQgc3R5bGU9e3sgYmFja2dyb3VuZENvbG9yOiAnI2Y4ZmFmYycsIHBvc2l0aW9uOiAnc3RpY2t5JywgdG9wOiAwIH19PlxyXG4gICAgICAgICAgICAgICAgICAgICAgPHRyPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICA8dGggc3R5bGU9e3sgdGV4dEFsaWduOiAnbGVmdCcsIHBhZGRpbmc6ICcxMnB4IDI0cHgnLCBmb250U2l6ZTogJzE0cHgnLCBmb250V2VpZ2h0OiAnNjAwJywgY29sb3I6ICcjMzc0MTUxJyB9fT5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICBUeXBlXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIDwvdGg+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIDx0aCBzdHlsZT17eyB0ZXh0QWxpZ246ICdsZWZ0JywgcGFkZGluZzogJzEycHggMjRweCcsIGZvbnRTaXplOiAnMTRweCcsIGZvbnRXZWlnaHQ6ICc2MDAnLCBjb2xvcjogJyMzNzQxNTEnIH19PlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgIFN0YXR1c1xyXG4gICAgICAgICAgICAgICAgICAgICAgICA8L3RoPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICA8dGggc3R5bGU9e3sgdGV4dEFsaWduOiAnbGVmdCcsIHBhZGRpbmc6ICcxMnB4IDI0cHgnLCBmb250U2l6ZTogJzE0cHgnLCBmb250V2VpZ2h0OiAnNjAwJywgY29sb3I6ICcjMzc0MTUxJyB9fT5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICBEYXRlXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIDwvdGg+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIDx0aCBzdHlsZT17eyB0ZXh0QWxpZ246ICdsZWZ0JywgcGFkZGluZzogJzEycHggMjRweCcsIGZvbnRTaXplOiAnMTRweCcsIGZvbnRXZWlnaHQ6ICc2MDAnLCBjb2xvcjogJyMzNzQxNTEnIH19PlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgIEZyZWVsYW5jZXJcclxuICAgICAgICAgICAgICAgICAgICAgICAgPC90aD5cclxuICAgICAgICAgICAgICAgICAgICAgIDwvdHI+XHJcbiAgICAgICAgICAgICAgICAgICAgPC90aGVhZD5cclxuICAgICAgICAgICAgICAgICAgICA8dGJvZHk+XHJcbiAgICAgICAgICAgICAgICAgICAgICB7ZGF0YS5hcHBvaW50bWVudHMucmVjZW50QXBwb2ludG1lbnRzLnNsaWNlKDAsIDEwKS5tYXAoKGFwcG9pbnRtZW50LCBpbmRleCkgPT4gKFxyXG4gICAgICAgICAgICAgICAgICAgICAgICA8dHIga2V5PXtpbmRleH0gc3R5bGU9e3sgXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgYm9yZGVyQm90dG9tOiAnMXB4IHNvbGlkICNmM2Y0ZjYnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgIHRyYW5zaXRpb246ICdiYWNrZ3JvdW5kLWNvbG9yIDAuMnMnXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH19PlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgIDx0ZCBzdHlsZT17eyBwYWRkaW5nOiAnMTZweCAyNHB4JywgZm9udFNpemU6ICcxNHB4JywgZm9udFdlaWdodDogJzUwMCcgfX0+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB7YXBwb2ludG1lbnQuYXBwb2ludG1lbnRfdHlwZSB8fCAnQXBwb2ludG1lbnQnfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgIDwvdGQ+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgPHRkIHN0eWxlPXt7IHBhZGRpbmc6ICcxNnB4IDI0cHgnLCBmb250U2l6ZTogJzE0cHgnIH19PlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPHNwYW4gc3R5bGU9e3tcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcGFkZGluZzogJzRweCAxMnB4JyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYm9yZGVyUmFkaXVzOiAnMjBweCcsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZvbnRTaXplOiAnMTJweCcsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZvbnRXZWlnaHQ6ICc2MDAnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICBiYWNrZ3JvdW5kQ29sb3I6IFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFwcG9pbnRtZW50LnN0YXR1cyA9PT0gJ3BlbmRpbmcnID8gJyNmZWYzYzcnIDpcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhcHBvaW50bWVudC5zdGF0dXMgPT09ICdhY2NlcHRlZCcgPyAnI2RjZmNlNycgOlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFwcG9pbnRtZW50LnN0YXR1cyA9PT0gJ3JlamVjdGVkJyA/ICcjZmVlMmUyJyA6ICcjZjNmNGY2JyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29sb3I6XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYXBwb2ludG1lbnQuc3RhdHVzID09PSAncGVuZGluZycgPyAnIzkyNDAwZScgOlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFwcG9pbnRtZW50LnN0YXR1cyA9PT0gJ2FjY2VwdGVkJyA/ICcjMDY1ZjQ2JyA6XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYXBwb2ludG1lbnQuc3RhdHVzID09PSAncmVqZWN0ZWQnID8gJyM5OTFiMWInIDogJyMzNzQxNTEnXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9fT5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgeyhhcHBvaW50bWVudC5zdGF0dXMgfHwgJ3BlbmRpbmcnKS5jaGFyQXQoMCkudG9VcHBlckNhc2UoKSArIChhcHBvaW50bWVudC5zdGF0dXMgfHwgJ3BlbmRpbmcnKS5zbGljZSgxKX1cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvc3Bhbj5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICA8L3RkPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgIDx0ZCBzdHlsZT17eyBwYWRkaW5nOiAnMTZweCAyNHB4JywgZm9udFNpemU6ICcxNHB4JywgY29sb3I6ICcjNmI3MjgwJyB9fT5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHthcHBvaW50bWVudC5jcmVhdGVkX2F0ID8gZm9ybWF0RGF0ZShhcHBvaW50bWVudC5jcmVhdGVkX2F0KSA6ICctJ31cclxuICAgICAgICAgICAgICAgICAgICAgICAgICA8L3RkPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgIDx0ZCBzdHlsZT17eyBwYWRkaW5nOiAnMTZweCAyNHB4JywgZm9udFNpemU6ICcxNHB4JywgZm9udFdlaWdodDogJzUwMCcgfX0+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB7YXBwb2ludG1lbnQuZnJlZWxhbmNlcl9maXJzdF9uYW1lfSB7YXBwb2ludG1lbnQuZnJlZWxhbmNlcl9sYXN0X25hbWV9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgPC90ZD5cclxuICAgICAgICAgICAgICAgICAgICAgICAgPC90cj5cclxuICAgICAgICAgICAgICAgICAgICAgICkpfVxyXG4gICAgICAgICAgICAgICAgICAgIDwvdGJvZHk+XHJcbiAgICAgICAgICAgICAgICAgIDwvdGFibGU+XHJcbiAgICAgICAgICAgICAgICApIDogKFxyXG4gICAgICAgICAgICAgICAgICA8ZGl2IHN0eWxlPXt7IHRleHRBbGlnbjogJ2NlbnRlcicsIHBhZGRpbmc6ICc0OHB4IDI0cHgnLCBjb2xvcjogJyM2YjcyODAnIH19PlxyXG4gICAgICAgICAgICAgICAgICAgIDxkaXYgc3R5bGU9e3sgZm9udFNpemU6ICc0OHB4JywgbWFyZ2luQm90dG9tOiAnMTZweCcgfX0+8J+ThTwvZGl2PlxyXG4gICAgICAgICAgICAgICAgICAgIDxwIHN0eWxlPXt7IG1hcmdpbjogJzAnLCBmb250U2l6ZTogJzE2cHgnLCBmb250V2VpZ2h0OiAnNTAwJyB9fT5ObyByZWNlbnQgYXBwb2ludG1lbnRzIGZvdW5kPC9wPlxyXG4gICAgICAgICAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgICAgICAgICl9XHJcbiAgICAgICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgKX1cclxuXHJcbiAgICAgICAge2FjdGl2ZVRhYiA9PT0gJ2FwcG9pbnRtZW50cycgJiYgKFxyXG4gICAgICAgICAgPGRpdj5cclxuICAgICAgICAgICAgPGRpdiBzdHlsZT17eyBcclxuICAgICAgICAgICAgICBkaXNwbGF5OiAnZ3JpZCcsIFxyXG4gICAgICAgICAgICAgIGdyaWRUZW1wbGF0ZUNvbHVtbnM6ICdyZXBlYXQoYXV0by1maXQsIG1pbm1heCgyMDBweCwgMWZyKSknLCBcclxuICAgICAgICAgICAgICBnYXA6ICcxNnB4JyxcclxuICAgICAgICAgICAgICBtYXJnaW5Cb3R0b206ICczMnB4J1xyXG4gICAgICAgICAgICB9fT5cclxuICAgICAgICAgICAgICA8ZGl2IHN0eWxlPXt7XHJcbiAgICAgICAgICAgICAgICBwYWRkaW5nOiAnMjBweCcsXHJcbiAgICAgICAgICAgICAgICBiYWNrZ3JvdW5kQ29sb3I6ICd3aGl0ZScsXHJcbiAgICAgICAgICAgICAgICBib3JkZXJSYWRpdXM6ICcxMnB4JyxcclxuICAgICAgICAgICAgICAgIGJveFNoYWRvdzogJzAgMXB4IDNweCByZ2JhKDAsMCwwLDAuMSknLFxyXG4gICAgICAgICAgICAgICAgYm9yZGVyOiAnMXB4IHNvbGlkICNlNWU3ZWInXHJcbiAgICAgICAgICAgICAgfX0+XHJcbiAgICAgICAgICAgICAgICA8ZGl2IHN0eWxlPXt7IGRpc3BsYXk6ICdmbGV4JywgYWxpZ25JdGVtczogJ2NlbnRlcicsIG1hcmdpbkJvdHRvbTogJzhweCcgfX0+XHJcbiAgICAgICAgICAgICAgICAgIDxkaXYgc3R5bGU9e3sgd2lkdGg6ICc4cHgnLCBoZWlnaHQ6ICc4cHgnLCBiYWNrZ3JvdW5kQ29sb3I6ICcjZjU5ZTBiJywgYm9yZGVyUmFkaXVzOiAnNTAlJywgbWFyZ2luUmlnaHQ6ICc4cHgnIH19PjwvZGl2PlxyXG4gICAgICAgICAgICAgICAgICA8c3BhbiBzdHlsZT17eyBmb250U2l6ZTogJzE0cHgnLCBjb2xvcjogJyM2YjcyODAnLCBmb250V2VpZ2h0OiAnNTAwJyB9fT5QZW5kaW5nPC9zcGFuPlxyXG4gICAgICAgICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgICAgICAgICA8ZGl2IHN0eWxlPXt7IGZvbnRTaXplOiAnMjRweCcsIGZvbnRXZWlnaHQ6ICc3MDAnLCBjb2xvcjogJyMxZTI5M2InIH19PlxyXG4gICAgICAgICAgICAgICAgICB7ZGF0YT8uYXBwb2ludG1lbnRzPy5vdmVydmlldz8ucGVuZGluZ0FwcG9pbnRtZW50cyB8fCAwfVxyXG4gICAgICAgICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgICAgICAgXHJcbiAgICAgICAgICAgICAgPGRpdiBzdHlsZT17e1xyXG4gICAgICAgICAgICAgICAgcGFkZGluZzogJzIwcHgnLFxyXG4gICAgICAgICAgICAgICAgYmFja2dyb3VuZENvbG9yOiAnd2hpdGUnLFxyXG4gICAgICAgICAgICAgICAgYm9yZGVyUmFkaXVzOiAnMTJweCcsXHJcbiAgICAgICAgICAgICAgICBib3hTaGFkb3c6ICcwIDFweCAzcHggcmdiYSgwLDAsMCwwLjEpJyxcclxuICAgICAgICAgICAgICAgIGJvcmRlcjogJzFweCBzb2xpZCAjZTVlN2ViJ1xyXG4gICAgICAgICAgICAgIH19PlxyXG4gICAgICAgICAgICAgICAgPGRpdiBzdHlsZT17eyBkaXNwbGF5OiAnZmxleCcsIGFsaWduSXRlbXM6ICdjZW50ZXInLCBtYXJnaW5Cb3R0b206ICc4cHgnIH19PlxyXG4gICAgICAgICAgICAgICAgICA8ZGl2IHN0eWxlPXt7IHdpZHRoOiAnOHB4JywgaGVpZ2h0OiAnOHB4JywgYmFja2dyb3VuZENvbG9yOiAnIzEwYjk4MScsIGJvcmRlclJhZGl1czogJzUwJScsIG1hcmdpblJpZ2h0OiAnOHB4JyB9fT48L2Rpdj5cclxuICAgICAgICAgICAgICAgICAgPHNwYW4gc3R5bGU9e3sgZm9udFNpemU6ICcxNHB4JywgY29sb3I6ICcjNmI3MjgwJywgZm9udFdlaWdodDogJzUwMCcgfX0+QWNjZXB0ZWQ8L3NwYW4+XHJcbiAgICAgICAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgICAgICAgIDxkaXYgc3R5bGU9e3sgZm9udFNpemU6ICcyNHB4JywgZm9udFdlaWdodDogJzcwMCcsIGNvbG9yOiAnIzFlMjkzYicgfX0+XHJcbiAgICAgICAgICAgICAgICAgIHtkYXRhPy5hcHBvaW50bWVudHM/Lm92ZXJ2aWV3Py5hY2NlcHRlZEFwcG9pbnRtZW50cyB8fCAwfVxyXG4gICAgICAgICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgICAgICAgXHJcbiAgICAgICAgICAgICAgPGRpdiBzdHlsZT17e1xyXG4gICAgICAgICAgICAgICAgcGFkZGluZzogJzIwcHgnLFxyXG4gICAgICAgICAgICAgICAgYmFja2dyb3VuZENvbG9yOiAnd2hpdGUnLFxyXG4gICAgICAgICAgICAgICAgYm9yZGVyUmFkaXVzOiAnMTJweCcsXHJcbiAgICAgICAgICAgICAgICBib3hTaGFkb3c6ICcwIDFweCAzcHggcmdiYSgwLDAsMCwwLjEpJyxcclxuICAgICAgICAgICAgICAgIGJvcmRlcjogJzFweCBzb2xpZCAjZTVlN2ViJ1xyXG4gICAgICAgICAgICAgIH19PlxyXG4gICAgICAgICAgICAgICAgPGRpdiBzdHlsZT17eyBkaXNwbGF5OiAnZmxleCcsIGFsaWduSXRlbXM6ICdjZW50ZXInLCBtYXJnaW5Cb3R0b206ICc4cHgnIH19PlxyXG4gICAgICAgICAgICAgICAgICA8ZGl2IHN0eWxlPXt7IHdpZHRoOiAnOHB4JywgaGVpZ2h0OiAnOHB4JywgYmFja2dyb3VuZENvbG9yOiAnI2VmNDQ0NCcsIGJvcmRlclJhZGl1czogJzUwJScsIG1hcmdpblJpZ2h0OiAnOHB4JyB9fT48L2Rpdj5cclxuICAgICAgICAgICAgICAgICAgPHNwYW4gc3R5bGU9e3sgZm9udFNpemU6ICcxNHB4JywgY29sb3I6ICcjNmI3MjgwJywgZm9udFdlaWdodDogJzUwMCcgfX0+UmVqZWN0ZWQ8L3NwYW4+XHJcbiAgICAgICAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgICAgICAgIDxkaXYgc3R5bGU9e3sgZm9udFNpemU6ICcyNHB4JywgZm9udFdlaWdodDogJzcwMCcsIGNvbG9yOiAnIzFlMjkzYicgfX0+XHJcbiAgICAgICAgICAgICAgICAgIHtkYXRhPy5hcHBvaW50bWVudHM/Lm92ZXJ2aWV3Py5yZWplY3RlZEFwcG9pbnRtZW50cyB8fCAwfVxyXG4gICAgICAgICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgICAgICAgXHJcbiAgICAgICAgICAgICAgPGRpdiBzdHlsZT17e1xyXG4gICAgICAgICAgICAgICAgcGFkZGluZzogJzIwcHgnLFxyXG4gICAgICAgICAgICAgICAgYmFja2dyb3VuZENvbG9yOiAnd2hpdGUnLFxyXG4gICAgICAgICAgICAgICAgYm9yZGVyUmFkaXVzOiAnMTJweCcsXHJcbiAgICAgICAgICAgICAgICBib3hTaGFkb3c6ICcwIDFweCAzcHggcmdiYSgwLDAsMCwwLjEpJyxcclxuICAgICAgICAgICAgICAgIGJvcmRlcjogJzFweCBzb2xpZCAjZTVlN2ViJ1xyXG4gICAgICAgICAgICAgIH19PlxyXG4gICAgICAgICAgICAgICAgPGRpdiBzdHlsZT17eyBkaXNwbGF5OiAnZmxleCcsIGFsaWduSXRlbXM6ICdjZW50ZXInLCBtYXJnaW5Cb3R0b206ICc4cHgnIH19PlxyXG4gICAgICAgICAgICAgICAgICA8ZGl2IHN0eWxlPXt7IHdpZHRoOiAnOHB4JywgaGVpZ2h0OiAnOHB4JywgYmFja2dyb3VuZENvbG9yOiAnIzNiODJmNicsIGJvcmRlclJhZGl1czogJzUwJScsIG1hcmdpblJpZ2h0OiAnOHB4JyB9fT48L2Rpdj5cclxuICAgICAgICAgICAgICAgICAgPHNwYW4gc3R5bGU9e3sgZm9udFNpemU6ICcxNHB4JywgY29sb3I6ICcjNmI3MjgwJywgZm9udFdlaWdodDogJzUwMCcgfX0+QWNjZXB0YW5jZSBSYXRlPC9zcGFuPlxyXG4gICAgICAgICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgICAgICAgICA8ZGl2IHN0eWxlPXt7IGZvbnRTaXplOiAnMjRweCcsIGZvbnRXZWlnaHQ6ICc3MDAnLCBjb2xvcjogJyMxZTI5M2InIH19PlxyXG4gICAgICAgICAgICAgICAgICB7Zm9ybWF0UGVyY2VudGFnZShkYXRhPy5hcHBvaW50bWVudHM/Lm92ZXJ2aWV3Py5hY2NlcHRhbmNlUmF0ZSB8fCAwKX1cclxuICAgICAgICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICAgICA8L2Rpdj5cclxuXHJcbiAgICAgICAgICAgIHtkYXRhPy5hcHBvaW50bWVudHM/LnRvcEZyZWVsYW5jZXJzPy5sZW5ndGggPiAwICYmIChcclxuICAgICAgICAgICAgICA8ZGl2IHN0eWxlPXt7XHJcbiAgICAgICAgICAgICAgICBiYWNrZ3JvdW5kQ29sb3I6ICd3aGl0ZScsXHJcbiAgICAgICAgICAgICAgICBib3JkZXJSYWRpdXM6ICcxMnB4JyxcclxuICAgICAgICAgICAgICAgIGJveFNoYWRvdzogJzAgMXB4IDNweCByZ2JhKDAsMCwwLDAuMSknLFxyXG4gICAgICAgICAgICAgICAgYm9yZGVyOiAnMXB4IHNvbGlkICNlNWU3ZWInLFxyXG4gICAgICAgICAgICAgICAgb3ZlcmZsb3c6ICdoaWRkZW4nXHJcbiAgICAgICAgICAgICAgfX0+XHJcbiAgICAgICAgICAgICAgICA8ZGl2IHN0eWxlPXt7IFxyXG4gICAgICAgICAgICAgICAgICBwYWRkaW5nOiAnMjBweCAyNHB4JywgXHJcbiAgICAgICAgICAgICAgICAgIGJvcmRlckJvdHRvbTogJzFweCBzb2xpZCAjZTVlN2ViJyxcclxuICAgICAgICAgICAgICAgICAgYmFja2dyb3VuZENvbG9yOiAnI2Y4ZmFmYydcclxuICAgICAgICAgICAgICAgIH19PlxyXG4gICAgICAgICAgICAgICAgICA8aDMgc3R5bGU9e3sgbWFyZ2luOiAnMCcsIGZvbnRTaXplOiAnMThweCcsIGZvbnRXZWlnaHQ6ICc2MDAnLCBjb2xvcjogJyMxZTI5M2InIH19PlxyXG4gICAgICAgICAgICAgICAgICAgIFRvcCBQZXJmb3JtaW5nIEZyZWVsYW5jZXJzXHJcbiAgICAgICAgICAgICAgICAgIDwvaDM+XHJcbiAgICAgICAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgICAgICAgIDx0YWJsZSBzdHlsZT17eyB3aWR0aDogJzEwMCUnLCBib3JkZXJDb2xsYXBzZTogJ2NvbGxhcHNlJyB9fT5cclxuICAgICAgICAgICAgICAgICAgPHRoZWFkIHN0eWxlPXt7IGJhY2tncm91bmRDb2xvcjogJyNmOGZhZmMnIH19PlxyXG4gICAgICAgICAgICAgICAgICAgIDx0cj5cclxuICAgICAgICAgICAgICAgICAgICAgIDx0aCBzdHlsZT17eyB0ZXh0QWxpZ246ICdsZWZ0JywgcGFkZGluZzogJzEycHggMjRweCcsIGZvbnRTaXplOiAnMTRweCcsIGZvbnRXZWlnaHQ6ICc2MDAnLCBjb2xvcjogJyMzNzQxNTEnIH19PlxyXG4gICAgICAgICAgICAgICAgICAgICAgICBGcmVlbGFuY2VyXHJcbiAgICAgICAgICAgICAgICAgICAgICA8L3RoPlxyXG4gICAgICAgICAgICAgICAgICAgICAgPHRoIHN0eWxlPXt7IHRleHRBbGlnbjogJ2xlZnQnLCBwYWRkaW5nOiAnMTJweCAyNHB4JywgZm9udFNpemU6ICcxNHB4JywgZm9udFdlaWdodDogJzYwMCcsIGNvbG9yOiAnIzM3NDE1MScgfX0+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIFRvdGFsXHJcbiAgICAgICAgICAgICAgICAgICAgICA8L3RoPlxyXG4gICAgICAgICAgICAgICAgICAgICAgPHRoIHN0eWxlPXt7IHRleHRBbGlnbjogJ2xlZnQnLCBwYWRkaW5nOiAnMTJweCAyNHB4JywgZm9udFNpemU6ICcxNHB4JywgZm9udFdlaWdodDogJzYwMCcsIGNvbG9yOiAnIzM3NDE1MScgfX0+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIEFjY2VwdGVkXHJcbiAgICAgICAgICAgICAgICAgICAgICA8L3RoPlxyXG4gICAgICAgICAgICAgICAgICAgICAgPHRoIHN0eWxlPXt7IHRleHRBbGlnbjogJ2xlZnQnLCBwYWRkaW5nOiAnMTJweCAyNHB4JywgZm9udFNpemU6ICcxNHB4JywgZm9udFdlaWdodDogJzYwMCcsIGNvbG9yOiAnIzM3NDE1MScgfX0+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIFN1Y2Nlc3MgUmF0ZVxyXG4gICAgICAgICAgICAgICAgICAgICAgPC90aD5cclxuICAgICAgICAgICAgICAgICAgICA8L3RyPlxyXG4gICAgICAgICAgICAgICAgICA8L3RoZWFkPlxyXG4gICAgICAgICAgICAgICAgICA8dGJvZHk+XHJcbiAgICAgICAgICAgICAgICAgICAge2RhdGEuYXBwb2ludG1lbnRzLnRvcEZyZWVsYW5jZXJzLm1hcCgoZnJlZWxhbmNlciwgaW5kZXgpID0+IChcclxuICAgICAgICAgICAgICAgICAgICAgIDx0ciBrZXk9e2luZGV4fSBzdHlsZT17eyBib3JkZXJCb3R0b206ICcxcHggc29saWQgI2YzZjRmNicgfX0+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIDx0ZCBzdHlsZT17eyBwYWRkaW5nOiAnMTZweCAyNHB4JywgZm9udFNpemU6ICcxNHB4JyB9fT5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICA8ZGl2IHN0eWxlPXt7IGRpc3BsYXk6ICdmbGV4JywgYWxpZ25JdGVtczogJ2NlbnRlcicgfX0+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8ZGl2IHN0eWxlPXt7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHdpZHRoOiAnNDBweCcsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGhlaWdodDogJzQwcHgnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICBiYWNrZ3JvdW5kQ29sb3I6ICcjM2I4MmY2JyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYm9yZGVyUmFkaXVzOiAnNTAlJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGlzcGxheTogJ2ZsZXgnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhbGlnbkl0ZW1zOiAnY2VudGVyJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAganVzdGlmeUNvbnRlbnQ6ICdjZW50ZXInLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb2xvcjogJ3doaXRlJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZm9udFdlaWdodDogJzYwMCcsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZvbnRTaXplOiAnMTZweCcsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1hcmdpblJpZ2h0OiAnMTJweCdcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH19PlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICB7ZnJlZWxhbmNlci5maXJzdF9uYW1lPy5bMF19e2ZyZWVsYW5jZXIubGFzdF9uYW1lPy5bMF19XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxkaXY+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxkaXYgc3R5bGU9e3sgZm9udFdlaWdodDogJzYwMCcsIGNvbG9yOiAnIzFlMjkzYicgfX0+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAge2ZyZWVsYW5jZXIuZmlyc3RfbmFtZX0ge2ZyZWVsYW5jZXIubGFzdF9uYW1lfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPGRpdiBzdHlsZT17eyBmb250U2l6ZTogJzEycHgnLCBjb2xvcjogJyM2YjcyODAnIH19PlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHtmcmVlbGFuY2VyLmVtYWlsfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICAgICAgICAgICAgICAgICA8L3RkPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICA8dGQgc3R5bGU9e3sgcGFkZGluZzogJzE2cHggMjRweCcsIGZvbnRTaXplOiAnMTZweCcsIGZvbnRXZWlnaHQ6ICc2MDAnLCBjb2xvcjogJyMxZTI5M2InIH19PlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgIHtmcmVlbGFuY2VyLnRvdGFsX2FwcG9pbnRtZW50c31cclxuICAgICAgICAgICAgICAgICAgICAgICAgPC90ZD5cclxuICAgICAgICAgICAgICAgICAgICAgICAgPHRkIHN0eWxlPXt7IHBhZGRpbmc6ICcxNnB4IDI0cHgnLCBmb250U2l6ZTogJzE2cHgnLCBmb250V2VpZ2h0OiAnNjAwJywgY29sb3I6ICcjMTBiOTgxJyB9fT5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICB7ZnJlZWxhbmNlci5hY2NlcHRlZF9hcHBvaW50bWVudHN9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIDwvdGQ+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIDx0ZCBzdHlsZT17eyBwYWRkaW5nOiAnMTZweCAyNHB4JywgZm9udFNpemU6ICcxNnB4JywgZm9udFdlaWdodDogJzYwMCcsIGNvbG9yOiAnIzNiODJmNicgfX0+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAge2Zvcm1hdFBlcmNlbnRhZ2UoZnJlZWxhbmNlci5hY2NlcHRhbmNlX3JhdGUpfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICA8L3RkPlxyXG4gICAgICAgICAgICAgICAgICAgICAgPC90cj5cclxuICAgICAgICAgICAgICAgICAgICApKX1cclxuICAgICAgICAgICAgICAgICAgPC90Ym9keT5cclxuICAgICAgICAgICAgICAgIDwvdGFibGU+XHJcbiAgICAgICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgICAgICl9XHJcbiAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICApfVxyXG5cclxuICAgICAgICB7YWN0aXZlVGFiID09PSAndXNlcnMnICYmIChcclxuICAgICAgICAgIDxkaXY+XHJcbiAgICAgICAgICAgIDxkaXYgc3R5bGU9e3sgXHJcbiAgICAgICAgICAgICAgZGlzcGxheTogJ2dyaWQnLCBcclxuICAgICAgICAgICAgICBncmlkVGVtcGxhdGVDb2x1bW5zOiAncmVwZWF0KGF1dG8tZml0LCBtaW5tYXgoMjAwcHgsIDFmcikpJywgXHJcbiAgICAgICAgICAgICAgZ2FwOiAnMTZweCcsXHJcbiAgICAgICAgICAgICAgbWFyZ2luQm90dG9tOiAnMzJweCdcclxuICAgICAgICAgICAgfX0+XHJcbiAgICAgICAgICAgICAgPGRpdiBzdHlsZT17e1xyXG4gICAgICAgICAgICAgICAgcGFkZGluZzogJzIwcHgnLFxyXG4gICAgICAgICAgICAgICAgYmFja2dyb3VuZENvbG9yOiAnd2hpdGUnLFxyXG4gICAgICAgICAgICAgICAgYm9yZGVyUmFkaXVzOiAnMTJweCcsXHJcbiAgICAgICAgICAgICAgICBib3hTaGFkb3c6ICcwIDFweCAzcHggcmdiYSgwLDAsMCwwLjEpJyxcclxuICAgICAgICAgICAgICAgIGJvcmRlcjogJzFweCBzb2xpZCAjZTVlN2ViJ1xyXG4gICAgICAgICAgICAgIH19PlxyXG4gICAgICAgICAgICAgICAgPGRpdiBzdHlsZT17eyBmb250U2l6ZTogJzE0cHgnLCBjb2xvcjogJyM2YjcyODAnLCBtYXJnaW5Cb3R0b206ICc4cHgnLCBmb250V2VpZ2h0OiAnNTAwJyB9fT5Ub3RhbCBVc2VyczwvZGl2PlxyXG4gICAgICAgICAgICAgICAgPGRpdiBzdHlsZT17eyBmb250U2l6ZTogJzI0cHgnLCBmb250V2VpZ2h0OiAnNzAwJywgY29sb3I6ICcjMWUyOTNiJyB9fT5cclxuICAgICAgICAgICAgICAgICAgeyhkYXRhPy51c2Vycz8ub3ZlcnZpZXc/LnRvdGFsVXNlcnMgfHwgMCkudG9Mb2NhbGVTdHJpbmcoKX1cclxuICAgICAgICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICAgICAgIFxyXG4gICAgICAgICAgICAgIDxkaXYgc3R5bGU9e3tcclxuICAgICAgICAgICAgICAgIHBhZGRpbmc6ICcyMHB4JyxcclxuICAgICAgICAgICAgICAgIGJhY2tncm91bmRDb2xvcjogJ3doaXRlJyxcclxuICAgICAgICAgICAgICAgIGJvcmRlclJhZGl1czogJzEycHgnLFxyXG4gICAgICAgICAgICAgICAgYm94U2hhZG93OiAnMCAxcHggM3B4IHJnYmEoMCwwLDAsMC4xKScsXHJcbiAgICAgICAgICAgICAgICBib3JkZXI6ICcxcHggc29saWQgI2U1ZTdlYidcclxuICAgICAgICAgICAgICB9fT5cclxuICAgICAgICAgICAgICAgIDxkaXYgc3R5bGU9e3sgZm9udFNpemU6ICcxNHB4JywgY29sb3I6ICcjM2I4MmY2JywgbWFyZ2luQm90dG9tOiAnOHB4JywgZm9udFdlaWdodDogJzUwMCcgfX0+Q2xpZW50czwvZGl2PlxyXG4gICAgICAgICAgICAgICAgPGRpdiBzdHlsZT17eyBmb250U2l6ZTogJzI0cHgnLCBmb250V2VpZ2h0OiAnNzAwJywgY29sb3I6ICcjMWUyOTNiJyB9fT5cclxuICAgICAgICAgICAgICAgICAgeyhkYXRhPy51c2Vycz8ub3ZlcnZpZXc/LnRvdGFsQ2xpZW50cyB8fCAwKS50b0xvY2FsZVN0cmluZygpfVxyXG4gICAgICAgICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgICAgICAgXHJcbiAgICAgICAgICAgICAgPGRpdiBzdHlsZT17e1xyXG4gICAgICAgICAgICAgICAgcGFkZGluZzogJzIwcHgnLFxyXG4gICAgICAgICAgICAgICAgYmFja2dyb3VuZENvbG9yOiAnd2hpdGUnLFxyXG4gICAgICAgICAgICAgICAgYm9yZGVyUmFkaXVzOiAnMTJweCcsXHJcbiAgICAgICAgICAgICAgICBib3hTaGFkb3c6ICcwIDFweCAzcHggcmdiYSgwLDAsMCwwLjEpJyxcclxuICAgICAgICAgICAgICAgIGJvcmRlcjogJzFweCBzb2xpZCAjZTVlN2ViJ1xyXG4gICAgICAgICAgICAgIH19PlxyXG4gICAgICAgICAgICAgICAgPGRpdiBzdHlsZT17eyBmb250U2l6ZTogJzE0cHgnLCBjb2xvcjogJyM4YjVjZjYnLCBtYXJnaW5Cb3R0b206ICc4cHgnLCBmb250V2VpZ2h0OiAnNTAwJyB9fT5GcmVlbGFuY2VyczwvZGl2PlxyXG4gICAgICAgICAgICAgICAgPGRpdiBzdHlsZT17eyBmb250U2l6ZTogJzI0cHgnLCBmb250V2VpZ2h0OiAnNzAwJywgY29sb3I6ICcjMWUyOTNiJyB9fT5cclxuICAgICAgICAgICAgICAgICAgeyhkYXRhPy51c2Vycz8ub3ZlcnZpZXc/LnRvdGFsRnJlZWxhbmNlcnMgfHwgMCkudG9Mb2NhbGVTdHJpbmcoKX1cclxuICAgICAgICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICAgICAgIFxyXG4gICAgICAgICAgICAgIDxkaXYgc3R5bGU9e3tcclxuICAgICAgICAgICAgICAgIHBhZGRpbmc6ICcyMHB4JyxcclxuICAgICAgICAgICAgICAgIGJhY2tncm91bmRDb2xvcjogJ3doaXRlJyxcclxuICAgICAgICAgICAgICAgIGJvcmRlclJhZGl1czogJzEycHgnLFxyXG4gICAgICAgICAgICAgICAgYm94U2hhZG93OiAnMCAxcHggM3B4IHJnYmEoMCwwLDAsMC4xKScsXHJcbiAgICAgICAgICAgICAgICBib3JkZXI6ICcxcHggc29saWQgI2U1ZTdlYidcclxuICAgICAgICAgICAgICB9fT5cclxuICAgICAgICAgICAgICAgIDxkaXYgc3R5bGU9e3sgZm9udFNpemU6ICcxNHB4JywgY29sb3I6ICcjMTBiOTgxJywgbWFyZ2luQm90dG9tOiAnOHB4JywgZm9udFdlaWdodDogJzUwMCcgfX0+TmV3IFRoaXMgTW9udGg8L2Rpdj5cclxuICAgICAgICAgICAgICAgIDxkaXYgc3R5bGU9e3sgZm9udFNpemU6ICcyNHB4JywgZm9udFdlaWdodDogJzcwMCcsIGNvbG9yOiAnIzFlMjkzYicgfX0+XHJcbiAgICAgICAgICAgICAgICAgIHsoZGF0YT8udXNlcnM/Lm92ZXJ2aWV3Py5uZXdVc2Vyc01vbnRoIHx8IDApLnRvTG9jYWxlU3RyaW5nKCl9XHJcbiAgICAgICAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgICAgPC9kaXY+XHJcblxyXG4gICAgICAgICAgICB7ZGF0YT8udXNlcnM/LnJlY2VudFVzZXJzPy5sZW5ndGggPiAwICYmIChcclxuICAgICAgICAgICAgICA8ZGl2IHN0eWxlPXt7XHJcbiAgICAgICAgICAgICAgICBiYWNrZ3JvdW5kQ29sb3I6ICd3aGl0ZScsXHJcbiAgICAgICAgICAgICAgICBib3JkZXJSYWRpdXM6ICcxMnB4JyxcclxuICAgICAgICAgICAgICAgIGJveFNoYWRvdzogJzAgMXB4IDNweCByZ2JhKDAsMCwwLDAuMSknLFxyXG4gICAgICAgICAgICAgICAgYm9yZGVyOiAnMXB4IHNvbGlkICNlNWU3ZWInLFxyXG4gICAgICAgICAgICAgICAgb3ZlcmZsb3c6ICdoaWRkZW4nXHJcbiAgICAgICAgICAgICAgfX0+XHJcbiAgICAgICAgICAgICAgICA8ZGl2IHN0eWxlPXt7IFxyXG4gICAgICAgICAgICAgICAgICBwYWRkaW5nOiAnMjBweCAyNHB4JywgXHJcbiAgICAgICAgICAgICAgICAgIGJvcmRlckJvdHRvbTogJzFweCBzb2xpZCAjZTVlN2ViJyxcclxuICAgICAgICAgICAgICAgICAgYmFja2dyb3VuZENvbG9yOiAnI2Y4ZmFmYydcclxuICAgICAgICAgICAgICAgIH19PlxyXG4gICAgICAgICAgICAgICAgICA8aDMgc3R5bGU9e3sgbWFyZ2luOiAnMCcsIGZvbnRTaXplOiAnMThweCcsIGZvbnRXZWlnaHQ6ICc2MDAnLCBjb2xvcjogJyMxZTI5M2InIH19PlxyXG4gICAgICAgICAgICAgICAgICAgIFJlY2VudCBVc2VyIFJlZ2lzdHJhdGlvbnNcclxuICAgICAgICAgICAgICAgICAgPC9oMz5cclxuICAgICAgICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICAgICAgICAgPHRhYmxlIHN0eWxlPXt7IHdpZHRoOiAnMTAwJScsIGJvcmRlckNvbGxhcHNlOiAnY29sbGFwc2UnIH19PlxyXG4gICAgICAgICAgICAgICAgICA8dGhlYWQgc3R5bGU9e3sgYmFja2dyb3VuZENvbG9yOiAnI2Y4ZmFmYycgfX0+XHJcbiAgICAgICAgICAgICAgICAgICAgPHRyPlxyXG4gICAgICAgICAgICAgICAgICAgICAgPHRoIHN0eWxlPXt7IHRleHRBbGlnbjogJ2xlZnQnLCBwYWRkaW5nOiAnMTJweCAyNHB4JywgZm9udFNpemU6ICcxNHB4JywgZm9udFdlaWdodDogJzYwMCcsIGNvbG9yOiAnIzM3NDE1MScgfX0+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIFVzZXJcclxuICAgICAgICAgICAgICAgICAgICAgIDwvdGg+XHJcbiAgICAgICAgICAgICAgICAgICAgICA8dGggc3R5bGU9e3sgdGV4dEFsaWduOiAnbGVmdCcsIHBhZGRpbmc6ICcxMnB4IDI0cHgnLCBmb250U2l6ZTogJzE0cHgnLCBmb250V2VpZ2h0OiAnNjAwJywgY29sb3I6ICcjMzc0MTUxJyB9fT5cclxuICAgICAgICAgICAgICAgICAgICAgICAgRW1haWxcclxuICAgICAgICAgICAgICAgICAgICAgIDwvdGg+XHJcbiAgICAgICAgICAgICAgICAgICAgICA8dGggc3R5bGU9e3sgdGV4dEFsaWduOiAnbGVmdCcsIHBhZGRpbmc6ICcxMnB4IDI0cHgnLCBmb250U2l6ZTogJzE0cHgnLCBmb250V2VpZ2h0OiAnNjAwJywgY29sb3I6ICcjMzc0MTUxJyB9fT5cclxuICAgICAgICAgICAgICAgICAgICAgICAgUm9sZVxyXG4gICAgICAgICAgICAgICAgICAgICAgPC90aD5cclxuICAgICAgICAgICAgICAgICAgICAgIDx0aCBzdHlsZT17eyB0ZXh0QWxpZ246ICdsZWZ0JywgcGFkZGluZzogJzEycHggMjRweCcsIGZvbnRTaXplOiAnMTRweCcsIGZvbnRXZWlnaHQ6ICc2MDAnLCBjb2xvcjogJyMzNzQxNTEnIH19PlxyXG4gICAgICAgICAgICAgICAgICAgICAgICBKb2luZWRcclxuICAgICAgICAgICAgICAgICAgICAgIDwvdGg+XHJcbiAgICAgICAgICAgICAgICAgICAgPC90cj5cclxuICAgICAgICAgICAgICAgICAgPC90aGVhZD5cclxuICAgICAgICAgICAgICAgICAgPHRib2R5PlxyXG4gICAgICAgICAgICAgICAgICAgIHtkYXRhLnVzZXJzLnJlY2VudFVzZXJzLnNsaWNlKDAsIDEwKS5tYXAoKHVzZXIsIGluZGV4KSA9PiAoXHJcbiAgICAgICAgICAgICAgICAgICAgICA8dHIga2V5PXtpbmRleH0gc3R5bGU9e3sgYm9yZGVyQm90dG9tOiAnMXB4IHNvbGlkICNmM2Y0ZjYnIH19PlxyXG4gICAgICAgICAgICAgICAgICAgICAgICA8dGQgc3R5bGU9e3sgcGFkZGluZzogJzE2cHggMjRweCcsIGZvbnRTaXplOiAnMTRweCcsIGZvbnRXZWlnaHQ6ICc2MDAnLCBjb2xvcjogJyMxZTI5M2InIH19PlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgIHt1c2VyLmZpcnN0X25hbWV9IHt1c2VyLmxhc3RfbmFtZX1cclxuICAgICAgICAgICAgICAgICAgICAgICAgPC90ZD5cclxuICAgICAgICAgICAgICAgICAgICAgICAgPHRkIHN0eWxlPXt7IHBhZGRpbmc6ICcxNnB4IDI0cHgnLCBmb250U2l6ZTogJzE0cHgnLCBjb2xvcjogJyM2YjcyODAnIH19PlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgIHt1c2VyLmVtYWlsfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICA8L3RkPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICA8dGQgc3R5bGU9e3sgcGFkZGluZzogJzE2cHggMjRweCcsIGZvbnRTaXplOiAnMTRweCcgfX0+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgPHNwYW4gc3R5bGU9e3tcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHBhZGRpbmc6ICc0cHggMTJweCcsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBib3JkZXJSYWRpdXM6ICcyMHB4JyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZvbnRTaXplOiAnMTJweCcsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBmb250V2VpZ2h0OiAnNjAwJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJhY2tncm91bmRDb2xvcjogdXNlci5yb2xlX2lkID09PSAyID8gJyNkYmVhZmUnIDogdXNlci5yb2xlX2lkID09PSAzID8gJyNmM2U4ZmYnIDogJyNmM2Y0ZjYnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29sb3I6IHVzZXIucm9sZV9pZCA9PT0gMiA/ICcjMWU0MGFmJyA6IHVzZXIucm9sZV9pZCA9PT0gMyA/ICcjN2MzYWVkJyA6ICcjMzc0MTUxJ1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgIH19PlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAge3VzZXIucm9sZV9pZCA9PT0gMiA/ICdDbGllbnQnIDogdXNlci5yb2xlX2lkID09PSAzID8gJ0ZyZWVsYW5jZXInIDogJ1VzZXInfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgIDwvc3Bhbj5cclxuICAgICAgICAgICAgICAgICAgICAgICAgPC90ZD5cclxuICAgICAgICAgICAgICAgICAgICAgICAgPHRkIHN0eWxlPXt7IHBhZGRpbmc6ICcxNnB4IDI0cHgnLCBmb250U2l6ZTogJzE0cHgnLCBjb2xvcjogJyM2YjcyODAnIH19PlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgIHt1c2VyLmNyZWF0ZWRfYXQgPyBmb3JtYXREYXRlKHVzZXIuY3JlYXRlZF9hdCkgOiAnLSd9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIDwvdGQ+XHJcbiAgICAgICAgICAgICAgICAgICAgICA8L3RyPlxyXG4gICAgICAgICAgICAgICAgICAgICkpfVxyXG4gICAgICAgICAgICAgICAgICA8L3Rib2R5PlxyXG4gICAgICAgICAgICAgICAgPC90YWJsZT5cclxuICAgICAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgICAgKX1cclxuICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICl9XHJcblxyXG4gICAgICAgIHthY3RpdmVUYWIgPT09ICdwcm9qZWN0cycgJiYgKFxyXG4gICAgICAgICAgPGRpdj5cclxuICAgICAgICAgICAgPGRpdiBzdHlsZT17eyBcclxuICAgICAgICAgICAgICBkaXNwbGF5OiAnZ3JpZCcsIFxyXG4gICAgICAgICAgICAgIGdyaWRUZW1wbGF0ZUNvbHVtbnM6ICdyZXBlYXQoYXV0by1maXQsIG1pbm1heCgxODBweCwgMWZyKSknLCBcclxuICAgICAgICAgICAgICBnYXA6ICcxNnB4JyxcclxuICAgICAgICAgICAgICBtYXJnaW5Cb3R0b206ICczMnB4J1xyXG4gICAgICAgICAgICB9fT5cclxuICAgICAgICAgICAgICA8ZGl2IHN0eWxlPXt7XHJcbiAgICAgICAgICAgICAgICBwYWRkaW5nOiAnMjBweCcsXHJcbiAgICAgICAgICAgICAgICBiYWNrZ3JvdW5kQ29sb3I6ICd3aGl0ZScsXHJcbiAgICAgICAgICAgICAgICBib3JkZXJSYWRpdXM6ICcxMnB4JyxcclxuICAgICAgICAgICAgICAgIGJveFNoYWRvdzogJzAgMXB4IDNweCByZ2JhKDAsMCwwLDAuMSknLFxyXG4gICAgICAgICAgICAgICAgYm9yZGVyOiAnMXB4IHNvbGlkICNlNWU3ZWInXHJcbiAgICAgICAgICAgICAgfX0+XHJcbiAgICAgICAgICAgICAgICA8ZGl2IHN0eWxlPXt7IGZvbnRTaXplOiAnMTRweCcsIGNvbG9yOiAnIzZiNzI4MCcsIG1hcmdpbkJvdHRvbTogJzhweCcsIGZvbnRXZWlnaHQ6ICc1MDAnIH19PkRyYWZ0PC9kaXY+XHJcbiAgICAgICAgICAgICAgICA8ZGl2IHN0eWxlPXt7IGZvbnRTaXplOiAnMjRweCcsIGZvbnRXZWlnaHQ6ICc3MDAnLCBjb2xvcjogJyMxZTI5M2InIH19PlxyXG4gICAgICAgICAgICAgICAgICB7ZGF0YT8ub3ZlcnZpZXc/LmRyYWZ0UHJvamVjdHMgfHwgMH1cclxuICAgICAgICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICAgICAgIFxyXG4gICAgICAgICAgICAgIDxkaXYgc3R5bGU9e3tcclxuICAgICAgICAgICAgICAgIHBhZGRpbmc6ICcyMHB4JyxcclxuICAgICAgICAgICAgICAgIGJhY2tncm91bmRDb2xvcjogJ3doaXRlJyxcclxuICAgICAgICAgICAgICAgIGJvcmRlclJhZGl1czogJzEycHgnLFxyXG4gICAgICAgICAgICAgICAgYm94U2hhZG93OiAnMCAxcHggM3B4IHJnYmEoMCwwLDAsMC4xKScsXHJcbiAgICAgICAgICAgICAgICBib3JkZXI6ICcxcHggc29saWQgI2U1ZTdlYidcclxuICAgICAgICAgICAgICB9fT5cclxuICAgICAgICAgICAgICAgIDxkaXYgc3R5bGU9e3sgZm9udFNpemU6ICcxNHB4JywgY29sb3I6ICcjM2I4MmY2JywgbWFyZ2luQm90dG9tOiAnOHB4JywgZm9udFdlaWdodDogJzUwMCcgfX0+QWN0aXZlPC9kaXY+XHJcbiAgICAgICAgICAgICAgICA8ZGl2IHN0eWxlPXt7IGZvbnRTaXplOiAnMjRweCcsIGZvbnRXZWlnaHQ6ICc3MDAnLCBjb2xvcjogJyMxZTI5M2InIH19PlxyXG4gICAgICAgICAgICAgICAgICB7ZGF0YT8ub3ZlcnZpZXc/LmFjdGl2ZVByb2plY3RzIHx8IDB9XHJcbiAgICAgICAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgICAgICBcclxuICAgICAgICAgICAgICA8ZGl2IHN0eWxlPXt7XHJcbiAgICAgICAgICAgICAgICBwYWRkaW5nOiAnMjBweCcsXHJcbiAgICAgICAgICAgICAgICBiYWNrZ3JvdW5kQ29sb3I6ICd3aGl0ZScsXHJcbiAgICAgICAgICAgICAgICBib3JkZXJSYWRpdXM6ICcxMnB4JyxcclxuICAgICAgICAgICAgICAgIGJveFNoYWRvdzogJzAgMXB4IDNweCByZ2JhKDAsMCwwLDAuMSknLFxyXG4gICAgICAgICAgICAgICAgYm9yZGVyOiAnMXB4IHNvbGlkICNlNWU3ZWInXHJcbiAgICAgICAgICAgICAgfX0+XHJcbiAgICAgICAgICAgICAgICA8ZGl2IHN0eWxlPXt7IGZvbnRTaXplOiAnMTRweCcsIGNvbG9yOiAnIzEwYjk4MScsIG1hcmdpbkJvdHRvbTogJzhweCcsIGZvbnRXZWlnaHQ6ICc1MDAnIH19PkNvbXBsZXRlZDwvZGl2PlxyXG4gICAgICAgICAgICAgICAgPGRpdiBzdHlsZT17eyBmb250U2l6ZTogJzI0cHgnLCBmb250V2VpZ2h0OiAnNzAwJywgY29sb3I6ICcjMWUyOTNiJyB9fT5cclxuICAgICAgICAgICAgICAgICAge2RhdGE/Lm92ZXJ2aWV3Py5jb21wbGV0ZWRQcm9qZWN0cyB8fCAwfVxyXG4gICAgICAgICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgICAgICAgXHJcbiAgICAgICAgICAgICAgPGRpdiBzdHlsZT17e1xyXG4gICAgICAgICAgICAgICAgcGFkZGluZzogJzIwcHgnLFxyXG4gICAgICAgICAgICAgICAgYmFja2dyb3VuZENvbG9yOiAnd2hpdGUnLFxyXG4gICAgICAgICAgICAgICAgYm9yZGVyUmFkaXVzOiAnMTJweCcsXHJcbiAgICAgICAgICAgICAgICBib3hTaGFkb3c6ICcwIDFweCAzcHggcmdiYSgwLDAsMCwwLjEpJyxcclxuICAgICAgICAgICAgICAgIGJvcmRlcjogJzFweCBzb2xpZCAjZTVlN2ViJ1xyXG4gICAgICAgICAgICAgIH19PlxyXG4gICAgICAgICAgICAgICAgPGRpdiBzdHlsZT17eyBmb250U2l6ZTogJzE0cHgnLCBjb2xvcjogJyMxZTI5M2InLCBtYXJnaW5Cb3R0b206ICc4cHgnLCBmb250V2VpZ2h0OiAnNTAwJyB9fT5Ub3RhbDwvZGl2PlxyXG4gICAgICAgICAgICAgICAgPGRpdiBzdHlsZT17eyBmb250U2l6ZTogJzI0cHgnLCBmb250V2VpZ2h0OiAnNzAwJywgY29sb3I6ICcjMWUyOTNiJyB9fT5cclxuICAgICAgICAgICAgICAgICAge2RhdGE/Lm92ZXJ2aWV3Py50b3RhbFByb2plY3RzIHx8IDB9XHJcbiAgICAgICAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgICAgPC9kaXY+XHJcblxyXG4gICAgICAgICAgICB7ZGF0YT8ucHJvamVjdFN0YXRzPy5ieVN0YXR1cz8ubGVuZ3RoID4gMCAmJiAoXHJcbiAgICAgICAgICAgICAgPGRpdiBzdHlsZT17e1xyXG4gICAgICAgICAgICAgICAgYmFja2dyb3VuZENvbG9yOiAnd2hpdGUnLFxyXG4gICAgICAgICAgICAgICAgYm9yZGVyUmFkaXVzOiAnMTJweCcsXHJcbiAgICAgICAgICAgICAgICBib3hTaGFkb3c6ICcwIDFweCAzcHggcmdiYSgwLDAsMCwwLjEpJyxcclxuICAgICAgICAgICAgICAgIGJvcmRlcjogJzFweCBzb2xpZCAjZTVlN2ViJyxcclxuICAgICAgICAgICAgICAgIHBhZGRpbmc6ICcyNHB4J1xyXG4gICAgICAgICAgICAgIH19PlxyXG4gICAgICAgICAgICAgICAgPGgzIHN0eWxlPXt7IG1hcmdpbjogJzAgMCAyNHB4IDAnLCBmb250U2l6ZTogJzE4cHgnLCBmb250V2VpZ2h0OiAnNjAwJywgY29sb3I6ICcjMWUyOTNiJyB9fT5cclxuICAgICAgICAgICAgICAgICAgUHJvamVjdCBTdGF0dXMgRGlzdHJpYnV0aW9uXHJcbiAgICAgICAgICAgICAgICA8L2gzPlxyXG4gICAgICAgICAgICAgICAgPGRpdiBzdHlsZT17eyBkaXNwbGF5OiAnZmxleCcsIGZsZXhXcmFwOiAnd3JhcCcsIGdhcDogJzE2cHgnIH19PlxyXG4gICAgICAgICAgICAgICAgICB7ZGF0YS5wcm9qZWN0U3RhdHMuYnlTdGF0dXMubWFwKChzdGF0dXMsIGluZGV4KSA9PiAoXHJcbiAgICAgICAgICAgICAgICAgICAgPGRpdiBrZXk9e2luZGV4fSBzdHlsZT17e1xyXG4gICAgICAgICAgICAgICAgICAgICAgZGlzcGxheTogJ2ZsZXgnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgYWxpZ25JdGVtczogJ2NlbnRlcicsXHJcbiAgICAgICAgICAgICAgICAgICAgICBwYWRkaW5nOiAnMTJweCAxNnB4JyxcclxuICAgICAgICAgICAgICAgICAgICAgIGJhY2tncm91bmRDb2xvcjogJyNmOGZhZmMnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgYm9yZGVyUmFkaXVzOiAnOHB4JyxcclxuICAgICAgICAgICAgICAgICAgICAgIGJvcmRlcjogJzFweCBzb2xpZCAjZTJlOGYwJ1xyXG4gICAgICAgICAgICAgICAgICAgIH19PlxyXG4gICAgICAgICAgICAgICAgICAgICAgPGRpdiBzdHlsZT17e1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB3aWR0aDogJzEycHgnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBoZWlnaHQ6ICcxMnB4JyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgYmFja2dyb3VuZENvbG9yOiBzdGF0dXMuY29sb3IsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGJvcmRlclJhZGl1czogJzNweCcsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIG1hcmdpblJpZ2h0OiAnOHB4J1xyXG4gICAgICAgICAgICAgICAgICAgICAgfX0+PC9kaXY+XHJcbiAgICAgICAgICAgICAgICAgICAgICA8c3BhbiBzdHlsZT17eyBmb250U2l6ZTogJzE0cHgnLCBmb250V2VpZ2h0OiAnNTAwJywgY29sb3I6ICcjMzc0MTUxJyB9fT5cclxuICAgICAgICAgICAgICAgICAgICAgICAge3N0YXR1cy5zdGF0dXN9OiB7c3RhdHVzLmNvdW50fVxyXG4gICAgICAgICAgICAgICAgICAgICAgPC9zcGFuPlxyXG4gICAgICAgICAgICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICAgICAgICAgICApKX1cclxuICAgICAgICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICAgICApfVxyXG4gICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgKX1cclxuXHJcbiAgICAgICAge2FjdGl2ZVRhYiA9PT0gJ2ZpbmFuY2lhbCcgJiYgKFxyXG4gICAgICAgICAgPGRpdj5cclxuICAgICAgICAgICAgPGRpdiBzdHlsZT17eyBcclxuICAgICAgICAgICAgICBkaXNwbGF5OiAnZ3JpZCcsIFxyXG4gICAgICAgICAgICAgIGdyaWRUZW1wbGF0ZUNvbHVtbnM6ICdyZXBlYXQoYXV0by1maXQsIG1pbm1heCgyMDBweCwgMWZyKSknLCBcclxuICAgICAgICAgICAgICBnYXA6ICcxNnB4JyxcclxuICAgICAgICAgICAgICBtYXJnaW5Cb3R0b206ICczMnB4J1xyXG4gICAgICAgICAgICB9fT5cclxuICAgICAgICAgICAgICA8ZGl2IHN0eWxlPXt7XHJcbiAgICAgICAgICAgICAgICBwYWRkaW5nOiAnMjBweCcsXHJcbiAgICAgICAgICAgICAgICBiYWNrZ3JvdW5kQ29sb3I6ICd3aGl0ZScsXHJcbiAgICAgICAgICAgICAgICBib3JkZXJSYWRpdXM6ICcxMnB4JyxcclxuICAgICAgICAgICAgICAgIGJveFNoYWRvdzogJzAgMXB4IDNweCByZ2JhKDAsMCwwLDAuMSknLFxyXG4gICAgICAgICAgICAgICAgYm9yZGVyOiAnMXB4IHNvbGlkICNlNWU3ZWInXHJcbiAgICAgICAgICAgICAgfX0+XHJcbiAgICAgICAgICAgICAgICA8ZGl2IHN0eWxlPXt7IGZvbnRTaXplOiAnMTRweCcsIGNvbG9yOiAnIzZiNzI4MCcsIG1hcmdpbkJvdHRvbTogJzhweCcsIGZvbnRXZWlnaHQ6ICc1MDAnIH19PlRvdGFsIFJldmVudWU8L2Rpdj5cclxuICAgICAgICAgICAgICAgIDxkaXYgc3R5bGU9e3sgZm9udFNpemU6ICcyNHB4JywgZm9udFdlaWdodDogJzcwMCcsIGNvbG9yOiAnIzFlMjkzYicgfX0+XHJcbiAgICAgICAgICAgICAgICAgIHtmb3JtYXRDdXJyZW5jeShkYXRhPy5vdmVydmlldz8udG90YWxSZXZlbnVlIHx8IDApfVxyXG4gICAgICAgICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgICAgICAgXHJcbiAgICAgICAgICAgICAgPGRpdiBzdHlsZT17e1xyXG4gICAgICAgICAgICAgICAgcGFkZGluZzogJzIwcHgnLFxyXG4gICAgICAgICAgICAgICAgYmFja2dyb3VuZENvbG9yOiAnd2hpdGUnLFxyXG4gICAgICAgICAgICAgICAgYm9yZGVyUmFkaXVzOiAnMTJweCcsXHJcbiAgICAgICAgICAgICAgICBib3hTaGFkb3c6ICcwIDFweCAzcHggcmdiYSgwLDAsMCwwLjEpJyxcclxuICAgICAgICAgICAgICAgIGJvcmRlcjogJzFweCBzb2xpZCAjZTVlN2ViJ1xyXG4gICAgICAgICAgICAgIH19PlxyXG4gICAgICAgICAgICAgICAgPGRpdiBzdHlsZT17eyBmb250U2l6ZTogJzE0cHgnLCBjb2xvcjogJyM2YjcyODAnLCBtYXJnaW5Cb3R0b206ICc4cHgnLCBmb250V2VpZ2h0OiAnNTAwJyB9fT5UcmFuc2FjdGlvbnM8L2Rpdj5cclxuICAgICAgICAgICAgICAgIDxkaXYgc3R5bGU9e3sgZm9udFNpemU6ICcyNHB4JywgZm9udFdlaWdodDogJzcwMCcsIGNvbG9yOiAnIzFlMjkzYicgfX0+XHJcbiAgICAgICAgICAgICAgICAgIHsoZGF0YT8ub3ZlcnZpZXc/LnRvdGFsVHJhbnNhY3Rpb25zIHx8IDApLnRvTG9jYWxlU3RyaW5nKCl9XHJcbiAgICAgICAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgICAgICBcclxuICAgICAgICAgICAgICA8ZGl2IHN0eWxlPXt7XHJcbiAgICAgICAgICAgICAgICBwYWRkaW5nOiAnMjBweCcsXHJcbiAgICAgICAgICAgICAgICBiYWNrZ3JvdW5kQ29sb3I6ICd3aGl0ZScsXHJcbiAgICAgICAgICAgICAgICBib3JkZXJSYWRpdXM6ICcxMnB4JyxcclxuICAgICAgICAgICAgICAgIGJveFNoYWRvdzogJzAgMXB4IDNweCByZ2JhKDAsMCwwLDAuMSknLFxyXG4gICAgICAgICAgICAgICAgYm9yZGVyOiAnMXB4IHNvbGlkICNlNWU3ZWInXHJcbiAgICAgICAgICAgICAgfX0+XHJcbiAgICAgICAgICAgICAgICA8ZGl2IHN0eWxlPXt7IGZvbnRTaXplOiAnMTRweCcsIGNvbG9yOiAnIzZiNzI4MCcsIG1hcmdpbkJvdHRvbTogJzhweCcsIGZvbnRXZWlnaHQ6ICc1MDAnIH19Pk1vbnRobHkgUmV2ZW51ZTwvZGl2PlxyXG4gICAgICAgICAgICAgICAgPGRpdiBzdHlsZT17eyBmb250U2l6ZTogJzI0cHgnLCBmb250V2VpZ2h0OiAnNzAwJywgY29sb3I6ICcjMWUyOTNiJyB9fT5cclxuICAgICAgICAgICAgICAgICAge2Zvcm1hdEN1cnJlbmN5KGRhdGE/Lm92ZXJ2aWV3Py5tb250aGx5UmV2ZW51ZSB8fCAwKX1cclxuICAgICAgICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICAgICAgIFxyXG4gICAgICAgICAgICAgIDxkaXYgc3R5bGU9e3tcclxuICAgICAgICAgICAgICAgIHBhZGRpbmc6ICcyMHB4JyxcclxuICAgICAgICAgICAgICAgIGJhY2tncm91bmRDb2xvcjogJ3doaXRlJyxcclxuICAgICAgICAgICAgICAgIGJvcmRlclJhZGl1czogJzEycHgnLFxyXG4gICAgICAgICAgICAgICAgYm94U2hhZG93OiAnMCAxcHggM3B4IHJnYmEoMCwwLDAsMC4xKScsXHJcbiAgICAgICAgICAgICAgICBib3JkZXI6ICcxcHggc29saWQgI2U1ZTdlYidcclxuICAgICAgICAgICAgICB9fT5cclxuICAgICAgICAgICAgICAgIDxkaXYgc3R5bGU9e3sgZm9udFNpemU6ICcxNHB4JywgY29sb3I6ICcjNmI3MjgwJywgbWFyZ2luQm90dG9tOiAnOHB4JywgZm9udFdlaWdodDogJzUwMCcgfX0+QXZnIFRyYW5zYWN0aW9uPC9kaXY+XHJcbiAgICAgICAgICAgICAgICA8ZGl2IHN0eWxlPXt7IGZvbnRTaXplOiAnMjRweCcsIGZvbnRXZWlnaHQ6ICc3MDAnLCBjb2xvcjogJyMxZTI5M2InIH19PlxyXG4gICAgICAgICAgICAgICAgICB7Zm9ybWF0Q3VycmVuY3koZGF0YT8ub3ZlcnZpZXc/LmF2Z1RyYW5zYWN0aW9uIHx8IDApfVxyXG4gICAgICAgICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgICAgIDwvZGl2PlxyXG5cclxuICAgICAgICAgICAgPGRpdiBzdHlsZT17e1xyXG4gICAgICAgICAgICAgIGJhY2tncm91bmRDb2xvcjogJ3doaXRlJyxcclxuICAgICAgICAgICAgICBib3JkZXJSYWRpdXM6ICcxMnB4JyxcclxuICAgICAgICAgICAgICBib3hTaGFkb3c6ICcwIDFweCAzcHggcmdiYSgwLDAsMCwwLjEpJyxcclxuICAgICAgICAgICAgICBib3JkZXI6ICcxcHggc29saWQgI2U1ZTdlYicsXHJcbiAgICAgICAgICAgICAgcGFkZGluZzogJzI0cHgnXHJcbiAgICAgICAgICAgIH19PlxyXG4gICAgICAgICAgICAgIDxoMyBzdHlsZT17eyBtYXJnaW46ICcwIDAgMTZweCAwJywgZm9udFNpemU6ICcxOHB4JywgZm9udFdlaWdodDogJzYwMCcsIGNvbG9yOiAnIzFlMjkzYicgfX0+XHJcbiAgICAgICAgICAgICAgICBGaW5hbmNpYWwgT3ZlcnZpZXdcclxuICAgICAgICAgICAgICA8L2gzPlxyXG4gICAgICAgICAgICAgIDxwIHN0eWxlPXt7IG1hcmdpbjogJzAnLCBjb2xvcjogJyM2YjcyODAnLCBmb250U2l6ZTogJzE0cHgnIH19PlxyXG4gICAgICAgICAgICAgICAgRmluYW5jaWFsIGFuYWx5dGljcyBwcm92aWRlIGluc2lnaHRzIGludG8gcmV2ZW51ZSB0cmVuZHMsIHBheW1lbnQgcGF0dGVybnMsIGFuZCB0cmFuc2FjdGlvbiBkYXRhLlxyXG4gICAgICAgICAgICAgICAge2RhdGE/Lm92ZXJ2aWV3Py50b3RhbFJldmVudWUgPiAwIFxyXG4gICAgICAgICAgICAgICAgICA/IGAgQ3VycmVudCB0b3RhbCByZXZlbnVlIHN0YW5kcyBhdCAke2Zvcm1hdEN1cnJlbmN5KGRhdGEub3ZlcnZpZXcudG90YWxSZXZlbnVlKX0gYWNyb3NzICR7KGRhdGEub3ZlcnZpZXcudG90YWxUcmFuc2FjdGlvbnMgfHwgMCkudG9Mb2NhbGVTdHJpbmcoKX0gdHJhbnNhY3Rpb25zLmBcclxuICAgICAgICAgICAgICAgICAgOiAnIE5vIHBheW1lbnQgZGF0YSBhdmFpbGFibGUgeWV0LidcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICA8L3A+XHJcbiAgICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgKX1cclxuICAgICAgPC9kaXY+XHJcbiAgICA8L2Rpdj5cclxuICApO1xyXG59IiwiQWRtaW5KUy5Vc2VyQ29tcG9uZW50cyA9IHt9XG5pbXBvcnQgRGFzaGJvYXJkIGZyb20gJy4uLy4uL2Zyb250ZW5kL2FkbWluLWNvbXBvbmVudHMvZGFzaGJvYXJkJ1xuQWRtaW5KUy5Vc2VyQ29tcG9uZW50cy5EYXNoYm9hcmQgPSBEYXNoYm9hcmRcbmltcG9ydCBBbmFseXRpY3MgZnJvbSAnLi4vLi4vZnJvbnRlbmQvYWRtaW4tY29tcG9uZW50cy9hbmFseXRpY3MnXG5BZG1pbkpTLlVzZXJDb21wb25lbnRzLkFuYWx5dGljcyA9IEFuYWx5dGljcyJdLCJuYW1lcyI6WyJhcGkiLCJBcGlDbGllbnQiLCJEYXNoYm9hcmQiLCJ0cmFuc2xhdGVNZXNzYWdlIiwidXNlVHJhbnNsYXRpb24iLCJkYXRhIiwic2V0RGF0YSIsInVzZVN0YXRlIiwibG9hZGluZyIsInNldExvYWRpbmciLCJlcnJvciIsInNldEVycm9yIiwiYWRtaW5Mb2dzIiwic2V0QWRtaW5Mb2dzIiwidXNlckxvZ3MiLCJzZXRVc2VyTG9ncyIsImZldGNoaW5nUmVmIiwidXNlUmVmIiwibW91bnRlZFJlZiIsImZldGNoRGFzaGJvYXJkRGF0YSIsInVzZUNhbGxiYWNrIiwiY3VycmVudCIsInJlc3BvbnNlIiwiZ2V0RGFzaGJvYXJkIiwiYWxsTG9ncyIsInJlY2VudExvZ3MiLCJhZG1pbnMiLCJmaWx0ZXIiLCJsb2ciLCJyb2xlX2lkIiwiZmlyc3RfbmFtZSIsInNsaWNlIiwidXNlcnMiLCJFcnJvciIsImVyciIsIm1lc3NhZ2UiLCJ1c2VFZmZlY3QiLCJyZWZyZXNoSW50ZXJ2YWwiLCJzZXRJbnRlcnZhbCIsImNsZWFySW50ZXJ2YWwiLCJsb2dJbnRlcnZhbCIsImZldGNoIiwib2siLCJuZXdMb2dzIiwianNvbiIsImhhbmRsZVJlZnJlc2giLCJSZWFjdCIsImNyZWF0ZUVsZW1lbnQiLCJzdHlsZSIsImRpc3BsYXkiLCJqdXN0aWZ5Q29udGVudCIsImFsaWduSXRlbXMiLCJoZWlnaHQiLCJmb250U2l6ZSIsImNvbG9yIiwibWV0cmljcyIsInN0YXRzQ2FyZHMiLCJ0aXRsZSIsInZhbHVlIiwidXNlcnNDb3VudCIsImxpbmsiLCJjbGllbnRzQ291bnQiLCJmcmVlbGFuY2Vyc0NvdW50IiwicHJvamVjdHNDb3VudCIsInBlbmRpbmdBcHBvaW50bWVudHMiLCJjb3Vyc2VzQ291bnQiLCJwbGFuc0NvdW50IiwidG90YWxSZXZlbnVlIiwidG9Mb2NhbGVTdHJpbmciLCJoYW5kbGVDYXJkQ2xpY2siLCJ3aW5kb3ciLCJsb2NhdGlvbiIsImhyZWYiLCJnZXRUaW1lQWdvIiwiZGF0ZVN0cmluZyIsIm5vdyIsIkRhdGUiLCJsb2dUaW1lIiwiZGlmZk1zIiwiZGlmZlNlY3MiLCJNYXRoIiwiZmxvb3IiLCJkaWZmTWlucyIsImRpZmZIb3VycyIsInRvTG9jYWxlRGF0ZVN0cmluZyIsImNvbnRhaW5lclN0eWxlIiwiYmFja2dyb3VuZENvbG9yIiwibWluSGVpZ2h0IiwicGFkZGluZyIsImZvbnRGYW1pbHkiLCJoZWFkZXJTdHlsZSIsIm1hcmdpbkJvdHRvbSIsInBhZGRpbmdCb3R0b20iLCJib3JkZXJCb3R0b20iLCJyZWZyZXNoQnV0dG9uU3R5bGUiLCJib3JkZXIiLCJib3JkZXJSYWRpdXMiLCJjdXJzb3IiLCJ0cmFuc2l0aW9uIiwibWV0cmljc0dyaWRTdHlsZSIsImdyaWRUZW1wbGF0ZUNvbHVtbnMiLCJnYXAiLCJjYXJkU3R5bGUiLCJib3hTaGFkb3ciLCJjYXJkVGl0bGVTdHlsZSIsImZvbnRXZWlnaHQiLCJtYXJnaW4iLCJ0ZXh0VHJhbnNmb3JtIiwibGV0dGVyU3BhY2luZyIsImNhcmRWYWx1ZVN0eWxlIiwibG9nc0NvbnRhaW5lclN0eWxlIiwibG9nU2VjdGlvblN0eWxlIiwib3ZlcmZsb3ciLCJsb2dIZWFkZXJTdHlsZSIsImxvZ0l0ZW1TdHlsZSIsImxvZ0l0ZW1OYW1lU3R5bGUiLCJsb2dJdGVtQWN0aW9uU3R5bGUiLCJvcGFjaXR5IiwibG9nSXRlbVRpbWVTdHlsZSIsImVtcHR5U3RhdGVTdHlsZSIsInRleHRBbGlnbiIsImZvbnRTdHlsZSIsIm9uQ2xpY2siLCJvbk1vdXNlT3ZlciIsImUiLCJ0YXJnZXQiLCJvbk1vdXNlT3V0Iiwid2lkdGgiLCJ2aWV3Qm94IiwiZmlsbCIsInN0cm9rZSIsInN0cm9rZVdpZHRoIiwiZCIsIm1hcCIsImNhcmQiLCJpbmRleCIsImtleSIsImN1cnJlbnRUYXJnZXQiLCJib3JkZXJDb2xvciIsImxlbmd0aCIsImkiLCJpZCIsImxhc3RfbmFtZSIsImFjdGlvbiIsImNyZWF0ZWRfYXQiLCJBbmFseXRpY3MiLCJhY3RpdmVUYWIiLCJzZXRBY3RpdmVUYWIiLCJkYXRlUmFuZ2UiLCJzZXREYXRlUmFuZ2UiLCJmZXRjaEFuYWx5dGljc0RhdGEiLCJhbmFseXRpY3NEYXRhIiwiY29uc29sZSIsIm92ZXJ2aWV3IiwiYXBwb2ludG1lbnRzIiwiYXBwb2ludG1lbnRTdGF0cyIsInRvcEZyZWVsYW5jZXJzIiwicmVjZW50QXBwb2ludG1lbnRzIiwidXNlckdyb3d0aCIsInVzZXJEaXN0cmlidXRpb24iLCJyZWNlbnRVc2VycyIsInByb2plY3RTdGF0cyIsImJ5U3RhdHVzIiwiZm9ybWF0Q3VycmVuY3kiLCJhbW91bnQiLCJJbnRsIiwiTnVtYmVyRm9ybWF0IiwiY3VycmVuY3kiLCJmb3JtYXQiLCJmb3JtYXREYXRlIiwibW9udGgiLCJkYXkiLCJmb3JtYXRQZXJjZW50YWdlIiwidG9GaXhlZCIsImJvcmRlclRvcCIsImFuaW1hdGlvbiIsIm9uQ2hhbmdlIiwibGFiZWwiLCJ0YWIiLCJiYWNrZ3JvdW5kIiwidG90YWxVc2VycyIsIm1hcmdpblRvcCIsIm5ld1VzZXJzVG9kYXkiLCJ0b3RhbEFwcG9pbnRtZW50cyIsImFwcG9pbnRtZW50c1RvZGF5IiwiYWN0aXZlUHJvamVjdHMiLCJjb21wbGV0ZWRQcm9qZWN0cyIsIm1vbnRobHlSZXZlbnVlIiwibWF4SGVpZ2h0Iiwib3ZlcmZsb3dZIiwiYm9yZGVyQ29sbGFwc2UiLCJwb3NpdGlvbiIsInRvcCIsImFwcG9pbnRtZW50IiwiYXBwb2ludG1lbnRfdHlwZSIsInN0YXR1cyIsImNoYXJBdCIsInRvVXBwZXJDYXNlIiwiZnJlZWxhbmNlcl9maXJzdF9uYW1lIiwiZnJlZWxhbmNlcl9sYXN0X25hbWUiLCJtYXJnaW5SaWdodCIsImFjY2VwdGVkQXBwb2ludG1lbnRzIiwicmVqZWN0ZWRBcHBvaW50bWVudHMiLCJhY2NlcHRhbmNlUmF0ZSIsImZyZWVsYW5jZXIiLCJlbWFpbCIsInRvdGFsX2FwcG9pbnRtZW50cyIsImFjY2VwdGVkX2FwcG9pbnRtZW50cyIsImFjY2VwdGFuY2VfcmF0ZSIsInRvdGFsQ2xpZW50cyIsInRvdGFsRnJlZWxhbmNlcnMiLCJuZXdVc2Vyc01vbnRoIiwidXNlciIsImRyYWZ0UHJvamVjdHMiLCJ0b3RhbFByb2plY3RzIiwiZmxleFdyYXAiLCJjb3VudCIsInRvdGFsVHJhbnNhY3Rpb25zIiwiYXZnVHJhbnNhY3Rpb24iLCJBZG1pbkpTIiwiVXNlckNvbXBvbmVudHMiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7RUFBQTtFQUlBLE1BQU1BLEdBQUcsR0FBRyxJQUFJQyxpQkFBUyxFQUFFO0VBRVosU0FBU0MsU0FBU0EsR0FBRztJQUNsQyxNQUFNO0VBQUVDLElBQUFBO0tBQWtCLEdBQUdDLHNCQUFjLEVBQUU7SUFDN0MsTUFBTSxDQUFDQyxJQUFJLEVBQUVDLE9BQU8sQ0FBQyxHQUFHQyxjQUFRLENBQUMsSUFBSSxDQUFDO0lBQ3RDLE1BQU0sQ0FBQ0MsT0FBTyxFQUFFQyxVQUFVLENBQUMsR0FBR0YsY0FBUSxDQUFDLElBQUksQ0FBQztJQUM1QyxNQUFNLENBQUNHLEtBQUssRUFBRUMsUUFBUSxDQUFDLEdBQUdKLGNBQVEsQ0FBQyxJQUFJLENBQUM7SUFDeEMsTUFBTSxDQUFDSyxTQUFT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
