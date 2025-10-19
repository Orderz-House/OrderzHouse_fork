import { useParams, useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { ArrowLeft, Star, ShieldCheck, PlayCircle, CheckCircle2 } from "lucide-react";
import { getProjectByIdApi } from "./api/projects";

const THEME = "#028090";
const THEME_DARK = "#05668D";

export default function ProjectDetails() {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { state } = location;
  const [project, setProject] = useState(null);
  
  useEffect(() => {
    if (state?.project && String(state.project.id) === String(id)) {
      setProject(state.project);
    } else {
      getProjectByIdApi(id).then(setProject).catch(console.error);
    }
  }, [id, state]);

  if (!project) {
    return (
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="h-6 w-32 rounded bg-slate-200 animate-pulse mb-6" />
        <div className="grid lg:grid-cols-[1fr,380px] gap-8">
          <div>
            <div className="aspect-[16/9] w-full rounded-2xl bg-slate-200 animate-pulse mb-4" />
            <div className="mt-8 space-y-3">
              <div className="h-5 w-1/2 bg-slate-200 rounded animate-pulse" />
              <div className="h-4 w-full bg-slate-200 rounded animate-pulse" />
              <div className="h-4 w-3/4 bg-slate-200 rounded animate-pulse" />
            </div>
          </div>
          <aside className="h-[420px] rounded-2xl border border-slate-200 bg-white p-6">
            <div className="h-6 w-40 bg-slate-200 rounded animate-pulse mb-4" />
            <div className="h-10 w-full bg-slate-200 rounded animate-pulse" />
          </aside>
        </div>
      </section>
    );
  }

  return (
    <section className="relative bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <header className="mb-6">
          <h1 className="text-3xl md:text-4xl font-black tracking-tight" style={{ color: THEME_DARK }}>
            {project.title}
          </h1>
        </header>

        <div className="grid lg:grid-cols-[1fr,380px] gap-10">
          {/* Left: Content */}
          <div>
            {/* Image placeholder */}
            {project.cover && (
              <div className="rounded-2xl border border-slate-200 overflow-hidden bg-white mb-4">
                <div className="aspect-[16/9] bg-slate-50">
                  <img src={project.cover} alt={project.title} className="w-full h-full object-cover" />
                </div>
              </div>
            )}

            {/* Description */}
            <div className="mt-8">
              <h2 className="text-xl font-bold text-slate-800 mb-3">About this project</h2>
              <p className="leading-7 text-slate-700">{project.description || "No description provided."}</p>
            </div>
          </div>

          {/* Right: Sidebar */}
          <aside className="lg:sticky lg:top-24">
            <div className="rounded-2xl border border-slate-200 shadow-sm bg-white overflow-hidden">
              <div className="p-6 border-b border-slate-100">
                <div className="mt-5 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 text-sm">Budget</span>
                    <span className="text-2xl font-black" style={{ color: THEME_DARK }}>
                      ${project.budget}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-500">Duration</span>
                    <span className="font-semibold text-slate-700">{project.duration_days ?? "—"} day(s)</span>
                  </div>
                </div>
              </div>

              <div className="p-6 space-y-3">
                <button
                  className="w-full h-11 rounded-xl text-white font-semibold transition hover:shadow-lg"
                  style={{ backgroundColor: THEME }}
                >
                  Get this project
                </button>
                <button
                  className="w-full h-11 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold transition"
                >
                  Contact seller
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
              </div>
            </div>

            {/* Back button */}
            <button
              onClick={() => navigate(-1)}
              className="mt-4 inline-flex items-center gap-2 text-slate-600 hover:text-slate-800"
            >
              <ArrowLeft className="w-4 h-4" /> Back
            </button>
          </aside>
        </div>
      </div>
    </section>
  );
}