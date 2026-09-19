"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { ArrowRight, ChevronDown } from "lucide-react";
import { company } from "@/data/avenue";
import { clamp01, easeOut, lerp, prefersReducedMotion, smoothstep, span } from "./motion";

/**
 * 01 — Hero. The Avenue's own film, played by scroll.
 *
 * The frames are the opening architecture of the Milestone film
 * (public/avenue-intro.mp4.mp4, 5.5s–16.2s): the towers from below through
 * the trees, the camera looking up between them, then both towers face-on at
 * sunset. They are extracted at 10 fps as stills, because a scroll-scrubbed
 * <video> seeks badly on phones; drawing stills to a canvas scrubs cleanly in
 * both directions, and adjacent frames are cross-faded so the motion stays
 * continuous between them. Phones get their own crops, taken from the film at
 * native resolution and following a tower through each shot.
 *
 * The story is kept to one move: the film plays, and only on its final shot —
 * the towers at sunset — does a veil rise with the brand line. The panel then
 * lifts away on rounded corners, uncovering the page beneath.
 */

const FRAMES = 107;
/** First frame of the face-on shot of both towers. */
const FINAL_SHOT = 78;
const src = (set: "l" | "p", i: number) =>
  `/home-hero/${set}/${String(i + 1).padStart(3, "0")}.webp`;
/** Below this width/height the phone crops are used. */
const PORTRAIT_BELOW = 0.85;

/** Scroll progress (0..1 over the pinned stretch) → frame index. */
const frameAt = (p: number) =>
  p < 0.5
    ? lerp(0, FINAL_SHOT, p / 0.5)
    : lerp(FINAL_SHOT, FRAMES - 1, (p - 0.5) / 0.5);

/** Coarse-to-fine: the ends, then halves, quarters… so any scroll position soon has a near frame. */
const loadOrder = () => {
  const order: number[] = [0, FRAMES - 1];
  const seen = new Set(order);
  for (let step = 64; step >= 1; step = Math.floor(step / 2)) {
    for (let i = 0; i < FRAMES; i += step) {
      if (!seen.has(i)) {
        seen.add(i);
        order.push(i);
      }
    }
  }
  return order;
};

const HEADLINE: { text: string; em?: boolean }[][] = [
  [{ text: "Introducing you to a life you've " }, { text: "aspired for,", em: true }],
  [{ text: "and " }, { text: "world-class designs", em: true }, { text: " you've" }],
  [{ text: "always " }, { text: "yearned for.", em: true }],
];

