import React from "react";
import Link from "next/link";
import { ArrowRight, Phone } from "lucide-react";
import { company } from "@/data/avenue";

export default function ContactCTA() {
  return (
    <section className="bg-[#584738] py-28 px-6 md:px-12 lg:px-20 text-white text-center border-t border-white/10">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="text-[11px] font-grotesk uppercase tracking-[0.3em] text-brand-gold font-semibold">
          Begin Your Journey
        </div>
        <h2 className="text-4xl sm:text-6xl font-grotesk font-normal uppercase leading-[1.05] tracking-tight">
          Experience Landmark Living in Nashik
        </h2>
        <p className="font-hanken text-white/70 max-w-xl mx-auto text-base md:text-lg leading-relaxed">
          Whether you are looking for a home at Urbania, Aura or Bliss, or
          commercial office space at Flora, our advisors are here to guide you.
        </p>
        <div className="pt-4 flex flex-wrap items-center justify-center gap-4">
          <Link
            href="/contact"
            className="inline-flex items-center gap-3 bg-[#584738] text-white px-9 py-4 font-grotesk text-xs uppercase tracking-[0.2em] font-semibold hover:bg-brand-bronze transition-colors duration-300"
          >
            <span>Schedule Private Tour</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
          <a
            href={company.phoneHref}
            className="inline-flex items-center gap-3 border border-white/20 px-9 py-4 font-grotesk text-xs uppercase tracking-[0.2em] font-semibold text-white hover:border-brand-gold hover:text-brand-gold transition-colors duration-300"
          >
            <Phone className="w-4 h-4" />
            <span>{company.phone}</span>
          </a>
        </div>
      </div>
    </section>
  );
}
