"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";

const VIDEO_SRC = "/avenue-intro.mp4.mp4";

/**
 * One video, one wordmark, no crossfades.
 *
 * The section is a single full-screen <video> with an opaque black panel on
 * top of it. The AVENUE wordmark is knocked out of that panel with an SVG
 * mask, so the letters are literal holes: the video is only ever visible
 * through them, and everything outside stays black. Scrolling scales the
 * holes, so the "video inside the letters" and the eventual full-screen video
 * are the same pixels the whole way through — there is no second copy to drift
 * out of alignment, and nothing to cross-dissolve.
 *
 * A white panel sits between the video and the knockout. While it is opaque
 * the holes read as solid white letters; fading it out fills the exact same
 * letterforms with the video.
 */

/** Scale the letterforms reach by the end of the section. */
const MAX_ZOOM = 40;

const clamp01 = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v);
const span = (a: number, b: number, p: number) => clamp01((p - a) / (b - a));
const smoothstep = (a: number, b: number, p: number) => {
  const t = span(a, b, p);
  return t * t * (3 - 2 * t);
};

export default function AvenueIntro() {
  const sectionRef = useRef<HTMLElement>(null);
  const lettersRef = useRef<SVGGElement>(null);
  const knockoutRef = useRef<SVGRectElement>(null);
  const whiteRef = useRef<HTMLDivElement>(null);
  const videoWrapRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  const targetRef = useRef(0);
  const currentRef = useRef(0);
  const rafRef = useRef<number | null>(null);

  // Seeded to a fixed size so the server and the first client render agree;
  // the real viewport is measured in an effect straight after mount.
  const [size, setSize] = useState({ w: 1600, h: 900 });

  // useId can emit colons, which are not safe inside url(#...).
  const maskId = `avenue-knockout-${useId().replace(/[^a-zA-Z0-9]/g, "")}`;

  const cx = size.w / 2;
  const cy = size.h / 2;
  // Large and dominant, but never taller than the viewport can hold.
  const fontSize = Math.min(size.w * 0.168, size.h * 0.46);

  const apply = useCallback(
    (p: number) => {
      const letters = lettersRef.current;
      const knockout = knockoutRef.current;
      const white = whiteRef.current;
      const videoWrap = videoWrapRef.current;
      if (!letters || !knockout || !white || !videoWrap) return;

      // Exponential growth: moving toward something at a steady speed doubles
      // its size at a steady rate, so this reads as travel rather than a
      // linear CSS zoom. The p^1.3 shaping holds the opening composition a
      // beat longer, then lets the letterforms run away with the frame.
      const zoom = Math.pow(MAX_ZOOM, Math.pow(p, 1.3));
      letters.setAttribute(
        "transform",
        `translate(${cx} ${cy}) scale(${zoom}) translate(${-cx} ${-cy})`,
      );

      // White letters fill with video.
      white.style.opacity = String(1 - smoothstep(0.1, 0.26, p));

      // By now the holes cover most of the frame; retiring the last slivers of
      // black hands the viewport to the video without touching the video.
      knockout.style.opacity = String(1 - smoothstep(0.78, 0.93, p));

      // Slow drift so the footage itself is alive under the letters.
      videoWrap.style.transform = `scale(${1 + p * 0.1})`;
    },
    [cx, cy],
  );

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    const tick = () => {
      const diff = targetRef.current - currentRef.current;
      // Critically damped follow, so flick-scrolling still arrives smoothly.
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
      setSize({ w: window.innerWidth, h: window.innerHeight });
      readScroll();
    };

    handleResize();
    apply(currentRef.current);

    window.addEventListener("scroll", readScroll, { passive: true });
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("scroll", readScroll);
      window.removeEventListener("resize", handleResize);
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    };
  }, [apply]);

  // Some browsers refuse the autoplay attribute but allow a muted play() call.
  useEffect(() => {
    videoRef.current?.play().catch(() => {});
  }, []);

  return (
    <section ref={sectionRef} className="relative h-[300vh] bg-[#584738]">
      <div className="sticky top-0 h-screen w-full overflow-hidden bg-[#584738]">
        {/* The only video on the page. */}
        <div
          ref={videoWrapRef}
          className="absolute inset-0 will-change-transform"
          style={{ transform: "scale(1)" }}
        >
          <video
            ref={videoRef}
            src={VIDEO_SRC}
            autoPlay
            muted
            loop
            playsInline
            preload="auto"
            className="h-full w-full object-cover"
          />
        </div>

        {/* Seen through the letter holes until it fades — the white wordmark. */}
        <div
          ref={whiteRef}
          className="absolute inset-0 bg-white"
          style={{ opacity: 1 }}
        />

        {/* Black panel with AVENUE cut out of it. */}
        <svg
          className="absolute inset-0 h-full w-full"
          viewBox={`0 0 ${size.w} ${size.h}`}
          aria-hidden="true"
        >
          <defs>
            <mask
              id={maskId}
              maskUnits="userSpaceOnUse"
              x="0"
              y="0"
              width={size.w}
              height={size.h}
            >
              {/* White keeps the panel, black punches through it. */}
              <rect
                x="0"
                y="0"
                width={size.w}
                height={size.h}
                fill="#ffffff"
              />
              <g ref={lettersRef}>
                <text
                  x={cx}
                  // Offset by roughly half a cap height rather than relying on
                  // dominant-baseline, which Safari has been unreliable about.
                  y={cy + fontSize * 0.355}
                  textAnchor="middle"
                  fill="#000000"
                  fontSize={fontSize}
                  letterSpacing={-fontSize * 0.03}
                  style={{
                    fontFamily: '"Manrope", sans-serif',
                    fontWeight: 700,
                  }}
                >
                  AVENUE
                </text>
              </g>
            </mask>
          </defs>

          <rect
            ref={knockoutRef}
            x="0"
            y="0"
            width={size.w}
            height={size.h}
            fill="#000000"
            mask={`url(#${maskId})`}
            style={{ opacity: 1 }}
          />
        </svg>

        <h2 className="sr-only">Avenue</h2>
      </div>
    </section>
  );
}
