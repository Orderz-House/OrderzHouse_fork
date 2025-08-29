// frontend/admin-components/dashboard.jsx - Project-focused version
import React, { useEffect, useState } from "react"
import { 
  Users, 
  BookOpen, 
  Calendar, 
  Briefcase, 
  BarChart3,
  TrendingUp,
  DollarSign,
  Activity,
  Clock,
  CheckCircle,
  AlertCircle,
  ArrowUpRight,
  Eye,
  FolderOpen,
  UserCheck,
  Target
} from "lucide-react"

export default function Dashboard() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/admin/api/dashboard")
      .then((res) => res.json())
      .then((res) => {
        setData(res)
        setLoading(false)
      })
      .catch((err) => {
        console.error("Dashboard fetch error:", err)
        setLoading(false)
      })
  }, [])

  const quickStats = [
    { 
      label: "Total Clients", 
      value: data?.metrics?.clientsCount || 0, 
      icon: <Users size={24} />,
      color: "#3B82F6",
      bgColor: "#EFF6FF",
      change: "+12%",
      trend: "up",
      link: "/admin/resources/clients",
      subtitle: "Registered clients"
    },
    { 
      label: "Active Freelancers", 
      value: data?.metrics?.freelancersCount || 0, 
      icon: <UserCheck size={24} />,
      color: "#8B5CF6",
      bgColor: "#F3E8FF",
      change: "+18%",
      trend: "up",
      link: "/admin/resources/freelancers",
      subtitle: "Available freelancers"
    },
    { 
      label: "Active Projects", 
      value: data?.metrics?.activeProjects || 0, 
      icon: <FolderOpen size={24} />,
      color: "#F59E0B",
      bgColor: "#FFFBEB",
      change: "+23%",
      trend: "up",
      link: "/admin/resources/projects",
      subtitle: "Open & in progress"
    },
    { 
      label: "Project Value", 
      value: "$" + (data?.metrics?.totalProjectValue?.toLocaleString() || "0"), 
      icon: <DollarSign size={24} />,
      color: "#10B981",
      bgColor: "#ECFDF5",
      change: "+18%",
      trend: "up",
      link: "/admin/pages/analytics",
      subtitle: "Completed projects"
    },
  ]

  const managementSections = [
    { 
      title: "Client Management", 
      description: "Manage client accounts and projects",
      link: "/admin/resources/clients", 
      icon: <Users size={32} />,
      color: "#3B82F6",
      bgGradient: "linear-gradient(135deg, #EFF6FF 0%, #DBEAFE 100%)",
      count: data?.metrics?.clientsCount || 0,
      items: ["Client Profiles", "Project Requests", "Account Management", "Support Tickets"],
      priority: "high"
    },
    { 
      title: "Freelancer Hub", 
      description: "Manage freelancer profiles and skills",
      link: "/admin/resources/freelancers", 
      icon: <UserCheck size={32} />,
      color: "#8B5CF6",
      bgGradient: "linear-gradient(135deg, #F3E8FF 0%, #E9D5FF 100%)",
      count: data?.metrics?.freelancersCount || 0,
      items: ["Freelancer Profiles", "Skills Verification", "Portfolio Review", "Rate Management"],
      priority: "high"
    },
    { 
      title: "Project Hub", 
      description: "Central project management system",
      link: "/admin/resources/projects", 
      icon: <FolderOpen size={32} />,
      color: "#F59E0B",
      bgGradient: "linear-gradient(135deg, #FFFBEB 0%, #FEF3C7 100%)",
      count: data?.metrics?.activeProjects || 0,
      items: ["Active Projects", "Assignments", "Project Categories", "Budget Tracking"],
      priority: "high"
    },
    { 
      title: "Course Management", 
      description: "Educational content and training",
      link: "/admin/resources/courses", 
      icon: <BookOpen size={32} />,
      color: "#10B981",
      bgGradient: "linear-gradient(135deg, #ECFDF5 0%, #D1FAE5 100%)",
      count: data?.metrics?.coursesCount || 0,
      items: ["Course Library", "Enrollments", "Materials", "Progress Tracking"],
      priority: "medium"
    },
    { 
      title: "Appointments", 
      description: "Schedule and consultation management",
      link: "/admin/resources/appointments", 
      icon: <Calendar size={32} />,
      color: "#EF4444",
      bgGradient: "linear-gradient(135deg, #FEF2F2 0%, #FECACA 100%)",
      count: data?.metrics?.pendingAppointments || 0,
      items: ["Schedule View", "Pending Requests", "Confirmations", "Calendar Sync"],
      priority: "medium"
    },
    { 
      title: "All Users Overview", 
      description: "Complete user management overview",
      link: "/admin/resources/all_users", 
      icon: <Eye size={32} />,
      color: "#6366F1",
      bgGradient: "linear-gradient(135deg, #EEF2FF 0%, #E0E7FF 100%)",
      count: data?.metrics?.usersCount || 0,
      items: ["All Users", "Role Management", "User Analytics", "Account Status"],
      priority: "low"
    },
  ]

  const recentActivities = [
    { action: "New project posted", user: "client@example.com", detail: "Web Development Project", time: "5 min ago", type: "project", priority: "high" },
    { action: "Freelancer assigned", user: "freelancer@example.com", detail: "Mobile App Project", time: "12 min ago", type: "assignment", priority: "medium" },
    { action: "Project completed", user: "developer@example.com", detail: "E-commerce Site", time: "1 hour ago", type: "completion", priority: "high" },
    { action: "New user registered", user: "newuser@example.com", detail: "Freelancer account", time: "2 hours ago", type: "user", priority: "low" },
    { action: "Appointment scheduled", user: "client2@example.com", detail: "Consultation Call", time: "3 hours ago", type: "appointment", priority: "medium" },
    { action: "Course enrollment", user: "student@example.com", detail: "React Masterclass", time: "4 hours ago", type: "course", priority: "low" }
  ]

  const projectMetrics = [
    { label: "Open Projects", value: "24", color: "#3B82F6", trend: "+5" },
    { label: "In Progress", value: "18", color: "#F59E0B", trend: "+3" },
    { label: "Completed Today", value: "7", color: "#10B981", trend: "+2" },
    { label: "Avg. Budget", value: "$2,450", color: "#8B5CF6", trend: "+12%" }
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
          Loading OrderzHouse dashboard...
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
      {/* Professional Header */}
      <header style={{ marginBottom: 36 }}>
        <div style={{ 
          background: "linear-gradient(135deg, #667EEA 0%, #764BA2 100%)",
          borderRadius: 16,
          padding: "24px 28px",
          color: "white",
          position: "relative",
          overflow: "hidden",
          boxShadow: "0 8px 32px rgba(102, 126, 234, 0.3)"
        }}>
          <div style={{ position: "relative", zIndex: 2 }}>
            <h1 style={{ 
              fontSize: 28, 
              fontWeight: "800", 
              marginBottom: 4,
              letterSpacing: "-0.02em"
            }}>
              OrderzHouse Command Center
            </h1>
            <p style={{ 
              fontSize: 15, 
              opacity: 0.9,
              fontWeight: "400"
            }}>
              Freelance Project Management & Analytics Hub
            </p>
          </div>
          <div style={{
            position: "absolute",
            top: -20,
            right: -20,
            width: 120,
            height: 120,
            background: "rgba(255,255,255,0.1)",
            borderRadius: "50%",
            zIndex: 1
          }} />
          <div style={{
            position: "absolute",
            bottom: -15,
            right: 80,
            width: 60,
            height: 60,
            background: "rgba(255,255,255,0.05)",
            borderRadius: "50%",
            zIndex: 1
          }} />
        </div>
      </header>

      {/* Key Performance Indicators */}
      <section style={{ marginBottom: 36 }}>
        <h2 style={{ 
          fontSize: 20, 
          fontWeight: "700", 
          marginBottom: 18, 
          color: "#111827",
          display: "flex",
          alignItems: "center",
          gap: 10
        }}>
          <Target size={20} color="#667EEA" />
          Key Performance Indicators
        </h2>
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
          gap: 18,
        }}>
          {quickStats.map((stat, index) => (
            <a
              key={stat.label}
              href={stat.link}
              style={{
                background: "white",
                borderRadius: 12,
                padding: 18,
                boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                border: "1px solid #F3F4F6",
                textDecoration: "none",
                display: "block",
                transition: "all 0.3s ease",
                cursor: "pointer",
                position: "relative",
                overflow: "hidden"
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-2px)"
                e.currentTarget.style.boxShadow = "0 8px 15px -3px rgba(0, 0, 0, 0.15)"
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
                marginBottom: 12
              }}>
                <div style={{
                  padding: 8,
                  borderRadius: 8,
                  backgroundColor: stat.bgColor,
                  color: stat.color
                }}>
                  {stat.icon}
                </div>
                <div style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 3,
                  fontSize: 12,
                  fontWeight: "600",
                  color: stat.trend === "up" ? "#10B981" : "#EF4444"
                }}>
                  <TrendingUp size={12} style={{
                    transform: stat.trend === "down" ? "rotate(180deg)" : "none"
                  }} />
                  {stat.change}
                </div>
              </div>
              <div style={{ fontSize: 13, color: "#6B7280", marginBottom: 3 }}>
                {stat.label}
              </div>
              <div style={{ 
                fontSize: 24, 
                fontWeight: "800", 
                color: stat.color,
                letterSpacing: "-0.02em",
                marginBottom: 6
              }}>
                {stat.value}
              </div>
              <div style={{ fontSize: 11, color: "#9CA3AF" }}>
                {stat.subtitle}
              </div>
            </a>
          ))}
        </div>
      </section>

      {/* Main Content Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 28 }}>
        {/* Management Sections */}
        <section>
          <h2 style={{ 
            fontSize: 20, 
            fontWeight: "700", 
            marginBottom: 18, 
            color: "#111827",
            display: "flex",
            alignItems: "center",
            gap: 10
          }}>
            <Briefcase size={20} color="#667EEA" />
            Management Dashboard
          </h2>
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: 20,
          }}>
            {managementSections
              .sort((a, b) => (a.priority === "high" ? -1 : b.priority === "high" ? 1 : 0))
              .map((section, index) => (
              <a
                key={section.title}
                href={section.link}
                style={{
                  background: section.bgGradient,
                  borderRadius: 14,
                  padding: 20,
                  textDecoration: "none",
                  display: "block",
                  border: section.priority === "high" ? "2px solid rgba(102, 126, 234, 0.3)" : "1px solid rgba(255,255,255,0.3)",
                  boxShadow: section.priority === "high" ? "0 8px 25px rgba(102, 126, 234, 0.15)" : "0 4px 15px rgba(0,0,0,0.08)",
                  transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                  position: "relative",
                  overflow: "hidden"
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-4px) scale(1.01)"
                  e.currentTarget.style.boxShadow = "0 12px 30px rgba(0,0,0,0.15)"
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0) scale(1)"
                  e.currentTarget.style.boxShadow = section.priority === "high" ? "0 8px 25px rgba(102, 126, 234, 0.15)" : "0 4px 15px rgba(0,0,0,0.08)"
                }}
              >
                {section.priority === "high" && (
                  <div style={{
                    position: "absolute",
                    top: 6,
                    right: 6,
                    width: 6,
                    height: 6,
                    borderRadius: "50%",
                    backgroundColor: "#F59E0B",
                    animation: "pulse 2s infinite"
                  }} />
                )}
                
                <div style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  marginBottom: 12
                }}>
                  <div style={{ color: section.color }}>
                    {section.icon}
                  </div>
                  <div style={{
                    backgroundColor: "rgba(255,255,255,0.9)",
                    color: section.color,
                    padding: "2px 8px",
                    borderRadius: 10,
                    fontSize: 12,
                    fontWeight: "600"
                  }}>
                    {section.count}
                  </div>
                </div>
                
                <h3 style={{ 
                  fontSize: 17, 
                  fontWeight: "700", 
                  color: "#111827",
                  marginBottom: 5,
                  letterSpacing: "-0.01em"
                }}>
                  {section.title}
                </h3>
                
                <p style={{ 
                  fontSize: 13, 
                  color: "#6B7280",
                  lineHeight: "1.3",
                  marginBottom: 14
                }}>
                  {section.description}
                </p>

                <div style={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: 4,
                  marginBottom: 12
                }}>
                  {section.items.slice(0, 2).map((item, i) => (
                    <span key={i} style={{
                      fontSize: 10,
                      backgroundColor: "rgba(255,255,255,0.7)",
                      color: section.color,
                      padding: "1px 6px",
                      borderRadius: 6,
                      fontWeight: "500"
                    }}>
                      {item}
                    </span>
                  ))}
                </div>

                <div style={{
                  display: "flex",
                  alignItems: "center",
                  fontSize: 13,
                  fontWeight: "600",
                  color: section.color
                }}>
                  {section.priority === "high" ? "Priority Access" : "Manage"}
                  <ArrowUpRight size={14} style={{ marginLeft: 4 }} />
                </div>
              </a>
            ))}
          </div>
        </section>

        {/* Activity & Metrics Sidebar */}
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          {/* Project Metrics */}
          <section>
            <h3 style={{ 
              fontSize: 18, 
              fontWeight: "700", 
              marginBottom: 16, 
              color: "#111827",
              display: "flex",
              alignItems: "center",
              gap: 8
            }}>
              <FolderOpen size={18} color="#667EEA" />
              Project Overview
            </h3>
            <div style={{
              background: "white",
              borderRadius: 14,
              padding: 18,
              boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
              border: "1px solid #F3F4F6"
            }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                {projectMetrics.map((metric, index) => (
                  <div key={index} style={{
                    textAlign: "center",
                    padding: 12,
                    borderRadius: 8,
                    backgroundColor: "#F8FAFC"
                  }}>
                    <div style={{ 
                      fontSize: 18, 
                      fontWeight: "800", 
                      color: metric.color,
                      marginBottom: 2
                    }}>
                      {metric.value}
                    </div>
                    <div style={{ 
                      fontSize: 11, 
                      color: "#6B7280",
                      marginBottom: 3
                    }}>
                      {metric.label}
                    </div>
                    <div style={{ 
                      fontSize: 10, 
                      color: "#10B981",
                      fontWeight: "600"
                    }}>
                      {metric.trend}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Recent Activity Feed */}
          <section>
            <h3 style={{ 
              fontSize: 18, 
              fontWeight: "700", 
              marginBottom: 16, 
              color: "#111827",
              display: "flex",
              alignItems: "center",
              gap: 8
            }}>
              <Activity size={18} color="#667EEA" />
              Live Activity Feed
            </h3>
            <div style={{
              background: "white",
              borderRadius: 14,
              padding: 16,
              boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
              border: "1px solid #F3F4F6",
              maxHeight: "480px",
              overflowY: "auto"
            }}>
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {recentActivities.map((activity, index) => {
                  const getTypeConfig = (type, priority) => {
                    const configs = {
                      project: { color: "#F59E0B", bg: "#FFFBEB", icon: "💼" },
                      assignment: { color: "#8B5CF6", bg: "#F3E8FF", icon: "👤" },
                      completion: { color: "#10B981", bg: "#ECFDF5", icon: "✅" },
                      user: { color: "#3B82F6", bg: "#EFF6FF", icon: "👋" },
                      appointment: { color: "#EF4444", bg: "#FEF2F2", icon: "📅" },
                      course: { color: "#6366F1", bg: "#EEF2FF", icon: "📚" }
                    }
                    return configs[type] || configs.user
                  }

                  const config = getTypeConfig(activity.type, activity.priority)

                  return (
                    <div key={index} style={{
                      display: "flex",
                      alignItems: "flex-start",
                      padding: 10,
                      borderRadius: 8,
                      backgroundColor: activity.priority === "high" ? "#FEF3C7" : "#F8FAFC",
                      border: `1px solid ${activity.priority === "high" ? "#FDE68A" : "#E2E8F0"}`,
                      transition: "all 0.2s ease",
                      position: "relative"
                    }}>
                      {activity.priority === "high" && (
                        <div style={{
                          position: "absolute",
                          top: 4,
                          right: 4,
                          width: 4,
                          height: 4,
                          borderRadius: "50%",
                          backgroundColor: "#F59E0B"
                        }} />
                      )}
                      
                      <div style={{
                        fontSize: 16,
                        marginRight: 10,
                        marginTop: 2
                      }}>
                        {config.icon}
                      </div>
                      
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ 
                          fontSize: 12, 
                          fontWeight: "500", 
                          color: "#111827",
                          marginBottom: 2
                        }}>
                          {activity.action}
                        </div>
                        <div style={{ 
                          fontSize: 11, 
                          color: "#6B7280",
                          marginBottom: 2,
                          wordBreak: "break-all"
                        }}>
                          {activity.user}
                        </div>
                        {activity.detail && (
                          <div style={{ 
                            fontSize: 11, 
                            color: config.color,
                            fontWeight: "500",
                            marginBottom: 3
                          }}>
                            {activity.detail}
                          </div>
                        )}
                        <div style={{ 
                          fontSize: 10, 
                          color: "#9CA3AF"
                        }}>
                          {activity.time}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
              
              <div style={{
                marginTop: 14,
                paddingTop: 12,
                borderTop: "1px solid #E2E8F0",
                textAlign: "center"
              }}>
                <a href="/admin/pages/analytics" style={{
                  fontSize: 12,
                  color: "#667EEA",
                  textDecoration: "none",
                  fontWeight: "500",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 3
                }}>
                  View detailed activity log
                  <ArrowUpRight size={12} />
                </a>
              </div>
            </div>
          </section>
        </div>
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </div>
  )
}