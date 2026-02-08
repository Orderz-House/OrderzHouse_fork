import React, { useState, useEffect } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { Lock, Eye, EyeOff, ArrowLeft } from "lucide-react";
import API from "../../api/client.js";
import { toast } from "react-hot-toast";
import PageMeta from "../PageMeta.jsx";

export default function ResetPassword() {
  const navigate = useNavigate();
  const { token: tokenParam } = useParams();
  const [token, setToken] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (tokenParam) setToken(tokenParam);
  }, [tokenParam]);

  const handleSubmit = (e) => {
    e.preventDefault();
    setMessage("");
    if (password.length < 8) {
      setMessage("Password must be at least 8 characters.");
      return;
    }
    if (password !== confirmPassword) {
      setMessage("Passwords do not match.");
      return;
    }
    const resetToken = token.trim() || tokenParam?.trim();
    if (!resetToken) {
      setMessage("Reset link is missing. Use the link from your email or enter the token.");
      return;
    }
    setIsLoading(true);
    API.post("/users/reset-password", {
      token: resetToken,
      password,
      confirmPassword,
    })
      .then(() => {
        toast.success("Password updated. You can sign in with your new password.");
        navigate("/login", { replace: true });
      })
      .catch((err) => {
        const msg =
          err.response?.data?.message ||
          "Reset failed. The link may be invalid or expired. Request a new one.";
        setMessage(msg);
      })
      .finally(() => setIsLoading(false));
  };

  return (
    <div className="min-h-screen bg-white relative overflow-hidden">
      <PageMeta title="Reset password – OrderzHouse" description="Set a new password." />
      <section className="relative bg-white border-b border-slate-100">
        <div className="h-2 w-full bg-gradient-to-b from-orange-400 to-red-500" />
        <div className="relative mx-auto max-w-lg px-4 sm:px-6 pt-24 pb-16">
          <div className="rounded-3xl border border-slate-200/70 bg-white shadow-sm p-6 sm:p-8">
            <h1 className="text-2xl font-semibold text-slate-900">Set new password</h1>
            <p className="text-slate-600 mt-2 text-sm">
              Enter your new password below. Use at least 8 characters.
            </p>

            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              {!tokenParam && (
                <div>
                  <label htmlFor="token" className="block text-sm text-slate-700 mb-1.5">
                    Reset token (if not in URL)
                  </label>
                  <input
                    type="text"
                    id="token"
                    placeholder="Paste token from email"
                    value={token}
                    onChange={(e) => setToken(e.target.value)}
                    disabled={isLoading}
                    className="w-full px-3 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-orange-200/60 focus:border-orange-400"
                  />
                </div>
              )}
              <div>
                <label htmlFor="password" className="block text-sm text-slate-700 mb-1.5">
                  New password
                </label>
                <div className="relative">
                  <Lock className="w-5 h-5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? "text" : "password"}
                    id="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={8}
                    disabled={isLoading}
                    className="w-full pl-10 pr-12 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-orange-200/60 focus:border-orange-400"
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-orange-600"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>
              <div>
                <label htmlFor="confirmPassword" className="block text-sm text-slate-700 mb-1.5">
                  Confirm new password
                </label>
                <div className="relative">
                  <Lock className="w-5 h-5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type={showConfirm ? "text" : "password"}
                    id="confirmPassword"
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    minLength={8}
                    disabled={isLoading}
                    className="w-full pl-10 pr-12 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-orange-200/60 focus:border-orange-400"
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-orange-600"
                    onClick={() => setShowConfirm(!showConfirm)}
                  >
                    {showConfirm ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>
              {message && <p className="text-sm text-rose-600">{message}</p>}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 rounded-xl font-semibold text-white bg-orange-600 hover:bg-orange-700 focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 disabled:opacity-60"
              >
                {isLoading ? "Updating…" : "Update password"}
              </button>
            </form>

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
