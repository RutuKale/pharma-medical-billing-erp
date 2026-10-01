import React, { useState, useEffect } from "react";
import {
  Pill,
  ShieldCheck,
  Mail,
  Lock,
  KeyRound,
  Eye,
  EyeOff,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  Sparkles,
} from "lucide-react";
import { FcGoogle } from "react-icons/fc";
import { useAuth } from "../../context/AuthContext";
import { Navigate } from "react-router-dom";
import ButtonLoader from "../../components/ButtonLoader";
import apiClient from "../../utils/apiClient";

const Login = () => {
  const { user, loginWithGoogle, loginWithEmail, registerWithEmail } = useAuth();

  // Mode: 'otp' | 'password'
  const [authMode, setAuthMode] = useState("otp");
  const [isLogin, setIsLogin] = useState(true); // for password mode

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // Countdown timer for OTP resend
  useEffect(() => {
    let timer;
    if (resendTimer > 0) {
      timer = setTimeout(() => setResendTimer((prev) => prev - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [resendTimer]);

  // Check if authenticated
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
  if (user || token) {
    return <Navigate to="/" replace />;
  }

  // Handle Send OTP
  const sendOtp = async () => {
    setError("");
    setSuccessMsg("");

    if (!email || !email.includes("@")) {
      setError("Please enter a valid email address");
      return;
    }

    try {
      setLoading(true);
      const res = await apiClient.post("/auth/send-otp", {
        email: email.trim().toLowerCase(),
      });

      const data = res.data;

      if (data.success) {
        setOtpSent(true);
        if (data.devOtp) {
          setSuccessMsg(`Firebase verification code is: ${data.devOtp}`);
          setOtp(data.devOtp);
        } else {
          setSuccessMsg(`Verification code sent for ${email}`);
        }
        setResendTimer(60);
      } else {
        setError(data.message || "Failed to generate verification code");
      }
    } catch (err) {
      setError(err?.response?.data?.message || "Unable to generate verification code. Please check your connection.");
    } finally {
      setLoading(false);
    }
  };

  // Handle OTP Submit
  const handleOtpSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccessMsg("");

    if (!otp || otp.trim().length < 4) {
      setError("Please enter the complete 6-digit verification code");
      return;
    }

    try {
      setLoading(true);
      const res = await apiClient.post("/auth/verify-otp", {
        email: email.trim().toLowerCase(),
        otp: otp.trim(),
      });

      const data = res.data;
      if (!data.success) {
        setError(data.message || "Invalid or expired verification code");
        setLoading(false);
        return;
      }

      localStorage.setItem("token", data.token);
      window.location.href = "/";
    } catch (err) {
      setError(err?.response?.data?.message || "Verification failed. Please check the code and try again.");
      setLoading(false);
    }
  };


  // Handle Password Submit (Email + Password)
  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccessMsg("");

    if (!email || !password) {
      setError("Please provide both email and password");
      return;
    }

    setLoading(true);
    try {
      let result;
      if (isLogin) {
        result = await loginWithEmail(email.trim(), password);
      } else {
        result = await registerWithEmail(email.trim(), password);
      }

      if (!result.success) {
        setError(result.message || "Authentication failed");
        setLoading(false);
        return;
      }
    } catch (err) {
      setError(err.message || "An unexpected error occurred");
      setLoading(false);
    }
  };

  // Google Login
  const handleGoogleLogin = async () => {
    setError("");
    setSuccessMsg("");
    setLoading(true);
    try {
      const result = await loginWithGoogle();
      if (!result.success) {
        setError(result.message || "Google sign-in was canceled or failed");
      }
    } catch (err) {
      setError("Google authentication error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center p-4 sm:p-6 lg:p-8">
      {/* Background Decorative Circles */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 overflow-hidden pointer-events-none -z-10">
        <div className="absolute top-10 left-1/4 w-80 h-80 bg-blue-500/5 rounded-full blur-3xl" />
        <div className="absolute top-20 right-1/4 w-80 h-80 bg-indigo-500/5 rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-md space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center">
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-indigo-400 rounded-2xl blur-md opacity-60 group-hover:opacity-100 transition-opacity" />
              <div className="relative bg-gradient-to-br from-blue-500 to-indigo-600 p-3 rounded-2xl shadow-md text-white">
                <Pill size={28} className="stroke-[2.5]" />
              </div>
            </div>
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              PharmaMed <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">ERP</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1">
              Pharmacy Billing & Inventory Management System
            </p>
          </div>
        </div>

        {/* Main Card */}
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs hover:shadow-sm transition-all p-6 sm:p-8 space-y-5">
          {/* Card Title */}
          <div className="border-b border-slate-100 pb-4">
            <h2 className="text-lg font-bold text-slate-900">
              {authMode === "password" && !isLogin ? "Register Account" : "Sign In to Portal"}
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              {authMode === "otp"
                ? "Enter your registered email to receive a login verification code."
                : isLogin
                ? "Enter your pharmacy account credentials to continue."
                : "Create new administrative credentials for the pharmacy portal."}
            </p>
          </div>

          {/* Authentication Method Tabs */}
          <div className="flex p-1 bg-slate-100 rounded-xl border border-slate-200/80">
            <button
              type="button"
              onClick={() => {
                setAuthMode("otp");
                setError("");
                setSuccessMsg("");
              }}
              className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                authMode === "otp"
                  ? "bg-white text-blue-600 shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <KeyRound size={14} />
              <span>Email OTP</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setAuthMode("password");
                setError("");
                setSuccessMsg("");
              }}
              className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                authMode === "password"
                  ? "bg-white text-blue-600 shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <Lock size={14} />
              <span>Email & Password</span>
            </button>
          </div>

          {/* Feedback Messages */}
          {error && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-2.5 font-medium animate-in fade-in duration-200">
              <AlertCircle size={16} className="text-rose-500 shrink-0 mt-0.5" />
              <span className="flex-1">{error}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs flex items-start gap-2.5 font-medium animate-in fade-in duration-200">
              <CheckCircle2 size={16} className="text-emerald-500 shrink-0 mt-0.5" />
              <span className="flex-1">{successMsg}</span>
            </div>
          )}

          {/* 1. OTP AUTHENTICATION */}
          {authMode === "otp" && (
            <form
              onSubmit={otpSent ? handleOtpSubmit : (e) => { e.preventDefault(); sendOtp(); }}
              className="space-y-4"
            >
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-semibold text-slate-700">
                    Email Address <span className="text-blue-500 font-bold">*</span>
                  </label>
                  {otpSent && (
                    <button
                      type="button"
                      onClick={() => {
                        setOtpSent(false);
                        setOtp("");
                        setSuccessMsg("");
                      }}
                      className="text-xs text-blue-600 hover:text-blue-700 font-semibold cursor-pointer"
                    >
                      Change Email
                    </button>
                  )}
                </div>
                <div className="relative">
                  <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                    <Mail size={16} />
                  </div>
                  <input
                    type="email"
                    disabled={otpSent || loading}
                    placeholder="pharmacist@hospital.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full bg-slate-50/80 disabled:bg-slate-100 disabled:text-slate-500 border border-slate-200 hover:border-slate-300 rounded-xl pl-10 pr-3.5 py-2.5 text-sm text-slate-900 placeholder-slate-400 outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  />
                </div>
              </div>

              {otpSent && (
                <div className="space-y-1.5 pt-1">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-semibold text-slate-700">
                      6-Digit Verification Code <span className="text-blue-500 font-bold">*</span>
                    </label>
                    {resendTimer > 0 ? (
                      <span className="text-[11px] text-slate-400 font-medium">
                        Resend in {resendTimer}s
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={sendOtp}
                        disabled={loading}
                        className="text-xs text-blue-600 hover:text-blue-700 font-semibold cursor-pointer disabled:opacity-50"
                      >
                        Resend Code
                      </button>
                    )}
                  </div>
                  <div className="relative">
                    <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                      <KeyRound size={16} />
                    </div>
                    <input
                      type="text"
                      maxLength={6}
                      placeholder="• • • • • •"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                      autoFocus
                      required
                      className="w-full bg-slate-50/80 border border-slate-200 hover:border-slate-300 rounded-xl pl-10 pr-3.5 py-2.5 text-base font-semibold tracking-widest text-slate-900 placeholder:font-normal placeholder:tracking-normal placeholder-slate-400 outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-center"
                    />
                  </div>
                </div>
              )}

              {!otpSent ? (
                <button
                  type="button"
                  onClick={sendOtp}
                  disabled={!email || loading}
                  className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-semibold shadow-xs transition-colors cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <ButtonLoader text="Sending Code..." />
                  ) : (
                    <>
                      <span>Send Login Code</span>
                      <ArrowRight size={16} />
                    </>
                  )}
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={loading || otp.length < 4}
                  className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-semibold shadow-xs transition-colors cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <ButtonLoader text="Verifying Code..." />
                  ) : (
                    <>
                      <span>Verify & Sign In</span>
                      <ArrowRight size={16} />
                    </>
                  )}
                </button>
              )}
            </form>
          )}

          {/* 2. PASSWORD AUTHENTICATION */}
          {authMode === "password" && (
            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Email Address <span className="text-blue-500 font-bold">*</span>
                </label>
                <div className="relative">
                  <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                    <Mail size={16} />
                  </div>
                  <input
                    type="email"
                    placeholder="admin@pharmamed.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full bg-slate-50/80 border border-slate-200 hover:border-slate-300 rounded-xl pl-10 pr-3.5 py-2.5 text-sm text-slate-900 placeholder-slate-400 outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Password <span className="text-blue-500 font-bold">*</span>
                </label>
                <div className="relative">
                  <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                    <Lock size={16} />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full bg-slate-50/80 border border-slate-200 hover:border-slate-300 rounded-xl pl-10 pr-10 py-2.5 text-sm text-slate-900 placeholder-slate-400 outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors p-0.5 cursor-pointer"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-semibold shadow-xs transition-colors cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <ButtonLoader text={isLogin ? "Signing In..." : "Creating Account..."} />
                ) : (
                  <>
                    <span>{isLogin ? "Sign In" : "Register Account"}</span>
                    <ArrowRight size={16} />
                  </>
                )}
              </button>

              <div className="text-center pt-1">
                <span className="text-xs text-slate-500">
                  {isLogin ? "Need a new staff account?" : "Already registered?"}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setIsLogin(!isLogin);
                    setError("");
                    setSuccessMsg("");
                  }}
                  className="ml-1.5 text-xs text-blue-600 hover:text-blue-700 font-semibold cursor-pointer"
                >
                  {isLogin ? "Create account" : "Sign in here"}
                </button>
              </div>
            </form>
          )}

          {/* Divider */}
          <div className="relative flex items-center justify-center pt-1">
            <div className="border-t border-slate-200 w-full" />
            <span className="bg-white px-3 text-xs text-slate-400 font-medium uppercase tracking-wider absolute">
              or
            </span>
          </div>

          {/* Google Workspace Button */}
          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={loading}
            className="w-full inline-flex items-center justify-center gap-2.5 px-4 py-2.5 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 rounded-xl text-sm font-semibold shadow-xs transition-colors cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
          >
            <FcGoogle size={18} />
            <span>Continue with Google</span>
          </button>
        </div>

        {/* System & Security Footer */}
        <div className="text-center space-y-1">
          <div className="inline-flex items-center gap-1.5 text-xs text-slate-500 font-medium">
            <ShieldCheck size={14} className="text-emerald-600" />
            <span>Secured with 256-bit SSL • HIPAA Compliant</span>
          </div>
          <p className="text-[11px] text-slate-400">
            PharmaMed Enterprise v2.4.0 • Authorized Pharmacy Personnel Only
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
