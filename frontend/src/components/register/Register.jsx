import React, { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { setLogin } from "../../slice/auth/authSlice";
import axios from "axios";
import { useNavigate } from "react-router";
import arabCountries from "../../data/arabCountries.json";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  User,
  Phone,
  MapPin,
  AlertCircle,
  CheckCircle,
  Briefcase,
  ArrowLeft,
  X,
  Shield,
  Check,
  KeyRound,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import GradientButton from "../buttons/GradientButton.jsx";

const roles = [
  { id: 2, label: "Customer" },
  { id: 3, label: "Freelancer" },
  { id: 5, label: "Partner" },
];

const PRIMARY = "#028090";
const API_URL = import.meta.env.VITE_APP_API_URL;

const Register = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

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

  // ===== States for sub-categories =====
  const [expandedCategories, setExpandedCategories] = useState({});
  const [subCategories, setSubCategories] = useState({});
  const [selectedSubCategories, setSelectedSubCategories] = useState([]);

  // ===== OTP states =====
  const [showOtpField, setShowOtpField] = useState(false);
  const [otp, setOtp] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);

  //========= countries api =========//

  useEffect(() => {
    setCountries(arabCountries.sort((a, b) => a.localeCompare(b)));
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
    axios
      .get(`${API_URL}/category`)
      .then((response) => setCategories(response.data.categories || []))
      .catch((error) => console.error("Error fetching categories:", error));
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
        const res = await axios.get(
          `${API_URL}/category/${categoryId}/sub-categories`
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
    e.preventDefault();
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

    if (role_id === "3") {
      userData.categories = selectedCategories;
      userData.sub_categories = selectedSubCategories;
    }

    axios
      .post(`${API_URL}/users/register`, userData)
      .then((result) => {
        setStatus(true);
        setMessage(
          result.data.message ||
            "User registered successfully. OTP sent to email for verification."
        );
        setShowOtpField(true);
        setIsLoading(false);
      })
      .catch((error) => {
        setStatus(false);
        setMessage(error.response?.data?.message || "Registration failed");
        setIsLoading(false);
      });
  };

  // =============== VERIFY OTP =============== //
  const handleVerifyOtp = () => {
    if (!otp) {
      setMessage("Please enter the OTP sent to your email.");
      setStatus(false);
      return;
    }
    setIsVerifying(true);
    axios
      .post(`${API_URL}/users/verify-email`, { email, otp })
      .then(() => {
        setStatus(true);
        setMessage("Email verified successfully ✅ Redirecting...");
        setTimeout(() => navigate("/login"), 2000);
      })
      .catch((err) => {
        setStatus(false);
        setMessage(err.response?.data?.message || "Invalid or expired OTP ❌");
      })
      .finally(() => setIsVerifying(false));
  };

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

  return (
    <div className="min-h-screen bg-white relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-28 -right-28 w-80 h-80 rounded-full bg-[#028090]/10 blur-3xl" />
        <div className="absolute -bottom-32 -left-28 w-96 h-96 rounded-full bg-[#028090]/5 blur-3xl" />
      </div>

      <div className="flex min-h-screen items-center justify-center p-4 lg:px-8">
        <div className="w-full max-w-5xl">
          <div className="text-center mb-6">
            <h1 className="text-3xl sm:text-4xl font-semibold text-slate-900 tracking-tight">
              {showOtpField ? "Verify your email" : "Create your account"}
            </h1>
            <p className="text-slate-500 mt-2">
              {showOtpField
                ? `We've sent a 6-digit code to ${email}`
                : "Join ORDERZHOUSE in seconds"}
            </p>
          </div>

          <div className="rounded-3xl border border-slate-200/70 bg-white/90 backdrop-blur p-6 sm:p-8 shadow-sm">
            {!showOtpField ? (
              <form onSubmit={register} className="space-y-6">
              
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* LEFT SIDE */}
                  <div className="space-y-5">
                    <div>
                      <label className="block text-sm text-slate-700 mb-1.5">
                        I want to register as
                      </label>
                      <div className="relative">
                        <Briefcase className="w-5 h-5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <select
                          value={role_id}
                          onChange={(e) => setRole_id(e.target.value)}
                          required
                          className="w-full pl-10 pr-3 py-3 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-[#028090]/20 focus:border-[#028090]/50"
                        >
                          <option value="">Select Role</option>
                          {roles.map((role) => (
                            <option key={role.id} value={role.id}>
                              {role.label}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* Freelancer Categories with Sub-Categories */}
                    {role_id === "3" && (
                      <div className="border border-slate-200 rounded-xl p-4 bg-slate-50/60">
                        <label className="block text-sm text-slate-700 mb-2">
                          What category would you like to work in?
                          <span className="block text-xs text-slate-500">
                            Choose your areas of expertise (categories and sub-categories)
                          </span>
                        </label>

                        {/* Selected Categories Display */}
                        {selectedCategories.length > 0 && (
                          <div className="mb-3 max-h-20 overflow-y-auto">
                            <div className="flex flex-wrap gap-2">
                              {selectedCategories.map((categoryId) => {
                                const category = categories.find(
                                  (cat) => cat.id === categoryId
                                );
                                return category ? (
                                  <div
                                    key={categoryId}
                                    className="inline-flex items-center bg-[#028090] text-white px-3 py-1 rounded-full text-xs"
                                  >
                                    <span className="truncate max-w-24">
                                      {category.name}
                                    </span>
                                    <button
                                      type="button"
                                      onClick={() => removeCategory(categoryId)}
                                      className="ml-2 hover:bg-white/20 rounded-full p-0.5"
                                    >
                                      <X className="h-3 w-3" />
                                    </button>
                                  </div>
                                ) : null;
                              })}
                            </div>
                          </div>
                        )}

                        {/* Selected Sub-Categories Display */}
                        {selectedSubCategories.length > 0 && (
                          <div className="mb-3 max-h-20 overflow-y-auto">
                            <div className="flex flex-wrap gap-2">
                              {selectedSubCategories.map((subCategoryId) => {
                                const name = getSubCategoryName(subCategoryId);
                                return name ? (
                                  <div
                                    key={subCategoryId}
                                    className="inline-flex items-center bg-emerald-600 text-white px-3 py-1 rounded-full text-xs"
                                  >
                                    <span className="truncate max-w-24">{name}</span>
                                    <button
                                      type="button"
                                      onClick={() => removeSubCategory(subCategoryId)}
                                      className="ml-2 hover:bg-white/20 rounded-full p-0.5"
                                    >
                                      <X className="h-3 w-3" />
                                    </button>
                                  </div>
                                ) : null;
                              })}
                            </div>
                          </div>
                        )}

                        {/* Categories List with Expandable Sub-Categories */}
                        <div className="max-h-96 overflow-y-auto rounded-lg border border-slate-200">
                          <div className="p-3 space-y-2">
                            {categories.map((category) => (
                              <div key={category.id} className="space-y-1">
                                {/* Main Category */}
                                <div className="flex items-center gap-2">
                                  <button
                                    type="button"
                                    onClick={() => handleCategoryToggle(category.id)}
                                    className={`flex-1 p-3 rounded-lg border text-left transition ${
                                      selectedCategories.includes(category.id)
                                        ? "border-[#028090] bg-[#028090]/5 text-[#028090]"
                                        : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                                    }`}
                                  >
                                    <div className="flex items-center">
                                      {selectedCategories.includes(category.id) && (
                                        <Check className="w-4 h-4 text-[#028090] mr-2" />
                                      )}
                                      <span className="truncate">{category.name}</span>
                                    </div>
                                  </button>

                                  {/* Expand/Collapse Button */}
                                  <button
                                    type="button"
                                    onClick={() => toggleCategoryExpand(category.id)}
                                    className="p-2 rounded-lg border border-slate-200 bg-white hover:bg-slate-50"
                                  >
                                    {expandedCategories[category.id] ? (
                                      <ChevronUp className="w-4 h-4 text-slate-600" />
                                    ) : (
                                      <ChevronDown className="w-4 h-4 text-slate-600" />
                                    )}
                                  </button>
                                </div>

                                {/* Sub-Categories (shown when expanded) */}
                                {expandedCategories[category.id] &&
                                  subCategories[category.id] && (
                                    <div className="ml-6 space-y-1">
                                      {subCategories[category.id].map((subCategory) => (
                                        <button
                                          key={subCategory.id}
                                          type="button"
                                          onClick={() =>
                                            handleSubCategoryToggle(subCategory.id)
                                          }
                                          className={`w-full p-2 rounded-lg border text-left text-sm transition ${
                                            selectedSubCategories.includes(subCategory.id)
                                              ? "border-emerald-600 bg-emerald-50 text-emerald-700"
                                              : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                                          }`}
                                        >
                                          <div className="flex items-center">
                                            {selectedSubCategories.includes(
                                              subCategory.id
                                            ) && (
                                              <Check className="w-4 h-4 text-emerald-600 mr-2" />
                                            )}
                                            <span className="truncate">
                                              {subCategory.name}
                                            </span>
                                          </div>
                                        </button>
                                      ))}
                                    </div>
                                  )}
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* First Name */}
                    <div>
                      <label className="block text-sm text-slate-700 mb-1.5">
                        First Name
                      </label>
                      <div className="relative">
                        <User className="w-5 h-5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                          type="text"
                          value={first_name}
                          onChange={(e) => setFirst_name(e.target.value)}
                          required
                          placeholder="Your first name"
                          className="w-full pl-10 pr-3 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#028090]/20 focus:border-[#028090]/50"
                        />
                      </div>
                    </div>

                    {/* Last Name */}
                    <div>
                      <label className="block text-sm text-slate-700 mb-1.5">
                        Last Name
                      </label>
                      <div className="relative">
                        <User className="w-5 h-5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                          type="text"
                          value={last_name}
                          onChange={(e) => setLast_name(e.target.value)}
                          required
                          placeholder="Your last name"
                          className="w-full pl-10 pr-3 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#028090]/20 focus:border-[#028090]/50"
                        />
                      </div>
                    </div>

                    {/* Username */}
                    <div>
                      <label className="block text-sm text-slate-700 mb-1.5">
                        Username
                      </label>
                      <div className="relative">
                        <User className="w-5 h-5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                          type="text"
                          value={username}
                          onChange={(e) => setUsername(e.target.value)}
                          required
                          placeholder="Choose a username"
                          className="w-full pl-10 pr-3 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#028090]/20 focus:border-[#028090]/50"
                        />
                      </div>
                    </div>
                  </div>

                  {/* RIGHT SIDE */}
                  <div className="space-y-5">
                    {/* Email */}
                    <div>
                      <label className="block text-sm text-slate-700 mb-1.5">
                        Email Address
                      </label>
                      <div className="relative">
                        <Mail className="w-5 h-5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          required
                          placeholder="you@email.com"
                          className="w-full pl-10 pr-3 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#028090]/20 focus:border-[#028090]/50"
                        />
                      </div>
                    </div>

                    {/* Password */}
                    <div>
                      <label className="block text-sm text-slate-700 mb-1.5">
                        Password
                      </label>
                      <div className="relative">
                        <Lock className="w-5 h-5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                          type={showPassword ? "text" : "password"}
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          required
                          placeholder="••••••••"
                          className="w-full pl-10 pr-12 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#028090]/20 focus:border-[#028090]/50"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-[#028090]"
                        >
                          {showPassword ? (
                            <EyeOff className="w-5 h-5" />
                          ) : (
                            <Eye className="w-5 h-5" />
                          )}
                        </button>
                      </div>

                      {/* Strength */}
                      <div className="mt-2">
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-xs text-slate-600">
                            Password Strength:
                          </span>
                          <span
                            className={`text-xs font-medium ${passwordStrengthInfo.color}`}
                          >
                            {passwordStrengthInfo.text}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Country */}
                    <div>
                      <label className="block text-sm text-slate-700 mb-1.5">
                        Country
                      </label>
                      <div className="relative">
                        <MapPin className="w-5 h-5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <select
                          value={country}
                          onChange={(e) => setCountry(e.target.value)}
                          required
                          className="w-full pl-10 pr-3 py-3 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-[#028090]/20 focus:border-[#028090]/50"
                        >
                          <option value="">Select Country</option>
                          {countries.map((c) => (
                            <option key={c} value={c}>
                              {c}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* Phone */}
                    <div>
                      <label className="block text-sm text-slate-700 mb-1.5">
                        Phone Number
                      </label>
                      <div className="relative">
                        <Phone className="w-5 h-5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                          type="tel"
                          value={phone_number}
                          onChange={(e) => setPhone_number(e.target.value)}
                          required
                          placeholder="Your phone number"
                          className="w-full pl-10 pr-3 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#028090]/20 focus:border-[#028090]/50"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Terms */}
                <div className="flex items-start">
                  <input
                    id="terms"
                    type="checkbox"
                    required
                    className="h-4 w-4 text-[#028090] focus:ring-[#028090] border-slate-300 rounded mt-0.5"
                  />
                  <label htmlFor="terms" className="ml-2 text-sm text-slate-700">
                    I agree to the{" "}
                    <a href="#" className="text-[#028090] hover:underline">
                      Terms and Conditions
                    </a>{" "}
                    and{" "}
                    <a href="#" className="text-[#028090] hover:underline">
                      Privacy Policy
                    </a>
                  </label>
                </div>

                {/* Submit */}
                <div className="flex items-center justify-center">
                  <GradientButton
                    className="px-14 flex items-center justify-center"
                    disabled={isLoading}
                  >
                    <div className="relative z-10 flex items-center">
                      {isLoading ? (
                        <>
                          <svg
                            className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                          >
                            <circle
                              className="opacity-25"
                              cx="12"
                              cy="12"
                              r="10"
                              stroke="currentColor"
                              strokeWidth="4"
                            ></circle>
                            <path
                              className="opacity-75"
                              fill="currentColor"
                              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                            ></path>
                          </svg>
                          Creating secure account...
                        </>
                      ) : (
                        <>
                          <Shield className="w-5 h-5 mr-2" />
                          Create Secure Account
                        </>
                      )}
                    </div>
                  </GradientButton>
                </div>
              </form>
            ) : (
              // =================== OTP Section =================== //
              <div className="space-y-6 text-center">
                <h2 className="text-xl font-semibold text-slate-800">
                  Verify your email
                </h2>
                <p className="text-slate-500 text-sm">
                  We've sent a 6-digit code to{" "}
                  <span className="font-medium text-[#028090]">{email}</span>.
                </p>

                <div className="flex items-center justify-center">
                  <div className="relative w-64">
                    <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                    <input
                      type="text"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      maxLength={6}
                      placeholder="Enter OTP"
                      className="w-full pl-10 pr-3 py-3 text-center tracking-widest text-lg rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#028090]/20 focus:border-[#028090]/50"
                    />
                  </div>
                </div>

                <GradientButton onClick={handleVerifyOtp} disabled={isVerifying}>
                  {isVerifying ? "Verifying..." : "Verify OTP"}
                </GradientButton>
              </div>
            )}

            {/* Message */}
            {message && (
              <div
                className={`mt-6 p-4 rounded-xl flex items-start border ${
                  status
                    ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                    : "bg-rose-50 text-rose-800 border-rose-200"
                }`}
              >
                {status ? (
                  <CheckCircle className="w-5 h-5 mt-0.5 mr-3 text-emerald-600" />
                ) : (
                  <AlertCircle className="w-5 h-5 mt-0.5 mr-3 text-rose-600" />
                )}
                <p className="text-sm">{message}</p>
              </div>
            )}
          </div>

          {!showOtpField && (
            <div className="mt-6 text-center pt-4 border-t border-slate-200">
              <p className="text-sm text-slate-600">
                Already have an account?{" "}
                <a
                  href="/login"
                  className="font-medium text-[#028090] inline-flex items-center hover:underline"
                >
                  Sign in
                  <ArrowLeft className="ml-1 h-4 w-4 rotate-180" />
                </a>
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Register;