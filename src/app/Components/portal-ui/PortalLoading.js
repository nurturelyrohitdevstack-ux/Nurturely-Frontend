"use client";

import React from "react";
import Logo from "./Logo";

export default function PortalLoading({ message = "Loading Nurturely CRM..." }) {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
      <div className="flex flex-col items-center gap-4">
        <Logo className="h-12 w-12" textClassName="text-2xl" />
        <div className="flex items-center gap-2">
          <div className="h-2.5 w-2.5 rounded-full bg-[#0A2540] animate-bounce [animation-delay:-0.3s]"></div>
          <div className="h-2.5 w-2.5 rounded-full bg-teal-600 animate-bounce [animation-delay:-0.15s]"></div>
          <div className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-bounce"></div>
        </div>
        <p className="text-xs text-slate-500 font-medium tracking-wide uppercase">{message}</p>
      </div>
    </div>
  );
}
