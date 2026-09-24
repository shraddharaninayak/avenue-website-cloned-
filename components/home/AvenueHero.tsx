"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { ArrowRight, ChevronDown } from "lucide-react";
import { company } from "@/data/avenue";
import { clamp01, prefersReducedMotion, smoothstep, span } from "./motion";
import { createClouds } from "./hero-clouds";

/**
 * 01 — Hero. An entrance through the clouds to The Avenue's towers.
 *
 * The page opens among towering cumulus, lit gold by a low sun, with shafts
 * of light streaming through. Scrolling flies the camera slowly into them;
 * the cloud dissolves into a warm haze, and the Milestone towers appear
 * through it, face-on at sunset, standing in low cloud that sinks below the
 * trees. Then the film itself takes over and plays on from that view.
 *
 * The building is The Avenue's own film (public/avenue-intro.mp4.mp4), from
 * its face-on shot of both towers at 14.16s — the first clean frame after the
 * cut to that view. Until the clouds clear, that same frame is shown as a still
 * (public/home-hero/front.webp, exported from the film), so the video's first
 * frame matches it exactly when playback begins. The clouds are drawn in
 * WebGL (./hero-clouds.ts); a CSS haze stands in before they are drawn, and
 * instead of them where WebGL is unavailable.
 *
 * On wide screens the film fills the stage. On upright ones (phones, tablets
 * held upright) filling it would leave one tower, cut, and lose the film's
 * centred title and captions; there the whole frame is shown as a band across
 * the upper stage, feathered into a soft, live wash of the film itself, and
 * it draws in a little as the camera approaches.
 *
 * After the clouds, the invitation — a line about The Avenue, and the two
 * ways on — rises on a veil, and the panel lifts away on rounded corners,
 * uncovering the page beneath.
 */

const VIDEO_SRC = "/avenue-hero-optimized.mp4";
/** Seconds into the film: the face-on view of both towers (0s on optimized asset). */
const FRONT_VIEW_AT = 0.0;
const POSTER = "/home-hero/front.webp";

/** Scroll progress (0..1 over the pinned stretch) at which the camera is through the clouds. */
const CLOUDS_END = 0.52;
/** Cloud progress at which the film starts to play, below which it pauses, and below which it rewinds. */
const PLAY_AT = 0.84;
const PAUSE_BELOW = 0.6;
const REWIND_BELOW = 0.3;

/**
 * Where things sit in the film's frame (0..1 from the top left): the sun, the
 * middle of the two towers, and the tree line at their feet.
 */
const SUN = { x: 0.948, y: 0.5 };
const TOWERS = { x: 0.485, y: 0.45 };
const TREE_LINE_Y = 0.66;
const FILM_ASPECT = 16 / 9;
/** Below this share of the film's width on screen, both towers no longer fit: the film is shown as a band. */
const BOTH_TOWERS_FIT = 0.7;
/** In the band, the share of the film's width on screen — both towers (14–83% of the frame), with room either side. */
const BAND_SHARE = 0.8;
/**
 * The band's centre, as a share of the stage's height: the film and the
 * invitation below it sit centred on the stage between them.
 */
const BAND_CENTRE = 0.42;
/** How far the band draws in as the camera approaches the towers. */
const APPROACH = 0.12;
/** Feathers the band into the wash around it. */
const BAND_MASK = "linear-gradient(to bottom, transparent 0%, #000 17%, #000 80%, transparent 100%)";

