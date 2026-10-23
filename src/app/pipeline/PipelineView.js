"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  FaLayerGroup,
  FaRupeeSign,
  FaClock,
  FaChevronRight,
  FaChevronLeft,
  FaCheck,
  FaTimes,
  FaFilter,
} from "react-icons/fa";
import { toast } from "sonner";
import api from "@/lib/apiInstance";
import useAuthStore from "@/store/authStore";

const STAGES = [
  { id: "New", label: "New Leads", color: "border-t-slate-400 text-slate-800 bg-slate-50" },
  { id: "Contacted", label: "Contacted", color: "border-t-blue-500 text-blue-900 bg-blue-50/40" },
  { id: "Meeting Scheduled", label: "Meeting Scheduled", color: "border-t-cyan-500 text-cyan-900 bg-cyan-50/40" },
  { id: "Qualified", label: "Qualified", color: "border-t-amber-500 text-amber-900 bg-amber-50/40" },
  { id: "Proposal Sent", label: "Proposal Sent", color: "border-t-purple-500 text-purple-900 bg-purple-50/40" },
  { id: "In Negotiation", label: "In Negotiation", color: "border-t-indigo-500 text-indigo-900 bg-indigo-50/40" },
  { id: "Won", label: "Won Deals", color: "border-t-emerald-500 text-emerald-900 bg-emerald-50/40" },
  { id: "Lost", label: "Lost Deals", color: "border-t-rose-400 text-rose-900 bg-rose-50/40" },
  { id: "On Hold", label: "On Hold", color: "border-t-orange-400 text-orange-900 bg-orange-50/40" },
];

