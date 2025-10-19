import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";

const THEME = "#028090";

// ================ Auth Hook ================
const useAuth = () => {
  const { user, token } = useSelector((s) => ({
    user: s.auth?.userData,
    token: s.auth?.token,
  }));
  return { user, token };
};
// ==========================================

const plans = [
  { id: 1, name: "Basic",   label: "Free",    price: "0",  period: "JD", description: ["Perfect for getting started"], earnLimit: "100" },
  { id: 2, name: "Advance", label: "1 month", price: "20", period: "JD", description: ["Best value for professionals"], earnLimit: "Unlimited" },
  { id: 3, name: "Premium", label: "1 Year",  price: "45", period: "JD", description: ["Most popular choice"], earnLimit: "Unlimited", isPopular: true },
  { id: 4, name: "Pro+",    label: "2 Year",  price: "65", period: "JD", description: ["Maximum value for serious professionals"], earnLimit: "Unlimited" },
];

// WhatsApp helper
const PHONE = "962791433341";
const buildWA = (plan, user) => {
  const text =
    `Hello, I want to subscribe:\n` +
    `- Plan: ${plan.label}\n- Fee: ${plan.price} JD\n- Earn Limit: ${plan.earnLimit}\n` +
    (user ? `- User: ${user?.name || user?.username || "N/A"} (role_id: ${user?.role_id ?? "N/A"})` : `- User: (guest)`);
  return `https://wa.me/${PHONE}?text=${encodeURIComponent(text)}`;
};

function PlanCard({ plan, user }) {
  const isPopular = !!plan.isPopular;

  const onChoose = () => {
    if (!user) {
      window.location.href = "/login";
      return;
    }
    if (user.role_id === 3) {
      window.open(buildWA(plan, user), "_blank");
      return;
    }
    alert("Subscription through WhatsApp is only available for Freelancers.");
  };

  return (
    <div
      onClick={onChoose}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === "Enter" && onChoose()}
      className={[
        "group relative flex w-full max-w-sm cursor-pointer flex-col rounded-2xl border bg-white",
        "transition-all duration-300 ease-out",
        "hover:-translate-y-1 hover:shadow-xl",
        isPopular ? "border-[2px]" : "border",
      ].join(" ")}
      style={{
        borderColor: isPopular ? THEME : "rgba(2,128,144,0.15)",
        boxShadow: isPopular ? "0 8px 28px rgba(2,128,144,0.18)" : "0 6px 18px rgba(0,0,0,0.06)",
      }}
    >
      {/* Header */}
      <div className="px-6 pt-6">
        <div className="mb-2 flex items-center justify-between">
          <span className="rounded-full border px-3 py-1 text-xs font-semibold"
            style={{ borderColor: "rgba(2,128,144,0.25)", color: THEME }}>
            {plan.name}
          </span>
          {isPopular && (
            <span
              className="rounded-full px-3 py-1 text-xs font-semibold"
              style={{ backgroundColor: "rgba(2,128,144,0.08)", color: THEME }}
            >
              Popular
            </span>
          )}
        </div>

        <h3 className="text-2xl font-extrabold tracking-tight" style={{ color: THEME }}>
          {plan.label}
        </h3>

        <div className="mt-3 flex items-end gap-2">
          <span className="text-4xl font-extrabold text-slate-900">{plan.price}</span>
          <span className="mb-1 text-sm font-semibold text-slate-500">{plan.period}</span>
        </div>
      </div>

      {/* Divider */}
      <div className="mx-6 my-5 h-px" style={{ background: "rgba(2,128,144,0.12)" }} />

      {/* Features */}
      <ul className="mx-6 mb-4 space-y-2 text-sm text-slate-600">
        {plan.description?.map((item, i) => (
          <li key={i} className="flex items-center gap-2">
            <span
              className="inline-block h-2 w-2 rounded-full"
              style={{ backgroundColor: THEME }}
            />
            {item}
          </li>
        ))}
        <li className="mt-1 text-xs text-slate-500">
          <span className="font-semibold" style={{ color: THEME }}>Earn Limit:</span> {plan.earnLimit}
        </li>
      </ul>

      {/* CTA */}
      <div className="px-6 pb-6">
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); onChoose(); }}
          className="w-full rounded-xl px-4 py-2 font-bold text-white transition"
          style={{ background: THEME }}
          onMouseEnter={(e) => (e.currentTarget.style.filter = "brightness(1.08)")}
          onMouseLeave={(e) => (e.currentTarget.style.filter = "none")}
        >
          Choose Plan
        </button>
        <p className="mt-2 text-center text-[11px] text-slate-400">Tap card or button to contact via WhatsApp</p>
      </div>
    </div>
  );
}

export default function Plans() {
  const { user } = useAuth();
  const navigate = useNavigate();

  // hide page for clients
  useEffect(() => {
    if (user && user.role_id === 2) navigate("/");
  }, [user, navigate]);
  if (user && user.role_id === 2) return null;

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      {/* Header */}
      <div className="mx-auto max-w-6xl px-4 pt-10 text-center">
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-800">Choose Your Plan</h1>

        <div
          role="presentation"
          className="mx-auto mt-5 flex w-full max-w-xs items-center justify-center rounded-full border bg-white p-1 select-none"
          style={{ borderColor: "rgba(2,128,144,0.2)" }}
        >
          <span
            className="w-1/2 rounded-full px-3 py-1 text-center text-sm font-semibold text-white"
            style={{ background: THEME }}
          >
            Simple pricing
          </span>
          <span
            className="w-1/2 rounded-full px-3 py-1 text-center text-sm font-semibold text-slate-500"
          >
            No hidden fees
          </span>
        </div>

        <p className="mt-4 text-sm text-slate-500">
          Best Plans For <span className="font-semibold" style={{ color: THEME }}>FreeLancer</span>
        </p>
      </div>

      {/* Cards grid */}
      <div className="mx-auto mt-10 grid max-w-6xl grid-cols-1 gap-6 px-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {plans.map((p) => (
          <div key={p.id} className="flex justify-center">
            <PlanCard plan={p} user={user} />
          </div>
        ))}
      </div>

      {/* Note */}
      <div
        className="mx-auto mt-10 max-w-4xl rounded-2xl border bg-white px-6 py-6 text-center text-sm font-semibold text-slate-700"
        style={{ borderColor: "rgba(2,128,144,0.15)" }}
      >
        <p>* A contract is signed after subscription.</p>
        <p className="mt-1">* Account verification fee is a one-time payment across all plans (25 JD).</p>
      </div>
    </div>
  );
}
