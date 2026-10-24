"use client";

import { useState } from "react";
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
} from "react-icons/fa";
import { toast } from "sonner";
import api from "@/lib/apiInstance";
import useAuthStore from "@/store/authStore";

export default function TasksView() {
  const queryClient = useQueryClient();
  const user = useAuthStore((state) => state.user);

  const [activeTab, setActiveTab] = useState("all"); // 'all' | 'today' | 'upcoming' | 'overdue' | 'completed'
  const [modalOpen, setModalOpen] = useState(false);

  // Form state
  const [taskForm, setTaskForm] = useState({
    title: "",
    leadId: "",
    type: "Call",
    priority: "Medium",
    dueAt: "",
    notes: "",
  });
  const [activeDuePreset, setActiveDuePreset] = useState("1d");

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

    const year = target.getFullYear();
    const month = String(target.getMonth() + 1).padStart(2, "0");
    const day = String(target.getDate()).padStart(2, "0");
    const hours = String(target.getHours()).padStart(2, "0");
    const mins = String(target.getMinutes()).padStart(2, "0");
    const formatted = `${year}-${month}-${day}T${hours}:${mins}`;

    setTaskForm((prev) => ({ ...prev, dueAt: formatted }));
  };

  // Query: Get tasks
  const { data, isLoading } = useQuery({
    queryKey: ["tasks", activeTab],
    queryFn: async () => {
      const res = await api.get(`/tasks?filter=${activeTab}`);
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

  // Mutation: Complete task
  const completeTaskMutation = useMutation({
    mutationFn: async (taskId) => {
      const res = await api.patch(`/tasks/${taskId}/complete`);
      return res.data;
    },
    onSuccess: () => {
      toast.success("Task completed!");
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-summary"] });
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || "Failed to complete task");
    },
  });

  // Mutation: Cancel task
  const cancelTaskMutation = useMutation({
    mutationFn: async (taskId) => {
      const res = await api.patch(`/tasks/${taskId}/cancel`);
      return res.data;
    },
    onSuccess: () => {
      toast.info("Task cancelled");
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-summary"] });
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

  const tasks = data?.tasks || [];
  const counts = data?.counts || { pending: 0, overdue: 0, today: 0, completed: 0 };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-1">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Tasks & Follow-ups
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Stay on top of scheduled calls, emails, and meetings with prospective clients.
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
      <div className="academy-card p-3 bg-white flex items-center gap-2 overflow-x-auto text-xs font-bold">
        {[
          { id: "all", label: "All Active", count: counts.pending },
          { id: "today", label: "Due Today", count: counts.today, badgeColor: "bg-emerald-600 text-white" },
          { id: "upcoming", label: "Upcoming", count: counts.pending - counts.today - counts.overdue },
          { id: "overdue", label: "Overdue", count: counts.overdue, badgeColor: "bg-rose-500 text-white" },
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
                  className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                    active
                      ? "bg-white/20 text-white"
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
            <h3 className="text-sm font-bold text-slate-800">No tasks in this view</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              There are no follow-ups matching this filter. Schedule a task to keep deals moving forward.
            </p>
          </div>
        ) : (
          tasks.map((task) => {
            const isCompleted = task.status === "Completed";
            const isCancelled = task.status === "Cancelled";
            const isOverdue =
              !isCompleted &&
              !isCancelled &&
              new Date(task.dueAt) < new Date();

            return (
              <div
                key={task._id}
                className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/60 transition-all"
              >
                <div className="flex items-start gap-3.5 min-w-0">
                  <div
                    className={`p-2.5 rounded-xl text-sm shrink-0 ${
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

                  <div className="flex flex-col min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3
                        className={`text-sm font-bold ${
                          isCompleted ? "line-through text-slate-400" : "text-slate-900"
                        }`}
                      >
                        {task.title}
                      </h3>
                      {isOverdue && (
                        <span className="bg-rose-100 text-rose-700 text-[10px] font-bold px-2 py-0.5 rounded-full">
                          Overdue
                        </span>
                      )}
                      {isCompleted && (
                        <span className="bg-emerald-100 text-emerald-700 text-[10px] font-bold px-2 py-0.5 rounded-full">
                          Completed
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-slate-500 mt-0.5 truncate">
                      Lead:{" "}
                      {task.lead ? (
                        <Link
                          href="/leads"
                          className="font-bold text-emerald-700 hover:underline"
                        >
                          {task.lead.fullName} ({task.lead.company || "No company"})
                        </Link>
                      ) : (
                        "No associated lead"
                      )}
                    </p>

                    {task.notes && (
                      <p className="text-[11px] text-slate-600 mt-1 italic">
                        "{task.notes}"
                      </p>
                    )}
                  </div>
                </div>

                {/* Right meta and actions */}
                <div className="flex items-center gap-3 sm:gap-4 shrink-0 justify-between sm:justify-end">
                  <div className="text-right text-xs">
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Due Date</span>
                    <span className="font-semibold text-slate-700">
                      {new Date(task.dueAt).toLocaleString([], {
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>

                  {!isCompleted && !isCancelled && (
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => completeTaskMutation.mutate(task._id)}
                        title="Mark Complete"
                        className="p-2 rounded-xl bg-emerald-50 text-emerald-700 hover:bg-emerald-100 text-xs font-bold transition-all cursor-pointer"
                      >
                        <FaCheck />
                      </button>
                      <button
                        onClick={() => cancelTaskMutation.mutate(task._id)}
                        title="Cancel Task"
                        className="p-2 rounded-xl bg-slate-100 text-slate-500 hover:bg-slate-200 text-xs transition-all cursor-pointer"
                      >
                        <FaBan />
                      </button>
                    </div>
                  )}

                  <button
                    onClick={() => {
                      if (confirm("Delete this follow-up task?")) {
                        deleteTaskMutation.mutate(task._id);
                      }
                    }}
                    title="Delete"
                    className="p-2 text-slate-300 hover:text-rose-600 transition-colors cursor-pointer"
                  >
                    <FaTrash className="text-xs" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Schedule Task Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="academy-card bg-white w-full max-w-md p-5 sm:p-6 shadow-2xl relative">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h2 className="text-base font-bold text-slate-900">Schedule Follow-up Task</h2>
              <button
                onClick={() => setModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <FaTimes />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="mt-4 space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Task Title *</label>
                <input
                  type="text"
                  required
                  value={taskForm.title}
                  onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })}
                  placeholder="e.g. Call client regarding contract proposal"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Associate with Lead *</label>
                <select
                  required
                  value={taskForm.leadId}
                  onChange={(e) => setTaskForm({ ...taskForm, leadId: e.target.value })}
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
                  <label className="block font-bold text-slate-700 mb-1">Interaction Type</label>
                  <select
                    value={taskForm.type}
                    onChange={(e) => setTaskForm({ ...taskForm, type: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
                  >
                    <option value="Call">Phone Call</option>
                    <option value="Email">Email Follow-up</option>
                    <option value="Meeting">Online / Physical Meeting</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Priority</label>
                  <select
                    value={taskForm.priority}
                    onChange={(e) => setTaskForm({ ...taskForm, priority: e.target.value })}
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
                  <label className="block font-bold text-slate-700">Due Date & Time *</label>
                  {taskForm.dueAt && (
                    <span className="text-[11px] font-semibold text-emerald-700">
                      📅 {new Date(taskForm.dueAt).toLocaleString([], { dateStyle: "medium", timeStyle: "short" })}
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
                <label className="block font-bold text-slate-700 mb-1">Notes (Optional)</label>
                <textarea
                  rows="2"
                  value={taskForm.notes}
                  onChange={(e) => setTaskForm({ ...taskForm, notes: e.target.value })}
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
                  {createTaskMutation.isPending ? "Scheduling..." : "Schedule Follow-up"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
