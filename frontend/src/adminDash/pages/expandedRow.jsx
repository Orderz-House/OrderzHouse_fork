import { useState } from "react";
import { FiEdit2, FiTrash2, FiCheck, FiX } from "react-icons/fi";

const PRIMARY_COLOR = "#028090";

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

  const handleSave = () => {
    onSave(formData);
  };

  const renderValue = (col) => {
    const val = col.render ? col.render(row) : row[col.key];
    return val ?? "—";
  };

  const renderFormInput = (field) => {
    const baseClassName =
      "w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-slate-300";
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
    <div className="bg-slate-50 p-4 rounded-xl space-y-3 md:space-y-4">
      {isEditing && formFields?.length > 0 ? (
        /* ===== Edit Mode (Grid مرتب لجميع الأحجام) ===== */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {formFields.map((field) => (
            <div
              key={field.key}
              className={field.type === "textarea" ? "sm:col-span-2 lg:col-span-3" : ""}
            >
              <label className="block text-xs font-medium text-slate-600 mb-1.5">
                {field.label}
              </label>
              {renderFormInput(field)}
            </div>
          ))}
        </div>
      ) : (
        /* ===== View Mode (عرض مضغوط وجميل) ===== */
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
                    <span className="text-[12px] font-medium text-slate-500 min-w-[90px]">
                      {col.label}:
                    </span>
                  )}
                  <span className="text-sm text-slate-800 flex-1">{renderValue(col)}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div className="flex items-center gap-2 pt-3 border-t border-slate-200">
        {isEditing ? (
          <>
            <button
              onClick={handleSave}
              className="flex items-center gap-2 rounded-lg px-3 py-2 text-white text-sm font-medium"
              style={{ backgroundColor: PRIMARY_COLOR }}
            >
              <FiCheck />
              Save
            </button>
            <button
              onClick={onCancel}
              className="flex items-center gap-2 rounded-lg px-3 py-2 bg-slate-500 text-white text-sm font-medium hover:bg-slate-600"
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
                <button
                  onClick={() => helpers.startEdit(row.id)}
                  className="flex items-center gap-2 rounded-lg px-3 py-2 text-white text-sm font-medium"
                  style={{ backgroundColor: PRIMARY_COLOR }}
                >
                  <FiEdit2 />
                  Edit
                </button>
                <button
                  onClick={onDelete}
                  className="flex items-center gap-2 rounded-lg px-3 py-2 bg-red-500 text-white text-sm font-medium hover:bg-red-600"
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
