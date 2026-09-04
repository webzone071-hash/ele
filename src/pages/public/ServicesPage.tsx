import React, { useState } from "react";
import { useApp } from "../../context/AppContext";
import { DynamicIcon } from "../../components/common/DynamicIcon";
import { ArrowUpRight, Check, Search, Filter } from "lucide-react";
import { CtaSection } from "../../components/public/CtaSection";

export const ServicesPage: React.FC = () => {
  const { data, setActiveServiceModal, navigate } = useApp();
  const services = data?.services?.filter((s) => s.isActive) || [];
  const [searchQuery, setSearchQuery] = useState("");

  const filteredServices = services.filter((s) => {
    const q = searchQuery.toLowerCase();
    return (
      s.name.toLowerCase().includes(q) ||
      s.shortDescription.toLowerCase().includes(q) ||
      s.technologies.some((t) => t.toLowerCase().includes(q))
    );
  });

  return (
    <main className="pt-28 sm:pt-36 bg-white">
      {/* Page Header */}
      <section className="py-16 sm:py-20 border-b border-neutral-100 bg-neutral-50/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center max-w-3xl mx-auto">
          <span className="text-xs font-bold tracking-widest text-neutral-400 uppercase block mb-3">
            Enterprise Capabilities
          </span>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-neutral-950 tracking-tight leading-tight mb-6">
            Bespoke Software, Cloud & AI Engineering.
          </h1>
          <p className="text-lg text-neutral-600 leading-relaxed font-normal">
            Every service is executed by senior engineers with guaranteed delivery timelines, sub-second performance standards, and complete code ownership.
          </p>

          {/* Search bar */}
          <div className="mt-8 max-w-md mx-auto relative">
            <Search className="w-5 h-5 text-neutral-400 absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search services (e.g., Next.js, AI, Mobile, SaaS)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3.5 rounded-xl bg-white border border-neutral-200 text-sm text-neutral-900 placeholder-neutral-400 focus:outline-none focus:border-neutral-950 shadow-xs"
            />
          </div>
        </div>
      </section>

      {/* Services Grid with Comprehensive Details */}
      <section className="py-20 border-b border-neutral-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="space-y-16">
            {filteredServices.map((service, index) => (
              <div
                key={service.id}
                id={`service-${service.slug}`}
                className={`p-8 sm:p-12 rounded-3xl border border-neutral-200 bg-white shadow-xs hover:shadow-xl transition-all duration-300 grid grid-cols-1 lg:grid-cols-12 gap-10 items-start ${
                  index % 2 === 1 ? "lg:bg-neutral-50/50" : ""
                }`}
              >
                {/* Left Overview Column */}
                <div className="lg:col-span-5 space-y-6">
                  <div className="w-14 h-14 rounded-2xl bg-neutral-950 text-white flex items-center justify-center shadow-md">
                    <DynamicIcon name={service.icon} size={28} />
                  </div>

                  <div>
                    <span className="text-[11px] font-bold text-neutral-400 uppercase tracking-widest block mb-1">
                      Tier-1 Architecture
                    </span>
                    <h2 className="text-2xl sm:text-3xl font-extrabold text-neutral-950 tracking-tight">
                      {service.name}
                    </h2>
                  </div>

                  <p className="text-neutral-600 text-sm sm:text-base leading-relaxed">
                    {service.fullDescription || service.shortDescription}
                  </p>

                  {/* Tech stack pills */}
                  <div>
                    <h4 className="text-xs font-bold text-neutral-400 uppercase tracking-wider mb-2.5">
                      Core Technologies
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {service.technologies.map((tech, tIdx) => (
                        <span
                          key={tIdx}
                          className="px-3 py-1 rounded-lg bg-neutral-100 border border-neutral-200 text-xs font-semibold text-neutral-800"
                        >
                          {tech}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="pt-2">
                    <button
                      onClick={() => navigate(`/get-in-touch?service=${encodeURIComponent(service.name)}`)}
                      className="px-6 py-3.5 rounded-xl bg-neutral-950 hover:bg-neutral-800 text-white font-bold text-xs uppercase tracking-wider transition-colors inline-flex items-center gap-2 shadow-sm min-h-[44px]"
                    >
                      <span>Discuss Your Project</span>
                      <ArrowUpRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Right Details Column: Features & Benefits */}
                <div className="lg:col-span-7 bg-neutral-50/70 p-6 sm:p-8 rounded-2xl border border-neutral-200/80 space-y-8">
                  {/* Features */}
                  <div>
                    <h3 className="text-xs font-bold text-neutral-400 uppercase tracking-widest mb-4">
                      Engineering Deliverables
                    </h3>
                    <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                      {service.features.map((feature, fIdx) => (
                        <li key={fIdx} className="flex items-start gap-2.5 text-xs sm:text-sm text-neutral-800 font-medium">
                          <Check className="w-4 h-4 text-neutral-950 shrink-0 mt-0.5" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Outcomes / Benefits */}
                  {service.benefits && service.benefits.length > 0 && (
                    <div className="pt-6 border-t border-neutral-200/60">
                      <h3 className="text-xs font-bold text-neutral-400 uppercase tracking-widest mb-3">
                        Strategic Outcomes
                      </h3>
                      <ul className="space-y-2">
                        {service.benefits.map((benefit, bIdx) => (
                          <li key={bIdx} className="text-xs sm:text-sm text-neutral-600 flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-neutral-950 shrink-0" />
                            <span>{benefit}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Process Outline */}
                  {service.process && service.process.length > 0 && (
                    <div className="pt-6 border-t border-neutral-200/60">
                      <h3 className="text-xs font-bold text-neutral-400 uppercase tracking-widest mb-3">
                        Delivery Phase Progression
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {service.process.map((step, pIdx) => (
                          <div
                            key={pIdx}
                            className="flex items-center gap-1.5 text-xs text-neutral-700 bg-white px-3 py-1.5 rounded-md border border-neutral-200"
                          >
                            <span className="font-bold text-neutral-950">{pIdx + 1}.</span>
                            <span>{step}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <CtaSection />
    </main>
  );
};
