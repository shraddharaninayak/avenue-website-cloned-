"use client";

import { useState } from "react";
import { company, projects } from "@/data/avenue";
import { ABOUT_PARAGRAPHS } from "./AvenuePortrait";
import { revealClass, useReveal } from "./motion";

/**
 * 06 — Capabilities. What The Avenue does.
 *
 * Every capability is one the company's own content supports, and each line
 * is checked against the data it rests on — if that data changes, the line is
 * left out rather than left wrong:
 *
 *   Residential development   residential projects and their configurations
 *   Commercial development    the commercial project's published features
 *   Development & trading     "property development and trading company"
 *                             and the principals' combined experience (About)
 *   Amenities & shared spaces the amenities published for each project
 *
 * The projects themselves are not shown here — that is the next section.
 * Hovering or focusing a capability brings its image forward.
 */

const has = (list: string[], needle: string) =>
  list.some((item) => item.toLowerCase().includes(needle.toLowerCase()));

const residential = projects.filter((p) => p.category === "Residential");
const commercial = projects.filter((p) => p.category === "Commercial");
const allAmenities = projects.flatMap((p) => p.amenities);
const commercialFeatures = commercial.flatMap((p) => p.features);
const about = ABOUT_PARAGRAPHS.join(" ");

/** "2 & 3 BHK", "3 & 4 BHK" … → "2, 3 & 4" */
const bhk = Array.from(new Set(residential.flatMap((p) => (p.configuration.match(/\d/g) ?? []).map(Number)))).sort();
const bhkList = bhk.length > 1 ? `${bhk.slice(0, -1).join(", ")} & ${bhk[bhk.length - 1]}` : bhk.join("");

type Capability = {
  title: string;
  text: string | null;
  source: string;
  image: string;
  alt: string;
  caption: string;
};

const CAPABILITIES: Capability[] = [
  {
    title: "Residential development",
    text:
      residential.length && bhk.length && residential.every((p) => p.amenities.length)
        ? "Residential developments featuring thoughtfully planned 2, 3 and 4 BHK homes with well-designed amenities and shared spaces."
        : null,
    source: "From our portfolio",
    image: "/home-sections/capability-residential.webp",
    alt: "A living and dining space opening onto a balcony, with a couple at the window",
    caption: "Milestone · Living and dining",
  },
  {
    title: "Commercial development",
    text:
      has(commercialFeatures, "Office spaces") &&
      has(commercialFeatures, "Showroom spaces")
        ? "Office and showroom spaces across Nashik, built for businesses, professionals and retailers."
        : null,
    source: "From our portfolio",
    image: "/home-sections/capability-commercial.webp",
    alt: "A lit shopfront podium at the base of an Avenue tower in the evening",
    caption: "Milestone · Street frontage",
  },
  {
    title: "Real estate development",
    text:
      company.description.includes("Nashik-based real estate development company") &&
      about.includes("50+ years of combined leadership experience")
        ? "Real estate development across residential, commercial and industrial projects, with 50+ years of combined leadership experience."
        : null,
    source: "From our story",
    image: "/home-sections/capability-development.webp",
    alt: "The Avenue Milestone towers among the trees and rooftops of the city, from above",
    caption: "Milestone · In its neighbourhood",
  },
  {
    title: "Amenities & shared spaces",
    text:
      has(allAmenities, "infinity") &&
      has(allAmenities, "gym") &&
      has(allAmenities, "landscaped garden") &&
      has(allAmenities, "play") &&
      has(allAmenities, "senior citizen")
        ? "Infinity pools, gyms, landscaped gardens and play areas, with spaces for children and senior citizens alike."
        : null,
    source: "From our amenities",
    image: "/home-sections/capability-amenities.webp",
    alt: "A pool deck beside an Avenue tower on a sunny morning",
    caption: "Milestone · Pool deck",
  },
];

const pad = (n: number) => String(n).padStart(2, "0");

