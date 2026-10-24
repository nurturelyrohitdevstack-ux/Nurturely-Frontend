"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaUser,
  FaEnvelope,
  FaLock,
  FaBuilding,
  FaPhone,
  FaArrowRight,
  FaEye,
  FaEyeSlash,
  FaCheckCircle,
  FaKey,
  FaSpinner,
  FaClock,
} from "react-icons/fa";
import { toast } from "sonner";
import api from "@/lib/apiInstance";
import useAuthStore from "@/store/authStore";
import Logo from "../Components/portal-ui/Logo";

export default function SignUpPage() {
  const router = useRouter();
  const login = useAuthStore((state) => state.login);

  // Form Fields
  const [formData, setFormData] = useState({
    fullName: "",
    companyName: "",
    email: "",
    phone: "",
    role: "admin",
    password: "",
  });

  // OTP State
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState("");
  const [emailVerified, setEmailVerified] = useState(false);
  const [verificationToken, setVerificationToken] = useState("");
  const [timer, setTimer] = useState(0);
  const [sendingOtp, setSendingOtp] = useState(false);
  const [verifyingOtp, setVerifyingOtp] = useState(false);

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  // 60-second cooldown timer for Resend OTP
  useEffect(() => {
    if (timer <= 0) return;
    const interval = setInterval(() => {
      setTimer((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [timer]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Step 1: Send OTP
  const handleSendOtp = async () => {
    if (!formData.email || !formData.email.includes("@")) {
      toast.error("Please enter a valid work email address first.");
      return;
    }

    setSendingOtp(true);
    try {
      const res = await api.post("/auth/send-otp", {
        email: formData.email.trim(),
        purpose: "register",
      });

      if (res.data?.success) {
        setOtpSent(true);
        setTimer(res.data.resendAfter || 60);
        toast.success(`Verification code dispatched to ${formData.email.trim()}`);
      }
    } catch (err) {
      toast.error(
        err.response?.data?.message || "Could not send verification code. Try again."
      );
    } finally {
      setSendingOtp(false);
    }
  };

  // Step 2: Verify OTP
  const handleVerifyOtp = async () => {
    if (!otp.trim() || otp.trim().length !== 6) {
      toast.error("Please enter the 6-digit verification code.");
      return;
    }

    setVerifyingOtp(true);
    try {
      const res = await api.post("/auth/verify-otp", {
        email: formData.email.trim(),
        otp: otp.trim(),
        purpose: "register",
      });

      if (res.data?.success) {
        setEmailVerified(true);
        setVerificationToken(res.data.verificationToken);
        toast.success("Email verified successfully! You can now finish creating your account.");
      }
    } catch (err) {
      toast.error(
        err.response?.data?.message || "Invalid or expired code. Please try again."
      );
    } finally {
      setVerifyingOtp(false);
    }
  };

  // Step 3: Complete Registration
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!emailVerified) {
      toast.error("Please verify your email via the 6-digit OTP code before proceeding.");
      return;
    }

    if (!formData.fullName.trim() || !formData.password) {
      toast.error("Please fill in your full name and password.");
      return;
    }

    if (formData.password.length < 6) {
      toast.error("Password must be at least 6 characters long.");
      return;
    }

    setLoading(true);
    try {
      const res = await api.post("/auth/register", {
        ...formData,
        verificationToken,
      });

      if (res.data?.success) {
        login({
          user: res.data.user,
          accessToken: res.data.accessToken,
        });
        toast.success(`Account created! Welcome to Nurturely, ${res.data.user.fullName}!`);
        router.replace("/dashboard");
      }
    } catch (err) {
      toast.error(
        err.response?.data?.message || "Registration failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-emerald-50/30 to-slate-100 flex items-center justify-center p-4 sm:p-6 py-10">
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="w-full max-w-lg"
      >
        <div className="academy-card p-6 sm:p-8 bg-white/95 backdrop-blur-md">
          {/* Logo Brand Header */}
          <div className="flex flex-col items-center text-center mb-6">
            <Logo className="h-11 w-11" textClassName="text-2xl" />
            <h1 className="mt-4 text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              Create Your Nurturely Account
            </h1>
            <p className="mt-1 text-xs sm:text-sm text-slate-500">
              Verified email registration with multi-device session management.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* 1. Email Address & Send OTP Verification */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Work Email <span className="text-emerald-700">*</span>
                </label>
                {emailVerified && (
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                    <FaCheckCircle className="text-xs" />
                    Email Verified
                  </span>
                )}
              </div>

              <div className="relative flex items-center">
                <FaEnvelope className="absolute left-3.5 text-slate-400 text-xs" />
                <input
                  type="email"
                  name="email"
                  required
                  disabled={emailVerified}
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="name@agency.com"
                  className="w-full pl-9 pr-28 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-all disabled:bg-slate-100 disabled:text-slate-500"
                />

                {!emailVerified && (
                  <button
                    type="button"
                    onClick={handleSendOtp}
                    disabled={sendingOtp || timer > 0}
                    className="absolute right-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-white bg-gradient-to-r from-emerald-600 to-teal-700 hover:opacity-95 disabled:opacity-50 cursor-pointer transition-all shadow-xs"
                  >
                    {sendingOtp ? (
                      <span className="flex items-center gap-1">
                        <FaSpinner className="animate-spin text-[10px]" /> Sending...
                      </span>
                    ) : timer > 0 ? (
                      `Resend (${timer}s)`
                    ) : otpSent ? (
                      "Resend Code"
                    ) : (
                      "Send Code"
                    )}
                  </button>
                )}
              </div>
            </div>

            {/* Step 1.5: OTP Input Box */}
            <AnimatePresence>
              {otpSent && !emailVerified && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="p-3.5 rounded-2xl bg-emerald-50/70 border border-emerald-200/90 space-y-2 overflow-hidden"
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-800 flex items-center gap-1.5">
                      <FaKey className="text-emerald-700" />
                      Enter 6-Digit Code
                    </span>
                    <span className="text-[11px] text-slate-500">Sent to {formData.email}</span>
                  </div>

                  <div className="flex gap-2">
                    <input
                      type="text"
                      maxLength={6}
                      value={otp}
                      onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                      placeholder="e.g. 549281"
                      className="flex-1 px-3 py-2 text-center text-sm font-mono tracking-widest font-bold bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
                    />
                    <button
                      type="button"
                      onClick={handleVerifyOtp}
                      disabled={verifyingOtp || otp.length !== 6}
                      className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 disabled:opacity-50 cursor-pointer shadow-xs"
                    >
                      {verifyingOtp ? "Verifying..." : "Verify Code"}
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* 2. Full Name & Company */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Full Name <span className="text-emerald-700">*</span>
                </label>
                <div className="relative">
                  <FaUser className="absolute left-3.5 top-3.5 text-slate-400 text-xs" />
                  <input
                    type="text"
                    name="fullName"
                    required
                    value={formData.fullName}
                    onChange={handleChange}
                    placeholder="e.g. Marcus Vance"
                    className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Agency / Business Name
                </label>
                <div className="relative">
                  <FaBuilding className="absolute left-3.5 top-3.5 text-slate-400 text-xs" />
                  <input
                    type="text"
                    name="companyName"
                    value={formData.companyName}
                    onChange={handleChange}
                    placeholder="e.g. Vance Digital"
                    className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-all"
                  />
                </div>
              </div>
            </div>

            {/* 3. Role & Phone */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Account Role
                </label>
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  className="w-full px-3 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-all"
                >
                  <option value="admin">Admin (Workspace Owner)</option>
                  <option value="sales">Sales Representative</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Phone (Optional)
                </label>
                <div className="relative">
                  <FaPhone className="absolute left-3.5 top-3.5 text-slate-400 text-xs" />
                  <input
                    type="text"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="+1 (555) 000-0000"
                    className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-all"
                  />
                </div>
              </div>
            </div>

            {/* 4. Password */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Password <span className="text-emerald-700">*</span>
              </label>
              <div className="relative">
                <FaLock className="absolute left-3.5 top-3.5 text-slate-400 text-xs" />
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  required
                  minLength={6}
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Minimum 6 characters"
                  className="w-full pl-9 pr-10 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-3 text-slate-400 hover:text-slate-600 cursor-pointer"
                  aria-label="Toggle password visibility"
                >
                  {showPassword ? <FaEyeSlash className="text-sm" /> : <FaEye className="text-sm" />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading || !emailVerified}
              className="w-full mt-2 flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-emerald-600 to-teal-700 hover:opacity-95 active:scale-[0.99] shadow-md shadow-emerald-600/20 transition-all cursor-pointer disabled:opacity-50"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <FaSpinner className="animate-spin text-sm" />
                  Creating Session & Workspace...
                </span>
              ) : (
                <>
                  <span>Create Account & Enter CRM</span>
                  <FaArrowRight className="text-xs" />
                </>
              )}
            </button>
          </form>

          {/* Link back to login */}
          <div className="mt-6 pt-5 border-t border-slate-100 text-center">
            <p className="text-xs text-slate-600">
              Already have an account?{" "}
              <Link
                href="/login"
                className="font-bold text-emerald-700 hover:underline"
              >
                Sign In
              </Link>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
