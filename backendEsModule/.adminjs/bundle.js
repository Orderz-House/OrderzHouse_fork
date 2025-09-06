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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYnVuZGxlLmpzIiwic291cmNlcyI6WyIuLi8uLi9mcm9udGVuZC9hZG1pbi1jb21wb25lbnRzL2Rhc2hib2FyZC5qc3giLCIuLi8uLi9mcm9udGVuZC9hZG1pbi1jb21wb25lbnRzL2FuYWx5dGljcy5qc3giLCIuLi8uLi9mcm9udGVuZC9hZG1pbi1jb21wb25lbnRzL2NvdXJzZS1jb21wb25lbnRzLmpzeCIsImVudHJ5LmpzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIEFkbWluL2NvbXBvbmVudHMvRGFzaGJvYXJkLmpzeFxuaW1wb3J0IFJlYWN0LCB7IHVzZUVmZmVjdCwgdXNlU3RhdGUsIHVzZUNhbGxiYWNrLCB1c2VSZWYgfSBmcm9tIFwicmVhY3RcIjtcbmltcG9ydCB7IEFwaUNsaWVudCwgdXNlVHJhbnNsYXRpb24gfSBmcm9tIFwiYWRtaW5qc1wiO1xuXG5jb25zdCBhcGkgPSBuZXcgQXBpQ2xpZW50KCk7XG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIERhc2hib2FyZCgpIHtcbiAgY29uc3QgeyB0cmFuc2xhdGVNZXNzYWdlIH0gPSB1c2VUcmFuc2xhdGlvbigpO1xuICBjb25zdCBbZGF0YSwgc2V0RGF0YV0gPSB1c2VTdGF0ZShudWxsKTtcbiAgY29uc3QgW2xvYWRpbmcsIHNldExvYWRpbmddID0gdXNlU3RhdGUodHJ1ZSk7XG4gIGNvbnN0IFtlcnJvciwgc2V0RXJyb3JdID0gdXNlU3RhdGUobnVsbCk7XG4gIGNvbnN0IFthZG1pbkxvZ3MsIHNldEFkbWluTG9nc10gPSB1c2VTdGF0ZShbXSk7XG4gIGNvbnN0IFt1c2VyTG9ncywgc2V0VXNlckxvZ3NdID0gdXNlU3RhdGUoW10pO1xuICBjb25zdCBmZXRjaGluZ1JlZiA9IHVzZVJlZihmYWxzZSk7XG4gIGNvbnN0IG1vdW50ZWRSZWYgPSB1c2VSZWYodHJ1ZSk7XG5cbiAgY29uc3QgZmV0Y2hEYXNoYm9hcmREYXRhID0gdXNlQ2FsbGJhY2soYXN5bmMgKCkgPT4ge1xuICAgIGlmIChmZXRjaGluZ1JlZi5jdXJyZW50KSByZXR1cm47XG5cbiAgICBmZXRjaGluZ1JlZi5jdXJyZW50ID0gdHJ1ZTtcblxuICAgIHRyeSB7XG4gICAgICBjb25zdCByZXNwb25zZSA9IGF3YWl0IGFwaS5nZXREYXNoYm9hcmQoKTtcbiAgICAgIGlmICghbW91bnRlZFJlZi5jdXJyZW50KSByZXR1cm47XG5cbiAgICAgIGlmIChyZXNwb25zZT8uZGF0YSkge1xuICAgICAgICBzZXREYXRhKHJlc3BvbnNlLmRhdGEpO1xuXG4gICAgICAgIGNvbnN0IGFsbExvZ3MgPSByZXNwb25zZS5kYXRhLnJlY2VudExvZ3MgfHwgW107XG4gICAgICAgIGNvbnN0IGFkbWlucyA9IGFsbExvZ3MuZmlsdGVyKFxuICAgICAgICAgIChsb2cpID0+IGxvZy5yb2xlX2lkID09PSAxIHx8IGxvZy5maXJzdF9uYW1lID09PSBcIlN5c3RlbVwiXG4gICAgICAgICkuc2xpY2UoMCwgNSk7XG4gICAgICAgIGNvbnN0IHVzZXJzID0gYWxsTG9ncy5maWx0ZXIoXG4gICAgICAgICAgKGxvZykgPT4gbG9nLnJvbGVfaWQgIT09IDEgJiYgbG9nLmZpcnN0X25hbWUgIT09IFwiU3lzdGVtXCJcbiAgICAgICAgKS5zbGljZSgwLCA1KTtcblxuICAgICAgICBzZXRBZG1pbkxvZ3MoYWRtaW5zKTtcbiAgICAgICAgc2V0VXNlckxvZ3ModXNlcnMpO1xuICAgICAgICBzZXRFcnJvcihudWxsKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihcIk5vIGRhdGEgcmVjZWl2ZWQgZnJvbSBBUElcIik7XG4gICAgICB9XG4gICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICBpZiAoIW1vdW50ZWRSZWYuY3VycmVudCkgcmV0dXJuO1xuICAgICAgc2V0RXJyb3IoZXJyPy5tZXNzYWdlIHx8IFwiRmFpbGVkIHRvIGxvYWQgZGFzaGJvYXJkIGRhdGFcIik7XG4gICAgfSBmaW5hbGx5IHtcbiAgICAgIGlmIChtb3VudGVkUmVmLmN1cnJlbnQpIHNldExvYWRpbmcoZmFsc2UpO1xuICAgICAgZmV0Y2hpbmdSZWYuY3VycmVudCA9IGZhbHNlO1xuICAgIH1cbiAgfSwgW10pO1xuXG4gIHVzZUVmZmVjdCgoKSA9PiB7XG4gICAgbW91bnRlZFJlZi5jdXJyZW50ID0gdHJ1ZTtcbiAgICBmZXRjaERhc2hib2FyZERhdGEoKTtcbiAgICByZXR1cm4gKCkgPT4ge1xuICAgICAgbW91bnRlZFJlZi5jdXJyZW50ID0gZmFsc2U7XG4gICAgfTtcbiAgfSwgW10pO1xuXG4gIC8vIFJlYWwtdGltZSBkYXRhIHVwZGF0ZXMgZXZlcnkgMTAgc2Vjb25kc1xuICB1c2VFZmZlY3QoKCkgPT4ge1xuICAgIGNvbnN0IHJlZnJlc2hJbnRlcnZhbCA9IHNldEludGVydmFsKCgpID0+IHtcbiAgICAgIGlmICghZmV0Y2hpbmdSZWYuY3VycmVudCAmJiBtb3VudGVkUmVmLmN1cnJlbnQpIHtcbiAgICAgICAgZmV0Y2hEYXNoYm9hcmREYXRhKCk7XG4gICAgICB9XG4gICAgfSwgMTAwMDApO1xuICAgIHJldHVybiAoKSA9PiBjbGVhckludGVydmFsKHJlZnJlc2hJbnRlcnZhbCk7XG4gIH0sIFtmZXRjaERhc2hib2FyZERhdGFdKTtcblxuICAvLyBSZWFsLXRpbWUgbG9nIHVwZGF0ZXMgZXZlcnkgNSBzZWNvbmRzXG4gIHVzZUVmZmVjdCgoKSA9PiB7XG4gICAgY29uc3QgbG9nSW50ZXJ2YWwgPSBzZXRJbnRlcnZhbChhc3luYyAoKSA9PiB7XG4gICAgICBpZiAoIW1vdW50ZWRSZWYuY3VycmVudCB8fCBmZXRjaGluZ1JlZi5jdXJyZW50KSByZXR1cm47XG4gICAgICB0cnkge1xuICAgICAgICBjb25zdCByZXNwb25zZSA9IGF3YWl0IGZldGNoKFwiL2FwaS9hZG1pbi9kYXNoYm9hcmQvbG9nc1wiKTtcbiAgICAgICAgaWYgKHJlc3BvbnNlLm9rKSB7XG4gICAgICAgICAgY29uc3QgbmV3TG9ncyA9IGF3YWl0IHJlc3BvbnNlLmpzb24oKTtcbiAgICAgICAgICBpZiAobW91bnRlZFJlZi5jdXJyZW50ICYmIG5ld0xvZ3M/LnJlY2VudExvZ3MpIHtcbiAgICAgICAgICAgIGNvbnN0IGFsbExvZ3MgPSBuZXdMb2dzLnJlY2VudExvZ3M7XG4gICAgICAgICAgICBjb25zdCBhZG1pbnMgPSBhbGxMb2dzLmZpbHRlcihcbiAgICAgICAgICAgICAgKGxvZykgPT4gbG9nLnJvbGVfaWQgPT09IDEgfHwgbG9nLmZpcnN0X25hbWUgPT09IFwiU3lzdGVtXCJcbiAgICAgICAgICAgICkuc2xpY2UoMCwgNSk7XG4gICAgICAgICAgICBjb25zdCB1c2VycyA9IGFsbExvZ3MuZmlsdGVyKFxuICAgICAgICAgICAgICAobG9nKSA9PiBsb2cucm9sZV9pZCAhPT0gMSAmJiBsb2cuZmlyc3RfbmFtZSAhPT0gXCJTeXN0ZW1cIlxuICAgICAgICAgICAgKS5zbGljZSgwLCA1KTtcbiAgICAgICAgICAgIHNldEFkbWluTG9ncyhhZG1pbnMpO1xuICAgICAgICAgICAgc2V0VXNlckxvZ3ModXNlcnMpO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfSBjYXRjaCB7fVxuICAgIH0sIDUwMDApO1xuICAgIHJldHVybiAoKSA9PiBjbGVhckludGVydmFsKGxvZ0ludGVydmFsKTtcbiAgfSwgW10pO1xuXG4gIGNvbnN0IGhhbmRsZVJlZnJlc2ggPSB1c2VDYWxsYmFjaygoKSA9PiB7XG4gICAgZmV0Y2hEYXNoYm9hcmREYXRhKCk7XG4gIH0sIFtmZXRjaERhc2hib2FyZERhdGFdKTtcblxuICBpZiAobG9hZGluZyAmJiAhZGF0YSkge1xuICAgIHJldHVybiAoXG4gICAgICA8ZGl2IHN0eWxlPXt7XG4gICAgICAgIGRpc3BsYXk6ICdmbGV4JyxcbiAgICAgICAganVzdGlmeUNvbnRlbnQ6ICdjZW50ZXInLFxuICAgICAgICBhbGlnbkl0ZW1zOiAnY2VudGVyJyxcbiAgICAgICAgaGVpZ2h0OiAnNDAwcHgnLFxuICAgICAgICBmb250U2l6ZTogJzE2cHgnLFxuICAgICAgICBjb2xvcjogJyM2YjcyODAnXG4gICAgICB9fT5cbiAgICAgICAgTG9hZGluZyBEYXNoYm9hcmQuLi5cbiAgICAgIDwvZGl2PlxuICAgICk7XG4gIH1cblxuICBjb25zdCBtZXRyaWNzID0gZGF0YT8ubWV0cmljcyB8fCB7fTtcblxuICBjb25zdCBzdGF0c0NhcmRzID0gW1xuICAgIHsgdGl0bGU6IFwiVG90YWwgQWRtaW5zXCIsIHZhbHVlOiBtZXRyaWNzLmFkbWluc0NvdW50IHx8IDAsIGxpbms6IFwiL2FkbWluL3Jlc291cmNlcy9hZG1pbnNcIiwgY29sb3I6IFwiIzNiODJmNlwiIH0sXG4gICAgeyB0aXRsZTogXCJDbGllbnRzXCIsIHZhbHVlOiBtZXRyaWNzLmNsaWVudHNDb3VudCB8fCAwLCBsaW5rOiBcIi9hZG1pbi9yZXNvdXJjZXMvY2xpZW50c1wiLCBjb2xvcjogXCIjMTBiOTgxXCIgfSxcbiAgICB7IHRpdGxlOiBcIkZyZWVsYW5jZXJzXCIsIHZhbHVlOiBtZXRyaWNzLmZyZWVsYW5jZXJzQ291bnQgfHwgMCwgbGluazogXCIvYWRtaW4vcmVzb3VyY2VzL2ZyZWVsYW5jZXJzXCIsIGNvbG9yOiBcIiNmNTllMGJcIiB9LFxuICAgIHsgdGl0bGU6IFwiQWN0aXZlIFByb2plY3RzXCIsIHZhbHVlOiBtZXRyaWNzLnByb2plY3RzQ291bnQgfHwgMCwgbGluazogXCIvYWRtaW4vcmVzb3VyY2VzL3Byb2plY3RzXCIsIGNvbG9yOiBcIiNlZjQ0NDRcIiB9LFxuICAgIHsgdGl0bGU6IFwiUGVuZGluZyBBcHBvaW50bWVudHNcIiwgdmFsdWU6IG1ldHJpY3MucGVuZGluZ0FwcG9pbnRtZW50cyB8fCAwLCBsaW5rOiBcIi9hZG1pbi9yZXNvdXJjZXMvYXBwb2ludG1lbnRzXCIsIGNvbG9yOiBcIiM4YjVjZjZcIiB9LFxuICAgIHsgdGl0bGU6IFwiQ291cnNlc1wiLCB2YWx1ZTogbWV0cmljcy5jb3Vyc2VzQ291bnQgfHwgMCwgbGluazogXCIvYWRtaW4vcmVzb3VyY2VzL2NvdXJzZXNcIiwgY29sb3I6IFwiIzA2YjZkNFwiIH0sXG4gICAgeyB0aXRsZTogXCJQbGFuc1wiLCB2YWx1ZTogbWV0cmljcy5wbGFuc0NvdW50IHx8IDAsIGxpbms6IFwiL2FkbWluL3Jlc291cmNlcy9wbGFuc1wiLCBjb2xvcjogXCIjODRjYzE2XCIgfSxcbiAgICB7IHRpdGxlOiBcIlRvdGFsIFJldmVudWVcIiwgdmFsdWU6IGAkJHsobWV0cmljcy50b3RhbFJldmVudWUgfHwgMCkudG9Mb2NhbGVTdHJpbmcoKX1gLCBsaW5rOiBcIi9hZG1pbi9yZXNvdXJjZXMvcGF5bWVudHNcIiwgY29sb3I6IFwiIzIyYzU1ZVwiIH0sXG4gICAgeyB0aXRsZTogXCJBbmFseXRpY3NcIiwgdmFsdWU6IFwiVmlldyBSZXBvcnRzXCIsIGxpbms6IFwiL2FkbWluL3BhZ2VzL2FuYWx5dGljc1wiLCBjb2xvcjogXCIjNjM2NmYxXCIgfSxcbiAgXTtcblxuICBjb25zdCBoYW5kbGVDYXJkQ2xpY2sgPSAobGluaykgPT4ge1xuICAgIHdpbmRvdy5sb2NhdGlvbi5ocmVmID0gbGluaztcbiAgfTtcblxuICBjb25zdCBnZXRUaW1lQWdvID0gKGRhdGVTdHJpbmcpID0+IHtcbiAgICBpZiAoIWRhdGVTdHJpbmcpIHJldHVybiBcIlwiO1xuICAgIHRyeSB7XG4gICAgICBjb25zdCBub3cgPSBuZXcgRGF0ZSgpO1xuICAgICAgY29uc3QgbG9nVGltZSA9IG5ldyBEYXRlKGRhdGVTdHJpbmcpO1xuICAgICAgY29uc3QgZGlmZk1zID0gbm93IC0gbG9nVGltZTtcbiAgICAgIGNvbnN0IGRpZmZTZWNzID0gTWF0aC5mbG9vcihkaWZmTXMgLyAxMDAwKTtcbiAgICAgIGlmIChkaWZmU2VjcyA8IDYwKSByZXR1cm4gYCR7ZGlmZlNlY3N9cyBhZ29gO1xuICAgICAgY29uc3QgZGlmZk1pbnMgPSBNYXRoLmZsb29yKGRpZmZTZWNzIC8gNjApO1xuICAgICAgaWYgKGRpZmZNaW5zIDwgNjApIHJldHVybiBgJHtkaWZmTWluc31tIGFnb2A7XG4gICAgICBjb25zdCBkaWZmSG91cnMgPSBNYXRoLmZsb29yKGRpZmZNaW5zIC8gNjApO1xuICAgICAgaWYgKGRpZmZIb3VycyA8IDI0KSByZXR1cm4gYCR7ZGlmZkhvdXJzfWggYWdvYDtcbiAgICAgIHJldHVybiBsb2dUaW1lLnRvTG9jYWxlRGF0ZVN0cmluZygpO1xuICAgIH0gY2F0Y2gge1xuICAgICAgcmV0dXJuIFwiXCI7XG4gICAgfVxuICB9O1xuXG4gIGNvbnN0IGNvbnRhaW5lclN0eWxlID0ge1xuICAgIGJhY2tncm91bmRDb2xvcjogJyNmZmZmZmYnLFxuICAgIG1pbkhlaWdodDogJzEwMHZoJyxcbiAgICBwYWRkaW5nOiAnMjBweCcsXG4gICAgZm9udEZhbWlseTogJy1hcHBsZS1zeXN0ZW0sIEJsaW5rTWFjU3lzdGVtRm9udCwgXCJTZWdvZSBVSVwiLCBSb2JvdG8sIFwiSGVsdmV0aWNhIE5ldWVcIiwgQXJpYWwsIHNhbnMtc2VyaWYnXG4gIH07XG5cbiAgY29uc3QgaGVhZGVyU3R5bGUgPSB7XG4gICAgZGlzcGxheTogJ2ZsZXgnLFxuICAgIGp1c3RpZnlDb250ZW50OiAnc3BhY2UtYmV0d2VlbicsXG4gICAgYWxpZ25JdGVtczogJ2NlbnRlcicsXG4gICAgbWFyZ2luQm90dG9tOiAnMzBweCcsXG4gICAgcGFkZGluZ0JvdHRvbTogJzIwcHgnLFxuICAgIGJvcmRlckJvdHRvbTogJzFweCBzb2xpZCAjZTVlN2ViJ1xuICB9O1xuXG4gIGNvbnN0IGRhc2hib2FyZFRpdGxlU3R5bGUgPSB7XG4gICAgZm9udFNpemU6ICcxNnB4JyxcbiAgICBmb250V2VpZ2h0OiAnNTAwJyxcbiAgICBjb2xvcjogJyMwMDAwMDAnLFxuICAgIG1hcmdpbjogJzAnXG4gIH07XG5cbiAgY29uc3QgcmVmcmVzaEJ1dHRvblN0eWxlID0ge1xuICAgIGJhY2tncm91bmRDb2xvcjogJyNmOGY5ZmEnLFxuICAgIGJvcmRlcjogJzFweCBzb2xpZCAjZTllY2VmJyxcbiAgICBib3JkZXJSYWRpdXM6ICc2cHgnLFxuICAgIHBhZGRpbmc6ICc4cHgnLFxuICAgIGN1cnNvcjogJ3BvaW50ZXInLFxuICAgIHRyYW5zaXRpb246ICdhbGwgMC4ycycsXG4gICAgZGlzcGxheTogJ2ZsZXgnLFxuICAgIGFsaWduSXRlbXM6ICdjZW50ZXInLFxuICAgIGp1c3RpZnlDb250ZW50OiAnY2VudGVyJyxcbiAgICBjb2xvcjogJyMwMDAwMDAnXG4gIH07XG5cbiAgY29uc3QgbWV0cmljc0dyaWRTdHlsZSA9IHtcbiAgICBkaXNwbGF5OiAnZ3JpZCcsXG4gICAgZ3JpZFRlbXBsYXRlQ29sdW1uczogJ3JlcGVhdChhdXRvLWZpdCwgbWlubWF4KDI4MHB4LCAxZnIpKScsXG4gICAgZ2FwOiAnMjRweCcsXG4gICAgbWFyZ2luQm90dG9tOiAnNDBweCdcbiAgfTtcblxuICBjb25zdCBjYXJkU3R5bGUgPSB7XG4gICAgYmFja2dyb3VuZENvbG9yOiAnI2ZmZmZmZicsXG4gICAgcGFkZGluZzogJzI0cHgnLFxuICAgIGJvcmRlcjogJzFweCBzb2xpZCAjZTllY2VmJyxcbiAgICBib3JkZXJSYWRpdXM6ICc4cHgnLFxuICAgIGN1cnNvcjogJ3BvaW50ZXInLFxuICAgIHRyYW5zaXRpb246ICdhbGwgMC4ycyBlYXNlJyxcbiAgICBib3hTaGFkb3c6ICcwIDFweCAzcHggcmdiYSgwLCAwLCAwLCAwLjEpJ1xuICB9O1xuXG4gIGNvbnN0IGNhcmRUaXRsZVN0eWxlID0ge1xuICAgIGZvbnRTaXplOiAnMTJweCcsXG4gICAgZm9udFdlaWdodDogJzUwMCcsXG4gICAgY29sb3I6ICcjNmI3MjgwJyxcbiAgICBtYXJnaW46ICcwIDAgOHB4IDAnLFxuICAgIHRleHRUcmFuc2Zvcm06ICd1cHBlcmNhc2UnLFxuICAgIGxldHRlclNwYWNpbmc6ICcwLjhweCdcbiAgfTtcblxuICBjb25zdCBjYXJkVmFsdWVTdHlsZSA9ICgpID0+ICh7XG4gICAgZm9udFNpemU6ICcyOHB4JyxcbiAgICBmb250V2VpZ2h0OiAnNzAwJyxcbiAgICBjb2xvcjogJyMwMDAwMDAnLFxuICAgIG1hcmdpbjogJzAnXG4gIH0pO1xuXG4gIGNvbnN0IGxvZ3NDb250YWluZXJTdHlsZSA9IHtcbiAgICBkaXNwbGF5OiAnZ3JpZCcsXG4gICAgZ3JpZFRlbXBsYXRlQ29sdW1uczogJzFmciAxZnInLFxuICAgIGdhcDogJzI0cHgnXG4gIH07XG5cbiAgY29uc3QgbG9nU2VjdGlvblN0eWxlID0ge1xuICAgIGJhY2tncm91bmRDb2xvcjogJyNmZmZmZmYnLFxuICAgIGJvcmRlcjogJzFweCBzb2xpZCAjZTllY2VmJyxcbiAgICBib3JkZXJSYWRpdXM6ICc4cHgnLFxuICAgIG92ZXJmbG93OiAnaGlkZGVuJyxcbiAgICBib3hTaGFkb3c6ICcwIDFweCAzcHggcmdiYSgwLCAwLCAwLCAwLjEpJ1xuICB9O1xuXG4gIGNvbnN0IGxvZ0hlYWRlclN0eWxlID0ge1xuICAgIGZvbnRTaXplOiAnMTZweCcsXG4gICAgZm9udFdlaWdodDogJzYwMCcsXG4gICAgY29sb3I6ICcjMDAwMDAwJyxcbiAgICBtYXJnaW46ICcwJyxcbiAgICBwYWRkaW5nOiAnMTZweCAyMHB4JyxcbiAgICBiYWNrZ3JvdW5kQ29sb3I6ICcjZjhmOWZhJyxcbiAgICBib3JkZXJCb3R0b206ICcxcHggc29saWQgI2U5ZWNlZidcbiAgfTtcblxuICBjb25zdCBsb2dJdGVtU3R5bGUgPSB7XG4gICAgcGFkZGluZzogJzE2cHggMjBweCcsXG4gICAgYm9yZGVyQm90dG9tOiAnMXB4IHNvbGlkICNmMWYzZjQnXG4gIH07XG5cbiAgY29uc3QgbG9nSXRlbU5hbWVTdHlsZSA9IHtcbiAgICBmb250V2VpZ2h0OiAnNjAwJyxcbiAgICBjb2xvcjogJyMwMDAwMDAnLFxuICAgIGZvbnRTaXplOiAnMTRweCcsXG4gICAgbWFyZ2luQm90dG9tOiAnNHB4J1xuICB9O1xuXG4gIGNvbnN0IGxvZ0l0ZW1BY3Rpb25TdHlsZSA9IHtcbiAgICBjb2xvcjogJyMwMDAwMDAnLFxuICAgIGZvbnRTaXplOiAnMTNweCcsXG4gICAgbWFyZ2luQm90dG9tOiAnNHB4JyxcbiAgICBvcGFjaXR5OiAnMC44J1xuICB9O1xuXG4gIGNvbnN0IGxvZ0l0ZW1UaW1lU3R5bGUgPSB7XG4gICAgZm9udFNpemU6ICcxMnB4JyxcbiAgICBjb2xvcjogJyMwMDAwMDAnLFxuICAgIG9wYWNpdHk6ICcwLjYnXG4gIH07XG5cbiAgY29uc3QgZW1wdHlTdGF0ZVN0eWxlID0ge1xuICAgIHRleHRBbGlnbjogJ2NlbnRlcicsXG4gICAgY29sb3I6ICcjMDAwMDAwJyxcbiAgICBvcGFjaXR5OiAnMC42JyxcbiAgICBmb250U3R5bGU6ICdpdGFsaWMnLFxuICAgIHBhZGRpbmc6ICczMHB4IDIwcHgnXG4gIH07XG5cbiAgcmV0dXJuIChcbiAgICA8ZGl2IHN0eWxlPXtjb250YWluZXJTdHlsZX0+XG4gICAgICA8ZGl2IHN0eWxlPXtoZWFkZXJTdHlsZX0+XG4gPGgxIHN0eWxlPXt7IGZvbnRTaXplOiBcIjEuNXJlbVwiLCBmb250V2VpZ2h0OiBcImJvbGRcIiwgbWFyZ2luOiAwLCBjb2xvcjogXCIjMWUyOTNiXCIgfX0+XG4gICAgICBBZG1pbiBEYXNoYm9hcmRcbiAgICA8L2gxPiAgICAgICAgPGJ1dHRvbiBcbiAgICAgICAgICBvbkNsaWNrPXtoYW5kbGVSZWZyZXNofSBcbiAgICAgICAgICBzdHlsZT17cmVmcmVzaEJ1dHRvblN0eWxlfVxuICAgICAgICAgIG9uTW91c2VPdmVyPXsoZSkgPT4gZS50YXJnZXQuc3R5bGUuYmFja2dyb3VuZENvbG9yID0gJyNlOWVjZWYnfVxuICAgICAgICAgIG9uTW91c2VPdXQ9eyhlKSA9PiBlLnRhcmdldC5zdHlsZS5iYWNrZ3JvdW5kQ29sb3IgPSAnI2Y4ZjlmYSd9XG4gICAgICAgICAgdGl0bGU9XCJSZWZyZXNoIERhc2hib2FyZFwiXG4gICAgICAgID5cbiAgICAgICAgICA8c3ZnIHdpZHRoPVwiMTZcIiBoZWlnaHQ9XCIxNlwiIHZpZXdCb3g9XCIwIDAgMjQgMjRcIiBmaWxsPVwibm9uZVwiIHN0cm9rZT1cImN1cnJlbnRDb2xvclwiIHN0cm9rZVdpZHRoPVwiMlwiPlxuICAgICAgICAgICAgPHBhdGggZD1cIk0zIDEyYTkgOSAwIDAgMSA5LTkgOS43NSA5Ljc1IDAgMCAxIDYuNzQgMi43NEwyMSA4XCIvPlxuICAgICAgICAgICAgPHBhdGggZD1cIk0yMSAzdjVoLTVcIi8+XG4gICAgICAgICAgICA8cGF0aCBkPVwiTTIxIDEyYTkgOSAwIDAgMS05IDkgOS43NSA5Ljc1IDAgMCAxLTYuNzQtMi43NEwzIDE2XCIvPlxuICAgICAgICAgICAgPHBhdGggZD1cIk0zIDIxdi01aDVcIi8+XG4gICAgICAgICAgPC9zdmc+XG4gICAgICAgIDwvYnV0dG9uPlxuICAgICAgPC9kaXY+XG5cbiAgICAgIDxkaXYgc3R5bGU9e21ldHJpY3NHcmlkU3R5bGV9PlxuICAgICAgICB7c3RhdHNDYXJkcy5tYXAoKGNhcmQsIGluZGV4KSA9PiAoXG4gICAgICAgICAgPGRpdiBcbiAgICAgICAgICAgIGtleT17aW5kZXh9IFxuICAgICAgICAgICAgb25DbGljaz17KCkgPT4gaGFuZGxlQ2FyZENsaWNrKGNhcmQubGluayl9IFxuICAgICAgICAgICAgc3R5bGU9e2NhcmRTdHlsZX1cbiAgICAgICAgICAgIG9uTW91c2VPdmVyPXsoZSkgPT4ge1xuICAgICAgICAgICAgICBlLmN1cnJlbnRUYXJnZXQuc3R5bGUuYm9yZGVyQ29sb3IgPSBjYXJkLmNvbG9yO1xuICAgICAgICAgICAgICBlLmN1cnJlbnRUYXJnZXQuc3R5bGUuYm94U2hhZG93ID0gYDAgNHB4IDEycHggJHtjYXJkLmNvbG9yfTIwYDtcbiAgICAgICAgICAgIH19XG4gICAgICAgICAgICBvbk1vdXNlT3V0PXsoZSkgPT4ge1xuICAgICAgICAgICAgICBlLmN1cnJlbnRUYXJnZXQuc3R5bGUuYm9yZGVyQ29sb3IgPSAnI2U1ZTdlYic7XG4gICAgICAgICAgICAgIGUuY3VycmVudFRhcmdldC5zdHlsZS5ib3hTaGFkb3cgPSAnbm9uZSc7XG4gICAgICAgICAgICB9fVxuICAgICAgICAgID5cbiAgICAgICAgICAgIDxoMyBzdHlsZT17Y2FyZFRpdGxlU3R5bGV9PntjYXJkLnRpdGxlfTwvaDM+XG4gICAgICAgICAgICA8cCBzdHlsZT17Y2FyZFZhbHVlU3R5bGUoKX0+e2NhcmQudmFsdWV9PC9wPlxuICAgICAgICAgIDwvZGl2PlxuICAgICAgICApKX1cbiAgICAgIDwvZGl2PlxuXG4gICAgICA8ZGl2IHN0eWxlPXtsb2dzQ29udGFpbmVyU3R5bGV9PlxuICAgICAgICA8ZGl2IHN0eWxlPXtsb2dTZWN0aW9uU3R5bGV9PlxuICAgICAgICAgIDxoMyBzdHlsZT17bG9nSGVhZGVyU3R5bGV9PkFkbWluIEFjdGl2aXR5ICh7YWRtaW5Mb2dzLmxlbmd0aH0pPC9oMz5cbiAgICAgICAgICB7YWRtaW5Mb2dzLmxlbmd0aCA9PT0gMCA/IChcbiAgICAgICAgICAgIDxkaXYgc3R5bGU9e2VtcHR5U3RhdGVTdHlsZX0+Tm8gcmVjZW50IGFkbWluIGFjdGl2aXR5PC9kaXY+XG4gICAgICAgICAgKSA6IChcbiAgICAgICAgICAgIGFkbWluTG9ncy5tYXAoKGxvZywgaSkgPT4gKFxuICAgICAgICAgICAgICA8ZGl2IGtleT17bG9nLmlkIHx8IGl9IHN0eWxlPXt7XG4gICAgICAgICAgICAgICAgLi4ubG9nSXRlbVN0eWxlLFxuICAgICAgICAgICAgICAgIGJvcmRlckJvdHRvbTogaSA9PT0gYWRtaW5Mb2dzLmxlbmd0aCAtIDEgPyAnbm9uZScgOiAnMXB4IHNvbGlkICNmM2Y0ZjYnXG4gICAgICAgICAgICAgIH19PlxuICAgICAgICAgICAgICAgIDxkaXYgc3R5bGU9e2xvZ0l0ZW1OYW1lU3R5bGV9PlxuICAgICAgICAgICAgICAgICAge2xvZy5maXJzdF9uYW1lfSB7bG9nLmxhc3RfbmFtZX1cbiAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICA8ZGl2IHN0eWxlPXtsb2dJdGVtQWN0aW9uU3R5bGV9Pntsb2cuYWN0aW9ufTwvZGl2PlxuICAgICAgICAgICAgICAgIDxkaXYgc3R5bGU9e2xvZ0l0ZW1UaW1lU3R5bGV9PlxuICAgICAgICAgICAgICAgICAge2dldFRpbWVBZ28obG9nLmNyZWF0ZWRfYXQpfVxuICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICkpXG4gICAgICAgICAgKX1cbiAgICAgICAgPC9kaXY+XG5cbiAgICAgICAgPGRpdiBzdHlsZT17bG9nU2VjdGlvblN0eWxlfT5cbiAgICAgICAgICA8aDMgc3R5bGU9e2xvZ0hlYWRlclN0eWxlfT5Vc2VyIEFjdGl2aXR5ICh7dXNlckxvZ3MubGVuZ3RofSk8L2gzPlxuICAgICAgICAgIHt1c2VyTG9ncy5sZW5ndGggPT09IDAgPyAoXG4gICAgICAgICAgICA8ZGl2IHN0eWxlPXtlbXB0eVN0YXRlU3R5bGV9Pk5vIHJlY2VudCB1c2VyIGFjdGl2aXR5PC9kaXY+XG4gICAgICAgICAgKSA6IChcbiAgICAgICAgICAgIHVzZXJMb2dzLm1hcCgobG9nLCBpKSA9PiAoXG4gICAgICAgICAgICAgIDxkaXYga2V5PXtsb2cuaWQgfHwgaX0gc3R5bGU9e3tcbiAgICAgICAgICAgICAgICAuLi5sb2dJdGVtU3R5bGUsXG4gICAgICAgICAgICAgICAgYm9yZGVyQm90dG9tOiBpID09PSB1c2VyTG9ncy5sZW5ndGggLSAxID8gJ25vbmUnIDogJzFweCBzb2xpZCAjZjNmNGY2J1xuICAgICAgICAgICAgICB9fT5cbiAgICAgICAgICAgICAgICA8ZGl2IHN0eWxlPXtsb2dJdGVtTmFtZVN0eWxlfT5cbiAgICAgICAgICAgICAgICAgIHtsb2cuZmlyc3RfbmFtZX0ge2xvZy5sYXN0X25hbWV9XG4gICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgPGRpdiBzdHlsZT17bG9nSXRlbUFjdGlvblN0eWxlfT57bG9nLmFjdGlvbn08L2Rpdj5cbiAgICAgICAgICAgICAgICA8ZGl2IHN0eWxlPXtsb2dJdGVtVGltZVN0eWxlfT5cbiAgICAgICAgICAgICAgICAgIHtnZXRUaW1lQWdvKGxvZy5jcmVhdGVkX2F0KX1cbiAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICApKVxuICAgICAgICAgICl9XG4gICAgICAgIDwvZGl2PlxuICAgICAgPC9kaXY+XG4gICAgPC9kaXY+XG4gICk7XG59IiwiLy8gQWRtaW4vY29tcG9uZW50cy9BbmFseXRpY3MuanN4XG5pbXBvcnQgUmVhY3QsIHsgdXNlU3RhdGUsIHVzZUVmZmVjdCB9IGZyb20gXCJyZWFjdFwiO1xuaW1wb3J0IHsgQXBpQ2xpZW50IH0gZnJvbSBcImFkbWluanNcIjtcblxuY29uc3QgYXBpID0gbmV3IEFwaUNsaWVudCgpO1xuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBBbmFseXRpY3MoKSB7XG4gIGNvbnN0IFthY3RpdmVUYWIsIHNldEFjdGl2ZVRhYl0gPSB1c2VTdGF0ZSgnb3ZlcnZpZXcnKTtcbiAgY29uc3QgW2RhdGVSYW5nZSwgc2V0RGF0ZVJhbmdlXSA9IHVzZVN0YXRlKCczMGQnKTtcbiAgY29uc3QgW2xvYWRpbmcsIHNldExvYWRpbmddID0gdXNlU3RhdGUoZmFsc2UpO1xuICBjb25zdCBbZXJyb3IsIHNldEVycm9yXSA9IHVzZVN0YXRlKG51bGwpO1xuICBjb25zdCBbZGF0YSwgc2V0RGF0YV0gPSB1c2VTdGF0ZShudWxsKTtcblxuICBjb25zdCBmZXRjaEFuYWx5dGljc0RhdGEgPSBhc3luYyAoKSA9PiB7XG4gICAgc2V0TG9hZGluZyh0cnVlKTtcbiAgICBzZXRFcnJvcihudWxsKTtcbiAgICBcbiAgICB0cnkge1xuICAgICAgY29uc3QgcmVzcG9uc2UgPSBhd2FpdCBmZXRjaChgL2FwaS9hZG1pbi9hbmFseXRpY3M/cmFuZ2U9JHtkYXRlUmFuZ2V9YCk7XG4gICAgICBcbiAgICAgIGlmICghcmVzcG9uc2Uub2spIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdGYWlsZWQgdG8gZmV0Y2ggYW5hbHl0aWNzIGRhdGEnKTtcbiAgICAgIH1cbiAgICAgIFxuICAgICAgY29uc3QgYW5hbHl0aWNzRGF0YSA9IGF3YWl0IHJlc3BvbnNlLmpzb24oKTtcbiAgICAgIHNldERhdGEoYW5hbHl0aWNzRGF0YSk7XG4gICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICBjb25zb2xlLmVycm9yKCdBbmFseXRpY3MgZmV0Y2ggZXJyb3I6JywgZXJyKTtcbiAgICAgIHNldEVycm9yKCdGYWlsZWQgdG8gbG9hZCBhbmFseXRpY3MgZGF0YScpO1xuICAgICAgc2V0RGF0YSh7XG4gICAgICAgIG92ZXJ2aWV3OiB7fSxcbiAgICAgICAgYXBwb2ludG1lbnRzOiB7IG92ZXJ2aWV3OiB7fSwgYXBwb2ludG1lbnRTdGF0czogW10sIHRvcEZyZWVsYW5jZXJzOiBbXSwgcmVjZW50QXBwb2ludG1lbnRzOiBbXSB9LFxuICAgICAgICB1c2VyczogeyBvdmVydmlldzoge30sIHVzZXJHcm93dGg6IFtdLCB1c2VyRGlzdHJpYnV0aW9uOiBbXSwgcmVjZW50VXNlcnM6IFtdIH0sXG4gICAgICAgIHByb2plY3RTdGF0czogeyBieVN0YXR1czogW10gfSxcbiAgICAgIH0pO1xuICAgIH0gZmluYWxseSB7XG4gICAgICBzZXRMb2FkaW5nKGZhbHNlKTtcbiAgICB9XG4gIH07XG5cbiAgdXNlRWZmZWN0KCgpID0+IHtcbiAgICBmZXRjaEFuYWx5dGljc0RhdGEoKTtcbiAgfSwgW2RhdGVSYW5nZV0pO1xuXG4gIGNvbnN0IGZvcm1hdEN1cnJlbmN5ID0gKGFtb3VudCkgPT4ge1xuICAgIHJldHVybiBuZXcgSW50bC5OdW1iZXJGb3JtYXQoJ2VuLVVTJywge1xuICAgICAgc3R5bGU6ICdjdXJyZW5jeScsXG4gICAgICBjdXJyZW5jeTogJ1VTRCdcbiAgICB9KS5mb3JtYXQoYW1vdW50IHx8IDApO1xuICB9O1xuXG4gIGNvbnN0IGZvcm1hdERhdGUgPSAoZGF0ZVN0cmluZykgPT4ge1xuICAgIHJldHVybiBuZXcgRGF0ZShkYXRlU3RyaW5nKS50b0xvY2FsZURhdGVTdHJpbmcoJ2VuLVVTJywge1xuICAgICAgbW9udGg6ICdzaG9ydCcsXG4gICAgICBkYXk6ICdudW1lcmljJ1xuICAgIH0pO1xuICB9O1xuXG4gIGNvbnN0IGZvcm1hdFBlcmNlbnRhZ2UgPSAodmFsdWUpID0+IHtcbiAgICByZXR1cm4gYCR7KHZhbHVlIHx8IDApLnRvRml4ZWQoMSl9JWA7XG4gIH07XG5cbiAgaWYgKGxvYWRpbmcpIHtcbiAgICByZXR1cm4gKFxuICAgICAgPGRpdiBzdHlsZT17eyBcbiAgICAgICAgZGlzcGxheTogJ2ZsZXgnLCBcbiAgICAgICAganVzdGlmeUNvbnRlbnQ6ICdjZW50ZXInLCBcbiAgICAgICAgYWxpZ25JdGVtczogJ2NlbnRlcicsIFxuICAgICAgICBtaW5IZWlnaHQ6ICc0MDBweCcsXG4gICAgICAgIGZvbnRGYW1pbHk6ICctYXBwbGUtc3lzdGVtLCBCbGlua01hY1N5c3RlbUZvbnQsIFwiU2Vnb2UgVUlcIiwgUm9ib3RvLCBzYW5zLXNlcmlmJ1xuICAgICAgfX0+XG4gICAgICAgIDxkaXYgc3R5bGU9e3sgdGV4dEFsaWduOiAnY2VudGVyJyB9fT5cbiAgICAgICAgICA8ZGl2IHN0eWxlPXt7XG4gICAgICAgICAgICB3aWR0aDogJzQwcHgnLFxuICAgICAgICAgICAgaGVpZ2h0OiAnNDBweCcsXG4gICAgICAgICAgICBib3JkZXI6ICc0cHggc29saWQgI2U1ZTdlYicsXG4gICAgICAgICAgICBib3JkZXJUb3A6ICc0cHggc29saWQgIzNiODJmNicsXG4gICAgICAgICAgICBib3JkZXJSYWRpdXM6ICc1MCUnLFxuICAgICAgICAgICAgYW5pbWF0aW9uOiAnc3BpbiAxcyBsaW5lYXIgaW5maW5pdGUnLFxuICAgICAgICAgICAgbWFyZ2luOiAnMCBhdXRvIDE2cHgnXG4gICAgICAgICAgfX0+PC9kaXY+XG4gICAgICAgICAgPHAgc3R5bGU9e3sgY29sb3I6ICcjNmI3MjgwJyB9fT5Mb2FkaW5nIGFuYWx5dGljcy4uLjwvcD5cbiAgICAgICAgICA8c3R5bGU+e2BcbiAgICAgICAgICAgIEBrZXlmcmFtZXMgc3BpbiB7XG4gICAgICAgICAgICAgIDAlIHsgdHJhbnNmb3JtOiByb3RhdGUoMGRlZyk7IH1cbiAgICAgICAgICAgICAgMTAwJSB7IHRyYW5zZm9ybTogcm90YXRlKDM2MGRlZyk7IH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICBgfTwvc3R5bGU+XG4gICAgICAgIDwvZGl2PlxuICAgICAgPC9kaXY+XG4gICAgKTtcbiAgfVxuXG4gIHJldHVybiAoXG4gICAgPGRpdiBzdHlsZT17eyBcbiAgICAgIHBhZGRpbmc6ICcyNHB4JywgXG4gICAgICBmb250RmFtaWx5OiAnLWFwcGxlLXN5c3RlbSwgQmxpbmtNYWNTeXN0ZW1Gb250LCBcIlNlZ29lIFVJXCIsIFJvYm90bywgc2Fucy1zZXJpZicsXG4gICAgICBiYWNrZ3JvdW5kQ29sb3I6ICcjZjhmYWZjJyxcbiAgICAgIG1pbkhlaWdodDogJzEwMHZoJ1xuICAgIH19PlxuICAgICAgey8qIEhlYWRlciAqL31cbiAgICAgIDxkaXYgc3R5bGU9e3sgbWFyZ2luQm90dG9tOiAnMzJweCcgfX0+XG4gICAgICAgIDxkaXYgc3R5bGU9e3sgXG4gICAgICAgICAgZGlzcGxheTogJ2ZsZXgnLCBcbiAgICAgICAgICBqdXN0aWZ5Q29udGVudDogJ3NwYWNlLWJldHdlZW4nLCBcbiAgICAgICAgICBhbGlnbkl0ZW1zOiAnY2VudGVyJyxcbiAgICAgICAgICBtYXJnaW5Cb3R0b206ICcyNHB4J1xuICAgICAgICB9fT5cbiAgICAgICAgICA8ZGl2PlxuICAgICAgICAgICAgPGgxIHN0eWxlPXt7IFxuICAgICAgICAgICAgICBtYXJnaW46ICcwIDAgOHB4IDAnLCBcbiAgICAgICAgICAgICAgZm9udFNpemU6ICcyOHB4JywgXG4gICAgICAgICAgICAgIGZvbnRXZWlnaHQ6ICc3MDAnLFxuICAgICAgICAgICAgICBjb2xvcjogJyMxZTI5M2InXG4gICAgICAgICAgICB9fT5cbiAgICAgICAgICAgICAgQW5hbHl0aWNzIERhc2hib2FyZFxuICAgICAgICAgICAgPC9oMT5cbiAgICAgICAgICAgIDxwIHN0eWxlPXt7IG1hcmdpbjogJzAnLCBjb2xvcjogJyM2NDc0OGInLCBmb250U2l6ZTogJzE2cHgnIH19PlxuICAgICAgICAgICAgICBDb21wcmVoZW5zaXZlIGJ1c2luZXNzIGluc2lnaHRzIGFuZCBtZXRyaWNzXG4gICAgICAgICAgICA8L3A+XG4gICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgXG4gICAgICAgICAgPGRpdiBzdHlsZT17eyBkaXNwbGF5OiAnZmxleCcsIGdhcDogJzEycHgnLCBhbGlnbkl0ZW1zOiAnY2VudGVyJyB9fT5cbiAgICAgICAgICAgIDxzZWxlY3RcbiAgICAgICAgICAgICAgdmFsdWU9e2RhdGVSYW5nZX1cbiAgICAgICAgICAgICAgb25DaGFuZ2U9eyhlKSA9PiBzZXREYXRlUmFuZ2UoZS50YXJnZXQudmFsdWUpfVxuICAgICAgICAgICAgICBzdHlsZT17e1xuICAgICAgICAgICAgICAgIHBhZGRpbmc6ICc4cHggMTJweCcsXG4gICAgICAgICAgICAgICAgYm9yZGVyOiAnMXB4IHNvbGlkICNkMWQ1ZGInLFxuICAgICAgICAgICAgICAgIGJvcmRlclJhZGl1czogJzhweCcsXG4gICAgICAgICAgICAgICAgZm9udFNpemU6ICcxNHB4JyxcbiAgICAgICAgICAgICAgICBiYWNrZ3JvdW5kQ29sb3I6ICd3aGl0ZScsXG4gICAgICAgICAgICAgICAgY3Vyc29yOiAncG9pbnRlcidcbiAgICAgICAgICAgICAgfX1cbiAgICAgICAgICAgID5cbiAgICAgICAgICAgICAgPG9wdGlvbiB2YWx1ZT1cIjdkXCI+NyBEYXlzPC9vcHRpb24+XG4gICAgICAgICAgICAgIDxvcHRpb24gdmFsdWU9XCIzMGRcIj4zMCBEYXlzPC9vcHRpb24+XG4gICAgICAgICAgICAgIDxvcHRpb24gdmFsdWU9XCI5MGRcIj45MCBEYXlzPC9vcHRpb24+XG4gICAgICAgICAgICAgIDxvcHRpb24gdmFsdWU9XCIxeVwiPjEgWWVhcjwvb3B0aW9uPlxuICAgICAgICAgICAgPC9zZWxlY3Q+XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIDxidXR0b25cbiAgICAgICAgICAgICAgb25DbGljaz17ZmV0Y2hBbmFseXRpY3NEYXRhfVxuICAgICAgICAgICAgICBzdHlsZT17e1xuICAgICAgICAgICAgICAgIHBhZGRpbmc6ICc4cHggMTZweCcsXG4gICAgICAgICAgICAgICAgYmFja2dyb3VuZENvbG9yOiAnIzNiODJmNicsXG4gICAgICAgICAgICAgICAgY29sb3I6ICd3aGl0ZScsXG4gICAgICAgICAgICAgICAgYm9yZGVyOiAnbm9uZScsXG4gICAgICAgICAgICAgICAgYm9yZGVyUmFkaXVzOiAnOHB4JyxcbiAgICAgICAgICAgICAgICBjdXJzb3I6ICdwb2ludGVyJyxcbiAgICAgICAgICAgICAgICBmb250U2l6ZTogJzE0cHgnLFxuICAgICAgICAgICAgICAgIGZvbnRXZWlnaHQ6ICc1MDAnXG4gICAgICAgICAgICAgIH19XG4gICAgICAgICAgICA+XG4gICAgICAgICAgICAgIFJlZnJlc2hcbiAgICAgICAgICAgIDwvYnV0dG9uPlxuICAgICAgICAgIDwvZGl2PlxuICAgICAgICA8L2Rpdj5cblxuICAgICAgICB7ZXJyb3IgJiYgKFxuICAgICAgICAgIDxkaXYgc3R5bGU9e3tcbiAgICAgICAgICAgIHBhZGRpbmc6ICcxMnB4IDE2cHgnLFxuICAgICAgICAgICAgYmFja2dyb3VuZENvbG9yOiAnI2ZlZTJlMicsXG4gICAgICAgICAgICBib3JkZXI6ICcxcHggc29saWQgI2ZlY2FjYScsXG4gICAgICAgICAgICBib3JkZXJSYWRpdXM6ICc4cHgnLFxuICAgICAgICAgICAgY29sb3I6ICcjOTkxYjFiJyxcbiAgICAgICAgICAgIG1hcmdpbkJvdHRvbTogJzI0cHgnLFxuICAgICAgICAgICAgZm9udFNpemU6ICcxNHB4J1xuICAgICAgICAgIH19PlxuICAgICAgICAgICAge2Vycm9yfVxuICAgICAgICAgIDwvZGl2PlxuICAgICAgICApfVxuXG4gICAgICAgIDxkaXYgc3R5bGU9e3sgYm9yZGVyQm90dG9tOiAnMXB4IHNvbGlkICNlNWU3ZWInIH19PlxuICAgICAgICAgIDxkaXYgc3R5bGU9e3sgZGlzcGxheTogJ2ZsZXgnLCBnYXA6ICczMnB4JyB9fT5cbiAgICAgICAgICAgIHtbXG4gICAgICAgICAgICAgIHsgaWQ6ICdvdmVydmlldycsIGxhYmVsOiAnT3ZlcnZpZXcnIH0sXG4gICAgICAgICAgICAgIHsgaWQ6ICdhcHBvaW50bWVudHMnLCBsYWJlbDogJ0FwcG9pbnRtZW50cycgfSxcbiAgICAgICAgICAgICAgeyBpZDogJ3VzZXJzJywgbGFiZWw6ICdVc2VycycgfSxcbiAgICAgICAgICAgICAgeyBpZDogJ3Byb2plY3RzJywgbGFiZWw6ICdQcm9qZWN0cycgfSxcbiAgICAgICAgICAgICAgeyBpZDogJ2ZpbmFuY2lhbCcsIGxhYmVsOiAnRmluYW5jaWFsJyB9XG4gICAgICAgICAgICBdLm1hcCh0YWIgPT4gKFxuICAgICAgICAgICAgICA8YnV0dG9uXG4gICAgICAgICAgICAgICAga2V5PXt0YWIuaWR9XG4gICAgICAgICAgICAgICAgb25DbGljaz17KCkgPT4gc2V0QWN0aXZlVGFiKHRhYi5pZCl9XG4gICAgICAgICAgICAgICAgc3R5bGU9e3tcbiAgICAgICAgICAgICAgICAgIHBhZGRpbmc6ICcxMnB4IDAnLFxuICAgICAgICAgICAgICAgICAgYm9yZGVyOiAnbm9uZScsXG4gICAgICAgICAgICAgICAgICBiYWNrZ3JvdW5kOiAnbm9uZScsXG4gICAgICAgICAgICAgICAgICBmb250U2l6ZTogJzE0cHgnLFxuICAgICAgICAgICAgICAgICAgZm9udFdlaWdodDogJzUwMCcsXG4gICAgICAgICAgICAgICAgICBjb2xvcjogYWN0aXZlVGFiID09PSB0YWIuaWQgPyAnIzNiODJmNicgOiAnIzZiNzI4MCcsXG4gICAgICAgICAgICAgICAgICBib3JkZXJCb3R0b206IGFjdGl2ZVRhYiA9PT0gdGFiLmlkID8gJzJweCBzb2xpZCAjM2I4MmY2JyA6ICcycHggc29saWQgdHJhbnNwYXJlbnQnLFxuICAgICAgICAgICAgICAgICAgY3Vyc29yOiAncG9pbnRlcicsXG4gICAgICAgICAgICAgICAgICB0cmFuc2l0aW9uOiAnYWxsIDAuMnMnXG4gICAgICAgICAgICAgICAgfX1cbiAgICAgICAgICAgICAgPlxuICAgICAgICAgICAgICAgIHt0YWIubGFiZWx9XG4gICAgICAgICAgICAgIDwvYnV0dG9uPlxuICAgICAgICAgICAgKSl9XG4gICAgICAgICAgPC9kaXY+XG4gICAgICAgIDwvZGl2PlxuICAgICAgPC9kaXY+XG5cbiAgICAgIDxkaXYgc3R5bGU9e3sgbWluSGVpZ2h0OiAnNDAwcHgnIH19PlxuICAgICAgICB7YWN0aXZlVGFiID09PSAnb3ZlcnZpZXcnICYmIChcbiAgICAgICAgICA8ZGl2PlxuICAgICAgICAgICAgPGRpdiBzdHlsZT17eyBcbiAgICAgICAgICAgICAgZGlzcGxheTogJ2dyaWQnLCBcbiAgICAgICAgICAgICAgZ3JpZFRlbXBsYXRlQ29sdW1uczogJ3JlcGVhdChhdXRvLWZpdCwgbWlubWF4KDI0MHB4LCAxZnIpKScsIFxuICAgICAgICAgICAgICBnYXA6ICcyMHB4JyxcbiAgICAgICAgICAgICAgbWFyZ2luQm90dG9tOiAnMzJweCdcbiAgICAgICAgICAgIH19PlxuICAgICAgICAgICAgICA8ZGl2IHN0eWxlPXt7XG4gICAgICAgICAgICAgICAgcGFkZGluZzogJzI0cHgnLFxuICAgICAgICAgICAgICAgIGJhY2tncm91bmRDb2xvcjogJ3doaXRlJyxcbiAgICAgICAgICAgICAgICBib3JkZXJSYWRpdXM6ICcxMnB4JyxcbiAgICAgICAgICAgICAgICBib3hTaGFkb3c6ICcwIDFweCAzcHggcmdiYSgwLDAsMCwwLjEpJyxcbiAgICAgICAgICAgICAgICBib3JkZXI6ICcxcHggc29saWQgI2U1ZTdlYidcbiAgICAgICAgICAgICAgfX0+XG4gICAgICAgICAgICAgICAgPGRpdiBzdHlsZT17eyBkaXNwbGF5OiAnZmxleCcsIGFsaWduSXRlbXM6ICdjZW50ZXInLCBqdXN0aWZ5Q29udGVudDogJ3NwYWNlLWJldHdlZW4nIH19PlxuICAgICAgICAgICAgICAgICAgPGRpdj5cbiAgICAgICAgICAgICAgICAgICAgPGRpdiBzdHlsZT17eyBtYXJnaW5Cb3R0b206ICc4cHgnLCBmb250U2l6ZTogJzE0cHgnLCBjb2xvcjogJyM2YjcyODAnLCBmb250V2VpZ2h0OiAnNTAwJyB9fT5cbiAgICAgICAgICAgICAgICAgICAgICBUb3RhbCBVc2Vyc1xuICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICAgICAgPGRpdiBzdHlsZT17eyBmb250U2l6ZTogJzI4cHgnLCBmb250V2VpZ2h0OiAnNzAwJywgY29sb3I6ICcjMWUyOTNiJyB9fT5cbiAgICAgICAgICAgICAgICAgICAgICB7KGRhdGE/Lm92ZXJ2aWV3Py50b3RhbFVzZXJzIHx8IDApLnRvTG9jYWxlU3RyaW5nKCl9XG4gICAgICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgICAgICA8ZGl2IHN0eWxlPXt7IGZvbnRTaXplOiAnMTJweCcsIGNvbG9yOiAnIzEwYjk4MScsIG1hcmdpblRvcDogJzRweCcsIGZvbnRXZWlnaHQ6ICc1MDAnIH19PlxuICAgICAgICAgICAgICAgICAgICAgICt7ZGF0YT8ub3ZlcnZpZXc/Lm5ld1VzZXJzVG9kYXkgfHwgMH0gdG9kYXlcbiAgICAgICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICAgIDxkaXYgc3R5bGU9e3sgXG4gICAgICAgICAgICAgICAgICAgIHBhZGRpbmc6ICcxMnB4JywgXG4gICAgICAgICAgICAgICAgICAgIGJhY2tncm91bmRDb2xvcjogJyNkYmVhZmUnLCBcbiAgICAgICAgICAgICAgICAgICAgYm9yZGVyUmFkaXVzOiAnMTJweCcsXG4gICAgICAgICAgICAgICAgICAgIGZvbnRTaXplOiAnMjRweCdcbiAgICAgICAgICAgICAgICAgIH19PlxuICAgICAgICAgICAgICAgICAgICDwn5GlXG4gICAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgPC9kaXY+XG5cbiAgICAgICAgICAgICAgPGRpdiBzdHlsZT17e1xuICAgICAgICAgICAgICAgIHBhZGRpbmc6ICcyNHB4JyxcbiAgICAgICAgICAgICAgICBiYWNrZ3JvdW5kQ29sb3I6ICd3aGl0ZScsXG4gICAgICAgICAgICAgICAgYm9yZGVyUmFkaXVzOiAnMTJweCcsXG4gICAgICAgICAgICAgICAgYm94U2hhZG93OiAnMCAxcHggM3B4IHJnYmEoMCwwLDAsMC4xKScsXG4gICAgICAgICAgICAgICAgYm9yZGVyOiAnMXB4IHNvbGlkICNlNWU3ZWInXG4gICAgICAgICAgICAgIH19PlxuICAgICAgICAgICAgICAgIDxkaXYgc3R5bGU9e3sgZGlzcGxheTogJ2ZsZXgnLCBhbGlnbkl0ZW1zOiAnY2VudGVyJywganVzdGlmeUNvbnRlbnQ6ICdzcGFjZS1iZXR3ZWVuJyB9fT5cbiAgICAgICAgICAgICAgICAgIDxkaXY+XG4gICAgICAgICAgICAgICAgICAgIDxkaXYgc3R5bGU9e3sgbWFyZ2luQm90dG9tOiAnOHB4JywgZm9udFNpemU6ICcxNHB4JywgY29sb3I6ICcjNmI3MjgwJywgZm9udFdlaWdodDogJzUwMCcgfX0+XG4gICAgICAgICAgICAgICAgICAgICAgVG90YWwgQXBwb2ludG1lbnRzXG4gICAgICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgICAgICA8ZGl2IHN0eWxlPXt7IGZvbnRTaXplOiAnMjhweCcsIGZvbnRXZWlnaHQ6ICc3MDAnLCBjb2xvcjogJyMxZTI5M2InIH19PlxuICAgICAgICAgICAgICAgICAgICAgIHsoZGF0YT8uYXBwb2ludG1lbnRzPy5vdmVydmlldz8udG90YWxBcHBvaW50bWVudHMgfHwgMCkudG9Mb2NhbGVTdHJpbmcoKX1cbiAgICAgICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgICAgIDxkaXYgc3R5bGU9e3sgZm9udFNpemU6ICcxMnB4JywgY29sb3I6ICcjMTBiOTgxJywgbWFyZ2luVG9wOiAnNHB4JywgZm9udFdlaWdodDogJzUwMCcgfX0+XG4gICAgICAgICAgICAgICAgICAgICAge2RhdGE/LmFwcG9pbnRtZW50cz8ub3ZlcnZpZXc/LmFwcG9pbnRtZW50c1RvZGF5IHx8IDB9IHRvZGF5XG4gICAgICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgICA8ZGl2IHN0eWxlPXt7IFxuICAgICAgICAgICAgICAgICAgICBwYWRkaW5nOiAnMTJweCcsIFxuICAgICAgICAgICAgICAgICAgICBiYWNrZ3JvdW5kQ29sb3I6ICcjZGNmY2U3JywgXG4gICAgICAgICAgICAgICAgICAgIGJvcmRlclJhZGl1czogJzEycHgnLFxuICAgICAgICAgICAgICAgICAgICBmb250U2l6ZTogJzI0cHgnXG4gICAgICAgICAgICAgICAgICB9fT5cbiAgICAgICAgICAgICAgICAgICAg8J+ThVxuICAgICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgIDwvZGl2PlxuXG4gICAgICAgICAgICAgIDxkaXYgc3R5bGU9e3tcbiAgICAgICAgICAgICAgICBwYWRkaW5nOiAnMjRweCcsXG4gICAgICAgICAgICAgICAgYmFja2dyb3VuZENvbG9yOiAnd2hpdGUnLFxuICAgICAgICAgICAgICAgIGJvcmRlclJhZGl1czogJzEycHgnLFxuICAgICAgICAgICAgICAgIGJveFNoYWRvdzogJzAgMXB4IDNweCByZ2JhKDAsMCwwLDAuMSknLFxuICAgICAgICAgICAgICAgIGJvcmRlcjogJzFweCBzb2xpZCAjZTVlN2ViJ1xuICAgICAgICAgICAgICB9fT5cbiAgICAgICAgICAgICAgICA8ZGl2IHN0eWxlPXt7IGRpc3BsYXk6ICdmbGV4JywgYWxpZ25JdGVtczogJ2NlbnRlcicsIGp1c3RpZnlDb250ZW50OiAnc3BhY2UtYmV0d2VlbicgfX0+XG4gICAgICAgICAgICAgICAgICA8ZGl2PlxuICAgICAgICAgICAgICAgICAgICA8ZGl2IHN0eWxlPXt7IG1hcmdpbkJvdHRvbTogJzhweCcsIGZvbnRTaXplOiAnMTRweCcsIGNvbG9yOiAnIzZiNzI4MCcsIGZvbnRXZWlnaHQ6ICc1MDAnIH19PlxuICAgICAgICAgICAgICAgICAgICAgIEFjdGl2ZSBQcm9qZWN0c1xuICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICAgICAgPGRpdiBzdHlsZT17eyBmb250U2l6ZTogJzI4cHgnLCBmb250V2VpZ2h0OiAnNzAwJywgY29sb3I6ICcjMWUyOTNiJyB9fT5cbiAgICAgICAgICAgICAgICAgICAgICB7KGRhdGE/Lm92ZXJ2aWV3Py5hY3RpdmVQcm9qZWN0cyB8fCAwKS50b0xvY2FsZVN0cmluZygpfVxuICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICAgICAgPGRpdiBzdHlsZT17eyBmb250U2l6ZTogJzEycHgnLCBjb2xvcjogJyM2YjcyODAnLCBtYXJnaW5Ub3A6ICc0cHgnLCBmb250V2VpZ2h0OiAnNTAwJyB9fT5cbiAgICAgICAgICAgICAgICAgICAgICB7ZGF0YT8ub3ZlcnZpZXc/LmNvbXBsZXRlZFByb2plY3RzIHx8IDB9IGNvbXBsZXRlZFxuICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgICAgPGRpdiBzdHlsZT17eyBcbiAgICAgICAgICAgICAgICAgICAgcGFkZGluZzogJzEycHgnLCBcbiAgICAgICAgICAgICAgICAgICAgYmFja2dyb3VuZENvbG9yOiAnI2YzZThmZicsIFxuICAgICAgICAgICAgICAgICAgICBib3JkZXJSYWRpdXM6ICcxMnB4JyxcbiAgICAgICAgICAgICAgICAgICAgZm9udFNpemU6ICcyNHB4J1xuICAgICAgICAgICAgICAgICAgfX0+XG4gICAgICAgICAgICAgICAgICAgIPCfkrxcbiAgICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICA8L2Rpdj5cblxuICAgICAgICAgICAgICA8ZGl2IHN0eWxlPXt7XG4gICAgICAgICAgICAgICAgcGFkZGluZzogJzI0cHgnLFxuICAgICAgICAgICAgICAgIGJhY2tncm91bmRDb2xvcjogJ3doaXRlJyxcbiAgICAgICAgICAgICAgICBib3JkZXJSYWRpdXM6ICcxMnB4JyxcbiAgICAgICAgICAgICAgICBib3hTaGFkb3c6ICcwIDFweCAzcHggcmdiYSgwLDAsMCwwLjEpJyxcbiAgICAgICAgICAgICAgICBib3JkZXI6ICcxcHggc29saWQgI2U1ZTdlYidcbiAgICAgICAgICAgICAgfX0+XG4gICAgICAgICAgICAgICAgPGRpdiBzdHlsZT17eyBkaXNwbGF5OiAnZmxleCcsIGFsaWduSXRlbXM6ICdjZW50ZXInLCBqdXN0aWZ5Q29udGVudDogJ3NwYWNlLWJldHdlZW4nIH19PlxuICAgICAgICAgICAgICAgICAgPGRpdj5cbiAgICAgICAgICAgICAgICAgICAgPGRpdiBzdHlsZT17eyBtYXJnaW5Cb3R0b206ICc4cHgnLCBmb250U2l6ZTogJzE0cHgnLCBjb2xvcjogJyM2YjcyODAnLCBmb250V2VpZ2h0OiAnNTAwJyB9fT5cbiAgICAgICAgICAgICAgICAgICAgICBUb3RhbCBSZXZlbnVlXG4gICAgICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgICAgICA8ZGl2IHN0eWxlPXt7IGZvbnRTaXplOiAnMjhweCcsIGZvbnRXZWlnaHQ6ICc3MDAnLCBjb2xvcjogJyMxZTI5M2InIH19PlxuICAgICAgICAgICAgICAgICAgICAgIHtmb3JtYXRDdXJyZW5jeShkYXRhPy5vdmVydmlldz8udG90YWxSZXZlbnVlIHx8IDApfVxuICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICAgICAgPGRpdiBzdHlsZT17eyBmb250U2l6ZTogJzEycHgnLCBjb2xvcjogJyM2YjcyODAnLCBtYXJnaW5Ub3A6ICc0cHgnLCBmb250V2VpZ2h0OiAnNTAwJyB9fT5cbiAgICAgICAgICAgICAgICAgICAgICB7Zm9ybWF0Q3VycmVuY3koZGF0YT8ub3ZlcnZpZXc/Lm1vbnRobHlSZXZlbnVlIHx8IDApfSB0aGlzIG1vbnRoXG4gICAgICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgICA8ZGl2IHN0eWxlPXt7IFxuICAgICAgICAgICAgICAgICAgICBwYWRkaW5nOiAnMTJweCcsIFxuICAgICAgICAgICAgICAgICAgICBiYWNrZ3JvdW5kQ29sb3I6ICcjZmVmM2M3JywgXG4gICAgICAgICAgICAgICAgICAgIGJvcmRlclJhZGl1czogJzEycHgnLFxuICAgICAgICAgICAgICAgICAgICBmb250U2l6ZTogJzI0cHgnXG4gICAgICAgICAgICAgICAgICB9fT5cbiAgICAgICAgICAgICAgICAgICAg8J+SsFxuICAgICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgPC9kaXY+XG5cbiAgICAgICAgICAgIDxkaXYgc3R5bGU9e3tcbiAgICAgICAgICAgICAgYmFja2dyb3VuZENvbG9yOiAnd2hpdGUnLFxuICAgICAgICAgICAgICBib3JkZXJSYWRpdXM6ICcxMnB4JyxcbiAgICAgICAgICAgICAgYm94U2hhZG93OiAnMCAxcHggM3B4IHJnYmEoMCwwLDAsMC4xKScsXG4gICAgICAgICAgICAgIGJvcmRlcjogJzFweCBzb2xpZCAjZTVlN2ViJyxcbiAgICAgICAgICAgICAgb3ZlcmZsb3c6ICdoaWRkZW4nXG4gICAgICAgICAgICB9fT5cbiAgICAgICAgICAgICAgPGRpdiBzdHlsZT17eyBcbiAgICAgICAgICAgICAgICBwYWRkaW5nOiAnMjBweCAyNHB4JywgXG4gICAgICAgICAgICAgICAgYm9yZGVyQm90dG9tOiAnMXB4IHNvbGlkICNlNWU3ZWInLFxuICAgICAgICAgICAgICAgIGJhY2tncm91bmRDb2xvcjogJyNmOGZhZmMnXG4gICAgICAgICAgICAgIH19PlxuICAgICAgICAgICAgICAgIDxoMyBzdHlsZT17eyBtYXJnaW46ICcwJywgZm9udFNpemU6ICcxOHB4JywgZm9udFdlaWdodDogJzYwMCcsIGNvbG9yOiAnIzFlMjkzYicgfX0+XG4gICAgICAgICAgICAgICAgICBSZWNlbnQgQXBwb2ludG1lbnRzXG4gICAgICAgICAgICAgICAgPC9oMz5cbiAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgIFxuICAgICAgICAgICAgICA8ZGl2IHN0eWxlPXt7IG1heEhlaWdodDogJzQwMHB4Jywgb3ZlcmZsb3dZOiAnYXV0bycgfX0+XG4gICAgICAgICAgICAgICAge2RhdGE/LmFwcG9pbnRtZW50cz8ucmVjZW50QXBwb2ludG1lbnRzPy5sZW5ndGggPiAwID8gKFxuICAgICAgICAgICAgICAgICAgPHRhYmxlIHN0eWxlPXt7IHdpZHRoOiAnMTAwJScsIGJvcmRlckNvbGxhcHNlOiAnY29sbGFwc2UnIH19PlxuICAgICAgICAgICAgICAgICAgICA8dGhlYWQgc3R5bGU9e3sgYmFja2dyb3VuZENvbG9yOiAnI2Y4ZmFmYycsIHBvc2l0aW9uOiAnc3RpY2t5JywgdG9wOiAwIH19PlxuICAgICAgICAgICAgICAgICAgICAgIDx0cj5cbiAgICAgICAgICAgICAgICAgICAgICAgIDx0aCBzdHlsZT17eyB0ZXh0QWxpZ246ICdsZWZ0JywgcGFkZGluZzogJzEycHggMjRweCcsIGZvbnRTaXplOiAnMTRweCcsIGZvbnRXZWlnaHQ6ICc2MDAnLCBjb2xvcjogJyMzNzQxNTEnIH19PlxuICAgICAgICAgICAgICAgICAgICAgICAgICBUeXBlXG4gICAgICAgICAgICAgICAgICAgICAgICA8L3RoPlxuICAgICAgICAgICAgICAgICAgICAgICAgPHRoIHN0eWxlPXt7IHRleHRBbGlnbjogJ2xlZnQnLCBwYWRkaW5nOiAnMTJweCAyNHB4JywgZm9udFNpemU6ICcxNHB4JywgZm9udFdlaWdodDogJzYwMCcsIGNvbG9yOiAnIzM3NDE1MScgfX0+XG4gICAgICAgICAgICAgICAgICAgICAgICAgIFN0YXR1c1xuICAgICAgICAgICAgICAgICAgICAgICAgPC90aD5cbiAgICAgICAgICAgICAgICAgICAgICAgIDx0aCBzdHlsZT17eyB0ZXh0QWxpZ246ICdsZWZ0JywgcGFkZGluZzogJzEycHggMjRweCcsIGZvbnRTaXplOiAnMTRweCcsIGZvbnRXZWlnaHQ6ICc2MDAnLCBjb2xvcjogJyMzNzQxNTEnIH19PlxuICAgICAgICAgICAgICAgICAgICAgICAgICBEYXRlXG4gICAgICAgICAgICAgICAgICAgICAgICA8L3RoPlxuICAgICAgICAgICAgICAgICAgICAgICAgPHRoIHN0eWxlPXt7IHRleHRBbGlnbjogJ2xlZnQnLCBwYWRkaW5nOiAnMTJweCAyNHB4JywgZm9udFNpemU6ICcxNHB4JywgZm9udFdlaWdodDogJzYwMCcsIGNvbG9yOiAnIzM3NDE1MScgfX0+XG4gICAgICAgICAgICAgICAgICAgICAgICAgIEZyZWVsYW5jZXJcbiAgICAgICAgICAgICAgICAgICAgICAgIDwvdGg+XG4gICAgICAgICAgICAgICAgICAgICAgPC90cj5cbiAgICAgICAgICAgICAgICAgICAgPC90aGVhZD5cbiAgICAgICAgICAgICAgICAgICAgPHRib2R5PlxuICAgICAgICAgICAgICAgICAgICAgIHtkYXRhLmFwcG9pbnRtZW50cy5yZWNlbnRBcHBvaW50bWVudHMuc2xpY2UoMCwgMTApLm1hcCgoYXBwb2ludG1lbnQsIGluZGV4KSA9PiAoXG4gICAgICAgICAgICAgICAgICAgICAgICA8dHIga2V5PXtpbmRleH0gc3R5bGU9e3sgXG4gICAgICAgICAgICAgICAgICAgICAgICAgIGJvcmRlckJvdHRvbTogJzFweCBzb2xpZCAjZjNmNGY2JyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgdHJhbnNpdGlvbjogJ2JhY2tncm91bmQtY29sb3IgMC4ycydcbiAgICAgICAgICAgICAgICAgICAgICAgIH19PlxuICAgICAgICAgICAgICAgICAgICAgICAgICA8dGQgc3R5bGU9e3sgcGFkZGluZzogJzE2cHggMjRweCcsIGZvbnRTaXplOiAnMTRweCcsIGZvbnRXZWlnaHQ6ICc1MDAnIH19PlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHthcHBvaW50bWVudC5hcHBvaW50bWVudF90eXBlIHx8ICdBcHBvaW50bWVudCd9XG4gICAgICAgICAgICAgICAgICAgICAgICAgIDwvdGQ+XG4gICAgICAgICAgICAgICAgICAgICAgICAgIDx0ZCBzdHlsZT17eyBwYWRkaW5nOiAnMTZweCAyNHB4JywgZm9udFNpemU6ICcxNHB4JyB9fT5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8c3BhbiBzdHlsZT17e1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcGFkZGluZzogJzRweCAxMnB4JyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJvcmRlclJhZGl1czogJzIwcHgnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZm9udFNpemU6ICcxMnB4JyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZvbnRXZWlnaHQ6ICc2MDAnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYmFja2dyb3VuZENvbG9yOiBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYXBwb2ludG1lbnQuc3RhdHVzID09PSAncGVuZGluZycgPyAnI2ZlZjNjNycgOlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhcHBvaW50bWVudC5zdGF0dXMgPT09ICdhY2NlcHRlZCcgPyAnI2RjZmNlNycgOlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhcHBvaW50bWVudC5zdGF0dXMgPT09ICdyZWplY3RlZCcgPyAnI2ZlZTJlMicgOiAnI2YzZjRmNicsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb2xvcjpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYXBwb2ludG1lbnQuc3RhdHVzID09PSAncGVuZGluZycgPyAnIzkyNDAwZScgOlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhcHBvaW50bWVudC5zdGF0dXMgPT09ICdhY2NlcHRlZCcgPyAnIzA2NWY0NicgOlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhcHBvaW50bWVudC5zdGF0dXMgPT09ICdyZWplY3RlZCcgPyAnIzk5MWIxYicgOiAnIzM3NDE1MSdcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9fT5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHsoYXBwb2ludG1lbnQuc3RhdHVzIHx8ICdwZW5kaW5nJykuY2hhckF0KDApLnRvVXBwZXJDYXNlKCkgKyAoYXBwb2ludG1lbnQuc3RhdHVzIHx8ICdwZW5kaW5nJykuc2xpY2UoMSl9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPC9zcGFuPlxuICAgICAgICAgICAgICAgICAgICAgICAgICA8L3RkPlxuICAgICAgICAgICAgICAgICAgICAgICAgICA8dGQgc3R5bGU9e3sgcGFkZGluZzogJzE2cHggMjRweCcsIGZvbnRTaXplOiAnMTRweCcsIGNvbG9yOiAnIzZiNzI4MCcgfX0+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAge2FwcG9pbnRtZW50LmNyZWF0ZWRfYXQgPyBmb3JtYXREYXRlKGFwcG9pbnRtZW50LmNyZWF0ZWRfYXQpIDogJy0nfVxuICAgICAgICAgICAgICAgICAgICAgICAgICA8L3RkPlxuICAgICAgICAgICAgICAgICAgICAgICAgICA8dGQgc3R5bGU9e3sgcGFkZGluZzogJzE2cHggMjRweCcsIGZvbnRTaXplOiAnMTRweCcsIGZvbnRXZWlnaHQ6ICc1MDAnIH19PlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHthcHBvaW50bWVudC5mcmVlbGFuY2VyX2ZpcnN0X25hbWV9IHthcHBvaW50bWVudC5mcmVlbGFuY2VyX2xhc3RfbmFtZX1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgPC90ZD5cbiAgICAgICAgICAgICAgICAgICAgICAgIDwvdHI+XG4gICAgICAgICAgICAgICAgICAgICAgKSl9XG4gICAgICAgICAgICAgICAgICAgIDwvdGJvZHk+XG4gICAgICAgICAgICAgICAgICA8L3RhYmxlPlxuICAgICAgICAgICAgICAgICkgOiAoXG4gICAgICAgICAgICAgICAgICA8ZGl2IHN0eWxlPXt7IHRleHRBbGlnbjogJ2NlbnRlcicsIHBhZGRpbmc6ICc0OHB4IDI0cHgnLCBjb2xvcjogJyM2YjcyODAnIH19PlxuICAgICAgICAgICAgICAgICAgICA8ZGl2IHN0eWxlPXt7IGZvbnRTaXplOiAnNDhweCcsIG1hcmdpbkJvdHRvbTogJzE2cHgnIH19PvCfk4U8L2Rpdj5cbiAgICAgICAgICAgICAgICAgICAgPHAgc3R5bGU9e3sgbWFyZ2luOiAnMCcsIGZvbnRTaXplOiAnMTZweCcsIGZvbnRXZWlnaHQ6ICc1MDAnIH19Pk5vIHJlY2VudCBhcHBvaW50bWVudHMgZm91bmQ8L3A+XG4gICAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICApfVxuICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgIDwvZGl2PlxuICAgICAgICApfVxuXG4gICAgICAgIHthY3RpdmVUYWIgPT09ICdhcHBvaW50bWVudHMnICYmIChcbiAgICAgICAgICA8ZGl2PlxuICAgICAgICAgICAgPGRpdiBzdHlsZT17eyBcbiAgICAgICAgICAgICAgZGlzcGxheTogJ2dyaWQnLCBcbiAgICAgICAgICAgICAgZ3JpZFRlbXBsYXRlQ29sdW1uczogJ3JlcGVhdChhdXRvLWZpdCwgbWlubWF4KDIwMHB4LCAxZnIpKScsIFxuICAgICAgICAgICAgICBnYXA6ICcxNnB4JyxcbiAgICAgICAgICAgICAgbWFyZ2luQm90dG9tOiAnMzJweCdcbiAgICAgICAgICAgIH19PlxuICAgICAgICAgICAgICA8ZGl2IHN0eWxlPXt7XG4gICAgICAgICAgICAgICAgcGFkZGluZzogJzIwcHgnLFxuICAgICAgICAgICAgICAgIGJhY2tncm91bmRDb2xvcjogJ3doaXRlJyxcbiAgICAgICAgICAgICAgICBib3JkZXJSYWRpdXM6ICcxMnB4JyxcbiAgICAgICAgICAgICAgICBib3hTaGFkb3c6ICcwIDFweCAzcHggcmdiYSgwLDAsMCwwLjEpJyxcbiAgICAgICAgICAgICAgICBib3JkZXI6ICcxcHggc29saWQgI2U1ZTdlYidcbiAgICAgICAgICAgICAgfX0+XG4gICAgICAgICAgICAgICAgPGRpdiBzdHlsZT17eyBkaXNwbGF5OiAnZmxleCcsIGFsaWduSXRlbXM6ICdjZW50ZXInLCBtYXJnaW5Cb3R0b206ICc4cHgnIH19PlxuICAgICAgICAgICAgICAgICAgPGRpdiBzdHlsZT17eyB3aWR0aDogJzhweCcsIGhlaWdodDogJzhweCcsIGJhY2tncm91bmRDb2xvcjogJyNmNTllMGInLCBib3JkZXJSYWRpdXM6ICc1MCUnLCBtYXJnaW5SaWdodDogJzhweCcgfX0+PC9kaXY+XG4gICAgICAgICAgICAgICAgICA8c3BhbiBzdHlsZT17eyBmb250U2l6ZTogJzE0cHgnLCBjb2xvcjogJyM2YjcyODAnLCBmb250V2VpZ2h0OiAnNTAwJyB9fT5QZW5kaW5nPC9zcGFuPlxuICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgIDxkaXYgc3R5bGU9e3sgZm9udFNpemU6ICcyNHB4JywgZm9udFdlaWdodDogJzcwMCcsIGNvbG9yOiAnIzFlMjkzYicgfX0+XG4gICAgICAgICAgICAgICAgICB7ZGF0YT8uYXBwb2ludG1lbnRzPy5vdmVydmlldz8ucGVuZGluZ0FwcG9pbnRtZW50cyB8fCAwfVxuICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgIDxkaXYgc3R5bGU9e3tcbiAgICAgICAgICAgICAgICBwYWRkaW5nOiAnMjBweCcsXG4gICAgICAgICAgICAgICAgYmFja2dyb3VuZENvbG9yOiAnd2hpdGUnLFxuICAgICAgICAgICAgICAgIGJvcmRlclJhZGl1czogJzEycHgnLFxuICAgICAgICAgICAgICAgIGJveFNoYWRvdzogJzAgMXB4IDNweCByZ2JhKDAsMCwwLDAuMSknLFxuICAgICAgICAgICAgICAgIGJvcmRlcjogJzFweCBzb2xpZCAjZTVlN2ViJ1xuICAgICAgICAgICAgICB9fT5cbiAgICAgICAgICAgICAgICA8ZGl2IHN0eWxlPXt7IGRpc3BsYXk6ICdmbGV4JywgYWxpZ25JdGVtczogJ2NlbnRlcicsIG1hcmdpbkJvdHRvbTogJzhweCcgfX0+XG4gICAgICAgICAgICAgICAgICA8ZGl2IHN0eWxlPXt7IHdpZHRoOiAnOHB4JywgaGVpZ2h0OiAnOHB4JywgYmFja2dyb3VuZENvbG9yOiAnIzEwYjk4MScsIGJvcmRlclJhZGl1czogJzUwJScsIG1hcmdpblJpZ2h0OiAnOHB4JyB9fT48L2Rpdj5cbiAgICAgICAgICAgICAgICAgIDxzcGFuIHN0eWxlPXt7IGZvbnRTaXplOiAnMTRweCcsIGNvbG9yOiAnIzZiNzI4MCcsIGZvbnRXZWlnaHQ6ICc1MDAnIH19PkFjY2VwdGVkPC9zcGFuPlxuICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgIDxkaXYgc3R5bGU9e3sgZm9udFNpemU6ICcyNHB4JywgZm9udFdlaWdodDogJzcwMCcsIGNvbG9yOiAnIzFlMjkzYicgfX0+XG4gICAgICAgICAgICAgICAgICB7ZGF0YT8uYXBwb2ludG1lbnRzPy5vdmVydmlldz8uYWNjZXB0ZWRBcHBvaW50bWVudHMgfHwgMH1cbiAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgIFxuICAgICAgICAgICAgICA8ZGl2IHN0eWxlPXt7XG4gICAgICAgICAgICAgICAgcGFkZGluZzogJzIwcHgnLFxuICAgICAgICAgICAgICAgIGJhY2tncm91bmRDb2xvcjogJ3doaXRlJyxcbiAgICAgICAgICAgICAgICBib3JkZXJSYWRpdXM6ICcxMnB4JyxcbiAgICAgICAgICAgICAgICBib3hTaGFkb3c6ICcwIDFweCAzcHggcmdiYSgwLDAsMCwwLjEpJyxcbiAgICAgICAgICAgICAgICBib3JkZXI6ICcxcHggc29saWQgI2U1ZTdlYidcbiAgICAgICAgICAgICAgfX0+XG4gICAgICAgICAgICAgICAgPGRpdiBzdHlsZT17eyBkaXNwbGF5OiAnZmxleCcsIGFsaWduSXRlbXM6ICdjZW50ZXInLCBtYXJnaW5Cb3R0b206ICc4cHgnIH19PlxuICAgICAgICAgICAgICAgICAgPGRpdiBzdHlsZT17eyB3aWR0aDogJzhweCcsIGhlaWdodDogJzhweCcsIGJhY2tncm91bmRDb2xvcjogJyNlZjQ0NDQnLCBib3JkZXJSYWRpdXM6ICc1MCUnLCBtYXJnaW5SaWdodDogJzhweCcgfX0+PC9kaXY+XG4gICAgICAgICAgICAgICAgICA8c3BhbiBzdHlsZT17eyBmb250U2l6ZTogJzE0cHgnLCBjb2xvcjogJyM2YjcyODAnLCBmb250V2VpZ2h0OiAnNTAwJyB9fT5SZWplY3RlZDwvc3Bhbj5cbiAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICA8ZGl2IHN0eWxlPXt7IGZvbnRTaXplOiAnMjRweCcsIGZvbnRXZWlnaHQ6ICc3MDAnLCBjb2xvcjogJyMxZTI5M2InIH19PlxuICAgICAgICAgICAgICAgICAge2RhdGE/LmFwcG9pbnRtZW50cz8ub3ZlcnZpZXc/LnJlamVjdGVkQXBwb2ludG1lbnRzIHx8IDB9XG4gICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgPGRpdiBzdHlsZT17e1xuICAgICAgICAgICAgICAgIHBhZGRpbmc6ICcyMHB4JyxcbiAgICAgICAgICAgICAgICBiYWNrZ3JvdW5kQ29sb3I6ICd3aGl0ZScsXG4gICAgICAgICAgICAgICAgYm9yZGVyUmFkaXVzOiAnMTJweCcsXG4gICAgICAgICAgICAgICAgYm94U2hhZG93OiAnMCAxcHggM3B4IHJnYmEoMCwwLDAsMC4xKScsXG4gICAgICAgICAgICAgICAgYm9yZGVyOiAnMXB4IHNvbGlkICNlNWU3ZWInXG4gICAgICAgICAgICAgIH19PlxuICAgICAgICAgICAgICAgIDxkaXYgc3R5bGU9e3sgZGlzcGxheTogJ2ZsZXgnLCBhbGlnbkl0ZW1zOiAnY2VudGVyJywgbWFyZ2luQm90dG9tOiAnOHB4JyB9fT5cbiAgICAgICAgICAgICAgICAgIDxkaXYgc3R5bGU9e3sgd2lkdGg6ICc4cHgnLCBoZWlnaHQ6ICc4cHgnLCBiYWNrZ3JvdW5kQ29sb3I6ICcjM2I4MmY2JywgYm9yZGVyUmFkaXVzOiAnNTAlJywgbWFyZ2luUmlnaHQ6ICc4cHgnIH19PjwvZGl2PlxuICAgICAgICAgICAgICAgICAgPHNwYW4gc3R5bGU9e3sgZm9udFNpemU6ICcxNHB4JywgY29sb3I6ICcjNmI3MjgwJywgZm9udFdlaWdodDogJzUwMCcgfX0+QWNjZXB0YW5jZSBSYXRlPC9zcGFuPlxuICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgIDxkaXYgc3R5bGU9e3sgZm9udFNpemU6ICcyNHB4JywgZm9udFdlaWdodDogJzcwMCcsIGNvbG9yOiAnIzFlMjkzYicgfX0+XG4gICAgICAgICAgICAgICAgICB7Zm9ybWF0UGVyY2VudGFnZShkYXRhPy5hcHBvaW50bWVudHM/Lm92ZXJ2aWV3Py5hY2NlcHRhbmNlUmF0ZSB8fCAwKX1cbiAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICA8L2Rpdj5cblxuICAgICAgICAgICAge2RhdGE/LmFwcG9pbnRtZW50cz8udG9wRnJlZWxhbmNlcnM/Lmxlbmd0aCA+IDAgJiYgKFxuICAgICAgICAgICAgICA8ZGl2IHN0eWxlPXt7XG4gICAgICAgICAgICAgICAgYmFja2dyb3VuZENvbG9yOiAnd2hpdGUnLFxuICAgICAgICAgICAgICAgIGJvcmRlclJhZGl1czogJzEycHgnLFxuICAgICAgICAgICAgICAgIGJveFNoYWRvdzogJzAgMXB4IDNweCByZ2JhKDAsMCwwLDAuMSknLFxuICAgICAgICAgICAgICAgIGJvcmRlcjogJzFweCBzb2xpZCAjZTVlN2ViJyxcbiAgICAgICAgICAgICAgICBvdmVyZmxvdzogJ2hpZGRlbidcbiAgICAgICAgICAgICAgfX0+XG4gICAgICAgICAgICAgICAgPGRpdiBzdHlsZT17eyBcbiAgICAgICAgICAgICAgICAgIHBhZGRpbmc6ICcyMHB4IDI0cHgnLCBcbiAgICAgICAgICAgICAgICAgIGJvcmRlckJvdHRvbTogJzFweCBzb2xpZCAjZTVlN2ViJyxcbiAgICAgICAgICAgICAgICAgIGJhY2tncm91bmRDb2xvcjogJyNmOGZhZmMnXG4gICAgICAgICAgICAgICAgfX0+XG4gICAgICAgICAgICAgICAgICA8aDMgc3R5bGU9e3sgbWFyZ2luOiAnMCcsIGZvbnRTaXplOiAnMThweCcsIGZvbnRXZWlnaHQ6ICc2MDAnLCBjb2xvcjogJyMxZTI5M2InIH19PlxuICAgICAgICAgICAgICAgICAgICBUb3AgUGVyZm9ybWluZyBGcmVlbGFuY2Vyc1xuICAgICAgICAgICAgICAgICAgPC9oMz5cbiAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICA8dGFibGUgc3R5bGU9e3sgd2lkdGg6ICcxMDAlJywgYm9yZGVyQ29sbGFwc2U6ICdjb2xsYXBzZScgfX0+XG4gICAgICAgICAgICAgICAgICA8dGhlYWQgc3R5bGU9e3sgYmFja2dyb3VuZENvbG9yOiAnI2Y4ZmFmYycgfX0+XG4gICAgICAgICAgICAgICAgICAgIDx0cj5cbiAgICAgICAgICAgICAgICAgICAgICA8dGggc3R5bGU9e3sgdGV4dEFsaWduOiAnbGVmdCcsIHBhZGRpbmc6ICcxMnB4IDI0cHgnLCBmb250U2l6ZTogJzE0cHgnLCBmb250V2VpZ2h0OiAnNjAwJywgY29sb3I6ICcjMzc0MTUxJyB9fT5cbiAgICAgICAgICAgICAgICAgICAgICAgIEZyZWVsYW5jZXJcbiAgICAgICAgICAgICAgICAgICAgICA8L3RoPlxuICAgICAgICAgICAgICAgICAgICAgIDx0aCBzdHlsZT17eyB0ZXh0QWxpZ246ICdsZWZ0JywgcGFkZGluZzogJzEycHggMjRweCcsIGZvbnRTaXplOiAnMTRweCcsIGZvbnRXZWlnaHQ6ICc2MDAnLCBjb2xvcjogJyMzNzQxNTEnIH19PlxuICAgICAgICAgICAgICAgICAgICAgICAgVG90YWxcbiAgICAgICAgICAgICAgICAgICAgICA8L3RoPlxuICAgICAgICAgICAgICAgICAgICAgIDx0aCBzdHlsZT17eyB0ZXh0QWxpZ246ICdsZWZ0JywgcGFkZGluZzogJzEycHggMjRweCcsIGZvbnRTaXplOiAnMTRweCcsIGZvbnRXZWlnaHQ6ICc2MDAnLCBjb2xvcjogJyMzNzQxNTEnIH19PlxuICAgICAgICAgICAgICAgICAgICAgICAgQWNjZXB0ZWRcbiAgICAgICAgICAgICAgICAgICAgICA8L3RoPlxuICAgICAgICAgICAgICAgICAgICAgIDx0aCBzdHlsZT17eyB0ZXh0QWxpZ246ICdsZWZ0JywgcGFkZGluZzogJzEycHggMjRweCcsIGZvbnRTaXplOiAnMTRweCcsIGZvbnRXZWlnaHQ6ICc2MDAnLCBjb2xvcjogJyMzNzQxNTEnIH19PlxuICAgICAgICAgICAgICAgICAgICAgICAgU3VjY2VzcyBSYXRlXG4gICAgICAgICAgICAgICAgICAgICAgPC90aD5cbiAgICAgICAgICAgICAgICAgICAgPC90cj5cbiAgICAgICAgICAgICAgICAgIDwvdGhlYWQ+XG4gICAgICAgICAgICAgICAgICA8dGJvZHk+XG4gICAgICAgICAgICAgICAgICAgIHtkYXRhLmFwcG9pbnRtZW50cy50b3BGcmVlbGFuY2Vycy5tYXAoKGZyZWVsYW5jZXIsIGluZGV4KSA9PiAoXG4gICAgICAgICAgICAgICAgICAgICAgPHRyIGtleT17aW5kZXh9IHN0eWxlPXt7IGJvcmRlckJvdHRvbTogJzFweCBzb2xpZCAjZjNmNGY2JyB9fT5cbiAgICAgICAgICAgICAgICAgICAgICAgIDx0ZCBzdHlsZT17eyBwYWRkaW5nOiAnMTZweCAyNHB4JywgZm9udFNpemU6ICcxNHB4JyB9fT5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgPGRpdiBzdHlsZT17eyBkaXNwbGF5OiAnZmxleCcsIGFsaWduSXRlbXM6ICdjZW50ZXInIH19PlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxkaXYgc3R5bGU9e3tcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHdpZHRoOiAnNDBweCcsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICBoZWlnaHQ6ICc0MHB4JyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJhY2tncm91bmRDb2xvcjogJyMzYjgyZjYnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYm9yZGVyUmFkaXVzOiAnNTAlJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRpc3BsYXk6ICdmbGV4JyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFsaWduSXRlbXM6ICdjZW50ZXInLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAganVzdGlmeUNvbnRlbnQ6ICdjZW50ZXInLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29sb3I6ICd3aGl0ZScsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICBmb250V2VpZ2h0OiAnNjAwJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZvbnRTaXplOiAnMTZweCcsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtYXJnaW5SaWdodDogJzEycHgnXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfX0+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICB7ZnJlZWxhbmNlci5maXJzdF9uYW1lPy5bMF19e2ZyZWVsYW5jZXIubGFzdF9uYW1lPy5bMF19XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPGRpdj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxkaXYgc3R5bGU9e3sgZm9udFdlaWdodDogJzYwMCcsIGNvbG9yOiAnIzFlMjkzYicgfX0+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHtmcmVlbGFuY2VyLmZpcnN0X25hbWV9IHtmcmVlbGFuY2VyLmxhc3RfbmFtZX1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPGRpdiBzdHlsZT17eyBmb250U2l6ZTogJzEycHgnLCBjb2xvcjogJyM2YjcyODAnIH19PlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB7ZnJlZWxhbmNlci5lbWFpbH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICAgICAgICAgIDwvdGQ+XG4gICAgICAgICAgICAgICAgICAgICAgICA8dGQgc3R5bGU9e3sgcGFkZGluZzogJzE2cHggMjRweCcsIGZvbnRTaXplOiAnMTZweCcsIGZvbnRXZWlnaHQ6ICc2MDAnLCBjb2xvcjogJyMxZTI5M2InIH19PlxuICAgICAgICAgICAgICAgICAgICAgICAgICB7ZnJlZWxhbmNlci50b3RhbF9hcHBvaW50bWVudHN9XG4gICAgICAgICAgICAgICAgICAgICAgICA8L3RkPlxuICAgICAgICAgICAgICAgICAgICAgICAgPHRkIHN0eWxlPXt7IHBhZGRpbmc6ICcxNnB4IDI0cHgnLCBmb250U2l6ZTogJzE2cHgnLCBmb250V2VpZ2h0OiAnNjAwJywgY29sb3I6ICcjMTBiOTgxJyB9fT5cbiAgICAgICAgICAgICAgICAgICAgICAgICAge2ZyZWVsYW5jZXIuYWNjZXB0ZWRfYXBwb2ludG1lbnRzfVxuICAgICAgICAgICAgICAgICAgICAgICAgPC90ZD5cbiAgICAgICAgICAgICAgICAgICAgICAgIDx0ZCBzdHlsZT17eyBwYWRkaW5nOiAnMTZweCAyNHB4JywgZm9udFNpemU6ICcxNnB4JywgZm9udFdlaWdodDogJzYwMCcsIGNvbG9yOiAnIzNiODJmNicgfX0+XG4gICAgICAgICAgICAgICAgICAgICAgICAgIHtmb3JtYXRQZXJjZW50YWdlKGZyZWVsYW5jZXIuYWNjZXB0YW5jZV9yYXRlKX1cbiAgICAgICAgICAgICAgICAgICAgICAgIDwvdGQ+XG4gICAgICAgICAgICAgICAgICAgICAgPC90cj5cbiAgICAgICAgICAgICAgICAgICAgKSl9XG4gICAgICAgICAgICAgICAgICA8L3Rib2R5PlxuICAgICAgICAgICAgICAgIDwvdGFibGU+XG4gICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgKX1cbiAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgKX1cblxuICAgICAgICB7YWN0aXZlVGFiID09PSAndXNlcnMnICYmIChcbiAgICAgICAgICA8ZGl2PlxuICAgICAgICAgICAgPGRpdiBzdHlsZT17eyBcbiAgICAgICAgICAgICAgZGlzcGxheTogJ2dyaWQnLCBcbiAgICAgICAgICAgICAgZ3JpZFRlbXBsYXRlQ29sdW1uczogJ3JlcGVhdChhdXRvLWZpdCwgbWlubWF4KDIwMHB4LCAxZnIpKScsIFxuICAgICAgICAgICAgICBnYXA6ICcxNnB4JyxcbiAgICAgICAgICAgICAgbWFyZ2luQm90dG9tOiAnMzJweCdcbiAgICAgICAgICAgIH19PlxuICAgICAgICAgICAgICA8ZGl2IHN0eWxlPXt7XG4gICAgICAgICAgICAgICAgcGFkZGluZzogJzIwcHgnLFxuICAgICAgICAgICAgICAgIGJhY2tncm91bmRDb2xvcjogJ3doaXRlJyxcbiAgICAgICAgICAgICAgICBib3JkZXJSYWRpdXM6ICcxMnB4JyxcbiAgICAgICAgICAgICAgICBib3hTaGFkb3c6ICcwIDFweCAzcHggcmdiYSgwLDAsMCwwLjEpJyxcbiAgICAgICAgICAgICAgICBib3JkZXI6ICcxcHggc29saWQgI2U1ZTdlYidcbiAgICAgICAgICAgICAgfX0+XG4gICAgICAgICAgICAgICAgPGRpdiBzdHlsZT17eyBmb250U2l6ZTogJzE0cHgnLCBjb2xvcjogJyM2YjcyODAnLCBtYXJnaW5Cb3R0b206ICc4cHgnLCBmb250V2VpZ2h0OiAnNTAwJyB9fT5Ub3RhbCBVc2VyczwvZGl2PlxuICAgICAgICAgICAgICAgIDxkaXYgc3R5bGU9e3sgZm9udFNpemU6ICcyNHB4JywgZm9udFdlaWdodDogJzcwMCcsIGNvbG9yOiAnIzFlMjkzYicgfX0+XG4gICAgICAgICAgICAgICAgICB7KGRhdGE/LnVzZXJzPy5vdmVydmlldz8udG90YWxVc2VycyB8fCAwKS50b0xvY2FsZVN0cmluZygpfVxuICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgIDxkaXYgc3R5bGU9e3tcbiAgICAgICAgICAgICAgICBwYWRkaW5nOiAnMjBweCcsXG4gICAgICAgICAgICAgICAgYmFja2dyb3VuZENvbG9yOiAnd2hpdGUnLFxuICAgICAgICAgICAgICAgIGJvcmRlclJhZGl1czogJzEycHgnLFxuICAgICAgICAgICAgICAgIGJveFNoYWRvdzogJzAgMXB4IDNweCByZ2JhKDAsMCwwLDAuMSknLFxuICAgICAgICAgICAgICAgIGJvcmRlcjogJzFweCBzb2xpZCAjZTVlN2ViJ1xuICAgICAgICAgICAgICB9fT5cbiAgICAgICAgICAgICAgICA8ZGl2IHN0eWxlPXt7IGZvbnRTaXplOiAnMTRweCcsIGNvbG9yOiAnIzNiODJmNicsIG1hcmdpbkJvdHRvbTogJzhweCcsIGZvbnRXZWlnaHQ6ICc1MDAnIH19PkNsaWVudHM8L2Rpdj5cbiAgICAgICAgICAgICAgICA8ZGl2IHN0eWxlPXt7IGZvbnRTaXplOiAnMjRweCcsIGZvbnRXZWlnaHQ6ICc3MDAnLCBjb2xvcjogJyMxZTI5M2InIH19PlxuICAgICAgICAgICAgICAgICAgeyhkYXRhPy51c2Vycz8ub3ZlcnZpZXc/LnRvdGFsQ2xpZW50cyB8fCAwKS50b0xvY2FsZVN0cmluZygpfVxuICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgIDxkaXYgc3R5bGU9e3tcbiAgICAgICAgICAgICAgICBwYWRkaW5nOiAnMjBweCcsXG4gICAgICAgICAgICAgICAgYmFja2dyb3VuZENvbG9yOiAnd2hpdGUnLFxuICAgICAgICAgICAgICAgIGJvcmRlclJhZGl1czogJzEycHgnLFxuICAgICAgICAgICAgICAgIGJveFNoYWRvdzogJzAgMXB4IDNweCByZ2JhKDAsMCwwLDAuMSknLFxuICAgICAgICAgICAgICAgIGJvcmRlcjogJzFweCBzb2xpZCAjZTVlN2ViJ1xuICAgICAgICAgICAgICB9fT5cbiAgICAgICAgICAgICAgICA8ZGl2IHN0eWxlPXt7IGZvbnRTaXplOiAnMTRweCcsIGNvbG9yOiAnIzhiNWNmNicsIG1hcmdpbkJvdHRvbTogJzhweCcsIGZvbnRXZWlnaHQ6ICc1MDAnIH19PkZyZWVsYW5jZXJzPC9kaXY+XG4gICAgICAgICAgICAgICAgPGRpdiBzdHlsZT17eyBmb250U2l6ZTogJzI0cHgnLCBmb250V2VpZ2h0OiAnNzAwJywgY29sb3I6ICcjMWUyOTNiJyB9fT5cbiAgICAgICAgICAgICAgICAgIHsoZGF0YT8udXNlcnM/Lm92ZXJ2aWV3Py50b3RhbEZyZWVsYW5jZXJzIHx8IDApLnRvTG9jYWxlU3RyaW5nKCl9XG4gICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgPGRpdiBzdHlsZT17e1xuICAgICAgICAgICAgICAgIHBhZGRpbmc6ICcyMHB4JyxcbiAgICAgICAgICAgICAgICBiYWNrZ3JvdW5kQ29sb3I6ICd3aGl0ZScsXG4gICAgICAgICAgICAgICAgYm9yZGVyUmFkaXVzOiAnMTJweCcsXG4gICAgICAgICAgICAgICAgYm94U2hhZG93OiAnMCAxcHggM3B4IHJnYmEoMCwwLDAsMC4xKScsXG4gICAgICAgICAgICAgICAgYm9yZGVyOiAnMXB4IHNvbGlkICNlNWU3ZWInXG4gICAgICAgICAgICAgIH19PlxuICAgICAgICAgICAgICAgIDxkaXYgc3R5bGU9e3sgZm9udFNpemU6ICcxNHB4JywgY29sb3I6ICcjMTBiOTgxJywgbWFyZ2luQm90dG9tOiAnOHB4JywgZm9udFdlaWdodDogJzUwMCcgfX0+TmV3IFRoaXMgTW9udGg8L2Rpdj5cbiAgICAgICAgICAgICAgICA8ZGl2IHN0eWxlPXt7IGZvbnRTaXplOiAnMjRweCcsIGZvbnRXZWlnaHQ6ICc3MDAnLCBjb2xvcjogJyMxZTI5M2InIH19PlxuICAgICAgICAgICAgICAgICAgeyhkYXRhPy51c2Vycz8ub3ZlcnZpZXc/Lm5ld1VzZXJzTW9udGggfHwgMCkudG9Mb2NhbGVTdHJpbmcoKX1cbiAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICA8L2Rpdj5cblxuICAgICAgICAgICAge2RhdGE/LnVzZXJzPy5yZWNlbnRVc2Vycz8ubGVuZ3RoID4gMCAmJiAoXG4gICAgICAgICAgICAgIDxkaXYgc3R5bGU9e3tcbiAgICAgICAgICAgICAgICBiYWNrZ3JvdW5kQ29sb3I6ICd3aGl0ZScsXG4gICAgICAgICAgICAgICAgYm9yZGVyUmFkaXVzOiAnMTJweCcsXG4gICAgICAgICAgICAgICAgYm94U2hhZG93OiAnMCAxcHggM3B4IHJnYmEoMCwwLDAsMC4xKScsXG4gICAgICAgICAgICAgICAgYm9yZGVyOiAnMXB4IHNvbGlkICNlNWU3ZWInLFxuICAgICAgICAgICAgICAgIG92ZXJmbG93OiAnaGlkZGVuJ1xuICAgICAgICAgICAgICB9fT5cbiAgICAgICAgICAgICAgICA8ZGl2IHN0eWxlPXt7IFxuICAgICAgICAgICAgICAgICAgcGFkZGluZzogJzIwcHggMjRweCcsIFxuICAgICAgICAgICAgICAgICAgYm9yZGVyQm90dG9tOiAnMXB4IHNvbGlkICNlNWU3ZWInLFxuICAgICAgICAgICAgICAgICAgYmFja2dyb3VuZENvbG9yOiAnI2Y4ZmFmYydcbiAgICAgICAgICAgICAgICB9fT5cbiAgICAgICAgICAgICAgICAgIDxoMyBzdHlsZT17eyBtYXJnaW46ICcwJywgZm9udFNpemU6ICcxOHB4JywgZm9udFdlaWdodDogJzYwMCcsIGNvbG9yOiAnIzFlMjkzYicgfX0+XG4gICAgICAgICAgICAgICAgICAgIFJlY2VudCBVc2VyIFJlZ2lzdHJhdGlvbnNcbiAgICAgICAgICAgICAgICAgIDwvaDM+XG4gICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgPHRhYmxlIHN0eWxlPXt7IHdpZHRoOiAnMTAwJScsIGJvcmRlckNvbGxhcHNlOiAnY29sbGFwc2UnIH19PlxuICAgICAgICAgICAgICAgICAgPHRoZWFkIHN0eWxlPXt7IGJhY2tncm91bmRDb2xvcjogJyNmOGZhZmMnIH19PlxuICAgICAgICAgICAgICAgICAgICA8dHI+XG4gICAgICAgICAgICAgICAgICAgICAgPHRoIHN0eWxlPXt7IHRleHRBbGlnbjogJ2xlZnQnLCBwYWRkaW5nOiAnMTJweCAyNHB4JywgZm9udFNpemU6ICcxNHB4JywgZm9udFdlaWdodDogJzYwMCcsIGNvbG9yOiAnIzM3NDE1MScgfX0+XG4gICAgICAgICAgICAgICAgICAgICAgICBVc2VyXG4gICAgICAgICAgICAgICAgICAgICAgPC90aD5cbiAgICAgICAgICAgICAgICAgICAgICA8dGggc3R5bGU9e3sgdGV4dEFsaWduOiAnbGVmdCcsIHBhZGRpbmc6ICcxMnB4IDI0cHgnLCBmb250U2l6ZTogJzE0cHgnLCBmb250V2VpZ2h0OiAnNjAwJywgY29sb3I6ICcjMzc0MTUxJyB9fT5cbiAgICAgICAgICAgICAgICAgICAgICAgIEVtYWlsXG4gICAgICAgICAgICAgICAgICAgICAgPC90aD5cbiAgICAgICAgICAgICAgICAgICAgICA8dGggc3R5bGU9e3sgdGV4dEFsaWduOiAnbGVmdCcsIHBhZGRpbmc6ICcxMnB4IDI0cHgnLCBmb250U2l6ZTogJzE0cHgnLCBmb250V2VpZ2h0OiAnNjAwJywgY29sb3I6ICcjMzc0MTUxJyB9fT5cbiAgICAgICAgICAgICAgICAgICAgICAgIFJvbGVcbiAgICAgICAgICAgICAgICAgICAgICA8L3RoPlxuICAgICAgICAgICAgICAgICAgICAgIDx0aCBzdHlsZT17eyB0ZXh0QWxpZ246ICdsZWZ0JywgcGFkZGluZzogJzEycHggMjRweCcsIGZvbnRTaXplOiAnMTRweCcsIGZvbnRXZWlnaHQ6ICc2MDAnLCBjb2xvcjogJyMzNzQxNTEnIH19PlxuICAgICAgICAgICAgICAgICAgICAgICAgSm9pbmVkXG4gICAgICAgICAgICAgICAgICAgICAgPC90aD5cbiAgICAgICAgICAgICAgICAgICAgPC90cj5cbiAgICAgICAgICAgICAgICAgIDwvdGhlYWQ+XG4gICAgICAgICAgICAgICAgICA8dGJvZHk+XG4gICAgICAgICAgICAgICAgICAgIHtkYXRhLnVzZXJzLnJlY2VudFVzZXJzLnNsaWNlKDAsIDEwKS5tYXAoKHVzZXIsIGluZGV4KSA9PiAoXG4gICAgICAgICAgICAgICAgICAgICAgPHRyIGtleT17aW5kZXh9IHN0eWxlPXt7IGJvcmRlckJvdHRvbTogJzFweCBzb2xpZCAjZjNmNGY2JyB9fT5cbiAgICAgICAgICAgICAgICAgICAgICAgIDx0ZCBzdHlsZT17eyBwYWRkaW5nOiAnMTZweCAyNHB4JywgZm9udFNpemU6ICcxNHB4JywgZm9udFdlaWdodDogJzYwMCcsIGNvbG9yOiAnIzFlMjkzYicgfX0+XG4gICAgICAgICAgICAgICAgICAgICAgICAgIHt1c2VyLmZpcnN0X25hbWV9IHt1c2VyLmxhc3RfbmFtZX1cbiAgICAgICAgICAgICAgICAgICAgICAgIDwvdGQ+XG4gICAgICAgICAgICAgICAgICAgICAgICA8dGQgc3R5bGU9e3sgcGFkZGluZzogJzE2cHggMjRweCcsIGZvbnRTaXplOiAnMTRweCcsIGNvbG9yOiAnIzZiNzI4MCcgfX0+XG4gICAgICAgICAgICAgICAgICAgICAgICAgIHt1c2VyLmVtYWlsfVxuICAgICAgICAgICAgICAgICAgICAgICAgPC90ZD5cbiAgICAgICAgICAgICAgICAgICAgICAgIDx0ZCBzdHlsZT17eyBwYWRkaW5nOiAnMTZweCAyNHB4JywgZm9udFNpemU6ICcxNHB4JyB9fT5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgPHNwYW4gc3R5bGU9e3tcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBwYWRkaW5nOiAnNHB4IDEycHgnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJvcmRlclJhZGl1czogJzIwcHgnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZvbnRTaXplOiAnMTJweCcsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZm9udFdlaWdodDogJzYwMCcsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYmFja2dyb3VuZENvbG9yOiB1c2VyLnJvbGVfaWQgPT09IDIgPyAnI2RiZWFmZScgOiB1c2VyLnJvbGVfaWQgPT09IDMgPyAnI2YzZThmZicgOiAnI2YzZjRmNicsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29sb3I6IHVzZXIucm9sZV9pZCA9PT0gMiA/ICcjMWU0MGFmJyA6IHVzZXIucm9sZV9pZCA9PT0gMyA/ICcjN2MzYWVkJyA6ICcjMzc0MTUxJ1xuICAgICAgICAgICAgICAgICAgICAgICAgICB9fT5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB7dXNlci5yb2xlX2lkID09PSAyID8gJ0NsaWVudCcgOiB1c2VyLnJvbGVfaWQgPT09IDMgPyAnRnJlZWxhbmNlcicgOiAnVXNlcid9XG4gICAgICAgICAgICAgICAgICAgICAgICAgIDwvc3Bhbj5cbiAgICAgICAgICAgICAgICAgICAgICAgIDwvdGQ+XG4gICAgICAgICAgICAgICAgICAgICAgICA8dGQgc3R5bGU9e3sgcGFkZGluZzogJzE2cHggMjRweCcsIGZvbnRTaXplOiAnMTRweCcsIGNvbG9yOiAnIzZiNzI4MCcgfX0+XG4gICAgICAgICAgICAgICAgICAgICAgICAgIHt1c2VyLmNyZWF0ZWRfYXQgPyBmb3JtYXREYXRlKHVzZXIuY3JlYXRlZF9hdCkgOiAnLSd9XG4gICAgICAgICAgICAgICAgICAgICAgICA8L3RkPlxuICAgICAgICAgICAgICAgICAgICAgIDwvdHI+XG4gICAgICAgICAgICAgICAgICAgICkpfVxuICAgICAgICAgICAgICAgICAgPC90Ym9keT5cbiAgICAgICAgICAgICAgICA8L3RhYmxlPlxuICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICl9XG4gICAgICAgICAgPC9kaXY+XG4gICAgICAgICl9XG5cbiAgICAgICAge2FjdGl2ZVRhYiA9PT0gJ3Byb2plY3RzJyAmJiAoXG4gICAgICAgICAgPGRpdj5cbiAgICAgICAgICAgIDxkaXYgc3R5bGU9e3sgXG4gICAgICAgICAgICAgIGRpc3BsYXk6ICdncmlkJywgXG4gICAgICAgICAgICAgIGdyaWRUZW1wbGF0ZUNvbHVtbnM6ICdyZXBlYXQoYXV0by1maXQsIG1pbm1heCgxODBweCwgMWZyKSknLCBcbiAgICAgICAgICAgICAgZ2FwOiAnMTZweCcsXG4gICAgICAgICAgICAgIG1hcmdpbkJvdHRvbTogJzMycHgnXG4gICAgICAgICAgICB9fT5cbiAgICAgICAgICAgICAgPGRpdiBzdHlsZT17e1xuICAgICAgICAgICAgICAgIHBhZGRpbmc6ICcyMHB4JyxcbiAgICAgICAgICAgICAgICBiYWNrZ3JvdW5kQ29sb3I6ICd3aGl0ZScsXG4gICAgICAgICAgICAgICAgYm9yZGVyUmFkaXVzOiAnMTJweCcsXG4gICAgICAgICAgICAgICAgYm94U2hhZG93OiAnMCAxcHggM3B4IHJnYmEoMCwwLDAsMC4xKScsXG4gICAgICAgICAgICAgICAgYm9yZGVyOiAnMXB4IHNvbGlkICNlNWU3ZWInXG4gICAgICAgICAgICAgIH19PlxuICAgICAgICAgICAgICAgIDxkaXYgc3R5bGU9e3sgZm9udFNpemU6ICcxNHB4JywgY29sb3I6ICcjNmI3MjgwJywgbWFyZ2luQm90dG9tOiAnOHB4JywgZm9udFdlaWdodDogJzUwMCcgfX0+RHJhZnQ8L2Rpdj5cbiAgICAgICAgICAgICAgICA8ZGl2IHN0eWxlPXt7IGZvbnRTaXplOiAnMjRweCcsIGZvbnRXZWlnaHQ6ICc3MDAnLCBjb2xvcjogJyMxZTI5M2InIH19PlxuICAgICAgICAgICAgICAgICAge2RhdGE/Lm92ZXJ2aWV3Py5kcmFmdFByb2plY3RzIHx8IDB9XG4gICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgPGRpdiBzdHlsZT17e1xuICAgICAgICAgICAgICAgIHBhZGRpbmc6ICcyMHB4JyxcbiAgICAgICAgICAgICAgICBiYWNrZ3JvdW5kQ29sb3I6ICd3aGl0ZScsXG4gICAgICAgICAgICAgICAgYm9yZGVyUmFkaXVzOiAnMTJweCcsXG4gICAgICAgICAgICAgICAgYm94U2hhZG93OiAnMCAxcHggM3B4IHJnYmEoMCwwLDAsMC4xKScsXG4gICAgICAgICAgICAgICAgYm9yZGVyOiAnMXB4IHNvbGlkICNlNWU3ZWInXG4gICAgICAgICAgICAgIH19PlxuICAgICAgICAgICAgICAgIDxkaXYgc3R5bGU9e3sgZm9udFNpemU6ICcxNHB4JywgY29sb3I6ICcjM2I4MmY2JywgbWFyZ2luQm90dG9tOiAnOHB4JywgZm9udFdlaWdodDogJzUwMCcgfX0+QWN0aXZlPC9kaXY+XG4gICAgICAgICAgICAgICAgPGRpdiBzdHlsZT17eyBmb250U2l6ZTogJzI0cHgnLCBmb250V2VpZ2h0OiAnNzAwJywgY29sb3I6ICcjMWUyOTNiJyB9fT5cbiAgICAgICAgICAgICAgICAgIHtkYXRhPy5vdmVydmlldz8uYWN0aXZlUHJvamVjdHMgfHwgMH1cbiAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgIFxuICAgICAgICAgICAgICA8ZGl2IHN0eWxlPXt7XG4gICAgICAgICAgICAgICAgcGFkZGluZzogJzIwcHgnLFxuICAgICAgICAgICAgICAgIGJhY2tncm91bmRDb2xvcjogJ3doaXRlJyxcbiAgICAgICAgICAgICAgICBib3JkZXJSYWRpdXM6ICcxMnB4JyxcbiAgICAgICAgICAgICAgICBib3hTaGFkb3c6ICcwIDFweCAzcHggcmdiYSgwLDAsMCwwLjEpJyxcbiAgICAgICAgICAgICAgICBib3JkZXI6ICcxcHggc29saWQgI2U1ZTdlYidcbiAgICAgICAgICAgICAgfX0+XG4gICAgICAgICAgICAgICAgPGRpdiBzdHlsZT17eyBmb250U2l6ZTogJzE0cHgnLCBjb2xvcjogJyMxMGI5ODEnLCBtYXJnaW5Cb3R0b206ICc4cHgnLCBmb250V2VpZ2h0OiAnNTAwJyB9fT5Db21wbGV0ZWQ8L2Rpdj5cbiAgICAgICAgICAgICAgICA8ZGl2IHN0eWxlPXt7IGZvbnRTaXplOiAnMjRweCcsIGZvbnRXZWlnaHQ6ICc3MDAnLCBjb2xvcjogJyMxZTI5M2InIH19PlxuICAgICAgICAgICAgICAgICAge2RhdGE/Lm92ZXJ2aWV3Py5jb21wbGV0ZWRQcm9qZWN0cyB8fCAwfVxuICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgIDxkaXYgc3R5bGU9e3tcbiAgICAgICAgICAgICAgICBwYWRkaW5nOiAnMjBweCcsXG4gICAgICAgICAgICAgICAgYmFja2dyb3VuZENvbG9yOiAnd2hpdGUnLFxuICAgICAgICAgICAgICAgIGJvcmRlclJhZGl1czogJzEycHgnLFxuICAgICAgICAgICAgICAgIGJveFNoYWRvdzogJzAgMXB4IDNweCByZ2JhKDAsMCwwLDAuMSknLFxuICAgICAgICAgICAgICAgIGJvcmRlcjogJzFweCBzb2xpZCAjZTVlN2ViJ1xuICAgICAgICAgICAgICB9fT5cbiAgICAgICAgICAgICAgICA8ZGl2IHN0eWxlPXt7IGZvbnRTaXplOiAnMTRweCcsIGNvbG9yOiAnIzFlMjkzYicsIG1hcmdpbkJvdHRvbTogJzhweCcsIGZvbnRXZWlnaHQ6ICc1MDAnIH19PlRvdGFsPC9kaXY+XG4gICAgICAgICAgICAgICAgPGRpdiBzdHlsZT17eyBmb250U2l6ZTogJzI0cHgnLCBmb250V2VpZ2h0OiAnNzAwJywgY29sb3I6ICcjMWUyOTNiJyB9fT5cbiAgICAgICAgICAgICAgICAgIHtkYXRhPy5vdmVydmlldz8udG90YWxQcm9qZWN0cyB8fCAwfVxuICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgIDwvZGl2PlxuXG4gICAgICAgICAgICB7ZGF0YT8ucHJvamVjdFN0YXRzPy5ieVN0YXR1cz8ubGVuZ3RoID4gMCAmJiAoXG4gICAgICAgICAgICAgIDxkaXYgc3R5bGU9e3tcbiAgICAgICAgICAgICAgICBiYWNrZ3JvdW5kQ29sb3I6ICd3aGl0ZScsXG4gICAgICAgICAgICAgICAgYm9yZGVyUmFkaXVzOiAnMTJweCcsXG4gICAgICAgICAgICAgICAgYm94U2hhZG93OiAnMCAxcHggM3B4IHJnYmEoMCwwLDAsMC4xKScsXG4gICAgICAgICAgICAgICAgYm9yZGVyOiAnMXB4IHNvbGlkICNlNWU3ZWInLFxuICAgICAgICAgICAgICAgIHBhZGRpbmc6ICcyNHB4J1xuICAgICAgICAgICAgICB9fT5cbiAgICAgICAgICAgICAgICA8aDMgc3R5bGU9e3sgbWFyZ2luOiAnMCAwIDI0cHggMCcsIGZvbnRTaXplOiAnMThweCcsIGZvbnRXZWlnaHQ6ICc2MDAnLCBjb2xvcjogJyMxZTI5M2InIH19PlxuICAgICAgICAgICAgICAgICAgUHJvamVjdCBTdGF0dXMgRGlzdHJpYnV0aW9uXG4gICAgICAgICAgICAgICAgPC9oMz5cbiAgICAgICAgICAgICAgICA8ZGl2IHN0eWxlPXt7IGRpc3BsYXk6ICdmbGV4JywgZmxleFdyYXA6ICd3cmFwJywgZ2FwOiAnMTZweCcgfX0+XG4gICAgICAgICAgICAgICAgICB7ZGF0YS5wcm9qZWN0U3RhdHMuYnlTdGF0dXMubWFwKChzdGF0dXMsIGluZGV4KSA9PiAoXG4gICAgICAgICAgICAgICAgICAgIDxkaXYga2V5PXtpbmRleH0gc3R5bGU9e3tcbiAgICAgICAgICAgICAgICAgICAgICBkaXNwbGF5OiAnZmxleCcsXG4gICAgICAgICAgICAgICAgICAgICAgYWxpZ25JdGVtczogJ2NlbnRlcicsXG4gICAgICAgICAgICAgICAgICAgICAgcGFkZGluZzogJzEycHggMTZweCcsXG4gICAgICAgICAgICAgICAgICAgICAgYmFja2dyb3VuZENvbG9yOiAnI2Y4ZmFmYycsXG4gICAgICAgICAgICAgICAgICAgICAgYm9yZGVyUmFkaXVzOiAnOHB4JyxcbiAgICAgICAgICAgICAgICAgICAgICBib3JkZXI6ICcxcHggc29saWQgI2UyZThmMCdcbiAgICAgICAgICAgICAgICAgICAgfX0+XG4gICAgICAgICAgICAgICAgICAgICAgPGRpdiBzdHlsZT17e1xuICAgICAgICAgICAgICAgICAgICAgICAgd2lkdGg6ICcxMnB4JyxcbiAgICAgICAgICAgICAgICAgICAgICAgIGhlaWdodDogJzEycHgnLFxuICAgICAgICAgICAgICAgICAgICAgICAgYmFja2dyb3VuZENvbG9yOiBzdGF0dXMuY29sb3IsXG4gICAgICAgICAgICAgICAgICAgICAgICBib3JkZXJSYWRpdXM6ICczcHgnLFxuICAgICAgICAgICAgICAgICAgICAgICAgbWFyZ2luUmlnaHQ6ICc4cHgnXG4gICAgICAgICAgICAgICAgICAgICAgfX0+PC9kaXY+XG4gICAgICAgICAgICAgICAgICAgICAgPHNwYW4gc3R5bGU9e3sgZm9udFNpemU6ICcxNHB4JywgZm9udFdlaWdodDogJzUwMCcsIGNvbG9yOiAnIzM3NDE1MScgfX0+XG4gICAgICAgICAgICAgICAgICAgICAgICB7c3RhdHVzLnN0YXR1c306IHtzdGF0dXMuY291bnR9XG4gICAgICAgICAgICAgICAgICAgICAgPC9zcGFuPlxuICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICAgICkpfVxuICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICl9XG4gICAgICAgICAgPC9kaXY+XG4gICAgICAgICl9XG5cbiAgICAgICAge2FjdGl2ZVRhYiA9PT0gJ2ZpbmFuY2lhbCcgJiYgKFxuICAgICAgICAgIDxkaXY+XG4gICAgICAgICAgICA8ZGl2IHN0eWxlPXt7IFxuICAgICAgICAgICAgICBkaXNwbGF5OiAnZ3JpZCcsIFxuICAgICAgICAgICAgICBncmlkVGVtcGxhdGVDb2x1bW5zOiAncmVwZWF0KGF1dG8tZml0LCBtaW5tYXgoMjAwcHgsIDFmcikpJywgXG4gICAgICAgICAgICAgIGdhcDogJzE2cHgnLFxuICAgICAgICAgICAgICBtYXJnaW5Cb3R0b206ICczMnB4J1xuICAgICAgICAgICAgfX0+XG4gICAgICAgICAgICAgIDxkaXYgc3R5bGU9e3tcbiAgICAgICAgICAgICAgICBwYWRkaW5nOiAnMjBweCcsXG4gICAgICAgICAgICAgICAgYmFja2dyb3VuZENvbG9yOiAnd2hpdGUnLFxuICAgICAgICAgICAgICAgIGJvcmRlclJhZGl1czogJzEycHgnLFxuICAgICAgICAgICAgICAgIGJveFNoYWRvdzogJzAgMXB4IDNweCByZ2JhKDAsMCwwLDAuMSknLFxuICAgICAgICAgICAgICAgIGJvcmRlcjogJzFweCBzb2xpZCAjZTVlN2ViJ1xuICAgICAgICAgICAgICB9fT5cbiAgICAgICAgICAgICAgICA8ZGl2IHN0eWxlPXt7IGZvbnRTaXplOiAnMTRweCcsIGNvbG9yOiAnIzZiNzI4MCcsIG1hcmdpbkJvdHRvbTogJzhweCcsIGZvbnRXZWlnaHQ6ICc1MDAnIH19PlRvdGFsIFJldmVudWU8L2Rpdj5cbiAgICAgICAgICAgICAgICA8ZGl2IHN0eWxlPXt7IGZvbnRTaXplOiAnMjRweCcsIGZvbnRXZWlnaHQ6ICc3MDAnLCBjb2xvcjogJyMxZTI5M2InIH19PlxuICAgICAgICAgICAgICAgICAge2Zvcm1hdEN1cnJlbmN5KGRhdGE/Lm92ZXJ2aWV3Py50b3RhbFJldmVudWUgfHwgMCl9XG4gICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgPGRpdiBzdHlsZT17e1xuICAgICAgICAgICAgICAgIHBhZGRpbmc6ICcyMHB4JyxcbiAgICAgICAgICAgICAgICBiYWNrZ3JvdW5kQ29sb3I6ICd3aGl0ZScsXG4gICAgICAgICAgICAgICAgYm9yZGVyUmFkaXVzOiAnMTJweCcsXG4gICAgICAgICAgICAgICAgYm94U2hhZG93OiAnMCAxcHggM3B4IHJnYmEoMCwwLDAsMC4xKScsXG4gICAgICAgICAgICAgICAgYm9yZGVyOiAnMXB4IHNvbGlkICNlNWU3ZWInXG4gICAgICAgICAgICAgIH19PlxuICAgICAgICAgICAgICAgIDxkaXYgc3R5bGU9e3sgZm9udFNpemU6ICcxNHB4JywgY29sb3I6ICcjNmI3MjgwJywgbWFyZ2luQm90dG9tOiAnOHB4JywgZm9udFdlaWdodDogJzUwMCcgfX0+VHJhbnNhY3Rpb25zPC9kaXY+XG4gICAgICAgICAgICAgICAgPGRpdiBzdHlsZT17eyBmb250U2l6ZTogJzI0cHgnLCBmb250V2VpZ2h0OiAnNzAwJywgY29sb3I6ICcjMWUyOTNiJyB9fT5cbiAgICAgICAgICAgICAgICAgIHsoZGF0YT8ub3ZlcnZpZXc/LnRvdGFsVHJhbnNhY3Rpb25zIHx8IDApLnRvTG9jYWxlU3RyaW5nKCl9XG4gICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgPGRpdiBzdHlsZT17e1xuICAgICAgICAgICAgICAgIHBhZGRpbmc6ICcyMHB4JyxcbiAgICAgICAgICAgICAgICBiYWNrZ3JvdW5kQ29sb3I6ICd3aGl0ZScsXG4gICAgICAgICAgICAgICAgYm9yZGVyUmFkaXVzOiAnMTJweCcsXG4gICAgICAgICAgICAgICAgYm94U2hhZG93OiAnMCAxcHggM3B4IHJnYmEoMCwwLDAsMC4xKScsXG4gICAgICAgICAgICAgICAgYm9yZGVyOiAnMXB4IHNvbGlkICNlNWU3ZWInXG4gICAgICAgICAgICAgIH19PlxuICAgICAgICAgICAgICAgIDxkaXYgc3R5bGU9e3sgZm9udFNpemU6ICcxNHB4JywgY29sb3I6ICcjNmI3MjgwJywgbWFyZ2luQm90dG9tOiAnOHB4JywgZm9udFdlaWdodDogJzUwMCcgfX0+TW9udGhseSBSZXZlbnVlPC9kaXY+XG4gICAgICAgICAgICAgICAgPGRpdiBzdHlsZT17eyBmb250U2l6ZTogJzI0cHgnLCBmb250V2VpZ2h0OiAnNzAwJywgY29sb3I6ICcjMWUyOTNiJyB9fT5cbiAgICAgICAgICAgICAgICAgIHtmb3JtYXRDdXJyZW5jeShkYXRhPy5vdmVydmlldz8ubW9udGhseVJldmVudWUgfHwgMCl9XG4gICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgPGRpdiBzdHlsZT17e1xuICAgICAgICAgICAgICAgIHBhZGRpbmc6ICcyMHB4JyxcbiAgICAgICAgICAgICAgICBiYWNrZ3JvdW5kQ29sb3I6ICd3aGl0ZScsXG4gICAgICAgICAgICAgICAgYm9yZGVyUmFkaXVzOiAnMTJweCcsXG4gICAgICAgICAgICAgICAgYm94U2hhZG93OiAnMCAxcHggM3B4IHJnYmEoMCwwLDAsMC4xKScsXG4gICAgICAgICAgICAgICAgYm9yZGVyOiAnMXB4IHNvbGlkICNlNWU3ZWInXG4gICAgICAgICAgICAgIH19PlxuICAgICAgICAgICAgICAgIDxkaXYgc3R5bGU9e3sgZm9udFNpemU6ICcxNHB4JywgY29sb3I6ICcjNmI3MjgwJywgbWFyZ2luQm90dG9tOiAnOHB4JywgZm9udFdlaWdodDogJzUwMCcgfX0+QXZnIFRyYW5zYWN0aW9uPC9kaXY+XG4gICAgICAgICAgICAgICAgPGRpdiBzdHlsZT17eyBmb250U2l6ZTogJzI0cHgnLCBmb250V2VpZ2h0OiAnNzAwJywgY29sb3I6ICcjMWUyOTNiJyB9fT5cbiAgICAgICAgICAgICAgICAgIHtmb3JtYXRDdXJyZW5jeShkYXRhPy5vdmVydmlldz8uYXZnVHJhbnNhY3Rpb24gfHwgMCl9XG4gICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgPC9kaXY+XG5cbiAgICAgICAgICAgIDxkaXYgc3R5bGU9e3tcbiAgICAgICAgICAgICAgYmFja2dyb3VuZENvbG9yOiAnd2hpdGUnLFxuICAgICAgICAgICAgICBib3JkZXJSYWRpdXM6ICcxMnB4JyxcbiAgICAgICAgICAgICAgYm94U2hhZG93OiAnMCAxcHggM3B4IHJnYmEoMCwwLDAsMC4xKScsXG4gICAgICAgICAgICAgIGJvcmRlcjogJzFweCBzb2xpZCAjZTVlN2ViJyxcbiAgICAgICAgICAgICAgcGFkZGluZzogJzI0cHgnXG4gICAgICAgICAgICB9fT5cbiAgICAgICAgICAgICAgPGgzIHN0eWxlPXt7IG1hcmdpbjogJzAgMCAxNnB4IDAnLCBmb250U2l6ZTogJzE4cHgnLCBmb250V2VpZ2h0OiAnNjAwJywgY29sb3I6ICcjMWUyOTNiJyB9fT5cbiAgICAgICAgICAgICAgICBGaW5hbmNpYWwgT3ZlcnZpZXdcbiAgICAgICAgICAgICAgPC9oMz5cbiAgICAgICAgICAgICAgPHAgc3R5bGU9e3sgbWFyZ2luOiAnMCcsIGNvbG9yOiAnIzZiNzI4MCcsIGZvbnRTaXplOiAnMTRweCcgfX0+XG4gICAgICAgICAgICAgICAgRmluYW5jaWFsIGFuYWx5dGljcyBwcm92aWRlIGluc2lnaHRzIGludG8gcmV2ZW51ZSB0cmVuZHMsIHBheW1lbnQgcGF0dGVybnMsIGFuZCB0cmFuc2FjdGlvbiBkYXRhLlxuICAgICAgICAgICAgICAgIHtkYXRhPy5vdmVydmlldz8udG90YWxSZXZlbnVlID4gMCBcbiAgICAgICAgICAgICAgICAgID8gYCBDdXJyZW50IHRvdGFsIHJldmVudWUgc3RhbmRzIGF0ICR7Zm9ybWF0Q3VycmVuY3koZGF0YS5vdmVydmlldy50b3RhbFJldmVudWUpfSBhY3Jvc3MgJHsoZGF0YS5vdmVydmlldy50b3RhbFRyYW5zYWN0aW9ucyB8fCAwKS50b0xvY2FsZVN0cmluZygpfSB0cmFuc2FjdGlvbnMuYFxuICAgICAgICAgICAgICAgICAgOiAnIE5vIHBheW1lbnQgZGF0YSBhdmFpbGFibGUgeWV0LidcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIDwvcD5cbiAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgIDwvZGl2PlxuICAgICAgICApfVxuICAgICAgPC9kaXY+XG4gICAgPC9kaXY+XG4gICk7XG59IiwiaW1wb3J0IFJlYWN0IGZyb20gJ3JlYWN0JztcclxuXHJcbmNvbnN0IFJlbGF0ZWRNYXRlcmlhbHMgPSAoeyByZWNvcmQgfSkgPT4ge1xyXG4gIGNvbnN0IG1hdGVyaWFscyA9IHJlY29yZC5wYXJhbXM/LmNvdXJzZV9tYXRlcmlhbHMgfHwgW107XHJcbiAgY29uc3QgY291cnNlSWQgPSByZWNvcmQucGFyYW1zPy5pZDtcclxuXHJcbiAgaWYgKCFtYXRlcmlhbHMubGVuZ3RoKSB7XHJcbiAgICByZXR1cm4gKFxyXG4gICAgICA8ZGl2IHN0eWxlPXt7IFxyXG4gICAgICAgIGJhY2tncm91bmQ6ICcjZjhmOWZhJywgXHJcbiAgICAgICAgcGFkZGluZzogJzE2cHgnLCBcclxuICAgICAgICBib3JkZXJSYWRpdXM6ICc4cHgnLCBcclxuICAgICAgICBtYXJnaW5Cb3R0b206ICcxNnB4JyBcclxuICAgICAgfX0+XHJcbiAgICAgICAgPGgzIHN0eWxlPXt7IGZvbnRTaXplOiAnMThweCcsIGZvbnRXZWlnaHQ6ICc2MDAnLCBtYXJnaW5Cb3R0b206ICc4cHgnIH19PlxyXG4gICAgICAgICAgQ291cnNlIE1hdGVyaWFsc1xyXG4gICAgICAgIDwvaDM+XHJcbiAgICAgICAgPHAgc3R5bGU9e3sgY29sb3I6ICcjNmI3MjgwJywgbWFyZ2luQm90dG9tOiAnMTZweCcgfX0+XHJcbiAgICAgICAgICBObyBtYXRlcmlhbHMgdXBsb2FkZWQgeWV0LlxyXG4gICAgICAgIDwvcD5cclxuICAgICAgICA8YSBcclxuICAgICAgICAgIGhyZWY9e2AvYWRtaW4vcmVzb3VyY2VzL2NvdXJzZV9tYXRlcmlhbHMvYWN0aW9ucy9uZXc/Y291cnNlX2lkPSR7Y291cnNlSWR9YH1cclxuICAgICAgICAgIHN0eWxlPXt7XHJcbiAgICAgICAgICAgIGJhY2tncm91bmQ6ICcjM2I4MmY2JyxcclxuICAgICAgICAgICAgY29sb3I6ICd3aGl0ZScsXHJcbiAgICAgICAgICAgIHBhZGRpbmc6ICc4cHggMTZweCcsXHJcbiAgICAgICAgICAgIGJvcmRlclJhZGl1czogJzZweCcsXHJcbiAgICAgICAgICAgIHRleHREZWNvcmF0aW9uOiAnbm9uZScsXHJcbiAgICAgICAgICAgIGRpc3BsYXk6ICdpbmxpbmUtYmxvY2snLFxyXG4gICAgICAgICAgICBmb250U2l6ZTogJzE0cHgnXHJcbiAgICAgICAgICB9fVxyXG4gICAgICAgID5cclxuICAgICAgICAgIEFkZCBNYXRlcmlhbFxyXG4gICAgICAgIDwvYT5cclxuICAgICAgPC9kaXY+XHJcbiAgICApO1xyXG4gIH1cclxuXHJcbiAgcmV0dXJuIChcclxuICAgIDxkaXYgc3R5bGU9e3sgXHJcbiAgICAgIGJhY2tncm91bmQ6ICcjZjhmOWZhJywgXHJcbiAgICAgIHBhZGRpbmc6ICcxNnB4JywgXHJcbiAgICAgIGJvcmRlclJhZGl1czogJzhweCcsIFxyXG4gICAgICBtYXJnaW5Cb3R0b206ICcxNnB4JyBcclxuICAgIH19PlxyXG4gICAgICA8ZGl2IHN0eWxlPXt7IFxyXG4gICAgICAgIGRpc3BsYXk6ICdmbGV4JywgXHJcbiAgICAgICAganVzdGlmeUNvbnRlbnQ6ICdzcGFjZS1iZXR3ZWVuJywgXHJcbiAgICAgICAgYWxpZ25JdGVtczogJ2NlbnRlcicsIFxyXG4gICAgICAgIG1hcmdpbkJvdHRvbTogJzEycHgnIFxyXG4gICAgICB9fT5cclxuICAgICAgICA8aDMgc3R5bGU9e3sgZm9udFNpemU6ICcxOHB4JywgZm9udFdlaWdodDogJzYwMCcsIG1hcmdpbjogMCB9fT5cclxuICAgICAgICAgIENvdXJzZSBNYXRlcmlhbHMgKHttYXRlcmlhbHMubGVuZ3RofSlcclxuICAgICAgICA8L2gzPlxyXG4gICAgICAgIDxhIFxyXG4gICAgICAgICAgaHJlZj17YC9hZG1pbi9yZXNvdXJjZXMvY291cnNlX21hdGVyaWFscy9hY3Rpb25zL25ldz9jb3Vyc2VfaWQ9JHtjb3Vyc2VJZH1gfVxyXG4gICAgICAgICAgc3R5bGU9e3tcclxuICAgICAgICAgICAgYmFja2dyb3VuZDogJyMzYjgyZjYnLFxyXG4gICAgICAgICAgICBjb2xvcjogJ3doaXRlJyxcclxuICAgICAgICAgICAgcGFkZGluZzogJzZweCAxMnB4JyxcclxuICAgICAgICAgICAgYm9yZGVyUmFkaXVzOiAnNnB4JyxcclxuICAgICAgICAgICAgdGV4dERlY29yYXRpb246ICdub25lJyxcclxuICAgICAgICAgICAgZm9udFNpemU6ICcxMnB4J1xyXG4gICAgICAgICAgfX1cclxuICAgICAgICA+XHJcbiAgICAgICAgICBBZGQgTWF0ZXJpYWxcclxuICAgICAgICA8L2E+XHJcbiAgICAgIDwvZGl2PlxyXG4gICAgICBcclxuICAgICAgPGRpdiBzdHlsZT17eyBkaXNwbGF5OiAnZmxleCcsIGZsZXhEaXJlY3Rpb246ICdjb2x1bW4nLCBnYXA6ICc4cHgnIH19PlxyXG4gICAgICAgIHttYXRlcmlhbHMubWFwKChtYXRlcmlhbCkgPT4gKFxyXG4gICAgICAgICAgPGRpdiBcclxuICAgICAgICAgICAga2V5PXttYXRlcmlhbC5pZH0gXHJcbiAgICAgICAgICAgIHN0eWxlPXt7IFxyXG4gICAgICAgICAgICAgIGJhY2tncm91bmQ6ICd3aGl0ZScsIFxyXG4gICAgICAgICAgICAgIHBhZGRpbmc6ICcxMnB4JywgXHJcbiAgICAgICAgICAgICAgYm9yZGVyUmFkaXVzOiAnNnB4JywgXHJcbiAgICAgICAgICAgICAgYm9yZGVyOiAnMXB4IHNvbGlkICNlNWU3ZWInXHJcbiAgICAgICAgICAgIH19XHJcbiAgICAgICAgICA+XHJcbiAgICAgICAgICAgIDxwIHN0eWxlPXt7IGZvbnRXZWlnaHQ6ICc1MDAnLCBtYXJnaW46ICcwIDAgNHB4IDAnIH19PlxyXG4gICAgICAgICAgICAgIE1hdGVyaWFsICN7bWF0ZXJpYWwuaWR9XHJcbiAgICAgICAgICAgIDwvcD5cclxuICAgICAgICAgICAgPGEgXHJcbiAgICAgICAgICAgICAgaHJlZj17bWF0ZXJpYWwuZmlsZV91cmx9IFxyXG4gICAgICAgICAgICAgIHRhcmdldD1cIl9ibGFua1wiIFxyXG4gICAgICAgICAgICAgIHJlbD1cIm5vb3BlbmVyIG5vcmVmZXJyZXJcIlxyXG4gICAgICAgICAgICAgIHN0eWxlPXt7IGNvbG9yOiAnIzNiODJmNicsIGZvbnRTaXplOiAnMTRweCcsIHRleHREZWNvcmF0aW9uOiAnbm9uZScgfX1cclxuICAgICAgICAgICAgPlxyXG4gICAgICAgICAgICAgIHttYXRlcmlhbC5maWxlX3VybH1cclxuICAgICAgICAgICAgPC9hPlxyXG4gICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgKSl9XHJcbiAgICAgIDwvZGl2PlxyXG4gICAgPC9kaXY+XHJcbiAgKTtcclxufTtcclxuXHJcbmNvbnN0IFJlbGF0ZWRFbnJvbGxtZW50cyA9ICh7IHJlY29yZCB9KSA9PiB7XHJcbiAgY29uc3QgZW5yb2xsbWVudHMgPSByZWNvcmQucGFyYW1zPy5jb3Vyc2VfZW5yb2xsbWVudHMgfHwgW107XHJcbiAgY29uc3QgY291cnNlSWQgPSByZWNvcmQucGFyYW1zPy5pZDtcclxuXHJcbiAgaWYgKCFlbnJvbGxtZW50cy5sZW5ndGgpIHtcclxuICAgIHJldHVybiAoXHJcbiAgICAgIDxkaXYgc3R5bGU9e3sgXHJcbiAgICAgICAgYmFja2dyb3VuZDogJyNmOGY5ZmEnLCBcclxuICAgICAgICBwYWRkaW5nOiAnMTZweCcsIFxyXG4gICAgICAgIGJvcmRlclJhZGl1czogJzhweCcsIFxyXG4gICAgICAgIG1hcmdpbkJvdHRvbTogJzE2cHgnIFxyXG4gICAgICB9fT5cclxuICAgICAgICA8aDMgc3R5bGU9e3sgZm9udFNpemU6ICcxOHB4JywgZm9udFdlaWdodDogJzYwMCcsIG1hcmdpbkJvdHRvbTogJzhweCcgfX0+XHJcbiAgICAgICAgICBDb3Vyc2UgRW5yb2xsbWVudHNcclxuICAgICAgICA8L2gzPlxyXG4gICAgICAgIDxwIHN0eWxlPXt7IGNvbG9yOiAnIzZiNzI4MCcsIG1hcmdpbkJvdHRvbTogJzE2cHgnIH19PlxyXG4gICAgICAgICAgTm8gZW5yb2xsbWVudHMgeWV0LlxyXG4gICAgICAgIDwvcD5cclxuICAgICAgICA8YSBcclxuICAgICAgICAgIGhyZWY9e2AvYWRtaW4vcmVzb3VyY2VzL2NvdXJzZV9lbnJvbGxtZW50cy9hY3Rpb25zL25ldz9jb3Vyc2VfaWQ9JHtjb3Vyc2VJZH1gfVxyXG4gICAgICAgICAgc3R5bGU9e3tcclxuICAgICAgICAgICAgYmFja2dyb3VuZDogJyMxMGI5ODEnLFxyXG4gICAgICAgICAgICBjb2xvcjogJ3doaXRlJyxcclxuICAgICAgICAgICAgcGFkZGluZzogJzhweCAxNnB4JyxcclxuICAgICAgICAgICAgYm9yZGVyUmFkaXVzOiAnNnB4JyxcclxuICAgICAgICAgICAgdGV4dERlY29yYXRpb246ICdub25lJyxcclxuICAgICAgICAgICAgZGlzcGxheTogJ2lubGluZS1ibG9jaycsXHJcbiAgICAgICAgICAgIGZvbnRTaXplOiAnMTRweCdcclxuICAgICAgICAgIH19XHJcbiAgICAgICAgPlxyXG4gICAgICAgICAgQWRkIEVucm9sbG1lbnRcclxuICAgICAgICA8L2E+XHJcbiAgICAgIDwvZGl2PlxyXG4gICAgKTtcclxuICB9XHJcblxyXG4gIHJldHVybiAoXHJcbiAgICA8ZGl2IHN0eWxlPXt7IFxyXG4gICAgICBiYWNrZ3JvdW5kOiAnI2Y4ZjlmYScsIFxyXG4gICAgICBwYWRkaW5nOiAnMTZweCcsIFxyXG4gICAgICBib3JkZXJSYWRpdXM6ICc4cHgnLCBcclxuICAgICAgbWFyZ2luQm90dG9tOiAnMTZweCcgXHJcbiAgICB9fT5cclxuICAgICAgPGRpdiBzdHlsZT17eyBcclxuICAgICAgICBkaXNwbGF5OiAnZmxleCcsIFxyXG4gICAgICAgIGp1c3RpZnlDb250ZW50OiAnc3BhY2UtYmV0d2VlbicsIFxyXG4gICAgICAgIGFsaWduSXRlbXM6ICdjZW50ZXInLCBcclxuICAgICAgICBtYXJnaW5Cb3R0b206ICcxMnB4JyBcclxuICAgICAgfX0+XHJcbiAgICAgICAgPGgzIHN0eWxlPXt7IGZvbnRTaXplOiAnMThweCcsIGZvbnRXZWlnaHQ6ICc2MDAnLCBtYXJnaW46IDAgfX0+XHJcbiAgICAgICAgICBFbnJvbGxtZW50cyAoe2Vucm9sbG1lbnRzLmxlbmd0aH0pXHJcbiAgICAgICAgPC9oMz5cclxuICAgICAgICA8YSBcclxuICAgICAgICAgIGhyZWY9e2AvYWRtaW4vcmVzb3VyY2VzL2NvdXJzZV9lbnJvbGxtZW50cy9hY3Rpb25zL25ldz9jb3Vyc2VfaWQ9JHtjb3Vyc2VJZH1gfVxyXG4gICAgICAgICAgc3R5bGU9e3tcclxuICAgICAgICAgICAgYmFja2dyb3VuZDogJyMxMGI5ODEnLFxyXG4gICAgICAgICAgICBjb2xvcjogJ3doaXRlJyxcclxuICAgICAgICAgICAgcGFkZGluZzogJzZweCAxMnB4JyxcclxuICAgICAgICAgICAgYm9yZGVyUmFkaXVzOiAnNnB4JyxcclxuICAgICAgICAgICAgdGV4dERlY29yYXRpb246ICdub25lJyxcclxuICAgICAgICAgICAgZm9udFNpemU6ICcxMnB4J1xyXG4gICAgICAgICAgfX1cclxuICAgICAgICA+XHJcbiAgICAgICAgICBBZGQgRW5yb2xsbWVudFxyXG4gICAgICAgIDwvYT5cclxuICAgICAgPC9kaXY+XHJcbiAgICAgIFxyXG4gICAgICA8ZGl2IHN0eWxlPXt7IGRpc3BsYXk6ICdmbGV4JywgZmxleERpcmVjdGlvbjogJ2NvbHVtbicsIGdhcDogJzhweCcgfX0+XHJcbiAgICAgICAge2Vucm9sbG1lbnRzLm1hcCgoZW5yb2xsbWVudCkgPT4gKFxyXG4gICAgICAgICAgPGRpdiBcclxuICAgICAgICAgICAga2V5PXtlbnJvbGxtZW50LmlkfSBcclxuICAgICAgICAgICAgc3R5bGU9e3sgXHJcbiAgICAgICAgICAgICAgYmFja2dyb3VuZDogJ3doaXRlJywgXHJcbiAgICAgICAgICAgICAgcGFkZGluZzogJzEycHgnLCBcclxuICAgICAgICAgICAgICBib3JkZXJSYWRpdXM6ICc2cHgnLCBcclxuICAgICAgICAgICAgICBib3JkZXI6ICcxcHggc29saWQgI2U1ZTdlYidcclxuICAgICAgICAgICAgfX1cclxuICAgICAgICAgID5cclxuICAgICAgICAgICAgPGRpdiBzdHlsZT17eyBtYXJnaW5Cb3R0b206ICc4cHgnIH19PlxyXG4gICAgICAgICAgICAgIDxwIHN0eWxlPXt7IGZvbnRXZWlnaHQ6ICc1MDAnLCBtYXJnaW46ICcwIDAgNHB4IDAnIH19PlxyXG4gICAgICAgICAgICAgICAge2Vucm9sbG1lbnQuZnJlZWxhbmNlcl9uYW1lIHx8IGBVc2VyICMke2Vucm9sbG1lbnQuZnJlZWxhbmNlcl9pZH1gfVxyXG4gICAgICAgICAgICAgIDwvcD5cclxuICAgICAgICAgICAgICA8cCBzdHlsZT17eyBmb250U2l6ZTogJzE0cHgnLCBjb2xvcjogJyM2YjcyODAnLCBtYXJnaW46ICcwIDAgNHB4IDAnIH19PlxyXG4gICAgICAgICAgICAgICAge2Vucm9sbG1lbnQuZnJlZWxhbmNlcl9lbWFpbCB8fCAnTm8gZW1haWwnfVxyXG4gICAgICAgICAgICAgIDwvcD5cclxuICAgICAgICAgICAgICA8cCBzdHlsZT17eyBmb250U2l6ZTogJzE0cHgnLCBjb2xvcjogJyM2YjcyODAnLCBtYXJnaW46IDAgfX0+XHJcbiAgICAgICAgICAgICAgICBFbnJvbGxlZDoge25ldyBEYXRlKGVucm9sbG1lbnQuZW5yb2xsZWRfYXQpLnRvTG9jYWxlRGF0ZVN0cmluZygpfVxyXG4gICAgICAgICAgICAgIDwvcD5cclxuICAgICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgICAgIFxyXG4gICAgICAgICAgICA8ZGl2IHN0eWxlPXt7IG1hcmdpbkJvdHRvbTogJzhweCcgfX0+XHJcbiAgICAgICAgICAgICAgPHNwYW4gc3R5bGU9e3sgXHJcbiAgICAgICAgICAgICAgICBmb250U2l6ZTogJzEycHgnLCBcclxuICAgICAgICAgICAgICAgIGZvbnRXZWlnaHQ6ICc1MDAnLCBcclxuICAgICAgICAgICAgICAgIGNvbG9yOiAnIzFlNDBhZicsXHJcbiAgICAgICAgICAgICAgICBiYWNrZ3JvdW5kOiAnI2RiZWFmZScsXHJcbiAgICAgICAgICAgICAgICBwYWRkaW5nOiAnMnB4IDZweCcsXHJcbiAgICAgICAgICAgICAgICBib3JkZXJSYWRpdXM6ICc0cHgnXHJcbiAgICAgICAgICAgICAgfX0+XHJcbiAgICAgICAgICAgICAgICB7ZW5yb2xsbWVudC5wcm9ncmVzcyB8fCAwfSUgQ29tcGxldGVcclxuICAgICAgICAgICAgICA8L3NwYW4+XHJcbiAgICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICAgICBcclxuICAgICAgICAgICAgPGRpdiBzdHlsZT17eyBcclxuICAgICAgICAgICAgICB3aWR0aDogJzEwMCUnLCBcclxuICAgICAgICAgICAgICBiYWNrZ3JvdW5kOiAnI2U1ZTdlYicsIFxyXG4gICAgICAgICAgICAgIGJvcmRlclJhZGl1czogJzRweCcsIFxyXG4gICAgICAgICAgICAgIGhlaWdodDogJzZweCdcclxuICAgICAgICAgICAgfX0+XHJcbiAgICAgICAgICAgICAgPGRpdiBcclxuICAgICAgICAgICAgICAgIHN0eWxlPXt7IFxyXG4gICAgICAgICAgICAgICAgICBiYWNrZ3JvdW5kOiAnIzNiODJmNicsIFxyXG4gICAgICAgICAgICAgICAgICBoZWlnaHQ6ICc2cHgnLCBcclxuICAgICAgICAgICAgICAgICAgYm9yZGVyUmFkaXVzOiAnNHB4JyxcclxuICAgICAgICAgICAgICAgICAgd2lkdGg6IGAke2Vucm9sbG1lbnQucHJvZ3Jlc3MgfHwgMH0lYFxyXG4gICAgICAgICAgICAgICAgfX1cclxuICAgICAgICAgICAgICAvPlxyXG4gICAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICkpfVxyXG4gICAgICA8L2Rpdj5cclxuICAgIDwvZGl2PlxyXG4gICk7XHJcbn07XHJcblxyXG5leHBvcnQgeyBSZWxhdGVkTWF0ZXJpYWxzLCBSZWxhdGVkRW5yb2xsbWVudHMgfTtcclxuZXhwb3J0IGRlZmF1bHQgUmVsYXRlZE1hdGVyaWFsczsiLCJBZG1pbkpTLlVzZXJDb21wb25lbnRzID0ge31cbmltcG9ydCBEYXNoYm9hcmQgZnJvbSAnLi4vLi4vZnJvbnRlbmQvYWRtaW4tY29tcG9uZW50cy9kYXNoYm9hcmQnXG5BZG1pbkpTLlVzZXJDb21wb25lbnRzLkRhc2hib2FyZCA9IERhc2hib2FyZFxuaW1wb3J0IEFuYWx5dGljcyBmcm9tICcuLi8uLi9mcm9udGVuZC9hZG1pbi1jb21wb25lbnRzL2FuYWx5dGljcydcbkFkbWluSlMuVXNlckNvbXBvbmVudHMuQW5hbHl0aWNzID0gQW5hbHl0aWNzXG5pbXBvcnQgUmVsYXRlZE1hdGVyaWFscyBmcm9tICcuLi8uLi9mcm9udGVuZC9hZG1pbi1jb21wb25lbnRzL2NvdXJzZS1jb21wb25lbnRzJ1xuQWRtaW5KUy5Vc2VyQ29tcG9uZW50cy5SZWxhdGVkTWF0ZXJpYWxzID0gUmVsYXRlZE1hdGVyaWFsc1xuaW1wb3J0IFJlbGF0ZWRFbnJvbGxtZW50cyBmcm9tICcuLi8uLi9mcm9udGVuZC9hZG1pbi1jb21wb25lbnRzL2NvdXJzZS1jb21wb25lbnRzJ1xuQWRtaW5KUy5Vc2VyQ29tcG9uZW50cy5SZWxhdGVkRW5yb2xsbWVudHMgPSBSZWxhdGVkRW5yb2xsbWVudHMiXSwibmFtZXMiOlsiYXBpIiwiQXBpQ2xpZW50IiwiRGFzaGJvYXJkIiwidHJhbnNsYXRlTWVzc2FnZSIsInVzZVRyYW5zbGF0aW9uIiwiZGF0YSIsInNldERhdGEiLCJ1c2VTdGF0ZSIsImxvYWRpbmciLCJzZXRMb2FkaW5nIiwiZXJyb3IiLCJzZXRFcnJvciIsImFkbWluTG9ncyIsInNldEFkbWluTG9ncyIsInVzZXJMb2dzIiwic2V0VXNlckxvZ3MiLCJmZXRjaGluZ1JlZiIsInVzZVJlZiIsIm1vdW50ZWRSZWYiLCJmZXRjaERhc2hib2FyZERhdGEiLCJ1c2VDYWxsYmFjayIsImN1cnJlbnQiLCJyZXNwb25zZSIsImdldERhc2hib2FyZCIsImFsbExvZ3MiLCJyZWNlbnRMb2dzIiwiYWRtaW5zIiwiZmlsdGVyIiwibG9nIiwicm9sZV9pZCIsImZpcnN0X25hbWUiLCJzbGljZSIsInVzZXJzIiwiRXJyb3IiLCJlcnIiLCJtZXNzYWdlIiwidXNlRWZmZWN0IiwicmVmcmVzaEludGVydmFsIiwic2V0SW50ZXJ2YWwiLCJjbGVhckludGVydmFsIiwibG9nSW50ZXJ2YWwiLCJmZXRjaCIsIm9rIiwibmV3TG9ncyIsImpzb24iLCJoYW5kbGVSZWZyZXNoIiwiUmVhY3QiLCJjcmVhdGVFbGVtZW50Iiwic3R5bGUiLCJkaXNwbGF5IiwianVzdGlmeUNvbnRlbnQiLCJhbGlnbkl0ZW1zIiwiaGVpZ2h0IiwiZm9udFNpemUiLCJjb2xvciIsIm1ldHJpY3MiLCJzdGF0c0NhcmRzIiwidGl0bGUiLCJ2YWx1ZSIsImFkbWluc0NvdW50IiwibGluayIsImNsaWVudHNDb3VudCIsImZyZWVsYW5jZXJzQ291bnQiLCJwcm9qZWN0c0NvdW50IiwicGVuZGluZ0FwcG9pbnRtZW50cyIsImNvdXJzZXNDb3VudCIsInBsYW5zQ291bnQiLCJ0b3RhbFJldmVudWUiLCJ0b0xvY2FsZVN0cmluZyIsImhhbmRsZUNhcmRDbGljayIsIndpbmRvdyIsImxvY2F0aW9uIiwiaHJlZiIsImdldFRpbWVBZ28iLCJkYXRlU3RyaW5nIiwibm93IiwiRGF0ZSIsImxvZ1RpbWUiLCJkaWZmTXMiLCJkaWZmU2VjcyIsIk1hdGgiLCJmbG9vciIsImRpZmZNaW5zIiwiZGlmZkhvdXJzIiwidG9Mb2NhbGVEYXRlU3RyaW5nIiwiY29udGFpbmVyU3R5bGUiLCJiYWNrZ3JvdW5kQ29sb3IiLCJtaW5IZWlnaHQiLCJwYWRkaW5nIiwiZm9udEZhbWlseSIsImhlYWRlclN0eWxlIiwibWFyZ2luQm90dG9tIiwicGFkZGluZ0JvdHRvbSIsImJvcmRlckJvdHRvbSIsInJlZnJlc2hCdXR0b25TdHlsZSIsImJvcmRlciIsImJvcmRlclJhZGl1cyIsImN1cnNvciIsInRyYW5zaXRpb24iLCJtZXRyaWNzR3JpZFN0eWxlIiwiZ3JpZFRlbXBsYXRlQ29sdW1ucyIsImdhcCIsImNhcmRTdHlsZSIsImJveFNoYWRvdyIsImNhcmRUaXRsZVN0eWxlIiwiZm9udFdlaWdodCIsIm1hcmdpbiIsInRleHRUcmFuc2Zvcm0iLCJsZXR0ZXJTcGFjaW5nIiwiY2FyZFZhbHVlU3R5bGUiLCJsb2dzQ29udGFpbmVyU3R5bGUiLCJsb2dTZWN0aW9uU3R5bGUiLCJvdmVyZmxvdyIsImxvZ0hlYWRlclN0eWxlIiwibG9nSXRlbVN0eWxlIiwibG9nSXRlbU5hbWVTdHlsZSIsImxvZ0l0ZW1BY3Rpb25TdHlsZSIsIm9wYWNpdHkiLCJsb2dJdGVtVGltZVN0eWxlIiwiZW1wdHlTdGF0ZVN0eWxlIiwidGV4dEFsaWduIiwiZm9udFN0eWxlIiwib25DbGljayIsIm9uTW91c2VPdmVyIiwiZSIsInRhcmdldCIsIm9uTW91c2VPdXQiLCJ3aWR0aCIsInZpZXdCb3giLCJmaWxsIiwic3Ryb2tlIiwic3Ryb2tlV2lkdGgiLCJkIiwibWFwIiwiY2FyZCIsImluZGV4Iiwia2V5IiwiY3VycmVudFRhcmdldCIsImJvcmRlckNvbG9yIiwibGVuZ3RoIiwiaSIsImlkIiwibGFzdF9uYW1lIiwiYWN0aW9uIiwiY3JlYXRlZF9hdCIsIkFuYWx5dGljcyIsImFjdGl2ZVRhYiIsInNldEFjdGl2ZVRhYiIsImRhdGVSYW5nZSIsInNldERhdGVSYW5nZSIsImZldGNoQW5hbHl0aWNzRGF0YSIsImFuYWx5dGljc0RhdGEiLCJjb25zb2xlIiwib3ZlcnZpZXciLCJhcHBvaW50bWVudHMiLCJhcHBvaW50bWVudFN0YXRzIiwidG9wRnJlZWxhbmNlcnMiLCJyZWNlbnRBcHBvaW50bWVudHMiLCJ1c2VyR3Jvd3RoIiwidXNlckRpc3RyaWJ1dGlvbiIsInJlY2VudFVzZXJzIiwicHJvamVjdFN0YXRzIiwiYnlTdGF0dXMiLCJmb3JtYXRDdXJyZW5jeSIsImFtb3VudCIsIkludGwiLCJOdW1iZXJGb3JtYXQiLCJjdXJyZW5jeSIsImZvcm1hdCIsImZvcm1hdERhdGUiLCJtb250aCIsImRheSIsImZvcm1hdFBlcmNlbnRhZ2UiLCJ0b0ZpeGVkIiwiYm9yZGVyVG9wIiwiYW5pbWF0aW9uIiwib25DaGFuZ2UiLCJsYWJlbCIsInRhYiIsImJhY2tncm91bmQiLCJ0b3RhbFVzZXJzIiwibWFyZ2luVG9wIiwibmV3VXNlcnNUb2RheSIsInRvdGFsQXBwb2ludG1lbnRzIiwiYXBwb2ludG1lbnRzVG9kYXkiLCJhY3RpdmVQcm9qZWN0cyIsImNvbXBsZXRlZFByb2plY3RzIiwibW9udGhseVJldmVudWUiLCJtYXhIZWlnaHQiLCJvdmVyZmxvd1kiLCJib3JkZXJDb2xsYXBzZSIsInBvc2l0aW9uIiwidG9wIiwiYXBwb2ludG1lbnQiLCJhcHBvaW50bWVudF90eXBlIiwic3RhdHVzIiwiY2hhckF0IiwidG9VcHBlckNhc2UiLCJmcmVlbGFuY2VyX2ZpcnN0X25hbWUiLCJmcmVlbGFuY2VyX2xhc3RfbmFtZSIsIm1hcmdpblJpZ2h0IiwiYWNjZXB0ZWRBcHBvaW50bWVudHMiLCJyZWplY3RlZEFwcG9pbnRtZW50cyIsImFjY2VwdGFuY2VSYXRlIiwiZnJlZWxhbmNlciIsImVtYWlsIiwidG90YWxfYXBwb2ludG1lbnRzIiwiYWNjZXB0ZWRfYXBwb2ludG1lbnRzIiwiYWNjZXB0YW5jZV9yYXRlIiwidG90YWxDbGllbnRzIiwidG90YWxGcmVlbGFuY2VycyIsIm5ld1VzZXJzTW9udGgiLCJ1c2VyIiwiZHJhZnRQcm9qZWN0cyIsInRvdGFsUHJvamVjdHMiLCJmbGV4V3JhcCIsImNvdW50IiwidG90YWxUcmFuc2FjdGlvbnMiLCJhdmdUcmFuc2FjdGlvbiIsIlJlbGF0ZWRNYXRlcmlhbHMiLCJyZWNvcmQiLCJtYXRlcmlhbHMiLCJwYXJhbXMiLCJjb3Vyc2VfbWF0ZXJpYWxzIiwiY291cnNlSWQiLCJ0ZXh0RGVjb3JhdGlvbiIsImZsZXhEaXJlY3Rpb24iLCJtYXRlcmlhbCIsImZpbGVfdXJsIiwicmVsIiwiQWRtaW5KUyIsIlVzZXJDb21wb25lbnRzIiwiUmVsYXRlZEVucm9sbG1lbnRzIl0sIm1hcHBpbmdzIjoiOzs7Ozs7O0VBQUE7RUFJQSxNQUFNQSxHQUFHLEdBQUcsSUFBSUMsaUJBQVMsRUFBRTtFQUVaLFNBQVNDLFNBQVNBLEdBQUc7SUFDbEMsTUFBTTtFQUFFQyxJQUFBQTtLQUFrQixHQUFHQyxzQkFBYyxFQUFFO0lBQzdDLE1BQU0sQ0FBQ0MsSUFBSSxFQUFFQyxPQUFPLENBQUMsR0FBR0MsY0FBUSxDQUFDLElBQUksQ0FBQztJQUN0QyxNQUFNLENBQUNDLE9BQU8sRUFBRUMsVUFBVSxDQUFDLEdBQUdGLGNBQVEsQ0FBQyxJQUFJLENBQUM7SUFDNUMsTUFBTSxDQUFDRyxLQUFLLEVBQUVDLFFBQVEsQ0FBQyxHQUFHSixjQUFRLENBQUMsSUFBSSxDQUFDO0lBQ3hDLE1BQU0sQ0FBQ0ssU0FBUyxFQUFFQyxZQUFZLENBQUMsR0FBR04sY0FBUSxDQUFDLEVBQUUsQ0FBQztJQUM5QyxNQUFNLENBQUNPLFFBQVEsRUFBRUMsV0FBVyxDQUFDLEdBQUdSLGNBQVEsQ0FBQyxFQUFFLENBQUM7RUFDNUMsRUFBQSxNQUFNUyxXQUFXLEdBQUdDLFlBQU0sQ0FBQyxLQUFLLENBQUM7RUFDakMsRUFBQSxNQUFNQyxVQUFVLEdBQUdELFlBQU0sQ0FBQyxJQUFJLENBQUM7RUFFL0IsRUFBQSxNQUFN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
