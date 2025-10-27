import { useEffect, useState, useMemo, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import {
  FiPlus,
  FiEdit2,
  FiTrash2,
  FiX,
  FiChevronDown,
  FiChevronRight,
  FiEye,
} from "react-icons/fi";
import { VscDebugRestart } from "react-icons/vsc";
import {
  setUsers,
  updateUser,
  removeUser,
  setLoading,
  setError,
  setEditingRowId,
} from "../../slice/usersSlice";
import React from "react";
import ExpandedRow from "./expandedRow.jsx";

const PRIMARY = "#028090";
const DEBOUNCE_DELAY = 300;

/* ====================== Defaults ====================== */
const DEFAULT_CRUD_CONFIG = {
  showEdit: true,
  showDelete: true,
  showExpand: false,
  showRowEdit: false,
};

function useApi(token) {
  return useMemo(
    () =>
      axios.create({
        baseURL: import.meta.env.VITE_APP_API_URL || "",
        headers: {
          "Content-Type": "application/json",
          ...(token && { Authorization: `Bearer ${token}` }),
        },
      }),
    [token]
  );
}

function useTableData({
  endpoint,
  api,
  searchQuery,
  chipValue,
  chipField,
  filterValues,
  refreshKey,
}) {
  const dispatch = useDispatch();
  const [localRows, setLocalRows] = useState([]);
  const [loading, setLoadingLocal] = useState(!!endpoint);
  const [error, setErrorLocal] = useState("");

  useEffect(() => {
    if (!endpoint) return;
    const controller = new AbortController();
    setLoadingLocal(true);
    setErrorLocal("");
    dispatch(setLoading(true));

    const params = Object.fromEntries(
      Object.entries({
        q: searchQuery,
        [chipField]: chipValue,
        ...filterValues,
      }).filter(([, v]) => v != null && String(v).trim() !== "")
    );

    const timeoutId = setTimeout(async () => {
      try {
        const { data } = await api.get(endpoint, {
          params,
          signal: controller.signal,
        });

        const list = Array.isArray(data)
  ? data
  : Array.isArray(data?.appointments)
  ? data.appointments
  : Array.isArray(data?.items)
  ? data.items
  : Array.isArray(data?.users)
  ? data.users
  : [];


        const processedList = list.map((row) => ({
          ...row,
          categories:
            typeof row.categories === "string"
              ? (() => {
                  try {
                    return JSON.parse(row.categories);
                  } catch {
                    return [];
                  }
                })()
              : row.categories,
        }));

        setLocalRows(processedList);
        dispatch(setUsers(processedList));
      } catch (err) {
        if (!axios.isCancel(err)) {
          console.error(err);
          const msg = "Failed to load data";
          setErrorLocal(msg);
          dispatch(setError(msg));
        }
      } finally {
        setLoadingLocal(false);
        dispatch(setLoading(false));
      }
    }, DEBOUNCE_DELAY);

    return () => {
      controller.abort();
      clearTimeout(timeoutId);
    };
  }, [
    endpoint,
    searchQuery,
    chipValue,
    chipField,
    filterValues,
    refreshKey,
    api,
    dispatch,
  ]);

  return { rows: localRows, setRows: setLocalRows, loading, error };
}

/* ====================== UI Bits ====================== */
const SearchBar = ({ value, onChange }) => (
  <input
    placeholder="Search by name…"
    value={value}
    onChange={(e) => onChange(e.target.value)}
    className="w-full md:max-w-sm rounded-xl border border-slate-300 bg-white px-3 py-1.5 outline-none text-[13px] focus:ring-2 focus:ring-slate-300"
  />
);

const FilterSelect = ({ value, onChange, placeholder, options = [] }) => (
  <select
    value={value}
    onChange={(e) => onChange(e.target.value)}
    className="rounded-xl border border-slate-300 bg-white px-3 py-1.5 outline-none text-[13px] text-slate-700 focus:ring-2 focus:ring-slate-300"
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

const FilterBar = ({ filters, filterValues, onFilterChange, onReset }) => {
  const filterOptions = useMemo(
    () =>
      filters.map((f) => ({
        ...f,
        options: f.options?.length ? f.options : [],
      })),
    [filters]
  );

  return (
    <div className="flex flex-wrap items-center gap-2">
      {filterOptions.map((filter) => (
        <FilterSelect
          key={filter.key}
          value={filterValues[filter.key] ?? ""}
          onChange={(val) => onFilterChange(filter.key, val)}
          placeholder={filter.label}
          options={filter.options}
        />
      ))}
      <button
        onClick={onReset}
        className="w-9 h-9 grid place-items-center rounded-full border border-slate-200 hover:bg-slate-50 text-slate-700"
        title="Reset filters"
      >
        <VscDebugRestart />
      </button>
    </div>
  );
};

const FormField = ({ label, children, className = "" }) => (
  <label className={`space-y-1 ${className}`}>
    <span className="text-[12px] font-medium text-slate-700">{label}</span>
    {children}
  </label>
);

const FormInput = ({ field, value, onChange }) => {
  const baseClassName =
    "w-full rounded-xl border border-slate-300 px-3 py-1.5 outline-none focus:ring-2 focus:ring-slate-300 text-[13px] text-slate-800";
  const { type = "text", placeholder, options = [], required } = field;

  if (type === "textarea") {
    return (
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={baseClassName}
        rows={4}
        required={required}
      />
    );
  }

  if (type === "select") {
    return (
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={baseClassName}
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
  }

  return (
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className={baseClassName}
      required={required}
    />
  );
};

const AddModal = ({
  isOpen,
  onClose,
  title,
  formFields,
  formData,
  onChange,
  onSubmit,
  error,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4">
      <div className="w-full max-w-2xl rounded-2xl border border-slate-200 bg-white p-5 shadow-xl max-h-[90vh] overflow-y-auto text-[13.5px]">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold text-slate-800">{title}</h2>
          <button
            onClick={onClose}
            className="w-9 h-9 grid place-items-center rounded-full border border-slate-200 hover:bg-slate-50 text-slate-600"
            title="Close"
          >
            <FiX />
          </button>
        </div>

        {error && (
          <div className="mb-3 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-[12px]">
            {error}
          </div>
        )}

        <form onSubmit={onSubmit} className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {formFields.map((field) => (
              <FormField
                key={field.key}
                label={field.label}
                className={field.type === "textarea" ? "sm:col-span-2" : ""}
              >
                <FormInput
                  field={field}
                  value={formData[field.key] ?? ""}
                  onChange={(val) => onChange(field.key, val)}
                />
              </FormField>
            ))}
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="h-9 px-3 rounded-full border border-slate-200 hover:bg-slate-50 inline-flex items-center gap-2 text-sm text-slate-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="h-9 px-3 rounded-full border inline-flex items-center gap-2 text-sm"
              style={{ borderColor: PRIMARY, color: PRIMARY }}
            >
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

/* ====================== Helpers ====================== */
function pickColumn(columns, keywords = []) {
  const lower = (s) => String(s || "").toLowerCase();
  const byLabel = (kw) =>
    columns.find((c) => lower(c.label).includes(kw)) ||
    columns.find((c) => lower(c.key).includes(kw));
  for (const k of keywords) {
    const c = byLabel(k);
    if (c) return c;
  }
  return null;
}
function getCellValue(col, row, idx) {
  if (!col) return undefined;
  return col.render ? col.render(row, idx) : row[col.key];
}
function truthyYes(val) {
  const s = String(val ?? "").toLowerCase();
  return ["yes", "true", "1", "verified"].some((x) => s.includes(x));
}
function onlineState(val) {
  const s = String(val ?? "").toLowerCase();
  if (s.includes("online")) return "online";
  if (s.includes("offline")) return "offline";
  return "";
}
function initialsFrom(name) {
  const s = String(name || "").trim();
  if (!s) return "•";
  const parts = s.split(/\s+/).slice(0, 2);
  return parts.map((p) => p[0]?.toUpperCase()).join("");
}
function pickAvatar(row) {
  return (
    row?.avatar ||
    row?.image ||
    row?.profile_image ||
    row?.photoUrl ||
    row?.photoURL ||
    ""
  );
}

/* ====================== Mobile List ====================== */
const MobileCards = ({
  title,
  columns,
  rows,
  loading,
  error,
  renderActions,
  hideCrudActions,
  helpers,
  crudConfig,
  expandedRow,
  onToggleExpand,
  formFields,
  editingRowId,
  onSaveEdit,
  onCancelEdit,
}) => {
  if (loading) {
    return (
      <div className="block md:hidden text-center text-slate-600 py-8">
        Loading {title}…
      </div>
    );
  }
  if (error) {
    return (
      <div className="block md:hidden text-center text-red-600 py-8">
        {error}
      </div>
    );
  }
  if (!rows.length) {
    return (
      <div className="block md:hidden text-center text-slate-500 py-8">
        No {title} found
      </div>
    );
  }

  const nameCol =
    pickColumn(columns, ["name", "full name", "username"]) || columns[0];
  const emailCol = pickColumn(columns, ["email"]);
  const countryCol = pickColumn(columns, ["country", "city"]);
  const roleCol = pickColumn(columns, ["role", "type"]);
  const statusCol = pickColumn(columns, ["status"]);
  const verifiedCol = pickColumn(columns, ["verified", "is verified"]);

  return (
    <div className="block md:hidden space-y-2 w-full max-w-[100vw] overflow-x-hidden">
      {rows.map((row, idx) => {
        const isEditing = editingRowId === helpers.getId(row);
        const isExpanded = expandedRow === idx;

        const primary = getCellValue(nameCol, row, idx) ?? "—";
        const email = getCellValue(emailCol, row, idx);
        const country = getCellValue(countryCol, row, idx);
        const role = getCellValue(roleCol, row, idx);
        const statusVal = getCellValue(statusCol, row, idx);
        const verifiedVal = getCellValue(verifiedCol, row, idx);

        const avatarUrl = pickAvatar(row);
        const state = onlineState(statusVal);
        const isVerified = truthyYes(verifiedVal);

        const secondary =
          email ?? (country ? String(country) : role ? String(role) : undefined);

        return (
          <div
            key={idx}
            className="w-full rounded-xl border border-slate-200 bg-white p-2.5 shadow-sm"
          >
            <div className="flex items-center gap-3 min-h-[56px]">
              {/* Avatar */}
              <div className="shrink-0 w-10 h-10 rounded-full bg-slate-100 overflow-hidden grid place-items-center text-[12px] text-slate-600">
                {avatarUrl ? (
                  <img src={avatarUrl} className="w-full h-full object-cover" />
                ) : (
                  initialsFrom(primary)
                )}
              </div>

              {/* Texts */}
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <div className="text-[14px] font-medium text-slate-800 truncate">
                    {primary}
                  </div>

                  {state && (
                    <span
                      className={`inline-flex items-center gap-1 text-[11px] ${
                        state === "online"
                          ? "text-emerald-600"
                          : "text-slate-500"
                      }`}
                    >
                      <span
                        className={`w-2 h-2 rounded-full ${
                          state === "online" ? "bg-emerald-500" : "bg-slate-400"
                        }`}
                      />
                      {state === "online" ? "Online" : "Offline"}
                    </span>
                  )}

                  {isVerified && (
                    <span className="text-[11px] text-emerald-600">✓ Verified</span>
                  )}
                </div>

                {secondary && (
                  <div className="text-[12px] text-slate-600 truncate">
                    {secondary}
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  onClick={() => onToggleExpand(idx)}
                  className="w-8 h-8 grid place-items-center rounded-full border border-slate-200 hover:bg-slate-50 text-slate-700"
                  title="View"
                >
                  <FiEye />
                </button>

                {crudConfig.showRowEdit && (
                  <button
                    onClick={() => helpers.startEdit(helpers.getId(row))}
                    className="h-8 px-3 rounded-full border inline-flex items-center gap-1.5 text-[12px]"
                    style={{ borderColor: PRIMARY, color: PRIMARY }}
                    title="Edit"
                  >
                    <FiEdit2 />
                  </button>
                )}

                {crudConfig.showDelete && (
                  <button
                    onClick={() => helpers.handleDelete(idx)}
                    className="h-8 px-3 rounded-full border border-slate-200 hover:bg-red-50 inline-flex items-center gap-1.5 text-[12px] text-red-600"
                    title="Delete"
                  >
                    <FiTrash2 />
                  </button>
                )}
              </div>
            </div>

            {/* Expanded content */}
            {isExpanded && (
              <div className="mt-2">
                <ExpandedRow
                  row={row}
                  columns={columns}
                  formFields={formFields}
                  isEditing={isEditing}
                  onSave={onSaveEdit}
                  onDelete={() => helpers.handleDelete(idx)}
                  onCancel={onCancelEdit}
                  helpers={helpers}
                />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

/* ====================== Desktop Table ====================== */
const DesktopTable = ({
  columns,
  rows,
  loading,
  error,
  expandedRow,
  onToggleExpand,
  renderActions,
  hideCrudActions,
  helpers,
  formFields,
  editingRowId,
  onSaveEdit,
  onCancelEdit,
  crudConfig,
}) => {
  if (loading) {
    return (
      <div className="hidden md:block overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="p-8 text-center text-slate-600">Loading data…</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="hidden md:block overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="p-8 text-center text-red-600">{error}</div>
      </div>
    );
  }

  return (
    <div className="hidden md:block overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
      <table className="w-full border-collapse text-[13px]">
        <thead className="border-b border-slate-200 bg-slate-50">
          <tr>
            {crudConfig.showExpand && <th className="w-10 px-3 py-2"></th>}
            {columns.map((col) => (
              <th
                key={col.key}
                className="whitespace-nowrap px-3 py-2 text-left text-[12px] font-semibold text-slate-700"
              >
                {col.label}
              </th>
            ))}
            <th className="w-28 px-3 py-2 text-center text-[12px] font-semibold text-slate-700">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-200">
          {!rows.length ? (
            <tr>
              <td
                colSpan={columns.length + (crudConfig.showExpand ? 2 : 1)}
                className="px-4 py-8 text-center text-slate-500"
              >
                No records found
              </td>
            </tr>
          ) : (
            rows.map((row, idx) => {
              const isExpanded = expandedRow === idx;
              const isEditing = editingRowId === helpers.getId(row);

              return (
                <React.Fragment key={idx}>
                  <tr
                    className={`hover:bg-slate-50 ${
                      isExpanded ? "bg-slate-50" : ""
                    }`}
                  >
                    {crudConfig.showExpand && (
                      <td className="px-3 py-2 text-center">
                        <button
                          onClick={() => onToggleExpand(idx)}
                          className="w-9 h-9 grid place-items-center rounded-full border border-slate-200 hover:bg-slate-50 text-slate-700"
                          title="Toggle"
                        >
                          {isExpanded ? <FiChevronDown /> : <FiChevronRight />}
                        </button>
                      </td>
                    )}

                    {columns.map((col) => (
                      <td key={col.key} className="px-3 py-2 text-slate-800">
                        {col.render ? col.render(row, idx) : row[col.key]}
                      </td>
                    ))}

                    <td className="px-3 py-2">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => onToggleExpand(idx)}
                          className="w-9 h-9 grid place-items-center rounded-full border border-slate-200 hover:bg-slate-50 text-slate-700"
                          title="View"
                        >
                          <FiEye />
                        </button>

                        {renderActions ? (
                          renderActions(row, helpers)
                        ) : !hideCrudActions ? (
                          <>
                            {crudConfig.showRowEdit && (
                              <button
                                onClick={() =>
                                  helpers.startEdit(helpers.getId(row))
                                }
                                className="h-9 px-3 rounded-full border inline-flex items-center gap-2 text-sm"
                                style={{ borderColor: PRIMARY, color: PRIMARY }}
                                title="Edit"
                              >
                                <FiEdit2 />
                              </button>
                            )}

                            {crudConfig.showDelete && (
                              <button
                                onClick={() => helpers.handleDelete(idx)}
                                className="h-9 px-3 rounded-full border border-slate-200 hover:bg-red-50 inline-flex items-center gap-2 text-sm text-red-600"
                                title="Delete"
                              >
                                <FiTrash2 />
                              </button>
                            )}
                          </>
                        ) : null}
                      </div>
                    </td>
                  </tr>

                  {isExpanded && (
                    <tr>
                      <td
                        colSpan={
                          columns.length + (crudConfig.showExpand ? 2 : 1)
                        }
                        className="px-3 py-0"
                      >
                        <ExpandedRow
                          row={row}
                          columns={columns}
                          formFields={formFields}
                          isEditing={isEditing}
                          onSave={onSaveEdit}
                          onDelete={() => helpers.handleDelete(idx)}
                          onCancel={onCancelEdit}
                          helpers={helpers}
                        />
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
};

/* ====================== Main ====================== */
export default function PeopleTable({
  title = "People",
  addLabel = "Add Person",
  endpoint,
  getOnePath,
  columns,
  formFields = [],
  chipField = "type",
  filters = [],
  renderActions,
  hideCrudActions = false,
  token,
  crudConfig = {},
}) {
  const dispatch = useDispatch();
  const api = useApi(token);
  const { editingRowId, error: reduxError } = useSelector((s) => s.users);

  const mergedCrudConfig = useMemo(
    () => ({ ...DEFAULT_CRUD_CONFIG, ...crudConfig }),
    [crudConfig]
  );

  const [searchQuery, setSearchQuery] = useState("");
  const [chipValue, setChipValue] = useState("");
  const [filterValues, setFilterValues] = useState({});
  const [refreshKey, setRefreshKey] = useState(0);
  const [expandedRow, setExpandedRow] = useState(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [addFormData, setAddFormData] = useState({});

  const { rows, setRows, loading, error } = useTableData({
    endpoint,
    api,
    searchQuery,
    chipValue,
    chipField,
    filterValues,
    refreshKey,
  });

  const tableColumns = columns?.length
    ? columns
    : [
        { label: "Name", key: "name" },
        { label: "Role", key: "role" },
      ];

  const getId = useCallback((row) => row.id ?? row._id, []);
  const createEmptyForm = useCallback(
    () =>
      formFields.reduce((acc, field) => {
        acc[field.key] = field.defaultValue ?? "";
        return acc;
      }, {}),
    [formFields]
  );

  const refresh = useCallback(() => setRefreshKey((k) => k + 1), []);
  const handleAddNew = useCallback(() => {
    setAddFormData(createEmptyForm());
    setIsAddModalOpen(true);
  }, [createEmptyForm]);

  const handleAddSubmit = useCallback(
    async (e) => {
      e.preventDefault();
      if (!String(addFormData.first_name ?? addFormData.name ?? "").trim()) {
        return;
      }
      try {
        if (!endpoint) {
          const newUser = { id: crypto.randomUUID(), ...addFormData };
          setRows((prev) => [...prev, newUser]);
          setIsAddModalOpen(false);
          return;
        }
        await api.post(endpoint, addFormData);
        setIsAddModalOpen(false);
        refresh();
      } catch (err) {
        console.error(err);
        dispatch(setError("Failed to save the data"));
      }
    },
    [addFormData, endpoint, api, refresh, setRows, dispatch]
  );

  const handleAddFormChange = useCallback((key, value) => {
    setAddFormData((prev) => ({ ...prev, [key]: value }));
  }, []);

  const startEdit = useCallback(
    (rowId) => dispatch(setEditingRowId(rowId)),
    [dispatch]
  );
  const handleSaveEdit = useCallback(
    async (formData) => {
      try {
        if (!endpoint) {
          setRows((prev) =>
            prev.map((row) =>
              row.id === formData.id ? { ...row, ...formData } : row
            )
          );
          dispatch(updateUser(formData));
          dispatch(setEditingRowId(null));
          return;
        }
        await api.put(`${endpoint}/${formData.id}`, formData);
        dispatch(updateUser(formData));
        dispatch(setEditingRowId(null));
        refresh();
      } catch (err) {
        console.error(err);
        dispatch(setError("Failed to update the data"));
      }
    },
    [endpoint, api, dispatch, refresh, setRows]
  );
  const handleCancelEdit = useCallback(
    () => dispatch(setEditingRowId(null)),
    [dispatch]
  );
  const handleDelete = useCallback(
    async (idx) => {
      const row = rows[idx];
      if (!row || !window.confirm("Do you want to delete this record?")) return;
      try {
        if (endpoint && row?.id != null) {
          await api.delete(`${endpoint}/${row.id}`);
          dispatch(removeUser(row.id));
        }
        refresh();
      } catch (err) {
        console.error(err);
        dispatch(setError("Failed to delete this record"));
      }
    },
    [rows, endpoint, api, dispatch, refresh]
  );

  const handleFilterChange = useCallback(
    (key, value) => setFilterValues((prev) => ({ ...prev, [key]: value })),
    []
  );
  const handleResetFilters = useCallback(() => {
    setSearchQuery("");
    setChipValue("");
    setFilterValues({});
  }, []);
  const handleToggleExpand = useCallback(
    (idx) => {
      setExpandedRow((current) => (current === idx ? null : idx));
      dispatch(setEditingRowId(null));
    },
    [dispatch]
  );

  const helpers = useMemo(
    () => ({
      rows,
      setRows,
      getId,
      refresh,
      startEdit,
      handleDelete,
    }),
    [rows, setRows, getId, refresh, startEdit, handleDelete]
  );

  return (
    <div className="space-y-3 px-3 sm:px-4 py-3 w-full max-w-[100vw] overflow-x-hidden text-[13.5px] sm:text-[14px]">
      <div className="flex items-center justify-between">
        <h1 className="text-lg sm:text-xl font-semibold text-slate-800">
          {title}
        </h1>

        <button
          onClick={handleAddNew}
          className="h-9 px-3 rounded-full border inline-flex items-center gap-2 text-sm"
          style={{ borderColor: PRIMARY, color: PRIMARY }}
          title={addLabel}
        >
          <FiPlus />
          <span className="hidden sm:inline">{addLabel}</span>
          <span className="sm:hidden">Add</span>
        </button>
      </div>

      <div className="flex flex-col gap-2.5 md:flex-row md:items-center md:justify-between">
        <SearchBar value={searchQuery} onChange={setSearchQuery} />
        <FilterBar
          filters={filters}
          filterValues={filterValues}
          onFilterChange={handleFilterChange}
          onReset={handleResetFilters}
        />
      </div>

      <MobileCards
        title={title}
        columns={tableColumns}
        rows={rows}
        loading={loading}
        error={error}
        renderActions={renderActions}
        hideCrudActions={hideCrudActions}
        helpers={helpers}
        crudConfig={mergedCrudConfig}
        expandedRow={expandedRow}
        onToggleExpand={handleToggleExpand}
        formFields={formFields}
        editingRowId={editingRowId}
        onSaveEdit={handleSaveEdit}
        onCancelEdit={handleCancelEdit}
      />

      <DesktopTable
        columns={tableColumns}
        rows={rows}
        loading={loading}
        error={error}
        expandedRow={expandedRow}
        onToggleExpand={handleToggleExpand}
        renderActions={renderActions}
        hideCrudActions={hideCrudActions}
        helpers={helpers}
        formFields={formFields}
        editingRowId={editingRowId}
        onSaveEdit={handleSaveEdit}
        onCancelEdit={handleCancelEdit}
        crudConfig={mergedCrudConfig}
      />

      <AddModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title={`Add ${title}`}
        formFields={formFields}
        formData={addFormData}
        onChange={handleAddFormChange}
        onSubmit={handleAddSubmit}
        error={reduxError}
      />
    </div>
  );
}
