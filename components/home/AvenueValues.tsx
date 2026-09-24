"use client";

import { useEffect, useRef, useState, type MutableRefObject } from "react";
import { company, milestoneHeadings } from "@/data/avenue";
import { ABOUT_PARAGRAPHS } from "./AvenuePortrait";
import { revealClass, useReveal } from "./motion";

/**
 * 03 — Values. What The Avenue stands for.
 *
 * The four values are the four the company names for itself on its own site:
 * "The Avenue Group has become synonymous with quality, timely executions,
 * customer satisfaction, giving before-time delivery of units, and most
 * importantly unique innovations." Each is supported by the company's own
 * words, quoted verbatim — `quote` returns null rather than a paraphrase if
 * the source text ever changes, and the line is then left out.
 *
 * On desktop the image column holds still while the values pass; the value
 * crossing the middle of the screen becomes the active one and its image
 * wipes up over the last. On smaller screens each value carries its own image.
 */

const quote = (source: string, fragment: string) =>
  source.includes(fragment) ? fragment : null;

const vision = company.vision ?? "";
const values = company.values ?? "";
const statement = milestoneHeadings.statement;
const about = ABOUT_PARAGRAPHS.join(" ");

type Value = {
  title: string;
  text: string | null;
  source: string;
  image: string;
  alt: string;
  caption: string;
  position: string;
};

const VALUES: Value[] = [
  {
    title: "Quality",
    text: quote(vision, "deliver superior value in design, quality and service in our developments to our customers."),
    source: "From our vision",
    image: "/home-values/milestone-facades.webp",
    alt: "The facades of The Avenue Milestone towers in daylight",
    caption: "Milestone · Facades",
    position: "50% 40%",
  },
  {
    title: "Timely execution",
    text: quote(statement, "giving before-time delivery of units"),
    source: "From our journey",
    image: "/home-values/milestone-night.webp",
    alt: "The Avenue Milestone towers lit at night",
    caption: "Milestone · Evening",
    position: "50% 45%",
  },
  {
    title: "Customer satisfaction",
    text: quote(values, "We deliver to our customers the joy of living, the serenity of space and the place to interact with their family."),
    source: "From our values",
    image: "/built-for-more/balcony.webp",
    alt: "A furnished balcony living space looking out over the city",
    caption: "Milestone · Balcony living",
    position: "58% 50%",
  },
  {
    title: "Unique innovation",
    text: quote(about, "Our dedicated team stays informed about the latest trends and products in the international market, allowing us to meet the high demands of the local market with innovative solutions."),
    source: "From our story",
    image: "/hero-lobby.jpg",
    alt: "The entrance lobby of The Avenue Milestone",
    caption: "Milestone · Lobby",
    position: "62% 50%",
  },
];

const pad = (n: number) => String(n).padStart(2, "0");

function ValueRow({
  value,
  index,
  active,
  rowRef,
}: {
  value: Value;
  index: number;
  active: boolean;
  rowRef: (el: HTMLElement | null) => void;
}) {
  const [ref, visible] = useReveal<HTMLElement>(0.2);
  // Only complete sentences are quoted whole; fragments get an ellipsis.
  const fragment = value.text && !/^[A-Z]/.test(value.text);

  return (
    <article
      ref={(el) => {
        (ref as MutableRefObject<HTMLElement | null>).current = el;
        rowRef(el);
      }}
      data-index={index}
      className="relative flex flex-col justify-center py-10 lg:min-h-[44vh] lg:py-12"
    >
      <span
        aria-hidden="true"
        className={`absolute inset-x-0 top-0 h-px origin-left bg-black/15 transition-transform duration-[1200ms] ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none ${
          visible ? "scale-x-100" : "motion-safe:scale-x-0"
        }`}
      />

      {/* Smaller screens: the value's image travels with it. */}
      <div
        className={`relative mb-8 aspect-[4/3] w-full overflow-hidden bg-[#F4F1E8] lg:hidden ${revealClass(visible)}`}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={value.image}
          alt={value.alt}
          loading="lazy"
          decoding="async"
          className="absolute inset-0 h-full w-full object-cover"
          style={{ objectPosition: value.position }}
        />
      </div>

      <div className={`transition-opacity duration-700 ${active ? "lg:opacity-100" : "lg:opacity-[0.32]"}`}>
        <div className={`flex items-center gap-4 ${revealClass(visible)}`}>
          <span className="text-[10px] uppercase tracking-[0.24em] text-[#5F684F]">Value</span>
        </div>

        <h3
          className={`mt-5 font-serif text-[clamp(36px,4vw,60px)] font-light leading-[1] tracking-[-0.04em] ${revealClass(
            visible,
            "delay-100",
          )}`}
        >
          {value.title}
        </h3>

        {value.text ? (
          <blockquote className={`mt-6 max-w-[460px] ${revealClass(visible, "delay-200")}`}>
            <p className="text-[15px] leading-[1.75] text-[#5F684F] md:text-[16px]">
              {fragment ? "…" : ""}
              {value.text}
              {fragment && !/[.!?]$/.test(value.text) ? "…" : ""}
            </p>
            <footer className="mt-3 text-[10px] uppercase tracking-[0.22em] text-[#5F684F]">
              {value.source}
            </footer>
          </blockquote>
        ) : null}
      </div>
    </article>
  );
}

