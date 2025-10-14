import React, { useState, useEffect } from "react";
import axios from "axios";
import { useSelector } from "react-redux";
import GradientButton from "../buttons/GradientButton.jsx";

const Plans = () => {
  const [plans, setPlans] = useState([]);
  const [billingCycle, setBillingCycle] = useState("yearly");

  const { user } = useSelector((state) => ({
    user: state.auth.userData,
  }));

  const fetchPlans = async () => {
    try {
      const res = await axios.get("http://localhost:5000/plans");
      setPlans(res.data.plans || []);
    } catch (err) {
      console.error("Error fetching plans:", err);
      setPlans([]);
    }
  };

  useEffect(() => {
    fetchPlans();
  }, []);

  const handleSubscribeWhatsApp = (plan) => {
    if (!user) {
      window.location.href = "/login";
      return;
    }
    if (user.role_id === 3) {
      const baseUrl = "https://api.whatsapp.com/send/";
      const phoneNumber = "962791433341";
      const message = `I am a freelancer and I want to subscribe to this plan: ${plan.name}`;
      const encodedMessage = encodeURIComponent(message);
      const finalUrl = `${baseUrl}?phone=${phoneNumber}&text=${encodedMessage}&type=phone_number&app_absent=0`;
      window.open(finalUrl, "_blank");
      return;
    }
    alert("Subscription through WhatsApp is only available for Freelancers.");
  };

  const displayedPlans = plans.filter(plan => plan.plan_type === billingCycle);

  return (
    <div className="min-h-screen bg-white p-8">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Clear and Fair Pricing for Everyone
          </h1>
          <p className="text-gray-500 text-lg">
            Over 100,000 entrepreneurs have launched their businesses effortlessly with our platform.
          </p>
        </div>

        {/* Billing toggle */}
        <div className="flex justify-center gap-2 mb-12">
          <button
            onClick={() => setBillingCycle("monthly")}
            className={`px-6 py-2 rounded-lg font-medium transition-colors ${
              billingCycle === "monthly"
                ? "bg-gray-200 text-gray-900"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            Monthly
          </button>
          <button
            onClick={() => setBillingCycle("yearly")}
            className={`px-6 py-2 rounded-lg font-medium transition-colors ${
              billingCycle === "yearly"
                ? "bg-cyan-500 text-white"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            Annual
          </button>
        </div>

        {/* Plans grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {displayedPlans.map((plan) => {
            const isPro = plan.id === 5; // Only plan with id 5 is most popular
            return (
              <div
                key={plan.id}
                className={`relative rounded-2xl border border-gray-200 shadow-sm bg-white p-6 flex flex-col h-full`} // h-full ensures same height
              >
                {isPro && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <span className="bg-cyan-500 text-white text-xs font-semibold px-4 py-1 rounded-full">
                      ⭐ Most Popular
                    </span>
                  </div>
                )}

                <div className="mb-6 flex-1">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                  <p className="text-sm text-gray-500 mb-4">{plan.description}</p>
                  <div className="mb-4">
                    <span className="text-4xl font-bold text-gray-900">{plan.price} JD</span>
                    {plan.price !== 0 && (
                      <span className="text-sm text-gray-400 line-through ml-2">
                        {parseFloat(plan.price) + 20} JD
                      </span>
                    )}
                    <div className="text-sm text-gray-500 mt-1">
                      {plan.plan_type === "yearly"
                        ? "per agent, per year, billed annually"
                        : "per agent, per month, billed monthly"}
                    </div>
                  </div>

                  {plan.features?.length > 0 && (
                    <ul className="space-y-3 mt-4">
                      {plan.features.map((feature, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <svg
                            className="w-5 h-5 text-cyan-500 flex-shrink-0 mt-0.5"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                              clipRule="evenodd"
                            />
                          </svg>
                          <span className="text-sm text-gray-700">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                <div className="mt-auto">
                  <GradientButton
                    onClick={() => handleSubscribeWhatsApp(plan)}
                    className="w-full py-3"
                  >
                    Subscribe via WhatsApp
                  </GradientButton>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Plans;
