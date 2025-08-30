import React, { useEffect, useState } from "react"
import { ApiClient, useTranslation } from "adminjs"

const api = new ApiClient()

export default function Dashboard() {
  const { translateMessage } = useTranslation()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    api
      .getDashboard()
      .then((res) => setData(res.data))
      .catch((err) => setError(err?.message || "Failed to load dashboard"))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return (
    <div style={{ 
      padding: 40, 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      fontSize: 16,
      color: '#6b7280'
    }}>
      Loading dashboard…
    </div>
  )
  
  if (error) return (
    <div style={{ 
      padding: 40, 
      color: '#ef4444',
      background: '#fef2f2',
      border: '1px solid #fecaca',
      borderRadius: 12,
      margin: 24
    }}>
      {error}
    </div>
  )

  const { 
    metrics = {}, 
    recentUsers = [], 
    recentPlans = [],
    recentAppointments = [], 
    message 
  } = data || {}

  return (
    <div style={{ 
      padding: 32, 
      background: '#f8fafc',
      minHeight: '100vh'
    }}>
      {/* Header */}
      <div style={{ 
        marginBottom: 32,
        background: 'white',
        padding: 24,
        borderRadius: 16,
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        display: 'flex',
        alignItems: 'center',
        gap: 16
      }}>
        <img 
          src="https://ti8ah.com/wp-content/uploads/2025/07/OrderzHouse-Logo-01-.png" 
          alt="OrderzHouse Logo"
          style={{ height: 48, width: 'auto' }}
        />
        <div>
          <h1 style={{ 
            margin: 0,
            fontSize: 28,
            fontWeight: 700,
            color: '#1f2937',
            marginBottom: 4
          }}>
            {translateMessage("dashboard")}
          </h1>
          <p style={{ 
            margin: 0,
            fontSize: 16,
            color: '#6b7280'
          }}>
            {message || "Welcome to OrderzHouse Admin"}
          </p>
        </div>
      </div>

      {/* Enhanced KPI cards */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: 20,
          marginBottom: 32,
        }}
      >
        <KPI title="Total Users" value={metrics.usersCount} color="#3b82f6" icon="👥" />
        <KPI title="Clients" value={metrics.clientsCount} color="#10b981" icon="👤" />
        <KPI title="Freelancers" value={metrics.freelancersCount} color="#8b5cf6" icon="💼" />
        <KPI title="Courses" value={metrics.coursesCount} color="#f59e0b" icon="📚" />
        <KPI title="Plans" value={metrics.plansCount} color="#06b6d4" icon="💎" />
        <KPI title="Pending Appointments" value={metrics.pendingAppointments} color="#ef4444" icon="⏰" />
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr 1fr",
          gap: 20,
        }}
      >
        <Card title="Recent Users">
          <Table
            columns={["ID", "Name", "Email", "Role", "Created"]}
            rows={recentUsers.map((u) => [
              u.id,
              u.first_name ?? "-",
              u.email,
              getRoleName(u.role_id),
              formatDate(u.created_at),
            ])}
          />
        </Card>

        <Card title="Subscription Plans">
          <Table
            columns={["Name", "Price", "Duration", "Description"]}
            rows={recentPlans.map((p) => [
              p.name ?? "-",
              `${p.price || 0}`,
              `${p.duration || 0} days`,
              truncateText(p.description, 30),
            ])}
          />
        </Card>

        <Card title="Recent Appointments">
          <Table
            columns={["ID", "Message", "Status", "Date"]}
            rows={recentAppointments.map((a) => [
              a.id,
              truncateText(a.message, 20),
              a.status ?? "-",
              formatDate(a.appointment_date),
            ])}
          />
        </Card>
      </div>
    </div>
  )
}

function KPI({ title, value, color = "#3b82f6", icon }) {
  return (
    <div
      style={{
        background: "white",
        border: "1px solid #e5e7eb",
        borderRadius: 20,
        padding: 24,
        boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
        borderLeft: `4px solid ${color}`,
        transition: 'transform 0.2s ease, box-shadow 0.2s ease',
        cursor: 'default'
      }}
      onMouseEnter={(e) => {
        e.target.style.transform = 'translateY(-2px)'
        e.target.style.boxShadow = '0 8px 15px -3px rgba(0, 0, 0, 0.1)'
      }}
      onMouseLeave={(e) => {
        e.target.style.transform = 'translateY(0)'
        e.target.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
      }}
    >
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        marginBottom: 8
      }}>
        <div style={{ fontSize: 14, color: "#6b7280", fontWeight: 500 }}>{title}</div>
        <span style={{ fontSize: 20 }}>{icon}</span>
      </div>
      <div style={{ fontSize: 32, fontWeight: 700, color }}>{value ?? 0}</div>
    </div>
  )
}

function Card({ title, children }) {
  return (
    <div
      style={{
        background: "white",
        border: "1px solid #e5e7eb",
        borderRadius: 20,
        padding: 24,
        boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
        height: 'fit-content'
      }}
    >
      <div style={{ 
        fontWeight: 600, 
        marginBottom: 16, 
        fontSize: 18,
        color: '#1f2937',
        paddingBottom: 12,
        borderBottom: '2px solid #f3f4f6'
      }}>
        {title}
      </div>
      {children}
    </div>
  )
}

function Table({ columns, rows }) {
  return (
    <div style={{ overflowX: "auto" }}>
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
        <thead>
          <tr style={{ background: '#f9fafb' }}>
            {columns.map((c) => (
              <th
                key={c}
                style={{ 
                  textAlign: "left", 
                  fontSize: 12, 
                  color: "#374151", 
                  padding: "12px 8px",
                  fontWeight: 600,
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px'
                }}
              >
                {c}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <tr>
              <td colSpan={columns.length} style={{ 
                padding: 24, 
                color: "#9ca3af", 
                textAlign: "center",
                fontStyle: 'italic'
              }}>
                No data available
              </td>
            </tr>
          ) : (
            rows.map((r, i) => (
              <tr 
                key={i} 
                style={{ 
                  borderTop: "1px solid #f3f4f6",
                  transition: 'background-color 0.2s ease'
                }}
                onMouseEnter={(e) => e.target.style.backgroundColor = '#f9fafb'}
                onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
              >
                {r.map((cell, j) => (
                  <td key={j} style={{ 
                    padding: "12px 8px", 
                    color: "#374151",
                    fontSize: 13
                  }}>
                    {cell}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  )
}

function getRoleName(roleId) {
  switch (roleId) {
    case 2: return "Client"
    case 3: return "Freelancer"
    default: return "Unknown"
  }
}

function truncateText(text, maxLength) {
  if (!text) return "-"
  return text.length > maxLength ? text.substring(0, maxLength) + "..." : text
}

function formatDate(d) {
  if (!d) return "-"
  try {
    const date = typeof d === "string" ? new Date(d) : d
    return date.toLocaleDateString()
  } catch {
    return "-"
  }
}