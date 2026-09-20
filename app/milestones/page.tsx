"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { ENQUIRE_HREF, milestoneHeadings, milestones } from "@/data/avenue";

/**
 * The Avenue journey.
 *
 * Where the hero's "Explore Flagship" now leads. Every name and both headings
 * are transcribed from tabd.in; each mark is that project's own wordmark,
 * captured from the official site.
 *
 * The official site publishes no years and no per-milestone copy, so none is
 * shown — the page is composed around what actually exists (a numbered
 * sequence of identity marks) rather than around a timeline it cannot fill.
 *
 * The marks are artwork on white, so each sits on a light plate. Reveal uses
 * the same IntersectionObserver idiom as the rest of the site.
 */
export default function MilestonesPage() {
  const [shown, setShown] = useState<boolean[]>(() => milestones.map(() => false));
  const itemRefs = useRef<(HTMLLIElement | null)[]>([]);

  useEffect(() => {
    const observers = itemRefs.current.map((el, i) => {
      if (!el) return null;
      const io = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setShown((prev) => {
              if (prev[i]) return prev;
              const next = [...prev];
              next[i] = true;
              return next;
            });
            io.disconnect();
          }
        },
        { threshold: 0.25 },
      );
      io.observe(el);
      return io;
    });
    return () => observers.forEach((io) => io?.disconnect());
  }, []);

  return (
    <div className="bg-[#0c0a09] text-white">
      {/* ===================== HEADER ===================== */}
      <section className="px-6 pb-16 pt-[136px] md:px-10 md:pb-20 md:pt-[168px] lg:px-12">
        <div className="mx-auto max-w-[1450px]">
          <Link
            href="/"
            className="group inline-flex items-center gap-3 text-[10px] uppercase tracking-[0.24em] text-white/45 transition-colors hover:text-white"
          >
            <ArrowLeft className="h-3.5 w-3.5 transition-transform duration-500 group-hover:-translate-x-1" />
            <span>Back</span>
          </Link>

          <div className="mt-12 flex items-center gap-4">
            <span className="text-[10px] uppercase tracking-[0.28em] text-white/45">
              {milestoneHeadings.eyebrow}
            </span>
          </div>

          <h1 className="mt-7 max-w-[820px] font-serif text-[clamp(38px,5.6vw,76px)] font-light leading-[0.98] tracking-[-0.045em]">
            {milestoneHeadings.title}
          </h1>

          <p className="mt-8 max-w-[640px] text-[15px] leading-[1.8] text-white/55 md:text-[16px]">
            {milestoneHeadings.statement}
          </p>

          <div className="mt-10 flex items-center gap-4 text-[10px] uppercase tracking-[0.22em] text-white/35">
            <span>{String(milestones.length).padStart(2, "0")} developments</span>
            <span className="h-px w-8 bg-white/20" />
            <span>Nashik</span>
          </div>
        </div>
      </section>

      {/* ===================== THE JOURNEY ===================== */}
      <section className="px-6 pb-24 md:px-10 md:pb-32 lg:px-12">
        <ul className="mx-auto grid max-w-[1450px] grid-cols-1 gap-x-8 gap-y-12 border-t border-white/10 pt-12 sm:grid-cols-2 lg:grid-cols-3 lg:gap-x-12 lg:gap-y-16">
          {milestones.map((m, i) => {
            const visible = shown[i];
            return (
              <li
                key={m.title}
                ref={(el) => {
                  itemRefs.current[i] = el;
                }}
                style={{
                  opacity: visible ? 1 : 0,
                  transform: visible ? "translateY(0)" : "translateY(28px)",
                  transition: `opacity 0.9s ease ${(i % 3) * 0.09}s, transform 1s cubic-bezier(0.22,1,0.36,1) ${
                    (i % 3) * 0.09
                  }s`,
                }}
              >
                <div className="flex items-baseline gap-4">
                  <span className="text-[10px] tracking-[0.2em] text-brand-gold">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="h-px flex-1 bg-white/12" />
                </div>

                {/* The marks are artwork on white, so they sit on a light plate. */}
                <div className="mt-5 flex aspect-[4/3] w-full items-center justify-center overflow-hidden bg-[#f3f0eb] p-8 md:p-10">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={m.image ?? ""}
                    alt={m.title}
                    className="max-h-full max-w-full object-contain"
                    loading="lazy"
                  />
                </div>

                <h2 className="mt-5 font-serif text-[22px] font-light leading-[1.15] tracking-[-0.025em] md:text-[25px]">
                  {m.title}
                </h2>

                {/* year and description stay out until the client supplies them */}
                {m.year !== null ? (
                  <p className="mt-2 text-[11px] uppercase tracking-[0.22em] text-white/45">
                    {m.year}
                  </p>
                ) : null}
                {m.description ? (
                  <p className="mt-3 max-w-[320px] text-[14px] leading-[1.65] text-white/50">
                    {m.description}
                  </p>
                ) : null}
              </li>
            );
          })}
        </ul>
      </section>

      {/* ===================== CTA ===================== */}
      <section className="border-t border-white/10 px-6 py-20 md:px-10 md:py-24 lg:px-12">
        <div className="mx-auto flex max-w-[1450px] flex-col items-start justify-between gap-8 md:flex-row md:items-center">
          <h2 className="max-w-[520px] font-serif text-[clamp(26px,3.2vw,44px)] font-light leading-[1.06] tracking-[-0.035em]">
            Continue the journey with us.
          </h2>

          <Link
            href={ENQUIRE_HREF}
            className="group inline-flex shrink-0 items-center gap-3 border border-white/25 px-9 py-4 font-grotesk text-[11px] font-semibold uppercase tracking-[0.25em] text-white transition-colors duration-300 hover:border-brand-gold hover:text-brand-gold"
          >
            <span>Enquire</span>
            <ArrowRight className="h-4 w-4 transition-transform duration-500 group-hover:translate-x-1.5" />
          </Link>
        </div>
      </section>
    </div>
  );
}
