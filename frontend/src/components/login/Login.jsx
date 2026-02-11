// src/components/login/Login.jsx
import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { jwtDecode } from "jwt-decode";
import API from "../../api/client.js";

import { useNavigate, Link } from "react-router-dom";
import { loginSuccess } from "../../slice/auth/authSlice";
import { connectSocket } from "../../services/socketService";
import { useToast } from "../toast/ToastProvider";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  LogIn,
  ArrowRight,
  Shield,
  KeyRound,
} from "lucide-react";
import GradientButton from "../buttons/GradientButton.jsx";
import PageMeta from "../PageMeta.jsx";

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

const applyLoginSuccess = (dispatch, data, navigate, connectSocket) => {
  const token = data.token;
  const decoded = jwtDecode(token);
  const userInfo = data.userInfo ?? {
    id: decoded.userId,
    role_id: decoded.role,
    username: decoded.username,
    email: decoded.email,
  };
  const roleId = userInfo.role_id ?? decoded.role;

  dispatch(loginSuccess({ token, userInfo }));
  console.log("LOGIN OK", { token: !!token, userInfo });

  connectSocket(token, decoded.userId);
  const path = getDashboardPath(roleId);
  navigate(path, { replace: true });
};

const Login = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const toast = useToast();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [otp, setOtp] = useState("");
  const [otpMode, setOtpMode] = useState(null); // 'email' | 'app' | null
  const [tempToken, setTempToken] = useState("");

  const [message, setMessage] = useState("");
  const [status, setStatus] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const isOtpStep = otpMode !== null;

  const handleLogin = (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage("");

    API
      .post("/users/login", {
        email: email.toLowerCase(),
        password,
      })
      .then((res) => {
        setIsLoading(false);
        const data = res.data;

        // ===== 2FA (Authenticator App) =====
        if (data.requires_2fa && data.temp_token) {
          setStatus(true);
          toast.info("Enter the 6-digit code from your authenticator app.");
          setOtp("");
          setOtpMode("app");
          setTempToken(data.temp_token);
          return;
        }

        // ===== Email OTP (محاولات كثيرة) =====
        if (data.requires_email_otp) {
          setStatus(true);
          toast.info(
            data.message ||
              "Verification code sent. Please check your email and enter the code below."
          );
          setOtp("");
          setOtpMode("email");
          return;
        }

        // ===== Login مباشر (بدون أي خطوة إضافية) =====
        if (data.token) {
          setStatus(true);
          toast.success("Login successful! Redirecting...");
          applyLoginSuccess(dispatch, data, navigate, connectSocket);
          return;
        }

        // fallback
        setStatus(false);
        toast.error(data.message || "Unexpected response from server.");
      })
      .catch((err) => {
        setIsLoading(false);
        setStatus(false);
        const errorMessage =
          err.response?.data?.message ||
          "Login failed. Please check your credentials.";
        
        // Special handling for email verification error
        if (err.response?.status === 403 && (err.response?.data?.error === "EMAIL_NOT_VERIFIED" || errorMessage.includes("verify your email"))) {
          const userEmail = err.response?.data?.email || email;
          toast.info("Please verify your email. We sent you a code.");
          // Redirect to verify email page with email in URL
          navigate(`/register?email=${encodeURIComponent(userEmail)}&verify=true`);
        } else {
          toast.error(errorMessage);
        }
        setOtpMode(null);
      });
  };

  const handleVerifyOtp = (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage("");

    // Email OTP
    if (otpMode === "email") {
      API
        .post("/users/verify-otp", {
          email: email.toLowerCase(),
          otp,
        })
        .then((res) => {
          setIsLoading(false);
          const data = res.data;
          setStatus(true);
          toast.success("Login successful! Redirecting...");
          applyLoginSuccess(dispatch, data, navigate, connectSocket);
        })
        .catch((err) => {
          setIsLoading(false);
          setStatus(false);
          const errorMessage =
            err.response?.data?.message || "Invalid or expired OTP.";
          toast.error(errorMessage);
          setOtp("");
        });
      return;
    }

    // 2FA App (TOTP)
    if (otpMode === "app") {
      API
        .post("/auth/2fa/verify-login", {
          temp_token: tempToken,
          code: otp,
        })
        .then((res) => {
          setIsLoading(false);
          const data = res.data;
          setStatus(true);
          toast.success("Login successful! Redirecting...");
          applyLoginSuccess(dispatch, data, navigate, connectSocket);
        })
        .catch((err) => {
          setIsLoading(false);
          setStatus(false);
          const errorMessage =
            err.response?.data?.message || "Invalid 2FA code.";
          toast.error(errorMessage);
          setOtp("");
        });
    }
  };

  const handleSubmit = (e) => {
    if (isOtpStep) {
      handleVerifyOtp(e);
    } else {
      handleLogin(e);
    }
  };


  const resetToLogin = () => {
    setOtpMode(null);
    setPassword("");
    setOtp("");
    setMessage("");
    setTempToken("");
  };

  return (
    <div className="min-h-screen bg-white relative overflow-hidden">
      <PageMeta title="Log in – OrderzHouse" description="Log in to your OrderzHouse account to manage projects and connect with freelancers." />
      {/* <div className="pointer-events-none absolute -top-28 left-[-80px] h-[360px] w-[360px] rounded-full bg-yellow-300/25 blur-3xl" />
          <div className="pointer-events-none absolute -top-28 right-[-90px] h-[380px] w-[380px] rounded-full bg-orange-400/20 blur-3xl" /> */}
      {/* ✅ Orange theme glows */}
      {/* <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-24 -right-24 w-72 h-72 rounded-full bg-orange-500/12 blur-3xl" />
        <div className="absolute -bottom-24 -left-24 w-80 h-80 rounded-full bg-orange-500/8 blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[520px] h-[520px] rounded-full bg-amber-300/10 blur-3xl" />
      </div> */}

      <div className="flex min-h-screen items-center justify-center pt-32 p-4 lg:px-8">
        <div className="w-full max-w-xl">
          <div className="text-center mb-8">
            <h1 className="text-2xl sm:text-4xl font-semibold text-slate-900 tracking-tight">
              Welcome back
            </h1>
            <p className="text-slate-500 mt-2 text-sm">
              Sign in to continue to{" "}
              <span className="font-semibold text-orange-600">ORDERZHOUSE</span>
            </p>
          </div>

          <div className="rounded-3xl border border-slate-200/70 bg-white/90 backdrop-blur p-8 sm:p-10 shadow-sm">
            <div className="mb-8 text-center">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-slate-200 text-slate-600 bg-white">
                {isOtpStep ? <Shield className="w-4 h-4" /> : <LogIn className="w-4 h-4" />}
                <span className="text-sm">
                  {isOtpStep ? "Verify Your Identity" : "Sign in"}
                </span>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* فورم الإيميل + الباسورد */}
              {!isOtpStep && (
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
                        placeholder="info@battechno.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        disabled={isLoading}
                        className="w-full pl-10 pr-3 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500/50"
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label htmlFor="password" className="block text-sm text-slate-700">
                        Password
                      </label>
                      <Link
                        to="/forgot-password"
                        className="text-sm text-orange-600 hover:text-orange-700 hover:underline font-medium"
                      >
                        Forgot password?
                      </Link>
                    </div>
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
                        className="w-full pl-10 pr-12 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500/50"
                      />
                      <button
                        type="button"
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-orange-600"
                        onClick={() => setShowPassword(!showPassword)}
                        disabled={isLoading}
                      >
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                    <div className="mt-2 text-right">
                      <Link
                        to="/forgot-password"
                        className="text-sm font-medium text-orange-600 hover:underline"
                      >
                        Forgot password?
                      </Link>
                    </div>
                  </div>
                </>
              )}

              {/* فورم الكود (OTP أو 2FA APP) */}
              {isOtpStep && (
                <div className="animate-fadeIn">
                  <label htmlFor="otp" className="block text-sm text-slate-700 mb-1.5">
                    {otpMode === "app" ? "Authenticator Code" : "Verification Code"}
                  </label>
                  <div className="relative">
                    <Shield className="w-5 h-5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      id="otp"
                      placeholder="6-digit code"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                      maxLength={6}
                      required
                      autoFocus
                      disabled={isLoading}
                      className="w-full pl-10 pr-3 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500/50 text-center tracking-widest"
                    />
                  </div>
                  <p className="text-xs text-slate-500 mt-2 text-center">
                    {otpMode === "app"
                      ? "Open your authenticator app and enter the 6-digit code."
                      : "Enter the 6-digit code sent to your email."}
                  </p>
                </div>
              )}

              <div className="flex items-center justify-center">
                {/* ✅ حاولت أعطي GradientButton ثيم برتقالي بدون ما أغير منطقها */}
                <GradientButton
                  type="submit"
                  disabled={isLoading}
                  className="from-orange-400 via-orange-500 to-red-500"
                >
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
                        {isOtpStep ? "Verifying..." : "Signing in..."}
                      </>
                    ) : (
                      <>
                        {isOtpStep ? <KeyRound className="w-5 h-5 mr-2" /> : <LogIn className="w-5 h-5 mr-2" />}
                        {isOtpStep ? "Verify & Sign In" : "Sign in"}
                      </>
                    )}
                  </div>
                </GradientButton>
              </div>

              {isOtpStep && (
                <div className="text-center">
                  <button
                    type="button"
                    onClick={resetToLogin}
                    disabled={isLoading}
                    className="text-orange-600 hover:underline font-medium text-sm"
                  >
                    ← Back to login
                  </button>
                </div>
              )}
            </form>

            {!isOtpStep && (
              <div className="mt-8 text-center pt-5 border-t border-slate-200">
                <p className="text-sm text-slate-600">
                  Don&apos;t have an account?{" "}
                  <a
                    href="/register"
                    className="font-medium text-orange-600 inline-flex items-center hover:underline"
                  >
                    Sign up now <ArrowRight className="ml-1 h-4 w-4" />
                  </a>
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(8px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.25s ease-out;
        }
      `}</style>
    </div>
  );
};

export default Login;
