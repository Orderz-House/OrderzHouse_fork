import { useState, useCallback } from "react";
import { FiEdit2, FiSave, FiXCircle } from "react-icons/fi";

// Editable field component
const EditableField = ({ label, value, onChange, type = "text", options = [] }) => {
  const baseClass = "w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500";

  if (type === "textarea") {
    return (
      <div className="sm:col-span-2">
        <label className="block text-xs font-medium text-slate-600 mb-1">{label}</label>
        <textarea value={value} onChange={e => onChange(e.target.value)} className={baseClass} rows={3} />
      </div>
    );
  }

  if (type === "select") {
    return (
      <div>
        <label className="block text-xs font-medium text-slate-600 mb-1">{label}</label>
        <select value={value} onChange={e => onChange(e.target.value)} className={baseClass}>
          <option value="">Choose…</option>
          {options.map(opt => <option key={opt.value ?? opt} value={opt.value ?? opt}>{opt.label ?? opt}</option>)}
        </select>
      </div>
    );
  }

  return (
    <div>
      <label className="block text-xs font-medium text-slate-600 mb-1">{label}</label>
      <input type={type} value={value} onChange={e => onChange(e.target.value)} className={baseClass} />
    </div>
  );
};

// Profile image component
const ProfileImage = ({ src, onImageChange }) => {
  const [uploadMode, setUploadMode] = useState("url");
  const [preview, setPreview] = useState(src);

  const handleFile = e => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) return alert("Select an image file");
    if (file.size > 5 * 1024 * 1024) return alert("Image max 5MB");

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result;
      setPreview(base64);
      onImageChange(base64);
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="space-y-3">
      {preview && (
        <div className="w-32 h-32 mx-auto">
          <img src={preview} alt="Preview" className="w-full h-full object-cover rounded-lg border-2 border-slate-300" />
        </div>
      )}

      <div className="flex gap-2 justify-center">
        <button className={`px-3 py-1 text-xs rounded-lg ${uploadMode === "url" ? "bg-blue-500 text-white" : "bg-slate-200 text-slate-700"}`} onClick={() => setUploadMode("url")}>URL</button>
        <button className={`px-3 py-1 text-xs rounded-lg ${uploadMode === "upload" ? "bg-blue-500 text-white" : "bg-slate-200 text-slate-700"}`} onClick={() => setUploadMode("upload")}>Upload</button>
      </div>

      {uploadMode === "url" ? (
        <input type="text" value={src || ""} placeholder="Image URL" className="w-full rounded-lg border px-3 py-2" onChange={e => { onImageChange(e.target.value); setPreview(e.target.value); }} />
      ) : (
        <input type="file" accept="image/*" onChange={handleFile} className="w-full text-sm text-slate-500 file:rounded-lg file:bg-blue-50 file:text-blue-700 file:font-semibold" />
      )}
    </div>
  );
};

// ============================================================================
// Main Edit Panel
// ============================================================================
export default function EditPanel({ row, editData, formFields, onEditChange, onSave, onCancel, api, token }) {
  const [saving, setSaving] = useState(false);

  const handleSave = useCallback(async () => {
    if (!api || !token) return alert("API or token missing");

    setSaving(true);

    try {
      // Fields to exclude
      const exclude = ["id", "role_id", "created_at", "updated_at", "profile_picture"];
      const allowedKeys = new Set(formFields.map(f => f.key));

      const dataToSend = Object.entries(editData).reduce((acc, [k, v]) => {
        if (!exclude.includes(k) && allowedKeys.has(k)) acc[k] = v;
        return acc;
      }, {});

      const res = await api.put(`/admUser/${row.id}`, dataToSend, {
        headers: { Authorization: `Bearer ${token}` }
      });

      console.log("Update success:", res.data);
      onSave?.();
    } catch (err) {
      console.error("Update failed:", err);
      alert(err.response?.data?.message || err.message);
    } finally {
      setSaving(false);
    }
  }, [row, editData, formFields, api, token, onSave]);

  return (
    <div className="bg-blue-50 p-6 rounded-xl border-2 border-blue-300">
      <div className="flex justify-between items-center mb-6 text-blue-700">
        <div className="flex items-center gap-2"><FiEdit2 /> <span className="font-semibold">Edit Mode</span></div>
        <span className="text-xs text-blue-600">Edit fields and save</span>
      </div>

      <div className="space-y-6">
        {/* Profile Image */}
        {(row.profile_picture || row.profile_pic_url || editData.profile_pic_url) && (
          <section>
            <h5 className="text-xs font-bold uppercase mb-3">Profile Image</h5>
            <ProfileImage src={editData.profile_pic_url || row.profile_pic_url || row.profile_picture} onImageChange={val => onEditChange("profile_pic_url", val)} />
          </section>
        )}

        {/* Contact Info */}
        <section>
          <h5 className="text-xs font-bold uppercase mb-3 border-b border-blue-200 pb-2">Contact Info</h5>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {formFields.filter(f => ['first_name','last_name','username','phone_number','country'].includes(f.key))
              .map(f => <EditableField key={f.key} label={f.label} value={editData[f.key] ?? ""} onChange={val => onEditChange(f.key,val)} type={f.type} options={f.options} />)}
          </div>
        </section>

        {/* Bio */}
        {formFields.find(f => f.key === 'bio') && (
          <section>
            <h5 className="text-xs font-bold uppercase mb-3 border-b border-blue-200 pb-2">Biography</h5>
            <EditableField label="Bio" value={editData.bio ?? ""} onChange={val => onEditChange('bio', val)} type="textarea" />
          </section>
        )}

        {/* Other fields */}
        {formFields.filter(f => !['first_name','last_name','username','phone_number','country','bio','profile_pic_url'].includes(f.key)).length > 0 && (
          <section>
            <h5 className="text-xs font-bold uppercase mb-3 border-b border-blue-200 pb-2">Additional</h5>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {formFields.filter(f => !['first_name','last_name','username','phone_number','country','bio','profile_pic_url'].includes(f.key))
                .map(f => <EditableField key={f.key} label={f.label} value={editData[f.key] ?? ""} onChange={val => onEditChange(f.key,val)} type={f.type} options={f.options} />)}
            </div>
          </section>
        )}

        {/* Buttons */}
        <div className="flex gap-3 pt-4 border-t border-blue-200">
          <button onClick={handleSave} disabled={saving} className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 disabled:opacity-50">
            <FiSave /> {saving ? "Saving..." : "Save Changes"}
          </button>
          <button onClick={onCancel} disabled={saving} className="flex items-center gap-2 px-4 py-2 bg-slate-500 text-white rounded-xl hover:bg-slate-600 disabled:opacity-50">
            <FiXCircle /> Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
