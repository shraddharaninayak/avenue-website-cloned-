"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowRight, ChevronDown } from "lucide-react";

const TOTAL_FRAMES = 233;

/**
 * The hero is one continuous camera move driven by scroll:
 *
 *   clouds -> break through -> The Avenue appears -> approach -> arrive inside
 *
 * Two sources feed it. The existing /seq/d frame sequence supplies the two
 * live-action ends of the journey: frames 1-34 are pure cloud, and frames
 * 165-233 walk along the balcony and into the living room. The middle of the
 * old sequence showed a different tower, so the building beat is now the real
 * Avenue render, flown as a virtual camera (push + drift) over the still.
 * Only the frames actually used are preloaded.
 */
const SHOT = {
  /** Pure cloud frames — the tower starts bleeding through at 35. */
  cloudFirst: 1,
  cloudLast: 34,
  /** Balcony walk-in, then the living room — held apart so the walk plays out. */
  walkFirst: 165,
  walkLast: 176,
  interiorFirst: 177,
  interiorLast: TOTAL_FRAMES,
  /** Progress at which the walk-in hands over to the interior. */
  walkUntil: 0.9,
  /** Clouds thin out and The Avenue resolves through them across this span. */
  revealFrom: 0.3,
  revealTo: 0.44,
  /** Cross-fade from the building into the balcony walk. */
  arriveFrom: 0.8,
  arriveTo: 0.87,
  /** Virtual camera over the Avenue still. */
  zoomFrom: 1.02,
  zoomTo: 1.7,
  /** Normalised focus point: frame centre -> down toward the tower bases. */
  focusFrom: [0.5, 0.5] as const,
  focusTo: [0.44, 0.66] as const,
} as const;

const AVENUE_SRC = "/hero-mobile-2026.webp";

const clamp01 = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v);
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
/** Normalised position of p inside [a,b]. */
const span = (a: number, b: number, p: number) => clamp01((p - a) / (b - a));
const easeInOut = (t: number) =>
  t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);

const overlays = [
  {
    from: 0.02,
    to: 0.16,
    headline: "You are the Creator\nOf your life.",
  },
  {
    from: 0.24,
    to: 0.38,
    headline: "You Always\n Matter.",
  },
  {
    from: 0.46,
    to: 0.62,
    headline: "A Home is a place to\n start your story.",
  },
  {
    from: 0.78,
    to: 0.96,
    headline: "WELCOME\nHOME.",
    cta: true,
  },
];

