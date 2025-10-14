import { Calendar, User, Clock } from "lucide-react";
import { Link } from "react-router-dom";

export default function BlogCard({ post }) {
  const formatDate = (iso) =>
    new Date(iso).toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric",
    });

  return (
    <article className="group relative rounded-2xl overflow-hidden border border-slate-200 bg-white hover:shadow-sm transition">
      <div className="relative">
        <img
          src={post.cover}
          alt={post.title}
          className="h-44 w-full object-cover group-hover:scale-[1.02] transition"
        />
        <span className="absolute top-3 left-3 px-2.5 py-1 text-[11px] rounded-full bg-[#028090] text-white shadow">
          {post.category}
        </span>
      </div>

      <div className="p-4">
        <h3 className="font-semibold text-slate-900 leading-snug line-clamp-2">
          {post.title}
        </h3>
        <p className="text-slate-600 text-sm mt-2 line-clamp-2">
          {post.excerpt}
        </p>

        <div className="mt-3 flex flex-wrap items-center gap-3 text-slate-500 text-xs">
          <span className="inline-flex items-center gap-1.5">
            <Calendar className="w-4 h-4" />
            {formatDate(post.date)}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <User className="w-4 h-4" />
            {post.author}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Clock className="w-4 h-4" />
            {post.read}
          </span>
        </div>

        <Link
          to={`/blogs/${post.id}`}
          state={post}
          className="absolute inset-0"
          aria-label={post.title}
        />
      </div>
    </article>
  );
}
