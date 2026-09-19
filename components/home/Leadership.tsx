"use client";

import { useEffect, useRef, useState } from "react";
import { directors, directorsHeading } from "@/data/avenue";
import { lerp, revealClass, smoothstep, useReveal, useViewportProgress } from "./motion";

/**
 * The directors of The Avenue.
 *
 * No portraits exist in the repository for these three, so each card renders a
 * composed monogram plate instead of a broken image. Drop a file into
 * public/team and set `image` below — the layout is identical either way,
 * because the plate and the photograph occupy the same 3:4 frame.
 */

const initials = (name: string) =>
  name
    .replace(/^Mr\.?\s+/i, "")
    .split(/\s+/)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

/**
 * The section as it has always been — /our-story renders this, unchanged.
 */
function ClassicLeadership() {
  const sectionRef = useRef<HTMLElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          io.disconnect();
        }
      },
      { threshold: 0.15 },
    );
    io.observe(section);
    return () => io.disconnect();
  }, []);

  return (
    <section
      ref={sectionRef}
      id="leadership"
      className="scroll-mt-24 border-t border-white/10 bg-[#0c0a09] px-6 py-24 text-white md:px-10 md:py-32 lg:px-12"
    >
      <div className="mx-auto max-w-[1450px]">
        {/* HEADING */}
        <div
          style={{
            opacity: visible ? 1 : 0,
            transform: visible ? "translateY(0)" : "translateY(24px)",
            transition: "opacity 0.9s ease, transform 1s cubic-bezier(0.22,1,0.36,1)",
          }}
        >
          <div className="mb-8 flex items-center gap-4">
            <span className="h-px w-10 bg-white/30" />
            <span className="text-[10px] uppercase tracking-[0.28em] text-white/45">
              Leadership
            </span>
          </div>

          <h2 className="max-w-[760px] font-serif text-[clamp(30px,3.6vw,52px)] font-light leading-[1.04] tracking-[-0.04em]">
            {directorsHeading}
          </h2>
        </div>

        {/* DIRECTORS */}
        <div className="mt-16 grid grid-cols-1 gap-x-10 gap-y-14 sm:grid-cols-2 md:mt-20 lg:grid-cols-3 lg:gap-x-14">
          {directors.map((director, i) => (
            <article
              key={director.name}
              style={{
                opacity: visible ? 1 : 0,
                transform: visible ? "translateY(0)" : "translateY(36px)",
                transition: `opacity 1s ease ${0.15 + i * 0.13}s, transform 1.1s cubic-bezier(0.22,1,0.36,1) ${
                  0.15 + i * 0.13
                }s`,
              }}
            >
              {/* PORTRAIT FRAME */}
              <div className="group relative aspect-[4/5] max-h-[420px] w-full overflow-hidden bg-[#14110c]">
                {director.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={director.image}
                    alt={director.name}
                    className="absolute inset-0 h-full w-full object-cover transition-transform duration-[1200ms] ease-out group-hover:scale-[1.04]"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center">
                    {/* Monogram plate, standing in until a portrait is supplied. */}
                    <div
                      className="absolute inset-0 opacity-[0.35]"
                      style={{
                        backgroundImage:
                          "repeating-linear-gradient(135deg, rgba(255,255,255,0.045) 0px, rgba(255,255,255,0.045) 1px, transparent 1px, transparent 9px)",
                      }}
                    />
                    <span className="relative font-serif text-[52px] font-light tracking-[-0.04em] text-white/20">
                      {initials(director.name)}
                    </span>
                    <span className="absolute bottom-5 left-0 right-0 text-center text-[9px] uppercase tracking-[0.24em] text-white/20">
                      Portrait to follow
                    </span>
                  </div>
                )}

                <div className="pointer-events-none absolute inset-0 border border-white/10" />
              </div>

              {/* DETAILS */}
              <div className="mt-6 flex items-start gap-5">
                <span className="mt-2 text-[10px] tracking-[0.2em] text-brand-gold">
                  {String(i + 1).padStart(2, "0")}
                </span>

                <div>
                  <h3 className="font-serif text-[24px] font-light leading-[1.15] tracking-[-0.025em] md:text-[27px]">
                    {director.name}
                  </h3>
                  <p className="mt-2 text-[11px] uppercase tracking-[0.22em] text-white/45">
                    {director.qualification}
                  </p>
                  <p className="mt-4 max-w-[280px] text-[14px] leading-[1.65] text-white/50">
                    {director.role}
                  </p>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

/**
 * The homepage's 04 — Leadership: the same directors and the same monogram
 * plates, set in the homepage's editorial system. A dark panel rises over the
 * cream page on rounded upper corners — the mirror of the hero lifting away —
 * and settles to full width as it arrives; the plates open through masks, and
 * each monogram drifts a little against the scroll.
 */
function EditorialLeadership() {
  const panelRef = useRef<HTMLDivElement>(null);
  const [headRef, headIn] = useReveal<HTMLDivElement>(0.3);
  const [gridRef, gridIn] = useReveal<HTMLDivElement>(0.12);
  const monoRefs = useRef<(HTMLSpanElement | null)[]>([]);

  useViewportProgress(panelRef, (p) => {
    const panel = panelRef.current;
    if (!panel) return;
    const inset = (1 - smoothstep(0, 0.26, p)) * 3;
    const r = window.innerWidth < 768 ? 24 : 44;
    panel.style.clipPath = `inset(0% ${inset.toFixed(2)}% 0% ${inset.toFixed(2)}% round ${r}px ${r}px 0px 0px)`;
    monoRefs.current.forEach((mono, i) => {
      if (mono) mono.style.transform = `translate3d(0, ${(lerp(16, -16, p) * (1 + i * 0.2)).toFixed(2)}px, 0)`;
    });
  });

  return (
    <section id="leadership" aria-labelledby="leadership-title" className="scroll-mt-24 bg-[#f3f0eb]">
      <div
        ref={panelRef}
        className="bg-[#0c0a09] text-white"
        style={{ clipPath: "inset(0% 3% 0% 3% round 44px 44px 0px 0px)" }}
      >
        <div className="mx-auto max-w-[1450px] px-6 pb-24 pt-24 md:px-10 md:pb-28 md:pt-32 lg:px-12">
          {/* Desktop: heading on the left, the directors on the right — the same
              split as Portrait and Values above. */}
          <div className="lg:grid lg:grid-cols-12 lg:gap-x-12">
          {/* HEADING */}
          <div ref={headRef} className={`lg:col-span-4 ${revealClass(headIn)}`}>
            <div>
              <div className="mb-8 flex items-center gap-4 md:mb-10">
                <span className="font-grotesk text-[11px] tracking-[0.2em] text-brand-gold">04</span>
                <span className="h-px w-10 bg-white/30" />
                <span className="text-[10px] uppercase tracking-[0.28em] text-white/50">Leadership</span>
              </div>
              <h2
                id="leadership-title"
                className="max-w-[820px] font-serif text-[clamp(38px,4.2vw,64px)] font-light leading-[1] tracking-[-0.045em]"
              >
                {directorsHeading}
              </h2>
            </div>
            <p className="mt-8 text-[10px] uppercase tracking-[0.24em] text-white/45 lg:mt-10">
              <span className="font-serif text-[28px] normal-case tracking-[-0.02em] text-white/85">
                {String(directors.length).padStart(2, "0")}
              </span>{" "}
              Directors
            </p>
          </div>

          {/* DIRECTORS */}
          <div ref={gridRef} className="mt-14 grid grid-cols-1 gap-y-10 sm:grid-cols-3 sm:gap-x-6 md:mt-20 lg:col-span-8 lg:mt-3 lg:gap-x-8">
            {directors.map((director, i) => (
              // Phones: a compact row, plate beside the name; wider screens: plate above.
              <article key={director.name} className="group grid grid-cols-[104px_1fr] items-start gap-5 sm:block">
                <div
                  className="relative aspect-[5/6] w-full overflow-hidden bg-[#14110c] transition-[clip-path] duration-[1300ms] ease-[cubic-bezier(0.65,0,0.35,1)] motion-reduce:transition-none"
                  style={{
                    clipPath: gridIn ? "inset(0% 0% 0% 0%)" : "inset(100% 0% 0% 0%)",
                    transitionDelay: `${i * 140}ms`,
                  }}
                >
                  {director.image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={director.image}
                      alt={director.name}
                      className="absolute inset-0 h-full w-full object-cover transition-transform duration-[1200ms] ease-out group-hover:scale-[1.04]"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center">
                      {/* Monogram plate, standing in until a portrait is supplied. */}
                      <div
                        className="absolute inset-0 opacity-[0.35] transition-opacity duration-700 group-hover:opacity-60"
                        style={{
                          backgroundImage:
                            "repeating-linear-gradient(135deg, rgba(255,255,255,0.045) 0px, rgba(255,255,255,0.045) 1px, transparent 1px, transparent 9px)",
                        }}
                      />
                      <span
                        ref={(el) => {
                          monoRefs.current[i] = el;
                        }}
                        className="relative font-serif text-[34px] font-light sm:text-[clamp(48px,6vw,96px)] tracking-[-0.04em] text-white/[0.18] transition-colors duration-700 will-change-transform group-hover:text-white/30"
                      >
                        {initials(director.name)}
                      </span>
                      <span className="absolute bottom-5 left-0 right-0 hidden text-center text-[9px] uppercase tracking-[0.24em] text-white/25 sm:block">
                        Portrait to follow
                      </span>
                    </div>
                  )}

                  <div className="pointer-events-none absolute inset-0 border border-white/10" />
                  <span className="pointer-events-none absolute inset-x-0 bottom-0 h-[2px] origin-left scale-x-0 bg-brand-gold transition-transform duration-700 ease-out group-hover:scale-x-100" />
                </div>

                <div
                  className={`flex items-start gap-5 sm:mt-6 ${revealClass(gridIn)}`}
                  style={{ transitionDelay: `${300 + i * 140}ms` }}
                >
                  <span className="mt-2 text-[10px] tracking-[0.2em] text-brand-gold">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <div>
                    <h3 className="font-serif text-[22px] font-light leading-[1.15] tracking-[-0.025em] xl:text-[25px]">
                      {director.name}
                    </h3>
                    <p className="mt-2 text-[11px] uppercase tracking-[0.22em] text-white/45">
                      {director.qualification}
                    </p>
                    <p className="mt-3 max-w-[300px] text-[14px] leading-[1.65] text-white/55 sm:mt-4">{director.role}</p>
                  </div>
                </div>
              </article>
            ))}
          </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default function Leadership({ variant = "classic" }: { variant?: "classic" | "editorial" }) {
  return variant === "editorial" ? <EditorialLeadership /> : <ClassicLeadership />;
}
