import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Mail, Phone, MapPin, Instagram, Linkedin, Facebook, Youtube } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-[#0c0a09] border-t border-white/10 text-white/70 pt-20 pb-12">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 pb-16 border-b border-white/10">
          {/* Brand Col */}
          <div className="lg:col-span-2 space-y-6">
            <Image
              src="/logo-avenue.webp"
              alt="The Avenue Builders & Developers"
              width={270}
              height={112}
              className="h-14 w-auto"
            />
            <p className="font-hanken text-sm text-white/60 max-w-sm leading-relaxed">
              Transforming urban landscapes with signature luxury residences, premium commercial hubs, and forward-thinking master-planned communities.
            </p>
            <div className="flex items-center gap-4 text-white/60">
              <a
                href="https://www.instagram.com"
                target="_blank"
                rel="noreferrer"
                className="p-2.5 rounded-full border border-white/10 hover:border-brand-gold hover:text-brand-gold transition-colors"
                aria-label="Instagram"
              >
                <Instagram className="w-4 h-4" />
              </a>
              <a
                href="https://www.linkedin.com"
                target="_blank"
                rel="noreferrer"
                className="p-2.5 rounded-full border border-white/10 hover:border-brand-gold hover:text-brand-gold transition-colors"
                aria-label="LinkedIn"
              >
                <Linkedin className="w-4 h-4" />
              </a>
              <a
                href="https://www.facebook.com"
                target="_blank"
                rel="noreferrer"
                className="p-2.5 rounded-full border border-white/10 hover:border-brand-gold hover:text-brand-gold transition-colors"
                aria-label="Facebook"
              >
                <Facebook className="w-4 h-4" />
              </a>
              <a
                href="https://www.youtube.com"
                target="_blank"
                rel="noreferrer"
                className="p-2.5 rounded-full border border-white/10 hover:border-brand-gold hover:text-brand-gold transition-colors"
                aria-label="YouTube"
              >
                <Youtube className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Quick Links: Residential */}
          <div className="space-y-4">
            <h4 className="font-grotesk text-[11px] uppercase tracking-[0.25em] text-white font-semibold">
              Residential
            </h4>
            <ul className="space-y-2.5 text-sm font-hanken">
              <li>
                <Link href="/the-one" className="hover:text-brand-gold transition-colors">
                  The One
                </Link>
              </li>
              <li>
                <Link href="/#paris-city" className="hover:text-brand-gold transition-colors">
                  Paris City
                </Link>
              </li>
              <li>
                <Link href="/#infinity-east" className="hover:text-brand-gold transition-colors">
                  Infinity East
                </Link>
              </li>
              <li>
                <Link href="/#anandam" className="hover:text-brand-gold transition-colors">
                  Anandam World City
                </Link>
              </li>
              <li>
                <Link href="/#embassy" className="hover:text-brand-gold transition-colors">
                  Kukreja Embassy
                </Link>
              </li>
            </ul>
          </div>

          {/* Commercial & Corporate */}
          <div className="space-y-4">
            <h4 className="font-grotesk text-[11px] uppercase tracking-[0.25em] text-white font-semibold">
              Commercial & About
            </h4>
            <ul className="space-y-2.5 text-sm font-hanken">
              <li>
                <Link href="/west-19" className="hover:text-brand-gold transition-colors">
                  West 19
                </Link>
              </li>
              <li>
                <Link href="/#kbp" className="hover:text-brand-gold transition-colors">
                  Business Park
                </Link>
              </li>
              <li>
                <Link href="/our-story" className="hover:text-brand-gold transition-colors">
                  Our Story
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
              Corporate Office
            </h4>
            <div className="space-y-3 text-xs font-hanken text-white/60 leading-relaxed">
              <div className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-brand-gold shrink-0 mt-0.5" />
                <span>Museum Road, Civil Lines, Nagpur, Maharashtra 440026</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-brand-gold shrink-0" />
                <a href="tel:+917888012200" className="hover:text-white transition-colors">
                  +91 78880 12200
                </a>
              </div>
              <div className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-brand-gold shrink-0" />
                <a href="mailto:info@kinfra.in" className="hover:text-white transition-colors">
                  info@kinfra.in
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom copyright */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] font-grotesk uppercase tracking-[0.15em] text-white/40">
          <div>
            © {new Date().getFullYear()} The Avenue Builders &amp; Developers. All rights reserved.
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
