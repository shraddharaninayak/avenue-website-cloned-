import React from "react";
import Image from "next/image";

const leaders = [
  {
    name: "Shravan Kukreja",
    role: "Managing Director",
    image: "/team/shravan-2026.webp",
    quote: "Our mission has always been clear: to build spaces that not only redefine cityscapes, but stand as generational benchmarks of design and structural integrity.",
  },
  {
    name: "Vicky Kukreja",
    role: "Director",
    image: "/team/vicky-2026.webp",
    quote: "Every project is a commitment to uncompromising craftsmanship. We obsess over the finest architectural details to elevate the way people live and work.",
  },
];

export default function Leadership() {
  return (
    <section
      id="leadership"
      className="scroll-mt-24 bg-[#0c0a09] py-32 px-6 md:px-12 lg:px-20 text-white"
    >
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-20 gap-8">
          <div>
            <div className="text-[11px] font-grotesk uppercase tracking-[0.3em] text-brand-gold font-semibold mb-3">
              Leadership
            </div>
            <h2 className="text-4xl sm:text-5xl font-grotesk font-normal uppercase leading-[1.05] tracking-tight">
              Vision That Leads Growth
            </h2>
          </div>
          <p className="font-hanken text-white/60 max-w-md text-sm md:text-base leading-relaxed">
            Guided by forward-looking leadership and deep architectural discipline, shaping landmark developments that withstand the test of time.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-16">
          {leaders.map((leader, i) => (
            <div
              key={i}
              className="bg-[#14110c] border border-white/10 p-8 md:p-10 flex flex-col justify-between group hover:border-brand-gold/40 transition-colors duration-500"
            >
              <div className="relative aspect-[4/5] w-full mb-8 overflow-hidden bg-black/40">
                <Image
                  src={leader.image}
                  alt={leader.name}
                  fill
                  className="object-cover object-top transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#14110c] via-transparent to-transparent opacity-60" />
              </div>

              <div>
                <blockquote className="font-cormorant italic text-lg md:text-xl text-white/90 leading-relaxed mb-6 border-l-2 border-brand-gold pl-4">
                  "{leader.quote}"
                </blockquote>

                <div className="pt-4 border-t border-white/10">
                  <h3 className="font-grotesk text-xl uppercase tracking-tight text-white font-normal">
                    {leader.name}
                  </h3>
                  <div className="font-grotesk text-xs uppercase tracking-[0.2em] text-brand-gold mt-1 font-semibold">
                    {leader.role}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
