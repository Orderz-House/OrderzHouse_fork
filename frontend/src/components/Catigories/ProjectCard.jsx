import { Link } from "react-router-dom";

export default function ProjectCard({
  project,
  theme = "#028090",
  linkBase = "projects",
  priceField = "price",
}) {
  const { id, title, cover_pic, cover, image, offersVideo, tags = [] } = project;
  const to = `/${linkBase}/${id}`;
  const displayPrice = project?.[priceField] ?? project?.price ?? project?.budget ?? "—";
  const coverSrc = cover_pic || cover || image;

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
        <h3 className="mt-1 text-[15px] text-slate-800 line-clamp-2" title={title}>
          <Link to={to} state={{ project }} className="hover:underline">
            {title}
          </Link>
        </h3>
        <div className="mt-2 flex items-center justify-between text-sm">
          <span className="text-slate-500">From</span>
          <span className="font-semibold text-slate-900">${displayPrice}</span>
        </div>
        {offersVideo && (
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
