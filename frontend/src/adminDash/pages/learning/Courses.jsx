import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { useSelector } from "react-redux";
import {
  FiPlus,
  FiEdit2,
  FiTrash2,
  FiX,
  FiBookOpen,
  FiPlay,
  FiBookmark,
} from "react-icons/fi";
import { VscDebugRestart } from "react-icons/vsc";
import OutlineButton from "../../../components/buttons/OutlineButton.jsx";

const primary = "#028090";
const themeDark = "#05668D";
const ring = "rgba(15,23,42,.10)";
const ringStyle = { border: `1px solid ${ring}` };

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "",
  headers: { "Content-Type": "application/json" },
});

// ---- helpers
function mapRole(roleId) {
  if (roleId === 1) return "admin";
  if (roleId === 3) return "freelancer";
  return "client";
}

/* ================= ROOT (role switcher) ================= */
export default function Courses() {
  const { userData } = useSelector((s) => s.auth);
  const role = mapRole(userData?.role_id);

  if (role === "admin") return <AdminCourses />;
  if (role === "freelancer") return <FreelancerCourses />;
  return <AccessDenied />;
}

/* ================= ADMIN (full management) ================= */
function AdminCourses() {
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
  const statusOptions = useMemo(
    () => ["Draft", "Published", "Archived"],
    []
  );

  // ---- fetch (API only)
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
    <div className="space-y-4 sm:space-y-6 overflow-x-hidden">
      {/* Header */}
      <div
        className="rounded-2xl bg-white/80 backdrop-blur shadow-sm p-4 sm:p-5"
        style={ringStyle}
      >
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div>
            <h1 className="text-lg sm:text-xl font-semibold" style={{ color: themeDark }}>
              Courses
            </h1>
            <p className="text-slate-500 text-sm">
              Create, publish, and manage your catalog
            </p>
          </div>
          <OutlineButton
            onClick={openAdd}
            className="inline-flex items-center gap-2 rounded-xl px-4 py-2 shadow-sm"
          >
            <FiPlus />
            <span className="hidden sm:inline">Add Course</span>
            <span className="sm:hidden">Add</span>
          </OutlineButton>
        </div>

        {/* Search + filters */}
        <div className="mt-3 sm:mt-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search by title…"
            className="w-full md:max-w-sm rounded-xl bg-white px-3 py-2 outline-none focus:ring-2"
            style={ringStyle}
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
              className="rounded-xl px-3 py-2 text-slate-700 hover:bg-slate-50"
              style={ringStyle}
              title="Reset"
            >
              <VscDebugRestart />
            </button>
          </div>
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
                className="rounded-2xl bg-white/90 p-4 shadow-sm hover:shadow transition"
                style={ringStyle}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-9 h-9 rounded-xl grid place-items-center text-white"
                      style={{ background: primary }}
                    >
                      <FiBookOpen />
                    </div>
                    <h3 className="text-base sm:text-lg font-semibold text-slate-800">
                      {c.title}
                    </h3>
                  </div>
                  <span
                    className="rounded-full px-2 py-1 text-xs text-white"
                    style={{ backgroundColor: themeDark }}
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
          title={editId == null ? "Add Course" : "Edit Course"}
        >
          <form onSubmit={onSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Title" required>
                <input
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="w-full rounded-xl px-3 py-2 outline-none focus:ring-2"
                  style={ringStyle}
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
                  className="w-full rounded-xl px-3 py-2 outline-none focus:ring-2"
                  style={ringStyle}
                />
              </Field>
              <Field label="Instructor">
                <input
                  value={form.instructor}
                  onChange={(e) =>
                    setForm({ ...form, instructor: e.target.value })
                  }
                  className="w-full rounded-xl px-3 py-2 outline-none focus:ring-2"
                  style={ringStyle}
                />
              </Field>
              <Field label="Status">
                <Select
                  value={form.status}
                  onChange={(v) => setForm({ ...form, status: v })}
                  options={["Draft", "Published", "Archived"]}
                />
              </Field>
              <Field label="Price">
                <input
                  type="number"
                  value={form.price}
                  onChange={(e) => setForm({ ...form, price: e.target.value })}
                  className="w-full rounded-xl px-3 py-2 outline-none focus:ring-2"
                  style={ringStyle}
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
                className="w-full rounded-xl px-3 py-2 outline-none focus:ring-2"
                style={ringStyle}
              />
            </Field>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-xl px-4 py-2 hover:bg-slate-50"
                style={ringStyle}
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

/* ================= FREELANCER (library) ================= */
function FreelancerCourses() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  const [q, setQ] = useState("");
  const [filters, setFilters] = useState({
    category: "",
    level: "",
    status: "Published",
  });

  const categoryOptions = useMemo(
    () => ["Design", "Programming", "Marketing"],
    []
  );
  const levelOptions = useMemo(
    () => ["Beginner", "Intermediate", "Advanced"],
    []
  );

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

  const resetFilters = () => {
    setQ("");
    setFilters({ category: "", level: "", status: "Published" });
  };

  return (
    <div className="space-y-4 sm:space-y-6 overflow-x-hidden">
      {/* Header */}
      <div
        className="rounded-2xl bg-white/80 backdrop-blur shadow-sm p-4 sm:p-5"
        style={ringStyle}
      >
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div>
            <h1 className="text-lg sm:text-xl font-semibold" style={{ color: themeDark }}>
              My learning
            </h1>
            <p className="text-slate-500 text-sm">
              Browse published courses and keep growing
            </p>
          </div>
          <div className="hidden sm:flex items-center gap-2">
            <button
              className="rounded-xl px-3 py-2 text-slate-700 hover:bg-slate-50"
              style={ringStyle}
              title="Saved"
            >
              <FiBookmark />
            </button>
          </div>
        </div>

        {/* Search + filters */}
        <div className="mt-3 sm:mt-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search course title…"
            className="w-full md:max-w-sm rounded-xl bg-white px-3 py-2 outline-none focus:ring-2"
            style={ringStyle}
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
            <button
              onClick={resetFilters}
              className="rounded-xl px-3 py-2 text-slate-700 hover:bg-slate-50"
              style={ringStyle}
              title="Reset"
            >
              <VscDebugRestart />
            </button>
          </div>
        </div>
      </div>

      {/* Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {loading && <CardSkeleton />}
        {!loading && err && <div className="text-red-600">{err}</div>}
        {!loading && !err && items.length === 0 && (
          <div className="text-slate-500">No courses found.</div>
        )}

        {!loading &&
          !err &&
          items.map((c) => {
            const id = c.id ?? c._id;
            const progress = c.progress ?? null;
            return (
              <article
                key={id}
                className="rounded-2xl bg-white/90 p-4 shadow-sm hover:shadow transition"
                style={ringStyle}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2 min-w-0">
                    <div
                      className="w-9 h-9 rounded-xl grid place-items-center text-white"
                      style={{ background: primary }}
                    >
                      <FiBookOpen />
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-base sm:text-lg font-semibold text-slate-800 truncate">
                        {c.title}
                      </h3>
                      <div className="text-xs text-slate-500 truncate">
                        {c.instructor ?? "—"}
                      </div>
                    </div>
                  </div>
                  <span
                    className="rounded-full px-2 py-1 text-xs text-white"
                    style={{ backgroundColor: themeDark }}
                  >
                    Published
                  </span>
                </div>

                <div className="mt-3 grid grid-cols-2 gap-2 text-sm text-slate-600">
                  <Info label="Category" value={c.category} />
                  <Info label="Level" value={c.level} />
                  <Info label="Duration" value={c.duration} />
                  <Info label="Price" value={c.price ? `$${c.price}` : "—"} />
                </div>

                {c.description && (
                  <p className="mt-3 text-sm text-slate-600 line-clamp-3">
                    {c.description}
                  </p>
                )}

                {typeof progress === "number" && (
                  <div className="mt-3">
                    <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${Math.min(100, Math.max(0, progress))}%`,
                          background: primary,
                        }}
                      />
                    </div>
                    <div className="mt-1 text-xs text-slate-500">
                      {progress}% completed
                    </div>
                  </div>
                )}

                <div className="mt-4 flex items-center justify-between gap-2">
                  <button
                    className="inline-flex items-center gap-2 rounded-xl px-3 py-2 text-white"
                    style={{ background: primary }}
                  >
                    <FiPlay />
                    <span className="text-sm">{progress ? "Continue" : "Start"}</span>
                  </button>
                  <button
                    className="inline-flex items-center gap-2 rounded-xl px-3 py-2 text-slate-700 hover:bg-slate-50"
                    style={ringStyle}
                  >
                    <FiBookmark />
                    <span className="text-sm">Save</span>
                  </button>
                </div>
              </article>
            );
          })}
      </div>
    </div>
  );
}

/* ================= ACCESS DENIED ================= */
function AccessDenied() {
  return (
    <div className="min-h-[50vh] grid place-items-center">
      <div
        className="rounded-2xl bg-white/80 backdrop-blur shadow-sm p-8 text-center"
        style={ringStyle}
      >
        <h2 className="text-xl font-semibold" style={{ color: themeDark }}>
          Access denied
        </h2>
        <p className="mt-2 text-slate-600">
          Courses are available to Admins and Freelancers only.
        </p>
      </div>
    </div>
  );
}

/* ================= UI helpers (shared) ================= */
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
      className="w-full rounded-xl bg-white px-3 py-2 outline-none text-slate-700 focus:ring-2"
      style={ringStyle}
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
      <div
        className="w-full max-w-2xl rounded-2xl bg-white p-5 shadow-xl"
        style={ringStyle}
      >
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
    <div
      className="rounded-2xl bg-white/90 p-4 shadow-sm animate-pulse"
      style={ringStyle}
    >
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
