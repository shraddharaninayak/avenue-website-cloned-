"use client";

import { useEffect, useState } from "react";
import type { CSSProperties } from "react";
import { MENU_CREAM } from "@/components/layout/MenuOverlay";

/**
 * The intro: on a cream screen, THE AVENUE is constructed stroke by stroke —
 * bars and diagonals growing out of single points, a few sliding into their
 * places as they are drawn, in a taupe-to-gold ink — until the whole wordmark
 * stands. The official colour logo then sweeps in over it, which also brings
 * in "Reason to Smile!" and BUILDERS & DEVELOPERS, and after a short hold the
 * cream dissolves, through a soft blur, into the page. About four seconds.
 *
 * The strokes are the logo's own letterforms: every bar, diagonal and curve
 * below is taken from the vector logo in the brochures (the artwork
 * /logo-avenue-colour.webp was exported from), in the same coordinates as that
 * image, so the drawn wordmark and the logo lie exactly on top of each other.
 * Bars are butt-capped strokes of their exact width; diagonals and the U are
 * wider strokes clipped to their exact outlines. The logo image itself is
 * shown as it is, without any filter.
 *
 * It runs once per browser session, on the first page loaded. It is mounted in
 * the root layout, which stays mounted across client-side navigation, so
 * moving between pages never replays it; and once it has run, a reload in the
 * same tab skips it (the inline script hides it before first paint).
 *
 * All of the timing is CSS, starting at first paint, so it does not wait for
 * hydration, and the screen clears even if scripts never run. The script only
 * holds the page still while it plays and removes the intro afterwards.
 */

const SEEN_KEY = "avenue-intro-seen";

/** Milliseconds from first paint. The strokes carry their own times below. */
const SWEEP_AT = 2250;
const SWEEP = 750;
const INK_OUT_AT = 2950;
const EXIT_AT = 3200;
const EXIT = 750;
/** With reduced motion: the logo, still, then a plain fade. */
const REDUCED_EXIT_AT = 1000;
const REDUCED_EXIT = 400;

/** The logo image's box, in the vector artwork's units. */
const VIEW_W = 218.75;
const VIEW_H = 93.14;

type Stroke = {
  /** Centreline, drawn from its first point to its last. */
  d: string;
  /** Stroke width. */
  w: number;
  /** Start and duration, ms. */
  at: number;
  dur: number;
  /** Vertical distance it slides into place from while drawing. */
  sy?: number;
  /** Exact outline to clip a wide stroke to. */
  clip?: string;
};

