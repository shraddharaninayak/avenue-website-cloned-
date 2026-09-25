"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { ENQUIRE_HREF, projects } from "@/data/avenue";

/**
 * Our Projects
 *
 * Desktop (lg+): 400vh pinned section. Images wipe up over each other as
 * the user scrolls; text lines rise in and out of clip masks.
 *
 * Mobile (< lg): horizontal full-screen snap-scroll. Each project occupies
 * one full-viewport-width slide. The user swipes left/right to move between
 * projects — one project visible at a time, same "single project in focus"
 * experience as the desktop. The scrollbar is hidden; snapping is mandatory.
 */

const COUNT = projects.length;

const clamp01 = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v);
const span = (a: number, b: number, p: number) => clamp01((p - a) / (b - a));
const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);

export default function OurProjects() {
  const sectionRef = useRef<HTMLElement>(null);
  const panelRefs = useRef<(HTMLDivElement | null)[]>([]);
  const textRefs = useRef<(HTMLDivElement | null)[]>([]);
  const barRef = useRef<HTMLSpanElement>(null);

  const targetRef = useRef(0);
  const currentRef = useRef(0);
  const rafRef = useRef<number | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  const apply = useCallback((p: number) => {
    const seg = 1 / COUNT;

    projects.forEach((_, i) => {
      const panel = panelRefs.current[i];
      const text = textRefs.current[i];

      const enter =
        i === 0
          ? 1
          : easeOut(span(i * seg - seg * 0.55, i * seg + seg * 0.15, p));

      if (panel) {
        panel.style.clipPath = `inset(${((1 - enter) * 100).toFixed(2)}% 0% 0% 0%)`;
        panel.style.zIndex = String(i + 1);
        const img = panel.querySelector<HTMLElement>("[data-img]");
        if (img) {
          const imageScale = projects[i].slug === "bliss" ? 1.22 : 1.06;
          img.style.transform = `translate3d(0, ${((1 - enter) * -8).toFixed(
            2,
          )}%, 0) scale(${imageScale})`;
        }
      }

      if (text) {
        const out =
          i === COUNT - 1
            ? 0
            : span((i + 1) * seg - seg * 0.4, (i + 1) * seg, p);
        const shift = (1 - enter) * 110 - easeOut(out) * 110;
        text.style.zIndex = String(i + 1);
        text
          .querySelectorAll<HTMLElement>("[data-line]")
          .forEach((line, li) => {
            const stagger = 1 - li * 0.06;
            line.style.transform = `translate3d(0, ${(shift * stagger).toFixed(2)}%, 0)`;
          });
        text.style.pointerEvents = enter > 0.6 && out < 0.4 ? "auto" : "none";
        text.style.opacity = enter > 0.02 ? "1" : "0";
      }
    });

    if (barRef.current) {
      barRef.current.style.transform = `scaleX(${clamp01(p).toFixed(4)})`;
    }

    const idx = Math.min(COUNT - 1, Math.floor(p * COUNT + 0.35));
    setActiveIndex((prev) => (prev === idx ? prev : idx));
  }, []);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    const tick = () => {
      const diff = targetRef.current - currentRef.current;
      currentRef.current += reduceMotion ? diff : diff * 0.14;
      if (Math.abs(targetRef.current - currentRef.current) < 0.0002) {
        currentRef.current = targetRef.current;
        rafRef.current = null;
      } else {
        rafRef.current = requestAnimationFrame(tick);
      }
      apply(currentRef.current);
    };

    const readScroll = () => {
      const total = section.offsetHeight - window.innerHeight;
      const top = section.getBoundingClientRect().top;
      targetRef.current = total > 0 ? clamp01(-top / total) : 0;
      if (rafRef.current === null) rafRef.current = requestAnimationFrame(tick);
    };

    readScroll();
    apply(currentRef.current);

    window.addEventListener("scroll", readScroll, { passive: true });
    window.addEventListener("resize", readScroll);
    return () => {
      window.removeEventListener("scroll", readScroll);
      window.removeEventListener("resize", readScroll);
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    };
  }, [apply]);

  return (
    <section
      ref={sectionRef}
      id="projects"
      className="relative scroll-mt-24 bg-[#F1EADA] text-[#584738] h-auto lg:h-[400vh]"
    >
      {/* ── MOBILE: full-screen horizontal snap-scroll (hidden on lg+) ───────── */}
      <div className="lg:hidden">
        {/* Section header — sits above the slide track */}
        <div className="px-5 pb-5 pt-[104px]">
          <div className="flex items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <span className="h-px w-10 bg-[#584738]/40" />
              <h2 className="text-[10px] uppercase tracking-[0.28em] text-[#584738]/50">
                Our Projects
              </h2>
            </div>
            <span className="text-[10px] tracking-[0.2em] text-[#584738]/40">
              {String(COUNT).padStart(2, "0")} Projects
            </span>
          </div>
        </div>

        {/* Slide track — cards with peek of next */}
        <div
          className="flex overflow-x-auto snap-x snap-mandatory gap-4 pl-5
                     scroll-pl-5
                     [&::-webkit-scrollbar]:hidden [scrollbar-width:none]"
          style={{ WebkitOverflowScrolling: "touch" } as React.CSSProperties}
        >
          {projects.map((project, i) => (
            <article
              key={project.slug}
              className="shrink-0 w-[88vw] snap-start"
            >
              {/* Image — tall, fills most of the slide */}
              <Link href={`/projects/${project.slug}`} className="block">
                <div className="relative h-[55vh] overflow-hidden bg-[#584738]/10">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={project.image}
                    alt={`The Avenue ${project.name}`}
                    loading={i === 0 ? "eager" : "lazy"}
                    decoding="async"
                    className="absolute inset-0 h-full w-full object-cover"
                    style={{ objectPosition: "center top" }}
                  />
                </div>
              </Link>

              {/* Text — same typography tokens as desktop */}
              <div className="px-5 pb-14 pt-5">
                <span className="text-[10px] uppercase tracking-[0.24em] text-[#584738]/45">
                  {project.category}
                </span>

                <h3 className="mt-3 font-serif text-[42px] font-light leading-[0.94] tracking-[-0.05em]">
                  {project.name}
                </h3>

                <p className="mt-3 max-w-[520px] font-serif text-[17px] font-light leading-[1.35] tracking-[-0.02em] text-[#584738]/70">
                  {project.statement}
                </p>

                <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[11px] uppercase tracking-[0.18em] text-[#584738]/55">
                  <span>{project.configuration}</span>
                  {project.locality ? (
                    <>
                      <span className="h-3 w-px bg-[#584738]/20" />
                      <span>{project.locality}</span>
                    </>
                  ) : null}
                  {project.status ? (
                    <>
                      <span className="h-3 w-px bg-[#584738]/20" />
                      <span>{project.status}</span>
                    </>
                  ) : null}
                </div>

                <div className="mt-7">
                  <Link
                    href={ENQUIRE_HREF}
                    className="group inline-flex items-center gap-3 text-[11px] uppercase tracking-[0.22em] text-[#584738]/60 transition-colors hover:text-[#584738]"
                  >
                    <span>Enquire</span>
                    <ArrowRight className="h-3.5 w-3.5 transition-transform duration-500 group-hover:translate-x-1.5" />
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>

      {/* ── DESKTOP: pinned scroll animation (hidden below lg) ───────────────── */}
      <div className="hidden lg:sticky lg:top-0 lg:flex lg:h-screen lg:w-full lg:flex-col lg:overflow-hidden">
        {/* HEADER */}
        <div className="shrink-0 px-6 pt-[104px] md:px-10 lg:px-12 lg:pt-[120px]">
          <div className="mx-auto flex max-w-[1450px] items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <span className="h-px w-10 bg-[#584738]/40" />
              <h2 className="text-[11px] uppercase tracking-[0.28em] text-[#584738]/62">
                Our Projects
              </h2>
            </div>

            <div className="flex items-center gap-4">
              <span className="text-[11px] tracking-[0.2em] text-[#584738]/52">
                {String(activeIndex + 1).padStart(2, "0")} /{" "}
                {String(COUNT).padStart(2, "0")}
              </span>
              <span className="relative block h-px w-24 bg-[#584738]/15 md:w-40">
                <span
                  ref={barRef}
                  className="absolute inset-0 origin-left bg-[#584738]/60"
                  style={{ transform: "scaleX(0)" }}
                />
              </span>
            </div>
          </div>
        </div>

        {/* STAGE */}
        <div className="mx-auto flex w-full max-w-[1450px] flex-1 items-center px-6 pb-14 pt-8 md:px-10 md:pb-16 lg:px-12">
          <div className="grid w-full grid-cols-12 items-center gap-14">
            {/* TEXT */}
            <div className="relative col-span-5 h-[330px]">
              {projects.map((project, i) => (
                <div
                  key={project.slug}
                  ref={(el) => {
                    textRefs.current[i] = el;
                  }}
                  className="absolute inset-0 flex flex-col justify-center"
                >
                  <div className="overflow-hidden">
                    <div data-line="" className="will-change-transform">
                      <span className="text-[11px] uppercase tracking-[0.24em] text-[#584738]/60">
                        {project.category}
                      </span>
                    </div>
                  </div>

                  <div className="mt-4 overflow-hidden">
                    <div data-line="" className="will-change-transform">
                      <h3 className="font-serif text-[clamp(38px,3.8vw,56px)] font-light leading-[0.94] tracking-[-0.05em]">
                        {project.name}
                      </h3>
                    </div>
                  </div>

                  <div className="mt-5 overflow-hidden">
                    <div data-line="" className="will-change-transform">
                      <p className="max-w-[420px] font-serif text-[clamp(17px,1.7vw,24px)] font-light leading-[1.35] tracking-[-0.02em] text-[#584738]/70">
                        {project.statement}
                      </p>
                    </div>
                  </div>

                  <div className="mt-7 overflow-hidden">
                    <div data-line="" className="will-change-transform">
                      <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-[12px] uppercase tracking-[0.18em] text-[#584738]/65">
                        <span>{project.configuration}</span>
                        {project.locality ? (
                          <>
                            <span className="h-3 w-px bg-[#584738]/20" />
                            <span>{project.locality}</span>
                          </>
                        ) : null}
                        {project.status ? (
                          <>
                            <span className="h-3 w-px bg-[#584738]/20" />
                            <span>{project.status}</span>
                          </>
                        ) : null}
                      </div>
                    </div>
                  </div>

                  <div className="mt-8 overflow-hidden">
                    <div data-line="" className="will-change-transform">
                      <Link
                        href={ENQUIRE_HREF}
                        className="group inline-flex items-center gap-3 text-[12px] uppercase tracking-[0.22em] text-[#584738]/65 transition-colors hover:text-[#584738]"
                      >
                        <span>Enquire</span>
                        <ArrowRight className="h-3.5 w-3.5 transition-transform duration-500 group-hover:translate-x-1.5" />
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* IMAGE STACK */}
            <div className="relative col-span-7 h-[min(62vh,560px)] overflow-hidden bg-[#F1EADA]">
              {projects.map((project, i) => (
                <div
                  key={project.slug}
                  ref={(el) => {
                    panelRefs.current[i] = el;
                  }}
                  className="absolute inset-0 overflow-hidden will-change-[clip-path]"
                  style={{
                    clipPath:
                      i === 0 ? "inset(0% 0% 0% 0%)" : "inset(100% 0% 0% 0%)",
                  }}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    data-img=""
                    src={project.image}
                    alt={`The Avenue ${project.name}`}
                    className="absolute inset-0 h-full w-full object-cover will-change-transform"
                    style={{
                      objectPosition: "center top",
                    }}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
