import React, { useState, useEffect } from "react";
import { useApp } from "../../context/AppContext";
import { ArrowUpRight, CheckCircle2, ShieldCheck, Sparkles, Send, Clock, Layers } from "lucide-react";
import { api } from "../../services/api";

export const GetInTouchPage: React.FC = () => {
  const { showToast, settings } = useApp();

  // Read service query param if passed from service cards
  const urlParams = new URLSearchParams(window.location.search);
  const preselectedService = urlParams.get("service") || "Web Application Development";

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    company: "",
    phone: "",
    service: preselectedService,
    budget: "$25,000 - $50,000",
    timeline: "Within 1 - 2 Months",
    projectDetails: "",
  });

  useEffect(() => {
    if (preselectedService) {
      setFormData((prev) => ({ ...prev, service: preselectedService }));
    }
  }, [preselectedService]);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.fullName || !formData.email || !formData.projectDetails) {
      showToast("Please provide your name, email, and project scope details.", "error");
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await api.submitConsultation(formData);
      showToast(res.message || "Consultation request booked successfully!", "success");
      setIsSuccess(true);
    } catch (err: any) {
      showToast(err.message || "Failed to submit request. Please try again.", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="pt-20 sm:pt-28 md:pt-32 bg-white min-h-screen">
      {/* Header */}
      <section className="py-12 sm:py-16 md:py-20 border-b border-neutral-100 bg-neutral-950 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-neutral-900 border border-neutral-800 text-xs font-semibold text-neutral-300 uppercase tracking-wider mb-4">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Priority Technical Discovery</span>
          </div>
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-tight mb-4">
            Have an Idea? Let's Make It Real.
          </h1>
          <p className="text-neutral-400 text-sm sm:text-lg leading-relaxed font-normal px-2 sm:px-0">
            Schedule an architectural scoping consultation with our senior engineering leadership. We evaluate technical feasibility, provide preliminary cost estimates, and map your sprint roadmap.
          </p>
        </div>
      </section>

      {/* Form Section */}
      <section className="py-12 sm:py-16 md:py-20 bg-neutral-50/50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white p-5 sm:p-8 md:p-12 rounded-3xl border border-neutral-200 shadow-xl">
            {isSuccess ? (
              <div className="text-center py-16 space-y-5">
                <div className="w-20 h-20 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-10 h-10" />
                </div>
                <h3 className="text-3xl font-extrabold text-neutral-950 tracking-tight">
                  Consultation Request Scheduled
                </h3>
                <p className="text-neutral-600 text-base max-w-lg mx-auto leading-relaxed">
                  Thank you for submitting your project specifications. Our principal architects are reviewing your architecture requirements and will follow up with a calendar invitation for an in-depth video discovery session.
                </p>
                <div className="pt-4">
                  <button
                    onClick={() => {
                      setIsSuccess(false);
                      setFormData({
                        fullName: "",
                        email: "",
                        company: "",
                        phone: "",
                        service: "Web Application Development",
                        budget: "$25,000 - $50,000",
                        timeline: "Within 1 - 2 Months",
                        projectDetails: "",
                      });
                    }}
                    className="px-6 py-3 rounded-xl bg-neutral-950 text-white text-xs font-bold uppercase tracking-wider"
                  >
                    Submit Another Project
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-8">
                {/* Section 1: Contact Details */}
                <div>
                  <h3 className="text-base font-bold text-neutral-950 uppercase tracking-wider mb-4 pb-2 border-b border-neutral-100">
                    1. Contact & Organization Details
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-xs font-bold text-neutral-800 uppercase tracking-wider mb-2">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Michael Thorne"
                        value={formData.fullName}
                        onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                        className="w-full px-4 py-3.5 rounded-xl bg-neutral-50 border border-neutral-200 text-sm text-neutral-900 focus:outline-none focus:bg-white focus:border-neutral-950 min-h-[44px]"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-neutral-800 uppercase tracking-wider mb-2">
                        Corporate Email *
                      </label>
                      <input
                        type="email"
                        placeholder="m.thorne@enterprise.com"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="w-full px-4 py-3.5 rounded-xl bg-neutral-50 border border-neutral-200 text-sm text-neutral-900 focus:outline-none focus:bg-white focus:border-neutral-950 min-h-[44px]"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-neutral-800 uppercase tracking-wider mb-2">
                        Company Name / Startup
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Horizon Cloud Corp"
                        value={formData.company}
                        onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                        className="w-full px-4 py-3.5 rounded-xl bg-neutral-50 border border-neutral-200 text-sm text-neutral-900 focus:outline-none focus:bg-white focus:border-neutral-950 min-h-[44px]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-neutral-800 uppercase tracking-wider mb-2">
                        Phone / WhatsApp (with Country Code)
                      </label>
                      <input
                        type="tel"
                        placeholder="+1 (415) 000-0000"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className="w-full px-4 py-3.5 rounded-xl bg-neutral-50 border border-neutral-200 text-sm text-neutral-900 focus:outline-none focus:bg-white focus:border-neutral-950 min-h-[44px]"
                      />
                    </div>
                  </div>
                </div>

                {/* Section 2: Project Scope & Specs */}
                <div>
                  <h3 className="text-base font-bold text-neutral-950 uppercase tracking-wider mb-4 pb-2 border-b border-neutral-100">
                    2. Technical Scope, Budget & Target Horizon
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-5">
                    <div>
                      <label className="block text-xs font-bold text-neutral-800 uppercase tracking-wider mb-2">
                        Required Service
                      </label>
                      <select
                        value={formData.service}
                        onChange={(e) => setFormData({ ...formData, service: e.target.value })}
                        className="w-full px-4 py-3.5 rounded-xl bg-neutral-50 border border-neutral-200 text-sm text-neutral-900 focus:outline-none focus:bg-white focus:border-neutral-950 min-h-[44px]"
                      >
                        <option value="Web Application Development">Web Application Development</option>
                        <option value="Mobile App Engineering">Mobile App Engineering</option>
                        <option value="AI Solutions & Intelligent Agents">AI Solutions & Intelligent Agents</option>
                        <option value="SaaS Product Engineering">SaaS Product Engineering</option>
                        <option value="UI/UX & Product Design">UI/UX & Product Design</option>
                        <option value="Cloud, API & Backend Architecture">Cloud, API & Backend Architecture</option>
                        <option value="Fiverr Standardized Package">Fiverr Standardized Package</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-neutral-800 uppercase tracking-wider mb-2">
                        Budget Allocation
                      </label>
                      <select
                        value={formData.budget}
                        onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                        className="w-full px-4 py-3.5 rounded-xl bg-neutral-50 border border-neutral-200 text-sm text-neutral-900 focus:outline-none focus:bg-white focus:border-neutral-950 min-h-[44px]"
                      >
                        <option value="$10,000 - $25,000">$10,000 - $25,000 (MVP / Focused)</option>
                        <option value="$25,000 - $50,000">$25,000 - $50,000 (Standard Release)</option>
                        <option value="$50,000 - $100,000">$50,000 - $100,000 (Enterprise Scale)</option>
                        <option value="$100,000+">$100,000+ (Full Platform / Multi-Month)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-neutral-800 uppercase tracking-wider mb-2">
                        Target Timeline
                      </label>
                      <select
                        value={formData.timeline}
                        onChange={(e) => setFormData({ ...formData, timeline: e.target.value })}
                        className="w-full px-4 py-3.5 rounded-xl bg-neutral-50 border border-neutral-200 text-sm text-neutral-900 focus:outline-none focus:bg-white focus:border-neutral-950 min-h-[44px]"
                      >
                        <option value="Immediate (< 3 weeks)">Immediate (&lt; 3 weeks)</option>
                        <option value="Within 1 - 2 Months">Within 1 - 2 Months</option>
                        <option value="Within 3 - 6 Months">Within 3 - 6 Months</option>
                        <option value="Exploratory / Flexible">Exploratory / Flexible</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-neutral-800 uppercase tracking-wider mb-2">
                      Project Details, Requirements & Tech Constraints *
                    </label>
                    <textarea
                      rows={5}
                      placeholder="Outline what you want to build, existing systems, required database/third-party APIs, and any specific deadlines..."
                      value={formData.projectDetails}
                      onChange={(e) => setFormData({ ...formData, projectDetails: e.target.value })}
                      className="w-full px-4 py-3.5 rounded-xl bg-neutral-50 border border-neutral-200 text-sm text-neutral-900 focus:outline-none focus:bg-white focus:border-neutral-950"
                      required
                    />
                  </div>
                </div>

                {/* Submit button */}
                <div className="pt-4 border-t border-neutral-100 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="flex items-center gap-2 text-xs text-neutral-500">
                    <ShieldCheck className="w-4 h-4 text-emerald-500" />
                    <span>Protected by mutual confidentiality and ISO standards.</span>
                  </div>

                  <button
                    id="submit-get-in-touch-btn"
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full sm:w-auto px-10 py-4 rounded-xl bg-neutral-950 hover:bg-neutral-800 text-white font-bold text-sm uppercase tracking-wider transition-all duration-200 shadow-md hover:shadow-xl flex items-center justify-center gap-2 disabled:opacity-50 min-h-[48px]"
                  >
                    <span>{isSubmitting ? "Submitting Scoping Request..." : "Request Technical Scoping"}</span>
                    <Send className="w-4 h-4" />
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </section>
    </main>
  );
};
