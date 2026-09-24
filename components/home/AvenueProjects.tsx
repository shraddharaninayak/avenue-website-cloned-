"use client";

import { useEffect, useRef } from "react";
import type { CSSProperties } from "react";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { projects, type Project } from "@/data/avenue";
import { projectHref } from "@/data/projectDetails";
import {
  clamp01,
  lerp,
  revealClass,
  useReveal,
  useViewportProgress,
} from "./motion";

/**
 * 07 — Projects.
 *
 * Desktop: pinned horizontal scroll (RIO-style editorial showcase).
 *
 *   Architecture:
 *     sectionRef (relative, JS height = vh + 15%vh + travel)
 *       h-[15vh] spacer  ← must equal entry = 0.15 × innerHeight in JS
 *       sticky top-0 h-screen flex-col  ← NO overflow here (sticky must not
 *         be inside an overflow:hidden ancestor)
 *         heading (shrink-0)
 *         gallery (flex-1, relative, overflow-hidden)  ← clips track within
 *           track (absolute inset-0, flex items-end, translateX'd)
 *         progress bar (shrink-0)
 *
 *   Scroll maths:
 *     p = 0  when sectionTop = −0.15 vh  (sticky just pinned, spacer scrolled off)
 *     p = 1  when sectionTop = −(0.15 vh + travel)
 *     section height = 1.15 vh + travel  →  sticky releases exactly at p = 1
 *
 *   Card heights (H.imgH) are computed against the TIGHTEST real viewport:
 *     1600 × 768 px, lg breakpoint (pt-16 heading ≈ 188 px), pb 2.5 rem.
 *     Available gallery height = 768 − 188 − 1 − 32(pt) − 40(pb) = 507 px.
 *     Bottom bar ≈ 51 px.  Safe max flex-end card = 507 − 51 = 456 px = 59.4 vh.
 *     Using 57 vh leaves an 18 px buffer at worst case.
 *
 * Mobile: clean vertical single-column.
 */

/* ── helpers ─────────────────────────────────────────────────────────────── */

const firstSentence = (text: string) => {
  const match = text.match(/^.*?[.!?](\s|$)/);
  return (match ? match[0] : text).trim();
};

const pad = (n: number) => String(n).padStart(2, "0");

/* ── layout configs ──────────────────────────────────────────────────────── */

/*
 * All desktop cards share one size.
 * imgH = 54 vh  →  at tightest real viewport (1600 × 768, lg pt-16):
 *   54 vh @ 768 px = 414 px + 51 px bottom bar = 465 px  < 507 px available ✓
 */
const CARD_W    = "28vw";
const CARD_MIN_W = "280px";
const CARD_IMG_H = "54vh";

// Only image composition and parallax differ between cards
const CARD_OBJ_POS: Record<string, string> = {
  urbania:        "38% 50%",
  flora:          "50% 40%",
  aura:           "50% 55%",
  bliss:          "50% 35%",
  aaryana:        "50% 45%",
  "viraj-avenue": "50% 50%",
};

const CARD_PARALLAX: Record<string, number> = {
  urbania:        5,
  flora:          4,
  aura:           5,
  bliss:          4,
  aaryana:        5,
  "viraj-avenue": 3,
};

// Mobile: aspect-ratio based vertical layout
const V: Record<string, { aspect: string; objPos: string; parallax: number }> =
  {
    urbania: { aspect: "aspect-[4/5]", objPos: "38% 50%", parallax: 5 },
    flora: { aspect: "aspect-[3/4]", objPos: "50% 40%", parallax: 4 },
    aura: { aspect: "aspect-[4/5]", objPos: "50% 55%", parallax: 5 },
    bliss: { aspect: "aspect-[3/4]", objPos: "50% 35%", parallax: 4 },
    aaryana: { aspect: "aspect-[4/5]", objPos: "50% 45%", parallax: 5 },
    "viraj-avenue": { aspect: "aspect-[3/4]", objPos: "50% 50%", parallax: 4 },
  };

/* ── single project card ─────────────────────────────────────────────────── */

