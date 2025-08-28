// Admin/components/Dashboard.jsx
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

  const { metrics = {}, recentUsers = [], recentAppointments = [], message } = data || {}

  return (
    <div style={{ padding: 24 }}>
      <h1 style={{ marginBottom: 8 }}>
        {translateMessage("dashboard")} – {message || "Overview"}
      </h1>

      {/* KPI cards */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: 16,
          marginTop: 16,
          marginBottom: 24,
        }}
      >
        <KPI title="Users" value={metrics.usersCount} />
        <KPI title="Courses" value={metrics.coursesCount} />
        <KPI title="Pending Appointments" value={metrics.pendingAppointments} />
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 16,
        }}
      >
        <Card title="Recent Users">
          <Table
            columns={["ID", "Name", "Email", "Created"]}
            rows={recentUsers.map((u) => [
              u.id,
              u.first_name ?? "-",
              u.email,
              formatDate(u.created_at),
            ])}
          />
        </Card>

        <Card title="Recent Appointments">
          <Table
            columns={["ID", "Message", "Status", "Date", "Created"]}
            rows={recentAppointments.map((a) => [
              a.id,
              a.message ?? "-",
              a.status ?? "-",
              formatDate(a.appointment_date),
              formatDate(a.created_at),
            ])}
          />
        </Card>
      </div>
    </div>
  )
}

function KPI({ title, value }) {
  return (
    <div
      style={{
        background: "white",
        border: "1px solid #ececec",
        borderRadius: 16,
        padding: 20,
        boxShadow: "0 1px 2px rgba(0,0,0,0.04)",
      }}
    >
      <div style={{ fontSize: 13, color: "#6b7280", marginBottom: 6 }}>{title}</div>
      <div style={{ fontSize: 28, fontWeight: 700 }}>{value ?? 0}</div>
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
      <div style={{ fontWeight: 600, marginBottom: 12 }}>{title}</div>
      {children}
    </div>
  )
}

function Table({ columns, rows }) {
  return (
    <div style={{ overflowX: "auto" }}>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr>
            {columns.map((c) => (
              <th
                key={c}
                style={{ textAlign: "left", fontSize: 12, color: "#6b7280", padding: "8px 6px" }}
              >
                {c}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <tr>
              <td colSpan={columns.length} style={{ padding: 8, color: "#6b7280" }}>
                No data
              </td>
            </tr>
          ) : (
            rows.map((r, i) => (
              <tr key={i} style={{ borderTop: "1px solid #ececec" }}>
                {r.map((cell, j) => (
                  <td key={j} style={{ padding: "10px 6px" }}>
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

function formatDate(d) {
  if (!d) return "-"
  try {
    const date = typeof d === "string" ? new Date(d) : d
    return date.toLocaleString()
  } catch {
    return "-"
  }
}
