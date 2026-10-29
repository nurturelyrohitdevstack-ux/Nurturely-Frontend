"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  FaCheckCircle,
  FaCalendarAlt,
  FaClock,
  FaPhoneAlt,
  FaEnvelope,
  FaComments,
  FaPlus,
  FaTimes,
  FaTrash,
  FaCheck,
  FaBan,
  FaForward,
  FaCalendarCheck,
  FaExclamationCircle,
} from "react-icons/fa";
import { toast } from "sonner";
import api from "@/lib/apiInstance";
import useAuthStore from "@/store/authStore";

const LEAD_STAGES = [
  "New",
  "Contacted",
  "Meeting Scheduled",
  "Qualified",
  "Proposal Sent",
  "In Negotiation",
  "Won",
  "Lost",
  "On Hold",
];

const getStageBadgeClass = (stage) => {
  switch (stage) {
    case "New":
      return "bg-blue-50 text-blue-700 border-blue-200";
    case "Contacted":
      return "bg-amber-50 text-amber-700 border-amber-200";
    case "Meeting Scheduled":
      return "bg-purple-50 text-purple-700 border-purple-200";
    case "Qualified":
      return "bg-emerald-50 text-emerald-700 border-emerald-200";
    case "Proposal Sent":
    case "Proposal":
      return "bg-cyan-50 text-cyan-700 border-cyan-200";
    case "In Negotiation":
      return "bg-indigo-50 text-indigo-700 border-indigo-200";
    case "Won":
      return "bg-emerald-100 text-emerald-800 border-emerald-300 font-bold";
    case "Lost":
      return "bg-rose-50 text-rose-700 border-rose-200";
    default:
      return "bg-slate-100 text-slate-700 border-slate-200";
  }
};

