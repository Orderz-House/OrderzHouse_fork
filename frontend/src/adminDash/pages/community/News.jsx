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
    id: "n1",
    title: "New feature launched",
    category: "Product",
    author: "Team",
    status: "Published",
    date: "2025-10-01",
    content: "We shipped X…",
  },
  {
    id: "n2",
    title: "Outage report",
    category: "Status",
    author: "DevOps",
    status: "Draft",
    date: "2025-10-02",
    content: "Root cause…",
  },
];

export default function News() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  const [q, setQ] = useState("");
  const [filters, setFilters] = useState({ status: "", category: "" });

  const categoryOptions = useMemo(() => ["Product", "Company", "Status"], []);
  const statusOptions = useMemo(() => ["Draft", "Published", "Archived"], []);

  /* fetch */
  useEffect(() => {
    if (MOCK) {
      setItems(DEMO);
      setLoading(false);
      return;
    }
    let cancel;
    (async () => {
      try {
        setLoading(true);
        setErr("");
        const { data } = await api.get("/api/news", {
          params: { q, ...filters },
          cancelToken: new axios.CancelToken((c) => (cancel = c)),
        });
        setItems(Array.isArray(data) ? data : data?.items ?? []);
      } catch (e) {
        if (!axios.isCancel(e)) setErr("Failed to load news.");
      } finally {
        setLoading(false);
      }
    })();
    return () => cancel && cancel();
  }, [q, filters]);

  /* CRUD */
  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState({
    title: "",
    category: "",
    author: "",
    status: "Draft",
    date: "",
    content: "",
  });

  const openAdd = () => {
    setEditId(null);
    setForm({
      title: "",
      category: "",
      author: "",
      status: "Draft",
      date: "",
      content: "",
    });
    setOpen(true);
  };
  const openEdit = (id) => {
    const r = items.find((x) => (x.id ?? x._id) === id);
    if (!r) return;
    setEditId(id);
    setForm({
      title: r.title ?? "",
      category: r.category ?? "",
      author: r.author ?? "",
      status: r.status ?? "Draft",
      date: r.date ?? "",
      content: r.content ?? "",
    });
    setOpen(true);
  };
  const onDelete = async (id) => {
    if (!confirm("Delete this post?")) return;
    const prev = items;
    setItems((arr) => arr.filter((x) => (x.id ?? x._id) !== id));
    if (MOCK) return;
    try {
      await api.delete(`/api/news/${id}`);
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
        const { data } = await api.post("/api/news", form);
        setItems((arr) => [data, ...arr]);
      } else {
        const { data } = await api.put(`/api/news/${editId}`, form);
        setItems((arr) =>
          arr.map((x) => ((x.id ?? x._id) === editId ? data : x))
        );
      }
      setOpen(false);
    } catch {
      alert("Save failed");
    }
  };

  const header = ["Title", "Category", "Author", "Date", "Status", ""];

  const filtered = useMemo(() => {
    return items.filter((p) => {
      const mQ =
        !q ||
        [p.title, p.author, p.category].some((v) =>
          (v ?? "").toLowerCase().includes(q.toLowerCase())
        );
      const mS = !filters.status || p.status === filters.status;
      const mC = !filters.category || p.category === filters.category;
      return mQ && mS && mC;
    });
  }, [items, q, filters]);

  return (
    <div className="space-y-4">
      <Header title="News" onAdd={openAdd} />

      {/* Search + filters */}
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search by title/author…"
          className="w-full md:max-w-sm rounded-xl border border-slate-300 bg-white px-3 py-2 outline-none focus:ring-2 focus:ring-slate-300"
        />
        <div className="flex flex-wrap items-center gap-2">
          <Select
            value={filters.category}
            placeholder="Category"
            options={categoryOptions}
            onChange={(v) => setFilters((s) => ({ ...s, category: v }))}
          />
          <Select
            value={filters.status}
            placeholder="Status"
            options={statusOptions}
            onChange={(v) => setFilters((s) => ({ ...s, status: v }))}
          />
          {(q || Object.values(filters).some(Boolean)) && (
            <button
              onClick={() => {
                setQ("");
                setFilters({ status: "", category: "" });
              }}
              className="rounded-xl border border-slate-300 px-3 py-2 text-slate-700 hover:bg-slate-50"
            >
              Reset
            </button>
          )}
        </div>
      </div>

      {/* Table */}
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
            {loading && <RowMsg col={header.length} text="Loading…" />}
            {!loading && err && <RowMsg col={header.length} text={err} error />}
            {!loading && !err && filtered.length === 0 && (
              <RowMsg col={header.length} text="No news." />
            )}

            {!loading &&
              !err &&
              filtered.map((p) => {
                const id = p.id ?? p._id;
                return (
                  <tr key={id} className="hover:bg-slate-50">
                    <td className="px-6 py-4 font-medium">{p.title}</td>
                    <td className="px-6 py-4">{p.category}</td>
                    <td className="px-6 py-4">{p.author}</td>
                    <td className="px-6 py-4">{p.date}</td>
                    <td className="px-6 py-4">{p.status}</td>
                    <td className="px-6 py-3">
                      <div className="flex items-center gap-2 justify-end">
                        <button
                          onClick={() => openEdit(id)}
                          className="inline-flex items-center justify-center rounded-xl px-3 py-2 text-white"
                          style={{ backgroundColor: primary }}
                        >
                          <FiEdit2 />
                        </button>
                        <button
                          onClick={() => onDelete(id)}
                          className="inline-flex items-center justify-center rounded-xl px-3 py-2 text-white bg-red-500 hover:bg-red-600"
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

      {open && (
        <Modal
          title={editId == null ? "Add Post" : "Edit"}
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
              <Field label="Category">
                <Select
                  value={form.category}
                  options={categoryOptions}
                  onChange={(v) => setForm({ ...form, category: v })}
                />
              </Field>
              <Field label="Author">
                <input
                  value={form.author}
                  onChange={(e) => setForm({ ...form, author: e.target.value })}
                  className="w-full rounded-xl border border-slate-300 px-3 py-2 outline-none"
                />
              </Field>
              <Field label="Status">
                <Select
                  value={form.status}
                  options={statusOptions}
                  onChange={(v) => setForm({ ...form, status: v })}
                />
              </Field>
              <Field label="Date">
                <input
                  type="date"
                  value={form.date}
                  onChange={(e) => setForm({ ...form, date: e.target.value })}
                  className="w-full rounded-xl border border-slate-300 px-3 py-2 outline-none"
                />
              </Field>
            </div>
            <Field label="Content">
              <textarea
                rows={5}
                value={form.content}
                onChange={(e) => setForm({ ...form, content: e.target.value })}
                className="w-full rounded-xl border border-slate-300 px-3 py-2 outline-none"
              />
            </Field>
            <Actions onClose={() => setOpen(false)} />
          </form>
        </Modal>
      )}
    </div>
  );
}

/* helpers */
function Header({ title, onAdd }) {
  return (
    <div className="flex items-center justify-between">
      <h1 className="text-xl font-semibold text-slate-800">{title}</h1>
      <button
        onClick={onAdd}
        className="inline-flex items-center gap-2 rounded-xl px-4 py-2 text-white shadow-sm"
        style={{ backgroundColor: primary }}
      >
        <FiPlus />
        <span className="hidden sm:inline">Add</span>
        <span className="sm:hidden">Add</span>
      </button>
    </div>
  );
}
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
          >
            <FiX />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
function Actions({ onClose }) {
  return (
    <div className="flex items-center justify-end gap-2 pt-2">
      <button
        type="button"
        onClick={onClose}
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
  );
}
function RowMsg({ col, text, error }) {
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