export default function AvenueValues() {
  const [headRef, headIn] = useReveal<HTMLDivElement>(0.3);
  const [frameRef, frameIn] = useReveal<HTMLDivElement>(0.15);
  const rowRefs = useRef<(HTMLElement | null)[]>([]);
  const [active, setActive] = useState(0);

  // The value crossing the middle of the screen is the active one.
  useEffect(() => {
    const rows = rowRefs.current.filter((r): r is HTMLElement => !!r);
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActive(Number((entry.target as HTMLElement).dataset.index));
        });
      },
      { rootMargin: "-50% 0px -50% 0px", threshold: 0 },
    );
    rows.forEach((r) => io.observe(r));
    return () => io.disconnect();
  }, []);

  return (
    <section
      id="values"
      aria-labelledby="values-title"
      className="relative bg-[#F4F1E8] pb-24 text-[#2D3A1F] md:pb-28 lg:pb-32"
    >
      <div className="mx-auto max-w-[1450px] px-6 md:px-10 lg:px-12">
        <div className="lg:grid lg:grid-cols-12 lg:gap-x-12">
          {/* ================= STICKY IMAGE (desktop) ================= */}
          <div className="hidden lg:col-span-6 lg:block">
            {/* Observed here, not on the clipped frame inside it. */}
            <div ref={frameRef} className="sticky top-[17vh]">
              <div
                className={`relative h-[62vh] max-h-[720px] w-full overflow-hidden bg-[#F4F1E8] transition-[clip-path] duration-[1400ms] ease-[cubic-bezier(0.65,0,0.35,1)] motion-reduce:transition-none ${
                  frameIn ? "[clip-path:inset(0_0_0_0)]" : "motion-safe:[clip-path:inset(100%_0_0_0)]"
                }`}
              >
                {VALUES.map((value, i) => (
                  <div
                    key={value.title}
                    aria-hidden={i !== active}
                    className="absolute inset-0 overflow-hidden transition-[clip-path] duration-[1100ms] ease-[cubic-bezier(0.65,0,0.35,1)] motion-reduce:transition-none"
                    style={{
                      clipPath: i <= active ? "inset(0% 0% 0% 0%)" : "inset(100% 0% 0% 0%)",
                      zIndex: i + 1,
                    }}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={value.image}
                      alt={value.alt}
                      loading="lazy"
                      decoding="async"
                      className={`absolute inset-0 h-full w-full object-cover transition-transform duration-[1600ms] ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none ${
                        i === active ? "scale-100" : "scale-[1.06]"
                      }`}
                      style={{ objectPosition: value.position }}
                    />
                  </div>
                ))}
              </div>

              <div className="mt-4 flex items-center justify-between gap-6 text-[10px] uppercase tracking-[0.22em] text-[#5F684F]">
                <span>{VALUES[active].caption}</span>
                <span>
                  <span className="text-[#2D3A1F]">{pad(active + 1)}</span> / {pad(VALUES.length)}
                </span>
              </div>
            </div>
          </div>

          {/* ================= VALUES ================= */}
          <div className="lg:col-span-5 lg:col-start-8">
            <div ref={headRef} className={`pb-12 lg:pb-16 ${revealClass(headIn)}`}>
              <div className="mb-8 flex items-center gap-4 md:mb-10">
                <span className="text-[10px] uppercase tracking-[0.28em] text-[#2D3A1F]/55">Values</span>
              </div>
              <h2
                id="values-title"
                className="font-serif text-[clamp(40px,4.6vw,72px)] font-light leading-[0.98] tracking-[-0.045em]"
              >
                What The Avenue
                <br />
                <em className="italic text-brand-bronze">stands for.</em>
              </h2>
              <p className="mt-8 max-w-[500px] text-[15px] leading-[1.8] text-[#5F684F] md:text-[16px]">
                {statement}
              </p>
            </div>

            {VALUES.map((value, i) => (
              <ValueRow
                key={value.title}
                value={value}
                index={i}
                active={i === active}
                rowRef={(el) => {
                  rowRefs.current[i] = el;
                }}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
