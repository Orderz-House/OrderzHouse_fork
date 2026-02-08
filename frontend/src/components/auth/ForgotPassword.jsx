import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Mail, ArrowLeft } from "lucide-react";
import API from "../../api/client.js";
import PageMeta from "../PageMeta.jsx";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [message, setMessage] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage("");
    API.post("/users/forgot-password", { email: email.trim().toLowerCase() })
      .then(() => {
        setSent(true);
      })
      .catch((err) => {
        const msg = err.response?.data?.message || "Something went wrong. Please try again.";
        setMessage(msg);
      })
      .finally(() => setIsLoading(false));
  };

  return (
    <div className="min-h-screen bg-white relative overflow-hidden">
      <PageMeta title="Forgot password – OrderzHouse" description="Request a password reset link." />
      <section className="relative bg-white border-b border-slate-100">
        <div className="h-2 w-full bg-gradient-to-b from-orange-400 to-red-500" />
        <div className="relative mx-auto max-w-lg px-4 sm:px-6 pt-24 pb-16">
          <div className="rounded-3xl border border-slate-200/70 bg-white shadow-sm p-6 sm:p-8">
            <h1 className="text-2xl font-semibold text-slate-900">Forgot password</h1>
            <p className="text-slate-600 mt-2 text-sm">
              Enter your email and we&apos;ll send you a link to reset your password.
            </p>

            {!sent ? (
              <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                <div>
                  <label htmlFor="email" className="block text-sm text-slate-700 mb-1.5">
                    Email
                  </label>
                  <div className="relative">
                    <Mail className="w-5 h-5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      id="email"
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      disabled={isLoading}
                      className="w-full pl-10 pr-3 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-orange-200/60 focus:border-orange-400"
                    />
                  </div>
                </div>
                {message && (
                  <p className="text-sm text-rose-600">{message}</p>
                )}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 rounded-xl font-semibold text-white bg-orange-600 hover:bg-orange-700 focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 disabled:opacity-60"
                >
                  {isLoading ? "Sending…" : "Send reset link"}
                </button>
              </form>
            ) : (
              <div className="mt-6 p-4 rounded-xl bg-green-50 text-green-800 border border-green-200">
                <p className="text-sm">
                  If your email exists in our system, we sent a reset link. Check your inbox (and spam).
                </p>
              </div>
            )}

            <div className="mt-6 pt-4 border-t border-slate-200">
              <Link
                to="/login"
                className="inline-flex items-center gap-2 text-sm font-medium text-orange-600 hover:underline"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to login
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
