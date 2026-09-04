import React from "react";
import { useApp } from "../../context/AppContext";
import { Star, Quote } from "lucide-react";

export const TestimonialsSection: React.FC = () => {
  const { data } = useApp();
  const testimonials = data?.testimonials?.filter((t) => t.isActive) || [];

  return (
    <section className="py-24 bg-neutral-50/60 border-b border-neutral-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-xs font-bold tracking-widest text-neutral-400 uppercase block mb-3">
            Client Endorsements
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-neutral-950 tracking-tight leading-tight">
            What international leaders say about our work.
          </h2>
          <p className="text-neutral-600 text-base sm:text-lg mt-4 font-normal">
            Direct feedback from founders, CTOs, and product directors across the US, Europe, and UAE.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {testimonials.map((test) => (
            <div
              key={test.id}
              className="p-8 sm:p-10 rounded-2xl bg-white border border-neutral-200/80 shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col justify-between relative"
            >
              <div>
                {/* Rating stars */}
                <div className="flex items-center gap-1 mb-6">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={`w-4 h-4 ${
                        i < test.rating
                          ? "fill-amber-400 text-amber-400"
                          : "fill-neutral-200 text-neutral-200"
                      }`}
                    />
                  ))}
                </div>

                <p className="text-neutral-800 text-base sm:text-lg leading-relaxed mb-8 italic font-normal">
                  "{test.quote}"
                </p>
              </div>

              {/* Author Info */}
              <div className="flex items-center gap-4 pt-6 border-t border-neutral-100">
                <img
                  src={test.avatarUrl}
                  alt={test.clientName}
                  className="w-12 h-12 rounded-full object-cover border border-neutral-200"
                  loading="lazy"
                />
                <div>
                  <h4 className="font-bold text-sm text-neutral-950">
                    {test.clientName}
                  </h4>
                  <p className="text-xs text-neutral-500 font-medium">
                    {test.position}, {test.company}
                  </p>
                  <p className="text-[11px] text-neutral-400 uppercase tracking-wider font-semibold mt-0.5">
                    {test.country}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
