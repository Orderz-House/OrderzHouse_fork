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
} from "lucide-react";
import loginImage from "../../assets/login.png";

const Login = () => {
  const dispatch = useDispatch();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const login = (e) => {
    e.preventDefault();
    setIsLoading(true);

    axios
      .post("http://localhost:5000/users/login", {
        email,
        password,
      })
      .then((res) => {
        dispatch(
          setLogin({
            token: res.data.token,
            userId: res.data.userId,
            roleId: res.data.role,
            is_verified: res.data.is_verified,
          })
        );
        setStatus(true);
        setMessage("Login successful!");
        setIsLoading(false);
        connectSocket(res.data.token, res.data.userId);
        navigate("/");
      })
      .catch((err) => {
        setStatus(false);
        setMessage(
          err.response?.data?.message ||
            "Login failed. Please check your credentials."
        );
        setIsLoading(false);
      });
  };

  return (
    <div className="min-h-screen bg-white relative overflow-hidden">
      {/* Decorative Waves Behind Container */}
      

      {/* Main Container */}
      <div className="flex min-h-screen items-center justify-center p-4 lg:px-8 xl:px-16">
        <div className="flex items-center justify-center max-w-7xl w-full">
          
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
                  
                  {/* Left Side - Image */}
                  <div className="flex-1 flex items-center justify-center">
                    <div className="w-full max-w-md md:max-w-lg lg:max-w-xl xl:max-w-2xl">
                      <img 
                        src={loginImage}
                        alt="Login Illustration"
                        className="w-full h-auto object-contain drop-shadow-xl rounded-2xl"
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.nextSibling.style.display = 'flex';
                        }}
                      />
                      <div className="hidden w-full h-48 lg:h-64 bg-gradient-to-br from-blue-100 via-teal-100 to-green-100 rounded-2xl flex-col items-center justify-center text-gray-500">
                        <div className="text-6xl mb-4">🔐</div>
                        <p className="text-xl font-serif text-center font-bold">Login Image</p>
                        <p className="text-sm text-center mt-2 px-4">Check your assets/login.png file path</p>
                      </div>
                    </div>
                  </div>

                  {/* Right Side - Form */}
                  <div className="flex-1 w-full">
                    <div className="text-center lg:text-left mb-6">
                      <h2 className="text-2xl lg:text-3xl font-medium text-gray-900 font-serif">
                        Sign in to your account
                      </h2>
                      <p className="text-gray-600 mt-2 font-serif text-base lg:text-lg">
                        Enter your credentials to access your dashboard
                      </p>
                    </div>

                    <div className="space-y-5">
                      {/* Email */}
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
                            className="pl-12 w-full px-5 py-3 lg:py-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-600 transition-all duration-300 bg-white font-serif text-base lg:text-lg"
                          />
                        </div>
                      </div>

                      {/* Password */}
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
                            className="pl-12 pr-12 w-full px-5 py-3 lg:py-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-600 transition-all duration-300 bg-white font-serif text-base lg:text-lg"
                          />
                          <button
                            type="button"
                            className="absolute inset-y-0 right-0 pr-4 flex items-center hover:text-teal-600 transition-colors"
                            onClick={() => setShowPassword(!showPassword)}
                          >
                            {showPassword ? <EyeOff className="h-6 w-6 text-gray-400 hover:text-teal-600" /> : <Eye className="h-6 w-6 text-gray-400 hover:text-teal-600" />}
                          </button>
                        </div>
                      </div>

                      {/* Remember Me */}
                      <div className="flex items-center">
                        <input id="remember-me" name="remember-me" type="checkbox" className="h-5 w-5 text-teal-600 focus:ring-teal-500 border-gray-300 rounded" />
                        <label htmlFor="remember-me" className="ml-3 block text-base lg:text-lg text-gray-700 font-serif">
                          Remember me
                        </label>
                      </div>

                      {/* Submit Button */}
                      <div>
                        <button
                          type="submit"
                          disabled={isLoading}
                          onClick={login}
                          className="w-full py-3 lg:py-4 px-6 bg-gradient-to-r from-blue-600 via-teal-600 to-green-500 text-white font-semibold rounded-xl hover:from-teal-600 hover:via-green-500 hover:to-green-400 transition-all duration-300 disabled:opacity-50 flex items-center justify-center hover:shadow-lg transform hover:-translate-y-0.5 relative overflow-hidden group font-serif text-base lg:text-lg"
                        >
                          <div className="absolute inset-0 bg-gradient-to-r from-teal-600 to-green-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                          <div className="relative z-10 flex items-center">
                            {isLoading ? (
                              <>
                                <svg className="animate-spin -ml-1 mr-3 h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Signing in...
                              </>
                            ) : (
                              <>
                                <LogIn className="w-6 h-6 mr-2" />
                                Sign in
                              </>
                            )}
                          </div>
                        </button>
                      </div>

                      {/* Divider */}
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
                          onSuccess={(credentialResponse) => {
                            const decoded = jwtDecode(credentialResponse.credential);
                            console.log("Google User:", decoded);

                            dispatch(
                              setLogin({
                                token: credentialResponse.credential,
                                userId: decoded.sub,
                                roleId: "2",
                              })
                            );

                            setStatus(true);
                            setMessage("Google login successful!");
                            connectSocket(credentialResponse.credential, decoded.sub);

                            setTimeout(() => {
                              navigate("/");
                            }, 1000);
                          }}
                          onError={() => {
                            setStatus(false);
                            setMessage("Google login failed. Please try again.");
                          }}
                          theme="filled_blue"
                          size="large"
                          shape="pill"
                          text="signin_with"
                        />
                      </div>
                    </div>

                    {/* Status Message */}
                    {message && (
                      <div className={`mt-6 p-4 rounded-xl flex items-start border backdrop-blur-sm ${status ? "bg-green-50 text-green-800 border-green-200" : "bg-red-50 text-red-800 border-red-200"}`}>
                        {status ? <CheckCircle className="w-6 h-6 mt-0.5 mr-3 text-green-500 flex-shrink-0" /> : <AlertCircle className="w-6 h-6 mt-0.5 mr-3 text-red-500 flex-shrink-0" />}
                        <p className="text-base font-serif">{message}</p>
                      </div>
                    )}

                    {/* Sign Up Link */}
                    <div className="mt-6 text-center pt-4 border-t border-gray-200">
                      <p className="text-base lg:text-lg text-gray-600 font-serif">
                        Don't have an account?{" "}
                        <a href="/register" className="font-semibold text-teal-600 hover:text-blue-600 inline-flex items-center transition-colors group font-serif">
                          Sign up now <ArrowRight className="ml-1 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                        </a>
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;