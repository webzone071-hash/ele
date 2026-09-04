import React from "react";
import { ShieldCheck, Cpu, Clock, MessagesSquare, Zap, Rocket, Award, Lock } from "lucide-react";

export const WhyChooseUsSection: React.FC = () => {
  const pillars = [
    {
      icon: Award,
      title: "Senior Engineering Talent Only",
      description: "We do not hire junior developers or outsource to shadow teams. Your architects have 8+ years experience building enterprise systems.",
    },
    {
      icon: Zap,
      title: "Sub-Second Performance SLA",
      description: "Every web app and API we ship targets Google Lighthouse 95+ and sub-200ms latency globally across edge CDN nodes.",
    },
    {
      icon: MessagesSquare,
      title: "Direct Slack & Video Sprints",
      description: "No middlemen or bureaucracy. Communicate directly with your technical leads via dedicated private Slack channels and weekly demos.",
    },
    {
      icon: Lock,
      title: "Enterprise Security & SOC2 Compliance",
      description: "Built from day one with OWASP standards, role-based access control, cryptographic tokenization, and complete audit logging.",
    },
    {
      icon: Clock,
      title: "Deterministic Milestone Delivery",
      description: "Strict bi-weekly staging releases with automated testing pipelines. We deliver on time with zero hidden budget surprises.",
    },
    {
      icon: Rocket,
      title: "Full Intellectual Property Ownership",
      description: "Upon delivery, you receive complete source code, CI/CD scripts, documentation, and cloud accounts with zero licensing lock-in.",
    },
  ];

  return (
    <section className="py-14 sm:py-20 md:py-24 bg-white border-b border-neutral-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
          <span className="text-xs font-bold tracking-widest text-neutral-400 uppercase block mb-3">
            The ApexCore Advantage
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-neutral-950 tracking-tight leading-tight">
            Why international founders trust our engineering standards.
          </h2>
          <p className="text-neutral-600 text-base sm:text-lg mt-4 font-normal px-2 sm:px-0">
            We align technical architecture with your business valuation goals to build long-term competitive moats.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {pillars.map((pillar, idx) => {
            const Icon = pillar.icon;
            return (
              <div
                key={idx}
                className="p-6 sm:p-8 rounded-2xl bg-neutral-50/70 border border-neutral-200/80 hover:bg-white hover:border-neutral-300 hover:shadow-lg transition-all duration-300"
              >
                <div className="w-10 h-10 rounded-xl bg-neutral-900 text-white flex items-center justify-center mb-6">
                  <Icon className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-bold text-neutral-950 tracking-tight mb-2.5">
                  {pillar.title}
                </h3>
                <p className="text-sm text-neutral-600 leading-relaxed">
                  {pillar.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
