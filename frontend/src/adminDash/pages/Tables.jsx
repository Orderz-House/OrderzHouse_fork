import { useEffect, useState, useMemo, useCallback } from "react";
import axios from "axios";
import { FiPlus, FiEdit2, FiTrash2, FiX, FiChevronDown, FiChevronRight, FiSave, FiXCircle } from "react-icons/fi";
import { VscDebugRestart } from "react-icons/vsc";

// ============================================================================
// Constants & Utilities
// ============================================================================
const PRIMARY_COLOR = "#028090";
const DEBOUNCE_DELAY = 300;

const STATUS_COLORS = {
  active: "bg-emerald-50 text-emerald-700 border-emerald-200",
  expired: "bg-rose-50 text-rose-700 border-rose-200",
  cancelled: "bg-slate-100 text-slate-600 border-slate-200",
  default: "bg-slate-100 text-slate-600 border-slate-200"
};

const formatDate = (date) => {
  if (!date) return "-";
  return new Date(date).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
};

const formatValue = (value) => {
  if (value === null || value === undefined || value === "") return "-";
  if (typeof value === "boolean") return value ? "Yes" : "No";
  return String(value);
};

const getStatusColor = (status) => STATUS_COLORS[status?.toLowerCase()] || STATUS_COLORS.default;

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
          ...(token && { Authorization: `Bearer ${token}` })
        }
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
      Object.entries({ q: searchQuery, [chipField]: chipValue, ...filterValues }).filter(
        ([, v]) => v != null && String(v).trim() !== ""
      )
    );

    const timeoutId = setTimeout(async () => {
      try {
        const { data } = await api.get(endpoint, { params, signal: controller.signal });
        const list = Array.isArray(data) ? data : Array.isArray(data?.items) ? data.items : Array.isArray(data?.users) ? data.users : [];

        const processedList = list.map((row) => ({
          ...row,
          categories: typeof row.categories === "string" ? (() => { try { return JSON.parse(row.categories); } catch { return []; } })() : row.categories
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
// Basic UI Components
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
      <button onClick={onReset} className="rounded-xl border border-slate-300 px-3 py-2 text-slate-700 hover:bg-slate-50" title="Reset filters">
        <VscDebugRestart />
      </button>
    </div>
  );
};

// ============================================================================
// Form Components
// ============================================================================
const EditableField = ({ label, value, onChange, type = "text", options = [] }) => {
  const baseClassName = "w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500";

  if (type === "textarea") {
    return (
      <div className="sm:col-span-2">
        <label className="block text-xs font-medium text-slate-600 mb-1">{label}</label>
        <textarea value={value} onChange={(e) => onChange(e.target.value)} className={baseClassName} rows={3} />
      </div>
    );
  }

  if (type === "select") {
    return (
      <div>
        <label className="block text-xs font-medium text-slate-600 mb-1">{label}</label>
        <select value={value} onChange={(e) => onChange(e.target.value)} className={baseClassName}>
          <option value="">Choose…</option>
          {options.map((opt) =>
            typeof opt === "object" ? (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ) : (
              <option key={opt} value={opt}>{opt}</option>
            )
          )}
        </select>
      </div>
    );
  }

  // Handle boolean fields with proper conversion
  if (type === "boolean" || (options && options.length === 2 && options.every(o => typeof o === "object" && typeof o.value === "boolean"))) {
    return (
      <div>
        <label className="block text-xs font-medium text-slate-600 mb-1">{label}</label>
        <select 
          value={value === true || value === "true" ? "true" : "false"} 
          onChange={(e) => onChange(e.target.value === "true")} 
          className={baseClassName}
        >
          <option value="true">Yes</option>
          <option value="false">No</option>
        </select>
      </div>
    );
  }

  return (
    <div>
      <label className="block text-xs font-medium text-slate-600 mb-1">{label}</label>
      <input type={type} value={value} onChange={(e) => onChange(e.target.value)} className={baseClassName} />
    </div>
  );
};

// ============================================================================
// Data Display Components
// ============================================================================
const Badge = ({ children, className }) => (
  <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium ${className}`}>
    {children}
  </span>
);

const CategoryBadge = ({ name }) => <Badge className="bg-blue-500 text-white shadow-sm">{name}</Badge>;

const CategoryList = ({ categories, maxVisible = 2 }) => {
  if (!categories?.length) return <span className="text-slate-400 text-xs italic">No categories</span>;

  const visible = categories.slice(0, maxVisible);
  const remaining = categories.length - maxVisible;

  return (
    <div className="flex flex-wrap gap-1.5 items-center">
      {visible.map((cat) => <CategoryBadge key={cat.id} name={cat.name} />)}
      {remaining > 0 && <Badge className="bg-slate-100 text-slate-600">+{remaining}</Badge>}
    </div>
  );
};

// ============================================================================
// Row Details Components
// ============================================================================
const Card = ({ children, className = "" }) => (
  <div className={`bg-white rounded-xl border border-slate-200 shadow-sm ${className}`}>
    {children}
  </div>
);

const SectionTitle = ({ children }) => (
  <h4 className="text-xs font-bold text-slate-600 uppercase tracking-wider mb-4 pb-2 border-b-2 border-slate-200">
    {children}
  </h4>
);

const InfoItem = ({ label, value }) => (
  <Card className="p-4">
    <div className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-1">{label}</div>
    <div className="text-sm font-semibold text-slate-800">{formatValue(value)}</div>
  </Card>
);

const ProfileImage = ({ src, alt, isEditing, onImageChange }) => {
  const [uploadMode, setUploadMode] = useState('url');
  const [previewUrl, setPreviewUrl] = useState(src);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        alert('Please select an image file');
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('Image size should be less than 5MB');
        return;
      }

      // Create preview and convert to base64
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result;
        setPreviewUrl(base64String);
        onImageChange(base64String);
      };
      reader.readAsDataURL(file);
    }
  };

  if (isEditing) {
    return (
      <div className="space-y-3">
        {previewUrl && (
          <div className="w-32 h-32 mx-auto">
            <img src={previewUrl} alt={alt} className="w-full h-full rounded-lg object-cover border-2 border-slate-300" />
          </div>
        )}
        
        {/* Toggle between URL and Upload */}
        <div className="flex gap-2 justify-center">
          <button
            type="button"
            onClick={() => setUploadMode('url')}
            className={`px-3 py-1 text-xs rounded-lg ${uploadMode === 'url' ? 'bg-blue-500 text-white' : 'bg-slate-200 text-slate-700'}`}
          >
            URL
          </button>
          <button
            type="button"
            onClick={() => setUploadMode('upload')}
            className={`px-3 py-1 text-xs rounded-lg ${uploadMode === 'upload' ? 'bg-blue-500 text-white' : 'bg-slate-200 text-slate-700'}`}
          >
            Upload
          </button>
        </div>

        {uploadMode === 'url' ? (
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Profile Image URL</label>
            <input
              type="text"
              value={src || ""}
              onChange={(e) => {
                onImageChange(e.target.value);
                setPreviewUrl(e.target.value);
              }}
              placeholder="Enter image URL"
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        ) : (
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Upload Image</label>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
            <p className="text-xs text-slate-500 mt-1">Max size: 5MB. Formats: JPG, PNG, GIF</p>
          </div>
        )}
      </div>
    );
  }

  return (
    <Card className="p-4">
      <img src={src} alt={alt} className="w-full aspect-square rounded-lg object-cover" />
    </Card>
  );
};

const RatingCard = ({ rating, count }) => (
  <Card className="bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200 p-4 text-center">
    <div className="text-xs font-medium text-amber-700 uppercase tracking-wide mb-2">Rating</div>
    <div className="flex items-center justify-center gap-1 mb-1">
      <span className="text-3xl font-bold text-amber-600">{Number(rating).toFixed(1)}</span>
      <span className="text-amber-500 text-xl">★</span>
    </div>
    <div className="text-xs text-amber-700">{count || 0} {count === 1 ? "review" : "reviews"}</div>
  </Card>
);

const StatusCard = ({ label, isActive }) => (
  <Card className={`p-4 text-center ${isActive ? "bg-emerald-50 border-emerald-200" : "bg-slate-50"}`}>
    <div className="text-xs font-medium text-slate-600 uppercase tracking-wide mb-2">{label}</div>
    <div className={`text-sm font-semibold ${isActive ? "text-emerald-700" : "text-slate-600"}`}>
      {isActive ? "Active" : "Inactive"}
    </div>
  </Card>
);

const SubscriptionCard = ({ subscription }) => {
  if (!subscription?.id) {
    return <Card className="p-6 text-center"><span className="text-sm text-slate-500 italic">No subscription</span></Card>;
  }

  const { name, price, duration, start_date, end_date, status } = subscription;

  return (
    <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200 p-5">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h5 className="font-bold text-slate-800 text-lg">{name}</h5>
          <p className="text-xs text-slate-600 mt-1">{duration} days</p>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-blue-600">${price}</div>
          <Badge className={`mt-2 border ${getStatusColor(status)}`}>{status || "Unknown"}</Badge>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 pt-4 border-t border-blue-200/50">
        <div>
          <div className="text-xs font-medium text-slate-600 mb-1">Start</div>
          <div className="text-sm font-semibold text-slate-800">{formatDate(start_date)}</div>
        </div>
        <div>
          <div className="text-xs font-medium text-slate-600 mb-1">End</div>
          <div className="text-sm font-semibold text-slate-800">{formatDate(end_date)}</div>
        </div>
      </div>
    </Card>
  );
};

const RowDetails = ({ row, isEditing, editData, onEditChange, formFields }) => {
  const isFreelancer = row.role_id === 3 || row.categories?.length;
  
  const contactFields = ["first_name", "last_name", "username", "email", "phone_number", "country"];
  const statusFields = ["is_locked", "is_deleted"];
  
  const excludeFromAdditional = new Set([
    "profile_picture", "profile_pic_url", "id", "_id", "role_id", "updated_at", "created_at", "password",
    "rating_count", "rating_sum", "rating", "is_verified", "is_online", "subscription", "categories", "bio",
    "hourly_rate", ...contactFields, ...statusFields
  ]);

  const additionalFields = Object.entries(row).filter(([key]) => !excludeFromAdditional.has(key));

  if (isEditing) {
    return (
      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border-2 border-blue-300">
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-2 text-blue-700">
            <FiEdit2 />
            <span className="font-semibold">Edit Mode</span>
          </div>
          <span className="text-xs text-blue-600">Edit the fields below and click Save</span>
        </div>
        
        <div className="space-y-6">
          {/* Profile Image Section */}
          {(row.profile_picture || row.profile_pic_url || isEditing) && (
            <section>
              <h5 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3">Profile Image</h5>
              <ProfileImage 
                src={editData.profile_pic_url || row.profile_pic_url || row.profile_picture} 
                alt={editData.first_name || row.first_name || "Profile"}
                isEditing={true}
                onImageChange={(val) => onEditChange('profile_pic_url', val)}
              />
            </section>
          )}

          {/* Contact Information */}
          <section>
            <h5 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3 pb-2 border-b border-blue-200">Contact Information</h5>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {formFields
                .filter(f => ['first_name', 'last_name', 'username', 'phone_number', 'country'].includes(f.key))
                .map((field) => (
                  <EditableField
                    key={field.key}
                    label={field.label}
                    value={editData[field.key] ?? ""}
                    onChange={(val) => onEditChange(field.key, val)}
                    type={field.type}
                    options={field.options}
                  />
                ))}
            </div>
          </section>

          {/* Bio Section */}
          {formFields.find(f => f.key === 'bio') && (
            <section>
              <h5 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3 pb-2 border-b border-blue-200">Biography</h5>
              <EditableField
                label="Bio"
                value={editData.bio ?? ""}
                onChange={(val) => onEditChange('bio', val)}
                type="textarea"
              />
            </section>
          )}

          {/* Other Fields */}
          {formFields.filter(f => !['first_name', 'last_name', 'username', 'phone_number', 'country', 'bio', 'profile_pic_url', 'hourly_rate'].includes(f.key)).length > 0 && (
            <section>
              <h5 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3 pb-2 border-b border-blue-200">Additional Settings</h5>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {formFields
                  .filter(f => !['first_name', 'last_name', 'username', 'phone_number', 'country', 'bio', 'profile_pic_url', 'hourly_rate'].includes(f.key))
                  .map((field) => (
                    <EditableField
                      key={field.key}
                      label={field.label}
                      value={editData[field.key] ?? ""}
                      onChange={(val) => onEditChange(field.key, val)}
                      type={field.type}
                      options={field.options}
                    />
                  ))}
              </div>
            </section>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-slate-50 to-slate-100/50 rounded-xl p-6">
      <div className="grid lg:grid-cols-[280px_1fr] gap-8">
        {/* Sidebar */}
        <div className="space-y-4">
          {(row.profile_picture || row.profile_pic_url) && (
            <ProfileImage src={row.profile_picture || row.profile_pic_url} alt={row.first_name || "Profile"} isEditing={false} />
          )}
          {isFreelancer && row.rating !== undefined && <RatingCard rating={row.rating} count={row.rating_count} />}
          {isFreelancer && row.is_verified !== undefined && <StatusCard label="Verification" isActive={row.is_verified} />}
          {!isFreelancer && row.is_online !== undefined && <StatusCard label="Status" isActive={row.is_online} />}
        </div>

        {/* Main Content */}
        <div className="space-y-6">
          {/* Contact */}
          <section>
            <SectionTitle>Contact Information</SectionTitle>
            <div className="grid md:grid-cols-2 gap-3">
              {contactFields.map(field => row[field] && (
                <InfoItem key={field} label={field.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase())} value={row[field]} />
              ))}
            </div>
          </section>

          {/* Bio */}
          {row.bio && (
            <section>
              <SectionTitle>Biography</SectionTitle>
              <Card className="p-5">
                <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line">{row.bio}</p>
              </Card>
            </section>
          )}

          {/* Subscription */}
          {isFreelancer && row.subscription && (
            <section>
              <SectionTitle>Subscription</SectionTitle>
              <SubscriptionCard subscription={row.subscription} />
            </section>
          )}

          {/* Categories */}
          {isFreelancer && row.categories?.length > 0 && (
            <section>
              <SectionTitle>Specializations</SectionTitle>
              <Card className="p-5">
                <div className="flex flex-wrap gap-2">
                  {row.categories.map((cat) => <CategoryBadge key={cat.id} name={cat.name} />)}
                </div>
              </Card>
            </section>
          )}

          {/* Account Status */}
          <section>
            <SectionTitle>Account Status</SectionTitle>
            <div className="grid md:grid-cols-3 gap-3">
              {isFreelancer && row.is_online !== undefined && (
                <StatusCard label="Online" isActive={row.is_online} />
              )}
              {statusFields.map(field => row[field] !== undefined && (
                <InfoItem key={field} label={field.replace(/_/g, " ").replace("is ", "").replace(/\b\w/g, l => l.toUpperCase())} value={row[field]} />
              ))}
            </div>
          </section>

          {/* Additional */}
          {additionalFields.length > 0 && (
            <section>
              <SectionTitle>Additional Information</SectionTitle>
              <div className="grid md:grid-cols-2 gap-3">
                {additionalFields.map(([key, value]) => (
                  <InfoItem key={key} label={key.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase())} value={value} />
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
// Table Components
// ============================================================================
const ActionButtons = ({ onEdit, onDelete, onSave, onCancelEdit, isEditing, renderCustomActions, hideCrudActions }) => {
  if (renderCustomActions) return renderCustomActions;
  if (hideCrudActions) return null;

  if (isEditing) {
    return (
      <>
        <button onClick={onSave} className="inline-flex items-center gap-1 justify-center rounded-xl px-3 py-2 text-white bg-green-600 hover:bg-green-700 transition-colors" title="Save">
          <FiSave size={16} />
          <span className="text-xs">Save</span>
        </button>
        <button onClick={onCancelEdit} className="inline-flex items-center gap-1 justify-center rounded-xl px-3 py-2 text-white bg-slate-500 hover:bg-slate-600 transition-colors" title="Cancel">
          <FiXCircle size={16} />
          <span className="text-xs">Cancel</span>
        </button>
      </>
    );
  }

  return (
    <>
      <button onClick={onEdit} className="inline-flex items-center justify-center rounded-xl px-3 py-2 text-white hover:opacity-90 transition-opacity" style={{ backgroundColor: PRIMARY_COLOR }} title="Edit">
        <FiEdit2 size={16} />
      </button>
      <button onClick={onDelete} className="inline-flex items-center justify-center rounded-xl px-3 py-2 text-white bg-red-500 hover:bg-red-600 transition-colors" title="Delete">
        <FiTrash2 size={16} />
      </button>
    </>
  );
};

const DesktopTable = ({ columns, rows, loading, error, expandedRow, editingRow, editData, onToggleExpand, onEdit, onDelete, onSave, onCancelEdit, onEditChange, formFields }) => {
  const headers = [...columns.map((c) => c.label), ""];

  return (
    <div className="hidden lg:block rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
      <div className="w-full overflow-x-auto">
        <table className="w-full">
          <thead className="bg-slate-50 text-slate-600 text-sm border-b border-slate-200">
            <tr>
              <th className="w-10 px-4 py-3"></th>
              {headers.map((header, i) => (
                <th key={i} className={`text-left font-semibold px-4 py-3 whitespace-nowrap ${i === headers.length - 1 ? "text-right w-[180px]" : ""}`}>
                  {header}
                </th>
              ))}
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-200 text-slate-800">
            {loading && (
              <tr>
                <td colSpan={headers.length + 1} className="px-6 py-10 text-center text-slate-500">Loading...</td>
              </tr>
            )}

            {!loading && error && (
              <tr>
                <td colSpan={headers.length + 1} className="px-6 py-10 text-center text-red-600">{error}</td>
              </tr>
            )}

            {!loading && !error && rows.length === 0 && (
              <tr>
                <td colSpan={headers.length + 1} className="px-6 py-10 text-center text-slate-500">No data yet</td>
              </tr>
            )}

            {!loading &&
              !error &&
              rows.map((row, idx) => {
                const isExpanded = expandedRow === idx;
                const isEditing = editingRow === idx;
                const rowId = row.id ?? idx;

                return (
                  <>
                    <tr key={rowId} className="hover:bg-slate-50 transition-colors">
                      <td className="px-4 py-3">
                        <button onClick={() => onToggleExpand(idx)} className="text-slate-600 hover:text-slate-800 transition-colors">
                          {isExpanded ? <FiChevronDown size={18} /> : <FiChevronRight size={18} />}
                        </button>
                      </td>

                      {columns.map((col, j) => (
                        <td
                          key={col.key}
                          className={`px-4 py-3 ${j === 0 ? "font-medium" : ""} whitespace-nowrap cursor-pointer`}
                          onClick={() => onToggleExpand(idx)}
                          title={col.key === "categories" ? "" : String(row[col.key] ?? "")}
                        >
                          <div className="max-w-[200px] truncate">
                            {col.render ? col.render(row) : formatValue(row[col.key])}
                          </div>
                        </td>
                      ))}

                      <td className="px-4 py-3 text-right whitespace-nowrap">
                        <div className="flex items-center gap-2 justify-end">
                          <ActionButtons
                            onEdit={() => onEdit(idx)}
                            onDelete={() => onDelete(idx)}
                            onSave={() => onSave(idx)}
                            onCancelEdit={() => onCancelEdit()}
                            isEditing={isEditing}
                          />
                        </div>
                      </td>
                    </tr>

                    {isExpanded && (
                      <tr className="bg-slate-50">
                        <td colSpan={headers.length + 1} className="px-4 py-4">
                          <RowDetails 
                            row={row} 
                            isEditing={isEditing}
                            editData={editData}
                            onEditChange={onEditChange}
                            formFields={formFields}
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
    </div>
  );
};

const MobileCards = ({ title, columns, rows, loading, error, onEdit, onDelete }) => {
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
                      {formatValue(row[firstCol.key])}
                    </div>

                    <div className="mt-1.5 grid grid-cols-2 gap-x-3 gap-y-1">
                      {restCols.slice(0, 6).map((col) => (
                        <div key={col.key} className="min-w-0">
                          <div className="text-[11px] text-slate-500 truncate">{col.label}</div>
                          <div className="text-xs text-slate-800">
                            {col.key === "categories" && col.render ? (
                              col.render(row)
                            ) : (
                              <span className="truncate block">{formatValue(row[col.key])}</span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button onClick={() => onEdit(idx)} className="inline-flex h-9 w-9 items-center justify-center rounded-xl text-white hover:opacity-90 transition-opacity" style={{ backgroundColor: PRIMARY_COLOR }} title="Edit">
                      <FiEdit2 />
                    </button>
                    <button onClick={() => onDelete(idx)} className="inline-flex h-9 w-9 items-center justify-center rounded-xl text-white bg-red-500 hover:bg-red-600 transition-colors" title="Delete">
                      <FiTrash2 />
                    </button>
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
  token
}) {
  const api = useApi(token);

  // State Management
  const [searchQuery, setSearchQuery] = useState("");
  const [chipValue, setChipValue] = useState("");
  const [filterValues, setFilterValues] = useState({});
  const [refreshKey, setRefreshKey] = useState(0);
  const [expandedRow, setExpandedRow] = useState(null);
  const [editingRow, setEditingRow] = useState(null);
  const [editData, setEditData] = useState({});
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({});
  const [loadingEdit, setLoadingEdit] = useState(false);

  // Fetch table data
  const { rows, setRows, loading, error } = useTableData({
    endpoint,
    api,
    searchQuery,
    chipValue,
    chipField,
    filterValues,
    refreshKey
  });

  const tableColumns = columns?.length
    ? columns
    : [
        { label: "Name", key: "name" },
        { label: "Role", key: "role" },
        { label: "Dept", key: "dept" },
        { label: "City", key: "city" }
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

  // Event Handlers
  const handleAddNew = useCallback(() => {
    setFormData(createEmptyForm());
    setIsModalOpen(true);
  }, [createEmptyForm]);

  const handleEdit = useCallback((idx) => {
    const row = rows[idx];
    if (!row) return;

    // Create a complete copy of the row data for editing
    const editableData = {
      first_name: row.first_name || '',
      last_name: row.last_name || '',
      username: row.username || '',
      phone_number: row.phone_number || '',
      country: row.country || '',
      bio: row.bio || '',
      profile_pic_url: row.profile_pic_url || row.profile_picture || '',
      is_verified: row.is_verified || false,
      is_locked: row.is_locked || false
    };

    console.log('Starting edit with data:', editableData);

    setEditingRow(idx);
    setEditData(editableData);
    
    // Auto-expand if not already expanded
    if (expandedRow !== idx) {
      setExpandedRow(idx);
    }
  }, [rows, expandedRow]);

  const handleCancelEdit = useCallback(() => {
    setEditingRow(null);
    setEditData({});
  }, []);

  const handleSave = useCallback(async (idx) => {
    const row = rows[idx];
    if (!row) return;

    // Check if token exists
    if (!token) {
      alert("Authentication required. Please log in again.");
      return;
    }

    try {
      if (endpoint && row?.id != null) {
        // Filter out readonly/sensitive fields
        const fieldsToExclude = new Set([
          'id', '_id', 'role_id', 'created_at', 'updated_at', 
          'rating', 'rating_sum', 'rating_count', 
          'categories', 'subscription', 'profile_picture', 'profile_pic_url'
        ]);
        
        // Only send fields that are in formFields
        const allowedFields = new Set(formFields.map(f => f.key));
        
        const cleanedData = Object.entries(editData).reduce((acc, [key, value]) => {
          if (allowedFields.has(key) && !fieldsToExclude.has(key)) {
            // Don't send empty password field
            if (key === 'password' && !value) {
              return acc;
            }
            acc[key] = value;
          }
          return acc;
        }, {});

        console.log('Sending update data:', cleanedData); // Debug log
        console.log('Using token:', token ? 'Token exists' : 'No token'); // Debug token

        const updatePath = getOnePath ? getOnePath(row.id) : `/admUser/${row.id}`;
        
        // Make sure we're using the API instance with the token
        const response = await api.put(updatePath, cleanedData, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        console.log('Update successful:', response.data);
      }
      
      setEditingRow(null);
      setEditData({});
      refresh();
    } catch (err) {
      console.error('Update error:', err);
      console.error('Status:', err.response?.status);
      console.error('Response data:', err.response?.data);
      
      const errorMsg = err.response?.data?.message || err.message;
      
      if (err.response?.status === 403) {
        alert(`Access Denied: ${errorMsg}\n\nThis might be a permission issue. Make sure you're logged in as an admin.`);
      } else {
        alert(`Failed to save changes: ${errorMsg}`);
      }
    }
  }, [rows, endpoint, api, editData, refresh, getOnePath, formFields, token]);

  const handleEditChange = useCallback((key, value) => {
    setEditData((prev) => ({ ...prev, [key]: value }));
  }, []);

  const handleDelete = useCallback(
    async (idx) => {
      const row = rows[idx];
      if (!row || !window.confirm("Are you sure you want to delete this record?")) return;

      try {
        if (endpoint && row?.id != null) {
          await api.delete(`${endpoint}/${row.id}`);
        }
        refresh();
      } catch (err) {
        console.error(err);
        alert("Failed to delete this record");
      }
    },
    [rows, endpoint, api, refresh]
  );

  const handleModalSubmit = useCallback(
    async (e) => {
      e.preventDefault();

      if (!String(formData.first_name ?? formData.name ?? "").trim()) {
        return;
      }

      try {
        if (!endpoint) {
          setRows((prev) => [...prev, { id: crypto.randomUUID(), ...formData }]);
          setIsModalOpen(false);
          return;
        }

        await api.post(endpoint, formData);
        setIsModalOpen(false);
        refresh();
      } catch (err) {
        console.error(err);
        alert("Failed to save the data");
      }
    },
    [formData, endpoint, api, refresh, setRows]
  );

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
    setExpandedRow((current) => (current === idx ? null : idx));
    // Cancel editing if collapsing
    if (expandedRow === idx) {
      setEditingRow(null);
      setEditData({});
    }
  }, [expandedRow]);

  return (
    <div className="space-y-4 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-slate-800">{title}</h1>
        <button
          onClick={handleAddNew}
          className="inline-flex items-center gap-2 rounded-xl px-4 py-2 shadow-sm text-white hover:opacity-90 transition-opacity"
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
        {filters.length > 0 && (
          <FilterBar
            filters={filters}
            filterValues={filterValues}
            onFilterChange={handleFilterChange}
            onReset={handleResetFilters}
          />
        )}
      </div>

      {/* Mobile View */}
      <MobileCards
        title={title}
        columns={tableColumns}
        rows={rows}
        loading={loading}
        error={error}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      {/* Desktop View */}
      <DesktopTable
        columns={tableColumns}
        rows={rows}
        loading={loading}
        error={error}
        expandedRow={expandedRow}
        editingRow={editingRow}
        editData={editData}
        onToggleExpand={handleToggleExpand}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onSave={handleSave}
        onCancelEdit={handleCancelEdit}
        onEditChange={handleEditChange}
        formFields={formFields}
      />

      {/* Add Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4">
          <div className="w-full max-w-2xl rounded-2xl border border-slate-200 bg-white p-6 shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-slate-800">Add {title}</h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="h-9 w-9 grid place-items-center rounded-lg hover:bg-slate-100 text-slate-600"
              >
                <FiX />
              </button>
            </div>

            <form onSubmit={handleModalSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {formFields.map((field) => (
                  <div key={field.key} className={field.type === "textarea" ? "sm:col-span-2" : ""}>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      {field.label}
                    </label>
                    {field.type === "textarea" ? (
                      <textarea
                        value={formData[field.key] ?? ""}
                        onChange={(e) => handleFormChange(field.key, e.target.value)}
                        placeholder={field.placeholder}
                        className="w-full rounded-xl border border-slate-300 px-3 py-2 outline-none focus:ring-2 focus:ring-slate-300 text-slate-800"
                        rows={4}
                        required={field.required}
                      />
                    ) : field.type === "select" ? (
                      <select
                        value={formData[field.key] ?? ""}
                        onChange={(e) => handleFormChange(field.key, e.target.value)}
                        className="w-full rounded-xl border border-slate-300 px-3 py-2 outline-none focus:ring-2 focus:ring-slate-300 text-slate-800"
                        required={field.required}
                      >
                        <option value="">{field.placeholder || "Choose…"}</option>
                        {field.options?.map((opt) =>
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
                    ) : (
                      <input
                        type={field.type || "text"}
                        value={formData[field.key] ?? ""}
                        onChange={(e) => handleFormChange(field.key, e.target.value)}
                        placeholder={field.placeholder}
                        className="w-full rounded-xl border border-slate-300 px-3 py-2 outline-none focus:ring-2 focus:ring-slate-300 text-slate-800"
                        required={field.required}
                      />
                    )}
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
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
      )}
    </div>
  );
}