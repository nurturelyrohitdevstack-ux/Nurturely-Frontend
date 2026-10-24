"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { FaEnvelope, FaArrowLeft, FaCheckCircle } from "react-icons/fa";
import { toast } from "sonner";
import api from "@/lib/apiInstance";
import Logo from "../Components/portal-ui/Logo";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) {
      toast.error("Please enter your registered email");
      return;
    }

    setLoading(true);
    try {
      await api.post("/auth/forgot-password", { email });
      setSent(true);
      toast.success("Password reset instructions dispatched to your email.");
    } catch (err) {
      toast.error(
        err.response?.data?.message || "Failed to process request. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-emerald-50/30 to-slate-100 flex items-center justify-center p-4 sm:p-6">
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="academy-card p-6 sm:p-8 bg-white/95 backdrop-blur-md">
          <div className="flex flex-col items-center text-center mb-6">
            <Logo className="h-10 w-10" textClassName="text-xl" />
            <h1 className="mt-4 text-xl font-bold text-slate-900">
              Reset Your Password
            </h1>
            <p className="mt-1 text-xs sm:text-sm text-slate-500">
              Enter your work email address and we'll send a secure reset link.
            </p>
          </div>

          {sent ? (
            <div className="text-center py-4 space-y-4">
              <div className="h-12 w-12 rounded-full bg-emerald-50 text-emerald-600 mx-auto flex items-center justify-center text-xl">
                <FaCheckCircle />
              </div>
              <p className="text-sm text-slate-700">
                If an account exists for <strong>{email}</strong>, a password reset email has been dispatched.
              </p>

              <Link
                href="/login"
                className="inline-flex items-center gap-2 text-xs font-bold text-emerald-700 hover:underline pt-2"
              >
                <FaArrowLeft />
                <span>Return to Login</span>
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Work Email
                </label>
                <div className="relative">
                  <FaEnvelope className="absolute left-3.5 top-3.5 text-slate-400 text-sm" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@company.com"
                    className="w-full pl-10 pr-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-all"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-emerald-600 to-teal-700 hover:opacity-95 transition-all cursor-pointer disabled:opacity-50 shadow-md shadow-emerald-600/20"
              >
                {loading ? "Sending..." : "Send Reset Link"}
              </button>

              <div className="pt-2 text-center">
                <Link
                  href="/login"
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800"
                >
                  <FaArrowLeft className="text-[10px]" />
                  <span>Back to Sign In</span>
                </Link>
              </div>
            </form>
          )}
        </div>
      </motion.div>
    </div>
  );
}