export default function HeroCanvas() {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imagesRef = useRef<(HTMLImageElement | undefined)[]>([]);
  const avenueRef = useRef<HTMLImageElement | null>(null);
  const progressRef = useRef(0);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [loadedCount, setLoadedCount] = useState(0);
  const animationFrameRef = useRef<number | null>(null);

  /** Nearest loaded frame to `n`, so a not-yet-decoded frame never flashes black. */
  const frameAt = (n: number): HTMLImageElement | null => {
    const images = imagesRef.current;
    const target = Math.round(n);
    for (let d = 0; d <= 8; d++) {
      for (const i of d === 0 ? [target] : [target - d, target + d]) {
        const img = images[i - 1];
        if (img && img.complete && img.naturalWidth > 0) return img;
      }
    }
    return null;
  };

  /** Draw `img` covering the canvas, scaled by `zoom` about a normalised focus point. */
  const drawCover = (
    ctx: CanvasRenderingContext2D,
    img: HTMLImageElement,
    zoom: number,
    fx: number,
    fy: number,
    alpha: number,
  ) => {
    const W = ctx.canvas.width;
    const H = ctx.canvas.height;
    const scale =
      Math.max(W / img.naturalWidth, H / img.naturalHeight) * zoom;
    const dw = img.naturalWidth * scale;
    const dh = img.naturalHeight * scale;
    // Put the focus point at the canvas centre, then clamp so the frame edges
    // can never slide into view.
    const dx = Math.max(W - dw, Math.min(0, W / 2 - dw * fx));
    const dy = Math.max(H - dh, Math.min(0, H / 2 - dh * fy));
    ctx.globalAlpha = alpha;
    ctx.drawImage(img, dx, dy, dw, dh);
    ctx.globalAlpha = 1;
  };

  /**
   * The Avenue render is shot at blue hour; the cloud and interior frames are
   * golden dusk. This warms it so the journey reads as one time of day.
   */
  const gradeAvenue = (ctx: CanvasRenderingContext2D, alpha: number) => {
    const W = ctx.canvas.width;
    const H = ctx.canvas.height;
    ctx.save();
    ctx.globalCompositeOperation = "soft-light";
    ctx.globalAlpha = 0.75 * alpha;
    const warm = ctx.createLinearGradient(0, 0, 0, H);
    warm.addColorStop(0, "#e8a54e");
    warm.addColorStop(0.42, "#a8703a");
    warm.addColorStop(1, "#1d2b40");
    ctx.fillStyle = warm;
    ctx.fillRect(0, 0, W, H);
    ctx.globalCompositeOperation = "overlay";
    ctx.globalAlpha = 0.18 * alpha;
    ctx.fillStyle = "#d8933f";
    ctx.fillRect(0, 0, W, H);
    ctx.restore();
  };

  const renderScene = useCallback((p: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const W = canvas.width;
    const H = canvas.height;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.globalCompositeOperation = "source-over";
    ctx.globalAlpha = 1;
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";
    ctx.fillStyle = "#000000";
    ctx.fillRect(0, 0, W, H);

    // --- 1. CLOUDS: forward travel, held until the building has resolved.
    if (p < SHOT.revealTo) {
      const t = span(0, SHOT.revealFrom, p);
      const cloud = frameAt(
        lerp(SHOT.cloudFirst, SHOT.cloudLast, easeOut(t)),
      );
      if (cloud) drawCover(ctx, cloud, 1 + 0.07 * t, 0.5, 0.5, 1);
    }

    // --- 2/3/4. THE AVENUE: resolves out of the cloud, then one continuous push.
    let avenueAlpha = span(SHOT.revealFrom, SHOT.revealTo, p);
    if (p >= SHOT.arriveFrom) {
      avenueAlpha *= 1 - span(SHOT.arriveFrom, SHOT.arriveTo, p);
    }
    const avenue = avenueRef.current;
    if (avenueAlpha > 0.001 && avenue?.complete && avenue.naturalWidth > 0) {
      // Camera keeps travelling for the whole time the building is on screen,
      // so the cut to the balcony lands mid-move rather than on a static hold.
      const travel = easeInOut(span(SHOT.revealFrom, SHOT.arriveTo, p));
      drawCover(
        ctx,
        avenue,
        lerp(SHOT.zoomFrom, SHOT.zoomTo, travel),
        lerp(SHOT.focusFrom[0], SHOT.focusTo[0], travel),
        lerp(SHOT.focusFrom[1], SHOT.focusTo[1], travel),
        avenueAlpha,
      );
      gradeAvenue(ctx, avenueAlpha);
    }

    // --- 5. ARRIVAL: walk the balcony, then settle into the living room.
    if (p >= SHOT.arriveFrom) {
      const arrival = frameAt(
        p < SHOT.walkUntil
          ? lerp(
              SHOT.walkFirst,
              SHOT.walkLast,
              span(SHOT.arriveFrom, SHOT.walkUntil, p),
            )
          : lerp(
              SHOT.interiorFirst,
              SHOT.interiorLast,
              span(SHOT.walkUntil, 1, p),
            ),
      );
      if (arrival) {
        drawCover(
          ctx,
          arrival,
          1,
          0.5,
          0.5,
          span(SHOT.arriveFrom, SHOT.arriveTo, p),
        );
      }
    }

    // Cinematic vignette, tying the three sources into one look.
    const vig = ctx.createRadialGradient(
      W / 2,
      H * 0.46,
      Math.min(W, H) * 0.3,
      W / 2,
      H * 0.5,
      Math.max(W, H) * 0.78,
    );
    vig.addColorStop(0, "rgba(0,0,0,0)");
    vig.addColorStop(1, "rgba(0,0,0,0.32)");
    ctx.fillStyle = vig;
    ctx.fillRect(0, 0, W, H);

    // Subtle dark gradient overlay on canvas for readability
    const gradient = ctx.createLinearGradient(0, H * 0.5, 0, H);
    gradient.addColorStop(0, "rgba(12, 10, 9, 0)");
    gradient.addColorStop(1, "rgba(12, 10, 9, 0.65)");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, W, H);
  }, []);

  // Preload: only the frames the journey actually uses, plus the Avenue render.
  useEffect(() => {
    const images: (HTMLImageElement | undefined)[] = new Array(TOTAL_FRAMES);
    const wanted: number[] = [];
    for (let i = SHOT.cloudFirst; i <= SHOT.cloudLast; i++) wanted.push(i);
    for (let i = SHOT.walkFirst; i <= SHOT.interiorLast; i++) wanted.push(i);

    let loaded = 0;
    const onLoad = () => {
      loaded++;
      if (loaded % 10 === 0 || loaded === wanted.length) setLoadedCount(loaded);
      requestAnimationFrame(() => renderScene(progressRef.current));
    };

    for (const i of wanted) {
      const img = new Image();
      img.src = `/seq/d/${String(i).padStart(4, "0")}.webp`;
      img.onload = onLoad;
      images[i - 1] = img;
    }
    imagesRef.current = images;

    const avenue = new Image();
    avenue.src = AVENUE_SRC;
    avenue.onload = () =>
      requestAnimationFrame(() => renderScene(progressRef.current));
    avenueRef.current = avenue;
  }, [renderScene]);

  // Scroll handler
  useEffect(() => {
    const handleScroll = () => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const totalScroll =
        containerRef.current.offsetHeight - window.innerHeight;
      const currentScroll = -rect.top;
      const progress =
        totalScroll > 0
          ? Math.max(0, Math.min(1, currentScroll / totalScroll))
          : 0;

      progressRef.current = progress;
      setScrollProgress(progress);

      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }

      animationFrameRef.current = requestAnimationFrame(() =>
        renderScene(progress),
      );
    };

    const handleResize = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      // Cap the backing store at 2x: the sources are 1600x900, so a 3x buffer
      // costs fill rate without adding detail.
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      renderScene(progressRef.current);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", handleResize);
    handleResize();
    handleScroll();

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleResize);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [renderScene]);

  return (
    <div ref={containerRef} className="relative h-[420vh] bg-black">
      {/* Sticky Canvas Viewport */}
      <div className="sticky top-0 h-screen w-full overflow-hidden">
        <canvas
          ref={canvasRef}
          className="absolute inset-0 h-full w-full object-cover"
        />

        {/* Dynamic Overlays */}
        <div className="absolute inset-0 pointer-events-none flex items-end justify-start px-6 pb-10 md:px-12 md:pb-14 lg:px-16 lg:pb-16">
          {overlays.map((item, idx) => {
            const midpoint = (item.from + item.to) / 2;
            const halfSpan = (item.to - item.from) / 2;
            const dist = Math.abs(scrollProgress - midpoint);
            const opacity = Math.max(0, 1 - dist / halfSpan);

            if (opacity <= 0.01) return null;

            return (
              <div
                key={idx}
                style={{
                  opacity,
                  transform: `translateY(${(1 - opacity) * 25}px)`,
                }}
                className="max-w-3xl transition-transform duration-100 ease-out"
              >
                <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-grotesk font-normal uppercase leading-[0.98] tracking-tight text-white whitespace-pre-line drop-shadow-2xl">
                  {item.headline}
                </h1>

                {item.cta && (
                  <div className="mt-8 flex flex-wrap items-center gap-4 pointer-events-auto">
                    <Link
                      href="/the-one"
                      className="inline-flex items-center gap-3 bg-white px-8 py-4 font-grotesk text-xs font-semibold uppercase tracking-[0.2em] text-black hover:bg-brand-gold transition-colors duration-300 shadow-xl"
                    >
                      <span>Explore Flagship</span>
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                    <Link
                      href="/contact"
                      className="inline-flex items-center gap-3 border border-white/40 px-8 py-4 font-grotesk text-xs font-semibold uppercase tracking-[0.2em] text-white hover:border-brand-gold hover:text-brand-gold transition-colors duration-300 backdrop-blur-sm"
                    >
                      <span>Schedule a Visit</span>
                    </Link>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Scroll Indicator */}
        <div
          className={`absolute bottom-8 right-8 md:right-16 flex items-center gap-3 text-white/50 text-[11px] font-grotesk uppercase tracking-[0.25em] transition-opacity duration-500 pointer-events-none ${
            scrollProgress > 0.85 ? "opacity-0" : "opacity-100"
          }`}
        >
          <span>Scroll to explore</span>
          <ChevronDown className="w-4 h-4 animate-bounce text-brand-gold" />
        </div>
      </div>
    </div>
  );
}
