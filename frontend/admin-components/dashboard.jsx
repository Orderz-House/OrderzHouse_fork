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

  if (loading) return <div style={{ padding: 24 }}>Loading dashboard…</div>
  if (error) return <div style={{ padding: 24, color: "crimson" }}>{error}</div>

  const { 
    metrics = {}, 
    recentUsers = [], 
    recentPlans = [],
    recentAppointments = [], 
    message 
  } = data || {}

  return (
    <div style={{ padding: 24 }}>
      <h1 style={{ marginBottom: 8 }}>
        {translateMessage("dashboard")} – {message || "Overview"}
      </h1>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: 16,
          marginTop: 16,
          marginBottom: 24,
        }}
      >
        <KPI title="Total Users" value={metrics.usersCount} color="#3b82f6" />
        <KPI title="Clients" value={metrics.clientsCount} color="#10b981" />
        <KPI title="Freelancers" value={metrics.freelancersCount} color="#8b5cf6" />
        <KPI title="Courses" value={metrics.coursesCount} color="#f59e0b" />
        <KPI title="Plans" value={metrics.plansCount} color="#06b6d4" />
        <KPI title="Pending Appointments" value={metrics.pendingAppointments} color="#ef4444" />
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr 1fr",
          gap: 16,
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

function KPI({ title, value, color = "#3b82f6" }) {
  return (
    <div
      style={{
        background: "white",
        border: "1px solid #ececec",
        borderRadius: 16,
        padding: 20,
        boxShadow: "0 1px 2px rgba(0,0,0,0.04)",
        borderLeft: `4px solid ${color}`,
      }}
    >
      <div style={{ fontSize: 13, color: "#6b7280", marginBottom: 6 }}>{title}</div>
      <div style={{ fontSize: 28, fontWeight: 700, color }}>{value ?? 0}</div>
    </div>
  )
}

function Card({ title, children }) {
  return (
    <div
      style={{
        background: "white",
        border: "1px solid #ececec",
        borderRadius: 16,
        padding: 16,
        boxShadow: "0 1px 2px rgba(0,0,0,0.04)",
      }}
    >
      <div style={{ fontWeight: 600, marginBottom: 12, fontSize: 16 }}>{title}</div>
      {children}
    </div>
  )
}

function Table({ columns, rows }) {
  return (
    <div style={{ overflowX: "auto" }}>
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
        <thead>
          <tr>
            {columns.map((c) => (
              <th
                key={c}
                style={{ 
                  textAlign: "left", 
                  fontSize: 12, 
                  color: "#6b7280", 
                  padding: "8px 6px",
                  fontWeight: 600
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
              <td colSpan={columns.length} style={{ padding: 16, color: "#6b7280", textAlign: "center" }}>
                No data available
              </td>
            </tr>
          ) : (
            rows.map((r, i) => (
              <tr key={i} style={{ borderTop: "1px solid #f3f4f6" }}>
                {r.map((cell, j) => (
                  <td key={j} style={{ padding: "10px 6px", color: "#374151" }}>
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