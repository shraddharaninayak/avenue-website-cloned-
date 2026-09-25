import React from "react";

const stats = [
  { value: "2007", label: "Established", detail: "Nashik, Maharashtra" },
  { value: "1M+", label: "Sq. ft. delivered", detail: "Across all developments" },
  { value: "50+", label: "Years of leadership", detail: "Combined across our directors" },
  { value: "3", label: "Asset classes", detail: "Residential · Commercial · Industrial" },
];

export default function StatsSection() {
  return (
    <section className="bg-[#584738] py-28 px-6 md:px-12 lg:px-20 text-white border-y border-white/10">
      <div className="max-w-7xl mx-auto">
        <div className="max-w-3xl mb-16">
          <div className="text-[11px] font-grotesk uppercase tracking-[0.3em] text-brand-gold font-semibold mb-3">
            Legacy & Milestones
          </div>
          <h2 className="text-3xl sm:text-5xl font-grotesk font-normal uppercase leading-[1.1] tracking-tight">
            Since 2007, delivering residential, commercial and industrial developments across Nashik.
          </h2>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 md:gap-12">
          {stats.map((stat, i) => (
            <div
              key={i}
              className="border-l border-white/15 pl-6 md:pl-8 py-2 hover:border-brand-gold transition-colors duration-300"
            >
              <div className="font-grotesk text-4xl sm:text-5xl lg:text-6xl font-normal text-brand-gold tracking-tight">
                {stat.value}
              </div>
              <div className="font-grotesk text-xs uppercase tracking-[0.2em] font-semibold text-white mt-3">
                {stat.label}
              </div>
              <div className="font-hanken text-xs text-white/50 mt-1">
                {stat.detail}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
