"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Instagram, Facebook, Youtube } from "lucide-react";
import { company, socials } from "@/data/avenue";

/**
 * Footer, staged as the Avenue branding wall at night.
 *
 * The footer is a small room: the branding wall (with its plant) above, a
 * floor below that the legal row stands on, a ceiling lamp throwing a warm
 * pool of light onto the upper right of the wall, and the wall falling away
 * into shadow toward its base, the left, and a return wall on the right.
 *
 * Each effect is its own layer, anchored where it belongs — the floor to the
 * legal row, the lamp to the top right, the plant to the floor on the left —
 * so the composition holds at every width. Overlay stops and the glow were
 * fitted against the reference render, region by region.
 *
 * public/footer/avenue-wall-room.webp is the supplied wall, with the plant
 * lifted onto its own layer (plant.webp) and plain wall added either side so
 * the lettering sits at the reference's scale. The wall is an <img> with
 * object-fit: cover, which renders like background-size: cover but lazy-loads.
 *
 * Content is kept to one line on the floor — logo, copyright, legal links and
 * social profiles — so the wall itself is left clear to be seen.
 */

const socialIcons = {
  Facebook,
  Instagram,
  YouTube: Youtube,
} as const;

const legalLinks = [
  { label: "Privacy Policy", href: "/contact" },
  { label: "Terms & Conditions", href: "/contact" },
] as const;

/* -------------------------------------------------------------------------- */
/*  Light                                                                     */
/* -------------------------------------------------------------------------- */

type Stop = readonly [position: number, alpha: number];

const shade = (direction: string, stops: readonly Stop[]) =>
  `linear-gradient(${direction}, ${stops
    .map(([at, a]) => `rgba(8, 6, 4, ${a}) ${at}%`)
    .join(", ")})`;

/** The wall darkens from the lamp-lit top toward its base. */
const WALL_FALLOFF: readonly Stop[] = [
  [0, 0.02], [12.5, 0.12], [25, 0.14], [37.5, 0.3], [50, 0.32],
  [62.5, 0.48], [75, 0.57], [87.5, 0.63], [100, 0.7],
];

/** Shadow behind the plant on the left, the return wall on the right. */
const WALL_SIDES: readonly Stop[] = [
  [0, 0.1], [9.3, 0.25], [9.5, 0.7], [14, 0.72], [18, 0.58], [26, 0.51], [40, 0.46],
  [55, 0.49], [68, 0.57], [80, 0.58], [88, 0.59], [94, 0.71], [95.2, 0.81], [100, 0.88],
];

/** On narrow screens the text runs over the whole wall, so the sides stay even. */
const WALL_SIDES_NARROW: readonly Stop[] = [
  [0, 0.56], [50, 0.48], [85, 0.56], [100, 0.72],
];

/**
 * Where the content starts on a desktop footer: the content column is
 * max-w-[1320px] with 48px padding. The room is built off these edges — the
 * plant just outside the content's left edge, the lamp above its right edge,
 * the return wall 66px beyond it — so the composition holds at every width.
 */
const INSET = "max(48px, calc((100% - 1320px) / 2 + 48px))";
const LEFT_CORNER = `calc(${INSET} - 11px)`;
const RIGHT_CORNER = `calc(100% - ${INSET} + 66px)`;
const CONTENT_RIGHT = `calc(100% - ${INSET})`;

/**
 * The lamp's light on the wall, screened on: a bright core just under the
 * fixture, and a softer spill that widens as it falls.
 */
const lampLight = (a: number, rx: number, ry: number, dx: number, y: number, mid: number) =>
  `radial-gradient(${rx}px ${ry}px at calc(100% - ${INSET} - ${dx}px) ${y}px, rgba(255, 196, 96, ${a}) 0%, rgba(255, 196, 96, ${(a * 0.45).toFixed(3)}) ${mid * 100}%, rgba(255, 196, 96, 0) 100%)`;
const LAMP_LIGHT = [
  lampLight(0.49, 75, 62, 45, 81, 0.53),
  lampLight(0.19, 118, 64, 82, 138, 0.66),
];

