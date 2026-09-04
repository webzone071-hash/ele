import React from "react";
import { useApp } from "../../context/AppContext";
import { HeroSection } from "../../components/public/HeroSection";
import { TrustSection } from "../../components/public/TrustSection";
import { AboutPreviewSection } from "../../components/public/AboutPreviewSection";
import { ServicesSection } from "../../components/public/ServicesSection";
import { WhyChooseUsSection } from "../../components/public/WhyChooseUsSection";
import { PortfolioSection } from "../../components/public/PortfolioSection";
import { FiverrSection } from "../../components/public/FiverrSection";
import { ProcessSection } from "../../components/public/ProcessSection";
import { TestimonialsSection } from "../../components/public/TestimonialsSection";
import { CtaSection } from "../../components/public/CtaSection";

export const HomePage: React.FC = () => {
  const { data } = useApp();

  // Get active sections sorted by displayOrder
  const sections = data?.sections || [];
  const activeSections = [...sections]
    .filter((s) => s.isActive)
    .sort((a, b) => a.displayOrder - b.displayOrder);

  // Map section keys to actual components
  const renderSection = (key: string) => {
    switch (key) {
      case "hero":
        return <HeroSection key={key} />;
      case "trust":
        return <TrustSection key={key} />;
      case "about_preview":
        return <AboutPreviewSection key={key} />;
      case "services":
        return <ServicesSection key={key} />;
      case "why_us":
        return <WhyChooseUsSection key={key} />;
      case "portfolio":
        return <PortfolioSection key={key} />;
      case "fiverr":
        return <FiverrSection key={key} />;
      case "process":
        return <ProcessSection key={key} />;
      case "testimonials":
        return <TestimonialsSection key={key} />;
      case "cta":
        return <CtaSection key={key} />;
      default:
        return null;
    }
  };

  // If bootstrap data has not loaded sections at all, fallback to initial default
  if (!data?.sections || data.sections.length === 0) {
    return (
      <main>
        <HeroSection />
        <TrustSection />
        <AboutPreviewSection />
        <ServicesSection />
        <WhyChooseUsSection />
        <PortfolioSection />
        <FiverrSection />
        <ProcessSection />
        <TestimonialsSection />
        <CtaSection />
      </main>
    );
  }

  // If sections exist but all have been hidden by admin
  if (activeSections.length === 0) {
    return (
      <main className="min-h-[50vh] flex items-center justify-center py-20 px-4 text-center">
        <div className="max-w-md mx-auto space-y-3">
          <h2 className="text-xl font-bold text-neutral-900">All Sections Currently Hidden</h2>
          <p className="text-sm text-neutral-500">
            Frontend sections are currently disabled in the Admin Panel under "Homepage Section Layout & Order".
          </p>
        </div>
      </main>
    );
  }

  return (
    <main>
      {activeSections.map((s) => renderSection(s.sectionKey))}
    </main>
  );
};
