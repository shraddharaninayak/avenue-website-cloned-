"use client";

import { useEffect, useRef, useState } from "react";
import { directors, getProject } from "@/data/avenue";
import { ABOUT_PARAGRAPHS } from "./AvenuePortrait";
import { clamp01, prefersReducedMotion, revealClass, useReveal } from "./motion";

/**
 * 08 — Process. How The Avenue approaches a development.
 *
 * The company has not published a formal process, so this is assembled only
 * from what it has published about how it works, and each stage shows the
 * words it rests on and where they come from:
 *
 *   Understand  "we understand the evolving needs of our clients" (About)
 *   Plan        a director's stated responsibility: financial planning
 *   Design      Aura's published description of its planned layout
 *   Deliver     a founding director's stated responsibility: execution
 *
 * A stage whose source text is missing is dropped rather than paraphrased.
 *
 * Desktop pins the section and steps through the stages with the scroll;
 * smaller screens list them.
 */

const about = ABOUT_PARAGRAPHS.join(" ");
const quote = (source: string | undefined, fragment: string) =>
  source && source.includes(fragment) ? fragment : null;

const finance = directors.find((d) => /financ/i.test(d.role));
const execution = directors.find((d) => /execution/i.test(d.role));
const aura = getProject("aura");

type Stage = {
  title: string;
  text: string;
  source: string;
  /** A still from The Avenue's own film (public/avenue-intro.mp4.mp4). */
  image: string;
  alt: string;
  caption: string;
  /** What to keep in view when the frame is wider than the still. */
  position: string;
};

const STAGES: Stage[] = [
  {
    title: "Understand",
    text: quote(about, "At The Avenue, we understand the evolving needs of our clients.") ?? "",
    source: "From our story",
    // Film, 136.7s.
    image: "/home-sections/process-cafe.webp",
    alt: "The Milestone café at sunset: a long work table, the counter, and glass walls open to the city",
    caption: "Milestone · Café",
    position: "50% 45%",
  },
  {
    title: "Plan",
    text: finance?.role ?? "",
    source: finance ? `${finance.name} · ${finance.qualification}` : "",
    // Film, 70.9s.
    image: "/home-sections/process-podium.webp",
    alt: "Looking down a Milestone tower to the pool, lawn and pavilions laid out on its podium",
    caption: "Milestone · The podium, from above",
    position: "50% 50%",
  },
  {
    title: "Design",
    text:
      quote(
        aura?.description,
        "A micro-level planned layout designed to meet multinational standards, with flexible floor plates for interior planning and specifications based on global health and safety requirements.",
      ) ?? "",
    source: aura ? `The Avenue ${aura.name}` : "",
    // Film, 124.5s.
    image: "/home-sections/process-yoga-studio.webp",
    alt: "The Milestone yoga studio: rows of mats before a lotus screen, within glass walls over the city",
    caption: "Milestone · Yoga studio",
    position: "50% 42%",
  },
  {
    title: "Deliver",
    text: execution?.role ?? "",
    source: execution ? `${execution.name} · ${execution.qualification}` : "",
    // Film, 113.8s. Weighted up, so the rooftop gardens stay in view.
    image: "/home-sections/process-towers.webp",
    alt: "The two Milestone towers with their rooftop gardens, at golden hour",
    caption: "Milestone · The towers",
    position: "50% 22%",
  },
].filter((stage) => stage.text && stage.source);

const pad = (n: number) => String(n).padStart(2, "0");

/** The section heading; only one copy carries the id the section is labelled by. */
function Heading({ labelled = false }: { labelled?: boolean }) {
  return (
    <div>
      <div className="mb-8 flex items-center gap-4 md:mb-10 lg:[@media(max-height:760px)]:mb-5">
        <span className="text-[10px] uppercase tracking-[0.28em] text-[#2D3A1F]/55">Process</span>
      </div>
      <h2
        id={labelled ? "process-title" : undefined}
        className="font-serif text-[clamp(40px,4.8vw,76px)] font-light leading-[0.96] tracking-[-0.05em] lg:[@media(max-height:760px)]:text-[44px]"
      >
        How we <em className="italic text-brand-bronze">approach</em>
        <br />a development.
      </h2>
    </div>
  );
}

