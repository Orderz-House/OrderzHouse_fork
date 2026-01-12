import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import ContractPdfPanel from "./ContractPdfPanel.jsx";

const THEME_PRIMARY = "#6d5ffd";
const THEME_ACCENT = "#8B5CF6";

const STORAGE_KEY = "freelancer_contract_data";
const TERMS_ACCEPT_KEY = "freelancer_terms_accepted";

/**
 * FreelancerContractSignup
 * - Standalone page (no AdminLayout)
 * - Collects freelancer data
 * - Adds: PDF Preview + Print (filled with entered data)
 *
 * Notes:
 * - Put your template PDF in: /public/contracts/freelancer-contract-template.pdf
 * - Install dependency: npm i pdf-lib
 */
export default function FreelancerContractSignup() {
  const nav = useNavigate();

  // Gate: if terms not accepted, redirect to Terms page
  useEffect(() => {
    const okRaw = localStorage.getItem(TERMS_ACCEPT_KEY);
    const ok = okRaw === "true" || okRaw === "1";
    if (!ok) nav("/freelancer/contract-terms", { replace: true });
  }, [nav]);

  const [form, setForm] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "null");
      if (saved && typeof saved === "object") return saved;
    } catch {}
    return {
      duration: "Until the end of 2025",
      fullName: "",
      nationalId: "",
      country: "",
      specialty: "",
      governorate: "",
      area: "",
      neighborhood: "",
      street: "",
      building: "",
      apartment: "",
      jobTitle: "",
      endDate: "2025-12-31",
      issueDay: "",
    };
  });

  // Set a default issue day (only if empty)
  useEffect(() => {
    if (form.issueDay) return;
    const d = new Date();
    const dayName = d.toLocaleDateString("en-US", { weekday: "long" });
    setForm((p) => ({ ...p, issueDay: dayName }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const [pdfOpen, setPdfOpen] = useState(false);
  const [pdfAutoPrint, setPdfAutoPrint] = useState(false);

  const requiredOk = useMemo(() => {
    // Minimum required to preview a meaningful PDF
    return Boolean(form.fullName && form.nationalId);
  }, [form.fullName, form.nationalId]);

  const inputBase =
    "w-full h-11 rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-200";
  const labelBase = "text-[12px] font-semibold text-slate-700";

  const card =
    "rounded-3xl bg-white border border-slate-200 shadow-[0_20px_60px_-40px_rgba(2,6,23,.35)]";

  const saveDraft = () => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(form));
    } catch {}
  };

  const openPreview = () => {
    saveDraft();
    setPdfAutoPrint(false);
    setPdfOpen(true);
  };

  const openPrint = () => {
    saveDraft();
    setPdfAutoPrint(true);
    setPdfOpen(true);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800">
      {/* soft background gradient */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-x-0 -z-10 mx-auto mt-[-40px] h-56 w-[88%] max-w-4xl rounded-full blur-3xl opacity-30"
        style={{ background: `linear-gradient(90deg, ${THEME_PRIMARY}, ${THEME_ACCENT})` }}
      />

      <div className="max-w-5xl mx-4 md:mx-auto pt-8 pb-12">
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <div className="text-2xl md:text-3xl font-extrabold text-slate-900">
              Contract Signup
            </div>
            <div className="mt-1 text-sm text-slate-600">
              Fill your details, then preview/print the contract PDF.
            </div>
          </div>

          <button
            type="button"
            onClick={() => nav(-1)}
            className="h-10 px-4 rounded-2xl border border-slate-200 bg-white text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            Back
          </button>
        </div>

        {/* Main layout */}
        <div className="mt-6 grid grid-cols-1 lg:grid-cols-[1.2fr_.8fr] gap-5">
          {/* Form */}
          <div className={card + " p-5 md:p-6"}>
            <div className="text-sm font-extrabold text-slate-900">Your details</div>
            <div className="mt-1 text-[12px] text-slate-500">
              These values will be injected into the PDF template.
            </div>

            <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <div className={labelBase}>Contract duration</div>
                <input
                  className={inputBase + " mt-2"}
                  value={form.duration}
                  onChange={(e) => setForm((p) => ({ ...p, duration: e.target.value }))}
                  placeholder="e.g. Until the end of 2025"
                />
              </div>

              <div className="md:col-span-2">
                <div className={labelBase}>Full name</div>
                <input
                  className={inputBase + " mt-2"}
                  value={form.fullName}
                  onChange={(e) => setForm((p) => ({ ...p, fullName: e.target.value }))}
                  placeholder="Your full name"
                />
              </div>

              <div>
                <div className={labelBase}>National ID</div>
                <input
                  className={inputBase + " mt-2"}
                  value={form.nationalId}
                  onChange={(e) => setForm((p) => ({ ...p, nationalId: e.target.value }))}
                  placeholder="National ID / Passport"
                />
              </div>

              <div>
                <div className={labelBase}>Country</div>
                <input
                  className={inputBase + " mt-2"}
                  value={form.country}
                  onChange={(e) => setForm((p) => ({ ...p, country: e.target.value }))}
                  placeholder="Country"
                />
              </div>

              <div>
                <div className={labelBase}>Specialty</div>
                <input
                  className={inputBase + " mt-2"}
                  value={form.specialty}
                  onChange={(e) => setForm((p) => ({ ...p, specialty: e.target.value }))}
                  placeholder="Specialty"
                />
              </div>

              <div>
                <div className={labelBase}>Governorate</div>
                <input
                  className={inputBase + " mt-2"}
                  value={form.governorate}
                  onChange={(e) => setForm((p) => ({ ...p, governorate: e.target.value }))}
                  placeholder="Governorate"
                />
              </div>

              <div>
                <div className={labelBase}>Area</div>
                <input
                  className={inputBase + " mt-2"}
                  value={form.area}
                  onChange={(e) => setForm((p) => ({ ...p, area: e.target.value }))}
                  placeholder="Area"
                />
              </div>

              <div>
                <div className={labelBase}>Neighborhood</div>
                <input
                  className={inputBase + " mt-2"}
                  value={form.neighborhood}
                  onChange={(e) => setForm((p) => ({ ...p, neighborhood: e.target.value }))}
                  placeholder="Neighborhood"
                />
              </div>

              <div>
                <div className={labelBase}>Street</div>
                <input
                  className={inputBase + " mt-2"}
                  value={form.street}
                  onChange={(e) => setForm((p) => ({ ...p, street: e.target.value }))}
                  placeholder="Street"
                />
              </div>

              <div>
                <div className={labelBase}>Building</div>
                <input
                  className={inputBase + " mt-2"}
                  value={form.building}
                  onChange={(e) => setForm((p) => ({ ...p, building: e.target.value }))}
                  placeholder="Building number/name"
                />
              </div>

              <div>
                <div className={labelBase}>Apartment</div>
                <input
                  className={inputBase + " mt-2"}
                  value={form.apartment}
                  onChange={(e) => setForm((p) => ({ ...p, apartment: e.target.value }))}
                  placeholder="Apartment number"
                />
              </div>

              <div className="md:col-span-2">
                <div className={labelBase}>Job title</div>
                <input
                  className={inputBase + " mt-2"}
                  value={form.jobTitle}
                  onChange={(e) => setForm((p) => ({ ...p, jobTitle: e.target.value }))}
                  placeholder="Job title"
                />
              </div>

              <div>
                <div className={labelBase}>Issue day (optional)</div>
                <input
                  className={inputBase + " mt-2"}
                  value={form.issueDay}
                  onChange={(e) => setForm((p) => ({ ...p, issueDay: e.target.value }))}
                  placeholder="e.g. Monday"
                />
              </div>

              <div>
                <div className={labelBase}>End date (optional)</div>
                <input
                  className={inputBase + " mt-2"}
                  value={form.endDate}
                  onChange={(e) => setForm((p) => ({ ...p, endDate: e.target.value }))}
                  placeholder="YYYY-MM-DD"
                />
              </div>
            </div>

            <div className="mt-6 flex flex-col md:flex-row gap-3">
              <button
                type="button"
                onClick={openPreview}
                disabled={!requiredOk}
                className={`h-11 rounded-2xl px-4 text-sm font-semibold border transition ${
                  requiredOk
                    ? "bg-white border-slate-200 text-slate-800 hover:bg-slate-50"
                    : "bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed"
                }`}
              >
                Preview PDF
              </button>

              <button
                type="button"
                onClick={openPrint}
                disabled={!requiredOk}
                className={`h-11 rounded-2xl px-4 text-sm font-semibold transition ${
                  requiredOk ? "text-white" : "text-white/70 cursor-not-allowed"
                }`}
                style={{
                  background: requiredOk
                    ? `linear-gradient(135deg, ${THEME_PRIMARY}, ${THEME_ACCENT})`
                    : "linear-gradient(135deg, rgba(109,95,253,.35), rgba(139,92,246,.35))",
                }}
              >
                Print PDF
              </button>

              <div className="flex-1" />

              <button
                type="button"
                onClick={() => {
                  saveDraft();
                  nav("/freelancer/contract");
                }}
                className="h-11 rounded-2xl px-4 text-sm font-semibold bg-slate-900 text-white hover:bg-slate-800"
              >
                Continue
              </button>
            </div>

            {!requiredOk ? (
              <div className="mt-3 text-[12px] text-slate-500">
                Enter at least <span className="font-semibold">Full name</span> and{" "}
                <span className="font-semibold">National ID</span> to preview/print.
              </div>
            ) : null}
          </div>

          {/* Side card */}
          <div className={card + " p-5 md:p-6"}>
            <div className="text-sm font-extrabold text-slate-900">Template</div>
            <div className="mt-2 text-[12px] text-slate-600">
              Make sure your PDF exists here:
            </div>

            <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <div className="text-[12px] font-semibold text-slate-700">Template URL</div>
              <div className="mt-1 text-[12px] font-mono text-slate-600">
                /contracts/freelancer-contract-template.pdf
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* PDF Preview Modal */}
      <ContractPdfPanel
        open={pdfOpen}
        onClose={() => {
          setPdfOpen(false);
          setPdfAutoPrint(false);
        }}
        autoPrint={pdfAutoPrint}
        onPrinted={() => setPdfAutoPrint(false)}
        templateUrl="/contracts/freelancer-contract-template.pdf"
        data={{
          ...form,
          signatureText: form.fullName ? `${form.fullName} (e-signed)` : "",
        }}
      />
    </div>
  );
}