export default function PipelineView() {
  const queryClient = useQueryClient();
  const user = useAuthStore((state) => state.user);

  // Lost modal state
  const [lostModalOpen, setLostModalOpen] = useState(false);
  const [pendingLeadId, setPendingLeadId] = useState(null);
  const [lostReasonInput, setLostReasonInput] = useState("");

  // Fetch all leads for pipeline
  const { data, isLoading } = useQuery({
    queryKey: ["pipeline-leads"],
    queryFn: async () => {
      const res = await api.get("/leads?limit=100");
      return res.data?.leads || [];
    },
  });

  // Mutation: Update Lead Status
  const updateStatusMutation = useMutation({
    mutationFn: async ({ leadId, status, lostReason }) => {
      const res = await api.patch(`/leads/${leadId}/status`, { status, lostReason });
      return res.data;
    },
    onSuccess: (data) => {
      toast.success(data.message);
      queryClient.invalidateQueries({ queryKey: ["pipeline-leads"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-summary"] });
      setLostModalOpen(false);
      setPendingLeadId(null);
      setLostReasonInput("");
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || "Failed to update stage.");
    },
  });

  const handleStageChange = (leadId, targetStage) => {
    if (targetStage === "Lost") {
      setPendingLeadId(leadId);
      setLostReasonInput("");
      setLostModalOpen(true);
      return;
    }

    updateStatusMutation.mutate({
      leadId,
      status: targetStage,
    });
  };

  const handleLostSubmit = (e) => {
    e.preventDefault();
    if (!lostReasonInput.trim()) {
      toast.error("Please enter a reason for marking this lead as lost");
      return;
    }

    updateStatusMutation.mutate({
      leadId: pendingLeadId,
      status: "Lost",
      lostReason: lostReasonInput.trim(),
    });
  };

  const leads = data || [];

  return (
    <div className="space-y-6 max-w-full mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-1">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Sales Pipeline
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Visual Kanban board showing deals progression through each milestone.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-500">
            Total Pipeline Deals: <strong className="text-slate-800">{leads.length}</strong>
          </span>
        </div>
      </div>

      {/* Kanban Board Container */}
      {isLoading ? (
        <div className="p-16 text-center text-xs text-slate-500">
          <div className="h-6 w-6 border-2 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
          Loading sales pipeline...
        </div>
      ) : (
        <div className="flex items-start gap-4 overflow-x-auto pb-6 select-none">
          {STAGES.map((col) => {
            const colLeads = leads.filter(
              (l) => l.status === col.id || (col.id === "Proposal Sent" && l.status === "Proposal")
            );
            const totalValue = colLeads.reduce(
              (acc, l) => acc + (Number(l.estimatedValue) || 0),
              0
            );

            return (
              <div
                key={col.id}
                className={`w-72 shrink-0 rounded-2xl border border-slate-200/90 bg-slate-50/70 p-3 flex flex-col min-h-[550px] border-t-4 ${col.color}`}
              >
                {/* Column Header */}
                <div className="flex items-center justify-between pb-2.5 mb-2.5 border-b border-slate-200/60">
                  <div className="flex flex-col">
                    <span className="font-bold text-xs text-slate-800 tracking-tight">
                      {col.label}
                    </span>
                    <span className="text-[11px] font-extrabold text-[#D6451B]">
                      ₹{totalValue.toLocaleString("en-IN")}
                    </span>
                  </div>
                  <span className="h-5 min-w-[20px] px-1.5 rounded-full bg-white border border-slate-200 text-slate-700 text-[10px] font-bold flex items-center justify-center shadow-2xs">
                    {colLeads.length}
                  </span>
                </div>

                {/* Cards List */}
                <div className="space-y-2.5 flex-1 overflow-y-auto">
                  {colLeads.map((lead) => (
                    <div
                      key={lead._id}
                      className="academy-card p-3.5 bg-white hover:border-orange-300 transition-all shadow-xs group"
                    >
                      {/* Priority pill and value */}
                      <div className="flex items-center justify-between mb-2">
                        <span
                          className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded-md ${
                            lead.priority === "High"
                              ? "bg-rose-50 text-rose-700 border border-rose-200"
                              : lead.priority === "Medium"
                              ? "bg-amber-50 text-amber-700 border border-amber-200"
                              : "bg-slate-100 text-slate-600"
                          }`}
                        >
                          {lead.priority}
                        </span>

                        <span className="font-extrabold text-xs text-slate-900">
                          ₹{Number(lead.estimatedValue || 0).toLocaleString("en-IN")}
                        </span>
                      </div>

                      {/* Lead Title & Company */}
                      <h4 className="font-bold text-xs text-slate-900 group-hover:text-[#D6451B] transition-colors leading-snug">
                        {lead.fullName}
                      </h4>
                      <p className="text-[11px] text-slate-500 truncate mt-0.5">
                        {lead.company || "No company"}
                      </p>

                      {/* Next follow-up tag */}
                      {lead.nextFollowUpAt && (
                        <div className="mt-2 text-[10px] text-slate-500 flex items-center gap-1">
                          <FaClock className="text-slate-400" />
                          <span>{new Date(lead.nextFollowUpAt).toLocaleDateString()}</span>
                        </div>
                      )}

                      {/* Lost reason if lost */}
                      {lead.status === "Lost" && lead.lostReason && (
                        <p className="mt-2 text-[10px] text-rose-600 bg-rose-50 p-1 rounded border border-rose-100 italic truncate">
                          Reason: {lead.lostReason}
                        </p>
                      )}

                      {/* Quick stage selector */}
                      <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px]">
                        <span className="text-[10px] text-slate-400">Move to:</span>
                        <select
                          value={lead.status}
                          onChange={(e) => handleStageChange(lead._id, e.target.value)}
                          className="text-[11px] font-semibold text-slate-700 bg-slate-50 border border-slate-200 rounded px-1.5 py-0.5 focus:outline-none focus:ring-1 focus:ring-orange-500"
                        >
                          {STAGES.map((s) => (
                            <option key={s.id} value={s.id}>
                              {s.id}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  ))}

                  {colLeads.length === 0 && (
                    <div className="h-28 border border-dashed border-slate-200 rounded-xl flex items-center justify-center text-[11px] text-slate-400">
                      Empty stage
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Lost Reason Modal */}
      {lostModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="academy-card bg-white w-full max-w-md p-5 sm:p-6 shadow-2xl">
            <h3 className="text-base font-bold text-slate-900 mb-1">
              Mark Lead as Lost
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Please enter the primary reason this deal was not won (required for CRM reporting).
            </p>

            <form onSubmit={handleLostSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Loss Reason *</label>
                <textarea
                  required
                  rows="3"
                  value={lostReasonInput}
                  onChange={(e) => setLostReasonInput(e.target.value)}
                  placeholder="e.g. Budget constraints, chose competitor, timing delayed to Q3..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-[#D6451B]"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setLostModalOpen(false)}
                  className="px-3.5 py-2 rounded-xl bg-slate-100 text-slate-600 font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={updateStatusMutation.isPending}
                  className="px-4 py-2 rounded-xl bg-rose-600 text-white font-bold hover:bg-rose-700 cursor-pointer disabled:opacity-50"
                >
                  {updateStatusMutation.isPending ? "Updating..." : "Confirm Lost Deal"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
