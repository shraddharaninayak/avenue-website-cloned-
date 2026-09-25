import React from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, MapPin } from "lucide-react";

const projects = [
  {
    id: "the-one",
    title: "The One",
    category: "Ultra Luxury Residences",
    location: "Civil Lines, Nagpur",
    image: "/the-one/day-16x9.webp",
    description: "An architectural masterpiece rising above Nagpur's most prestigious boulevard. Featuring bespoke sky suites, private elevators, and curated wellness amenities.",
    href: "/the-one",
    stats: [
      { label: "Configuration", value: "4 & 5 BHK" },
      { label: "Status", value: "Under Construction" },
    ],
  },
  {
    id: "west-19",
    title: "West 19",
    category: "Commercial & Retail Landmark",
    location: "West High Court Road, Nagpur",
    image: "/west-19/aerial-16x9.webp",
    description: "State-of-the-art Grade-A corporate towers seamlessly integrated with high-street luxury retail and premier dining destinations.",
    href: "/west-19",
    stats: [
      { label: "Floor Plates", value: "Up to 25,000 sq.ft." },
      { label: "Status", value: "Leasing Now" },
    ],
  },
  {
    id: "paris-city",
    title: "Paris City",
    category: "European Themed Residences",
    location: "Besa-Ghogli Road, Nagpur",
    image: "/paris-city/aerial-twilight.webp",
    description: "A celebration of neoclassical French elegance transposed into modern Indian luxury. Verdant manicured boulevards and private club pavilions.",
    href: "/contact",
    stats: [
      { label: "Villas & Suites", value: "3 & 4 BHK" },
      { label: "Status", value: "Ready to Move" },
    ],
  },
  {
    id: "infinity-east",
    title: "Infinity East",
    category: "High-Rise Luxury",
    location: "Wardha Road, Nagpur",
    image: "/infinity-east/real-2.webp",
    description: "Panoramic horizon views paired with progressive green architecture and unmatched proximity to the international airport and metro.",
    href: "/contact",
    stats: [
      { label: "Towers", value: "Twin Luxury Wings" },
      { label: "Status", value: "Under Construction" },
    ],
  },
];

export default function ProjectShowcase() {
  return (
    <section
      id="projects"
      className="scroll-mt-24 bg-[#584738] py-32 px-6 md:px-12 lg:px-20 text-white"
    >
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-20 gap-8">
          <div>
            <div className="text-[11px] font-grotesk uppercase tracking-[0.3em] text-brand-gold font-semibold mb-3">
              Portfolio
            </div>
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-grotesk font-normal uppercase leading-[1.05] tracking-tight">
              Curated Developments
            </h2>
          </div>
          <p className="font-hanken text-white/60 max-w-md text-sm md:text-base leading-relaxed">
            Every development is engineered as a signature landmark, setting new benchmarks for engineering rigor, luxury, and lasting value.
          </p>
        </div>

        {/* Projects Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">
          {projects.map((project, idx) => (
            <div
              key={project.id}
              className="group flex flex-col bg-[#584738] border border-white/10 overflow-hidden hover:border-brand-gold/50 transition-colors duration-500"
            >
              {/* Image Container */}
              <div className="relative aspect-[16/10] w-full overflow-hidden bg-[#584738]">
                <Image
                  src={project.image}
                  alt={project.title}
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#584738] via-transparent to-transparent opacity-80" />
                <div className="absolute top-5 left-5 bg-[#584738]/70 backdrop-blur-md px-3.5 py-1.5 border border-white/15 text-[10px] font-grotesk uppercase tracking-[0.2em] text-brand-gold font-semibold">
                  {project.category}
                </div>
              </div>

              {/* Content */}
              <div className="p-8 md:p-10 flex flex-col justify-between flex-1">
                <div>
                  <div className="flex items-center gap-2 text-white/50 text-xs font-grotesk uppercase tracking-wider mb-2">
                    <MapPin className="w-3.5 h-3.5 text-brand-gold" />
                    <span>{project.location}</span>
                  </div>
                  <h3 className="text-2xl md:text-3xl font-grotesk uppercase tracking-tight text-white mb-4">
                    {project.title}
                  </h3>
                  <p className="font-hanken text-sm text-white/65 leading-relaxed mb-8">
                    {project.description}
                  </p>

                  {/* Specs */}
                  <div className="grid grid-cols-2 gap-4 py-4 border-y border-white/10 mb-8">
                    {project.stats.map((s, i) => (
                      <div key={i}>
                        <div className="text-[10px] uppercase font-grotesk tracking-[0.2em] text-white/40">
                          {s.label}
                        </div>
                        <div className="text-sm font-semibold font-grotesk text-white mt-1">
                          {s.value}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Action Link */}
                <Link
                  href={project.href}
                  className="inline-flex items-center gap-3 font-grotesk text-xs uppercase tracking-[0.2em] font-semibold text-brand-gold group-hover:text-white transition-colors"
                >
                  <span>Explore Project</span>
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
