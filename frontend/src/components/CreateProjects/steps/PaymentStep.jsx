import React, { useState } from "react";

const primaryBtn =
  "bg-gradient-to-b from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white focus-visible:ring-2 focus-visible:ring-orange-200/70";

export default function PaymentStep({
  onBack,
  projectData = {},
  isSubmitting,
  onSubmit,
  onOfflinePayment, // New callback for offline payment
}) {
  const [selectedMethod, setSelectedMethod] = useState(null); // 'stripe', 'cliq', 'cash'

  const calculateAmount = () => {
    if (projectData.project_type === "fixed") return projectData.budget;
    if (projectData.project_type === "hourly")
      return projectData.hourly_rate * 3;
    if (projectData.project_type === "bidding")
      return `${projectData.budget_min} - ${projectData.budget_max}`;
    return 0;
  };

  const handleStripePayment = () => {
    setSelectedMethod('stripe');
    onSubmit();
  };

  const handleOfflinePayment = (method) => {
    setSelectedMethod(method);
    if (onOfflinePayment) {
      onOfflinePayment(method);
    }
  };

  return (
    <div className="rounded-2xl border bg-white p-8 shadow-sm">
      <h2 className="text-2xl font-bold mb-2">Payment</h2>
      <p className="text-slate-600 mb-6">
        Choose your payment method to complete the project posting.
      </p>

      <div className="rounded-xl border p-4 mb-6">
        <p className="font-semibold">Project</p>
        <p>{projectData.title}</p>
        <p className="mt-2 font-bold text-orange-600">
          Amount: ${calculateAmount()}
        </p>
      </div>

      {/* Payment Method Selection */}
      <div className="mb-6 space-y-3">
        {/* Stripe option - hidden by default, only show if VITE_PAYMENTS_MODE === "stripe" */}
        {import.meta.env.VITE_PAYMENTS_MODE === "stripe" && (
          <button
            onClick={handleStripePayment}
            disabled={isSubmitting || selectedMethod !== null}
            className={`w-full p-4 rounded-xl border-2 transition-all ${
              selectedMethod === 'stripe'
                ? 'border-orange-500 bg-orange-50'
                : 'border-gray-200 hover:border-orange-300'
            } ${isSubmitting || selectedMethod !== null ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold text-left">Pay with Stripe</p>
                <p className="text-sm text-gray-600 text-left">Secure online payment</p>
              </div>
              <div className="text-2xl">💳</div>
            </div>
          </button>
        )}

        <button
          onClick={() => handleOfflinePayment('cliq')}
          disabled={isSubmitting || selectedMethod !== null}
          className={`w-full p-4 rounded-xl border-2 transition-all ${
            selectedMethod === 'cliq'
              ? 'border-orange-500 bg-orange-50'
              : 'border-gray-200 hover:border-orange-300'
          } ${isSubmitting || selectedMethod !== null ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="font-semibold text-left">Pay via CliQ</p>
              <p className="text-sm text-gray-600 text-left">Requires admin approval</p>
            </div>
            <div className="text-2xl">📱</div>
          </div>
        </button>

        <button
          onClick={() => handleOfflinePayment('cash')}
          disabled={isSubmitting || selectedMethod !== null}
          className={`w-full p-4 rounded-xl border-2 transition-all ${
            selectedMethod === 'cash'
              ? 'border-orange-500 bg-orange-50'
              : 'border-gray-200 hover:border-orange-300'
          } ${isSubmitting || selectedMethod !== null ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="font-semibold text-left">Pay Cash</p>
              <p className="text-sm text-gray-600 text-left">Requires admin approval</p>
            </div>
            <div className="text-2xl">💵</div>
          </div>
        </button>
      </div>

      {selectedMethod === 'cliq' || selectedMethod === 'cash' ? (
        <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-xl">
          <p className="text-sm text-yellow-800">
            ⚠️ Your project will be created but will remain hidden until admin approves your payment.
          </p>
        </div>
      ) : null}

      <div className="flex gap-4">
        <button
          onClick={onBack}
          className="flex-1 h-12 rounded-xl bg-slate-100 font-semibold"
          disabled={isSubmitting}
        >
          Back
        </button>

        {/* Stripe button - only show if Stripe option is visible and selected */}
        {import.meta.env.VITE_PAYMENTS_MODE === "stripe" && selectedMethod === 'stripe' && (
          <button
            onClick={handleStripePayment}
            disabled={isSubmitting}
            className={`flex-1 h-12 rounded-xl font-semibold ${primaryBtn}`}
          >
            {isSubmitting ? "Redirecting..." : "Pay with Stripe"}
          </button>
        )}
      </div>
    </div>
  );
}
