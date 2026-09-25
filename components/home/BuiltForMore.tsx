"use client";

import { useCallback, useEffect, useRef, type ReactNode } from "react";
import { company, milestoneHeadings, milestones } from "@/data/avenue";

/**
 * Built for more — The Avenue as a developer, between the projects above and
 * the developments list below.
 *
 * One pinned stage, driven by scroll like the sections around it. Five
 * moments, each an editorial spread of type set against a large crop of a
 * real Avenue render:
 *
 *   BUILT FOR MORE   the Milestone tower, the words crossing into it
 *   Spaces.          the Milestone lobby
 *   People.          balcony living
 *   Progress.        the towers above the city at dusk
 *   A city, shaped…  the towers at night, and the journey's addresses one by one
 *
 * Images reveal through masks that keep travelling in the same direction as
 * they leave, and settle from a slight overscale to exactly 1 — they are never
 * scaled past their rest size, so they stay sharp. Every quotation, name and
 * figure comes from the company record in data/avenue.ts.
 */

const clamp01 = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v);
const span = (a: number, b: number, p: number) => clamp01((p - a) / (b - a));
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);
const easeOutQuad = (t: number) => 1 - (1 - t) * (1 - t);
const easeInOut = (t: number) =>
  t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

/* -------------------------------------------------------------------------- */
/*  Content — all quoted from the company record                              */
/* -------------------------------------------------------------------------- */

const values = company.values ?? "";
const vision = company.vision ?? "";
/** A fragment only if it really is in the source, so nothing can be misquoted. */
const quote = (source: string, fragment: string) =>
  source.includes(fragment) ? fragment : null;

const BEYOND = quote(values, "We deliver beyond residential properties.");

const PILLARS = [
  { word: "Spaces.", fragment: quote(values, "the serenity of space"), source: "From our values" },
  { word: "People.", fragment: quote(values, "the place to interact with their family"), source: "From our values" },
  { word: "Progress.", fragment: quote(vision, "a progressive property developer"), source: "From our vision" },
] as const;
const CLOSING = ["A city, shaped", "one address", "at a time."] as const;

/** The journey's marks, as the official site names them. */
const ADDRESSES = milestones.map(
  (m) => m.title.replace(/^The Avenue\s+(?=\S)/, "") || m.title,
);

/* -------------------------------------------------------------------------- */
/*  Timeline (section scroll progress)                                        */
/* -------------------------------------------------------------------------- */

type Timing = { in: [number, number]; out?: [number, number] };

/**
 * Built for more, Spaces, People, Progress, A city — in that order. Each moment
 * starts opening as the one before starts leaving, so a change of moment reads
 * as one composition wiping into the next and the frame is never left empty.
 */
const MOMENTS: Timing[] = [
  { in: [0.05, 0.15], out: [0.235, 0.3] },
  { in: [0.24, 0.33], out: [0.425, 0.49] },
  { in: [0.43, 0.52], out: [0.615, 0.68] },
  { in: [0.62, 0.71], out: [0.8, 0.86] },
  { in: [0.805, 0.89] },
];

const CHAPTERS = ["Built for more", "Spaces", "People", "Progress", "A city"];
const CHAPTER_FROM = [0, 0.26, 0.445, 0.635, 0.82];

const OPEN: [number, number] = [0.005, 0.06];
const NAMES: [number, number] = [0.89, 0.965];
const HANDOFF: [number, number] = [0.95, 1];

/** Grid lines as fractions of the content width; the inner three drop out on phones. */
const GRID = [0, 0.25, 0.5, 0.75, 1] as const;

/* -------------------------------------------------------------------------- */
/*  Masks                                                                     */
/* -------------------------------------------------------------------------- */

type Reveal = "up" | "left" | "right" | "center";

const CLOSED: Record<Reveal, string> = {
  up: "inset(100% 0% 0% 0%)",
  left: "inset(0% 100% 0% 0%)",
  right: "inset(0% 0% 0% 100%)",
  center: "inset(0% 50% 0% 50%)",
};

