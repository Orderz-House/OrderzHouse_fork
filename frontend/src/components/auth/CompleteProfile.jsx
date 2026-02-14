import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import API, { startProactiveRefresh } from "../../api/client.js";
import { setUserData } from "../../slice/auth/authSlice";
import arabCountries from "../../data/arabCountries.json";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Briefcase,
  Lock,
  Eye,
  EyeOff,
  CheckCircle,
} from "lucide-react";
import GradientButton from "../buttons/GradientButton.jsx";
import PageMeta from "../PageMeta.jsx";
import { useToast } from "../toast/ToastProvider";

const roles = [
  { id: 2, label: "Customer" },
  { id: 3, label: "Freelancer" },
  { id: 5, label: "Partner" },
];

const PRIMARY = "#C2410C";

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

export default function CompleteProfile() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const toast = useToast();
  const { token, userData } = useSelector((s) => s.auth);

  const [role_id, setRole_id] = useState("");
  const [country, setCountry] = useState("");
  const [phone_number, setPhone_number] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState(false);
  const [countries, setCountries] = useState([]);

  useEffect(() => {
    setCountries(arabCountries.sort((a, b) => a.localeCompare(b)));
  }, []);

  useEffect(() => {
    if (!token) {
      navigate("/login", { replace: true });
      return;
    }
    API.get("/users/getUserdata", { headers: { Authorization: `Bearer ${token}` } })
      .then((res) => {
        const u = res.data?.user;
        if (u && (u.phone_number || u.country)) {
          navigate(getDashboardPath(u.role_id), { replace: true });
        }
      })
      .catch(() => {});
  }, [token, navigate]);

  const handleSubmit = (e) => {
    e.preventDefault();
    setMessage("");
    if (!role_id || !country?.trim() || !phone_number?.trim()) {
      toast.error("Please fill Role, Country, and Phone number.");
      return;
    }
    setIsLoading(true);
    API.patch(
      "/users/complete-profile",
      { role_id: Number(role_id), country: country.trim(), phone_number: phone_number.trim(), ...(password && password.length >= 8 && { password }) },
      { headers: { Authorization: `Bearer ${token}` } }
    )
      .then((res) => {
        const user = res.data?.user;
        if (user) dispatch(setUserData({ ...userData, ...user, role_id: user.role_id }));
        setStatus(true);
        setMessage("Profile completed. Redirecting...");
        toast.success("Profile completed!");
        startProactiveRefresh();
        setTimeout(() => navigate("/accept-terms", { replace: true }), 1200);
      })
      .catch((err) => {
        const msg = err.response?.data?.message || "Failed to save. Try again.";
        toast.error(msg);
        setMessage(msg);
        setStatus(false);
      })
      .finally(() => setIsLoading(false));
  };

  if (!token) return null;

  return (
    <div className="min-h-screen bg-white relative overflow-hidden">
      <PageMeta title="Complete your profile – OrderzHouse" description="Complete your profile to continue." />
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-28 -right-28 w-80 h-80 rounded-full bg-[#C2410C]/10 blur-3xl" />
        <div className="absolute -bottom-32 -left-28 w-96 h-96 rounded-full bg-[#C2410C]/5 blur-3xl" />
      </div>

      <div className="flex min-h-screen items-center justify-center p-4 lg:px-8 pt-32">
        <div className="w-full max-w-2xl">
          <div className="text-center mb-6">
            <h1 className="text-3xl sm:text-4xl font-semibold text-slate-900 tracking-tight">
              Complete your profile
            </h1>
            <p className="text-slate-500 mt-2">
              We have your name and email from Google. Please add the following details.
            </p>
          </div>

          <div className="rounded-3xl border border-slate-200/70 bg-white/90 backdrop-blur p-6 sm:p-8 shadow-sm">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Read-only: from Google */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-xl bg-slate-50 border border-slate-100">
                <p className="text-sm font-medium text-slate-500 sm:col-span-2 mb-1">From your Google account</p>
                <div>
                  <label className="block text-xs text-slate-500 mb-1">First name</label>
                  <div className="flex items-center gap-2 text-slate-800">
                    <User className="w-4 h-4 text-slate-400" />
                    <span>{userData?.first_name || "—"}</span>
                  </div>
                </div>
                <div>
                  <label className="block text-xs text-slate-500 mb-1">Last name</label>
                  <div className="flex items-center gap-2 text-slate-800">
                    <User className="w-4 h-4 text-slate-400" />
                    <span>{userData?.last_name || "—"}</span>
                  </div>
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-xs text-slate-500 mb-1">Email</label>
                  <div className="flex items-center gap-2 text-slate-800">
                    <Mail className="w-4 h-4 text-slate-400" />
                    <span>{userData?.email || "—"}</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm text-slate-700 mb-1.5">I want to register as</label>
                  <div className="relative">
                    <Briefcase className="w-5 h-5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <select
                      value={role_id}
                      onChange={(e) => setRole_id(e.target.value)}
                      required
                      className="w-full pl-10 pr-3 py-3 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-[#C2410C]/20 focus:border-[#C2410C]/50"
                    >
                      <option value="">Select Role</option>
                      {roles.map((r) => (
                        <option key={r.id} value={r.id}>{r.label}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm text-slate-700 mb-1.5">Country</label>
                  <div className="relative">
                    <MapPin className="w-5 h-5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <select
                      value={country}
                      onChange={(e) => setCountry(e.target.value)}
                      required
                      className="w-full pl-10 pr-3 py-3 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-[#C2410C]/20 focus:border-[#C2410C]/50"
                    >
                      <option value="">Select Country</option>
                      {countries.map((c) => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="lg:col-span-2">
                  <label className="block text-sm text-slate-700 mb-1.5">Phone number</label>
                  <div className="relative">
                    <Phone className="w-5 h-5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="tel"
                      value={phone_number}
                      onChange={(e) => setPhone_number(e.target.value)}
                      required
                      placeholder="Your phone number"
                      className="w-full pl-10 pr-3 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#C2410C]/20 focus:border-[#C2410C]/50"
                    />
                  </div>
                </div>

                <div className="lg:col-span-2">
                  <label className="block text-sm text-slate-700 mb-1.5">
                    Password <span className="text-slate-400 font-normal">(optional – for logging in with email later)</span>
                  </label>
                  <div className="relative">
                    <Lock className="w-5 h-5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Min 8 characters"
                      minLength={8}
                      className="w-full pl-10 pr-12 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#C2410C]/20 focus:border-[#C2410C]/50"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((p) => !p)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>
              </div>

              {message && (
                <p className={`text-sm flex items-center gap-2 ${status ? "text-emerald-600" : "text-rose-600"}`}>
                  {status ? <CheckCircle className="w-4 h-4" /> : null}
                  {message}
                </p>
              )}

              <GradientButton
                type="submit"
                disabled={isLoading}
                className="w-full"
                style={{ backgroundColor: PRIMARY }}
              >
                {isLoading ? "Saving..." : "Complete profile"}
              </GradientButton>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
