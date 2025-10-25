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
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");

  const [message, setMessage] = useState("");
  const [status, setStatus] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [requiresOtp, setRequiresOtp] = useState(false);

  const handleLogin = (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage("");

    axios
      .post("http://localhost:5000/users/login", {
        email: email.toLowerCase( ),
        password,
      })
      .then((res) => {
        setIsLoading(false);
        if (res.data.token) {
          setStatus(true);
          setMessage("Login successful! Redirecting...");
          const decoded = jwtDecode(res.data.token);
          dispatch(
            setLogin({
              token: res.data.token,
              userId: decoded.userId,
              roleId: decoded.role,
              is_verified: decoded.is_verified,
              userInfo: res.data.userInfo,
            })
          );
          connectSocket(res.data.token, decoded.userId);
          setTimeout(() => navigate("/"), 1500);
        } else if (res.data.message === "OTP sent successfully") {
          setStatus(true); 
          setMessage("Verification code sent. Please check your email and enter the code below.");
          setRequiresOtp(true); 
        }
      })
      .catch((err) => {
        setIsLoading(false);
        setStatus(false);
        const errorMessage = err.response?.data?.message || "Login failed. Please check your credentials.";
        setMessage(errorMessage);
        setRequiresOtp(false); 
      });
  };

  const handleVerifyOtp = (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage("");

    axios
      .post("http://localhost:5000/users/verify-otp", {
        email: email.toLowerCase( ),
        otp,
      })
      .then((res) => {
        setIsLoading(false);
        setStatus(true);
        setMessage("Login successful! Redirecting...");
        const decoded = jwtDecode(res.data.token);
        dispatch(
          setLogin({
            token: res.data.token,
            userId: decoded.userId,
            roleId: decoded.role,
            is_verified: decoded.is_verified,
            userInfo: res.data.userInfo,
          })
        );
        connectSocket(res.data.token, decoded.userId);
        setTimeout(() => navigate("/"), 1500);
      })
      .catch((err) => {
        setIsLoading(false);
        setStatus(false);
        const errorMessage = err.response?.data?.message || "Invalid or expired OTP.";
        setMessage(errorMessage);
        setOtp("");
      });
  };

  const handleSubmit = (e) => {
    if (requiresOtp) {
      handleVerifyOtp(e);
    } else {
      handleLogin(e);
    }
  };

  const handleGoogleSuccess = (credentialResponse) => {
    try {
      const decoded = jwtDecode(credentialResponse.credential);
      dispatch(
        setLogin({
          token: credentialResponse.credential,
          userId: decoded.sub,
          roleId: "2",
          is_verified: true,
        })
      );
      setStatus(true);
      setMessage("Google login successful! Redirecting...");
      connectSocket(credentialResponse.credential, decoded.sub);
      setTimeout(() => navigate("/"), 1500);
    } catch (error) {
      setStatus(false);
      setMessage("Google login failed. Please try again.");
    }
  };

  const handleGoogleError = () => {
    setStatus(false);
    setMessage("Google login failed. Please try again.");
  };

  const resetToLogin = () => {
    setRequiresOtp(false);
    setPassword("");
    setOtp("");
    setMessage("");
  };

  return (
    <div className="min-h-screen bg-white relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-24 -right-24 w-72 h-72 rounded-full bg-[#028090]/10 blur-3xl" />
        <div className="absolute -bottom-24 -left-24 w-80 h-80 rounded-full bg-[#028090]/5 blur-3xl" />
      </div>

      <div className="flex min-h-screen items-center justify-center p-4 lg:px-8">
        <div className="w-full max-w-lg">
          <div className="text-center mb-6">
            <h1 className="text-2xl sm:text-4xl font-semibold text-slate-900 tracking-tight">
              Welcome back
            </h1>
            <p className="text-slate-500 mt-2 text-sm">
              Sign in to continue to{" "}
              <span className="font-semibold text-[#028090]">ORDERZHOUSE</span>
            </p>
          </div>

          <div className="rounded-3xl border border-slate-200/70 bg-white/90 backdrop-blur p-6 sm:p-8 shadow-sm">
            <div className="mb-6 text-center">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-slate-200 text-slate-600 bg-white">
                {requiresOtp ? <Shield className="w-4 h-4" /> : <LogIn className="w-4 h-4" />}
                <span className="text-sm">
                  {requiresOtp ? "Verify Your Identity" : "Sign in"}
                </span>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {!requiresOtp && (
                <>
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
                        disabled={isLoading}
                        className="w-full pl-10 pr-3 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#028090]/20 focus:border-[#028090]/50"
                      />
                    </div>
                  </div>

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
                        disabled={isLoading}
                        className="w-full pl-10 pr-12 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#028090]/20 focus:border-[#028090]/50"
                      />
                      <button
                        type="button"
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-[#028090]"
                        onClick={() => setShowPassword(!showPassword)}
                        disabled={isLoading}
                      >
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>
                </>
              )}

              {requiresOtp && (
                <div className="animate-fadeIn">
                  <label htmlFor="otp" className="block text-sm text-slate-700 mb-1.5">
                    Verification Code
                  </label>
                  <div className="relative">
                    <Shield className="w-5 h-5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      id="otp"
                      placeholder="6-digit code"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                      maxLength="6"
                      required
                      autoFocus
                      disabled={isLoading}
                      className="w-full pl-10 pr-3 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#028090]/20 focus:border-[#028090]/50 text-center tracking-widest"
                    />
                  </div>
                  <p className="text-xs text-slate-500 mt-2 text-center">
                    Enter the 6-digit code sent to your email.
                  </p>
                </div>
              )}

              <div className="flex items-center justify-center">
                <GradientButton type="submit" disabled={isLoading}>
                  <div className="relative z-10 flex items-center px-12">
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
                            cx="12" cy="12" r="10"
                            stroke="currentColor" strokeWidth="4"
                          ></circle>
                          <path
                            className="opacity-75" fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          ></path>
                        </svg>
                        {requiresOtp ? "Verifying..." : "Signing in..."}
                      </>
                     ) : (
                      <>
                        {requiresOtp ? <KeyRound className="w-5 h-5 mr-2" /> : <LogIn className="w-5 h-5 mr-2" />}
                        {requiresOtp ? "Verify & Sign In" : "Sign in"}
                      </>
                    )}
                  </div>
                </GradientButton>
              </div>

              {requiresOtp && (
                <div className="text-center">
                  <button
                    type="button"
                    onClick={resetToLogin}
                    disabled={isLoading}
                    className="text-[#028090] hover:underline font-medium text-sm"
                  >
                    ← Back to login
                  </button>
                </div>
              )}

              {!requiresOtp && (
                <>
                  <div className="relative my-2">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-slate-200"></div>
                    </div>
                    <div className="relative flex justify-center">
                      <span className="px-2 bg-white text-slate-500 text-sm">Or continue with</span>
                    </div>
                  </div>

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

            {message && (
              <div
                className={`mt-6 p-4 rounded-xl flex items-start border ${
                  status
                    ? "bg-green-50 text-green-800 border-green-200"
                    : "bg-rose-50 text-rose-800 border-rose-200"
                }`}
              >
                {status ? (
                  <CheckCircle className="w-5 h-5 mt-0.5 mr-3 text-green-600" />
                ) : (
                  <AlertCircle className="w-5 h-5 mt-0.5 mr-3 text-rose-600" />
                )}
                <p className="text-sm">{message}</p>
              </div>
            )}

            {!requiresOtp && (
              <div className="mt-6 text-center pt-4 border-t border-slate-200">
                <p className="text-sm text-slate-600">
                  Don't have an account?{" "}
                  <a
                    href="/register"
                    className="font-medium text-[#028090] inline-flex items-center hover:underline"
                  >
                    Sign up now <ArrowRight className="ml-1 h-4 w-4" />
                  </a>
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(8px);} to { opacity: 1; transform: translateY(0);} }
        .animate-fadeIn { animation: fadeIn 0.25s ease-out; }
      `}</style>
    </div>
  );
};

export default Login;