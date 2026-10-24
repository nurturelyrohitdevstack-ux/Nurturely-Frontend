"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaChartLine,
  FaUsers,
  FaLayerGroup,
  FaClipboardList,
  FaUserTie,
  FaUserCircle,
  FaBars,
  FaTimes,
  FaSignOutAlt,
  FaCheckCircle,
} from "react-icons/fa";
import { toast } from "sonner";
import useAuthStore from "@/store/authStore";
import api from "@/lib/apiInstance";
import Logo from "./Logo";
import NotificationBell from "./NotificationBell";

export default function SidebarNav({ children }) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);

  const isAdmin = user?.role === "admin";

  const navItems = [
    { name: "Dashboard", href: "/dashboard", icon: FaChartLine },
    { name: "Leads", href: "/leads", icon: FaUsers },
    { name: "Pipeline Board", href: "/pipeline", icon: FaLayerGroup },
    { name: "Tasks & Follow-ups", href: "/tasks", icon: FaClipboardList },
    ...(isAdmin
      ? [{ name: "Team Management", href: "/team", icon: FaUserTie }]
      : []),
    { name: "My Profile", href: "/profile", icon: FaUserCircle },
  ];

  const handleLogout = async () => {
    try {
      await api.post("/auth/logout");
    } catch (err) {
      // Ignore network errors on logout
    }
    logout();
    toast.success("Logged out successfully");
    router.replace("/login");
  };

  return (
    <div className="min-h-screen bg-slate-50/70 text-slate-800 flex flex-col lg:flex-row w-full max-w-full overflow-x-hidden">
      {/* Mobile Top Header (< 1024px) */}
      <header className="lg:hidden sticky top-0 z-40 flex items-center justify-between border-b border-slate-200/80 bg-white/95 px-3.5 py-2.5 backdrop-blur-md shadow-xs">
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setMobileOpen(true)}
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-slate-700 hover:bg-emerald-50 hover:border-emerald-300 active:scale-95 transition-all cursor-pointer"
            aria-label="Open Navigation Menu"
          >
            <FaBars className="text-base text-slate-800" />
          </button>
          <Link href="/dashboard">
            <Logo className="h-8 w-8" textClassName="text-lg" />
          </Link>
        </div>

        <div className="flex items-center gap-2">
          <NotificationBell />
          <Link
            href="/profile"
            className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-100 text-emerald-800 font-bold text-xs border border-emerald-200 shadow-xs"
          >
            {user?.fullName?.charAt(0) || "U"}
          </Link>
        </div>
      </header>

      {/* Mobile Slide-Over Drawer Navigation */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
              className="lg:hidden fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs"
            />
            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 250 }}
              className="lg:hidden fixed inset-y-0 left-0 z-50 w-[280px] max-w-[85vw] bg-white p-5 shadow-2xl flex flex-col justify-between h-full overflow-hidden"
            >
              <div className="flex flex-col min-h-0 overflow-hidden flex-1">
                <div className="flex items-center justify-between pb-4 border-b border-slate-100 shrink-0">
                  <Logo className="h-8 w-8" textClassName="text-lg" />
                  <button
                    onClick={() => setMobileOpen(false)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer"
                  >
                    <FaTimes className="text-lg" />
                  </button>
                </div>

                {/* User quick info badge */}
                <div className="my-4 p-3 rounded-xl bg-emerald-50/70 border border-emerald-100/90 flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-[#0A2540] to-teal-700 text-white font-bold text-xs shadow-xs">
                    {user?.fullName?.charAt(0) || "U"}
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="font-bold text-xs text-slate-900 truncate">
                      {user?.fullName || "CRM User"}
                    </span>
                    <span className="text-[11px] font-semibold text-emerald-700 capitalize">
                      {user?.role === "admin" ? "Administrator" : "Sales Representative"}
                    </span>
                  </div>
                </div>

                {/* Navigation links */}
                <nav className="flex-1 overflow-y-auto space-y-1 pr-1">
                  {navItems.map((item) => {
                    const active = pathname === item.href || pathname.startsWith(item.href + "/");
                    const Icon = item.icon;
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setMobileOpen(false)}
                        className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                          active
                            ? "bg-gradient-to-r from-emerald-600 to-teal-700 text-white shadow-sm shadow-emerald-600/20"
                            : "text-slate-600 hover:bg-emerald-50/70 hover:text-emerald-700"
                        }`}
                      >
                        <Icon className={`text-base ${active ? "text-white" : "text-slate-400"}`} />
                        <span>{item.name}</span>
                      </Link>
                    );
                  })}
                </nav>
              </div>

              {/* Logout button */}
              <div className="pt-4 border-t border-slate-100 shrink-0">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-xs font-bold text-rose-600 bg-rose-50 hover:bg-rose-100 transition-all cursor-pointer"
                >
                  <FaSignOutAlt />
                  <span>Sign Out</span>
                </button>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Desktop Sidebar Spacer to preserve flex layout */}
      <div className="hidden lg:block w-64 xl:w-72 shrink-0" aria-hidden="true" />

      {/* Desktop Fixed Sidebar (>= 1024px) - Stays stationary during scroll */}
      <aside className="hidden lg:flex flex-col justify-between w-64 xl:w-72 border-r border-slate-200/80 bg-white p-5 fixed inset-y-0 left-0 z-30 overflow-hidden">
        <div className="flex flex-col min-h-0 overflow-hidden flex-1">
          {/* Logo brand header */}
          <div className="pb-6 border-b border-slate-100 shrink-0">
            <Link href="/dashboard">
              <Logo className="h-9 w-9" textClassName="text-xl" />
            </Link>
          </div>

          {/* User Profile Card */}
          <div className="my-5 p-3 rounded-2xl bg-emerald-50/60 border border-emerald-100/90 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3 min-w-0">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#0A2540] to-teal-700 text-white font-bold text-sm shadow-xs">
                {user?.fullName?.charAt(0) || "U"}
              </div>
              <div className="flex flex-col min-w-0">
                <span className="font-bold text-xs text-slate-900 truncate">
                  {user?.fullName || "User"}
                </span>
                <span className="text-[11px] font-semibold text-emerald-700 capitalize truncate">
                  {user?.role === "admin" ? "Workspace Admin" : "Sales Team"}
                </span>
              </div>
            </div>
            <NotificationBell />
          </div>

          {/* Desktop Navigation Links (with independent scroll if window is small) */}
          <nav className="space-y-1.5 mt-2 overflow-y-auto flex-1 pr-1">
            {navItems.map((item) => {
              const active = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-3.5 py-3 rounded-xl text-sm font-semibold transition-all ${
                    active
                      ? "bg-gradient-to-r from-emerald-600 to-teal-700 text-white shadow-sm shadow-emerald-600/20"
                      : "text-slate-600 hover:bg-emerald-50/70 hover:text-emerald-700"
                  }`}
                >
                  <Icon className={`text-base ${active ? "text-white" : "text-slate-400"}`} />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Desktop Sidebar Footer */}
        <div className="pt-4 border-t border-slate-100 space-y-3 shrink-0 bg-white mt-auto">
          <div className="rounded-xl bg-slate-50 p-2.5 border border-slate-100 text-[11px] text-slate-500 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <FaCheckCircle className="text-emerald-500" />
              <span>CRM Connected</span>
            </span>
            <span className="font-mono text-[10px] text-slate-400">v1.0</span>
          </div>

          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-bold text-rose-600 bg-rose-50 hover:bg-rose-100 transition-all cursor-pointer"
          >
            <FaSignOutAlt />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Page Content Workspace */}
      <main className="flex-1 min-w-0 w-full max-w-full px-4 py-5 sm:px-6 sm:py-6 lg:px-8 lg:py-8 overflow-x-hidden">
        {children}
      </main>
    </div>
  );
}
