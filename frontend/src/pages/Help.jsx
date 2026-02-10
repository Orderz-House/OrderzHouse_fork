import { useState, useMemo } from "react";
import { HelpCircle, Search } from "lucide-react";
import Faq from "../components/main/sections/Faq.jsx";
import { DEFAULT_FAQS } from "../components/main/sections/Faq.jsx";

export default function Help() {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredFaqs = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return DEFAULT_FAQS;
    return DEFAULT_FAQS.filter(
      (f) =>
        f.question.toLowerCase().includes(q) ||
        f.answer.toLowerCase().includes(q)
    );
  }, [searchQuery]);

  return (
    <main className="min-h-screen bg-white text-slate-800">
      {/* Hero — same layout as Privacy/Terms: white, orange accents */}
      <section className="relative bg-white border-b border-slate-100">
        <div className="relative mx-auto max-w-6xl px-4 sm:px-6 pt-24 sm:pt-28 pb-10">
          <div className="flex items-start gap-6 mb-6">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-3xl bg-orange-50 border border-orange-200/70 grid place-items-center shadow-sm">
              <HelpCircle className="w-8 h-8 sm:w-10 sm:h-10 text-orange-700" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="h-2 w-20 rounded-full bg-gradient-to-b from-orange-400 to-red-500 mb-4" />
              <h1 className="text-3xl sm:text-5xl font-extrabold leading-tight tracking-tight text-slate-900">
                Help Center
              </h1>
              <p className="text-slate-600 mt-3">
                Find answers to common questions about billing, projects, and your account.
              </p>
              {/* Optional search */}
              <div className="mt-6 max-w-md relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="search"
                  placeholder="Search help articles..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-400"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Reuse existing FAQ section (Billing, Projects, Account, General grid + modal) */}
      <section className="pb-12">
        <Faq faqs={filteredFaqs} />
      </section>
    </main>
  );
}
