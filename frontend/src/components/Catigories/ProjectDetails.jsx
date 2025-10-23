import { useParams, useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { ArrowLeft, CheckCircle2 } from "lucide-react";
import { getProjectByIdApi } from "./api/projects";
import { getTaskByIdApi } from "./api/tasks";
import { useSelector } from "react-redux";

const THEME = "#028090";
const THEME_DARK = "#05668D";

export default function ProjectDetails({ mode: propMode }) {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [item, setItem] = useState(null);

  // infer mode from pathname
  const inferredMode = location.pathname.startsWith("/tasks") ? "tasks" : "projects";
  const mode = propMode || inferredMode;

  // read-only flags (when opened from a read-only route)
  const readOnly = !!location.state?.readOnly;
  const role = location.state?.role || "guest";

  // --- Role-based permissions ---
  const { userData } = useSelector((s) => s.auth) || {};
  const roleId = userData?.role_id;
  const isClient = roleId === 2;
  const isFreelancer = roleId === 3;

  const isTasks = mode === "tasks";

  // Who can accept / contact?
  let canAccept = true;
  if (isTasks && isFreelancer) canAccept = false; // freelancers cannot accept tasks
  if (!isTasks && isClient) canAccept = false;    // clients cannot accept projects

  let canContact = true;
  if (!isTasks && isClient) canContact = false;   // clients cannot contact seller on projects

  const acceptLabel  = isTasks ? "Get this task" : "Get this project";
  const contactLabel = isTasks ? "Contact freelancer" : "Contact seller";

  const acceptTitle = !canAccept
    ? (isTasks
        ? "Freelancers cannot accept tasks. Only clients can accept tasks."
        : "Clients cannot accept projects. You can accept tasks.")
    : "";

  const contactTitle = !canContact
    ? "Clients cannot contact sellers on projects."
    : "";

  useEffect(() => {
    const stateObj = location.state?.project; // keep same key name used when navigating
    if (stateObj && String(stateObj.id) === String(id)) {
      setItem(stateObj);
      return;
    }
    const loader = mode === "tasks" ? getTaskByIdApi : getProjectByIdApi;
    loader(id).then(setItem).catch(console.error);
  }, [id, location.state, mode]);

  if (!item) {
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

  const title = item.title;
  const cover = item.cover;
  const price = item?.budget ?? item?.price;
  const duration = item.duration_days ?? "—";

  return (
    <section className="relative bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <header className="mb-6">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl md:text-4xl font-black tracking-tight" style={{ color: THEME_DARK }}>
              {title}
            </h1>

            {readOnly && (
              <span className="text-xs px-2.5 py-1 rounded-full bg-slate-100 text-slate-600">
                Read-only ({role})
              </span>
            )}
          </div>
        </header>

        <div className="grid lg:grid-cols-[1fr,380px] gap-10">
          {/* Left: Content */}
          <div>
            {cover && (
              <div className="rounded-2xl border border-slate-200 overflow-hidden bg-white mb-4">
                <div className="aspect-[16/9] bg-slate-50">
                  <img src={cover} alt={title} className="w-full h-full object-cover" />
                </div>
              </div>
            )}

            <div className="mt-8">
              <h2 className="text-xl font-bold text-slate-800 mb-3">
                {mode === "tasks" ? "About this task" : "About this project"}
              </h2>
              <p className="leading-7 text-slate-700">{item.description || "No description provided."}</p>
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
                      ${price ?? "—"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-500">Duration</span>
                    <span className="font-semibold text-slate-700">{duration} day(s)</span>
                  </div>
                </div>
              </div>

              <div className="p-6 space-y-3">
                {!readOnly ? (
                  <>
                    {/* Accept button */}
                    <div title={acceptTitle || undefined}>
                      <button
                        className={
                          "w-full h-11 rounded-xl text-white font-semibold transition " +
                          (!canAccept ? "opacity-50 cursor-not-allowed" : "hover:shadow-lg")
                        }
                        style={{ backgroundColor: THEME }}
                        disabled={!canAccept}
                        aria-disabled={!canAccept}
                      >
                        {acceptLabel}
                      </button>
                    </div>

                    {/* Contact button */}
                    <div title={contactTitle || undefined}>
                      <button
                        className={
                          "w-full h-11 rounded-xl border border-slate-200 text-slate-700 font-semibold transition " +
                          (!canContact ? "opacity-50 cursor-not-allowed" : "hover:bg-slate-50")
                        }
                        disabled={!canContact}
                        aria-disabled={!canContact}
                      >
                        {contactLabel}
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="text-sm text-slate-600">
                    {mode === "tasks"
                      ? "This is a read-only view. You can review scope, budget and timeline as provided by the freelancer."
                      : "This is a read-only view. You can review scope, budget and timeline as provided by the client."}
                  </div>
                )}

                <ul className="mt-4 space-y-2 text-sm text-slate-600">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Scope locked
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Details only
                  </li>
                </ul>
              </div>
            </div>

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
