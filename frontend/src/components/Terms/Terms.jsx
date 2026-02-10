import { FileText } from "lucide-react";

export default function Terms({
  lastUpdated = "Oct 5, 2025",
  version = "v1.0",
  email = "info@battechno.com",
  country = "Jordan",
  feePercent = "10%",
  revisionCount = "2",
}) {
  const sections = [
    { id: "definitions", title: "1) Definitions" },
    { id: "accounts", title: "2) Accounts & Eligibility" },
    { id: "acceptable-use", title: "3) Acceptable Use" },
    { id: "orders", title: "4) Orders, Offers & Communication" },
    { id: "payments", title: "5) Payments, Fees & Escrow" },
    { id: "delivery", title: "6) Delivery, Revisions & Cancellation" },
    { id: "refunds", title: "7) Refunds & Disputes" },
    { id: "ip", title: "8) Intellectual Property & Confidentiality" },
    { id: "reviews", title: "9) Ratings & Reviews" },
    { id: "suspension", title: "10) Suspension & Termination" },
    { id: "liability", title: "11) Disclaimer & Liability" },
    { id: "changes", title: "12) Changes & Governing Law" },
    { id: "contact", title: "13) Contact" },
  ];

  return (
    <main id="terms-top" className="min-h-screen bg-white text-slate-800">
      {/* HERO — same layout as Privacy: white, orange accents, navbar spacing */}
      <section className="relative bg-white border-b border-slate-100">
        <div className="relative mx-auto max-w-6xl px-4 sm:px-6 pt-24 sm:pt-28 pb-10">
          <div className="flex items-start gap-6 mb-10">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-3xl bg-orange-50 border border-orange-200/70 grid place-items-center shadow-sm">
              <FileText className="w-8 h-8 sm:w-10 sm:h-10 text-orange-700" />
            </div>
            <div>
              <div className="h-2 w-20 rounded-full bg-gradient-to-b from-orange-400 to-red-500 mb-4" />
              <h1 className="text-3xl sm:text-5xl font-extrabold leading-tight tracking-tight text-slate-900">
                Terms & Conditions
              </h1>
              <p className="text-slate-600 mt-3">
                Last updated: {lastUpdated} • {version}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Content — same surface as Privacy: rounded card */}
      <div className="relative -mt-10 mx-auto max-w-6xl px-4 sm:px-6">
        <div className="rounded-3xl bg-white border border-slate-200/70 shadow-sm overflow-hidden">
          <div className="p-6 lg:p-10 grid lg:grid-cols-[260px_1fr] gap-6">
        {/* TOC - mobile */}
        <details className="lg:hidden rounded-2xl border border-slate-200 bg-white/90 shadow-sm">
          <summary className="cursor-pointer select-none px-4 py-3 text-sm font-semibold text-slate-700">
            Table of Contents
          </summary>
          <nav className="px-4 pb-4">
            <ul className="space-y-2 text-sm">
              {sections.map((s) => (
                <li key={s.id}>
                  <a
                    href={`#${s.id}`}
                    className="block rounded-lg px-2 py-1 text-slate-700 hover:bg-slate-100"
                  >
                    {s.title}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </details>

        {/* TOC - desktop */}
        <aside className="hidden lg:block">
          <div className="sticky top-6 rounded-2xl border border-slate-200 bg-white/90 p-4 shadow-sm">
            <p className="text-sm font-semibold text-slate-700 mb-3">
              Table of Contents
            </p>
            <nav className="space-y-1 text-sm">
              {sections.map((s) => (
                <a
                  key={s.id}
                  href={`#${s.id}`}
                  className="block rounded-lg px-2 py-1 text-slate-700 hover:bg-slate-100"
                >
                  {s.title}
                </a>
              ))}
            </nav>
          </div>
        </aside>

        {/* Main text */}
        <article className="space-y-6">
          <Callout>
            <p className="text-sm">
              This page provides general terms for a freelance marketplace. It’s
              not legal advice. Please consult a qualified attorney to adapt
              these terms for your jurisdiction and business.
            </p>
          </Callout>

          <Section id="definitions" title="1) Definitions">
            <ul className="list-disc ps-6 space-y-2">
              <li>
                <b>Platform</b>: the website/app operated by <i>Your Company</i>
                .
              </li>
              <li>
                <b>Client</b>: a user who purchases services via the Platform.
              </li>
              <li>
                <b>Freelancer</b>: a user who offers services via the Platform.
              </li>
              <li>
                <b>Order</b>: an agreement between a Client and a Freelancer
                formed within the Platform, including deliverables and price.
              </li>
            </ul>
          </Section>

          <Section id="accounts" title="2) Accounts & Eligibility">
            <p>
              You must be at least <b>18 years</b> old (or the age of majority
              in your country) to create an account. You agree to provide
              accurate information and keep your credentials secure. We may
              require identity or payment verification to help prevent fraud.
            </p>
          </Section>

          <Section id="acceptable-use" title="3) Acceptable Use">
            <ul className="list-disc ps-6 space-y-2">
              <li>No unlawful, harmful, or hateful content or activities.</li>
              <li>No intellectual property infringement or spam.</li>
              <li>
                All negotiations and payments must remain <b>inside</b> the
                Platform. Attempting to circumvent fees may result in account
                suspension.
              </li>
            </ul>
          </Section>

          <Section id="orders" title="4) Orders, Offers & Communication">
            <p>
              Freelancers must describe services clearly (scope, timeline,
              deliverables). Clients must provide timely and complete
              requirements. Platform messaging is the primary channel for
              agreements and changes related to an Order.
            </p>
          </Section>

          <Section id="payments" title="5) Payments, Fees & Escrow">
            <p>
              Payments are processed via our payment partner and may be held in
              escrow until delivery is confirmed or a grace period elapses. The
              Platform charges a service fee of <b>{feePercent}</b> on each
              successful transaction.
            </p>
          </Section>

          <Section id="delivery" title="6) Delivery, Revisions & Cancellation">
            <ul className="list-disc ps-6 space-y-2">
              <li>
                Work is delivered through the Order page in the agreed format.
              </li>
              <li>
                Clients may request up to <b>{revisionCount}</b> revisions when
                within the agreed scope.
              </li>
              <li>
                Orders can be canceled before work starts or as per the service
                policy, considering work already performed.
              </li>
            </ul>
          </Section>

          <Section id="refunds" title="7) Refunds & Disputes">
            <p>
              If a dispute arises, either party may open a case. We review the
              conversation and files to decide fairly. If work wasn’t delivered
              as described, a refund may be issued; otherwise, funds may be
              released to the Freelancer. Our dispute decisions are final within
              reasonable limits.
            </p>
          </Section>

          <Section id="ip" title="8) Intellectual Property & Confidentiality">
            <ul className="list-disc ps-6 space-y-2">
              <li>
                Unless stated otherwise, intellectual property in the final
                deliverables transfers to the Client upon full payment.
              </li>
              <li>
                Freelancers warrant originality and non-infringement and accept
                responsibility for third-party claims.
              </li>
              <li>
                Both parties must protect confidential information shared during
                the Order.
              </li>
            </ul>
          </Section>

          <Section id="reviews" title="9) Ratings & Reviews">
            <p>
              Reviews must be honest, respectful, and based on real experience.
              We may remove feedback that is abusive, irrelevant, or violates
              these Terms.
            </p>
          </Section>

          <Section id="suspension" title="10) Suspension & Termination">
            <p>
              We may suspend or terminate accounts for violations, suspected
              fraud, or attempts to circumvent the Platform’s processes and
              fees.
            </p>
          </Section>

          <Section id="liability" title="11) Disclaimer & Liability">
            <p>
              The Platform is provided on an <i>“as is”</i> basis. To the
              maximum extent permitted by law, we disclaim warranties and limit
              liability for indirect or consequential losses. Any liability is
              capped at the total fees we received for the transaction in
              dispute.
            </p>
          </Section>

          <Section id="changes" title="12) Changes & Governing Law">
            <p>
              We may update these Terms. For material changes, we will notify
              users and may request re-acceptance. These Terms are governed by
              the laws of <b>{country}</b> and subject to its courts.
            </p>
          </Section>

          <Section id="contact" title="13) Contact">
            <p>
              Questions? Contact us at{" "}
              <a
                href={`mailto:${email}`}
                className="underline text-orange-600 hover:text-orange-700"
              >
                {email}
              </a>
              .
            </p>
          </Section>

          <div className="pt-6">
            <a
              href="#terms-top"
              className="inline-flex items-center gap-2 rounded-xl px-4 py-2 text-white shadow-sm bg-gradient-to-b from-orange-400 to-red-500 hover:from-orange-500 hover:to-red-600 transition"
            >
              Back to top
            </a>
          </div>
        </article>
          </div>
        </div>
      </div>
    </main>
  );
}

function Section({ id, title, children }) {
  return (
    <section id={id} className="scroll-mt-24">
      <div className="rounded-2xl border border-slate-200 bg-white/90 p-5 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-800">{title}</h2>
        <div className="mt-3 text-slate-700 leading-relaxed space-y-3">
          {children}
        </div>
      </div>
    </section>
  );
}

function Callout({ children }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-start gap-3">
        <div className="h-8 w-8 shrink-0 rounded-xl grid place-items-center text-white bg-gradient-to-b from-orange-400 to-red-500">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
            className="h-5 w-5"
          >
            <path d="M11 7h2v2h-2zM11 11h2v6h-2z" />
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z" />
          </svg>
        </div>
        <div className="text-slate-700">{children}</div>
      </div>
    </div>
  );
}
