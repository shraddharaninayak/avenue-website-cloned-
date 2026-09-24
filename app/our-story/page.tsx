import React from "react";
import Image from "next/image";
import StatsSection from "@/components/home/StatsSection";
import Leadership from "@/components/home/Leadership";
import ContactCTA from "@/components/home/ContactCTA";

const values = [
  {
    num: "01",
    title: "Unmatched Quality",
    desc: "Meticulous attention to structural detail and the finest curated materials in residences and commercial developments built for generations.",
  },
  {
    num: "02",
    title: "Unrivalled Luxury",
    desc: "Lifestyle-centric amenities that elevate every square foot into a private sanctuary of comfort, privacy, and refinement.",
  },
  {
    num: "03",
    title: "Enduring Trust",
    desc: "Ethical transparency, clear governance, and an unblemished record of timely delivery across a decade in Nashik and Maharashtra.",
  },
  {
    num: "04",
    title: "Architectural Vision",
    desc: "Collaborating with renowned architects and engineers to create landmarks that forever enrich Nashik's urban identity.",
  },
];

export default function OurStoryPage() {
  return (
    <div className="bg-[#2D3A1F] text-white pt-28">
      {/* Hero Header */}
      <section className="px-6 md:px-12 lg:px-20 py-20 max-w-7xl mx-auto">
        <div className="text-[11px] font-grotesk uppercase tracking-[0.3em] text-brand-gold font-semibold mb-4">
          About Us
        </div>
        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-grotesk font-normal uppercase leading-[1.0] tracking-tight max-w-4xl">
          Vision That Leads Growth
        </h1>
        <p className="font-hanken text-white/70 max-w-2xl text-lg md:text-xl mt-8 leading-relaxed">
          The Avenue Builders & Developers was established with a singular ambition: to fulfill the aspirations of moving into homes and workplaces engineered to world-class standards.
        </p>
      </section>

      {/* Narrative Section with Image */}
      <section className="bg-[#2D3A1F] py-24 px-6 md:px-12 lg:px-20 border-y border-white/10">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div className="space-y-8">
            <div className="text-[11px] font-grotesk uppercase tracking-[0.3em] text-brand-gold font-semibold">
              Philosophy
            </div>
            <h2 className="text-3xl sm:text-5xl font-grotesk font-normal uppercase leading-[1.05] tracking-tight">
              Aligning Values with Vision
            </h2>
            <p className="font-hanken text-white/70 text-base md:text-lg leading-relaxed">
              As a prestigious and trusted brand in Nashik, The Avenue goes beyond exceptional square footage to create communities rich in beauty, wellbeing, and fulfillment. It is why we remain a preferred developer in the region.
            </p>
            <blockquote className="border-l-2 border-brand-gold pl-6 font-cormorant italic text-2xl text-white/90 leading-snug">
              "We believe your home is much more than just walls—it is the foundation of your family's future."
            </blockquote>
          </div>

          <div className="relative aspect-[4/3] w-full overflow-hidden border border-white/10 bg-black">
            <Image
              src="/about/pillars-front.webp"
              alt="The Avenue Pillars of Excellence"
              fill
              className="object-cover"
            />
          </div>
        </div>
      </section>

      {/* Core Values */}
      <section className="py-28 px-6 md:px-12 lg:px-20 max-w-7xl mx-auto">
        <div className="text-[11px] font-grotesk uppercase tracking-[0.3em] text-brand-gold font-semibold mb-3">
          Our Foundation
        </div>
        <h2 className="text-3xl sm:text-5xl font-grotesk font-normal uppercase leading-[1.05] tracking-tight mb-16">
          Core Values
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          {values.map((v) => (
            <div
              key={v.num}
              className="bg-[#2D3A1F] border border-white/10 p-8 md:p-10 hover:border-brand-gold/50 transition-colors"
            >
              <div className="font-grotesk text-3xl font-light text-brand-gold mb-4">
                {v.num}
              </div>
              <h3 className="font-grotesk text-2xl uppercase tracking-tight text-white mb-3">
                {v.title}
              </h3>
              <p className="font-hanken text-sm text-white/65 leading-relaxed">
                {v.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Stats */}
      <StatsSection />

      {/* Leadership */}
      <Leadership />

      {/* CTA */}
      <ContactCTA />
    </div>
  );
}
