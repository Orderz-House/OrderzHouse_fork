import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { FiPlus, FiEdit2, FiTrash2, FiX } from "react-icons/fi";
import { VscDebugRestart } from "react-icons/vsc";

import OutlineButton from "../../../components/buttons/OutlineButton.jsx";

const primary = "#05668D";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "",
  headers: { "Content-Type": "application/json" },
});

export default function Courses() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  const [q, setQ] = useState("");
  const [filters, setFilters] = useState({
    category: "",
    level: "",
    status: "",
  });

  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState({
    title: "",
    category: "",
    level: "",
    duration: "",
    instructor: "",
    status: "Draft",
    price: "",
    description: "",
  });

  const categoryOptions = useMemo(
    () => ["Design", "Programming", "Marketing"],
    []
  );
  const levelOptions = useMemo(
    () => ["Beginner", "Intermediate", "Advanced"],
    []
  );
  const statusOptions = useMemo(() => ["Draft", "Published", "Archived"], []);

  // (Server-side filtering)
  useEffect(() => {
    let cancel;
    (async () => {
      try {
        setLoading(true);
        setErr("");
        const { data } = await api.get("/courses", {
          params: { q, ...filters },
          cancelToken: new axios.CancelToken((c) => (cancel = c)),
        });
        setItems(Array.isArray(data) ? data : data?.items ?? []);
      } catch (e) {
        if (!axios.isCancel(e)) setErr("Failed to load courses.");
      } finally {
        setLoading(false);
      }
    })();
    return () => cancel && cancel();
  }, [q, filters]);

  const openAdd = () => {
    setEditId(null);
    setForm({
      title: "",
      category: "",
      level: "",
      duration: "",
      instructor: "",
      status: "Draft",
      price: "",
      description: "",
    });
    setOpen(true);
  };

  const openEdit = async (id) => {
    try {
      setLoading(true);
      const { data } = await api.get(`/courses/${id}`);
      setEditId(id);
      setForm({
        title: data.title ?? "",
        category: data.category ?? "",
        level: data.level ?? "",
        duration: data.duration ?? "",
        instructor: data.instructor ?? "",
        status: data.status ?? "Draft",
        price: data.price ?? "",
        description: data.description ?? "",
      });
      setOpen(true);
    } catch {
      alert("Failed to load course details.");
    } finally {
      setLoading(false);
    }
  };

  // delete
  const onDelete = async (id) => {
    if (!confirm("Delete this course?")) return;
    const prev = items;
    setItems((arr) => arr.filter((x) => (x.id ?? x._id) !== id));
    try {
      await api.delete(`/courses/${id}`);
    } catch {
      alert("Delete failed, rolling back.");
      setItems(prev);
    }
  };

  // edit
  const onSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editId == null) {
        const { data } = await api.post("/courses", form);
        setItems((arr) => [data, ...arr]);
      } else {
        const { data } = await api.put(`/courses/${editId}`, form);
        setItems((arr) =>
          arr.map((x) => ((x.id ?? x._id) === editId ? data : x))
        );
      }
      setOpen(false);
    } catch {
      alert("Save failed.");
    }
  };

  const resetFilters = () => {
    setQ("");
    setFilters({ category: "", level: "", status: "" });
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-slate-800">Courses</h1>
        <OutlineButton
          onClick={openAdd}
          className="inline-flex items-center gap-2 rounded-xl px-4 py-2 shadow-sm"
        >
          <FiPlus />
          <span className="hidden sm:inline">Add Course</span>
          <span className="sm:hidden">Add</span>
        </OutlineButton>
      </div>

      {/* Search + Filters */}
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search by title…"
          className="w-full md:max-w-sm rounded-xl border border-slate-300 bg-white px-3 py-2 outline-none focus:ring-2 focus:ring-slate-300"
        />
        <div className="flex flex-wrap items-center gap-2">
          <Select
            value={filters.category}
            placeholder="Category"
            onChange={(v) => setFilters((s) => ({ ...s, category: v }))}
            options={categoryOptions}
          />
          <Select
            value={filters.level}
            placeholder="Level"
            onChange={(v) => setFilters((s) => ({ ...s, level: v }))}
            options={levelOptions}
          />
          <Select
            value={filters.status}
            placeholder="Status"
            onChange={(v) => setFilters((s) => ({ ...s, status: v }))}
            options={statusOptions}
          />
          <button
            onClick={resetFilters}
            className="rounded-xl border border-slate-300 px-3 py-2 text-slate-700 hover:bg-slate-50"
          >
            <VscDebugRestart />
          </button>
        </div>
      </div>

      {/* Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {loading && <CardSkeleton />}
        {!loading && err && <div className="text-red-600">{err}</div>}
        {!loading && !err && items.length === 0 && (
          <div className="text-slate-500">No courses yet.</div>
        )}

        {!loading &&
          !err &&
          items.map((c) => {
            const id = c.id ?? c._id;
            return (
              <article
                key={id}
                className="rounded-2xl border border-slate-200 bg-white/90 p-4 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between">
                  <h3 className="text-lg font-semibold text-slate-800">
                    {c.title}
                  </h3>
                  <span
                    className="rounded-full px-2 py-1 text-xs text-white"
                    style={{ backgroundColor: primary }}
                  >
                    {c.status ?? "—"}
                  </span>
                </div>

                <div className="mt-3 grid grid-cols-2 gap-2 text-sm text-slate-600">
                  <Info label="Category" value={c.category} />
                  <Info label="Level" value={c.level} />
                  <Info label="Duration" value={c.duration} />
                  <Info label="Instructor" value={c.instructor} />
                  <Info label="Price" value={c.price ? `$${c.price}` : "—"} />
                </div>

                {c.description && (
                  <p className="mt-3 text-sm text-slate-600 line-clamp-3">
                    {c.description}
                  </p>
                )}

                <div className="mt-4 flex items-center justify-end gap-2">
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
              </article>
            );
          })}
      </div>

      {/* Modal */}
      {open && (
        <Modal
          onClose={() => setOpen(false)}
          title={editId == null ? "Add Course" : "Edit"}
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
                  onChange={(v) => setForm({ ...form, category: v })}
                  options={categoryOptions}
                />
              </Field>
              <Field label="Level">
                <Select
                  value={form.level}
                  onChange={(v) => setForm({ ...form, level: v })}
                  options={levelOptions}
                />
              </Field>
              <Field label="Duration">
                <input
                  value={form.duration}
                  onChange={(e) =>
                    setForm({ ...form, duration: e.target.value })
                  }
                  placeholder="e.g. 6h / 12 lessons"
                  className="w-full rounded-xl border border-slate-300 px-3 py-2 outline-none focus:ring-2 focus:ring-slate-300"
                />
              </Field>
              <Field label="Instructor">
                <input
                  value={form.instructor}
                  onChange={(e) =>
                    setForm({ ...form, instructor: e.target.value })
                  }
                  className="w-full rounded-xl border border-slate-300 px-3 py-2 outline-none focus:ring-2 focus:ring-slate-300"
                />
              </Field>
              <Field label="Status">
                <Select
                  value={form.status}
                  onChange={(v) => setForm({ ...form, status: v })}
                  options={statusOptions}
                />
              </Field>
              <Field label="Price">
                <input
                  type="number"
                  value={form.price}
                  onChange={(e) => setForm({ ...form, price: e.target.value })}
                  className="w-full rounded-xl border border-slate-300 px-3 py-2 outline-none focus:ring-2 focus:ring-slate-300"
                />
              </Field>
            </div>
            <Field label="Description">
              <textarea
                value={form.description}
                onChange={(e) =>
                  setForm({ ...form, description: e.target.value })
                }
                rows={4}
                className="w-full rounded-xl border border-slate-300 px-3 py-2 outline-none focus:ring-2 focus:ring-slate-300"
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

/* UI helpers */
function Info({ label, value }) {
  return (
    <div>
      <div className="text-[11px] uppercase tracking-wider text-slate-400">
        {label}
      </div>
      <div className="text-slate-700">{value ?? "—"}</div>
    </div>
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

function Select({ value, onChange, placeholder, options = [] }) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 outline-none text-slate-700 focus:ring-2 focus:ring-slate-300"
    >
      <option value="">{placeholder ?? "Select…"}</option>
      {options.map((opt) => (
        <option key={opt} value={opt}>
          {opt}
        </option>
      ))}
    </select>
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

function CardSkeleton() {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white/90 p-4 shadow-sm animate-pulse">
      <div className="h-5 w-2/3 bg-slate-200 rounded"></div>
      <div className="mt-4 grid grid-cols-2 gap-2">
        <div className="h-4 bg-slate-200 rounded"></div>
        <div className="h-4 bg-slate-200 rounded"></div>
        <div className="h-4 bg-slate-200 rounded"></div>
        <div className="h-4 bg-slate-200 rounded"></div>
      </div>
      <div className="mt-4 h-8 bg-slate-200 rounded"></div>
    </div>
  );
}