function ProjectCard({
  project,
  containerStyle,
  containerClass,
  objectPosition,
  parallax,
}: {
  project: Project;
  containerStyle: CSSProperties;
  containerClass: string;
  objectPosition: string;
  parallax: number;
}) {
  const [ref, visible] = useReveal<HTMLDivElement>(0.06);
  const imgRef = useRef<HTMLImageElement>(null);

  useViewportProgress(ref, (p) => {
    if (imgRef.current) {
      const drift = lerp(parallax, -parallax, p);
      imgRef.current.style.transform = `translate3d(0,${drift.toFixed(3)}%,0)`;
    }
  });

  const facts = [project.configuration, project.locality].filter(
    Boolean,
  ) as string[];

  return (
    <article
      ref={ref}
      className="group"
      aria-labelledby={`proj-${project.slug}`}
    >
      <Link
        href={projectHref(project.slug)}
        className="block"
        aria-label={`Explore ${project.name}`}
      >
        {/* ── Image container ───────────────────────────────────────── */}
        <div
          className={`relative w-full overflow-hidden bg-[#F4F1E8] transition-[clip-path] duration-[1400ms] ease-[cubic-bezier(0.19,1,0.22,1)] motion-reduce:transition-none ${containerClass} ${
            visible
              ? "[clip-path:inset(0_0_0_0)]"
              : "motion-safe:[clip-path:inset(100%_0_0_0)]"
          }`}
          style={containerStyle}
        >
          {/* Image — scales + grayscale on hover */}
          <div className="absolute inset-0 transition-transform duration-[800ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.05]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              ref={imgRef}
              src={project.image}
              alt={`The Avenue ${project.name}`}
              loading="lazy"
              decoding="async"
              className="absolute inset-x-0 -top-[10%] h-[120%] w-full max-w-none object-cover will-change-transform"
              style={{ objectPosition }}
            />
          </div>

          {/* Dark overlay */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 bg-black/0 transition-[background-color] duration-[600ms] ease-out group-hover:bg-black/40"
          />

          {/* Hover text — slides up from bottom */}
          <div className="pointer-events-none absolute inset-x-0 bottom-0 flex flex-col justify-end p-6 md:p-7">
            <p className="translate-y-full font-serif text-[clamp(15px,1.3vw,21px)] font-light italic leading-[1.3] text-white/90 opacity-0 transition-all duration-[750ms] ease-[cubic-bezier(0.625,0.05,0,1)] group-hover:translate-y-0 group-hover:opacity-100">
              {project.statement}
            </p>
            <p className="mt-2 max-w-[380px] translate-y-full text-[12px] leading-[1.65] text-white/65 opacity-0 transition-all delay-[50ms] duration-[750ms] ease-[cubic-bezier(0.625,0.05,0,1)] group-hover:translate-y-0 group-hover:opacity-100">
              {firstSentence(project.description)}
            </p>
            {facts.length > 0 && (
              <p className="mt-2 translate-y-full text-[10px] uppercase tracking-[0.1em] text-white/45 opacity-0 transition-all delay-[100ms] duration-[750ms] ease-[cubic-bezier(0.625,0.05,0,1)] group-hover:translate-y-0 group-hover:opacity-100">
                {facts.join(" · ")}
              </p>
            )}
            <span className="mt-3 inline-flex w-fit translate-y-full items-center gap-2 text-[10px] font-medium uppercase tracking-[0.14em] text-brand-gold opacity-0 transition-all delay-[150ms] duration-[750ms] ease-[cubic-bezier(0.625,0.05,0,1)] group-hover:translate-y-0 group-hover:opacity-100">
              <span className="border-b border-brand-gold/50 pb-0.5">
                Explore
              </span>
              <ArrowUpRight className="h-3 w-3 transition-transform duration-500 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
            </span>
          </div>

          {/* Corner arrow */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full border border-white/25 bg-white/10 text-white opacity-0 backdrop-blur-sm transition-all duration-500 group-hover:opacity-100 md:right-5 md:top-5"
          >
            <ArrowUpRight className="h-3.5 w-3.5" strokeWidth={1.5} />
          </div>
        </div>

        {/* ── Bottom bar ────────────────────────────────────────────── */}
        <div className="relative mt-0 overflow-hidden border-b border-[#2D3A1F]/10">
          <div
            aria-hidden="true"
            className="absolute inset-0 origin-bottom scale-y-0 bg-[#2D3A1F] transition-transform duration-[1000ms] ease-[cubic-bezier(0.625,0.05,0,1)] group-hover:scale-y-100"
          />
          <div className="relative flex items-center justify-between px-1 py-3.5 md:py-4">
            <div className="flex items-center overflow-hidden">
              <div className="relative overflow-hidden">
                <h3
                  id={`proj-${project.slug}`}
                  className="text-[clamp(13px,1.2vw,18px)] font-medium tracking-[-0.015em] text-[#2D3A1F] transition-all duration-[1000ms] ease-[cubic-bezier(0.625,0.05,0,1)] group-hover:-translate-y-full group-hover:text-white"
                >
                  {project.name}
                </h3>
                <p
                  aria-hidden="true"
                  className="absolute left-0 top-0 translate-y-full text-[clamp(13px,1.2vw,18px)] font-medium tracking-[-0.015em] text-white transition-transform duration-[1000ms] ease-[cubic-bezier(0.625,0.05,0,1)] group-hover:translate-y-0"
                >
                  {project.name}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2.5">
              <span className="hidden text-[10px] uppercase tracking-[0.1em] text-[#2D3A1F]/40 transition-colors duration-[1000ms] ease-[cubic-bezier(0.625,0.05,0,1)] group-hover:text-white/40 sm:block">
                {project.category}
              </span>
              <div className="flex h-6 w-6 items-center justify-center transition-transform duration-500 group-hover:translate-x-[1px] group-hover:-translate-y-[1px]">
                <ArrowUpRight
                  className="h-3.5 w-3.5 text-[#2D3A1F]/40 transition-colors duration-[1000ms] group-hover:text-brand-gold"
                  strokeWidth={1.5}
                />
              </div>
            </div>
          </div>
        </div>
      </Link>
    </article>
  );
}

/* ── section ─────────────────────────────────────────────────────────────── */

export default function AvenueProjects() {
  const [headMobRef, headMobIn] = useReveal<HTMLDivElement>(0.25);
  const [headDeskRef, headDeskIn] = useReveal<HTMLDivElement>(0.1);

  const sectionRef = useRef<HTMLDivElement>(null);
  const trackRef   = useRef<HTMLDivElement>(null);
  const barRef     = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    const track   = trackRef.current;
    if (!section || !track) return;

    let raf: number | null = null;

    /*
     * entry = the spacer height (h-[15vh]).
     * MUST equal the h-[15vh] spacer in the JSX so that p = 0 exactly
     * when the sticky pane first pins (spacer has scrolled off-screen).
     *
     * section height = vh + entry + travel
     *   → pinned for exactly `travel` px of vertical scroll after the entry
     *   → sticky releases exactly when p = 1 (last card fully in view)
     */
    const ENTRY_RATIO = 0.15;

    const measure = () => {
      const travel = Math.max(0, track.scrollWidth - track.offsetWidth);
      const entry  = window.innerHeight * ENTRY_RATIO;
      section.style.height = `${window.innerHeight + entry + travel}px`;
    };

    const apply = () => {
      raf = null;
      const travel = Math.max(0, track.scrollWidth - track.offsetWidth);
      if (travel === 0) return;
      const entry       = window.innerHeight * ENTRY_RATIO;
      const sectionTop  = section.getBoundingClientRect().top;
      const p = clamp01((-sectionTop - entry) / travel);
      track.style.transform = `translateX(${(-travel * p).toFixed(2)}px)`;
      if (barRef.current) barRef.current.style.transform = `scaleX(${p})`;
    };

    const onScroll = () => { if (raf === null) raf = requestAnimationFrame(apply); };
    const onResize = () => { measure(); apply(); };

    const ro = new ResizeObserver(() => { measure(); apply(); });
    ro.observe(track);

    measure();
    apply();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize);
    window.addEventListener("load",   onResize);
    document.fonts.ready.then(onResize);

    return () => {
      ro.disconnect();
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("load",   onResize);
      if (raf !== null) cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <section
      id="projects"
      aria-label="Avenue projects"
      className="scroll-mt-24 bg-[#F4F1E8]"
    >
      {/* ══════════════════════════════════════════════════════════════
          MOBILE — vertical single-column (hidden ≥ md)
      ══════════════════════════════════════════════════════════════ */}
      <div className="md:hidden px-6 pb-28 pt-28">
        <div ref={headMobRef} className={`mb-16 ${revealClass(headMobIn)}`}>
          <p className="mb-5 text-[10px] uppercase tracking-[0.28em] text-[#2D3A1F]/35">
            Projects
          </p>
          <h2 className="max-w-[600px] font-serif text-[clamp(38px,10vw,64px)] font-light leading-[1.02] tracking-[-0.04em] text-[#2D3A1F]">
            Here are a few developments{" "}
            <em className="italic">we&apos;ve built.</em>
          </h2>
          <p className="mt-5 text-[13px] uppercase tracking-[0.16em] text-[#2D3A1F]/30">
            <span className="font-serif text-[22px] normal-case tracking-[-0.02em] text-[#2D3A1F]/60">
              {pad(projects.length)}
            </span>{" "}
            Developments across Nashik
          </p>
        </div>

        <div className="flex flex-col gap-y-10">
          {projects.map((p) => {
            const v = V[p.slug] ?? {
              aspect: "aspect-[4/5]",
              objPos: "50% 50%",
              parallax: 4,
            };
            return (
              <ProjectCard
                key={p.slug}
                project={p}
                containerStyle={{}}
                containerClass={v.aspect}
                objectPosition={v.objPos}
                parallax={v.parallax}
              />
            );
          })}
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════════
          DESKTOP — horizontal pinned scroll (hidden < md)
          ──────────────────────────────────────────────────────────
          sectionRef height is set by JS = vh + 15%vh + travel.
          The sticky inner pane has NO overflow so it does not
          become a scroll container (which would break sticky).
          The gallery wrapper carries overflow-hidden to clip the
          track's horizontal card overflow within the available
          gallery height.
      ══════════════════════════════════════════════════════════════ */}
      <div ref={sectionRef} className="hidden md:block relative">

        {/*
          Entry spacer: 15 vh.
          The sticky pane pins when this spacer scrolls off the top.
          MUST stay in sync with ENTRY_RATIO = 0.15 in the useEffect.
        */}
        <div className="h-[15vh]" aria-hidden="true" />

        {/* Sticky viewport — no overflow so sticky is relative to body scroll */}
        <div className="sticky top-0 h-screen flex flex-col bg-[#F4F1E8]">

          {/* Heading — shrink-0, physically above gallery, never overlaps */}
          <div
            ref={headDeskRef}
            className={`shrink-0 border-b border-[#2D3A1F]/8 px-10 pb-7 pt-12 lg:px-[clamp(3rem,5vw,5rem)] lg:pt-16 ${revealClass(headDeskIn)}`}
          >
            <p className="mb-4 text-[10px] uppercase tracking-[0.28em] text-[#2D3A1F]/35">
              Projects
            </p>
            <h2 className="font-serif text-[clamp(32px,4vw,64px)] font-light leading-[1.02] tracking-[-0.04em] text-[#2D3A1F]">
              Here are a few developments{" "}
              <em className="italic">we&apos;ve built.</em>
            </h2>
          </div>

          {/*
            Gallery wrapper — flex-1 fills remaining height after heading.
            overflow-hidden clips the track so cards never exceed the
            available gallery height.  position:relative anchors the
            absolute-positioned track.
          */}
          <div className="flex-1 relative overflow-hidden">
            <div
              ref={trackRef}
              className="absolute inset-0 flex items-center will-change-transform"
              style={{
                paddingLeft:   "clamp(3rem, 5vw, 5rem)",
                paddingRight:  "10vw",
                paddingTop:    "2rem",
                paddingBottom: "2.5rem",
                gap:           "3vw",
              }}
            >
              {projects.map((p) => (
                <div
                  key={p.slug}
                  style={{
                    width:      CARD_W,
                    minWidth:   CARD_MIN_W,
                    flexShrink: 0,
                  }}
                >
                  <ProjectCard
                    project={p}
                    containerStyle={{ height: CARD_IMG_H }}
                    containerClass=""
                    objectPosition={CARD_OBJ_POS[p.slug] ?? "50% 50%"}
                    parallax={CARD_PARALLAX[p.slug] ?? 4}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Progress bar */}
          <div aria-hidden="true" className="shrink-0 h-px bg-[#2D3A1F]/8">
            <div
              ref={barRef}
              className="h-full w-full origin-left bg-brand-gold will-change-transform"
              style={{ transform: "scaleX(0)" }}
            />
          </div>

        </div>
      </div>
    </section>
  );
}
