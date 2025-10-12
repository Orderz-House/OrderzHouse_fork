import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { FiPlus, FiEdit2, FiTrash2, FiX } from "react-icons/fi";
import { VscDebugRestart } from "react-icons/vsc";
import OutlineButton from "../../components/buttons/OutlineButton.jsx";

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
  renderActions,
  hideCrudActions = false,
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

  const primary = "#028090";

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

  const getId = (r) => r.id ?? r._id;
  const updateRow = (id, patch) => {
    setRows((arr) =>
      arr.map((r) => (getId(r) === id ? { ...r, ...patch } : r))
    );
  };

  // ---------- CRUD ----------
  const makeEmptyForm = () =>
    formFields.reduce((acc, f) => {
      acc[f.key] = f.defaultValue ?? "";
      return acc;
    }, {});

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

  const firstCol = cols[0];
  const restCols = cols.slice(1);

  const helpers = {
    updateRow,
    openEdit,
    deleteRow: onDelete,
    rows,
    setRows,
    getId,
    refresh: () => setRefreshKey((k) => k + 1),
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-slate-800">{title}</h1>
        <OutlineButton
          onClick={openAdd}
          className="inline-flex items-center gap-2 rounded-xl px-4 py-2 shadow-sm"
        >
          <FiPlus />
          <span className="hidden sm:inline">{addLabel}</span>
          <span className="sm:hidden">Add</span>
        </OutlineButton>
      </div>

      {/* Search + filters */}
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
            title="Reset"
          >
            <VscDebugRestart />
          </button>
        </div>
      </div>

      {/* ===== Mobile (Compact list) ===== */}
      <div className="lg:hidden rounded-2xl border border-slate-200 bg-white/90 shadow-sm overflow-hidden">
        <div className="px-4 py-2 bg-slate-50/70 text-slate-500 text-xs font-medium">
          {title}
        </div>

        <ul className="divide-y divide-slate-200">
          {loading && (
            <li className="px-4 py-6 text-center text-slate-500">Loading…</li>
          )}
          {!loading && error && (
            <li className="px-4 py-6 text-center text-red-600">{error}</li>
          )}
          {!loading && !error && rows.length === 0 && (
            <li className="px-4 py-6 text-center text-slate-500">
              no data yet
            </li>
          )}

          {!loading &&
            !error &&
            rows.map((row, idx) => {
              const id = row.id ?? idx;
              return (
                <li key={id} className="px-4 py-3">
                  {/* layout: left info + right actions */}
                  <div className="grid grid-cols-[1fr_auto] items-start gap-3">
                    {/* Left: Title + meta */}
                    <div className="min-w-0">
                      <div className="font-semibold text-slate-800 truncate">
                        {String(row[firstCol.key] ?? "-")}
                      </div>

                      <div className="mt-1.5 grid grid-cols-2 gap-x-3 gap-y-1">
                        {restCols.slice(0, 4).map((c) => (
                          <div key={c.key} className="min-w-0">
                            <div className="text-[11px] text-slate-500 truncate">
                              {c.label}
                            </div>
                            <div className="text-xs text-slate-800 truncate">
                              {row[c.key] ?? "-"}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Right: actions */}
                    <div className="flex flex-col items-end gap-2">
                      <div className="flex items-center gap-1.5">
                        {renderActions ? (
                          renderActions({ row, idx, helpers })
                        ) : !hideCrudActions ? (
                          <>
                            <button
                              onClick={() => openEdit(idx)}
                              className="inline-flex h-9 w-9 items-center justify-center rounded-xl text-white"
                              style={{ backgroundColor: primary }}
                              title="Edit"
                            >
                              <FiEdit2 />
                            </button>
                            <button
                              onClick={() => onDelete(idx)}
                              className="inline-flex h-9 w-9 items-center justify-center rounded-xl text-white bg-red-500 hover:bg-red-600"
                              title="Delete"
                            >
                              <FiTrash2 />
                            </button>
                          </>
                        ) : null}
                      </div>
                    </div>
                  </div>
                </li>
              );
            })}
        </ul>
      </div>

      {/* ===== Desktop / Tablet (Table) ===== */}
      <div className="hidden lg:block rounded-2xl border border-slate-200 bg-white/90 shadow-sm overflow-hidden">
        <div className="w-full overflow-x-auto">
          <table className="min-w-[840px] w-full table-fixed">
            <colgroup>
              <col style={{ width: "26%" }} />
              {cols.slice(1).map((_, i) => (
                <col
                  key={i}
                  style={{
                    width: `${(66 / Math.max(1, cols.length - 1)).toFixed(2)}%`,
                  }}
                />
              ))}
              <col style={{ width: "8%" }} />
            </colgroup>

            <thead className="bg-slate-50/70 text-slate-500 text-sm">
              <tr>
                {header.map((h, i) => (
                  <th
                    key={i}
                    className={`text-left font-medium px-4 py-3 ${
                      i === header.length - 1 ? "text-right" : ""
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
                    {cols.map((c, j) => (
                      <td
                        key={c.key}
                        className={`px-4 py-4 ${j === 0 ? "font-medium" : ""} ${
                          j === 0 ? "truncate" : "whitespace-nowrap truncate"
                        }`}
                        title={String(row[c.key] ?? "")}
                      >
                        {String(row[c.key] ?? "")}
                      </td>
                    ))}
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center gap-2 justify-end">
                        {renderActions ? (
                          renderActions({ row, idx, helpers })
                        ) : !hideCrudActions ? (
                          <>
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
                          </>
                        ) : null}
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
      </div>

      {/* Modal */}
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
                    Cancle
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
            )}
          </div>
        </div>
      )}
    </div>
  );
}

/* ------- small helpers ------- */
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
