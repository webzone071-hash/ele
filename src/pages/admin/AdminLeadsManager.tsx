import React, { useState, useEffect } from "react";
import { useApp } from "../../context/AppContext";
import { Lead } from "../../types";
import { api } from "../../services/api";
import {
  Inbox,
  Search,
  Trash2,
  Mail,
  Phone,
  Clock,
  Eye,
  X,
  Building,
  CheckCircle2,
  RefreshCw,
  Download,
  Calendar,
  DollarSign,
  Briefcase,
  User,
  MessageSquare,
} from "lucide-react";

export const AdminLeadsManager: React.FC = () => {
  const { data, leads: contextLeads, refreshLeads, refreshData, showToast } = useApp();
  const leads = (contextLeads && contextLeads.length > 0) ? contextLeads : (data?.leads || []);

  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [selectedType, setSelectedType] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeLeadModal, setActiveLeadModal] = useState<Lead | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    // Initial fetch on mount to ensure leads are synced
    refreshLeads();
  }, []);

  const handleManualRefresh = async () => {
    try {
      setIsRefreshing(true);
      await refreshLeads();
      await refreshData();
      showToast("Leads synced successfully.", "success");
    } catch {
      showToast("Failed to refresh leads.", "error");
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleUpdateStatus = async (id: string, status: Lead["status"]) => {
    try {
      await api.updateLeadStatus(id, status);
      showToast(`Lead marked as ${status}.`, "success");
      await refreshLeads();
      await refreshData();
      if (activeLeadModal && activeLeadModal.id === id) {
        setActiveLeadModal({ ...activeLeadModal, status });
      }
    } catch (err: any) {
      showToast(err.message || "Failed to update lead status.", "error");
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to delete inquiry from "${name}"?`)) return;
    try {
      await api.deleteLead(id);
      showToast("Inquiry deleted.", "success");
      if (activeLeadModal?.id === id) setActiveLeadModal(null);
      await refreshLeads();
      await refreshData();
    } catch (err: any) {
      showToast(err.message || "Failed to delete inquiry.", "error");
    }
  };

  const exportToCSV = () => {
    if (leads.length === 0) {
      showToast("No leads available to export.", "info");
      return;
    }
    const headers = ["ID", "Type", "Full Name", "Email", "Company", "Phone", "Service", "Budget", "Timeline", "Status", "Date", "Project Details"];
    const rows = leads.map((l) => [
      l.id,
      l.type || "contact",
      `"${(l.fullName || "").replace(/"/g, '""')}"`,
      `"${(l.email || "").replace(/"/g, '""')}"`,
      `"${(l.company || "").replace(/"/g, '""')}"`,
      `"${(l.phone || "").replace(/"/g, '""')}"`,
      `"${(l.service || "").replace(/"/g, '""')}"`,
      `"${(l.budget || "").replace(/"/g, '""')}"`,
      `"${(l.timeline || "").replace(/"/g, '""')}"`,
      l.status,
      new Date(l.createdAt).toISOString(),
      `"${(l.projectDetails || l.message || "").replace(/"/g, '""')}"`,
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `tech_elevant_leads_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast("Leads exported to CSV.", "success");
  };

  const filtered = leads.filter((lead) => {
    const matchesStatus = selectedStatus === "all" || lead.status === selectedStatus;
    const matchesType = selectedType === "all" || (lead.type || "contact") === selectedType;
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !q ||
      lead.fullName.toLowerCase().includes(q) ||
      lead.email.toLowerCase().includes(q) ||
      (lead.company && lead.company.toLowerCase().includes(q)) ||
      (lead.service && lead.service.toLowerCase().includes(q)) ||
      (lead.projectDetails && lead.projectDetails.toLowerCase().includes(q));
    return matchesStatus && matchesType && matchesSearch;
  });

  const newCount = leads.filter((l) => l.status === "new").length;
  const siteName = data?.settings?.siteName || "Tech Elevant";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <Inbox className="w-5 h-5 text-neutral-300" />
            <span>Client Inquiries & Consultation Leads</span>
          </h2>
          <p className="text-xs text-neutral-400 mt-1">
            Track, qualify, and update status for all inbound project inquiries and consultation bookings.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleManualRefresh}
            disabled={isRefreshing}
            className="px-3 py-2 rounded-xl bg-neutral-900 border border-neutral-800 text-xs text-neutral-300 hover:text-white hover:bg-neutral-800 transition-colors flex items-center gap-1.5 disabled:opacity-50"
            title="Refresh Leads from Server"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? "animate-spin" : ""}`} />
            <span>{isRefreshing ? "Syncing..." : "Sync"}</span>
          </button>

          <button
            onClick={exportToCSV}
            className="px-3 py-2 rounded-xl bg-neutral-900 border border-neutral-800 text-xs text-neutral-300 hover:text-white hover:bg-neutral-800 transition-colors flex items-center gap-1.5"
            title="Export Leads to CSV"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>

          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-neutral-950 border border-neutral-800">
            <span className="text-xs text-neutral-400">Total:</span>
            <span className="text-white font-mono text-xs font-bold">{leads.length}</span>
            {newCount > 0 && (
              <span className="ml-1 px-1.5 py-0.5 rounded-md bg-rose-500/20 text-rose-300 font-mono text-[10px] font-bold border border-rose-500/30">
                {newCount} new
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Filters & Search Bar */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-neutral-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search leads by name, email, company, service, or message..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-white"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Form Type Filter */}
          <div className="flex items-center gap-1 bg-neutral-950 border border-neutral-800 p-1 rounded-xl">
            {[
              { id: "all", label: "All Types" },
              { id: "contact", label: "Contact Form" },
              { id: "consultation", label: "Consultation" },
            ].map((type) => (
              <button
                key={type.id}
                onClick={() => setSelectedType(type.id)}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors ${
                  selectedType === type.id
                    ? "bg-white text-neutral-950 shadow-xs"
                    : "text-neutral-400 hover:text-white"
                }`}
              >
                {type.label}
              </button>
            ))}
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-1 overflow-x-auto no-scrollbar">
            {["all", "new", "contacted", "in-progress", "closed"].map((status) => (
              <button
                key={status}
                onClick={() => setSelectedStatus(status)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-colors whitespace-nowrap ${
                  selectedStatus === status
                    ? "bg-white text-neutral-950 shadow-xs"
                    : "bg-neutral-950 border border-neutral-800 text-neutral-400 hover:text-white"
                }`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Leads Table */}
      <div className="bg-neutral-950 border border-neutral-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-neutral-800 text-neutral-400 font-bold uppercase tracking-wider bg-neutral-900/40">
                <th className="py-3.5 px-4">Contact</th>
                <th className="py-3.5 px-4">Type</th>
                <th className="py-3.5 px-4">Company</th>
                <th className="py-3.5 px-4">Requested Service</th>
                <th className="py-3.5 px-4">Budget / Timeline</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4">Date</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-900">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-14 text-center text-neutral-500">
                    <Inbox className="w-8 h-8 text-neutral-600 mx-auto mb-2 opacity-50" />
                    <p className="text-sm font-medium text-neutral-400">No inquiries found matching this filter.</p>
                    <p className="text-xs text-neutral-500 mt-0.5">
                      {leads.length === 0
                        ? "When prospective clients submit contact or consultation forms, they will automatically appear here."
                        : "Try adjusting your search query or filters."}
                    </p>
                  </td>
                </tr>
              ) : (
                filtered.map((lead) => (
                  <tr key={lead.id} className="hover:bg-neutral-900/40 transition-colors">
                    <td className="py-3.5 px-4">
                      <span className="font-bold text-white block">{lead.fullName}</span>
                      <a
                        href={`mailto:${lead.email}`}
                        className="text-[11px] text-neutral-400 hover:text-white block hover:underline"
                      >
                        {lead.email}
                      </a>
                    </td>
                    <td className="py-3.5 px-4">
                      {lead.type === "consultation" ? (
                        <span className="px-2 py-0.5 rounded-md bg-amber-500/15 text-amber-300 border border-amber-500/25 text-[10px] font-bold uppercase tracking-wider">
                          Consultation
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-md bg-blue-500/15 text-blue-300 border border-blue-500/25 text-[10px] font-bold uppercase tracking-wider">
                          Contact
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-neutral-300">
                      {lead.company || "—"}
                    </td>
                    <td className="py-3.5 px-4 text-neutral-300 font-medium max-w-[170px] truncate">
                      {lead.service || "General Inquiry"}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="text-white block font-medium">{lead.budget || "N/A"}</span>
                      {lead.timeline && (
                        <span className="text-[10px] text-neutral-400 block">{lead.timeline}</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4">
                      <select
                        value={lead.status}
                        onChange={(e) => handleUpdateStatus(lead.id, e.target.value as any)}
                        className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider border focus:outline-none cursor-pointer ${
                          lead.status === "new"
                            ? "bg-rose-500/20 text-rose-300 border-rose-500/30"
                            : lead.status === "contacted"
                            ? "bg-amber-500/20 text-amber-300 border-amber-500/30"
                            : lead.status === "in-progress"
                            ? "bg-blue-500/20 text-blue-300 border-blue-500/30"
                            : "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
                        }`}
                      >
                        <option value="new" className="bg-neutral-950 text-white">new</option>
                        <option value="contacted" className="bg-neutral-950 text-white">contacted</option>
                        <option value="in-progress" className="bg-neutral-950 text-white">in-progress</option>
                        <option value="closed" className="bg-neutral-950 text-white">closed</option>
                      </select>
                    </td>
                    <td className="py-3.5 px-4 text-neutral-500 whitespace-nowrap">
                      {lead.createdAt ? new Date(lead.createdAt).toLocaleDateString() : "—"}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setActiveLeadModal(lead)}
                          className="p-1.5 rounded-lg bg-neutral-900 text-neutral-300 hover:text-white hover:bg-neutral-800 transition-colors"
                          title="View Details"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(lead.id, lead.fullName)}
                          className="p-1.5 rounded-lg bg-neutral-900 text-neutral-400 hover:text-rose-400 hover:bg-neutral-800 transition-colors"
                          title="Delete Lead"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Inquiry Detail Modal */}
      {activeLeadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-neutral-950 border border-neutral-800 rounded-2xl max-w-xl w-full p-6 sm:p-8 space-y-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between pb-4 border-b border-neutral-800">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest block">
                    Lead Details & Scope
                  </span>
                  <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${
                    activeLeadModal.type === "consultation"
                      ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                      : "bg-blue-500/20 text-blue-300 border border-blue-500/30"
                  }`}>
                    {activeLeadModal.type === "consultation" ? "Consultation Booking" : "Contact Inquiry"}
                  </span>
                </div>
                <h3 className="text-xl font-bold text-white tracking-tight">
                  {activeLeadModal.fullName}
                </h3>
              </div>
              <button
                onClick={() => setActiveLeadModal(null)}
                className="text-neutral-400 hover:text-white p-1 rounded-lg hover:bg-neutral-900"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-4 p-4 rounded-xl bg-neutral-900 border border-neutral-800">
                <div>
                  <span className="text-neutral-400 block mb-0.5">Email Address</span>
                  <a
                    href={`mailto:${activeLeadModal.email}`}
                    className="text-white font-bold hover:underline break-all"
                  >
                    {activeLeadModal.email}
                  </a>
                </div>
                <div>
                  <span className="text-neutral-400 block mb-0.5">Company</span>
                  <span className="text-white font-bold">{activeLeadModal.company || "None specified"}</span>
                </div>
                <div>
                  <span className="text-neutral-400 block mb-0.5">Phone Number</span>
                  {activeLeadModal.phone ? (
                    <a href={`tel:${activeLeadModal.phone}`} className="text-white font-bold hover:underline">
                      {activeLeadModal.phone}
                    </a>
                  ) : (
                    <span className="text-neutral-400">None specified</span>
                  )}
                </div>
                <div>
                  <span className="text-neutral-400 block mb-0.5">Received Date</span>
                  <span className="text-white font-bold">
                    {activeLeadModal.createdAt ? new Date(activeLeadModal.createdAt).toLocaleString() : "—"}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3 p-3 rounded-xl bg-neutral-900/60 border border-neutral-800 text-center">
                <div>
                  <span className="text-neutral-400 block mb-0.5">Service</span>
                  <span className="text-white font-bold truncate block">{activeLeadModal.service || "General"}</span>
                </div>
                <div>
                  <span className="text-neutral-400 block mb-0.5">Budget</span>
                  <span className="text-emerald-400 font-bold block">{activeLeadModal.budget || "N/A"}</span>
                </div>
                <div>
                  <span className="text-neutral-400 block mb-0.5">Timeline</span>
                  <span className="text-amber-400 font-bold block">{activeLeadModal.timeline || "Standard"}</span>
                </div>
              </div>

              <div>
                <span className="text-neutral-400 uppercase tracking-wider font-bold block mb-2">
                  Project Scope & Message:
                </span>
                <div className="p-4 rounded-xl bg-neutral-900 border border-neutral-800 text-neutral-200 leading-relaxed whitespace-pre-wrap max-h-48 overflow-y-auto">
                  {activeLeadModal.projectDetails || activeLeadModal.message || "No project description provided."}
                </div>
              </div>

              <div className="p-3 rounded-xl bg-neutral-900/40 border border-neutral-800 flex items-center justify-between">
                <span className="text-neutral-400 font-semibold">Change Lead Status:</span>
                <select
                  value={activeLeadModal.status}
                  onChange={(e) => handleUpdateStatus(activeLeadModal.id, e.target.value as any)}
                  className="px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider bg-neutral-950 border border-neutral-700 text-white focus:outline-none cursor-pointer"
                >
                  <option value="new">New</option>
                  <option value="contacted">Contacted</option>
                  <option value="in-progress">In Progress</option>
                  <option value="closed">Closed</option>
                </select>
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-neutral-800">
              <a
                href={`mailto:${activeLeadModal.email}?subject=Regarding your inquiry with ${encodeURIComponent(siteName)}`}
                className="px-4 py-2.5 rounded-xl bg-white text-neutral-950 font-bold text-xs uppercase tracking-wider hover:bg-neutral-200 transition-colors flex items-center gap-1.5"
              >
                <Mail className="w-3.5 h-3.5" />
                <span>Reply via Email</span>
              </a>

              <button
                onClick={() => setActiveLeadModal(null)}
                className="px-4 py-2.5 rounded-xl bg-neutral-900 text-neutral-300 hover:text-white text-xs font-semibold"
              >
                Close Window
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
