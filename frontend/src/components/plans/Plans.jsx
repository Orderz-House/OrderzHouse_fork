import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import axios from "axios";
import { loadStripe } from "@stripe/stripe-js";
import GradientButton from "../buttons/GradientButton.jsx";
import PaymentMethodModal from "./PaymentMethodChooser.jsx";

const THEME = "#028090";
const API_URL = import.meta.env.VITE_APP_API_URL;
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

// =============== Auth Hook ===============
const useAuth = () => {
  const { user } = useSelector((s) => ({
    user: s.auth?.userData,
  }));
  return { user };
};
// =========================================

function PlanCard({ plan, onSubscribe }) {
  const isPopular = plan.plan_type === "popular";

  return (
    <div
      className={[
        "group relative flex w-full max-w-sm flex-col justify-between rounded-2xl border bg-white",
        "transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-xl",
        isPopular ? "border-[2px]" : "border",
      ].join(" ")}
      style={{
        borderColor: isPopular ? THEME : "rgba(2,128,144,0.15)",
        boxShadow: isPopular
          ? "0 8px 28px rgba(2,128,144,0.18)"
          : "0 6px 18px rgba(0,0,0,0.06)",
        minHeight: "470px",
      }}
    >
      {/* CONTENT */}
      <div className="flex-grow">
        <div className="px-6 pt-6">
          <div className="mb-2 flex items-center justify-between">
            <span
              className="rounded-full border px-3 py-1 text-xs font-semibold"
              style={{ borderColor: "rgba(2,128,144,0.25)", color: THEME }}
            >
              {plan.name}
            </span>

            {isPopular && (
              <span
                className="rounded-full px-3 py-1 text-xs font-semibold"
                style={{
                  backgroundColor: "rgba(2,128,144,0.08)",
                  color: THEME,
                }}
              >
                Popular
              </span>
            )}
          </div>

          <h3
            className="text-2xl font-extrabold tracking-tight"
            style={{ color: THEME }}
          >
            {plan.plan_type === "monthly"
              ? `${plan.duration} Month`
              : plan.plan_type === "yearly"
              ? `${plan.duration} Year`
              : plan.name}
          </h3>

          <div className="mt-3 flex items-end gap-2">
            <span className="text-4xl font-extrabold text-slate-900">
              {plan.price}
            </span>
            <span className="mb-1 text-sm font-semibold text-slate-500">
              JD
            </span>
          </div>
        </div>

        <div
          className="mx-6 my-5 h-px"
          style={{ background: "rgba(2,128,144,0.12)" }}
        />

        <ul className="mx-6 mb-4 space-y-2 text-sm text-slate-600">
          {plan.features?.map((item, i) => (
            <li key={i} className="flex items-center gap-2">
              <span
                className="inline-block h-2 w-2 rounded-full"
                style={{ backgroundColor: THEME }}
              />
              {item}
            </li>
          ))}
        </ul>
      </div>

      {/* SINGLE CTA */}
      <div className="px-6 pb-6">
        <button
          onClick={() => onSubscribe(plan)}
          className="w-full rounded-xl px-4 py-2 font-bold text-white"
          style={{ background: THEME }}
        >
          Subscribe
        </button>
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
    axios.get(`${API_URL}/plans`).then((res) => {
      setPlans(Array.isArray(res.data.plans) ? res.data.plans : []);
      setLoading(false);
    });
  }, []);

  const subscribeOnline = async () => {
    if (!user) return navigate("/login");

    await stripePromise;

    const res = await axios.post(
      `${API_URL}/stripe/create-checkout-session`,
      {
        plan_id: selectedPlan.id,
        user_id: user.id,
      }
    );

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
    <div className="min-h-screen bg-slate-50 pb-20">
      <div className="mx-auto max-w-6xl px-4 pt-10 text-center">
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-800">
          Choose Your Plan
        </h1>
      </div>

      <div className="mx-auto mt-10 grid max-w-6xl grid-cols-1 gap-6 px-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {plans.map((p) => (
          <div key={p.id} className="flex justify-center">
            <PlanCard plan={p} onSubscribe={setSelectedPlan} />
          </div>
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

<div className="flex justify-center mt-4">
  <GradientButton
    href="/contracts/contract.pdf"
    className="text-sm px-4 py-2 rounded-lg"
    style={{ width: "fit-content" }}
  >
    View Contract
  </GradientButton>
</div>

    </div>
  );
}
