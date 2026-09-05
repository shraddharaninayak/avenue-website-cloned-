import React from "react";

import HeroCanvas from "@/components/home/HeroCanvas";
import AvenueIntro from "@/components/home/AvenueIntro";
import AvenueAbout from "@/components/home/AvenueAbout";
import AvenuePillars from "@/components/home/AvenuePillars";
import ProjectShowcase from "@/components/home/ProjectShowcase";
import StatsSection from "@/components/home/StatsSection";
import Leadership from "@/components/home/Leadership";
import Awards from "@/components/home/Awards";
import ContactCTA from "@/components/home/ContactCTA";

export default function HomePage() {
  return (
    <div className="bg-black min-h-screen">
      {/* 233-Frame Scroll Scrubbing Canvas Engine */}
      <HeroCanvas />

      {/* Avenue cinematic typography transition */}
      <AvenueIntro />

      {/* About Avenue */}
      <AvenueAbout />

      <AvenuePillars />

      {/* Portfolio / Featured Developments */}
      <ProjectShowcase />

      {/* Legacy & Milestones */}
      <StatsSection />

      {/* Leadership Spotlight */}
      <Leadership />

      {/* Industry Awards */}
      <Awards />

      {/* Contact & Private Tour CTA */}
      <ContactCTA />
    </div>
  );
}
