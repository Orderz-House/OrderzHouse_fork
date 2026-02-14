import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "../toast/ToastProvider.jsx";

const REDIRECT_DELAY_MS = 2000;

export default function PaymentCancel() {
  const navigate = useNavigate();
  const toast = useToast();
  const didRun = useRef(false);

  useEffect(() => {
    if (didRun.current) return;
    didRun.current = true;
    toast.info("Payment was cancelled. Taking you back...");
    const t = setTimeout(() => {
      navigate(-1, { replace: true });
    }, REDIRECT_DELAY_MS);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="text-center p-6 max-w-md">
        <h1 className="text-xl font-semibold text-slate-800 mb-2">
          Payment cancelled
        </h1>
        <p className="text-slate-600 text-sm">
          You cancelled the payment. Taking you back to the previous page…
        </p>
        <p className="text-slate-500 text-xs mt-4">
          Redirecting in a few seconds…
        </p>
      </div>
    </div>
  );
}
