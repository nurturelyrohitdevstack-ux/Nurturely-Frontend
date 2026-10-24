"use client";

import React from "react";

export default function Logo({
  className = "h-9 w-9",
  textClassName = "text-xl",
  showBadge = true,
  showText = true,
}) {
  return (
    <div className="flex items-center gap-2.5 select-none">
      <div className={`relative flex items-center justify-center shrink-0 ${className}`}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/logo.png"
          alt="Nurturely Logo"
          className="w-full h-full object-contain"
        />
      </div>

      {showText && (
        <div className="flex flex-col">
          <div className="flex items-center gap-1.5 leading-none">
            <span className={`font-extrabold tracking-tight text-slate-900 ${textClassName}`}>
              Nurture<span className="text-emerald-600">ly</span>
            </span>
            {showBadge && (
              <span className="bg-emerald-50 text-emerald-700 border border-emerald-200/80 text-[10px] font-bold px-1.5 py-0.5 rounded-md uppercase tracking-wider">
                CRM
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
