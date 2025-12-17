import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import axios from "axios";
import { useToast } from "../toast/ToastProvider.jsx";

const API_URL = import.meta.env.VITE_APP_API_URL;

export default function PaymentSuccess() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const toast = useToast();

  useEffect(() => {
    const run = async () => {
      const session_id = params.get("session_id");

      if (!session_id) {
        toast.success("Payment successful!");
        return navigate("/plans", { replace: true });
      }

      try {
        const res = await axios.get(`${API_URL}/stripe/confirm`, {
          params: { session_id },
        });

        if (res.data?.ok) {
          toast.success("Payment successful! Subscription activated.");
        } else {
          toast.info(res.data?.error || "Payment received. Finalizing your subscription...");
        }
      } catch (e) {
        console.error("confirm error:", e);
        toast.info("Payment received. Finalizing your subscription...");
      } finally {
        navigate("/plans", { replace: true });
      }
    };

    run();
  }, [navigate, params, toast]);

  return (
    <div className="min-h-screen flex items-center justify-center text-slate-600">
      Completing your payment...
    </div>
  );
}
