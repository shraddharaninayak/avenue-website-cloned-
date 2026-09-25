"use client";

import {
  useEffect,
  useRef,
  useState,
  type FormEvent,
  type ReactNode,
} from "react";
import Link from "next/link";
import {
  ArrowDown,
  ArrowRight,
  ArrowUpRight,
  Download,
  ExternalLink,
  Mail,
  MapPin,
  Phone,
  Plus,
} from "lucide-react";
import { company } from "@/data/avenue";
import {
  projectHref,
  type Media,
  type ProjectDetail as Detail,
} from "@/data/projectDetails";
import {
  lerp,
  revealClass,
  useReveal,
  useViewportProgress,
} from "@/components/home/motion";
import Lightbox from "./Lightbox";
import type { ProjectSection as SectionType } from "@/data/projectDetails";

/**
 * The project page, shared by every Avenue project. Structure after the
 * reference's project pages — a full-bleed image, the name and key facts on a
 * panel that rises over it, then the images, and an enquiry to close — with
 * the sections the brochures support in between: amenities, location, floor
 * plans and the brochure itself.
 *
 * Each section renders only if the project has content for it, and the
 * section numbers follow what is actually shown.
 *
 * Background: premium warm cream (#f3f0eb / #ede9e2 alternating), dark ink
 * text — matching the homepage editorial tone. The hero remains a full-bleed
 * dark photo section (unchanged).
 */

const pad = (n: number) => String(n).padStart(2, "0");
const ratio = (m: Media, min: number, max: number) =>
  Math.min(max, Math.max(min, m.w / m.h));

/** Share of an image still in view once it covers a frame of this shape. */
const coverage = (m: Media, frameAspect: number) => {
  const a = m.w / m.h;
  return Math.min(a / frameAspect, frameAspect / a);
};

/**
 * Below this coverage a render is shown whole instead — over a soft wash of
 * itself — rather than cut to fit.
 */
const MIN_COVERAGE = 0.6;

/** Softens the two edges a fitted image meets its wash along. */
const edgeMask = (direction: "to bottom" | "to right", fade: number) => {
  const mask = `linear-gradient(${direction}, transparent, #000 ${fade}%, #000 ${100 - fade}%, transparent)`;
  return { WebkitMaskImage: mask, maskImage: mask };
};

/** The wash behind a fitted image: the same image, blurred and dimmed. */
function Wash({ media, position }: { media: Media; position?: string }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={media.src}
      alt=""
      aria-hidden="true"
      loading="lazy"
      decoding="async"
      className="absolute inset-0 h-full w-full scale-110 object-cover blur-2xl brightness-[0.55] saturate-[1.1]"
      style={{ objectPosition: position }}
    />
  );
}

function SectionLabel({ label }: { label: string }) {
  return (
    <div className="mb-8 flex items-center gap-4 md:mb-10">
      <span className="text-[10px] uppercase tracking-[0.28em] text-[#584738]/50">
        {label}
      </span>
    </div>
  );
}

function Reveal({
  children,
  className = "",
  delay = "",
}: {
  children: ReactNode;
  className?: string;
  delay?: string;
}) {
  const [ref, visible] = useReveal<HTMLDivElement>(0.15);
  return (
    <div ref={ref} className={`${className} ${revealClass(visible, delay)}`}>
      {children}
    </div>
  );
}

function RevealItem({
  children,
  className = "",
  delay = "",
}: {
  children: ReactNode;
  className?: string;
  delay?: string;
}) {
  const [ref, visible] = useReveal<HTMLLIElement>(0.15);
  return (
    <li ref={ref} className={`${className} ${revealClass(visible, delay)}`}>
      {children}
    </li>
  );
}


/** An image that opens through a mask and drifts slightly within it. */
function MaskedImage({
  media,
  aspect,
  onOpen,
  className = "",
  position = "50% 50%",
}: {
  media: Media;
  aspect: number;
  onOpen?: () => void;
  className?: string;
  position?: string;
}) {
  const [ref, visible] = useReveal<HTMLDivElement>(0.12);
  const imgRef = useRef<HTMLImageElement>(null);
  useViewportProgress(ref, (p) => {
    if (imgRef.current)
      imgRef.current.style.transform = `translate3d(0, ${lerp(3.5, -3.5, p).toFixed(3)}%, 0)`;
  });

  const inner = (
    <div
      className={`group relative w-full overflow-hidden bg-[#584738]/60 transition-[clip-path] duration-[1300ms] ease-[cubic-bezier(0.65,0,0.35,1)] motion-reduce:transition-none ${
        visible
          ? "[clip-path:inset(0_0_0_0)]"
          : "motion-safe:[clip-path:inset(100%_0_0_0)]"
      }`}
      style={{ aspectRatio: String(aspect) }}
    >
      <div className="absolute inset-0 transition-transform duration-[1200ms] ease-out group-hover:scale-[1.03]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          ref={imgRef}
          src={media.src}
          alt={media.alt}
          loading="lazy"
          decoding="async"
          className="absolute inset-x-0 -top-[4%] h-[108%] w-full max-w-none object-cover will-change-transform"
          style={{ objectPosition: position }}
        />
      </div>
      {onOpen ? (
        <span className="pointer-events-none absolute bottom-3 right-3 flex h-9 w-9 items-center justify-center border border-white/30 bg-[#584738]/50 text-white opacity-0 transition-opacity duration-300 group-hover:opacity-100 group-focus-visible:opacity-100">
          <Plus className="h-4 w-4" />
        </span>
      ) : null}
    </div>
  );

  return (
    <div ref={ref} className={className}>
      {onOpen ? (
        <button
          type="button"
          onClick={onOpen}
          aria-label={`View larger: ${media.alt}`}
          className="group block w-full text-left"
        >
          {inner}
        </button>
      ) : (
        inner
      )}
    </div>
  );
}

/* ============================================================================
 *  01 — HERO  (stays dark — full-bleed photo section)
 * ========================================================================== */

