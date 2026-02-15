import React, { useState, useEffect } from "react";
import API from "../../api/client.js";
import { useNavigate, useSearchParams } from "react-router-dom";
import arabCountries from "../../data/arabCountries.json";
import { Mail, Lock, Eye, EyeOff, Phone, MapPin, KeyRound } from "lucide-react";
import PageMeta from "../PageMeta.jsx";
import { useToast } from "../toast/ToastProvider";

const roles = [
  { id: 2, label: "Customer" },
  { id: 3, label: "Freelancer" },
  { id: 5, label: "Partner" },
];

const Register = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const [searchParams] = useSearchParams();

  const [role_id, setRole_id] = useState("");
  const [first_name, setFirst_name] = useState("");
  const [last_name, setLast_name] = useState("");
  const [phone_number, setPhone_number] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [country, setCountry] = useState("");
  const [countries, setCountries] = useState([]);
  const [username, setUsername] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [categories, setCategories] = useState([]);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [passwordStrength, setPasswordStrength] = useState({
    hasMinLength: false,
    hasUpperCase: false,
    hasLowerCase: false,
    hasNumber: false,
  });
  const [profile_pic_url, setProfile_pic_url] = useState("");
  const [uploading, setUploading] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);

  // ===== States for sub-categories =====
  const [expandedCategories, setExpandedCategories] = useState({});
  const [subCategories, setSubCategories] = useState({});
  const [selectedSubCategories, setSelectedSubCategories] = useState([]);

  // ===== OTP states =====
  const [showOtpField, setShowOtpField] = useState(false);
  const [otp, setOtp] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);

  const RESEND_COOLDOWN_SEC = 30;
  const RESEND_COOLDOWN_END_KEY = "otp_resend_cooldown_end";
  const startResendCooldown = () => {
    const end = Date.now() + RESEND_COOLDOWN_SEC * 1000;
    sessionStorage.setItem(RESEND_COOLDOWN_END_KEY, String(end));
    setResendCooldown(RESEND_COOLDOWN_SEC);
  };

  //========= countries api =========//

  useEffect(() => {
    setCountries(arabCountries.sort((a, b) => a.localeCompare(b)));
  }, []);

  // Check URL params for email verification flow (from login redirect)
  useEffect(() => {
    const emailParam = searchParams.get("email");
    const verifyParam = searchParams.get("verify");
    
    if (emailParam && verifyParam === "true") {
      // User came from login page - show OTP field directly
      setEmail(emailParam);
      setShowOtpField(true);
      // Auto-send OTP only once per session (not on every refresh)
      const storageKey = `otp_auto_sent_${emailParam}`;
      if (!sessionStorage.getItem(storageKey)) {
        sessionStorage.setItem(storageKey, "1");
        API.post("/users/resend-email-otp", { email: emailParam })
          .then(() => {
            startResendCooldown();
          })
          .catch((err) => {
            sessionStorage.removeItem(storageKey);
            toast.error(err.response?.data?.message || "Failed to resend OTP. Please try again.");
          });
      }
    }
  }, [searchParams]);

  // Restore resend cooldown after refresh (persist 30s across page reload)
  useEffect(() => {
    if (!showOtpField) return;
    const endStr = sessionStorage.getItem(RESEND_COOLDOWN_END_KEY);
    if (!endStr) return;
    const end = Number(endStr);
    const remaining = Math.ceil((end - Date.now()) / 1000);
    if (remaining > 0) setResendCooldown(remaining);
    else sessionStorage.removeItem(RESEND_COOLDOWN_END_KEY);
  }, [showOtpField]);

  useEffect(() => {
  API
    .get("/category")
    .then((res) => {
      if (res.data.success) {
        setCategories(res.data.data);
      }
    })
    .catch((err) => {
      console.error("Failed to load categories", err);
    });
}, []);


  // ========= password strength checker =========//
  useEffect(() => {
    setPasswordStrength({
      hasMinLength: password.length >= 8,
      hasUpperCase: /[A-Z]/.test(password),
      hasLowerCase: /[a-z]/.test(password),
      hasNumber: /\d/.test(password),
    });
  }, [password]);

  // ========= freelancer categories =========//
  useEffect(() => {
    // This useEffect can be simplified since we're using the new component
    // The new component handles its own category fetching
  }, []);

  const handleCategoryToggle = (categoryId) => {
    setSelectedCategories((prev) =>
      prev.includes(categoryId)
        ? prev.filter((id) => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  const removeCategory = (categoryId) => {
    setSelectedCategories((prev) => prev.filter((id) => id !== categoryId));
  };

  // ========= Fetch sub-categories when category is expanded =========//
  const toggleCategoryExpand = async (categoryId) => {
    const isExpanded = expandedCategories[categoryId];
    setExpandedCategories((prev) => ({
      ...prev,
      [categoryId]: !isExpanded,
    }));

    // Fetch sub-categories if not already fetched
    if (!isExpanded && !subCategories[categoryId]) {
      try {
        const res = await API.get(
          `/category/${categoryId}/sub-categories`
        );
        setSubCategories((prev) => ({
          ...prev,
          [categoryId]: res.data.subCategories || [],
        }));
      } catch (error) {
        console.error("Error fetching sub-categories:", error);
      }
    }
  };

  // ========= Handle sub-category selection =========//
  const handleSubCategoryToggle = (subCategoryId) => {
    setSelectedSubCategories((prev) =>
      prev.includes(subCategoryId)
        ? prev.filter((id) => id !== subCategoryId)
        : [...prev, subCategoryId]
    );
  };

  const removeSubCategory = (subCategoryId) => {
    setSelectedSubCategories((prev) =>
      prev.filter((id) => id !== subCategoryId)
    );
  };

  // Helper function to get sub-category name by ID
  const getSubCategoryName = (subCategoryId) => {
    for (const catId in subCategories) {
      const subCat = subCategories[catId]?.find((sc) => sc.id === subCategoryId);
      if (subCat) return subCat.name;
    }
    return "";
  };

  /* ===================== Upload Profile Image to Cloudinary ===================== */
  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    try {
      const formDataCloud = new FormData();
      formDataCloud.append("file", file);
      formDataCloud.append("upload_preset", import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET);
      formDataCloud.append("cloud_name", import.meta.env.VITE_CLOUDINARY_CLOUD_NAME);
      formDataCloud.append("folder", "users/profile_pics");

      const res = await fetch(
        `https://api.cloudinary.com/v1_1/${import.meta.env.VITE_CLOUDINARY_CLOUD_NAME}/auto/upload`,
        { method: "POST", body: formDataCloud }
      );

      const data = await res.json();
      if (data.secure_url) {
        setProfile_pic_url(data.secure_url);
        setMessage("Profile picture uploaded!");
        setStatus(true);
      } else {
        setMessage("Cloudinary upload failed");
        setStatus(false);
      }
    } catch (err) {
      console.error("Image upload error:", err);
      setMessage("Error uploading image");
      setStatus(false);
    } finally {
      setUploading(false);
    }
  };

  // =============== REGISTER =============== //
  const register = (e) => {
    e?.preventDefault();
    if (!acceptTerms) {
      toast.error("Please accept the Terms and Privacy Policy.");
      return;
    }
    if (role_id === "3" && selectedCategories.length === 0) {
      toast.error("Please select at least one category.");
      return;
    }
    setIsLoading(true);

    const userData = {
      role_id: parseInt(role_id),
      first_name,
      last_name,
      email,
      password,
      phone_number,
      country,
      username,
      profile_pic_url,
    };
    if (role_id === "3") userData.category_ids = selectedCategories;

    API
      .post("/users/register", userData)
      .then((result) => {
        toast.success(
          result.data.message ||
            "User registered successfully. OTP sent to email for verification."
        );
        setShowOtpField(true);
        setIsLoading(false);
        startResendCooldown();
      })
      .catch((error) => {
        const errorMessage =
          error.response?.data?.error ||
          error.response?.data?.message ||
          "Registration failed";
        toast.error(errorMessage);
        setIsLoading(false);
      });
  };

  // =============== VERIFY OTP =============== //
  const handleVerifyOtp = () => {
    if (!otp) {
      toast.error("Please enter the OTP sent to your email.");
      return;
    }
    setIsVerifying(true);
    API
      .post("/users/verify-email", { email, otp })
      .then(() => {
        toast.success("Email verified successfully ✅ Redirecting...");
        setTimeout(() => navigate("/login"), 2000);
      })
      .catch((err) => {
        toast.error(err.response?.data?.message || "Invalid or expired OTP ❌");
      })
      .finally(() => setIsVerifying(false));
  };

  // =============== RESEND OTP =============== //
  const handleResendOtp = async () => {
    if (resendCooldown > 0) return;

    try {
      const res = await API.post("/users/resend-email-otp", { email });
      toast.success(res.data?.message || "OTP sent successfully");
      startResendCooldown();
    } catch (err) {
      toast.error(
        err.response?.data?.message || "Failed to resend OTP. Please try again."
      );
    }
  };

  // =============== RESEND COOLDOWN TIMER =============== //
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => {
        setResendCooldown((prev) => {
          const next = Math.max(0, prev - 1);
          if (next === 0) sessionStorage.removeItem(RESEND_COOLDOWN_END_KEY);
          return next;
        });
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  const getPasswordStrengthText = () => {
    const validCount = Object.values(passwordStrength).filter(Boolean).length;
    if (validCount === 0) return { text: "", color: "" };
    if (validCount === 1) return { text: "Very Weak", color: "text-rose-600" };
    if (validCount === 2) return { text: "Weak", color: "text-rose-500" };
    if (validCount === 3) return { text: "Good", color: "text-amber-500" };
    if (validCount === 4) return { text: "Strong", color: "text-emerald-600" };
    return { text: "", color: "" };
  };

  const passwordStrengthInfo = getPasswordStrengthText();

  const inputPill = "h-12 rounded-xl bg-neutral-100 border border-transparent px-4 w-full focus:outline-none focus:ring-2 focus:ring-[#C2410C]/30 focus:border-[#C2410C]/40 placeholder:text-neutral-400 transition-colors";

  return (
    <div className="min-h-screen bg-neutral-100 flex items-center justify-center p-4 md:p-8 md:pt-28">
      <PageMeta title="Sign up – OrderzHouse" description="Create your OrderzHouse account as a client, freelancer, or partner." />
      <div className="w-full max-w-6xl overflow-hidden rounded-[32px] shadow-2xl ring-1 ring-black/5 bg-white grid md:grid-cols-2 min-h-[560px]">
        {/* —— Left Marketing Panel (Desktop only) —— */}
        <div className="hidden md:flex flex-col bg-gradient-to-br from-neutral-900 via-neutral-800 to-neutral-950 relative p-10 lg:p-12 overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(194,65,12,0.15)_0%,transparent_50%)] pointer-events-none" />
          <div className="relative z-10 flex flex-col h-full">
            <div className="flex-1 flex flex-col justify-center mt-8">
              <h1 className="text-2xl lg:text-3xl font-bold text-white tracking-tight leading-tight">
                Manage your projects anywhere
              </h1>
              <p className="text-neutral-400 text-sm mt-3 max-w-sm">
                Join thousands of clients and freelancers. Create your account in seconds and start collaborating.
              </p>
              <div className="mt-10 rounded-2xl bg-white/10 border border-white/10 p-6 backdrop-blur-md">
                <p className="text-neutral-200 text-sm leading-relaxed">
                  &ldquo;OrderzHouse made it easy to find skilled freelancers and get projects done on time.&rdquo;
                </p>
                <div className="flex items-center gap-3 mt-4">
                  <div className="w-10 h-10 rounded-full bg-[#C2410C]/30 flex items-center justify-center text-white font-medium">A</div>
                  <div>
                    <p className="text-white font-medium text-sm">Ahmed</p>
                    <p className="text-neutral-400 text-xs">Freelancer</p>
                  </div>
                </div>
              </div>
              <div className="flex gap-2 mt-6">
                {[0, 1, 2, 3].map((i) => (
                  <span key={i} className={`w-2 h-2 rounded-full ${i === 0 ? "bg-[#C2410C]" : "bg-white/30"}`} aria-hidden />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* —— Right Form Panel —— */}
        <div className="flex flex-col justify-center p-6 sm:p-8 md:p-10 lg:p-12">
          <div className="w-full max-w-[420px] mx-auto">
            {showOtpField ? (
              /* —— OTP View (same panel, same spacing) —— */
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-slate-900">Verify your email</h2>
                <p className="text-neutral-500 text-sm">
                  We&apos;ve sent a 6-digit code to <span className="font-medium text-[#C2410C]">{email}</span>.
                </p>
                <div className="relative">
                  <KeyRound className="w-5 h-5 text-neutral-400 absolute left-4 top-1/2 -translate-y-1/2" aria-hidden />
                  <input
                    type="text"
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                    maxLength={6}
                    placeholder="Enter OTP"
                    className={`${inputPill} pl-11 text-center tracking-widest text-lg`}
                    aria-label="Verification code"
                  />
                </div>
                <button
                  type="button"
                  onClick={handleVerifyOtp}
                  disabled={isVerifying}
                  className="w-full h-12 rounded-xl bg-[#C2410C] hover:bg-[#9A3412] text-white font-medium flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed transition-colors focus:outline-none focus:ring-2 focus:ring-[#C2410C]/30 focus:ring-offset-2"
                >
                  {isVerifying ? "Verifying..." : "Verify OTP"}
                </button>
                <div className="text-center">
                  <button
                    type="button"
                    onClick={handleResendOtp}
                    disabled={resendCooldown > 0 || isVerifying}
                    className={`text-sm ${resendCooldown > 0 ? "text-neutral-400 cursor-not-allowed" : "text-[#C2410C] hover:underline"}`}
                  >
                    {resendCooldown > 0 ? `Resend code in ${resendCooldown}s` : "Resend code"}
                  </button>
                </div>
                <p className="text-center text-sm text-neutral-500">
                  Wrong email? <button type="button" onClick={() => setShowOtpField(false)} className="text-[#C2410C] hover:underline">Change email</button>
                </p>
              </div>
            ) : (
              /* —— Registration Form —— */
              <form onSubmit={register} className="space-y-5">
                <h2 className="text-2xl font-bold text-slate-900">Create an account</h2>

                {/* Segmented control: role */}
                <div role="tablist" aria-label="Account type" className="flex p-1 rounded-xl bg-neutral-100">
                  {roles.map((role) => (
                    <button
                      key={role.id}
                      type="button"
                      role="tab"
                      aria-pressed={role_id === String(role.id)}
                      onClick={() => setRole_id(String(role.id))}
                      className={`flex-1 py-2.5 px-3 rounded-lg text-sm font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#C2410C] focus-visible:ring-offset-2 ${
                        role_id === String(role.id)
                          ? "bg-neutral-900 text-white"
                          : "text-neutral-600 hover:text-neutral-900"
                      }`}
                    >
                      {role.label}
                    </button>
                  ))}
                </div>

                {/* Freelancer categories (chips) */}
                {role_id === "3" && (
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Categories (at least one)</label>
                    <div className="flex flex-wrap gap-2">
                      {categories.map((cat) => (
                        <button
                          key={cat.id}
                          type="button"
                          onClick={() => handleCategoryToggle(cat.id)}
                          className={`rounded-full border px-3 py-1.5 text-sm transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#C2410C] ${
                            selectedCategories.includes(cat.id)
                              ? "bg-[#C2410C] text-white border-[#C2410C]"
                              : "bg-neutral-100 text-slate-700 border-neutral-200 hover:border-[#C2410C]/50"
                          }`}
                        >
                          {cat.name}
                        </button>
                      ))}
                    </div>
                    {selectedCategories.length > 0 && <p className="text-xs text-neutral-500 mt-1">{selectedCategories.length} selected</p>}
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="first_name" className="block text-sm font-medium text-slate-700 mb-1">First name</label>
                    <input id="first_name" type="text" value={first_name} onChange={(e) => setFirst_name(e.target.value)} placeholder="First name" className={inputPill} required aria-required="true" />
                  </div>
                  <div>
                    <label htmlFor="last_name" className="block text-sm font-medium text-slate-700 mb-1">Last name</label>
                    <input id="last_name" type="text" value={last_name} onChange={(e) => setLast_name(e.target.value)} placeholder="Last name" className={inputPill} required aria-required="true" />
                  </div>
                </div>

                <div>
                  <label htmlFor="username" className="block text-sm font-medium text-slate-700 mb-1">Username</label>
                  <input id="username" type="text" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Username" className={inputPill} required aria-required="true" />
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                  <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" className={inputPill} required aria-required="true" />
                </div>

                <div>
                  <label htmlFor="country" className="block text-sm font-medium text-slate-700 mb-1">Country</label>
                  <select id="country" value={country} onChange={(e) => setCountry(e.target.value)} className={inputPill} required aria-required="true">
                    <option value="">Select country</option>
                    {countries.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>

                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-slate-700 mb-1">Phone number</label>
                  <input id="phone" type="tel" value={phone_number} onChange={(e) => setPhone_number(e.target.value)} placeholder="+1234567890" className={inputPill} required aria-required="true" />
                </div>

                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-slate-700 mb-1">Password</label>
                  <div className="relative">
                    <input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className={`${inputPill} pr-12`}
                      required
                      aria-required="true"
                    />
                    <button type="button" onClick={() => setShowPassword((p) => !p)} className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-[#C2410C] focus:outline-none" aria-label={showPassword ? "Hide password" : "Show password"}>
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                  <div className="mt-1.5 flex items-center justify-between">
                    <span className="text-xs text-neutral-500">Strength</span>
                    <span className={`text-xs font-medium ${passwordStrengthInfo.color}`}>{passwordStrengthInfo.text}</span>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <input
                    id="acceptTerms"
                    type="checkbox"
                    checked={acceptTerms}
                    onChange={(e) => setAcceptTerms(e.target.checked)}
                    className="h-4 w-4 rounded border-neutral-300 text-[#C2410C] focus:ring-[#C2410C] mt-0.5"
                    aria-describedby="terms-desc"
                  />
                  <label id="terms-desc" htmlFor="acceptTerms" className="text-sm text-slate-700">
                    I agree to the <a href="#" className="text-[#C2410C] hover:underline">Terms and Conditions</a> and <a href="#" className="text-[#C2410C] hover:underline">Privacy Policy</a>.
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full h-12 rounded-xl bg-[#C2410C] hover:bg-[#9A3412] text-white font-medium flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed transition-colors focus:outline-none focus:ring-2 focus:ring-[#C2410C]/30 focus:ring-offset-2"
                >
                  {isLoading ? (
                    <>
                      <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" aria-hidden>
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Creating account...
                    </>
                  ) : (
                    "Create account"
                  )}
                </button>
              </form>
            )}

            {/* Footer: Log in link */}
            <p className="mt-6 text-center text-sm text-neutral-600">
              Already have an account?{" "}
              <a href="/login" className="font-medium text-[#C2410C] hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-[#C2410C] focus-visible:ring-offset-2 rounded">
                Log in
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
