"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { ENQUIRE_HREF, projects } from "@/data/avenue";

/**
 * Our Projects — one pinned frame that the four developments move through.
 *
 * Each project owns a quarter of the section's scroll. Its image panel wipes up
 * over the previous one with a clip-path and settles, while its text lines rise
 * out of their own masks. Nothing here cross-fades: panels stack by z-index and
 * are revealed by clipping, so there is never a moment where two renders are
 * ghosted over each other.
 *
 * All copy comes from projects.ts, which is transcribed from each project's own
 * page on tabd.in.
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
    // Each project owns a quarter; the last one holds to the end.
    const seg = 1 / COUNT;

    projects.forEach((_, i) => {
      const panel = panelRefs.current[i];
      const text = textRefs.current[i];

      // 0 before this project's turn, 1 once it has fully arrived.
      const enter =
        i === 0
          ? 1
          : easeOut(span(i * seg - seg * 0.55, i * seg + seg * 0.15, p));

      if (panel) {
        // Wipe up from the bottom edge rather than fading in.
        panel.style.clipPath = `inset(${((1 - enter) * 100).toFixed(2)}% 0% 0% 0%)`;
        panel.style.zIndex = String(i + 1);
        const img = panel.querySelector<HTMLElement>("[data-img]");
        if (img) {
          // Counter-move so the render slides within the wipe instead of
          // arriving as a flat block.
          const imageScale = projects[i].slug === "bliss" ? 1.22 : 1.06;

          img.style.transform = `translate3d(0, ${((1 - enter) * -8).toFixed(
            2,
          )}%, 0) scale(${imageScale})`;
        }
      }

      if (text) {
        // Lines rise in, hold, then rise out under the next project.
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
        // Only the settled project should be reachable by a pointer or tab.
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
    // No overflow-hidden: an overflow ancestor would stop the stage pinning.
    <section
      ref={sectionRef}
      id="projects"
      className="relative h-[400vh] scroll-mt-24 bg-[#F4F1E8] text-[#2D3A1F]"
    >
      <div className="sticky top-0 flex h-screen w-full flex-col overflow-hidden">
        {/* HEADER */}
        <div className="shrink-0 px-6 pt-[104px] md:px-10 lg:px-12 lg:pt-[120px]">
          <div className="mx-auto flex max-w-[1450px] items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <span className="h-px w-10 bg-black/40" />
              <h2 className="text-[10px] uppercase tracking-[0.28em] text-[#2D3A1F]/50">
                Our Projects
              </h2>
            </div>

            <div className="flex items-center gap-4">
              <span className="text-[10px] tracking-[0.2em] text-[#2D3A1F]/40">
                {String(activeIndex + 1).padStart(2, "0")} /{" "}
                {String(COUNT).padStart(2, "0")}
              </span>
              <span className="relative block h-px w-24 bg-black/15 md:w-40">
                <span
                  ref={barRef}
                  className="absolute inset-0 origin-left bg-black/60"
                  style={{ transform: "scaleX(0)" }}
                />
              </span>
            </div>
          </div>
        </div>

        {/* STAGE */}
        <div className="mx-auto flex w-full max-w-[1450px] flex-1 items-center px-6 pb-14 pt-8 md:px-10 md:pb-16 lg:px-12">
          <div className="grid w-full grid-cols-1 items-center gap-8 lg:grid-cols-12 lg:gap-14">
            {/* TEXT */}
            <div className="relative order-2 h-[248px] lg:order-1 lg:col-span-5 lg:h-[330px]">
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
                      <span className="text-[10px] uppercase tracking-[0.24em] text-[#2D3A1F]/45">
                        {project.category}
                      </span>
                    </div>
                  </div>

                  <div className="mt-3 overflow-hidden md:mt-4">
                    <div data-line="" className="will-change-transform">
                      <h3 className="font-serif text-[clamp(42px,6vw,84px)] font-light leading-[0.94] tracking-[-0.05em]">
                        {project.name}
                      </h3>
                    </div>
                  </div>

                  <div className="mt-4 overflow-hidden md:mt-5">
                    <div data-line="" className="will-change-transform">
                      <p className="max-w-[420px] font-serif text-[clamp(17px,1.7vw,24px)] font-light leading-[1.35] tracking-[-0.02em] text-[#2D3A1F]/70">
                        {project.statement}
                      </p>
                    </div>
                  </div>

                  <div className="mt-6 overflow-hidden md:mt-7">
                    <div data-line="" className="will-change-transform">
                      <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-[11px] uppercase tracking-[0.18em] text-[#2D3A1F]/55">
                        <span>{project.configuration}</span>
                        {project.locality ? (
                          <>
                            <span className="h-3 w-px bg-black/20" />
                            <span>{project.locality}</span>
                          </>
                        ) : null}
                      </div>
                    </div>
                  </div>

                  <div className="mt-7 overflow-hidden md:mt-8">
                    <div data-line="" className="will-change-transform">
                      <Link
                        href={ENQUIRE_HREF}
                        className="group inline-flex items-center gap-3 text-[11px] uppercase tracking-[0.22em] text-[#2D3A1F]/60 transition-colors hover:text-[#2D3A1F]"
                      >
                        <span>Enquire about {project.name}</span>
                        <ArrowRight className="h-3.5 w-3.5 transition-transform duration-500 group-hover:translate-x-1.5" />
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* IMAGE STACK */}
            <div className="relative order-1 aspect-[16/11] w-full overflow-hidden bg-[#F4F1E8] lg:order-2 lg:col-span-7 lg:aspect-auto lg:h-[min(62vh,560px)]">
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
