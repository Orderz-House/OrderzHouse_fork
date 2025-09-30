// components/Register.js

import React, { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { setLogin } from "../../slice/auth/authSlice"; // Adjust path to your auth slice
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import { Mail, Lock, Eye, EyeOff, User, Phone, MapPin, AlertCircle, CheckCircle, Briefcase, ArrowLeft, X, Shield, Check } from "lucide-react";

// --- Data Arrays ---
const countries = [
  "Afghanistan",
  "Åland Islands",
  "Albania",
  "Algeria",
  "American Samoa",
  "Andorra",
  "Angola",
  "Anguilla",
  "Antarctica",
  "Antigua and Barbuda",
  "Argentina",
  "Armenia",
  "Aruba",
  "Australia",
  "Austria",
  "Azerbaijan",
  "Bahamas",
  "Bahrain",
  "Bangladesh",
  "Barbados",
  "Belarus",
  "Belgium",
  "Belize",
  "Benin",
  "Bermuda",
  "Bhutan",
  "Bolivia (Plurinational State of)",
  "Bonaire, Sint Eustatius and Saba",
  "Bosnia and Herzegovina",
  "Botswana",
  "Bouvet Island",
  "Brazil",
  "British Indian Ocean Territory",
  "Brunei Darussalam",
  "Bulgaria",
  "Burkina Faso",
  "Burundi",
  "Cabo Verde",
  "Cambodia",
  "Cameroon",
  "Canada",
  "Cayman Islands",
  "Central African Republic",
  "Chad",
  "Chile",
  "China",
  "Christmas Island",
  "Cocos (Keeling) Islands",
  "Colombia",
  "Comoros",
  "Congo (the Democratic Republic of the)",
  "Congo",
  "Cook Islands",
  "Costa Rica",
  "Côte d'Ivoire",
  "Croatia",
  "Cuba",
  "Curaçao",
  "Cyprus",
  "Czechia",
  "Denmark",
  "Djibouti",
  "Dominica",
  "Dominican Republic",
  "Ecuador",
  "Egypt",
  "El Salvador",
  "Equatorial Guinea",
  "Eritrea",
  "Estonia",
  "Eswatini",
  "Ethiopia",
  "Falkland Islands (Malvinas)",
  "Faroe Islands",
  "Fiji",
  "Finland",
  "France",
  "French Guiana",
  "French Polynesia",
  "French Southern Territories",
  "Gabon",
  "Gambia",
  "Georgia",
  "Germany",
  "Ghana",
  "Gibraltar",
  "Greece",
  "Greenland",
  "Grenada",
  "Guadeloupe",
  "Guam",
  "Guatemala",
  "Guernsey",
  "Guinea",
  "Guinea-Bissau",
  "Guyana",
  "Haiti",
  "Heard Island and McDonald Islands",
  "Holy See",
  "Honduras",
  "Hong Kong",
  "Hungary",
  "Iceland",
  "India",
  "Indonesia",
  "Iran (Islamic Republic of)",
  "Iraq",
  "Ireland",
  "Isle of Man",
  "Italy",
  "Jamaica",
  "Japan",
  "Jersey",
  "Jordan",
  "Kazakhstan",
  "Kenya",
  "Kiribati",
  "Korea (the Democratic People's Republic of)",
  "Korea (the Republic of)",
  "Kuwait",
  "Kyrgyzstan",
  "Lao People's Democratic Republic",
  "Latvia",
  "Lebanon",
  "Lesotho",
  "Liberia",
  "Libya",
  "Liechtenstein",
  "Lithuania",
  "Luxembourg",
  "Macao",
  "Madagascar",
  "Malawi",
  "Malaysia",
  "Maldives",
  "Mali",
  "Malta",
  "Marshall Islands",
  "Martinique",
  "Mauritania",
  "Mauritius",
  "Mayotte",
  "Mexico",
  "Micronesia (Federated States of)",
  "Moldova (the Republic of)",
  "Monaco",
  "Mongolia",
  "Montenegro",
  "Montserrat",
  "Morocco",
  "Mozambique",
  "Myanmar",
  "Namibia",
  "Nauru",
  "Nepal",
  "Netherlands",
  "New Caledonia",
  "New Zealand",
  "Nicaragua",
  "Niger",
  "Nigeria",
  "Niue",
  "Norfolk Island",
  "North Macedonia",
  "Northern Mariana Islands",
  "Norway",
  "Oman",
  "Pakistan",
  "Palau",
  "Palestine, State of",
  "Panama",
  "Papua New Guinea",
  "Paraguay",
  "Peru",
  "Philippines",
  "Pitcairn",
  "Poland",
  "Portugal",
  "Puerto Rico",
  "Qatar",
  "Réunion",
  "Romania",
  "Russian Federation",
  "Rwanda",
  "Saint Barthélemy",
  "Saint Helena, Ascension and Tristan da Cunha",
  "Saint Kitts and Nevis",
  "Saint Lucia",
  "Saint Martin (French part)",
  "Saint Pierre and Miquelon",
  "Saint Vincent and the Grenadines",
  "Samoa",
  "San Marino",
  "Sao Tome and Principe",
  "Saudi Arabia",
  "Senegal",
  "Serbia",
  "Seychelles",
  "Sierra Leone",
  "Singapore",
  "Sint Maarten (Dutch part)",
  "Slovakia",
  "Slovenia",
  "Solomon Islands",
  "Somalia",
  "South Africa",
  "South Georgia and the South Sandwich Islands",
  "South Sudan",
  "Spain",
  "Sri Lanka",
  "Sudan",
  "Suriname",
  "Svalbard and Jan Mayen",
  "Sweden",
  "Switzerland",
  "Syrian Arab Republic",
  "Taiwan (Province of China)",
  "Tajikistan",
  "Tanzania, United Republic of",
  "Thailand",
  "Timor-Leste",
  "Togo",
  "Tokelau",
  "Tonga",
  "Trinidad and Tobago",
  "Tunisia",
  "Turkey",
  "Turkmenistan",
  "Turks and Caicos Islands",
  "Tuvalu",
  "Uganda",
  "Ukraine",
  "United Arab Emirates",
  "United Kingdom of Great Britain and Northern Ireland",
  "United States Minor Outlying Islands",
  "United States of America",
  "Uruguay",
  "Uzbekistan",
  "Vanuatu",
  "Venezuela (Bolivarian Republic of)",
  "Viet Nam",
  "Virgin Islands (British)",
  "Virgin Islands (U.S.)",
  "Wallis and Futuna",
  "Western Sahara",
  "Yemen",
  "Zambia",
  "Zimbabwe",
];

const roles = [ { id: 2, label: "Customer" }, { id: 3, label: "Freelancer" } ];

// --- Main Component ---
const Register = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [step, setStep] = useState(1); // 1 for form, 2 for verification
  const [formData, setFormData] = useState({
    role_id: "", first_name: "", last_name: "", phone_number: "", email: "", password: "", country: "", username: "",
  });
  const [verificationCode, setVerificationCode] = useState("");
  const [message, setMessage] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [allCategories, setAllCategories] = useState([]);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [passwordStrength, setPasswordStrength] = useState({ hasMinLength: false, hasUpperCase: false, hasLowerCase: false, hasNumber: false });

  useEffect(() => {
    setPasswordStrength({
      hasMinLength: formData.password.length >= 8,
      hasUpperCase: /[A-Z]/.test(formData.password),
      hasLowerCase: /[a-z]/.test(formData.password),
      hasNumber: /\d/.test(formData.password),
    });
  }, [formData.password]);

  useEffect(() => {
    axios.get("http://localhost:58999/courses/categories" )
      .then(res => setAllCategories(res.data.categories || []))
      .catch(err => console.error("Error fetching categories:", err));
  }, []);

  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
  };

  const handleCategoryToggle = (category) => {
    setSelectedCategories(prev => prev.some(c => c.id === category.id) ? prev.filter(c => c.id !== category.id) : [...prev, category]);
  };

  const removeCategory = (categoryId) => {
    setSelectedCategories(prev => prev.filter(c => c.id !== categoryId));
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage("");
    try {
      await axios.post("http://localhost:58999/user/send-verification", { phone_number: formData.phone_number } );
      setIsSuccess(true);
      setMessage(`A verification code has been sent to ${formData.phone_number}.`);
      setStep(2);
    } catch (error) {
      setIsSuccess(false);
      setMessage(error.response?.data?.message || "Failed to send verification code.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerificationSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage("");
    const registrationData = {
      ...formData,
      code: verificationCode,
      categories: formData.role_id === "3" ? selectedCategories.map(c => c.id) : undefined,
    };
    try {
      const result = await axios.post("http://localhost:58999/user/check-verification-and-register", registrationData );
      setIsSuccess(true);
      setMessage("Verification successful! You are now registered.");
      dispatch(setLogin({ token: result.data.token, userId: result.data.userId, roleId: result.data.role }));
      setTimeout(() => navigate("/"), 2000);
    } catch (error) {
      setIsSuccess(false);
      setMessage(error.response?.data?.message || "Registration failed.");
    } finally {
      setIsLoading(false);
    }
  };

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
    <div className="min-h-screen bg-white relative overflow-hidden">
      

      {/* Main Container - Fixed Width */}
      <div className="flex min-h-screen items-center justify-center p-4 lg:px-8 xl:px-16 py-8">
        <div className="flex items-center justify-center w-full max-w-7xl mx-auto">
          
          {/* Registration Container - Fixed Width */}
          <div className="w-full max-w-6xl relative z-10">
            {/* Header */}
            <div className="text-center mb-4">
              <h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold text-gray-900 mb-2 font-serif leading-tight">
                Join{" "}
                <span className="bg-gradient-to-r from-blue-600 via-teal-600 to-green-500 bg-clip-text text-transparent">
                  ORDERZHOUSE
                </span>
              </h1>
            </div>

            {/* Registration Form Container - Fixed Dimensions */}
            <div className="bg-white bg-opacity-95 backdrop-blur-sm rounded-3xl p-6 lg:p-8 border border-gray-100 relative overflow-hidden shadow-sm max-h-[85vh] overflow-y-auto">
              {/* Background gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-br from-gray-50 to-white rounded-3xl opacity-80"></div>
              
              <div className="relative z-10">
              

                <form onSubmit={register} className="space-y-5">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    
                    {/* Left Column - Fixed Width */}
                    <div className="space-y-5 min-h-0">
                      
                      {/* Role Selection */}
                      <div>
                        <label
                          htmlFor="role_id"
                          className="block text-base font-semibold text-gray-700 mb-2 font-serif"
                        >
                          I want to register as
                        </label>
                        <div className="relative group">
                          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-colors">
                            <Briefcase className="h-6 w-6 text-gray-400 group-focus-within:text-teal-600 transition-colors" />
                          </div>
                          <select
                            id="role_id"
                            value={role_id}
                            onChange={(e) => setRole_id(e.target.value)}
                            required
                            className="pl-12 w-full px-5 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-600 transition-all duration-300 bg-white font-serif text-base"
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

                      {/* Multiple Categories Selection (Freelancer Only) - Fixed Container */}
                      {role_id === "3" && (
                        <div className="border border-gray-200 rounded-xl p-4 bg-gray-50">
                          <label className="block text-base font-semibold text-gray-700 mb-3 font-serif">
                            What category would you like to work in?
                            <span className="block text-sm font-normal text-gray-500 mt-1">
                              Choose your areas of expertise (select multiple)
                            </span>
                          </label>
                          
                          {/* Selected Categories Display - Fixed Height with Scroll */}
                          {selectedCategories.length > 0 && (
                            <div className="mb-4 max-h-20 overflow-y-auto">
                              <div className="flex flex-wrap gap-2">
                                {selectedCategories.map((categoryId) => {
                                  const category = categories.find(cat => cat.id === categoryId);
                                  return category ? (
                                    <div
                                      key={categoryId}
                                      className="inline-flex items-center bg-gradient-to-r from-teal-500 to-green-500 text-white px-3 py-1 rounded-full text-sm font-medium shadow-sm flex-shrink-0"
                                    >
                                      <span className="truncate max-w-24">{category.name}</span>
                                      <button
                                        type="button"
                                        onClick={() => removeCategory(categoryId)}
                                        className="ml-2 hover:bg-white hover:bg-opacity-20 rounded-full p-0.5 transition-colors flex-shrink-0"
                                      >
                                        <X className="h-3 w-3" />
                                      </button>
                                    </div>
                                  ) : null;
                                })}
                              </div>
                            </div>
                          )}

                          {/* Category Selection Grid - Fixed Height with Scroll */}
                          <div className="max-h-48 overflow-y-auto border border-gray-200 rounded-lg">
                            <div className="grid grid-cols-1 gap-2 p-3">
                              {categories.map((category) => (
                                <button
                                  key={category.id}
                                  type="button"
                                  onClick={() => handleCategoryToggle(category.id)}
                                  className={`p-3 rounded-lg border-2 transition-all duration-200 font-medium text-left ${
                                    selectedCategories.includes(category.id)
                                      ? 'border-teal-500 bg-teal-50 text-teal-700'
                                      : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300 hover:bg-gray-50'
                                  }`}
                                >
                                  <div className="flex items-center">
                                    {selectedCategories.includes(category.id) && (
                                      <Check className="w-4 h-4 text-teal-600 mr-2" />
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
                        <label
                          htmlFor="first_name"
                          className="block text-base font-semibold text-gray-700 mb-2 font-serif"
                        >
                          First Name
                        </label>
                        <div className="relative group">
                          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-colors">
                            <User className="h-6 w-6 text-gray-400 group-focus-within:text-teal-600 transition-colors" />
                          </div>
                          <input
                            type="text"
                            id="first_name"
                            placeholder="Enter your first name"
                            value={first_name}
                            onChange={(e) => setFirst_name(e.target.value)}
                            required
                            className="pl-12 w-full px-5 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-600 transition-all duration-300 bg-white font-serif text-base"
                          />
                        </div>
                      </div>

                      {/* Last Name */}
                      <div>
                        <label
                          htmlFor="last_name"
                          className="block text-base font-semibold text-gray-700 mb-2 font-serif"
                        >
                          Last Name
                        </label>
                        <div className="relative group">
                          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-colors">
                            <User className="h-6 w-6 text-gray-400 group-focus-within:text-teal-600 transition-colors" />
                          </div>
                          <input
                            type="text"
                            id="last_name"
                            placeholder="Enter your last name"
                            value={last_name}
                            onChange={(e) => setLast_name(e.target.value)}
                            required
                            className="pl-12 w-full px-5 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-600 transition-all duration-300 bg-white font-serif text-base"
                          />
                        </div>
                      </div>

                      <div>
    <label htmlFor="username" className="block text-base font-semibold text-gray-700 mb-2 font-serif">
      Username
    </label>
    <div className="relative group">
      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-colors">
        <User className="h-6 w-6 text-gray-400 group-focus-within:text-teal-600 transition-colors" />
      </div>
      <input
        type="text"
        id="username"
        placeholder="Choose a username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        required
        className="pl-12 w-full px-5 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-600 transition-all duration-300 bg-white font-serif text-base"
      />
    </div>
  </div>


                      

      <svg className="absolute inset-0 w-full h-full z-0" viewBox="0 0 1440 800" preserveAspectRatio="none">
        {/* ... your decorative SVG paths and defs ... */}
      </svg>

      <div className="flex min-h-screen items-center justify-center px-4 py-8">
        <div className="w-full max-w-6xl relative z-10">
          {step === 2 ? (
            // --- VERIFICATION UI ---
            <div className="bg-white bg-opacity-95 backdrop-blur-sm rounded-3xl p-8 lg:p-12 border shadow-2xl text-center">
              <h2 className="text-3xl font-bold text-gray-900 font-serif">Check Your Phone</h2>
              <p className="mt-4 text-lg text-gray-600">We've sent a 6-digit verification code to <strong>{formData.phone_number}</strong>.</p>
              <form onSubmit={handleVerificationSubmit} className="mt-8 max-w-sm mx-auto">
                <div>
                  <label htmlFor="verificationCode" className="sr-only">Verification Code</label>
                  <input type="text" id="verificationCode" value={verificationCode} onChange={(e) => setVerificationCode(e.target.value)} placeholder="_ _ _ _ _ _" maxLength="6" required className="w-full text-center text-3xl tracking-[1em] font-mono bg-gray-50 border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500" />
                </div>
                <div className="mt-6">
                  <button type="submit" disabled={isLoading} className="w-full py-4 px-6 bg-gradient-to-r from-teal-500 to-green-500 text-white font-semibold rounded-xl hover:shadow-lg transition disabled:opacity-50 text-lg">
                    {isLoading ? "Verifying..." : "Verify & Complete Registration"}
                  </button>
                </div>
              </form>
              {message && <div className={`mt-6 p-4 rounded-xl text-sm ${isSuccess ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>{message}</div>}
              <button onClick={() => setStep(1)} className="mt-8 text-sm text-gray-500 hover:text-teal-600 inline-flex items-center"><ArrowLeft className="w-4 h-4 mr-1" /> Back to edit information</button>
            </div>
          ) : (
            // --- REGISTRATION FORM UI ---
            <div className="bg-white bg-opacity-95 backdrop-blur-sm rounded-3xl p-6 lg:p-8 border shadow-2xl max-h-[85vh] overflow-y-auto">
              <div className="text-center mb-6"><h1 className="text-4xl lg:text-5xl font-bold text-gray-900 font-serif">Join <span className="bg-gradient-to-r from-blue-600 via-teal-600 to-green-500 bg-clip-text text-transparent">ORDERZHOUSE</span></h1></div>
              <form onSubmit={handleFormSubmit} className="space-y-5">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Left Column */}
                  <div className="space-y-5">
                    <div>
                      <label htmlFor="role_id" className="block text-base font-semibold text-gray-700 mb-2 font-serif">I want to register as</label>
                      <div className="relative group"><Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 h-6 w-6 text-gray-400 group-focus-within:text-teal-600" /><select id="role_id" value={formData.role_id} onChange={handleInputChange} required className="pl-12 w-full px-5 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 bg-white font-serif"><option value="">Select Role</option>{roles.map((role) => (<option key={role.id} value={role.id}>{role.label}</option>))}</select></div>
                    </div>
                    {formData.role_id === "3" && (
                      <div className="border border-gray-200 rounded-xl p-4 bg-gray-50">
                        <label className="block text-base font-semibold text-gray-700 mb-3 font-serif">Areas of Expertise</label>
                        {selectedCategories.length > 0 && (<div className="mb-4 max-h-24 overflow-y-auto p-2 bg-white rounded-lg"><div className="flex flex-wrap gap-2">{selectedCategories.map((cat) => (<div key={cat.id} className="inline-flex items-center bg-gradient-to-r from-teal-500 to-green-500 text-white px-3 py-1 rounded-full text-sm font-medium"><span>{cat.name}</span><button type="button" onClick={() => removeCategory(cat.id)} className="ml-2 hover:bg-white/20 rounded-full p-0.5"><X className="h-3 w-3" /></button></div>))}</div></div>)}
                        <div className="max-h-48 overflow-y-auto border border-gray-200 rounded-lg bg-white"><div className="grid grid-cols-1 gap-2 p-3">{allCategories.map((cat) => (<button key={cat.id} type="button" onClick={() => handleCategoryToggle(cat)} className={`p-3 rounded-lg border-2 text-left ${selectedCategories.some(c => c.id === cat.id) ? 'border-teal-500 bg-teal-50' : 'border-gray-200 hover:bg-gray-50'}`}><div className="flex items-center">{selectedCategories.some(c => c.id === cat.id) && <Check className="w-4 h-4 text-teal-600 mr-2" />}<span>{cat.name}</span></div></button>))}</div></div>
                      </div>

                      {/* Password with Strength Indicator */}
                      <div>
                        <label
                          htmlFor="password"
                          className="block text-base font-semibold text-gray-700 mb-2 font-serif"
                        >
                          Password
                        </label>
                        <div className="relative group">
                          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-colors">
                            <Lock className="h-6 w-6 text-gray-400 group-focus-within:text-teal-600 transition-colors" />
                          </div>
                          <input
                            type={showPassword ? "text" : "password"}
                            id="password"
                            placeholder="Enter your password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            className="pl-12 pr-12 w-full px-5 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-600 transition-all duration-300 bg-white font-serif text-base"
                          />
                          <button
                            type="button"
                            className="absolute inset-y-0 right-0 pr-4 flex items-center hover:text-teal-600 transition-colors"
                            onClick={() => setShowPassword(!showPassword)}
                          >
                            {showPassword ? (
                              <EyeOff className="h-6 w-6 text-gray-400 hover:text-teal-600" />
                            ) : (
                              <Eye className="h-6 w-6 text-gray-400 hover:text-teal-600" />
                            )}
                          </button>
                        </div>
                        
                       {/* Password Strength Indicator */}
  <div className="mt-2">
    <div className="flex items-center justify-between mb-2">
      <span className="text-sm font-medium text-gray-700">Password Strength:</span>
      <span className={`text-sm font-semibold ${passwordStrengthInfo.color}`}>
        {passwordStrengthInfo.text}
      </span>
    </div>

    {/* 2-column grid for the 4 checks */}
    <div className="grid grid-cols-2 gap-2">
      <div className={`flex items-center text-xs ${passwordStrength.hasMinLength ? 'text-green-600' : 'text-gray-400'}`}>
        <Check className={`w-3 h-3 mr-2 ${passwordStrength.hasMinLength ? 'text-green-600' : 'text-gray-300'}`} />
        At least 8 characters
      </div>
      <div className={`flex items-center text-xs ${passwordStrength.hasUpperCase ? 'text-green-600' : 'text-gray-400'}`}>
        <Check className={`w-3 h-3 mr-2 ${passwordStrength.hasUpperCase ? 'text-green-600' : 'text-gray-300'}`} />
        One uppercase letter
      </div>
      <div className={`flex items-center text-xs ${passwordStrength.hasLowerCase ? 'text-green-600' : 'text-gray-400'}`}>
        <Check className={`w-3 h-3 mr-2 ${passwordStrength.hasLowerCase ? 'text-green-600' : 'text-gray-300'}`} />
        One lowercase letter
      </div>
      <div className={`flex items-center text-xs ${passwordStrength.hasNumber ? 'text-green-600' : 'text-gray-400'}`}>
        <Check className={`w-3 h-3 mr-2 ${passwordStrength.hasNumber ? 'text-green-600' : 'text-gray-300'}`} />
        One number
      </div>
    </div>
  </div>

</div>

                      {/* Country */}
                      <div>
                        <label
                          htmlFor="country"
                          className="block text-base font-semibold text-gray-700 mb-2 font-serif"
                        >
                          Country
                        </label>
                        <div className="relative group">
                          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-colors">
                            <MapPin className="h-6 w-6 text-gray-400 group-focus-within:text-teal-600 transition-colors" />
                          </div>
                          <select
                            id="country"
                            value={country}
                            onChange={(e) => setCountry(e.target.value)}
                            required
                            className="pl-12 w-full px-5 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-600 transition-all duration-300 bg-white font-serif text-base"
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

                      {/* Phone Number */}
                      <div>
                        <label
                          htmlFor="phone_number"
                          className="block text-base font-semibold text-gray-700 mb-2 font-serif"
                        >
                          Phone Number
                        </label>
                        <div className="relative group">
                          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-colors">
                            <Phone className="h-6 w-6 text-gray-400 group-focus-within:text-teal-600 transition-colors" />
                          </div>
                          <input
                            type="tel"
                            id="phone_number"
                            placeholder="Enter your phone number"
                            value={phone_number}
                            onChange={(e) => setPhone_number(e.target.value)}
                            pattern="^[0-9+\-\s()]*$"
                            required
                            className="pl-12 w-full px-5 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-600 transition-all duration-300 bg-white font-serif text-base"
                          />
                        </div>
                      </div>

                     
                    </div>
                  </div>

                  {/* Terms Checkbox */}
                  <div className="flex items-start">
                    <input
                      id="terms"
                      name="terms"
                      type="checkbox"
                      className="h-5 w-5 text-teal-600 focus:ring-teal-500 border-gray-300 rounded mt-0.5 flex-shrink-0"
                      required
                    />
                    <label
                      htmlFor="terms"
                      className="ml-3 block text-base text-gray-700 font-serif"
                    >
                      I agree to the{" "}
                      <a href="#" className="text-teal-600 hover:text-blue-600 font-semibold transition-colors">
                        Terms and Conditions
                      </a>{" "}
                      and{" "}
                      <a href="#" className="text-teal-600 hover:text-blue-600 font-semibold transition-colors">
                        Privacy Policy
                      </a>
                    </label>
                  </div>

                  {/* Submit Button */}
                  <div>
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="w-full py-3 lg:py-4 px-6 bg-gradient-to-r from-blue-600 via-teal-600 to-green-500 text-white font-semibold rounded-xl hover:from-teal-600 hover:via-green-500 hover:to-green-400 transition-all duration-300 disabled:opacity-50 flex items-center justify-center hover:shadow-lg transform hover:-translate-y-0.5 relative overflow-hidden group font-serif text-base lg:text-lg"
                    >
                      {/* Button background animation */}
                      <div className="absolute inset-0 bg-gradient-to-r from-teal-600 to-green-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      
                      <div className="relative z-10 flex items-center">
                        {isLoading ? (
                          <>
                            <svg
                              className="animate-spin -ml-1 mr-3 h-6 w-6 text-white"
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
                            <Shield className="w-6 h-6 mr-2" />
                            Create Secure Account
                          </>
                        )}
                      </div>
                    </button>
                  </div>
                </form>

                {/* Status Message */}
                {message && (
                  <div
                    className={`mt-6 p-4 rounded-xl flex items-start border backdrop-blur-sm ${
                      status
                        ? "bg-green-50 text-green-800 border-green-200"
                        : "bg-red-50 text-red-800 border-red-200"
                    }`}
                  >
                    {status ? (
                      <CheckCircle className="w-6 h-6 mt-0.5 mr-3 text-green-500 flex-shrink-0" />
                    ) : (
                      <AlertCircle className="w-6 h-6 mt-0.5 mr-3 text-red-500 flex-shrink-0" />

                    )}
                    <div><label htmlFor="first_name" className="block text-base font-semibold text-gray-700 mb-2 font-serif">First Name</label><div className="relative group"><User className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none h-6 w-6 text-gray-400 group-focus-within:text-teal-600" /><input type="text" id="first_name" placeholder="Enter your first name" value={formData.first_name} onChange={handleInputChange} required className="pl-12 w-full px-5 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 bg-white font-serif" /></div></div>
                    <div><label htmlFor="last_name" className="block text-base font-semibold text-gray-700 mb-2 font-serif">Last Name</label><div className="relative group"><User className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none h-6 w-6 text-gray-400 group-focus-within:text-teal-600" /><input type="text" id="last_name" placeholder="Enter your last name" value={formData.last_name} onChange={handleInputChange} required className="pl-12 w-full px-5 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 bg-white font-serif" /></div></div>
                    <div><label htmlFor="username" className="block text-base font-semibold text-gray-700 mb-2 font-serif">Username</label><div className="relative group"><User className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none h-6 w-6 text-gray-400 group-focus-within:text-teal-600" /><input type="text" id="username" placeholder="Choose a username" value={formData.username} onChange={handleInputChange} required className="pl-12 w-full px-5 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 bg-white font-serif" /></div></div>
                  </div>
                  {/* Right Column */}
                  <div className="space-y-5">
                    <div><label htmlFor="email" className="block text-base font-semibold text-gray-700 mb-2 font-serif">Email Address</label><div className="relative group"><Mail className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none h-6 w-6 text-gray-400 group-focus-within:text-teal-600" /><input type="email" id="email" placeholder="Enter your email address" value={formData.email} onChange={handleInputChange} required className="pl-12 w-full px-5 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 bg-white font-serif" /></div></div>
                    <div><label htmlFor="password" className="block text-base font-semibold text-gray-700 mb-2 font-serif">Password</label><div className="relative group"><Lock className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none h-6 w-6 text-gray-400 group-focus-within:text-teal-600" /><input type={showPassword ? "text" : "password"} id="password" placeholder="Enter your password" value={formData.password} onChange={handleInputChange} required className="pl-12 pr-12 w-full px-5 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 bg-white font-serif" /><button type="button" className="absolute inset-y-0 right-0 pr-4 flex items-center" onClick={() => setShowPassword(!showPassword)}>{showPassword ? <EyeOff className="h-6 w-6 text-gray-400 hover:text-teal-600" /> : <Eye className="h-6 w-6 text-gray-400 hover:text-teal-600" />}</button></div>{formData.password && (<div className="mt-2"><div className="flex items-center justify-between mb-2"><span className="text-sm font-medium text-gray-700">Strength:</span><span className={`text-sm font-semibold ${passwordStrengthInfo.color}`}>{passwordStrengthInfo.text}</span></div><div className="grid grid-cols-2 gap-2"><div className={`flex items-center text-xs ${passwordStrength.hasMinLength ? 'text-green-600' : 'text-gray-400'}`}><Check className={`w-3 h-3 mr-2 ${passwordStrength.hasMinLength ? 'text-green-600' : 'text-gray-300'}`} />8+ characters</div><div className={`flex items-center text-xs ${passwordStrength.hasUpperCase ? 'text-green-600' : 'text-gray-400'}`}><Check className={`w-3 h-3 mr-2 ${passwordStrength.hasUpperCase ? 'text-green-600' : 'text-gray-300'}`} />1 uppercase</div><div className={`flex items-center text-xs ${passwordStrength.hasLowerCase ? 'text-green-600' : 'text-gray-400'}`}><Check className={`w-3 h-3 mr-2 ${passwordStrength.hasLowerCase ? 'text-green-600' : 'text-gray-300'}`} />1 lowercase</div><div className={`flex items-center text-xs ${passwordStrength.hasNumber ? 'text-green-600' : 'text-gray-400'}`}><Check className={`w-3 h-3 mr-2 ${passwordStrength.hasNumber ? 'text-green-600' : 'text-gray-300'}`} />1 number</div></div></div>)}</div>
                    <div><label htmlFor="country" className="block text-base font-semibold text-gray-700 mb-2 font-serif">Country</label><div className="relative group"><MapPin className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none h-6 w-6 text-gray-400 group-focus-within:text-teal-600" /><select id="country" value={formData.country} onChange={handleInputChange} required className="pl-12 w-full px-5 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 bg-white font-serif"><option value="">Select Country</option>{countries.map((c) => (<option key={c} value={c}>{c}</option>))}</select></div></div>
                    <div><label htmlFor="phone_number" className="block text-base font-semibold text-gray-700 mb-2 font-serif">Phone Number</label><div className="relative group"><Phone className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none h-6 w-6 text-gray-400 group-focus-within:text-teal-600" /><input type="tel" id="phone_number" placeholder="e.g., +14155552671" value={formData.phone_number} onChange={handleInputChange} required className="pl-12 w-full px-5 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 bg-white font-serif" /></div></div>
                  </div>
                </div>
                <div className="flex items-start"><input id="terms" name="terms" type="checkbox" className="h-5 w-5 text-teal-600 focus:ring-teal-500 border-gray-300 rounded mt-0.5" required /><label htmlFor="terms" className="ml-3 block text-base text-gray-700 font-serif">I agree to the <a href="#" className="text-teal-600 hover:text-blue-600 font-semibold">Terms</a> and <a href="#" className="text-teal-600 hover:text-blue-600 font-semibold">Privacy Policy</a></label></div>
                <div><button type="submit" disabled={isLoading} className="w-full py-4 px-6 bg-gradient-to-r from-blue-600 via-teal-600 to-green-500 text-white font-semibold rounded-xl hover:shadow-lg transition-all duration-300 disabled:opacity-50 flex items-center justify-center text-lg"><div className="relative z-10 flex items-center">{isLoading ? (<><svg className="animate-spin -ml-1 mr-3 h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg><span>Sending Code...</span></> ) : (<><Shield className="w-6 h-6 mr-2" /><span>Continue to Verification</span></>)}</div></button></div>
              </form>
              {message && <div className={`mt-6 p-4 rounded-xl flex items-start border ${isSuccess ? "bg-green-50 text-green-800 border-green-200" : "bg-red-50 text-red-800 border-red-200"}`}><p className="text-base font-serif">{message}</p></div>}
              <div className="mt-6 text-center pt-4 border-t border-gray-200"><p className="text-base lg:text-lg text-gray-600 font-serif">Already have an account? <Link to="/login" className="font-semibold text-teal-600 hover:text-blue-600 inline-flex items-center group">Sign in now<ArrowLeft className="ml-1 h-5 w-5 group-hover:-translate-x-1 transition-transform rotate-180" /></Link></p></div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Register;
