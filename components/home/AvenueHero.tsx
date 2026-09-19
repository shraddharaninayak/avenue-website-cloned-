"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { ArrowRight, ChevronDown } from "lucide-react";
import { company } from "@/data/avenue";
import { clamp01, easeOut, prefersReducedMotion, smoothstep, span } from "./motion";
import { createClouds } from "./hero-clouds";

/**
 * 01 — Hero. An entrance through the clouds to The Avenue's towers.
 *
 * The page opens in warm, sunlit cloud. Scrolling carries the camera through
 * it: banks swell past and part, the haze thins, and the Milestone towers,
 * face-on at sunset, rise out of a last bank of low cloud as it sinks below
 * the trees. Then the film itself takes over and plays on from that view.
 *
 * The building is The Avenue's own film (public/avenue-intro.mp4.mp4), from
 * its face-on shot of both towers at 14.16s — the first clean frame after the
 * cut to that view. Until the clouds clear, that same frame is shown as a still
 * (public/home-hero/front.webp, exported from the film), so the video's first
 * frame matches it exactly when playback begins. The clouds are drawn in
 * WebGL (./hero-clouds.ts); a CSS haze stands in before they are drawn, and
 * instead of them where WebGL is unavailable.
 *
 * After the clouds, the brand line rises on a veil as before, and the panel
 * lifts away on rounded corners, uncovering the page beneath.
 */

const VIDEO_SRC = "/avenue-intro.mp4.mp4";
/** Seconds into the film: the face-on view of both towers. */
const FRONT_VIEW_AT = 14.16;
const POSTER = "/home-hero/front.webp";

/** Scroll progress (0..1 over the pinned stretch) at which the camera is through the clouds. */
const CLOUDS_END = 0.46;
/** Cloud progress at which the film starts to play, below which it pauses, and below which it rewinds. */
const PLAY_AT = 0.84;
const PAUSE_BELOW = 0.6;
const REWIND_BELOW = 0.3;

/** Where the sun and the right-hand tower sit in the film's frame (0..1 from the top left). */
const SUN = { x: 0.948, y: 0.5 };
const RIGHT_TOWER_X = 0.705;
const FILM_ASPECT = 16 / 9;
/** Below this share of the film's width on screen, both towers no longer fit. */
const BOTH_TOWERS_FIT = 0.7;

const HEADLINE: { text: string; em?: boolean }[][] = [
  [{ text: "Introducing you to a life you've " }, { text: "aspired for,", em: true }],
  [{ text: "and " }, { text: "world-class designs", em: true }, { text: " you've" }],
  [{ text: "always " }, { text: "yearned for.", em: true }],
];

