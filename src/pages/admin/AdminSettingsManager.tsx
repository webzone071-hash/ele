import React, { useState, useRef } from "react";
import { useApp } from "../../context/AppContext";
import { AgencySettings, SiteSettings } from "../../types";
import { api } from "../../services/api";
import {
  Settings,
  Save,
  ShieldCheck,
  Database,
  RotateCcw,
  Upload,
  Image as ImageIcon,
  Check,
  Globe,
  Sparkles,
  ExternalLink,
  Eye,
  Trash2,
} from "lucide-react";

export const AdminSettingsManager: React.FC = () => {
  const { settings, refreshData, showToast } = useApp();

  const [form, setForm] = useState<AgencySettings & Partial<SiteSettings>>(
    settings || {
      id: "settings-1",
      agencyName: "Tech Elevant",
      shortName: "Tech Elevant",
      tagline: "Enterprise Software Engineering & Digital Transformation",
      description: "Tech Elevant architects and engineers mission-critical web applications, enterprise SaaS platforms, AI systems, and cloud infrastructure.",
      logoText: "TE",
      logoType: "both",
      logoUrl: "/logo.svg",
      darkLogoUrl: "/logo-white.svg",
      faviconUrl: "/favicon.svg",
      brandColor: "#001C7A",
      secondaryColor: "#5B6774",
      email: "contact@techelevant.com",
      phone: "+1 (415) 890-3420",
      whatsapp: "+14158903420",
      address: "750 Montgomery St, Suite 400, San Francisco, CA 94111, United States",
      officeHours: "Mon - Fri: 9:00 AM - 6:00 PM EST (24/7 Enterprise Support)",
      seoTitle: "Tech Elevant | Enterprise Software & AI Engineering Agency",
      seoDescription: "Award-winning software engineering agency delivering bespoke web apps, enterprise SaaS, AI systems, and cloud architecture.",
      seoKeywords: "Tech Elevant, software development agency, web development, custom software, AI agents, SaaS engineering",
      footerText: "Tech Elevant is an international software development powerhouse.",
      copyrightText: "© 2026 Tech Elevant. All Rights Reserved.",
      updatedAt: new Date().toISOString(),
      metaTitle: "Tech Elevant | Enterprise Software & AI Engineering Agency",
      metaDescription: "Enterprise software, cloud platforms, mobile engineering, and AI agent architectures.",
    }
  );

  const [isSaving, setIsSaving] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);
  const [isUploadingFavicon, setIsUploadingFavicon] = useState(false);

  const logoFileInputRef = useRef<HTMLInputElement>(null);
  const faviconFileInputRef = useRef<HTMLInputElement>(null);

  // Preset favicons for instant selection
  const presetFavicons = [
    {
      name: "Apex Monogram",
      url: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=64&auto=format&fit=crop&q=80",
    },
    {
      name: "Shield Cyber",
      url: "https://images.unsplash.com/photo-1563986768609-322da13575f3?w=64&auto=format&fit=crop&q=80",
    },
    {
      name: "Quantum Blue",
      url: "https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?w=64&auto=format&fit=crop&q=80",
    },
    {
      name: "Emerald Tech",
      url: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=64&auto=format&fit=crop&q=80",
    },
  ];

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSaving(true);
      await api.updateSettings(form);
      showToast("Agency settings and branding saved successfully!", "success");
      await refreshData();
    } catch (err: any) {
      showToast(err.message || "Failed to save settings.", "error");
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploadingLogo(true);
      const res = await api.uploadBrandAsset(file);
      setForm((prev) => ({
        ...prev,
        logoUrl: res.url,
      }));
      showToast("Logo mark image uploaded successfully!", "success");
    } catch (err: any) {
      showToast(err.message || "Failed to upload logo image.", "error");
    } finally {
      setIsUploadingLogo(false);
      if (logoFileInputRef.current) logoFileInputRef.current.value = "";
    }
  };

  const handleFaviconUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploadingFavicon(true);
      const res = await api.uploadBrandAsset(file);
      setForm((prev) => ({
        ...prev,
        faviconUrl: res.url,
      }));

      // Dynamically test update in real tab
      const link = document.querySelector("link[rel~='icon']") as HTMLLinkElement;
      if (link) link.href = res.url;

      showToast("Favicon uploaded and applied to browser tab!", "success");
    } catch (err: any) {
      showToast(err.message || "Failed to upload favicon.", "error");
    } finally {
      setIsUploadingFavicon(false);
      if (faviconFileInputRef.current) faviconFileInputRef.current.value = "";
    }
  };

  const handleApplyFaviconToTab = (url: string) => {
    setForm((prev) => ({ ...prev, faviconUrl: url }));
    let link = document.querySelector("link[rel~='icon']") as HTMLLinkElement;
    if (!link) {
      link = document.createElement("link");
      link.rel = "icon";
      document.head.appendChild(link);
    }
    link.href = url;
    showToast("Favicon preview applied to active browser tab.", "info");
  };

  const handleReset = async () => {
    if (!window.confirm("Are you sure you want to reset all data back to clean factory seed?")) {
      return;
    }
    try {
      setIsResetting(true);
      await api.resetDatabase();
      await refreshData();
      showToast("Database restored to clean seed data.", "success");
    } catch (err: any) {
      showToast(err.message || "Failed to reset.", "error");
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <div className="space-y-8 max-w-5xl">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <Settings className="w-5 h-5 text-neutral-300" />
            <span>Global Agency Profile & Brand Architecture</span>
          </h2>
          <p className="text-xs text-neutral-400 mt-1">
            Configure agency name, logo mark upload, logo text, browser favicon, and contact channels.
          </p>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-8">
        {/* ==================================================== */}
        {/* SECTION 1: LOGO MARK & BRANDING CUSTOMIZER           */}
        {/* ==================================================== */}
        <div className="p-6 sm:p-8 rounded-3xl bg-neutral-950 border border-neutral-800 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-neutral-800">
            <div>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span>Logo Mark & Brand Display Customizer</span>
              </h3>
              <p className="text-xs text-neutral-400 mt-0.5">
                Customize whether the logo is displayed as text, an uploaded graphic mark, or both.
              </p>
            </div>
            <span className="text-xs font-mono text-neutral-400">Branding Suite</span>
          </div>

          {/* Logo Display Mode Selector */}
          <div>
            <label className="block text-xs font-bold text-neutral-300 uppercase mb-2">
              Logo Display Format
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                { id: "both", label: "Logo Mark + Text", desc: "Graphic icon alongside brand name" },
                { id: "image", label: "Logo Image Only", desc: "Pure uploaded graphic or emblem" },
                { id: "text", label: "Text Only", desc: "Stylized Logo Mark Text badge" },
              ].map((mode) => (
                <button
                  key={mode.id}
                  type="button"
                  onClick={() => setForm({ ...form, logoType: mode.id as any })}
                  className={`p-3.5 rounded-xl border text-left transition-all ${
                    form.logoType === mode.id
                      ? "bg-neutral-900 border-white text-white shadow-md"
                      : "bg-neutral-950 border-neutral-800 text-neutral-400 hover:border-neutral-700"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white">{mode.label}</span>
                    {form.logoType === mode.id && <Check className="w-3.5 h-3.5 text-white" />}
                  </div>
                  <span className="text-[11px] text-neutral-400 mt-1 block">{mode.desc}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {/* Agency Name */}
            <div>
              <label className="block text-xs font-bold text-neutral-300 uppercase mb-1">
                Agency Full Name
              </label>
              <input
                type="text"
                value={form.agencyName}
                onChange={(e) => setForm({ ...form, agencyName: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-900 border border-neutral-800 text-xs text-white"
                required
              />
            </div>

            {/* Logo Mark Text */}
            <div>
              <label className="block text-xs font-bold text-neutral-300 uppercase mb-1 flex items-center justify-between">
                <span>Logo Mark Text (Emblem / Monogram)</span>
                <span className="text-[10px] text-neutral-400 font-normal">e.g. APEX, AC, CORE</span>
              </label>
              <input
                type="text"
                value={form.logoText || ""}
                onChange={(e) => setForm({ ...form, logoText: e.target.value })}
                placeholder="APEX"
                maxLength={8}
                className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-900 border border-neutral-800 text-xs text-white font-mono uppercase tracking-wider"
              />
            </div>
          </div>

          {/* Logo Mark File Upload & URL */}
          <div className="space-y-3 pt-2">
            <label className="block text-xs font-bold text-neutral-300 uppercase">
              Upload Logo Mark Graphic (PNG, SVG, JPG, WebP)
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* File Upload Box */}
              <div className="p-4 rounded-2xl bg-neutral-900/80 border border-dashed border-neutral-700 hover:border-neutral-500 transition-colors flex flex-col items-center justify-center text-center gap-2.5">
                <input
                  type="file"
                  ref={logoFileInputRef}
                  onChange={handleLogoUpload}
                  accept="image/png,image/jpeg,image/svg+xml,image/webp"
                  className="hidden"
                  id="logo-file-input"
                />
                <div className="w-10 h-10 rounded-xl bg-neutral-800 text-neutral-300 flex items-center justify-center">
                  <Upload className="w-5 h-5" />
                </div>
                <div>
                  <button
                    type="button"
                    onClick={() => logoFileInputRef.current?.click()}
                    disabled={isUploadingLogo}
                    className="px-4 py-2 rounded-xl bg-white text-neutral-950 font-bold text-xs hover:bg-neutral-200 transition-colors inline-flex items-center gap-1.5"
                  >
                    <span>{isUploadingLogo ? "Uploading Image..." : "Select Logo File"}</span>
                  </button>
                  <p className="text-[10px] text-neutral-500 mt-1.5">
                    Direct upload from your computer to /public/uploads
                  </p>
                </div>
              </div>

              {/* URL or Direct Preview */}
              <div className="space-y-2">
                <label className="block text-[11px] font-semibold text-neutral-400">
                  Or enter Logo Mark Image URL:
                </label>
                <input
                  type="url"
                  value={form.logoUrl || ""}
                  onChange={(e) => setForm({ ...form, logoUrl: e.target.value })}
                  placeholder="https://example.com/logo.png"
                  className="w-full px-3 py-2 rounded-xl bg-neutral-900 border border-neutral-800 text-xs text-white font-mono"
                />

                {form.logoUrl && (
                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-neutral-900 border border-neutral-800 text-xs">
                    <div className="flex items-center gap-2">
                      <img
                        src={form.logoUrl}
                        alt="Logo Preview"
                        className="w-7 h-7 object-contain rounded bg-neutral-800 p-0.5"
                      />
                      <span className="text-neutral-300 text-[11px] truncate max-w-[140px]">
                        {form.logoUrl}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setForm({ ...form, logoUrl: "" })}
                      className="text-neutral-400 hover:text-rose-400 p-1"
                      title="Remove Logo Image"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Live Logo Preview Box */}
          <div className="p-4 rounded-2xl bg-neutral-900 border border-neutral-800 space-y-3">
            <span className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider block">
              Live Header & Navigation Brand Preview
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Light Background Preview (as seen on website header) */}
              <div className="p-4 rounded-xl bg-white border border-neutral-200 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {form.logoUrl && form.logoType !== "text" ? (
                    <img
                      src={form.logoUrl}
                      alt="Logo Mark"
                      className="w-9 h-9 object-contain rounded-lg"
                    />
                  ) : (
                    <div className="w-9 h-9 rounded-xl bg-neutral-950 flex items-center justify-center text-white font-black text-sm tracking-wider shadow-sm">
                      {form.logoText || "APEX"}
                    </div>
                  )}

                  {form.logoType !== "image" && (
                    <div>
                      <span className="font-extrabold text-sm text-neutral-950 block leading-tight">
                        {form.agencyName || "ApexCore Labs"}
                      </span>
                      <span className="text-[9px] font-semibold text-neutral-500 uppercase tracking-wider">
                        Enterprise Engineering
                      </span>
                    </div>
                  )}
                </div>
                <span className="text-[10px] font-mono text-neutral-400 bg-neutral-100 px-2 py-0.5 rounded">
                  Light Header
                </span>
              </div>

              {/* Dark Background Preview (as seen in dark mode / footer) */}
              <div className="p-4 rounded-xl bg-neutral-950 border border-neutral-800 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {form.logoUrl && form.logoType !== "text" ? (
                    <img
                      src={form.logoUrl}
                      alt="Logo Mark"
                      className="w-9 h-9 object-contain rounded-lg"
                    />
                  ) : (
                    <div className="w-9 h-9 rounded-xl bg-white flex items-center justify-center text-neutral-950 font-black text-sm tracking-wider shadow-sm">
                      {form.logoText || "APEX"}
                    </div>
                  )}

                  {form.logoType !== "image" && (
                    <div>
                      <span className="font-extrabold text-sm text-white block leading-tight">
                        {form.agencyName || "ApexCore Labs"}
                      </span>
                      <span className="text-[9px] font-semibold text-neutral-400 uppercase tracking-wider">
                        Software Agency
                      </span>
                    </div>
                  )}
                </div>
                <span className="text-[10px] font-mono text-neutral-500 bg-neutral-900 px-2 py-0.5 rounded">
                  Dark Footer
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* ==================================================== */}
        {/* SECTION 2: DEDICATED FAVICON UPDATE SECTION         */}
        {/* ==================================================== */}
        <div className="p-6 sm:p-8 rounded-3xl bg-neutral-950 border border-neutral-800 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-neutral-800">
            <div>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Globe className="w-4 h-4 text-blue-400" />
                <span>Browser Favicon & Tab Icon Management</span>
              </h3>
              <p className="text-xs text-neutral-400 mt-0.5">
                Upload or update the icon shown on browser tabs, bookmarks, and mobile home screens.
              </p>
            </div>
            <span className="text-xs font-mono text-neutral-400">32x32 / 64x64 PX</span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Upload & URL Input Controls */}
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-neutral-300 uppercase mb-2">
                  Upload Favicon File (.ico, .png, .svg)
                </label>
                <div className="p-4 rounded-2xl bg-neutral-900/80 border border-dashed border-neutral-700 hover:border-neutral-500 transition-colors flex items-center justify-between gap-4">
                  <input
                    type="file"
                    ref={faviconFileInputRef}
                    onChange={handleFaviconUpload}
                    accept="image/x-icon,image/png,image/svg+xml,image/jpeg"
                    className="hidden"
                    id="favicon-file-input"
                  />
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-neutral-800 text-blue-400 flex items-center justify-center shrink-0">
                      <Globe className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-white block">Select from Device</span>
                      <span className="text-[10px] text-neutral-400 block">
                        Recommended: Square 32×32 or 64×64 PNG/ICO
                      </span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => faviconFileInputRef.current?.click()}
                    disabled={isUploadingFavicon}
                    className="px-4 py-2 rounded-xl bg-white text-neutral-950 font-bold text-xs hover:bg-neutral-200 transition-colors shrink-0"
                  >
                    <span>{isUploadingFavicon ? "Uploading..." : "Upload Favicon"}</span>
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-300 uppercase mb-1">
                  Or enter Favicon Web URL
                </label>
                <div className="flex gap-2">
                  <input
                    type="url"
                    value={form.faviconUrl || ""}
                    onChange={(e) => setForm({ ...form, faviconUrl: e.target.value })}
                    placeholder="https://example.com/favicon.png"
                    className="flex-1 px-3 py-2 rounded-xl bg-neutral-900 border border-neutral-800 text-xs text-white font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => handleApplyFaviconToTab(form.faviconUrl || "")}
                    className="px-3 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-semibold whitespace-nowrap transition-colors"
                    title="Apply directly to active browser tab"
                  >
                    Test in Tab
                  </button>
                </div>
              </div>

              {/* Quick Preset Selector */}
              <div>
                <label className="block text-[11px] font-bold text-neutral-400 uppercase mb-2">
                  Quick Agency Favicon Presets
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {presetFavicons.map((preset) => (
                    <button
                      key={preset.name}
                      type="button"
                      onClick={() => handleApplyFaviconToTab(preset.url)}
                      className={`p-2 rounded-xl border flex items-center gap-2 text-left transition-all ${
                        form.faviconUrl === preset.url
                          ? "bg-neutral-900 border-blue-400 text-white"
                          : "bg-neutral-950 border-neutral-800 text-neutral-400 hover:border-neutral-700"
                      }`}
                    >
                      <img
                        src={preset.url}
                        alt={preset.name}
                        className="w-5 h-5 rounded object-cover"
                      />
                      <span className="text-xs truncate">{preset.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Realistic Browser Tab Mockup Preview */}
            <div className="p-5 rounded-2xl bg-neutral-900 border border-neutral-800 space-y-3 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-400">
                    Real Browser Tab Simulation
                  </span>
                  <span className="text-[10px] font-mono text-emerald-400 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    Live Tab Preview
                  </span>
                </div>

                {/* Simulated Chrome Browser Header */}
                <div className="rounded-xl bg-neutral-950 border border-neutral-800 p-2.5 space-y-2">
                  <div className="flex items-center gap-1.5 pb-1 border-b border-neutral-900">
                    <span className="w-2.5 h-2.5 rounded-full bg-rose-500/80 inline-block" />
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80 inline-block" />
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80 inline-block" />
                    <span className="text-[10px] text-neutral-500 font-mono ml-2">Chrome Tab</span>
                  </div>

                  {/* Browser Tab Pill */}
                  <div className="w-full sm:max-w-xs py-1.5 px-3 rounded-lg bg-neutral-900 border border-neutral-800 flex items-center justify-between gap-2 shadow-inner">
                    <div className="flex items-center gap-2 overflow-hidden">
                      {form.faviconUrl ? (
                        <img
                          src={form.faviconUrl}
                          alt="Favicon"
                          className="w-4 h-4 rounded-sm object-cover shrink-0"
                          onError={(e) => {
                            (e.target as HTMLElement).style.display = "none";
                          }}
                        />
                      ) : (
                        <Globe className="w-4 h-4 text-blue-400 shrink-0" />
                      )}
                      <span className="text-xs text-white font-medium truncate">
                        {form.agencyName || "ApexCore Labs"} | Software
                      </span>
                    </div>
                    <span className="text-neutral-500 hover:text-white text-xs cursor-default">×</span>
                  </div>
                </div>
              </div>

              {/* Summary note */}
              <p className="text-[11px] text-neutral-400 leading-normal pt-2 border-t border-neutral-800/80">
                Saving will update the site's <code className="text-neutral-200">&lt;link rel="icon"&gt;</code>{" "}
                and the dynamic <code className="text-neutral-200">/favicon.ico</code> backend route
                instantly across all visitor devices.
              </p>
            </div>
          </div>
        </div>

        {/* ==================================================== */}
        {/* SECTION 3: CONTACT CHANNELS & OFFICES                */}
        {/* ==================================================== */}
        <div className="p-6 sm:p-8 rounded-3xl bg-neutral-950 border border-neutral-800 space-y-4">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider pb-2 border-b border-neutral-800">
            Contact Channels & Office Details
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-neutral-300 uppercase mb-1">
                Corporate Email
              </label>
              <input
                type="email"
                value={form.email || ""}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-900 border border-neutral-800 text-xs text-white"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-neutral-300 uppercase mb-1">
                Phone / WhatsApp
              </label>
              <input
                type="text"
                value={form.phone || ""}
                onChange={(e) => setForm({ ...form, phone: e.target.value, whatsapp: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-900 border border-neutral-800 text-xs text-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-neutral-300 uppercase mb-1">
                Office Headquarters
              </label>
              <input
                type="text"
                value={form.address || ""}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-900 border border-neutral-800 text-xs text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-neutral-300 uppercase mb-1">
                Operating Hours
              </label>
              <input
                type="text"
                value={form.officeHours || ""}
                onChange={(e) => setForm({ ...form, officeHours: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-900 border border-neutral-800 text-xs text-white"
              />
            </div>
          </div>
        </div>

        {/* ==================================================== */}
        {/* SECTION 4: SEO METADATA                              */}
        {/* ==================================================== */}
        <div className="p-6 sm:p-8 rounded-3xl bg-neutral-950 border border-neutral-800 space-y-4">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider pb-2 border-b border-neutral-800">
            SEO & Search Engine Indexing
          </h3>

          <div>
            <label className="block text-xs font-bold text-neutral-300 uppercase mb-1">
              Page Meta Title
            </label>
            <input
              type="text"
              value={form.seoTitle || form.metaTitle || ""}
              onChange={(e) =>
                setForm({ ...form, seoTitle: e.target.value, metaTitle: e.target.value })
              }
              className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-900 border border-neutral-800 text-xs text-white"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-neutral-300 uppercase mb-1">
              Meta Description
            </label>
            <textarea
              rows={2}
              value={form.seoDescription || form.metaDescription || ""}
              onChange={(e) =>
                setForm({
                  ...form,
                  seoDescription: e.target.value,
                  metaDescription: e.target.value,
                })
              }
              className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-900 border border-neutral-800 text-xs text-white"
            />
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex items-center justify-between pt-2">
          <button
            type="submit"
            disabled={isSaving}
            className="px-8 py-3.5 rounded-xl bg-white text-neutral-950 font-bold text-xs uppercase tracking-wider hover:bg-neutral-200 transition-colors flex items-center gap-2 shadow-lg disabled:opacity-50 min-h-[44px]"
          >
            <Save className="w-4 h-4" />
            <span>{isSaving ? "Saving Settings..." : "Save All Agency Settings & Branding"}</span>
          </button>
        </div>
      </form>

      {/* Database State Card */}
      <div className="p-6 sm:p-8 rounded-3xl bg-neutral-950 border border-neutral-800 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-neutral-900 text-emerald-400 flex items-center justify-center border border-neutral-800 shrink-0">
            <Database className="w-6 h-6" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-white">
              Data Storage Engine: Resilient File-Backed Store
            </h4>
            <p className="text-xs text-neutral-400 mt-0.5">
              Supports MongoDB connection string via MONGODB_URI or automatic zero-config file persistence.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleReset}
          disabled={isResetting}
          className="px-4 py-2.5 rounded-xl bg-neutral-900 border border-neutral-700 text-rose-300 hover:bg-rose-500/10 text-xs font-bold uppercase tracking-wider transition-colors flex items-center gap-1.5 self-start sm:self-auto shrink-0"
        >
          <RotateCcw className={`w-3.5 h-3.5 ${isResetting ? "animate-spin" : ""}`} />
          <span>Reset to Factory Seed</span>
        </button>
      </div>
    </div>
  );
};
