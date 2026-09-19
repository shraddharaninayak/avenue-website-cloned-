"use client";

import { useRef } from "react";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { projects, type Project } from "@/data/avenue";
import { projectHref } from "@/data/projectDetails";
import { lerp, revealClass, smoothstep, useReveal, useViewportProgress } from "./motion";

/**
 * 07 — Projects. The one place on the homepage where the portfolio appears.
 *
 * Everything shown comes from `projects` in data/avenue.ts: name, category,
 * status, statement, the first sentence of the description, configuration,
 * locality, the first published features, and the project's own image. Each
 * project's "Enquire about" opens its project page, which carries the project
 * into its enquiry.
 *
 * Composition follows the images rather than a grid: Urbania's render is the
 * widest, so it runs full width; Flora and Aura sit as an offset pair; Bliss
 * closes with its image beside its details. Images open through a mask as
 * they arrive and drift slightly within it; nothing else moves.
 */

const firstSentence = (text: string) => {
  const match = text.match(/^.*?[.!?](\s|$)/);
  return (match ? match[0] : text).trim();
};

const pad = (n: number) => String(n).padStart(2, "0");

const statuses = Array.from(new Set(projects.map((p) => p.status)));

type Layout = {
  frame: string;
  image: string;
};

function ProjectImage({ project, layout, index }: { project: Project; layout: Layout; index: number }) {
  // Observed on the unclipped wrapper; the mask is on the element inside it.
  const [ref, visible] = useReveal<HTMLDivElement>(0.12);
  const imgRef = useRef<HTMLImageElement>(null);

  useViewportProgress(ref, (p) => {
    if (imgRef.current) imgRef.current.style.transform = `translate3d(0, ${lerp(4, -4, p).toFixed(3)}%, 0)`;
  });

  return (
    <div ref={ref}>
      <div
        className={`group relative w-full overflow-hidden bg-[#14110c] transition-[clip-path] duration-[1400ms] ease-[cubic-bezier(0.65,0,0.35,1)] motion-reduce:transition-none ${layout.frame} ${
          visible ? "[clip-path:inset(0_0_0_0)]" : "motion-safe:[clip-path:inset(100%_0_0_0)]"
        }`}
      >
        <div className="absolute inset-0 transition-transform duration-[1200ms] ease-out group-hover:scale-[1.03]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            ref={imgRef}
            src={project.image}
            alt={`The Avenue ${project.name}`}
            loading="lazy"
            decoding="async"
            className={`absolute inset-x-0 -top-[5%] h-[110%] w-full max-w-none object-cover will-change-transform ${layout.image}`}
          />
        </div>
        <span className="absolute left-4 top-4 font-grotesk text-[11px] tracking-[0.2em] text-white/85 md:left-5 md:top-5">
          {pad(index + 1)}
        </span>
      </div>
    </div>
  );
}

function ProjectInfo({ project, index, wide = false }: { project: Project; index: number; wide?: boolean }) {
  const [ref, visible] = useReveal<HTMLDivElement>(0.2);
  const facts = [project.configuration, project.locality].filter(Boolean) as string[];

  return (
    <div
      ref={ref}
      className={`${wide ? "grid gap-y-6 lg:grid-cols-12 lg:gap-x-12" : ""} ${revealClass(visible)}`}
    >
      <div className={wide ? "lg:col-span-5" : ""}>
        <p className="flex items-center gap-3 text-[10px] uppercase tracking-[0.24em] text-white/45">
          <span className="text-brand-gold">{pad(index + 1)}</span>
          <span className="h-px w-6 bg-white/25" />
          {project.category} · {project.status}
        </p>
        <h3 id={`project-${project.slug}`} className="mt-4 font-serif text-[clamp(40px,4.4vw,68px)] font-light leading-[0.96] tracking-[-0.045em]">
          {project.name}
        </h3>
        <p className="mt-3 font-serif text-[clamp(19px,1.6vw,24px)] font-light italic leading-[1.3] tracking-[-0.02em] text-[#f1d4a6]">
          {project.statement}
        </p>
      </div>

      <div className={wide ? "lg:col-span-6 lg:col-start-7 lg:pt-2" : "mt-6"}>
        <p className="max-w-[520px] text-[15px] leading-[1.75] text-white/60">{firstSentence(project.description)}</p>

        <dl className="mt-6 grid grid-cols-1 gap-y-3 border-t border-white/12 pt-5 text-[13px] text-white/70 sm:grid-cols-2 sm:gap-x-8">
          {facts.map((fact, i) => (
            <div key={fact}>
              <dt className="text-[9px] uppercase tracking-[0.22em] text-white/35">{i === 0 ? "Configuration" : "Location"}</dt>
              <dd className="mt-1.5">{fact}</dd>
            </div>
          ))}
        </dl>

        {project.features.length ? (
          <ul className="mt-5 space-y-2 text-[13px] leading-[1.6] text-white/55">
            {project.features.slice(0, 3).map((feature) => (
              <li key={feature} className="flex gap-3">
                <span aria-hidden="true" className="mt-[9px] h-px w-3 shrink-0 bg-brand-gold/70" />
                {feature}
              </li>
            ))}
          </ul>
        ) : null}

        <Link
          href={projectHref(project.slug)}
          className="group mt-7 inline-flex items-center gap-3 text-[11px] uppercase tracking-[0.22em] text-white/80 transition-colors duration-300 hover:text-brand-gold"
        >
          <span className="border-b border-white/30 pb-1 transition-colors duration-300 group-hover:border-brand-gold">
            Enquire about {project.name}
          </span>
          <ArrowUpRight className="h-4 w-4 transition-transform duration-500 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
        </Link>
      </div>
    </div>
  );
}

