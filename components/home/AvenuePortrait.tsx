"use client";

import { useRef } from "react";
import { company, getProject } from "@/data/avenue";
import { lerp, revealClass, useReveal, useViewportProgress } from "./motion";

/**
 * 02 — Portrait. Who The Avenue is.
 *
 * All copy is the existing About content (the official site's "about"
 * text, as it appeared in AvenueAbout), recomposed as an editorial profile:
 * the statement and the company's own words on the left, one large image of
 * an Avenue development on the right, revealed through a mask and drifting
 * slowly against the scroll.
 */

/** The official "about" text, verbatim, in the two paragraphs it divides into. */
export const ABOUT_PARAGRAPHS = [
  "Welcome to The Avenue, your premier property development and trading company in Nashik. Since our establishment in 2007, we have built a reputation for excellence in delivering exceptional projects. With a diverse portfolio of residential, commercial, and industrial developments, we are recognized as a top-tier developer in the industry.",
  "At The Avenue, we understand the evolving needs of our clients. Our dedicated team stays informed about the latest trends and products in the international market, allowing us to meet the high demands of the local market with innovative solutions. With over a century of combined experience in property development and investment, our principals and executive team bring a wealth of expertise to the table.",
] as const;

const FACTS = [
  { label: "Established", value: String(company.established) },
  { label: "Based in", value: company.location },
  { label: "Portfolio", value: "Residential · Commercial · Industrial" },
] as const;

const aura = getProject("aura");

export default function AvenuePortrait() {
  const [headRef, headIn] = useReveal<HTMLDivElement>(0.3);
  const [textRef, textIn] = useReveal<HTMLDivElement>(0.15);
  // Observed on the unclipped <figure>: an element clipped to nothing never
  // registers as intersecting.
  const [figureRef, figureIn] = useReveal<HTMLElement>(0.12);
  const imgRef = useRef<HTMLImageElement>(null);

  useViewportProgress(figureRef, (p) => {
    if (imgRef.current) {
      imgRef.current.style.transform = `translate3d(0, ${lerp(6, -6, p).toFixed(3)}%, 0)`;
    }
  });

  return (
    <section
      id="portrait"
      aria-labelledby="portrait-title"
      className="relative bg-[#f3f0eb] pb-20 pt-24 text-[#171717] md:pb-24 md:pt-32 lg:pb-28 lg:pt-36"
    >
      <div className="mx-auto max-w-[1450px] px-6 md:px-10 lg:px-12">
        <div className="grid gap-y-14 lg:grid-cols-12 lg:gap-x-12">
          {/* ================= TEXT ================= */}
          <div className="lg:col-span-6">
            <div ref={headRef} className={revealClass(headIn)}>
              <div className="mb-8 flex items-center gap-4 md:mb-10">
                <span className="font-grotesk text-[11px] tracking-[0.2em] text-brand-bronze">02</span>
                <span className="h-px w-10 bg-black/35" />
                <span className="text-[10px] uppercase tracking-[0.28em] text-black/55">Portrait</span>
              </div>
              <h2
                id="portrait-title"
                className="font-serif text-[clamp(44px,6.2vw,96px)] font-light leading-[0.94] tracking-[-0.05em]"
              >
                A developer
                <br />
                <em className="italic text-brand-bronze">shaped by Nashik.</em>
              </h2>
            </div>

            <div ref={textRef} className="mt-12 md:mt-14 lg:max-w-[560px]">
              <p
                className={`font-serif text-[clamp(22px,2.2vw,32px)] font-light leading-[1.22] tracking-[-0.025em] ${revealClass(textIn)}`}
              >
                Excellence in property development and investment across Nashik since {company.established}.
              </p>

              {ABOUT_PARAGRAPHS.map((para, i) => (
                <p
                  key={i}
                  className={`mt-6 text-[15px] leading-[1.8] text-[#555960] md:text-[16px] ${revealClass(
                    textIn,
                    i === 0 ? "delay-150" : "delay-300",
                  )}`}
                >
                  {para}
                </p>
              ))}

              <dl
                className={`mt-12 grid grid-cols-2 gap-x-8 gap-y-8 border-t border-black/15 pt-8 sm:grid-cols-3 ${revealClass(
                  textIn,
                  "delay-500",
                )}`}
              >
                {FACTS.map((fact) => (
                  <div key={fact.label} className={fact.label === "Portfolio" ? "col-span-2 sm:col-span-1" : ""}>
                    <dt className="text-[10px] uppercase tracking-[0.22em] text-[#8a867e]">{fact.label}</dt>
                    <dd
                      className={
                        fact.label === "Portfolio"
                          ? "mt-3 text-[14px] leading-[1.55] text-[#555960]"
                          : "mt-3 font-serif text-[30px] font-light leading-none tracking-[-0.03em]"
                      }
                    >
                      {fact.value}
                    </dd>
                  </div>
                ))}
              </dl>
            </div>
          </div>

          {/* ================= IMAGE ================= */}
          <figure ref={figureRef} className="lg:col-span-5 lg:col-start-8 lg:pt-10">
            <div
              className={`relative aspect-[4/5] w-full overflow-hidden bg-[#e6e2db] transition-[clip-path] duration-[1400ms] ease-[cubic-bezier(0.65,0,0.35,1)] motion-reduce:transition-none ${
                figureIn ? "[clip-path:inset(0_0_0_0)]" : "motion-safe:[clip-path:inset(100%_0_0_0)]"
              }`}
            >
              <div
                className={`absolute inset-0 transition-transform duration-[1800ms] ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none ${
                  figureIn ? "scale-100" : "motion-safe:scale-[1.12]"
                }`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  ref={imgRef}
                  src="/avenue-about-main.jpg.webp"
                  alt={aura ? `The Avenue ${aura.name}` : "An Avenue development"}
                  loading="lazy"
                  decoding="async"
                  className="absolute inset-x-0 -top-[7%] h-[114%] w-full max-w-none object-cover will-change-transform"
                />
              </div>
            </div>
            {aura ? (
              <figcaption
                className={`mt-4 flex items-center justify-between gap-6 text-[10px] uppercase tracking-[0.22em] text-[#8a867e] ${revealClass(
                  figureIn,
                  "delay-700",
                )}`}
              >
                <span>The Avenue {aura.name}</span>
                <span>{aura.locality}</span>
              </figcaption>
            ) : null}
          </figure>
        </div>
      </div>
    </section>
  );
}
