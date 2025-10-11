import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { FiCheck, FiX } from "react-icons/fi";

const primary = "#05668D";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "",
  headers: { "Content-Type": "application/json" },
});

const MOCK = true;
const DEMO = [
  {
    id: "v1",
    name: "Omar Khaled",
    email: "omar@example.com",
    phone: "+96650000000",
    specialization: "Frontend",
    submittedAt: "2025-10-01",
    status: "Pending",
  },
  {
    id: "v2",
    name: "Lina Saeed",
    email: "lina@example.com",
    phone: "+97150000000",
    specialization: "Backend",
    submittedAt: "2025-10-02",
    status: "Approved",
  },
  {
    id: "v3",
    name: "Aya N.",
    email: "aya@example.com",
    phone: "+201000000000",
    specialization: "Graphic Design",
    submittedAt: "2025-10-03",
    status: "Rejected",
  },
];

export default function Verifications() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  // Search
  const [q, setQ] = useState("");
  const [filters, setFilters] = useState({ status: "", specialization: "" });

  const header = useMemo(
    () => [
      "Name",
      "Email",
      "Phone",
      "Specialization",
      "Submitted",
      "Status",
      "",
    ],
    []
  );

  const specializationOptions = useMemo(
    () => uniq(rows.map((r) => r.specialization).filter(Boolean)),
    [rows]
  );
  const statusOptions = ["Pending", "Approved", "Rejected"];

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
        const { data } = await api.get("/api/verifications", {
          params: { q, ...filters },
          cancelToken: new axios.CancelToken((c) => (cancel = c)),
        });
        setRows(Array.isArray(data) ? data : data?.items ?? []);
      } catch (e) {
        if (!axios.isCancel(e)) setErr("Failed to load verifications.");
      } finally {
        setLoading(false);
      }
    })();

    return () => cancel && cancel();
  }, [q, filters]);

  const filtered = useMemo(() => {
    return rows.filter((r) => {
      const mq =
        !q ||
        [r.name, r.email, r.phone, r.specialization]
          .join(" ")
          .toLowerCase()
          .includes(q.toLowerCase());
      const ms = !filters.status || r.status === filters.status;
      const msp =
        !filters.specialization || r.specialization === filters.specialization;
      return mq && ms && msp;
    });
  }, [rows, q, filters]);

  // --------- Actions: Approve / Reject ----------
  const approve = async (id) => {
    const prev = rows;
    setRows((arr) =>
      arr.map((r) =>
        (r.id ?? r._id) === id ? { ...r, status: "Approved" } : r
      )
    );
    if (MOCK) return;

    try {
      await api.patch(`/api/verifications/${id}`, { status: "Approved" });
    } catch {
      alert("Approve failed. Rolling back.");
      setRows(prev);
    }
  };

  const reject = async (id) => {
    const prev = rows;
    setRows((arr) =>
      arr.map((r) =>
        (r.id ?? r._id) === id ? { ...r, status: "Rejected" } : r
      )
    );
    if (MOCK) return;

    try {
      await api.patch(`/api/verifications/${id}`, { status: "Rejected" });
    } catch {
      alert("Reject failed. Rolling back.");
      setRows(prev);
    }
  };

  const resetFilters = () => {
    setQ("");
    setFilters({ status: "", specialization: "" });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-slate-800">Verifications</h1>
      </div>

      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search name, email, phone…"
          className="w-full md:max-w-sm rounded-xl border border-slate-300 bg-white px-3 py-2 outline-none focus:ring-2 focus:ring-slate-300"
        />
        <div className="flex flex-wrap items-center gap-2">
          <Select
            value={filters.specialization}
            onChange={(v) => setFilters((s) => ({ ...s, specialization: v }))}
            placeholder="Specialization"
            options={specializationOptions}
          />
          <Select
            value={filters.status}
            onChange={(v) => setFilters((s) => ({ ...s, status: v }))}
            placeholder="Status"
            options={statusOptions}
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
              <RowMessage col={header.length} text="No submissions." />
            )}

            {!loading &&
              !err &&
              filtered.map((r) => {
                const id = r.id ?? r._id;
                return (
                  <tr key={id} className="hover:bg-slate-50">
                    <td className="px-6 py-4 font-medium">{r.name}</td>
                    <td className="px-6 py-4">{r.email}</td>
                    <td className="px-6 py-4">{r.phone}</td>
                    <td className="px-6 py-4">{r.specialization}</td>
                    <td className="px-6 py-4">{r.submittedAt}</td>
                    <td className="px-6 py-4">{r.status}</td>
                    <td className="px-6 py-3">
                      <div className="flex items-center gap-2 justify-end">
                        <button
                          onClick={() => approve(id)}
                          disabled={r.status === "Approved"}
                          className={`inline-flex items-center justify-center rounded-xl px-3 py-2 text-white disabled:opacity-50`}
                          style={{
                            backgroundColor: "rgb(5, 102, 141)",
                          }}
                          title="Approve"
                        >
                          <FiCheck />
                        </button>
                        <button
                          onClick={() => reject(id)}
                          disabled={r.status === "Rejected"}
                          className="inline-flex items-center justify-center rounded-xl px-3 py-2 text-white bg-red-500 hover:bg-red-600 disabled:opacity-50"
                          title="Reject"
                        >
                          <FiX />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
          </tbody>
        </table>
      </div>
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
function uniq(arr) {
  return [...new Set(arr)];
}
