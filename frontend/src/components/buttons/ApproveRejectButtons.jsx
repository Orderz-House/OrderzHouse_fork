import { useState, useMemo } from "react";
import axios from "axios";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";
import { useToast } from "../toast/ToastProvider"; 

const PRIMARY = "#028090";

export default function ApproveRejectButtons({
  id,
  approveApi,
  rejectApi,
  token,
  onApproved,
  onRejected,
  variant = "pill",
  show = "both",
  labels = { approve: "Approve", reject: "Reject" },
  className = "",
}) {
  const [loading, setLoading] = useState(null);
  const { showToast } = useToast(); 

  const api = useMemo(
    () =>
      axios.create({
        baseURL: import.meta.env.VITE_APP_API_URL || "",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { authorization: `Bearer ${token}` } : {}),
        },
      }),
    [token]
  );

  const doApprove = async () => {
    try {
      setLoading("approve");
      if (approveApi) await api.put(approveApi);
      onApproved?.(id);
      showToast("User approved successfully!", "success"); 
    } catch {
      showToast("Failed to approve user.", "error"); 
    } finally {
      setLoading(null);
    }
  };

  const doReject = async () => {
    try {
      setLoading("reject");
      if (rejectApi) await api.put(rejectApi);
      onRejected?.(id);
      showToast("User rejected successfully!", "success"); 
    } catch {
      showToast("Failed to reject user.", "error"); 
    } finally {
      setLoading(null);
    }
  };

  const cx = (...s) => s.filter(Boolean).join(" ");

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

  return (
    <div className="flex items-center gap-2">
      {(show === "both" || show === "approve") && <Circle kind="approve" />}
      {(show === "both" || show === "reject") && <Circle kind="reject" />}
    </div>
  );
}
