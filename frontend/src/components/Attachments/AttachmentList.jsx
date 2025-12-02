import React from "react";
import { Paperclip, Image, FileText, File } from "lucide-react";

/**
 * AttachmentList
 * Reusable display for file attachments.
 *
 * @param {Object} props
 * @param {string|string[]} props.attachments - Array or JSON string of file URLs.
 * @param {string} [props.title] - Optional title, defaults to "Attachments".
 * @param {boolean} [props.compact] - Optional compact mode (smaller icons).
 */
export default function AttachmentList({ attachments, title = "Attachments", compact = false }) {
  if (!attachments) return null;

  let files = [];
  if (Array.isArray(attachments)) {
    files = attachments;
  } else if (typeof attachments === "string") {
    try {
      const parsed = JSON.parse(attachments);
      files = Array.isArray(parsed) ? parsed : [attachments];
    } catch {
      files = [attachments];
    }
  }

  if (files.length === 0) return null;

  const getFileIcon = (url) => {
    const lower = (url || "").toLowerCase();
    if (/\.(jpeg|jpg|gif|png|webp|svg)$/.test(lower))
      return <Image className="w-5 h-5 text-emerald-600" />;
    if (/\.pdf$/.test(lower)) return <FileText className="w-5 h-5 text-rose-600" />;
    if (/\.(doc|docx|txt|rtf)$/.test(lower))
      return <FileText className="w-5 h-5 text-blue-600" />;
    return <File className="w-5 h-5 text-slate-600" />;
  };

  const getFileName = (url) => {
    try {
      const name = new URL(url).pathname.split("/").pop();
      return decodeURIComponent(name) || "attachment";
    } catch {
      return url.split("/").pop() || "attachment";
    }
  };

  return (
    <div className="pt-6 border-t border-slate-200">
      <div className="flex items-center gap-2 mb-4">
        <Paperclip className="w-5 h-5 text-slate-600" />
        <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
      </div>

      <div className="flex flex-wrap gap-3">
        {files.map((url, i) => (
          <a
            key={i}
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            title={getFileName(url)}
            className="group flex flex-col items-center w-20"
          >
            <div
              className={`${
                compact ? "w-12 h-12" : "w-14 h-14"
              } rounded-xl bg-slate-100 flex items-center justify-center mb-2 group-hover:bg-slate-200 transition-colors`}
            >
              {getFileIcon(url)}
            </div>
            <span className="text-xs text-slate-600 text-center truncate w-full">
              {getFileName(url).substring(0, 12)}
              {getFileName(url).length > 12 ? "..." : ""}
            </span>
          </a>
        ))}
      </div>
    </div>
  );
}