export default function AvenueHero() {
  const containerRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef<HTMLDivElement>(null);
  const washRef = useRef<HTMLCanvasElement>(null);
  const posterRef = useRef<HTMLImageElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const cloudRef = useRef<HTMLCanvasElement>(null);
  const hazeRef = useRef<HTMLDivElement>(null);
  const veilRef = useRef<HTMLDivElement>(null);
  const detailRef = useRef<HTMLDivElement>(null);
  const cueRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    const stage = stageRef.current;
    const frame = frameRef.current;
    const wash = washRef.current;
    const poster = posterRef.current;
    const video = videoRef.current;
    const canvas = cloudRef.current;
    const haze = hazeRef.current;
    if (!container || !stage || !frame || !wash || !poster || !video || !canvas || !haze) return;

    const reduce = prefersReducedMotion();
    let view = { w: 0, h: 0 };
    let sun: [number, number] = [SUN.x, 1 - SUN.y];
    let focus: [number, number] = [TOWERS.x, 1 - TOWERS.y];
    let tree = 1 - TREE_LINE_Y;
    let floor = 0;
    let band = false;
    let target = 0;
    let current = 0;
    let raf: number | null = null;
    let inView = true;

    // ---- The wash around the band -----------------------------------------
    // The film drawn tiny and stretched to the stage (blurred in CSS): the top
    // of its frame above the band, the foot of it below, following every cut.
    const washCtx = wash.getContext("2d", { alpha: false });
    wash.width = 32;
    wash.height = 24;
    let lastWash = 0;
    const paintWash = () => {
      if (!band || !washCtx) return;
      const now = typeof performance !== "undefined" ? performance.now() : Date.now();
      if (now - lastWash < 60) return; // Throttled to ~16fps to prevent CPU/GPU stalls on mobile
      lastWash = now;
      const showingFilm = video.style.opacity === "1" && video.readyState >= 2;
      const src = showingFilm ? video : poster;
      const sw = showingFilm ? video.videoWidth : poster.naturalWidth;
      const sh = showingFilm ? video.videoHeight : poster.naturalHeight;
      if (!sw || !sh) return;
      const { width: W, height: H } = wash;
      try {
        washCtx.drawImage(src, 0, 0, sw, sh * 0.3, 0, 0, W, H / 2);
        washCtx.drawImage(src, 0, sh * 0.75, sw, sh * 0.25, 0, H / 2, W, H / 2);
      } catch {
        // Not decodable yet; the next frame paints it.
      }
    };
    let frameCb: number | null = null;
    const onVideoFrame = () => {
      frameCb = null;
      paintWash();
      followFilm();
    };
    // Repaints on each new frame while the film plays in the band.
    const followFilm = () => {
      if (frameCb !== null || !band || !inView || video.paused) return;
      if (typeof video.requestVideoFrameCallback === "function") {
        frameCb = video.requestVideoFrameCallback(onVideoFrame);
      }
    };
    const onPosterLoad = () => paintWash();
    poster.addEventListener("load", onPosterLoad);

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
    // The cloud is ray-marched: if a device cannot hold the frame rate, it is
    // drawn at a lower resolution rather than stutter.
    let lastFrame = 0;
    let frameTime = 16;
    let framesSeen = 0;
    const cloudProgress = (p: number) => clamp01(p / CLOUDS_END);

    const cloudFrame = (now: number) => {
      cloudRaf = null;
      if (!clouds || !inView) return;
      const dt = now - lastFrame;
      lastFrame = now;
      if (dt > 0 && dt < 250) {
        frameTime += (dt - frameTime) * 0.1;
        if (++framesSeen > 24 && frameTime > 26) {
          framesSeen = 0;
          frameTime = 16;
          clouds.degrade();
        }
      }
      const c = cloudProgress(current);
      if (c >= 1) {
        canvas.style.visibility = "hidden";
        return;
      }
      // While the page is still, the drift is drawn at half rate.
      skip = current === target && cloudsDrawn ? !skip : false;
      if (!skip) {
        canvas.style.visibility = "visible";
        clouds.draw(c, reduce ? 0 : now / 1000, sun, focus, tree, floor, reduce);
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
      if (video.currentTime > 0.05) video.currentTime = 0;
    };
    // Shown once it holds a frame; it holds the poster's own frame until it plays.
    const reveal = () => {
      if (video.readyState >= 2) video.style.opacity = "1";
      paintWash();
      followFilm();
    };
    const onMeta = () => toFrontView();
    const onEnded = () => {
      toFrontView();
      film(true);
    };
    // Where frame callbacks are unsupported, the wash follows the film a few
    // times a second instead — it is a blur, so that is enough.
    const onTimeUpdate = () => {
      if (typeof video.requestVideoFrameCallback !== "function") paintWash();
    };
    video.addEventListener("loadedmetadata", onMeta);
    video.addEventListener("loadeddata", reveal);
    video.addEventListener("seeked", reveal);
    video.addEventListener("playing", reveal);
    video.addEventListener("ended", onEnded);
    video.addEventListener("timeupdate", onTimeUpdate);
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

      const detail = span(0.62, 0.76, p);
      if (detailRef.current) {
        detailRef.current.style.opacity = detail.toFixed(3);
        detailRef.current.style.transform = `translate3d(0, ${((1 - detail) * 16).toFixed(1)}px, 0)`;
        detailRef.current.style.pointerEvents = detail > 0.6 ? "auto" : "none";
        detailRef.current.style.visibility = detail > 0.01 ? "visible" : "hidden";
      }

      if (cueRef.current) cueRef.current.style.opacity = (1 - span(0.01, 0.07, p)).toFixed(3);

      // In the band, the towers draw in as the camera approaches them.
      frame.style.transform = band
        ? `scale(${(1 + APPROACH * smoothstep(0.28, 1, p)).toFixed(4)})`
        : "";

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

    // Frames the film: filling the stage while both towers fit across it; on
    // upright screens, whole, as a band. The sun's place on screen lights the
    // clouds, and the towers' place is where the camera flies.
    const resize = () => {
      const w = stage.clientWidth;
      const h = stage.clientHeight;
      if (!w || !h) return;
      view = { w, h };
      band = w / (h * FILM_ASPECT) < BOTH_TOWERS_FIT;

      // The film's frame on screen: left, top, width, height.
      let fx: number;
      let fy: number;
      let fw: number;
      let fh: number;
      if (band) {
        fw = w / BAND_SHARE;
        fh = fw / FILM_ASPECT;
        fx = (w - fw) / 2;
        fy = h * BAND_CENTRE - fh / 2;
        frame.style.inset = "auto";
        frame.style.left = `${fx.toFixed(1)}px`;
        frame.style.top = `${fy.toFixed(1)}px`;
        frame.style.width = `${fw.toFixed(1)}px`;
        frame.style.height = `${fh.toFixed(1)}px`;
        frame.style.transformOrigin = `${TOWERS.x * 100}% ${TOWERS.y * 100}%`;
        frame.style.setProperty("mask-image", BAND_MASK);
        frame.style.setProperty("-webkit-mask-image", BAND_MASK);
      } else {
        // Covering the stage, centred.
        fw = Math.max(w, h * FILM_ASPECT);
        fh = fw / FILM_ASPECT;
        fx = (w - fw) / 2;
        fy = (h - fh) / 2;
        frame.style.cssText = "";
      }
      wash.style.display = band ? "block" : "none";

      const toScreen = (x: number, y: number): [number, number] => [
        (fx + x * fw) / w,
        1 - (fy + y * fh) / h,
      ];
      sun = toScreen(SUN.x, SUN.y);
      focus = toScreen(TOWERS.x, TOWERS.y);
      tree = toScreen(0, TREE_LINE_Y)[1];
      floor = toScreen(0, 1)[1];
      clouds?.resize(w, h);
      read();
      ui(current);
      paintWash();
      followFilm();
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
      followFilm();
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
      video.removeEventListener("timeupdate", onTimeUpdate);
      poster.removeEventListener("load", onPosterLoad);
      if (frameCb !== null && typeof video.cancelVideoFrameCallback === "function") {
        video.cancelVideoFrameCallback(frameCb);
      }
      video.pause();
      if (raf !== null) cancelAnimationFrame(raf);
      if (cloudRaf !== null) cancelAnimationFrame(cloudRaf);
      clouds?.dispose();
    };
  }, []);

  return (
    // The cream behind the stage is what shows under its rounded corners.
    <div ref={containerRef} className="relative h-[330vh] bg-[#F4F1E8]">
      <div
        ref={stageRef}
        data-header="clear"
        className="sticky top-0 h-screen w-full overflow-hidden bg-[#2D3A1F] [transform:translateZ(0)]"
      >
        {/* Upright screens only: a soft wash of the film around its band. */}
        <canvas
          ref={washRef}
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 h-full w-full scale-[1.35] blur-2xl brightness-[0.85] saturate-[1.15]"
          style={{ display: "none" }}
        />

        {/* The towers: the film's face-on frame, then the film itself. */}
        <div
          ref={frameRef}
          role="img"
          aria-label="The Avenue Milestone towers, face-on at sunset, emerging from the clouds — from the Milestone film"
          className="absolute inset-0 will-change-transform"
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
              "radial-gradient(ellipse 65% 60% at 4% 6%, rgba(197,167,106,0.5), rgba(197,167,106,0) 70%), linear-gradient(to bottom right, #F4F1E8 0%, #B8A678 38%, #5F684F 70%, #2D3A1F 100%)",
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

        {/* The veil the invitation rises into. */}
        <div
          ref={veilRef}
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_top,rgba(31,41,51,0.86)_0%,rgba(31,41,51,0.55)_34%,rgba(31,41,51,0.14)_64%,rgba(31,41,51,0)_100%)]"
          style={{ opacity: 0 }}
        />

        {/* Kept clear of a phone's browser bars: 100lvh − 100svh is their
            height where they overlay the page, and 0 everywhere else. */}
        <div className="absolute inset-x-0 bottom-0 px-6 pb-[12vh] text-center supports-[height:100svh]:pb-[calc(100lvh-100svh+10vh)] md:px-10 md:pb-[13vh] md:supports-[height:100svh]:pb-[13vh]">
          {/* The film carries the brand line; the page keeps a heading of its own. */}
          <h1 className="sr-only">{company.name}</h1>

          <div
            ref={detailRef}
            className="mx-auto max-w-[640px]"
            style={{ opacity: 0, visibility: "hidden" }}
          >
            <p className="font-hanken text-[14px] leading-[1.7] text-white/80 md:text-[15px]">
              {company.description}
            </p>
            <div className="mt-7 flex flex-wrap items-center justify-center gap-x-8 gap-y-4">
              <Link
                href="/projects/milestone"
                className="inline-flex items-center gap-3 bg-white px-7 py-3.5 font-grotesk text-[11px] font-semibold uppercase tracking-[0.2em] text-[#2D3A1F] transition-colors duration-300 hover:bg-[#B8A678] hover:text-white"
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
          className="pointer-events-none absolute inset-x-0 bottom-8 flex flex-col items-center gap-2 font-grotesk text-[10px] font-medium uppercase tracking-[0.3em] text-[#F4F1E8] supports-[height:100svh]:bottom-[calc(100lvh-100svh+2rem)] md:bottom-10 md:supports-[height:100svh]:bottom-10"
        >
          <span>Scroll</span>
          <ChevronDown className="h-4 w-4 animate-bounce text-brand-gold" />
        </div>
      </div>
    </div>
  );
}
