import React from "react";

import AvenueHero from "@/components/home/AvenueHero";
import AvenuePortrait from "@/components/home/AvenuePortrait";
import AvenueValues from "@/components/home/AvenueValues";
import Leadership from "@/components/home/Leadership";
import AvenueStatement from "@/components/home/AvenueStatement";
import AvenueCapabilities from "@/components/home/AvenueCapabilities";
import AvenueProjects from "@/components/home/AvenueProjects";
import AvenueProcess from "@/components/home/AvenueProcess";
import AvenueCTA from "@/components/home/AvenueCTA";

/**
 * The homepage: nine sections, then the footer (10, shared by every page).
 *
 *   01 Hero          — The Avenue's film, played by scroll
 *   02 Portrait      — who The Avenue is
 *   03 Values        — what it stands for
 *   04 Leadership    — who is behind it
 *   05 Statement     — "We deliver beyond residential properties."
 *   06 Capabilities  — what it does
 *   07 Projects      — the portfolio (its only place on the homepage)
 *   08 Process       — how it approaches a development
 *   09 CTA           — the invitation to take the next step
 *
 * The earlier homepage sections (HeroCanvas, AvenueIntro, AvenueAbout,
 * AvenuePillars, BuiltForMore, ExploreDevelopments, Testimonials, ContactCTA)
 * are kept in components/home, unrendered, until the next sections are
 * reviewed.
 */
export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#f3f0eb]">
      <AvenueHero />
      <AvenuePortrait />
      <AvenueValues />
      <Leadership variant="editorial" />
      <AvenueStatement />
      <AvenueCapabilities />
      <AvenueProjects />
      <AvenueProcess />
      <AvenueCTA />
    </div>
  );
}
