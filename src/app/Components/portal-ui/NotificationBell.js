"use client";

import { useState } from "react";
import { FaBell } from "react-icons/fa";

export default function NotificationBell({ count = 2 }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="relative flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 hover:text-emerald-600 hover:border-emerald-200 hover:bg-emerald-50/50 transition-all shadow-xs cursor-pointer"
        aria-label="Notifications"
      >
        <FaBell className="text-sm" />
        {count > 0 && (
          <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-emerald-600 text-[10px] font-bold text-white shadow-xs">
            {count}
          </span>
        )}
      </button>

      {open && (
        <>
          <div
            className="fixed inset-0 z-30"
            onClick={() => setOpen(false)}
          />
          <div className="absolute right-0 mt-2 w-80 rounded-2xl border border-slate-200 bg-white p-4 shadow-xl z-40 text-left">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <span className="font-bold text-sm text-slate-800">Notifications</span>
              <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200/60 px-2 py-0.5 rounded-full">
                {count} New
              </span>
            </div>
            <div className="divide-y divide-slate-100 mt-2 text-xs">
              <div className="py-2.5">
                <p className="font-semibold text-slate-800">Follow-up due today</p>
                <p className="text-slate-500 mt-0.5">Marcus Vance (Vance Cloud Solutions) proposal follow-up.</p>
              </div>
              <div className="py-2.5">
                <p className="font-semibold text-slate-800">Lead assigned to you</p>
                <p className="text-slate-500 mt-0.5">David Chen (Nordic Coffee Roasters) has been assigned.</p>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
