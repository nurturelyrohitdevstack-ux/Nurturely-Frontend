"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { FaEnvelope, FaLock, FaArrowRight, FaUserCheck } from "react-icons/fa";
import { toast } from "sonner";
import api from "@/lib/apiInstance";
import useAuthStore from "@/store/authStore";
import Logo from "../Components/portal-ui/Logo";

export default function LoginPage() {
  const router = useRouter();
  const login = useAuthStore((state) => state.login);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error("Please fill in both email and password");
      return;
    }

    setLoading(true);
    try {
      const res = await api.post("/auth/login", { email, password });
      if (res.data?.success) {
        login({
          user: res.data.user,
          accessToken: res.data.accessToken,
        });
        toast.success(`Welcome back, ${res.data.user.fullName}!`);
        router.replace("/dashboard");
      }
    } catch (err) {
      toast.error(
        err.response?.data?.message ||
          "Failed to log in. Please verify your credentials or server connection."
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
        transition={{ duration: 0.3 }}
        className="w-full max-w-md"
      >
        <div className="academy-card p-6 sm:p-8 bg-white/95 backdrop-blur-md">
          {/* Logo Brand Header */}
          <div className="flex flex-col items-center text-center mb-6">
            <Logo className="h-11 w-11" textClassName="text-2xl" />
            <h1 className="mt-4 text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              Sign in to Nurturely
            </h1>
            <p className="mt-1 text-xs sm:text-sm text-slate-500">
              Manage leads, track pipelines, and close more deals.
            </p>
          </div>

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

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Password
                </label>
                <Link
                  href="/forgot-password"
                  className="text-xs font-semibold text-emerald-700 hover:underline"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <FaLock className="absolute left-3.5 top-3.5 text-slate-400 text-sm" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-10 pr-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-emerald-600 to-teal-700 hover:opacity-95 active:scale-[0.99] shadow-md shadow-emerald-600/20 transition-all cursor-pointer disabled:opacity-50"
            >
              {loading ? (
                <span>Authenticating...</span>
              ) : (
                <>
                  <span>Sign In to CRM</span>
                  <FaArrowRight className="text-xs" />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 pt-5 border-t border-slate-100 text-center space-y-2">
            <p className="text-xs text-slate-600">
              Don't have an account yet?{" "}
              <Link
                href="/signup"
                className="font-bold text-emerald-700 hover:underline"
              >
                Sign Up
              </Link>
            </p>
            <span className="text-[11px] text-slate-400 block">
              Secured with HTTP-only tokens & role-based RBAC.
            </span>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