export default function AvenueHero() {
  const containerRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const posterRef = useRef<HTMLImageElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const cloudRef = useRef<HTMLCanvasElement>(null);
  const hazeRef = useRef<HTMLDivElement>(null);
  const veilRef = useRef<HTMLDivElement>(null);
  const lineRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const detailRef = useRef<HTMLDivElement>(null);
  const cueRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    const stage = stageRef.current;
    const poster = posterRef.current;
    const video = videoRef.current;
    const canvas = cloudRef.current;
    const haze = hazeRef.current;
    if (!container || !stage || !poster || !video || !canvas || !haze) return;

    const reduce = prefersReducedMotion();
    let view = { w: 0, h: 0 };
    let sun: [number, number] = [SUN.x, 1 - SUN.y];
    let target = 0;
    let current = 0;
    let raf: number | null = null;
    let inView = true;

    // ---- The clouds ------------------------------------------------------
    let clouds = null as ReturnType<typeof createClouds>;
    try {
      clouds = createClouds(canvas);
    } catch {
      clouds = null;
    }
    let cloudRaf: number | null = null;
    let cloudsDrawn = false;
    let skip = false;
    const cloudProgress = (p: number) => clamp01(p / CLOUDS_END);

    const cloudFrame = (now: number) => {
      cloudRaf = null;
      if (!clouds || !inView) return;
      const c = cloudProgress(current);
      if (c >= 1) {
        canvas.style.visibility = "hidden";
        return;
      }
      // While the page is still, the drift is drawn at half rate.
      skip = current === target && cloudsDrawn ? !skip : false;
      if (!skip) {
        canvas.style.visibility = "visible";
        clouds.draw(c, reduce ? 0 : now / 1000, sun, reduce);
      }
      if (!cloudsDrawn) {
        cloudsDrawn = true;
        // The drawn clouds take over from the CSS haze.
        haze.style.opacity = "0";
      }
      cloudRaf = requestAnimationFrame(cloudFrame);
    };
    const wakeClouds = () => {
      if (clouds && cloudRaf === null && inView && cloudProgress(current) < 1) {
        cloudRaf = requestAnimationFrame(cloudFrame);
      }
    };
    const onContextLost = (e: Event) => {
      e.preventDefault();
      clouds = null;
      canvas.style.visibility = "hidden";
      haze.style.transition = "none";
      ui(current);
    };
    canvas.addEventListener("webglcontextlost", onContextLost);

    // ---- The film ----------------------------------------------------------
    video.muted = true;
    video.defaultMuted = true;
    const toFrontView = () => {
      if (Math.abs(video.currentTime - FRONT_VIEW_AT) > 0.05) video.currentTime = FRONT_VIEW_AT;
    };
    // Shown once it holds a frame; it holds the poster's own frame until it plays.
    const reveal = () => {
      if (video.readyState >= 2) video.style.opacity = "1";
    };
    const onMeta = () => toFrontView();
    const onEnded = () => {
      toFrontView();
      film(true);
    };
    video.addEventListener("loadedmetadata", onMeta);
    video.addEventListener("loadeddata", reveal);
    video.addEventListener("seeked", reveal);
    video.addEventListener("playing", reveal);
    video.addEventListener("ended", onEnded);
    // It may have loaded before this ran.
    if (video.readyState >= 1) toFrontView();
    reveal();

    let wantPlay = false;
    const film = (force = false) => {
      const c = cloudProgress(current);
      if (c >= PLAY_AT) wantPlay = true;
      else if (c < PAUSE_BELOW) wantPlay = false;
      // With reduced motion the film stays on its face-on frame.
      const play = wantPlay && inView && !reduce;
      if (play && (video.paused || force)) {
        video.play().catch(() => {
          // Autoplay refused (e.g. low-power mode): the face-on still remains.
        });
      } else if (!play && !video.paused) {
        video.pause();
      }
      // Back in thick cloud: rewind unseen, so the way out shows the same view.
      if (c < REWIND_BELOW && video.paused && video.readyState >= 1) toFrontView();
    };

    // ---- The page side -------------------------------------------------------
    const ui = (p: number) => {
      const c = cloudProgress(p);
      // Until the clouds are drawn (or without them), the CSS haze thins with scroll.
      if (!clouds || !cloudsDrawn) haze.style.opacity = (1 - smoothstep(0.15, 0.85, c)).toFixed(3);

      const veil = smoothstep(0.5, 0.76, p);
      if (veilRef.current) veilRef.current.style.opacity = veil.toFixed(3);

      lineRefs.current.forEach((line, k) => {
        if (!line) return;
        const rise = easeOut(span(0.56 + k * 0.045, 0.72 + k * 0.045, p));
        line.style.transform = `translate3d(0, ${((1 - rise) * 110).toFixed(2)}%, 0)`;
      });

      const detail = span(0.7, 0.82, p);
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
      ui(current);
      film();
      wakeClouds();
      if (current !== target) raf = requestAnimationFrame(tick);
    };
    const kick = () => {
      if (raf === null) raf = requestAnimationFrame(tick);
    };

    const read = () => {
      const total = container.offsetHeight - stage.offsetHeight;
      target = total > 0 ? clamp01(-container.getBoundingClientRect().top / total) : 0;
    };

    // Frames the film: centred while both towers fit; on narrower screens, the
    // right-hand tower with the sun. The sun's place on screen lights the clouds.
    const resize = () => {
      const w = stage.clientWidth;
      const h = stage.clientHeight;
      if (!w || !h) return;
      view = { w, h };
      let x = 0.5;
      let sunX: number;
      let sunY: number;
      if (w / h >= FILM_ASPECT) {
        const shownH = w / FILM_ASPECT;
        sunX = SUN.x;
        sunY = ((h - shownH) / 2 + SUN.y * shownH) / h;
      } else {
        const shownW = h * FILM_ASPECT;
        if (w / shownW < BOTH_TOWERS_FIT) x = clamp01((RIGHT_TOWER_X * shownW - w / 2) / (shownW - w));
        sunX = ((w - shownW) * x + SUN.x * shownW) / w;
        sunY = SUN.y;
      }
      const position = `${(x * 100).toFixed(2)}% 50%`;
      poster.style.objectPosition = position;
      video.style.objectPosition = position;
      sun = [sunX, 1 - sunY];
      clouds?.resize(w, h);
      read();
      ui(current);
      wakeClouds();
    };

    const onScroll = () => {
      read();
      kick();
    };

    // Nothing plays or draws while the hero is off screen.
    const io = new IntersectionObserver(([entry]) => {
      inView = entry.isIntersecting;
      film();
      wakeClouds();
    });
    io.observe(stage);

    read();
    current = target;
    resize();
    film();
    const ro = new ResizeObserver(resize);
    ro.observe(stage);
    window.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      ro.disconnect();
      io.disconnect();
      window.removeEventListener("scroll", onScroll);
      canvas.removeEventListener("webglcontextlost", onContextLost);
      video.removeEventListener("loadedmetadata", onMeta);
      video.removeEventListener("loadeddata", reveal);
      video.removeEventListener("seeked", reveal);
      video.removeEventListener("playing", reveal);
      video.removeEventListener("ended", onEnded);
      video.pause();
      if (raf !== null) cancelAnimationFrame(raf);
      if (cloudRaf !== null) cancelAnimationFrame(cloudRaf);
      clouds?.dispose();
    };
  }, []);

  return (
    // The cream behind the stage is what shows under its rounded corners.
    <div ref={containerRef} className="relative h-[330vh] bg-[#f3f0eb]">
      <div
        ref={stageRef}
        className="sticky top-0 h-screen w-full overflow-hidden bg-[#0c0a09] [transform:translateZ(0)]"
      >
        {/* The towers: the film's face-on frame, then the film itself. */}
        <div
          role="img"
          aria-label="The Avenue Milestone towers, face-on at sunset, emerging from the clouds — from the Milestone film"
          className="absolute inset-0"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            ref={posterRef}
            src={POSTER}
            alt=""
            fetchPriority="high"
            className="absolute inset-0 h-full w-full object-cover"
          />
          <video
            ref={videoRef}
            src={`${VIDEO_SRC}#t=${FRONT_VIEW_AT}`}
            muted
            playsInline
            preload="auto"
            disablePictureInPicture
            aria-hidden="true"
            tabIndex={-1}
            className="absolute inset-0 h-full w-full object-cover"
            style={{ opacity: 0 }}
          />
        </div>

        {/* The clouds. Before they are drawn (and without WebGL), a CSS haze stands in. */}
        <div
          ref={hazeRef}
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 transition-opacity duration-700 ease-out"
          style={{
            background:
              "radial-gradient(ellipse 55% 60% at 92% 52%, rgba(255,214,160,0.55), rgba(255,214,160,0) 70%), linear-gradient(to bottom, #b3a89f 0%, #d2c3b2 24%, #e2d3c1 55%, #dccbb6 82%, #c7b59f 100%)",
          }}
        />
        <canvas
          ref={cloudRef}
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 h-full w-full"
          style={{ visibility: "hidden" }}
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

        {/* Scroll cue, only at the very start — over the cloud, so in a dark taupe. */}
        <div
          ref={cueRef}
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 bottom-8 flex flex-col items-center gap-2 font-grotesk text-[10px] font-medium uppercase tracking-[0.3em] text-[#5a4a3c] md:bottom-10"
        >
          <span>Scroll</span>
          <ChevronDown className="h-4 w-4 animate-bounce text-brand-gold" />
        </div>
      </div>
    </div>
  );
}
