import { useState } from "react";
import { NavLink } from "react-router-dom";
import { FaBars } from "react-icons/fa";

const SECTIONS = [
  {
    title: "GENERAL",
    items: [{ to: "/admin", label: "Overview", exact: true }],
  },
  {
    title: "USERS",
    items: [
      { to: "/admin/people/clients", label: "Clients" },
      { to: "/admin/people/freelancers", label: "Freelancers" },
    ],
  },
  {
    title: "LEARNING",
    items: [
      { to: "/admin/learning/courses", label: "Courses" },
      { to: "/admin/learning/categories", label: "Categories" },
    ],
  },
  {
    title: "OPERATIONS",
    items: [
      { to: "/admin/operations/appointments", label: "Appointments" },
      { to: "/admin/operations/verifications", label: "Verifications" },
      { to: "/admin/projects", label: "Projects" },
    ],
  },
  {
    title: "COMMUNITY",
    items: [{ to: "/admin/news", label: "News" }],
  },
  {
    title: "FINANCE",
    items: [
      { to: "/admin/finance/payments", label: "Payments" },
      { to: "/admin/finance/plans", label: "Plans" },
    ],
  },
  {
    title: "INSIGHTS",
    items: [{ to: "/admin/analytics", label: "Analytics" }],
  },
];

export default function Sidebar() {
  const [open, setOpen] = useState(true);

  return (
    <aside
      className={`${open ? "w-64" : "w-16"} shrink-0 flex h-screen flex-col
                  bg-gradient-to-b from-[#034763] via-[#05668D] to-[#034763]
                  border-r border-black/10 transition-all duration-300`}
    >
      {/* Header */}
      <div
        className={`flex items-center pt-4 pb-2 ${
          open ? "justify-between px-3" : "justify-center"
        }`}
      >
        {open && (
          <div className="tracking-widest uppercase text-[11px] text-slate-100">
            Admin
          </div>
        )}
        <button
          onClick={() => setOpen((v) => !v)}
          className={`h-10 w-10 flex items-center justify-center rounded-md text-slate-100/90 hover:bg-white/10 ${
            open ? "" : "self-center"
          }`}
          title={open ? "Collapse" : "Expand"}
        >
          <FaBars size={16} />
        </button>
      </div>

      {/* Sections */}
      <nav
        className={`flex-1 overflow-y-auto pb-4 sb-scroll ${
          open ? "px-2" : "px-0"
        } ${open ? "" : "rail"}`}
      >
        {SECTIONS.map((section) => (
          <div key={section.title} className="mb-3">
            {open && (
              <div className="px-2 py-1 text-[11px] font-medium tracking-widest text-slate-200/80">
                {section.title}
              </div>
            )}

            <div className={`flex flex-col gap-1 ${open ? "" : "items-center"}`}>
              {section.items.map(({ to, label, exact }) => (
                <NavLink
                  key={to}
                  to={to}
                  end={exact}
                  title={!open ? label : undefined}
                  className={({ isActive }) =>
                    `
                    flex items-center text-sm transition-colors duration-150
                    ${
                      isActive
                        ? "bg-white/20 text-white"
                        : "text-slate-100/80 hover:bg-white/10"
                    }
                    ${
                      open
                        ? "w-full rounded-lg gap-3 px-3 py-2 justify-start"
                        : "w-10 h-10 rounded-xl self-center justify-center"
                    }
                  `
                  }
                >
                  {open && <span className="truncate">{label}</span>}
                </NavLink>
              ))}
            </div>
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div
        className={`text-[11px] text-slate-200/80 border-t border-white/10 ${
          open ? "px-3 py-3" : "p-2 text-center"
        }`}
      >
        {open ? "© 2025" : "©"}
      </div>
    </aside>
  );
}