const STROKES: Stroke[] = [
  // THE, set vertically: the T
  { d: "M4.16 48.27V67.47", w: 4.98, at: 500, dur: 480, sy: -6 },
  { d: "M6.4 57.87H31.17", w: 4.86, at: 600, dur: 520 },
  // the H
  { d: "M1.67 42.67H31.17", w: 4.86, at: 700, dur: 540 },
  { d: "M31.17 28.21H1.67", w: 4.86, at: 800, dur: 540 },
  { d: "M15.78 40.49V30.39", w: 4.98, at: 1080, dur: 300 },
  // the E
  { d: "M1.67 18.28H31.17", w: 4.87, at: 900, dur: 540 },
  { d: "M4.16 16.1V2.79", w: 4.98, at: 1160, dur: 320, sy: 4 },
  { d: "M15.65 16.1V3.7", w: 4.99, at: 1230, dur: 320, sy: 4 },
  { d: "M28.67 16.1V2.34", w: 4.99, at: 1300, dur: 320, sy: 4 },
  // Λ
  {
    d: "M41.42 58.13L64.45 -1.16",
    w: 16,
    at: 760,
    dur: 680,
    clip: "M37.56 55.32L47.45 55.36L66.12 7.59L66.12 1.64L58.42 1.64Z",
  },
  {
    d: "M68.88 -1.16L91.33 58.11",
    w: 16,
    at: 1180,
    dur: 640,
    clip: "M65.82 7.59L66.12 7.59L85.3 55.34L95.23 55.28L73.77 1.65L65.82 1.64Z",
  },
  // V
  {
    d: "M102.94 35.91L112.74 69.23",
    w: 10,
    at: 1040,
    dur: 520,
    clip: "M109.54 67.32L100.89 37.83L106.12 37.83L112.28 59.66L112.28 67.32Z",
  },
  {
    d: "M113.07 69.26L121.23 35.88",
    w: 10,
    at: 1300,
    dur: 520,
    sy: 9,
    clip: "M111.98 59.66L112.28 59.66L118.14 37.83L123.38 37.83L114.81 67.32L111.98 67.32Z",
  },
  // E
  { d: "M128.32 37.83V67.32", w: 4.86, at: 1220, dur: 560, sy: -10 },
  { d: "M130.5 40.32H143.81", w: 4.98, at: 1520, dur: 360 },
  { d: "M130.5 51.81H142.9", w: 4.99, at: 1590, dur: 360 },
  { d: "M130.5 64.83H144.26", w: 4.98, at: 1660, dur: 360 },
  // N
  { d: "M150.76 67.32V37.83", w: 4.53, at: 1360, dur: 520 },
  {
    d: "M151.32 39.39L164.78 65.99",
    w: 10,
    at: 1600,
    dur: 440,
    clip: "M152.73 37.83L153.23 37.83L163.46 58.13L163.46 67.32L162.8 67.32L153.03 48.09L152.73 48.09Z",
  },
  { d: "M165.43 67.32V37.83", w: 4.54, at: 1500, dur: 580, sy: 10 },
  // U
  {
    d: "M175.19 36.08L175.19 53.58C175.19 61.88 178.22 65.28 182.42 65.28C186.62 65.28 189.65 61.88 189.65 53.58L189.65 36.08",
    w: 9,
    at: 1560,
    dur: 720,
    clip: "M172.75 37.82L177.61 37.82L177.61 53.78C177.61 56.26 177.68 57.87 177.8 58.63C178.01 59.92 178.53 60.93 179.35 61.64C180.16 62.35 181.24 62.71 182.58 62.71C183.71 62.71 184.63 62.45 185.35 61.95C186.07 61.45 186.55 60.76 186.82 59.86C187.08 58.97 187.21 57.05 187.21 54.12L187.21 37.82L192.08 37.82L192.08 53.31C192.08 57.27 191.86 60.12 191.44 61.89C191.02 63.65 190.06 65.08 188.58 66.17C187.1 67.27 185.14 67.81 182.71 67.81C180.18 67.81 178.21 67.36 176.79 66.45C175.38 65.55 174.35 64.28 173.71 62.64C173.07 60.99 172.75 57.96 172.75 53.55L172.75 37.82Z",
  },
  // E
  { d: "M199.61 37.83V67.32", w: 4.86, at: 1700, dur: 540, sy: -10 },
  { d: "M201.79 40.32H215.1", w: 4.98, at: 1960, dur: 320 },
  { d: "M201.79 51.81H214.2", w: 4.99, at: 2020, dur: 320 },
  { d: "M201.79 64.83H215.55", w: 4.98, at: 2080, dur: 320 },
  // the bar under the Λ, last
  { d: "M36.6 63.97H95.55", w: 7.05, at: 1820, dur: 560 },
];

const cream = [1, 3, 5].map((i) => parseInt(MENU_CREAM.slice(i, i + 2), 16)).join(" ");

const skipIfSeen = `try{if(sessionStorage.getItem("${SEEN_KEY}")){var e=document.getElementById("avenue-intro");if(e)e.setAttribute("data-intro","skip")}}catch(e){}`;

const styles = `
#avenue-intro { background-color: rgb(${cream}); animation: avi-exit ${EXIT}ms cubic-bezier(0.65, 0, 0.35, 1) ${EXIT_AT}ms forwards }
#avenue-intro[data-intro="skip"] { display: none }
#avenue-intro .avi-mark { animation: avi-mark-out ${Math.round(EXIT * 0.65)}ms cubic-bezier(0.4, 0, 0.2, 1) ${EXIT_AT}ms forwards }
#avenue-intro .avi-piece { animation: avi-settle var(--dur) cubic-bezier(0.2, 0.7, 0.2, 1) var(--at) both }
#avenue-intro .avi-stroke { stroke-dasharray: 1 2; animation: avi-draw var(--dur) cubic-bezier(0.6, 0.05, 0.25, 1) var(--at) both }
#avenue-intro .avi-ink { animation: avi-fade 250ms ease ${INK_OUT_AT}ms forwards }
#avenue-intro .avi-logo {
  -webkit-mask-image: linear-gradient(90deg, #000 40%, transparent 60%); mask-image: linear-gradient(90deg, #000 40%, transparent 60%);
  -webkit-mask-size: 250% 100%; mask-size: 250% 100%; -webkit-mask-repeat: no-repeat; mask-repeat: no-repeat;
  -webkit-mask-position: 100% 0; mask-position: 100% 0;
  animation: avi-sweep ${SWEEP}ms cubic-bezier(0.45, 0, 0.2, 1) ${SWEEP_AT}ms forwards
}
@keyframes avi-draw { from { stroke-dashoffset: 1 } to { stroke-dashoffset: 0 } }
@keyframes avi-settle { from { transform: translateY(var(--sy)) } to { transform: none } }
@keyframes avi-sweep { to { -webkit-mask-position: 0 0; mask-position: 0 0 } }
@keyframes avi-fade { to { opacity: 0 } }
@keyframes avi-mark-out { to { opacity: 0; transform: translateY(-10px) } }
@keyframes avi-exit {
  from { background-color: rgb(${cream} / 1); -webkit-backdrop-filter: blur(18px); backdrop-filter: blur(18px) }
  to { background-color: rgb(${cream} / 0); -webkit-backdrop-filter: blur(0px); backdrop-filter: blur(0px); visibility: hidden }
}
@keyframes avi-exit-reduced { to { opacity: 0; visibility: hidden } }
@media (prefers-reduced-motion: reduce) {
  #avenue-intro { animation: avi-exit-reduced ${REDUCED_EXIT}ms ease ${REDUCED_EXIT_AT}ms forwards }
  #avenue-intro .avi-ink { display: none }
  #avenue-intro .avi-mark, #avenue-intro .avi-logo { animation: none; -webkit-mask-image: none; mask-image: none }
}`;

