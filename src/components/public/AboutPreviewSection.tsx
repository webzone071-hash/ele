import React from "react";
import { useApp } from "../../context/AppContext";
import { ArrowUpRight, CheckCircle2 } from "lucide-react";

export const AboutPreviewSection: React.FC = () => {
  const { settings, navigate } = useApp();

  const agencyName = settings?.agencyName || "ApexCore Labs";

  return (
    <section className="py-24 bg-white border-b border-neutral-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-14 lg:gap-16 items-center">
          {/* Left Column: Narrative & Values */}
          <div className="space-y-6">
            <div className="inline-block px-3 py-1 rounded-full bg-neutral-100 text-neutral-800 text-xs font-bold uppercase tracking-wider">
              Engineering Rigor & Philosophy
            </div>

            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-neutral-950 tracking-tight leading-tight">
              We engineer digital products with the precision of high-stakes systems.
            </h2>

            <p className="text-neutral-600 text-base sm:text-lg leading-relaxed font-normal">
              {agencyName} was founded with a singular conviction: international companies don't need another generic design agency. They require seasoned senior architects who treat performance, code modularity, and business conversion as inseparable disciplines.
            </p>

            <ul className="space-y-3.5 pt-2">
              <li className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-neutral-950 shrink-0 mt-0.5" />
                <span className="text-sm sm:text-base text-neutral-800 font-medium">
                  <strong>Senior-Only Talent:</strong> Zero junior outsourcing. Every sprint is planned and executed by battle-tested staff engineers.
                </span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-neutral-950 shrink-0 mt-0.5" />
                <span className="text-sm sm:text-base text-neutral-800 font-medium">
                  <strong>Global Timezone Overlap:</strong> Dedicated real-time communication synced with North American, European, and Gulf business hours.
                </span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-neutral-950 shrink-0 mt-0.5" />
                <span className="text-sm sm:text-base text-neutral-800 font-medium">
                  <strong>100% Code Ownership:</strong> Clean GitHub repositories, documentation, and zero proprietary lock-in.
                </span>
              </li>
            </ul>

            <div className="pt-4">
              <button
                id="about-preview-learn-more"
                onClick={() => navigate("/about")}
                className="px-6 py-3.5 rounded-xl bg-neutral-950 text-white font-bold text-xs uppercase tracking-wider hover:bg-neutral-800 transition-colors inline-flex items-center gap-2"
              >
                <span>Learn More About Our Team</span>
                <ArrowUpRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Right Column: Visual Showcase & Stats */}
          <div className="relative">
            <div className="rounded-2xl overflow-hidden border border-neutral-200 shadow-xl aspect-4/3 sm:aspect-16/10">
              <img
                src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=1000&auto=format&fit=crop&q=80"
                alt="Software agency engineering team collaborating"
                className="w-full h-full object-cover"
                loading="lazy"
              />
            </div>

            {/* Overlapping Floating Stat Card */}
            <div className="mt-4 sm:mt-0 sm:absolute sm:-bottom-6 sm:left-4 md:-left-4 lg:-left-6 bg-neutral-950 text-white p-5 sm:p-6 rounded-2xl shadow-xl border border-neutral-800 w-full sm:max-w-xs">
              <div className="text-2xl sm:text-3xl font-black tracking-tight mb-1">
                99.4%
              </div>
              <div className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-neutral-400 mb-2">
                Client Satisfaction Score
              </div>
              <p className="text-xs text-neutral-400 leading-relaxed">
                Measured across 140+ international enterprise deployments and continuous retainer partnerships.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
