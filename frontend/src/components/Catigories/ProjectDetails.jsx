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


  // infer mode based on URL (/tasks or /projects)
  const inferredMode = location.pathname.startsWith("/tasks")
    ? "tasks"
    : "projects";
  const mode = propMode || inferredMode;

  // read-only & role info
  const readOnly = !!location.state?.readOnly;
  const roleLabel = location.state?.role || "guest";

  const { userData } = useSelector((s) => s?.auth || {}) || {};
  const roleIdFromRedux =
    userData?.role_id ?? userData?.roleId ?? userData?.role ?? null;
  const roleId =
    (typeof roleIdFromRedux === "number" ? roleIdFromRedux : null) ??
    (typeof window !== "undefined" &&
    /^\d+$/.test(localStorage.getItem("role") || "")
      ? Number(localStorage.getItem("role"))
      : null);

  const isClient = roleId === 2;
  const isFreelancer = roleId === 3;

  useEffect(() => {
    const stateObj = location.state?.project;
    if (stateObj && String(stateObj.id) === String(id)) {
      setItem(stateObj);
      return;
    }

    // choose correct loader: task or project
    const loader = mode === "tasks" ? getTaskByIdApi : getProjectByIdApi;
    loader(id)
      .then((res) => setItem(res.task || res.project || res))
      .catch(console.error);
  }, [id, location.state, mode]);

  // Loading placeholder
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
  const projectType = item?.type;
  const isTasks = mode === "tasks";

  // permission logic
  let canAccept = true;
  if (isTasks && isFreelancer) canAccept = false;
  if (!isTasks && isClient) canAccept = false;

  let canContact = true;
  if (!isTasks && isClient) canContact = false;

  let acceptLabel = isTasks ? "Get this task" : "Get this project";
  if (!isTasks && isFreelancer && projectType === "bidding") {
    acceptLabel = "Send Offer";
  }
  const contactLabel = isTasks ? "Contact freelancer" : "Contact seller";

  const acceptTitle = !canAccept
    ? isTasks
      ? "Freelancers can't accept tasks. Only clients can accept tasks."
      : "Clients can't accept projects. You can accept tasks."
    : "";

  const contactTitle = !canContact
    ? "Clients can't contact sellers on projects."
    : "";

  const acceptClasses =
    "w-full h-11 rounded-xl text-white font-semibold transition " +
    (canAccept
      ? "hover:shadow-lg"
      : "opacity-40 grayscale cursor-not-allowed hover:shadow-none");
  const contactClasses =
    "w-full h-11 rounded-xl border text-slate-700 font-semibold transition " +
    (canContact
      ? "hover:bg-slate-50"
      : "opacity-40 grayscale cursor-not-allowed hover:bg-white");

  return (
    <section className="relative bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <header className="mb-6">
          <div className="flex items-center justify-between">
            <h1
              className="text-3xl md:text-4xl font-black tracking-tight"
              style={{ color: THEME_DARK }}
            >
              {title}
            </h1>

            {readOnly && (
              <span className="text-xs px-2.5 py-1 rounded-full bg-slate-100 text-slate-600">
                Read-only ({roleLabel})
              </span>
            )}
          </div>
        </header>

        {/* Main layout */}
        <div className="grid lg:grid-cols-[1fr,380px] gap-10">
          {/* Left content */}
          <div>
            {cover && (
              <div className="rounded-2xl border border-slate-200 overflow-hidden bg-white mb-4">
                <div className="aspect-[16/9] bg-slate-50">
                  <img
                    src={cover}
                    alt={title}
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            )}

            <div className="mt-8">
              <h2 className="text-xl font-bold text-slate-800 mb-3">
                {isTasks ? "About this task" : "About this project"}
              </h2>
              <p className="leading-7 text-slate-700">
                {item.description || "No description provided."}
              </p>
            </div>
          </div>

          {/* Right sidebar */}
          <aside className="lg:sticky lg:top-24">
            <div className="rounded-2xl border border-slate-200 shadow-sm bg-white overflow-hidden">
              <div className="p-6 border-b border-slate-100">
                {/* Budget & duration */}
                <div className="mt-5 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 text-sm">Budget</span>
                    <span
                      className="text-2xl font-black"
                      style={{ color: THEME_DARK }}
                    >
                      ${price ?? "—"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-500">Duration</span>
                    <span className="font-semibold text-slate-700">
                      {duration} day(s)
                    </span>
                  </div>
                </div>
              </div>

              {/* Action buttons */}
              <div className="p-6 space-y-3">
                <div title={acceptTitle || undefined}>
                  <button
                    className={acceptClasses}
                    style={{ backgroundColor: THEME }}
                    disabled={!canAccept}
                    aria-disabled={!canAccept}
                  >
                    {acceptLabel}
                  </button>
                </div>

                <div title={contactTitle || undefined}>
                  <button
                    className={contactClasses}
                    disabled={!canContact}
                    aria-disabled={!canContact}
                  >
                    {contactLabel}
                  </button>
                </div>

                {/* Extra details */}
                <ul className="mt-4 space-y-2 text-sm text-slate-600">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Secure
                    checkout
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />{" "}
                    Money-back guarantee
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" /> 24/7
                    support
                  </li>
                </ul>
              </div>
            </div>

            {/* back button */}
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
