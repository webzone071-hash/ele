import React, { useState, useEffect } from "react";
import { api } from "../../services/api";
import { VisitorAnalyticsSummary, VisitorLog } from "../../types";
import {
  Globe,
  Users,
  Eye,
  Calendar,
  RefreshCw,
  Trash2,
  Search,
  Laptop,
  Smartphone,
  Tablet,
  Copy,
  Check,
  ShieldAlert,
  ArrowUpDown,
  Filter,
} from "lucide-react";
import { useApp } from "../../context/AppContext";

export const AdminVisitorsManager: React.FC = () => {
  const { showToast } = useApp();
  const [analytics, setAnalytics] = useState<VisitorAnalyticsSummary | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [countryFilter, setCountryFilter] = useState<string>("all");
  const [copiedIp, setCopiedIp] = useState<string | null>(null);
  const [blockingIp, setBlockingIp] = useState<string | null>(null);

  const fetchVisitors = async (isManual = false) => {
    try {
      if (isManual) setIsRefreshing(true);
      else setIsLoading(true);

      const data = await api.getVisitorAnalytics();
      setAnalytics(data);
      if (isManual) {
        showToast("Visitor telemetry refreshed.", "info");
      }
    } catch (err: any) {
      showToast(err.message || "Failed to load visitor telemetry.", "error");
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchVisitors();
    const interval = setInterval(() => {
      fetchVisitors(false);
    }, 15000); // Auto-refresh telemetry every 15s
    return () => clearInterval(interval);
  }, []);

  const handleClearLogs = async () => {
    if (!window.confirm("Are you sure you want to clear all historical visitor logs?")) {
      return;
    }
    try {
      await api.clearVisitorLogs();
      showToast("Visitor logs cleared successfully.", "success");
      await fetchVisitors();
    } catch (err: any) {
      showToast(err.message || "Failed to clear logs.", "error");
    }
  };

  const handleCopyIp = (ip: string) => {
    navigator.clipboard.writeText(ip);
    setCopiedIp(ip);
    setTimeout(() => setCopiedIp(null), 2000);
  };

  const handleQuickBlock = async (ip: string) => {
    if (!window.confirm(`Quarantine IP address ${ip} for 1 hour under Anti-DDoS protection?`)) {
      return;
    }
    try {
      setBlockingIp(ip);
      await api.blockIp(ip, "Quarantined via Visitor Telemetry Monitor", 1);
      showToast(`IP ${ip} quarantined for 1 hour.`, "success");
      await fetchVisitors();
    } catch (err: any) {
      showToast(err.message || "Failed to block IP.", "error");
    } finally {
      setBlockingIp(null);
    }
  };

  const filteredVisitors = (analytics?.recentVisitors || []).filter((v) => {
    const matchesSearch =
      v.ip.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.country.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.page.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCountry =
      countryFilter === "all" || v.countryCode.toLowerCase() === countryFilter.toLowerCase();

    return matchesSearch && matchesCountry;
  });

  const getDeviceIcon = (device: string) => {
    switch (device.toLowerCase()) {
      case "mobile":
        return <Smartphone className="w-3.5 h-3.5 text-neutral-400" />;
      case "tablet":
        return <Tablet className="w-3.5 h-3.5 text-neutral-400" />;
      default:
        return <Laptop className="w-3.5 h-3.5 text-neutral-400" />;
    }
  };

  const formatRelativeTime = (isoString: string) => {
    const diff = Math.floor((Date.now() - new Date(isoString).getTime()) / 1000);
    if (diff < 60) return `${diff}s ago`;
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return new Date(isoString).toLocaleDateString();
  };

  return (
    <div className="space-y-8 max-w-6xl">
      {/* Top Header & Refresh */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
              <Globe className="w-5 h-5 text-emerald-400" />
              <span>Visitor Telemetry & Geo Traffic</span>
            </h2>
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-bold uppercase tracking-wider">
              Live Edge Tracking
            </span>
          </div>
          <p className="text-xs text-neutral-400 mt-1">
            Real-time visitor counts, geographic distribution, IP addresses, and client sessions.
          </p>
        </div>

        <div className="flex items-center gap-2.5 self-start sm:self-auto">
          <button
            type="button"
            onClick={() => fetchVisitors(true)}
            disabled={isRefreshing}
            className="px-3.5 py-2 rounded-xl bg-neutral-900 border border-neutral-800 text-neutral-300 hover:text-white hover:bg-neutral-800 text-xs font-semibold flex items-center gap-1.5 transition-all min-h-[40px]"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? "animate-spin text-emerald-400" : ""}`} />
            <span>{isRefreshing ? "Updating..." : "Refresh"}</span>
          </button>

          <button
            type="button"
            onClick={handleClearLogs}
            className="px-3.5 py-2 rounded-xl bg-neutral-900 border border-neutral-800 text-rose-300 hover:text-rose-200 hover:bg-rose-500/10 text-xs font-semibold flex items-center gap-1.5 transition-all min-h-[40px]"
            title="Clear all stored logs"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear Logs</span>
          </button>
        </div>
      </div>

      {/* KPI Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-neutral-950 border border-neutral-800 flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-400 block mb-1">
              Total Page Visits
            </span>
            <span className="text-3xl font-black text-white tracking-tight">
              {analytics?.totalVisits ?? "--"}
            </span>
            <span className="text-[11px] text-emerald-400 font-medium block mt-1 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              Accumulated impressions
            </span>
          </div>
          <div className="w-11 h-11 rounded-xl bg-neutral-900 border border-neutral-800 flex items-center justify-center text-neutral-300">
            <Eye className="w-5 h-5" />
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-neutral-950 border border-neutral-800 flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-400 block mb-1">
              Unique Visitors
            </span>
            <span className="text-3xl font-black text-white tracking-tight">
              {analytics?.uniqueVisitors ?? "--"}
            </span>
            <span className="text-[11px] text-neutral-400 font-medium block mt-1">
              Distinct IP addresses
            </span>
          </div>
          <div className="w-11 h-11 rounded-xl bg-neutral-900 border border-neutral-800 flex items-center justify-center text-neutral-300">
            <Users className="w-5 h-5" />
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-neutral-950 border border-neutral-800 flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-400 block mb-1">
              Today's Visits
            </span>
            <span className="text-3xl font-black text-white tracking-tight">
              {analytics?.todayVisits ?? "--"}
            </span>
            <span className="text-[11px] text-emerald-400 font-medium block mt-1">
              24-hour cycle
            </span>
          </div>
          <div className="w-11 h-11 rounded-xl bg-neutral-900 border border-neutral-800 flex items-center justify-center text-emerald-400">
            <Calendar className="w-5 h-5" />
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-neutral-950 border border-neutral-800 flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-400 block mb-1">
              Top Country
            </span>
            <span className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
              <span>{analytics?.countryStats?.[0]?.flag || "🌐"}</span>
              <span>{analytics?.countryStats?.[0]?.country || "Global"}</span>
            </span>
            <span className="text-[11px] text-neutral-400 font-medium block mt-1">
              {analytics?.countryStats?.[0]?.count || 0} visits (
              {analytics?.countryStats?.[0]?.percentage || 0}%)
            </span>
          </div>
          <div className="w-11 h-11 rounded-xl bg-neutral-900 border border-neutral-800 flex items-center justify-center text-blue-400">
            <Globe className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Country Distribution Grid */}
      <div className="p-6 rounded-3xl bg-neutral-950 border border-neutral-800 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              Geographic Traffic Distribution
            </h3>
            <p className="text-xs text-neutral-400 mt-0.5">
              Breakdown of visitors by origin country and percentage of total traffic.
            </p>
          </div>
          <span className="text-xs font-mono text-neutral-400">
            {analytics?.countryStats?.length || 0} Countries Detected
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 pt-2">
          {analytics?.countryStats && analytics.countryStats.length > 0 ? (
            analytics.countryStats.map((item) => (
              <div
                key={item.code}
                className="p-3.5 rounded-xl bg-neutral-900/80 border border-neutral-800/80 space-y-2 hover:border-neutral-700 transition-colors"
              >
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-white flex items-center gap-2">
                    <span className="text-base">{item.flag}</span>
                    <span>{item.country}</span>
                  </span>
                  <span className="font-mono text-neutral-300 font-bold">
                    {item.count} <span className="text-neutral-500 font-normal">({item.percentage}%)</span>
                  </span>
                </div>
                <div className="w-full h-1.5 rounded-full bg-neutral-800 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-400"
                    style={{ width: `${Math.min(100, Math.max(8, item.percentage))}%` }}
                  />
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full py-8 text-center text-xs text-neutral-500 font-mono">
              Awaiting inbound edge visitor requests...
            </div>
          )}
        </div>
      </div>

      {/* Real-time Visitor Stream Table */}
      <div className="p-6 rounded-3xl bg-neutral-950 border border-neutral-800 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-neutral-800">
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Real-Time Visitor Activity & IP Addresses</span>
            </h3>
            <p className="text-xs text-neutral-400 mt-0.5">
              Detailed log of visitor IP, location, page requested, device, and request frequency.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            {/* Search */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" />
              <input
                type="text"
                placeholder="Search IP, country, page..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 pr-3 py-1.5 rounded-xl bg-neutral-900 border border-neutral-800 text-xs text-white placeholder-neutral-500 w-48 sm:w-60 focus:outline-none focus:border-neutral-600"
              />
            </div>

            {/* Country filter */}
            <select
              value={countryFilter}
              onChange={(e) => setCountryFilter(e.target.value)}
              className="px-2.5 py-1.5 rounded-xl bg-neutral-900 border border-neutral-800 text-xs text-neutral-300 focus:outline-none"
            >
              <option value="all">All Countries</option>
              {analytics?.countryStats?.map((c) => (
                <option key={c.code} value={c.code}>
                  {c.flag} {c.country}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-neutral-300">
            <thead className="bg-neutral-900/60 text-neutral-400 uppercase font-semibold text-[10px] tracking-wider border-b border-neutral-800">
              <tr>
                <th className="py-3 px-4">Visitor IP Address</th>
                <th className="py-3 px-4">Country & City</th>
                <th className="py-3 px-4">Page Requested</th>
                <th className="py-3 px-4">Device / Browser</th>
                <th className="py-3 px-4">Requests</th>
                <th className="py-3 px-4">Time</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-900">
              {filteredVisitors.length > 0 ? (
                filteredVisitors.map((visitor) => (
                  <tr key={visitor.id} className="hover:bg-neutral-900/40 transition-colors">
                    {/* IP */}
                    <td className="py-3.5 px-4 font-mono text-white font-bold flex items-center gap-2">
                      <span>{visitor.ip}</span>
                      <button
                        type="button"
                        onClick={() => handleCopyIp(visitor.ip)}
                        className="text-neutral-500 hover:text-neutral-300 transition-colors p-1"
                        title="Copy IP Address"
                      >
                        {copiedIp === visitor.ip ? (
                          <Check className="w-3 h-3 text-emerald-400" />
                        ) : (
                          <Copy className="w-3 h-3" />
                        )}
                      </button>
                    </td>

                    {/* Country & City */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2">
                        <span className="text-sm">
                          {analytics?.countryStats?.find((c) => c.code === visitor.countryCode)?.flag ||
                            "🌐"}
                        </span>
                        <div>
                          <span className="font-semibold text-white block">{visitor.country}</span>
                          <span className="text-[10px] text-neutral-400 block">{visitor.city}</span>
                        </div>
                      </div>
                    </td>

                    {/* Page */}
                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 rounded-md bg-neutral-900 border border-neutral-800 font-mono text-[11px] text-neutral-300">
                        {visitor.page}
                      </span>
                    </td>

                    {/* Device & Browser */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2">
                        {getDeviceIcon(visitor.device)}
                        <span>
                          {visitor.device} • {visitor.browser}
                        </span>
                      </div>
                    </td>

                    {/* Requests Count */}
                    <td className="py-3.5 px-4">
                      <span
                        className={`font-mono font-bold px-2 py-0.5 rounded-md text-[11px] ${
                          visitor.requestCount >= 15
                            ? "bg-amber-500/10 text-amber-300 border border-amber-500/20"
                            : "bg-neutral-900 text-neutral-300"
                        }`}
                      >
                        {visitor.requestCount} reqs
                      </span>
                    </td>

                    {/* Time */}
                    <td className="py-3.5 px-4 text-neutral-400 font-mono text-[11px]">
                      {formatRelativeTime(visitor.timestamp)}
                    </td>

                    {/* Quick Action */}
                    <td className="py-3.5 px-4 text-right">
                      <button
                        type="button"
                        onClick={() => handleQuickBlock(visitor.ip)}
                        disabled={blockingIp === visitor.ip}
                        className="px-2.5 py-1 rounded-lg bg-neutral-900 border border-neutral-800 text-neutral-400 hover:text-rose-300 hover:border-rose-900/50 hover:bg-rose-500/10 text-[11px] font-semibold transition-all inline-flex items-center gap-1"
                        title="Quarantine IP under Anti-DDoS shield"
                      >
                        <ShieldAlert className="w-3 h-3 text-rose-400" />
                        <span>Block</span>
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-neutral-500 font-mono text-xs">
                    No visitor entries matched your criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
