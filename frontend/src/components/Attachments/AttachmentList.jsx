import React from "react";
import { Paperclip, Image, FileText, File } from "lucide-react";

/**
 * Normalize one attachment to { href, displayName }.
 * Supports URL strings (legacy) and objects from tender vault: { url, name, filename, ... }.
 */
function normalizeAttachmentItem(item) {
  if (item == null) return null;
  if (typeof item === "string") {
    const s = item.trim();
    if (!s) return null;
    return { href: s, displayName: null };
  }
  if (typeof item === "object") {
    const href = String(
      item.url ?? item.path ?? item.file_url ?? item.href ?? ""
    ).trim();
    if (!href) return null;
    const displayName =
      item.name ||
      item.filename ||
      item.originalname ||
      null;
    return { href, displayName };
  }
  return null;
}

/**
 * AttachmentList
 * Reusable display for file attachments.
 *
 * @param {Object} props
 * @param {string|string[]|object[]} props.attachments - URLs, JSON string, or objects with url + optional name.
 * @param {string} [props.title] - Optional title, defaults to "Attachments".
 * @param {boolean} [props.compact] - Optional compact mode (smaller icons).
 */
export default function AttachmentList({ attachments, title = "Attachments", compact = false }) {
  if (!attachments) return null;

  let raw = [];
  if (Array.isArray(attachments)) {
    raw = attachments;
  } else if (typeof attachments === "string") {
    try {
      const parsed = JSON.parse(attachments);
      raw = Array.isArray(parsed) ? parsed : [attachments];
    } catch {
      raw = [attachments];
    }
  }

  const files = raw.map(normalizeAttachmentItem).filter(Boolean);
  if (files.length === 0) return null;

  const getFileIcon = (href) => {
    const lower = (href || "").toLowerCase();
    if (/\.(jpeg|jpg|gif|png|webp|svg)(\?|$)/i.test(lower))
      return <Image className="w-5 h-5 text-emerald-600" />;
    if (/\.pdf(\?|$)/i.test(lower)) return <FileText className="w-5 h-5 text-rose-600" />;
    if (/\.(doc|docx|txt|rtf)(\?|$)/i.test(lower))
      return <FileText className="w-5 h-5 text-blue-600" />;
    return <File className="w-5 h-5 text-slate-600" />;
  };

  const getFileName = ({ href, displayName }) => {
    if (displayName) return String(displayName);
    const noQuery = String(href).replace(/\?.*$/, "");
    const last = noQuery.split("/").filter(Boolean).pop();
    if (last) return decodeURIComponent(last);
    try {
      const name = new URL(href).pathname.split("/").pop();
      return decodeURIComponent(name) || "attachment";
    } catch {
      return "attachment";
    }
  };

  return (
    <div className="pt-6 border-t border-slate-200">
      <div className="flex items-center gap-2 mb-4">
        <Paperclip className="w-5 h-5 text-slate-600" />
        <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
      </div>

      <div className="flex flex-wrap gap-3">
        {files.map((norm, i) => {
          const label = getFileName(norm);
          return (
            <a
              key={i}
              href={norm.href}
              target="_blank"
              rel="noopener noreferrer"
              title={label}
              className="group flex flex-col items-center w-20"
            >
              <div
                className={`${
                  compact ? "w-12 h-12" : "w-14 h-14"
                } rounded-xl bg-slate-100 flex items-center justify-center mb-2 group-hover:bg-slate-200 transition-colors`}
              >
                {getFileIcon(norm.href)}
              </div>
              <span className="text-xs text-slate-600 text-center truncate w-full">
                {label.substring(0, 12)}
                {label.length > 12 ? "..." : ""}
              </span>
            </a>
          );
        })}
      </div>
    </div>
  );
}
