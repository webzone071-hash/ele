import React, { useEffect } from "react";
import { useApp } from "../../context/AppContext";
import { X, ArrowUpRight, CheckCircle2, Globe, Github } from "lucide-react";
import { DynamicIcon } from "./DynamicIcon";

export const ServiceDetailModal: React.FC = () => {
  const { activeServiceModal, setActiveServiceModal, navigate } = useApp();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setActiveServiceModal(null);
    };
    if (activeServiceModal) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [activeServiceModal, setActiveServiceModal]);

  if (!activeServiceModal) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-neutral-950/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="bg-white rounded-2xl max-w-2xl w-full max-h-[92dvh] overflow-y-auto shadow-2xl border border-neutral-100 flex flex-col relative"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="p-4 sm:p-6 md:p-8 border-b border-neutral-100 flex items-start justify-between gap-4 sticky top-0 bg-white z-10">
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-neutral-900 text-white flex items-center justify-center shrink-0">
              <DynamicIcon name={activeServiceModal.icon} size={20} />
            </div>
            <div>
              <span className="text-[10px] sm:text-xs font-bold text-neutral-400 uppercase tracking-wider block">
                Capability Overview
              </span>
              <h3 className="text-lg sm:text-2xl font-bold text-neutral-950 tracking-tight leading-snug">
                {activeServiceModal.name}
              </h3>
            </div>
          </div>
          <button
            onClick={() => setActiveServiceModal(null)}
            className="p-2 sm:p-2.5 rounded-lg text-neutral-400 hover:text-neutral-950 hover:bg-neutral-100 transition-colors min-w-[40px] min-h-[40px] flex items-center justify-center"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 sm:p-8 space-y-6">
          <div>
            <h4 className="text-xs font-bold text-neutral-400 uppercase tracking-wider mb-2">
              Description
            </h4>
            <p className="text-neutral-700 leading-relaxed text-sm sm:text-base">
              {activeServiceModal.fullDescription || activeServiceModal.shortDescription}
            </p>
          </div>

          {activeServiceModal.features && activeServiceModal.features.length > 0 && (
            <div>
              <h4 className="text-xs font-bold text-neutral-400 uppercase tracking-wider mb-3">
                Key Technical Features
              </h4>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {activeServiceModal.features.map((feat, idx) => (
                  <li key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm text-neutral-800">
                    <CheckCircle2 className="w-4 h-4 text-neutral-950 shrink-0 mt-0.5" />
                    <span>{feat}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {activeServiceModal.technologies && activeServiceModal.technologies.length > 0 && (
            <div>
              <h4 className="text-xs font-bold text-neutral-400 uppercase tracking-wider mb-3">
                Technology Stack
              </h4>
              <div className="flex flex-wrap gap-2">
                {activeServiceModal.technologies.map((tech, idx) => (
                  <span
                    key={idx}
                    className="px-3 py-1 rounded-md bg-neutral-100 text-neutral-800 text-xs font-medium border border-neutral-200"
                  >
                    {tech}
                  </span>
                ))}
              </div>
            </div>
          )}

          {activeServiceModal.benefits && activeServiceModal.benefits.length > 0 && (
            <div>
              <h4 className="text-xs font-bold text-neutral-400 uppercase tracking-wider mb-2">
                Business Outcomes
              </h4>
              <ul className="space-y-2">
                {activeServiceModal.benefits.map((benefit, idx) => (
                  <li key={idx} className="text-xs sm:text-sm text-neutral-600 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-neutral-950" />
                    <span>{benefit}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Footer CTA */}
        <div className="p-6 sm:p-8 bg-neutral-50 border-t border-neutral-100 flex flex-col sm:flex-row items-center justify-between gap-4">
          <span className="text-xs text-neutral-500 text-center sm:text-left">
            Ready to architect your custom {activeServiceModal.name}?
          </span>
          <button
            onClick={() => {
              setActiveServiceModal(null);
              navigate(`/get-in-touch?service=${encodeURIComponent(activeServiceModal.name)}`);
            }}
            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-neutral-950 text-white font-bold text-xs uppercase tracking-wider hover:bg-neutral-800 transition-colors flex items-center justify-center gap-2"
          >
            <span>Book Consultation</span>
            <ArrowUpRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export const PortfolioDetailModal: React.FC = () => {
  const { activePortfolioModal, setActivePortfolioModal, navigate } = useApp();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setActivePortfolioModal(null);
    };
    if (activePortfolioModal) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [activePortfolioModal, setActivePortfolioModal]);

  if (!activePortfolioModal) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-neutral-950/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="bg-white rounded-2xl max-w-3xl w-full max-h-[92dvh] overflow-y-auto shadow-2xl border border-neutral-100 flex flex-col relative"
        role="dialog"
        aria-modal="true"
      >
        {/* Cover Image Banner */}
        <div className="relative h-48 sm:h-64 md:h-72 w-full bg-neutral-100 overflow-hidden shrink-0">
          <img
            src={activePortfolioModal.coverImage}
            alt={activePortfolioModal.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-neutral-950/80 via-neutral-950/20 to-transparent" />
          
          <button
            onClick={() => setActivePortfolioModal(null)}
            className="absolute top-3 right-3 sm:top-4 sm:right-4 p-2.5 rounded-full bg-black/60 text-white hover:bg-black transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="absolute bottom-3 left-4 right-4 sm:bottom-4 sm:left-6 sm:right-6 text-white">
            <span className="px-2.5 py-1 rounded bg-white/20 backdrop-blur-md text-white text-[10px] sm:text-[11px] font-bold uppercase tracking-wider inline-block mb-1.5 sm:mb-2">
              {activePortfolioModal.category} • {activePortfolioModal.client}
            </span>
            <h3 className="text-lg sm:text-2xl font-bold tracking-tight text-white leading-snug">
              {activePortfolioModal.title}
            </h3>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-4 sm:p-6 md:p-8 space-y-6">
          {/* Key Metrics */}
          {activePortfolioModal.metrics && activePortfolioModal.metrics.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-3 p-3.5 sm:p-4 rounded-xl bg-neutral-50 border border-neutral-200">
              {activePortfolioModal.metrics.map((m, idx) => (
                <div key={idx} className="text-center">
                  <div className="text-lg sm:text-2xl font-extrabold text-neutral-950 tracking-tight">
                    {m.value}
                  </div>
                  <div className="text-[11px] font-semibold text-neutral-500 uppercase tracking-wider">
                    {m.label}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Narrative sections */}
          <div className="space-y-4">
            <div>
              <h4 className="text-xs font-bold text-neutral-400 uppercase tracking-wider mb-1.5">
                The Client Challenge
              </h4>
              <p className="text-neutral-700 text-sm leading-relaxed">
                {activePortfolioModal.challenge}
              </p>
            </div>

            <div>
              <h4 className="text-xs font-bold text-neutral-400 uppercase tracking-wider mb-1.5">
                Our Engineering Solution
              </h4>
              <p className="text-neutral-700 text-sm leading-relaxed">
                {activePortfolioModal.solution}
              </p>
            </div>

            <div>
              <h4 className="text-xs font-bold text-neutral-400 uppercase tracking-wider mb-1.5">
                Verified Business Impact & Results
              </h4>
              <p className="text-neutral-700 text-sm leading-relaxed">
                {activePortfolioModal.result}
              </p>
            </div>
          </div>

          {/* Technologies */}
          {activePortfolioModal.technologies && activePortfolioModal.technologies.length > 0 && (
            <div>
              <h4 className="text-xs font-bold text-neutral-400 uppercase tracking-wider mb-3">
                Architectural Stack
              </h4>
              <div className="flex flex-wrap gap-2">
                {activePortfolioModal.technologies.map((t, idx) => (
                  <span
                    key={idx}
                    className="px-3 py-1 rounded-md bg-neutral-100 text-neutral-800 text-xs font-medium border border-neutral-200"
                  >
                    {t}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-6 sm:p-8 bg-neutral-50 border-t border-neutral-100 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            {activePortfolioModal.projectUrl && (
              <a
                href={activePortfolioModal.projectUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-neutral-800 hover:text-neutral-950 underline underline-offset-4"
              >
                <Globe className="w-3.5 h-3.5" />
                <span>Visit Live System</span>
              </a>
            )}
            {activePortfolioModal.githubUrl && (
              <a
                href={activePortfolioModal.githubUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-neutral-800 hover:text-neutral-950 underline underline-offset-4"
              >
                <Github className="w-3.5 h-3.5" />
                <span>Source / Architecture</span>
              </a>
            )}
          </div>

          <button
            onClick={() => {
              setActivePortfolioModal(null);
              navigate("/get-in-touch");
            }}
            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-neutral-950 text-white font-bold text-xs uppercase tracking-wider hover:bg-neutral-800 transition-colors flex items-center justify-center gap-2"
          >
            <span>Request Similar Architecture</span>
            <ArrowUpRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