/** Desktop: pinned, one stage at a time. */
function PinnedProcess() {
  const trackRef = useRef<HTMLDivElement>(null);
  const railRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const [active, setActive] = useState(0);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    const reduce = prefersReducedMotion();
    let raf: number | null = null;
    let target = 0;
    let current = 0;

    const apply = (p: number) => {
      const n = STAGES.length;
      const f = p * n;
      setActive((prev) => {
        const next = Math.min(n - 1, Math.floor(f));
        return prev === next ? prev : next;
      });
      railRefs.current.forEach((bar, i) => {
        if (bar) bar.style.transform = `scaleX(${clamp01(f - i).toFixed(3)})`;
      });
    };
    const tick = () => {
      raf = null;
      const diff = target - current;
      current = reduce || Math.abs(diff) < 0.0005 ? target : current + diff * 0.14;
      apply(current);
      if (current !== target) raf = requestAnimationFrame(tick);
    };
    const read = () => {
      const total = track.offsetHeight - window.innerHeight;
      target = total > 0 ? clamp01(-track.getBoundingClientRect().top / total) : 0;
      if (raf === null) raf = requestAnimationFrame(tick);
    };
    read();
    current = target;
    apply(current);
    window.addEventListener("scroll", read, { passive: true });
    window.addEventListener("resize", read);
    return () => {
      window.removeEventListener("scroll", read);
      window.removeEventListener("resize", read);
      if (raf !== null) cancelAnimationFrame(raf);
    };
  }, []);

  return (
    // One screen plus 42vh of scroll per stage.
    <div ref={trackRef} className="relative" style={{ height: `${100 + STAGES.length * 42}vh` }}>
      {/* Content is centred in the space below the fixed header; short screens get tighter spacing. */}
      <div className="sticky top-0 flex h-screen flex-col justify-center overflow-hidden pt-[88px]">
        <div className="mx-auto w-full max-w-[1450px] px-12">
          <div className="grid grid-cols-12 items-end gap-x-12">
            <div className="col-span-7">
              <Heading labelled />
            </div>
            {/* Stage rail: where the visitor is, and what comes next. */}
            <ol className="col-span-5 grid grid-flow-col gap-x-6 pb-2" aria-label="Stages">
              {STAGES.map((stage, i) => (
                <li key={stage.title} className="min-w-0">
                  <span className="relative block h-px overflow-hidden bg-black/15">
                    <span
                      ref={(el) => {
                        railRefs.current[i] = el;
                      }}
                      className="absolute inset-0 origin-left bg-brand-bronze"
                      style={{ transform: "scaleX(0)" }}
                    />
                  </span>
                  <span
                    className={`mt-3 block truncate text-[10px] uppercase tracking-[0.22em] transition-colors duration-500 ${
                      i === active ? "text-[#2D3A1F]" : "text-[#5F684F]"
                    }`}
                  >
                    {stage.title}
                  </span>
                </li>
              ))}
            </ol>
          </div>

          <div className="mt-12 grid grid-cols-12 gap-x-12 xl:mt-16 [@media(max-height:760px)]:mt-6">
            {/* TEXT — stacked, one visible at a time */}
            <div className="relative col-span-5 min-h-[300px]">
              {STAGES.map((stage, i) => {
                const state = i === active ? "in" : i < active ? "past" : "next";
                return (
                  <div
                    key={stage.title}
                    aria-hidden={i !== active}
                    className={`absolute inset-0 transition-[opacity,transform] duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none ${
                      state === "in"
                        ? "translate-y-0 opacity-100"
                        : state === "past"
                          ? "pointer-events-none -translate-y-6 opacity-0"
                          : "pointer-events-none translate-y-6 opacity-0"
                    }`}
                  >
                    <h3 className="font-serif text-[clamp(36px,3.6vw,56px)] font-light leading-[1] tracking-[-0.04em]">
                      {stage.title}
                    </h3>
                    <blockquote className="mt-5 max-w-[440px]">
                      <p className="text-[15px] leading-[1.75] text-[#5F684F] md:text-[16px]">{stage.text}</p>
                      <footer className="mt-3 text-[10px] uppercase tracking-[0.22em] text-[#5F684F]">{stage.source}</footer>
                    </blockquote>
                  </div>
                );
              })}
            </div>

            {/* IMAGE — each stage wipes in from the left over the last */}
            <figure className="col-span-7">
              <div className="relative aspect-[16/9] max-h-[50vh] w-full overflow-hidden bg-[#F4F1E8] [@media(max-height:760px)]:max-h-[40vh]">
                {STAGES.map((stage, i) => (
                  <div
                    key={stage.title}
                    className="absolute inset-0 transition-[clip-path] duration-[1000ms] ease-[cubic-bezier(0.65,0,0.35,1)] motion-reduce:transition-none"
                    style={{ clipPath: i <= active ? "inset(0% 0% 0% 0%)" : "inset(0% 100% 0% 0%)", zIndex: i + 1 }}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={stage.image}
                      alt={i === active ? stage.alt : ""}
                      aria-hidden={i !== active}
                      loading="lazy"
                      decoding="async"
                      className={`absolute inset-0 h-full w-full object-cover transition-transform duration-[1400ms] ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none ${
                        i === active ? "scale-100" : "scale-[1.05]"
                      }`}
                      style={{ objectPosition: stage.position }}
                    />
                  </div>
                ))}
              </div>
              <figcaption className="mt-4 flex items-center justify-between text-[10px] uppercase tracking-[0.22em] text-[#5F684F]">
                <span>{STAGES[active]?.caption}</span>
                <span>
                  <span className="text-[#2D3A1F]">{pad(active + 1)}</span> / {pad(STAGES.length)}
                </span>
              </figcaption>
            </figure>
          </div>
        </div>
      </div>
    </div>
  );
}

