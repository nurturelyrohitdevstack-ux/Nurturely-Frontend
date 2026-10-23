"use client";

import React from "react";

export default function Logo({ className = "h-8 w-8", textClassName = "text-xl", showBadge = true }) {
  return (
    <div className="flex items-center gap-2.5 select-none">
      <div className={`relative flex items-center justify-center rounded-xl bg-gradient-to-br from-[#D6451B] to-orange-500 text-white shadow-sm shrink-0 ${className}`}>
        {/* Nurturely Sprout/Lead Icon */}
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="w-5 h-5 text-white"
        >
          <path d="M7 20h10" />
          <path d="M12 20v-8" />
          <path d="M12 12c-2.5-3-6-3-8 0 0-4 3.5-7 8-7s8 3 8 7c-2-3-5.5-3-8 0z" />
        </svg>
      </div>

      <div className="flex flex-col">
        <div className="flex items-center gap-1.5 leading-none">
          <span className={`font-extrabold tracking-tight text-slate-900 ${textClassName}`}>
            Nurture<span className="text-[#D6451B]">ly</span>
          </span>
          {showBadge && (
            <span className="bg-orange-100 text-[#D6451B] text-[10px] font-bold px-1.5 py-0.5 rounded-md uppercase tracking-wider">
              CRM
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
