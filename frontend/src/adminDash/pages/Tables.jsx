import { useEffect, useState, useMemo, useCallback } from "react";
import axios from "axios";
import { FiPlus, FiEdit2, FiTrash2, FiX, FiChevronDown, FiChevronRight } from "react-icons/fi";
import { VscDebugRestart } from "react-icons/vsc";

// ============================================================================
// Constants
// ============================================================================
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
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(!!endpoint);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!endpoint) return;

    const controller = new AbortController();
    setLoading(true);
    setError("");

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

        // Parse categories if they're JSON strings
        const processedList = list.map(row => ({
          ...row,
          categories: typeof row.categories === 'string' 
            ? (() => {
                try { return JSON.parse(row.categories); }
                catch { return []; }
              })()
            : row.categories
        }));

        setRows(processedList);
      } catch (err) {
        if (!axios.isCancel(err)) {
          console.error(err);
          setError("Failed to load data");
        }
      } finally {
        setLoading(false);
      }
    }, DEBOUNCE_DELAY);

    return () => {
      controller.abort();
      clearTimeout(timeoutId);
    };
  }, [endpoint, searchQuery, chipValue, chipField, filterValues, refreshKey, api]);

  return { rows, setRows, loading, error };
}

// ============================================================================
// UI Components - Filters
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

// ============================================================================
// UI Components - Form
// ============================================================================
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

const EditModal = ({ isOpen, onClose, title, formFields, formData, onChange, onSubmit, loading }) => {
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

        {loading ? (
          <div className="py-8 text-center text-slate-500">Loading…</div>
        ) : (
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
        )}
      </div>
    </div>
  );
};

// ============================================================================
// UI Components - Subscription
// ============================================================================
const SubscriptionBadge = ({ subscription }) => {
  if (!subscription || !subscription.id) {
    return <span className="text-slate-400 text-xs italic">No plan</span>;
  }

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'active':
        return 'bg-green-100 text-green-700 border-green-300';
      case 'expired':
        return 'bg-red-100 text-red-700 border-red-300';
      case 'cancelled':
        return 'bg-slate-100 text-slate-600 border-slate-300';
      default:
        return 'bg-slate-100 text-slate-600 border-slate-300';
    }
  };

  return (
    <div className="flex flex-col gap-1">
      <span className="text-sm font-medium text-slate-800">{subscription.name}</span>
      <span className={`inline-flex items-center self-start px-2 py-0.5 rounded text-xs font-medium border ${getStatusColor(subscription.status)}`}>
        {subscription.status || 'Unknown'}
      </span>
    </div>
  );
};

