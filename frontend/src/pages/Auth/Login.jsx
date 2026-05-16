import React, { useState, useEffect } from "react";
import {
  Pill,
  ShieldCheck,
  Mail,
  Lock,
  Heart,
  Activity,
  Stethoscope,
  Syringe,
  Calendar,
  Clock,
  Fingerprint,
  Smartphone,
  CheckCircle2,
  ArrowRight,
  Building2,
  Users,
  Award,
  Star,
  Hospital,
  ClipboardCheck,
  TrendingUp,
} from "lucide-react";
import { FcGoogle } from "react-icons/fc";
import { useAuth } from "../../context/AuthContext";
import { Navigate } from "react-router-dom";

const Login = () => {
  const { user, loginWithGoogle, loginWithEmail, registerWithEmail } = useAuth();

  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [currentTime, setCurrentTime] = useState("");
  const [currentDate, setCurrentDate] = useState("");
  const [activeStat, setActiveStat] = useState(0);

  // Medical quotes rotation
  const medicalQuotes = [
    {
      quote: "Precision medicine starts with intelligent pharmacy management.",
      author: "Dr. Sarah Chen",
      role: "Chief Medical Officer",
    },
    {
      quote: "Every prescription tells a story of patient care and trust.",
      author: "Dr. James Rodriguez",
      role: "Director of Pharmacy",
    },
    {
      quote: "Innovation in pharmaceuticals saves lives and transforms futures.",
      author: "Dr. Emily Watson",
      role: "Head of Research",
    },
  ];
  const [quoteIndex, setQuoteIndex] = useState(0);

  // Stats for left panel
  const stats = [
    { icon: Hospital, label: "500+ Hospitals", color: "text-indigo-400" },
    { icon: Users, label: "50K+ Healthcare Pros", color: "text-teal-400" },
    { icon: ClipboardCheck, label: "1M+ Prescriptions", color: "text-cyan-400" },
    { icon: Award, label: "99.9% Accuracy", color: "text-green-400" },
  ];

  // Features list
  const features = [
    "Real-time inventory tracking",
    "Automated prescription verification",
    "Multi-currency billing system",
    "Advanced analytics dashboard",
    "Multi-location management",
    "Secure patient records",
  ];

  useEffect(() => {
    // Update time and date
    const updateDateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })
      );
      setCurrentDate(
        now.toLocaleDateString("en-US", {
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric",
        })
      );
    };
    updateDateTime();
    const interval = setInterval(updateDateTime, 60000);

    // Rotate quotes
    const quoteInterval = setInterval(() => {
      setQuoteIndex((prev) => (prev + 1) % medicalQuotes.length);
    }, 8000);

    // Rotate stats
    const statInterval = setInterval(() => {
      setActiveStat((prev) => (prev + 1) % stats.length);
    }, 3000);

    return () => {
      clearInterval(interval);
      clearInterval(quoteInterval);
      clearInterval(statInterval);
    };
  }, []);

  if (user) {
    return <Navigate to="/" replace />;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    let result;
    if (isLogin) {
      result = await loginWithEmail(email, password);
    } else {
      result = await registerWithEmail(email, password);
    }
    if (!result.success) {
      setError(result.message);
    }
    setLoading(false);
  };

  return (
    <div className="h-screen flex bg-gradient-to-br from-slate-900 via-teal-950 to-slate-900 overflow-hidden">
      {/* Left Panel - Branding & Information */}
      <div className="hidden lg:flex lg:w-1/2 xl:w-3/5 relative overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0">
          <div className="absolute top-0 -left-4 w-96 h-96 bg-teal-500/20 rounded-full mix-blend-screen filter blur-[100px] animate-blob"></div>
          <div className="absolute top-0 -right-4 w-96 h-96 bg-indigo-500/20 rounded-full mix-blend-screen filter blur-[100px] animate-blob animation-delay-2000"></div>
          <div className="absolute -bottom-8 left-20 w-96 h-96 bg-cyan-500/20 rounded-full mix-blend-screen filter blur-[100px] animate-blob animation-delay-4000"></div>
          
          {/* Grid Pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="h-full w-full bg-[linear-gradient(rgba(20,184,166,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(20,184,166,0.1)_1px,transparent_1px)] bg-[size:64px_64px]"></div>
          </div>
        </div>

        {/* Content */}
        <div className="relative z-10 flex flex-col justify-between p-6 lg:p-8 xl:p-12 w-full h-full">
          {/* Top Section */}
          <div className="flex-1 flex flex-col justify-center">
            {/* Logo */}
            <div className="flex items-center gap-3 mb-6">
              <div className="relative group flex-shrink-0">
                <div className="absolute inset-0 bg-gradient-to-r from-teal-400 to-indigo-400 rounded-xl blur-lg opacity-75 group-hover:opacity-100 transition-opacity"></div>
                <div className="relative bg-gradient-to-br from-teal-500 to-indigo-600 p-2.5 rounded-xl shadow-xl">
                  <Pill size={20} className="text-white" />
                </div>
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">PharmaMed</h1>
                <p className="text-teal-300 text-xs tracking-wider">ERP SYSTEM</p>
              </div>
            </div>

            {/* Main Heading */}
            <div>
              <h2 className="text-2xl xl:text-3xl font-bold text-white leading-tight">
                Transform Your
                <span className="block mt-1 bg-gradient-to-r from-teal-400 to-indigo-400 bg-clip-text text-transparent">
                  Pharmacy Operations
                </span>
              </h2>
              <p className="mt-2 text-teal-100/80 text-sm leading-relaxed max-w-lg">
                Streamline inventory, automate billing, and deliver exceptional patient care 
                with our intelligent pharmacy management platform.
              </p>
            </div>

            {/* Features Grid */}
            <div className="mt-6 grid grid-cols-2 gap-2 max-w-lg">
              {features.map((feature, index) => (
                <div
                  key={index}
                  className="flex items-center gap-2 text-teal-100/90 group hover:text-white transition-colors"
                >
                  <CheckCircle2 size={16} className="text-indigo-400 flex-shrink-0" />
                  <span className="text-xs xl:text-sm">{feature}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Bottom Section */}
          <div className="flex-shrink-0">
            {/* Testimonial */}
            <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-4 max-w-xl">
              <div className="flex items-start gap-1 text-yellow-400 mb-3">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={12} fill="currentColor" />
                ))}
              </div>
              <p className="text-white/90 text-sm italic leading-relaxed">
                "{medicalQuotes[quoteIndex].quote}"
              </p>
              <div className="mt-3 flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-teal-400 to-indigo-500 flex items-center justify-center text-white font-bold text-xs">
                  {medicalQuotes[quoteIndex].author
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </div>
                <div>
                  <p className="text-white font-medium text-xs">
                    {medicalQuotes[quoteIndex].author}
                  </p>
                  <p className="text-teal-300 text-xs">
                    {medicalQuotes[quoteIndex].role}
                  </p>
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="mt-4 grid grid-cols-4 gap-3 max-w-lg">
              {stats.map((stat, index) => (
                <div
                  key={index}
                  className={`text-center transition-all duration-500 ${
                    index === activeStat ? "scale-110" : "opacity-60"
                  }`}
                >
                  <stat.icon
                    size={20}
                    className={`mx-auto ${stat.color} transition-colors`}
                  />
                  <p className="text-white font-bold text-xs mt-1">{stat.label}</p>
                </div>
              ))}
            </div>

            {/* Time Display */}
            <div className="mt-4 flex items-center gap-4 text-white/60 text-xs">
              <div className="flex items-center gap-1.5">
                <Clock size={12} />
                <span>{currentTime}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Calendar size={12} />
                <span>{currentDate}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel - Login Form */}
      <div className="w-full lg:w-1/2 xl:w-2/5 flex items-center justify-center p-4 sm:p-6 lg:p-8">
        <div className="w-full max-w-sm">
          {/* Mobile Logo (Visible only on small screens) */}
          <div className="lg:hidden text-center mb-6">
            <div className="inline-flex items-center gap-2">
              <div className="bg-gradient-to-br from-teal-500 to-indigo-600 p-2.5 rounded-xl">
                <Pill size={20} className="text-white" />
              </div>
              <h1 className="text-xl font-bold text-white">PharmaMed ERP</h1>
            </div>
          </div>

          {/* Login Card */}
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl shadow-2xl p-6">
            {/* Header */}
            <div className="text-center mb-5">
              <h2 className="text-xl font-bold text-white">
                {isLogin ? "Welcome Back" : "Create Account"}
              </h2>
              <p className="text-teal-200/80 text-xs mt-1">
                {isLogin
                  ? "Access your pharmacy dashboard"
                  : "Start managing your pharmacy smarter"}
              </p>
            </div>

            {/* Security Badge */}
            <div className="bg-indigo-500/10 border border-indigo-500/30 rounded-lg p-2.5 mb-4 flex items-center gap-2">
              <div className="bg-indigo-500/20 p-1.5 rounded-lg flex-shrink-0">
                <ShieldCheck size={16} className="text-indigo-400" />
              </div>
              <div>
                <p className="text-white text-xs font-medium">
                  Enterprise-Grade Security
                </p>
                <p className="text-indigo-300/70 text-xs">
                  HIPAA & GDPR Compliant
                </p>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="block text-teal-200 text-xs mb-1.5 ml-1">
                  Email Address
                </label>
                <div className="relative group">
                  <Mail
                    size={16}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-teal-400 transition-colors"
                  />
                  <input
                    type="email"
                    placeholder="professional@pharmacy.com"
                    className="w-full pl-10 pr-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-sm placeholder-slate-400 outline-none transition-all duration-300 focus:border-teal-400/50 focus:bg-white/10 focus:shadow-lg"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-teal-200 text-xs mb-1.5 ml-1">
                  Password
                </label>
                <div className="relative group">
                  <Lock
                    size={16}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-teal-400 transition-colors"
                  />
                  <input
                    type="password"
                    placeholder="Enter your password"
                    className="w-full pl-10 pr-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-sm placeholder-slate-400 outline-none transition-all duration-300 focus:border-teal-400/50 focus:bg-white/10 focus:shadow-lg"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
              </div>

              {error && (
                <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-2.5">
                  <p className="text-red-300 text-xs flex items-center gap-1.5">
                    <span>⚠️</span> {error}
                  </p>
                </div>
              )}

              {isLogin && (
                <div className="flex justify-end">
                  <button
                    type="button"
                    className="text-teal-400 text-xs hover:text-teal-300 transition-colors"
                  >
                    Forgot password?
                  </button>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-teal-500 to-indigo-500 hover:from-teal-600 hover:to-indigo-600 text-white py-2.5 rounded-xl text-sm font-medium transition-all duration-300 flex items-center justify-center gap-1.5 group disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <>
                    {isLogin ? "Sign In" : "Create Account"}
                    <ArrowRight
                      size={16}
                      className="group-hover:translate-x-1 transition-transform"
                    />
                  </>
                )}
              </button>
            </form>

            {/* Divider */}
            <div className="flex items-center gap-3 my-4">
              <div className="h-px bg-white/20 flex-1"></div>
              <span className="text-slate-400 text-xs">or</span>
              <div className="h-px bg-white/20 flex-1"></div>
            </div>

            {/* Google Login */}
            <button
              onClick={loginWithGoogle}
              className="w-full bg-white/5 border border-white/10 hover:border-teal-400/50 hover:bg-white/10 text-white py-2.5 rounded-xl text-sm font-medium flex items-center justify-center gap-2 transition-all duration-300"
            >
              <FcGoogle size={18} />
              Google Workspace
            </button>

            {/* Switch Mode */}
            <div className="text-center mt-4">
              <span className="text-slate-400 text-xs">
                {isLogin ? "New to PharmaMed?" : "Already have an account?"}
              </span>
              <button
                onClick={() => setIsLogin(!isLogin)}
                className="text-teal-400 hover:text-teal-300 ml-1.5 text-xs font-medium transition-colors"
              >
                {isLogin ? "Create account" : "Sign in"}
              </button>
            </div>
          </div>

          {/* Trust Badge */}
          <div className="mt-4 text-center">
            <div className="inline-flex items-center gap-1.5 bg-white/5 backdrop-blur-sm rounded-full px-3 py-1.5 border border-white/10">
              <div className="relative flex h-1.5 w-1.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-indigo-500"></span>
              </div>
              <span className="text-slate-300 text-xs">
                Trusted by 500+ Medical Institutions
              </span>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes blob {
          0%, 100% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </div>
  );
};

export default Login;