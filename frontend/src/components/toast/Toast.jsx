import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { CheckCircle, XCircle, Info } from "lucide-react";

export default function Toast({
  message,
  type = "success", // success | error | info
  onClose,
  duration = 3000,
}) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    if (!message) return;
    const fadeTimer = setTimeout(() => setIsVisible(false), duration - 500);
    const removeTimer = setTimeout(() => onClose?.(), duration);
    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(removeTimer);
    };
  }, [message, duration, onClose]);

  if (!message) return null;

  const icons = {
    success: <CheckCircle className="w-5 h-5 text-emerald-600" />,
    error: <XCircle className="w-5 h-5 text-rose-600" />,
    info: <Info className="w-5 h-5 text-sky-600" />,
  };

  const colorMap = {
    success: "bg-emerald-50 text-emerald-700 border-emerald-200",
    error: "bg-rose-50 text-rose-700 border-rose-200",
    info: "bg-sky-50 text-sky-700 border-sky-200",
  };

  return createPortal(
    <div className="fixed top-4 right-4 z-[9999]">
      <div
        className={`flex items-center gap-2 px-4 py-2 rounded-xl border shadow-sm transition-all duration-500 ${
          colorMap[type]
        } ${!isVisible ? "opacity-0 translate-y-2" : "opacity-100 translate-y-0"}`}
      >
        {icons[type]}
        <span className="font-medium text-sm">{message}</span>
        <button
          onClick={() => setIsVisible(false)}
          className="ml-3 text-slate-400 hover:text-slate-600 transition-colors"
        >
          ✕
        </button>
      </div>
    </div>,
    document.body
  );
}
