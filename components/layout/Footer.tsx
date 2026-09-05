import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Mail, Phone, MapPin, Instagram, Facebook, Youtube } from "lucide-react";
import { company, socials, projects } from "@/data/avenue";

const socialIcons = {
  Facebook,
  Instagram,
  YouTube: Youtube,
} as const;

export default function Footer() {
  return (
    <footer className="bg-[#0c0a09] border-t border-white/10 text-white/70 pt-20 pb-12">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 pb-16 border-b border-white/10">
          {/* Brand Col */}
          <div className="lg:col-span-2 space-y-6">
            <Image
              src="/logo-avenue.webp"
              alt={company.name}
              width={270}
              height={112}
              className="h-14 w-auto"
            />
            <p className="font-hanken text-sm text-white/60 max-w-sm leading-relaxed">
              {company.tagline}
            </p>
            <div className="flex items-center gap-4 text-white/60">
              {socials.map((social) => {
                const Icon = socialIcons[social.label];
                return (
                  <a
                    key={social.label}
                    href={social.href}
                    target="_blank"
                    rel="noreferrer"
                    className="p-2.5 rounded-full border border-white/10 hover:border-brand-gold hover:text-brand-gold transition-colors"
                    aria-label={social.label}
                  >
                    <Icon className="w-4 h-4" />
                  </a>
                );
              })}
            </div>
          </div>

          {/* Our Projects */}
          <div className="space-y-4">
            <h4 className="font-grotesk text-[11px] uppercase tracking-[0.25em] text-white font-semibold">
              Our Projects
            </h4>
            <ul className="space-y-2.5 text-sm font-hanken">
              {projects.map((project) => (
                <li key={project.slug}>
                  <Link
                    href="/#projects"
                    className="hover:text-brand-gold transition-colors"
                  >
                    {project.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div className="space-y-4">
            <h4 className="font-grotesk text-[11px] uppercase tracking-[0.25em] text-white font-semibold">
              Company
            </h4>
            <ul className="space-y-2.5 text-sm font-hanken">
              <li>
                <Link href="/our-story" className="hover:text-brand-gold transition-colors">
                  Our Story
                </Link>
              </li>
              <li>
                <Link href="/#developments" className="hover:text-brand-gold transition-colors">
                  Developments
                </Link>
              </li>
              <li>
                <Link href="/#leadership" className="hover:text-brand-gold transition-colors">
                  Leadership
                </Link>
              </li>
              <li>
                <Link href="/careers" className="hover:text-brand-gold transition-colors">
                  Careers
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-brand-gold transition-colors">
                  Contact Us
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Details */}
          <div className="space-y-4">
            <h4 className="font-grotesk text-[11px] uppercase tracking-[0.25em] text-white font-semibold">
              Contact Details
            </h4>
            <div className="space-y-3 text-xs font-hanken text-white/60 leading-relaxed">
              <div className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-brand-gold shrink-0 mt-0.5" />
                <span>{company.address}</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-brand-gold shrink-0" />
                <a href={company.phoneHref} className="hover:text-white transition-colors">
                  {company.phone}
                </a>
              </div>
              <div className="flex items-start gap-2.5">
                <Mail className="w-4 h-4 text-brand-gold shrink-0 mt-0.5" />
                <a
                  href={company.emailHref}
                  className="hover:text-white transition-colors break-all"
                >
                  {company.email}
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom copyright */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] font-grotesk uppercase tracking-[0.15em] text-white/40">
          <div>
            © {new Date().getFullYear()} {company.name}. All rights reserved.
          </div>
          <div className="flex items-center gap-6">
            <Link href="/contact" className="hover:text-white transition-colors">
              Privacy Policy
            </Link>
            <Link href="/contact" className="hover:text-white transition-colors">
              Terms & Conditions
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
