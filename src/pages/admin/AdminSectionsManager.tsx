import React, { useState, useEffect } from "react";
import { useApp } from "../../context/AppContext";
import { HeroData, SectionConfig } from "../../types";
import { api } from "../../services/api";
import {
  Layers,
  Sparkles,
  ArrowDown,
  ArrowUp,
  Save,
  Eye,
  EyeOff,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  RotateCcw,
} from "lucide-react";

interface SectionMeta {
  description: string;
  badge: string;
}

const SECTION_METADATA: Record<string, SectionMeta> = {
  hero: {
    description: "Primary value proposition, headline, call-to-action buttons, stats strip, and interactive showcase window.",
    badge: "Header / Hero",
  },
  trust: {
    description: "Enterprise partner logos, client proof credentials, and verified technology trust badges.",
    badge: "Social Proof",
  },
  about_preview: {
    description: "Brief agency background story, core values, and executive leadership summary.",
    badge: "About Us",
  },
  services: {
    description: "Full-stack software engineering offerings including Web, Mobile, Cloud, and AI solutions.",
    badge: "Services",
  },
  why_us: {
    description: "Key architectural differentiators, 99.99% uptime guarantees, and security compliance.",
    badge: "Value Props",
  },
  portfolio: {
    description: "Featured client case studies, technology stacks, metrics, and production screenshots.",
    badge: "Case Studies",
  },
  fiverr: {
    description: "Turnkey fixed-scope service packages, starting price badges, and direct order buttons.",
    badge: "Fiverr Gigs",
  },
  process: {
    description: "4-stage structured engineering workflow from architectural discovery to deployment.",
    badge: "Workflow",
  },
  testimonials: {
    description: "Executive testimonials, star ratings, and client organization endorsements.",
    badge: "Reviews",
  },
  cta: {
    description: "Bottom high-converting consultation banner prompting visitors to schedule project scoping.",
    badge: "Conversion",
  },
};

