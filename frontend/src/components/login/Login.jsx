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
        if (res.data.twoFactorRequired && !requires2FA) {
          setRequires2FA(true);
          setShow2FAInput(true);
          setMessage("Please enter your 2FA verification code");
          setIsLoading(false);
          return;
        }

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

        connectSocket(res.data.token, res.data.userId);

        setTimeout(() => {
          navigate("/");
        }, 1500);
      })
      .catch((err) => {
        setStatus(false);
        const errorMessage =
          err.response?.data?.message ||
          err.response?.data?.error ||
          "Login failed. Please check your credentials.";

        setMessage(errorMessage);
        setIsLoading(false);

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
      {/* Soft background accents */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-24 -right-24 w-72 h-72 rounded-full bg-[#028090]/10 blur-3xl" />
        <div className="absolute -bottom-24 -left-24 w-80 h-80 rounded-full bg-[#028090]/5 blur-3xl" />
      </div>

      <div className="flex min-h-screen items-center justify-center p-4 lg:px-8">
        <div className="w-full max-w-lg">
          {/* Title */}
          <div className="text-center mb-6">
            <h1 className="text-2xl sm:text-4xl font-semibold text-slate-900 tracking-tight">
              Welcome back
            </h1>
            <p className="text-slate-500 mt-2 text-sm">
              Sign in to continue to{" "}
              <span className="font-semibold text-[#028090]">ORDERZHOUSE</span>
            </p>
          </div>

          {/* Card */}
          <div className="rounded-3xl border border-slate-200/70 bg-white/90 backdrop-blur p-6 sm:p-8 shadow-sm">
            {/* Sub header */}
            <div className="mb-6 text-center">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-slate-200 text-slate-600 bg-white">
                <LogIn className="w-4 h-4" />
                <span className="text-sm">
                  {requires2FA ? "Two-Factor Authentication" : "Sign in"}
                </span>
              </div>
            </div>

            <form onSubmit={login} className="space-y-5">
              {!requires2FA && (
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
              )}

              {!requires2FA && (
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
              )}

              {show2FAInput && (
                <div className="animate-fadeIn">
                  <label htmlFor="2fa" className="block text-sm text-slate-700 mb-1.5">
                    Verification Code
                  </label>
                  <div className="relative">
                    <Shield className="w-5 h-5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      id="2fa"
                      placeholder="6-digit code"
                      value={twoFactorToken}
                      onChange={(e) =>
                        setTwoFactorToken(e.target.value.replace(/\D/g, "").slice(0, 6))
                      }
                      maxLength="6"
                      required
                      disabled={isLoading}
                      className="w-full pl-10 pr-3 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#028090]/20 focus:border-[#028090]/50 text-center tracking-widest"
                    />
                  </div>
                  <p className="text-xs text-slate-500 mt-2 text-center">
                    Enter the code from your authenticator app
                  </p>
                </div>
              )}

              {!requires2FA && (
                <div className="flex items-center">
                  <input
                    id="remember-me"
                    name="remember-me"
                    type="checkbox"
                    className="h-4 w-4 text-[#028090] focus:ring-[#028090] border-slate-300 rounded"
                    disabled={isLoading}
                  />
                  <label htmlFor="remember-me" className="ml-2 text-sm text-slate-700">
                    Remember me
                  </label>
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
                        {requires2FA ? "Verifying..." : "Signing in..."}
                      </>
                    ) : (
                      <>
                        {requires2FA ? <KeyRound className="w-5 h-5 mr-2" /> : <LogIn className="w-5 h-5 mr-2" />}
                        {requires2FA ? "Verify & Sign In" : "Sign in"}
                      </>
                    )}
                  </div>
                </GradientButton>
              </div>

              {requires2FA && (
                <div className="text-center">
                  <button
                    type="button"
                    onClick={resetForm}
                    disabled={isLoading}
                    className="text-[#028090] hover:underline font-medium text-sm"
                  >
                    ← Back to email login
                  </button>
                </div>
              )}

              {!requires2FA && (
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

            {!requires2FA && (
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
