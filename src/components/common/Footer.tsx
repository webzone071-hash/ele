import React, { useState } from "react";
import { useApp } from "../../context/AppContext";
import { DynamicIcon } from "./DynamicIcon";
import { ArrowUp, ArrowRight, ShieldCheck, Mail, Phone, MapPin, Clock } from "lucide-react";
import { api } from "../../services/api";

export const Footer: React.FC = () => {
  const { settings, data, navigate, showToast } = useApp();
  const [newsletterEmail, setNewsletterEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const agencyName = settings?.agencyName || "Tech Elevant";
  const shortName = settings?.shortName || "Tech Elevant";
  const description = settings?.footerText || settings?.description || "Tech Elevant is an international software development powerhouse engineering bespoke digital ecosystems and scalable software products.";
  const copyright = settings?.copyrightText || `© 2026 ${agencyName}. All Rights Reserved.`;
  const footerLogo = settings?.darkLogoUrl || "/logo-white.svg";
  const isFullLogo = footerLogo?.includes("logo");

  const socialLinks = data?.socialLinks?.filter((s) => s.isActive) || [];

  const handleNewsletterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsletterEmail || !newsletterEmail.includes("@")) {
      showToast("Please enter a valid email address.", "error");
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await api.subscribeNewsletter(newsletterEmail);
      showToast(res.message || "Successfully subscribed to our technology newsletter!", "success");
      setNewsletterEmail("");
    } catch (err: any) {
      showToast(err.message || "Failed to subscribe. Please try again.", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <footer className="bg-neutral-950 text-white pt-14 sm:pt-20 pb-12 border-t border-neutral-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Newsletter Callout Banner */}
        <div className="mb-12 sm:mb-16 p-5 sm:p-8 md:p-10 rounded-2xl bg-neutral-900 border border-neutral-800 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 sm:gap-8">
          <div className="max-w-xl">
            <span className="text-xs font-bold tracking-widest text-neutral-400 uppercase block mb-2">
              Executive Insights
            </span>
            <h3 className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight text-white">
              Stay ahead of enterprise tech shifts.
            </h3>
            <p className="text-neutral-400 text-xs sm:text-sm mt-2 leading-relaxed">
              Bi-weekly engineering briefs on AI orchestration, microservice architectures, and modern digital product strategy.
            </p>
          </div>

          <form onSubmit={handleNewsletterSubmit} className="w-full lg:w-auto flex-1 max-w-md flex flex-col sm:flex-row gap-2.5">
            <input
              type="email"
              placeholder="Enter your work email..."
              value={newsletterEmail}
              onChange={(e) => setNewsletterEmail(e.target.value)}
              className="px-4 py-3 sm:py-3.5 rounded-xl bg-neutral-950 border border-neutral-700 text-white placeholder-neutral-500 text-sm focus:outline-none focus:border-white flex-1 min-h-[44px]"
              required
            />
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full sm:w-auto px-6 py-3 sm:py-3.5 rounded-xl bg-white text-neutral-950 font-bold text-xs sm:text-sm hover:bg-neutral-200 transition-colors flex items-center justify-center gap-2 shrink-0 disabled:opacity-50 min-h-[44px]"
            >
              <span>{isSubmitting ? "Subscribing..." : "Subscribe"}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        </div>

        {/* Main Footer Columns */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-8 sm:gap-10 pb-12 sm:pb-16 border-b border-neutral-800">
          {/* Col 1: Agency Brand */}
          <div className="sm:col-span-2 lg:col-span-2 space-y-5">
            <div className="flex items-center gap-3">
              {footerLogo ? (
                isFullLogo ? (
                  <img
                    src={footerLogo}
                    alt={agencyName}
                    className="h-8 sm:h-9 w-auto object-contain"
                  />
                ) : (
                  <>
                    <img
                      src={footerLogo}
                      alt={agencyName}
                      className="w-10 h-10 object-contain shrink-0"
                    />
                    <div>
                      <span className="font-extrabold text-xl tracking-tight text-white block">
                        {agencyName}
                      </span>
                      <span className="text-[10px] font-semibold text-neutral-400 uppercase tracking-widest">
                        Software Agency & Systems
                      </span>
                    </div>
                  </>
                )
              ) : (
                <div className="w-10 h-10 rounded-xl bg-white text-neutral-950 font-black flex items-center justify-center text-sm tracking-wider">
                  TE
                </div>
              )}
            </div>

            <p className="text-neutral-400 text-sm leading-relaxed max-w-sm">
              {description}
            </p>

            {/* DDoS Shield & Security Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-neutral-900 border border-neutral-800 text-[11px] text-neutral-400 font-mono">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <span>Tech Elevant Enterprise Security Active</span>
            </div>

            {/* Social Icons */}
            <div className="pt-2">
              <p className="text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-3">
                Global Connect
              </p>
              <div className="flex flex-wrap gap-2.5">
                {socialLinks.map((social) => (
                  <a
                    key={social.id}
                    href={social.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    title={social.platform}
                    className="w-9 h-9 rounded-lg bg-neutral-900 border border-neutral-800 flex items-center justify-center text-neutral-300 hover:text-white hover:bg-neutral-800 hover:border-neutral-700 transition-all min-h-[36px] min-w-[36px]"
                    aria-label={social.platform}
                  >
                    <DynamicIcon name={social.icon || "ExternalLink"} size={16} />
                  </a>
                ))}
              </div>
            </div>
          </div>

          {/* Col 2: Company Navigation */}
          <div>
            <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4">
              Company
            </h4>
            <ul className="space-y-2.5 text-sm text-neutral-400">
              <li>
                <button onClick={() => navigate("/")} className="hover:text-white transition-colors">
                  Home
                </button>
              </li>
              <li>
                <button onClick={() => navigate("/about")} className="hover:text-white transition-colors">
                  About Agency
                </button>
              </li>
              <li>
                <button onClick={() => navigate("/services")} className="hover:text-white transition-colors">
                  All Services
                </button>
              </li>
              <li>
                <button onClick={() => navigate("/portfolio")} className="hover:text-white transition-colors">
                  Case Studies & Portfolio
                </button>
              </li>
              <li>
                <button onClick={() => navigate("/marketplace-services")} className="hover:text-white transition-colors flex items-center gap-1.5 text-blue-400 hover:text-blue-300">
                  <span>Fiverr Services Hub</span>
                </button>
              </li>
              <li>
                <button onClick={() => navigate("/contact")} className="hover:text-white transition-colors">
                  Contact Us
                </button>
              </li>
              <li>
                <button onClick={() => navigate("/get-in-touch")} className="font-semibold text-white hover:text-neutral-300 transition-colors">
                  Book Consultation →
                </button>
              </li>
            </ul>
          </div>

          {/* Col 3: Core Services */}
          <div>
            <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4">
              Capabilities
            </h4>
            <ul className="space-y-2.5 text-sm text-neutral-400">
              <li>
                <button onClick={() => navigate("/services")} className="hover:text-white transition-colors text-left">
                  Web Applications
                </button>
              </li>
              <li>
                <button onClick={() => navigate("/services")} className="hover:text-white transition-colors text-left">
                  Mobile iOS & Android
                </button>
              </li>
              <li>
                <button onClick={() => navigate("/services")} className="hover:text-white transition-colors text-left">
                  AI Agents & RAG
                </button>
              </li>
              <li>
                <button onClick={() => navigate("/services")} className="hover:text-white transition-colors text-left">
                  SaaS Engineering
                </button>
              </li>
              <li>
                <button onClick={() => navigate("/services")} className="hover:text-white transition-colors text-left">
                  UI/UX Design Systems
                </button>
              </li>
              <li>
                <button onClick={() => navigate("/services")} className="hover:text-white transition-colors text-left">
                  Cloud & Microservices
                </button>
              </li>
            </ul>
          </div>

          {/* Col 4: Contact & Global Presence */}
          <div>
            <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4">
              Contact & Inquiries
            </h4>
            <ul className="space-y-3.5 text-sm text-neutral-400">
              <li className="flex items-start gap-2.5">
                <Mail className="w-4 h-4 text-neutral-500 shrink-0 mt-1" />
                <a href={`mailto:${settings?.email || "contact@techelevant.com"}`} className="hover:text-white transition-colors break-all">
                  {settings?.email || "contact@techelevant.com"}
                </a>
              </li>
              <li className="flex items-start gap-2.5">
                <Phone className="w-4 h-4 text-neutral-500 shrink-0 mt-1" />
                <a href={`tel:${settings?.phone || "+14158903420"}`} className="hover:text-white transition-colors">
                  {settings?.phone || "+1 (415) 890-3420"}
                </a>
              </li>
              <li className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-neutral-500 shrink-0 mt-1" />
                <span className="leading-snug text-xs">
                  {settings?.address || "750 Montgomery St, Suite 400, San Francisco, CA"}
                </span>
              </li>
              <li className="flex items-start gap-2.5">
                <Clock className="w-4 h-4 text-neutral-500 shrink-0 mt-1" />
                <span className="leading-snug text-xs text-neutral-500">
                  {settings?.officeHours || "Mon - Fri: 9:00 AM - 6:00 PM EST"}
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar: Copyright, Legal & Back to Top */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-neutral-500">
          <div className="flex flex-wrap items-center gap-4 sm:gap-6">
            <span>{copyright}</span>
            <span className="hover:text-neutral-300 cursor-pointer">Privacy Policy</span>
            <span className="hover:text-neutral-300 cursor-pointer">Terms & Conditions</span>
            <span className="hover:text-neutral-300 cursor-pointer">Security Compliance</span>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate("/admin")}
              className="flex items-center gap-1 text-neutral-400 hover:text-white transition-colors text-xs font-semibold py-1 px-2.5 rounded bg-neutral-900 border border-neutral-800"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Admin CMS</span>
            </button>

            <button
              onClick={scrollToTop}
              className="flex items-center gap-1.5 text-neutral-400 hover:text-white transition-colors text-xs py-1.5 px-3 rounded-lg bg-neutral-900 hover:bg-neutral-800 border border-neutral-800"
              aria-label="Back to top"
            >
              <span>Top</span>
              <ArrowUp className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};
