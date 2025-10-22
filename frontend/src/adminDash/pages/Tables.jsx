// src/components/Tables/PeopleTable.jsx
import { useEffect, useState, useMemo, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import { FiPlus, FiEdit2, FiTrash2, FiX, FiChevronDown, FiChevronRight } from "react-icons/fi";
import { VscDebugRestart } from "react-icons/vsc";
import { setUsers, updateUser, removeUser, setLoading, setError, setEditingRowId } from "../../slice/usersSlice";
import ExpandedRow from "./expandedRow.jsx"

const PRIMARY_COLOR = "#028090";
const DEBOUNCE_DELAY = 300;

// ============================================================================
// Hooks
// ============================================================================
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

function useTableData({ endpoint, api, searchQuery, chipValue, chipField, filterValues, refreshKey }) {
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
          : Array.isArray(data?.items)
          ? data.items
          : Array.isArray(data?.users)
          ? data.users
          : [];

        const processedList = list.map(row => ({
          ...row,
          categories: typeof row.categories === 'string' 
            ? (() => {
                try { return JSON.parse(row.categories); }
                catch { return []; }
              })()
            : row.categories
        }));

        setLocalRows(processedList);
        dispatch(setUsers(processedList));
      } catch (err) {
        if (!axios.isCancel(err)) {
          console.error(err);
          const errorMsg = "Failed to load data";
          setErrorLocal(errorMsg);
          dispatch(setError(errorMsg));
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
  }, [endpoint, searchQuery, chipValue, chipField, filterValues, refreshKey, api, dispatch]);

  return { rows: localRows, setRows: setLocalRows, loading, error };
}

// ============================================================================
// UI Components
// ============================================================================
const SearchBar = ({ value, onChange }) => (
  <input
    placeholder="Search by name…"
    value={value}
    onChange={(e) => onChange(e.target.value)}
    className="w-full md:max-w-sm rounded-xl border border-slate-300 bg-white px-3 py-2 outline-none focus:ring-2 focus:ring-slate-300"
  />
);

const FilterSelect = ({ value, onChange, placeholder, options = [] }) => (
  <select
    value={value}
    onChange={(e) => onChange(e.target.value)}
    className="rounded-xl border border-slate-300 bg-white px-3 py-2 outline-none text-slate-700 focus:ring-2 focus:ring-slate-300 text-sm"
  >
    <option value="">{placeholder}</option>
    {options.map((opt) =>
      typeof opt === "object" ? (
        <option key={opt.value} value={opt.value}>{opt.label}</option>
      ) : (
        <option key={opt} value={opt}>{opt}</option>
      )
    )}
  </select>
);

const FilterBar = ({ filters, filterValues, onFilterChange, onReset }) => {
  const filterOptions = useMemo(
    () => filters.map((f) => ({ ...f, options: f.options?.length ? f.options : [] })),
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
        className="rounded-xl border border-slate-300 px-3 py-2 text-slate-700 hover:bg-slate-50"
        title="Reset filters"
      >
        <VscDebugRestart />
      </button>
    </div>
  );
};

const FormField = ({ label, children, className = "" }) => (
  <label className={`space-y-1.5 ${className}`}>
    <span className="text-sm font-medium text-slate-700">{label}</span>
    {children}
  </label>
);

