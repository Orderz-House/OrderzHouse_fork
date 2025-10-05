import { useState } from "react";
import { NavLink } from "react-router-dom";
import { FaBars } from "react-icons/fa";
import {
  FiHome,
  FiUser,
  FiUsers,
  FiBookOpen,
  FiTag,
  FiCalendar,
  FiShield,
  FiBriefcase,
  FiFileText,
  FiCreditCard,
  FiBarChart2,
  FiLayers,
} from "react-icons/fi";

const SECTIONS = [
  {
    title: "GENERAL",
    items: [{ to: "/admin", label: "Overview", icon: FiHome, exact: true }],
  },
  {
    title: "USERS",
    items: [
      { to: "/admin/people/clients", label: "Clients", icon: FiUser },
      { to: "/admin/people/freelancers", label: "Freelancers", icon: FiUsers },
    ],
  },
  {
    title: "LEARNING",
    items: [
      { to: "/admin/learning/courses", label: "Courses", icon: FiBookOpen },
      { to: "/admin/learning/categories", label: "Categories", icon: FiTag },
    ],
  },
  {
    title: "OPERATIONS",
    items: [
      {
        to: "/admin/operations/appointments",
        label: "Appointments",
        icon: FiCalendar,
      },
      {
        to: "/admin/operations/verifications",
        label: "Verifications",
        icon: FiShield,
      },
      { to: "/admin/projects", label: "Projects", icon: FiBriefcase },
    ],
  },
  {
    title: "COMMUNITY",
    items: [{ to: "/admin/news", label: "News", icon: FiFileText }],
  },
  {
    title: "FINANCE",
    items: [
      { to: "/admin/finance/payments", label: "Payments", icon: FiCreditCard },
      { to: "/admin/finance/plans", label: "Plans", icon: FiLayers },
    ],
  },
  {
    title: "INSIGHTS",
    items: [{ to: "/admin/analytics", label: "Analytics", icon: FiBarChart2 }],
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

            <div
              className={`flex flex-col gap-1 ${open ? "" : "items-center"}`}
            >
              {section.items.map(({ to, label, icon: Icon, exact }) => (
                <NavLink
                  key={to}
                  to={to}
                  end={!!exact}
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
                  <Icon size={18} className="shrink-0" />
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
        {open ? "" : "©"}
      </div>
    </aside>
  );
}
