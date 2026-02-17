import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCcVisa } from "@fortawesome/free-brands-svg-icons";
import { faBuilding } from "@fortawesome/free-regular-svg-icons";

const THEME = "#028090";

export default function PaymentMethodModal({
  open,
  onClose,
  onOnline,
  onOffline,
}) {
  if (!open) return null;

  // Feature flag: show Stripe only if VITE_PAYMENTS_MODE === "stripe"
  const paymentsMode = import.meta.env.VITE_PAYMENTS_MODE || "offline";
  const showStripe = paymentsMode === "stripe";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4">
      <div className="w-full max-w-md rounded-3xl bg-white p-8 space-y-6 shadow-2xl animate-scaleIn">
        {/* Title */}
        <h3 className="text-2xl font-extrabold text-center text-slate-800">
          Choose Payment Method
        </h3>

        {/* Online payment - Only show if Stripe mode is enabled */}
        {showStripe && (
          <button
            onClick={onOnline}
            className="w-full rounded-2xl px-5 py-4 font-bold text-white flex items-center justify-center gap-3 transition-all duration-200 hover:brightness-110 active:scale-[0.98]"
            style={{ background: THEME }}
          >
            <FontAwesomeIcon icon={faCcVisa} size="lg" />
            Subscribe Now
          </button>
        )}

        {/* Offline payment */}
        <button
          onClick={onOffline}
          className="w-full rounded-2xl px-5 py-4 border font-bold flex items-center justify-center gap-3 text-slate-700 transition-all duration-200 hover:bg-slate-50 active:scale-[0.98]"
          style={{ borderColor: "rgba(2,128,144,0.35)" }}
        >
          <FontAwesomeIcon icon={faBuilding} size="lg" />
          Subscribe from Company
        </button>

        {/* Note about online payments being unavailable */}
        {!showStripe && (
          <div className="pt-2">
            <p className="text-xs text-center text-slate-500 leading-relaxed">
              Online payments are temporarily unavailable.
            </p>
          </div>
        )}

        {/* Note */}
        <div className="pt-2">
          <p className="text-xs text-center text-slate-500 leading-relaxed">
         * Annual account verification fee: 25 JD.
          </p>
        </div>

        {/* Cancel */}
        <button
          onClick={onClose}
          className="w-full pt-2 text-sm font-semibold text-slate-500 hover:text-slate-700 transition"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
