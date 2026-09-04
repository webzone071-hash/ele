import React from "react";
import { useApp } from "../../context/AppContext";
import { DynamicIcon } from "../common/DynamicIcon";

export const ProcessSection: React.FC = () => {
  const { data } = useApp();
  const processSteps = data?.process?.filter((p) => p.isActive) || [];

  return (
    <section className="py-24 bg-white border-b border-neutral-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-20">
          <span className="text-xs font-bold tracking-widest text-neutral-400 uppercase block mb-3">
            Predictable Execution
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-neutral-950 tracking-tight leading-tight">
            Our 7-Step Engineering Lifecycle.
          </h2>
          <p className="text-neutral-600 text-base sm:text-lg mt-4 font-normal">
            From initial requirements modeling to zero-downtime global rollout, our structured methodology eliminates risk.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {processSteps.map((step, idx) => (
            <div
              key={step.id}
              className="p-7 rounded-2xl bg-neutral-50 border border-neutral-200/80 hover:bg-white hover:shadow-lg transition-all duration-300 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-6">
                  <div className="w-11 h-11 rounded-xl bg-neutral-900 text-white flex items-center justify-center">
                    <DynamicIcon name={step.icon || "Compass"} size={20} />
                  </div>
                  <span className="text-2xl font-black text-neutral-300 tracking-tighter">
                    0{step.stepNumber || idx + 1}
                  </span>
                </div>

                <h3 className="text-base font-bold text-neutral-950 tracking-tight mb-2">
                  {step.title}
                </h3>

                <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed font-normal">
                  {step.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