function Hero({ project }: { project: Detail }) {
  const imgRef = useRef<HTMLImageElement>(null);
  const [loaded, setLoaded] = useState(false);
  useEffect(() => {
    if (imgRef.current?.complete) setLoaded(true);
  }, []);
  const heroFacts = project.facts.slice(0, 3);
  const hero = project.hero;
  const position = project.heroPosition ?? "50% 50%";

  return (
    <section
      data-header="clear"
      className="relative h-[100svh] min-h-[640px] overflow-hidden bg-[#584738] text-white"
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        ref={imgRef}
        src={hero.src}
        alt={hero.alt}
        fetchPriority="high"
        onLoad={() => setLoaded(true)}
        className={`absolute inset-0 h-full w-full object-cover transition-[transform,opacity] duration-[1800ms] ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none ${
          loaded ? "scale-100 opacity-100" : "scale-[1.06] opacity-0"
        }`}
        style={{ objectPosition: position }}
      />
      <div
        aria-hidden="true"
        className="absolute inset-x-0 top-0 h-48 bg-gradient-to-b from-[#584738]/60 to-transparent"
      />
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-[linear-gradient(to_top,rgba(88,71,56,0.92)_0%,rgba(88,71,56,0.6)_30%,rgba(88,71,56,0.1)_62%,rgba(88,71,56,0)_100%)]"
      />


<div className="absolute inset-x-0 bottom-0 mx-auto max-w-[1450px] px-6 pb-24 md:px-10 md:pb-28 lg:px-12">
        <div className={revealClass(loaded)}>
          <p className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[10px] uppercase tracking-[0.26em] text-white/70">
            <span className="text-brand-gold">The Avenue</span>
            <span className="hidden sm:inline">{project.category}</span>
            <span>{project.eyebrow}</span>
          </p>
          <h1 className="mt-5 font-serif text-[clamp(64px,11vw,176px)] font-light leading-[0.86] tracking-[-0.05em]">
            {project.name}
          </h1>
          <p className="mt-5 font-serif text-[clamp(22px,2.4vw,34px)] font-light italic leading-[1.2] tracking-[-0.02em] text-[#B59E7D]">
            {project.tagline}
          </p>
        </div>

        <div
          className={`mt-8 grid gap-8 lg:grid-cols-12 lg:items-end ${revealClass(loaded, "delay-200")}`}
        >
          <ul className="flex flex-wrap gap-x-7 gap-y-2 text-[12px] uppercase tracking-[0.18em] text-white/85 lg:col-span-8">
            {heroFacts.map((f) => (
              <li key={f.label} className="flex items-center gap-2.5">
                <ArrowRight
                  aria-hidden="true"
                  className="h-3.5 w-3.5 text-brand-gold"
                />
                <span>
                  {f.value} <span className="text-white/60">{f.label}</span>
                </span>
              </li>
            ))}
          </ul>
          <div className="flex flex-wrap gap-3 lg:col-span-4 lg:justify-end">
            <a
              href="#enquire"
              className="inline-flex items-center gap-3 bg-[#584738] px-7 py-3.5 font-grotesk text-[11px] font-semibold uppercase tracking-[0.2em] text-white transition-colors duration-300 hover:bg-brand-bronze"
            >
              Enquire
              <ArrowDown className="h-4 w-4" />
            </a>
            {project.brochure ? (
              <a
                href={project.brochure.href}
                target="_blank"
                rel="noopener"
                className="inline-flex items-center gap-3 border border-white/35 px-7 py-3.5 font-grotesk text-[11px] font-semibold uppercase tracking-[0.2em] text-white transition-colors duration-300 hover:border-brand-gold hover:text-brand-gold"
              >
                View brochure
                <ExternalLink className="h-4 w-4" />
              </a>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ============================================================================
 *  OVERVIEW — rises over the hero on rounded corners
 * ========================================================================== */

function Overview({ project }: { project: Detail }) {
  const [lead, ...rest] = project.story.paragraphs;
  return (
    <section
      id="overview"
      aria-labelledby="overview-title"
      className="relative z-10 -mt-10 scroll-mt-24 overflow-hidden rounded-t-[24px] bg-[#F1EADA] md:-mt-14 md:rounded-t-[44px]"
    >
      <div className="relative mx-auto max-w-[1450px] px-6 pb-24 pt-20 md:px-10 md:pb-28 md:pt-24 lg:px-12">
        <div className="grid gap-y-16 lg:grid-cols-12 lg:gap-x-12">
          <Reveal className="lg:col-span-6">
            <SectionLabel label="Overview" />
            <h2
              id="overview-title"
              className="font-serif text-[clamp(38px,4.6vw,72px)] font-light leading-[0.98] tracking-[-0.045em] text-[#584738]"
            >
              {project.story.heading}
            </h2>
            {project.subline ? (
              <p className="mt-6 max-w-[560px] text-[12px] uppercase leading-[1.8] tracking-[0.2em] text-brand-gold">
                {project.subline}
              </p>
            ) : null}
            <p className="mt-10 max-w-[600px] font-serif text-[clamp(20px,1.8vw,26px)] font-light leading-[1.35] tracking-[-0.015em] text-[#584738]/75">
              {lead}
            </p>
            {rest.map((p, i) => (
              <p
                key={i}
                className={`mt-5 max-w-[600px] text-[15px] leading-[1.8] md:text-[16px] ${
                  i === rest.length - 1 && rest.length > 2
                    ? "text-[#584738]/65"
                    : "text-[#584738]/55"
                }`}
              >
                {p}
              </p>
            ))}
            <p className="mt-8 text-[10px] uppercase tracking-[0.22em] text-[#584738]/35">
              {project.story.source}
            </p>
          </Reveal>

          <Reveal
            className="lg:col-span-5 lg:col-start-8 lg:pt-16"
            delay="delay-150"
          >
            <dl className="border-b border-[#584738]/10">
              {project.facts.map((f) => (
                <div
                  key={f.label}
                  className="grid grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] items-baseline gap-6 border-t border-[#584738]/10 py-6"
                >
                  <dt className="order-2 text-[11px] uppercase leading-[1.6] tracking-[0.2em] text-[#584738]/50">
                    {f.label}
                    {f.note ? (
                      <span className="mt-1 block normal-case tracking-[0.02em] text-[#584738]/35">
                        {f.note}
                      </span>
                    ) : null}
                  </dt>
                  <dd className="order-1 font-serif text-[clamp(30px,3vw,46px)] font-light leading-none tracking-[-0.03em] text-brand-gold">
                    {f.value}
                  </dd>
                </div>
              ))}
            </dl>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

/* ============================================================================
 *  IMAGE STORY
 * ========================================================================== */

function ImageStory({
  project,
  onOpen,
}: {
  project: Detail;
  onOpen: (i: number) => void;
}) {
  const blocks: { kind: "full" | "pair"; items: number[] }[] = [];
  let i = 0;
  while (i < project.gallery.length) {
    if (blocks.length % 2 === 0 || i === project.gallery.length - 1) {
      blocks.push({ kind: "full", items: [i] });
      i += 1;
    } else {
      blocks.push({ kind: "pair", items: [i, i + 1] });
      i += 2;
    }
  }
  const caption = (n: number) => (
    <figcaption className="mt-4 flex items-center justify-between gap-6 text-[10px] uppercase tracking-[0.22em] text-[#584738]/50">
      <span>{project.gallery[n].caption}</span>
      <span>
        <span className="text-[#584738]/70">{pad(n + 1)}</span> /{" "}
        {pad(project.gallery.length)}
      </span>
    </figcaption>
  );

  return (
    <section
      id="gallery"
      aria-labelledby="gallery-title"
      className="relative scroll-mt-24 overflow-hidden bg-[#F1EADA]"
    >
      <div className="relative mx-auto max-w-[1450px] px-6 pb-24 pt-24 md:px-10 md:pb-32 md:pt-28 lg:px-12">
        <Reveal className="grid gap-y-6 lg:grid-cols-12 lg:items-end">
          <div className="lg:col-span-8">
            <SectionLabel label="Images" />
            <h2
              id="gallery-title"
              className="font-serif text-[clamp(38px,4.6vw,72px)] font-light leading-[0.98] tracking-[-0.045em] text-[#584738]"
            >
              {project.name},{" "}
              <em className="italic">in images.</em>
            </h2>
          </div>
          <p className="text-[10px] uppercase tracking-[0.24em] text-[#584738]/45 lg:col-span-3 lg:col-start-10 lg:text-right">
            Select an image to view it larger
          </p>
        </Reveal>

        <div className="mt-14 space-y-16 md:mt-20 md:space-y-24">
          {blocks.map((block, b) =>
            block.kind === "full" ? (
              <figure key={b}>
                <MaskedImage
                  media={project.gallery[block.items[0]]}
                  aspect={ratio(project.gallery[block.items[0]], 1.5, 2.4)}
                  onOpen={() => onOpen(block.items[0])}
                />
                {caption(block.items[0])}
              </figure>
            ) : (
              <div
                key={b}
                className={`grid gap-y-16 md:grid-cols-12 md:gap-x-8 lg:gap-x-12 ${b % 4 === 3 ? "md:[direction:rtl]" : ""}`}
              >
                <figure className="md:col-span-7 md:[direction:ltr]">
                  <MaskedImage
                    media={project.gallery[block.items[0]]}
                    aspect={ratio(project.gallery[block.items[0]], 0.8, 1.6)}
                    onOpen={() => onOpen(block.items[0])}
                  />
                  {caption(block.items[0])}
                </figure>
                <figure className="md:col-span-5 md:mt-32 md:[direction:ltr]">
                  <MaskedImage
                    media={project.gallery[block.items[1]]}
                    aspect={ratio(project.gallery[block.items[1]], 0.72, 1.3)}
                    onOpen={() => onOpen(block.items[1])}
                  />
                  {caption(block.items[1])}
                </figure>
              </div>
            ),
          )}
        </div>
      </div>
    </section>
  );
}

/* ============================================================================
 *  AMENITIES
 * ========================================================================== */

function Amenities({ project }: { project: Detail }) {
  const a = project.amenities!;
  const arch = a.frame === "arch";

  return (
    <section
      id="amenities"
      aria-labelledby="amenities-title"
      className="relative scroll-mt-24 overflow-hidden bg-[#F1EADA]"
    >
      <div className="relative mx-auto max-w-[1450px] px-6 pb-24 pt-24 md:px-10 md:pb-32 md:pt-28 lg:px-12">
        <Reveal className="grid gap-y-6 lg:grid-cols-12 lg:items-end">
          <div className="lg:col-span-7">
            <SectionLabel label="Amenities" />
            <h2
              id="amenities-title"
              className="font-serif text-[clamp(38px,4.6vw,72px)] font-light leading-[0.98] tracking-[-0.045em] text-[#584738]"
            >
              {a.heading}
            </h2>
            {a.intro ? (
              <p className="mt-6 max-w-[520px] font-serif text-[clamp(19px,1.6vw,24px)] font-light italic leading-[1.35] text-brand-gold">
                {a.intro}
              </p>
            ) : null}
          </div>
          <p className="text-[10px] uppercase tracking-[0.24em] text-[#584738]/35 lg:col-span-4 lg:col-start-9 lg:text-right">
            {a.source}
          </p>
        </Reveal>

        {a.featured.length === 1 ? (
          <figure className="mt-14 md:mt-20 lg:w-[58%]">
            <MaskedImage
              media={a.featured[0].image}
              aspect={ratio(a.featured[0].image, 1.2, 1.7)}
            />
            <figcaption className="mt-4 text-[10px] uppercase tracking-[0.22em] text-[#584738]/50">
              {a.featured[0].title}
            </figcaption>
          </figure>
        ) : a.featured.length > 1 ? (
          <ul
            className={`mt-14 grid gap-x-5 gap-y-12 md:mt-20 ${
              arch
                ? "grid-cols-2 md:gap-x-8 lg:grid-cols-4"
                : "sm:grid-cols-2 md:gap-x-8 lg:grid-cols-3"
            }`}
          >
            {a.featured.map((f, i) => (
              <RevealItem
                key={f.title}
                className="group"
                delay={["", "delay-100", "delay-200", "delay-300"][i % 4]}
              >
                <div
                  className={`relative w-full overflow-hidden bg-[#584738]/60 ${arch ? "aspect-[5/6] rounded-t-[999px]" : "aspect-[16/10]"}`}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={f.image.src}
                    alt={f.image.alt}
                    loading="lazy"
                    decoding="async"
                    className="absolute inset-0 h-full w-full scale-[1.02] object-cover transition-transform duration-[1200ms] ease-out group-hover:scale-[1.07]"
                  />
                </div>
                <div className="mt-5">
                  {f.line ? (
                    <p className="font-serif text-[15px] font-light italic text-[#584738]/55 md:text-[17px]">
                      {f.line}
                    </p>
                  ) : null}
                  <h3 className="mt-1 text-[11px] uppercase tracking-[0.22em] text-[#584738]/80 transition-colors duration-300 group-hover:text-brand-gold md:text-[12px]">
                    {f.title}
                  </h3>
                </div>
              </RevealItem>
            ))}
          </ul>
        ) : null}

        {a.groups.length > 0 ? (
          <div
            className={`mt-16 grid gap-x-8 gap-y-12 border-t border-[#584738]/10 pt-14 md:mt-20 md:pt-16 ${
              a.groups.length === 1
                ? "max-w-2xl"
                : a.groups.length === 2
                  ? "sm:grid-cols-2"
                  : a.groups.length === 3
                    ? "sm:grid-cols-2 lg:grid-cols-3"
                    : "sm:grid-cols-2 lg:grid-cols-4"
            }`}
          >
            {a.groups.map((group, gi) => (
              <RevealItem
                key={group.title}
                className="space-y-4"
                delay={["", "delay-100", "delay-200", "delay-300"][gi % 4]}
              >
                <h3 className="text-[10px] uppercase tracking-[0.28em] text-brand-gold">
                  {group.title}
                </h3>
                <ul className="space-y-0">
                  {group.items.map((item) => (
                    <li
                      key={item}
                      className="flex gap-4 border-b border-[#584738]/10 py-3 text-[14px] leading-[1.55] text-[#584738]/65"
                    >
                      <span
                        aria-hidden="true"
                        className="mt-[10px] h-px w-3 shrink-0 bg-brand-gold/70"
                      />
                      {item}
                    </li>
                  ))}
                </ul>
              </RevealItem>
            ))}
          </div>
        ) : null}
      </div>
    </section>
  );
}

/* ============================================================================
 *  LOCATION
 * ========================================================================== */

function Location({
  project,
  onOpen,
}: {
  project: Detail;
  onOpen: () => void;
}) {
  const l = project.location!;
  const maps = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(l.address)}`;
  return (
    <section
      id="location"
      aria-labelledby="location-title"
      className="relative scroll-mt-24 overflow-hidden bg-[#F1EADA]"
    >
      <div className="relative mx-auto max-w-[1450px] px-6 pb-24 pt-24 md:px-10 md:pb-32 md:pt-28 lg:px-12">
        <div className="grid gap-y-14 lg:grid-cols-12 lg:gap-x-12">
          {l.image ? (
            <figure className="lg:col-span-7">
              {l.kind === "map" ? (
                <Reveal>
                  <button
                    type="button"
                    onClick={onOpen}
                    aria-label={`View larger: ${l.image.alt}`}
                    className="group block w-full bg-white p-3 shadow-[0_2px_24px_rgba(88,71,56,0.07)] md:p-5"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={l.image.src}
                      alt={l.image.alt}
                      loading="lazy"
                      decoding="async"
                      className="w-full transition-transform duration-700 group-hover:scale-[1.01]"
                      style={{ aspectRatio: `${l.image.w} / ${l.image.h}` }}
                    />
                  </button>
                </Reveal>
              ) : (
                <MaskedImage
                  media={l.image}
                  aspect={ratio(l.image, 1.2, 1.7)}
                  onOpen={onOpen}
                />
              )}
              <figcaption className="mt-4 text-[10px] uppercase tracking-[0.22em] text-[#584738]/50">
                {l.kind === "map"
                  ? "Location map, from the brochure"
                  : l.image.caption}
              </figcaption>
            </figure>
          ) : null}

          <Reveal
            className={
              l.image ? "lg:col-span-4 lg:col-start-9" : "lg:col-span-6"
            }
            delay="delay-150"
          >
            <SectionLabel label="Location" />
            <h2
              id="location-title"
              className="font-serif text-[clamp(36px,4vw,60px)] font-light leading-[1] tracking-[-0.045em] text-[#584738]"
            >
              {project.eyebrow.replace(/, Nashik$/, "")}
              <span className="block italic">Nashik.</span>
            </h2>
            <address className="mt-10 flex gap-4 border-t border-[#584738]/10 pt-6 not-italic">
              <MapPin
                aria-hidden="true"
                className="mt-1 h-4 w-4 shrink-0 text-brand-gold"
              />
              <span className="text-[15px] leading-[1.7] text-[#584738]/75">
                {l.address}
              </span>
            </address>
            <a
              href={maps}
              target="_blank"
              rel="noopener"
              className="group mt-6 inline-flex items-center gap-3 text-[11px] uppercase tracking-[0.22em] text-[#584738]/65 transition-colors hover:text-brand-gold"
            >
              <span className="border-b border-[#584738]/25 pb-1 transition-colors group-hover:border-brand-gold">
                Search in Google Maps
              </span>
              <ArrowUpRight className="h-4 w-4" />
            </a>
            {l.connectivity?.length ? (
              <ul className="mt-10 border-t border-[#584738]/10">
                {l.connectivity.map((c) => (
                  <li
                    key={c}
                    className="flex gap-4 border-b border-[#584738]/10 py-3.5 text-[14px] leading-[1.55] text-[#584738]/65"
                  >
                    <span
                      aria-hidden="true"
                      className="mt-[10px] h-px w-3 shrink-0 bg-brand-gold/70"
                    />
                    {c}
                  </li>
                ))}
              </ul>
            ) : null}
            <p className="mt-8 text-[10px] uppercase tracking-[0.22em] text-[#584738]/35">
              {l.source}
            </p>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

/* ============================================================================
 *  FLOOR PLANS (+ specifications)
 * ========================================================================== */

function Plans({
  project,
  onOpen,
}: {
  project: Detail;
  onOpen: (i: number) => void;
}) {
  const plans = project.plans!;
  const [active, setActive] = useState(plans.primary);
  const current = plans.items[active];

  return (
    <section
      id="plans"
      aria-labelledby="plans-title"
      className="relative scroll-mt-24 overflow-hidden bg-[#F1EADA]"
    >
      <div className="relative mx-auto max-w-[1450px] px-6 pb-24 pt-24 md:px-10 md:pb-32 md:pt-28 lg:px-12">
        <Reveal className="grid gap-y-6 lg:grid-cols-12 lg:items-end">
          <div className="lg:col-span-8">
            <SectionLabel label="Floor plans" />
            <h2
              id="plans-title"
              className="font-serif text-[clamp(38px,4.6vw,72px)] font-light leading-[0.98] tracking-[-0.045em] text-[#584738]"
            >
              Floor <em className="italic">plans.</em>
            </h2>
          </div>
          <p className="text-[10px] uppercase tracking-[0.24em] text-[#584738]/45 lg:col-span-3 lg:col-start-10 lg:text-right">
            <span className="font-serif text-[28px] normal-case tracking-[-0.02em] text-[#584738]/75">
              {pad(plans.items.length)}
            </span>{" "}
            Plans
          </p>
        </Reveal>

        <div className="mt-12 grid grid-cols-1 gap-y-8 md:mt-16 lg:grid-cols-12 lg:gap-x-12">
          <div className="min-w-0 lg:col-span-4">
            <ol
              aria-label="Plans"
              className="-mx-6 flex gap-2 overflow-x-auto px-6 pb-2 [scrollbar-width:none] md:-mx-10 md:px-10 lg:mx-0 lg:block lg:overflow-visible lg:border-t lg:border-[#584738]/10 lg:px-0 lg:pb-0"
            >
              {plans.items.map((p, i) => {
                const on = i === active;
                return (
                  <li
                    key={p.title}
                    className="shrink-0 lg:border-b lg:border-[#584738]/10"
                  >
                    <button
                      type="button"
                      aria-pressed={on}
                      onClick={() => setActive(i)}
                      className={`flex w-full items-center gap-4 whitespace-nowrap border px-4 py-2.5 text-left text-[11px] uppercase tracking-[0.16em] transition-colors duration-300 lg:whitespace-normal lg:border-0 lg:px-0 lg:py-4 lg:text-[12px] ${
                        on
                          ? "border-brand-gold/60 text-brand-gold"
                          : "border-[#584738]/15 text-[#584738]/50 hover:text-[#584738]"
                      }`}
                    >
                      <span
                        className={`hidden w-6 shrink-0 text-[10px] lg:block ${on ? "text-brand-gold" : "text-[#584738]/30"}`}
                      >
                        {pad(i + 1)}
                      </span>
                      <span className="min-w-0 flex-1">{p.title}</span>
                      <span
                        className={`hidden h-px shrink-0 transition-all duration-500 lg:block ${on ? "w-10 bg-brand-gold" : "w-4 bg-[#584738]/15"}`}
                      />
                    </button>
                  </li>
                );
              })}
            </ol>
          </div>

          <figure className="min-w-0 lg:col-span-8">
            <button
              type="button"
              onClick={() => onOpen(active)}
              aria-label={`View full size: ${current.title}`}
              className="group relative block w-full overflow-hidden bg-white shadow-[0_2px_24px_rgba(88,71,56,0.07)]"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                key={current.image.src}
                src={current.image.src}
                alt={current.image.alt}
                decoding="async"
                className="mx-auto max-h-[72vh] w-auto max-w-full object-contain"
                style={{
                  aspectRatio: `${current.image.w} / ${current.image.h}`,
                }}
              />
              <span className="absolute bottom-3 right-3 inline-flex items-center gap-2 bg-[#584738] px-3.5 py-2 text-[10px] uppercase tracking-[0.2em] text-white transition-colors group-hover:bg-brand-gold group-hover:text-white">
                <Plus className="h-3.5 w-3.5" /> Full size
              </span>
            </button>
            <figcaption className="mt-4 flex flex-wrap items-center justify-between gap-4 text-[10px] uppercase tracking-[0.22em] text-[#584738]/50">
              <span className="text-[#584738]/75">{current.title}</span>
              <span>{plans.source}</span>
            </figcaption>
          </figure>
        </div>
      </div>
    </section>
  );
}

/* ============================================================================
 *  BROCHURE
 * ========================================================================== */

function Brochure({ project }: { project: Detail }) {
  const b = project.brochure!;
  const portrait = b.cover.h > b.cover.w;
  return (
    <section
      id="brochure"
      aria-labelledby="brochure-title"
      className="relative scroll-mt-24 overflow-hidden bg-[#F1EADA]"
    >
      <div className="relative mx-auto max-w-[1450px] px-6 pb-24 pt-24 md:px-10 md:pb-32 md:pt-28 lg:px-12">
        <div className="grid gap-y-14 border-y border-[#584738]/10 py-14 md:py-16 lg:grid-cols-12 lg:items-center lg:gap-x-12">
          <Reveal
            className={
              portrait
                ? "mx-auto w-full max-w-[300px] lg:col-span-4"
                : "lg:col-span-5"
            }
          >
            <a
              href={b.href}
              target="_blank"
              rel="noopener"
              className="group block"
              aria-label={`View the ${project.fullName} brochure (opens in a new tab)`}
            >
              <div className="relative overflow-hidden shadow-[0_16px_56px_rgba(88,71,56,0.18)] transition-transform duration-700 group-hover:-translate-y-1">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={b.cover.src}
                  alt={b.cover.alt}
                  loading="lazy"
                  decoding="async"
                  className="w-full"
                  style={{ aspectRatio: `${b.cover.w} / ${b.cover.h}` }}
                />
              </div>
            </a>
          </Reveal>

          <Reveal
            className={
              portrait
                ? "lg:col-span-7 lg:col-start-6"
                : "lg:col-span-6 lg:col-start-7"
            }
            delay="delay-150"
          >
            <SectionLabel label="Brochure" />
            <h2
              id="brochure-title"
              className="font-serif text-[clamp(34px,3.8vw,58px)] font-light leading-[1] tracking-[-0.045em] text-[#584738]"
            >
              The complete{" "}
              <em className="italic">{project.name}</em>{" "}
              brochure.
            </h2>
            <p className="mt-6 max-w-[480px] text-[15px] leading-[1.75] text-[#584738]/60 md:text-[16px]">
              This page is a selection. The brochure is the whole of it, as The
              Avenue published it.
            </p>
            <dl className="mt-8 flex flex-wrap gap-x-8 gap-y-3 text-[10px] uppercase tracking-[0.22em] text-[#584738]/45">
              <div>
                <dt className="sr-only">Pages</dt>
                <dd>
                  <span className="text-[#584738]/75">{b.pages}</span> pages
                </dd>
              </div>
              <div>
                <dt className="sr-only">Format and size</dt>
                <dd>
                  PDF · <span className="text-[#584738]/75">{b.sizeMb} MB</span>
                </dd>
              </div>
              <div>
                <dt className="sr-only">Edition</dt>
                <dd>{b.edition}</dd>
              </div>
            </dl>
            <div className="mt-9 flex flex-wrap gap-3">
              <a
                href={b.href}
                target="_blank"
                rel="noopener"
                className="inline-flex items-center gap-3 bg-[#584738] px-7 py-3.5 font-grotesk text-[11px] font-semibold uppercase tracking-[0.2em] text-white transition-colors duration-300 hover:bg-brand-bronze"
              >
                View brochure
                <ExternalLink className="h-4 w-4" />
              </a>
              <a
                href={b.href}
                download={b.fileName}
                className="inline-flex items-center gap-3 border border-[#584738]/30 px-7 py-3.5 font-grotesk text-[11px] font-semibold uppercase tracking-[0.2em] text-[#584738] transition-colors duration-300 hover:border-brand-gold hover:text-brand-gold"
              >
                Download brochure
                <Download className="h-4 w-4" />
              </a>
            </div>
            {project.disclaimer ? (
              <p className="mt-10 max-w-[560px] text-[11px] leading-[1.7] text-[#584738]/35">
                <span className="uppercase tracking-[0.2em] text-[#584738]/45">
                  Brochure disclaimer ·{" "}
                </span>
                {project.disclaimer}
              </p>
            ) : null}
          </Reveal>
        </div>
      </div>
    </section>
  );
}

/* ============================================================================
 *  ENQUIRE
 * ========================================================================== */

const inputClass =
  "w-full border-0 border-b border-[#584738]/20 bg-transparent px-0 py-3 text-[15px] text-[#584738] placeholder:text-[#584738]/30 transition-colors focus:border-brand-gold focus:outline-none focus:ring-0";

function Enquire({ project }: { project: Detail }) {
  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    message: "",
  });
  const [sent, setSent] = useState(false);
  const set = (k: keyof typeof form) => (e: { target: { value: string } }) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const subject = `Enquiry — ${project.fullName}`;
    const body = [
      `Project: ${project.fullName}`,
      `Name: ${form.name}`,
      `Phone: ${form.phone}`,
      form.email ? `Email: ${form.email}` : null,
      "",
      form.message || `I would like to know more about ${project.fullName}.`,
    ]
      .filter((line) => line !== null)
      .join("\n");
    window.location.href = `mailto:${company.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    setSent(true);
  };

  return (
    <section
      id="enquire"
      aria-labelledby="enquire-title"
      className="relative scroll-mt-24 overflow-hidden bg-[#F1EADA]"
    >
      <div className="relative mx-auto max-w-[1450px] px-6 pb-24 pt-24 md:px-10 md:pb-32 md:pt-28 lg:px-12">
        <div className="grid gap-y-16 lg:grid-cols-12 lg:gap-x-12">
          <Reveal className="lg:col-span-5">
            <SectionLabel label="Enquire" />
            <h2
              id="enquire-title"
              className="font-serif text-[clamp(38px,4.6vw,72px)] font-light leading-[0.98] tracking-[-0.045em] text-[#584738]"
            >
              Enquire about{" "}
              <em className="block italic">{project.name}.</em>
            </h2>
            <p className="mt-6 max-w-[440px] text-[15px] leading-[1.75] text-[#584738]/60 md:text-[16px]">
              Send your details and your enquiry opens in your email app,
              addressed to The Avenue with {project.fullName} already in it. Or
              call us directly.
            </p>

            <ul className="mt-10 border-t border-[#584738]/10">
              <li className="flex items-center gap-4 border-b border-[#584738]/10 py-4">
                <Phone
                  aria-hidden="true"
                  className="h-4 w-4 shrink-0 text-brand-gold"
                />
                <a
                  href={project.enquiry.phoneHref}
                  className="text-[15px] text-[#584738]/75 transition-colors hover:text-brand-gold"
                >
                  {project.enquiry.phone}
                </a>
              </li>
              <li className="flex items-center gap-4 border-b border-[#584738]/10 py-4">
                <Mail
                  aria-hidden="true"
                  className="h-4 w-4 shrink-0 text-brand-gold"
                />
                <a
                  href={company.emailHref}
                  className="break-all text-[15px] text-[#584738]/75 transition-colors hover:text-brand-gold"
                >
                  {company.email}
                </a>
              </li>
              <li className="flex items-start gap-4 border-b border-[#584738]/10 py-4">
                <MapPin
                  aria-hidden="true"
                  className="mt-1 h-4 w-4 shrink-0 text-brand-gold"
                />
                <span className="text-[14px] leading-[1.6] text-[#584738]/60">
                  <span className="block text-[10px] uppercase tracking-[0.22em] text-[#584738]/40">
                    Office
                  </span>
                  {company.address}
                </span>
              </li>
            </ul>
          </Reveal>

          <Reveal className="lg:col-span-6 lg:col-start-7" delay="delay-150">
            <form
              onSubmit={submit}
              className="border border-[#584738]/10 bg-white/70 p-6 md:p-10"
              aria-describedby="enquire-note"
            >
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#584738]/10 pb-5">
                <span className="text-[10px] uppercase tracking-[0.24em] text-[#584738]/45">
                  Your enquiry is about
                </span>
                <span className="inline-flex items-center gap-2 border border-brand-gold/50 px-3 py-1.5 text-[11px] uppercase tracking-[0.18em] text-brand-gold">
                  {project.fullName}
                </span>
                <input type="hidden" name="project" value={project.fullName} />
              </div>

              <div className="mt-6 grid gap-x-8 gap-y-6 sm:grid-cols-2">
                <label className="block">
                  <span className="text-[10px] uppercase tracking-[0.22em] text-[#584738]/50">
                    Name *
                  </span>
                  <input
                    required
                    name="name"
                    autoComplete="name"
                    value={form.name}
                    onChange={set("name")}
                    className={inputClass}
                  />
                </label>
                <label className="block">
                  <span className="text-[10px] uppercase tracking-[0.22em] text-[#584738]/50">
                    Phone *
                  </span>
                  <input
                    required
                    name="phone"
                    type="tel"
                    autoComplete="tel"
                    value={form.phone}
                    onChange={set("phone")}
                    className={inputClass}
                  />
                </label>
                <label className="block sm:col-span-2">
                  <span className="text-[10px] uppercase tracking-[0.22em] text-[#584738]/50">
                    Email
                  </span>
                  <input
                    name="email"
                    type="email"
                    autoComplete="email"
                    value={form.email}
                    onChange={set("email")}
                    className={inputClass}
                  />
                </label>
                <label className="block sm:col-span-2">
                  <span className="text-[10px] uppercase tracking-[0.22em] text-[#584738]/50">
                    Message
                  </span>
                  <textarea
                    name="message"
                    rows={3}
                    value={form.message}
                    onChange={set("message")}
                    placeholder={`I would like to know more about ${project.fullName}.`}
                    className={`${inputClass} resize-none`}
                  />
                </label>
              </div>

              <button
                type="submit"
                className="mt-9 inline-flex w-full items-center justify-center gap-3 bg-[#584738] px-7 py-4 font-grotesk text-[11px] font-semibold uppercase tracking-[0.2em] text-white transition-colors duration-300 hover:bg-brand-bronze sm:w-auto"
              >
                Send enquiry
                <ArrowRight className="h-4 w-4" />
              </button>
              <p
                id="enquire-note"
                role="status"
                className="mt-5 text-[12px] leading-[1.6] text-[#584738]/45"
              >
                {sent ? (
                  <>
                    Your email app should now be open with this enquiry. If it
                    didn&apos;t open, call{" "}
                    <a
                      href={project.enquiry.phoneHref}
                      className="text-[#584738]/75 underline underline-offset-4"
                    >
                      {project.enquiry.phone}
                    </a>{" "}
                    or write to{" "}
                    <a
                      href={company.emailHref}
                      className="text-[#584738]/75 underline underline-offset-4"
                    >
                      {company.email}
                    </a>
                    .
                  </>
                ) : (
                  "Opens your email app with the enquiry ready to send. Nothing is sent until you send it."
                )}
              </p>
            </form>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

/* ============================================================================
 *  MORE FROM THE AVENUE
 * ========================================================================== */

const CARD = 4 / 5;

const cardImage = (p: Detail) => {
  const best = [...p.gallery].sort((a, b) => coverage(b, CARD) - coverage(a, CARD))[0];
  return best && coverage(best, CARD) > coverage(p.hero, CARD) + 0.15
    ? { media: best, position: "50% 50%" }
    : { media: p.hero, position: p.heroPosition ?? "50% 50%" };
};

function MoreProjects({ related, project }: { related: Detail[]; project: Detail }) {
  return (
    <section aria-labelledby="more-title" className="relative overflow-hidden bg-[#F1EADA]">
      <div className="relative mx-auto max-w-[1450px] px-6 pb-24 pt-24 md:px-10 md:pb-28 md:pt-28 lg:px-12">
        <Reveal>
          <SectionLabel label="Projects" />
          <h2
            id="more-title"
            className="font-serif text-[clamp(38px,4.6vw,72px)] font-light leading-[0.98] tracking-[-0.045em] text-[#584738]"
          >
            More from <em className="italic">The Avenue.</em>
          </h2>
        </Reveal>
        <ul className="mt-14 grid gap-x-6 gap-y-14 sm:grid-cols-2 md:mt-16 lg:grid-cols-4 lg:gap-x-8">
          {related.map((p, i) => {
            const { media, position } = cardImage(p);
            const fit = coverage(media, CARD) < MIN_COVERAGE;
            return (
            <RevealItem
              key={p.slug}
              delay={["", "delay-100", "delay-200", "delay-300"][i % 4]}
            >
              <Link href={projectHref(p.slug)} className="group block">
                <div className="relative aspect-[4/5] overflow-hidden bg-[#584738]">
                  {fit ? <Wash media={media} position={position} /> : null}
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={media.src}
                    alt={media.alt}
                    loading="lazy"
                    decoding="async"
                    className={`absolute transition-transform duration-[1200ms] ease-out group-hover:scale-[1.05] ${
                      fit
                        ? "left-1/2 top-[42%] w-[110%] max-w-none -translate-x-1/2 -translate-y-1/2"
                        : "inset-0 h-full w-full object-cover"
                    }`}
                    style={
                      fit
                        ? { aspectRatio: `${media.w} / ${media.h}`, ...edgeMask("to bottom", 12) }
                        : { objectPosition: position }
                    }
                  />
                  <div
                    aria-hidden="true"
                    className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-[#584738]/50 to-transparent"
                  />
                  {p.flagship ? (
                    <span className="absolute left-4 top-4 bg-brand-gold px-2.5 py-1 text-[9px] font-semibold uppercase tracking-[0.2em] text-white">
                      Flagship
                    </span>
                  ) : null}
                  <span className="absolute bottom-4 left-4 text-[10px] uppercase tracking-[0.22em] text-white/85">
                    {p.eyebrow}
                  </span>
                </div>
                <div className="mt-5 flex items-start justify-between gap-4">
                  <div>
                    <h3 className="font-serif text-[30px] font-light leading-none tracking-[-0.03em] text-[#584738] transition-colors group-hover:text-brand-gold">
                      {p.name}
                    </h3>
                    <p className="mt-2 font-serif text-[16px] font-light italic text-[#584738]/55">
                      {p.tagline}
                    </p>
                  </div>
                  <ArrowUpRight className="mt-1 h-5 w-5 shrink-0 text-[#584738]/40 transition-all duration-500 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-brand-gold" />
                </div>
              </Link>
            </RevealItem>
            );
          })}
        </ul>
      </div>
    </section>
  );
}

/* ============================================================================
 *  SHOWCASE — full-bleed image sections with an editorial heading
 * ========================================================================== */

function Showcase({
  section,
  onOpen,
}: {
  section: Extract<SectionType, { type: "showcase" }>;
  onOpen?: () => void;
}) {
  return (
    <section
      aria-labelledby={`${section.heading.toLowerCase().replace(/\s+/g, "-")}-title`}
      className="relative scroll-mt-24 overflow-hidden bg-[#F1EADA]"
    >
      <div className="relative mx-auto max-w-[1450px] px-6 pb-24 pt-24 md:px-10 md:pb-32 md:pt-28 lg:px-12">
        <div className="grid gap-y-14 lg:grid-cols-12 lg:gap-x-12">
          <Reveal className="lg:col-span-5">
            <SectionLabel label={section.source ?? "The Avenue"} />
            <h2
              className="font-serif text-[clamp(38px,4.6vw,72px)] font-light leading-[0.98] tracking-[-0.045em] text-[#584738]"
            >
              {section.heading}
            </h2>
            {section.intro && (
              <p className="mt-6 max-w-[520px] font-serif text-[clamp(19px,1.6vw,24px)] font-light italic leading-[1.35] text-brand-gold">
              {section.intro}
            </p>
            )}
            <div className="mt-12">
              <MaskedImage
                media={section.image}
                aspect={ratio(section.image, 1.2, 1.7)}
                onOpen={onOpen}
              />
              {section.caption ? (
                <figcaption className="mt-4 text-[10px] uppercase tracking-[0.22em] text-[#584738]/50">
                  {section.caption}
                </figcaption>
              ) : null}
            </div>
          </Reveal>

          <Reveal className="lg:col-span-6 lg:col-start-7 lg:pt-16" delay="delay-150">
            <p className="font-serif text-[clamp(20px,1.8vw,26px)] font-light leading-[1.35] tracking-[-0.015em] text-[#584738]/75">
              {section.intro}
            </p>
            <p className="mt-6 max-w-[600px] text-[15px] leading-[1.8] text-[#584738]/55 md:text-[16px]">
              {section.source}
            </p>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

/* ============================================================================
 *  FEATURE BLOCK — heading with a list of bullet points
 * ========================================================================== */

function FeatureBlock({ section }: { section: Extract<SectionType, { type: "featureBlock" }> }) {
  return (
    <section
      aria-labelledby={`${section.heading.toLowerCase().replace(/\s+/g, "-")}-title`}
      className="relative scroll-mt-24 overflow-hidden bg-[#F1EADA]"
    >
      <div className="relative mx-auto max-w-[1450px] px-6 pb-24 pt-24 md:px-10 md:pb-32 md:pt-28 lg:px-12">
        <Reveal className="grid gap-y-10 lg:grid-cols-12 lg:gap-x-12">
          <div className="lg:col-span-5">
            <SectionLabel label={section.source ?? "The Avenue"} />
            <h2
              id={`${section.heading.toLowerCase().replace(/\s+/g, "-")}-title`}
              className="font-serif text-[clamp(38px,4.6vw,72px)] font-light leading-[0.98] tracking-[-0.045em] text-[#584738]"
            >
              {section.heading}
            </h2>
            {section.intro ? (
              <p className="mt-6 max-w-[520px] font-serif text-[clamp(19px,1.6vw,24px)] font-light italic leading-[1.35] text-brand-gold">
                {section.intro}
              </p>
            ) : null}
          </div>
          <Reveal className="lg:col-span-6 lg:col-start-7 lg:pt-16" delay="delay-150">
            <ul className="space-y-5">
              {section.items.map((item) => (
                <li key={item} className="flex gap-4 border-b border-[#584738]/10 py-3.5 text-[14px] leading-[1.55] text-[#584738]/65">
                  <span
                    aria-hidden="true"
                    className="mt-[10px] h-px w-3 shrink-0 bg-brand-gold/70"
                  />
                  {item}
                </li>
              ))}
            </ul>
          </Reveal>
        </Reveal>
      </div>
    </section>
  );
}

/* ============================================================================
 *  ABOUT — heading with paragraphs
 * ========================================================================== */

function About({ section }: { section: Extract<SectionType, { type: "about" }> }) {
  return (
    <section
      aria-labelledby={`${section.heading.toLowerCase().replace(/\s+/g, "-")}-title`}
      className="relative scroll-mt-24 overflow-hidden bg-[#F1EADA]"
    >
      <div className="relative mx-auto max-w-[1450px] px-6 pb-24 pt-24 md:px-10 md:pb-32 md:pt-28 lg:px-12">
        <div className="grid gap-y-16 lg:grid-cols-12 lg:gap-x-12">
          <Reveal className="lg:col-span-6">
            <SectionLabel label={section.source ?? "The Avenue"} />
            <h2
              id={`${section.heading.toLowerCase().replace(/\s+/g, "-")}-title`}
              className="font-serif text-[clamp(38px,4.6vw,72px)] font-light leading-[0.98] tracking-[-0.045em] text-[#584738]"
            >
              {section.heading}
            </h2>
            {section.paragraphs.map((p, i) => (
              <p
                key={i}
                className={`mt-8 max-w-[600px] font-serif text-[clamp(20px,1.8vw,26px)] font-light leading-[1.35] tracking-[-0.015em] text-[#584738]/75`}
              >
                {p}
              </p>
            ))}
          </Reveal>
        </div>
      </div>
    </section>
  );
}

/* ============================================================================
 *  SPACE SHOWCASE — image with a description
 * ========================================================================== */

function SpaceShowcase({ section }: { section: Extract<SectionType, { type: "spaceShowcase" }> }) {
  return (
    <section
      aria-labelledby={`${section.title.toLowerCase().replace(/\s+/g, "-")}-title`}
      className="relative scroll-mt-24 overflow-hidden bg-[#F1EADA]"
    >
      <div className="relative mx-auto max-w-[1450px] px-6 pb-24 pt-24 md:px-10 md:pb-32 md:pt-28 lg:px-12">
        <div className="grid gap-y-14 lg:grid-cols-12 lg:gap-x-12">
          <Reveal className="lg:col-span-7">
            <MaskedImage
              media={section.image}
              aspect={ratio(section.image, 1.2, 1.7)}
            />
            <figcaption className="mt-4 text-[10px] uppercase tracking-[0.22em] text-[#584738]/50">
              {section.title}
            </figcaption>
          </Reveal>
          <Reveal className="lg:col-span-4 lg:col-start-9 lg:pt-16" delay="delay-150">
            <SectionLabel label="The Avenue" />
            <h2
              id={`${section.title.toLowerCase().replace(/\s+/g, "-")}-title`}
              className="font-serif text-[clamp(38px,4.6vw,72px)] font-light leading-[0.98] tracking-[-0.045em] text-[#584738]"
            >
              {section.title}
            </h2>
            <p className="mt-8 max-w-[560px] font-serif text-[clamp(20px,1.8vw,26px)] font-light leading-[1.35] tracking-[-0.015em] text-[#584738]/75">
              {section.description}
            </p>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

/* ============================================================================
 *  SPECIFICATIONS — grouped specification lists from the brochure
 * ========================================================================== */

function Specifications({ project }: { project: Detail }) {
  const s = project.specifications!;
  return (
    <section
      id="specifications"
      aria-labelledby="specifications-title"
      className="relative scroll-mt-24 overflow-hidden bg-[#F1EADA]"
    >
      <div className="relative mx-auto max-w-[1450px] px-6 pb-24 pt-24 md:px-10 md:pb-32 md:pt-28 lg:px-12">
        <Reveal className="grid gap-y-10 lg:grid-cols-12 lg:gap-x-12">
          <div className="lg:col-span-5">
            <SectionLabel label="Specifications" />
            <h2
              id="specifications-title"
              className="font-serif text-[clamp(38px,4.6vw,72px)] font-light leading-[0.98] tracking-[-0.045em] text-[#584738]"
            >
              {s.heading}
            </h2>
          </div>
          <div className="lg:col-span-7 lg:col-start-6 lg:pt-4">
            {s.groups.map((group) => (
              <div key={group.title} className="mb-8 border-t border-[#584738]/10 pt-6">
                <h3 className="mb-4 text-[10px] uppercase tracking-[0.28em] text-brand-gold">
                  {group.title}
                </h3>
                <ul className="space-y-0">
                  {group.items.map((item) => (
                    <li
                      key={item}
                      className="flex gap-4 border-b border-[#584738]/10 py-3 text-[14px] leading-[1.55] text-[#584738]/65"
                    >
                      <span
                        aria-hidden="true"
                        className="mt-[10px] h-px w-3 shrink-0 bg-brand-gold/70"
                      />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/* ============================================================================ */

export default function ProjectDetail({
  project,
  related,
}: {
  project: Detail;
  related: Detail[];
}) {
  const [lightbox, setLightbox] = useState<{
    set: "gallery" | "plans" | "location";
    index: number;
  } | null>(null);

  const sets: Record<"gallery" | "plans" | "location", Media[]> = {
    gallery: project.gallery,
    plans:
      project.plans?.items.map((p) => ({ ...p.image, caption: p.title })) ?? [],
    location: project.location?.image ? [project.location.image] : [],
  };

  const renderSection = (section: SectionType, i: number): ReactNode => {
    switch (section.type) {
      case "hero":
        return <Hero key={i} project={project} />;
      case "overview":
        return <Overview key={i} project={project} />;
      case "gallery":
        return project.gallery.length ? (
          <ImageStory
            key={i}
            project={project}
            onOpen={(idx) => setLightbox({ set: "gallery", index: idx })}
          />
        ) : null;
      case "amenities":
        return project.amenities ? <Amenities key={i} project={project} /> : null;
      case "location":
        return project.location ? (
          <Location
            key={i}
            project={project}
            onOpen={() => setLightbox({ set: "location", index: 0 })}
          />
        ) : null;
      case "plans":
        return project.plans ? (
          <Plans
            key={i}
            project={project}
            onOpen={(idx) => setLightbox({ set: "plans", index: idx })}
          />
        ) : null;
      case "specifications":
        return project.specifications ? (
          <Specifications key={i} project={project} />
        ) : null;
      case "brochure":
        return project.brochure ? <Brochure key={i} project={project} /> : null;
      case "enquire":
        return <Enquire key={i} project={project} />;
      case "showcase":
        return <Showcase key={i} section={section} />;
      case "featureBlock":
        return <FeatureBlock key={i} section={section} />;
      case "about":
        return <About key={i} section={section} />;
      case "spaceShowcase":
        return <SpaceShowcase key={i} section={section} />;
      default:
        return null;
    }
  };

  return (
    <div className="bg-[#584738]">
      {project.sections ? (
        project.sections.map((s, i) => renderSection(s, i))
      ) : (
        <>
          <Hero project={project} />
          <Overview project={project} />
          {project.gallery.length ? (
            <ImageStory
              project={project}
              onOpen={(i) => setLightbox({ set: "gallery", index: i })}
            />
          ) : null}
          {project.amenities ? <Amenities project={project} /> : null}
          {project.location ? (
            <Location
              project={project}
              onOpen={() => setLightbox({ set: "location", index: 0 })}
            />
          ) : null}
          {project.plans ? (
            <Plans
              project={project}
              onOpen={(i) => setLightbox({ set: "plans", index: i })}
            />
          ) : null}
          {project.brochure ? <Brochure project={project} /> : null}
          <Enquire project={project} />
        </>
      )}
      <MoreProjects related={related} project={project} />

      <Lightbox
        items={lightbox ? sets[lightbox.set] : []}
        index={lightbox ? lightbox.index : null}
        onIndex={(i) => setLightbox((l) => (l ? { ...l, index: i } : l))}
        onClose={() => setLightbox(null)}
        label={
          lightbox?.set === "plans"
            ? `${project.name} floor plans`
            : `${project.name} images`
        }
        light={
          lightbox?.set === "plans" ||
          (lightbox?.set === "location" && project.location?.kind === "map")
        }
      />
    </div>
  );
}
