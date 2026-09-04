import React, { useState } from "react";
import { useApp } from "../../context/AppContext";
import { ArrowUpRight, ArrowRight } from "lucide-react";

export const PortfolioSection: React.FC = () => {
  const { data, setActivePortfolioModal, navigate } = useApp();
  const [activeCategory, setActiveCategory] = useState("All");

  const portfolio = data?.portfolio?.filter((p) => p.isActive) || [];

  const categories = ["All", "SaaS", "AI", "Mobile", "Web", "E-commerce"];

  const filteredItems = activeCategory === "All"
    ? portfolio
    : portfolio.filter((p) => p.category.toLowerCase() === activeCategory.toLowerCase());

  return (
    <section className="py-14 sm:py-20 md:py-24 bg-white border-b border-neutral-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8 sm:mb-12">
          <div className="max-w-2xl">
            <span className="text-xs font-bold tracking-widest text-neutral-400 uppercase block mb-3">
              Proven Global Deliverables
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-neutral-950 tracking-tight leading-tight">
              Selected case studies & enterprise deployments.
            </h2>
          </div>
          <div>
            <button
              onClick={() => navigate("/portfolio")}
              className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-neutral-950 hover:text-neutral-600 transition-colors uppercase tracking-wider min-h-[44px]"
            >
              <span>Explore All Case Studies</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Dynamic Category Filter Pills with Smooth Touch Momentum */}
        <div className="flex items-center gap-2 overflow-x-auto pb-3 mb-8 sm:mb-10 no-scrollbar -mx-4 px-4 sm:mx-0 sm:px-0">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-all whitespace-nowrap min-h-[40px] shrink-0 ${
                activeCategory === cat
                  ? "bg-neutral-950 text-white shadow-sm"
                  : "bg-neutral-100 text-neutral-600 hover:text-neutral-950 hover:bg-neutral-200"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Responsive Grid: 1 col mobile -> 2 col tablet/desktop */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-10">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              className="group rounded-2xl border border-neutral-200 bg-white overflow-hidden shadow-xs hover:shadow-xl hover:border-neutral-300 transition-all duration-300 flex flex-col justify-between"
            >
              <div>
                {/* Image Container with Zoom effect */}
                <div className="relative aspect-16/10 bg-neutral-100 overflow-hidden cursor-pointer" onClick={() => setActivePortfolioModal(item)}>
                  <img
                    src={item.coverImage}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />
                  <div className="absolute top-4 left-4">
                    <span className="px-3 py-1 rounded-full bg-white/90 backdrop-blur-md text-neutral-900 text-xs font-bold uppercase tracking-wider shadow-sm">
                      {item.category}
                    </span>
                  </div>
                </div>

                <div className="p-6 sm:p-8">
                  <div className="text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-2">
                    {item.client}
                  </div>

                  <h3
                    onClick={() => setActivePortfolioModal(item)}
                    className="text-xl sm:text-2xl font-bold text-neutral-950 tracking-tight mb-3 group-hover:text-neutral-700 transition-colors cursor-pointer"
                  >
                    {item.title}
                  </h3>

                  <p className="text-sm text-neutral-600 leading-relaxed mb-6">
                    {item.shortDescription}
                  </p>

                  {/* Metrics preview */}
                  {item.metrics && item.metrics.length > 0 && (
                    <div className="grid grid-cols-3 gap-2 p-3.5 rounded-xl bg-neutral-50 border border-neutral-100 mb-6">
                      {item.metrics.slice(0, 3).map((m, mIdx) => (
                        <div key={mIdx} className="text-center">
                          <span className="block text-sm sm:text-base font-bold text-neutral-950">
                            {m.value}
                          </span>
                          <span className="block text-[10px] text-neutral-500 font-medium uppercase tracking-wider">
                            {m.label}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Tech stack chips */}
                  <div className="flex flex-wrap gap-1.5">
                    {item.technologies.slice(0, 4).map((tech, tIdx) => (
                      <span
                        key={tIdx}
                        className="px-2.5 py-1 rounded-md bg-neutral-100 text-neutral-700 text-xs font-medium"
                      >
                        {tech}
                      </span>
                    ))}
                    {item.technologies.length > 4 && (
                      <span className="px-2 py-1 rounded-md bg-neutral-100 text-neutral-500 text-xs">
                        +{item.technologies.length - 4}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Card Footer */}
              <div className="p-6 sm:p-8 pt-0 border-t border-neutral-100 mt-4 flex items-center justify-between">
                <button
                  onClick={() => setActivePortfolioModal(item)}
                  className="text-xs font-bold text-neutral-950 hover:text-neutral-600 transition-colors uppercase tracking-wider inline-flex items-center gap-1.5"
                >
                  <span>Read Full Case Study</span>
                  <ArrowUpRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