function StackedStage({ stage, index }: { stage: Stage; index: number }) {
  const [ref, visible] = useReveal<HTMLLIElement>(0.2);
  return (
    <li ref={ref} className="border-t border-black/15 py-10 md:py-12">
      <div className={`relative aspect-[16/9] w-full overflow-hidden bg-[#F4F1E8] ${revealClass(visible)}`}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={stage.image}
          alt={stage.alt}
          loading="lazy"
          decoding="async"
          className="absolute inset-0 h-full w-full object-cover"
          style={{ objectPosition: stage.position }}
        />
      </div>
      <div className={`mt-7 ${revealClass(visible, "delay-150")}`}>
        <div>
          <h3 className="font-serif text-[32px] font-light leading-[1] tracking-[-0.04em] md:text-[40px]">{stage.title}</h3>
          <blockquote className="mt-4">
            <p className="text-[15px] leading-[1.75] text-[#5F684F] md:text-[16px]">{stage.text}</p>
            <footer className="mt-3 text-[10px] uppercase tracking-[0.22em] text-[#5F684F]">{stage.source}</footer>
          </blockquote>
        </div>
      </div>
    </li>
  );
}

export default function AvenueProcess() {
  const [headRef, headIn] = useReveal<HTMLDivElement>(0.3);

  return (
    <section id="process" aria-labelledby="process-title" className="bg-[#F4F1E8] text-[#2D3A1F]">
      {/* Desktop */}
      <div className="hidden lg:block">
        <PinnedProcess />
      </div>

      {/* Tablet and phone */}
      <div className="mx-auto max-w-[1450px] px-6 pb-24 pt-24 md:px-10 md:pb-28 md:pt-32 lg:hidden">
        <div ref={headRef} className={revealClass(headIn)}>
          <Heading />
        </div>
        <ol className="mt-12 border-b border-black/15">
          {STAGES.map((stage, i) => (
            <StackedStage key={stage.title} stage={stage} index={i} />
          ))}
        </ol>
      </div>
    </section>
  );
}
