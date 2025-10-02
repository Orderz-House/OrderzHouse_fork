import { useEffect, useState } from "react";
import axios from "axios";
import { FiPlus, FiEdit2, FiTrash2, FiX } from "react-icons/fi";
import { VscDebugRestart } from "react-icons/vsc";

const primary = "#05668D";
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "",
  headers: { "Content-Type": "application/json" },
});

export default function Categories() {
  const [items, setItems] = useState([]);
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  // modal
  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState({
    name: "",
    slug: "",
    color: "#05668D",
    description: "",
  });

  // fetch list (server-side search)
  useEffect(() => {
    let cancel;
    (async () => {
      try {
        setLoading(true);
        setErr("");
        const { data } = await api.get("/api/categories", {
          params: { q },
          cancelToken: new axios.CancelToken((c) => (cancel = c)),
        });
        setItems(Array.isArray(data) ? data : data?.items ?? []);
      } catch (e) {
        if (!axios.isCancel(e)) setErr("Failed to load categories.");
      } finally {
        setLoading(false);
      }
    })();
    return () => cancel && cancel();
  }, [q]);

  const openAdd = () => {
    setEditId(null);
    setForm({ name: "", slug: "", color: "#05668D", description: "" });
    setOpen(true);
  };

  const openEdit = async (id) => {
    try {
      const { data } = await api.get(`/api/categories/${id}`);
      setEditId(id);
      setForm({
        name: data.name ?? "",
        slug: data.slug ?? "",
        color: data.color ?? "#05668D",
        description: data.description ?? "",
      });
      setOpen(true);
    } catch {
      alert("Failed to load category.");
    }
  };

  const onDelete = async (id) => {
    if (!confirm("Delete this category?")) return;
    const prev = items;
    setItems((arr) => arr.filter((x) => (x.id ?? x._id) !== id));
    try {
      await api.delete(`/api/categories/${id}`);
    } catch {
      alert("Delete failed, rolling back.");
      setItems(prev);
    }
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editId == null) {
        const { data } = await api.post("/api/categories", form);
        setItems((arr) => [data, ...arr]);
      } else {
        const { data } = await api.put(`/api/categories/${editId}`, form);
        setItems((arr) =>
          arr.map((x) => ((x.id ?? x._id) === editId ? data : x))
        );
      }
      setOpen(false);
    } catch {
      alert("Save failed.");
    }
  };

  const slugify = (s) =>
    s
      .toLowerCase()
      .trim()
      .replace(/[\s\W-]+/g, "-")
      .replace(/^-+|-+$/g, "");

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-slate-800">Categories</h1>
        <button
          onClick={openAdd}
          className="inline-flex items-center gap-2 rounded-xl px-4 py-2 text-white shadow-sm"
          style={{ backgroundColor: primary }}
        >
          <FiPlus /> <span className="hidden sm:inline">Add Category</span>
          <span className="sm:hidden">Add</span>
        </button>
      </div>

      {/* Search */}
      <div className="flex items-center justify-between gap-3">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search by name…"
          className="w-full md:max-w-sm rounded-xl border border-slate-300 bg-white px-3 py-2 outline-none focus:ring-2 focus:ring-slate-300"
        />
      </div>

      {/* Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {loading && <CatSkeleton />}
        {!loading && err && <div className="text-red-600">{err}</div>}
        {!loading && !err && items.length === 0 && (
          <div className="text-slate-500">No categories yet.</div>
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
                  <div className="flex items-center gap-3">
                    <span
                      className="inline-block h-6 w-6 rounded-full border"
                      style={{
                        backgroundColor: c.color ?? primary,
                        borderColor: "#e2e8f0",
                      }}
                    />
                    <div>
                      <h3 className="text-lg font-semibold text-slate-800">
                        {c.name}
                      </h3>
                      <div className="text-xs text-slate-500">/{c.slug}</div>
                    </div>
                  </div>
                  {typeof c.coursesCount === "number" && (
                    <span className="rounded-full bg-slate-100 px-2 py-1 text-xs text-slate-600">
                      {c.coursesCount} courses
                    </span>
                  )}
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
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4">
          <div className="w-full max-w-2xl rounded-2xl border border-slate-200 bg-white p-5 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-slate-800">
                {editId == null ? "Add Category" : "Edit"}
              </h2>
              <button
                onClick={() => setOpen(false)}
                className="h-9 w-9 grid place-items-center rounded-lg hover:bg-slate-100 text-slate-600"
                title="close"
              >
                <FiX />
              </button>
            </div>

            <form onSubmit={onSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field label="Name" required>
                  <input
                    value={form.name}
                    onChange={(e) => {
                      const name = e.target.value;
                      setForm((f) => ({
                        ...f,
                        name,
                        slug: f.slug ? f.slug : slugify(name),
                      }));
                    }}
                    className="w-full rounded-xl border border-slate-300 px-3 py-2 outline-none focus:ring-2 focus:ring-slate-300"
                    required
                  />
                </Field>
                <Field label="Slug">
                  <input
                    value={form.slug}
                    onChange={(e) =>
                      setForm({ ...form, slug: slugify(e.target.value) })
                    }
                    className="w-full rounded-xl border border-slate-300 px-3 py-2 outline-none focus:ring-2 focus:ring-slate-300"
                    placeholder="auto-from-name (editable)"
                  />
                </Field>
                <Field label="Color">
                  <input
                    type="color"
                    value={form.color}
                    onChange={(e) =>
                      setForm({ ...form, color: e.target.value })
                    }
                    className="h-10 w-full rounded-xl border border-slate-300"
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
          </div>
        </div>
      )}
    </div>
  );
}

/* UI helpers */
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

function CatSkeleton() {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white/90 p-4 shadow-sm animate-pulse">
      <div className="h-5 w-2/3 bg-slate-200 rounded"></div>
      <div className="mt-4 h-4 w-3/4 bg-slate-200 rounded"></div>
      <div className="mt-2 h-8 bg-slate-200 rounded"></div>
    </div>
  );
}
