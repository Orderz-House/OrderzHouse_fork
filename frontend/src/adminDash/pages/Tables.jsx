import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { FiPlus, FiEdit2, FiTrash2, FiX, FiChevronDown, FiChevronRight } from "react-icons/fi";
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
  renderActions,
  hideCrudActions = false,
  token,
}) {
  const [rows, setRows] = useState(initialRows);
  const [loading, setLoading] = useState(!!endpoint);
  const [error, setError] = useState("");
  const [expandedRow, setExpandedRow] = useState(null);

  const [isOpen, setIsOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({});
  const [loadingEdit, setLoadingEdit] = useState(false);

  const [q, setQ] = useState("");
  const [chip, setChip] = useState("");
  const [filterValues, setFilterValues] = useState({});
  const [refreshKey, setRefreshKey] = useState(0);

  const primary = "#028090";

  const api = useMemo(() => {
    return axios.create({
      baseURL: import.meta.env.VITE_API_URL || "",
      headers: {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
      },
    });
  }, [token]);

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
          : Array.isArray(data?.users)
          ? data.users
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
  }, [endpoint, q, chip, filterValues, chipField, refreshKey, api]);

  const getId = (r) => r.id ?? r._id;
  const updateRow = (id, patch) => {
    setRows((arr) =>
      arr.map((r) => (getId(r) === id ? { ...r, ...patch } : r))
    );
  };

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
    if (!confirm("Do you want to delete this record?")) return;
    try {
      if (endpoint && row?.id != null) {
        await api.delete(`${endpoint}/${row.id}`);
      }
      setRefreshKey((k) => k + 1);
    } catch (e) {
      console.error(e);
      alert("Failed to delete this record");
    }
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!String(form.first_name ?? form.name ?? "").trim()) return;

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
      alert("Failed to save the data");
    }
  };

  const resetFilters = () => {
    setQ("");
    setChip("");
    setFilterValues({});
  };

  const toggleExpand = (idx) => {
    setExpandedRow(expandedRow === idx ? null : idx);
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
    <div className="space-y-4 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-slate-800">{title}</h1>
        <button
          onClick={openAdd}
          className="inline-flex items-center gap-2 rounded-xl px-4 py-2 shadow-sm text-white"
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
            title="Reset"
          >
            <VscDebugRestart />
          </button>
        </div>
      </div>

      <div className="lg:hidden rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="px-4 py-2 bg-slate-50 text-slate-500 text-xs font-medium">
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
              No data yet
            </li>
          )}

          {!loading &&
            !error &&
            rows.map((row, idx) => {
              const id = row.id ?? idx;
              return (
                <li key={id} className="px-4 py-3">
                  <div className="grid grid-cols-[1fr_auto] items-start gap-3">
                    <div className="min-w-0">
                      <div className="font-semibold text-slate-800 truncate">
                        {String(row[firstCol.key] ?? "-")}
                      </div>

                      <div className="mt-1.5 grid grid-cols-2 gap-x-3 gap-y-1">
                        {restCols.slice(0, 6).map((c) => (
                          <div key={c.key} className="min-w-0">
                            <div className="text-[11px] text-slate-500 truncate">
                              {c.label}
                            </div>
                            <div className="text-xs text-slate-800 truncate">
                              {String(row[c.key] ?? "-")}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

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
                </li>
              );
            })}
        </ul>
      </div>

      <div className="hidden lg:block rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="w-full overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 text-slate-600 text-sm border-b border-slate-200">
              <tr>
                <th className="w-10 px-4 py-3"></th>
                {header.map((h, i) => (
                  <th
                    key={i}
                    className={`text-left font-semibold px-4 py-3 whitespace-nowrap ${
                      i === header.length - 1 ? "text-right w-[120px]" : ""
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
                    colSpan={header.length + 1}
                    className="px-6 py-10 text-center text-slate-500"
                  >
                    Loading...
                  </td>
                </tr>
              )}

              {!loading && error && (
                <tr>
                  <td
                    colSpan={header.length + 1}
                    className="px-6 py-10 text-center text-red-600"
                  >
                    {error}
                  </td>
                </tr>
              )}

              {!loading &&
                !error &&
                rows.map((row, idx) => {
                  const isExpanded = expandedRow === idx;
                  return (
                    <>
                      <tr key={row.id ?? idx} className="hover:bg-slate-50">
                        <td className="px-4 py-3">
                          <button
                            onClick={() => toggleExpand(idx)}
                            className="text-slate-600 hover:text-slate-800"
                          >
                            {isExpanded ? (
                              <FiChevronDown size={18} />
                            ) : (
                              <FiChevronRight size={18} />
                            )}
                          </button>
                        </td>
                        {cols.map((c, j) => (
                          <td
                            key={c.key}
                            className={`px-4 py-3 ${
                              j === 0 ? "font-medium" : ""
                            } whitespace-nowrap cursor-pointer`}
                            onClick={() => toggleExpand(idx)}
                            title={String(row[c.key] ?? "")}
                          >
                            <div className="max-w-[200px] truncate">
                              {c.render ? c.render(row) : String(row[c.key] ?? "-")}
                            </div>
                          </td>
                        ))}
                        <td className="px-4 py-3 text-right whitespace-nowrap">
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
                                  <FiEdit2 size={16} />
                                </button>
                                <button
                                  onClick={() => onDelete(idx)}
                                  className="inline-flex items-center justify-center rounded-xl px-3 py-2 text-white bg-red-500 hover:bg-red-600"
                                  title="Delete"
                                >
                                  <FiTrash2 size={16} />
                                </button>
                              </>
                            ) : null}
                          </div>
                        </td>
                      </tr>
                      {isExpanded && (
                        <tr className="bg-slate-50">
                          <td colSpan={header.length + 1} className="px-4 py-4">
                            <div className="flex gap-6 min-h-[180px]">
                              {row.profile_picture && (
                                <div className="flex-shrink-0">
                                  <img
                                    src={row.profile_picture}
                                    alt={row.first_name || "Profile"}
                                    className="w-32 h-32 rounded-xl object-cover border-2 border-slate-200"
                                  />
                                </div>
                              )}
                              <div className="flex-1 grid grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-3 content-start">
                                {Object.entries(row).map(([key, value]) => {
                                  const excludedFields = [
                                    'profile_picture', 'id', '_id', 
                                    'rating_count', 'rating_sum', 
                                    'updated_at', 'created_at'
                                  ];
                                  if (excludedFields.includes(key)) return null;
                                  return (
                                    <div key={key} className="min-w-0">
                                      <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide mb-0.5">
                                        {key.replace(/_/g, ' ')}
                                      </div>
                                      <div className="text-sm text-slate-800 break-words line-clamp-2">
                                        {value === null || value === undefined || value === ''
                                          ? '-'
                                          : typeof value === 'boolean'
                                          ? value ? 'Yes' : 'No'
                                          : String(value)}
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </>
                  );
                })}

              {!loading && !error && rows.length === 0 && (
                <tr>
                  <td
                    colSpan={header.length + 1}
                    className="px-6 py-10 text-center text-slate-500"
                  >
                    No data yet
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isOpen && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4">
          <div className="w-full max-w-2xl rounded-2xl border border-slate-200 bg-white p-6 shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-slate-800">
                {editingId === null ? "Add" : "Edit"} {title}
              </h2>
              <button
                onClick={() => setIsOpen(false)}
                className="h-9 w-9 grid place-items-center rounded-lg hover:bg-slate-100 text-slate-600"
                title="Close"
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
                    <Field
                      key={f.key}
                      label={f.label}
                      className={f.type === "textarea" ? "sm:col-span-2" : ""}
                    >
                      {renderInput(f, form[f.key] ?? "", (val) =>
                        setForm((s) => ({ ...s, [f.key]: val }))
                      )}
                    </Field>
                  ))}
                </div>

                <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
                  <button
                    type="button"
                    onClick={() => setIsOpen(false)}
                    className="rounded-xl px-5 py-2.5 border border-slate-300 text-slate-700 hover:bg-slate-50 font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="rounded-xl px-5 py-2.5 text-white shadow-sm font-medium"
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

function Field({ label, children, className = "" }) {
  return (
    <label className={`space-y-1.5 ${className}`}>
      <span className="text-sm font-medium text-slate-700">{label}</span>
      {children}
    </label>
  );
}

function renderInput(field, value, onChange) {
  const common =
    "w-full rounded-xl border border-slate-300 px-3 py-2 outline-none focus:ring-2 focus:ring-slate-300 text-slate-800";
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
      className="rounded-xl border border-slate-300 bg-white px-3 py-2 outline-none text-slate-700 focus:ring-2 focus:ring-slate-300 text-sm"
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