export const AdminSectionsManager: React.FC = () => {
  const { data, refreshData, showToast } = useApp();
  const hero = data?.hero;
  const sections = data?.sections || [];

  const [heroForm, setHeroForm] = useState<HeroData>(
    hero || {
      heading: "Building Digital Products That Move",
      highlightedHeading: "Businesses Forward",
      description:
        "We design and develop high-performance websites, mobile applications, AI solutions, and custom software that help businesses scale globally.",
      badgeText: "Accepting Q3 / Q4 Enterprise Projects",
      primaryCtaText: "Start Your Project",
      primaryCtaUrl: "/get-in-touch",
      secondaryCtaText: "View Case Studies",
      secondaryCtaUrl: "/portfolio",
      heroImageUrl:
        "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1600&auto=format&fit=crop&q=85",
      stats: [
        { label: "Delivered Systems", value: "140+" },
        { label: "Global Clients", value: "60+" },
        { label: "Client Rating", value: "5.0 ★" },
        { label: "Countries Served", value: "18+" },
      ],
    }
  );

  const [sectionList, setSectionList] = useState<SectionConfig[]>(sections);
  const [isSavingHero, setIsSavingHero] = useState(false);
  const [isSavingSections, setIsSavingSections] = useState(false);
  const [activeTogglingKey, setActiveTogglingKey] = useState<string | null>(null);

  // Synchronize state when data loads or updates
  useEffect(() => {
    if (sections && sections.length > 0) {
      setSectionList(sections);
    }
  }, [sections]);

  useEffect(() => {
    if (hero) {
      setHeroForm(hero);
    }
  }, [hero]);

  const handleSaveHero = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSavingHero(true);
      await api.updateHero(heroForm);
      showToast("Hero section configuration updated successfully!", "success");
      await refreshData();
    } catch (err: any) {
      showToast(err.message || "Failed to update hero section.", "error");
    } finally {
      setIsSavingHero(false);
    }
  };

  // Instant one-click toggle to show or hide section from frontend
  const handleToggleSection = async (key: string) => {
    const target = sectionList.find((s) => s.sectionKey === key);
    const newStatus = target ? !target.isActive : true;

    const updated = sectionList.map((s) =>
      s.sectionKey === key ? { ...s, isActive: newStatus } : s
    );
    setSectionList(updated);
    setActiveTogglingKey(key);

    try {
      await api.updateSections(updated);
      await refreshData();
      showToast(
        newStatus
          ? `"${target?.title || key}" is now VISIBLE on frontend!`
          : `"${target?.title || key}" is now HIDDEN from frontend.`,
        "success"
      );
    } catch (err: any) {
      // Revert if error
      setSectionList(sectionList);
      showToast(err.message || "Failed to update section visibility.", "error");
    } finally {
      setActiveTogglingKey(null);
    }
  };

  const handleMoveSection = (index: number, direction: "up" | "down") => {
    const newIdx = direction === "up" ? index - 1 : index + 1;
    if (newIdx < 0 || newIdx >= sectionList.length) return;

    const updated = [...sectionList];
    const temp = updated[index];
    updated[index] = updated[newIdx];
    updated[newIdx] = temp;

    const reordered = updated.map((s, idx) => ({ ...s, displayOrder: idx + 1 }));
    setSectionList(reordered);
  };

  const handleSaveAllSections = async () => {
    try {
      setIsSavingSections(true);
      await api.updateSections(sectionList);
      showToast("Homepage layout configuration saved successfully!", "success");
      await refreshData();
    } catch (err: any) {
      showToast(err.message || "Failed to save sections.", "error");
    } finally {
      setIsSavingSections(false);
    }
  };

  const handleShowAll = async () => {
    const updated = sectionList.map((s) => ({ ...s, isActive: true }));
    setSectionList(updated);
    try {
      setIsSavingSections(true);
      await api.updateSections(updated);
      await refreshData();
      showToast("All sections are now visible on the frontend.", "success");
    } catch (err: any) {
      showToast(err.message || "Failed to update sections.", "error");
    } finally {
      setIsSavingSections(false);
    }
  };

  const handleHideAllExceptHero = async () => {
    const updated = sectionList.map((s) => ({
      ...s,
      isActive: s.sectionKey === "hero",
    }));
    setSectionList(updated);
    try {
      setIsSavingSections(true);
      await api.updateSections(updated);
      await refreshData();
      showToast("All sections hidden except Hero Header.", "success");
    } catch (err: any) {
      showToast(err.message || "Failed to update sections.", "error");
    } finally {
      setIsSavingSections(false);
    }
  };

  const activeCount = sectionList.filter((s) => s.isActive).length;

  return (
    <div className="space-y-10 max-w-5xl">
      {/* Frontend Section Visibility Manager */}
      <div className="bg-neutral-950 border border-neutral-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-neutral-800">
          <div>
            <div className="flex items-center gap-2.5">
              <span className="p-2 rounded-xl bg-neutral-900 border border-neutral-800 text-white">
                <Layers className="w-5 h-5" />
              </span>
              <div>
                <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
                  <span>Frontend Section Visibility & Order</span>
                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono">
                    {activeCount} of {sectionList.length} Active
                  </span>
                </h2>
                <p className="text-xs text-neutral-400 mt-0.5">
                  Click the toggle on any section to instantly hide or show it on the public homepage.
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={handleShowAll}
              disabled={isSavingSections}
              className="px-3 py-1.5 rounded-xl bg-neutral-900 border border-neutral-800 text-xs font-semibold text-neutral-300 hover:text-white hover:bg-neutral-800 transition-colors"
            >
              Show All
            </button>
            <button
              type="button"
              onClick={handleHideAllExceptHero}
              disabled={isSavingSections}
              className="px-3 py-1.5 rounded-xl bg-neutral-900 border border-neutral-800 text-xs font-semibold text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800 transition-colors"
            >
              Hide All (Except Hero)
            </button>
            <button
              type="button"
              onClick={handleSaveAllSections}
              disabled={isSavingSections}
              className="px-4 py-1.5 rounded-xl bg-white text-neutral-950 font-bold text-xs uppercase tracking-wider hover:bg-neutral-200 transition-colors flex items-center gap-1.5 disabled:opacity-50"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{isSavingSections ? "Saving..." : "Save Layout"}</span>
            </button>
          </div>
        </div>

        {/* Section Cards List */}
        <div className="space-y-3">
          {sectionList.map((sec, idx) => {
            const meta = SECTION_METADATA[sec.sectionKey] || {
              description: "Custom homepage component block.",
              badge: "Section",
            };
            const isToggling = activeTogglingKey === sec.sectionKey;

            return (
              <div
                key={sec.sectionKey}
                className={`p-4 rounded-2xl border transition-all duration-200 ${
                  sec.isActive
                    ? "bg-neutral-900/90 border-neutral-800 shadow-sm"
                    : "bg-neutral-950/60 border-neutral-900/80 opacity-70"
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  {/* Left: Section Order & Name */}
                  <div className="flex items-start sm:items-center gap-3">
                    <span className="w-7 h-7 rounded-lg bg-neutral-950 border border-neutral-800 text-neutral-400 font-mono text-xs font-bold flex items-center justify-center shrink-0">
                      {idx + 1}
                    </span>

                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-white">{sec.title}</span>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-neutral-950 border border-neutral-800 text-neutral-400">
                          {meta.badge}
                        </span>
                        {sec.isActive ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-400">
                            <CheckCircle2 className="w-3 h-3" />
                            <span>Visible on Site</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-neutral-500">
                            <EyeOff className="w-3 h-3" />
                            <span>Hidden from Visitors</span>
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-neutral-400 mt-1 max-w-xl">
                        {meta.description}
                      </p>
                    </div>
                  </div>

                  {/* Right: Toggle Switch & Order Controls */}
                  <div className="flex items-center gap-2 self-end sm:self-center shrink-0 pt-2 sm:pt-0">
                    {/* Hide / Show Toggle Button */}
                    <button
                      type="button"
                      disabled={isToggling}
                      onClick={() => handleToggleSection(sec.sectionKey)}
                      className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                        sec.isActive
                          ? "bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-500/25"
                          : "bg-neutral-900 text-neutral-400 border border-neutral-800 hover:text-white hover:bg-neutral-800"
                      }`}
                      title={sec.isActive ? "Click to hide this section from website" : "Click to show this section on website"}
                    >
                      {sec.isActive ? (
                        <>
                          <Eye className="w-3.5 h-3.5" />
                          <span>Visible</span>
                        </>
                      ) : (
                        <>
                          <EyeOff className="w-3.5 h-3.5" />
                          <span>Hidden</span>
                        </>
                      )}
                    </button>

                    {/* Order Moving Controls */}
                    <div className="flex items-center gap-1 pl-2 border-l border-neutral-800">
                      <button
                        type="button"
                        disabled={idx === 0}
                        onClick={() => handleMoveSection(idx, "up")}
                        className="p-1.5 rounded-lg bg-neutral-950 border border-neutral-800 text-neutral-400 hover:text-white disabled:opacity-25 transition-colors"
                        title="Move Up"
                      >
                        <ArrowUp className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        disabled={idx === sectionList.length - 1}
                        onClick={() => handleMoveSection(idx, "down")}
                        className="p-1.5 rounded-lg bg-neutral-950 border border-neutral-800 text-neutral-400 hover:text-white disabled:opacity-25 transition-colors"
                        title="Move Down"
                      >
                        <ArrowDown className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="pt-2 flex items-center justify-between text-xs text-neutral-400">
          <p>
            Changes take effect immediately on the homepage upon clicking Visible/Hidden.
          </p>
          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-neutral-300 hover:text-white underline font-semibold"
          >
            <span>Preview Public Homepage</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>

      {/* Hero Content & CTA Copy Editor */}
      <div className="bg-neutral-950 border border-neutral-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl">
        <div className="flex items-center justify-between pb-4 border-b border-neutral-800">
          <div>
            <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-400" />
              <span>Hero Headline & CTA Settings</span>
            </h2>
            <p className="text-xs text-neutral-400 mt-0.5">
              Customize the main public value proposition, badges, and primary call-to-action buttons.
            </p>
          </div>
        </div>

        <form onSubmit={handleSaveHero} className="space-y-6">
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-neutral-400 uppercase tracking-wider">
              Status Badge Text
            </label>
            <input
              type="text"
              value={heroForm.badgeText}
              onChange={(e) => setHeroForm({ ...heroForm, badgeText: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl bg-neutral-900 border border-neutral-800 text-white text-sm focus:outline-none focus:border-neutral-600"
              placeholder="e.g., Accepting Q3 / Q4 Enterprise Projects"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-neutral-400 uppercase tracking-wider">
                Main Heading
              </label>
              <input
                type="text"
                value={heroForm.heading}
                onChange={(e) => setHeroForm({ ...heroForm, heading: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl bg-neutral-900 border border-neutral-800 text-white text-sm focus:outline-none focus:border-neutral-600"
                placeholder="Building Digital Products That Move"
              />
            </div>
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-neutral-400 uppercase tracking-wider">
                Highlighted Heading (Second Half)
              </label>
              <input
                type="text"
                value={heroForm.highlightedHeading}
                onChange={(e) => setHeroForm({ ...heroForm, highlightedHeading: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl bg-neutral-900 border border-neutral-800 text-white text-sm focus:outline-none focus:border-neutral-600"
                placeholder="Businesses Forward"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-xs font-semibold text-neutral-400 uppercase tracking-wider">
              Value Narrative / Description
            </label>
            <textarea
              rows={3}
              value={heroForm.description}
              onChange={(e) => setHeroForm({ ...heroForm, description: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl bg-neutral-900 border border-neutral-800 text-white text-sm focus:outline-none focus:border-neutral-600"
              placeholder="Detailed description of agency services..."
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-neutral-400 uppercase tracking-wider">
                Primary CTA Text
              </label>
              <input
                type="text"
                value={heroForm.primaryCtaText}
                onChange={(e) => setHeroForm({ ...heroForm, primaryCtaText: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl bg-neutral-900 border border-neutral-800 text-white text-sm focus:outline-none focus:border-neutral-600"
              />
            </div>
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-neutral-400 uppercase tracking-wider">
                Primary CTA URL
              </label>
              <input
                type="text"
                value={heroForm.primaryCtaUrl}
                onChange={(e) => setHeroForm({ ...heroForm, primaryCtaUrl: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl bg-neutral-900 border border-neutral-800 text-white text-sm focus:outline-none focus:border-neutral-600"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-neutral-400 uppercase tracking-wider">
                Secondary CTA Text
              </label>
              <input
                type="text"
                value={heroForm.secondaryCtaText}
                onChange={(e) => setHeroForm({ ...heroForm, secondaryCtaText: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl bg-neutral-900 border border-neutral-800 text-white text-sm focus:outline-none focus:border-neutral-600"
              />
            </div>
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-neutral-400 uppercase tracking-wider">
                Secondary CTA URL
              </label>
              <input
                type="text"
                value={heroForm.secondaryCtaUrl}
                onChange={(e) => setHeroForm({ ...heroForm, secondaryCtaUrl: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl bg-neutral-900 border border-neutral-800 text-white text-sm focus:outline-none focus:border-neutral-600"
              />
            </div>
          </div>

          {/* Key Metric Counters */}
          <div className="space-y-3 pt-2">
            <label className="block text-xs font-semibold text-neutral-400 uppercase tracking-wider">
              Stats Strip (4 Key Metrics)
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
              {(heroForm.stats || []).map((stat, sIdx) => (
                <div key={sIdx} className="p-3 bg-neutral-900 border border-neutral-800 rounded-xl space-y-2">
                  <input
                    type="text"
                    value={stat.value}
                    onChange={(e) => {
                      const updated = [...heroForm.stats];
                      updated[sIdx] = { ...updated[sIdx], value: e.target.value };
                      setHeroForm({ ...heroForm, stats: updated });
                    }}
                    placeholder="e.g., 140+"
                    className="w-full px-2.5 py-1.5 rounded-lg bg-neutral-950 border border-neutral-800 text-white font-bold text-sm"
                  />
                  <input
                    type="text"
                    value={stat.label}
                    onChange={(e) => {
                      const updated = [...heroForm.stats];
                      updated[sIdx] = { ...updated[sIdx], label: e.target.value };
                      setHeroForm({ ...heroForm, stats: updated });
                    }}
                    placeholder="e.g., Delivered Systems"
                    className="w-full px-2.5 py-1.5 rounded-lg bg-neutral-950 border border-neutral-800 text-neutral-400 text-xs"
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={isSavingHero}
              className="px-6 py-3 rounded-xl bg-white text-neutral-950 font-bold text-xs uppercase tracking-wider hover:bg-neutral-200 transition-colors flex items-center gap-1.5 disabled:opacity-50 shadow-sm"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{isSavingHero ? "Saving Hero..." : "Save Hero Configuration"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
