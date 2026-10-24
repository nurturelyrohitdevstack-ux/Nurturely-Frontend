"use client";

import { useState } from "react";
import { FaUserCircle, FaLock, FaShieldAlt, FaEnvelope, FaPhone } from "react-icons/fa";
import { toast } from "sonner";
import api from "@/lib/apiInstance";
import useAuthStore from "@/store/authStore";

export default function ProfileView() {
  const user = useAuthStore((state) => state.user);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (!currentPassword || !newPassword) {
      toast.error("Please enter current and new passwords");
      return;
    }

    if (newPassword.length < 6) {
      toast.error("New password must be at least 6 characters");
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error("New passwords do not match");
      return;
    }

    setLoading(true);
    try {
      const res = await api.put("/auth/update-password", {
        currentPassword,
        newPassword,
      });

      if (res.data?.success) {
        toast.success("Password updated successfully!");
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      }
    } catch (err) {
      toast.error(
        err.response?.data?.message || "Failed to update password. Verify your current password."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Top Header */}
      <div className="pb-1">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          My Account Profile
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Review your CRM account credentials and update your security settings.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Profile Card */}
        <div className="academy-card p-6 bg-white text-center flex flex-col items-center">
          <div className="h-20 w-20 rounded-2xl bg-gradient-to-br from-[#0A2540] via-[#0F3060] to-teal-700 text-white font-extrabold text-2xl flex items-center justify-center shadow-md shadow-emerald-600/20 mb-3">
            {user?.fullName?.charAt(0) || "U"}
          </div>

          <h2 className="text-base font-bold text-slate-900">{user?.fullName}</h2>
          <p className="text-xs text-slate-500">{user?.email}</p>

          <div className="mt-3">
            <span className="academy-badge bg-emerald-50 text-emerald-700 border border-emerald-200 uppercase tracking-wider text-[10px]">
              {user?.role === "admin" ? "Workspace Admin" : "Sales Representative"}
            </span>
          </div>

          <div className="w-full border-t border-slate-100 mt-6 pt-4 space-y-2 text-left text-xs text-slate-600">
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Status:</span>
              <span className="font-bold text-emerald-600">Active</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Phone:</span>
              <span>{user?.phone || "Not set"}</span>
            </div>
          </div>
        </div>

        {/* Change Password Form */}
        <div className="md:col-span-2 academy-card p-6 bg-white">
          <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-100">
            <FaShieldAlt className="text-emerald-700" />
            <h3 className="text-sm font-bold text-slate-900">Change Password</h3>
          </div>

          <form onSubmit={handlePasswordChange} className="space-y-4 text-xs">
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Current Password
              </label>
              <input
                type="password"
                required
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Enter current password"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  New Password
                </label>
                <input
                  type="password"
                  required
                  minLength={6}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Min 6 characters"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  required
                  minLength={6}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter new password"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
                />
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                disabled={loading}
                className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-emerald-600 to-teal-700 hover:opacity-95 cursor-pointer disabled:opacity-50 shadow-sm shadow-emerald-600/20 transition-all"
              >
                {loading ? "Updating..." : "Update Password"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
