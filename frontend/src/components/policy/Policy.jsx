import { useMemo, useState } from "react";
import {
  Shield,
  FileText,
  Search,
  Download,
  Lock,
  KeyRound,
  Database,
  Globe,
  Mail,
  ChevronDown,
  ChevronRight,
  CheckCircle2,
  ArrowUpRight,
} from "lucide-react";

export default function Policy() {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState({});

  const sections = useMemo(
    () => [
      {
        id: "intro",
        title: "Introduction",
        icon: Shield,
        bullets: [
          "We respect your privacy and aim for full transparency.",
          "This policy explains what we collect, why, and how we use it.",
          "Using our platform means you agree to this policy.",
        ],
        body:
          "We keep things concise and human-friendly. We never sell your data. We only process what is necessary to run the platform, improve reliability, and keep your account secure.",
      },
      {
        id: "collection",
        title: "What We Collect",
        icon: Database,
        bullets: [
          "Account data: name, email, role (Admin / Client / Freelancer).",
          "Usage data: pages viewed, preferences, diagnostics.",
          "Files: profile images and attachments related to projects.",
        ],
        body:
          "We collect the minimum data required to create your account, personalize your experience, and protect the system from abuse. Certain features store preferences locally in your browser.",
      },
      {
        id: "cookies",
        title: "Cookies & Preferences",
        icon: FileText,
        bullets: [
          "Session cookies to keep you signed in securely.",
          "Preference cookies for language and theme.",
          "You can control them from your browser settings.",
        ],
        body:
          "Cookies simplify your experience (remembering language, dark mode) and secure sessions. You can refuse some cookies, but a few features may not work as expected.",
      },
      {
        id: "sharing",
        title: "Sharing & Third Parties",
        icon: Globe,
        bullets: [
          "We do not sell your data to advertisers.",
          "Trusted providers for email, storage, and analytics only.",
          "We share the least amount of information necessary.",
        ],
        body:
          "We may rely on reputable vendors to deliver parts of the service. They are bound by data-protection agreements and only receive data required to perform their tasks.",
      },
      {
        id: "security",
        title: "Security & Access",
        icon: Lock,
        bullets: [
          "Encryption in transit (HTTPS).",
          "Role-based internal access (principle of least privilege).",
          "Periodic reviews and abuse monitoring.",
        ],
        body:
          "We secure traffic with TLS, restrict staff access by role, apply logging/alerting, and review our controls regularly. If a breach occurs, we will notify affected users where required by law.",
      },
      {
        id: "rights",
        title: "Your Rights",
        icon: KeyRound,
        bullets: [
          "Access and receive a copy of your data.",
          "Request correction or deletion where possible.",
          "Withdraw consent and exercise data portability.",
        ],
        body:
          "Contact us to exercise your rights. We will verify your identity and respond within a reasonable timeframe according to applicable regulations.",
      },
    ],
    []
  );

  const filtered = useMemo(() => {
    const t = query.trim().toLowerCase();
    if (!t) return sections;
    return sections.filter(
      (s) =>
        s.title.toLowerCase().includes(t) ||
        s.body.toLowerCase().includes(t) ||
        (s.bullets || []).some((b) => b.toLowerCase().includes(t))
    );
  }, [query, sections]);

  const toggle = (id) => setOpen((p) => ({ ...p, [id]: !p[id] }));
  const expandAll = () => setOpen(Object.fromEntries(filtered.map((s) => [s.id, true])));
  const collapseAll = () => setOpen(Object.fromEntries(filtered.map((s) => [s.id, false])));

  return (
    <div className="min-h-screen bg-white">
      {/* HERO — white background, orange accent, navbar spacing */}
      <section className="relative bg-white border-b border-slate-100">
        <div className="relative mx-auto max-w-6xl px-4 sm:px-6 pt-24 sm:pt-28 pb-16 sm:pb-20">
          <div className="flex items-start gap-6">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-3xl bg-orange-50 border border-orange-200/70 grid place-items-center shadow-sm">
              <Shield className="w-8 h-8 sm:w-10 sm:h-10 text-orange-700" />
            </div>
            <div>
              <div className="h-2 w-20 rounded-full bg-gradient-to-b from-orange-400 to-red-500 mb-4" />
              <h1 className="text-3xl sm:text-5xl font-bold leading-tight text-slate-900">
                Privacy & Data Policy
              </h1>
              <p className="text-slate-600 mt-3 max-w-2xl">
                A modern, transparent policy designed to be clear and easy to skim.
              </p>

              {/* Quick tiles */}
              <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { icon: Shield, label: "Privacy First" },
                  { icon: Lock, label: "Secure by Default" },
                  { icon: Database, label: "Minimal Data" },
                  { icon: Globe, label: "Trusted Vendors" },
                ].map((t, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-2 rounded-xl bg-orange-50 text-orange-700 border border-orange-200/70 px-3 py-2 hover:bg-orange-100 transition"
                  >
                    <t.icon className="w-4 h-4 text-orange-700" />
                    <span className="text-sm">{t.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CONTENT — white card overlapping hero */}
      <div className="relative -mt-10 mx-auto max-w-6xl px-4">
        <main className="rounded-3xl bg-white border border-slate-200/70 shadow-sm overflow-hidden">
          <div className="px-4 sm:px-6 lg:px-8 py-10 space-y-10">
        {/* DATA LIFECYCLE */}
        <section className="rounded-2xl bg-white shadow-sm border border-slate-200 overflow-hidden">
          <div className="bg-gradient-to-r from-orange-400 to-red-500 text-white px-6 py-4">
            <h2 className="text-lg font-semibold">Data Lifecycle</h2>
            <p className="text-white/80 text-sm">
              How your data travels through our system — from collection to deletion.
            </p>
          </div>

          <div className="px-6 py-6">
            <ol className="relative border-slate-200">
              {[
                {
                  title: "Collect (Minimal)",
                  desc:
                    "We only ask for the essentials to create your account and deliver core features.",
                },
                {
                  title: "Store (Encrypted in transit)",
                  desc:
                    "Traffic uses TLS (HTTPS). Storage uses secure, access-controlled services.",
                },
                {
                  title: "Use (Purpose-bound)",
                  desc:
                    "We use data solely to operate the platform, improve quality, and prevent abuse.",
                },
                {
                  title: "Share (When necessary)",
                  desc:
                    "Limited sharing with trusted providers under data-protection agreements.",
                },
                {
                  title: "Delete / Export (Your control)",
                  desc:
                    "You can request deletion or a portable copy; we respect applicable regulations.",
                },
              ].map((step, i) => (
                <li key={i} className="grid grid-cols-[28px,1fr] gap-4 py-4">
                  <div className="relative">
                    <div className="w-7 h-7 rounded-full bg-orange-500 grid place-items-center text-white shadow">
                      {i + 1}
                    </div>
                    {i < 4 && (
                      <span className="absolute left-1/2 top-7 -translate-x-1/2 h-full w-px bg-slate-200" />
                    )}
                  </div>
                  <div>
                    <div className="font-semibold text-slate-900">{step.title}</div>
                    <div className="text-slate-600 text-sm">{step.desc}</div>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* ACCORDION SECTIONS */}
        <section className="space-y-4">
          {filtered.map((s) => {
            const Icon = s.icon || FileText;
            const isOpen = open[s.id] ?? false;
            return (
              <article
                key={s.id}
                className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden"
              >
                <button
                  onClick={() => toggle(s.id)}
                  className="w-full text-left px-5 py-4 flex items-start sm:items-center gap-4 hover:bg-slate-50"
                >
                  <div className="shrink-0 p-2.5 rounded-xl bg-gradient-to-br from-orange-400 to-red-500 text-white shadow">
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-base sm:text-lg font-semibold text-slate-900">
                      {s.title}
                    </h3>
                    <div className="mt-2 hidden sm:flex flex-wrap gap-2">
                      {(s.bullets || []).slice(0, 3).map((b, i) => (
                        <span
                          key={i}
                          className="inline-flex items-center gap-1 text-[12px] px-2 py-1 rounded-lg bg-slate-100 text-slate-700"
                        >
                          <CheckCircle2 className="w-3 h-3 text-orange-600" />
                          {b}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="shrink-0 text-slate-400">
                    {isOpen ? <ChevronDown className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
                  </div>
                </button>

                <div
                  className={`grid transition-[grid-template-rows] duration-300 ease-in-out ${
                    isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
                  }`}
                >
                  <div className="overflow-hidden">
                    <div className="px-5 pb-5 space-y-4">
                      <p className="text-slate-700 leading-relaxed">{s.body}</p>
                      {Array.isArray(s.bullets) && s.bullets.length > 0 && (
                        <ul className="grid sm:grid-cols-2 gap-2">
                          {s.bullets.map((b, i) => (
                            <li key={i} className="flex items-start gap-2 text-slate-700">
                              <CheckCircle2 className="w-4 h-4 text-orange-600 mt-0.5" />
                              <span className="text-sm">{b}</span>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </div>
                </div>
              </article>
            );
          })}
        </section>

          </div>
        </main>
      </div>

      {/* FOOTER NOTE */}
      <footer className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 text-center text-slate-500">
        <div className="inline-flex items-center gap-2">
          <ArrowUpRight className="w-4 h-4" />
          <span>Last updated: Jan 2025 — We’ll post updates here.</span>
        </div>
      </footer>
    </div>
  );
}