const FormInput = ({ field, value, onChange }) => {
  const baseClassName = "w-full rounded-xl border border-slate-300 px-3 py-2 outline-none focus:ring-2 focus:ring-slate-300 text-slate-800";
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
      <select value={value} onChange={(e) => onChange(e.target.value)} className={baseClassName} required={required}>
        <option value="">{placeholder || "Choose…"}</option>
        {options.map((opt) =>
          typeof opt === "object" ? (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ) : (
            <option key={opt} value={opt}>{opt}</option>
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

const AddModal = ({ isOpen, onClose, title, formFields, formData, onChange, onSubmit, error }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4">
      <div className="w-full max-w-2xl rounded-2xl border border-slate-200 bg-white p-6 shadow-xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-slate-800">{title}</h2>
          <button
            onClick={onClose}
            className="h-9 w-9 grid place-items-center rounded-lg hover:bg-slate-100 text-slate-600"
          >
            <FiX />
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={onSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl px-5 py-2.5 border border-slate-300 text-slate-700 hover:bg-slate-50 font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-xl px-5 py-2.5 text-white shadow-sm font-medium"
              style={{ backgroundColor: PRIMARY_COLOR }}
            >
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const MobileCards = ({ title, columns, rows, loading, error, renderActions, hideCrudActions, onEdit, onDelete, helpers }) => (
  <div className="md:hidden">
    {loading && <div className="py-8 text-center text-slate-500">Loading {title}…</div>}
    {error && <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-600">{error}</div>}
    {!loading && !error && rows.length === 0 && (
      <div className="text-center text-slate-500 py-8">No {title.toLowerCase()} found</div>
    )}
    {!loading && !error && rows.length > 0 && (
      <ul className="space-y-4">
        {rows.map((row, idx) => {
          const renderValue = (col) => {
            const val = col.render ? col.render(row) : row[col.key];
            return val ?? "—";
          };

          return (
            <li key={row.id ?? idx} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="space-y-2.5">
                {columns.map((col) => (
                  <div key={col.key} className="flex items-start gap-3">
                    <span className="text-xs font-medium text-slate-500 min-w-[80px]">
                      {col.label}
                    </span>
                    <span className="text-sm text-slate-800 flex-1">{renderValue(col)}</span>
                  </div>
                ))}

                <div className="flex items-center gap-2 pt-3 mt-3 border-t border-slate-200">
                  {renderActions ? (
                    renderActions(row, helpers)
                  ) : !hideCrudActions ? (
                    <>
                      <button
                        onClick={() => onEdit(idx)}
                        className="rounded-lg px-3 py-2 text-white text-sm"
                        style={{ backgroundColor: PRIMARY_COLOR }}
                      >
                        <FiEdit2 />
                      </button>
                      <button
                        onClick={() => onDelete(idx)}
                        className="rounded-lg px-3 py-2 bg-red-500 text-white text-sm"
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
    )}
  </div>
);

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
}) => (
  <div className="hidden md:block overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
    <table className="w-full border-collapse">
      <thead className="bg-slate-50 text-slate-700">
        <tr>
          <th className="border-b border-slate-200 px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider">
            #
          </th>
          {columns.map((col) => (
            <th
              key={col.key}
              className="border-b border-slate-200 px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider"
            >
              {col.label}
            </th>
          ))}
          <th className="border-b border-slate-200 px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider">
            Actions
          </th>
        </tr>
      </thead>
      <tbody className="divide-y divide-slate-100">
        {loading && (
          <tr>
            <td colSpan={columns.length + 2} className="py-8 text-center text-slate-500">
              Loading…
            </td>
          </tr>
        )}
        {error && (
          <tr>
            <td colSpan={columns.length + 2} className="p-4">
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-600">
                {error}
              </div>
            </td>
          </tr>
        )}
        {!loading && !error && rows.length === 0 && (
          <tr>
            <td colSpan={columns.length + 2} className="py-8 text-center text-slate-500">
              No records found
            </td>
          </tr>
        )}
        {!loading && !error && rows.map((row, idx) => {
          const isExpanded = expandedRow === idx;
          const isEditing = editingRowId === row.id;
          const renderValue = (col) => {
            const val = col.render ? col.render(row) : row[col.key];
            return val ?? "—";
          };

          return (
            <>
              <tr key={row.id ?? idx} className="hover:bg-slate-50">
                <td className="px-4 py-3 text-sm text-slate-600">
                  <button
                    onClick={() => onToggleExpand(idx)}
                    className="hover:text-slate-900"
                  >
                    {isExpanded ? <FiChevronDown /> : <FiChevronRight />}
                  </button>
                </td>
                {columns.map((col) => (
                  <td key={col.key} className="px-4 py-3 text-sm text-slate-800">
                    {renderValue(col)}
                  </td>
                ))}
                <td className="px-4 py-3 text-right">
                  <div className="inline-flex items-center gap-2">
                    {renderActions ? (
                      renderActions(row, helpers)
                    ) : !hideCrudActions ? (
                      <>
                        <button
                          onClick={() => helpers.handleDelete(idx)}
                          className="rounded-lg p-2 hover:bg-red-50 text-red-500"
                        >
                          <FiTrash2 />
                        </button>
                      </>
                    ) : null}
                  </div>
                </td>
              </tr>
              {isExpanded && (
                <tr>
                  <td colSpan={columns.length + 2} className="px-4 py-0">
                    <ExpandedRow
                      row={row}
                      columns={columns}
                      formFields={formFields}
                      isEditing={isEditing}
                      onSave={onSaveEdit}
                      onDelete={() => helpers.handleDelete(idx)}
                      onCancel={onCancelEdit}
                      renderActions={renderActions}
                      hideCrudActions={hideCrudActions}
                      helpers={helpers}
                    />
                  </td>
                </tr>
              )}
            </>
          );
        })}
      </tbody>
    </table>
  </div>
);

// ============================================================================
// Main Component
// ============================================================================
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
}) {
  const dispatch = useDispatch();
  const api = useApi(token);

  const { editingRowId, error: reduxError } = useSelector((state) => state.users);

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

  const tableColumns = columns?.length ? columns : [
    { label: "Name", key: "name" },
    { label: "Role", key: "role" },
  ];

  const getId = useCallback((row) => row.id ?? row._id, []);
  
  const createEmptyForm = useCallback(
    () => formFields.reduce((acc, field) => {
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

  const handleAddSubmit = useCallback(async (e) => {
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
  }, [addFormData, endpoint, api, refresh, setRows, dispatch]);

  const handleAddFormChange = useCallback((key, value) => {
    setAddFormData((prev) => ({ ...prev, [key]: value }));
  }, []);

  const startEdit = useCallback((rowId) => {
    dispatch(setEditingRowId(rowId));
  }, [dispatch]);

  const handleSaveEdit = useCallback(async (formData) => {
    try {
      if (!endpoint) {
        setRows((prev) =>
          prev.map((row) => (row.id === formData.id ? { ...row, ...formData } : row))
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
  }, [endpoint, api, dispatch, refresh, setRows]);

  const handleCancelEdit = useCallback(() => {
    dispatch(setEditingRowId(null));
  }, [dispatch]);

  const handleDelete = useCallback(async (idx) => {
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
  }, [rows, endpoint, api, dispatch, refresh]);

  const handleFilterChange = useCallback((key, value) => {
    setFilterValues((prev) => ({ ...prev, [key]: value }));
  }, []);

  const handleResetFilters = useCallback(() => {
    setSearchQuery("");
    setChipValue("");
    setFilterValues({});
  }, []);

  const handleToggleExpand = useCallback((idx) => {
    setExpandedRow((current) => current === idx ? null : idx);
    dispatch(setEditingRowId(null));
  }, [dispatch]);

  const helpers = useMemo(() => ({
    rows,
    setRows,
    getId,
    refresh,
    startEdit,
    handleDelete,
  }), [rows, setRows, getId, refresh, startEdit, handleDelete]);

  return (
    <div className="space-y-4 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-slate-800">{title}</h1>
        <button
          onClick={handleAddNew}
          className="inline-flex items-center gap-2 rounded-xl px-4 py-2 shadow-sm text-white"
          style={{ backgroundColor: PRIMARY_COLOR }}
        >
          <FiPlus />
          <span className="hidden sm:inline">{addLabel}</span>
          <span className="sm:hidden">Add</span>
        </button>
      </div>

      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
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
        onEdit={startEdit}
        onDelete={handleDelete}
        helpers={helpers}
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