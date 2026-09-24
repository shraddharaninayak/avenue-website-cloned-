"use client";

import { useCallback, useEffect, useRef } from "react";
import { projects as developments } from "@/data/avenue";

/**
 * Places We've Shaped.
 *
 * The opening frame is genuinely one photograph rather than four cards
 * arranged to look like one: each panel is butted edge to edge and shows its
 * own slice of the Urbania image, offset so the slices reconstruct a single
 * continuous picture. Scrolling walks the panels apart one after another, and
 * as each leaves the composition it cross-fades to its own project image.
 *
 * Every rectangle is snapped to whole pixels. Positioning the slices at
 * fractional offsets makes the browser resample each one at a different
 * sub-pixel phase, which shows up as hairline seams down the joins.
 */

/** Percentages of the sticky viewport. */
const HERO = { left: 6, width: 88, top: 19, height: 66 };
/** Panels overlap while tiled so rounding can never open a gap on a join. */
const BLEED = 4;

const COUNT = developments.length;

/**
 * Four columns is the desktop composition. A phone cannot carry four legible
 * columns, so it resolves to a 2x2 grid — and the opening image is then tiled
 * as quadrants rather than strips, so it still reconstructs as one picture.
 */
const layoutFor = (width: number) =>
  width < 768
    ? { cols: 2, rows: 2, top: 22, height: 62, gapX: 2.5, gapY: 2.5 }
    : { cols: 4, rows: 1, top: 26, height: 52, gapX: 1.6, gapY: 0 };

const clamp01 = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v);
const span = (a: number, b: number, p: number) => clamp01((p - a) / (b - a));
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const easeInOut = (t: number) =>
  t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

