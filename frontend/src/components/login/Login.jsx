import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { GoogleLogin } from "@react-oauth/google";
import { jwtDecode } from "jwt-decode";
import axios from "axios";
import { useNavigate } from "react-router";
import { setLogin } from "../../slice/auth/authSlice";
import { connectSocket } from "../../services/socketService";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  LogIn,
  AlertCircle,
  CheckCircle,
  ArrowRight,
  Shield,
  KeyRound,
} from "lucide-react";
import GradientButton from "../buttons/GradientButton.jsx";

const Login = () => {
  const dispatch = useDispatch();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [twoFactorToken, setTwoFactorToken] = useState("");
  const [show2FAInput, setShow2FAInput] = useState(false);
  const [requires2FA, setRequires2FA] = useState(false);
  const navigate = useNavigate();

  const login = (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage("");

    axios
      .post("http://localhost:5000/users/login", {
        email: email.toLowerCase(),
        password,
        twoFactorToken: requires2FA ? twoFactorToken : undefined,
      })
      .then((res) => {
        // Handle 2FA requirement
        if (res.data.twoFactorRequired && !requires2FA) {
          setRequires2FA(true);
          setShow2FAInput(true);
          setMessage("Please enter your 2FA verification code");
          setIsLoading(false);
          return;
        }

        // Successful login
        dispatch(
          setLogin({
            token: res.data.token,
            userId: res.data.userId,
            roleId: res.data.role,
            is_verified: res.data.is_verified,
            userInfo: res.data.userInfo,
          })
        );
        
        setStatus(true);
        setMessage("Login successful! Redirecting...");
        setIsLoading(false);
        
        // Connect socket and navigate
        connectSocket(res.data.token, res.data.userId);
        
        setTimeout(() => {
          navigate("/");
        }, 1500);
      })
      .catch((err) => {
        setStatus(false);
        const errorMessage = err.response?.data?.message || 
                           err.response?.data?.error || 
                           "Login failed. Please check your credentials.";
        
        setMessage(errorMessage);
        setIsLoading(false);
        
        // Reset 2FA state on error
        if (requires2FA) {
          setRequires2FA(false);
          setShow2FAInput(false);
          setTwoFactorToken("");
        }
      });
  };

  const handleGoogleSuccess = (credentialResponse) => {
    try {
      const decoded = jwtDecode(credentialResponse.credential);
      console.log("Google User:", decoded);

      dispatch(
        setLogin({
          token: credentialResponse.credential,
          userId: decoded.sub,
          roleId: "2", // Default to client role for Google sign-in
          is_verified: true, // Google users are typically verified
        })
      );

      setStatus(true);
      setMessage("Google login successful! Redirecting...");
      connectSocket(credentialResponse.credential, decoded.sub);

      setTimeout(() => {
        navigate("/");
      }, 1500);
    } catch (error) {
      setStatus(false);
      setMessage("Google login failed. Please try again.");
      console.error("Google login error:", error);
    }
  };

  const handleGoogleError = () => {
    setStatus(false);
    setMessage("Google login failed. Please try again.");
  };

  const resetForm = () => {
    setEmail("");
    setPassword("");
    setTwoFactorToken("");
    setShow2FAInput(false);
    setRequires2FA(false);
    setMessage("");
    setShowPassword(false);
  };

  return (
    <div className="min-h-screen bg-white relative overflow-hidden">
      {/* Main Container */}
      <div className="flex min-h-screen items-center justify-center p-4 lg:px-8 xl:px-16">
        <div className="flex items-center justify-center max-w-2xl w-full">
          <div className="w-full max-w-6xl relative z-10">
            <div className="text-center mb-4">
              <h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold text-gray-900 mb-2 font-serif leading-tight">
                Welcome to{" "}
                <span className="bg-gradient-to-r from-blue-600 via-teal-600 to-green-500 bg-clip-text text-transparent">
                  ORDERZHOUSE
                </span>
              </h1>
            </div>

            <div className="bg-white bg-opacity-95 backdrop-blur-sm rounded-3xl p-6 lg:p-8 border shadow-sm lg:min-h-[75vh] border-gray-100 relative overflow-hidden">
              {/* Background overlay */}
              <div className="absolute inset-0 bg-gradient-to-br from-gray-50 to-white rounded-3xl opacity-80"></div>

              <div className="relative z-10">
                <div className="flex flex-col lg:flex-row items-center gap-6 lg:gap-10">

                  {/* Right Side - Form */}
                  <div className="flex-1 w-full">
                    <div className="text-center lg:text-left mb-6">
                      <h2 className="text-2xl lg:text-3xl font-medium text-gray-900 font-serif">
                        {requires2FA ? "Two-Factor Authentication" : "Sign in to your account"}
                      </h2>
                      <p className="text-gray-600 mt-2 font-serif text-base lg:text-lg">
                        {requires2FA 
                          ? "Enter the verification code from your authenticator app" 
                          : "Enter your credentials to access your dashboard"}
                      </p>
                    </div>

                    <form onSubmit={login} className="space-y-5">
                      {/* Email - Only show if not in 2FA mode */}
                      {!requires2FA && (
                        <div>
                          <label htmlFor="email" className="block text-base lg:text-lg font-semibold text-gray-700 mb-2 font-serif">
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
                              disabled={isLoading}
                              className="pl-12 w-full px-5 py-3 lg:py-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-600 transition-all duration-300 bg-white font-serif text-base lg:text-lg disabled:opacity-50 disabled:cursor-not-allowed"
                            />
                          </div>
                        </div>
                      )}

                      {/* Password - Only show if not in 2FA mode */}
                      {!requires2FA && (
                        <div>
                          <label htmlFor="password" className="block text-base lg:text-lg font-semibold text-gray-700 mb-2 font-serif">
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
                              disabled={isLoading}
                              className="pl-12 pr-12 w-full px-5 py-3 lg:py-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-600 transition-all duration-300 bg-white font-serif text-base lg:text-lg disabled:opacity-50 disabled:cursor-not-allowed"
                            />
                            <button
                              type="button"
                              className="absolute inset-y-0 right-0 pr-4 flex items-center hover:text-teal-600 transition-colors disabled:opacity-50"
                              onClick={() => setShowPassword(!showPassword)}
                              disabled={isLoading}
                            >
                              {showPassword ? 
                                <EyeOff className="h-6 w-6 text-gray-400 hover:text-teal-600" /> : 
                                <Eye className="h-6 w-6 text-gray-400 hover:text-teal-600" />
                              }
                            </button>
                          </div>
                        </div>
                      )}

                      {/* 2FA Input - Only show when required */}
                      {show2FAInput && (
                        <div className="animate-fadeIn">
                          <label htmlFor="2fa" className="block text-base lg:text-lg font-semibold text-gray-700 mb-2 font-serif">
                            Verification Code
                          </label>
                          <div className="relative group">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-colors">
                              <Shield className="h-6 w-6 text-gray-400 group-focus-within:text-teal-600 transition-colors" />
                            </div>
                            <input
                              type="text"
                              id="2fa"
                              placeholder="Enter 6-digit code"
                              value={twoFactorToken}
                              onChange={(e) => setTwoFactorToken(e.target.value.replace(/\D/g, '').slice(0, 6))}
                              maxLength="6"
                              required
                              disabled={isLoading}
                              className="pl-12 w-full px-5 py-3 lg:py-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-600 transition-all duration-300 bg-white font-serif text-base lg:text-lg text-center tracking-widest disabled:opacity-50 disabled:cursor-not-allowed"
                            />
                          </div>
                          <p className="text-sm text-gray-500 mt-2 text-center">
                            Enter the code from your authenticator app
                          </p>
                        </div>
                      )}

                      {/* Remember Me - Only show if not in 2FA mode */}
                      {!requires2FA && (
                        <div className="flex items-center">
                          <input 
                            id="remember-me" 
                            name="remember-me" 
                            type="checkbox" 
                            className="h-5 w-5 text-teal-600 focus:ring-teal-500 border-gray-300 rounded" 
                            disabled={isLoading}
                          />
                          <label htmlFor="remember-me" className="ml-3 block text-base lg:text-lg text-gray-700 font-serif">
                            Remember me
                          </label>
                        </div>
                      )}

                      {/* Submit Button */}
                      <div>

<GradientButton type="submit" disabled={isLoading}>
  <div className="absolute inset-0 bg-gradient-to-r from-teal-600 to-green-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
  <div className="relative z-10 flex items-center">
    {isLoading ? (
      <>
        <svg className="animate-spin -ml-1 mr-3 h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        {requires2FA ? 'Verifying...' : 'Signing in...'}
      </>
    ) : (
      <>
        {requires2FA ? <KeyRound className="w-6 h-6 mr-2" /> : <LogIn className="w-6 h-6 mr-2" />}
        {requires2FA ? 'Verify & Sign In' : 'Sign in'}
      </>
    )}
  </div>
</GradientButton>

                      </div>

                      {/* Back to regular login button when in 2FA mode */}
                      {requires2FA && (
                        <div className="text-center">
                          <button
                            type="button"
                            onClick={resetForm}
                            disabled={isLoading}
                            className="text-teal-600 hover:text-teal-700 font-semibold text-base font-serif disabled:opacity-50"
                          >
                            ← Back to email login
                          </button>
                        </div>
                      )}

                      {/* Divider - Only show if not in 2FA mode */}
                      {!requires2FA && (
                        <>
                          <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                              <div className="w-full border-t border-gray-300"></div>
                            </div>
                            <div className="relative flex justify-center text-sm">
                              <span className="px-2 bg-white text-gray-500 font-serif">
                                Or continue with
                              </span>
                            </div>
                          </div>

                          {/* Google Login */}
                          <div className="flex justify-center">
                            <GoogleLogin
                              onSuccess={handleGoogleSuccess}
                              onError={handleGoogleError}
                              theme="filled_blue"
                              size="large"
                              shape="pill"
                              text="signin_with"
                            />
                          </div>
                        </>
                      )}
                    </form>

                    {/* Status Message */}
                    {message && (
                      <div className={`mt-6 p-4 rounded-xl flex items-start border backdrop-blur-sm animate-fadeIn ${
                        status ? "bg-green-50 text-green-800 border-green-200" : "bg-red-50 text-blue-800 border-green-200"
                      }`}>
                        {status ? 
                          <CheckCircle className="w-6 h-6 mt-0.5 mr-3 text-green-500 flex-shrink-0" /> : 
                          <AlertCircle className="w-6 h-6 mt-0.5 mr-3 text-red-500 flex-shrink-0" />
                        }
                        <p className="text-base font-serif">{message}</p>
                      </div>
                    )}

                    {/* Sign Up Link - Only show if not in 2FA mode */}
                    {!requires2FA && (
                      <div className="mt-6 text-center pt-4 border-t border-gray-200">
                        <p className="text-base lg:text-lg text-gray-600 font-serif">
                          Don't have an account?{" "}
                          <a 
                            href="/register" 
                            className="font-semibold text-teal-600 hover:text-blue-600 inline-flex items-center transition-colors group font-serif"
                          >
                            Sign up now <ArrowRight className="ml-1 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                          </a>
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Add custom animation */}
      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export default Login;