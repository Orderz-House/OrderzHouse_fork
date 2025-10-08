export default function ProjectCard({
  title,
  cover,
  seller,
  rating,
  from,
  offersVideo,
  tags = [],
  theme = "#028090",
}) {
  return (
    <article className="group">
      <div className="relative rounded-xl overflow-hidden">
        <div className="aspect-[16/9] w-full bg-slate-100 overflow-hidden">
          <img
            src={cover}
            alt={title}
            className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-500"
            loading="lazy"
          />
        </div>

        <button
          className="absolute top-2 right-2 w-9 h-9 rounded-full bg-white/95 shadow ring-1 ring-black/5 flex items-center justify-center hover:bg-white"
          aria-label="Save"
        >
          <svg viewBox="0 0 24 24" className="w-5 h-5 text-slate-700">
            <path
              d="M12 21s-6.7-4.35-9.33-7A5.33 5.33 0 1112 5.67 5.33 5.33 0 1121.33 14c-2.63 2.65-9.33 7-9.33 7z"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>

        {tags?.length ? (
          <div className="absolute left-2 bottom-2 flex flex-wrap gap-1.5">
            {tags.slice(0, 5).map((t) => (
              <span
                key={t}
                className="text-[10px] px-2 py-0.5 rounded-full bg-black/65 text-white backdrop-blur"
              >
                {t}
              </span>
            ))}
          </div>
        ) : null}
      </div>

      <div className="p-3 px-1">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <div
              className="w-6 h-6 rounded-sm grid place-items-center text-white text-[10px] font-bold"
              style={{ background: theme }}
            >
              {seller?.name?.[0] || "A"}
            </div>
            <div className="flex items-center gap-1 text-sm">
              <span className="font-semibold text-slate-900">
                {seller?.name || "Agency"}
              </span>
              {seller?.isAd && (
                <span className="text-[11px] text-slate-500">Ad</span>
              )}
            </div>
          </div>

          {seller?.vetted && (
            <span className="rounded-md bg-[#EDE7FF] text-[#6B46C1] text-[11px] px-2 py-0.5">
              Vetted Pro
            </span>
          )}
        </div>

        <h3
          className="mt-1 text-[15px] text-slate-800 line-clamp-2"
          title={title}
          style={{
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }}
        >
          {title}
        </h3>

        <div className="mt-2 flex items-center justify-between">
          <div className="flex items-center gap-1 text-sm">
            <Star />
            <span className="font-semibold">{rating?.score?.toFixed(1)}</span>
            <span className="text-slate-500 text-xs">
              ({rating?.count?.toLocaleString?.() || 0})
            </span>
          </div>
          <div className="text-sm">
            <span className="text-slate-500 mr-1">From</span>
            <span className="font-semibold text-slate-900">${from}</span>
          </div>
        </div>

        {offersVideo && (
          <div className="mt-2 flex items-center gap-1.5 text-xs text-slate-700">
            <VideoIcon />
            <span>Offers video consultations</span>
          </div>
        )}
      </div>
    </article>
  );
}

function Star() {
  return (
    <svg
      viewBox="0 0 20 20"
      className="w-4 h-4"
      fill="currentColor"
      style={{ color: "#F59E0B" }}
    >
      <path d="M10 2.5l2.7 5.5 6 .9-4.3 4.2 1 6-5.4-2.8-5.4 2.8 1-6L1.3 8.9l6-.9L10 2.5z" />
    </svg>
  );
}
function VideoIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none">
      <path
        d="M4 7h10a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V9a2 2 0 012-2z"
        stroke="currentColor"
        strokeWidth="2"
      />
      <path d="M16 12l6-3v6l-6-3z" fill="currentColor" />
    </svg>
  );
}
