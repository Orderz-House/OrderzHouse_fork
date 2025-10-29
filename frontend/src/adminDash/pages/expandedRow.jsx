// expandedRow.jsx
import { useState } from "react";
import { FiEdit2, FiTrash2, FiCheck, FiX } from "react-icons/fi";

const PRIMARY = "#028090";
const TEAL_PALETTE = {
  base: "#028090",
  dark: "#026873",
  mid: "#0393A6",
  light: "#34C6D8",
  faint: "rgba(2,128,144,0.12)",
  border: "rgba(2,128,144,0.20)",
  ring: "rgba(2,128,144,0.22)",
};

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

  const baseInputClass =
    "w-full rounded-xl px-3.5 py-2 text-[13.5px] bg-white/70 backdrop-blur-sm " +
    "outline-none transition-shadow focus:ring-2 placeholder-slate-400";
  const baseInputStyle = {
    border: `1px solid ${TEAL_PALETTE.border}`,
    boxShadow: "inset 0 1px 0 rgba(255,255,255,0.6)",
  };

  const renderFormInput = (field) => {
    const value = formData[field.key] ?? "";

    if (field.type === "textarea") {
      return (
        <textarea
          value={value}
          onChange={(e) => handleFieldChange(field.key, e.target.value)}
          placeholder={field.placeholder}
          className={baseInputClass}
          style={baseInputStyle}
          rows={3}
        />
      );
    }

    if (field.type === "select") {
      return (
        <select
          value={value}
          onChange={(e) => handleFieldChange(field.key, e.target.value)}
          className={baseInputClass}
          style={baseInputStyle}
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
        className={baseInputClass}
        style={baseInputStyle}
      />
    );
  };

  return (
    <div
      className="relative p-4 md:p-5 rounded-2xl shadow-xl space-y-4 md:space-y-5 text-[13.5px] sm:text-[14px]"
      style={{
        background:
          "linear-gradient(180deg, rgba(2,128,144,0.06) 0%, rgba(2,128,144,0.03) 100%)",
        borderColor: TEAL_PALETTE.border,
      }}
    >
     
      {/* Content */}
      {isEditing && formFields?.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
          {formFields.map((field) => (
            <div
              key={field.key}
              className={field.type === "textarea" ? "sm:col-span-2 lg:col-span-3" : ""}
            >
              <label
                className="block mb-1.5 text-[11.5px] font-semibold tracking-wide"
                style={{ color: TEAL_PALETTE.dark }}
              >
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
                    <span
                      className="text-[11.5px] font-semibold min-w-[90px]"
                      style={{ color: TEAL_PALETTE.dark }}
                    >
                      {col.label}:
                    </span>
                  )}
                  <span className="text-[13.5px] text-slate-800 flex-1 break-words whitespace-normal">
                    {renderValue(col)}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Actions */}
      <div
        className="flex items-center gap-2 pt-3"
        style={{
          borderTop: `1px solid ${TEAL_PALETTE.border}`,
        }}
      >
        {isEditing ? (
          <>
            {/* Save (filled gradient) */}
            <button
              onClick={handleSave}
              className="h-9 px-3 rounded-full inline-flex items-center gap-2 text-sm font-medium text-white shadow-sm hover:shadow-md transition"
              style={{
                background: `linear-gradient(135deg, ${TEAL_PALETTE.base} 0%, ${TEAL_PALETTE.mid} 60%, ${TEAL_PALETTE.dark} 100%)`,
                boxShadow:
                  "0 1px 0 rgba(255,255,255,0.3) inset, 0 6px 16px rgba(2,128,144,0.25)",
              }}
              title="Save"
            >
              <FiCheck />
              Save
            </button>

            {/* Cancel (ghost) */}
            <button
              onClick={onCancel}
              className="h-9 px-3 rounded-full border inline-flex items-center gap-2 text-sm transition hover:bg-white/60"
              style={{ borderColor: TEAL_PALETTE.border, color: TEAL_PALETTE.dark }}
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
                {/* Edit (ghost, teal outline) */}
                <button
                  onClick={() =>
                    helpers ? helpers.startEdit(row.id ?? row._id) : null
                  }
                  className="h-9 px-3 rounded-full border inline-flex items-center gap-2 text-sm transition"
                  style={{
                    borderColor: TEAL_PALETTE.border,
                    color: PRIMARY,
                  }}
                  title="Edit"
                >
                  <FiEdit2 />
                  Edit
                </button>

                {/* Delete (subtle danger) */}
                <button
                  onClick={onDelete}
                  className="h-9 px-3 rounded-full border inline-flex items-center gap-2 text-sm text-red-600 hover:bg-red-50 transition"
                  style={{ borderColor: "rgba(220,38,38,0.25)" }}
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
