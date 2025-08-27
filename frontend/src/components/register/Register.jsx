import React, { useState, useEffect } from "react";
import axios from "axios";
import "./Register.css";

const Register = () => {
  const [role, setRole] = useState("2");
  const [first_name, setFirst_name] = useState("");
  const [last_name, setLast_name] = useState("");
  const [phone_number, setPhone_number] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [country, setCountry] = useState("");
  const [username, setUsername] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [countries, setCountries] = useState([]);

  // Load countries on component mount
  useEffect(() => {
    const loadCountries = async () => {
      try {
        // Using REST Countries API to get all countries
        const response = await axios.get("https://restcountries.com/v3.1/all");
        const countryData = response.data.map(country => ({
          name: country.name.common,
          code: country.cca2
        }));
        
        // Sort countries alphabetically
        countryData.sort((a, b) => a.name.localeCompare(b.name));
        setCountries(countryData);
        
        // Set default country if needed
        if (!country) {
          setCountry(countryData[0]?.name || "");
        }
      } catch (error) {
        console.error("Failed to load countries:", error);
        // Fallback to a basic list if API fails
        setCountries([
          { name: "United States", code: "US" },
          { name: "United Kingdom", code: "GB" },
          { name: "Canada", code: "CA" },
          { name: "Australia", code: "AU" },
          { name: "Germany", code: "DE" },
          { name: "France", code: "FR" },
          { name: "Japan", code: "JP" },
          { name: "India", code: "IN" },
          { name: "Brazil", code: "BR" },
          { name: "South Africa", code: "ZA" }
        ]);
      }
    };

    loadCountries();
  }, []);

  // Auto-dismiss messages after 5 seconds
  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => {
        setMessage("");
      }, 5000);
      
      return () => clearTimeout(timer);
    }
  }, [message]);

  // Check password strength
  useEffect(() => {
    if (password) {
      let strength = 0;
      if (password.length >= 8) strength++;
      if (/[A-Z]/.test(password)) strength++;
      if (/[0-9]/.test(password)) strength++;
      if (/[^A-Za-z0-9]/.test(password)) strength++;
      
      setPasswordStrength(strength);
    } else {
      setPasswordStrength(0);
    }
  }, [password]);

  const register = (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    const role_id = role;
    
    axios
      .post("http://localhost:5000/users/register", {
        role_id,
        first_name,
        last_name,
        email,
        password,
        phone_number,
        country,
        username,
      })
      .then((result) => {
        console.log(result);
        setStatus(true);
        setMessage(result.data.message || "Registration successful");
        
        if (result.data.success) {
          setRole("2");
          setFirst_name("");
          setLast_name("");
          setPhone_number("");
          setEmail("");
          setPassword("");
          setCountry("");
          setUsername("");
        }
      })
      .catch((error) => {
        console.log(error);
        setStatus(false);
        setMessage(error.response?.data?.message || "Registration failed");
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  const getPasswordStrengthColor = () => {
    if (passwordStrength === 0) return "transparent";
    if (passwordStrength === 1) return "#ff4d4d";
    if (passwordStrength === 2) return "#ffa64d";
    if (passwordStrength === 3) return "#ffcc00";
    return "#2ecc71";
  };

  const getPasswordStrengthText = () => {
    if (passwordStrength === 0) return "";
    if (passwordStrength === 1) return "Weak";
    if (passwordStrength === 2) return "Fair";
    if (passwordStrength === 3) return "Good";
    return "Strong";
  };

  return (
    <div className="register-page">
      {/* Notification message that appears outside the form container */}
      {message && (
        <div className={`global-message ${status ? "success" : "error"} ${message ? "visible" : ""}`}>
          <div className="message-content">
            <span className="message-icon">
              {status ? "✓" : "!"}
            </span>
            {message}
            <button 
              className="message-close"
              onClick={() => setMessage("")}
            >
              ×
            </button>
          </div>
        </div>
      )}

      <div className="register-container">
        <div className="register-card">
          <div className="card-header">
            <h1>Create Your Account</h1>
            <p>Join our community of professionals and clients</p>
          </div>

          <form onSubmit={register} className="register-form">
            <div className="form-section">
              <h3 className="section-title">
                <span className="title-icon">👥</span>
                Account Type
              </h3>
              <div className="role-selection">
                <div className={`role-option ${role === "2" ? "selected" : ""}`}>
                  <input
                    type="radio"
                    id="user"
                    name="role"
                    value="2"
                    checked={role === "2"}
                    onChange={(e) => setRole(e.target.value)}
                  />
                  <label htmlFor="user" className="role-label">
                    <div className="role-icon">👤</div>
                    <div className="role-info">
                      <h4>Client</h4>
                      <p>I want to hire freelancers for projects</p>
                    </div>
                  </label>
                </div>
                
                <div className={`role-option ${role === "3" ? "selected" : ""}`}>
                  <input
                    type="radio"
                    id="freelancer"
                    name="role"
                    value="3"
                    checked={role === "3"}
                    onChange={(e) => setRole(e.target.value)}
                  />
                  <label htmlFor="freelancer" className="role-label">
                    <div className="role-icon">💼</div>
                    <div className="role-info">
                      <h4>Freelancer</h4>
                      <p>I want to offer my services</p>
                    </div>
                  </label>
                </div>
              </div>
            </div>

            <div className="form-section">
              <h3 className="section-title">
                <span className="title-icon">📝</span>
                Personal Information
              </h3>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="first_name">First Name</label>
                  <input
                    type="text"
                    id="first_name"
                    placeholder="Enter your first name"
                    value={first_name}
                    onChange={(e) => setFirst_name(e.target.value)}
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="last_name">Last Name</label>
                  <input
                    type="text"
                    id="last_name"
                    placeholder="Enter your last name"
                    value={last_name}
                    onChange={(e) => setLast_name(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="username">Username</label>
                  <input
                    type="text"
                    id="username"
                    placeholder="Choose a username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="email">Email Address</label>
                  <input
                    type="email"
                    id="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>
            </div>

            <div className="form-section">
              <h3 className="section-title">
                <span className="title-icon">🔒</span>
                Security
              </h3>
              <div className="form-group">
                <label htmlFor="password">
                  Password
                  {password && (
                    <span className="password-strength">
                      Strength: <span style={{color: getPasswordStrengthColor()}}>
                        {getPasswordStrengthText()}
                      </span>
                    </span>
                  )}
                </label>
                <input
                  type="password"
                  id="password"
                  placeholder="Create a strong password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <div className="password-strength-meter">
                  <div 
                    className="password-strength-bar" 
                    style={{
                      width: `${passwordStrength * 25}%`,
                      backgroundColor: getPasswordStrengthColor()
                    }}
                  ></div>
                </div>
                <div className="password-tips">
                  <p>Use at least 8 characters with a mix of letters, numbers and symbols</p>
                </div>
              </div>
            </div>

            <div className="form-section">
              <h3 className="section-title">
                <span className="title-icon">📞</span>
                Contact Information
              </h3>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="phone_number">Phone Number</label>
                  <input
                    type="tel"
                    id="phone_number"
                    placeholder="Your phone number"
                    value={phone_number}
                    onChange={(e) => setPhone_number(e.target.value)}
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="country">Country</label>
                  <select
                    id="country"
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    required
                  >
                    <option value="">Select your country</option>
                    {countries.map((country) => (
                      <option key={country.code} value={country.name}>
                        {country.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <button 
              type="submit" 
              className={`submit-btn ${isLoading ? "loading" : ""}`}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <span className="spinner"></span>
                  Creating Account...
                </>
              ) : (
                "Create Account"
              )}
            </button>
          </form>

          <div className="card-footer">
            <p>Already have an account? <a href="/login">Sign in</a></p>
          </div>
        </div>
        
        <div className="register-graphics">
          <div className="graphic-content">
            <h2>Join Our Growing Community</h2>
            <div className="features-list">
              <div className="feature-item">
                <div className="feature-icon">🚀</div>
                <div className="feature-text">
                  <h3>Fast Onboarding</h3>
                  <p>Get started in minutes with our simple registration process</p>
                </div>
              </div>
              <div className="feature-item">
                <div className="feature-icon">🔐</div>
                <div className="feature-text">
                  <h3>Secure Platform</h3>
                  <p>Your data is protected with enterprise-grade security</p>
                </div>
              </div>
              <div className="feature-item">
                <div className="feature-icon">🌍</div>
                <div className="feature-text">
                  <h3>Global Reach</h3>
                  <p>Connect with professionals from around the world</p>
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