export default function AvenueProjects() {
  const panelRef = useRef<HTMLDivElement>(null);
  const [headRef, headIn] = useReveal<HTMLDivElement>(0.3);

  // The panel rises on rounded corners and settles to full width as it arrives.
  useViewportProgress(panelRef, (p) => {
    const panel = panelRef.current;
    if (!panel) return;
    const inset = (1 - smoothstep(0, 0.12, p)) * 3;
    const r = window.innerWidth < 768 ? 24 : 44;
    panel.style.clipPath = `inset(0% ${inset.toFixed(2)}% 0% ${inset.toFixed(2)}% round ${r}px)`;
  });

  const [first, second, third, fourth] = projects;

  return (
    <section id="projects" aria-labelledby="projects-title" className="scroll-mt-24 bg-[#f3f0eb]">
      <div
        ref={panelRef}
        className="bg-[#0c0a09] text-white"
        style={{ clipPath: "inset(0% 3% 0% 3% round 44px)" }}
      >
        <div className="mx-auto max-w-[1450px] px-6 pb-24 pt-24 md:px-10 md:pb-32 md:pt-32 lg:px-12">
          {/* HEADING */}
          <div ref={headRef} className={`grid gap-y-6 lg:grid-cols-12 lg:items-end ${revealClass(headIn)}`}>
            <div className="lg:col-span-8">
              <div className="mb-8 flex items-center gap-4 md:mb-10">
                <span className="font-grotesk text-[11px] tracking-[0.2em] text-brand-gold">07</span>
                <span className="h-px w-10 bg-white/30" />
                <span className="text-[10px] uppercase tracking-[0.28em] text-white/50">Projects</span>
              </div>
              <h2
                id="projects-title"
                className="font-serif text-[clamp(44px,6vw,92px)] font-light leading-[0.94] tracking-[-0.05em]"
              >
                Our <em className="italic text-[#f1d4a6]">projects.</em>
              </h2>
            </div>
            <p className="text-[10px] uppercase tracking-[0.24em] text-white/45 lg:col-span-3 lg:col-start-10 lg:text-right">
              <span className="font-serif text-[28px] normal-case tracking-[-0.02em] text-white/85">
                {pad(projects.length)}
              </span>{" "}
              {statuses.length === 1 ? `${statuses[0]} developments` : "Developments"}
            </p>
          </div>

          <div className="mt-16 space-y-24 md:mt-20 md:space-y-32">
            {/* Each frame is sized to its render, so the building is never cut:
                Urbania's crown spans 13–80% of its width, Flora 10–63%, Bliss
                20–80%; Aura's elevation is trimmed only at the sky. */}
            {/* 01 — full width */}
            {first ? (
              <article aria-labelledby={`project-${first.slug}`}>
                <ProjectImage project={first} index={0} layout={{ frame: "aspect-[16/9] md:aspect-[16/7]", image: "object-[38%_50%]" }} />
                <div className="mt-8 md:mt-10">
                  <ProjectInfo project={first} index={0} wide />
                </div>
              </article>
            ) : null}

            {/* 02 + 03 — an offset pair */}
            {second || third ? (
              <div className="grid gap-y-24 md:grid-cols-12 md:gap-x-8 lg:gap-x-12">
                {second ? (
                  <article className="md:col-span-6" aria-labelledby={`project-${second.slug}`}>
                    <ProjectImage project={second} index={1} layout={{ frame: "aspect-[3/2]", image: "object-[30%_50%]" }} />
                    <div className="mt-8">
                      <ProjectInfo project={second} index={1} />
                    </div>
                  </article>
                ) : null}
                {third ? (
                  <article className="md:col-span-5 md:col-start-8 md:mt-40" aria-labelledby={`project-${third.slug}`}>
                    <ProjectImage project={third} index={2} layout={{ frame: "aspect-[4/5]", image: "object-[50%_62%]" }} />
                    <div className="mt-8">
                      <ProjectInfo project={third} index={2} />
                    </div>
                  </article>
                ) : null}
              </div>
            ) : null}

            {/* 04 — image beside its details */}
            {fourth ? (
              <article className="grid gap-y-8 md:grid-cols-12 md:items-center md:gap-x-8 lg:gap-x-12" aria-labelledby={`project-${fourth.slug}`}>
                <div className="md:col-span-5 lg:col-span-4 lg:col-start-2">
                  <ProjectImage project={fourth} index={3} layout={{ frame: "aspect-square", image: "object-[50%_40%]" }} />
                </div>
                <div className="md:col-span-7 lg:col-span-5 lg:col-start-7">
                  <ProjectInfo project={fourth} index={3} />
                </div>
              </article>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
}
