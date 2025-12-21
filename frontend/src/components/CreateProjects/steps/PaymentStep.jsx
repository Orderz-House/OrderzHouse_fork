import React from "react";

const THEME = "#028090";

export default function PaymentStep({
  onBack,
  projectData = {},
  isSubmitting,
  onSubmit,
}) {
  const calculateAmount = () => {
    if (projectData.project_type === "fixed") return projectData.budget;
    if (projectData.project_type === "hourly")
      return projectData.hourly_rate * 3;
    if (projectData.project_type === "bidding")
      return `${projectData.budget_min} - ${projectData.budget_max}`;
    return 0;
  };

  return (
    <div className="rounded-2xl border bg-white p-8 shadow-sm">
      <h2 className="text-2xl font-bold mb-2">Payment</h2>
      <p className="text-slate-600 mb-6">
        You will be redirected to Stripe to complete the payment securely.
      </p>

      <div className="rounded-xl border p-4 mb-6">
        <p className="font-semibold">Project</p>
        <p>{projectData.title}</p>
        <p className="mt-2 font-bold" style={{ color: THEME }}>
          Amount: ${calculateAmount()}
        </p>
      </div>

      <div className="flex gap-4">
        <button
          onClick={onBack}
          className="flex-1 h-12 rounded-xl bg-slate-100 font-semibold"
          disabled={isSubmitting}
        >
          Back
        </button>

        <button
          onClick={onSubmit}
          disabled={isSubmitting}
          className="flex-1 h-12 rounded-xl font-semibold text-white"
          style={{ background: THEME }}
        >
          {isSubmitting ? "Redirecting..." : "Pay with Stripe"}
        </button>
      </div>
    </div>
  );
}
