"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  FaPlus,
  FaSearch,
  FaFilter,
  FaPhone,
  FaEnvelope,
  FaBuilding,
  FaClock,
  FaTag,
  FaTrash,
  FaTimes,
  FaChevronLeft,
  FaChevronRight,
  FaCheckCircle,
  FaMagic,
  FaStar,
  FaCalendarAlt,
  FaRupeeSign,
  FaEdit,
} from "react-icons/fa";
import { toast } from "sonner";
import api from "@/lib/apiInstance";
import useAuthStore from "@/store/authStore";

const ALL_STAGES = [
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

const STAGE_COLORS = {
  New: "bg-slate-100 text-slate-700 border-slate-200",
  Contacted: "bg-blue-50 text-blue-700 border-blue-200",
  "Meeting Scheduled": "bg-indigo-50 text-indigo-700 border-indigo-200",
  Qualified: "bg-amber-50 text-amber-700 border-amber-200",
  "Proposal Sent": "bg-purple-50 text-purple-700 border-purple-200",
  "In Negotiation": "bg-cyan-50 text-cyan-700 border-cyan-200",
  Won: "bg-emerald-50 text-emerald-700 border-emerald-200",
  Lost: "bg-rose-50 text-rose-700 border-rose-200",
  "On Hold": "bg-stone-100 text-stone-700 border-stone-300",
};

const PRIORITY_COLORS = {
  Low: "bg-slate-100 text-slate-600",
  Medium: "bg-amber-50 text-amber-700 border border-amber-200",
  High: "bg-rose-50 text-rose-700 border border-rose-200",
};

const STANDARD_SOURCES = [
  "Website",
  "WhatsApp",
  "Referral",
  "Google Search / Ads",
  "LinkedIn",
  "Instagram / Social Media",
  "Cold Outreach",
  "Inbound Call",
  "Custom / Other",
];

const BUILTIN_TEMPLATES = [
  {
    _id: "builtin-web-dev",
    name: "Full-Stack Web App",
    badge: "Next.js & MERN",
    estimatedValue: 75000,
    priority: "High",
    status: "New",
    source: "Website",
    tags: "nextjs, mern, full-stack, web-app",
    requirements:
      "Full-stack custom web application with Next.js 15, Node.js backend, MongoDB database, responsive Tailwind UI, JWT authentication, and administrative analytics dashboard.",
    followUpPreset: "1d",
    isDefault: true,
  },
  {
    _id: "builtin-ecommerce",
    name: "E-Commerce Store",
    badge: "Shopify / Custom",
    estimatedValue: 95000,
    priority: "High",
    status: "Qualified",
    source: "Google Search / Ads",
    tags: "ecommerce, payments, razorpay, storefront",
    requirements:
      "Modern e-commerce platform with product catalog, Razorpay / Stripe payment gateway integration, cart, order management, customer accounts, and automated invoice delivery.",
    followUpPreset: "2d",
    isDefault: true,
  },
  {
    _id: "builtin-whatsapp-crm",
    name: "WhatsApp CRM & Funnel",
    badge: "Automation",
    estimatedValue: 40000,
    priority: "High",
    status: "Meeting Scheduled",
    source: "WhatsApp",
    tags: "whatsapp, automation, chatbot, crm",
    requirements:
      "Official Meta WhatsApp Cloud API integration with automated 24/7 lead qualification chatbot, CRM lead sync, interactive button catalogs, and broadcast campaigns.",
    followUpPreset: "1d",
    isDefault: true,
  },
  {
    _id: "builtin-ui-ux",
    name: "UI/UX & Brand Redesign",
    badge: "Design",
    estimatedValue: 45000,
    priority: "Medium",
    status: "Contacted",
    source: "LinkedIn",
    tags: "ui-ux, figma, redesign, branding",
    requirements:
      "End-to-end design overhaul including brand identity alignment, high-fidelity Figma interactive wireframes, design system tokens, and mobile-first responsive pages.",
    followUpPreset: "3d",
    isDefault: true,
  },
  {
    _id: "builtin-seo-retainer",
    name: "Monthly SEO & Growth",
    badge: "Retainer",
    estimatedValue: 25000,
    priority: "Medium",
    status: "New",
    source: "Referral",
    tags: "seo, retainer, organic-traffic, content",
    requirements:
      "Monthly search engine optimization retainer: technical audit, Core Web Vitals fixes, target keyword mapping, high-intent blog content, and weekly performance rank reports.",
    followUpPreset: "2d",
    isDefault: true,
  },
  {
    _id: "builtin-mobile-app",
    name: "Mobile App MVP",
    badge: "iOS & Android",
    estimatedValue: 120000,
    priority: "High",
    status: "Meeting Scheduled",
    source: "Referral",
    tags: "mobile, react-native, ios, android",
    requirements:
      "Cross-platform mobile application MVP for iOS and Android using React Native / Flutter, push notifications, offline caching, and REST API synchronization.",
    followUpPreset: "1d",
    isDefault: true,
  },
];

export default function LeadsView() {
  const queryClient = useQueryClient();
  const user = useAuthStore((state) => state.user);

  // Filter and search states
  const [search, setSearch] = useState("");
  const [stageFilter, setStageFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [sourceFilter, setSourceFilter] = useState("all");
  const [sortBy, setSortBy] = useState("createdAt");
  const [order, setOrder] = useState("desc");
  const [page, setPage] = useState(1);

  // Modals & Drawer states
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [selectedLead, setSelectedLead] = useState(null);
  const [activeTab, setActiveTab] = useState("details"); // 'details' | 'activities' | 'tasks'

  // Activity form inside details drawer
  const [newActivityType, setNewActivityType] = useState("note");
  const [newActivitySummary, setNewActivitySummary] = useState("");
  const [newActivityDetails, setNewActivityDetails] = useState("");

  // Template state
  const [selectedTemplateId, setSelectedTemplateId] = useState(null);
  const [saveAsTemplate, setSaveAsTemplate] = useState(false);
  const [customTemplateName, setCustomTemplateName] = useState("");
  const [directTemplateModalOpen, setDirectTemplateModalOpen] = useState(false);
  const [directTemplateName, setDirectTemplateName] = useState("");

  // Follow-up state
  const [activeFollowUpPreset, setActiveFollowUpPreset] = useState("none");

  // Custom source state for form
  const [sourceDropdownValue, setSourceDropdownValue] = useState("Website");
  const [customSourceInput, setCustomSourceInput] = useState("");

  // Create lead form state
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    company: "",
    jobTitle: "",
    source: "Website",
    status: "New",
    priority: "Medium",
    estimatedValue: "",
    requirements: "",
    tags: "",
    nextFollowUpAt: "",
  });

  // Edit Lead Modal state
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingLeadId, setEditingLeadId] = useState(null);
  const [editFormData, setEditFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    company: "",
    jobTitle: "",
    source: "Website",
    status: "New",
    priority: "Medium",
    estimatedValue: "",
    requirements: "",
    tags: "",
    nextFollowUpAt: "",
    assignedTo: "",
    lostReason: "",
  });
  const [editSourceDropdownValue, setEditSourceDropdownValue] = useState("Website");
  const [editCustomSourceInput, setEditCustomSourceInput] = useState("");
  const [editActiveFollowUpPreset, setEditActiveFollowUpPreset] = useState("none");

  // Query: Team members (for lead assignment by admin)
  const { data: teamMembersData } = useQuery({
    queryKey: ["team-members"],
    queryFn: async () => {
      try {
        const res = await api.get("/team");
        return res.data?.users || [];
      } catch (e) {
        return [];
      }
    },
    enabled: user?.role === "admin",
  });
  const teamMembers = teamMembersData || [];

  // Query: Get Custom Templates from backend
  const { data: userTemplatesData } = useQuery({
    queryKey: ["templates"],
    queryFn: async () => {
      try {
        const res = await api.get("/templates");
        return res.data?.templates || [];
      } catch (err) {
        return [];
      }
    },
  });

  const customTemplates = userTemplatesData || [];

  // Mutation: Create Template
  const createTemplateMutation = useMutation({
    mutationFn: async (payload) => {
      const res = await api.post("/templates", payload);
      return res.data;
    },
    onSuccess: (data) => {
      toast.success(data.message || "Template saved successfully!");
      queryClient.invalidateQueries({ queryKey: ["templates"] });
      setSaveAsTemplate(false);
      setCustomTemplateName("");
      setDirectTemplateModalOpen(false);
      setDirectTemplateName("");
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || "Failed to save template.");
    },
  });

  // Mutation: Delete Template
  const deleteTemplateMutation = useMutation({
    mutationFn: async (templateId) => {
      const res = await api.delete(`/templates/${templateId}`);
      return res.data;
    },
    onSuccess: (data) => {
      toast.success(data.message || "Template removed");
      queryClient.invalidateQueries({ queryKey: ["templates"] });
      if (selectedTemplateId) setSelectedTemplateId(null);
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || "Failed to delete template.");
    },
  });

  // Follow-up calculation helper
  const applyFollowUpPreset = (preset) => {
    setActiveFollowUpPreset(preset);
    if (preset === "none") {
      setFormData((prev) => ({ ...prev, nextFollowUpAt: "" }));
      return;
    }

    const now = new Date();
    const target = new Date();

    if (preset === "today") {
      // 4 hours from now
      target.setTime(now.getTime() + 4 * 60 * 60 * 1000);
    } else if (preset === "1d") {
      // Tomorrow at 10:00 AM
      target.setDate(now.getDate() + 1);
      target.setHours(10, 0, 0, 0);
    } else if (preset === "2d") {
      // In 2 Days at 10:00 AM
      target.setDate(now.getDate() + 2);
      target.setHours(10, 0, 0, 0);
    } else if (preset === "3d") {
      // In 3 Days at 10:00 AM
      target.setDate(now.getDate() + 3);
      target.setHours(10, 0, 0, 0);
    } else if (preset === "7d") {
      // In 1 Week at 10:00 AM
      target.setDate(now.getDate() + 7);
      target.setHours(10, 0, 0, 0);
    }

    // Format local time YYYY-MM-DDTHH:mm
    const year = target.getFullYear();
    const month = String(target.getMonth() + 1).padStart(2, "0");
    const day = String(target.getDate()).padStart(2, "0");
    const hours = String(target.getHours()).padStart(2, "0");
    const mins = String(target.getMinutes()).padStart(2, "0");
    const formatted = `${year}-${month}-${day}T${hours}:${mins}`;

    setFormData((prev) => ({ ...prev, nextFollowUpAt: formatted }));
  };

  // Follow-up calculation helper for edit modal
  const applyEditFollowUpPreset = (preset) => {
    setEditActiveFollowUpPreset(preset);
    if (preset === "none") {
      setEditFormData((prev) => ({ ...prev, nextFollowUpAt: "" }));
      return;
    }

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

    setEditFormData((prev) => ({ ...prev, nextFollowUpAt: formatted }));
  };

  const handleOpenEditModal = (lead) => {
    setEditingLeadId(lead._id);
    const isStandardSource = STANDARD_SOURCES.includes(lead.source);
    setEditSourceDropdownValue(isStandardSource ? lead.source : "Custom / Other");
    setEditCustomSourceInput(isStandardSource ? "" : lead.source || "");
    setEditActiveFollowUpPreset("none");

    let formattedFollowUp = "";
    if (lead.nextFollowUpAt) {
      try {
        const d = new Date(lead.nextFollowUpAt);
        if (!isNaN(d.getTime())) {
          const pad = (n) => String(n).padStart(2, "0");
          formattedFollowUp = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
        }
      } catch (err) {
        formattedFollowUp = "";
      }
    }

    setEditFormData({
      fullName: lead.fullName || "",
      email: lead.email || "",
      phone: lead.phone || "",
      company: lead.company || "",
      jobTitle: lead.jobTitle || "",
      source: lead.source || "Website",
      status: lead.status || "New",
      priority: lead.priority || "Medium",
      estimatedValue:
        lead.estimatedValue !== undefined && lead.estimatedValue !== null
          ? String(lead.estimatedValue)
          : "",
      requirements: lead.requirements || "",
      tags: Array.isArray(lead.tags) ? lead.tags.join(", ") : lead.tags || "",
      nextFollowUpAt: formattedFollowUp,
      assignedTo: lead.assignedTo?._id || lead.assignedTo || "",
      lostReason: lead.lostReason || "",
    });
    setEditModalOpen(true);
  };

  const resetCreateForm = () => {
    setSelectedTemplateId(null);
    setSaveAsTemplate(false);
    setCustomTemplateName("");
    setActiveFollowUpPreset("none");
    setSourceDropdownValue("Website");
    setCustomSourceInput("");
    setFormData({
      fullName: "",
      email: "",
      phone: "",
      company: "",
      jobTitle: "",
      source: "Website",
      status: "New",
      priority: "Medium",
      estimatedValue: "",
      requirements: "",
      tags: "",
      nextFollowUpAt: "",
    });
  };

  const handleApplyTemplate = (template) => {
    setSelectedTemplateId(template._id || template.id);
    const tmplSource = template.source || "Website";
    const isStandard = STANDARD_SOURCES.filter((s) => s !== "Custom / Other").includes(tmplSource);

    if (isStandard) {
      setSourceDropdownValue(tmplSource);
      setCustomSourceInput("");
    } else {
      setSourceDropdownValue("Custom / Other");
      setCustomSourceInput(tmplSource);
    }

    const tagsString = Array.isArray(template.tags)
      ? template.tags.join(", ")
      : template.tags || "";

    setFormData((prev) => ({
      ...prev,
      estimatedValue: String(template.estimatedValue || ""),
      requirements: template.requirements || "",
      priority: template.priority || "Medium",
      status: template.status || "New",
      tags: tagsString,
      source: tmplSource,
    }));

    // Auto-apply follow-up rule stored in template
    if (template.followUpPreset) {
      applyFollowUpPreset(template.followUpPreset);
    } else {
      applyFollowUpPreset("1d");
    }

    toast.info(`Applied template: "${template.name}" (Follow-up: ${template.followUpPreset || "1d"}).`);
  };

  const handleClearTemplate = () => {
    setSelectedTemplateId(null);
    setFormData((prev) => ({
      ...prev,
      estimatedValue: "",
      requirements: "",
      tags: "",
      priority: "Medium",
      status: "New",
    }));
  };

  const handleSourceDropdownChange = (val) => {
    setSourceDropdownValue(val);
    if (val === "Custom / Other") {
      setFormData((prev) => ({ ...prev, source: customSourceInput || "" }));
    } else {
      setFormData((prev) => ({ ...prev, source: val }));
    }
  };

  const handleCustomSourceInputChange = (val) => {
    setCustomSourceInput(val);
    setFormData((prev) => ({ ...prev, source: val }));
  };

  const handleSaveDirectTemplate = (e) => {
    e.preventDefault();
    if (!directTemplateName.trim()) {
      toast.error("Please provide a template name");
      return;
    }

    const finalSource =
      sourceDropdownValue === "Custom / Other"
        ? customSourceInput.trim() || "Other"
        : formData.source || "Website";

    createTemplateMutation.mutate({
      name: directTemplateName.trim(),
      badge: "Custom",
      estimatedValue: Number(formData.estimatedValue) || 0,
      currency: "INR",
      priority: formData.priority,
      status: formData.status,
      source: finalSource,
      tags: formData.tags
        ? formData.tags.split(",").map((t) => t.trim()).filter(Boolean)
        : [],
      requirements: formData.requirements.trim(),
      followUpPreset: activeFollowUpPreset,
    });
  };

  // Query: Get Leads
  const { data, isLoading } = useQuery({
    queryKey: [
      "leads",
      page,
      search,
      stageFilter,
      priorityFilter,
      sourceFilter,
      sortBy,
      order,
    ],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: String(page),
        limit: "15",
        sortBy,
        order,
      });
      if (search) params.append("search", search);
      if (stageFilter !== "all") params.append("status", stageFilter);
      if (priorityFilter !== "all") params.append("priority", priorityFilter);
      if (sourceFilter !== "all") params.append("source", sourceFilter);

      const res = await api.get(`/leads?${params.toString()}`);
      return res.data;
    },
  });

  // Query: Lead activities (when lead is selected)
  const { data: activitiesData, isLoading: activitiesLoading } = useQuery({
    queryKey: ["lead-activities", selectedLead?._id],
    queryFn: async () => {
      if (!selectedLead?._id) return [];
      const res = await api.get(`/leads/${selectedLead._id}/activities`);
      return res.data?.activities || [];
    },
    enabled: !!selectedLead?._id,
  });

  // Mutation: Create Lead
  const createLeadMutation = useMutation({
    mutationFn: async (payload) => {
      const res = await api.post("/leads", payload);
      return res.data;
    },
    onSuccess: (data) => {
      toast.success(data.message || "Lead created successfully!");
      if (data.warning) {
        toast.info(data.warning);
      }
      queryClient.invalidateQueries({ queryKey: ["leads"] });
      queryClient.invalidateQueries({ queryKey: ["pipeline-leads"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-summary"] });
      setCreateModalOpen(false);
      resetCreateForm();
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || "Failed to create lead.");
    },
  });

  // Mutation: Update Lead Details
  const updateLeadMutation = useMutation({
    mutationFn: async ({ leadId, payload }) => {
      const res = await api.patch(`/leads/${leadId}`, payload);
      return res.data;
    },
    onSuccess: (data) => {
      toast.success(data.message || "Lead updated successfully!");
      queryClient.invalidateQueries({ queryKey: ["leads"] });
      queryClient.invalidateQueries({ queryKey: ["pipeline-leads"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-summary"] });
      if (selectedLead && selectedLead._id === editingLeadId) {
        setSelectedLead(data.lead);
        queryClient.invalidateQueries({ queryKey: ["lead-activities", selectedLead._id] });
      }
      setEditModalOpen(false);
      setEditingLeadId(null);
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || "Failed to update lead.");
    },
  });

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!editFormData.fullName.trim()) {
      toast.error("Lead full name is required");
      return;
    }

    const finalSource =
      editSourceDropdownValue === "Custom / Other"
        ? editCustomSourceInput.trim() || "Custom / Other"
        : editSourceDropdownValue;

    const payload = {
      fullName: editFormData.fullName.trim(),
      email: editFormData.email.trim(),
      phone: editFormData.phone.trim(),
      company: editFormData.company.trim(),
      jobTitle: editFormData.jobTitle.trim(),
      source: finalSource,
      status: editFormData.status,
      priority: editFormData.priority,
      estimatedValue: editFormData.estimatedValue ? Number(editFormData.estimatedValue) : 0,
      requirements: editFormData.requirements.trim(),
      tags: editFormData.tags
        ? editFormData.tags.split(",").map((t) => t.trim()).filter(Boolean)
        : [],
      nextFollowUpAt: editFormData.nextFollowUpAt
        ? new Date(editFormData.nextFollowUpAt).toISOString()
        : null,
      ...(user?.role === "admin" && { assignedTo: editFormData.assignedTo || null }),
      ...(editFormData.status === "Lost" && { lostReason: editFormData.lostReason.trim() }),
    };

    updateLeadMutation.mutate({ leadId: editingLeadId, payload });
  };

  // Mutation: Update Lead Status
  const updateStatusMutation = useMutation({
    mutationFn: async ({ leadId, status, lostReason }) => {
      const res = await api.patch(`/leads/${leadId}/status`, { status, lostReason });
      return res.data;
    },
    onSuccess: (data) => {
      toast.success(data.message);
      queryClient.invalidateQueries({ queryKey: ["leads"] });
      queryClient.invalidateQueries({ queryKey: ["pipeline-leads"] });
      queryClient.invalidateQueries({ queryKey: ["lead-activities", selectedLead?._id] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-summary"] });
      if (selectedLead && data.lead) {
        setSelectedLead(data.lead);
      }
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || "Failed to update stage.");
    },
  });

  // Mutation: Create Activity Note
  const addActivityMutation = useMutation({
    mutationFn: async ({ leadId, type, summary, details }) => {
      const res = await api.post(`/leads/${leadId}/activities`, {
        type,
        summary,
        details,
      });
      return res.data;
    },
    onSuccess: () => {
      toast.success("Activity recorded");
      queryClient.invalidateQueries({ queryKey: ["lead-activities", selectedLead?._id] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-summary"] });
      setNewActivitySummary("");
      setNewActivityDetails("");
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || "Failed to log activity.");
    },
  });

  // Mutation: Delete Lead
  const deleteLeadMutation = useMutation({
    mutationFn: async (leadId) => {
      const res = await api.delete(`/leads/${leadId}`);
      return res.data;
    },
    onSuccess: () => {
      toast.success("Lead removed from database");
      queryClient.invalidateQueries({ queryKey: ["leads"] });
      queryClient.invalidateQueries({ queryKey: ["pipeline-leads"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-summary"] });
      setSelectedLead(null);
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || "Failed to delete lead.");
    },
  });

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    if (!formData.fullName.trim()) {
      toast.error("Lead full name is required");
      return;
    }

    const finalSource =
      sourceDropdownValue === "Custom / Other"
        ? customSourceInput.trim() || "Other"
        : formData.source || "Website";

    // If "Save as template" is checked, save template too
    if (saveAsTemplate && customTemplateName.trim()) {
      try {
        await api.post("/templates", {
          name: customTemplateName.trim(),
          badge: "Custom",
          estimatedValue: Number(formData.estimatedValue) || 0,
          currency: "INR",
          priority: formData.priority,
          status: formData.status,
          source: finalSource,
          tags: formData.tags
            ? formData.tags.split(",").map((t) => t.trim()).filter(Boolean)
            : [],
          requirements: formData.requirements.trim(),
          followUpPreset: activeFollowUpPreset,
        });
        queryClient.invalidateQueries({ queryKey: ["templates"] });
        toast.success(`Template "${customTemplateName.trim()}" saved for future leads!`);
      } catch (err) {
        console.error("Failed to save template alongside lead", err);
      }
    }

    const payload = {
      ...formData,
      source: finalSource,
      currency: "INR",
      estimatedValue: Number(formData.estimatedValue) || 0,
      tags: formData.tags
        ? formData.tags.split(",").map((t) => t.trim()).filter(Boolean)
        : [],
    };

    createLeadMutation.mutate(payload);
  };

  const handleAddActivity = (e) => {
    e.preventDefault();
    if (!newActivitySummary.trim() || !selectedLead) return;

    addActivityMutation.mutate({
      leadId: selectedLead._id,
      type: newActivityType,
      summary: newActivitySummary.trim(),
      details: newActivityDetails.trim(),
    });
  };

  const leads = data?.leads || [];
  const pagination = data?.pagination || { total: 0, page: 1, limit: 15, pages: 1 };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Header & New Lead Button */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-1">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Lead Management
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Track, qualify, and advance opportunities through the 9-stage sales pipeline.
          </p>
        </div>

        <button
          onClick={() => {
            resetCreateForm();
            setCreateModalOpen(true);
          }}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-white bg-gradient-to-r from-orange-500 to-[#D6451B] hover:opacity-95 shadow-sm shadow-orange-500/20 transition-all cursor-pointer"
        >
          <FaPlus className="text-xs" />
          <span>Add New Lead</span>
        </button>
      </div>

      {/* Filter and Search Bar Controls */}
      <div className="academy-card p-4 sm:p-5 bg-white space-y-3.5">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
          {/* Search Input */}
          <div className="md:col-span-5 relative">
            <FaSearch className="absolute left-3.5 top-3.5 text-slate-400 text-xs" />
            <input
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder="Search by lead name, company, email, phone, tags..."
              className="w-full pl-9 pr-3.5 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-[#D6451B] transition-all"
            />
          </div>

          {/* Priority filter */}
          <div className="md:col-span-2">
            <select
              value={priorityFilter}
              onChange={(e) => {
                setPriorityFilter(e.target.value);
                setPage(1);
              }}
              className="w-full px-3 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-[#D6451B] transition-all"
            >
              <option value="all">All Priorities</option>
              <option value="High">High Priority</option>
              <option value="Medium">Medium Priority</option>
              <option value="Low">Low Priority</option>
            </select>
          </div>

          {/* Source filter */}
          <div className="md:col-span-2">
            <select
              value={sourceFilter}
              onChange={(e) => {
                setSourceFilter(e.target.value);
                setPage(1);
              }}
              className="w-full px-3 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-[#D6451B] transition-all"
            >
              <option value="all">All Sources</option>
              <option value="Website">Website</option>
              <option value="WhatsApp">WhatsApp</option>
              <option value="Referral">Referral</option>
              <option value="Google Search / Ads">Google Search / Ads</option>
              <option value="LinkedIn">LinkedIn</option>
              <option value="Instagram / Social Media">Instagram / Social Media</option>
              <option value="Cold Outreach">Cold Outreach</option>
              <option value="Inbound Call">Inbound Call</option>
            </select>
          </div>

          {/* Sort selector */}
          <div className="md:col-span-3">
            <select
              value={`${sortBy}-${order}`}
              onChange={(e) => {
                const [sb, ord] = e.target.value.split("-");
                setSortBy(sb);
                setOrder(ord);
              }}
              className="w-full px-3 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-[#D6451B] transition-all"
            >
              <option value="createdAt-desc">Newest First</option>
              <option value="createdAt-asc">Oldest First</option>
              <option value="estimatedValue-desc">Highest Deal Value (₹)</option>
              <option value="fullName-asc">Lead Name (A-Z)</option>
              <option value="nextFollowUpAt-asc">Next Follow-up Due</option>
            </select>
          </div>
        </div>

        {/* Stage Filter Pill Buttons */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 pt-1 text-xs">
          <span className="text-slate-400 font-semibold pr-2 shrink-0">Stage:</span>
          {["all", ...ALL_STAGES].map((stg) => {
            const active = stageFilter === stg;
            return (
              <button
                key={stg}
                onClick={() => {
                  setStageFilter(stg);
                  setPage(1);
                }}
                className={`px-3 py-1.5 rounded-full font-semibold transition-all shrink-0 cursor-pointer ${
                  active
                    ? "bg-[#D6451B] text-white shadow-xs"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {stg === "all" ? "All Stages" : stg}
              </button>
            );
          })}
        </div>
      </div>

      {/* Leads Table / Responsive Cards */}
      <div className="academy-card bg-white overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center text-xs text-slate-500">
            <div className="h-6 w-6 border-2 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
            Loading leads...
          </div>
        ) : leads.length === 0 ? (
          <div className="p-12 text-center">
            <div className="h-12 w-12 rounded-full bg-orange-50 text-[#D6451B] mx-auto flex items-center justify-center text-xl mb-3">
              <FaFilter />
            </div>
            <h3 className="text-sm font-bold text-slate-800">No leads in pipeline yet</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              Your database is clean. Click below to add a new prospective lead or apply a fast template.
            </p>
            <button
              onClick={() => {
                resetCreateForm();
                setCreateModalOpen(true);
              }}
              className="mt-4 px-4 py-2 rounded-xl text-xs font-bold text-white bg-[#D6451B] hover:opacity-95 cursor-pointer"
            >
              Add First Lead
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/70 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  <th className="py-3 px-4">Lead & Company</th>
                  <th className="py-3 px-4">Stage</th>
                  <th className="py-3 px-4">Deal Value (₹)</th>
                  <th className="py-3 px-4">Source</th>
                  <th className="py-3 px-4">Priority</th>
                  <th className="py-3 px-4">Assignee</th>
                  <th className="py-3 px-4">Next Follow-up</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {leads.map((lead) => (
                  <tr
                    key={lead._id}
                    onClick={() => {
                      setSelectedLead(lead);
                      setActiveTab("details");
                    }}
                    className="hover:bg-orange-50/30 transition-all cursor-pointer group"
                  >
                    <td className="py-3 px-4">
                      <div className="flex flex-col min-w-0">
                        <span className="font-bold text-slate-900 group-hover:text-[#D6451B] transition-colors">
                          {lead.fullName}
                        </span>
                        <span className="text-[11px] text-slate-500 truncate">
                          {lead.company || "No Company"} • {lead.email || lead.phone || "No direct contact"}
                        </span>
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      <span className={`academy-badge border ${STAGE_COLORS[lead.status] || "bg-slate-100 text-slate-700"}`}>
                        {lead.status}
                      </span>
                    </td>

                    <td className="py-3 px-4 font-bold text-slate-900">
                      ₹{Number(lead.estimatedValue || 0).toLocaleString("en-IN")}
                    </td>

                    <td className="py-3 px-4 text-slate-600 font-medium">
                      <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[11px]">
                        {lead.source || "Website"}
                      </span>
                    </td>

                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase ${PRIORITY_COLORS[lead.priority] || "bg-slate-100"}`}>
                        {lead.priority}
                      </span>
                    </td>

                    <td className="py-3 px-4 text-slate-600">
                      <div className="flex items-center gap-1.5">
                        <div className="h-6 w-6 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center text-[10px] font-bold">
                          {lead.assignedTo?.fullName?.charAt(0) || "U"}
                        </div>
                        <span className="truncate max-w-[100px]">
                          {lead.assignedTo?.fullName || "Unassigned"}
                        </span>
                      </div>
                    </td>

                    <td className="py-3 px-4 text-slate-500">
                      {lead.nextFollowUpAt ? (
                        <span className="text-[11px] font-medium text-slate-700 flex items-center gap-1">
                          <FaClock className="text-slate-400 text-[10px]" />
                          {new Date(lead.nextFollowUpAt).toLocaleDateString()}
                        </span>
                      ) : (
                        <span className="text-[11px] text-slate-400 italic">None set</span>
                      )}
                    </td>

                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOpenEditModal(lead);
                          }}
                          className="px-2.5 py-1 rounded-lg text-[11px] font-bold text-amber-700 bg-amber-50 hover:bg-amber-100 flex items-center gap-1 cursor-pointer transition-colors"
                          title="Edit Lead"
                        >
                          <FaEdit className="text-[10px]" />
                          <span>Edit</span>
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedLead(lead);
                            setActiveTab("details");
                          }}
                          className="px-2.5 py-1 rounded-lg text-[11px] font-bold text-[#D6451B] bg-orange-50 hover:bg-orange-100 cursor-pointer"
                        >
                          Details
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination bar */}
        {pagination.pages > 1 && (
          <div className="py-3 px-4 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between text-xs text-slate-500">
            <span>
              Showing {leads.length} of {pagination.total} leads
            </span>
            <div className="flex items-center gap-2">
              <button
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40"
              >
                <FaChevronLeft className="text-[10px]" />
              </button>
              <span className="font-semibold text-slate-700">
                Page {pagination.page} of {pagination.pages}
              </span>
              <button
                disabled={page >= pagination.pages}
                onClick={() => setPage((p) => Math.min(pagination.pages, p + 1))}
                className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40"
              >
                <FaChevronRight className="text-[10px]" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Create Lead Modal */}
      {createModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="academy-card bg-white w-full max-w-2xl p-5 sm:p-6 shadow-2xl relative my-8 max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h2 className="text-lg font-bold text-slate-900">Add New Prospective Lead</h2>
                <p className="text-xs text-slate-500">Pick a template or enter client details below.</p>
              </div>
              <button
                onClick={() => setCreateModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 cursor-pointer"
              >
                <FaTimes />
              </button>
            </div>

            {/* Quick Template Presets Bar */}
            <div className="mt-4 p-3.5 bg-gradient-to-r from-orange-50/90 to-amber-50/60 border border-orange-200/80 rounded-2xl space-y-2.5">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900">
                  <FaMagic className="text-[#D6451B]" />
                  <span>Deal Templates (Click to auto-fill):</span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setDirectTemplateModalOpen(true)}
                    className="text-[11px] font-bold text-[#D6451B] bg-white border border-orange-200 px-2.5 py-1 rounded-lg hover:bg-orange-50 transition-colors flex items-center gap-1 cursor-pointer"
                  >
                    <FaStar className="text-[10px]" />
                    <span>+ Save As Template</span>
                  </button>
                  {selectedTemplateId && (
                    <button
                      type="button"
                      onClick={handleClearTemplate}
                      className="text-[11px] text-slate-500 hover:text-slate-800 underline font-medium cursor-pointer"
                    >
                      Clear Preset
                    </button>
                  )}
                </div>
              </div>

              {/* Custom User Templates (if any) */}
              {customTemplates.length > 0 && (
                <div className="space-y-1">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-orange-800/80">
                    My Custom Templates:
                  </span>
                  <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
                    {customTemplates.map((tmpl) => {
                      const isSelected = selectedTemplateId === tmpl._id;
                      return (
                        <div
                          key={tmpl._id}
                          className={`shrink-0 rounded-xl border flex items-center transition-all ${
                            isSelected
                              ? "bg-[#D6451B] text-white border-[#D6451B] shadow-xs"
                              : "bg-white text-slate-700 border-amber-300 hover:bg-amber-50/50"
                          }`}
                        >
                          <button
                            type="button"
                            onClick={() => handleApplyTemplate(tmpl)}
                            className="px-2.5 py-1.5 text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
                          >
                            <FaStar className={`text-[10px] ${isSelected ? "text-amber-200" : "text-amber-500"}`} />
                            <span>{tmpl.name}</span>
                            <span
                              className={`text-[10px] px-1.5 py-0.2 rounded-md font-bold ${
                                isSelected ? "bg-white/20 text-white" : "bg-orange-100 text-[#D6451B]"
                              }`}
                            >
                              ₹{Number(tmpl.estimatedValue || 0).toLocaleString("en-IN")}
                            </span>
                            <span
                              className={`text-[9px] px-1 py-0.2 rounded font-semibold ${
                                isSelected ? "bg-white/20 text-white" : "bg-amber-100 text-amber-800"
                              }`}
                            >
                              +{tmpl.followUpPreset || "1d"}
                            </span>
                          </button>
                          <button
                            type="button"
                            title="Delete template"
                            onClick={(e) => {
                              e.stopPropagation();
                              if (confirm(`Delete template '${tmpl.name}'?`)) {
                                deleteTemplateMutation.mutate(tmpl._id);
                              }
                            }}
                            className={`p-1.5 pr-2 hover:opacity-80 cursor-pointer ${
                              isSelected ? "text-white/80" : "text-slate-400 hover:text-rose-600"
                            }`}
                          >
                            <FaTrash className="text-[9px]" />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Built-in Starter Templates */}
              <div className="space-y-1">
                {customTemplates.length > 0 && (
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500">
                    Starter Presets:
                  </span>
                )}
                <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
                  {BUILTIN_TEMPLATES.map((tmpl) => {
                    const isSelected = selectedTemplateId === tmpl._id;
                    return (
                      <button
                        key={tmpl._id}
                        type="button"
                        onClick={() => handleApplyTemplate(tmpl)}
                        className={`shrink-0 px-2.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 border transition-all cursor-pointer ${
                          isSelected
                            ? "bg-[#D6451B] text-white border-[#D6451B] shadow-xs"
                            : "bg-white text-slate-700 border-orange-200/80 hover:bg-orange-100/60"
                        }`}
                      >
                        <span>{tmpl.name}</span>
                        <span
                          className={`text-[10px] px-1.5 py-0.2 rounded-md font-bold ${
                            isSelected ? "bg-white/20 text-white" : "bg-orange-100 text-[#D6451B]"
                          }`}
                        >
                          ₹{tmpl.estimatedValue.toLocaleString("en-IN")}
                        </span>
                        <span
                          className={`text-[9px] px-1 py-0.2 rounded font-semibold ${
                            isSelected ? "bg-white/20 text-white" : "bg-orange-100/80 text-orange-800"
                          }`}
                        >
                          +{tmpl.followUpPreset || "1d"}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {selectedTemplateId && (
                <div className="flex items-center gap-1.5 text-[11px] text-emerald-800 bg-emerald-50/80 border border-emerald-200 px-2.5 py-1 rounded-lg">
                  <FaCheckCircle className="text-emerald-600 text-xs shrink-0" />
                  <span>
                    Template loaded! Deal value, project scope, tags & pipeline stage are filled. Just enter client contact details below.
                  </span>
                </div>
              )}
            </div>

            <form onSubmit={handleCreateSubmit} className="mt-4 space-y-3.5 text-xs">
              {/* Client Basic Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Client Full Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    placeholder="e.g. Vikram Sharma"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-[#D6451B]"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Company / Organization</label>
                  <input
                    type="text"
                    value={formData.company}
                    onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                    placeholder="e.g. ZenScale Technologies"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-[#D6451B]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Email Address</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="vikram@zenscale.com"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-[#D6451B]"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Phone / WhatsApp Number</label>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+91 98765 43210"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-[#D6451B]"
                  />
                </div>
              </div>

              {/* Source Select + Custom Input */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 bg-slate-50/80 rounded-xl border border-slate-100">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Lead Source Channel</label>
                  <select
                    value={sourceDropdownValue}
                    onChange={(e) => handleSourceDropdownChange(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-[#D6451B] font-medium"
                  >
                    {STANDARD_SOURCES.map((src) => (
                      <option key={src} value={src}>
                        {src}
                      </option>
                    ))}
                  </select>
                </div>

                {sourceDropdownValue === "Custom / Other" ? (
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      Type Custom Source *
                    </label>
                    <input
                      type="text"
                      required
                      value={customSourceInput}
                      onChange={(e) => handleCustomSourceInputChange(e.target.value)}
                      placeholder="e.g. BNI Chapter, Tech Expo 2026, Twitter DM..."
                      className="w-full px-3 py-2 bg-white border border-orange-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-[#D6451B]"
                    />
                  </div>
                ) : (
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Job Title / Designation</label>
                    <input
                      type="text"
                      value={formData.jobTitle}
                      onChange={(e) => setFormData({ ...formData, jobTitle: e.target.value })}
                      placeholder="e.g. Founder & CTO"
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-[#D6451B]"
                    />
                  </div>
                )}
              </div>

              {/* Pipeline Stage & Priority */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Initial Pipeline Stage</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-[#D6451B]"
                  >
                    {ALL_STAGES.map((stg) => (
                      <option key={stg} value={stg}>
                        {stg}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Deal Priority</label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-[#D6451B]"
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                  </select>
                </div>
              </div>

              {/* Deal Value in INR */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Estimated Deal Value (₹ INR)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 font-bold text-slate-400">₹</span>
                  <input
                    type="number"
                    min="0"
                    value={formData.estimatedValue}
                    onChange={(e) => setFormData({ ...formData, estimatedValue: e.target.value })}
                    placeholder="e.g. 75000"
                    className="w-full pl-8 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-[#D6451B] font-semibold"
                  />
                </div>
              </div>

              {/* Next Follow-up (1-Click Auto Presets + Custom Date) */}
              <div className="p-3 bg-slate-50/80 rounded-xl border border-slate-200/80 space-y-2">
                <div className="flex items-center justify-between flex-wrap gap-1">
                  <label className="block font-bold text-slate-800">
                    Next Follow-up Scheduling:
                  </label>
                  {formData.nextFollowUpAt && (
                    <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 flex items-center gap-1">
                      <FaCalendarAlt className="text-[10px]" />
                      <span>{new Date(formData.nextFollowUpAt).toLocaleString([], { dateStyle: "medium", timeStyle: "short" })}</span>
                    </span>
                  )}
                </div>

                {/* Auto Follow-up Pills */}
                <div className="flex items-center gap-1.5 flex-wrap">
                  {[
                    { id: "none", label: "No Follow-up" },
                    { id: "today", label: "Later Today (+4h)" },
                    { id: "1d", label: "Tomorrow (+1d)" },
                    { id: "2d", label: "In 2 Days (+2d)" },
                    { id: "3d", label: "In 3 Days (+3d)" },
                    { id: "7d", label: "In 1 Week (+7d)" },
                    { id: "custom", label: "Custom Date" },
                  ].map((p) => {
                    const active = activeFollowUpPreset === p.id;
                    return (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => applyFollowUpPreset(p.id)}
                        className={`px-2.5 py-1 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                          active
                            ? "bg-[#D6451B] text-white border-[#D6451B] shadow-2xs font-bold"
                            : "bg-white text-slate-700 border-slate-200 hover:bg-orange-50 hover:border-orange-200"
                        }`}
                      >
                        {p.label}
                      </button>
                    );
                  })}
                </div>

                {/* Date-time picker */}
                <div className="pt-1">
                  <input
                    type="datetime-local"
                    value={formData.nextFollowUpAt}
                    onChange={(e) => {
                      setActiveFollowUpPreset("custom");
                      setFormData({ ...formData, nextFollowUpAt: e.target.value });
                    }}
                    className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-[#D6451B]"
                  />
                </div>
              </div>

              {/* Tags */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">Tags (comma-separated)</label>
                <input
                  type="text"
                  value={formData.tags}
                  onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                  placeholder="e.g. web-app, nextjs, high-budget, enterprise"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-[#D6451B]"
                />
              </div>

              {/* Requirements */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">Client Requirements / Scope</label>
                <textarea
                  rows="3"
                  value={formData.requirements}
                  onChange={(e) => setFormData({ ...formData, requirements: e.target.value })}
                  placeholder="Notes about client requirements, project scope, deliverable milestones, etc."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-[#D6451B]"
                />
              </div>

              {/* Option to Save as a Template */}
              <div className="p-3.5 rounded-xl border border-dashed border-orange-300 bg-orange-50/50 space-y-2">
                <label className="flex items-center gap-2 cursor-pointer font-bold text-slate-800 text-xs">
                  <input
                    type="checkbox"
                    checked={saveAsTemplate}
                    onChange={(e) => setSaveAsTemplate(e.target.checked)}
                    className="rounded text-[#D6451B] focus:ring-orange-500 h-4 w-4"
                  />
                  <span>⭐ Also save these deal settings as a reusable template for future leads</span>
                </label>
                {saveAsTemplate && (
                  <div className="pt-1">
                    <input
                      type="text"
                      value={customTemplateName}
                      onChange={(e) => setCustomTemplateName(e.target.value)}
                      placeholder="Template Name (e.g. Custom MVP Package, E-Com Growth Retainer)..."
                      className="w-full px-3 py-2 bg-white border border-orange-300 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-[#D6451B]"
                    />
                    <span className="text-[10px] text-slate-500 mt-1 block">
                      This template will be saved to your account so you can apply it with 1 click anytime.
                    </span>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setCreateModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 bg-slate-100 hover:bg-slate-200 font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createLeadMutation.isPending}
                  className="px-5 py-2 rounded-xl text-white font-bold bg-gradient-to-r from-orange-500 to-[#D6451B] hover:opacity-95 shadow-xs cursor-pointer disabled:opacity-50"
                >
                  {createLeadMutation.isPending ? "Saving Lead..." : "Save Lead"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Direct Save As Template Modal */}
      {directTemplateModalOpen && (
        <div className="fixed inset-0 z-60 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="academy-card bg-white w-full max-w-md p-5 shadow-2xl relative">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <FaStar className="text-amber-500 text-sm" />
                <h3 className="text-sm font-bold text-slate-900">Save As Reusable Template</h3>
              </div>
              <button
                onClick={() => setDirectTemplateModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
              >
                <FaTimes />
              </button>
            </div>

            <form onSubmit={handleSaveDirectTemplate} className="mt-3.5 space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Template Name *</label>
                <input
                  type="text"
                  required
                  value={directTemplateName}
                  onChange={(e) => setDirectTemplateName(e.target.value)}
                  placeholder="e.g. Next.js SaaS MVP ₹75k"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-[#D6451B]"
                />
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-[11px] text-slate-600 space-y-1">
                <span className="font-bold text-slate-800 block">Values captured from current form:</span>
                <p>• Value: <strong>₹{Number(formData.estimatedValue || 0).toLocaleString("en-IN")}</strong></p>
                <p>• Priority: <strong>{formData.priority}</strong></p>
                <p>• Initial Stage: <strong>{formData.status}</strong></p>
                <p>• Follow-up Rule: <strong>{activeFollowUpPreset === "none" ? "None" : activeFollowUpPreset === "today" ? "Later Today (+4h)" : activeFollowUpPreset === "1d" ? "Tomorrow (+1d)" : activeFollowUpPreset === "2d" ? "In 2 Days (+2d)" : activeFollowUpPreset === "3d" ? "In 3 Days (+3d)" : activeFollowUpPreset === "7d" ? "In 1 Week (+7d)" : "Custom Date"}</strong></p>
                <p>• Source: <strong>{sourceDropdownValue === "Custom / Other" ? customSourceInput || "Other" : formData.source}</strong></p>
                {formData.requirements && <p className="truncate">• Scope: "{formData.requirements}"</p>}
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setDirectTemplateModalOpen(false)}
                  className="px-3.5 py-1.5 rounded-lg text-slate-600 bg-slate-100 font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createTemplateMutation.isPending}
                  className="px-4 py-1.5 rounded-lg text-white font-bold bg-[#D6451B] hover:opacity-95 cursor-pointer disabled:opacity-50"
                >
                  {createTemplateMutation.isPending ? "Saving..." : "Save Template"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Lead Modal */}
      {editModalOpen && (
        <div className="fixed inset-0 z-60 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="academy-card bg-white w-full max-w-2xl p-5 sm:p-6 shadow-2xl relative my-auto max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between pb-3.5 border-b border-slate-100 sticky -top-5 sm:-top-6 bg-white z-10 pt-1">
              <div className="flex items-center gap-2.5">
                <div className="h-9 w-9 rounded-xl bg-orange-100 text-[#D6451B] flex items-center justify-center text-sm font-bold">
                  <FaEdit />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Edit Lead Details</h3>
                  <p className="text-xs text-slate-500">Update contact information, pipeline stage, priority, and follow-up</p>
                </div>
              </div>
              <button
                onClick={() => setEditModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 cursor-pointer"
              >
                <FaTimes />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="mt-4 space-y-3.5 text-xs">
              {/* Full Name & Company */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Client Full Name *</label>
                  <input
                    type="text"
                    required
                    value={editFormData.fullName}
                    onChange={(e) => setEditFormData({ ...editFormData, fullName: e.target.value })}
                    placeholder="e.g. Vikram Sharma"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-[#D6451B]"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Company / Organization</label>
                  <input
                    type="text"
                    value={editFormData.company}
                    onChange={(e) => setEditFormData({ ...editFormData, company: e.target.value })}
                    placeholder="e.g. ZenScale Technologies"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-[#D6451B]"
                  />
                </div>
              </div>

              {/* Email & Phone */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Email Address</label>
                  <input
                    type="email"
                    value={editFormData.email}
                    onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })}
                    placeholder="vikram@zenscale.com"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-[#D6451B]"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Phone / WhatsApp Number</label>
                  <input
                    type="text"
                    value={editFormData.phone}
                    onChange={(e) => setEditFormData({ ...editFormData, phone: e.target.value })}
                    placeholder="+91 98765 43210"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-[#D6451B]"
                  />
                </div>
              </div>

              {/* Source & Job Title */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 bg-slate-50/80 rounded-xl border border-slate-100">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Lead Source Channel</label>
                  <select
                    value={editSourceDropdownValue}
                    onChange={(e) => {
                      const val = e.target.value;
                      setEditSourceDropdownValue(val);
                      if (val !== "Custom / Other") {
                        setEditFormData((prev) => ({ ...prev, source: val }));
                      }
                    }}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-[#D6451B] font-medium"
                  >
                    {STANDARD_SOURCES.map((src) => (
                      <option key={src} value={src}>
                        {src}
                      </option>
                    ))}
                  </select>
                </div>

                {editSourceDropdownValue === "Custom / Other" ? (
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      Type Custom Source *
                    </label>
                    <input
                      type="text"
                      required
                      value={editCustomSourceInput}
                      onChange={(e) => {
                        const val = e.target.value;
                        setEditCustomSourceInput(val);
                        setEditFormData((prev) => ({ ...prev, source: val }));
                      }}
                      placeholder="e.g. BNI Chapter, Tech Expo 2026..."
                      className="w-full px-3 py-2 bg-white border border-orange-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-[#D6451B]"
                    />
                  </div>
                ) : (
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Job Title / Designation</label>
                    <input
                      type="text"
                      value={editFormData.jobTitle}
                      onChange={(e) => setEditFormData({ ...editFormData, jobTitle: e.target.value })}
                      placeholder="e.g. Founder & CTO"
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-[#D6451B]"
                    />
                  </div>
                )}
              </div>

              {/* Stage & Priority */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Pipeline Stage</label>
                  <select
                    value={editFormData.status}
                    onChange={(e) => setEditFormData({ ...editFormData, status: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-[#D6451B] font-medium"
                  >
                    {ALL_STAGES.map((stg) => (
                      <option key={stg} value={stg}>
                        {stg}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Deal Priority</label>
                  <select
                    value={editFormData.priority}
                    onChange={(e) => setEditFormData({ ...editFormData, priority: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-[#D6451B] font-medium"
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                  </select>
                </div>
              </div>

              {/* Lost Reason if status is Lost */}
              {editFormData.status === "Lost" && (
                <div>
                  <label className="block font-bold text-rose-700 mb-1">Reason for Deal Lost</label>
                  <input
                    type="text"
                    value={editFormData.lostReason}
                    onChange={(e) => setEditFormData({ ...editFormData, lostReason: e.target.value })}
                    placeholder="e.g. Budget constraints, selected competitor, postponed"
                    className="w-full px-3 py-2 bg-rose-50 border border-rose-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 text-rose-900"
                  />
                </div>
              )}

              {/* Deal Value & Assignee (if admin) */}
              <div className={`grid grid-cols-1 ${user?.role === "admin" ? "sm:grid-cols-2" : ""} gap-3`}>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Estimated Deal Value (₹ INR)
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 font-bold text-slate-400">₹</span>
                    <input
                      type="number"
                      min="0"
                      value={editFormData.estimatedValue}
                      onChange={(e) => setEditFormData({ ...editFormData, estimatedValue: e.target.value })}
                      placeholder="e.g. 75000"
                      className="w-full pl-8 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-[#D6451B] font-semibold"
                    />
                  </div>
                </div>

                {user?.role === "admin" && (
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Assigned Team Representative</label>
                    <select
                      value={editFormData.assignedTo}
                      onChange={(e) => setEditFormData({ ...editFormData, assignedTo: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-[#D6451B]"
                    >
                      <option value="">Unassigned</option>
                      {teamMembers.map((member) => (
                        <option key={member._id} value={member._id}>
                          {member.fullName} ({member.role})
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              {/* Next Follow-up (1-Click Auto Presets + Custom Date) */}
              <div className="p-3 bg-slate-50/80 rounded-xl border border-slate-200/80 space-y-2">
                <div className="flex items-center justify-between flex-wrap gap-1">
                  <label className="block font-bold text-slate-800">
                    Next Follow-up Scheduling:
                  </label>
                  {editFormData.nextFollowUpAt && (
                    <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 flex items-center gap-1">
                      <FaCalendarAlt className="text-[10px]" />
                      <span>{new Date(editFormData.nextFollowUpAt).toLocaleString([], { dateStyle: "medium", timeStyle: "short" })}</span>
                    </span>
                  )}
                </div>

                {/* Auto Follow-up Pills */}
                <div className="flex items-center gap-1.5 flex-wrap">
                  {[
                    { id: "none", label: "No Follow-up" },
                    { id: "today", label: "Later Today (+4h)" },
                    { id: "1d", label: "Tomorrow (+1d)" },
                    { id: "2d", label: "In 2 Days (+2d)" },
                    { id: "3d", label: "In 3 Days (+3d)" },
                    { id: "7d", label: "In 1 Week (+7d)" },
                  ].map((p) => {
                    const active = editActiveFollowUpPreset === p.id;
                    return (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => applyEditFollowUpPreset(p.id)}
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all cursor-pointer ${
                          active
                            ? "bg-[#D6451B] text-white shadow-xs"
                            : "bg-white text-slate-700 border border-slate-200 hover:bg-slate-100"
                        }`}
                      >
                        {p.label}
                      </button>
                    );
                  })}
                </div>

                {/* Custom Date & Time Picker */}
                <div className="pt-1.5 flex items-center gap-2">
                  <input
                    type="datetime-local"
                    value={editFormData.nextFollowUpAt}
                    onChange={(e) => {
                      setEditActiveFollowUpPreset("custom");
                      setEditFormData({ ...editFormData, nextFollowUpAt: e.target.value });
                    }}
                    className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-[#D6451B]"
                  />
                  {editFormData.nextFollowUpAt && (
                    <button
                      type="button"
                      onClick={() => {
                        setEditActiveFollowUpPreset("none");
                        setEditFormData({ ...editFormData, nextFollowUpAt: "" });
                      }}
                      className="text-xs text-slate-500 hover:text-rose-600 underline cursor-pointer"
                    >
                      Clear
                    </button>
                  )}
                </div>
              </div>

              {/* Tags */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">Tags (Comma-separated)</label>
                <input
                  type="text"
                  value={editFormData.tags}
                  onChange={(e) => setEditFormData({ ...editFormData, tags: e.target.value })}
                  placeholder="e.g. enterprise, urgent, referral, nextjs"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-[#D6451B]"
                />
                {editFormData.tags && (
                  <div className="flex flex-wrap gap-1 mt-1.5">
                    {editFormData.tags
                      .split(",")
                      .map((t) => t.trim())
                      .filter(Boolean)
                      .map((tag, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-0.5 rounded-md bg-orange-50 text-[#D6451B] text-[10px] font-semibold border border-orange-100"
                        >
                          #{tag}
                        </span>
                      ))}
                  </div>
                )}
              </div>

              {/* Scope & Requirements Notes */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Project Scope / Requirements Notes
                </label>
                <textarea
                  rows={3}
                  value={editFormData.requirements}
                  onChange={(e) => setEditFormData({ ...editFormData, requirements: e.target.value })}
                  placeholder="Notes, requirements, budget discussion, client pain points..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-[#D6451B]"
                />
              </div>

              {/* Modal Actions */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 sticky -bottom-5 sm:-bottom-6 bg-white z-10 pb-1">
                <button
                  type="button"
                  onClick={() => setEditModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 bg-slate-100 hover:bg-slate-200 font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={updateLeadMutation.isPending}
                  className="px-5 py-2 rounded-xl text-white font-bold bg-gradient-to-r from-orange-500 to-[#D6451B] hover:opacity-95 shadow-xs cursor-pointer disabled:opacity-50"
                >
                  {updateLeadMutation.isPending ? "Updating Lead..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Lead Details Side Drawer / Modal */}
      {selectedLead && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-end">
          <div className="bg-white w-full max-w-xl h-full shadow-2xl flex flex-col justify-between overflow-hidden">
            {/* Drawer Header */}
            <div className="p-5 border-b border-slate-100 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-orange-100 text-[#D6451B] flex items-center justify-center font-bold text-base">
                  {selectedLead.fullName.charAt(0)}
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-900">{selectedLead.fullName}</h2>
                  <p className="text-xs text-slate-500">{selectedLead.company || "No company name"}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleOpenEditModal(selectedLead)}
                  className="px-3 py-1.5 rounded-lg text-xs font-bold text-amber-700 bg-amber-50 hover:bg-amber-100 flex items-center gap-1.5 cursor-pointer transition-colors"
                  title="Edit Lead Details"
                >
                  <FaEdit className="text-xs" />
                  <span>Edit Lead</span>
                </button>
                <button
                  onClick={() => setSelectedLead(null)}
                  className="p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 cursor-pointer"
                >
                  <FaTimes />
                </button>
              </div>
            </div>

            {/* Stage Quick Switcher with all 9 stages */}
            <div className="px-5 py-3 bg-slate-50 border-b border-slate-100 flex items-center justify-between gap-3 text-xs">
              <span className="font-bold text-slate-700">Pipeline Stage:</span>
              <select
                value={selectedLead.status}
                onChange={(e) => {
                  const newStatus = e.target.value;
                  let reason = "";
                  if (newStatus === "Lost") {
                    reason = prompt("Please provide a lost reason:") || "Budget constraints";
                  }
                  updateStatusMutation.mutate({
                    leadId: selectedLead._id,
                    status: newStatus,
                    lostReason: reason,
                  });
                }}
                className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-orange-500/20"
              >
                {ALL_STAGES.map((stg) => (
                  <option key={stg} value={stg}>
                    {stg}
                  </option>
                ))}
              </select>
            </div>

            {/* Tab selection */}
            <div className="flex border-b border-slate-200 px-5 text-xs font-bold text-slate-600 shrink-0">
              <button
                onClick={() => setActiveTab("details")}
                className={`py-3 px-3 border-b-2 transition-all cursor-pointer ${
                  activeTab === "details"
                    ? "border-[#D6451B] text-[#D6451B]"
                    : "border-transparent hover:text-slate-900"
                }`}
              >
                Overview
              </button>
              <button
                onClick={() => setActiveTab("activities")}
                className={`py-3 px-3 border-b-2 transition-all cursor-pointer ${
                  activeTab === "activities"
                    ? "border-[#D6451B] text-[#D6451B]"
                    : "border-transparent hover:text-slate-900"
                }`}
              >
                Activity Timeline ({activitiesData?.length || 0})
              </button>
            </div>

            {/* Drawer Body */}
            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              {activeTab === "details" ? (
                <div className="space-y-4 text-xs">
                  {/* Lead Metrics Card with INR */}
                  <div className="grid grid-cols-2 gap-3 p-3.5 rounded-xl bg-orange-50/50 border border-orange-100">
                    <div>
                      <span className="text-slate-500 text-[11px]">Estimated Value</span>
                      <p className="text-lg font-extrabold text-[#D6451B]">
                        ₹{Number(selectedLead.estimatedValue || 0).toLocaleString("en-IN")}
                      </p>
                    </div>
                    <div>
                      <span className="text-slate-500 text-[11px]">Lead Source</span>
                      <p className="text-sm font-bold text-slate-800">{selectedLead.source || "Website"}</p>
                    </div>
                  </div>

                  {/* Contact Info */}
                  <div className="space-y-2">
                    <h3 className="font-bold text-slate-800 uppercase tracking-wider text-[11px]">Contact Info</h3>
                    <div className="p-3 rounded-xl border border-slate-100 bg-slate-50/60 space-y-2">
                      <div className="flex items-center gap-2 text-slate-700">
                        <FaEnvelope className="text-slate-400" />
                        <span>{selectedLead.email || "No email provided"}</span>
                      </div>
                      <div className="flex items-center gap-2 text-slate-700">
                        <FaPhone className="text-slate-400" />
                        <span>{selectedLead.phone || "No phone provided"}</span>
                      </div>
                      <div className="flex items-center gap-2 text-slate-700">
                        <FaBuilding className="text-slate-400" />
                        <span>{selectedLead.jobTitle ? `${selectedLead.jobTitle} at ` : ""}{selectedLead.company || "No company"}</span>
                      </div>
                    </div>
                  </div>

                  {/* Requirements / Description */}
                  {selectedLead.requirements && (
                    <div className="space-y-2">
                      <h3 className="font-bold text-slate-800 uppercase tracking-wider text-[11px]">Requirements & Scope</h3>
                      <div className="p-3 rounded-xl border border-slate-100 bg-slate-50/60 text-slate-700 leading-relaxed whitespace-pre-line">
                        {selectedLead.requirements}
                      </div>
                    </div>
                  )}

                  {/* Tags */}
                  {selectedLead.tags && selectedLead.tags.length > 0 && (
                    <div className="space-y-2">
                      <h3 className="font-bold text-slate-800 uppercase tracking-wider text-[11px]">Tags</h3>
                      <div className="flex flex-wrap gap-1.5">
                        {selectedLead.tags.map((tag, i) => (
                          <span
                            key={i}
                            className="px-2 py-0.5 rounded-md bg-orange-100/70 text-[#D6451B] font-semibold text-[10px]"
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Lost Reason if applicable */}
                  {selectedLead.status === "Lost" && selectedLead.lostReason && (
                    <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800">
                      <span className="font-bold">Loss Reason: </span>
                      {selectedLead.lostReason}
                    </div>
                  )}

                  {/* Next Follow Up */}
                  <div className="p-3 rounded-xl border border-slate-200 bg-white flex items-center justify-between">
                    <div>
                      <span className="text-[11px] text-slate-500 block">Next Follow-up</span>
                      <span className="font-bold text-slate-800">
                        {selectedLead.nextFollowUpAt
                          ? new Date(selectedLead.nextFollowUpAt).toLocaleString()
                          : "No follow-up set"}
                      </span>
                    </div>
                  </div>
                </div>
              ) : (
                /* Activity Timeline Tab */
                <div className="space-y-4">
                  {/* Log Activity Form */}
                  <form onSubmit={handleAddActivity} className="p-3.5 rounded-xl border border-orange-100 bg-orange-50/40 space-y-2.5 text-xs">
                    <span className="font-bold text-slate-800 block">Log New Interaction or Note</span>
                    <div className="grid grid-cols-3 gap-2">
                      {["note", "call", "email"].map((type) => (
                        <button
                          key={type}
                          type="button"
                          onClick={() => setNewActivityType(type)}
                          className={`py-1 rounded-lg font-bold capitalize transition-all cursor-pointer ${
                            newActivityType === type
                              ? "bg-[#D6451B] text-white"
                              : "bg-white border border-slate-200 text-slate-600"
                          }`}
                        >
                          {type}
                        </button>
                      ))}
                    </div>
                    <input
                      type="text"
                      required
                      value={newActivitySummary}
                      onChange={(e) => setNewActivitySummary(e.target.value)}
                      placeholder="Summary (e.g. Discussed pricing proposal)"
                      className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-orange-500"
                    />
                    <textarea
                      rows="2"
                      value={newActivityDetails}
                      onChange={(e) => setNewActivityDetails(e.target.value)}
                      placeholder="Detailed notes (optional)..."
                      className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-orange-500"
                    />
                    <div className="flex justify-end">
                      <button
                        type="submit"
                        disabled={addActivityMutation.isPending}
                        className="px-3.5 py-1.5 rounded-lg bg-[#D6451B] text-white font-bold cursor-pointer hover:opacity-95 disabled:opacity-50"
                      >
                        {addActivityMutation.isPending ? "Logging..." : "Record Activity"}
                      </button>
                    </div>
                  </form>

                  {/* Activities List */}
                  <div className="divide-y divide-slate-100 text-xs">
                    {activitiesLoading ? (
                      <p className="text-center py-4 text-slate-400">Loading history...</p>
                    ) : activitiesData && activitiesData.length > 0 ? (
                      activitiesData.map((act) => (
                        <div key={act._id} className="py-2.5">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-slate-800 capitalize">
                              {act.type.replace("_", " ")}
                            </span>
                            <span className="text-[10px] text-slate-400">
                              {new Date(act.createdAt).toLocaleString()}
                            </span>
                          </div>
                          <p className="text-slate-700 mt-0.5">{act.summary}</p>
                          {act.details && (
                            <p className="text-slate-500 text-[11px] mt-0.5">{act.details}</p>
                          )}
                          <span className="text-[10px] text-slate-400 mt-1 block">
                            Logged by {act.createdBy?.fullName || "User"}
                          </span>
                        </div>
                      ))
                    ) : (
                      <p className="text-center py-6 text-slate-400">No activities logged yet.</p>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Drawer Footer Actions */}
            <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between shrink-0">
              {user?.role === "admin" && (
                <button
                  onClick={() => {
                    if (confirm(`Are you sure you want to delete lead '${selectedLead.fullName}'?`)) {
                      deleteLeadMutation.mutate(selectedLead._id);
                    }
                  }}
                  className="px-3 py-2 rounded-xl text-rose-600 hover:bg-rose-50 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <FaTrash className="text-[10px]" />
                  <span>Delete Lead</span>
                </button>
              )}
              <div className="ml-auto flex items-center gap-2">
                <button
                  onClick={() => handleOpenEditModal(selectedLead)}
                  className="px-3.5 py-2 rounded-xl text-xs font-bold text-amber-700 bg-amber-50 hover:bg-amber-100 flex items-center gap-1.5 cursor-pointer transition-colors"
                >
                  <FaEdit className="text-xs" />
                  <span>Edit Lead</span>
                </button>
                <button
                  onClick={() => setSelectedLead(null)}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 cursor-pointer"
                >
                  Close Drawer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
