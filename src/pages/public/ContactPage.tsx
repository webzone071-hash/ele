import React, { useState } from "react";
import { useApp } from "../../context/AppContext";
import { Mail, Phone, MapPin, Clock, Send, MessageSquare, ShieldCheck, CheckCircle2 } from "lucide-react";
import { api } from "../../services/api";

export const ContactPage: React.FC = () => {
  const { settings, showToast, navigate } = useApp();

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    company: "",
    phone: "",
    service: "Web Application Development",
    budget: "$25,000 - $50,000",
    projectDetails: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.fullName || !formData.email || !formData.projectDetails) {
      showToast("Please fill in your name, email, and project details.", "error");
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await api.submitContact(formData);
      showToast(res.message || "Project inquiry sent successfully!", "success");
      setIsSuccess(true);
      setFormData({
        fullName: "",
        email: "",
        company: "",
        phone: "",
        service: "Web Application Development",
        budget: "$25,000 - $50,000",
        projectDetails: "",
      });
    } catch (err: any) {
      showToast(err.message || "Failed to submit inquiry. Please try again.", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="pt-20 sm:pt-28 md:pt-32 bg-white min-h-screen">
      {/* Header */}
      <section className="py-12 sm:py-16 md:py-20 border-b border-neutral-100 bg-neutral-50/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center max-w-3xl mx-auto">
          <span className="text-xs font-bold tracking-widest text-neutral-400 uppercase block mb-3">
            Direct Communication
          </span>
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-neutral-950 tracking-tight leading-tight mb-4 sm:mb-6">
            Let's Build Your Next Digital Product.
          </h1>
          <p className="text-base sm:text-lg text-neutral-600 leading-relaxed font-normal px-2 sm:px-0">
            Connect directly with our senior engineering architects. We respond to all qualified enterprise inquiries within 24 business hours.
          </p>
        </div>
      </section>

      {/* Main Grid: Info + Contact Form */}
      <section className="py-12 sm:py-16 md:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16 items-start">
            {/* Left Column: Direct Info & Guarantees */}
            <div className="lg:col-span-5 space-y-6 sm:space-y-8">
              <div className="space-y-4">
                <h2 className="text-2xl font-bold text-neutral-950 tracking-tight">
                  Global Hubs & Direct Channels
                </h2>
                <p className="text-neutral-600 text-sm leading-relaxed">
                  Our engineering leads operate across North America, the United Kingdom, and the Middle East, ensuring dedicated timezone overlap for live collaboration.
                </p>
              </div>

              <div className="space-y-4">
                <div className="p-5 rounded-2xl bg-neutral-50 border border-neutral-200/80 flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-neutral-900 text-white flex items-center justify-center shrink-0">
                    <Mail className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider block">
                      Direct Email
                    </span>
                    <a
                      href={`mailto:${settings?.email || "contact@techelevant.com"}`}
                      className="text-sm font-bold text-neutral-950 hover:underline break-all"
                    >
                      {settings?.email || "contact@techelevant.com"}
                    </a>
                  </div>
                </div>

                <div className="p-5 rounded-2xl bg-neutral-50 border border-neutral-200/80 flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-neutral-900 text-white flex items-center justify-center shrink-0">
                    <Phone className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider block">
                      Telephone / WhatsApp
                    </span>
                    <a
                      href={`tel:${settings?.phone || "+14158903420"}`}
                      className="text-sm font-bold text-neutral-950 hover:underline"
                    >
                      {settings?.phone || "+1 (415) 890-3420"}
                    </a>
                  </div>
                </div>

                <div className="p-5 rounded-2xl bg-neutral-50 border border-neutral-200/80 flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-neutral-900 text-white flex items-center justify-center shrink-0">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider block">
                      Headquarters
                    </span>
                    <p className="text-sm font-semibold text-neutral-800 leading-snug">
                      {settings?.address || "750 Montgomery St, Suite 400, San Francisco, CA 94111"}
                    </p>
                  </div>
                </div>

                <div className="p-5 rounded-2xl bg-neutral-50 border border-neutral-200/80 flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-neutral-900 text-white flex items-center justify-center shrink-0">
                    <Clock className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider block">
                      Operating Hours
                    </span>
                    <p className="text-sm font-semibold text-neutral-800 leading-snug">
                      {settings?.officeHours || "Mon - Fri: 9:00 AM - 6:00 PM EST (24/7 SLA for Contract Clients)"}
                    </p>
                  </div>
                </div>
              </div>

              {/* NDA & Security Guarantee */}
              <div className="p-6 rounded-2xl bg-neutral-950 text-white space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-400">
                  <ShieldCheck className="w-4 h-4" />
                  <span>Strict NDA & IP Confidentiality</span>
                </div>
                <p className="text-xs text-neutral-400 leading-relaxed">
                  Every inquiry is handled under mutual confidentiality standards. We are happy to execute your standard mutual NDA prior to detailed technical discovery calls.
                </p>
              </div>
            </div>

            {/* Right Column: Contact Inquiry Form */}
            <div className="lg:col-span-7 bg-white p-5 sm:p-8 md:p-12 rounded-3xl border border-neutral-200 shadow-xl">
              {isSuccess ? (
                <div className="text-center py-12 space-y-4">
                  <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <h3 className="text-2xl font-bold text-neutral-950">
                    Inquiry Received
                  </h3>
                  <p className="text-neutral-600 text-sm max-w-md mx-auto leading-relaxed">
                    Thank you for reaching out to {settings?.agencyName || "ApexCore Labs"}. A senior technical architect has received your specifications and will respond via email within 24 hours.
                  </p>
                  <button
                    onClick={() => setIsSuccess(false)}
                    className="mt-4 px-6 py-2.5 rounded-xl bg-neutral-950 text-white text-xs font-bold uppercase tracking-wider"
                  >
                    Send Another Message
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="border-b border-neutral-100 pb-4">
                    <h3 className="text-xl font-bold text-neutral-950">
                      Send Project Inquiry
                    </h3>
                    <p className="text-xs text-neutral-500 mt-1">
                      Provide as much technical or business context as available.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-neutral-800 uppercase tracking-wider mb-2">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Sarah Jenkins"
                        value={formData.fullName}
                        onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                        className="w-full px-4 py-3.5 rounded-xl bg-neutral-50 border border-neutral-200 text-sm text-neutral-900 placeholder-neutral-400 focus:outline-none focus:bg-white focus:border-neutral-950 min-h-[44px]"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-neutral-800 uppercase tracking-wider mb-2">
                        Work Email *
                      </label>
                      <input
                        type="email"
                        placeholder="sarah@company.com"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="w-full px-4 py-3.5 rounded-xl bg-neutral-50 border border-neutral-200 text-sm text-neutral-900 placeholder-neutral-400 focus:outline-none focus:bg-white focus:border-neutral-950 min-h-[44px]"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-neutral-800 uppercase tracking-wider mb-2">
                        Company Name
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Acme Global"
                        value={formData.company}
                        onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                        className="w-full px-4 py-3.5 rounded-xl bg-neutral-50 border border-neutral-200 text-sm text-neutral-900 placeholder-neutral-400 focus:outline-none focus:bg-white focus:border-neutral-950 min-h-[44px]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-neutral-800 uppercase tracking-wider mb-2">
                        Phone / WhatsApp
                      </label>
                      <input
                        type="tel"
                        placeholder="+1 (555) 000-0000"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className="w-full px-4 py-3.5 rounded-xl bg-neutral-50 border border-neutral-200 text-sm text-neutral-900 placeholder-neutral-400 focus:outline-none focus:bg-white focus:border-neutral-950 min-h-[44px]"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-neutral-800 uppercase tracking-wider mb-2">
                        Primary Service Needed
                      </label>
                      <select
                        value={formData.service}
                        onChange={(e) => setFormData({ ...formData, service: e.target.value })}
                        className="w-full px-4 py-3.5 rounded-xl bg-neutral-50 border border-neutral-200 text-sm text-neutral-900 focus:outline-none focus:bg-white focus:border-neutral-950 min-h-[44px]"
                      >
                        <option value="Web Application Development">Web Application Development</option>
                        <option value="Mobile App Engineering">Mobile App Engineering (iOS & Android)</option>
                        <option value="AI Solutions & Intelligent Agents">AI Solutions & Intelligent Agents</option>
                        <option value="SaaS Product Engineering">SaaS Product Engineering</option>
                        <option value="UI/UX & Product Design">UI/UX & Product Design</option>
                        <option value="Cloud & Microservices">Cloud & Microservices</option>
                        <option value="Fiverr Standardized Package">Fiverr Standardized Package</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-neutral-800 uppercase tracking-wider mb-2">
                        Anticipated Budget Range
                      </label>
                      <select
                        value={formData.budget}
                        onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                        className="w-full px-4 py-3.5 rounded-xl bg-neutral-50 border border-neutral-200 text-sm text-neutral-900 focus:outline-none focus:bg-white focus:border-neutral-950 min-h-[44px]"
                      >
                        <option value="Under $10,000">Under $10,000 (Marketplace Gig / MVP)</option>
                        <option value="$10,000 - $25,000">$10,000 - $25,000</option>
                        <option value="$25,000 - $50,000">$25,000 - $50,000</option>
                        <option value="$50,000 - $100,000">$50,000 - $100,000</option>
                        <option value="$100,000+">$100,000+ (Enterprise Multi-Month)</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-neutral-800 uppercase tracking-wider mb-2">
                      Project Details & Requirements *
                    </label>
                    <textarea
                      rows={5}
                      placeholder="Describe your current system, primary technical challenges, required third-party integrations, or target timeline..."
                      value={formData.projectDetails}
                      onChange={(e) => setFormData({ ...formData, projectDetails: e.target.value })}
                      className="w-full px-4 py-3.5 rounded-xl bg-neutral-50 border border-neutral-200 text-sm text-neutral-900 placeholder-neutral-400 focus:outline-none focus:bg-white focus:border-neutral-950"
                      required
                    />
                  </div>

                  <button
                    id="submit-contact-form-btn"
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-4 px-8 rounded-xl bg-neutral-950 hover:bg-neutral-800 text-white font-bold text-sm uppercase tracking-wider transition-all duration-200 shadow-md hover:shadow-xl flex items-center justify-center gap-2 disabled:opacity-50 min-h-[48px]"
                  >
                    <span>{isSubmitting ? "Submitting Inquiry..." : "Send Project Inquiry"}</span>
                    <Send className="w-4 h-4" />
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
};
