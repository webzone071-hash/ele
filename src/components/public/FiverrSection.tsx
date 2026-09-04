import React from "react";
import { useApp } from "../../context/AppContext";
import { Star, ArrowUpRight, ArrowRight, CheckCircle2, Shield } from "lucide-react";

export const FiverrSection: React.FC = () => {
  const { data, navigate } = useApp();
  const fiverrServices = data?.fiverrServices?.filter((f) => f.isActive) || [];

  // Show top featured or first 3 on homepage
  const displayedGigs = fiverrServices.slice(0, 3);

  return (
    <section className="py-14 sm:py-20 md:py-24 bg-neutral-900 text-white border-b border-neutral-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12 sm:mb-16">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-neutral-800 border border-neutral-700 text-xs font-semibold text-neutral-300 uppercase tracking-wider mb-4">
              <Shield className="w-3.5 h-3.5 text-emerald-400" />
              <span>Verified Pro Marketplace Partner</span>
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight leading-tight">
              Ready to Start?
            </h2>
            <p className="text-neutral-400 text-base sm:text-lg mt-3 font-normal">
              Explore our ready-to-order services and kickstart your engineering project quickly with escrow protection.
            </p>
          </div>

          <div>
            <button
              id="view-all-marketplace-btn"
              onClick={() => navigate("/marketplace-services")}
              className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-white text-neutral-950 hover:bg-neutral-200 font-bold text-xs uppercase tracking-wider transition-all duration-200 inline-flex items-center justify-center gap-2 shadow-sm min-h-[44px]"
            >
              <span>View All Ready-to-Order Services</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Gigs Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {displayedGigs.map((gig) => (
            <div
              key={gig.id}
              className="bg-neutral-950 rounded-2xl border border-neutral-800 overflow-hidden shadow-xl hover:border-neutral-700 transition-all duration-300 flex flex-col justify-between group"
            >
              <div>
                {/* Thumbnail */}
                <div className="relative aspect-16/9 overflow-hidden bg-neutral-900">
                  <img
                    src={gig.thumbnail}
                    alt={gig.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-90"
                    loading="lazy"
                  />
                  <div className="absolute top-3 left-3">
                    <span className="px-2.5 py-1 rounded-md bg-neutral-950/80 backdrop-blur-md text-[11px] font-bold text-neutral-200 uppercase tracking-wider border border-neutral-800">
                      {gig.category}
                    </span>
                  </div>
                  <div className="absolute bottom-3 right-3 bg-neutral-950/90 backdrop-blur-md px-2.5 py-1 rounded-md border border-neutral-800 flex items-center gap-1.5 text-xs font-bold text-amber-400">
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    <span>{gig.rating.toFixed(1)}</span>
                    <span className="text-neutral-400 font-normal">({gig.reviewsCount})</span>
                  </div>
                </div>

                <div className="p-6">
                  <h3 className="text-lg font-bold text-white tracking-tight leading-snug mb-2.5 group-hover:text-neutral-200 transition-colors">
                    {gig.title}
                  </h3>

                  <p className="text-xs sm:text-sm text-neutral-400 leading-relaxed line-clamp-2 mb-4">
                    {gig.shortDescription}
                  </p>

                  {gig.features && gig.features.length > 0 && (
                    <ul className="space-y-1.5 pt-3 border-t border-neutral-900 mb-4">
                      {gig.features.slice(0, 2).map((feat, idx) => (
                        <li key={idx} className="flex items-center gap-2 text-xs text-neutral-400">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                          <span className="truncate">{feat}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>

              {/* Price & Action */}
              <div className="p-6 pt-0 border-t border-neutral-900 flex items-center justify-between mt-2">
                <div>
                  <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider block">
                    Starting At
                  </span>
                  <span className="text-xl font-extrabold text-white">
                    ${gig.startingPrice}
                  </span>
                </div>

                <a
                  href={gig.fiverrUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-white font-bold text-xs uppercase tracking-wider transition-colors inline-flex items-center gap-1.5 min-h-[40px]"
                >
                  <span>View Fiverr Gig</span>
                  <ArrowUpRight className="w-3.5 h-3.5 text-neutral-400" />
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
