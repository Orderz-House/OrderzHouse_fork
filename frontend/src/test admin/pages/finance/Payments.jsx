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
    id: "t1",
    user: "Ahmed",
    amount: 120.5,
    method: "Card",
    status: "Paid",
    date: "2025-10-01",
    ref: "INV-1001",
  },
  {
    id: "t2",
    user: "Lina",
    amount: 59.99,
    method: "PayPal",
    status: "Refunded",
    date: "2025-10-02",
    ref: "INV-1002",
  },
  {
    id: "t3",
    user: "Omar",
    amount: 12.0,
    method: "Bank",
    status: "Pending",
    date: "2025-10-03",
    ref: "INV-1003",
  },
];

export default function Payments() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  const [q, setQ] = useState("");
  const [filters, setFilters] = useState({ status: "", method: "" });

  const statusOptions = useMemo(
    () => ["Paid", "Pending", "Refunded", "Failed"],
    []
  );
  const methodOptions = useMemo(() => ["Card", "PayPal", "Bank", "Cash"], []);

  useEffect(() => {
    if (MOCK) {
      setRows(DEMO);
      setLoading(false);
      setErr("");
      return;
    }
    let cancel;
    (async () => {
      try {
        setLoading(true);
        setErr("");
        const { data } = await api.get("/api/payments", {
          params: { q, ...filters },
          cancelToken: new axios.CancelToken((c) => (cancel = c)),
        });
        setRows(Array.isArray(data) ? data : data?.items ?? []);
      } catch (e) {
        if (!axios.isCancel(e)) setErr("Failed to load payments.");
      } finally {
        setLoading(false);
      }
    })();
    return () => cancel && cancel();
  }, [q, filters]);

  /* modal */
  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState({
    user: "",
    amount: "",
    method: "Card",
    status: "Paid",
    date: "",
    ref: "",
  });

  const openAdd = () => {
    setEditId(null);
    setForm({
      user: "",
      amount: "",
      method: "Card",
      status: "Paid",
      date: "",
      ref: "",
    });
    setOpen(true);
  };
  const openEdit = (id) => {
    const r = rows.find((x) => (x.id ?? x._id) === id);
    if (!r) return;
    setEditId(id);
    setForm({
      user: r.user ?? "",
      amount: r.amount ?? "",
      method: r.method ?? "Card",
      status: r.status ?? "Paid",
      date: r.date ?? "",
      ref: r.ref ?? "",
    });
    setOpen(true);
  };
  const onDelete = async (id) => {
    if (!confirm("Delete this payment?")) return;
    const prev = rows;
    setRows((arr) => arr.filter((x) => (x.id ?? x._id) !== id));
    if (MOCK) return;
    try {
      await api.delete(`/api/payments/${id}`);
    } catch {
      alert("Delete failed");
      setRows(prev);
    }
  };
  const onSubmit = async (e) => {
    e.preventDefault();
    if (MOCK) {
      if (editId == null)
        setRows((arr) => [
          { id: crypto.randomUUID(), ...form, amount: Number(form.amount) },
          ...arr,
        ]);
      else
        setRows((arr) =>
          arr.map((x) =>
            (x.id ?? x._id) === editId
              ? {
                  ...(x.id ? { id: x.id } : { _id: x._id }),
                  ...form,
                  amount: Number(form.amount),
                }
              : x
          )
        );
      setOpen(false);
      return;
    }
    try {
      if (editId == null) {
        const { data } = await api.post("/api/payments", form);
        setRows((arr) => [data, ...arr]);
      } else {
        const { data } = await api.put(`/api/payments/${editId}`, form);
        setRows((arr) =>
          arr.map((x) => ((x.id ?? x._id) === editId ? data : x))
        );
      }
      setOpen(false);
    } catch {
      alert("Save failed");
    }
  };

  const header = [
    "User",
    "Amount",
    "Method",
    "Status",
    "Date",
    "Reference",
    "",
  ];

  const filtered = useMemo(() => {
    return rows.filter((r) => {
      const mQ =
        !q ||
        [r.user, r.ref].some((v) =>
          (v ?? "").toLowerCase().includes(q.toLowerCase())
        );
      const mS = !filters.status || r.status === filters.status;
      const mM = !filters.method || r.method === filters.method;
      return mQ && mS && mM;
    });
  }, [rows, q, filters]);

  return (
    <div className="space-y-4">
      <Header title="Payments" onAdd={openAdd} />

      {/* Filters */}
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search by user/ref…"
          className="w-full md:max-w-sm rounded-xl border border-slate-300 bg-white px-3 py-2 outline-none focus:ring-2 focus:ring-slate-300"
        />
        <div className="flex flex-wrap items-center gap-2">
          <Select
            value={filters.method}
            placeholder="Method"
            options={methodOptions}
            onChange={(v) => setFilters((s) => ({ ...s, method: v }))}
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
                setFilters({ method: "", status: "" });
              }}
              className="rounded-xl border border-slate-300 px-3 py-2 text-slate-700 hover:bg-slate-50"
            >
              Reset
            </button>
          )}
        </div>
      </div>

      {/* ===== Mobile: Cards view ===== */}
      <div className="md:hidden space-y-3">
        {loading && <MobileRowMsg text="Loading…" error={false} />}
        {!loading && err && <MobileRowMsg text={err} error />}
        {!loading && !err && filtered.length === 0 && (
          <MobileRowMsg text="No payments." error={false} />
        )}

        {!loading &&
          !err &&
          filtered.map((r) => {
            const id = r.id ?? r._id;
            return (
              <div
                key={id}
                className="rounded-2xl border border-slate-200 bg-white/90 shadow-sm p-4"
              >
                {/* Top: User & Amount */}
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="text-sm text-slate-500">User</div>
                    <div className="font-semibold text-slate-800 break-words">
                      {r.user}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-slate-500">Amount</div>
                    <div className="font-semibold text-slate-800">
                      ${Number(r.amount).toFixed(2)}
                    </div>
                  </div>
                </div>

                {/* Middle: Meta grid */}
                <div className="mt-3 grid grid-cols-2 gap-3">
                  <CardField label="Method" value={r.method} />
                  <CardField label="Status" value={r.status} />
                  <CardField label="Date" value={r.date} />
                  <CardField label="Reference" value={r.ref} />
                </div>

                {/* Actions */}
                <div className="mt-4 flex items-center justify-end gap-2">
                  <button
                    onClick={() => openEdit(id)}
                    className="inline-flex items-center justify-center rounded-xl px-3 py-2 text-white"
                    style={{ backgroundColor: primary }}
                    aria-label="Edit"
                    title="Edit"
                  >
                    <FiEdit2 />
                  </button>
                  <button
                    onClick={() => onDelete(id)}
                    className="inline-flex items-center justify-center rounded-xl px-3 py-2 text-white bg-red-500 hover:bg-red-600"
                    aria-label="Delete"
                    title="Delete"
                  >
                    <FiTrash2 />
                  </button>
                </div>
              </div>
            );
          })}
      </div>

      {/* ===== Desktop: Table view ===== */}
      <div className="rounded-2xl border border-slate-200 bg-white/90 shadow-sm overflow-hidden hidden md:block">
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
              <RowMsg col={header.length} text="No payments." />
            )}
            {!loading &&
              !err &&
              filtered.map((r) => {
                const id = r.id ?? r._id;
                return (
                  <tr key={id} className="hover:bg-slate-50">
                    <td className="px-6 py-4 font-medium">{r.user}</td>
                    <td className="px-6 py-4">
                      ${Number(r.amount).toFixed(2)}
                    </td>
                    <td className="px-6 py-4">{r.method}</td>
                    <td className="px-6 py-4">{r.status}</td>
                    <td className="px-6 py-4">{r.date}</td>
                    <td className="px-6 py-4">{r.ref}</td>
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
          title={editId == null ? "Add Payment" : "Edit"}
          onClose={() => setOpen(false)}
        >
          <form onSubmit={onSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="User" required>
                <input
                  value={form.user}
                  onChange={(e) => setForm({ ...form, user: e.target.value })}
                  className="w-full rounded-xl border border-slate-300 px-3 py-2 outline-none"
                  required
                />
              </Field>
              <Field label="Amount" required>
                <input
                  type="number"
                  value={form.amount}
                  onChange={(e) => setForm({ ...form, amount: e.target.value })}
                  className="w-full rounded-xl border border-slate-300 px-3 py-2 outline-none"
                  required
                />
              </Field>
              <Field label="Method">
                <Select
                  value={form.method}
                  onChange={(v) => setForm({ ...form, method: v })}
                  options={methodOptions}
                />
              </Field>
              <Field label="Status">
                <Select
                  value={form.status}
                  onChange={(v) => setForm({ ...form, status: v })}
                  options={statusOptions}
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
              <Field label="Reference">
                <input
                  value={form.ref}
                  onChange={(e) => setForm({ ...form, ref: e.target.value })}
                  className="w-full rounded-xl border border-slate-300 px-3 py-2 outline-none"
                />
              </Field>
            </div>
            <Actions onClose={() => setOpen(false)} />
          </form>
        </Modal>
      )}
    </div>
  );
}

/* ===== Reusable bits ===== */
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

/* Mobile-only helpers */
function CardField({ label, value }) {
  return (
    <div className="min-w-0">
      <div className="text-xs text-slate-500">{label}</div>
      <div className="text-sm text-slate-800 break-words">{value || "-"}</div>
    </div>
  );
}
function MobileRowMsg({ text, error }) {
  return (
    <div
      className={`rounded-2xl border p-4 text-center ${
        error
          ? "border-red-200 text-red-600 bg-white"
          : "border-slate-200 text-slate-500 bg-white"
      }`}
    >
      {text}
    </div>
  );
}
