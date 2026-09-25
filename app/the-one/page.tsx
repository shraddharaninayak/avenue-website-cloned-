import React from "react";
import Image from "next/image";
import Link from "next/link";
import { MapPin, ArrowRight, ShieldCheck, Sparkles, Building2, Compass } from "lucide-react";

export default function TheOnePage() {
  return (
    <div className="bg-[#584738] text-white pt-28">
      {/* Hero Header */}
      <section className="relative h-[85vh] w-full flex items-end pb-16 px-6 md:px-12 lg:px-20 overflow-hidden">
        <Image
          src="/the-one/day-16x9.webp"
          alt="The One by Kukreja Infrastructures"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#584738] via-[#584738]/40 to-[#584738]/30" />

        <div className="relative z-10 max-w-4xl">
          <div className="inline-flex items-center gap-2 bg-[#584738]/70 backdrop-blur-md px-3.5 py-1.5 border border-white/15 text-[10px] font-grotesk uppercase tracking-[0.2em] text-brand-gold font-semibold mb-4">
            <MapPin className="w-3.5 h-3.5" />
            <span>Civil Lines, Nagpur</span>
          </div>
          <h1 className="text-5xl sm:text-7xl lg:text-8xl font-grotesk font-normal uppercase leading-[0.95] tracking-tight text-white">
            The One
          </h1>
          <p className="font-hanken text-lg md:text-xl text-white/80 max-w-2xl mt-6 leading-relaxed">
            The pinnacle of architectural distinction in Nagpur. 4 & 5 BHK bespoke sky estates designed for the city's most discerning families.
          </p>
        </div>
      </section>

      {/* Overview & Quick Specs */}
      <section className="py-24 px-6 md:px-12 lg:px-20 max-w-7xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 pb-16 border-b border-white/10">
          <div>
            <div className="text-[10px] uppercase font-grotesk tracking-[0.2em] text-white/40">
              Location
            </div>
            <div className="text-lg font-semibold font-grotesk text-white mt-1">
              Civil Lines
            </div>
          </div>
          <div>
            <div className="text-[10px] uppercase font-grotesk tracking-[0.2em] text-white/40">
              Configuration
            </div>
            <div className="text-lg font-semibold font-grotesk text-white mt-1">
              4 & 5 BHK Sky Suites
            </div>
          </div>
          <div>
            <div className="text-[10px] uppercase font-grotesk tracking-[0.2em] text-white/40">
              Floors
            </div>
            <div className="text-lg font-semibold font-grotesk text-white mt-1">
              Iconic High-Rise Tower
            </div>
          </div>
          <div>
            <div className="text-[10px] uppercase font-grotesk tracking-[0.2em] text-white/40">
              Possession
            </div>
            <div className="text-lg font-semibold font-grotesk text-brand-gold mt-1">
              Under Construction
            </div>
          </div>
        </div>

        {/* Story */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 py-20 items-center">
          <div className="space-y-6">
            <div className="text-[11px] font-grotesk uppercase tracking-[0.3em] text-brand-gold font-semibold">
              The Concept
            </div>
            <h2 className="text-3xl sm:text-5xl font-grotesk font-normal uppercase leading-[1.05] tracking-tight">
              An Address That Needs No Introduction
            </h2>
            <p className="font-hanken text-white/70 text-base md:text-lg leading-relaxed">
              Situated in the historical, verdant core of Civil Lines, The One provides panoramic views across the city’s green canopy. Each residence features double-height balconies, private elevator foyers, and bespoke marble finishes.
            </p>
            <div className="pt-4">
              <Link
                href="/contact"
                className="inline-flex items-center gap-3 bg-[#584738] text-white px-8 py-4 font-grotesk text-xs uppercase tracking-[0.2em] font-semibold hover:bg-brand-bronze transition-colors duration-300"
              >
                <span>Request Detailed Brochure</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-[#584738] border border-white/10 p-8 flex items-start gap-5">
              <ShieldCheck className="w-8 h-8 text-brand-gold shrink-0 mt-1" />
              <div>
                <h3 className="font-grotesk text-xl uppercase tracking-tight text-white mb-1">
                  Private Elevator Access
                </h3>
                <p className="font-hanken text-sm text-white/60 leading-relaxed">
                  Dedicated high-speed elevator access opens directly into your private residence entrance foyer.
                </p>
              </div>
            </div>

            <div className="bg-[#584738] border border-white/10 p-8 flex items-start gap-5">
              <Sparkles className="w-8 h-8 text-brand-gold shrink-0 mt-1" />
              <div>
                <h3 className="font-grotesk text-xl uppercase tracking-tight text-white mb-1">
                  Sky Deck & Heated Infinity Pool
                </h3>
                <p className="font-hanken text-sm text-white/60 leading-relaxed">
                  Rooftop leisure pavilion featuring an infinity pool, private banquet lounge, and wellness spa.
                </p>
              </div>
            </div>

            <div className="bg-[#584738] border border-white/10 p-8 flex items-start gap-5">
              <Compass className="w-8 h-8 text-brand-gold shrink-0 mt-1" />
              <div>
                <h3 className="font-grotesk text-xl uppercase tracking-tight text-white mb-1">
                  360° Unobstructed Views
                </h3>
                <p className="font-hanken text-sm text-white/60 leading-relaxed">
                  Expansive floor-to-ceiling acoustic glass framing sweeping vistas of Civil Lines and the skyline.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
