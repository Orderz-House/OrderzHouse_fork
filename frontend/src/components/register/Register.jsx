import React, { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { setLogin } from "../../slice/auth/authSlice";
import axios from "axios";
import { useNavigate } from "react-router";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  User,
  Phone,
  MapPin,
  UserPlus,
  AlertCircle,
  CheckCircle,
  Briefcase,
  ArrowLeft,
} from "lucide-react";

const countries = [
  "Afghanistan",
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
  "Bahamas (the)",
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
  "British Indian Ocean Territory (the)",
  "Brunei Darussalam",
  "Bulgaria",
  "Burkina Faso",
  "Burundi",
  "Cabo Verde",
  "Cambodia",
  "Cameroon",
  "Canada",
  "Cayman Islands (the)",
  "Central African Republic (the)",
  "Chad",
  "Chile",
  "China",
  "Christmas Island",
  "Cocos (Keeling) Islands (the)",
  "Colombia",
  "Comoros (the)",
  "Congo (the Democratic Republic of the)",
  "Congo (the)",
  "Cook Islands (the)",
  "Costa Rica",
  "Croatia",
  "Cuba",
  "Curaçao",
  "Cyprus",
  "Czechia",
  "Côte d'Ivoire",
  "Denmark",
  "Djibouti",
  "Dominica",
  "Dominican Republic (the)",
  "Ecuador",
  "Egypt",
  "El Salvador",
  "Equatorial Guinea",
  "Eritrea",
  "Estonia",
  "Eswatini",
  "Ethiopia",
  "Falkland Islands (the) [Malvinas]",
  "Faroe Islands (the)",
  "Fiji",
  "Finland",
  "France",
  "French Guiana",
  "French Polynesia",
  "French Southern Territories (the)",
  "Gabon",
  "Gambia (the)",
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
  "Holy See (the)",
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
  "Lao People's Democratic Republic (the)",
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
  "Marshall Islands (the)",
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
  "Netherlands (the)",
  "New Caledonia",
  "New Zealand",
  "Nicaragua",
  "Niger (the)",
  "Nigeria",
  "Niue",
  "Norfolk Island",
  "Northern Mariana Islands (the)",
  "Norway",
  "Oman",
  "Pakistan",
  "Palau",
  "Palestine, State of",
  "Panama",
  "Papua New Guinea",
  "Paraguay",
  "Peru",
  "Philippines (the)",
  "Pitcairn",
  "Poland",
  "Portugal",
  "Puerto Rico",
  "Qatar",
  "Republic of North Macedonia",
  "Romania",
  "Russian Federation (the)",
  "Rwanda",
  "Réunion",
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
  "Sudan (the)",
  "Suriname",
  "Svalbard and Jan Mayen",
  "Sweden",
  "Switzerland",
  "Syrian Arab Republic",
  "Taiwan",
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
  "Turks and Caicos Islands (the)",
  "Tuvalu",
  "Uganda",
  "Ukraine",
  "United Arab Emirates (the)",
  "United Kingdom of Great Britain and Northern Ireland (the)",
  "United States Minor Outlying Islands (the)",
  "United States of America (the)",
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
  "Åland Islands",
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
  const [categories, setCategories] = useState([]); // For storing the categories
  const [selectedCategory, setSelectedCategory] = useState(""); // Selected category

  // Fetch categories from API when the component mounts
  useEffect(() => {
    axios
      .get("http://localhost:5000/courses/categories")
      .then((response) => {
        setCategories(response.data.categories || []);
      })
      .catch((error) => {
        console.error("Error fetching categories:", error);
      });
  }, []);

  const register = (e) => {
    e.preventDefault();
    setIsLoading(true);

    // Prepare the data to send
    const userData = {
      role_id,
      first_name,
      last_name,
      email,
      password,
      phone_number,
      country,
      username,
    };

    // Add category_id only if the user is a freelancer
    if (role_id === "3") {
      userData.category_id = selectedCategory;
    }

    axios
      .post("http://localhost:5000/users/register", userData)
      .then((result) => {
        setStatus(true);
        setMessage(result.data.message || "Registration successful");

        // Auto login after successful registration
        axios
          .post("http://localhost:5000/users/login", { email, password })
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

  return (
    <div className="min-h-screen bg-white relative overflow-hidden">
      {/* Decorative Waves Behind Container */}
      <svg
        className="absolute inset-0 w-full h-full z-0"
        viewBox="0 0 1440 800"
        preserveAspectRatio="none"
      >
        {/* Top waves */}
        <path
          d="M0,150 Q360,100 720,150 T1440,130"
          stroke="url(#blueGradient)"
          strokeWidth="3"
          fill="none"
          opacity="0.25"
        />
        <path
          d="M0,200 Q360,250 720,200 T1440,220"
          stroke="url(#tealGradient)"
          strokeWidth="2.5"
          fill="none"
          opacity="0.2"
        />
        <path
          d="M0,350 Q360,300 720,350 T1440,330"
          stroke="url(#greenGradient)"
          strokeWidth="2"
          fill="none"
          opacity="0.18"
        />
        
        {/* Bottom waves */}
        <path
          d="M0,450 Q360,500 720,450 T1440,470"
          stroke="url(#blueGradient)"
          strokeWidth="2.5"
          fill="none"
          opacity="0.2"
        />
        <path
          d="M0,550 Q360,500 720,550 T1440,530"
          stroke="url(#tealGradient)"
          strokeWidth="3"
          fill="none"
          opacity="0.25"
        />
        <path
          d="M0,650 Q360,700 720,650 T1440,670"
          stroke="url(#greenGradient)"
          strokeWidth="2"
          fill="none"
          opacity="0.18"
        />
        
        {/* Additional flowing waves */}
        <path
          d="M0,120 Q200,80 400,120 Q600,160 800,120 Q1000,80 1200,120 Q1320,140 1440,120"
          stroke="url(#blueToTeal)"
          strokeWidth="1.5"
          fill="none"
          opacity="0.15"
        />
        <path
          d="M0,280 Q200,320 400,280 Q600,240 800,280 Q1000,320 1200,280 Q1320,260 1440,280"
          stroke="url(#tealToGreen)"
          strokeWidth="1.5"
          fill="none"
          opacity="0.15"
        />
        <path
          d="M0,420 Q200,380 400,420 Q600,460 800,420 Q1000,380 1200,420 Q1320,440 1440,420"
          stroke="url(#blueToGreen)"
          strokeWidth="1.5"
          fill="none"
          opacity="0.15"
        />
        <path
          d="M0,600 Q200,640 400,600 Q600,560 800,600 Q1000,640 1200,600 Q1320,580 1440,600"
          stroke="url(#greenToBlue)"
          strokeWidth="1.5"
          fill="none"
          opacity="0.15"
        />
        
        <defs>
          <linearGradient id="blueGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#2563eb" />
            <stop offset="100%" stopColor="#3b82f6" />
          </linearGradient>
          <linearGradient id="tealGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#0d9488" />
            <stop offset="100%" stopColor="#14b8a6" />
          </linearGradient>
          <linearGradient id="greenGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#059669" />
            <stop offset="100%" stopColor="#10b981" />
          </linearGradient>
          <linearGradient id="blueToTeal" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#2563eb" />
            <stop offset="50%" stopColor="#0d9488" />
            <stop offset="100%" stopColor="#2563eb" />
          </linearGradient>
          <linearGradient id="tealToGreen" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#0d9488" />
            <stop offset="50%" stopColor="#059669" />
            <stop offset="100%" stopColor="#0d9488" />
          </linearGradient>
          <linearGradient id="blueToGreen" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#2563eb" />
            <stop offset="50%" stopColor="#059669" />
            <stop offset="100%" stopColor="#2563eb" />
          </linearGradient>
          <linearGradient id="greenToBlue" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#059669" />
            <stop offset="50%" stopColor="#2563eb" />
            <stop offset="100%" stopColor="#059669" />
          </linearGradient>
        </defs>
      </svg>

      {/* Main Container */}
      <div className="flex min-h-screen items-center justify-center px-4 lg:px-8 xl:px-16 py-8">
        <div className="flex items-center justify-center max-w-7xl w-full">
          
          {/* Registration Container */}
          <div className="w-full max-w-4xl relative z-10">
            {/* Header */}
            <div className="text-center mb-4">
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-2 font-serif leading-tight">
                Join{" "}
                <span className="bg-gradient-to-r from-blue-600 via-teal-600 to-green-500 bg-clip-text text-transparent">
                  ORDERZHOUSE
                </span>
              </h1>
              <p className="text-gray-600 font-serif text-base lg:text-lg">
                Create your account and start your journey with us
              </p>
            </div>

            {/* Registration Form Container */}
            <div className="bg-white bg-opacity-95 backdrop-blur-sm rounded-3xl p-6 lg:p-8 border border-gray-100 relative overflow-hidden">
              {/* Background gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-br from-gray-50 to-white rounded-3xl opacity-80"></div>
              
              <div className="relative z-10">
                <div className="text-center mb-6">
                  <h2 className="text-2xl lg:text-3xl font-medium text-gray-900 font-serif">
                    Create your account
                  </h2>
                  <p className="text-gray-600 mt-2 font-serif text-base">
                    Fill in your details to get started
                  </p>
                </div>

                <form onSubmit={register} className="space-y-5">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                    
                    {/* Left Column */}
                    <div className="space-y-5">
                      
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

                      {/* Category Selection (Freelancer Only) */}
                      {role_id === "3" && (
                        <div>
                          <label
                            htmlFor="category_id"
                            className="block text-base font-semibold text-gray-700 mb-2 font-serif"
                          >
                            Select Category
                          </label>
                          <div className="relative group">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-colors">
                              <Briefcase className="h-6 w-6 text-gray-400 group-focus-within:text-teal-600 transition-colors" />
                            </div>
                            <select
                              id="category_id"
                              value={selectedCategory}
                              onChange={(e) => setSelectedCategory(e.target.value)}
                              required
                              className="pl-12 w-full px-5 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-600 transition-all duration-300 bg-white font-serif text-base"
                            >
                              <option value="">Select Category</option>
                              {categories.map((category) => (
                                <option key={category.id} value={category.id}>
                                  {category.name}
                                </option>
                              ))}
                            </select>
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

                    {/* Right Column */}
                    <div className="space-y-5">
                      
                      {/* Email */}
                      <div>
                        <label
                          htmlFor="email"
                          className="block text-base font-semibold text-gray-700 mb-2 font-serif"
                        >
                          Email Address
                        </label>
                        <div className="relative group">
                          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-colors">
                            <Mail className="h-6 w-6 text-gray-400 group-focus-within:text-teal-600 transition-colors" />
                          </div>
                          <input
                            type="email"
                            id="email"
                            placeholder="Enter your email address"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className="pl-12 w-full px-5 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-600 transition-all duration-300 bg-white font-serif text-base"
                          />
                        </div>
                      </div>

                      {/* Password */}
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

                      {/* Username */}
                      <div>
                        <label
                          htmlFor="username"
                          className="block text-base font-semibold text-gray-700 mb-2 font-serif"
                        >
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

                    </div>
                  </div>

                  {/* Terms Checkbox */}
                  <div className="flex items-center">
                    <input
                      id="terms"
                      name="terms"
                      type="checkbox"
                      className="h-5 w-5 text-teal-600 focus:ring-teal-500 border-gray-300 rounded"
                      required
                    />
                    <label
                      htmlFor="terms"
                      className="ml-3 block text-base text-gray-700 font-serif"
                    >
                      I agree to the{" "}
                      <a href="#" className="text-teal-600 hover:text-blue-600 font-semibold transition-colors">
                        Terms and Conditions
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
                            Creating account...
                          </>
                        ) : (
                          <>
                            <UserPlus className="w-6 h-6 mr-2" />
                            Create Account
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
                    <p className="text-base font-serif">{message}</p>
                  </div>
                )}

                {/* Login Link */}
                <div className="mt-6 text-center pt-4 border-t border-gray-200">
                  <p className="text-base lg:text-lg text-gray-600 font-serif">
                    Already have an account?{" "}
                    <a
                      href="/login"
                      className="font-semibold text-teal-600 hover:text-blue-600 inline-flex items-center transition-colors group font-serif"
                    >
                      Sign in now 
                      <ArrowLeft className="ml-1 h-5 w-5 group-hover:-translate-x-1 transition-transform rotate-180" />
                    </a>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;