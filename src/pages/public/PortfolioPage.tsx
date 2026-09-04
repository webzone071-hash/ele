import React, { useState } from "react";
import { useApp } from "../../context/AppContext";
import { ArrowUpRight, Globe, Github } from "lucide-react";
import { CtaSection } from "../../components/public/CtaSection";

export const PortfolioPage: React.FC = () => {
  const { data, setActivePortfolioModal } = useApp();
  const [selectedCategory, setSelectedCategory] = useState("All");

  const portfolio = data?.portfolio?.filter((p) => p.isActive) || [];

  const categories = ["All", "SaaS", "AI", "Mobile", "Web", "E-commerce"];

  const filteredItems = selectedCategory === "All"
    ? portfolio
    : portfolio.filter((p) => p.category.toLowerCase() === selectedCategory.toLowerCase());

  return (
    <main className="pt-20 sm:pt-28 md:pt-32 bg-white min-h-screen">
      {/* Header */}
      <section className="py-12 sm:py-16 md:py-20 border-b border-neutral-100 bg-neutral-50/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center max-w-3xl mx-auto">
          <span className="text-xs font-bold tracking-widest text-neutral-400 uppercase block mb-3">
            Production Track Record
          </span>
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-neutral-950 tracking-tight leading-tight mb-4 sm:mb-6">
            Case Studies & Enterprise Systems.
          </h1>
          <p className="text-base sm:text-lg text-neutral-600 leading-relaxed font-normal px-2 sm:px-0">
            Explore how we engineered high-throughput platforms, intelligent AI pipelines, and mobile products for leading global companies.
          </p>

          {/* Category Filter Pills */}
          <div className="flex items-center justify-start sm:justify-center gap-2 overflow-x-auto pb-2 mt-8 sm:mt-10 no-scrollbar -mx-4 px-4 sm:mx-0 sm:px-0">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 sm:px-5 py-2 sm:py-2.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all whitespace-nowrap min-h-[40px] shrink-0 ${
                  selectedCategory === cat
                    ? "bg-neutral-950 text-white shadow-sm"
                    : "bg-white border border-neutral-200 text-neutral-600 hover:text-neutral-950 hover:bg-neutral-100"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Grid */}
      <section className="py-12 sm:py-16 md:py-20 border-b border-neutral-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-10">
            {filteredItems.map((item) => (
              <div
                key={item.id}
                className="group rounded-3xl border border-neutral-200 bg-white overflow-hidden shadow-xs hover:shadow-xl hover:border-neutral-300 transition-all duration-300 flex flex-col justify-between"
              >
                <div>
                  <div
                    className="relative aspect-16/10 bg-neutral-100 overflow-hidden cursor-pointer"
                    onClick={() => setActivePortfolioModal(item)}
                  >
                    <img
                      src={item.coverImage}
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      loading="lazy"
                    />
                    <div className="absolute top-4 left-4">
                      <span className="px-3 py-1 rounded-full bg-white/95 backdrop-blur-md text-neutral-900 text-xs font-bold uppercase tracking-wider shadow-sm">
                        {item.category}
                      </span>
                    </div>
                  </div>

                  <div className="p-5 sm:p-8">
                    <span className="text-xs font-semibold text-neutral-400 uppercase tracking-wider block mb-2">
                      {item.client}
                    </span>

                    <h3
                      onClick={() => setActivePortfolioModal(item)}
                      className="text-xl sm:text-2xl font-bold text-neutral-950 tracking-tight mb-3 group-hover:text-neutral-700 transition-colors cursor-pointer"
                    >
                      {item.title}
                    </h3>

                    <p className="text-sm text-neutral-600 leading-relaxed mb-6">
                      {item.shortDescription}
                    </p>

                    {item.metrics && item.metrics.length > 0 && (
                      <div className="grid grid-cols-3 gap-2 p-3.5 rounded-xl bg-neutral-50 border border-neutral-100 mb-6">
                        {item.metrics.slice(0, 3).map((m, mIdx) => (
                          <div key={mIdx} className="text-center">
                            <span className="block text-sm sm:text-base font-bold text-neutral-950">
                              {m.value}
                            </span>
                            <span className="block text-[10px] text-neutral-500 font-semibold uppercase tracking-wider truncate">
                              {m.label}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}

                    <div className="flex flex-wrap gap-1.5">
                      {item.technologies.map((tech, tIdx) => (
                        <span
                          key={tIdx}
                          className="px-2.5 py-1 rounded-md bg-neutral-100 text-neutral-700 text-xs font-medium"
                        >
                          {tech}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="p-5 sm:p-8 pt-0 border-t border-neutral-100 mt-4 flex items-center justify-between">
                  <button
                    onClick={() => setActivePortfolioModal(item)}
                    className="text-xs font-bold text-neutral-950 hover:text-neutral-600 transition-colors uppercase tracking-wider inline-flex items-center gap-1.5"
                  >
                    <span>Read Full Case Study</span>
                    <ArrowUpRight className="w-4 h-4" />
                  </button>

                  <div className="flex items-center gap-2">
                    {item.projectUrl && (
                      <a
                        href={item.projectUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 rounded-lg text-neutral-400 hover:text-neutral-950 hover:bg-neutral-100"
                        title="Live Site"
                      >
                        <Globe className="w-4 h-4" />
                      </a>
                    )}
                  </div>
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
