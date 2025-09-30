// components/Register.js

import React, { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { setLogin } from "../../slice/auth/authSlice"; // Adjust this path to your actual auth slice location
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
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
} from "lucide-react";

// --- Data Arrays ---
// A comprehensive list of countries for the dropdown menu.
const countries = [
  "Afghanistan", "Åland Islands", "Albania", "Algeria", "American Samoa", "Andorra", "Angola", "Anguilla", "Antarctica", "Antigua and Barbuda",
  "Argentina", "Armenia", "Aruba", "Australia", "Austria", "Azerbaijan", "Bahamas", "Bahrain", "Bangladesh", "Barbados", "Belarus", "Belgium",
  "Belize", "Benin", "Bermuda", "Bhutan", "Bolivia (Plurinational State of)", "Bonaire, Sint Eustatius and Saba", "Bosnia and Herzegovina",
  "Botswana", "Bouvet Island", "Brazil", "British Indian Ocean Territory", "Brunei Darussalam", "Bulgaria", "Burkina Faso", "Burundi", "Cabo Verde",
  "Cambodia", "Cameroon", "Canada", "Cayman Islands", "Central African Republic", "Chad", "Chile", "China", "Christmas Island", "Cocos (Keeling) Islands",
  "Colombia", "Comoros", "Congo (the Democratic Republic of the)", "Congo", "Cook Islands", "Costa Rica", "Côte d'Ivoire", "Croatia", "Cuba",
  "Curaçao", "Cyprus", "Czechia", "Denmark", "Djibouti", "Dominica", "Dominican Republic", "Ecuador", "Egypt", "El Salvador", "Equatorial Guinea",
  "Eritrea", "Estonia", "Eswatini", "Ethiopia", "Falkland Islands (Malvinas)", "Faroe Islands", "Fiji", "Finland", "France", "French Guiana",
  "French Polynesia", "French Southern Territories", "Gabon", "Gambia", "Georgia", "Germany", "Ghana", "Gibraltar", "Greece", "Greenland",
  "Grenada", "Guadeloupe", "Guam", "Guatemala", "Guernsey", "Guinea", "Guinea-Bissau", "Guyana", "Haiti", "Heard Island and McDonald Islands",
  "Holy See", "Honduras", "Hong Kong", "Hungary", "Iceland", "India", "Indonesia", "Iran (Islamic Republic of)", "Iraq", "Ireland", "Isle of Man",
  "Italy", "Jamaica", "Japan", "Jersey", "Jordan", "Kazakhstan", "Kenya", "Kiribati", "Korea (the Democratic People's Republic of)",
  "Korea (the Republic of)", "Kuwait", "Kyrgyzstan", "Lao People's Democratic Republic", "Latvia", "Lebanon", "Lesotho", "Liberia", "Libya",
  "Liechtenstein", "Lithuania", "Luxembourg", "Macao", "Madagascar", "Malawi", "Malaysia", "Maldives", "Mali", "Malta", "Marshall Islands",
  "Martinique", "Mauritania", "Mauritius", "Mayotte", "Mexico", "Micronesia (Federated States of)", "Moldova (the Republic of)", "Monaco",
  "Mongolia", "Montenegro", "Montserrat", "Morocco", "Mozambique", "Myanmar", "Namibia", "Nauru", "Nepal", "Netherlands", "New Caledonia",
  "New Zealand", "Nicaragua", "Niger", "Nigeria", "Niue", "Norfolk Island", "North Macedonia", "Northern Mariana Islands", "Norway", "Oman",
  "Pakistan", "Palau", "Palestine, State of", "Panama", "Papua New Guinea", "Paraguay", "Peru", "Philippines", "Pitcairn", "Poland", "Portugal",
  "Puerto Rico", "Qatar", "Réunion", "Romania", "Russian Federation", "Rwanda", "Saint Barthélemy", "Saint Helena, Ascension and Tristan da Cunha",
  "Saint Kitts and Nevis", "Saint Lucia", "Saint Martin (French part)", "Saint Pierre and Miquelon", "Saint Vincent and the Grenadines", "Samoa",
  "San Marino", "Sao Tome and Principe", "Saudi Arabia", "Senegal", "Serbia", "Seychelles", "Sierra Leone", "Singapore", "Sint Maarten (Dutch part)",
  "Slovakia", "Slovenia", "Solomon Islands", "Somalia", "South Africa", "South Georgia and the South Sandwich Islands", "South Sudan", "Spain",
  "Sri Lanka", "Sudan", "Suriname", "Svalbard and Jan Mayen", "Sweden", "Switzerland", "Syrian Arab Republic", "Taiwan (Province of China)",
  "Tajikistan", "Tanzania, United Republic of", "Thailand", "Timor-Leste", "Togo", "Tokelau", "Tonga", "Trinidad and Tobago", "Tunisia", "Turkey",
  "Turkmenistan", "Turks and Caicos Islands", "Tuvalu", "Uganda", "Ukraine", "United Arab Emirates", "United Kingdom of Great Britain and Northern Ireland",
  "United States Minor Outlying Islands", "United States of America", "Uruguay", "Uzbekistan", "Vanuatu", "Venezuela (Bolivarian Republic of)",
  "Viet Nam", "Virgin Islands (British)", "Virgin Islands (U.S.)", "Wallis and Futuna", "Western Sahara", "Yemen", "Zambia", "Zimbabwe",
];

