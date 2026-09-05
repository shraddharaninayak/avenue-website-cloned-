import React from "react";
import { Briefcase, CheckCircle, Mail, MapPin } from "lucide-react";
import { company } from "@/data/avenue";

const positions = [
  {
    title: "Senior Project Engineer (Civil)",
    dept: "Engineering & Construction",
    location: "Nashik",
    type: "Full Time",
    experience: "7+ Years",
  },
  {
    title: "Luxury Residential Sales Advisor",
    dept: "Sales & Client Advisory",
    location: "Nashik",
    type: "Full Time",
    experience: "4+ Years",
  },
  {
    title: "Chief Architectural Draftsman / 3D Visualizer",
    dept: "Design & Planning",
    location: "Corporate Office, Nashik",
    type: "Full Time",
    experience: "5+ Years",
  },
  {
    title: "Site Quality & Safety Supervisor",
    dept: "Project Execution",
    location: "Project Site, Nashik",
    type: "Full Time",
    experience: "3+ Years",
  },
];

export default function CareersPage() {
  return (
    <div className="bg-[#0c0a09] text-white pt-28">
      {/* Header */}
      <section className="px-6 md:px-12 lg:px-20 py-20 max-w-7xl mx-auto">
        <div className="text-[11px] font-grotesk uppercase tracking-[0.3em] text-brand-gold font-semibold mb-4">
          Careers
        </div>
        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-grotesk font-normal uppercase leading-[1.0] tracking-tight max-w-4xl">
          Build Landmarks With Us
        </h1>
        <p className="font-hanken text-white/70 max-w-2xl text-lg md:text-xl mt-8 leading-relaxed">
          Join a visionary team passionate about raising the standard of architectural craftsmanship and real estate innovation across Central India.
        </p>
      </section>

      {/* Culture Benefits */}
      <section className="bg-[#14110c] py-20 px-6 md:px-12 lg:px-20 border-y border-white/10">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="p-6 border border-white/10 bg-[#17140f]">
            <CheckCircle className="w-8 h-8 text-brand-gold mb-4" />
            <h3 className="font-grotesk text-xl uppercase tracking-tight text-white mb-2">
              Signature Projects
            </h3>
            <p className="font-hanken text-sm text-white/60 leading-relaxed">
              Work on iconic luxury sky towers, Grade-A commercial complexes, and master-planned townships.
            </p>
          </div>
          <div className="p-6 border border-white/10 bg-[#17140f]">
            <CheckCircle className="w-8 h-8 text-brand-gold mb-4" />
            <h3 className="font-grotesk text-xl uppercase tracking-tight text-white mb-2">
              Professional Growth
            </h3>
            <p className="font-hanken text-sm text-white/60 leading-relaxed">
              Continuous mentorship under seasoned industry veterans and exposure to world-class engineering consultants.
            </p>
          </div>
          <div className="p-6 border border-white/10 bg-[#17140f]">
            <CheckCircle className="w-8 h-8 text-brand-gold mb-4" />
            <h3 className="font-grotesk text-xl uppercase tracking-tight text-white mb-2">
              Meritocratic Culture
            </h3>
            <p className="font-hanken text-sm text-white/60 leading-relaxed">
              A collaborative, transparent work atmosphere where ingenuity, dedication, and precision are celebrated.
            </p>
          </div>
        </div>
      </section>

      {/* Openings */}
      <section className="py-28 px-6 md:px-12 lg:px-20 max-w-7xl mx-auto">
        <div className="text-[11px] font-grotesk uppercase tracking-[0.3em] text-brand-gold font-semibold mb-3">
          Opportunities
        </div>
        <h2 className="text-3xl sm:text-5xl font-grotesk font-normal uppercase leading-[1.05] tracking-tight mb-16">
          Open Positions
        </h2>

        <div className="space-y-6">
          {positions.map((job, idx) => (
            <div
              key={idx}
              className="bg-[#14110c] border border-white/10 p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 hover:border-brand-gold/50 transition-colors"
            >
              <div className="space-y-2">
                <div className="flex items-center gap-3 text-xs font-grotesk uppercase tracking-wider text-brand-gold font-semibold">
                  <span>{job.dept}</span>
                  <span>•</span>
                  <span>{job.experience}</span>
                </div>
                <h3 className="font-grotesk text-2xl uppercase tracking-tight text-white">
                  {job.title}
                </h3>
                <div className="flex items-center gap-4 text-xs font-hanken text-white/50 pt-1">
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-brand-gold" />
                    <span>{job.location}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Briefcase className="w-3.5 h-3.5 text-brand-gold" />
                    <span>{job.type}</span>
                  </div>
                </div>
              </div>

              <a
                href={`${company.emailHref}?subject=Application for ${encodeURIComponent(
                  job.title
                )}`}
                className="inline-flex items-center justify-center px-8 py-3.5 bg-brand-gold text-black font-grotesk text-xs uppercase tracking-[0.2em] font-semibold hover:bg-white transition-colors"
              >
                Apply Now
              </a>
            </div>
          ))}
        </div>

        {/* Spontaneous Application */}
        <div className="mt-16 p-10 bg-[#17140f] border border-white/10 text-center max-w-2xl mx-auto space-y-4">
          <Mail className="w-8 h-8 text-brand-gold mx-auto" />
          <h3 className="font-grotesk text-2xl uppercase tracking-tight text-white">
            Don't See Your Role?
          </h3>
          <p className="font-hanken text-sm text-white/60 leading-relaxed">
            We are always looking for exceptional talent in structural engineering, architecture, procurement, and client management.
          </p>
          <div className="pt-2">
            <a
              href={company.emailHref}
              className="inline-block text-brand-gold hover:underline font-grotesk text-xs uppercase tracking-[0.2em] font-semibold"
            >
              Send your CV to {company.email} →
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
