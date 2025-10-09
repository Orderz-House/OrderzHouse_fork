import { useEffect, useState } from "react";
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
    id: "pl1",
    name: "Basic",
    price: 0,
    period: "/mo",
    status: "Active",
    features: ["1 Project", "Community Support"],
  },
  {
    id: "pl2",
    name: "Pro",
    price: 19.9,
    period: "/mo",
    status: "Active",
    features: ["10 Projects", "Priority Support", "Analytics"],
  },
  {
    id: "pl3",
    name: "Business",
    price: 49,
    period: "/mo",
    status: "Hidden",
    features: ["Unlimited Projects", "Team Seats", "SLA"],
  },
];

export default function Plans() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  useEffect(() => {
    if (MOCK) {
      setItems(DEMO);
      setLoading(false);
      return;
    }
    (async () => {
      try {
        setLoading(true);
        setErr("");
        const { data } = await api.get("/api/plans");
        setItems(Array.isArray(data) ? data : data?.items ?? []);
      } catch {
        setErr("Failed to load plans.");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState({
    name: "",
    price: "",
    period: "/mo",
    status: "Active",
    featuresText: "",
  });

  const openAdd = () => {
    setEditId(null);
    setForm({
      name: "",
      price: "",
      period: "/mo",
      status: "Active",
      featuresText: "",
    });
    setOpen(true);
  };
  const openEdit = (id) => {
    const r = items.find((x) => (x.id ?? x._id) === id);
    if (!r) return;
    setEditId(id);
    setForm({
      name: r.name ?? "",
      price: r.price ?? "",
      period: r.period ?? "/mo",
      status: r.status ?? "Active",
      featuresText: (r.features ?? []).join("\n"),
    });
    setOpen(true);
  };
  const onDelete = async (id) => {
    if (!confirm("Delete this plan?")) return;
    const prev = items;
    setItems((arr) => arr.filter((x) => (x.id ?? x._id) !== id));
    if (MOCK) return;
    try {
      await api.delete(`/api/plans/${id}`);
    } catch {
      alert("Delete failed");
      setItems(prev);
    }
  };
  const onSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      ...form,
      price: Number(form.price),
      features: form.featuresText
        .split("\n")
        .map((s) => s.trim())
        .filter(Boolean),
    };
    if (MOCK) {
      if (editId == null)
        setItems((arr) => [{ id: crypto.randomUUID(), ...payload }, ...arr]);
      else
        setItems((arr) =>
          arr.map((x) =>
            (x.id ?? x._id) === editId
              ? { ...(x.id ? { id: x.id } : { _id: x._id }), ...payload }
              : x
          )
        );
      setOpen(false);
      return;
    }
    try {
      if (editId == null) {
        const { data } = await api.post("/api/plans", payload);
        setItems((arr) => [data, ...arr]);
      } else {
        const { data } = await api.put(`/api/plans/${editId}`, payload);
        setItems((arr) =>
          arr.map((x) => ((x.id ?? x._id) === editId ? data : x))
        );
      }
      setOpen(false);
    } catch {
      alert("Save failed");
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-slate-800">Plans</h1>
        <button
          onClick={openAdd}
          className="inline-flex items-center gap-2 rounded-xl px-4 py-2 text-white shadow-sm"
          style={{ backgroundColor: primary }}
        >
          <FiPlus />
          <span className="hidden sm:inline">Add Plan</span>
          <span className="sm:hidden">Add</span>
        </button>
      </div>

      {loading && <div className="text-slate-500">Loading…</div>}
      {!loading && err && <div className="text-red-600">{err}</div>}

      {!loading && !err && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((p) => {
            const id = p.id ?? p._id;
            return (
              <article
                key={id}
                className="rounded-2xl border border-slate-200 bg-white/90 p-5 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between">
                  <h3 className="text-lg font-semibold text-slate-800">
                    {p.name}
                  </h3>
                  <span
                    className="rounded-full px-2 py-1 text-xs text-white"
                    style={{ backgroundColor: primary }}
                  >
                    {p.status}
                  </span>
                </div>
                <div className="mt-2 text-2xl font-bold text-slate-800">
                  ${p.price}
                  <span className="text-base font-normal text-slate-500">
                    {p.period}
                  </span>
                </div>
                <ul className="mt-3 space-y-1 text-sm text-slate-700 list-disc list-inside">
                  {(p.features ?? []).map((f, i) => (
                    <li key={i}>{f}</li>
                  ))}
                </ul>
                <div className="mt-4 flex items-center justify-end gap-2">
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
              </article>
            );
          })}
        </div>
      )}

      {open && (
        <Modal
          title={editId == null ? "Add Plan" : "Edit"}
          onClose={() => setOpen(false)}
        >
          <form onSubmit={onSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Name" required>
                <input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full rounded-xl border border-slate-300 px-3 py-2 outline-none"
                  required
                />
              </Field>
              <Field label="Price" required>
                <input
                  type="number"
                  value={form.price}
                  onChange={(e) => setForm({ ...form, price: e.target.value })}
                  className="w-full rounded-xl border border-slate-300 px-3 py-2 outline-none"
                  required
                />
              </Field>
              <Field label="Period">
                <input
                  value={form.period}
                  onChange={(e) => setForm({ ...form, period: e.target.value })}
                  className="w-full rounded-xl border border-slate-300 px-3 py-2 outline-none"
                />
              </Field>
              <Field label="Status">
                <select
                  value={form.status}
                  onChange={(e) => setForm({ ...form, status: e.target.value })}
                  className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 outline-none"
                >
                  <option>Active</option>
                  <option>Hidden</option>
                </select>
              </Field>
            </div>
            <Field label="Features (one per line)">
              <textarea
                rows={5}
                value={form.featuresText}
                onChange={(e) =>
                  setForm({ ...form, featuresText: e.target.value })
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
