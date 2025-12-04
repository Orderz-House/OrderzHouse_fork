import { Calendar, Clock } from "lucide-react";
import { Link } from "react-router-dom";

export default function BlogCard({ post }) {
  const formatDate = (iso) =>
    new Date(iso).toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric",
    });

  const postUrl = `/blogs/${post.id ?? post._id}`;

  return (
    <article className="group relative rounded-2xl overflow-hidden border border-slate-200 bg-white hover:shadow-lg transition-shadow duration-300">
      
      <div className="relative">
        <img
          src={post.cover}
          alt={post.title}
          className="h-44 w-full object-cover group-hover:scale-[1.02] transition-transform duration-300"
        />
        <span className="absolute top-3 left-3 px-2.5 py-1 text-[11px] rounded-full bg-[#028090] text-white shadow">
          {post.category}
        </span>
      </div>

      <div className="p-4 flex flex-col">
        <h3 className="font-semibold text-slate-900 leading-snug line-clamp-2">
          <Link to={postUrl} state={post} className="focus:outline-none">
            <span className="absolute inset-0" aria-hidden="true" />
            {post.title}
          </Link>
        </h3>

        <p className="text-slate-600 text-sm mt-2 line-clamp-2">
          {post.excerpt}
        </p>

        <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-slate-500 text-xs">
          <span className="inline-flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5" />
            {formatDate(post.date)}
          </span>


          <span className="inline-flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5" />
            {post.read}
          </span>
        </div>
      </div>
    </article>
  );
}
