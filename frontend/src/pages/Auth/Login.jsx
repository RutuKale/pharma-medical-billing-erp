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
  Phone,
  Smartphone,
} from "lucide-react";
import { FcGoogle } from "react-icons/fc";
import { RecaptchaVerifier, signInWithPhoneNumber } from "firebase/auth";
import { auth } from "../../firebase/firebase";
import { useAuth } from "../../context/AuthContext";
import { Navigate } from "react-router-dom";
import ButtonLoader from "../../components/ButtonLoader";
import apiClient from "../../utils/apiClient";

const Login = () => {
  const { user, loginWithGoogle, loginWithEmail, registerWithEmail } = useAuth();

  // Mode: 'mobile-otp' | 'password' | 'email-otp'
  const [authMode, setAuthMode] = useState("mobile-otp");
  const [isLogin, setIsLogin] = useState(true); // for password mode

  // Mobile Auth State
  const [countryCode, setCountryCode] = useState("+91");
  const [mobile, setMobile] = useState("");
  const [mobileOtp, setMobileOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);
  const [confirmationResult, setConfirmationResult] = useState(null);
  const [devCode, setDevCode] = useState("");

  // Email / Password Fallback State
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [emailOtp, setEmailOtp] = useState("");

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

  // Cleanup recaptcha on unmount
  useEffect(() => {
    return () => {
      if (window.recaptchaVerifier) {
        try {
          window.recaptchaVerifier.clear();
        } catch (e) {}
        window.recaptchaVerifier = null;
      }
    };
  }, []);

  // Check if authenticated
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
  if (user || token) {
    return <Navigate to="/" replace />;
  }

  // Setup invisible reCAPTCHA verifier for Firebase Phone Auth
  const setupRecaptcha = () => {
    try {
      if (window.recaptchaVerifier) {
        try {
          window.recaptchaVerifier.clear();
        } catch (e) {}
        window.recaptchaVerifier = null;
      }
      window.recaptchaVerifier = new RecaptchaVerifier(auth, "recaptcha-container", {
        size: "invisible",
        callback: () => {
          // reCAPTCHA solved
        },
        "expired-callback": () => {
          if (window.recaptchaVerifier) {
            try {
              window.recaptchaVerifier.clear();
            } catch (e) {}
            window.recaptchaVerifier = null;
          }
        },
      });
      return window.recaptchaVerifier;
    } catch (e) {
      console.warn("Recaptcha verifier note:", e);
      return null;
    }
  };

  // Handle Send Mobile OTP (Sends real SMS to the phone number without exposing OTP)
  const sendMobileOtp = async () => {
    setError("");
    setSuccessMsg("");
    setDevCode("");

    const cleanMobile = mobile.replace(/\D/g, "");
    if (!cleanMobile || cleanMobile.length < 10) {
      setError("Please enter a valid 10-digit mobile number");
      return;
    }

    const fullPhoneNumber = `${countryCode}${cleanMobile.slice(-10)}`;
    setLoading(true);

    try {
      let sentViaFirebase = false;
      const appVerifier = setupRecaptcha();

      // 1. Primary: Dispatch real SMS using Firebase Phone Authentication
      if (appVerifier) {
        try {
          const confirmation = await signInWithPhoneNumber(auth, fullPhoneNumber, appVerifier);
          setConfirmationResult(confirmation);
          sentViaFirebase = true;
          setOtpSent(true);
          setDevCode("");
          setMobileOtp(""); // Keep OTP input empty so user enters code from their phone SMS
          setSuccessMsg(`Verification code sent via SMS to ${countryCode} ${cleanMobile}. Please check your phone.`);
          setResendTimer(60);
        } catch (fbErr) {
          console.warn("Firebase Phone Auth note:", fbErr);
          if (window.recaptchaVerifier) {
            try {
              window.recaptchaVerifier.clear();
            } catch (e) {}
            window.recaptchaVerifier = null;
          }
        }
      }

      // 2. Secondary fallback via SMS Gateway / API Client
      if (!sentViaFirebase) {
        const res = await apiClient.post("/auth/send-mobile-otp", {
          mobile: cleanMobile,
          countryCode,
        });

        const data = res.data;
        if (data.success) {
          setConfirmationResult(null);
          setOtpSent(true);
          setMobileOtp(""); // Keep OTP input blank
          if (data.realSmsSent) {
            setDevCode("");
            setSuccessMsg(`Verification code sent via SMS to ${countryCode} ${cleanMobile}. Check your phone.`);
          } else {
            setDevCode(data.devOtp || "");
            setSuccessMsg(`Verification code generated for ${countryCode} ${cleanMobile}.`);
          }
          setResendTimer(60);
        } else {
          setError(data.message || "Failed to send SMS verification code");
        }
      }
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Unable to send SMS code. Please check your mobile number and connection."
      );
    } finally {
      setLoading(false);
    }
  };

  // Handle Mobile OTP Verification
  const handleMobileOtpSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccessMsg("");

    const cleanMobile = mobile.replace(/\D/g, "");
    if (!cleanMobile || cleanMobile.length < 10) {
      setError("Please enter a valid 10-digit mobile number");
      return;
    }

    if (!mobileOtp || mobileOtp.trim().length !== 6) {
      setError("Please enter the complete 6-digit verification code");
      return;
    }

    setLoading(true);

    try {
      // 1. Verify via Firebase Phone Auth confirmation result
      if (confirmationResult) {
        const credential = await confirmationResult.confirm(mobileOtp.trim());
        const fbUser = credential.user;
        const idToken = await fbUser.getIdToken();

        localStorage.setItem("token", idToken);
        localStorage.setItem(
          "pharma_user",
          JSON.stringify({
            uid: fbUser.uid,
            phoneNumber: fbUser.phoneNumber || `${countryCode}${cleanMobile.slice(-10)}`,
            displayName: fbUser.displayName || `Pharmacist (${cleanMobile.slice(-4)})`,
            role: "Pharmacist",
          })
        );

        setSuccessMsg("Verification successful! Logging in...");
        setTimeout(() => {
          window.location.href = "/";
        }, 500);
        return;
      }

      // 2. Fallback verification via API client
      const res = await apiClient.post("/auth/verify-mobile-otp", {
        mobile: cleanMobile,
        otp: mobileOtp.trim(),
        countryCode,
      });

      const data = res.data;
      if (!data.success) {
        setError(data.message || "Invalid or expired verification code");
        setLoading(false);
        return;
      }

      if (data.token) {
        localStorage.setItem("token", data.token);
      }
      if (data.user) {
        localStorage.setItem("pharma_user", JSON.stringify(data.user));
      }

      setSuccessMsg("Verification successful! Logging in...");
      setTimeout(() => {
        window.location.href = "/";
      }, 500);
    } catch (err) {
      setError(
        err?.code === "auth/invalid-verification-code"
          ? "Invalid verification code. Please check your SMS and try again."
          : err?.response?.data?.message ||
              err?.message ||
              "Verification failed. Please check the code and try again."
      );
      setLoading(false);
    }
  };

  // Fallback: Send Email OTP
  const sendEmailOtp = async () => {
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
        setEmailOtp("");
        setSuccessMsg(`Verification code sent to ${email}`);
        setResendTimer(60);
      } else {
        setError(data.message || "Failed to generate verification code");
      }
    } catch (err) {
      setError(err?.response?.data?.message || "Unable to generate verification code.");
    } finally {
      setLoading(false);
    }
  };

  // Fallback: Handle Email OTP Submit
  const handleEmailOtpSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccessMsg("");

    if (!emailOtp || emailOtp.trim().length < 4) {
      setError("Please enter the complete verification code");
      return;
    }

    try {
      setLoading(true);
      const res = await apiClient.post("/auth/verify-otp", {
        email: email.trim().toLowerCase(),
        otp: emailOtp.trim(),
      });
      const data = res.data;
      if (!data.success) {
        setError(data.message || "Invalid verification code");
        setLoading(false);
        return;
      }
      localStorage.setItem("token", data.token);
      window.location.href = "/";
    } catch (err) {
      setError(err?.response?.data?.message || "Verification failed.");
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
              {authMode === "password" && !isLogin
                ? "Register Account"
                : "Sign In to Portal"}
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              {authMode === "mobile-otp"
                ? "Enter your registered mobile number to receive an SMS verification code."
                : authMode === "email-otp"
                ? "Enter your registered email address to receive a verification code."
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
                setAuthMode("mobile-otp");
                setOtpSent(false);
                setMobileOtp("");
                setDevCode("");
                setError("");
                setSuccessMsg("");
              }}
              className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                authMode === "mobile-otp"
                  ? "bg-white text-blue-600 shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <Phone size={14} />
              <span>Mobile OTP</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setAuthMode("password");
                setDevCode("");
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

          {/* 1. MOBILE NUMBER OTP AUTHENTICATION */}
          {authMode === "mobile-otp" && (
            <form
              onSubmit={otpSent ? handleMobileOtpSubmit : (e) => { e.preventDefault(); sendMobileOtp(); }}
              className="space-y-4"
            >
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-semibold text-slate-700">
                    Mobile Number <span className="text-blue-500 font-bold">*</span>
                  </label>
                  {otpSent && (
                    <button
                      type="button"
                      onClick={() => {
                        setOtpSent(false);
                        setMobileOtp("");
                        setDevCode("");
                        setSuccessMsg("");
                      }}
                      className="text-xs text-blue-600 hover:text-blue-700 font-semibold cursor-pointer"
                    >
                      Change Number
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  {/* Country Code Selector */}
                  <div className="relative w-28 shrink-0">
                    <select
                      value={countryCode}
                      disabled={otpSent || loading}
                      onChange={(e) => setCountryCode(e.target.value)}
                      className="w-full bg-slate-50/80 disabled:bg-slate-100 disabled:text-slate-500 border border-slate-200 hover:border-slate-300 rounded-xl px-3 py-2.5 text-xs text-slate-900 font-bold outline-none focus:ring-2 focus:ring-blue-500 transition-all cursor-pointer"
                    >
                      <option value="+91">🇮🇳 +91 (IN)</option>
                      <option value="+1">🇺🇸 +1 (US)</option>
                      <option value="+44">🇬🇧 +44 (UK)</option>
                      <option value="+971">🇦🇪 +971 (AE)</option>
                      <option value="+65">🇸🇬 +65 (SG)</option>
                      <option value="+61">🇦🇺 +61 (AU)</option>
                    </select>
                  </div>

                  {/* 10-Digit Mobile Input */}
                  <div className="relative flex-1">
                    <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                      <Phone size={15} />
                    </div>
                    <input
                      type="tel"
                      maxLength={10}
                      disabled={otpSent || loading}
                      placeholder="9876543210"
                      value={mobile}
                      onChange={(e) => setMobile(e.target.value.replace(/\D/g, ""))}
                      required
                      className="w-full bg-slate-50/80 disabled:bg-slate-100 disabled:text-slate-500 border border-slate-200 hover:border-slate-300 rounded-xl pl-9 pr-3.5 py-2.5 text-sm font-semibold tracking-wider text-slate-900 placeholder:font-normal placeholder:tracking-normal placeholder-slate-400 outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    />
                  </div>
                </div>
                <p className="text-[11px] text-slate-400 mt-1">
                  Enter registered 10-digit mobile number without country code.
                </p>
              </div>

              {otpSent && (
                <div className="space-y-1.5 pt-1">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-semibold text-slate-700">
                      6-Digit SMS Verification Code <span className="text-blue-500 font-bold">*</span>
                    </label>
                    {resendTimer > 0 ? (
                      <span className="text-[11px] text-slate-400 font-medium">
                        Resend in {resendTimer}s
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={sendMobileOtp}
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
                      value={mobileOtp}
                      onChange={(e) => setMobileOtp(e.target.value.replace(/\D/g, ""))}
                      autoFocus
                      required
                      className="w-full bg-slate-50/80 border border-slate-200 hover:border-slate-300 rounded-xl pl-10 pr-3.5 py-2.5 text-base font-bold tracking-widest text-slate-900 placeholder:font-normal placeholder:tracking-normal placeholder-slate-400 outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-center"
                    />
                  </div>

                  {devCode && (
                    <div className="mt-2 p-3 rounded-xl bg-amber-50 border border-amber-200/90 text-amber-900 text-xs space-y-2 animate-in fade-in duration-200">
                      <div className="flex items-start gap-2">
                        <AlertCircle size={15} className="text-amber-600 shrink-0 mt-0.5" />
                        <div>
                          <p className="font-semibold text-amber-800">
                            Firebase Carrier SMS requires Blaze plan or Test Phone Number
                          </p>
                          <p className="text-[11px] text-amber-700 mt-0.5 leading-relaxed">
                            Google Firebase blocks carrier SMS on Spark (free) plan (<span className="font-mono text-[10px]">BILLING_NOT_ENABLED</span>). To test on free plan, add your number in{" "}
                            <span className="font-semibold">Firebase Console &gt; Authentication &gt; Sign-in method &gt; Phone &gt; Phone numbers for testing</span> (e.g. with code 123456) or upgrade to Blaze plan.
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center justify-between bg-white p-2 rounded-lg border border-amber-200 shadow-2xs">
                        <span className="text-xs font-mono font-bold text-slate-800">
                          Dev Test OTP: <span className="tracking-widest text-blue-600 font-extrabold">{devCode}</span>
                        </span>
                        <button
                          type="button"
                          onClick={() => setMobileOtp(devCode)}
                          className="text-[11px] font-semibold text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 px-2.5 py-1 rounded-md transition-colors cursor-pointer border border-blue-200"
                        >
                          Use Code
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Invisible Firebase Recaptcha Container */}
              <div id="recaptcha-container"></div>

              {!otpSent ? (
                <button
                  type="button"
                  onClick={sendMobileOtp}
                  disabled={!mobile || mobile.length < 10 || loading}
                  className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-semibold shadow-xs transition-colors cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <ButtonLoader text="Sending SMS OTP..." />
                  ) : (
                    <>
                      <span>Send OTP via SMS</span>
                      <ArrowRight size={16} />
                    </>
                  )}
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={loading || mobileOtp.length !== 6}
                  className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-semibold shadow-xs transition-colors cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <ButtonLoader text="Verifying Code..." />
                  ) : (
                    <>
                      <span>Verify OTP & Sign In</span>
                      <ArrowRight size={16} />
                    </>
                  )}
                </button>
              )}

              <div className="pt-2 text-center border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    setAuthMode("email-otp");
                    setOtpSent(false);
                    setError("");
                    setSuccessMsg("");
                  }}
                  className="text-xs text-slate-500 hover:text-blue-600 transition-colors"
                >
                  Prefer email verification? <span className="font-semibold text-blue-600">Sign in with Email OTP</span>
                </button>
              </div>
            </form>
          )}

          {/* 1.B EMAIL OTP FALLBACK */}
          {authMode === "email-otp" && (
            <form
              onSubmit={otpSent ? handleEmailOtpSubmit : (e) => { e.preventDefault(); sendEmailOtp(); }}
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
                        setEmailOtp("");
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
                      Verification Code <span className="text-blue-500 font-bold">*</span>
                    </label>
                    {resendTimer > 0 ? (
                      <span className="text-[11px] text-slate-400 font-medium">
                        Resend in {resendTimer}s
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={sendEmailOtp}
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
                      value={emailOtp}
                      onChange={(e) => setEmailOtp(e.target.value.replace(/\D/g, ""))}
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
                  onClick={sendEmailOtp}
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
                  disabled={loading || emailOtp.length < 4}
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

              <div className="pt-2 text-center border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    setAuthMode("mobile-otp");
                    setOtpSent(false);
                    setError("");
                    setSuccessMsg("");
                  }}
                  className="text-xs text-slate-500 hover:text-blue-600 transition-colors"
                >
                  Back to <span className="font-semibold text-blue-600">Mobile Number Login</span>
                </button>
              </div>
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
