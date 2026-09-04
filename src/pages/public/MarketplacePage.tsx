import React, { useState } from "react";
import { useApp } from "../../context/AppContext";
import { Star, ArrowUpRight, Search, ShieldCheck, Clock, CheckCircle2, ArrowLeft } from "lucide-react";

export const MarketplacePage: React.FC = () => {
  const { data, navigate } = useApp();
  const fiverrServices = data?.fiverrServices?.filter((f) => f.isActive) || [];

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [sortBy, setSortBy] = useState<"featured" | "price-asc" | "price-desc" | "rating">("featured");

  // Collect unique categories
  const categories = ["All", ...Array.from(new Set(fiverrServices.map((f) => f.category)))];

  // Filtering & Sorting
  let items = fiverrServices.filter((gig) => {
    const matchesCat = selectedCategory === "All" || gig.category === selectedCategory;
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      gig.title.toLowerCase().includes(q) ||
      gig.shortDescription.toLowerCase().includes(q) ||
      gig.category.toLowerCase().includes(q);
    return matchesCat && matchesSearch;
  });

  if (sortBy === "price-asc") {
    items.sort((a, b) => a.startingPrice - b.startingPrice);
  } else if (sortBy === "price-desc") {
    items.sort((a, b) => b.startingPrice - a.startingPrice);
  } else if (sortBy === "rating") {
    items.sort((a, b) => b.rating - a.rating || b.reviewsCount - a.reviewsCount);
  } else {
    items.sort((a, b) => (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0) || a.displayOrder - b.displayOrder);
  }

  return (
    <main className="pt-20 sm:pt-28 md:pt-32 bg-white min-h-screen">
      {/* Header */}
      <section className="py-12 sm:py-16 md:py-20 border-b border-neutral-100 bg-neutral-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <button
            onClick={() => navigate("/")}
            className="inline-flex items-center gap-2 text-xs font-bold text-neutral-400 hover:text-white uppercase tracking-wider mb-6 transition-colors min-h-[40px]"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Home</span>
          </button>

          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-neutral-800 border border-neutral-700 text-xs font-semibold text-neutral-300 uppercase tracking-wider mb-4">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Verified Pro Marketplace Catalog</span>
            </div>
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-white tracking-tight leading-tight mb-4">
              Ready-to-Order Fiverr Services.
            </h1>
            <p className="text-neutral-400 text-sm sm:text-lg leading-relaxed font-normal">
              Order directly with full marketplace escrow security, fixed delivery schedules, and verified 5-star reviews. Click any gig to view or initiate an order directly on Fiverr.
            </p>
          </div>

          {/* Search & Filter Bar */}
          <div className="mt-8 sm:mt-10 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2 relative">
              <Search className="w-5 h-5 text-neutral-400 absolute left-4 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search ready-to-order gigs (e.g. Next.js, AI Chatbot)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3.5 rounded-xl bg-neutral-950 border border-neutral-700 text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-white shadow-xs min-h-[44px]"
              />
            </div>

            <div>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="w-full px-4 py-3.5 rounded-xl bg-neutral-950 border border-neutral-700 text-sm text-white focus:outline-none focus:border-white min-h-[44px]"
              >
                <option value="featured">Sort by: Featured First</option>
                <option value="rating">Sort by: Highest Rating</option>
                <option value="price-asc">Sort by: Price (Low to High)</option>
                <option value="price-desc">Sort by: Price (High to Low)</option>
              </select>
            </div>
          </div>

          {/* Category Filter Chips */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 mt-6 no-scrollbar -mx-4 px-4 sm:mx-0 sm:px-0">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-all whitespace-nowrap min-h-[38px] shrink-0 ${
                  selectedCategory === cat
                    ? "bg-white text-neutral-950"
                    : "bg-neutral-800 text-neutral-300 hover:text-white hover:bg-neutral-700"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Gigs Catalog Grid */}
      <section className="py-12 sm:py-16 md:py-20 border-b border-neutral-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {items.length === 0 ? (
            <div className="text-center py-20 bg-neutral-50 rounded-2xl border border-dashed border-neutral-200">
              <p className="text-neutral-500 text-base font-medium">
                No ready-to-order services match your search or filter.
              </p>
              <button
                onClick={() => {
                  setSearchQuery("");
                  setSelectedCategory("All");
                }}
                className="mt-4 px-4 py-2 rounded-lg bg-neutral-950 text-white text-xs font-bold uppercase"
              >
                Reset Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {items.map((gig) => (
                <div
                  key={gig.id}
                  className="bg-white rounded-2xl border border-neutral-200 overflow-hidden shadow-xs hover:shadow-xl hover:border-neutral-300 transition-all duration-300 flex flex-col justify-between group"
                >
                  <div>
                    {/* Thumbnail */}
                    <div className="relative aspect-16/9 bg-neutral-100 overflow-hidden">
                      <img
                        src={gig.thumbnail}
                        alt={gig.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        loading="lazy"
                      />
                      <div className="absolute top-3 left-3">
                        <span className="px-2.5 py-1 rounded-md bg-white/95 backdrop-blur-md text-[11px] font-bold text-neutral-900 uppercase tracking-wider shadow-sm">
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
                      <div className="flex items-center gap-2 text-xs text-neutral-400 font-medium mb-2">
                        <Clock className="w-3.5 h-3.5 text-neutral-500" />
                        <span>{gig.deliveryTimeDays} Days Typical Turnaround</span>
                      </div>

                      <h3 className="text-lg font-bold text-neutral-950 tracking-tight leading-snug mb-3 group-hover:text-neutral-700 transition-colors">
                        {gig.title}
                      </h3>

                      <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed mb-6">
                        {gig.shortDescription}
                      </p>

                      {gig.features && gig.features.length > 0 && (
                        <ul className="space-y-2 pt-4 border-t border-neutral-100 mb-6">
                          {gig.features.map((feat, idx) => (
                            <li key={idx} className="flex items-start gap-2 text-xs text-neutral-700">
                              <CheckCircle2 className="w-3.5 h-3.5 text-neutral-950 shrink-0 mt-0.5" />
                              <span>{feat}</span>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </div>

                  {/* Footer with Starting Price & External Fiverr Link */}
                  <div className="p-6 pt-0 border-t border-neutral-100 flex items-center justify-between mt-2">
                    <div>
                      <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block">
                        Fixed Package Starting
                      </span>
                      <span className="text-2xl font-black text-neutral-950">
                        ${gig.startingPrice}
                      </span>
                    </div>

                    <a
                      href={gig.fiverrUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-5 py-3 rounded-xl bg-neutral-950 hover:bg-neutral-800 text-white font-bold text-xs uppercase tracking-wider transition-colors inline-flex items-center gap-1.5 shadow-sm min-h-[44px]"
                    >
                      <span>View Fiverr Gig</span>
                      <ArrowUpRight className="w-4 h-4 text-neutral-300" />
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </main>
  );
};
