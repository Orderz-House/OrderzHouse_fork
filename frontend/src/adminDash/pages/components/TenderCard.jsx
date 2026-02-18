import React from "react";
import { Eye, FileText, Archive, Trash2, Edit } from "lucide-react";

const cx = (...a) => a.filter(Boolean).join(" ");

// Format currency (JD)
const formatJD = (value, { noDecimals = false } = {}) => {
  if (value == null || value === "") return "—";
  const num = Number(value);
  if (isNaN(num)) return "—";
  if (noDecimals && num % 1 === 0) {
    return `${num} JD`;
  }
  return `${num.toFixed(2)} JD`;
};

// Format budget range
const formatBudget = (tender) => {
  if (tender.budget_min && tender.budget_max) {
    return `${formatJD(tender.budget_min, { noDecimals: true })} - ${formatJD(tender.budget_max, { noDecimals: true })}`;
  }
  if (tender.budget_min) {
    return `From ${formatJD(tender.budget_min, { noDecimals: true })}`;
  }
  if (tender.budget_max) {
    return `Up to ${formatJD(tender.budget_max, { noDecimals: true })}`;
  }
  return "—";
};

// Format date
const formatDate = (dateString) => {
  if (!dateString) return "—";
  try {
    return new Date(dateString).toLocaleDateString();
  } catch {
    return dateString;
  }
};

// Status badge colors
const getStatusBadge = (status) => {
  const statusLower = (status || "").toLowerCase();
  if (statusLower === "published") {
    return "bg-green-100 text-green-800 border-green-200";
  }
  if (statusLower === "stored") {
    return "bg-blue-100 text-blue-800 border-blue-200";
  }
  if (statusLower === "archived") {
    return "bg-slate-100 text-slate-800 border-slate-200";
  }
  return "bg-amber-100 text-amber-800 border-amber-200";
};

export default function TenderCard({
  tender,
  onView,
  onEdit,
  onPublish,
  onUnpublish,
  onArchive,
  onDelete,
  activeTab,
}) {
  const statusBadgeClass = getStatusBadge(tender.status);

  return (
    <div
      className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow overflow-hidden cursor-pointer flex flex-col"
      style={{ minHeight: "380px" }}
      onClick={() => onView(tender)}
    >
      {/* Cover/Header Area */}
      <div className="relative h-[140px] w-full overflow-hidden bg-gradient-to-b from-orange-400 to-red-500 shrink-0">
        <div className="absolute inset-0 bg-gradient-to-b from-orange-400 to-red-500" />
        <div className="absolute top-3 left-3">
          <span
            className={cx(
              "inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-semibold uppercase tracking-wide border",
              statusBadgeClass
            )}
          >
            {tender.status ? tender.status.charAt(0).toUpperCase() + tender.status.slice(1) : "—"}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 flex flex-col flex-1">
        {/* Title */}
        <h3
          className="text-sm font-extrabold text-slate-900 mb-2 line-clamp-2"
          style={{ wordBreak: "break-word", overflowWrap: "anywhere" }}
        >
          {tender.title || "Untitled Tender"}
        </h3>

        {/* Category */}
        {tender.category_name && (
          <div className="mb-2">
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-orange-100 text-orange-800">
              {tender.category_name}
            </span>
          </div>
        )}

        {/* Budget */}
        <div className="mb-2">
          <span className="text-xs font-semibold text-slate-900">{formatBudget(tender)}</span>
        </div>

        {/* Created Date */}
        {tender.created_at && (
          <div className="mb-2">
            <span className="text-[10px] text-slate-500">{formatDate(tender.created_at)}</span>
          </div>
        )}

        {/* Description preview */}
        {tender.description && (
          <p
            className="text-xs text-slate-600 line-clamp-2 mb-3 flex-1"
            style={{ wordBreak: "break-word", overflowWrap: "anywhere" }}
          >
            {tender.description}
          </p>
        )}

        {/* Actions Footer */}
        <div className="mt-auto pt-3 border-t border-slate-100 shrink-0">
          <div className="flex items-center gap-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onView(tender);
              }}
              className="flex-1 inline-flex items-center justify-center gap-1.5 h-8 px-3 rounded-lg text-xs font-semibold bg-slate-50 text-slate-700 border border-slate-200 hover:bg-slate-100 transition"
              title="View"
            >
              <Eye className="w-3.5 h-3.5" />
              View
            </button>
            {onEdit && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit(tender);
                }}
                className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition"
                title="Edit"
              >
                <Edit className="w-4 h-4" />
              </button>
            )}
            {activeTab === "stored" && onPublish && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onPublish(tender);
                }}
                className="p-2 text-green-600 hover:text-green-700 hover:bg-green-50 rounded-lg transition"
                title="Publish"
              >
                <FileText className="w-4 h-4" />
              </button>
            )}
            {activeTab === "published" && onUnpublish && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onUnpublish(tender);
                }}
                className="p-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition"
                title="Unpublish"
              >
                <Archive className="w-4 h-4" />
              </button>
            )}
            {tender.status !== "archived" && onArchive && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onArchive(tender);
                }}
                className="p-2 text-orange-600 hover:text-orange-700 hover:bg-orange-50 rounded-lg transition"
                title="Archive"
              >
                <Archive className="w-4 h-4" />
              </button>
            )}
            {onDelete && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(tender);
                }}
                className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition"
                title="Delete"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
