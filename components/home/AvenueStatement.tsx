"use client";

import { useRef } from "react";
import { company } from "@/data/avenue";
import { lerp, revealClass, useReveal, useViewportProgress } from "./motion";

/**
 * 05 — Brand statement. The emotional reset between Leadership and
 * Capabilities.
 *
 * The line is the opening sentence of the company's published values
 * (company.values), shown only if it is still there word for word. The image
 * is a still from The Avenue's own film (156.2s): Milestone's rooftop lawn at
 * sunset — living beyond the home itself. Its garden and horizon sit in the
 * upper half, clear of the type. It continues out of Leadership's dark panel,
 * then lifts away from the cream page on rounded corners, as the hero does.
 */

const STATEMENT = "We deliver beyond residential properties.";
const statement = (company.values ?? "").includes(STATEMENT) ? STATEMENT : null;

export default function AvenueStatement() {
  const bandRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const lineRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const [textRef, textIn] = useReveal<HTMLDivElement>(0.3);

  useViewportProgress(bandRef, (p) => {
    if (imgRef.current) {
      imgRef.current.style.transform = `translate3d(0, ${lerp(-5, 5, p).toFixed(3)}%, 0)`;
    }
    // The two lines drift a little apart as the band passes.
    const drift = [lerp(1.6, -1.2, p), lerp(-1.4, 1.6, p)];
    lineRefs.current.forEach((line, i) => {
      if (line) line.style.transform = `translate3d(${drift[i].toFixed(3)}vw, 0, 0)`;
    });
  });

  if (!statement) return null;

  return (
    <section aria-labelledby="statement-title" className="bg-[#f3f0eb]">
      <div
        ref={bandRef}
        className="relative isolate h-[clamp(480px,86vh,840px)] overflow-hidden rounded-b-[24px] bg-[#0c0a09] text-white md:rounded-b-[44px]"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          ref={imgRef}
          src="/home-sections/statement-terrace.webp"
          alt="The rooftop lawn at The Avenue Milestone at sunset, its garden against the hills — from the Milestone film"
          loading="lazy"
          decoding="async"
          className="absolute inset-x-0 -top-[6%] -z-10 h-[112%] w-full max-w-none object-cover object-[45%_50%] will-change-transform"
        />
        {/* Rises out of Leadership's panel above, and settles the type below. */}
        <div aria-hidden="true" className="absolute inset-x-0 top-0 -z-10 h-40 bg-gradient-to-b from-[#0c0a09] to-transparent" />
        <div
          aria-hidden="true"
          className="absolute inset-0 -z-10 bg-[linear-gradient(to_top,rgba(12,10,9,0.78)_0%,rgba(12,10,9,0.28)_42%,rgba(12,10,9,0)_70%)]"
        />

        <div className="mx-auto flex h-full max-w-[1450px] flex-col justify-between px-6 pb-12 pt-16 md:px-10 md:pb-16 md:pt-20 lg:px-12">
          <div className="flex items-center justify-between gap-6 text-[10px] uppercase tracking-[0.24em] text-white/55">
            <span className="flex items-center gap-4">
              <span>{company.shortName}</span>
            </span>
            <span className="hidden sm:block">
              {company.location} · Since {company.established}
            </span>
          </div>

          <div ref={textRef}>
            <p className={`mb-6 text-[10px] uppercase tracking-[0.26em] text-brand-gold/85 md:mb-8 ${revealClass(textIn)}`}>
              From our values
            </p>
            <h2
              id="statement-title"
              className="font-grotesk text-[clamp(38px,6vw,96px)] font-normal uppercase leading-[0.98] tracking-[-0.02em]"
            >
              <span className="block overflow-hidden pb-[0.05em]">
                <span
                  className={`block transition-[opacity,transform] duration-[1200ms] ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none ${
                    textIn ? "translate-y-0 opacity-100" : "motion-safe:translate-y-full motion-safe:opacity-0"
                  }`}
                >
                  <span
                    ref={(el) => {
                      lineRefs.current[0] = el;
                    }}
                    className="block will-change-transform"
                  >
                    We deliver
                  </span>
                </span>
              </span>
              <span className="block overflow-hidden pb-[0.08em]">
                <span
                  className={`block transition-[opacity,transform] delay-150 duration-[1200ms] ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none ${
                    textIn ? "translate-y-0 opacity-100" : "motion-safe:translate-y-full motion-safe:opacity-0"
                  }`}
                >
                  <span
                    ref={(el) => {
                      lineRefs.current[1] = el;
                    }}
                    className="block font-serif font-light normal-case italic tracking-[-0.035em] text-[#f1d4a6] will-change-transform"
                  >
                    beyond residential properties.
                  </span>
                </span>
              </span>
            </h2>
            <div
              className={`mt-8 flex flex-wrap items-center justify-between gap-4 border-t border-white/20 pt-5 text-[10px] uppercase tracking-[0.22em] text-white/55 md:mt-10 ${revealClass(
                textIn,
                "delay-300",
              )}`}
            >
              <span>{company.name}</span>
              <span className="hidden md:block">Residential · Commercial · Industrial</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
