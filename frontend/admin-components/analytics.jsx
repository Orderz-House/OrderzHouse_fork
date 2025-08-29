// frontend/admin-components/analytics.jsx
import React, { useEffect, useState } from "react"
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  BookOpen, 
  Calendar,
  DollarSign,
  Activity,
  Eye,
  UserCheck,
  Award,
  Download,
  Filter,
  RefreshCw
} from "lucide-react"

export default function Analytics() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [selectedPeriod, setSelectedPeriod] = useState('30d')
  const [refreshing, setRefreshing] = useState(false)

  useEffect(() => {
    loadAnalytics()
  }, [selectedPeriod])

  const loadAnalytics = async () => {
    setRefreshing(true)
    // Simulate API call - replace with your actual endpoint
    setTimeout(() => {
      setData({
        overview: {
          totalRevenue: 45230,
          totalUsers: 1247,
          activeCourses: 23,
          completedProjects: 156,
          growthRate: 12.5,
          conversionRate: 4.2
        },
        growth: {
          revenue: 15.3,
          users: 8.2,
          courses: 12.1,
          projects: 22.4
        },
        chartData: [
          { month: 'Jan', users: 400, revenue: 2400, courses: 12 },
          { month: 'Feb', users: 300, revenue: 1398, courses: 15 },
          { month: 'Mar', users: 500, revenue: 9800, courses: 18 },
          { month: 'Apr', users: 278, revenue: 3908, courses: 22 },
          { month: 'May', users: 189, revenue: 4800, courses: 19 },
          { month: 'Jun', users: 239, revenue: 3800, courses: 23 },
        ],
        topPerformers: [
          { name: "React Development Course", enrollments: 1234, revenue: 24680, growth: 23 },
          { name: "UI/UX Design Bootcamp", enrollments: 987, revenue: 19740, growth: 18 },
          { name: "Python for Beginners", enrollments: 756, revenue: 15120, growth: 15 },
          { name: "Digital Marketing", enrollments: 623, revenue: 12460, growth: 12 }
        ],
        recentMetrics: {
          todaySignups: 34,
          todayRevenue: 1250,
          activeNow: 89,
          completionsToday: 12
        }
      })
      setLoading(false)
      setRefreshing(false)
    }, 1000)
  }

  const periods = [
    { value: '7d', label: 'Last 7 days' },
    { value: '30d', label: 'Last 30 days' },
    { value: '90d', label: 'Last 90 days' },
    { value: '1y', label: 'Last year' }
  ]

  const metrics = [
    {
      title: "Total Revenue",
      value: `$${data?.overview?.totalRevenue?.toLocaleString() || 0}`,
      change: data?.growth?.revenue || 0,
      icon: <DollarSign size={24} />,
      color: "#10B981",
      bgColor: "#ECFDF5",
      subtitle: "This month"
    },
    {
      title: "Total Users",
      value: data?.overview?.totalUsers?.toLocaleString() || 0,
      change: data?.growth?.users || 0,
      icon: <Users size={24} />,
      color: "#3B82F6",
      bgColor: "#EFF6FF",
      subtitle: "Registered users"
    },
    {
      title: "Active Courses",
      value: data?.overview?.activeCourses || 0,
      change: data?.growth?.courses || 0,
      icon: <BookOpen size={24} />,
      color: "#8B5CF6",
      bgColor: "#F3E8FF",
      subtitle: "Published courses"
    },
    {
      title: "Completed Projects",
      value: data?.overview?.completedProjects || 0,
      change: data?.growth?.projects || 0,
      icon: <Award size={24} />,
      color: "#F59E0B",
      bgColor: "#FFFBEB",
      subtitle: "This period"
    },
    {
      title: "Growth Rate",
      value: `${data?.overview?.growthRate || 0}%`,
      change: 2.1,
      icon: <TrendingUp size={24} />,
      color: "#EF4444",
      bgColor: "#FEF2F2",
      subtitle: "Monthly growth"
    },
    {
      title: "Conversion Rate",
      value: `${data?.overview?.conversionRate || 0}%`,
      change: 0.8,
      icon: <UserCheck size={24} />,
      color: "#6366F1",
      bgColor: "#EEF2FF",
      subtitle: "Visitor to user"
    }
  ]

  if (loading) {
    return (
      <div style={{ 
        padding: 32, 
        display: "flex", 
        justifyContent: "center", 
        alignItems: "center", 
        minHeight: "60vh" 
      }}>
        <div style={{ 
          display: "flex", 
          alignItems: "center", 
          gap: 12, 
          fontSize: 16, 
          color: "#6B7280" 
        }}>
          <Activity size={20} style={{ animation: "pulse 2s infinite" }} />
          Loading comprehensive analytics...
        </div>
      </div>
    )
  }

  return (
    <div style={{ 
      padding: "24px 32px", 
      backgroundColor: "#F8FAFC", 
      minHeight: "100vh" 
    }}>
      {/* Header with Controls */}
      <div style={{ 
        display: "flex", 
        justifyContent: "space-between", 
        alignItems: "flex-start", 
        marginBottom: 32,
        flexWrap: "wrap",
        gap: 16
      }}>
        <div>
          <h1 style={{ 
            fontSize: 28, 
            fontWeight: "800", 
            color: "#111827", 
            marginBottom: 4,
            display: "flex",
            alignItems: "center",
            gap: 10
          }}>
            <BarChart3 size={28} color="#667EEA" />
            Analytics Dashboard
          </h1>
          <p style={{ fontSize: 16, color: "#6B7280" }}>
            Comprehensive insights and performance metrics
          </p>
        </div>
        
        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          <select 
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            style={{
              padding: "8px 16px",
              borderRadius: 8,
              border: "1px solid #D1D5DB",
              fontSize: 14,
              fontWeight: "500",
              color: "#374151",
              backgroundColor: "white",
              cursor: "pointer",
              minWidth: 140
            }}
          >
            {periods.map(period => (
              <option key={period.value} value={period.value}>
                {period.label}
              </option>
            ))}
          </select>
          
          <button
            onClick={loadAnalytics}
            disabled={refreshing}
            style={{
              padding: "8px 12px",
              borderRadius: 8,
              border: "1px solid #D1D5DB",
              backgroundColor: "white",
              cursor: refreshing ? "not-allowed" : "pointer",
              display: "flex",
              alignItems: "center",
              gap: 6,
              fontSize: 14,
              color: "#374151"
            }}
          >
            <RefreshCw size={16} style={{ 
              animation: refreshing ? "spin 1s linear infinite" : "none" 
            }} />
            Refresh
          </button>
          
          <button
            style={{
              padding: "8px 16px",
              borderRadius: 8,
              border: "none",
              backgroundColor: "#667EEA",
              color: "white",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: 6,
              fontSize: 14,
              fontWeight: "500"
            }}
          >
            <Download size={16} />
            Export
          </button>
        </div>
      </div>

      {/* Key Metrics Grid */}
      <section style={{ marginBottom: 40 }}>
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
          gap: 20,
        }}>
          {metrics.map((metric, index) => (
            <div
              key={metric.title}
              style={{
                background: "white",
                borderRadius: 14,
                padding: 20,
                boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                border: "1px solid #F3F4F6",
                transition: "all 0.3s ease",
                cursor: "pointer"
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-2px)"
                e.currentTarget.style.boxShadow = "0 8px 15px -3px rgba(0, 0, 0, 0.1)"
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)"
                e.currentTarget.style.boxShadow = "0 4px 6px -1px rgba(0, 0, 0, 0.1)"
              }}
            >
              <div style={{ 
                display: "flex", 
                justifyContent: "space-between", 
                alignItems: "flex-start",
                marginBottom: 14
              }}>
                <div style={{
                  padding: 10,
                  borderRadius: 10,
                  backgroundColor: metric.bgColor,
                  color: metric.color
                }}>
                  {metric.icon}
                </div>
                <div style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 4,
                  fontSize: 13,
                  fontWeight: "600",
                  color: metric.change > 0 ? "#10B981" : "#EF4444"
                }}>
                  <TrendingUp size={14} style={{
                    transform: metric.change < 0 ? "rotate(180deg)" : "none"
                  }} />
                  {metric.change > 0 ? '+' : ''}{metric.change}%
                </div>
              </div>
              <div style={{ fontSize: 13, color: "#6B7280", marginBottom: 2 }}>
                {metric.title}
              </div>
              <div style={{ 
                fontSize: 26, 
                fontWeight: "800", 
                color: metric.color,
                letterSpacing: "-0.02em",
                marginBottom: 4
              }}>
                {metric.value}
              </div>
              <div style={{ fontSize: 12, color: "#9CA3AF" }}>
                {metric.subtitle}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Charts and Analysis */}
      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 32, marginBottom: 40 }}>
        {/* Revenue Chart */}
        <div style={{
          background: "white",
          borderRadius: 16,
          padding: 28,
          boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
          border: "1px solid #F3F4F6"
        }}>
          <div style={{ 
            display: "flex", 
            justifyContent: "space-between", 
            alignItems: "center",
            marginBottom: 24
          }}>
            <h3 style={{ 
              fontSize: 18, 
              fontWeight: "700", 
              color: "#111827"
            }}>
              Revenue & Growth Trends
            </h3>
            <div style={{ display: "flex", gap: 12 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <div style={{ width: 12, height: 3, backgroundColor: "#3B82F6", borderRadius: 2 }} />
                <span style={{ fontSize: 12, color: "#6B7280" }}>Revenue</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <div style={{ width: 12, height: 3, backgroundColor: "#10B981", borderRadius: 2 }} />
                <span style={{ fontSize: 12, color: "#6B7280" }}>Users</span>
              </div>
            </div>
          </div>
          <div style={{
            height: 280,
            background: "linear-gradient(135deg, #F8FAFC 0%, #E2E8F0 100%)",
            borderRadius: 12,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexDirection: "column",
            color: "#64748B",
            fontSize: 14
          }}>
            <BarChart3 size={48} style={{ opacity: 0.3, marginBottom: 12 }} />
            <div style={{ textAlign: "center" }}>
              Interactive Chart Component
              <br />
              <small style={{ opacity: 0.7 }}>(Integrate with Chart.js or Recharts)</small>
            </div>
          </div>
        </div>

        {/* Today's Highlights */}
        <div style={{
          background: "white",
          borderRadius: 16,
          padding: 24,
          boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
          border: "1px solid #F3F4F6"
        }}>
          <h3 style={{ 
            fontSize: 16, 
            fontWeight: "700", 
            marginBottom: 20,
            color: "#111827",
            display: "flex",
            alignItems: "center",
            gap: 8
          }}>
            <Activity size={18} />
            Today's Highlights
          </h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {[
              { label: "New Signups", value: data?.recentMetrics?.todaySignups || 0, color: "#3B82F6" },
              { label: "Revenue Today", value: `${data?.recentMetrics?.todayRevenue || 0}`, color: "#10B981" },
              { label: "Users Online", value: data?.recentMetrics?.activeNow || 0, color: "#F59E0B" },
              { label: "Completions", value: data?.recentMetrics?.completionsToday || 0, color: "#8B5CF6" }
            ].map((item, index) => (
              <div key={index} style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: 12,
                borderRadius: 8,
                backgroundColor: "#F8FAFC",
                border: "1px solid #E2E8F0"
              }}>
                <span style={{ fontSize: 14, color: "#6B7280" }}>
                  {item.label}
                </span>
                <span style={{ 
                  fontSize: 16, 
                  fontWeight: "700", 
                  color: item.color 
                }}>
                  {item.value}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Top Performers */}
      <section>
        <h3 style={{ 
          fontSize: 20, 
          fontWeight: "700", 
          marginBottom: 20,
          color: "#111827",
          display: "flex",
          alignItems: "center",
          gap: 10
        }}>
          <Award size={20} />
          Top Performing Courses
        </h3>
        <div style={{
          background: "white",
          borderRadius: 16,
          padding: 28,
          boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
          border: "1px solid #F3F4F6"
        }}>
          <div style={{ 
            display: "grid", 
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", 
            gap: 20 
          }}>
            {data?.topPerformers?.map((course, index) => (
              <div key={index} style={{
                padding: 20,
                borderRadius: 12,
                backgroundColor: "#F8FAFC",
                border: "1px solid #E2E8F0",
                transition: "all 0.3s ease"
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = "#F1F5F9"
                e.currentTarget.style.borderColor = "#CBD5E1"
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "#F8FAFC"
                e.currentTarget.style.borderColor = "#E2E8F0"
              }}
              >
                <div style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  marginBottom: 12
                }}>
                  <div style={{ 
                    fontSize: 15, 
                    fontWeight: "600", 
                    color: "#111827",
                    lineHeight: "1.4"
                  }}>
                    {course.name}
                  </div>
                  <div style={{
                    fontSize: 12,
                    fontWeight: "600",
                    color: "#10B981",
                    backgroundColor: "#ECFDF5",
                    padding: "2px 8px",
                    borderRadius: 6
                  }}>
                    +{course.growth}%
                  </div>
                </div>
                <div style={{ 
                  display: "flex", 
                  justifyContent: "space-between", 
                  alignItems: "center",
                  fontSize: 13,
                  color: "#6B7280"
                }}>
                  <span>
                    {course.enrollments.toLocaleString()} enrollments
                  </span>
                  <span style={{ fontWeight: "600", color: "#10B981" }}>
                    ${course.revenue.toLocaleString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </div>
  )
}