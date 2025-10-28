import { useState, useMemo } from "react";
import axios from "axios";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";

const PRIMARY = "#028090";

export default function ApproveRejectButtons({
  id,
  approveApi,
  rejectApi,
  token,
  onApproved,
  onRejected,
  variant = "pill",
  labels = { approve: "Approve", reject: "Reject" },
  className = "",
}) {
  /* State */
  const [loading, setLoading] = useState(null); // 'approve' | 'reject' | null

  /* Axios */
  const api = useMemo(
    () =>
      axios.create({
        baseURL: import.meta.env.VITE_API_URL || "",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { authorization: `Bearer ${token}` } : {}),
        },
      }),
    [token]
  );

  /* Handlers */
  const doApprove = async () => {
    try {
      setLoading("approve");
      if (approveApi) await api.post(approveApi);
      onApproved?.(id);
    } finally {
      setLoading(null);
    }
  };

  const doReject = async () => {
    try {
      setLoading("reject");
      if (rejectApi) await api.post(rejectApi);
      onRejected?.(id);
    } finally {
      setLoading(null);
    }
  };

  /* UI */
  const cx = (...s) => s.filter(Boolean).join(" ");

  const Pill = ({ kind }) => {
    const isApprove = kind === "approve";
    const active = loading === kind;
    const base = "inline-flex items-center gap-2 h-10 rounded-xl text-sm px-3";
    const approveStyle = `border border-[${PRIMARY}] text-[${PRIMARY}] bg-white hover:bg-[#028090]/5`;
    const rejectStyle = "border border-slate-200 text-slate-700 bg-white hover:bg-slate-50";
    return (
      <button
        onClick={isApprove ? doApprove : doReject}
        disabled={active}
        className={cx(base, isApprove ? approveStyle : rejectStyle, className)}
        title={isApprove ? labels.approve : labels.reject}
      >
        {active ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : isApprove ? (
          <CheckCircle className="w-4 h-4" />
        ) : (
          <XCircle className="w-4 h-4" />
        )}
        <span>{isApprove ? labels.approve : labels.reject}</span>
      </button>
    );
  };

  const Circle = ({ kind }) => {
    const isApprove = kind === "approve";
    const active = loading === kind;
    const base = "grid place-items-center h-9 w-9 rounded-full";
    const approveStyle = `border border-[${PRIMARY}] text-[${PRIMARY}] bg-white hover:bg-[#028090]/5`;
    const rejectStyle = "border border-slate-300 text-slate-700 bg-white hover:bg-slate-50";
    return (
      <button
        onClick={isApprove ? doApprove : doReject}
        disabled={active}
        className={cx(base, isApprove ? approveStyle : rejectStyle, className)}
        title={isApprove ? labels.approve : labels.reject}
      >
        {active ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : isApprove ? (
          <CheckCircle className="w-4 h-4" />
        ) : (
          <XCircle className="w-4 h-4" />
        )}
      </button>
    );
  };

  if (variant === "circle") {
    return (
      <div className="flex items-center gap-2">
        <Circle kind="approve" />
        <Circle kind="reject" />
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <Pill kind="approve" />
      <Pill kind="reject" />
    </div>
  );
}