const SubscriptionCard = ({ subscription }) => {
  if (!subscription || !subscription.id) {
    return (
      <div className="bg-white rounded-lg px-4 py-3 border border-slate-200 text-center">
        <span className="text-sm text-slate-500 italic">No active subscription</span>
      </div>
    );
  }

  const { name, price, duration, start_date, end_date, status } = subscription;
  
  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'active':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'expired':
        return 'bg-red-100 text-red-700 border-red-200';
      case 'cancelled':
        return 'bg-slate-100 text-slate-700 border-slate-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const formatDate = (date) => {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  return (
    <div className="bg-white rounded-lg px-4 py-4 border border-slate-200 shadow-sm">
      <div className="flex items-start justify-between mb-3">
        <div>
          <h5 className="font-semibold text-slate-800 text-base">{name}</h5>
          <p className="text-xs text-slate-500 mt-0.5">{duration} days</p>
        </div>
        <div className="text-right">
          <div className="text-lg font-bold text-slate-800">${price}</div>
          <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border mt-1 ${getStatusColor(status)}`}>
            {status || 'Unknown'}
          </span>
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-3 pt-3 border-t border-slate-100">
        <div>
          <div className="text-xs text-slate-500 mb-0.5">Start Date</div>
          <div className="text-sm font-medium text-slate-700">{formatDate(start_date)}</div>
        </div>
        <div>
          <div className="text-xs text-slate-500 mb-0.5">End Date</div>
          <div className="text-sm font-medium text-slate-700">{formatDate(end_date)}</div>
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// UI Components - Category
// ============================================================================
const CategoryBadge = ({ name }) => (
  <span className="inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-medium bg-blue-500 text-white shadow-sm">
    {name}
  </span>
);

const CategoryList = ({ categories, maxVisible = 2 }) => {
  if (!categories || !Array.isArray(categories) || categories.length === 0) {
    return <span className="text-slate-400 text-xs italic">No categories</span>;
  }

  const visible = categories.slice(0, maxVisible);
  const remaining = categories.length - maxVisible;

  return (
    <div className="flex flex-wrap gap-1.5 items-center">
      {visible.map((cat) => (
        <CategoryBadge key={cat.id} name={cat.name} />
      ))}
      {remaining > 0 && (
        <span className="text-xs text-slate-600 font-medium bg-slate-100 px-2 py-1 rounded">
          +{remaining}
        </span>
      )}
    </div>
  );
};

// ============================================================================
// UI Components - Row Details
// ============================================================================
const InfoCard = ({ label, value }) => {
  const displayValue =
    value === null || value === undefined || value === ''
      ? '-'
      : typeof value === 'boolean'
      ? (value ? 'Yes' : 'No')
      : String(value);

  return (
    <div className="bg-white rounded-lg px-4 py-3 border border-slate-200">
      <div className="text-xs font-medium text-slate-500 mb-1">{label}</div>
      <div className="text-sm font-semibold text-slate-800">{displayValue}</div>
    </div>
  );
};

const RowDetails = ({ row }) => {
  const isFreelancer = row.role_id === 3 || (row.categories && Array.isArray(row.categories));
  
  const excludedFields = new Set([
    'profile_picture', 'profile_pic_url', 'id', '_id', 'role_id', 
    'updated_at', 'created_at', 'password', 'rating_count', 'rating_sum', 'subscription'
  ]);

  const displayedFields = new Set([
    'first_name', 'last_name', 'username', 'email', 'phone_number', 
    'country', 'bio', 'categories', 'rating', 'is_verified', 
    'is_online', 'is_locked', 'is_deleted'
  ]);

  const additionalFields = Object.entries(row).filter(
    ([key]) => !excludedFields.has(key) && !displayedFields.has(key)
  );

  return (
    <div className="bg-slate-50 rounded-xl p-6">
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Profile Section */}
        <div className="flex flex-col items-center lg:items-start gap-4 lg:w-48 flex-shrink-0">
          {(row.profile_picture || row.profile_pic_url) && (
            <img
              src={row.profile_picture || row.profile_pic_url}
              alt={row.first_name || "Profile"}
              className="w-40 h-40 rounded-xl object-cover border border-slate-300 shadow-sm"
            />
          )}
          
          {/* Quick Stats */}
          <div className="flex flex-col gap-3 w-full">
            {isFreelancer && row.rating !== undefined && (
              <div className="bg-white border border-slate-200 rounded-lg px-4 py-3 text-center shadow-sm">
                <div className="text-xs font-medium text-slate-500 mb-1">Rating</div>
                <div className="text-2xl font-bold text-slate-800">
                  {Number(row.rating).toFixed(1)}
                </div>
                <div className="text-xs text-slate-600 mt-1">
                  {row.rating_count || 0} {row.rating_count === 1 ? 'review' : 'reviews'}
                </div>
              </div>
            )}
            
            {isFreelancer && row.is_verified !== undefined && (
              <div className="bg-white border border-slate-200 rounded-lg px-4 py-3 text-center shadow-sm">
                <div className="text-xs font-medium text-slate-500 mb-1">Verification</div>
                <div className={`text-sm font-semibold ${row.is_verified ? 'text-green-600' : 'text-slate-600'}`}>
                  {row.is_verified ? 'Verified' : 'Not Verified'}
                </div>
              </div>
            )}

            {!isFreelancer && row.is_online !== undefined && (
              <div className="bg-white border border-slate-200 rounded-lg px-4 py-3 text-center shadow-sm">
                <div className="flex items-center justify-center gap-2 mb-1">
                  <span className={`w-2 h-2 rounded-full ${row.is_online ? 'bg-green-500' : 'bg-slate-400'}`}></span>
                  <span className="text-xs font-medium text-slate-500">Status</span>
                </div>
                <div className={`text-sm font-semibold ${row.is_online ? 'text-green-600' : 'text-slate-700'}`}>
                  {row.is_online ? 'Online' : 'Offline'}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Information Section */}
        <div className="flex-1 space-y-6">
          {/* Contact & Identity */}
          <section>
            <h4 className="text-xs font-semibold text-slate-600 uppercase tracking-wider mb-3 pb-2 border-b border-slate-300">
              Contact Information
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {row.first_name && <InfoCard label="First Name" value={row.first_name} />}
              {row.last_name && <InfoCard label="Last Name" value={row.last_name} />}
              {row.username && <InfoCard label="Username" value={row.username} />}
              {row.email && <InfoCard label="Email" value={row.email} />}
              {row.phone_number && <InfoCard label="Phone Number" value={row.phone_number} />}
              {row.country && <InfoCard label="Country" value={row.country} />}
            </div>
          </section>

          {/* Bio */}
          {row.bio && (
            <section>
              <h4 className="text-xs font-semibold text-slate-600 uppercase tracking-wider mb-3 pb-2 border-b border-slate-300">
                Biography
              </h4>
              <div className="bg-white rounded-lg px-4 py-3 border border-slate-200 shadow-sm">
                <p className="text-sm text-slate-700 leading-relaxed">{row.bio}</p>
              </div>
            </section>
          )}

          {/* Subscription - Freelancers Only */}
          {isFreelancer && row.subscription && (
            <section>
              <h4 className="text-xs font-semibold text-slate-600 uppercase tracking-wider mb-3 pb-2 border-b border-slate-300">
                Subscription Plan
              </h4>
              <SubscriptionCard subscription={row.subscription} />
            </section>
          )}

          {/* Categories - Freelancers Only */}
          {isFreelancer && row.categories && Array.isArray(row.categories) && row.categories.length > 0 && (
            <section>
              <h4 className="text-xs font-semibold text-slate-600 uppercase tracking-wider mb-3 pb-2 border-b border-slate-300">
                Specializations
              </h4>
              <div className="bg-white rounded-lg px-4 py-4 border border-slate-200 shadow-sm">
                <div className="flex flex-wrap gap-2">
                  {row.categories.map((cat) => (
                    <CategoryBadge key={cat.id} name={cat.name} />
                  ))}
                </div>
              </div>
            </section>
          )}

          {/* Account Status */}
          <section>
            <h4 className="text-xs font-semibold text-slate-600 uppercase tracking-wider mb-3 pb-2 border-b border-slate-300">
              Account Status
            </h4>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {isFreelancer && row.is_online !== undefined && (
                <div className="bg-white border border-slate-200 rounded-lg px-4 py-3 shadow-sm">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`w-2 h-2 rounded-full ${row.is_online ? 'bg-green-500' : 'bg-slate-400'}`}></span>
                    <span className="text-xs font-medium text-slate-500">Status</span>
                  </div>
                  <div className={`text-sm font-semibold ${row.is_online ? 'text-green-600' : 'text-slate-700'}`}>
                    {row.is_online ? 'Online' : 'Offline'}
                  </div>
                </div>
              )}
              {row.is_locked !== undefined && <InfoCard label="Account Locked" value={row.is_locked} />}
              {row.is_deleted !== undefined && <InfoCard label="Account Deleted" value={row.is_deleted} />}
            </div>
          </section>

          {/* Additional Fields */}
          {additionalFields.length > 0 && (
            <section>
              <h4 className="text-xs font-semibold text-slate-600 uppercase tracking-wider mb-3 pb-2 border-b border-slate-300">
                Additional Information
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {additionalFields.map(([key, value]) => (
                  <InfoCard 
                    key={key} 
                    label={key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())} 
                    value={value} 
                  />
                ))}
              </div>
            </section>
          )}
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// UI Components - Table Actions
// ============================================================================
const ActionButtons = ({ onEdit, onDelete, renderCustomActions, hideCrudActions }) => {
  if (renderCustomActions) return renderCustomActions;
  if (hideCrudActions) return null;

  return (
    <>
      <button
        onClick={onEdit}
        className="inline-flex items-center justify-center rounded-xl px-3 py-2 text-white"
        style={{ backgroundColor: PRIMARY_COLOR }}
        title="Edit"
      >
        <FiEdit2 size={16} />
      </button>
      <button
        onClick={onDelete}
        className="inline-flex items-center justify-center rounded-xl px-3 py-2 text-white bg-red-500 hover:bg-red-600"
        title="Delete"
      >
        <FiTrash2 size={16} />
      </button>
    </>
  );
};

// ============================================================================
// UI Components - Desktop Table
// ============================================================================
const DesktopTable = ({ columns, rows, loading, error, expandedRow, onToggleExpand, renderActions, hideCrudActions, onEdit, onDelete, helpers }) => {
  const headers = [...columns.map((c) => c.label), ""];

  return (
    <div className="hidden lg:block rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
      <div className="w-full overflow-x-auto">
        <table className="w-full">
          <thead className="bg-slate-50 text-slate-600 text-sm border-b border-slate-200">
            <tr>
              <th className="w-10 px-4 py-3"></th>
              {headers.map((header, i) => (
                <th
                  key={i}
                  className={`text-left font-semibold px-4 py-3 whitespace-nowrap ${
                    i === headers.length - 1 ? "text-right w-[120px]" : ""
                  }`}
                >
                  {header}
                </th>
              ))}
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-200 text-slate-800">
            {loading && (
              <tr>
                <td colSpan={headers.length + 1} className="px-6 py-10 text-center text-slate-500">
                  Loading...
                </td>
              </tr>
            )}

            {!loading && error && (
              <tr>
                <td colSpan={headers.length + 1} className="px-6 py-10 text-center text-red-600">
                  {error}
                </td>
              </tr>
            )}

            {!loading && !error && rows.length === 0 && (
              <tr>
                <td colSpan={headers.length + 1} className="px-6 py-10 text-center text-slate-500">
                  No data yet
                </td>
              </tr>
            )}

            {!loading &&
              !error &&
              rows.map((row, idx) => {
                const isExpanded = expandedRow === idx;
                const rowId = row.id ?? idx;

                return (
                  <>
                    <tr key={rowId} className="hover:bg-slate-50">
                      <td className="px-4 py-3">
                        <button
                          onClick={() => onToggleExpand(idx)}
                          className="text-slate-600 hover:text-slate-800"
                        >
                          {isExpanded ? <FiChevronDown size={18} /> : <FiChevronRight size={18} />}
                        </button>
                      </td>

                      {columns.map((col, j) => (
                        <td
                          key={col.key}
                          className={`px-4 py-3 ${j === 0 ? "font-medium" : ""} whitespace-nowrap cursor-pointer`}
                          onClick={() => onToggleExpand(idx)}
                          title={col.key === 'categories' ? '' : String(row[col.key] ?? "")}
                        >
                          <div className="max-w-[200px] truncate">
                            {col.render ? col.render(row) : String(row[col.key] ?? "-")}
                          </div>
                        </td>
                      ))}

                      <td className="px-4 py-3 text-right whitespace-nowrap">
                        <div className="flex items-center gap-2 justify-end">
                          <ActionButtons
                            onEdit={() => onEdit(idx)}
                            onDelete={() => onDelete(idx)}
                            renderCustomActions={renderActions?.({ row, idx, helpers })}
                            hideCrudActions={hideCrudActions}
                          />
                        </div>
                      </td>
                    </tr>

                    {isExpanded && (
                      <tr className="bg-slate-50">
                        <td colSpan={headers.length + 1} className="px-4 py-4">
                          <RowDetails row={row} />
                        </td>
                      </tr>
                    )}
                  </>
                );
              })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// ============================================================================
// UI Components - Mobile Cards
// ============================================================================
const MobileCards = ({ title, columns, rows, loading, error, renderActions, hideCrudActions, onEdit, onDelete, helpers }) => {
  const [firstCol, ...restCols] = columns;

  return (
    <div className="lg:hidden rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
      <div className="px-4 py-2 bg-slate-50 text-slate-500 text-xs font-medium">{title}</div>

      <ul className="divide-y divide-slate-200">
        {loading && <li className="px-4 py-6 text-center text-slate-500">Loading…</li>}
        {!loading && error && <li className="px-4 py-6 text-center text-red-600">{error}</li>}
        {!loading && !error && rows.length === 0 && (
          <li className="px-4 py-6 text-center text-slate-500">No data yet</li>
        )}

        {!loading &&
          !error &&
          rows.map((row, idx) => {
            const rowId = row.id ?? idx;

            return (
              <li key={rowId} className="px-4 py-3">
                <div className="grid grid-cols-[1fr_auto] items-start gap-3">
                  <div className="min-w-0">
                    <div className="font-semibold text-slate-800 truncate">
                      {String(row[firstCol.key] ?? "-")}
                    </div>

                    <div className="mt-1.5 grid grid-cols-2 gap-x-3 gap-y-1">
                      {restCols.slice(0, 6).map((col) => (
                        <div key={col.key} className="min-w-0">
                          <div className="text-[11px] text-slate-500 truncate">{col.label}</div>
                          <div className="text-xs text-slate-800">
                            {col.key === 'categories' && col.render ? (
                              col.render(row)
                            ) : (
                              <span className="truncate block">{String(row[col.key] ?? "-")}</span>
                            )}
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
                          onClick={() => onEdit(idx)}
                          className="inline-flex h-9 w-9 items-center justify-center rounded-xl text-white"
                          style={{ backgroundColor: PRIMARY_COLOR }}
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
  );
};

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
  const api = useApi(token);

  // State
  const [searchQuery, setSearchQuery] = useState("");
  const [chipValue, setChipValue] = useState("");
  const [filterValues, setFilterValues] = useState({});
  const [refreshKey, setRefreshKey] = useState(0);
  const [expandedRow, setExpandedRow] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({});
  const [loadingEdit, setLoadingEdit] = useState(false);

  // Fetch data
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
    { label: "Dept", key: "dept" },
    { label: "City", key: "city" },
  ];

  // Helper functions
  const getId = useCallback((row) => row.id ?? row._id, []);
  
  const createEmptyForm = useCallback(
    () => formFields.reduce((acc, field) => {
      acc[field.key] = field.defaultValue ?? "";
      return acc;
    }, {}),
    [formFields]
  );

  const updateRow = useCallback((id, patch) => {
    setRows((prevRows) =>
      prevRows.map((row) => (getId(row) === id ? { ...row, ...patch } : row))
    );
  }, [getId, setRows]);

  const refresh = useCallback(() => setRefreshKey((k) => k + 1), []);

  // Event handlers
  const handleAddNew = useCallback(() => {
    setEditingId(null);
    setFormData(createEmptyForm());
    setIsModalOpen(true);
  }, [createEmptyForm]);

  const handleEdit = useCallback(async (idx) => {
    const row = rows[idx];
    if (!row) return;

    setIsModalOpen(true);
    setEditingId(row?.id ?? idx);
    setLoadingEdit(true);

    let baseForm = { ...createEmptyForm(), ...row };

    try {
      if (row?.id != null) {
        const path = getOnePath ? getOnePath(row.id) : `${endpoint}/${row.id}`;
        const { data } = await api.get(path);
        baseForm = { ...baseForm, ...(data || {}) };
      }
    } catch (err) {
      console.warn("Failed to fetch details. Using row data only.", err);
    } finally {
      setFormData(baseForm);
      setLoadingEdit(false);
    }
  }, [rows, createEmptyForm, getOnePath, endpoint, api]);

  const handleDelete = useCallback(async (idx) => {
    const row = rows[idx];
    if (!row || !window.confirm("Do you want to delete this record?")) return;

    try {
      if (endpoint && row?.id != null) {
        await api.delete(`${endpoint}/${row.id}`);
      }
      refresh();
    } catch (err) {
      console.error(err);
      alert("Failed to delete this record");
    }
  }, [rows, endpoint, api, refresh]);

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();

    if (!String(formData.first_name ?? formData.name ?? "").trim()) {
      return;
    }

    try {
      if (!endpoint) {
        if (editingId === null) {
          setRows((prev) => [...prev, { id: crypto.randomUUID(), ...formData }]);
        } else {
          setRows((prev) =>
            prev.map((row) => (row.id === editingId ? { ...row, ...formData } : row))
          );
        }
        setIsModalOpen(false);
        return;
      }

      if (editingId === null) {
        await api.post(endpoint, formData);
      } else {
        await api.put(`${endpoint}/${editingId}`, formData);
      }

      setIsModalOpen(false);
      refresh();
    } catch (err) {
      console.error(err);
      alert("Failed to save the data");
    }
  }, [formData, endpoint, editingId, api, refresh, setRows]);

  const handleFormChange = useCallback((key, value) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  }, []);

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
  }, []);

  const helpers = useMemo(() => ({
    updateRow,
    openEdit: handleEdit,
    deleteRow: handleDelete,
    rows,
    setRows,
    getId,
    refresh,
  }), [updateRow, handleEdit, handleDelete, rows, setRows, getId, refresh]);

  return (
    <div className="space-y-4 p-6">
      {/* Header */}
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

      {/* Search and Filters */}
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <SearchBar value={searchQuery} onChange={setSearchQuery} />
        <FilterBar
          filters={filters}
          filterValues={filterValues}
          onFilterChange={handleFilterChange}
          onReset={handleResetFilters}
        />
      </div>

      {/* Mobile View */}
      <MobileCards
        title={title}
        columns={tableColumns}
        rows={rows}
        loading={loading}
        error={error}
        renderActions={renderActions}
        hideCrudActions={hideCrudActions}
        onEdit={handleEdit}
        onDelete={handleDelete}
        helpers={helpers}
      />

      {/* Desktop View */}
      <DesktopTable
        columns={tableColumns}
        rows={rows}
        loading={loading}
        error={error}
        expandedRow={expandedRow}
        onToggleExpand={handleToggleExpand}
        renderActions={renderActions}
        hideCrudActions={hideCrudActions}
        onEdit={handleEdit}
        onDelete={handleDelete}
        helpers={helpers}
      />

      {/* Edit Modal */}
      <EditModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={`${editingId === null ? "Add" : "Edit"} ${title}`}
        formFields={formFields}
        formData={formData}
        onChange={handleFormChange}
        onSubmit={handleSubmit}
        loading={loadingEdit}
      />
    </div>
  );
}