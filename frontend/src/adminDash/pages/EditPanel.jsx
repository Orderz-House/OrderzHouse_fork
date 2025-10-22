import { useState, useMemo } from "react";
import { FiX, FiSave } from "react-icons/fi";

// Local helpers
const Label = ({ children }) => (
  <span className="block text-xs font-medium text-slate-600 mb-1">{children}</span>
);

const Field = ({ field, value, onChange }) => {
  const base =
    "w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500";

  if (field.type === "textarea") {
    return (
      <div className={field.full ? "sm:col-span-2" : ""}>
        <Label>{field.label}</Label>
        <textarea
          rows={field.rows || 3}
          value={value ?? ""}
          onChange={(e) => onChange(field.key, e.target.value)}
          placeholder={field.placeholder}
          className={base}
        />
      </div>
    );
  }

  if (field.type === "select") {
    return (
      <div>
        <Label>{field.label}</Label>
        <select
          value={value ?? ""}
          onChange={(e) => onChange(field.key, e.target.value)}
          className={base}
        >
          <option value="">{field.placeholder || "Choose…"}</option>
          {(field.options || []).map((opt) =>
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
      </div>
    );
  }

  if (field.type === "boolean") {
    return (
      <div>
        <Label>{field.label}</Label>
        <select
          value={(value === true || value === "true") ? "true" : "false"}
          onChange={(e) => onChange(field.key, e.target.value === "true")}
          className={base}
        >
          <option value="true">Yes</option>
          <option value="false">No</option>
        </select>
      </div>
    );
  }

  return (
    <div>
      <Label>{field.label}</Label>
      <input
        type={field.type || "text"}
        value={value ?? ""}
        onChange={(e) => onChange(field.key, e.target.value)}
        placeholder={field.placeholder}
        className={base}
      />
    </div>
  );
};

function ProfileEditor({ src, onChange }) {
  const [mode, setMode] = useState("url");
  const [preview, setPreview] = useState(src || "");

  const handleFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) return alert("Please select an image file");
    if (file.size > 5 * 1024 * 1024) return alert("Max size 5MB");

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result;
      setPreview(base64);
      onChange("profile_pic_url", base64);
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="space-y-3">
      {preview && (
        <div className="w-28 h-28 rounded-lg overflow-hidden border border-slate-200">
          <img src={preview} alt="Profile" className="w-full h-full object-cover" />
        </div>
      )}

      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => setMode("url")}
          className={`px-3 py-1 text-xs rounded-lg ${mode === "url" ? "bg-blue-500 text-white" : "bg-slate-200 text-slate-700"}`}
        >
          URL
        </button>
        <button
          type="button"
          onClick={() => setMode("upload")}
          className={`px-3 py-1 text-xs rounded-lg ${mode === "upload" ? "bg-blue-500 text-white" : "bg-slate-200 text-slate-700"}`}
        >
          Upload
        </button>
      </div>

      {mode === "url" ? (
        <div>
          <Label>Profile Image URL</Label>
          <input
            type="text"
            value={src || ""}
            onChange={(e) => {
              onChange("profile_pic_url", e.target.value);
              setPreview(e.target.value);
            }}
            placeholder="https://…"
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      ) : (
        <div>
          <Label>Upload Image</Label>
          <input
            type="file"
            accept="image/*"
            onChange={handleFile}
            className="w-full text-sm text-slate-500 file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
          />
          <p className="text-xs text-slate-500 mt-1">Max 5MB (JPG/PNG/GIF)</p>
        </div>
      )}
    </div>
  );
}

/**
 * Reusable Edit Panel (slide-over)
 * - Controlled completely by parent
 * - Renders fields from `formFields`
 * - Works for any table page (Clients, Freelancers, Projects…)
 */
export default function EditPanel({
  isOpen,
  title = "Edit",
  row,
  editData,
  formFields = [],
  onChange,
  onSave,
  onCancel,
  saving = false
}) {
  const importantKeys = useMemo(
    () => new Set(["first_name", "last_name", "username", "phone_number", "country"]),
    []
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60]">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40" onClick={onCancel} />

      {/* Slide-over */}
      <aside className="absolute inset-y-0 right-0 w-full max-w-xl bg-white shadow-2xl border-l border-slate-200 flex flex-col">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-slate-800">{title}</h3>
          <div className="flex items-center gap-2">
            <button
              onClick={onSave}
              disabled={saving}
              className="inline-flex items-center gap-2 rounded-xl px-4 py-2 text-white bg-green-600 hover:bg-green-700 disabled:opacity-60"
              title="Save"
            >
              <FiSave size={16} />
              <span className="text-sm">Save</span>
            </button>
            <button
              onClick={onCancel}
              className="h-9 w-9 grid place-items-center rounded-lg hover:bg-slate-100 text-slate-600"
              title="Close"
            >
              <FiX />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-5 overflow-y-auto space-y-6">
          {/* Profile */}
          {(row?.profile_picture || row?.profile_pic_url || true) && (
            <section className="rounded-xl border border-slate-200 p-4">
              <div className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3">
                Profile Image
              </div>
              <ProfileEditor
                src={editData?.profile_pic_url || row?.profile_pic_url || row?.profile_picture}
                onChange={onChange}
              />
            </section>
          )}

          {/* Important info */}
          <section className="rounded-xl border border-slate-200 p-4">
            <div className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3">
              Contact Information
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {formFields
                .filter((f) => importantKeys.has(f.key))
                .map((f) => (
                  <Field
                    key={f.key}
                    field={f}
                    value={editData?.[f.key]}
                    onChange={onChange}
                  />
                ))}
            </div>
          </section>

          {/* Bio */}
          {formFields.some((f) => f.key === "bio") && (
            <section className="rounded-xl border border-slate-200 p-4">
              <div className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3">
                Biography
              </div>
              <Field
                field={{ key: "bio", label: "Bio", type: "textarea", rows: 4, full: true }}
                value={editData?.bio}
                onChange={onChange}
              />
            </section>
          )}

          {/* The rest of fields (dynamic per page) */}
          {formFields.filter((f) => !["first_name","last_name","username","phone_number","country","bio","profile_pic_url","hourly_rate"].includes(f.key)).length > 0 && (
            <section className="rounded-xl border border-slate-200 p-4">
              <div className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3">
                Additional Settings
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {formFields
                  .filter((f) => !["first_name","last_name","username","phone_number","country","bio","profile_pic_url","hourly_rate"].includes(f.key))
                  .map((f) => (
                    <Field key={f.key} field={f} value={editData?.[f.key]} onChange={onChange} />
                  ))}
              </div>
            </section>
          )}
        </div>
      </aside>
    </div>
  );
}
