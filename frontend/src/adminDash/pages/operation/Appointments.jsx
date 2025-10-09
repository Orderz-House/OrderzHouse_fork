import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { FiPlus, FiEdit2, FiTrash2, FiX } from "react-icons/fi";

const primary = "#05668D";
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "",
  headers: { "Content-Type": "application/json" },
});

/** ====== DEMO ====== */
const MOCK = true;
const DEMO = [
  {
    id: "a1",
    subject: "Kickoff",
    with: "Client (Aya)",
    date: "2025-10-05",
    channel: "Online",
    status: "Scheduled",
  },
  {
    id: "a2",
    subject: "Design review",
    with: "Freelancer (Omar)",
    date: "2025-10-06",
    channel: "Offline",
    status: "Completed",
  },
  {
    id: "a3",
    subject: "Contract",
    with: "Client (Lina)",
    date: "2025-10-07",
    channel: "Online",
    status: "Canceled",
  },
];

export default function Appointments() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  const [q, setQ] = useState("");
  const [filters, setFilters] = useState({
    status: "",
    channel: "",
    from: "",
    to: "",
  });

  const header = useMemo(
    () => ["Subject", "With", "Date", "Channel", "Status", ""],
    []
  );
  const statusOptions = useMemo(
    () => ["Scheduled", "Completed", "Canceled"],
    []
  );
  const channelOptions = useMemo(() => ["Online", "Offline"], []);

  // load
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
        const { data } = await api.get("/api/appointments", {
          params: { q, ...filters },
          cancelToken: new axios.CancelToken((c) => (cancel = c)),
        });
        setRows(Array.isArray(data) ? data : data?.items ?? []);
      } catch (e) {
        if (!axios.isCancel(e)) setErr("Failed to load appointments.");
      } finally {
        setLoading(false);
      }
    })();
    return () => cancel && cancel();
  }, [q, filters]);

  // modal
  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState({
    subject: "",
    with: "",
    date: "",
    channel: "Online",
    status: "Scheduled",
  });

  const openAdd = () => {
    setEditId(null);
    setForm({
      subject: "",
      with: "",
      date: "",
      channel: "Online",
      status: "Scheduled",
    });
    setOpen(true);
  };
  const openEdit = (id) => {
    const r = rows.find((x) => (x.id ?? x._id) === id);
    if (!r) return;
    setEditId(id);
    setForm({
      subject: r.subject ?? "",
      with: r.with ?? "",
      date: r.date ?? "",
      channel: r.channel ?? "Online",
      status: r.status ?? "Scheduled",
    });
    setOpen(true);
  };

  const onDelete = async (id) => {
    if (!confirm("Delete this appointment?")) return;
    const prev = rows;
    setRows((arr) => arr.filter((x) => (x.id ?? x._id) !== id));
    if (MOCK) return;
    try {
      await api.delete(`/api/appointments/${id}`);
    } catch {
      alert("Delete failed");
      setRows(prev);
    }
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    if (MOCK) {
      if (editId == null)
        setRows((arr) => [{ id: crypto.randomUUID(), ...form }, ...arr]);
      else
        setRows((arr) =>
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
        const { data } = await api.post("/api/appointments", form);
        setRows((arr) => [data, ...arr]);
      } else {
        const { data } = await api.put(`/api/appointments/${editId}`, form);
        setRows((arr) =>
          arr.map((x) => ((x.id ?? x._id) === editId ? data : x))
        );
      }
      setOpen(false);
    } catch {
      alert("Save failed");
    }
  };

  const filtered = useMemo(() => {
    return rows.filter((r) => {
      const mQ =
        !q ||
        (r.subject ?? "").toLowerCase().includes(q.toLowerCase()) ||
        (r.with ?? "").toLowerCase().includes(q.toLowerCase());
      const mS = !filters.status || r.status === filters.status;
      const mC = !filters.channel || r.channel === filters.channel;
      const mF = !filters.from || (r.date && r.date >= filters.from);
      const mT = !filters.to || (r.date && r.date <= filters.to);
      return mQ && mS && mC && mF && mT;
    });
  }, [rows, q, filters]);

  const resetFilters = () =>
    setFilters({ status: "", channel: "", from: "", to: "" });

  return (
    <div className="space-y-4">
      <Header title="Appointments" onAdd={openAdd} />

      {/* search + filters */}
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search by subject or with…"
          className="w-full md:max-w-sm rounded-xl border border-slate-300 bg-white px-3 py-2 outline-none focus:ring-2 focus:ring-slate-300"
        />
        <div className="flex flex-wrap items-center gap-2">
          <Select
            value={filters.status}
            onChange={(v) => setFilters((s) => ({ ...s, status: v }))}
            placeholder="Status"
            options={statusOptions}
          />
          <Select
            value={filters.channel}
            onChange={(v) => setFilters((s) => ({ ...s, channel: v }))}
            placeholder="Channel"
            options={channelOptions}
          />
          <input
            type="date"
            value={filters.from}
            onChange={(e) =>
              setFilters((s) => ({ ...s, from: e.target.value }))
            }
            className="rounded-xl border border-slate-300 bg-white px-3 py-2 outline-none"
          />
          <input
            type="date"
            value={filters.to}
            onChange={(e) => setFilters((s) => ({ ...s, to: e.target.value }))}
            className="rounded-xl border border-slate-300 bg-white px-3 py-2 outline-none"
          />
          {(q || Object.values(filters).some(Boolean)) && (
            <button
              onClick={resetFilters}
              className="rounded-xl border border-slate-300 px-3 py-2 text-slate-700 hover:bg-slate-50"
            >
              Reset
            </button>
          )}
        </div>
      </div>

      {/* table */}
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
              <RowMessage col={header.length} text="No appointments." />
            )}

            {!loading &&
              !err &&
              filtered.map((r) => {
                const id = r.id ?? r._id;
                return (
                  <tr key={id} className="hover:bg-slate-50">
                    <td className="px-6 py-4 font-medium">{r.subject}</td>
                    <td className="px-6 py-4">{r.with}</td>
                    <td className="px-6 py-4">{r.date}</td>
                    <td className="px-6 py-4">{r.channel}</td>
                    <td className="px-6 py-4">{r.status}</td>
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
          title={editId == null ? "Add Appointment" : "Edit"}
          onClose={() => setOpen(false)}
        >
          <form onSubmit={onSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Subject" required>
                <input
                  value={form.subject}
                  onChange={(e) =>
                    setForm({ ...form, subject: e.target.value })
                  }
                  className="w-full rounded-xl border border-slate-300 px-3 py-2 outline-none focus:ring-2 focus:ring-slate-300"
                  required
                />
              </Field>
              <Field label="With">
                <input
                  value={form.with}
                  onChange={(e) => setForm({ ...form, with: e.target.value })}
                  className="w-full rounded-xl border border-slate-300 px-3 py-2 outline-none focus:ring-2 focus:ring-slate-300"
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
              <Field label="Channel">
                <Select
                  value={form.channel}
                  onChange={(v) => setForm({ ...form, channel: v })}
                  options={channelOptions}
                />
              </Field>
              <Field label="Status">
                <Select
                  value={form.status}
                  onChange={(v) => setForm({ ...form, status: v })}
                  options={statusOptions}
                />
              </Field>
            </div>
            <FormActions onClose={() => setOpen(false)} />
          </form>
        </Modal>
      )}
    </div>
  );
}

/* UI helpers */
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
      className="rounded-xl border border-slate-300 bg-white px-3 py-2 outline-none text-slate-700 focus:ring-2 focus:ring-slate-300"
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
function FormActions({ onClose }) {
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