// Defines the user roles available for registration.
const roles = [{ id: 2, label: "Customer" }, { id: 3, label: "Freelancer" }];

// --- Main Component ---
const Register = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // State for managing the registration flow (form vs. verification).
  const [step, setStep] = useState(1);

  // A single state object to hold all form data.
  const [formData, setFormData] = useState({
    role_id: "",
    first_name: "",
    last_name: "",
    username: "",
    email: "",
    password: "",
    country: "",
    phone_number: "",
  });

  // State for the phone verification code.
  const [verificationCode, setVerificationCode] = useState("");

  // State for displaying success or error messages to the user.
  const [message, setMessage] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);

  // UI state.
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // State for freelancer categories.
  const [allCategories, setAllCategories] = useState([]);
  const [selectedCategories, setSelectedCategories] = useState([]);

  // State for tracking password strength criteria.
  const [passwordStrength, setPasswordStrength] = useState({
    hasMinLength: false,
    hasUpperCase: false,
    hasLowerCase: false,
    hasNumber: false,
  });

  // Effect to update password strength whenever the password field changes.
  useEffect(() => {
    setPasswordStrength({
      hasMinLength: formData.password.length >= 8,
      hasUpperCase: /[A-Z]/.test(formData.password),
      hasLowerCase: /[a-z]/.test(formData.password),
      hasNumber: /\d/.test(formData.password),
    });
  }, [formData.password]);

  // Effect to fetch freelancer categories from the API on component mount.
  useEffect(() => {
    axios.get("http://localhost:58999/courses/categories" )
      .then(res => setAllCategories(res.data.categories || []))
      .catch(err => console.error("Error fetching categories:", err));
  }, []);

  // Generic handler to update the formData state object.
  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
  };

  // Toggles a category's selection status for freelancers.
  const handleCategoryToggle = (category) => {
    setSelectedCategories(prev =>
      prev.some(c => c.id === category.id)
        ? prev.filter(c => c.id !== category.id)
        : [...prev, category]
    );
  };

  // Removes a selected category.
  const removeCategory = (categoryId) => {
    setSelectedCategories(prev => prev.filter(c => c.id !== categoryId));
  };

  // Step 1: Submits the initial form to request a verification code.
  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage("");
    try {
      await axios.post("http://localhost:58999/user/send-verification", { phone_number: formData.phone_number } );
      setIsSuccess(true);
      setMessage(`A verification code has been sent to ${formData.phone_number}.`);
      setStep(2); // Move to the verification step.
    } catch (error) {
      setIsSuccess(false);
      setMessage(error.response?.data?.message || "Failed to send verification code. Please check the number and try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Step 2: Submits the verification code and the rest of the form data to complete registration.
  const handleVerificationSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage("");
    const registrationData = {
      ...formData,
      code: verificationCode,
      // Only include categories if the user is a freelancer.
      categories: formData.role_id === "3" ? selectedCategories.map(c => c.id) : undefined,
    };
    try {
      const result = await axios.post("http://localhost:58999/user/check-verification-and-register", registrationData );
      setIsSuccess(true);
      setMessage("Verification successful! You are now registered and will be redirected shortly.");
      // Dispatch login action to update global state.
      dispatch(setLogin({ token: result.data.token, userId: result.data.userId, roleId: result.data.role }));
      // Redirect to the homepage after a short delay.
      setTimeout(() => navigate("/"), 2000);
    } catch (error) {
      setIsSuccess(false);
      setMessage(error.response?.data?.message || "Registration failed. The code may be incorrect or expired.");
    } finally {
      setIsLoading(false);
    }
  };

  // Helper function to determine the password strength text and color.
  const getPasswordStrengthText = () => {
    const validCount = Object.values(passwordStrength).filter(Boolean).length;
    if (!formData.password) return { text: "", color: "" };
    if (validCount <= 1) return { text: "Very Weak", color: "text-red-600" };
    if (validCount === 2) return { text: "Weak", color: "text-orange-500" };
    if (validCount === 3) return { text: "Good", color: "text-yellow-500" };
    if (validCount === 4) return { text: "Strong", color: "text-green-600" };
    return { text: "", color: "" };
  };
  const passwordStrengthInfo = getPasswordStrengthText();

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4 lg:px-8 py-8">
      <div className="w-full max-w-6xl relative z-10">
        {step === 2 ? (
          // --- VERIFICATION UI (STEP 2) ---
          <div className="bg-white bg-opacity-95 backdrop-blur-sm rounded-3xl p-8 lg:p-12 border shadow-2xl text-center">
            <h2 className="text-3xl font-bold text-gray-900 font-serif">Check Your Phone</h2>
            <p className="mt-4 text-lg text-gray-600">We've sent a 6-digit verification code to <strong>{formData.phone_number}</strong>.</p>
            <form onSubmit={handleVerificationSubmit} className="mt-8 max-w-sm mx-auto">
              <div>
                <label htmlFor="verificationCode" className="sr-only">Verification Code</label>
                <input
                  type="text"
                  id="verificationCode"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value)}
                  placeholder="_ _ _ _ _ _"
                  maxLength="6"
                  required
                  className="w-full text-center text-3xl tracking-[1em] font-mono bg-gray-50 border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500"
                />
              </div>
              <div className="mt-6">
                <button type="submit" disabled={isLoading} className="w-full py-4 px-6 bg-gradient-to-r from-teal-500 to-green-500 text-white font-semibold rounded-xl hover:shadow-lg transition disabled:opacity-50 text-lg">
                  {isLoading ? "Verifying..." : "Verify & Complete Registration"}
                </button>
              </div>
            </form>
            {message && (
              <div className={`mt-6 p-4 rounded-xl text-sm ${isSuccess ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>
                {message}
              </div>
            )}
            <button onClick={() => setStep(1)} className="mt-8 text-sm text-gray-500 hover:text-teal-600 inline-flex items-center">
              <ArrowLeft className="w-4 h-4 mr-1" /> Back to edit information
            </button>
          </div>
        ) : (
          // --- REGISTRATION FORM UI (STEP 1) ---
          <div className="bg-white bg-opacity-95 backdrop-blur-sm rounded-3xl p-6 lg:p-8 border shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="text-center mb-6">
              <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 font-serif">
                Join <span className="bg-gradient-to-r from-blue-600 via-teal-600 to-green-500 bg-clip-text text-transparent">ORDERZHOUSE</span>
              </h1>
            </div>
            <form onSubmit={handleFormSubmit} className="space-y-5">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Left Column */}
                <div className="space-y-5">
                  <div>
                    <label htmlFor="role_id" className="block text-base font-semibold text-gray-700 mb-2 font-serif">I want to register as</label>
                    <div className="relative group">
                      <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 h-6 w-6 text-gray-400 group-focus-within:text-teal-600" />
                      <select id="role_id" value={formData.role_id} onChange={handleInputChange} required className="pl-12 w-full px-5 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 bg-white font-serif">
                        <option value="">Select Role</option>
                        {roles.map((role) => (<option key={role.id} value={role.id}>{role.label}</option>))}
                      </select>
                    </div>
                  </div>

                  {formData.role_id === "3" && (
                    <div className="border border-gray-200 rounded-xl p-4 bg-gray-50">
                      <label className="block text-base font-semibold text-gray-700 mb-3 font-serif">Areas of Expertise</label>
                      {selectedCategories.length > 0 && (
                        <div className="mb-4 max-h-24 overflow-y-auto p-2 bg-white rounded-lg">
                          <div className="flex flex-wrap gap-2">
                            {selectedCategories.map((cat) => (
                              <div key={cat.id} className="inline-flex items-center bg-gradient-to-r from-teal-500 to-green-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                                <span>{cat.name}</span>
                                <button type="button" onClick={() => removeCategory(cat.id)} className="ml-2 hover:bg-white/20 rounded-full p-0.5">
                                  <X className="h-3 w-3" />
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      <div className="max-h-48 overflow-y-auto border border-gray-200 rounded-lg bg-white">
                        <div className="grid grid-cols-1 gap-2 p-3">
                          {allCategories.map((cat) => (
                            <button key={cat.id} type="button" onClick={() => handleCategoryToggle(cat)} className={`p-3 rounded-lg border-2 text-left transition-all ${selectedCategories.some(c => c.id === cat.id) ? 'border-teal-500 bg-teal-50 text-teal-700' : 'border-gray-200 hover:bg-gray-50'}`}>
                              <div className="flex items-center">
                                {selectedCategories.some(c => c.id === cat.id) && <Check className="w-4 h-4 text-teal-600 mr-2" />}
                                <span>{cat.name}</span>
                              </div>
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  <div>
                    <label htmlFor="first_name" className="block text-base font-semibold text-gray-700 mb-2 font-serif">First Name</label>
                    <div className="relative group">
                      <User className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none h-6 w-6 text-gray-400 group-focus-within:text-teal-600" />
                      <input type="text" id="first_name" placeholder="Enter your first name" value={formData.first_name} onChange={handleInputChange} required className="pl-12 w-full px-5 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 bg-white font-serif" />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="last_name" className="block text-base font-semibold text-gray-700 mb-2 font-serif">Last Name</label>
                    <div className="relative group">
                      <User className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none h-6 w-6 text-gray-400 group-focus-within:text-teal-600" />
                      <input type="text" id="last_name" placeholder="Enter your last name" value={formData.last_name} onChange={handleInputChange} required className="pl-12 w-full px-5 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 bg-white font-serif" />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="username" className="block text-base font-semibold text-gray-700 mb-2 font-serif">Username</label>
                    <div className="relative group">
                      <User className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none h-6 w-6 text-gray-400 group-focus-within:text-teal-600" />
                      <input type="text" id="username" placeholder="Choose a username" value={formData.username} onChange={handleInputChange} required className="pl-12 w-full px-5 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 bg-white font-serif" />
                    </div>
                  </div>
                </div>

                {/* Right Column */}
                <div className="space-y-5">
                  <div>
                    <label htmlFor="email" className="block text-base font-semibold text-gray-700 mb-2 font-serif">Email Address</label>
                    <div className="relative group">
                      <Mail className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none h-6 w-6 text-gray-400 group-focus-within:text-teal-600" />
                      <input type="email" id="email" placeholder="Enter your email address" value={formData.email} onChange={handleInputChange} required className="pl-12 w-full px-5 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 bg-white font-serif" />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="password" className="block text-base font-semibold text-gray-700 mb-2 font-serif">Password</label>
                    <div className="relative group">
                      <Lock className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none h-6 w-6 text-gray-400 group-focus-within:text-teal-600" />
                      <input type={showPassword ? "text" : "password"} id="password" placeholder="Enter your password" value={formData.password} onChange={handleInputChange} required className="pl-12 pr-12 w-full px-5 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 bg-white font-serif" />
                      <button type="button" className="absolute inset-y-0 right-0 pr-4 flex items-center" onClick={() => setShowPassword(!showPassword)}>
                        {showPassword ? <EyeOff className="h-6 w-6 text-gray-400 hover:text-teal-600" /> : <Eye className="h-6 w-6 text-gray-400 hover:text-teal-600" />}
                      </button>
                    </div>
                    {formData.password && (
                      <div className="mt-2">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-gray-700">Strength:</span>
                          <span className={`text-sm font-semibold ${passwordStrengthInfo.color}`}>{passwordStrengthInfo.text}</span>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <div className={`flex items-center text-xs ${passwordStrength.hasMinLength ? 'text-green-600' : 'text-gray-400'}`}><Check className={`w-3 h-3 mr-2 ${passwordStrength.hasMinLength ? 'text-green-600' : 'text-gray-300'}`} />8+ characters</div>
                          <div className={`flex items-center text-xs ${passwordStrength.hasUpperCase ? 'text-green-600' : 'text-gray-400'}`}><Check className={`w-3 h-3 mr-2 ${passwordStrength.hasUpperCase ? 'text-green-600' : 'text-gray-300'}`} />1 uppercase</div>
                          <div className={`flex items-center text-xs ${passwordStrength.hasLowerCase ? 'text-green-600' : 'text-gray-400'}`}><Check className={`w-3 h-3 mr-2 ${passwordStrength.hasLowerCase ? 'text-green-600' : 'text-gray-300'}`} />1 lowercase</div>
                          <div className={`flex items-center text-xs ${passwordStrength.hasNumber ? 'text-green-600' : 'text-gray-400'}`}><Check className={`w-3 h-3 mr-2 ${passwordStrength.hasNumber ? 'text-green-600' : 'text-gray-300'}`} />1 number</div>
                        </div>
                      </div>
                    )}
                  </div>

                  <div>
                    <label htmlFor="country" className="block text-base font-semibold text-gray-700 mb-2 font-serif">Country</label>
                    <div className="relative group">
                      <MapPin className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none h-6 w-6 text-gray-400 group-focus-within:text-teal-600" />
                      <select id="country" value={formData.country} onChange={handleInputChange} required className="pl-12 w-full px-5 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 bg-white font-serif">
                        <option value="">Select Country</option>
                        {countries.map((c) => (<option key={c} value={c}>{c}</option>))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label htmlFor="phone_number" className="block text-base font-semibold text-gray-700 mb-2 font-serif">Phone Number</label>
                    <div className="relative group">
                      <Phone className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none h-6 w-6 text-gray-400 group-focus-within:text-teal-600" />
                      <input type="tel" id="phone_number" placeholder="e.g., +14155552671" value={formData.phone_number} onChange={handleInputChange} required className="pl-12 w-full px-5 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 bg-white font-serif" />
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-start pt-2">
                <input id="terms" name="terms" type="checkbox" className="h-5 w-5 text-teal-600 focus:ring-teal-500 border-gray-300 rounded mt-0.5" required />
                <label htmlFor="terms" className="ml-3 block text-base text-gray-700 font-serif">
                  I agree to the <a href="/terms" className="text-teal-600 hover:text-blue-600 font-semibold">Terms of Service</a> and <a href="/privacy" className="text-teal-600 hover:text-blue-600 font-semibold">Privacy Policy</a>
                </label>
              </div>

              <div className="pt-2">
                <button type="submit" disabled={isLoading} className="w-full py-4 px-6 bg-gradient-to-r from-blue-600 via-teal-600 to-green-500 text-white font-semibold rounded-xl hover:shadow-lg transition-all duration-300 disabled:opacity-50 flex items-center justify-center text-lg">
                  <div className="relative z-10 flex items-center">
                    {isLoading ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-3 h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <span>Sending Code...</span>
                      </>
                     ) : (
                      <>
                        <Shield className="w-6 h-6 mr-2" />
                        <span>Continue to Verification</span>
                      </>
                    )}
                  </div>
                </button>
              </div>
            </form>

            {message && !isSuccess && (
              <div className="mt-6 p-4 rounded-xl flex items-start border bg-red-50 text-red-800 border-red-200">
                <AlertCircle className="w-5 h-5 mr-3 text-red-500 flex-shrink-0 mt-0.5" />
                <p className="text-base font-serif">{message}</p>
              </div>
            )}

            <div className="mt-6 text-center pt-4 border-t border-gray-200">
              <p className="text-base lg:text-lg text-gray-600 font-serif">
                Already have an account? <Link to="/login" className="font-semibold text-teal-600 hover:text-blue-600 inline-flex items-center group">Sign in now<ArrowLeft className="ml-1 h-5 w-5 group-hover:-translate-x-1 transition-transform rotate-180" /></Link>
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Register;
