"use client";

import React, { useEffect, useRef } from "react";
import Link from "next/link";
import { ArrowRight, ChevronDown } from "lucide-react";

import { Journey } from "./hero-journey/journey";
import { avenueJourney } from "./hero-journey/avenue-journey";
import { clamp01, smoothstep } from "./hero-journey/math";

/**
 * The opening of the home page: one continuous camera journey to The Avenue,
 * driven by scroll.
 *
 * The journey itself — shots, depth layers, camera path, chapters — lives in
 * ./hero-journey/avenue-journey.ts. This component only owns the page side:
 * the pinned stage, the scroll position, the canvas, and a deliberately
 * minimal interface (a chapter marker, and the message only on arrival).
 */

/** Share of the remaining distance the camera closes per 60fps frame. */
const FOLLOW = 0.12;
/** Scroll progress over which the arrival message comes in. */
const ARRIVAL_FROM = 0.9;
const ARRIVAL_TO = 0.97;

const chapters = avenueJourney.chapters;

export default function HeroCanvas() {
  const containerRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const loaderRef = useRef<HTMLDivElement>(null);
  const markerRef = useRef<HTMLDivElement>(null);
  const markerIndexRef = useRef<HTMLSpanElement>(null);
  const markerLabelRef = useRef<HTMLSpanElement>(null);
  const railRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const cueRef = useRef<HTMLDivElement>(null);
  const arrivalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    const stage = stageRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    const scratchCanvas = document.createElement("canvas");
    const scratch = scratchCanvas.getContext("2d");
    if (!container || !stage || !canvas || !ctx || !scratch) return;

    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    const journey = new Journey(avenueJourney);
    const view = { w: 0, h: 0, dpr: 1 };
    let target = 0;
    let current = 0;
    let raf: number | null = null;
    let lastFrame = 0;
    let shownChapter = -1;
    let disposed = false;

    const updateUi = (p: number) => {
      const chapter = journey.chapterAt(p);
      if (chapter !== shownChapter && markerIndexRef.current && markerLabelRef.current) {
        shownChapter = chapter;
        markerIndexRef.current.textContent = String(chapter + 1).padStart(2, "0");
        markerLabelRef.current.textContent = chapters[chapter].label;
      }
      chapters.forEach((c, i) => {
        const el = railRefs.current[i];
        if (!el) return;
        const end = i + 1 < chapters.length ? chapters[i + 1].from : 1;
        el.style.transform = `scaleX(${clamp01((p - c.from) / (end - c.from))})`;
      });

      const arrival = smoothstep(ARRIVAL_FROM, ARRIVAL_TO, p);
      if (arrivalRef.current) {
        arrivalRef.current.style.opacity = String(arrival);
        arrivalRef.current.style.transform = `translate3d(0, ${(1 - arrival) * 24}px, 0)`;
        // Hidden until it arrives: out of the tab order and the a11y tree.
        arrivalRef.current.style.visibility = arrival > 0.01 ? "visible" : "hidden";
      }
      if (markerRef.current) {
        // On narrow screens the marker makes way for the arrival message.
        markerRef.current.style.setProperty("--arrival", String(arrival));
      }
      if (cueRef.current) {
        cueRef.current.style.opacity = String(1 - smoothstep(0.02, 0.08, p));
      }
    };

    /** Progress last painted; NaN forces the next paint. */
    let painted = NaN;

    const paint = (force = false) => {
      if (!journey.ready || !view.w) return;
      // Scrolling the rest of the page leaves the camera where it is: no repaint.
      if (!force && current === painted) return;
      journey.render(ctx, scratch, current, view);
      painted = current;
    };

    const frame = (now: number) => {
      raf = null;
      // Time-based, so a slow device takes fewer, larger steps and still
      // settles on the scroll position in the same wall-clock time.
      const dt = lastFrame ? Math.min(now - lastFrame, 250) : 16.7;
      lastFrame = now;
      const diff = target - current;
      current =
        reduceMotion || Math.abs(diff) < 0.00015
          ? target
          : current + diff * (1 - Math.pow(1 - FOLLOW, dt / 16.7));
      paint();
      updateUi(current);
      if (current !== target) raf = requestAnimationFrame(frame);
      else lastFrame = 0;
    };

    const kick = () => {
      if (raf === null) raf = requestAnimationFrame(frame);
    };

    const readScroll = () => {
      const total = container.offsetHeight - stage.offsetHeight;
      const top = container.getBoundingClientRect().top;
      target = total > 0 ? clamp01(-top / total) : 0;
    };

    const resize = () => {
      const w = stage.clientWidth;
      const h = stage.clientHeight;
      if (!w || !h) return;
      // Capped at 2x: past that the backing store costs fill rate, not detail.
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const bw = Math.round(w * dpr);
      const bh = Math.round(h * dpr);
      for (const c of [canvas, scratchCanvas]) {
        if (c.width !== bw || c.height !== bh) {
          c.width = bw;
          c.height = bh;
        }
      }
      view.w = w;
      view.h = h;
      view.dpr = dpr;
      readScroll();
      // Resizing clears the canvas; repaint at once.
      paint(true);
      updateUi(current);
    };

    const onScroll = () => {
      readScroll();
      kick();
    };

    readScroll();
    current = target;
    resize();
    updateUi(current);

    journey
      .load(() => {
        if (disposed) return;
        loaderRef.current?.classList.add("opacity-0");
        canvas.classList.remove("opacity-0");
        paint(true);
      })
      .then(() => {
        // Later shots have arrived; the current view may include one.
        if (!disposed) paint(true);
      })
      .catch(() => {});

    const observer = new ResizeObserver(resize);
    observer.observe(stage);
    window.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      disposed = true;
      observer.disconnect();
      window.removeEventListener("scroll", onScroll);
      if (raf !== null) cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div ref={containerRef} className="relative h-[500vh] bg-black">
      <div
        ref={stageRef}
        className="sticky top-0 h-screen w-full overflow-hidden bg-[#0a0908]"
      >
        <canvas
          ref={canvasRef}
          role="img"
          aria-label="A camera journey to The Avenue's Milestone towers at dusk, arriving at the entrance"
          className="absolute inset-0 h-full w-full opacity-0 transition-opacity duration-700"
        />

        {/* Until the opening shot has loaded. */}
        <div
          ref={loaderRef}
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 flex items-center justify-center transition-opacity duration-700"
        >
          <span className="h-px w-16 animate-pulse bg-brand-gold/70" />
        </div>

        {/* Soft grade so type and header stay legible over any shot. */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-black/35 to-transparent"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 bottom-0 h-[45%] bg-gradient-to-t from-[#0c0a09]/75 via-[#0c0a09]/25 to-transparent"
        />

        {/* Arrival — the only message, once the visitor is at the door. */}
        <div
          ref={arrivalRef}
          style={{ opacity: 0, visibility: "hidden" }}
          className="absolute bottom-0 left-0 max-w-3xl px-6 pb-24 md:px-12 md:pb-14 lg:px-16 lg:pb-16"
        >
          <div className="mb-5 flex items-center gap-3">
            <span className="h-px w-8 bg-brand-gold" />
            <span className="font-grotesk text-[11px] font-medium uppercase tracking-[0.3em] text-brand-gold">
              The Avenue
            </span>
          </div>
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-grotesk font-normal uppercase leading-[0.98] tracking-tight text-white drop-shadow-2xl">
            Welcome
            <br />
            Home.
          </h1>
          <div className="mt-8 flex flex-wrap items-center gap-4">
            <Link
              href="/milestones"
              className="inline-flex items-center gap-3 bg-white px-8 py-4 font-grotesk text-xs font-semibold uppercase tracking-[0.2em] text-black hover:bg-brand-gold transition-colors duration-300 shadow-xl"
            >
              <span>Explore Flagship</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/contact"
              className="inline-flex items-center gap-3 border border-white/40 px-8 py-4 font-grotesk text-xs font-semibold uppercase tracking-[0.2em] text-white hover:border-brand-gold hover:text-brand-gold transition-colors duration-300"
            >
              <span>Schedule a Visit</span>
            </Link>
          </div>
        </div>

        {/* Chapter marker and journey rail. */}
        <div
          ref={markerRef}
          aria-hidden="true"
          style={{ ["--arrival" as string]: 0 }}
          className="pointer-events-none absolute bottom-8 right-6 flex flex-col items-end gap-3 opacity-[calc(1_-_var(--arrival))] md:right-12 md:opacity-100 lg:bottom-16 lg:right-16"
        >
          <div className="flex items-baseline gap-3 font-grotesk text-[11px] uppercase tracking-[0.25em]">
            <span ref={markerIndexRef} className="text-brand-gold">
              01
            </span>
            <span className="text-white/40">/ {String(chapters.length).padStart(2, "0")}</span>
            <span ref={markerLabelRef} className="text-white/80">
              {chapters[0].label}
            </span>
          </div>
          <div className="flex gap-1.5">
            {chapters.map((c, i) => (
              <span key={c.label} className="relative block h-px w-8 overflow-hidden bg-white/20 md:w-10">
                <span
                  ref={(el) => {
                    railRefs.current[i] = el;
                  }}
                  className="absolute inset-0 origin-left bg-brand-gold"
                  style={{ transform: "scaleX(0)" }}
                />
              </span>
            ))}
          </div>
        </div>

        {/* Scroll cue, only before the journey starts. */}
        <div
          ref={cueRef}
          aria-hidden="true"
          className="pointer-events-none absolute bottom-24 left-1/2 flex -translate-x-1/2 flex-col items-center gap-2 font-grotesk text-[10px] uppercase tracking-[0.3em] text-white/60 md:bottom-8 lg:bottom-16"
        >
          <span>Scroll</span>
          <ChevronDown className="h-4 w-4 animate-bounce text-brand-gold" />
        </div>
      </div>
    </div>
  );
}
