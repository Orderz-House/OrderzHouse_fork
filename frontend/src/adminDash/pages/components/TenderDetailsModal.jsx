import React from "react";
import {
  X,
  FileText,
  Calendar,
  Globe,
  DollarSign,
  Clock,
  Package,
  Hash,
  Download,
  ExternalLink,
  Edit,
  Archive,
  Trash2,
  Loader2,
} from "lucide-react";

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

// Format date
const formatDate = (dateString) => {
  if (!dateString) return "—";
  try {
    return new Date(dateString).toLocaleString();
  } catch {
    return dateString;
  }
};

// Format date only
const formatDateOnly = (dateString) => {
  if (!dateString) return "—";
  try {
    return new Date(dateString).toLocaleDateString();
  } catch {
    return dateString;
  }
};

// Format value or show dash
const formatValue = (value) => {
  if (value === null || value === undefined || value === "") return "—";
  return value;
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

export default function TenderDetailsModal({
  tender,
  onClose,
  onEdit,
  onPublish,
  onUnpublish,
  onArchive,
  onDelete,
  updating = false,
}) {
  if (!tender) return null;

  const statusBadgeClass = getStatusBadge(tender.status);
  const attachments = Array.isArray(tender.attachments) ? tender.attachments : [];
  const metadata = tender.metadata && typeof tender.metadata === "object" ? tender.metadata : {};

  // Normalize skills to array of strings
  const normalizeSkills = (skills) => {
    if (!skills) return [];
    if (Array.isArray(skills)) {
      return skills.map((s) => (typeof s === "string" ? s : s?.name || s?.skill || String(s))).filter(Boolean);
    }
    if (typeof skills === "string") {
      try {
        const parsed = JSON.parse(skills);
        if (Array.isArray(parsed)) return parsed;
      } catch {
        // If not JSON, treat as comma-separated
        return skills.split(",").map((s) => s.trim()).filter(Boolean);
      }
    }
    return [];
  };

  const skills = normalizeSkills(metadata?.skills || tender.skills);

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div
        className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-slate-200 p-6 z-10">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <h3
                className="text-xl font-extrabold text-slate-900 mb-3"
                style={{ wordBreak: "break-word", overflowWrap: "anywhere" }}
              >
                {formatValue(tender.title)}
              </h3>
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <span
                  className={cx(
                    "inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold uppercase tracking-wide border",
                    statusBadgeClass
                  )}
                >
                  {tender.status
                    ? tender.status.charAt(0).toUpperCase() + tender.status.slice(1)
                    : "—"}
                </span>
              </div>
              <div className="text-xs text-slate-500">
                <span>Tender ID: #{tender.id}</span>
                {tender.created_by && (
                  <>
                    <span className="mx-2">•</span>
                    <span>Created by: #{tender.created_by}</span>
                  </>
                )}
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 grid place-items-center rounded-full hover:bg-slate-100 text-slate-600 shrink-0"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6 max-h-[calc(90vh-200px)] overflow-y-auto">
          {/* Description */}
          {tender.description && (
            <div>
              <h4 className="text-sm font-semibold text-slate-900 mb-2 flex items-center gap-2">
                <FileText className="w-4 h-4" />
                Description
              </h4>
              <p
                className="text-sm text-slate-600 whitespace-pre-wrap leading-relaxed"
                style={{ wordBreak: "break-word", overflowWrap: "anywhere" }}
              >
                {formatValue(tender.description)}
              </p>
            </div>
          )}

          {/* Details Grid - Two Column Layout */}
          <div className="grid md:grid-cols-2 gap-6 pt-6 border-t border-slate-200">
            {/* Category */}
            <div>
              <h4 className="text-xs font-semibold text-slate-500 uppercase mb-1 flex items-center gap-2">
                <Package className="w-3 h-3" />
                Category
              </h4>
              <p className="text-slate-900">{formatValue(tender.category_name)}</p>
              {tender.sub_category_name && (
                <p className="text-sm text-slate-600 mt-1">Sub: {tender.sub_category_name}</p>
              )}
              {tender.sub_sub_category_name && (
                <p className="text-sm text-slate-600 mt-1">Sub-Sub: {tender.sub_sub_category_name}</p>
              )}
            </div>

            {/* Country */}
            <div>
              <h4 className="text-xs font-semibold text-slate-500 uppercase mb-1 flex items-center gap-2">
                <Globe className="w-3 h-3" />
                Country
              </h4>
              <p className="text-slate-900">{formatValue(tender.country)}</p>
            </div>

            {/* Budget Range */}
            <div>
              <h4 className="text-xs font-semibold text-slate-500 uppercase mb-1 flex items-center gap-2">
                <DollarSign className="w-3 h-3" />
                Budget Range
              </h4>
              <p className="text-slate-900">
                {tender.budget_min && tender.budget_max
                  ? `${formatJD(tender.budget_min)} - ${formatJD(tender.budget_max)} ${formatValue(tender.currency || "JD")}`
                  : "—"}
              </p>
            </div>

            {/* Duration */}
            <div>
              <h4 className="text-xs font-semibold text-slate-500 uppercase mb-1 flex items-center gap-2">
                <Clock className="w-3 h-3" />
                Duration
              </h4>
              <p className="text-slate-900">
                {tender.duration_value && tender.duration_unit
                  ? `${tender.duration_value} ${tender.duration_unit}`
                  : "—"}
              </p>
            </div>

            {/* Created At */}
            <div>
              <h4 className="text-xs font-semibold text-slate-500 uppercase mb-1 flex items-center gap-2">
                <Calendar className="w-3 h-3" />
                Created At
              </h4>
              <p className="text-slate-900">{formatDate(tender.created_at)}</p>
            </div>

            {/* Updated At */}
            <div>
              <h4 className="text-xs font-semibold text-slate-500 uppercase mb-1 flex items-center gap-2">
                <Calendar className="w-3 h-3" />
                Updated At
              </h4>
              <p className="text-slate-900">{formatDate(tender.updated_at)}</p>
            </div>

            {/* Closing Date */}
            {tender.closing_date && (
              <div>
                <h4 className="text-xs font-semibold text-slate-500 uppercase mb-1 flex items-center gap-2">
                  <Calendar className="w-3 h-3" />
                  Closing Date
                </h4>
                <p className="text-slate-900">{formatDateOnly(tender.closing_date)}</p>
              </div>
            )}

            {/* Creator */}
            {tender.creator_name && (
              <div>
                <h4 className="text-xs font-semibold text-slate-500 uppercase mb-1">Created By</h4>
                <p className="text-slate-900">{formatValue(tender.creator_name)}</p>
                {tender.creator_email && (
                  <p className="text-sm text-slate-600 mt-1">{tender.creator_email}</p>
                )}
              </div>
            )}
          </div>

          {/* Skills Section */}
          {skills.length > 0 && (
            <div className="pt-6 border-t border-slate-200">
              <h4 className="text-xs font-semibold text-slate-500 uppercase mb-3 flex items-center gap-2">
                <Package className="w-4 h-4" />
                Skills
              </h4>
              <div className="flex flex-wrap gap-2">
                {skills.map((skill, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-700"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Attachments Section */}
          <div className="pt-6 border-t border-slate-200">
            <h4 className="text-xs font-semibold text-slate-500 uppercase mb-3 flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Attachments
            </h4>
            {attachments.length > 0 ? (
              <div className="space-y-2">
                {attachments.map((attachment, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-2 p-3 bg-slate-50 rounded-lg border border-slate-200"
                  >
                    {attachment.url ? (
                      <a
                        href={attachment.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 flex items-center gap-2 text-blue-600 hover:text-blue-800 underline"
                      >
                        <FileText className="w-4 h-4 shrink-0" />
                        <span className="truncate">
                          {attachment.name || attachment.filename || `Attachment ${index + 1}`}
                        </span>
                        <ExternalLink className="w-4 h-4 shrink-0" />
                      </a>
                    ) : (
                      <span className="flex-1 flex items-center gap-2 text-slate-700">
                        <FileText className="w-4 h-4 shrink-0" />
                        <span className="truncate">
                          {attachment.name || attachment.filename || `Attachment ${index + 1}`}
                        </span>
                      </span>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-slate-500 italic">No attachments</p>
            )}
          </div>

          {/* Metadata Section */}
          {Object.keys(metadata).length > 0 && (
            <div className="pt-6 border-t border-slate-200">
              <h4 className="text-xs font-semibold text-slate-500 uppercase mb-3 flex items-center gap-2">
                <Hash className="w-4 h-4" />
                Metadata
              </h4>
              <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                <div className="space-y-1">
                  {Object.entries(metadata).map(([key, value]) => (
                    <div key={key} className="flex items-start gap-2">
                      <span className="text-xs font-semibold text-slate-600 min-w-[120px]">
                        {key}:
                      </span>
                      <span className="text-xs text-slate-900 break-words">
                        {typeof value === "object" ? JSON.stringify(value, null, 2) : String(value)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="sticky bottom-0 bg-white border-t border-slate-200 p-4">
          <div className="flex items-center gap-3 flex-wrap">
            {onEdit && (
              <button
                onClick={onEdit}
                disabled={updating}
                className="inline-flex items-center gap-2 px-4 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-700 disabled:opacity-50 transition"
              >
                <Edit className="w-4 h-4" />
                Edit
              </button>
            )}
            {tender.status === "stored" && onPublish && (
              <button
                onClick={onPublish}
                disabled={updating}
                className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition"
              >
                {updating ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <FileText className="w-4 h-4" />
                )}
                Publish
              </button>
            )}
            {tender.status === "published" && onUnpublish && (
              <button
                onClick={onUnpublish}
                disabled={updating}
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition"
              >
                {updating ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Archive className="w-4 h-4" />
                )}
                Unpublish
              </button>
            )}
            {tender.status !== "archived" && tender.status !== "active" && tender.status !== "expired" && onArchive && (
              <button
                onClick={onArchive}
                disabled={updating}
                className="inline-flex items-center gap-2 px-4 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-700 disabled:opacity-50 transition"
              >
                {updating ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Archive className="w-4 h-4" />
                )}
                Archive
              </button>
            )}
            {onDelete && (
              <button
                onClick={onDelete}
                disabled={updating}
                className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 transition"
              >
                {updating ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Trash2 className="w-4 h-4" />
                )}
                Delete
              </button>
            )}
            <button
              onClick={onClose}
              className="inline-flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition ml-auto"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
