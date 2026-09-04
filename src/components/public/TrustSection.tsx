import React from "react";

export const TrustSection: React.FC = () => {
  const clients = [
    { name: "Veloce Mobility", location: "Austin, USA", type: "Autonomous Fleet Tech" },
    { name: "NordicFin Tech", location: "Zurich, Switzerland", type: "WealthTech Infrastructure" },
    { name: "Crestview Holdings", location: "Dubai, UAE", type: "Enterprise Logistics" },
    { name: "Synthetix AI", location: "New York, USA", type: "Legal Tech & LLM" },
    { name: "LuxeAtelier", location: "Paris, France", type: "Luxury Commerce" },
    { name: "OmniHealth", location: "London, UK", type: "Telehealth Systems" },
  ];

  return (
    <section className="py-12 border-y border-neutral-100 bg-neutral-50/50 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <p className="text-center text-xs font-bold tracking-widest text-neutral-400 uppercase mb-8">
          Trusted by high-growth startups and international enterprises across USA, UK, UAE & Europe
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4 md:gap-6 items-center">
          {clients.map((client, idx) => (
            <div
              key={idx}
              className="flex flex-col items-center justify-center p-3 sm:p-4 rounded-xl bg-white border border-neutral-200/60 shadow-xs hover:shadow-sm hover:border-neutral-300 transition-all duration-200 group text-center min-h-[64px]"
            >
              <span className="font-extrabold text-xs sm:text-sm text-neutral-800 tracking-tight group-hover:text-neutral-950 transition-colors truncate w-full">
                {client.name}
              </span>
              <span className="text-[9px] sm:text-[10px] font-semibold text-neutral-400 uppercase tracking-wider mt-0.5 truncate w-full">
                {client.location}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
