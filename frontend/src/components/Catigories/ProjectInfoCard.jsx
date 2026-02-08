// components/Projects/ProjectInfoCard.jsx
import { CheckCircle2 } from "lucide-react";

const THEME = "#F97316";
const THEME_DARK = "#C2410C";

export default function ProjectInfoCard({
  item,
  isTasks,
  isClient,
  isFreelancer,
  busy,
  onContact,
  onApplyToProject,
  acceptLabel,
  contactLabel,
  acceptClasses,
  contactClasses,
}) {
  const projectType = isTasks ? "fixed" : item?.project_type ?? "fixed";

  const category = item?.category_name ?? item?.category ?? "—";
  const subSubCategory =
    item?.sub_sub_category_name ?? item?.sub_sub_category ?? null;

  const budgetLabel = isTasks
    ? "Price"
    : projectType === "fixed"
    ? "Budget"
    : projectType === "hourly"
    ? "Hourly Rate"
    : "Bidding Range";

  let budget = "—";
  if (isTasks) {
    if (item?.price != null) budget = `$${item.price}`;
  } else if (projectType === "fixed") {
    if (item?.budget != null) budget = `$${item.budget}`;
    else if (item?.price != null) budget = `$${item.price}`;
  } else if (projectType === "hourly") {
    if (item?.hourly_rate != null) budget = `$${item.hourly_rate}/hr`;
  } else if (projectType === "bidding") {
    const min = item?.budget_min;
    const max = item?.budget_max ?? min;
    if (min != null) budget = `$${min} - $${max ?? "—"}`;
  }

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
        {/* price / budget */}
        <div className="flex items-center justify-between">
          <span className="text-slate-500 text-sm">{budgetLabel}</span>
          <span
            className="text-2xl font-black"
            style={{ color: THEME_DARK }}
          >
            {budget}
          </span>
        </div>

        {/* type */}
        {!isTasks && (
          <div className="flex items-center justify-between text-sm">
            <span className="text-slate-500">Project Type</span>
            <span className="font-semibold text-slate-700 capitalize">
              {projectType}
            </span>
          </div>
        )}

        {isTasks && (
          <div className="flex items-center justify-between text-sm">
            <span className="text-slate-500">Task Type</span>
            <span className="font-semibold text-slate-700">
              Fixed price
            </span>
          </div>
        )}

        {/* duration */}
        <div className="flex items-center justify-between text-sm">
          <span className="text-slate-500">Duration</span>
          <span className="font-semibold text-slate-700">{duration}</span>
        </div>

        {/* category */}
        <div className="flex items-center justify-between text-sm">
          <span className="text-slate-500">Category</span>
          <span className="font-semibold text-slate-700 text-right">
            {categoryDisplay}
          </span>
        </div>

        {/* created at */}
        <div className="flex items-center justify-between text-sm">
          <span className="text-slate-500">Created At</span>
          <span className="font-semibold text-slate-700">
            {createdAt}
          </span>
        </div>
      </div>

      <div className="p-6 space-y-3">
        {onApplyToProject && (
          <button
            type="button"
            className={acceptClasses}
            style={{ backgroundColor: THEME }}
            disabled={busy}
            onClick={onApplyToProject}
          >
            {busy ? "Please wait..." : acceptLabel}
          </button>
        )}

        {onContact && (
          <button
            type="button"
            className={contactClasses}
            disabled={busy}
            onClick={onContact}
          >
            {contactLabel}
          </button>
        )}

        <ul className="mt-4 space-y-2 text-sm text-slate-600">
          <li className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-orange-600" /> Secure
            checkout
          </li>
          <li className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-orange-600" /> Money-back
            guarantee
          </li>
          <li className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-orange-600" /> 24/7 support
          </li>
        </ul>
      </div>
    </div>
  );
}
