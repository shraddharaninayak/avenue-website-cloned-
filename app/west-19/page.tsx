import React from "react";
import Image from "next/image";
import Link from "next/link";
import { MapPin, ArrowRight, Building, Layers, ShieldCheck, Zap } from "lucide-react";

export default function West19Page() {
  return (
    <div className="bg-[#584738] text-white pt-28">
      {/* Hero Header */}
      <section className="relative h-[85vh] w-full flex items-end pb-16 px-6 md:px-12 lg:px-20 overflow-hidden">
        <Image
          src="/west-19/aerial-16x9.webp"
          alt="West 19 Commercial Landmark"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#584738] via-[#584738]/40 to-[#584738]/30" />

        <div className="relative z-10 max-w-4xl">
          <div className="inline-flex items-center gap-2 bg-[#584738]/70 backdrop-blur-md px-3.5 py-1.5 border border-white/15 text-[10px] font-grotesk uppercase tracking-[0.2em] text-brand-gold font-semibold mb-4">
            <MapPin className="w-3.5 h-3.5" />
            <span>West High Court Road, Nagpur</span>
          </div>
          <h1 className="text-5xl sm:text-7xl lg:text-8xl font-grotesk font-normal uppercase leading-[0.95] tracking-tight text-white">
            West 19
          </h1>
          <p className="font-hanken text-lg md:text-xl text-white/80 max-w-2xl mt-6 leading-relaxed">
            Central India's benchmark corporate business center and luxury retail boulevard, strategically positioned in the commercial heart of Nagpur.
          </p>
        </div>
      </section>

      {/* Quick Specs */}
      <section className="py-24 px-6 md:px-12 lg:px-20 max-w-7xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 pb-16 border-b border-white/10">
          <div>
            <div className="text-[10px] uppercase font-grotesk tracking-[0.2em] text-white/40">
              Address
            </div>
            <div className="text-lg font-semibold font-grotesk text-white mt-1">
              WHC Road, Nagpur
            </div>
          </div>
          <div>
            <div className="text-[10px] uppercase font-grotesk tracking-[0.2em] text-white/40">
              Grade
            </div>
            <div className="text-lg font-semibold font-grotesk text-white mt-1">
              Grade-A Commercial
            </div>
          </div>
          <div>
            <div className="text-[10px] uppercase font-grotesk tracking-[0.2em] text-white/40">
              Floor Plate
            </div>
            <div className="text-lg font-semibold font-grotesk text-white mt-1">
              Up to 25,000 sq.ft.
            </div>
          </div>
          <div>
            <div className="text-[10px] uppercase font-grotesk tracking-[0.2em] text-white/40">
              Status
            </div>
            <div className="text-lg font-semibold font-grotesk text-brand-gold mt-1">
              Leasing & Bookings Open
            </div>
          </div>
        </div>

        {/* Narrative & Highlights */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 py-20 items-center">
          <div className="space-y-6">
            <div className="text-[11px] font-grotesk uppercase tracking-[0.3em] text-brand-gold font-semibold">
              Commercial Excellence
            </div>
            <h2 className="text-3xl sm:text-5xl font-grotesk font-normal uppercase leading-[1.05] tracking-tight">
              Designed for Global Enterprise
            </h2>
            <p className="font-hanken text-white/70 text-base md:text-lg leading-relaxed">
              West 19 combines dynamic corporate architecture with high-street lifestyle retail. Featuring grand double-height entrance lobbies, high-speed destination elevators, and multi-tier basement parking.
            </p>
            <div className="pt-4">
              <Link
                href="/contact"
                className="inline-flex items-center gap-3 bg-[#584738] text-white px-8 py-4 font-grotesk text-xs uppercase tracking-[0.2em] font-semibold hover:bg-brand-bronze transition-colors duration-300"
              >
                <span>Inquire About Leasing</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-[#584738] border border-white/10 p-8 flex items-start gap-5">
              <Building className="w-8 h-8 text-brand-gold shrink-0 mt-1" />
              <div>
                <h3 className="font-grotesk text-xl uppercase tracking-tight text-white mb-1">
                  Double-Height Grand Lobby
                </h3>
                <p className="font-hanken text-sm text-white/60 leading-relaxed">
                  Impressive arrival experience for Fortune 500 companies, financial institutions, and clients.
                </p>
              </div>
            </div>

            <div className="bg-[#584738] border border-white/10 p-8 flex items-start gap-5">
              <Layers className="w-8 h-8 text-brand-gold shrink-0 mt-1" />
              <div>
                <h3 className="font-grotesk text-xl uppercase tracking-tight text-white mb-1">
                  Flexible Floor Plates
                </h3>
                <p className="font-hanken text-sm text-white/60 leading-relaxed">
                  Column-free layouts allowing modular interior designs tailored to growing teams.
                </p>
              </div>
            </div>

            <div className="bg-[#584738] border border-white/10 p-8 flex items-start gap-5">
              <Zap className="w-8 h-8 text-brand-gold shrink-0 mt-1" />
              <div>
                <h3 className="font-grotesk text-xl uppercase tracking-tight text-white mb-1">
                  100% Power Backup & Fiber
                </h3>
                <p className="font-hanken text-sm text-white/60 leading-relaxed">
                  Dual-source power redundancy and high-speed multi-operator telecommunication backbones.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
