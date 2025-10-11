import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { FiPlus, FiEdit2, FiTrash2, FiX } from "react-icons/fi";
import { VscDebugRestart } from "react-icons/vsc";

export default function PeopleTable({
  title,
  addLabel,
  initialRows = [],
  endpoint,
  getOnePath,
  columns,
  formFields = [],
  chips,
  chipField = "type",
  filters = [],
}) {
  const [rows, setRows] = useState(initialRows);
  const [loading, setLoading] = useState(!!endpoint);
  const [error, setError] = useState("");

  const [isOpen, setIsOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({});
  const [loadingEdit, setLoadingEdit] = useState(false);

  const [q, setQ] = useState("");
  const [chip, setChip] = useState("");
  const [filterValues, setFilterValues] = useState({});
  const [refreshKey, setRefreshKey] = useState(0);

  const primary = "#05668D";

  const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || "",
    headers: { "Content-Type": "application/json" },
  });

  const cols = columns?.length
    ? columns
    : [
        { label: "Name", key: "name" },
        { label: "Role", key: "role" },
        { label: "Dept", key: "dept" },
        { label: "City", key: "city" },
      ];

  const header = useMemo(() => [...cols.map((c) => c.label), ""], [cols]);

  const filterDefs = useMemo(() => {
    return filters.map((f) => {
      if (f.options && f.options.length) return f;
      const opts = uniq(rows.map((r) => r?.[f.key]).filter(Boolean));
      return { ...f, options: opts };
    });
  }, [filters, rows]);

  useEffect(() => {
    if (!endpoint) return;

    const ctrl = new AbortController();
    setLoading(true);
    setError("");

    const paramsRaw = { q, [chipField]: chip, ...filterValues };
    const params = Object.fromEntries(
      Object.entries(paramsRaw).filter(
        ([, v]) => v != null && String(v).trim() !== ""
      )
    );

    const t = setTimeout(async () => {
      try {
        const { data } = await api.get(endpoint, {
          params,
          signal: ctrl.signal,
        });
        const list = Array.isArray(data)
          ? data
          : Array.isArray(data?.items)
          ? data.items
          : [];
        setRows(list);
      } catch (e) {
        if (!axios.isCancel(e)) {
          console.error(e);
          setError("no data");
        }
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => {
      ctrl.abort();
      clearTimeout(t);
    };
  }, [endpoint, q, chip, filterValues, chipField, refreshKey]);

  // Helpers
  const makeEmptyForm = () =>
    formFields.reduce((acc, f) => {
      acc[f.key] = f.defaultValue ?? "";
      return acc;
    }, {});

  // ---------- CRUD ----------
  const openAdd = () => {
    setEditingId(null);
    setForm(makeEmptyForm());
    setIsOpen(true);
  };

  const openEdit = async (idx) => {
    const row = rows[idx];
    if (!row) return;
    setIsOpen(true);
    setEditingId(row?.id ?? idx);
    setLoadingEdit(true);

    let base = { ...makeEmptyForm(), ...row };

    try {
      if (row?.id != null) {
        const path = getOnePath ? getOnePath(row.id) : `${endpoint}/${row.id}`;
        const { data } = await api.get(path);
        base = { ...base, ...(data || {}) };
      }
    } catch (e) {
      console.warn("Failed to fetch details. Using row only.", e);
    } finally {
      setForm(base);
      setLoadingEdit(false);
    }
  };

  const onDelete = async (idx) => {
    const row = rows[idx];
    if (!row) return;
    if (!confirm("do you want delete this line?")) return;
    try {
      if (endpoint && row?.id != null) {
        await api.delete(`${endpoint}/${row.id}`);
      }
      setRefreshKey((k) => k + 1);
    } catch (e) {
      console.error(e);
      alert("failed delete this line");
    }
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!String(form.name ?? "").trim()) return;

    try {
      if (!endpoint) {
        if (editingId === null)
          setRows((r) => [...r, { id: crypto.randomUUID(), ...form }]);
        else
          setRows((r) =>
            r.map((row) => (row.id === editingId ? { ...row, ...form } : row))
          );
        setIsOpen(false);
        return;
      }

      if (editingId === null) {
        await api.post(endpoint, form);
      } else {
        await api.put(`${endpoint}/${editingId}`, form);
      }
      setIsOpen(false);
      setRefreshKey((k) => k + 1);
    } catch (e) {
      console.error(e);
      alert("failed save the data");
    }
  };

  const resetFilters = () => {
    setQ("");
    setChip("");
    setFilterValues({});
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-slate-800">{title}</h1>
        <button
          onClick={openAdd}
          className="inline-flex items-center gap-2 rounded-xl px-4 py-2 text-white shadow-sm"
          style={{ backgroundColor: primary }}
        >
          <FiPlus />
          <span className="hidden sm:inline">{addLabel}</span>
          <span className="sm:hidden">Add</span>
        </button>
      </div>

      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <input
          placeholder="Search by name…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          className="w-full md:max-w-sm rounded-xl border border-slate-300 bg-white px-3 py-2 outline-none focus:ring-2 focus:ring-slate-300"
        />

        <div className="flex flex-wrap items-center gap-2">
          {filterDefs.map((f) => (
            <Select
              key={f.key}
              value={filterValues[f.key] ?? ""}
              onChange={(val) =>
                setFilterValues((s) => ({ ...s, [f.key]: val }))
              }
              placeholder={f.label}
              options={f.options}
            />
          ))}

          <button
            onClick={resetFilters}
            className="rounded-xl border border-slate-300 px-3 py-2 text-slate-700 hover:bg-slate-50"
          >
            <VscDebugRestart />
          </button>
        </div>
      </div>

      {Array.isArray(chips) && chips.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {chips.map((c) => {
            const active = chip === (c.value ?? "");
            return (
              <button
                key={c.label}
                onClick={() => setChip(c.value ?? "")}
                className={`rounded-2xl px-3 py-1 text-sm border ${
                  active ? "text-white" : "text-slate-700"
                }`}
                style={{
                  backgroundColor: active ? primary : "transparent",
                  borderColor: active ? primary : "rgba(148,163,184,0.5)",
                }}
              >
                {c.label}
              </button>
            );
          })}
        </div>
      )}

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
            {loading && (
              <tr>
                <td
                  colSpan={header.length}
                  className="px-6 py-10 text-center text-slate-500"
                >
                  Loading
                </td>
              </tr>
            )}

            {!loading && error && (
              <tr>
                <td
                  colSpan={header.length}
                  className="px-6 py-10 text-center text-red-600"
                >
                  {error}
                </td>
              </tr>
            )}

            {!loading &&
              !error &&
              rows.map((row, idx) => (
                <tr key={row.id ?? idx} className="hover:bg-slate-50">
                  {cols.map((c) => (
                    <td key={c.key} className="px-6 py-4">
                      {row[c.key]}
                    </td>
                  ))}
                  <td className="px-6 py-3">
                    <div className="flex items-center gap-2 justify-end">
                      <button
                        onClick={() => openEdit(idx)}
                        className="inline-flex items-center justify-center rounded-xl px-3 py-2 text-white"
                        style={{ backgroundColor: primary }}
                        title="Edit"
                      >
                        <FiEdit2 />
                      </button>
                      <button
                        onClick={() => onDelete(idx)}
                        className="inline-flex items-center justify-center rounded-xl px-3 py-2 text-white bg-red-500 hover:bg-red-600"
                        title="Delete"
                      >
                        <FiTrash2 />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

            {!loading && !error && rows.length === 0 && (
              <tr>
                <td
                  colSpan={header.length}
                  className="px-6 py-10 text-center text-slate-500"
                >
                  no data yet
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {isOpen && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4">
          <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-5 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-slate-800">
                {editingId === null ? "Add" : "Edit"}
              </h2>
              <button
                onClick={() => setIsOpen(false)}
                className="h-9 w-9 grid place-items-center rounded-lg hover:bg-slate-100 text-slate-600"
                title="close"
              >
                <FiX />
              </button>
            </div>

            {loadingEdit ? (
              <div className="py-8 text-center text-slate-500">Loading…</div>
            ) : (
              <form onSubmit={onSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {formFields.map((f) => (
                    <Field key={f.key} label={f.label}>
                      {renderInput(f, form[f.key] ?? "", (val) =>
                        setForm((s) => ({ ...s, [f.key]: val }))
                      )}
                    </Field>
                  ))}
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsOpen(false)}
                    className="rounded-xl px-4 py-2 border border-slate-300 text-slate-700 hover:bg-slate-50"
                  >
                    إلغاء
                  </button>
                  <button
                    type="submit"
                    className="rounded-xl px-4 py-2 text-white shadow-sm"
                    style={{ backgroundColor: primary }}
                  >
                    حفظ
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function Field({ label, children }) {
  return (
    <label className="space-y-1">
      <span className="text-xs font-medium text-slate-500">{label}</span>
      {children}
    </label>
  );
}

function renderInput(field, value, onChange) {
  const common =
    "w-full rounded-xl border border-slate-300 px-3 py-2 outline-none focus:ring-2 focus:ring-slate-300";
  const { type = "text", placeholder, options = [], required } = field;

  if (type === "textarea")
    return (
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={common}
        rows={4}
        required={required}
      />
    );

  if (type === "select")
    return (
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={common}
        required={required}
      >
        <option value="">{placeholder || "Choose…"}</option>
        {options.map((opt) =>
          typeof opt === "object" ? (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ) : (
            <option key={opt} value={opt}>
              {opt}
            </option>
          )
        )}
      </select>
    );

  // text | number | tel
  return (
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className={common}
      required={required}
    />
  );
}

function Select({ value, onChange, placeholder, options = [] }) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="rounded-xl border border-slate-300 bg-white px-3 py-2 outline-none text-slate-700 focus:ring-2 focus:ring-slate-300"
    >
      <option value="">{placeholder}</option>
      {options.map((opt) =>
        typeof opt === "object" ? (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ) : (
          <option key={opt} value={opt}>
            {opt}
          </option>
        )
      )}
    </select>
  );
}

function uniq(arr) {
  return [...new Set(arr)];
}
