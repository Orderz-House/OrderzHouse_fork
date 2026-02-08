import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import API from "../../api/client.js";
import { loadStripe } from "@stripe/stripe-js";
import GradientButton from "../buttons/GradientButton.jsx";
import PaymentMethodModal from "./PaymentMethodChooser.jsx";
import PageMeta from "../PageMeta.jsx";

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

// =============== Auth Hook ===============
const useAuth = () => {
  const { user } = useSelector((s) => ({
    user: s.auth?.userData,
  }));
  return { user };
};
// =========================================

function CheckIcon({ className = "" }) {
  return (
    <svg
      className={className}
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M20 6L9 17l-5-5"
        stroke="currentColor"
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function PlanCard({ plan, onSubscribe }) {
  const highlight = plan.plan_type === "popular";

  const durationLabel =
    plan.plan_type === "monthly"
      ? `${plan.duration} Month`
      : plan.plan_type === "yearly"
      ? `${plan.duration} Year`
      : plan.name;

  return (
    <div
      className={[
        "h-full rounded-3xl flex flex-col",
        "bg-white/85 backdrop-blur-xl ",
        "border border-slate-200/70",
        "shadow-[0_25px_60px_-45px_rgba(2,6,23,0.25)]",
        "hover:shadow-[0_35px_80px_-55px_rgba(2,6,23,0.28)]",
        "transition-all duration-300 ease-out",
        highlight
          ? "ring-1 ring-orange-500/20 bg-gradient-to-b from-orange-50/70 to-indigo-50/40"
          : "ring-1 ring-black/5",
      ].join(" ")}
      style={{ minHeight: 360 }}
    >
      
      <div className="p-6 flex-1 flex flex-col">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-slate-900">{plan.name}</p>

            <p className="mt-2 text-3xl font-semibold text-slate-900">
              {plan.price} <span className="text-sm font-normal text-slate-500">JD</span>
            </p>

            <p className="mt-1 text-sm text-slate-600">{durationLabel}</p>
          </div>

          {highlight ? (
            <span className="inline-flex items-center rounded-full border border-orange-500/15 bg-orange-500/10 px-3 py-1 text-xs font-semibold text-orange-600">
              Most popular
            </span>
          ) : (
            <span className="inline-flex items-center rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-600">
              Plan
            </span>
          )}
        </div>

        <div className="mt-5 h-px bg-slate-200/70" />

        <ul className="mt-5 space-y-2">
          {plan.features?.map((b, i) => (
            <li key={i} className="flex items-start gap-2 text-sm text-slate-700">
              <span className="mt-0.5 grid h-5 w-5 place-items-center rounded-full border border-orange-500/15 bg-orange-500/10 text-orange-700">
                <CheckIcon className="h-3 w-3" />
              </span>
              <span>{b}</span>
            </li>
          ))}
        </ul>

        <div className="mt-auto">
    <button
      onClick={() => onSubscribe(plan)}
      className="w-full rounded-full px-4 py-2.5 text-sm font-semibold text-white bg-slate-900 shadow-[0_14px_30px_rgba(15,23,42,0.18)] hover:opacity-95 active:scale-[0.99] transition"
    >
      Subscribe
    </button>

    <p className="mt-2 text-xs text-slate-500">
      Secure checkout — choose online or offline payment.
    </p>
  </div>
      </div>
    </div>
  );
}

export default function Plans() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPlan, setSelectedPlan] = useState(null);

  useEffect(() => {
    if (user && user.role_id === 2) navigate("/");
  }, [user, navigate]);

  useEffect(() => {
    API.get("/plans").then((res) => {
      setPlans(Array.isArray(res.data.plans) ? res.data.plans : []);
      setLoading(false);
    });
  }, []);

  const subscribeOnline = async () => {
    if (!user) return navigate("/login");
    await stripePromise;

    const res = await API.post("/stripe/create-checkout-session", {
      plan_id: selectedPlan.id,
      user_id: user.id,
    });

    window.location.href = res.data.url;
  };

  const subscribeOffline = () => {
    if (!user) return navigate("/login");
    window.location.href = "https://appointments.battechno.com/survey";
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-slate-600">
        Loading plans...
      </div>
    );
  }

  return (
    <div className="relative isolate overflow-hidden bg-white">
      <PageMeta title="Plans & Pricing – OrderzHouse" description="Choose a plan for freelancers: monthly or yearly subscription with clear pricing." />
      {/* ✅ نفس Glows الموجودة في Pricing */}
           <div className="pointer-events-none absolute -top-28 left-[-80px] h-[360px] w-[360px] rounded-full bg-yellow-300/25 blur-3xl" />
          <div className="pointer-events-none absolute -top-28 right-[-90px] h-[380px] w-[380px] rounded-full bg-orange-400/20 blur-3xl" />
 
      {/* subtle dotted texture */}
      <div className="pointer-events-none absolute inset-0 opacity-[0.05] [background-image:radial-gradient(circle_at_1px_1px,black_1px,transparent_0)] [background-size:18px_18px]" />

      <div className="mx-auto max-w-6xl px-4 py-16 sm:py-32 md:px-8">
        {/* Header نفس الستايل */}
        <div className="max-w-2xl">
          <p className="text-sm text-orange-700">Pricing</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
            Choose Your Plan
          </h1>
          <p className="mt-3 text-slate-600">
            Pick a plan that fits your workflow — upgrade anytime.
          </p>
        </div>

        {/* Grid نفس Pricing */}
        <div className="mt-10 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {plans.map((p) => (
            <PlanCard key={p.id} plan={p} onSubscribe={setSelectedPlan} />
          ))}
        </div>

        <PaymentMethodModal
          open={!!selectedPlan}
          onClose={() => setSelectedPlan(null)}
          onOnline={subscribeOnline}
          onOffline={subscribeOffline}
        />

        <p className="mt-10 text-center text-sm font-semibold text-slate-600">
          * A contract is signed after subscription.
        </p>

        <div className="mt-4 flex justify-center">
          <GradientButton
            href="/contracts/contract.pdf"
            className="text-sm px-4 py-2 rounded-lg"
            style={{ width: "fit-content" }}
          >
            View Contract
          </GradientButton>
        </div>
      </div>
    </div>
  );
}
