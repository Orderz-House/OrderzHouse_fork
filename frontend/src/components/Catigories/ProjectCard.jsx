// components/Projects/ProjectCard.jsx
import { Link } from "react-router-dom";

export default function ProjectCard({
  project,
  theme = "#F97316",
  linkBase = "projects",
  priceField = "price",
}) {
  const {
    id,
    title,
    cover_pic,
    cover,
    image,
    offersVideo,
    tags = [],
    offers,
  } = project;

  const to = `/${linkBase}/${id}`;
 const projectType = (project?.project_type ?? project?.type ?? "").toLowerCase();

const toNumber = (v) => {
  if (v === null || v === undefined || v === "") return null;
  if (typeof v === "number") return Number.isFinite(v) ? v : null;
  if (typeof v === "string") {
    const m = v.match(/(\d+(\.\d+)?)/);
    return m ? Number(m[1]) : null;
  }
  return null;
};

// ✅ نحاول نلتقط min/max من أي اسم محتمل في الداتا
const minBid =
  toNumber(project?.min_budget) ??
  toNumber(project?.min_price) ??
  toNumber(project?.budget_min) ??
  toNumber(project?.bidding_min) ??
  toNumber(project?.min_bid) ??
  toNumber(project?.min_bid_amount);

const maxBid =
  toNumber(project?.max_budget) ??
  toNumber(project?.max_price) ??
  toNumber(project?.budget_max) ??
  toNumber(project?.bidding_max) ??
  toNumber(project?.max_bid) ??
  toNumber(project?.max_bid_amount);

// fallback للسعر العادي (fixed/hourly)
const basePrice =
  project?.budget ??
  project?.price ??
  project?.amount ??
  project?.[priceField] ??
  null;

// ✅ label + value
const priceLabel =
  projectType === "bidding"
    ? "Bidding Range"
    : linkBase === "tasks"
      ? "Price"
      : "From";

let displayPrice = "—";

// ✅ لو bidding وعندنا range
if (projectType === "bidding" && (minBid !== null || maxBid !== null)) {
  if (minBid !== null && maxBid !== null) displayPrice = `$${minBid} - $${maxBid}`;
  else displayPrice = `From $${minBid ?? maxBid}`;
} else {
  // ✅ لو القيمة string فيها range مثل "200 - 300"
  if (typeof basePrice === "string" && basePrice.includes("-")) {
    const nums = basePrice.match(/(\d+(\.\d+)?)/g);
    if (nums && nums.length >= 2) displayPrice = `$${nums[0]} - $${nums[1]}`;
    else {
      const n = toNumber(basePrice);
      displayPrice = n !== null ? `$${n}` : "—";
    }
  } else {
    const n = toNumber(basePrice);
    displayPrice = n !== null ? `$${n}` : "—";
  }
}

  const firstAttachment =
    Array.isArray(project.attachments) && project.attachments.length > 0
      ? project.attachments[0]
      : null;

  const coverSrc =
    cover_pic ||
    cover ||
    image ||
    firstAttachment ||
    "/placeholder.svg?height=200&width=320";

  let offerBlock = null;
  if (!linkBase.startsWith("tasks") && Array.isArray(offers) && offers.length) {
    const offer = offers[0];
    const freelancer = offer?.freelancer || {};
    offerBlock = (
      <div className="mt-2 p-2 rounded-lg border border-orange-200 bg-orange-50 flex flex-col gap-1">
        <div className="text-xs font-semibold text-orange-700">
          Offer Submitted
        </div>
        <div className="flex flex-wrap gap-2 text-xs text-slate-700">
          <span>
            Value:{" "}
            <span className="font-bold">${offer?.bid_amount ?? "—"}</span>
          </span>
          <span>
            Rating:{" "}
            <span className="font-bold">{freelancer?.rating ?? "—"}</span>
          </span>
          <span>
            Completed Jobs:{" "}
            <span className="font-bold">
              {freelancer?.completed_jobs ?? "—"}
            </span>
          </span>
          <span>
            Avg. Delivery:{" "}
            <span className="font-bold">
              {freelancer?.avg_delivery_time ?? "—"}
            </span>
          </span>
        </div>
      </div>
    );
  }

  return (
    <article className="group">
      <Link to={to} state={{ project }} className="block" title={title}>
        <div className="aspect-[16/9] w-full bg-slate-100 overflow-hidden rounded-xl">
          <img
            src={coverSrc}
            alt={title}
            className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-500"
          />
        </div>
      </Link>

      <div className="p-3 px-1">
        <h3
          className="mt-1 text-[15px] text-slate-800 line-clamp-2"
          title={title}
        >
          <Link to={to} state={{ project }} className="hover:underline">
            {title}
          </Link>
        </h3>

        <div className="mt-2 flex items-center justify-between text-sm">
         <span className="text-slate-500">{priceLabel}</span>

          <span className="font-semibold text-slate-900">{displayPrice}</span>
        </div>

        {offerBlock}

        {offersVideo && !linkBase.startsWith("tasks") && (
          <div className="mt-2 flex items-center gap-1.5 text-xs text-slate-700">
            🎥 Offers video consultations
          </div>
        )}

        {tags.length > 0 && (
          <div className="mt-1 flex flex-wrap gap-1">
            {tags.slice(0, 5).map((t) => (
              <span
                key={t}
                className="text-[10px] px-2 py-0.5 rounded-full bg-black/65 text-white"
              >
                {t}
              </span>
            ))}
          </div>
        )}
      </div>
    </article>
  );
}
