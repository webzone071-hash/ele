import React from "react";
import { useApp } from "../../context/AppContext";
import { ArrowUpRight, Mail } from "lucide-react";

export const CtaSection: React.FC = () => {
  const { settings, navigate } = useApp();

  return (
    <section className="py-14 sm:py-20 md:py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl bg-neutral-950 text-white p-6 sm:p-12 lg:p-20 relative overflow-hidden shadow-2xl border border-neutral-800">
          {/* Subtle geometric lines */}
          <div className="absolute inset-0 bg-[radial-gradient(#333_1px,transparent_1px)] [background-size:16px_16px] opacity-30 pointer-events-none" />

          <div className="relative z-10 max-w-3xl">
            <span className="text-xs font-bold tracking-widest text-neutral-400 uppercase block mb-4">
              Accelerate Time-To-Market
            </span>
            <h2 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-tight mb-6">
              Have an ambitious vision? Let's engineer it into reality.
            </h2>
            <p className="text-neutral-400 text-base sm:text-xl leading-relaxed mb-10 font-normal">
              Whether you need an MVP delivered in 4 weeks, an autonomous AI agent deployed, or an enterprise cloud migration, our senior engineering leads are ready to review your specifications.
            </p>

            <div className="flex flex-col sm:flex-row items-center gap-4">
              <button
                id="cta-get-in-touch"
                onClick={() => navigate("/get-in-touch")}
                className="w-full sm:w-auto px-8 py-4 rounded-xl bg-white text-neutral-950 hover:bg-neutral-200 font-bold text-sm tracking-wider uppercase transition-colors flex items-center justify-center gap-2 min-h-[48px]"
              >
                <span>Book a Technical Consultation</span>
                <ArrowUpRight className="w-4 h-4" />
              </button>

              <button
                id="cta-contact-us"
                onClick={() => navigate("/contact")}
                className="w-full sm:w-auto px-8 py-4 rounded-xl bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 text-white font-bold text-sm tracking-wider uppercase transition-colors flex items-center justify-center gap-2 min-h-[48px]"
              >
                <Mail className="w-4 h-4 text-neutral-400" />
                <span>Contact Agency</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
