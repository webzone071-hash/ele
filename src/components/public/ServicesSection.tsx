import React from "react";
import { useApp } from "../../context/AppContext";
import { DynamicIcon } from "../common/DynamicIcon";
import { ArrowUpRight, ArrowRight, Check } from "lucide-react";

export const ServicesSection: React.FC = () => {
  const { data, setActiveServiceModal, navigate } = useApp();
  const services = data?.services?.filter((s) => s.isActive) || [];

  return (
    <section className="py-14 sm:py-20 md:py-24 bg-neutral-50/50 border-b border-neutral-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12 sm:mb-16">
          <div className="max-w-2xl">
            <span className="text-xs font-bold tracking-widest text-neutral-400 uppercase block mb-3">
              Full-Lifecycle Engineering
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-neutral-950 tracking-tight leading-tight">
              Specialized services engineered for market leadership.
            </h2>
          </div>
          <div>
            <button
              onClick={() => navigate("/services")}
              className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-neutral-950 hover:text-neutral-600 transition-colors uppercase tracking-wider min-h-[44px]"
            >
              <span>View All Capabilities</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Responsive Grid: 1 col mobile -> 2 col tablet -> 3 col desktop */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {services.map((service) => (
            <div
              key={service.id}
              className="bg-white rounded-2xl p-6 sm:p-8 border border-neutral-200/80 shadow-xs hover:shadow-xl hover:border-neutral-300 transition-all duration-300 flex flex-col justify-between group"
            >
              <div>
                {/* Icon header */}
                <div className="w-12 h-12 rounded-xl bg-neutral-900 text-white flex items-center justify-center mb-6 group-hover:scale-105 transition-transform duration-200 shadow-sm">
                  <DynamicIcon name={service.icon} size={22} />
                </div>

                <h3 className="text-xl font-bold text-neutral-950 tracking-tight mb-3">
                  {service.name}
                </h3>

                <p className="text-sm text-neutral-600 leading-relaxed mb-6">
                  {service.shortDescription}
                </p>

                {/* Key feature bullets */}
                {service.features && service.features.length > 0 && (
                  <ul className="space-y-2 mb-8 pt-4 border-t border-neutral-100">
                    {service.features.slice(0, 3).map((feature, fIdx) => (
                      <li key={fIdx} className="flex items-start gap-2 text-xs font-medium text-neutral-700">
                        <Check className="w-3.5 h-3.5 text-neutral-950 shrink-0 mt-0.5" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              {/* Action Links */}
              <div className="pt-4 border-t border-neutral-100 flex items-center justify-between">
                <button
                  onClick={() => setActiveServiceModal(service)}
                  className="text-xs font-bold text-neutral-700 hover:text-neutral-950 transition-colors"
                >
                  Explore Specs
                </button>

                <button
                  onClick={() => navigate(`/get-in-touch?service=${encodeURIComponent(service.name)}`)}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-neutral-100 hover:bg-neutral-950 hover:text-white text-neutral-900 text-xs font-bold tracking-wider uppercase transition-colors"
                >
                  <span>Discuss</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