export default function AvenueHero() {
  const containerRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const veilRef = useRef<HTMLDivElement>(null);
  const lineRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const detailRef = useRef<HTMLDivElement>(null);
  const cueRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    const stage = stageRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!container || !stage || !canvas || !ctx) return;

    const reduce = prefersReducedMotion();
    const sets: Record<"l" | "p", (HTMLImageElement | undefined)[]> = {
      l: new Array(FRAMES),
      p: new Array(FRAMES),
    };
    const requested = new Set<string>();
    let set: "l" | "p" = "l";
    let view = { w: 0, h: 0, dpr: 1 };
    let target = 0;
    let current = 0;
    let painted = -1;
    let raf: number | null = null;
    let disposed = false;

    const nearest = (i: number) => {
      const frames = sets[set];
      for (let d = 0; d < FRAMES; d++) {
        const a = frames[i - d];
        if (a) return { img: a, exact: d === 0 };
        const b = frames[i + d];
        if (b) return { img: b, exact: d === 0 };
      }
      return null;
    };

    const cover = (img: HTMLImageElement, alpha: number) => {
      const W = canvas.width;
      const H = canvas.height;
      const s = Math.max(W / img.naturalWidth, H / img.naturalHeight);
      const w = img.naturalWidth * s;
      const h = img.naturalHeight * s;
      ctx.globalAlpha = alpha;
      ctx.drawImage(img, (W - w) / 2, (H - h) / 2, w, h);
    };

    const paint = (p: number, force = false) => {
      const f = frameAt(p);
      if (!force && Math.abs(f - painted) < 0.01) return;
      const i0 = Math.floor(f);
      const t = f - i0;
      const base = nearest(i0);
      if (!base) return;
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";
      cover(base.img, 1);
      // Cross-fade into the next frame when both are in.
      const next = sets[set][Math.min(i0 + 1, FRAMES - 1)];
      if (base.exact && next && t > 0.02) cover(next, t);
      ctx.globalAlpha = 1;
      painted = f;
      canvas.style.opacity = "1";
    };

    const ui = (p: number) => {
      const veil = smoothstep(0.42, 0.7, p);
      if (veilRef.current) veilRef.current.style.opacity = veil.toFixed(3);

      lineRefs.current.forEach((line, k) => {
        if (!line) return;
        const rise = easeOut(span(0.5 + k * 0.045, 0.66 + k * 0.045, p));
        line.style.transform = `translate3d(0, ${((1 - rise) * 110).toFixed(2)}%, 0)`;
      });

      const detail = span(0.64, 0.76, p);
      if (detailRef.current) {
        detailRef.current.style.opacity = detail.toFixed(3);
        detailRef.current.style.transform = `translate3d(0, ${((1 - detail) * 16).toFixed(1)}px, 0)`;
        detailRef.current.style.pointerEvents = detail > 0.6 ? "auto" : "none";
        detailRef.current.style.visibility = detail > 0.01 ? "visible" : "hidden";
      }

      if (cueRef.current) cueRef.current.style.opacity = (1 - span(0.01, 0.07, p)).toFixed(3);

      // The panel's lower corners round off as it prepares to lift away.
      const r = (view.w < 768 ? 24 : 44) * smoothstep(0.88, 1, p);
      stage.style.borderBottomLeftRadius = `${r.toFixed(1)}px`;
      stage.style.borderBottomRightRadius = `${r.toFixed(1)}px`;
    };

    const tick = () => {
      raf = null;
      const diff = target - current;
      current = reduce || Math.abs(diff) < 0.0004 ? target : current + diff * 0.14;
      paint(current);
      ui(current);
      if (current !== target) raf = requestAnimationFrame(tick);
    };
    const kick = () => {
      if (raf === null) raf = requestAnimationFrame(tick);
    };

    const read = () => {
      const total = container.offsetHeight - stage.offsetHeight;
      target = total > 0 ? clamp01(-container.getBoundingClientRect().top / total) : 0;
    };

    const load = (which: "l" | "p") => {
      if (requested.has(which)) return;
      requested.add(which);
      const queue = loadOrder();
      const next = () => {
        const i = queue.shift();
        if (i === undefined || disposed) return;
        const img = new Image();
        img.decoding = "async";
        img.src = src(which, i);
        const done = () => {
          if (disposed) return;
          if (img.naturalWidth > 0) {
            sets[which][i] = img;
            if (which === set) paint(current, true);
          }
          next();
        };
        img.onload = done;
        img.onerror = done;
      };
      for (let k = 0; k < 6; k++) next();
    };

    const resize = () => {
      const w = stage.clientWidth;
      const h = stage.clientHeight;
      if (!w || !h) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      view = { w, h, dpr };
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      set = w / h < PORTRAIT_BELOW ? "p" : "l";
      load(set);
      read();
      paint(current, true);
      ui(current);
    };

    const onScroll = () => {
      read();
      kick();
    };

    read();
    current = target;
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(stage);
    window.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      disposed = true;
      ro.disconnect();
      window.removeEventListener("scroll", onScroll);
      if (raf !== null) cancelAnimationFrame(raf);
    };
  }, []);

  return (
    // The cream behind the stage is what shows under its rounded corners.
    <div ref={containerRef} className="relative h-[300vh] bg-[#f3f0eb]">
      <div
        ref={stageRef}
        className="sticky top-0 h-screen w-full overflow-hidden bg-[#0c0a09] [transform:translateZ(0)]"
      >
        {/* First frame, shown until the canvas has painted. */}
        <picture>
          <source media="(max-aspect-ratio: 17/20)" srcSet={src("p", 0)} />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={src("l", 0)}
            alt=""
            aria-hidden="true"
            fetchPriority="high"
            className="absolute inset-0 h-full w-full object-cover"
          />
        </picture>
        <canvas
          ref={canvasRef}
          role="img"
          aria-label="The Avenue Milestone towers, from below through the trees and then face-on at sunset — from the Milestone film"
          className="absolute inset-0 h-full w-full opacity-0"
        />

        {/* Keeps the header legible over bright sky. */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 top-0 h-36 bg-gradient-to-b from-black/35 to-transparent"
        />

        {/* The veil the brand line rises into. */}
        <div
          ref={veilRef}
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_top,rgba(12,10,9,0.86)_0%,rgba(12,10,9,0.55)_34%,rgba(12,10,9,0.14)_64%,rgba(12,10,9,0)_100%)]"
          style={{ opacity: 0 }}
        />

        <div className="absolute inset-x-0 bottom-0 px-6 pb-[12vh] text-center md:px-10 md:pb-[13vh]">
          <h1 className="mx-auto max-w-[1180px] font-grotesk text-[clamp(24px,3.1vw,48px)] font-normal uppercase leading-[1.08] tracking-[-0.01em] text-white">
            {HEADLINE.map((line, k) => (
              <span key={k} className="block overflow-hidden pb-[0.06em]">
                <span
                  ref={(el) => {
                    lineRefs.current[k] = el;
                  }}
                  className="block will-change-transform"
                  style={{ transform: "translate3d(0, 110%, 0)" }}
                >
                  {line.map((part, j) =>
                    part.em ? (
                      <em key={j} className="font-serif font-light italic tracking-[-0.02em] text-[#f1d4a6]">
                        {part.text}
                      </em>
                    ) : (
                      <span key={j}>{part.text}</span>
                    ),
                  )}
                </span>
              </span>
            ))}
          </h1>

          <div
            ref={detailRef}
            className="mx-auto mt-7 max-w-[640px] md:mt-8"
            style={{ opacity: 0, visibility: "hidden" }}
          >
            <p className="font-hanken text-[14px] leading-[1.7] text-white/80 md:text-[15px]">
              {company.description}
            </p>
            <div className="mt-7 flex flex-wrap items-center justify-center gap-x-8 gap-y-4">
              <Link
                href="/projects/milestone"
                className="inline-flex items-center gap-3 bg-white px-7 py-3.5 font-grotesk text-[11px] font-semibold uppercase tracking-[0.2em] text-black transition-colors duration-300 hover:bg-brand-gold"
              >
                <span>Explore Flagship</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/contact"
                className="group inline-flex items-center gap-3 font-grotesk text-[11px] font-semibold uppercase tracking-[0.2em] text-white/85 transition-colors duration-300 hover:text-brand-gold"
              >
                <span className="border-b border-white/35 pb-1 transition-colors duration-300 group-hover:border-brand-gold">
                  Schedule a Visit
                </span>
              </Link>
            </div>
          </div>
        </div>

        {/* Scroll cue, only at the very start. */}
        <div
          ref={cueRef}
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 bottom-8 flex flex-col items-center gap-2 font-grotesk text-[10px] uppercase tracking-[0.3em] text-white/75 md:bottom-10"
        >
          <span>Scroll</span>
          <ChevronDown className="h-4 w-4 animate-bounce text-brand-gold" />
        </div>
      </div>
    </div>
  );
}