/** r: how far the mask has opened; x: how far it has carried on out. */
const clipFor = (mode: Reveal, r: number, x: number) => {
  const o = ((1 - r) * 100).toFixed(2);
  const e = (x * 100).toFixed(2);
  switch (mode) {
    case "up":
      return `inset(${o}% 0% ${e}% 0%)`;
    case "left":
      return `inset(0% ${o}% 0% ${e}%)`;
    case "right":
      return `inset(0% ${e}% 0% ${o}%)`;
    case "center": {
      const c = ((1 - r) * 50 + x * 50).toFixed(2);
      return `inset(0% ${c}% 0% ${c}%)`;
    }
  }
};

const SHADE = {
  left: "bg-gradient-to-r from-[#584738]/70 via-[#584738]/20 to-transparent",
  right: "bg-gradient-to-l from-[#584738]/70 via-[#584738]/20 to-transparent",
  none: "",
} as const;

function Panel({
  reveal,
  delay = 0,
  className,
  src,
  alt,
  position,
  shade = "none",
  caption,
}: {
  reveal: Reveal;
  delay?: number;
  className: string;
  src: string;
  alt: string;
  position: string;
  shade?: keyof typeof SHADE;
  caption?: string;
}) {
  return (
    <div
      data-panel=""
      data-reveal={reveal}
      data-delay={delay}
      className={`absolute overflow-hidden bg-[#584738] ${className}`}
      style={{ clipPath: CLOSED[reveal] }}
    >
      {/* 110% tall so the parallax travel never reaches an edge. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt={alt}
        loading="lazy"
        decoding="async"
        className="absolute inset-x-0 -top-[5%] h-[110%] w-full max-w-none object-cover will-change-transform"
        style={{ objectPosition: position, transform: "translate3d(0, 0, 0) scale(1.14)" }}
      />
      {shade !== "none" ? (
        <div aria-hidden="true" className={`pointer-events-none absolute inset-0 ${SHADE[shade]}`} />
      ) : null}
      {caption ? (
        <>
          <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-[#584738]/50 to-transparent" />
          <span
            aria-hidden="true"
            className="absolute bottom-4 left-4 flex items-center gap-3 text-[9px] uppercase tracking-[0.24em] text-white/75 md:bottom-5 md:left-5 md:text-[10px]"
          >
            <span className="h-px w-5 bg-brand-gold/80" />
            {caption}
          </span>
        </>
      ) : null}
    </div>
  );
}

/** A line of type rising out of a mask that clips vertically only, so drift is never cut. */
function MaskLine({
  children,
  delay = 0,
  drift = 0,
  className = "",
}: {
  children: ReactNode;
  delay?: number;
  drift?: number;
  className?: string;
}) {
  return (
    <span aria-hidden="true" className={`block pb-[0.06em] [clip-path:inset(0_-100vw)] ${className}`}>
      <span
        data-line=""
        data-delay={delay}
        data-drift={drift}
        className="block will-change-transform"
        style={{ transform: "translate3d(0, 110%, 0)" }}
      >
        {children}
      </span>
    </span>
  );
}

function Fade({
  children,
  delay = 0,
  className = "",
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
}) {
  return (
    <div data-fade="" data-delay={delay} className={className} style={{ opacity: 0 }}>
      {children}
    </div>
  );
}

function Pillar({
  index,
  word,
  fragment,
  source,
  className,
}: {
  index: number;
  word: string;
  fragment: string | null;
  source: string;
  className: string;
}) {
  return (
    <div className={`absolute ${className}`}>
      <Fade className="mb-4 flex items-center gap-3 text-[10px] uppercase tracking-[0.24em] md:mb-6">
        <span className="text-brand-gold/85">{String(index).padStart(2, "0")}</span>
        <span className="h-px w-8 bg-white/25" />
        <span className="text-white/40">03</span>
      </Fade>
      <div className="font-serif text-[clamp(52px,15vw,96px)] font-light leading-[0.92] tracking-[-0.045em] md:text-[clamp(72px,8vw,128px)]">
        <MaskLine delay={0.01}>{word}</MaskLine>
      </div>
      {fragment ? (
        <Fade delay={0.03} className="mt-5 flex max-w-[360px] gap-4 md:mt-8">
          <span className="mt-[11px] h-px w-8 shrink-0 bg-white/30" />
          <p className="text-[14px] leading-[1.65] text-white/70 md:text-[16px]">
            &ldquo;&hellip;{fragment}&rdquo;
            <span className="mt-2 block text-[9px] uppercase tracking-[0.22em] text-white/35 md:text-[10px]">
              {source}
            </span>
          </p>
        </Fade>
      ) : null}
    </div>
  );
}

type MomentNodes = {
  root: HTMLElement;
  panels: HTMLElement[];
  lines: HTMLElement[];
  fades: HTMLElement[];
};

export default function BuiltForMore() {
  const sectionRef = useRef<HTMLElement>(null);
  const fieldRef = useRef<HTMLDivElement>(null);
  const seamRef = useRef<HTMLDivElement>(null);
  const gridRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const ruleRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const tickRef = useRef<HTMLSpanElement>(null);
  const topRowRef = useRef<HTMLDivElement>(null);
  const bottomRowRef = useRef<HTMLDivElement>(null);
  const chapterIndexRef = useRef<HTMLSpanElement>(null);
  const chapterLabelRef = useRef<HTMLSpanElement>(null);
  const momentRefs = useRef<(HTMLDivElement | null)[]>([]);
  const nameRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const nodesRef = useRef<MomentNodes[]>([]);

  const targetRef = useRef(0);
  const currentRef = useRef(0);
  const rafRef = useRef<number | null>(null);
  const chapterShownRef = useRef(-1);

  const apply = useCallback((p: number) => {
    // --- The dark field opens out of the hairline the light ground ends on.
    const open = easeInOut(span(OPEN[0], OPEN[1], p));
    if (fieldRef.current) {
      const inset = (50 * (1 - open)).toFixed(3);
      fieldRef.current.style.clipPath = `inset(${inset}% 0% ${inset}% 0%)`;
    }
    if (seamRef.current) {
      seamRef.current.style.opacity = String(1 - span(OPEN[0], 0.03, p));
    }

    // --- Grid: drawn in, then all but the first line retract at the handoff.
    gridRefs.current.forEach((line, i) => {
      if (!line) return;
      const draw = easeOut(span(0.05 + i * 0.015, 0.16 + i * 0.015, p));
      const lag = (GRID.length - i) * 0.008;
      const retract =
        i === 0 ? 0 : easeInOut(span(HANDOFF[0] + lag, HANDOFF[1] - 0.01 + lag, p));
      line.style.transform = `scaleY(${(draw * (1 - retract)).toFixed(4)})`;
      line.style.transformOrigin = retract > 0 ? "bottom" : "top";
    });
    if (gridRefs.current[0]) {
      // The line "Explore our developments" starts on, carried into it.
      const lift = lerp(0.07, 0.22, span(HANDOFF[0], 0.99, p));
      gridRefs.current[0].style.backgroundColor = `rgba(255, 255, 255, ${lift.toFixed(3)})`;
    }
    if (tickRef.current) {
      const travel = easeInOut(span(HANDOFF[0] + 0.005, 1, p));
      tickRef.current.style.transform = `translate3d(0, calc(${(travel * 100).toFixed(2)}vh - 100%), 0)`;
      tickRef.current.style.opacity = String(span(HANDOFF[0], HANDOFF[0] + 0.01, p));
    }
    ruleRefs.current.forEach((rule, i) => {
      if (!rule) return;
      // Top and bottom rows draw in with the grid; the address rule with the closing.
      const draw =
        i === 2
          ? easeOut(span(0.85, 0.93, p))
          : easeOut(span(0.07 + i * 0.03, 0.2 + i * 0.03, p));
      rule.style.transform = `scaleX(${draw.toFixed(4)})`;
    });

    // --- Micro labels.
    if (topRowRef.current) {
      topRowRef.current.style.opacity = String(
        span(0.05, 0.09, p) * (1 - span(HANDOFF[0], 0.99, p)),
      );
    }
    if (bottomRowRef.current) {
      bottomRowRef.current.style.opacity = String(
        span(0.06, 0.1, p) * (1 - span(0.8, 0.84, p)),
      );
    }
    let chapter = 0;
    CHAPTER_FROM.forEach((from, i) => {
      if (p >= from) chapter = i;
    });
    if (
      chapter !== chapterShownRef.current &&
      chapterIndexRef.current &&
      chapterLabelRef.current
    ) {
      chapterShownRef.current = chapter;
      chapterIndexRef.current.textContent = String(chapter + 1).padStart(2, "0");
      chapterLabelRef.current.textContent = CHAPTERS[chapter];
    }

    // --- The five moments.
    MOMENTS.forEach((m, k) => {
      const n = nodesRef.current[k];
      if (!n) return;
      const [a, b] = m.in;
      const out = m.out;
      const end = out ? out[1] : 1;
      const live = p >= a - 0.002 && (!out || p <= out[1] + 0.004);
      n.root.style.visibility = live ? "visible" : "hidden";
      if (!live) return;

      const exit = (d: number) =>
        out ? easeInOut(span(out[0] + d * 0.5, out[1] + d * 0.5, p)) : 0;

      n.panels.forEach((el) => {
        const d = Number(el.dataset.delay) || 0;
        // Opens promptly, so the incoming image is there as the last one leaves.
        const r = easeOutQuad(span(a + d, b + d, p));
        const x = exit(d);
        el.style.clipPath = clipFor(el.dataset.reveal as Reveal, r, x);
        // A closing mask fades as it narrows, so it never leaves a sliver behind.
        el.style.opacity = (1 - span(0.55, 1, x)).toFixed(3);
        const img = el.firstElementChild as HTMLElement | null;
        if (img) {
          // Settles from a slight overscale to exactly 1, drifting through the moment.
          const ty = lerp(3, -3, span(a, end, p));
          img.style.transform = `translate3d(0, ${ty.toFixed(3)}%, 0) scale(${(1 + 0.14 * (1 - r)).toFixed(4)})`;
        }
      });

      n.lines.forEach((el) => {
        const d = Number(el.dataset.delay) || 0;
        const drift = Number(el.dataset.drift) || 0;
        const rise = easeOut(span(a + 0.015 + d, b + 0.015 + d, p));
        const tx = drift ? lerp(drift, -drift, span(a, end, p)) : 0;
        const ty = (1 - rise) * 110 - exit(d) * 110;
        el.style.transform = `translate3d(${tx.toFixed(3)}vw, ${ty.toFixed(2)}%, 0)`;
      });

      n.fades.forEach((el) => {
        const d = Number(el.dataset.delay) || 0;
        const f =
          span(a + 0.03 + d, b + d, p) * (out ? 1 - span(out[0], out[0] + 0.035, p) : 1);
        el.style.opacity = f.toFixed(3);
        el.style.transform = `translate3d(0, ${((1 - f) * 14).toFixed(2)}px, 0)`;
      });
    });

    // --- One address at a time.
    const count = nameRefs.current.length;
    nameRefs.current.forEach((name, i) => {
      if (!name) return;
      const at = NAMES[0] + (count > 1 ? i / (count - 1) : 0) * (NAMES[1] - NAMES[0]);
      const lit = span(at, at + 0.01, p);
      name.style.color = `rgba(255, 255, 255, ${(0.22 + 0.63 * lit).toFixed(3)})`;
    });
  }, []);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    nodesRef.current = momentRefs.current
      .filter((root): root is HTMLDivElement => !!root)
      .map((root) => ({
        root,
        panels: Array.from(root.querySelectorAll<HTMLElement>("[data-panel]")),
        lines: Array.from(root.querySelectorAll<HTMLElement>("[data-line]")),
        fades: Array.from(root.querySelectorAll<HTMLElement>("[data-fade]")),
      }));

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
    currentRef.current = targetRef.current;
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

  const moment = (i: number) => (el: HTMLDivElement | null) => {
    momentRefs.current[i] = el;
  };

  return (
    // No overflow-hidden: an overflow ancestor would stop the stage pinning.
    <section
      ref={sectionRef}
      aria-labelledby="built-for-more-title"
      className="relative h-[700vh] bg-[#584738] text-white"
    >
      {/* The section as text. The stage below animates the same words and is
          hidden from assistive tech, where parts would otherwise come and go
          with the scroll position. */}
      <div className="sr-only">
        <h2 id="built-for-more-title">Built for more</h2>
        {BEYOND ? <p>{BEYOND}</p> : null}
        {PILLARS.map((pillar) => (
          <div key={pillar.word}>
            <h3>{pillar.word}</h3>
            {pillar.fragment ? <p>{pillar.fragment}</p> : null}
          </div>
        ))}
        <p>{CLOSING.join(" ")}</p>
        <p>{milestoneHeadings.eyebrow}</p>
        <ul>
          {milestones.map((m) => (
            <li key={m.title}>{m.title}</li>
          ))}
        </ul>
      </div>

      <div className="sticky top-0 h-screen w-full overflow-hidden bg-[#F1EADA]">
        {/* The hairline the light ground ends on; the dark field opens from it. */}
        <div
          ref={seamRef}
          aria-hidden="true"
          className="absolute inset-x-0 top-1/2 px-6 md:px-10 lg:px-12"
        >
          <div className="mx-auto h-px max-w-[1450px] bg-[#584738]/15" />
        </div>

        <div
          ref={fieldRef}
          className="absolute inset-0 bg-[#584738]"
          style={{ clipPath: "inset(50% 0% 50% 0%)" }}
        >
          <div className="absolute inset-0 mx-auto max-w-[1450px] px-6 md:px-10 lg:px-12">
            <div className="relative h-full">
              {/* ================= GRID ================= */}
              <div aria-hidden="true" className="pointer-events-none absolute inset-0">
                {GRID.map((x, i) => (
                  <span
                    key={x}
                    ref={(el) => {
                      gridRefs.current[i] = el;
                    }}
                    className={`absolute inset-y-0 w-px bg-white/[0.07] ${
                      i === 1 || i === 3 ? "hidden md:block" : ""
                    }`}
                    style={{ left: `${x * 100}%`, transform: "scaleY(0)", transformOrigin: "top" }}
                  />
                ))}
              </div>

              {/* ================= 01 · BUILT FOR MORE ================= */}
              <div ref={moment(0)} aria-hidden="true" className="absolute inset-0" style={{ visibility: "hidden" }}>
                <Panel
                  reveal="up"
                  className="left-[30%] top-[21%] h-[45%] w-[70%] md:left-[50%] md:top-[17%] md:h-[70%] md:w-[38%]"
                  src="/built-for-more/milestone-tower.webp"
                  alt="The Avenue Milestone tower rising above its porte-cochère"
                  position="50% 35%"
                  shade="left"
                  caption="The Avenue Milestone"
                />
                <Panel
                  reveal="left"
                  delay={0.03}
                  className="hidden md:block md:left-0 md:top-[62%] md:h-[24%] md:w-[25%]"
                  src="/built-for-more/milestone-crown.webp"
                  alt=""
                  position="30% 50%"
                />
                <div
                  className="absolute inset-0 font-serif text-[clamp(60px,20vw,120px)] font-light uppercase leading-[0.84] tracking-[-0.045em] md:text-[clamp(96px,12.5vw,196px)]"
                >
                  <MaskLine className="absolute left-0 top-[13%] md:top-[17%]" drift={1.2}>
                    Built
                  </MaskLine>
                  <MaskLine
                    className="absolute left-[6%] top-[36%] md:left-[33%] md:top-[39%]"
                    delay={0.02}
                    drift={-0.8}
                  >
                    For
                  </MaskLine>
                  <MaskLine className="absolute right-0 top-[57%] md:top-[61%]" delay={0.04} drift={1}>
                    More
                  </MaskLine>
                </div>
                {BEYOND ? (
                  <Fade
                    delay={0.05}
                    className="absolute left-0 top-[75%] max-w-[260px] md:left-[27.5%] md:top-[67%] md:max-w-[250px]"
                  >
                    <span className="mb-3 block text-[10px] uppercase tracking-[0.24em] text-brand-gold/75">
                      From our values
                    </span>
                    <p className="text-[14px] leading-[1.6] text-white/70 md:text-[15px]">
                      &ldquo;{BEYOND}&rdquo;
                    </p>
                  </Fade>
                ) : null}
              </div>

              {/* ================= 02 · SPACES ================= */}
              <div ref={moment(1)} aria-hidden="true" className="absolute inset-0" style={{ visibility: "hidden" }}>
                <Panel
                  reveal="left"
                  className="left-0 top-[17%] h-[38%] w-full md:h-[68%] md:w-[54%]"
                  src="/hero-lobby.jpg"
                  alt="The lobby of The Avenue Milestone"
                  position="64% 50%"
                  caption="Milestone · Lobby"
                />
                <Pillar
                  index={1}
                  {...PILLARS[0]}
                  className="left-0 top-[59%] w-full md:left-[61%] md:top-[27%] md:w-[37%]"
                />
              </div>

              {/* ================= 03 · PEOPLE ================= */}
              <div ref={moment(2)} aria-hidden="true" className="absolute inset-0" style={{ visibility: "hidden" }}>
                <Panel
                  reveal="right"
                  className="left-0 top-[17%] h-[38%] w-full md:left-[42%] md:h-[68%] md:w-[58%]"
                  src="/built-for-more/balcony.webp"
                  alt="A furnished balcony living space looking out over the city"
                  position="62% 50%"
                  caption="Scenic balconies"
                />
                <Pillar
                  index={2}
                  {...PILLARS[1]}
                  className="left-0 top-[59%] w-full md:top-[31%] md:w-[36%]"
                />
              </div>

              {/* ================= 04 · PROGRESS ================= */}
              <div ref={moment(3)} aria-hidden="true" className="absolute inset-0" style={{ visibility: "hidden" }}>
                <Panel
                  reveal="center"
                  className="left-0 top-[17%] h-[40%] w-full md:top-[15%] md:h-[72%] md:w-[62%]"
                  src="/hero-mobile-2026.webp"
                  alt="The Avenue Milestone towers rising above the city at dusk"
                  position="62% 40%"
                  shade="right"
                  caption="The Avenue Milestone"
                />
                <Pillar
                  index={3}
                  {...PILLARS[2]}
                  className="left-0 top-[61%] w-full md:left-[55%] md:top-[46%] md:w-[43%]"
                />
              </div>

              {/* ================= 05 · A CITY, SHAPED ================= */}
              <div ref={moment(4)} aria-hidden="true" className="absolute inset-0" style={{ visibility: "hidden" }}>
                <Panel
                  reveal="up"
                  className="left-0 top-[16%] h-[33%] w-full md:left-[32%] md:top-[15%] md:h-[58%] md:w-[68%]"
                  src="/built-for-more/milestone-night.webp"
                  alt="The Avenue Milestone towers at night, seen from above"
                  position="50% 58%"
                  shade="left"
                  caption="The Avenue Milestone"
                />
                <div className="absolute left-0 top-[53%] w-full md:top-[33%] md:w-[62%]">
                  <p className="font-serif text-[clamp(38px,10.5vw,64px)] font-light leading-[1.0] tracking-[-0.045em] md:text-[clamp(56px,6.4vw,104px)]">
                    {CLOSING.map((line, i) => (
                      <MaskLine
                        key={line}
                        delay={i * 0.02}
                        className={`${i === 1 ? "md:pl-[10%]" : ""} ${i === 2 ? "text-white/55" : ""}`}
                      >
                        {line}
                      </MaskLine>
                    ))}
                  </p>
                </div>

                <Fade delay={0.04} className="absolute inset-x-0 top-[80%]">
                  <span
                    ref={(el) => {
                      ruleRefs.current[2] = el;
                    }}
                    aria-hidden="true"
                    className="block h-px w-full origin-left bg-white/10"
                    style={{ transform: "scaleX(0)" }}
                  />
                  <div className="flex flex-col gap-3 pt-4 md:flex-row md:items-baseline md:gap-10 md:pt-5">
                    <span className="shrink-0 text-[10px] uppercase tracking-[0.24em] text-brand-gold/75">
                      {milestoneHeadings.eyebrow}
                    </span>
                    <ul className="flex flex-wrap gap-x-4 gap-y-2 text-[10px] uppercase tracking-[0.2em] md:gap-x-6 md:text-[11px]">
                      {ADDRESSES.map((name, i) => (
                        <li key={milestones[i].title}>
                          <span
                            ref={(el) => {
                              nameRefs.current[i] = el;
                            }}
                            style={{ color: "rgba(255, 255, 255, 0.22)" }}
                          >
                            {name}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </Fade>
              </div>

              {/* Gold tick that carries the eye down into the next section. */}
              <span
                ref={tickRef}
                aria-hidden="true"
                className="pointer-events-none absolute left-0 top-0 z-30 h-16 w-px bg-brand-gold/85"
                style={{ opacity: 0, transform: "translate3d(0, -100%, 0)" }}
              />

              {/* ================= TOP ROW ================= */}
              <div
                ref={topRowRef}
                className="absolute inset-x-0 top-[96px] z-20 md:top-[108px] lg:top-[124px]"
                style={{ opacity: 0 }}
              >
                <div className="flex items-center justify-between gap-6 pb-4">
                  <div className="flex items-center gap-4">
                    <span className="h-px w-10 bg-white/30" />
                    <span className="text-[10px] uppercase tracking-[0.28em] text-white/45">
                      {company.shortName} · Since {company.established}
                    </span>
                  </div>
                  <span
                    aria-hidden="true"
                    className="hidden text-[10px] uppercase tracking-[0.22em] text-white/35 sm:block"
                  >
                    19.9975° N &nbsp;·&nbsp; 73.7898° E
                  </span>
                </div>
                <span
                  ref={(el) => {
                    ruleRefs.current[0] = el;
                  }}
                  aria-hidden="true"
                  className="block h-px w-full origin-left bg-white/10"
                  style={{ transform: "scaleX(0)" }}
                />
              </div>

              {/* ================= BOTTOM ROW ================= */}
              <div
                ref={bottomRowRef}
                aria-hidden="true"
                className="absolute inset-x-0 bottom-8 z-20"
                style={{ opacity: 0 }}
              >
                <span
                  ref={(el) => {
                    ruleRefs.current[1] = el;
                  }}
                  className="block h-px w-full origin-right bg-white/10"
                  style={{ transform: "scaleX(0)" }}
                />
                <div className="flex items-center justify-between gap-6 pt-5 text-[10px] uppercase tracking-[0.22em] text-white/35">
                  <span>{company.location}, Maharashtra</span>
                  <span className="hidden md:block">Residential · Commercial · Industrial</span>
                  <span className="flex items-center gap-3">
                    <span ref={chapterLabelRef} className="hidden text-white/55 sm:inline">
                      {CHAPTERS[0]}
                    </span>
                    <span>
                      <span ref={chapterIndexRef} className="text-white/80">
                        01
                      </span>{" "}
                      / {String(CHAPTERS.length).padStart(2, "0")}
                    </span>
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
