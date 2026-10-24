"use client";

import { useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { FaLock, FaArrowRight } from "react-icons/fa";
import { toast } from "sonner";
import api from "@/lib/apiInstance";
import useAuthStore from "@/store/authStore";
import Logo from "../Components/portal-ui/Logo";

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token");
  const login = useAuthStore((state) => state.login);

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!token) {
      toast.error("Missing reset token. Please request a new link.");
      return;
    }

    if (newPassword.length < 6) {
      toast.error("Password must be at least 6 characters.");
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      const res = await api.post("/auth/reset-password", {
        token,
        newPassword,
      });

      if (res.data?.success) {
        if (res.data.user && res.data.accessToken) {
          login({
            user: res.data.user,
            accessToken: res.data.accessToken,
          });
        }
        toast.success("Password reset successfully! Redirecting...");
        router.replace("/dashboard");
      }
    } catch (err) {
      toast.error(
        err.response?.data?.message || "Failed to reset password. Token may have expired."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="academy-card p-6 sm:p-8 bg-white/95 backdrop-blur-md">
      <div className="flex flex-col items-center text-center mb-6">
        <Logo className="h-10 w-10" textClassName="text-xl" />
        <h1 className="mt-4 text-xl font-bold text-slate-900">
          Create New Password
        </h1>
        <p className="mt-1 text-xs text-slate-500">
          Choose a secure password for your Nurturely account.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
            New Password
          </label>
          <div className="relative">
            <FaLock className="absolute left-3.5 top-3.5 text-slate-400 text-sm" />
            <input
              type="password"
              required
              minLength={6}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Minimum 6 characters"
              className="w-full pl-10 pr-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-all"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
            Confirm Password
          </label>
          <div className="relative">
            <FaLock className="absolute left-3.5 top-3.5 text-slate-400 text-sm" />
            <input
              type="password"
              required
              minLength={6}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Re-enter password"
              className="w-full pl-10 pr-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-all"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 px-4 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-emerald-600 to-teal-700 hover:opacity-95 transition-all cursor-pointer disabled:opacity-50 shadow-md shadow-emerald-600/20"
        >
          {loading ? "Updating..." : "Save Password & Enter CRM"}
        </button>

        <div className="pt-2 text-center">
          <Link
            href="/login"
            className="text-xs font-semibold text-slate-500 hover:text-slate-800"
          >
            Cancel and Return to Sign In
          </Link>
        </div>
      </form>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-emerald-50/30 to-slate-100 flex items-center justify-center p-4 sm:p-6">
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <Suspense fallback={<div className="p-8 text-center text-sm text-slate-500">Loading form...</div>}>
          <ResetPasswordForm />
        </Suspense>
      </motion.div>
    </div>
  );
}
