import React, { useEffect, useState } from "react"
import { Users, BookOpen, Calendar, ShoppingBag, Briefcase, BarChart3 } from "lucide-react"

export default function Dashboard() {
  const [data, setData] = useState(null)

  useEffect(() => {
    fetch("/admin/api/dashboard")
      .then((res) => res.json())
      .then((res) => setData(res))
      .catch((err) => console.error("Dashboard fetch error:", err))
  }, [])

  const sections = [
    { title: "Users", link: "/admin/resources/users", color: "#E0F2FE", icon: <Users size={28} color="#0369a1" /> },
    { title: "Courses", link: "/admin/resources/courses", color: "#F3E8FF", icon: <BookOpen size={28} color="#6b21a8" /> },
    { title: "Appointments", link: "/admin/resources/appointments", color: "#FEF9C3", icon: <Calendar size={28} color="#ca8a04" /> },
    { title: "Orders", link: "/admin/resources/orders", color: "#FEE2E2", icon: <ShoppingBag size={28} color="#b91c1c" /> },
    { title: "Freelancing", link: "/admin/resources/categories", color: "#DCFCE7", icon: <Briefcase size={28} color="#166534" /> },
  ]

  const analytics = [
    { label: "Total Users", value: data?.metrics?.usersCount || 0, color: "#0369a1" },
    { label: "Total Courses", value: data?.metrics?.coursesCount || 0, color: "#6b21a8" },
    { label: "Pending Appointments", value: data?.metrics?.pendingAppointments || 0, color: "#ca8a04" },
  ]

  return (
    <div style={{ padding: 24 }}>
      {/* Header */}
      <header style={{ marginBottom: 40 }}>
        <h1 style={{ fontSize: 32, fontWeight: "700", color: "#111827", marginBottom: 6 }}>
          Dashboard
        </h1>
        <p style={{ fontSize: 15, color: "#6b7280" }}>
          OrderzHouse Administration Panel
        </p>
      </header>

      {/* Analytics Section */}
      <section style={{ marginBottom: 40 }}>
        <h2 style={{ fontSize: 20, fontWeight: 600, marginBottom: 16, display: "flex", alignItems: "center", gap: 8 }}>
          <BarChart3 size={22} /> Analytics
        </h2>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
            gap: 20,
          }}
        >
          {analytics.map((a) => (
            <div
              key={a.label}
              style={{
                background: "white",
                borderRadius: 16,
                padding: 20,
                boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
                borderLeft: `5px solid ${a.color}`,
              }}
            >
              <div style={{ fontSize: 14, color: "#6b7280", marginBottom: 6 }}>{a.label}</div>
              <div style={{ fontSize: 28, fontWeight: "700", color: a.color }}>{a.value}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Management Sections */}
      <section>
        <h2 style={{ fontSize: 20, fontWeight: 600, marginBottom: 16 }}>Management</h2>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
            gap: 24,
          }}
        >
          {sections.map((s) => (
            <a
              key={s.title}
              href={s.link}
              style={{
                background: s.color,
                borderRadius: 20,
                padding: 24,
                textDecoration: "none",
                display: "flex",
                flexDirection: "column",
                alignItems: "flex-start",
                boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
                transition: "transform 0.2s ease, box-shadow 0.2s ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-4px)"
                e.currentTarget.style.boxShadow = "0 6px 16px rgba(0,0,0,0.1)"
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)"
                e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.05)"
              }}
            >
              <div style={{ marginBottom: 16 }}>{s.icon}</div>
              <div style={{ fontSize: 20, fontWeight: 600, color: "#111827" }}>{s.title}</div>
              <div style={{ fontSize: 14, color: "#374151", marginTop: 4 }}>
                Manage all {s.title.toLowerCase()} here →
              </div>
            </a>
          ))}
        </div>
      </section>
    </div>
  )
}
