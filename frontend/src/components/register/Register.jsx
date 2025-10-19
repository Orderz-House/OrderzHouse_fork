import React, { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { setLogin } from "../../slice/auth/authSlice";
import axios from "axios";
import { useNavigate } from "react-router";
import {
  Mail, Lock, Eye, EyeOff, User, Phone, MapPin,
  AlertCircle, CheckCircle, Briefcase, ArrowLeft, X, Shield, Check
} from "lucide-react";
import GradientButton from "../buttons/GradientButton.jsx";

const countries = [
  "Afghanistan","Albania","Algeria","American Samoa","Andorra","Angola","Anguilla","Antarctica",
  "Antigua and Barbuda","Argentina","Armenia","Aruba","Australia","Austria","Azerbaijan","Bahamas (the)","Bahrain",
  "Bangladesh","Barbados","Belarus","Belgium","Belize","Benin","Bermuda","Bhutan","Bolivia (Plurinational State of)",
  "Bonaire, Sint Eustatius and Saba","Bosnia and Herzegovina","Botswana","Bouvet Island","Brazil",
  "British Indian Ocean Territory (the)","Brunei Darussalam","Bulgaria","Burkina Faso","Burundi","Cabo Verde","Cambodia",
  "Cameroon","Canada","Cayman Islands (the)","Central African Republic (the)","Chad","Chile","China","Christmas Island",
  "Cocos (Keeling) Islands (the)","Colombia","Comoros (the)","Congo (the Democratic Republic of the)","Congo (the)",
  "Cook Islands (the)","Costa Rica","Croatia","Cuba","Curaçao","Cyprus","Czechia","Côte d'Ivoire","Denmark","Djibouti",
  "Dominica","Dominican Republic (the)","Ecuador","Egypt","El Salvador","Equatorial Guinea","Eritrea","Estonia","Eswatini",
  "Ethiopia","Falkland Islands (the) [Malvinas]","Faroe Islands (the)","Fiji","Finland","France","French Guiana",
  "French Polynesia","French Southern Territories (the)","Gabon","Gambia (the)","Georgia","Germany","Ghana","Gibraltar",
  "Greece","Greenland","Grenada","Guadeloupe","Guam","Guatemala","Guernsey","Guinea","Guinea-Bissau","Guyana","Haiti",
  "Heard Island and McDonald Islands","Holy See (the)","Honduras","Hong Kong","Hungary","Iceland","India","Indonesia",
  "Iran (Islamic Republic of)","Iraq","Ireland","Isle of Man","Italy","Jamaica","Japan","Jersey","Jordan","Kazakhstan",
  "Kenya","Kiribati","Korea (the Democratic People's Republic of)","Korea (the Republic of)","Kuwait","Kyrgyzstan",
  "Lao People's Democratic Republic (the)","Latvia","Lebanon","Lesotho","Liberia","Libya","Liechtenstein","Lithuania",
  "Luxembourg","Macao","Madagascar","Malawi","Malaysia","Maldives","Mali","Malta","Marshall Islands (the)","Martinique",
  "Mauritania","Mauritius","Mayotte","Mexico","Micronesia (Federated States of)","Moldova (the Republic of)","Monaco",
  "Mongolia","Montenegro","Montserrat","Morocco","Mozambique","Myanmar","Namibia","Nauru","Nepal","Netherlands (the)",
  "New Caledonia","New Zealand","Nicaragua","Niger (the)","Nigeria","Niue","Norfolk Island","Northern Mariana Islands (the)",
  "Norway","Oman","Pakistan","Palau","Palestine, State of","Panama","Papua New Guinea","Paraguay","Peru","Philippines (the)",
  "Pitcairn","Poland","Portugal","Puerto Rico","Qatar","Republic of North Macedonia","Romania","Russian Federation (the)",
  "Rwanda","Réunion","Saint Barthélemy","Saint Helena, Ascension and Tristan da Cunha","Saint Kitts and Nevis","Saint Lucia",
  "Saint Martin (French part)","Saint Pierre and Miquelon","Saint Vincent and the Grenadines","Samoa","San Marino",
  "Sao Tome and Principe","Saudi Arabia","Senegal","Serbia","Seychelles","Sierra Leone","Singapore","Sint Maarten (Dutch part)",
  "Slovakia","Slovenia","Solomon Islands","Somalia","South Africa","South Georgia and the South Sandwich Islands","South Sudan",
  "Spain","Sri Lanka","Sudan (the)","Suriname","Svalbard and Jan Mayen","Sweden","Switzerland","Syrian Arab Republic","Taiwan",
  "Tajikistan","Tanzania, United Republic of","Thailand","Timor-Leste","Togo","Tokelau","Tonga","Trinidad and Tobago","Tunisia",
  "Turkey","Turkmenistan","Turks and Caicos Islands (the)","Tuvalu","Uganda","Ukraine","United Arab Emirates (the)",
  "United Kingdom of Great Britain and Northern Ireland (the)","United States Minor Outlying Islands (the)",
  "United States of America (the)","Uruguay","Uzbekistan","Vanuatu","Venezuela (Bolivarian Republic of)","Viet Nam",
  "Virgin Islands (British)","Virgin Islands (U.S.)","Wallis and Futuna","Western Sahara","Yemen","Zambia","Zimbabwe","Åland Islands"
];

const roles = [
  { id: 2, label: "Customer" },
  { id: 3, label: "Freelancer" },
];

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

  useEffect(() => {
    setPasswordStrength({
      hasMinLength: password.length >= 8,
      hasUpperCase: /[A-Z]/.test(password),
      hasLowerCase: /[a-z]/.test(password),
      hasNumber: /\d/.test(password),
    });
  }, [password]);

  useEffect(() => {
    axios
      .get("api/category")
      .then((response) => {
        setCategories(response.data.categories || []);
      })
      .catch((error) => {
        console.error("Error fetching categories:", error);
      });
  }, []);

  const handleCategoryToggle = (categoryId) => {
    setSelectedCategories((prev) =>
      prev.includes(categoryId) ? prev.filter((id) => id !== categoryId) : [...prev, categoryId]
    );
  };
  const removeCategory = (categoryId) => {
    setSelectedCategories((prev) => prev.filter((id) => id !== categoryId));
  };

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
    };
    if (role_id === "3") {
      userData.categories = selectedCategories;
    }

    axios
      .post("/api/users/register", userData)
      .then((result) => {
        setStatus(true);
        setMessage(result.data.message || "Registration successful");

        axios
          .post("/api/users/login", { email, password })
          .then((res) => {
            dispatch(
              setLogin({
                token: res.data.token,
                userId: res.data.userId,
                roleId: res.data.role,
              })
            );
            setIsLoading(false);
            navigate("/");
          })
          .catch((err) => {
            console.error("Auto login failed:", err);
            setIsLoading(false);
          });
      })
      .catch((error) => {
        setStatus(false);
        setMessage(error.response?.data?.message || "Registration failed");
        setIsLoading(false);
      });
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
      {/* Soft background accents */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-28 -right-28 w-80 h-80 rounded-full bg-[#028090]/10 blur-3xl" />
        <div className="absolute -bottom-32 -left-28 w-96 h-96 rounded-full bg-[#028090]/5 blur-3xl" />
      </div>

      <div className="flex min-h-screen items-center justify-center p-4 lg:px-8">
        <div className="w-full max-w-5xl">
          {/* Title */}
          <div className="text-center mb-6">
            <h1 className="text-3xl sm:text-4xl font-semibold text-slate-900 tracking-tight">
              Create your account
            </h1>
            <p className="text-slate-500 mt-2">
              Join <span className="font-semibold text-[#028090]">ORDERZHOUSE</span> in seconds
            </p>
          </div>

          {/* Card */}
          <div className="rounded-3xl border border-slate-200/70 bg-white/90 backdrop-blur p-6 sm:p-8 shadow-sm">
            <form onSubmit={register} className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* LEFT */}
                <div className="space-y-5">
                  {/* Role */}
                  <div>
                    <label htmlFor="role_id" className="block text-sm text-slate-700 mb-1.5">
                      I want to register as
                    </label>
                    <div className="relative">
                      <Briefcase className="w-5 h-5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <select
                        id="role_id"
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

                  {/* Categories (Freelancer only) */}
                  {role_id === "3" && (
                    <div className="border border-slate-200 rounded-xl p-4 bg-slate-50/60">
                      <label className="block text-sm text-slate-700 mb-2">
                        What category would you like to work in?
                        <span className="block text-xs text-slate-500">
                          Choose your areas of expertise (select multiple)
                        </span>
                      </label>

                      {selectedCategories.length > 0 && (
                        <div className="mb-3 max-h-20 overflow-y-auto">
                          <div className="flex flex-wrap gap-2">
                            {selectedCategories.map((categoryId) => {
                              const category = categories.find((cat) => cat.id === categoryId);
                              return category ? (
                                <div
                                  key={categoryId}
                                  className="inline-flex items-center bg-[#028090] text-white px-3 py-1 rounded-full text-xs"
                                >
                                  <span className="truncate max-w-24">{category.name}</span>
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

                      <div className="max-h-48 overflow-y-auto rounded-lg border border-slate-200">
                        <div className="grid grid-cols-1 gap-2 p-3">
                          {categories.map((category) => (
                            <button
                              key={category.id}
                              type="button"
                              onClick={() => handleCategoryToggle(category.id)}
                              className={`p-3 rounded-lg border text-left transition ${
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
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* First Name */}
                  <div>
                    <label htmlFor="first_name" className="block text-sm text-slate-700 mb-1.5">
                      First Name
                    </label>
                    <div className="relative">
                      <User className="w-5 h-5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        id="first_name"
                        placeholder="Your first name"
                        value={first_name}
                        onChange={(e) => setFirst_name(e.target.value)}
                        required
                        className="w-full pl-10 pr-3 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#028090]/20 focus:border-[#028090]/50"
                      />
                    </div>
                  </div>

                  {/* Last Name */}
                  <div>
                    <label htmlFor="last_name" className="block text-sm text-slate-700 mb-1.5">
                      Last Name
                    </label>
                    <div className="relative">
                      <User className="w-5 h-5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        id="last_name"
                        placeholder="Your last name"
                        value={last_name}
                        onChange={(e) => setLast_name(e.target.value)}
                        required
                        className="w-full pl-10 pr-3 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#028090]/20 focus:border-[#028090]/50"
                      />
                    </div>
                  </div>

                  {/* Username */}
                  <div>
                    <label htmlFor="username" className="block text-sm text-slate-700 mb-1.5">
                      Username
                    </label>
                    <div className="relative">
                      <User className="w-5 h-5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        id="username"
                        placeholder="Choose a username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                        className="w-full pl-10 pr-3 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#028090]/20 focus:border-[#028090]/50"
                      />
                    </div>
                  </div>
                </div>

                {/* RIGHT */}
                <div className="space-y-5">
                  {/* Email */}
                  <div>
                    <label htmlFor="email" className="block text-sm text-slate-700 mb-1.5">
                      Email Address
                    </label>
                    <div className="relative">
                      <Mail className="w-5 h-5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="email"
                        id="email"
                        placeholder="you@email.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="w-full pl-10 pr-3 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#028090]/20 focus:border-[#028090]/50"
                      />
                    </div>
                  </div>

                  {/* Password + strength */}
                  <div>
                    <label htmlFor="password" className="block text-sm text-slate-700 mb-1.5">
                      Password
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
                        className="w-full pl-10 pr-12 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#028090]/20 focus:border-[#028090]/50"
                      />
                      <button
                        type="button"
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-[#028090]"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>

                    <div className="mt-2">
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-xs text-slate-600">Password Strength:</span>
                        <span className={`text-xs font-medium ${passwordStrengthInfo.color}`}>
                          {passwordStrengthInfo.text}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div className={`flex items-center text-[11px] ${passwordStrength.hasMinLength ? "text-emerald-600" : "text-slate-400"}`}>
                          <Check className={`w-3 h-3 mr-1.5 ${passwordStrength.hasMinLength ? "text-emerald-600" : "text-slate-300"}`} />
                          At least 8 characters
                        </div>
                        <div className={`flex items-center text-[11px] ${passwordStrength.hasUpperCase ? "text-emerald-600" : "text-slate-400"}`}>
                          <Check className={`w-3 h-3 mr-1.5 ${passwordStrength.hasUpperCase ? "text-emerald-600" : "text-slate-300"}`} />
                          One uppercase letter
                        </div>
                        <div className={`flex items-center text-[11px] ${passwordStrength.hasLowerCase ? "text-emerald-600" : "text-slate-400"}`}>
                          <Check className={`w-3 h-3 mr-1.5 ${passwordStrength.hasLowerCase ? "text-emerald-600" : "text-slate-300"}`} />
                          One lowercase letter
                        </div>
                        <div className={`flex items-center text-[11px] ${passwordStrength.hasNumber ? "text-emerald-600" : "text-slate-400"}`}>
                          <Check className={`w-3 h-3 mr-1.5 ${passwordStrength.hasNumber ? "text-emerald-600" : "text-slate-300"}`} />
                          One number
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Country */}
                  <div>
                    <label htmlFor="country" className="block text-sm text-slate-700 mb-1.5">
                      Country
                    </label>
                    <div className="relative">
                      <MapPin className="w-5 h-5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <select
                        id="country"
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
                    <label htmlFor="phone_number" className="block text-sm text-slate-700 mb-1.5">
                      Phone Number
                    </label>
                    <div className="relative">
                      <Phone className="w-5 h-5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="tel"
                        id="phone_number"
                        placeholder="Your phone"
                        value={phone_number}
                        onChange={(e) => setPhone_number(e.target.value)}
                        pattern="^[0-9+\-\s()]*$"
                        required
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
                  name="terms"
                  type="checkbox"
                  className="h-4 w-4 text-[#028090] focus:ring-[#028090] border-slate-300 rounded mt-0.5"
                  required
                />
                <label htmlFor="terms" className="ml-2 text-sm text-slate-700">
                  I agree to the{" "}
                  <a href="#" className="text-[#028090] hover:underline">Terms and Conditions</a> and{" "}
                  <a href="#" className="text-[#028090] hover:underline">Privacy Policy</a>
                </label>
              </div>

              {/* Submit */}
              <div className="flex items-center justify-center">
                <GradientButton className="px-14 flex items-center justify-center" disabled={isLoading}>
                  <div className="relative z-10 flex items-center">
                    {isLoading ? (
                      <>
                        <svg
                          className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
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
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
