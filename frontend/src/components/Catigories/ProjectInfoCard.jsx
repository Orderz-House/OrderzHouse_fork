import { CheckCircle2 } from "lucide-react";

const THEME = "#028090";
const THEME_DARK = "#05668D";

export default function ProjectInfoCard({
  item,
  isTasks,
  isClient,
  isFreelancer,
  busy,
  onContact,
  onRequestTask,
  onApplyToProject,
  acceptLabel,
  contactLabel,
  acceptClasses,
  contactClasses,
  acceptTitle,
  contactTitle,
  triggerPaymentUpload,
  onPaymentSelected,
  triggerSubmitWork,
  onSubmitWorkSelected,
  triggerResubmit,
  onResubmitSelected,
  onClientApprove,
  onClientRequestReview,
  triggerAddFiles,
  onAddFilesSelected,
  refs,
}) {
  const projectType = item?.project_type ?? "fixed";
  const category = item?.category_name ?? item?.category ?? "—";
  const subSubCategory =
    item?.sub_sub_category_name ?? item?.sub_sub_category ?? null;

  const budgetLabel =
    projectType === "fixed"
      ? "Price"
      : projectType === "hourly"
      ? "Hourly Rate"
      : "Bidding Range";

  const budget =
    projectType === "fixed"
      ? `$${item?.budget ?? "—"}`
      : projectType === "hourly"
      ? `$${item?.hourly_rate ?? "—"}/hr`
      : `$${item?.budget_min ?? "—"} - $${item?.budget_max ?? "—"}`;

  const duration =
    item?.duration_days && item.duration_days > 0
      ? `${item.duration_days} day(s)`
      : item?.duration_hours && item.duration_hours > 0
      ? `${item.duration_hours} hour(s)`
      : "—";

  const createdAt = item?.created_at
    ? new Date(item.created_at).toLocaleDateString()
    : "—";

  const categoryDisplay = subSubCategory
    ? `${category} / ${subSubCategory}`
    : category;

  return (
    <div className="rounded-2xl border border-slate-200 shadow-sm bg-white overflow-hidden">
      <div className="p-6 border-b border-slate-100 space-y-3">
        {/* 💰 Budget */}
        <div className="flex items-center justify-between">
          <span className="text-slate-500 text-sm">{budgetLabel}</span>
          <span className="text-2xl font-black" style={{ color: THEME_DARK }}>
            {budget}
          </span>
        </div>

        {/* 🧩 Project Type */}
        <div className="flex items-center justify-between text-sm">
          <span className="text-slate-500">Project Type</span>
          <span className="font-semibold text-slate-700 capitalize">
            {projectType}
          </span>
        </div>

        {/* ⏱ Duration */}
        <div className="flex items-center justify-between text-sm">
          <span className="text-slate-500">Duration</span>
          <span className="font-semibold text-slate-700">{duration}</span>
        </div>

        {/* 📂 Category */}
        <div className="flex items-center justify-between text-sm">
          <span className="text-slate-500">Category</span>
          <span className="font-semibold text-slate-700 text-right">
            {categoryDisplay}
          </span>
        </div>

        {/* 📅 Created At */}
        <div className="flex items-center justify-between text-sm">
          <span className="text-slate-500">Created At</span>
          <span className="font-semibold text-slate-700">{createdAt}</span>
        </div>
      </div>

      {/* 🧠 Buttons Section */}
      <div className="p-6 space-y-3">
        {onApplyToProject && (
          <button
            className={acceptClasses}
            style={{ backgroundColor: THEME }}
            disabled={busy}
            onClick={onApplyToProject}
          >
            {busy ? "Please wait..." : acceptLabel}
          </button>
        )}

        <button
          className={contactClasses}
          disabled={busy}
          onClick={onContact}
        >
          {contactLabel}
        </button>

        <ul className="mt-4 space-y-2 text-sm text-slate-600">
          <li className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Secure checkout
          </li>
          <li className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Money-back guarantee
          </li>
          <li className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" /> 24/7 support
          </li>
        </ul>

        {/* 📎 Task-specific uploads */}
        {isClient && isTasks && (
          <>
            <button
              className="w-full h-10 rounded-lg border text-sm hover:bg-slate-50"
              onClick={triggerPaymentUpload}
              disabled={busy}
            >
              Upload payment proof
            </button>
            <input
              ref={refs.paymentInputRef}
              type="file"
              accept="image/*,application/pdf"
              hidden
              onChange={onPaymentSelected}
            />
          </>
        )}
      </div>
    </div>
  );
}