function Row({
  capability,
  index,
  active,
  onActivate,
}: {
  capability: Capability;
  index: number;
  active: boolean;
  onActivate: () => void;
}) {
  const [ref, visible] = useReveal<HTMLLIElement>(0.25);

  return (
    <li
      ref={ref}
      onMouseEnter={onActivate}
      onFocus={onActivate}
      className={`group relative cursor-default py-8 transition-opacity duration-500 md:py-9 ${
        active ? "lg:opacity-100" : "lg:opacity-[0.45]"
      }`}
    >
      <span
        aria-hidden="true"
        className={`absolute inset-x-0 top-0 h-px origin-left bg-[#584738]/15 transition-transform duration-[1200ms] ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none ${
          visible ? "scale-x-100" : "motion-safe:scale-x-0"
        }`}
      />

      {/* Smaller screens: each capability shows its own image. */}
      <div className={`relative mb-7 aspect-[16/9] w-full overflow-hidden bg-[#F1EADA] lg:hidden ${revealClass(visible)}`}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={capability.image}
          alt={capability.alt}
          loading="lazy"
          decoding="async"
          className="absolute inset-0 h-full w-full object-cover"
        />
      </div>

      {/* Focusable so keyboard users can bring each image forward too. */}
      <div tabIndex={0} className="outline-none focus-visible:ring-1 focus-visible:ring-brand-bronze/60 focus-visible:ring-offset-8 focus-visible:ring-offset-[#F1EADA]">
        <div className={`grid grid-cols-[48px_1fr] gap-x-4 md:grid-cols-[64px_1fr] ${revealClass(visible)}`}>
          <span className="pt-3 font-grotesk text-[11px] tracking-[0.2em] text-brand-bronze md:pt-4">{pad(index + 1)}</span>
          <div>
            <h3
              className={`font-serif text-[clamp(30px,3.2vw,48px)] lg:text-[clamp(24px,2.4vw,38px)] font-light leading-[1.02] tracking-[-0.04em] transition-transform duration-500 ease-out ${
                active ? "lg:translate-x-2" : ""
              }`}
            >
              {capability.title}
            </h3>
            {capability.text ? (
              <p className="mt-4 max-w-[520px] text-[15px] leading-[1.75] text-[#AAA396] md:text-[16px]">
                {capability.text}
              </p>
            ) : null}
            <p className="mt-3 text-[10px] uppercase tracking-[0.22em] text-[#AAA396]">{capability.source}</p>
          </div>
        </div>
      </div>
    </li>
  );
}

export default function AvenueCapabilities() {
  const [headRef, headIn] = useReveal<HTMLDivElement>(0.3);
  const [frameRef, frameIn] = useReveal<HTMLDivElement>(0.15);
  const [active, setActive] = useState(0);

  return (
    <section
      id="capabilities"
      aria-labelledby="capabilities-title"
      className="bg-[#F1EADA] pb-24 pt-24 text-[#584738] md:pb-10 md:pt-32"
    >
      <div className="mx-auto max-w-[1450px] px-6 md:px-10 lg:px-12">
        {/* HEADING */}
        <div ref={headRef} className={`grid gap-y-6 lg:grid-cols-12 lg:items-end ${revealClass(headIn)}`}>
          <div className="lg:col-span-8">
            <div className="mb-8 flex items-center gap-4 md:mb-10">
              <span className="text-[10px] uppercase tracking-[0.28em] text-[#584738]/55">Capabilities</span>
            </div>
            <h2
              id="capabilities-title"
              className="font-serif text-[clamp(32px,4vw,60px)] font-light leading-[0.94] tracking-[-0.05em]"
            >
              Our <em className="italic">capabilities.</em>
            </h2>
            <p className="mt-6 max-w-[480px] text-[15px] leading-[1.8] text-[#AAA396] md:text-[16px]">
              Building across residential, commercial and industrial spaces.
            </p>
          </div>
        </div>

        {/* LIST + IMAGE */}
        <div className="mt-14 md:mt-20 lg:grid lg:grid-cols-12 lg:gap-x-12">
          <ol className="border-b border-[#584738]/15 lg:col-span-7">
            {CAPABILITIES.map((capability, i) => (
              <Row
                key={capability.title}
                capability={capability}
                index={i}
                active={i === active}
                onActivate={() => setActive(i)}
              />
            ))}
          </ol>

          <div className="hidden lg:col-span-5 lg:block">
            <div ref={frameRef} className="sticky top-28">
              <div
                className={`relative aspect-[4/3] w-full overflow-hidden bg-[#F1EADA] transition-[clip-path] duration-[1400ms] ease-[cubic-bezier(0.65,0,0.35,1)] motion-reduce:transition-none ${
                  frameIn ? "[clip-path:inset(0_0_0_0)]" : "motion-safe:[clip-path:inset(100%_0_0_0)]"
                }`}
              >
                {CAPABILITIES.map((capability, i) => (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    key={capability.title}
                    src={capability.image}
                    alt={i === active ? capability.alt : ""}
                    aria-hidden={i !== active}
                    loading="lazy"
                    decoding="async"
                    className={`absolute inset-0 h-full w-full object-cover transition-[opacity,transform] duration-[900ms] ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none ${
                      i === active ? "scale-100 opacity-100" : "scale-[1.04] opacity-0"
                    }`}
                  />
                ))}
              </div>
              <div className="mt-4 flex items-center justify-between gap-6 text-[10px] uppercase tracking-[0.22em] text-[#AAA396]">
                <span>{CAPABILITIES[active].caption}</span>
                <span>
                  <span className="text-[#584738]">{pad(active + 1)}</span> / {pad(CAPABILITIES.length)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
