import React, { useState, useEffect } from "react";
import { useApp } from "../../context/AppContext";
import {
  Inbox,
  Briefcase,
  FolderKanban,
  ShoppingBag,
  Users,
  MessageSquareQuote,
  ArrowUpRight,
  Clock,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Sparkles,
  Globe,
} from "lucide-react";
import { api } from "../../services/api";

interface OverviewProps {
  setActiveTab: (tab: string) => void;
}

export const AdminDashboardOverview: React.FC<OverviewProps> = ({ setActiveTab }) => {
  const { data, leads: contextLeads, refreshData, showToast } = useApp();
  const [isResetting, setIsResetting] = useState(false);
  const [visitorCount, setVisitorCount] = useState<number | null>(null);

  useEffect(() => {
    api.getVisitorAnalytics().then((res) => {
      setVisitorCount(res.totalVisits);
    }).catch(() => {});
  }, []);

  const leads = (contextLeads && contextLeads.length > 0) ? contextLeads : (data?.leads || []);
  const services = data?.services || [];
  const portfolio = data?.portfolio || [];
  const fiverrServices = data?.fiverrServices || [];
  const testimonials = data?.testimonials || [];

  const newLeads = leads.filter((l) => l.status === "new");

  const handleResetData = async () => {
    if (!window.confirm("Are you sure you want to reset all data back to the clean initial agency seed?")) {
      return;
    }
    try {
      setIsResetting(true);
      await api.resetDatabase();
      await refreshData();
      showToast("Database successfully restored to clean seed data!", "success");
    } catch (err: any) {
      showToast(err.message || "Failed to reset database.", "error");
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Top Banner: Status & Quick Controls */}
      <div className="p-6 rounded-3xl bg-neutral-950 border border-neutral-800 text-white flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <h2 className="text-xl font-bold tracking-tight">
              Agency Operations Center
            </h2>
          </div>
          <p className="text-xs text-neutral-400">
            Real-time control for public content, client inquiries, case studies, and Fiverr marketplace integrations.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => setActiveTab("leads")}
            className="px-4 py-2 rounded-xl bg-white text-neutral-950 font-bold text-xs uppercase tracking-wider hover:bg-neutral-200 transition-colors flex items-center gap-1.5"
          >
            <Inbox className="w-3.5 h-3.5" />
            <span>Review Leads ({newLeads.length})</span>
          </button>

          <button
            onClick={handleResetData}
            disabled={isResetting}
            className="px-3.5 py-2 rounded-xl bg-neutral-900 border border-neutral-800 text-neutral-400 hover:text-white hover:border-neutral-700 text-xs font-semibold transition-colors flex items-center gap-1.5"
            title="Reset database to seed content"
          >
            <RotateCcw className={`w-3.5 h-3.5 ${isResetting ? "animate-spin" : ""}`} />
            <span>Reset Demo DB</span>
          </button>
        </div>
      </div>

      {/* KPI Metrics Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 sm:gap-6">
        <div
          onClick={() => setActiveTab("visitors")}
          className="p-5 rounded-2xl bg-neutral-950 border border-neutral-800 hover:border-emerald-500/50 cursor-pointer transition-all shadow-md group col-span-2 sm:col-span-1"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-neutral-400 uppercase tracking-wider">
              Live Visitors
            </span>
            <div className="p-2 rounded-lg bg-neutral-900 text-emerald-400 group-hover:bg-emerald-400 group-hover:text-neutral-950 transition-colors">
              <Globe className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-white">{visitorCount ?? "..."}</span>
            <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
              Live
            </span>
          </div>
          <span className="text-[11px] text-neutral-500 block mt-1">
            Real-time hits on techelevant.com
          </span>
        </div>

        <div
          onClick={() => setActiveTab("leads")}
          className="p-5 rounded-2xl bg-neutral-950 border border-neutral-800 hover:border-neutral-700 cursor-pointer transition-all shadow-md group"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-neutral-400 uppercase tracking-wider">
              Total Inquiries
            </span>
            <div className="p-2 rounded-lg bg-neutral-900 text-neutral-300 group-hover:bg-white group-hover:text-neutral-950 transition-colors">
              <Inbox className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-white">{leads.length}</span>
            {newLeads.length > 0 && (
              <span className="text-xs font-bold text-emerald-400">
                +{newLeads.length} new
              </span>
            )}
          </div>
          <span className="text-[11px] text-neutral-500 block mt-1">
            Consultations & inquiries
          </span>
        </div>

        <div
          onClick={() => setActiveTab("services")}
          className="p-5 rounded-2xl bg-neutral-950 border border-neutral-800 hover:border-neutral-700 cursor-pointer transition-all shadow-md group"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-neutral-400 uppercase tracking-wider">
              Active Services
            </span>
            <div className="p-2 rounded-lg bg-neutral-900 text-neutral-300 group-hover:bg-white group-hover:text-neutral-950 transition-colors">
              <Briefcase className="w-4 h-4" />
            </div>
          </div>
          <span className="text-3xl font-black text-white">{services.length}</span>
          <span className="text-[11px] text-neutral-500 block mt-1">
            Web, AI, Mobile & Cloud
          </span>
        </div>

        <div
          onClick={() => setActiveTab("portfolio")}
          className="p-5 rounded-2xl bg-neutral-950 border border-neutral-800 hover:border-neutral-700 cursor-pointer transition-all shadow-md group"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-neutral-400 uppercase tracking-wider">
              Case Studies
            </span>
            <div className="p-2 rounded-lg bg-neutral-900 text-neutral-300 group-hover:bg-white group-hover:text-neutral-950 transition-colors">
              <FolderKanban className="w-4 h-4" />
            </div>
          </div>
          <span className="text-3xl font-black text-white">{portfolio.length}</span>
          <span className="text-[11px] text-neutral-500 block mt-1">
            Published deliverables
          </span>
        </div>

        <div
          onClick={() => setActiveTab("fiverr")}
          className="p-5 rounded-2xl bg-neutral-950 border border-neutral-800 hover:border-neutral-700 cursor-pointer transition-all shadow-md group"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-neutral-400 uppercase tracking-wider">
              Fiverr Marketplace
            </span>
            <div className="p-2 rounded-lg bg-neutral-900 text-neutral-300 group-hover:bg-white group-hover:text-neutral-950 transition-colors">
              <ShoppingBag className="w-4 h-4" />
            </div>
          </div>
          <span className="text-3xl font-black text-white">{fiverrServices.length}</span>
          <span className="text-[11px] text-neutral-500 block mt-1">
            Ready-to-order packages
          </span>
        </div>
      </div>

      {/* Recent Inquiries Quick Table */}
      <div className="p-6 sm:p-8 rounded-3xl bg-neutral-950 border border-neutral-800 shadow-xl space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-white tracking-tight">
              Recent Inbound Client Inquiries
            </h3>
            <p className="text-xs text-neutral-400 mt-0.5">
              Latest requests from Contact & Consultation intake funnels
            </p>
          </div>
          <button
            onClick={() => setActiveTab("leads")}
            className="text-xs font-bold text-neutral-300 hover:text-white uppercase tracking-wider flex items-center gap-1"
          >
            <span>View All Leads</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {leads.length === 0 ? (
          <div className="py-12 text-center text-xs text-neutral-500">
            No leads recorded yet. Try submitting a project inquiry on the website!
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-neutral-800 text-neutral-400 font-bold uppercase tracking-wider">
                  <th className="pb-3 px-2">Client / Company</th>
                  <th className="pb-3 px-2">Service</th>
                  <th className="pb-3 px-2">Budget</th>
                  <th className="pb-3 px-2">Status</th>
                  <th className="pb-3 px-2 text-right">Received</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-900">
                {leads.slice(0, 5).map((lead) => (
                  <tr
                    key={lead.id}
                    onClick={() => setActiveTab("leads")}
                    className="hover:bg-neutral-900/60 cursor-pointer transition-colors"
                  >
                    <td className="py-3.5 px-2">
                      <span className="font-bold text-white block">{lead.fullName}</span>
                      <span className="text-[11px] text-neutral-400 block">{lead.email}</span>
                    </td>
                    <td className="py-3.5 px-2 text-neutral-300 font-medium">
                      {lead.service || "General Inquiry"}
                    </td>
                    <td className="py-3.5 px-2 text-neutral-300 font-medium">
                      {lead.budget || "N/A"}
                    </td>
                    <td className="py-3.5 px-2">
                      <span
                        className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          lead.status === "new"
                            ? "bg-rose-500/20 text-rose-300 border border-rose-500/30"
                            : lead.status === "contacted"
                            ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                            : lead.status === "in-progress"
                            ? "bg-blue-500/20 text-blue-300 border border-blue-500/30"
                            : "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                        }`}
                      >
                        {lead.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-2 text-right text-neutral-500">
                      {new Date(lead.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Quick Launch Shortcuts */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 rounded-2xl bg-neutral-950 border border-neutral-800 space-y-3">
          <h4 className="text-sm font-bold text-white">
            Need to update your Fiverr Gigs?
          </h4>
          <p className="text-xs text-neutral-400 leading-relaxed">
            Update pricing, direct gig URLs, delivery turnaround, or toggle featured status anytime.
          </p>
          <button
            onClick={() => setActiveTab("fiverr")}
            className="text-xs font-bold text-white uppercase tracking-wider hover:underline flex items-center gap-1 pt-1"
          >
            <span>Manage Fiverr Gigs</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="p-6 rounded-2xl bg-neutral-950 border border-neutral-800 space-y-3">
          <h4 className="text-sm font-bold text-white">
            Hide / Show Frontend Sections
          </h4>
          <p className="text-xs text-neutral-400 leading-relaxed">
            Instantly toggle the visibility of any section on the homepage and reorder their vertical layout.
          </p>
          <button
            onClick={() => setActiveTab("sections")}
            className="text-xs font-bold text-white uppercase tracking-wider hover:underline flex items-center gap-1 pt-1"
          >
            <span>Hide / Show Sections</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="p-6 rounded-2xl bg-neutral-950 border border-neutral-800 space-y-3">
          <h4 className="text-sm font-bold text-white">
            Agency Contact Info & Socials
          </h4>
          <p className="text-xs text-neutral-400 leading-relaxed">
            Change business email, phone, office location, and global social media links.
          </p>
          <button
            onClick={() => setActiveTab("settings")}
            className="text-xs font-bold text-white uppercase tracking-wider hover:underline flex items-center gap-1 pt-1"
          >
            <span>Edit Agency Profile</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
