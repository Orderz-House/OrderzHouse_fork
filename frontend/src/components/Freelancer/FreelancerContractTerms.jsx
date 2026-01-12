import { useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ArrowLeft, ShieldCheck } from "lucide-react";

/**
 * Standalone verification page (NO AdminLayout / NO Sidebar / NO Topbar)
 * - Dashboard-like theme (light + purple gradient hero)
 * - Same logic: user must agree, then we store localStorage keys.
 * - Redirect behavior:
 *    - Open with: /verify-account?redirect=/client/dashboard
 *      it will navigate to that path after accepting.
 *    - Otherwise it will go back to the previous page.
 *
 * Updates in this version:
 * - Full English UI + content
 * - Beautiful custom scrollbar (scoped to the scroll container)
 */

const THEME = {
  BG: "#F6F7FB",
  SHADOW: "0 10px 30px rgba(15,23,42,0.06)",
  RING: "rgba(15,23,42,0.10)",
  PRIMARY: "#6366F1",
  PRIMARY_DARK: "#4F46E5",
};

const TERMS_ACCEPT_KEY = "freelancer_terms_accepted";
const TERMS_ACCEPT_AT_KEY = "freelancer_terms_accepted_at";

export default function FreelancerContractTerms() {
  const nav = useNavigate();
  const location = useLocation();
  const [agreed, setAgreed] = useState(false);

  const redirectTo = (() => {
    try {
      const sp = new URLSearchParams(location.search);
      return sp.get("redirect");
    } catch {
      return null;
    }
  })();

  const sections = useMemo(
    () => [
      {
        title: "Civil Contract – Contracting Agreement",
        paras: [
          `Fixed-term contract on the freelance platform "com.orderzhouse.www".`,
          `Technology Batman Co. (Al-Rajul Al-Watwat for Technology) — Party One: Technology Batman, represented for the purposes of this agreement by its authorized signatory: Asem Abdullah Al-Qaisi, Establishment National No.: 200185304, located at: Amman, Hashemite Kingdom of Jordan, Al-Madinah Al-Munawwarah St., Al-Basim Complex 2, Office 405.`,
          `Party Two: The Freelancer (independent contractor).`,
        ],
      },
      {
        title: "Preamble",
        paras: [
          `Whereas Party One is a limited liability company operating in website design, information technology, marketing, and computer maintenance; and whereas Party Two has expressed willingness and readiness to work with Party One in the mentioned fields, and acknowledges their knowledge, experience, and competence in this domain; the parties have agreed to the following:`,
        ],
      },
      {
        title: "General Terms",
        paras: [
          `1) The preamble of this contract is an integral part of it and shall be read as one unit with it.`,
          `2) Party Two agrees to perform and complete the tasks assigned by Party One or its clients within the role defined in this contract, through the approved online platform or any other means designated by Party One.`,
          `3) Tasks will be sent to Party Two with their details and conditions; executing them according to specifications is an essential contractual obligation.`,
          `4) By signing this contract, Party Two acknowledges reviewing and accepting the violations & internal procedures guide adopted by Party One, which shall act as an essential annex to this contract.`,
          `5) In case of dispute, it shall be resolved via arbitration in accordance with the laws in force in the Hashemite Kingdom of Jordan. Party One reserves the right to terminate the contract unilaterally according to the Violations Guide without the need to justify the decision to Party Two.`,
          `6) The parties acknowledge that this is an independent contracting relationship (freelance) and not an employment relationship; it does not fall under the Jordanian Labor Law and entails no labor rights such as social security, leaves, or other employment-related obligations.`,
          `7) Party One commits to paying Party Two for approved and finally accepted tasks, according to the prior agreement attached to each task.`,
        ],
      },
      {
        title: "Penalties & Obligations (Articles)",
        paras: [
          `Article 1: Non-competition — Party Two commits not to work or cooperate in any way with entities competing with Party One’s business within Jordan or the Gulf countries during the term of this contract and for five years after its termination, unless Party One permanently ceases its business.`,
          `Article 2: Interruption / delay — If Party Two stops working or delays executing tasks for more than three months without acceptable reason, the contract is considered automatically terminated and Party Two forfeits all rights.`,
          `Article 3: Nature of relationship — Party Two acknowledges that the relationship is a civil contractual relationship governed by civil law and is not subject to labor laws or labor rights.`,
          `Article 4: Delivery & communication — Party Two must deliver tasks on time through the official channels and implement required revisions within the scope without delay.`,
          `Article 5: Accepting tasks — Party Two is obligated to execute any task assigned, and unjustified refusal is considered a breach.`,
          `Article 6: Quality & technical breach — If Party Two delivers work of inadequate quality or contrary to specifications, Party One may terminate immediately without obligations toward Party Two.`,
          `Article 7: Public statements & attribution — Party Two may not declare or advertise working with Party One or its clients, nor claim attribution of works, without written approval.`,
          `Article 8: Confidentiality & no client contact — Party Two must keep information confidential and must not use/share it; Party Two is prohibited from contacting Party One’s clients without permission.`,
          `Article 9: Personal work / no delegation — Party Two must perform tasks personally and may not delegate or involve any person without prior written approval.`,
          `Article 10: Accuracy of information — Party Two confirms the accuracy of their data and CV, and must notify Party One of any updates.`,
          `Article 11: Intellectual property — Ownership of all delivered works belongs to Party One, and Party Two may not use or retain them after delivery.`,
          `Article 12: Deletion of files — Party Two must delete all work files from their devices after delivery and may not keep copies.`,
          `Article 13: Payments — Party Two’s dues are paid within a reasonable period after acceptance, via Party One’s available methods.`,
          `Article 14: Delay or termination — If Party One delays payment due to circumstances beyond its control or if Party Two terminates, dues will be settled within a reasonable time without waiving rights.`,
          `Article 15: Intentional harm / material breach — Any intentional harm or deliberate non-compliance is a material breach granting Party One the right to terminate and claim damages without notice.`,
          `Article 16: Tools & property — Party Two must safeguard any devices/documents received from Party One and return them upon request or at termination.`,
          `Article 17: Prohibited technical actions — Party Two may not use tools that could harm Party One’s platforms or data; this is considered a serious violation.`,
          `Article 18: Professional conduct — Party Two must maintain professional behavior and refrain from insulting Party One or its clients by any means.`,
          `Article 19: Internal policy — Party One’s internal policy is part of this contract; any violation is a violation of the contract and may trigger accountability.`,
        ],
      },
      {
        title: "Additional Clauses",
        paras: [
          `8) Party Two commits to all technical and execution conditions described in this contract and its annexes; any breach may lead to contractual or legal measures.`,
          `9) Party Two is prohibited from publishing or disclosing any work-related information or data, whether in writing, verbally, via email, social media, or the internet; this is a violation that may result in termination and claims for compensation in accordance with legal procedures.`,
          `10) Party Two acknowledges that this relationship does not constitute an employment contract and does not grant any legal status under the Ministry of Labor; it is the provision of freelance services under this contract.`,
          `11) No prior warnings/notifications are required in case of breach of any clause. In case of dispute, jurisdiction is for the courts of the Hashemite Kingdom of Jordan.`,
          `12) Party Two may not advertise, publish, or refer to cooperation with the freelance website (or any entity of Party One) through social media or any means without prior written approval. The only exception is listing the website name within a CV or interviews without promotion/marketing.`,
          `13) “Technology Batman” is the responsible entity for filing and following up any legal claim related to this contract before the competent authorities in Jordan, and this contract shall be considered an executable instrument by itself.`,
          `14) This contract consists of a preamble and fourteen clauses, to be read and interpreted as one unit, and all apply without the need to separately divide or interpret any part.`,
        ],
      },
    ],
    []
  );

  const onContinue = () => {
    localStorage.setItem(TERMS_ACCEPT_KEY, "true");
    // Backward-compatible flag (some pages used "1")
    localStorage.setItem(TERMS_ACCEPT_KEY, "1");
    localStorage.setItem(TERMS_ACCEPT_AT_KEY, new Date().toISOString());

    if (redirectTo) nav(redirectTo, { replace: true });
    else nav("/freelancer/contract-signup", { replace: true });
  };

  return (
    <div className="min-h-[100dvh] overflow-x-hidden" style={{ background: THEME.BG }}>
      {/* Pretty scrollbar (scoped) */}
      <style>{`
        .pretty-scroll{
          scrollbar-width: thin;
          scrollbar-color: rgba(99,102,241,.55) rgba(226,232,240,1);
        }
        .pretty-scroll::-webkit-scrollbar{
          width: 12px;
          height: 12px;
        }
        .pretty-scroll::-webkit-scrollbar-track{
          background: rgba(226,232,240,1);
          border-radius: 999px;
        }
        .pretty-scroll::-webkit-scrollbar-thumb{
          background: linear-gradient(180deg, rgba(99,102,241,.75), rgba(168,85,247,.55));
          border-radius: 999px;
          border: 3px solid rgba(226,232,240,1);
        }
        .pretty-scroll::-webkit-scrollbar-thumb:hover{
          background: linear-gradient(180deg, rgba(79,70,229,.9), rgba(147,51,234,.75));
        }
        .pretty-scroll::-webkit-scrollbar-corner{
          background: transparent;
        }
      `}</style>

      <div className="mx-auto w-full max-w-5xl px-3 sm:px-4 lg:px-6 pb-5 sm:pb-6 pt-6">
        {/* HERO (Dashboard-like) */}
        <div className="rounded-[26px] overflow-hidden" style={{ boxShadow: THEME.SHADOW }}>
          <div className="relative bg-gradient-to-br from-violet-500 via-indigo-500 to-fuchsia-500 px-5 sm:px-6 py-5 sm:py-6 text-white">
            <div className="text-[11px] font-semibold tracking-[0.18em] uppercase text-white/85">
              ACCOUNT VERIFICATION
            </div>

            <div className="mt-2 flex items-start justify-between gap-4">
              <div className="min-w-0">
                <h1 className="text-[18px] sm:text-2xl font-extrabold leading-tight">
                  Verify your account
                </h1>
                <p className="mt-1 text-[13px] sm:text-sm text-white/85">
                  Please read the terms carefully, then accept to complete verification.
                </p>
              </div>

              <button
                type="button"
                onClick={() => nav(-1)}
                className="shrink-0 inline-flex items-center gap-2 rounded-2xl bg-white/15 hover:bg-white/20 px-3 py-2 text-xs font-semibold text-white"
                title="Back"
              >
                <ArrowLeft className="h-4 w-4" />
                Back
              </button>
            </div>

            <div className="mt-4 inline-flex items-center gap-2 rounded-2xl bg-white/15 px-3 py-2 text-xs font-semibold text-white/95">
              <ShieldCheck className="h-4 w-4" />
              Verification step: Accept the Terms & Rules
            </div>
          </div>
        </div>

        {/* CONTENT CARD */}
        <div className="mt-5 sm:mt-6 rounded-[26px] bg-white overflow-hidden" style={{ boxShadow: THEME.SHADOW }}>
          {/* Notice */}
          <div className="p-4 sm:p-5">
            <div
              className="rounded-2xl bg-slate-50 px-4 py-3 text-[13px] text-slate-600"
              style={{ border: `1px solid ${THEME.RING}` }}
            >
              This page is read-only. After you accept, your verification status will be saved on your device and you will be redirected back.
            </div>

            {/* Scrollable text */}
            <div
              className="pretty-scroll mt-4 rounded-2xl bg-white p-4 overflow-auto"
              style={{
                maxHeight: "60vh",
                border: `1px solid rgba(226,232,240,1)`,
              }}
            >
              <div className="space-y-6 text-[13px] leading-7 text-slate-800">
                {sections.map((s, idx) => (
                  <section key={idx} className="space-y-3">
                    <h2 className="text-[14px] font-extrabold">{s.title}</h2>
                    <div className="space-y-2 text-slate-700">
                      {s.paras.map((p, i) => (
                        <p key={i}>{p}</p>
                      ))}
                    </div>
                    <div className="h-px bg-slate-100" />
                  </section>
                ))}
              </div>
            </div>
          </div>

          {/* Sticky accept bar */}
          <div className="sticky bottom-0 border-t border-slate-200 bg-white/90 backdrop-blur px-4 sm:px-5 py-4">
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <label className="flex items-center gap-3 text-sm cursor-pointer select-none">
                <input
                  type="checkbox"
                  className="h-4 w-4 accent-indigo-600"
                  checked={agreed}
                  onChange={(e) => setAgreed(e.target.checked)}
                />
                <span className="leading-6 text-slate-700">
                  I have read and agree to the Terms & Rules, and I commit to comply with them.
                </span>
              </label>

              <button
                type="button"
                onClick={onContinue}
                className={`rounded-2xl px-6 py-2.5 font-extrabold text-sm ${
                  agreed
                    ? "text-white"
                    : "bg-slate-200 text-slate-500 cursor-not-allowed"
                }`}
                style={{
                  background: agreed ? THEME.PRIMARY_DARK : undefined,
                }}
                disabled={!agreed}
              >
                Complete verification
              </button>
            </div>
          </div>
        </div>

        {/* Spacer for safe sticky on iOS */}
        <div className="h-6" />
      </div>
    </div>
  );
}