export default function AvenuePillars() {
  const sectionRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const panelRefs = useRef<(HTMLDivElement | null)[]>([]);

  const targetRef = useRef(0);
  const currentRef = useRef(0);
  const rafRef = useRef<number | null>(null);
  const viewRef = useRef({ w: 1440, h: 810 });

  const apply = useCallback((p: number) => {
    const stage = stageRef.current;
    if (!stage) return;

    const { w: W, h: H } = viewRef.current;

    // Phase 1: the single image holds, breathing very slightly. This is baked
    // into the hero rect rather than applied as a transform on the stage — a
    // fractional scale over the panels would undo the pixel snapping below and
    // bring the hairline seams back.
    const breathe = lerp(1.05, 1, span(0, 0.18, p));
    stage.style.transform = "none";

    const baseW = (HERO.width / 100) * W;
    const baseH = (HERO.height / 100) * H;
    const heroW = Math.round(baseW * breathe);
    const heroH = Math.round(baseH * breathe);
    const heroL = Math.round(W / 2 - heroW / 2);
    const heroT = Math.round((HERO.top / 100) * H - (heroH - baseH) / 2);

    const L = layoutFor(W);
    const slotWpct = (HERO.width - L.gapX * (L.cols - 1)) / L.cols;
    const slotHpct = (L.height - L.gapY * (L.rows - 1)) / L.rows;

    developments.forEach((_, i) => {
      const panel = panelRefs.current[i];
      if (!panel) return;

      // Phase 2/3: panels leave the composition in sequence, not together.
      const start = 0.18 + i * 0.06;
      const t = easeInOut(span(start, start + 0.36, p));

      const col = i % L.cols;
      const row = Math.floor(i / L.cols);

      // Integer tile edges, so the tiles cover the hero rect exactly.
      const sliceL = heroL + Math.round((col * heroW) / L.cols);
      const sliceR = heroL + Math.round(((col + 1) * heroW) / L.cols);
      const sliceT = heroT + Math.round((row * heroH) / L.rows);
      const sliceB = heroT + Math.round(((row + 1) * heroH) / L.rows);

      const slotL = Math.round(
        ((HERO.left + col * (slotWpct + L.gapX)) / 100) * W,
      );
      const slotW = Math.round((slotWpct / 100) * W);
      const slotT = Math.round(((L.top + row * (slotHpct + L.gapY)) / 100) * H);
      const slotH = Math.round((slotHpct / 100) * H);

      const left = Math.round(lerp(sliceL, slotL, t));
      const width = Math.round(lerp(sliceR - sliceL, slotW, t));
      const top = Math.round(lerp(sliceT, slotT, t));
      const height = Math.round(lerp(sliceB - sliceT, slotH, t));

      const bleed = Math.round(BLEED * (1 - t));
      panel.style.left = `${left}px`;
      panel.style.width = `${width + bleed}px`;
      panel.style.top = `${top}px`;
      panel.style.height = `${height + (L.rows > 1 ? bleed : 0)}px`;

      // Whole-pixel offsets mean every slice resolves to the identical screen
      // rect, so the four of them resample as one continuous image.
      const backing = panel.querySelector<HTMLElement>("[data-backing]");
      if (backing) {
        backing.style.left = `${heroL - left}px`;
        backing.style.width = `${heroW}px`;
        backing.style.top = `${heroT - top}px`;
        backing.style.height = `${heroH}px`;
        backing.style.opacity = String(1 - clamp01(t / 0.45));
      }

      // Phase 4: the project's own image takes over as it separates.
      const own = panel.querySelector<HTMLElement>("[data-own]");
      if (own) own.style.opacity = String(clamp01(t / 0.45));

      // Phase 5: names last, once the composition has settled.
      const content = panel.querySelector<HTMLElement>("[data-content]");
      if (content) {
        const c = span(0.74 + i * 0.03, 0.9 + i * 0.03, p);
        content.style.opacity = String(c);
        content.style.transform = `translateY(${(1 - c) * 24}px)`;
      }
    });
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

    const handleResize = () => {
      viewRef.current = { w: window.innerWidth, h: window.innerHeight };
      readScroll();
      apply(currentRef.current);
    };

    handleResize();

    window.addEventListener("scroll", readScroll, { passive: true });
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("scroll", readScroll);
      window.removeEventListener("resize", handleResize);
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    };
  }, [apply]);

  return (
    // No overflow-hidden on the section: an overflow ancestor becomes the
    // scrollport for position:sticky and the stage below stops pinning.
    <section ref={sectionRef} className="relative h-[300vh] bg-[#F4F1E8]">
      <div className="sticky top-0 h-screen w-full overflow-hidden">
        {/* SECTION TITLE — cleared below the fixed navbar */}
        <div className="absolute left-0 right-0 top-[100px] z-30 px-6 md:px-10 lg:top-[116px]">
          <div className="mx-auto flex max-w-[1450px] items-center gap-4">
            <span className="h-px w-10 bg-black/40" />
            <h2 className="text-[10px] uppercase tracking-[0.28em] text-[#2D3A1F]/50">
              Places We&apos;ve Shaped
            </h2>
          </div>
        </div>

        {/* THE COMPOSITION */}
        <div
          ref={stageRef}
          className="absolute inset-0 will-change-transform"
          style={{ transform: "scale(1.05)" }}
        >
          {developments.map((development, i) => (
            <div
              key={development.name}
              ref={(el) => {
                panelRefs.current[i] = el;
              }}
              className="absolute overflow-hidden bg-[#F4F1E8]"
              style={{
                left: `${HERO.left + (i * HERO.width) / COUNT}%`,
                width: `${HERO.width / COUNT}%`,
                top: `${HERO.top}%`,
                height: `${HERO.height}%`,
                zIndex: COUNT - i,
              }}
            >
              {/* This panel's slice of the single opening image. */}
              <img
                data-backing=""
                src={developments[0].image}
                alt=""
                aria-hidden="true"
                className="absolute max-w-none object-cover"
                style={{
                  left: `${(-i * HERO.width) / COUNT}vw`,
                  width: `${HERO.width}vw`,
                  top: 0,
                  height: `${HERO.height}vh`,
                }}
              />

              {/* The project's own image, revealed as the panel separates. */}
              <img
                data-own=""
                src={development.image}
                alt={`The Avenue ${development.name}`}
                className="absolute inset-0 h-full w-full object-cover"
                style={{ opacity: 0 }}
              />

              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/55 via-black/5 to-transparent" />

              <div
                data-content=""
                className="absolute inset-x-0 bottom-0 p-5 text-white md:p-6"
                style={{ opacity: 0, transform: "translateY(24px)" }}
              >
                <span className="text-[9px] uppercase tracking-[0.22em] text-white/70">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <h3 className="mt-2 font-serif text-[22px] font-light leading-none tracking-[-0.02em] md:text-[28px]">
                  {development.name}
                </h3>
              </div>
            </div>
          ))}
        </div>

        {/* BOTTOM LABEL */}
        <div className="absolute bottom-8 left-0 right-0 z-30 px-6 md:px-10">
          <div className="mx-auto flex max-w-[1450px] items-center justify-between border-t border-black/15 pt-5">
            <span className="text-[10px] uppercase tracking-[0.22em] text-[#2D3A1F]/45">
              The Avenue
            </span>
            <span className="text-[10px] uppercase tracking-[0.22em] text-[#2D3A1F]/45">
              Nashik
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
