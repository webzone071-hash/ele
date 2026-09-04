import React from "react";
import { useApp } from "../../context/AppContext";
import { ShieldCheck, Target, Eye, ArrowUpRight, Github, Linkedin, Twitter, Award, CheckCircle2 } from "lucide-react";
import { ProcessSection } from "../../components/public/ProcessSection";
import { CtaSection } from "../../components/public/CtaSection";

export const AboutPage: React.FC = () => {
  const { data, settings, navigate } = useApp();
  const team = data?.team?.filter((m) => m.isActive) || [];
  const agencyName = settings?.agencyName || "ApexCore Labs";

  return (
    <main className="pt-20 sm:pt-28 md:pt-32 bg-white min-h-screen">
      {/* Page Header */}
      <section className="py-12 sm:py-16 md:py-20 border-b border-neutral-100 bg-neutral-50/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center max-w-4xl mx-auto">
          <span className="text-xs font-bold tracking-widest text-neutral-400 uppercase block mb-3">
            Our Purpose & Heritage
          </span>
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-neutral-950 tracking-tight leading-tight mb-4 sm:mb-6">
            Architecting high-stakes software for international market leaders.
          </h1>
          <p className="text-base sm:text-xl text-neutral-600 leading-relaxed max-w-2xl mx-auto font-normal px-2 sm:px-0">
            We are an international software development collective of senior architects, product designers, and AI engineers delivering mission-critical applications across the USA, UK, UAE, and Europe.
          </p>
        </div>
      </section>

      {/* Mission, Vision, and Values */}
      <section className="py-12 sm:py-16 md:py-20 border-b border-neutral-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-16 items-center mb-20">
            <div>
              <div className="w-12 h-12 rounded-xl bg-neutral-900 text-white flex items-center justify-center mb-6">
                <Target className="w-6 h-6" />
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-neutral-950 tracking-tight mb-4">
                Our Mission: Deterministic Engineering Excellence
              </h2>
              <p className="text-neutral-600 text-base leading-relaxed mb-4">
                Our mission is to eradicate technical debt, unpredictable project timelines, and superficial design from software development. We build durable digital products designed to scale to millions of concurrent users with sub-second response times.
              </p>
              <p className="text-neutral-600 text-base leading-relaxed">
                By maintaining a strict senior-only talent model, our clients communicate directly with principal engineers who understand both the low-level database constraints and high-level enterprise business strategy.
              </p>
            </div>

            <div>
              <div className="w-12 h-12 rounded-xl bg-neutral-900 text-white flex items-center justify-center mb-6">
                <Eye className="w-6 h-6" />
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-neutral-950 tracking-tight mb-4">
                Our Vision: Powering the Global Autonomous Digital Economy
              </h2>
              <p className="text-neutral-600 text-base leading-relaxed mb-4">
                We envision a future where business software is seamlessly intelligent, self-optimizing, and globally distributed across edge cloud fabrics.
              </p>
              <p className="text-neutral-600 text-base leading-relaxed">
                From autonomous AI multi-agent workflows to zero-knowledge cryptographic authentication, we empower modern enterprises to operate with unprecedented speed and operational autonomy.
              </p>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 p-5 sm:p-8 rounded-2xl bg-neutral-950 text-white shadow-xl">
            <div className="text-center p-2 sm:p-4">
              <span className="text-2xl sm:text-4xl font-black tracking-tight block">140+</span>
              <span className="text-[11px] sm:text-xs font-bold text-neutral-400 uppercase tracking-wider mt-1 block">
                Shipped Systems
              </span>
            </div>
            <div className="text-center p-2 sm:p-4">
              <span className="text-2xl sm:text-4xl font-black tracking-tight block">18+</span>
              <span className="text-[11px] sm:text-xs font-bold text-neutral-400 uppercase tracking-wider mt-1 block">
                Countries Served
              </span>
            </div>
            <div className="text-center p-2 sm:p-4">
              <span className="text-2xl sm:text-4xl font-black tracking-tight block">99.4%</span>
              <span className="text-[11px] sm:text-xs font-bold text-neutral-400 uppercase tracking-wider mt-1 block">
                Satisfaction Score
              </span>
            </div>
            <div className="text-center p-2 sm:p-4">
              <span className="text-2xl sm:text-4xl font-black tracking-tight block">$180M+</span>
              <span className="text-[11px] sm:text-xs font-bold text-neutral-400 uppercase tracking-wider mt-1 block">
                Processed Volume
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Leadership & Engineering Team */}
      <section className="py-12 sm:py-16 md:py-24 border-b border-neutral-100 bg-neutral-50/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-16">
            <span className="text-xs font-bold tracking-widest text-neutral-400 uppercase block mb-3">
              Technical Leadership
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-neutral-950 tracking-tight leading-tight">
              Meet the architects steering our engineering.
            </h2>
            <p className="text-neutral-600 text-sm sm:text-lg mt-3 sm:mt-4">
              Our multidisciplinary team combines Tier-1 software architecture with human-centered product design.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            {team.map((member) => (
              <div
                key={member.id}
                className="bg-white rounded-2xl p-6 border border-neutral-200 shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col justify-between"
              >
                <div>
                  <div className="aspect-square rounded-xl overflow-hidden bg-neutral-100 mb-5">
                    <img
                      src={member.avatarUrl}
                      alt={member.name}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  </div>
                  <h3 className="text-lg font-bold text-neutral-950 tracking-tight">
                    {member.name}
                  </h3>
                  <span className="text-xs font-semibold text-neutral-500 block mb-3">
                    {member.position}
                  </span>
                  <p className="text-xs text-neutral-600 leading-relaxed">
                    {member.bio}
                  </p>
                </div>

                {/* Socials */}
                <div className="pt-5 mt-4 border-t border-neutral-100 flex items-center gap-2">
                  {member.linkedinUrl && (
                    <a
                      href={member.linkedinUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-8 h-8 rounded-lg bg-neutral-100 flex items-center justify-center text-neutral-700 hover:text-neutral-950 hover:bg-neutral-200 transition-colors"
                      aria-label="LinkedIn"
                    >
                      <Linkedin className="w-4 h-4" />
                    </a>
                  )}
                  {member.githubUrl && (
                    <a
                      href={member.githubUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-8 h-8 rounded-lg bg-neutral-100 flex items-center justify-center text-neutral-700 hover:text-neutral-950 hover:bg-neutral-200 transition-colors"
                      aria-label="GitHub"
                    >
                      <Github className="w-4 h-4" />
                    </a>
                  )}
                  {member.twitterUrl && (
                    <a
                      href={member.twitterUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-8 h-8 rounded-lg bg-neutral-100 flex items-center justify-center text-neutral-700 hover:text-neutral-950 hover:bg-neutral-200 transition-colors"
                      aria-label="Twitter"
                    >
                      <Twitter className="w-4 h-4" />
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Process Lifecycle */}
      <ProcessSection />

      {/* CTA */}
      <CtaSection />
    </main>
  );
};
