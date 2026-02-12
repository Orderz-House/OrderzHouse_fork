import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { FileText, CheckCircle, ChevronUp } from "lucide-react";
import API from "../../api/client.js";
import { useToast } from "../toast/ToastProvider";

const getDashboardPath = (roleId) => {
  switch (Number(roleId)) {
    case 1: return "/admin/dashboard";
    case 2: return "/client/dashboard";
    case 3: return "/freelancer/dashboard";
    case 4: return "/apm";
    case 5: return "/partner";
    default: return "/dashboard";
  }
};

const TERMS_CONTENT = {
  lastUpdated: "Oct 5, 2025",
  version: "v1.0",
  email: "info@battechno.com",
  country: "Jordan",
  feePercent: "10%",
  revisionCount: "2",
};

function Section({ id, title, children }) {
  return (
    <section id={id} className="scroll-mt-28">
      <div className="rounded-2xl border border-slate-200 bg-white/95 p-5 shadow-sm backdrop-blur">
        <h2 className="text-lg font-semibold text-slate-800 mb-3">{title}</h2>
        <div className="text-slate-700 leading-relaxed space-y-3 text-sm">
          {children}
        </div>
      </div>
    </section>
  );
}

export default function AcceptTerms() {
  const [loading, setLoading] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const topRef = useRef(null);
  const navigate = useNavigate();
  const toast = useToast();
  const { token, roleId } = useSelector((state) => state.auth);

  const handleAccept = async () => {
    if (!token) {
      toast.error("You must be logged in first.");
      navigate("/login", { replace: true });
      return;
    }
    if (!agreed) {
      toast.error("Please confirm that you have read and accept the Terms & Conditions.");
      return;
    }
    setLoading(true);
    try {
      await API.post("/auth/accept-terms");
      toast.success("Terms & Conditions accepted successfully.");
      const path = getDashboardPath(roleId);
      navigate(path, { replace: true });
    } catch (err) {
      const msg = err.response?.data?.message || "Failed to save. Please try again.";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const scrollToTop = () => topRef.current?.scrollIntoView({ behavior: "smooth" });

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100">
      {/* Header */}
      <header
        ref={topRef}
        className="sticky top-0 z-20 border-b border-slate-200/80 bg-white/90 backdrop-blur-md shadow-sm"
      >
        <div className="mx-auto max-w-4xl px-4 sm:px-6 py-5">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center shadow-md">
              <FileText className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                Terms & Conditions
              </h1>
              <p className="text-slate-500 text-sm mt-0.5">
                Last updated: {TERMS_CONTENT.lastUpdated} • {TERMS_CONTENT.version}
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="mx-auto max-w-4xl px-4 sm:px-6 py-8 pb-40">
        <div className="rounded-2xl border border-amber-200/80 bg-amber-50/80 p-4 mb-8 shadow-sm">
          <p className="text-sm text-amber-900">
            This page provides general terms for a freelance marketplace. It is not legal advice.
            Please consult a qualified attorney to adapt these terms for your jurisdiction and business.
          </p>
        </div>

        <div className="space-y-6">
          <Section id="definitions" title="1) Definitions">
            <ul className="list-disc ps-6 space-y-2">
              <li><b>Platform</b>: the website/app operated by the Company.</li>
              <li><b>Client</b>: a user who purchases services via the Platform.</li>
              <li><b>Freelancer</b>: a user who offers services via the Platform.</li>
              <li><b>Order</b>: an agreement between a Client and a Freelancer formed within the Platform, including deliverables and price.</li>
            </ul>
          </Section>

          <Section id="accounts" title="2) Accounts & Eligibility">
            <p>
              You must be at least <b>18 years</b> old (or the age of majority in your country) to create an account.
              You agree to provide accurate information and keep your credentials secure.
              We may require identity or payment verification to help prevent fraud.
            </p>
          </Section>

          <Section id="acceptable-use" title="3) Acceptable Use">
            <ul className="list-disc ps-6 space-y-2">
              <li>No unlawful, harmful, or hateful content or activities.</li>
              <li>No intellectual property infringement or spam.</li>
              <li>All negotiations and payments must remain <b>inside</b> the Platform. Attempting to circumvent fees may result in account suspension.</li>
            </ul>
          </Section>

          <Section id="orders" title="4) Orders, Offers & Communication">
            <p>
              Freelancers must describe services clearly (scope, timeline, deliverables). Clients must provide timely and complete requirements.
              Platform messaging is the primary channel for agreements and changes related to an Order.
            </p>
          </Section>

          <Section id="payments" title="5) Payments, Fees & Escrow">
            <p>
              Payments are processed via our payment partner and may be held in escrow until delivery is confirmed or a grace period elapses.
              The Platform charges a service fee of <b>{TERMS_CONTENT.feePercent}</b> on each successful transaction.
            </p>
          </Section>

          <Section id="delivery" title="6) Delivery, Revisions & Cancellation">
            <ul className="list-disc ps-6 space-y-2">
              <li>Work is delivered through the Order page in the agreed format.</li>
              <li>Clients may request up to <b>{TERMS_CONTENT.revisionCount}</b> revisions when within the agreed scope.</li>
              <li>Orders can be canceled before work starts or as per the service policy, considering work already performed.</li>
            </ul>
          </Section>

          <Section id="refunds" title="7) Refunds & Disputes">
            <p>
              If a dispute arises, either party may open a case. We review the conversation and files to decide fairly.
              If work was not delivered as described, a refund may be issued; otherwise, funds may be released to the Freelancer.
              Our dispute decisions are final within reasonable limits.
            </p>
          </Section>

          <Section id="ip" title="8) Intellectual Property & Confidentiality">
            <ul className="list-disc ps-6 space-y-2">
              <li>Unless stated otherwise, intellectual property in the final deliverables transfers to the Client upon full payment.</li>
              <li>Freelancers warrant originality and non-infringement and accept responsibility for third-party claims.</li>
              <li>Both parties must protect confidential information shared during the Order.</li>
            </ul>
          </Section>

          <Section id="reviews" title="9) Ratings & Reviews">
            <p>
              Reviews must be honest, respectful, and based on real experience. We may remove feedback that is abusive, irrelevant, or violates these Terms.
            </p>
          </Section>

          <Section id="suspension" title="10) Suspension & Termination">
            <p>
              We may suspend or terminate accounts for violations, suspected fraud, or attempts to circumvent the Platform’s processes and fees.
            </p>
          </Section>

          <Section id="liability" title="11) Disclaimer & Liability">
            <p>
              The Platform is provided on an <i>"as is"</i> basis. To the maximum extent permitted by law, we disclaim warranties and limit liability for indirect or consequential losses.
              Any liability is capped at the total fees we received for the transaction in dispute.
            </p>
          </Section>

          <Section id="changes" title="12) Changes & Governing Law">
            <p>
              We may update these Terms. For material changes, we will notify users and may request re-acceptance. These Terms are governed by the laws of <b>{TERMS_CONTENT.country}</b> and subject to its courts.
            </p>
          </Section>

          <Section id="contact" title="13) Contact">
            <p>
              Questions? Contact us at{" "}
              <a href={`mailto:${TERMS_CONTENT.email}`} className="text-orange-600 hover:text-orange-700 font-medium underline">
                {TERMS_CONTENT.email}
              </a>.
            </p>
          </Section>
        </div>

        <button
          type="button"
          onClick={scrollToTop}
          className="mt-8 flex items-center gap-2 text-slate-500 hover:text-slate-700 text-sm font-medium"
        >
          <ChevronUp className="w-4 h-4" />
          Back to top
        </button>
      </div>

      {/* Sticky accept bar */}
      <div className="fixed bottom-0 left-0 right-0 z-20 border-t border-slate-200 bg-white/95 backdrop-blur-md shadow-[0_-4px_20px_rgba(0,0,0,0.06)]">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 py-4">
          <label className="flex items-start gap-3 cursor-pointer group mb-4">
            <input
              type="checkbox"
              checked={agreed}
              onChange={(e) => setAgreed(e.target.checked)}
              className="mt-1 w-4 h-4 rounded border-slate-300 text-orange-600 focus:ring-orange-500"
            />
            <span className="text-sm text-slate-700 group-hover:text-slate-900">
              I have read and accept the Terms & Conditions above.
            </span>
          </label>
          <button
            type="button"
            onClick={handleAccept}
            disabled={loading || !agreed}
            className="w-full flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold shadow-lg shadow-orange-500/25 transition-all"
          >
            {loading ? (
              <span className="animate-pulse">Saving...</span>
            ) : (
              <>
                <CheckCircle className="w-5 h-5" />
                I Accept Terms & Conditions
              </>
            )}
          </button>
        </div>
      </div>
    </main>
  );
}
