import React from "react";
import { useApp } from "../../context/AppContext";
import { ArrowUpRight } from "lucide-react";

export const HeroSection: React.FC = () => {
  const { data, navigate } = useApp();
  const hero = data?.hero;

  if (!hero) return null;

  return (
    <section className="relative pt-24 sm:pt-32 md:pt-36 lg:pt-40 pb-14 sm:pb-20 md:pb-28 overflow-hidden bg-white text-neutral-900 border-b border-neutral-100">
      {/* Subtle, Crisp Architectural Background Grid */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#e5e7eb_1px,transparent_1px),linear-gradient(to_bottom,#e5e7eb_1px,transparent_1px)] bg-[size:3rem_3rem] sm:bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_70%_60%_at_50%_0%,#000_65%,transparent_100%)] opacity-35 pointer-events-none" />
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] sm:w-[650px] h-[200px] sm:h-[320px] bg-neutral-100/70 blur-[80px] sm:blur-[100px] pointer-events-none rounded-full" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="flex flex-col items-center text-center max-w-4xl mx-auto">
          {/* Primary Display Headline */}
          <h1 className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight text-neutral-950 leading-[1.12] sm:leading-[1.08] mb-5 sm:mb-6">
            {hero.heading}{" "}
            <span className="text-neutral-500">
              {hero.highlightedHeading}
            </span>
          </h1>

          {/* Value Narrative */}
          <p className="text-base sm:text-lg md:text-xl text-neutral-600 leading-relaxed max-w-2xl mb-8 sm:mb-10 font-normal px-2 sm:px-0">
            {hero.description}
          </p>

          {/* High-Contrast Conversion CTAs */}
          <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto mb-10 sm:mb-14">
            <button
              id="hero-primary-cta"
              onClick={() => navigate(hero.primaryCtaUrl || "/get-in-touch")}
              className="w-full sm:w-auto px-6 sm:px-8 py-3.5 sm:py-4 rounded-xl bg-neutral-950 text-white font-bold text-xs sm:text-sm tracking-wider uppercase hover:bg-neutral-800 transition-all duration-200 shadow-lg flex items-center justify-center gap-2 min-h-[48px] active:scale-[0.98]"
            >
              <span>{hero.primaryCtaText || "Start Your Project"}</span>
              <ArrowUpRight className="w-4 h-4" />
            </button>

            <button
              id="hero-secondary-cta"
              onClick={() => navigate(hero.secondaryCtaUrl || "/portfolio")}
              className="w-full sm:w-auto px-6 sm:px-8 py-3.5 sm:py-4 rounded-xl bg-white border border-neutral-200 text-neutral-800 font-bold text-xs sm:text-sm tracking-wider uppercase hover:bg-neutral-50 hover:border-neutral-300 transition-all duration-200 shadow-xs flex items-center justify-center gap-2 min-h-[48px]"
            >
              <span>{hero.secondaryCtaText || "View Case Studies"}</span>
            </button>
          </div>

          {/* Key Metrics Strip */}
          {hero.stats && hero.stats.length > 0 && (
            <div className="pt-6 sm:pt-8 border-t border-neutral-200/80 grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-8 w-full max-w-3xl">
              {hero.stats.map((stat, idx) => (
                <div key={idx} className="flex flex-col items-center">
                  <span className="text-2xl sm:text-3xl font-black text-neutral-950 tracking-tight">
                    {stat.value}
                  </span>
                  <span className="text-[11px] sm:text-xs font-semibold text-neutral-500 uppercase tracking-wider mt-1">
                    {stat.label}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
};
