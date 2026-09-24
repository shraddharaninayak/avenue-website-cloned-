"use client";

import { useEffect, useRef, useState } from "react";
import { testimonials } from "@/data/avenue";

/**
 * What Clients Say — a continuous left-to-right flow.
 *
 * The track renders the list twice and animates to exactly -50%, so the moment
 * it wraps it is already showing an identical frame: no jump, no arrows, no
 * carousel library. Duration scales with the number of cards so the speed stays
 * constant however many are in testimonials.ts.
 *
 * The clip lives on an inner wrapper with overflow-hidden, so the track can be
 * wider than the viewport without ever giving the page a horizontal scrollbar.
 *
 * It follows Leadership on the homepage, so it enters the same way Leadership
 * does — a gentle rise and fade as it comes into view — and the drift is slow
 * enough to read as calm rather than as motion for its own sake.
 */
export default function Testimonials() {
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

  if (testimonials.length === 0) return null;

  // Two copies for the seamless wrap.
  const track = [...testimonials, ...testimonials];
  const seconds = Math.max(40, testimonials.length * 15);

  // Hidden states apply only when motion is allowed, so reduced-motion
  // visitors see the section as it is, straight away.
  const reveal = (delay: string) =>
    `transition-[opacity,transform] duration-1000 ease-[cubic-bezier(0.22,1,0.36,1)] ${delay} motion-reduce:transition-none ${
      visible ? "opacity-100 translate-y-0" : "motion-safe:opacity-0 motion-safe:translate-y-6"
    }`;

  return (
    <section
      ref={sectionRef}
      id="testimonials"
      className="scroll-mt-24 overflow-hidden border-t border-white/10 bg-[#2D3A1F] py-16 text-white md:py-20"
    >
      <div className={`mx-auto max-w-[1450px] px-6 md:px-10 lg:px-12 ${reveal("")}`}>
        <div className="flex items-center gap-4">
          <span className="h-px w-10 bg-white/30" />
          <span className="text-[10px] uppercase tracking-[0.28em] text-white/45">
            Testimonials
          </span>
        </div>

        <h2 className="mt-7 max-w-[760px] font-serif text-[clamp(30px,3.6vw,52px)] font-light leading-[1.04] tracking-[-0.04em]">
          What clients say.
        </h2>
      </div>

      {/* MARQUEE */}
      <div className={`group relative mt-12 w-full overflow-hidden md:mt-14 ${reveal("delay-150")}`}>
        {/* Edge fades so cards enter and leave rather than being chopped off. */}
        <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-16 bg-gradient-to-r from-[#2D3A1F] to-transparent md:w-32" />
        <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-16 bg-gradient-to-l from-[#2D3A1F] to-transparent md:w-32" />

        <ul
          className="flex w-max animate-avenue-marquee gap-5 will-change-transform group-hover:[animation-play-state:paused] motion-reduce:animate-none md:gap-7"
          style={{ ["--marquee-duration" as string]: `${seconds}s` }}
        >
          {track.map((item, i) => (
            <li
              key={`${item.name}-${i}`}
              // The second copy is decorative; screen readers read the list once.
              aria-hidden={i >= testimonials.length}
              className="w-[300px] shrink-0 border border-white/12 bg-[#2D3A1F] p-7 transition-colors duration-500 hover:border-white/25 sm:w-[380px] md:w-[440px] md:p-9"
            >
              <span className="block font-serif text-[40px] leading-none text-brand-gold/50">
                &ldquo;
              </span>

              <blockquote className="mt-4 text-[15px] leading-[1.75] text-white/75 md:text-[16px]">
                {item.quote}
              </blockquote>

              <div className="mt-7 pt-5">
                <div className="w-full max-w-[458px] border-t border-white/50" />
                <div className="font-serif text-[19px] font-light tracking-[-0.02em]">
                  {item.name}
                </div>

                {item.project ? (
                  <div className="mt-1.5 text-[10px] uppercase tracking-[0.22em] text-white/40">
                    {item.project}
                  </div>
                ) : null}

                {typeof item.rating === "number" ? (
                  <div
                    className="mt-2 text-[11px] tracking-[0.3em] text-brand-gold"
                    aria-label={`${item.rating} out of 5`}
                  >
                    {"★".repeat(
                      Math.max(0, Math.min(5, Math.round(item.rating))),
                    )}
                  </div>
                ) : null}
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
