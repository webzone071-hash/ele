import React, { useState, useEffect } from "react";
import { api } from "../../services/api";
import { DdosSecurityStatus, BlockedIp, DdosEvent } from "../../types";
import {
  ShieldCheck,
  ShieldAlert,
  Zap,
  Lock,
  Unlock,
  AlertTriangle,
  RefreshCw,
  Clock,
  Activity,
  CheckCircle2,
  Sliders,
  Flame,
} from "lucide-react";
import { useApp } from "../../context/AppContext";

export const AdminDdosManager: React.FC = () => {
  const { showToast } = useApp();
  const [securityStatus, setSecurityStatus] = useState<DdosSecurityStatus | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [isTesting, setIsTesting] = useState<boolean>(false);

  // Manual block form state
  const [manualIp, setManualIp] = useState<string>("");
  const [manualReason, setManualReason] = useState<string>("");
  const [manualHours, setManualHours] = useState<number>(1);
  const [isBlocking, setIsBlocking] = useState<boolean>(false);

  const fetchStatus = async (isManual = false) => {
    try {
      if (isManual) setIsRefreshing(true);
      else setIsLoading(true);

      const data = await api.getDdosSecurityStatus();
      setSecurityStatus(data);
      if (isManual) {
        showToast("DDoS shield telemetry refreshed.", "info");
      }
    } catch (err: any) {
      showToast(err.message || "Failed to load DDoS protection status.", "error");
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchStatus();
    const interval = setInterval(() => {
      fetchStatus(false);
    }, 10000); // 10s auto-refresh
    return () => clearInterval(interval);
  }, []);

  const handleUnblock = async (ip: string) => {
    try {
      await api.unblockIp(ip);
      showToast(`IP ${ip} has been unblocked.`, "success");
      await fetchStatus();
    } catch (err: any) {
      showToast(err.message || "Failed to unblock IP.", "error");
    }
  };

  const handleManualBlock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualIp) {
      showToast("Please enter a valid IP address.", "error");
      return;
    }
    try {
      setIsBlocking(true);
      await api.blockIp(
        manualIp.trim(),
        manualReason || "Manual administrator quarantine ban",
        manualHours
      );
      showToast(`IP ${manualIp} blocked for ${manualHours} hour(s).`, "success");
      setManualIp("");
      setManualReason("");
      await fetchStatus();
    } catch (err: any) {
      showToast(err.message || "Failed to quarantine IP.", "error");
    } finally {
      setIsBlocking(false);
    }
  };

  const handleRunSimulatorTest = async () => {
    try {
      setIsTesting(true);
      const testIp = "203.0.113." + Math.floor(Math.random() * 150 + 20);
      const res = await api.triggerDdosTest(testIp);
      showToast(
        res.message ||
          `DDoS Simulation: IP ${testIp} exceeded 20 requests and has been quarantined for 1 hour!`,
        "success"
      );
      await fetchStatus();
    } catch (err: any) {
      showToast(err.message || "Simulation test failed.", "error");
    } finally {
      setIsTesting(false);
    }
  };

  const activeBlocks = (securityStatus?.blockedIps || []).filter((b: any) => !b.isExpired);
  const expiredBlocks = (securityStatus?.blockedIps || []).filter((b: any) => b.isExpired);

  return (
    <div className="space-y-8 max-w-6xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-rose-400" />
              <span>ApexShield Anti-DDoS & IP Quarantine</span>
            </h2>
            <span className="px-2.5 py-0.5 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-400 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-400 animate-ping" />
              Active Mitigation
            </span>
          </div>
          <p className="text-xs text-neutral-400 mt-1">
            Automated burst mitigation, IP rate limiting, and 1-hour quarantine policy for attack vectors.
          </p>
        </div>

        <div className="flex items-center gap-2.5 self-start sm:self-auto">
          <button
            type="button"
            onClick={() => fetchStatus(true)}
            disabled={isRefreshing}
            className="px-3.5 py-2 rounded-xl bg-neutral-900 border border-neutral-800 text-neutral-300 hover:text-white hover:bg-neutral-800 text-xs font-semibold flex items-center gap-1.5 transition-all min-h-[40px]"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? "animate-spin text-rose-400" : ""}`} />
            <span>{isRefreshing ? "Updating..." : "Refresh"}</span>
          </button>
        </div>
      </div>

      {/* DDoS Protection Policy Spec Card */}
      <div className="p-6 sm:p-8 rounded-3xl bg-neutral-950 border border-neutral-800 relative overflow-hidden">
        <div className="absolute -right-16 -top-16 w-64 h-64 bg-rose-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs font-bold font-mono">
              <Zap className="w-3.5 h-3.5" />
              <span>CORE POLICY ENFORCEMENT</span>
            </div>

            <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              High-Frequency Request Burst Protection
            </h3>

            <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed">
              If an inbound IP address fires <strong className="text-white">20+ requests</strong> in a
              very short sliding window (<strong className="text-white">10 seconds</strong>),
              ApexShield automatically registers a DDoS attack signature and immediately{" "}
              <strong className="text-rose-400">quarantines the IP for exactly 1 hour (3,600 seconds)</strong>.
            </p>

            {/* Spec Metrics Row */}
            <div className="grid grid-cols-3 gap-3 pt-2">
              <div className="p-3 rounded-xl bg-neutral-900/90 border border-neutral-800">
                <span className="text-[10px] font-mono uppercase text-neutral-400 block">Burst Threshold</span>
                <span className="text-base sm:text-lg font-black text-white">20+ Reqs</span>
              </div>
              <div className="p-3 rounded-xl bg-neutral-900/90 border border-neutral-800">
                <span className="text-[10px] font-mono uppercase text-neutral-400 block">Detection Window</span>
                <span className="text-base sm:text-lg font-black text-white">10 Seconds</span>
              </div>
              <div className="p-3 rounded-xl bg-neutral-900/90 border border-neutral-800">
                <span className="text-[10px] font-mono uppercase text-neutral-400 block">Ban Duration</span>
                <span className="text-base sm:text-lg font-black text-rose-400">1 Hour Ban</span>
              </div>
            </div>
          </div>

          {/* Test Simulator Action Box */}
          <div className="p-5 rounded-2xl bg-neutral-900 border border-neutral-800 lg:w-72 shrink-0 space-y-3">
            <div className="flex items-center gap-2 text-white font-bold text-xs">
              <Flame className="w-4 h-4 text-amber-400" />
              <span>Attack Simulation Test</span>
            </div>
            <p className="text-[11px] text-neutral-400 leading-normal">
              Test and verify the 1-hour quarantine by simulating a burst of 22 requests in 3.4 seconds.
            </p>
            <button
              type="button"
              onClick={handleRunSimulatorTest}
              disabled={isTesting}
              className="w-full py-2.5 px-4 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-lg disabled:opacity-50 min-h-[42px]"
            >
              <Zap className={`w-3.5 h-3.5 ${isTesting ? "animate-spin" : ""}`} />
              <span>{isTesting ? "Simulating Attack..." : "Test 20+ Req Trigger"}</span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI Counters */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-neutral-950 border border-neutral-800 flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-400 block mb-1">
              Active Quarantined IPs
            </span>
            <span className="text-3xl font-black text-rose-400 tracking-tight">
              {activeBlocks.length}
            </span>
            <span className="text-[11px] text-neutral-400 block mt-1">Currently blocked (429 code)</span>
          </div>
          <div className="w-11 h-11 rounded-xl bg-neutral-900 border border-neutral-800 flex items-center justify-center text-rose-400">
            <Lock className="w-5 h-5" />
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-neutral-950 border border-neutral-800 flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-400 block mb-1">
              Total Mitigations Handled
            </span>
            <span className="text-3xl font-black text-white tracking-tight">
              {securityStatus?.totalBlockedCount ?? "--"}
            </span>
            <span className="text-[11px] text-neutral-400 block mt-1">Surge attacks neutralized</span>
          </div>
          <div className="w-11 h-11 rounded-xl bg-neutral-900 border border-neutral-800 flex items-center justify-center text-amber-400">
            <Activity className="w-5 h-5" />
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-neutral-950 border border-neutral-800 flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-400 block mb-1">
              Firewall Health
            </span>
            <span className="text-2xl font-black text-emerald-400 tracking-tight flex items-center gap-1.5">
              <CheckCircle2 className="w-5 h-5" />
              <span>100% Operational</span>
            </span>
            <span className="text-[11px] text-neutral-400 block mt-1">Sliding-window rate limiter active</span>
          </div>
          <div className="w-11 h-11 rounded-xl bg-neutral-900 border border-neutral-800 flex items-center justify-center text-emerald-400">
            <ShieldCheck className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Active Quarantined IPs Table */}
      <div className="p-6 rounded-3xl bg-neutral-950 border border-neutral-800 space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-neutral-800">
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
              <span>Active Quarantined IPs (1-Hour Block Enforcement)</span>
            </h3>
            <p className="text-xs text-neutral-400 mt-0.5">
              IP addresses currently denied all HTTP access with 429 Too Many Requests response.
            </p>
          </div>
          <span className="text-xs font-mono text-rose-400 font-bold">
            {activeBlocks.length} Active Quarantine(s)
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-neutral-300">
            <thead className="bg-neutral-900/60 text-neutral-400 uppercase font-semibold text-[10px] tracking-wider border-b border-neutral-800">
              <tr>
                <th className="py-3 px-4">Quarantined IP</th>
                <th className="py-3 px-4">Trigger Reason</th>
                <th className="py-3 px-4">Blocked At</th>
                <th className="py-3 px-4">Time Remaining</th>
                <th className="py-3 px-4">Ban Until</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-900">
              {activeBlocks.length > 0 ? (
                activeBlocks.map((block: any) => {
                  const minutesLeft = Math.max(1, Math.ceil((block.remainingSeconds || 60) / 60));
                  return (
                    <tr key={block.id} className="hover:bg-neutral-900/40 transition-colors">
                      <td className="py-3.5 px-4 font-mono text-white font-bold flex items-center gap-2">
                        <Lock className="w-3.5 h-3.5 text-rose-400" />
                        <span>{block.ip}</span>
                      </td>

                      <td className="py-3.5 px-4 max-w-xs">
                        <span className="text-neutral-300 truncate block" title={block.reason}>
                          {block.reason}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 font-mono text-neutral-400 text-[11px]">
                        {new Date(block.blockedAt).toLocaleTimeString()}
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="px-2.5 py-0.5 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-300 font-mono text-[11px] font-bold inline-flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          <span>~{minutesLeft} min left</span>
                        </span>
                      </td>

                      <td className="py-3.5 px-4 font-mono text-neutral-400 text-[11px]">
                        {new Date(block.blockedUntil).toLocaleTimeString()}
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <button
                          type="button"
                          onClick={() => handleUnblock(block.ip)}
                          className="px-3 py-1.5 rounded-lg bg-neutral-900 border border-neutral-700 text-emerald-400 hover:bg-emerald-500/10 text-xs font-semibold transition-all inline-flex items-center gap-1"
                        >
                          <Unlock className="w-3 h-3" />
                          <span>Unblock IP</span>
                        </button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-neutral-500 font-mono text-xs">
                    No IPs currently quarantined. Perimeter defense is nominal.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Manual IP Quarantine & Attack Log Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Manual Quarantine Form */}
        <div className="p-6 rounded-3xl bg-neutral-950 border border-neutral-800 space-y-4">
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Sliders className="w-4 h-4 text-neutral-400" />
              <span>Manual IP Quarantine</span>
            </h3>
            <p className="text-xs text-neutral-400 mt-0.5">
              Instantly blacklist an abusive IP address across all endpoints.
            </p>
          </div>

          <form onSubmit={handleManualBlock} className="space-y-3.5">
            <div>
              <label className="block text-[11px] font-bold text-neutral-400 uppercase mb-1">
                IP Address
              </label>
              <input
                type="text"
                placeholder="e.g. 198.51.100.25"
                value={manualIp}
                onChange={(e) => setManualIp(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-neutral-900 border border-neutral-800 text-xs text-white font-mono"
                required
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-neutral-400 uppercase mb-1">
                Reason / Note
              </label>
              <input
                type="text"
                placeholder="e.g. Malicious probing / repeated spam"
                value={manualReason}
                onChange={(e) => setManualReason(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-neutral-900 border border-neutral-800 text-xs text-white"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-neutral-400 uppercase mb-1">
                Quarantine Duration
              </label>
              <select
                value={manualHours}
                onChange={(e) => setManualHours(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl bg-neutral-900 border border-neutral-800 text-xs text-white"
              >
                <option value={1}>1 Hour (Standard DDoS Penalty)</option>
                <option value={6}>6 Hours</option>
                <option value={24}>24 Hours</option>
                <option value={72}>72 Hours (Extended Ban)</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={isBlocking}
              className="w-full py-2.5 px-4 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-white font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 min-h-[42px]"
            >
              <Lock className="w-3.5 h-3.5 text-rose-400" />
              <span>{isBlocking ? "Quarantining..." : "Quarantine IP"}</span>
            </button>
          </form>
        </div>

        {/* DDoS Mitigation Event Audit History */}
        <div className="lg:col-span-2 p-6 rounded-3xl bg-neutral-950 border border-neutral-800 space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-neutral-800">
            <div>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                DDoS Mitigation Audit History
              </h3>
              <p className="text-xs text-neutral-400 mt-0.5">
                Chronological log of burst detections and automated 1-hour quarantine triggers.
              </p>
            </div>
            <span className="text-xs font-mono text-neutral-400">
              {securityStatus?.recentEvents?.length || 0} Events
            </span>
          </div>

          <div className="space-y-2.5 max-h-80 overflow-y-auto pr-1">
            {securityStatus?.recentEvents && securityStatus.recentEvents.length > 0 ? (
              securityStatus.recentEvents.map((evt) => (
                <div
                  key={evt.id}
                  className="p-3 rounded-xl bg-neutral-900/70 border border-neutral-800/80 flex items-start justify-between gap-3 text-xs"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-white">{evt.ip}</span>
                      <span className="px-2 py-0.5 rounded bg-rose-500/10 text-rose-300 font-mono text-[10px] font-bold">
                        {evt.action}
                      </span>
                    </div>
                    <p className="text-[11px] text-neutral-400">{evt.details}</p>
                  </div>
                  <span className="text-[11px] font-mono text-neutral-500 whitespace-nowrap">
                    {new Date(evt.timestamp).toLocaleTimeString()}
                  </span>
                </div>
              ))
            ) : (
              <div className="py-8 text-center text-xs text-neutral-500 font-mono">
                No high-frequency attack bursts detected.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
