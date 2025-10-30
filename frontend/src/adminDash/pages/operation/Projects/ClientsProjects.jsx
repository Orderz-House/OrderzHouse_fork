import { useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import PeopleTable from "../../Tables";
import { MessageSquare, SendHorizontal } from "lucide-react";

/* ---------- Theme ---------- */
const T = { primary: "#028090", dark: "#05668D", ring: "rgba(15,23,42,.10)" };
const ringStyle = { border: `1px solid ${T.ring}` };

/* ---------- Axios ---------- */
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "",
  headers: { "Content-Type": "application/json" },
});

/* ===================== Client Projects Page ===================== */
export default function Projects() {
  const navigate = useNavigate();
  const { token } = useSelector((s) => s.auth);

  // 🔹 Filters Setup
  const filters = [
    {
      key: "status",
      label: "Status",
      options: [
        { label: "All", value: "" },
        { label: "Pending", value: "pending" },
        { label: "Bidding", value: "bidding" },
        { label: "Active", value: "active" },
        { label: "Completed", value: "completed" },
        { label: "Cancelled", value: "cancelled" },
      ],
    },
    {
      key: "created_at",
      label: "Sort by Date",
      options: [
        { label: "Newest First", value: "desc" },
        { label: "Oldest First", value: "asc" },
      ],
    },
  ];

  // 🔹 Card Actions
  const renderActions = (row, helpers) => {
    const id = helpers.getId(row);
    return (
      <div className="flex gap-2 w-full">
        <button
          onClick={() =>
            navigate(
              `/chat?projectId=${encodeURIComponent(id)}&with=${encodeURIComponent(
                row.assignee || "Freelancer"
              )}`
            )
          }
          className="inline-flex items-center justify-center gap-2 h-10 rounded-xl bg-white hover:bg-slate-50 text-slate-700 text-sm px-2"
          style={ringStyle}
        >
          <MessageSquare className="w-3 h-3" />
          Chat
        </button>
        <button
          onClick={() =>
            navigate(`/project/${id}`, {
              state: { project: row, readOnly: true },
            })
          }
          className="inline-flex items-center justify-center gap-2 h-10 rounded-xl text-white text-xs hover:shadow px-2"
          style={{ backgroundColor: T.primary }}
        >
          <SendHorizontal className="w-3 h-3" />
          View
        </button>
      </div>
    );
  };

  return (
    <PeopleTable
      title="My Projects"
      endpoint="/projects/myprojects"
      token={token}
  
      chipField="status"
      filters={filters}
      columns={[
        { label: "Title", key: "title" },
        { label: "Description", key: "description" },
        { label: "Status", key: "status" },
        { label: "Budget", key: "budget" },
        { label: "Created", key: "created_at" },
      ]}
      formFields={[]}
      desktopAsCards
      crudConfig={{
        showDetails: false,
        showRowEdit: false,
        showDelete: false,
      }}
      renderActions={renderActions}
      onCardClick={(row, h) =>
        navigate(`/project/${h.getId(row)}`, {
          state: { project: row, readOnly: true },
        })
      }
    />
  );
}