export default function TasksView() {
  const queryClient = useQueryClient();
  const user = useAuthStore((state) => state.user);

  const [activeTab, setActiveTab] = useState("all"); // 'all' | 'today' | 'upcoming' | 'overdue' | 'completed'
  const [modalOpen, setModalOpen] = useState(false);

  // Read URL query parameter for filter if present
  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const urlFilter = params.get("filter");
      if (
        urlFilter &&
        ["all", "today", "upcoming", "overdue", "completed"].includes(urlFilter)
      ) {
        setActiveTab(urlFilter);
      }
    }
  }, []);

  // Form state for creating a new task
  const [taskForm, setTaskForm] = useState({
    title: "",
    leadId: "",
    type: "Call",
    priority: "Medium",
    dueAt: "",
    notes: "",
  });
  const [activeDuePreset, setActiveDuePreset] = useState("1d");

  // Reschedule state
  const [rescheduleModalTask, setRescheduleModalTask] = useState(null);
  const [rescheduleDate, setRescheduleDate] = useState("");
  const [rescheduleNotes, setRescheduleNotes] = useState("");
  const [reschedulePreset, setReschedulePreset] = useState("1d");

  // Format datetime helper for input
  const formatDatetimeForInput = (target) => {
    const pad = (n) => String(n).padStart(2, "0");
    return `${target.getFullYear()}-${pad(target.getMonth() + 1)}-${pad(
      target.getDate()
    )}T${pad(target.getHours())}:${pad(target.getMinutes())}`;
  };

  const applyTaskDuePreset = (preset) => {
    setActiveDuePreset(preset);
    const now = new Date();
    const target = new Date();

    if (preset === "today") {
      target.setTime(now.getTime() + 4 * 60 * 60 * 1000);
    } else if (preset === "1d") {
      target.setDate(now.getDate() + 1);
      target.setHours(10, 0, 0, 0);
    } else if (preset === "2d") {
      target.setDate(now.getDate() + 2);
      target.setHours(10, 0, 0, 0);
    } else if (preset === "3d") {
      target.setDate(now.getDate() + 3);
      target.setHours(10, 0, 0, 0);
    } else if (preset === "7d") {
      target.setDate(now.getDate() + 7);
      target.setHours(10, 0, 0, 0);
    }

    setTaskForm((prev) => ({
      ...prev,
      dueAt: formatDatetimeForInput(target),
    }));
  };

  const applyReschedulePreset = (preset) => {
    setReschedulePreset(preset);
    const now = new Date();
    const target = new Date();

    if (preset === "today") {
      target.setTime(now.getTime() + 4 * 60 * 60 * 1000);
    } else if (preset === "1d") {
      target.setDate(now.getDate() + 1);
      target.setHours(10, 0, 0, 0);
    } else if (preset === "2d") {
      target.setDate(now.getDate() + 2);
      target.setHours(10, 0, 0, 0);
    } else if (preset === "3d") {
      target.setDate(now.getDate() + 3);
      target.setHours(10, 0, 0, 0);
    } else if (preset === "7d") {
      target.setDate(now.getDate() + 7);
      target.setHours(10, 0, 0, 0);
    }

    setRescheduleDate(formatDatetimeForInput(target));
  };

  const openRescheduleModal = (task) => {
    setRescheduleModalTask(task);
    setRescheduleNotes(task.notes || "");
    const now = new Date();
    const tomorrow = new Date();
    tomorrow.setDate(now.getDate() + 1);
    tomorrow.setHours(10, 0, 0, 0);
    setRescheduleDate(formatDatetimeForInput(tomorrow));
    setReschedulePreset("1d");
  };

  // Timezone offset for accurate "today" calculation
  const tzOffset =
    typeof window !== "undefined" ? new Date().getTimezoneOffset() : 0;

  // Query: Get tasks
  const { data, isLoading } = useQuery({
    queryKey: ["tasks", activeTab, tzOffset],
    queryFn: async () => {
      const res = await api.get(
        `/tasks?filter=${activeTab}&tzOffset=${tzOffset}`
      );
      return res.data;
    },
  });

  // Query: Get leads list for dropdown
  const { data: leadsData } = useQuery({
    queryKey: ["leads-selector"],
    queryFn: async () => {
      const res = await api.get("/leads?limit=50");
      return res.data?.leads || [];
    },
  });

  // Mutation: Create task
  const createTaskMutation = useMutation({
    mutationFn: async (payload) => {
      const res = await api.post("/tasks", payload);
      return res.data;
    },
    onSuccess: (data) => {
      toast.success(data.message || "Task scheduled successfully");
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-summary"] });
      queryClient.invalidateQueries({ queryKey: ["leads"] });
      setModalOpen(false);
      setTaskForm({
        title: "",
        leadId: "",
        type: "Call",
        priority: "Medium",
        dueAt: "",
        notes: "",
      });
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || "Failed to create task");
    },
  });

  // Mutation: Reschedule task (Assign new date / next follow up date)
  const rescheduleTaskMutation = useMutation({
    mutationFn: async ({ taskId, dueAt, notes }) => {
      const res = await api.patch(`/tasks/${taskId}/reschedule`, {
        dueAt,
        notes,
      });
      return res.data;
    },
    onSuccess: (data) => {
      toast.success(data.message || "Follow-up rescheduled successfully!");
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-summary"] });
      queryClient.invalidateQueries({ queryKey: ["leads"] });
      setRescheduleModalTask(null);
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || "Failed to reschedule task");
    },
  });

  // Mutation: Skip task
  const skipTaskMutation = useMutation({
    mutationFn: async ({ taskId, reason }) => {
      const res = await api.patch(`/tasks/${taskId}/skip`, { reason });
      return res.data;
    },
    onSuccess: (data) => {
      toast.info(data.message || "Follow-up task skipped");
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-summary"] });
      queryClient.invalidateQueries({ queryKey: ["leads"] });
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || "Failed to skip task");
    },
  });

  // Mutation: Complete task
  const completeTaskMutation = useMutation({
    mutationFn: async (taskId) => {
      const res = await api.patch(`/tasks/${taskId}/complete`);
      return res.data;
    },
    onSuccess: () => {
      toast.success("Follow-up marked as completed!");
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-summary"] });
      queryClient.invalidateQueries({ queryKey: ["leads"] });
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || "Failed to complete task");
    },
  });

  // Mutation: Update Lead Status directly from task card
  const updateLeadStatusMutation = useMutation({
    mutationFn: async ({ leadId, status, lostReason }) => {
      const res = await api.patch(`/leads/${leadId}/status`, {
        status,
        lostReason,
      });
      return res.data;
    },
    onSuccess: (data) => {
      toast.success(data.message || "Lead status updated!");
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-summary"] });
      queryClient.invalidateQueries({ queryKey: ["leads"] });
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || "Failed to update lead status");
    },
  });

  // Mutation: Delete task
  const deleteTaskMutation = useMutation({
    mutationFn: async (taskId) => {
      const res = await api.delete(`/tasks/${taskId}`);
      return res.data;
    },
    onSuccess: () => {
      toast.success("Task removed");
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-summary"] });
      queryClient.invalidateQueries({ queryKey: ["leads"] });
    },
  });

  const handleCreateSubmit = (e) => {
    e.preventDefault();
    if (!taskForm.title.trim() || !taskForm.leadId || !taskForm.dueAt) {
      toast.error("Please enter a title, lead, and due date/time");
      return;
    }

    createTaskMutation.mutate({
      title: taskForm.title.trim(),
      lead: taskForm.leadId,
      type: taskForm.type,
      priority: taskForm.priority,
      dueAt: taskForm.dueAt,
      notes: taskForm.notes.trim(),
    });
  };

  const handleRescheduleSubmit = (e) => {
    e.preventDefault();
    if (!rescheduleModalTask || !rescheduleDate) {
      toast.error("Please pick a new follow-up date and time");
      return;
    }

    rescheduleTaskMutation.mutate({
      taskId: rescheduleModalTask._id,
      dueAt: rescheduleDate,
      notes: rescheduleNotes,
    });
  };

  const handleLeadStageChange = (task, newStatus) => {
    if (!task.lead?._id) return;
    if (newStatus === "Lost") {
      const reason = window.prompt("Reason for marking this lead as Lost:");
      if (!reason || reason.trim() === "") {
        toast.error("Lost reason is required");
        return;
      }
      updateLeadStatusMutation.mutate({
        leadId: task.lead._id,
        status: newStatus,
        lostReason: reason.trim(),
      });
    } else {
      updateLeadStatusMutation.mutate({
        leadId: task.lead._id,
        status: newStatus,
      });
    }
  };

  const tasks = data?.tasks || [];
  const counts = data?.counts || {
    pending: 0,
    overdue: 0,
    today: 0,
    completed: 0,
  };

  // Helper to format due date relative to today
  const formatDueDisplay = (dateStr) => {
    if (!dateStr) return "No date";
    const d = new Date(dateStr);
    const now = new Date();
    const todayStr = now.toDateString();
    const dateOnlyStr = d.toDateString();

    const timeStr = d.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });

    if (dateOnlyStr === todayStr) {
      return `Today at ${timeStr}`;
    }

    const tomorrow = new Date();
    tomorrow.setDate(now.getDate() + 1);
    if (dateOnlyStr === tomorrow.toDateString()) {
      return `Tomorrow at ${timeStr}`;
    }

    const yesterday = new Date();
    yesterday.setDate(now.getDate() - 1);
    if (dateOnlyStr === yesterday.toDateString()) {
      return `Yesterday at ${timeStr}`;
    }

    return `${d.toLocaleDateString([], {
      month: "short",
      day: "numeric",
    })} at ${timeStr}`;
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-1">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Tasks & Follow-ups
            </h1>
            {counts.today > 0 && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                <FaClock className="text-[10px]" /> {counts.today} Due Today
              </span>
            )}
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Track prospective client follow-ups, reschedule dates, advance pipeline stages, or skip completed interactions.
          </p>
        </div>

        <button
          onClick={() => setModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-white bg-gradient-to-r from-emerald-600 to-teal-700 hover:opacity-95 shadow-sm shadow-emerald-600/20 transition-all cursor-pointer"
        >
          <FaPlus className="text-xs" />
          <span>Schedule Task</span>
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="academy-card p-2.5 bg-white flex items-center gap-2 overflow-x-auto text-xs font-bold">
        {[
          { id: "all", label: "All Active", count: counts.pending },
          {
            id: "today",
            label: "Due Today",
            count: counts.today,
            badgeColor: "bg-emerald-600 text-white",
          },
          {
            id: "upcoming",
            label: "Upcoming",
            count: Math.max(0, counts.pending - counts.today - counts.overdue),
          },
          {
            id: "overdue",
            label: "Overdue",
            count: counts.overdue,
            badgeColor: "bg-rose-500 text-white",
          },
          { id: "completed", label: "Completed", count: counts.completed },
        ].map((tab) => {
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl transition-all cursor-pointer shrink-0 ${
                active
                  ? "bg-emerald-600 text-white shadow-xs"
                  : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              <span>{tab.label}</span>
              {tab.count !== undefined && tab.count >= 0 && (
                <span
                  className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                    active
                      ? "bg-white/25 text-white"
                      : tab.badgeColor || "bg-slate-200 text-slate-700"
                  }`}
                >
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Tasks List */}
      <div className="academy-card bg-white divide-y divide-slate-100">
        {isLoading ? (
          <div className="p-12 text-center text-xs text-slate-500">
            <div className="h-6 w-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
            Loading follow-up tasks...
          </div>
        ) : tasks.length === 0 ? (
          <div className="p-12 text-center">
            <div className="h-12 w-12 rounded-full bg-emerald-50 text-emerald-600 mx-auto flex items-center justify-center text-xl mb-3">
              <FaCheckCircle />
            </div>
            <h3 className="text-sm font-bold text-slate-800">
              No tasks in this view
            </h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              There are no follow-ups matching this filter. Schedule a task or set a follow-up on your leads.
            </p>
          </div>
        ) : (
          tasks.map((task) => {
            const isCompleted = task.status === "Completed";
            const isCancelled = task.status === "Cancelled";
            const isSkipped = task.status === "Skipped";

            const now = new Date();
            const taskDue = new Date(task.dueAt);
            const isOverdue =
              !isCompleted &&
              !isCancelled &&
              !isSkipped &&
              taskDue < now &&
              taskDue.toDateString() !== now.toDateString();
            const isDueToday =
              !isCompleted &&
              !isCancelled &&
              !isSkipped &&
              taskDue.toDateString() === now.toDateString();

            return (
              <div
                key={task._id}
                className="p-4 sm:p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4 hover:bg-slate-50/70 transition-all border-l-4"
                style={{
                  borderLeftColor: isOverdue
                    ? "#ef4444"
                    : isDueToday
                    ? "#10b981"
                    : isCompleted
                    ? "#14b8a6"
                    : "#cbd5e1",
                }}
              >
                {/* Left details */}
                <div className="flex items-start gap-3.5 min-w-0 flex-1">
                  <div
                    className={`p-2.5 rounded-xl text-sm shrink-0 mt-0.5 ${
                      task.type === "Call"
                        ? "bg-blue-50 text-blue-600"
                        : task.type === "Email"
                        ? "bg-purple-50 text-purple-600"
                        : "bg-emerald-50 text-emerald-700"
                    }`}
                  >
                    {task.type === "Call" ? (
                      <FaPhoneAlt />
                    ) : task.type === "Email" ? (
                      <FaEnvelope />
                    ) : (
                      <FaComments />
                    )}
                  </div>

                  <div className="flex flex-col min-w-0 space-y-1 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3
                        className={`text-sm font-bold ${
                          isCompleted
                            ? "line-through text-slate-400"
                            : "text-slate-900"
                        }`}
                      >
                        {task.title}
                      </h3>

                      {/* Due/Status Badges */}
                      {isDueToday && (
                        <span className="bg-emerald-100 text-emerald-800 border border-emerald-300 text-[10px] font-bold px-2 py-0.5 rounded-full inline-flex items-center gap-1">
                          <FaClock className="text-[9px]" /> Due Today
                        </span>
                      )}
                      {isOverdue && (
                        <span className="bg-rose-100 text-rose-700 border border-rose-300 text-[10px] font-bold px-2 py-0.5 rounded-full inline-flex items-center gap-1">
                          <FaExclamationCircle className="text-[9px]" /> Overdue
                        </span>
                      )}
                      {isCompleted && (
                        <span className="bg-emerald-100 text-emerald-700 text-[10px] font-bold px-2 py-0.5 rounded-full">
                          Completed
                        </span>
                      )}
                      {(isCancelled || isSkipped) && (
                        <span className="bg-slate-200 text-slate-600 text-[10px] font-bold px-2 py-0.5 rounded-full">
                          Skipped / Cancelled
                        </span>
                      )}

                      {/* Lead Status Dropdown Selector */}
                      {task.lead && (
                        <div className="inline-flex items-center gap-1.5 ml-auto sm:ml-0">
                          <span className="text-[10px] text-slate-400 font-semibold uppercase">Stage:</span>
                          <select
                            value={task.lead.status || "New"}
                            onChange={(e) =>
                              handleLeadStageChange(task, e.target.value)
                            }
                            title="Update Lead Stage"
                            className={`text-[11px] font-bold px-2 py-0.5 rounded-lg border focus:outline-none cursor-pointer ${getStageBadgeClass(
                              task.lead.status
                            )}`}
                          >
                            {LEAD_STAGES.map((st) => (
                              <option key={st} value={st}>
                                {st}
                              </option>
                            ))}
                          </select>
                        </div>
                      )}
                    </div>

                    {/* Associated Lead details */}
                    <div className="flex items-center gap-3 text-xs text-slate-600 flex-wrap">
                      <span className="font-semibold text-slate-700">
                        Lead:{" "}
                        {task.lead ? (
                          <Link
                            href="/leads"
                            className="font-bold text-emerald-700 hover:underline"
                          >
                            {task.lead.fullName}{" "}
                            {task.lead.company ? `(${task.lead.company})` : ""}
                          </Link>
                        ) : (
                          "No associated lead"
                        )}
                      </span>

                      {task.lead?.phone && (
                        <a
                          href={`tel:${task.lead.phone}`}
                          className="inline-flex items-center gap-1 text-[11px] text-slate-500 hover:text-emerald-700 font-medium"
                          title="Click to call"
                        >
                          <FaPhoneAlt className="text-[9px] text-emerald-600" />
                          <span>{task.lead.phone}</span>
                        </a>
                      )}

                      {task.lead?.email && (
                        <a
                          href={`mailto:${task.lead.email}`}
                          className="inline-flex items-center gap-1 text-[11px] text-slate-500 hover:text-emerald-700 font-medium"
                          title="Click to send email"
                        >
                          <FaEnvelope className="text-[9px] text-emerald-600" />
                          <span>{task.lead.email}</span>
                        </a>
                      )}
                    </div>

                    {/* Requirements & Scope */}
                    {task.lead?.requirements && (
                      <div className="flex items-start gap-1.5 text-[11px] text-slate-700 bg-slate-50 border border-slate-200/70 p-2 rounded-xl mt-1 max-w-xl">
                        <span className="font-extrabold text-emerald-800 text-[9px] uppercase tracking-wider shrink-0 bg-emerald-100 px-1.5 py-0.5 rounded">
                          Scope
                        </span>
                        <span className="line-clamp-2" title={task.lead.requirements}>
                          {task.lead.requirements}
                        </span>
                      </div>
                    )}

                    {/* Task Specific Notes */}
                    {task.notes && (
                      <p className="text-[11px] text-slate-500 italic mt-0.5">
                        Task Note: "{task.notes}"
                      </p>
                    )}
                  </div>
                </div>

                {/* Right meta and action controls */}
                <div className="flex flex-wrap items-center gap-2.5 sm:gap-3 shrink-0 justify-between lg:justify-end pt-2 lg:pt-0 border-t lg:border-t-0 border-slate-100">
                  {/* Due Date Display */}
                  <div className="text-left lg:text-right text-xs pr-1">
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">
                      Scheduled For
                    </span>
                    <span
                      className={`font-bold ${
                        isOverdue
                          ? "text-rose-600"
                          : isDueToday
                          ? "text-emerald-700"
                          : "text-slate-700"
                      }`}
                    >
                      {formatDueDisplay(task.dueAt)}
                    </span>
                  </div>

                  {!isCompleted && !isCancelled && !isSkipped && (
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {/* Option to assign new date / next follow up that */}
                      <button
                        onClick={() => openRescheduleModal(task)}
                        title="Assign new date or reschedule follow-up"
                        className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-emerald-50 text-slate-700 hover:text-emerald-700 text-xs font-bold border border-slate-200 transition-all cursor-pointer"
                      >
                        <FaCalendarAlt className="text-[11px] text-emerald-600" />
                        <span>Reschedule</span>
                      </button>

                      {/* Option to Skip */}
                      <button
                        onClick={() => {
                          if (
                            confirm(
                              `Skip follow-up for '${
                                task.lead?.fullName || task.title
                              }'? This will remove it from active tasks.`
                            )
                          ) {
                            skipTaskMutation.mutate({
                              taskId: task._id,
                              reason: "Skipped by user",
                            });
                          }
                        }}
                        disabled={skipTaskMutation.isPending}
                        title="Skip this follow-up"
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-amber-50 text-slate-600 hover:text-amber-700 text-xs font-semibold border border-slate-200 transition-all cursor-pointer"
                      >
                        <FaForward className="text-[10px]" />
                        <span>Skip</span>
                      </button>

                      {/* Option to Complete */}
                      <button
                        onClick={() => completeTaskMutation.mutate(task._id)}
                        disabled={completeTaskMutation.isPending}
                        title="Mark Complete"
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
                      >
                        <FaCheck className="text-[10px]" />
                        <span>Done</span>
                      </button>
                    </div>
                  )}

                  {/* Delete Task */}
                  <button
                    onClick={() => {
                      if (confirm("Delete this follow-up task completely?")) {
                        deleteTaskMutation.mutate(task._id);
                      }
                    }}
                    title="Delete Task"
                    className="p-2 text-slate-300 hover:text-rose-600 transition-colors cursor-pointer rounded-lg hover:bg-rose-50"
                  >
                    <FaTrash className="text-xs" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Reschedule / Assign New Date Modal */}
      {rescheduleModalTask && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="academy-card bg-white w-full max-w-md p-5 sm:p-6 shadow-2xl relative animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
                  <FaCalendarCheck />
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-900">
                    Assign New Follow-up Date
                  </h2>
                  <p className="text-[11px] text-slate-500">
                    {rescheduleModalTask.lead
                      ? rescheduleModalTask.lead.fullName
                      : rescheduleModalTask.title}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setRescheduleModalTask(null)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
              >
                <FaTimes />
              </button>
            </div>

            <form
              onSubmit={handleRescheduleSubmit}
              className="mt-4 space-y-3.5 text-xs"
            >
              <div>
                <label className="block font-bold text-slate-700 mb-1.5">
                  Quick Date Presets:
                </label>
                <div className="flex items-center gap-1.5 flex-wrap">
                  {[
                    { id: "today", label: "Later Today (+4h)" },
                    { id: "1d", label: "Tomorrow (+1d)" },
                    { id: "2d", label: "In 2 Days (+2d)" },
                    { id: "3d", label: "In 3 Days (+3d)" },
                    { id: "7d", label: "In 1 Week (+7d)" },
                  ].map((p) => {
                    const active = reschedulePreset === p.id;
                    return (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => applyReschedulePreset(p.id)}
                        className={`px-2.5 py-1 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                          active
                            ? "bg-emerald-600 text-white border-emerald-600 shadow-2xs"
                            : "bg-white text-slate-700 border-slate-200 hover:bg-emerald-50"
                        }`}
                      >
                        {p.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Selected Follow-up Date & Time *
                </label>
                <input
                  type="datetime-local"
                  required
                  value={rescheduleDate}
                  onChange={(e) => {
                    setReschedulePreset("custom");
                    setRescheduleDate(e.target.value);
                  }}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Notes / Reason for Reschedule (Optional)
                </label>
                <textarea
                  rows="2"
                  value={rescheduleNotes}
                  onChange={(e) => setRescheduleNotes(e.target.value)}
                  placeholder="e.g. Client requested callback tomorrow afternoon after internal meeting..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setRescheduleModalTask(null)}
                  className="px-3.5 py-2 rounded-xl bg-slate-100 text-slate-600 font-semibold cursor-pointer hover:bg-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={rescheduleTaskMutation.isPending}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-700 text-white font-bold hover:opacity-95 cursor-pointer disabled:opacity-50"
                >
                  {rescheduleTaskMutation.isPending
                    ? "Updating Date..."
                    : "Save Follow-up Date"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Schedule Task Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="academy-card bg-white w-full max-w-md p-5 sm:p-6 shadow-2xl relative">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h2 className="text-base font-bold text-slate-900">
                Schedule Follow-up Task
              </h2>
              <button
                onClick={() => setModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
              >
                <FaTimes />
              </button>
            </div>

            <form
              onSubmit={handleCreateSubmit}
              className="mt-4 space-y-3.5 text-xs"
            >
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Task Title *
                </label>
                <input
                  type="text"
                  required
                  value={taskForm.title}
                  onChange={(e) =>
                    setTaskForm({ ...taskForm, title: e.target.value })
                  }
                  placeholder="e.g. Call client regarding contract proposal"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Associate with Lead *
                </label>
                <select
                  required
                  value={taskForm.leadId}
                  onChange={(e) =>
                    setTaskForm({ ...taskForm, leadId: e.target.value })
                  }
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
                >
                  <option value="">Select a prospective client...</option>
                  {(leadsData || []).map((lead) => (
                    <option key={lead._id} value={lead._id}>
                      {lead.fullName} ({lead.company || "No company"})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Interaction Type
                  </label>
                  <select
                    value={taskForm.type}
                    onChange={(e) =>
                      setTaskForm({ ...taskForm, type: e.target.value })
                    }
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
                  >
                    <option value="Call">Phone Call</option>
                    <option value="Email">Email Follow-up</option>
                    <option value="Meeting">Online / Physical Meeting</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Priority
                  </label>
                  <select
                    value={taskForm.priority}
                    onChange={(e) =>
                      setTaskForm({ ...taskForm, priority: e.target.value })
                    }
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1.5 p-3 bg-slate-50/80 rounded-xl border border-slate-200/80">
                <div className="flex items-center justify-between">
                  <label className="block font-bold text-slate-700">
                    Due Date & Time *
                  </label>
                  {taskForm.dueAt && (
                    <span className="text-[11px] font-semibold text-emerald-700">
                      📅{" "}
                      {new Date(taskForm.dueAt).toLocaleString([], {
                        dateStyle: "medium",
                        timeStyle: "short",
                      })}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-1.5 flex-wrap">
                  {[
                    { id: "today", label: "Later Today" },
                    { id: "1d", label: "Tomorrow (+1d)" },
                    { id: "2d", label: "In 2 Days (+2d)" },
                    { id: "3d", label: "In 3 Days (+3d)" },
                    { id: "7d", label: "In 1 Week (+7d)" },
                  ].map((p) => {
                    const active = activeDuePreset === p.id;
                    return (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => applyTaskDuePreset(p.id)}
                        className={`px-2 py-1 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                          active
                            ? "bg-emerald-600 text-white border-emerald-600 shadow-2xs"
                            : "bg-white text-slate-700 border-slate-200 hover:bg-emerald-50"
                        }`}
                      >
                        {p.label}
                      </button>
                    );
                  })}
                </div>

                <input
                  type="datetime-local"
                  required
                  value={taskForm.dueAt}
                  onChange={(e) => {
                    setActiveDuePreset("custom");
                    setTaskForm({ ...taskForm, dueAt: e.target.value });
                  }}
                  className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Notes (Optional)
                </label>
                <textarea
                  rows="2"
                  value={taskForm.notes}
                  onChange={(e) =>
                    setTaskForm({ ...taskForm, notes: e.target.value })
                  }
                  placeholder="Key discussion points or questions to ask..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-3.5 py-2 rounded-xl bg-slate-100 text-slate-600 font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createTaskMutation.isPending}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-700 text-white font-bold hover:opacity-95 cursor-pointer disabled:opacity-50"
                >
                  {createTaskMutation.isPending
                    ? "Scheduling..."
                    : "Schedule Follow-up"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
