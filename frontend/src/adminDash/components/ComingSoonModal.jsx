import React, { useEffect } from "react";
import { Sparkles, X } from "lucide-react";

const ORANGE = "#F97316";
const ORANGE_SOFT = "rgba(249, 115, 22, 0.12)";

/**
 * Reusable "Coming soon" modal/sheet.
 * Same theme as project (orange), soft shadow, rounded, light animation.
 * Use for disabled features (e.g. freelancer Create Task) to show a clear, friendly message.
 */
export default function ComingSoonModal({
  open,
  onClose,
  title = "Coming soon",
  description = "We're preparing this feature for you. It will be available soon.",
  buttonText = "Got it",
}) {
  useEffect(() => {
    if (!open) return;
    const handleEscape = (e) => {
      if (e.key === "Escape") onClose?.();
    };
    document.addEventListener("keydown", handleEscape);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-end justify-center sm:items-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="coming-soon-title"
    >
      {/* Backdrop */}
      <button
        type="button"
        aria-label="Close"
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-[2px] transition-opacity duration-200"
        onClick={onClose}
      />

      {/* Content: bottom sheet on mobile, centered card on desktop */}
      <div
        className="relative w-full max-w-sm rounded-t-3xl bg-white sm:rounded-2xl sm:shadow-xl sm:max-w-[360px] sm:mx-4 transition-all duration-300"
        style={{
          boxShadow: "0 -4px 24px rgba(0,0,0,0.08), 0 0 0 1px rgba(0,0,0,0.04)",
        }}
      >
        <div className="p-6 pb-6 sm:pb-6 pt-8 sm:pt-6">
          {/* Optional close X for accessibility */}
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Icon */}
          <div
            className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl"
            style={{ backgroundColor: ORANGE_SOFT }}
          >
            <Sparkles className="h-7 w-7" style={{ color: ORANGE }} />
          </div>

          {/* Title */}
          <h2
            id="coming-soon-title"
            className="text-center text-lg font-semibold text-slate-900"
          >
            {title}
          </h2>

          {/* Description */}
          <p className="mt-2 text-center text-sm text-slate-500 leading-relaxed">
            {description}
          </p>

          {/* Primary button */}
          <button
            type="button"
            onClick={onClose}
            className="mt-6 w-full rounded-xl py-3 text-sm font-semibold text-white transition active:scale-[0.98]"
            style={{
              background: ORANGE,
              boxShadow: "0 2px 8px rgba(249, 115, 22, 0.35)",
            }}
          >
            {buttonText}
          </button>
        </div>
      </div>
    </div>
  );
}
