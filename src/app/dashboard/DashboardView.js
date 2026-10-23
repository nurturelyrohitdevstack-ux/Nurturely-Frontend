"use client";

import { useState } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import {
  FaUsers,
  FaRupeeSign,
  FaTrophy,
  FaChartPie,
  FaCalendarCheck,
  FaExclamationCircle,
  FaPlus,
  FaArrowRight,
  FaPhoneAlt,
  FaEnvelope,
  FaComments,
  FaHistory,
} from "react-icons/fa";
import api from "@/lib/apiInstance";
import useAuthStore from "@/store/authStore";

export default function DashboardView() {
  const user = useAuthStore((state) => state.user);

  const { data, isLoading } = useQuery({
    queryKey: ["dashboard-summary"],
    queryFn: async () => {
      const res = await api.get("/dashboard/summary");
      return res.data?.metrics;
    },
    refetchInterval: 30000,
  });

  const metrics = data || {
    totalLeads: 0,
    newThisMonth: 0,
    openPipelineValue: 0,
    wonPipelineValue: 0,
    wonCount: 0,
    lostCount: 0,
    conversionRate: 0,
    tasksDueToday: 0,
    tasksOverdue: 0,
    stageCounts: { New: 0, Contacted: 0, Qualified: 0, Proposal: 0, Won: 0, Lost: 0 },
    leadsBySource: [],
    recentActivities: [],
    upcomingTasks: [],
  };

  const statCards = [
    {
      title: "Total Leads",
      value: metrics.totalLeads,
      subtitle: `${metrics.newThisMonth} created this month`,
      icon: FaUsers,
      color: "bg-blue-50 text-blue-600 border-blue-100",
      link: "/leads",
    },
    {
      title: "Open Pipeline Value",
      value: `₹${(metrics.openPipelineValue || 0).toLocaleString("en-IN")}`,
      subtitle: "Active pipeline value",
      icon: FaRupeeSign,
      color: "bg-amber-50 text-amber-600 border-amber-100",
      link: "/pipeline",
    },
    {
      title: "Won Revenue",
      value: `₹${(metrics.wonPipelineValue || 0).toLocaleString("en-IN")}`,
      subtitle: `${metrics.wonCount} won deals closed`,
      icon: FaTrophy,
      color: "bg-emerald-50 text-emerald-600 border-emerald-100",
      link: "/pipeline",
    },
    {
      title: "Conversion Rate",
      value: `${metrics.conversionRate}%`,
      subtitle: `${metrics.wonCount} won vs ${metrics.lostCount} lost`,
      icon: FaChartPie,
      color: "bg-purple-50 text-purple-600 border-purple-100",
      link: "/pipeline",
    },
    {
      title: "Due Today",
      value: metrics.tasksDueToday,
      subtitle: "Follow-up tasks scheduled",
      icon: FaCalendarCheck,
      color: "bg-orange-50 text-[#D6451B] border-orange-100",
      link: "/tasks?filter=today",
    },
    {
      title: "Overdue Follow-ups",
      value: metrics.tasksOverdue,
      subtitle: metrics.tasksOverdue > 0 ? "Requires prompt attention" : "All caught up",
      icon: FaExclamationCircle,
      color:
        metrics.tasksOverdue > 0
          ? "bg-rose-50 text-rose-600 border-rose-100"
          : "bg-slate-50 text-slate-500 border-slate-200",
      link: "/tasks?filter=overdue",
    },
  ];

  const stages = [
    { name: "New", count: metrics.stageCounts?.New || 0, color: "bg-slate-400" },
    { name: "Contacted", count: metrics.stageCounts?.Contacted || 0, color: "bg-blue-500" },
    { name: "Meeting Scheduled", count: metrics.stageCounts?.["Meeting Scheduled"] || 0, color: "bg-cyan-500" },
    { name: "Qualified", count: metrics.stageCounts?.Qualified || 0, color: "bg-amber-500" },
    { name: "Proposal Sent", count: (metrics.stageCounts?.["Proposal Sent"] || 0) + (metrics.stageCounts?.Proposal || 0), color: "bg-purple-500" },
    { name: "In Negotiation", count: metrics.stageCounts?.["In Negotiation"] || 0, color: "bg-indigo-500" },
    { name: "Won", count: metrics.stageCounts?.Won || 0, color: "bg-emerald-500" },
    { name: "Lost", count: metrics.stageCounts?.Lost || 0, color: "bg-rose-400" },
    { name: "On Hold", count: metrics.stageCounts?.["On Hold"] || 0, color: "bg-orange-300" },
  ];

  const totalStageCount = stages.reduce((acc, s) => acc + s.count, 0) || 1;

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Banner / Welcome Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Sales Overview
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Welcome back, <span className="font-semibold text-slate-800">{user?.fullName}</span>. Here is what is happening across your leads today.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Link
            href="/leads?action=create"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-white bg-gradient-to-r from-orange-500 to-[#D6451B] hover:opacity-95 shadow-sm shadow-orange-500/20 transition-all cursor-pointer"
          >
            <FaPlus className="text-xs" />
            <span>New Lead</span>
          </Link>
          <Link
            href="/tasks"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-slate-700 bg-white border border-slate-200 hover:border-orange-300 hover:text-[#D6451B] shadow-xs transition-all"
          >
            <span>Follow-ups</span>
          </Link>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3.5">
        {statCards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <Link
              key={idx}
              href={card.link}
              className="academy-card p-4 flex flex-col justify-between hover:scale-[1.01] transition-all group"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 truncate">
                  {card.title}
                </span>
                <div className={`p-2 rounded-xl border ${card.color} shrink-0`}>
                  <Icon className="text-sm" />
                </div>
              </div>
              <div>
                <span className="text-2xl font-extrabold text-slate-900 tracking-tight">
                  {isLoading ? "..." : card.value}
                </span>
                <p className="text-[11px] text-slate-500 mt-1 truncate">
                  {card.subtitle}
                </p>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Pipeline Stage Distribution Progress Bar */}
      <div className="academy-card p-5 sm:p-6 bg-white">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-base font-bold text-slate-900">Pipeline Distribution</h2>
            <p className="text-xs text-slate-500 mt-0.5">Distribution of leads across sales stages</p>
          </div>
          <Link
            href="/pipeline"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-[#D6451B] hover:underline"
          >
            <span>Interactive Kanban</span>
            <FaArrowRight className="text-[10px]" />
          </Link>
        </div>

        {/* Stacked percentage bar */}
        <div className="h-4 w-full bg-slate-100 rounded-full overflow-hidden flex shadow-inner mb-4">
          {stages.map((stg) => {
            const pct = (stg.count / totalStageCount) * 100;
            if (pct <= 0) return null;
            return (
              <div
                key={stg.name}
                style={{ width: `${pct}%` }}
                className={`${stg.color} h-full transition-all duration-500`}
                title={`${stg.name}: ${stg.count} leads (${pct.toFixed(0)}%)`}
              />
            );
          })}
        </div>

        {/* Legend grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 pt-2">
          {stages.map((stg) => (
            <div key={stg.name} className="flex items-center gap-2.5 p-2 rounded-xl bg-slate-50/80 border border-slate-100">
              <span className={`h-3 w-3 rounded-full ${stg.color} shrink-0`} />
              <div className="flex flex-col min-w-0">
                <span className="text-[11px] font-semibold text-slate-600 truncate">{stg.name}</span>
                <span className="text-sm font-bold text-slate-900">{stg.count}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Split Row: Lead Sources & Follow-ups due today */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Lead Sources Breakdown */}
        <div className="academy-card p-5 sm:p-6 bg-white flex flex-col justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900 mb-1">Leads by Channel / Source</h2>
            <p className="text-xs text-slate-500 mb-4">Conversion channels delivering prospective clients</p>

            {metrics.leadsBySource && metrics.leadsBySource.length > 0 ? (
              <div className="space-y-3">
                {metrics.leadsBySource.map((s) => {
                  const pct = metrics.totalLeads > 0 ? ((s.count / metrics.totalLeads) * 100).toFixed(0) : 0;
                  return (
                    <div key={s.source} className="space-y-1">
                      <div className="flex justify-between text-xs font-semibold">
                        <span className="text-slate-700">{s.source}</span>
                        <span className="text-slate-500">
                          {s.count} ({pct}%)
                        </span>
                      </div>
                      <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-orange-400 to-[#D6451B] rounded-full transition-all duration-500"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="py-8 text-center text-xs text-slate-400">
                No source metrics recorded yet. Create leads to populate.
              </div>
            )}
          </div>

          <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-500">Top Performing Channel:</span>
            <span className="font-bold text-[#D6451B]">
              {metrics.leadsBySource[0]?.source || "Website"}
            </span>
          </div>
        </div>

        {/* Due Today Follow-up Tasks */}
        <div className="academy-card p-5 sm:p-6 bg-white flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-base font-bold text-slate-900">Urgent Follow-ups</h2>
                <p className="text-xs text-slate-500 mt-0.5">Tasks scheduled for today</p>
              </div>
              <Link
                href="/tasks"
                className="text-xs font-bold text-[#D6451B] hover:underline"
              >
                View all tasks
              </Link>
            </div>

            {metrics.upcomingTasks && metrics.upcomingTasks.length > 0 ? (
              <div className="space-y-2.5">
                {metrics.upcomingTasks.map((t) => (
                  <div
                    key={t._id}
                    className="p-3 rounded-xl border border-slate-100 bg-slate-50/60 hover:bg-orange-50/40 hover:border-orange-200 transition-all flex items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="p-2 rounded-lg bg-orange-100 text-[#D6451B] shrink-0 text-xs">
                        {t.type === "Call" ? <FaPhoneAlt /> : t.type === "Email" ? <FaEnvelope /> : <FaComments />}
                      </span>
                      <div className="flex flex-col min-w-0">
                        <span className="text-xs font-bold text-slate-800 truncate">{t.title}</span>
                        <span className="text-[11px] text-slate-500 truncate">
                          Lead: {t.lead?.fullName || "Prospective Client"} ({t.lead?.company || "No company"})
                        </span>
                      </div>
                    </div>
                    <span className="text-[11px] font-semibold text-slate-500 shrink-0">
                      {new Date(t.dueAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-8 text-center text-xs text-slate-400">
                No pending tasks scheduled for today. You are completely caught up!
              </div>
            )}
          </div>

          <div className="pt-4 mt-4 border-t border-slate-100">
            <Link
              href="/tasks?action=create"
              className="w-full py-2 px-3 rounded-xl bg-orange-50 text-[#D6451B] hover:bg-orange-100 font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <FaPlus className="text-[10px]" />
              <span>Schedule New Follow-up</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Recent CRM Activities Feed */}
      <div className="academy-card p-5 sm:p-6 bg-white">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <FaHistory className="text-slate-400 text-sm" />
            <h2 className="text-base font-bold text-slate-900">Recent Activity Timeline</h2>
          </div>
          <span className="text-xs text-slate-400">Live Workspace Stream</span>
        </div>

        {metrics.recentActivities && metrics.recentActivities.length > 0 ? (
          <div className="divide-y divide-slate-100">
            {metrics.recentActivities.map((act) => (
              <div key={act._id} className="py-3 flex items-start justify-between gap-4">
                <div className="flex items-start gap-3 min-w-0">
                  <div className="h-8 w-8 rounded-full bg-orange-50 text-[#D6451B] border border-orange-200 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                    {act.createdBy?.fullName?.charAt(0) || "U"}
                  </div>
                  <div className="flex flex-col min-w-0">
                    <p className="text-xs text-slate-800">
                      <span className="font-bold">{act.createdBy?.fullName || "User"}</span>: {act.summary}
                    </p>
                    {act.details && (
                      <p className="text-[11px] text-slate-500 mt-0.5">{act.details}</p>
                    )}
                    {act.lead && (
                      <span className="text-[11px] font-semibold text-[#D6451B] mt-0.5">
                        Related to: {act.lead.fullName} ({act.lead.company || "No company"})
                      </span>
                    )}
                  </div>
                </div>
                <span className="text-[11px] text-slate-400 shrink-0 whitespace-nowrap">
                  {new Date(act.createdAt).toLocaleDateString()}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-6 text-center text-xs text-slate-400">
            No recent activity recorded yet.
          </div>
        )}
      </div>
    </div>
  );
}
