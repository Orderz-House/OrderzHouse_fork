import { useState } from "react";
import { FiEdit2, FiTrash2, FiCheck, FiX } from "react-icons/fi";

const PRIMARY = "#028090";

export default function ExpandedRow({
  row,
  columns,
  formFields,
  onSave,
  onDelete,
  onCancel,
  isEditing,
  renderActions,
  hideCrudActions,
  helpers,
}) {
  const [formData, setFormData] = useState(row);

  const handleFieldChange = (key, value) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = () => onSave(formData);

  const renderValue = (col) => {
    const val = col.render ? col.render(row) : row[col.key];
    return val ?? "—";
  };

  const renderFormInput = (field) => {
    const baseClassName =
      "w-full rounded-lg border border-slate-300 px-3 py-1.5 text-[13px] outline-none focus:ring-2 focus:ring-slate-300";
    const value = formData[field.key] ?? "";

    if (field.type === "textarea") {
      return (
        <textarea
          value={value}
          onChange={(e) => handleFieldChange(field.key, e.target.value)}
          placeholder={field.placeholder}
          className={baseClassName}
          rows={3}
        />
      );
    }

    if (field.type === "select") {
      return (
        <select
          value={value}
          onChange={(e) => handleFieldChange(field.key, e.target.value)}
          className={baseClassName}
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
      );
    }

    return (
      <input
        type={field.type || "text"}
        value={value}
        onChange={(e) => handleFieldChange(field.key, e.target.value)}
        placeholder={field.placeholder}
        className={baseClassName}
      />
    );
  };

  return (
    <div className="bg-slate-50 p-3 md:p-4 rounded-xl space-y-3 md:space-y-4 text-[13.5px] sm:text-[14px]">
      {isEditing && formFields?.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {formFields.map((field) => (
            <div
              key={field.key}
              className={field.type === "textarea" ? "sm:col-span-2 lg:col-span-3" : ""}
            >
              <label className="block text-[11px] font-medium text-slate-600 mb-1.5">
                {field.label}
              </label>
              {renderFormInput(field)}
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-2">
          {columns.map((col) => {
            const onlyValue = !col.label || col.label.trim() === "";
            return (
              <div
                key={col.key}
                className={onlyValue ? "sm:col-span-2 lg:col-span-3" : ""}
              >
                <div className="flex items-start gap-2.5">
                  {!onlyValue && (
                    <span className="text-[11px] font-medium text-slate-500 min-w-[90px]">
                      {col.label}:
                    </span>
                  )}
                  <span className="text-[13px] text-slate-800 flex-1 break-words whitespace-normal">
                    {renderValue(col)}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div className="flex items-center gap-2 pt-3 border-t border-slate-200">
        {isEditing ? (
          <>
            {/* Save: Primary outline مثل New Blog */}
            <button
              onClick={handleSave}
              className="h-9 px-3 rounded-full border inline-flex items-center gap-2 text-sm"
              style={{ borderColor: PRIMARY, color: PRIMARY }}
              title="Save"
            >
              <FiCheck />
              Save
            </button>

            {/* Cancel: نفس Copy/Share */}
            <button
              onClick={onCancel}
              className="h-9 px-3 rounded-full border border-slate-200 hover:bg-slate-50 inline-flex items-center gap-2 text-sm text-slate-700"
              title="Cancel"
            >
              <FiX />
              Cancel
            </button>
          </>
        ) : (
          <>
            {renderActions ? (
              renderActions(row, helpers)
            ) : !hideCrudActions ? (
              <>
                {/* Edit: Primary outline */}
                <button
                  onClick={() =>
                    helpers ? helpers.startEdit(row.id ?? row._id) : null
                  }
                  className="h-9 px-3 rounded-full border inline-flex items-center gap-2 text-sm"
                  style={{ borderColor: PRIMARY, color: PRIMARY }}
                  title="Edit"
                >
                  <FiEdit2 />
                  Edit
                </button>

                {/* Delete: outline لطيف */}
                <button
                  onClick={onDelete}
                  className="h-9 px-3 rounded-full border border-slate-200 hover:bg-red-50 inline-flex items-center gap-2 text-sm text-red-600"
                  title="Delete"
                >
                  <FiTrash2 />
                  Delete
                </button>
              </>
            ) : null}
          </>
        )}
      </div>
    </div>
  );
}
