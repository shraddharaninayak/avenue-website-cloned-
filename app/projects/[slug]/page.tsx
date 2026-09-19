import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ProjectDetail from "@/components/project/ProjectDetail";
import { getProjectDetail, projectDetails } from "@/data/projectDetails";

/**
 * /projects/milestone · /projects/urbania · /projects/flora · /projects/aura ·
 * /projects/bliss — one route and one component for every project; the
 * content comes from data/projectDetails.ts. Pages are built at build time,
 * and any other slug is a 404.
 */

type Params = { params: { slug: string } };

export const dynamicParams = false;

export function generateStaticParams() {
  return projectDetails.map((p) => ({ slug: p.slug }));
}

export function generateMetadata({ params }: Params): Metadata {
  const project = getProjectDetail(params.slug);
  if (!project) return {};
  return {
    title: `${project.fullName} — ${project.eyebrow}`,
    description: [project.tagline, project.subline].filter(Boolean).join(" "),
  };
}

export default function ProjectPage({ params }: Params) {
  const project = getProjectDetail(params.slug);
  if (!project) notFound();
  const related = projectDetails.filter((p) => p.slug !== project.slug);
  return <ProjectDetail project={project} related={related} />;
}
