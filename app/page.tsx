import React from "react";

import HeroCanvas from "@/components/home/HeroCanvas";
import AvenueIntro from "@/components/home/AvenueIntro";
import AvenueAbout from "@/components/home/AvenueAbout";
import AvenuePillars from "@/components/home/AvenuePillars";
import OurProjects from "@/components/home/OurProjects";
import ExploreDevelopments from "@/components/home/ExploreDevelopments";
import Leadership from "@/components/home/Leadership";
import Testimonials from "@/components/home/Testimonials";
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

      {/* Places We've Shaped — one image resolving into four developments */}
      <AvenuePillars />

      {/* Our Projects — the portfolio as editorial spreads */}
      <OurProjects />

      {/* Explore our developments — list bound to an interactive plan */}
      <ExploreDevelopments />

      {/* Meet the directors of The Avenue */}
      <Leadership />

      {/* What clients say — seamless testimonial marquee */}
      <Testimonials />

      {/* Contact & Private Tour CTA */}
      <ContactCTA />
    </div>
  );
}
