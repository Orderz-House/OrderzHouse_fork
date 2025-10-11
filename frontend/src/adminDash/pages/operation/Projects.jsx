import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { FiPlus, FiEdit2, FiTrash2, FiX } from "react-icons/fi";

const primary = "#05668D";
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "",
  headers: { "Content-Type": "application/json" },
});

const MOCK = true;
const DEMO = [
  {
    id: "p1",
    title: "Graphic",
    client: "ACME Co.",
    owner: "Sarah M.",
    status: "Active",
    progress: 65,
    budget: 12000,
    due: "2025-11-10",
    description: "Marketing site & dashboard",
  },
  {
    id: "p2",
    title: "Mobile App",
    client: "Atlas",
    owner: "Omar K.",
    status: "Planning",
    progress: 15,
    budget: 25000,
    due: "2025-12-20",
    description: "Cross-platform MVP",
  },
  {
    id: "p3",
    title: "Backoffice",
    client: "Innova",
    owner: "Lina S.",
    status: "On hold",
    progress: 40,
    budget: 18000,
    due: "2026-01-15",
    description: "Internal tools",
  },
];

export default function Projects() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  const [q, setQ] = useState("");
  const [filters, setFilters] = useState({ status: "" });

  const statusOptions = useMemo(
    () => ["Planning", "Active", "On hold", "Done"],
    []
  );

  useEffect(() => {
    if (MOCK) {
      setItems(DEMO);
      setLoading(false);
      setErr("");
      return;
    }
    let cancel;
    (async () => {
      try {
        setLoading(true);
        setErr("");
        const { data } = await api.get("/api/projects", {
          params: { q, ...filters },
          cancelToken: new axios.CancelToken((c) => (cancel = c)),
        });
        setItems(Array.isArray(data) ? data : data?.items ?? []);
      } catch (e) {
        if (!axios.isCancel(e)) setErr("Failed to load projects.");
      } finally {
        setLoading(false);
      }
    })();
    return () => cancel && cancel();
  }, [q, filters]);

  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState({
    title: "",
    client: "",
    owner: "",
    status: "Planning",
    progress: 0,
    budget: "",
    due: "",
    description: "",
  });

  const openAdd = () => {
    setEditId(null);
    setForm({
      title: "",
      client: "",
      owner: "",
      status: "Planning",
      progress: 0,
      budget: "",
      due: "",
      description: "",
    });
    setOpen(true);
  };

  const openEdit = (id) => {
    const r = items.find((x) => (x.id ?? x._id) === id);
    if (!r) return;
    setEditId(id);
    setForm({
      title: r.title ?? "",
      client: r.client ?? "",
      owner: r.owner ?? "",
      status: r.status ?? "Planning",
      progress: r.progress ?? 0,
      budget: r.budget ?? "",
      due: r.due ?? "",
      description: r.description ?? "",
    });
    setOpen(true);
  };

  const onDelete = async (id) => {
    if (!confirm("Delete this project?")) return;
    const prev = items;
    setItems((arr) => arr.filter((x) => (x.id ?? x._id) !== id));
    if (MOCK) return;
    try {
      await api.delete(`/api/projects/${id}`);
    } catch {
      alert("Delete failed");
      setItems(prev);
    }
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    if (MOCK) {
      if (editId == null)
        setItems((arr) => [{ id: crypto.randomUUID(), ...form }, ...arr]);
      else
        setItems((arr) =>
          arr.map((x) =>
            (x.id ?? x._id) === editId
              ? { ...(x.id ? { id: x.id } : { _id: x._id }), ...form }
              : x
          )
        );
      setOpen(false);
      return;
    }
    try {
      if (editId == null) {
        const { data } = await api.post("/api/projects", form);
        setItems((arr) => [data, ...arr]);
      } else {
        const { data } = await api.put(`/api/projects/${editId}`, form);
        setItems((arr) =>
          arr.map((x) => ((x.id ?? x._id) === editId ? data : x))
        );
      }
      setOpen(false);
    } catch {
      alert("Save failed");
    }
  };

  const filtered = useMemo(() => {
    return items.filter((p) => {
      const mQ =
        !q ||
        [p.title, p.client, p.owner].some((v) =>
          (v ?? "").toLowerCase().includes(q.toLowerCase())
        );
      const mS = !filters.status || p.status === filters.status;
      return mQ && mS;
    });
  }, [items, q, filters]);

  const header = [
    "Title",
    "Client",
    "Owner",
    "Due",
    "Budget",
    "Progress",
    "Status",
    "",
  ];

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-slate-800">Projects</h1>
        <button
          onClick={openAdd}
          className="inline-flex items-center gap-2 rounded-xl px-4 py-2 text-white shadow-sm"
          style={{ backgroundColor: primary }}
        >
          <FiPlus />
          <span className="hidden sm:inline">Add</span>
          <span className="sm:hidden">Add</span>
        </button>
      </div>

      {/* Search + Filters */}
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search title/client/owner…"
          className="w-full md:max-w-sm rounded-xl border border-slate-300 bg-white px-3 py-2 outline-none focus:ring-2 focus:ring-slate-300"
        />
        <div className="flex items-center gap-2">
          <Select
            value={filters.status}
            onChange={(v) => setFilters((s) => ({ ...s, status: v }))}
            placeholder="Status"
            options={statusOptions}
          />
          {(q || filters.status) && (
            <button
              onClick={() => {
                setQ("");
                setFilters({ status: "" });
              }}
              className="rounded-xl border border-slate-300 px-3 py-2 text-slate-700 hover:bg-slate-50"
            >
              Reset
            </button>
          )}
        </div>
      </div>

      {/* Table card */}
      <div className="rounded-2xl border border-slate-200 bg-white/90 shadow-sm overflow-hidden">
        <table className="w-full table-fixed">
          <thead className="bg-slate-50/70 text-slate-500 text-sm">
            <tr>
              {header.map((h, i) => (
                <th
                  key={i}
                  className={`text-left font-medium px-6 py-3 ${
                    i === header.length - 1 ? "w-28" : ""
                  }`}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-200 text-slate-800">
            {loading && <RowMessage col={header.length} text="Loading…" />}
            {!loading && err && (
              <RowMessage col={header.length} text={err} error />
            )}
            {!loading && !err && filtered.length === 0 && (
              <RowMessage col={header.length} text="No projects." />
            )}

            {!loading &&
              !err &&
              filtered.map((p) => {
                const id = p.id ?? p._id;
                return (
                  <tr key={id} className="hover:bg-slate-50">
                    <td className="px-6 py-4 font-medium">{p.title}</td>
                    <td className="px-6 py-4">{p.client}</td>
                    <td className="px-6 py-4">{p.owner}</td>
                    <td className="px-6 py-4">{p.due || "—"}</td>
                    <td className="px-6 py-4">
                      {p.budget ? `$${p.budget}` : "—"}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-2 w-24 rounded bg-slate-200 overflow-hidden">
                          <div
                            className="h-full"
                            style={{
                              width: `${p.progress ?? 0}%`,
                              backgroundColor: primary,
                            }}
                          />
                        </div>
                        <span className="text-sm text-slate-600">
                          {p.progress ?? 0}%
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">{p.status}</td>
                    <td className="px-6 py-3">
                      <div className="flex items-center gap-2 justify-end">
                        <button
                          onClick={() => openEdit(id)}
                          className="inline-flex items-center justify-center rounded-xl px-3 py-2 text-white"
                          style={{ backgroundColor: primary }}
                          title="Edit"
                        >
                          <FiEdit2 />
                        </button>
                        <button
                          onClick={() => onDelete(id)}
                          className="inline-flex items-center justify-center rounded-xl px-3 py-2 text-white bg-red-500 hover:bg-red-600"
                          title="Delete"
                        >
                          <FiTrash2 />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
          </tbody>
        </table>
      </div>

      {/* Modal: Add/Edit */}
      {open && (
        <Modal
          title={editId == null ? "Add Project" : "Edit"}
          onClose={() => setOpen(false)}
        >
          <form onSubmit={onSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Title" required>
                <input
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="w-full rounded-xl border border-slate-300 px-3 py-2 outline-none focus:ring-2 focus:ring-slate-300"
                  required
                />
              </Field>
              <Field label="Client">
                <input
                  value={form.client}
                  onChange={(e) => setForm({ ...form, client: e.target.value })}
                  className="w-full rounded-xl border border-slate-300 px-3 py-2 outline-none"
                />
              </Field>
              <Field label="Owner">
                <input
                  value={form.owner}
                  onChange={(e) => setForm({ ...form, owner: e.target.value })}
                  className="w-full rounded-xl border border-slate-300 px-3 py-2 outline-none"
                />
              </Field>
              <Field label="Status">
                <Select
                  value={form.status}
                  onChange={(v) => setForm({ ...form, status: v })}
                  options={statusOptions}
                />
              </Field>
              <Field label="Progress (%)">
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={form.progress}
                  onChange={(e) =>
                    setForm({ ...form, progress: Number(e.target.value) })
                  }
                  className="w-full rounded-xl border border-slate-300 px-3 py-2 outline-none"
                />
              </Field>
              <Field label="Budget">
                <input
                  type="number"
                  value={form.budget}
                  onChange={(e) => setForm({ ...form, budget: e.target.value })}
                  className="w-full rounded-xl border border-slate-300 px-3 py-2 outline-none"
                />
              </Field>
              <Field label="Due date">
                <input
                  type="date"
                  value={form.due}
                  onChange={(e) => setForm({ ...form, due: e.target.value })}
                  className="w-full rounded-xl border border-slate-300 px-3 py-2 outline-none"
                />
              </Field>
            </div>
            <Field label="Description">
              <textarea
                rows={4}
                value={form.description}
                onChange={(e) =>
                  setForm({ ...form, description: e.target.value })
                }
                className="w-full rounded-xl border border-slate-300 px-3 py-2 outline-none"
              />
            </Field>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-xl px-4 py-2 border border-slate-300 text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="rounded-xl px-4 py-2 text-white shadow-sm"
                style={{ backgroundColor: primary }}
              >
                Save
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}

/* ---------- UI helpers ---------- */
function Select({ value, onChange, placeholder, options = [] }) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 outline-none text-slate-700 focus:ring-2 focus:ring-slate-300"
    >
      <option value="">{placeholder ?? "Select…"}</option>
      {options.map((o) => (
        <option key={o} value={o}>
          {o}
        </option>
      ))}
    </select>
  );
}
function Field({ label, children, required }) {
  return (
    <label className="space-y-1">
      <span className="text-xs font-medium text-slate-500">
        {label} {required ? "*" : ""}
      </span>
      {children}
    </label>
  );
}
function Modal({ title, onClose, children }) {
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4">
      <div className="w-full max-w-2xl rounded-2xl border border-slate-200 bg-white p-5 shadow-xl">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-800">{title}</h2>
          <button
            onClick={onClose}
            className="h-9 w-9 grid place-items-center rounded-lg hover:bg-slate-100 text-slate-600"
            title="close"
          >
            <FiX />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
function RowMessage({ col, text, error }) {
  return (
    <tr>
      <td
        colSpan={col}
        className={`px-6 py-10 text-center ${
          error ? "text-red-600" : "text-slate-500"
        }`}
      >
        {text}
      </td>
    </tr>
  );
}
