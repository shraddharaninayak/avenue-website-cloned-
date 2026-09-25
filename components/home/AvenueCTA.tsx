"use client";

import { useRef } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { ENQUIRE_HREF, company } from "@/data/avenue";
import { lerp, revealClass, smoothstep, useReveal, useViewportProgress } from "./motion";

/**
 * 09 — Call to action. The close of the homepage, and its conversion point.
 *
 * The words and the action are the site's existing ones, from the homepage
 * CTA it replaces (ContactCTA, still used by /our-story): "Begin Your
 * Journey", "Experience Landmark Living in Nashik", the advisors line, and
 * "Schedule Private Tour" to the enquiry route. One button; the phone number
 * is offered as a line of text rather than a second one.
 *
 * The image is the Milestone entrance at dusk — the arrival that the hero's
 * approach to the towers leads to. The panel rises from the cream page on
 * rounded corners, like the other dark panels, and runs straight on into
 * the footer.
 */

const HEADING: { text: string; em?: boolean }[][] = [
  [{ text: "Experience" }],
  [{ text: "landmark living", em: true }],
  [{ text: "in Nashik." }],
];

export default function AvenueCTA() {
  const panelRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const [textRef, textIn] = useReveal<HTMLDivElement>(0.3);

  useViewportProgress(panelRef, (p) => {
    const panel = panelRef.current;
    if (panel) {
      const inset = (1 - smoothstep(0, 0.3, p)) * 3;
      const r = window.innerWidth < 768 ? 24 : 44;
      panel.style.clipPath = `inset(0% ${inset.toFixed(2)}% 0% ${inset.toFixed(2)}% round ${r}px ${r}px 0px 0px)`;
    }
    if (imgRef.current) {
      imgRef.current.style.transform = `translate3d(0, ${lerp(-4, 4, p).toFixed(3)}%, 0)`;
    }
  });

  return (
    // The cream above is the breathing space after Process.
    <section aria-labelledby="cta-title" className="bg-[#F1EADA] pt-24 md:pt-32">
      <div
        ref={panelRef}
        className="relative isolate overflow-hidden bg-[#584738] text-white"
        style={{ clipPath: "inset(0% 3% 0% 3% round 44px 44px 0px 0px)" }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          ref={imgRef}
          src="/home-sections/cta-entrance.webp"
          alt="The Avenue Milestone entrance and shopfronts at dusk"
          loading="lazy"
          decoding="async"
          className="absolute inset-x-0 -top-[5%] -z-10 h-[110%] w-full max-w-none object-cover object-[64%_50%] will-change-transform"
        />
        {/* Text side, and a fade into the footer below. */}
        <div
          aria-hidden="true"
          className="absolute inset-0 -z-10 bg-[linear-gradient(to_right,rgba(88,71,56,0.82)_0%,rgba(88,71,56,0.55)_32%,rgba(88,71,56,0.08)_62%,rgba(88,71,56,0)_100%)]"
        />
        <div
          aria-hidden="true"
          className="absolute inset-0 -z-10 bg-[linear-gradient(to_bottom,rgba(88,71,56,0.35)_0%,rgba(88,71,56,0)_30%,rgba(88,71,56,0)_70%,rgba(88,71,56,1)_100%)]"
        />
        <div
          aria-hidden="true"
          className="absolute inset-0 -z-10 bg-[linear-gradient(to_bottom,rgba(88,71,56,0)_25%,rgba(88,71,56,0.62)_55%,rgba(88,71,56,0.8)_100%)] lg:hidden"
        />

        <div className="mx-auto flex min-h-[clamp(600px,92vh,880px)] max-w-[1450px] flex-col justify-between px-6 pb-16 pt-16 md:px-10 md:pb-20 md:pt-20 lg:px-12">
          <div className="flex items-center justify-between gap-6 text-[10px] uppercase tracking-[0.24em] text-white/60">
            <span className="flex items-center gap-4">
              <span>Begin your journey</span>
            </span>
            <span className="hidden sm:block">The Avenue Milestone · Entrance</span>
          </div>

          {/* One column, on the shaded side; the building stays clear on the right. */}
          <div ref={textRef} className="max-w-[760px]">
            <h2
              id="cta-title"
              className="font-grotesk text-[clamp(42px,6vw,96px)] font-normal uppercase leading-[0.95] tracking-[-0.02em]"
            >
              {HEADING.map((line, k) => (
                <span key={k} className="block overflow-hidden pb-[0.06em]">
                  <span
                    className={`block transition-[opacity,transform] duration-[1200ms] ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none ${
                      textIn ? "translate-y-0 opacity-100" : "motion-safe:translate-y-full motion-safe:opacity-0"
                    }`}
                    style={{ transitionDelay: `${k * 120}ms` }}
                  >
                    {line.map((part, j) =>
                      part.em ? (
                        <em key={j} className="font-serif font-light normal-case italic tracking-[-0.035em] text-[#B59E7D]">
                          {part.text}
                        </em>
                      ) : (
                        <span key={j}>{part.text}</span>
                      ),
                    )}
                  </span>
                </span>
              ))}
            </h2>

            <div className={`mt-9 max-w-[480px] md:mt-10 ${revealClass(textIn, "delay-300")}`}>
              <span aria-hidden="true" className="mb-7 block h-px w-full bg-white/25" />
              <p className="max-w-[420px] text-[15px] leading-[1.75] text-white/80 md:text-[16px]">
                Whether you are looking for a home at Urbania, Aura or Bliss, or commercial office space at Flora, our
                advisors are here to guide you.
              </p>
              <Link
                href={ENQUIRE_HREF}
                className="group mt-8 inline-flex items-center gap-3 bg-[#584738] px-8 py-4 font-grotesk text-[11px] font-semibold uppercase tracking-[0.2em] text-white transition-colors duration-300 hover:bg-brand-bronze"
              >
                <span>Schedule Private Tour</span>
                <ArrowRight className="h-4 w-4 transition-transform duration-500 group-hover:translate-x-1" />
              </Link>
              <p className="mt-6 text-[11px] uppercase tracking-[0.2em] text-white/55">
                Or call{" "}
                <a
                  href={company.phoneHref}
                  className="text-white/85 underline decoration-white/30 underline-offset-4 transition-colors duration-300 hover:text-brand-gold hover:decoration-brand-gold"
                >
                  {company.phone}
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