/** Keys that would scroll the page while the intro is up. */
const SCROLL_KEYS = new Set([" ", "PageUp", "PageDown", "Home", "End", "ArrowUp", "ArrowDown"]);

export default function IntroLoader() {
  const [done, setDone] = useState(false);

  useEffect(() => {
    let seen = false;
    try {
      seen = sessionStorage.getItem(SEEN_KEY) === "1";
    } catch {
      // Storage unavailable (private mode, blocked): just play it.
    }
    if (seen) {
      setDone(true);
      return;
    }

    // Hold the page still while the intro plays. Listeners rather than
    // overflow: hidden, so the scrollbar never comes and goes and the page
    // beneath does not shift when the intro ends.
    const block = (e: Event) => e.preventDefault();
    const blockKeys = (e: KeyboardEvent) => {
      if (SCROLL_KEYS.has(e.key)) e.preventDefault();
    };
    window.addEventListener("wheel", block, { passive: false });
    window.addEventListener("touchmove", block, { passive: false });
    window.addEventListener("keydown", blockKeys);

    let finished = false;
    const release = () => {
      window.removeEventListener("wheel", block);
      window.removeEventListener("touchmove", block);
      window.removeEventListener("keydown", blockKeys);
    };
    const finish = () => {
      if (finished) return;
      finished = true;
      release();
      try {
        sessionStorage.setItem(SEEN_KEY, "1");
      } catch {
        /* ignore */
      }
      setDone(true);
    };

    // The exit is a CSS animation that started at first paint; wait for it.
    const exit = document
      .getElementById("avenue-intro")
      ?.getAnimations?.()
      .find((a) => "animationName" in a && String((a as CSSAnimation).animationName).startsWith("avi-exit"));
    let timer: number | undefined;
    if (exit) exit.finished.then(finish, finish);
    else timer = window.setTimeout(finish, EXIT_AT + EXIT);

    return () => {
      finished = true;
      window.clearTimeout(timer);
      release();
    };
  }, []);

  if (done) return null;

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: styles }} />
      <div
        id="avenue-intro"
        data-intro="play"
        aria-hidden="true"
        suppressHydrationWarning
        className="fixed inset-0 z-[200] flex items-center justify-center"
      >
        <div className="avi-mark relative aspect-[1400/596] w-[clamp(230px,24vw,400px)]">
          <svg
            className="avi-ink absolute inset-0 h-full w-full overflow-visible"
            viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
            preserveAspectRatio="none"
            fill="none"
          >
            <defs>
              <linearGradient id="avi-ink-tone" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2={VIEW_W} y2="0">
                <stop offset="0" stopColor="#9a8373" />
                <stop offset="0.55" stopColor="#b39a7e" />
                <stop offset="1" stopColor="#c7a672" />
              </linearGradient>
              {STROKES.map((s, i) =>
                s.clip ? (
                  <clipPath key={i} id={`avi-clip-${i}`}>
                    <path d={s.clip} />
                  </clipPath>
                ) : null,
              )}
            </defs>
            {STROKES.map((s, i) => (
              <g
                key={i}
                className="avi-piece"
                style={{ "--at": `${s.at}ms`, "--dur": `${s.dur}ms`, "--sy": `${s.sy ?? 0}px` } as CSSProperties}
              >
                <path
                  className="avi-stroke"
                  d={s.d}
                  pathLength={1}
                  stroke="url(#avi-ink-tone)"
                  strokeWidth={s.w}
                  clipPath={s.clip ? `url(#avi-clip-${i})` : undefined}
                />
              </g>
            ))}
          </svg>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            className="avi-logo absolute inset-0 h-full w-full"
            src="/logo-avenue-colour.webp"
            alt=""
            width={1400}
            height={596}
            fetchPriority="high"
          />
        </div>
      </div>
      <script dangerouslySetInnerHTML={{ __html: skipIfSeen }} />
    </>
  );
}
