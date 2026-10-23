"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  FaUserPlus,
  FaShieldAlt,
  FaUserTie,
  FaCheckCircle,
  FaBan,
  FaTimes,
  FaEnvelope,
  FaPhone,
  FaTrophy,
  FaTasks,
} from "react-icons/fa";
import { toast } from "sonner";
import api from "@/lib/apiInstance";
import useAuthStore from "@/store/authStore";

export default function TeamView() {
  const queryClient = useQueryClient();
  const currentUser = useAuthStore((state) => state.user);

  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    password: "",
    role: "sales",
    phone: "",
  });

  // Query: Get team members
  const { data, isLoading } = useQuery({
    queryKey: ["team-members"],
    queryFn: async () => {
      const res = await api.get("/team");
      return res.data?.team || [];
    },
  });

  // Mutation: Create team member
  const createMemberMutation = useMutation({
    mutationFn: async (payload) => {
      const res = await api.post("/team", payload);
      return res.data;
    },
    onSuccess: (data) => {
      toast.success(data.message || "Team member added successfully");
      queryClient.invalidateQueries({ queryKey: ["team-members"] });
      setModalOpen(false);
      setForm({ fullName: "", email: "", password: "", role: "sales", phone: "" });
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || "Failed to add member");
    },
  });

  // Mutation: Toggle member status
  const toggleStatusMutation = useMutation({
    mutationFn: async (userId) => {
      const res = await api.patch(`/team/${userId}/status`);
      return res.data;
    },
    onSuccess: (data) => {
      toast.success(data.message);
      queryClient.invalidateQueries({ queryKey: ["team-members"] });
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || "Action failed");
    },
  });

  // Mutation: Change role
  const changeRoleMutation = useMutation({
    mutationFn: async ({ userId, role }) => {
      const res = await api.patch(`/team/${userId}`, { role });
      return res.data;
    },
    onSuccess: () => {
      toast.success("Role updated successfully");
      queryClient.invalidateQueries({ queryKey: ["team-members"] });
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || "Failed to update role");
    },
  });

  const handleCreateSubmit = (e) => {
    e.preventDefault();
    if (!form.fullName.trim() || !form.email.trim() || !form.password) {
      toast.error("Please enter a name, email, and initial password");
      return;
    }

    createMemberMutation.mutate({
      fullName: form.fullName.trim(),
      email: form.email.trim(),
      password: form.password,
      role: form.role,
      phone: form.phone.trim(),
    });
  };

  const team = data || [];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-1">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Team Management
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Manage sales representatives, account roles, and assignments.
          </p>
        </div>

        <button
          onClick={() => setModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-white bg-gradient-to-r from-orange-500 to-[#D6451B] hover:opacity-95 shadow-sm shadow-orange-500/20 transition-all cursor-pointer"
        >
          <FaUserPlus className="text-xs" />
          <span>Invite / Add Member</span>
        </button>
      </div>

      {/* Team Table */}
      <div className="academy-card bg-white overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center text-xs text-slate-500">
            <div className="h-6 w-6 border-2 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
            Loading team roster...
          </div>
        ) : team.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-400">
            No team members found.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/70 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  <th className="py-3 px-4">Member Name</th>
                  <th className="py-3 px-4">Role</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Assigned Leads</th>
                  <th className="py-3 px-4">Won Deals</th>
                  <th className="py-3 px-4">Pending Tasks</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {team.map((member) => {
                  const isSelf = member._id === currentUser?.id || member._id === currentUser?._id;
                  return (
                    <tr key={member._id} className="hover:bg-orange-50/20 transition-all">
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="h-9 w-9 rounded-xl bg-orange-100 text-[#D6451B] font-bold flex items-center justify-center shrink-0">
                            {member.fullName.charAt(0)}
                          </div>
                          <div className="flex flex-col min-w-0">
                            <span className="font-bold text-slate-900 flex items-center gap-1.5">
                              {member.fullName}
                              {isSelf && (
                                <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.2 rounded font-normal">
                                  You
                                </span>
                              )}
                            </span>
                            <span className="text-[11px] text-slate-500 truncate">
                              {member.email} {member.phone ? `• ${member.phone}` : ""}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <select
                          disabled={isSelf}
                          value={member.role}
                          onChange={(e) =>
                            changeRoleMutation.mutate({
                              userId: member._id,
                              role: e.target.value,
                            })
                          }
                          className="px-2.5 py-1 text-xs font-bold rounded-lg border border-slate-200 bg-slate-50 text-slate-800 focus:outline-none focus:ring-1 focus:ring-orange-500 disabled:opacity-70"
                        >
                          <option value="admin">Administrator</option>
                          <option value="sales">Sales Representative</option>
                        </select>
                      </td>

                      <td className="py-3.5 px-4">
                        <span
                          className={`academy-badge ${
                            member.isActive
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                              : "bg-rose-50 text-rose-700 border border-rose-200"
                          }`}
                        >
                          {member.isActive ? "Active" : "Deactivated"}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 font-bold text-slate-700">
                        {member.stats?.assignedLeads || 0}
                      </td>

                      <td className="py-3.5 px-4 font-bold text-emerald-600">
                        {member.stats?.wonLeads || 0}
                      </td>

                      <td className="py-3.5 px-4 font-bold text-slate-700">
                        {member.stats?.pendingTasks || 0}
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        {!isSelf && (
                          <button
                            onClick={() => toggleStatusMutation.mutate(member._id)}
                            className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                              member.isActive
                                ? "bg-rose-50 text-rose-600 hover:bg-rose-100"
                                : "bg-emerald-50 text-emerald-600 hover:bg-emerald-100"
                            }`}
                          >
                            {member.isActive ? "Deactivate" : "Activate"}
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Member Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="academy-card bg-white w-full max-w-md p-5 sm:p-6 shadow-2xl relative">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h2 className="text-base font-bold text-slate-900">Add Team Member</h2>
              <button
                onClick={() => setModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <FaTimes />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="mt-4 space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  value={form.fullName}
                  onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                  placeholder="e.g. Maya Lin"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-[#D6451B]"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Email Address *</label>
                <input
                  type="email"
                  required
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="maya@company.com"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-[#D6451B]"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Temporary Password *</label>
                <input
                  type="password"
                  required
                  minLength={6}
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  placeholder="••••••••••••"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-[#D6451B]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Role</label>
                  <select
                    value={form.role}
                    onChange={(e) => setForm({ ...form, role: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-[#D6451B]"
                  >
                    <option value="sales">Sales Rep</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Phone Number</label>
                  <input
                    type="text"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    placeholder="+1 (555) 000-0000"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-[#D6451B]"
                  />
                </div>
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
                  disabled={createMemberMutation.isPending}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-orange-500 to-[#D6451B] text-white font-bold hover:opacity-95 cursor-pointer disabled:opacity-50"
                >
                  {createMemberMutation.isPending ? "Adding..." : "Add Member"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
