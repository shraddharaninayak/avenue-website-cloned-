"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { ENQUIRE_HREF, projects } from "@/data/avenue";

/**
 * Explore our developments — list on the left, plan on the right, bound
 * together: hovering or focusing a development lights its marker, and choosing
 * a marker moves the list. The category filter uses the real Residential /
 * Commercial split published on tabd.in.
 *
 * The plan is a stylised drawing, not a survey. tabd.in publishes no
 * coordinates for any of the four, so marker placement comes from `plan` in
 * projects.ts and the panel says "indicative" on purpose. The localities shown
 * beside each project ARE real, quoted from each project's page; Urbania has
 * none because its page never states one.
 *
 * Inline SVG rather than an embedded map: no map library is installed, and a
 * tile embed would neither match this design nor survive offline.
 */

const FILTERS = ["All", "Residential", "Commercial"] as const;
type Filter = (typeof FILTERS)[number];

export default function ExploreDevelopments() {
  const sectionRef = useRef<HTMLElement>(null);
  const [filter, setFilter] = useState<Filter>("All");
  const [activeSlug, setActiveSlug] = useState(projects[0].slug);
  const [visible, setVisible] = useState(false);

  const shown = useMemo(
    () =>
      filter === "All"
        ? projects
        : projects.filter((p) => p.category === filter),
    [filter],
  );

  // Keep the selection inside the current filter.
  useEffect(() => {
    if (!shown.some((p) => p.slug === activeSlug) && shown.length > 0) {
      setActiveSlug(shown[0].slug);
    }
  }, [shown, activeSlug]);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          io.disconnect();
        }
      },
      { threshold: 0.15 },
    );
    io.observe(section);
    return () => io.disconnect();
  }, []);

  const activeProject =
    projects.find((p) => p.slug === activeSlug) ?? projects[0];

  return (
    <section
      ref={sectionRef}
      id="developments"
      className="scroll-mt-24 border-t border-white/10 bg-[#2D3A1F] text-white"
    >
      <div className="mx-auto max-w-[1450px] px-6 py-24 md:px-10 md:py-28 lg:px-12">
        <div className="grid gap-14 lg:grid-cols-[0.85fr_1.15fr] lg:gap-20">
          {/* ================= LEFT ================= */}
          <div
            style={{
              opacity: visible ? 1 : 0,
              transform: visible ? "translateY(0)" : "translateY(24px)",
              transition:
                "opacity 0.9s ease, transform 1s cubic-bezier(0.22,1,0.36,1)",
            }}
          >
            <div className="mb-8 flex items-center gap-4">
              <span className="h-px w-10 bg-white/30" />
              <span className="text-[10px] uppercase tracking-[0.28em] text-white/45">
                Explore our developments
              </span>
            </div>

            <h2 className="max-w-[560px] font-serif text-[clamp(34px,4.4vw,58px)] font-light leading-[1.0] tracking-[-0.04em]">
              Avenue developments
              <br />
              across Nashik.
            </h2>

            {/* FILTER */}
            <div className="mt-9 flex flex-wrap items-center gap-2">
              {FILTERS.map((f) => {
                const on = f === filter;
                return (
                  <button
                    key={f}
                    type="button"
                    onClick={() => setFilter(f)}
                    aria-pressed={on}
                    className={`border px-4 py-2 text-[10px] uppercase tracking-[0.2em] transition-colors duration-300 ${
                      on
                        ? "border-brand-gold/60 text-brand-gold"
                        : "border-white/15 text-white/45 hover:border-white/35 hover:text-white/75"
                    }`}
                  >
                    {f}
                  </button>
                );
              })}
            </div>

            {/* LIST */}
            <ul className="mt-10 border-t border-white/12">
              {shown.map((project, i) => {
                const isActive = project.slug === activeSlug;
                return (
                  <li key={project.slug} className="border-b border-white/12">
                    <button
                      type="button"
                      onMouseEnter={() => setActiveSlug(project.slug)}
                      onFocus={() => setActiveSlug(project.slug)}
                      onClick={() => setActiveSlug(project.slug)}
                      aria-pressed={isActive}
                      className="group flex w-full items-center gap-5 py-5 text-left md:gap-7"
                    >
                      <span
                        className={`w-6 shrink-0 text-[10px] tracking-[0.2em] transition-colors duration-300 ${
                          isActive ? "text-brand-gold" : "text-white/35"
                        }`}
                      >
                        {String(i + 1).padStart(2, "0")}
                      </span>

                      <span className="min-w-0">
                        <span
                          className={`block font-serif text-[26px] font-light leading-none tracking-[-0.03em] transition-all duration-500 md:text-[32px] ${
                            isActive
                              ? "translate-x-1 text-white"
                              : "text-white/45 group-hover:text-white/80"
                          }`}
                        >
                          {project.name}
                        </span>
                        <span className="mt-2 block text-[10px] uppercase tracking-[0.18em] text-white/35">
                          {project.locality ?? project.configuration}
                        </span>
                      </span>

                      <span
                        className={`ml-auto h-px shrink-0 transition-all duration-500 ${
                          isActive ? "w-12 bg-brand-gold" : "w-5 bg-white/20"
                        }`}
                      />
                    </button>
                  </li>
                );
              })}
            </ul>

            <Link
              href={ENQUIRE_HREF}
              className="group mt-10 inline-flex items-center gap-3 text-[11px] uppercase tracking-[0.22em] text-white/60 transition-colors hover:text-brand-gold"
            >
              <span>Enquire about {activeProject.name}</span>
              <ArrowUpRight className="h-4 w-4 transition-transform duration-500 group-hover:-translate-y-1 group-hover:translate-x-1" />
            </Link>
          </div>

          {/* ================= RIGHT: PLAN ================= */}
          <div
            style={{
              opacity: visible ? 1 : 0,
              transform: visible ? "translateY(0)" : "translateY(32px)",
              transition:
                "opacity 1s ease 0.15s, transform 1.1s cubic-bezier(0.22,1,0.36,1) 0.15s",
            }}
          >
            <div className="relative aspect-[4/5] w-full overflow-hidden border border-white/12 bg-[#2D3A1F] sm:aspect-[5/4] lg:aspect-[4/3]">
              <svg
                viewBox="0 0 100 100"
                preserveAspectRatio="xMidYMid slice"
                className="absolute inset-0 h-full w-full"
                aria-hidden="true"
              >
                <defs>
                  <pattern
                    id="avenue-plan-grid"
                    width="6.25"
                    height="6.25"
                    patternUnits="userSpaceOnUse"
                  >
                    <path
                      d="M6.25 0H0V6.25"
                      fill="none"
                      stroke="rgba(255,255,255,0.05)"
                      strokeWidth="0.2"
                    />
                  </pattern>
                </defs>

                <rect width="100" height="100" fill="url(#avenue-plan-grid)" />

                <path
                  d="M-4 74 C 18 66, 30 84, 48 76 S 78 58, 104 66"
                  fill="none"
                  stroke="rgba(75,85,96,0.16)"
                  strokeWidth="2.6"
                  strokeLinecap="round"
                />

                <circle cx="50" cy="48" r="31" fill="none" stroke="rgba(255,255,255,0.10)" strokeWidth="0.35" />
                <circle cx="50" cy="48" r="19" fill="none" stroke="rgba(255,255,255,0.13)" strokeWidth="0.35" />

                {[0, 45, 90, 135].map((deg) => (
                  <line
                    key={deg}
                    x1={50 - 60 * Math.cos((deg * Math.PI) / 180)}
                    y1={48 - 60 * Math.sin((deg * Math.PI) / 180)}
                    x2={50 + 60 * Math.cos((deg * Math.PI) / 180)}
                    y2={48 + 60 * Math.sin((deg * Math.PI) / 180)}
                    stroke="rgba(255,255,255,0.07)"
                    strokeWidth="0.3"
                  />
                ))}
              </svg>

              {/* MARKERS */}
              {projects.map((project) => {
                const inFilter = shown.some((p) => p.slug === project.slug);
                const isActive = project.slug === activeSlug;
                return (
                  <button
                    key={project.slug}
                    type="button"
                    onMouseEnter={() => setActiveSlug(project.slug)}
                    onFocus={() => setActiveSlug(project.slug)}
                    onClick={() => setActiveSlug(project.slug)}
                    aria-label={`Show ${project.name}`}
                    aria-pressed={isActive}
                    tabIndex={inFilter ? 0 : -1}
                    className="absolute -translate-x-1/2 -translate-y-1/2 transition-opacity duration-500"
                    style={{
                      left: `${project.plan.x}%`,
                      top: `${project.plan.y}%`,
                      opacity: inFilter ? 1 : 0.18,
                      pointerEvents: inFilter ? "auto" : "none",
                    }}
                  >
                    <span className="relative flex h-11 w-11 items-center justify-center">
                      <span
                        className={`absolute inset-0 rounded-full border transition-all duration-500 ${
                          isActive
                            ? "scale-100 border-brand-gold/60 opacity-100"
                            : "scale-50 border-white/0 opacity-0"
                        }`}
                      />
                      <span
                        className={`block rounded-full transition-all duration-500 ${
                          isActive ? "h-2.5 w-2.5 bg-brand-gold" : "h-1.5 w-1.5 bg-white/45"
                        }`}
                      />
                    </span>
                    <span
                      className={`pointer-events-none absolute left-1/2 top-full -translate-x-1/2 whitespace-nowrap text-[9px] uppercase tracking-[0.2em] transition-all duration-500 ${
                        isActive
                          ? "translate-y-0 text-brand-gold opacity-100"
                          : "-translate-y-1 opacity-0"
                      }`}
                    >
                      {project.name}
                    </span>
                  </button>
                );
              })}

              {/* ACTIVE PROJECT */}
              <div className="pointer-events-none absolute bottom-4 left-4 right-4 flex items-end justify-between gap-4 md:bottom-6 md:left-6 md:right-6">
                <div className="relative h-24 w-20 shrink-0 overflow-hidden border border-white/15 bg-black md:h-32 md:w-24">
                  {projects.map((project) => (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      key={project.slug}
                      src={project.image}
                      alt=""
                      aria-hidden="true"
                      className="absolute inset-0 h-full w-full object-cover transition-opacity duration-700"
                      style={{ opacity: project.slug === activeSlug ? 1 : 0 }}
                    />
                  ))}
                </div>

                <div className="min-w-0 text-right">
                  <div className="font-serif text-[22px] font-light leading-none tracking-[-0.02em] md:text-[28px]">
                    {activeProject.name}
                  </div>
                  <div className="mt-2 truncate text-[10px] uppercase tracking-[0.18em] text-white/55">
                    {activeProject.configuration}
                  </div>
                  <div className="mt-1 text-[9px] uppercase tracking-[0.22em] text-white/35">
                    {activeProject.locality ?? "Indicative placement · Nashik"}
                  </div>
                </div>
              </div>
            </div>

            <p className="mt-4 text-[10px] uppercase tracking-[0.2em] text-white/30">
              Plan is illustrative · marker positions indicative
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