/** The floor: darkest on the left, catching a little lamp light on the right. */
const FLOOR =
  "linear-gradient(to right, rgb(9, 8, 6) 0%, rgb(13, 11, 8) 16%, rgb(16, 13, 10) 30%, rgb(20, 17, 12) 40%, rgb(25, 20, 15) 50%, rgb(26, 21, 16) 64%, rgb(27, 22, 17) 76%, rgb(32, 26, 20) 84%, rgb(34, 28, 21) 88%, rgb(32, 26, 20) 92%, rgb(22, 19, 14) 100%)";

/* -------------------------------------------------------------------------- */

export default function Footer() {
  const footerRef = useRef<HTMLElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const footer = footerRef.current;
    if (!footer) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.12 },
    );
    observer.observe(footer);
    return () => observer.disconnect();
  }, []);

  // Hidden states apply only when motion is allowed, so reduced-motion
  // visitors get the footer as it is, straight away.
  const reveal = (delay: string) =>
    `transition-[opacity,transform] duration-1000 ease-out ${delay} motion-reduce:transition-none ${
      visible ? "opacity-100 translate-y-0" : "motion-safe:opacity-0 motion-safe:translate-y-5"
    }`;

  return (
    <footer
      ref={footerRef}
      className="relative isolate overflow-hidden bg-[#0c0a09] text-white"
    >
      {/* ============================ THE WALL ============================ */}
      <div className="relative">
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/footer/avenue-wall-room.webp"
            alt=""
            loading="lazy"
            decoding="async"
            className={`absolute inset-0 h-full w-full object-cover object-[50%_100%] transition-transform duration-[1800ms] ease-out motion-reduce:transition-none ${
              visible ? "scale-100" : "motion-safe:scale-[1.03]"
            }`}
          />

          {/* The wall ends short of the left edge too; the plant stands in front of the corner. */}
          <div className="absolute bottom-0 left-0 top-0 hidden bg-[rgba(26,24,21,0.82)] lg:block" style={{ width: LEFT_CORNER }} />
          <div className="absolute bottom-0 top-0 hidden w-px bg-black/50 lg:block" style={{ left: LEFT_CORNER }} />

          <div className="absolute inset-0" style={{ backgroundImage: shade("to bottom", WALL_FALLOFF) }} />
          <div className="absolute inset-0 hidden lg:block" style={{ backgroundImage: shade("to right", WALL_SIDES) }} />
          <div className="absolute inset-0 lg:hidden" style={{ backgroundImage: shade("to right", WALL_SIDES_NARROW) }} />

          {/* The lamp's light on the wall — under the ceiling shading, so the
              ceiling line cuts it off the way it does on a real wall-wash. */}
          {LAMP_LIGHT.map((light) => (
            <div key={light} className="absolute inset-0 hidden mix-blend-screen lg:block" style={{ backgroundImage: light }} />
          ))}

          {/* The wall's top edge in perspective, the ceiling above it in shadow,
              and the corner where the wall turns into the return wall. */}
          <svg
            className="absolute left-0 top-0 hidden h-[94px] lg:block"
            style={{ width: RIGHT_CORNER }}
            viewBox="0 0 1000 94"
            preserveAspectRatio="none"
          >
            <polygon points="378,0 1000,92 1000,0" fill="rgba(8, 6, 4, 0.22)" />
            <line x1="378" y1="0" x2="1000" y2="92" stroke="rgba(0, 0, 0, 0.7)" strokeWidth="2.5" vectorEffect="non-scaling-stroke" />
          </svg>
          <div className="absolute bottom-0 right-0 top-0 hidden bg-[rgba(12,11,9,0.78)] lg:block" style={{ left: RIGHT_CORNER }} />
          <div className="absolute bottom-0 top-[92px] hidden w-px bg-black/60 lg:block" style={{ left: RIGHT_CORNER }} />

          {/* The fixture. */}
          <span
            className="absolute top-[24px] hidden h-[6px] w-[20px] -translate-x-1/2 rounded-[50%] bg-[#ebe6dc] shadow-[0_0_10px_3px_rgba(255,226,170,0.45)] lg:block"
            style={{ left: CONTENT_RIGHT }}
          />
        </div>

        {/* The wall is left clear: it is the footer's image. */}
        <div aria-hidden="true" className="h-[240px] sm:h-[300px] md:h-[340px] lg:h-[400px]" />
      </div>

      {/* ============================ THE FLOOR ============================ */}
      <div className="relative">
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10" style={{ backgroundImage: FLOOR }}>
          {/* Where the wall meets the floor. */}
          <div className="absolute inset-x-0 top-0 h-px bg-black/60" />
          <div className="absolute inset-x-0 top-px h-3 bg-gradient-to-b from-black/35 to-transparent" />
        </div>

        <div className="mx-auto max-w-[1320px] px-6 pb-10 pt-2 md:px-10 lg:px-12 lg:pb-12">
          <div
            aria-hidden="true"
            className={`h-px w-full origin-left bg-white/25 transition-transform delay-200 duration-[1200ms] ease-out motion-reduce:transition-none ${
              visible ? "scale-x-100" : "motion-safe:scale-x-0"
            }`}
          />
          <div
            className={`grid grid-cols-1 items-center justify-items-center gap-y-7 pt-9 text-center font-grotesk text-[10.5px] uppercase leading-5 tracking-[0.18em] text-white/75 xl:grid-cols-[auto_1fr_auto] xl:gap-x-12 xl:pt-10 ${reveal("delay-300")}`}
          >
            <Link href="/" aria-label={`${company.name} — home`} className="block w-fit xl:justify-self-start">
              <Image
                src="/logo-avenue-white.webp"
                alt={`${company.name} — Reason to Smile!`}
                width={1400}
                height={589}
                className="block h-[52px] w-auto lg:h-[58px]"
              />
            </Link>

            {/* On one desktop row it takes two centred lines, leaving the right-hand group room for one. */}
            <p className="max-w-[340px] sm:max-w-none xl:max-w-[330px]">
              © {new Date().getFullYear()} {company.name}. All rights reserved.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-4 xl:flex-nowrap xl:justify-self-end xl:whitespace-nowrap">
              <nav aria-label="Legal" className="flex items-center gap-x-3">
                {legalLinks.map((link, i) => (
                  <React.Fragment key={link.label}>
                    {i > 0 ? <span aria-hidden="true" className="text-white/35">/</span> : null}
                    <Link
                      href={link.href}
                      className="whitespace-nowrap transition-colors duration-300 hover:text-brand-gold focus-visible:text-brand-gold focus-visible:outline-none"
                    >
                      {link.label}
                    </Link>
                  </React.Fragment>
                ))}
              </nav>
              <span aria-hidden="true" className="hidden text-white/35 sm:inline">/</span>
              <div className="flex items-center gap-3">
                <span className="whitespace-nowrap">Follow us on:</span>
                <ul className="flex items-center gap-2">
                  {socials.map((social) => {
                    const Icon = socialIcons[social.label];
                    return (
                      <li key={social.label}>
                        <a
                          href={social.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label={`The Avenue on ${social.label}`}
                          className="flex h-9 w-9 items-center justify-center rounded-full bg-[#a8917d] text-white transition-colors duration-300 hover:bg-brand-gold hover:text-black focus-visible:bg-brand-gold focus-visible:text-black focus-visible:outline-none"
                        >
                          <Icon className="h-4 w-4" strokeWidth={1.7} />
                        </a>
                      </li>
                    );
                  })}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* The plant, in front of the left corner, its pot standing forward on
          the floor — after the floor, so the pot is drawn over it. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/footer/plant.webp"
        alt=""
        aria-hidden="true"
        loading="lazy"
        decoding="async"
        className="pointer-events-none absolute bottom-[42px] -z-10 hidden h-[560px] w-auto max-w-none brightness-[0.45] saturate-[0.8] lg:block"
        style={{ left: `calc(${INSET} - 145px)` }}
      />
    </footer>
  );
}
