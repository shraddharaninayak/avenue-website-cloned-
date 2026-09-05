"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { X } from "lucide-react";
import { barLayout, enquireHref, overlayLinks } from "./navigation";

type MenuOverlayProps = {
  open: boolean;
  onClose: () => void;
};

export default function MenuOverlay({ open, onClose }: MenuOverlayProps) {
  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    document.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  return (
    <div
      id="avenue-menu"
      aria-hidden={!open}
      className={`fixed inset-0 z-[60] bg-[#0c0a09] transition-opacity duration-300 ${
        open ? "opacity-100" : "invisible pointer-events-none opacity-0"
      }`}
    >
      <div className="flex h-full w-full flex-col overflow-y-auto">
        {/* Top bar — same metrics as the header, so the logo does not shift */}
        <div className={`${barLayout} shrink-0`}>
          <Link
            href="/"
            onClick={onClose}
            aria-label="The Avenue Builders & Developers — home"
          >
            <Image
              src="/logo-avenue.webp"
              alt="The Avenue Builders & Developers"
              width={270}
              height={112}
              className="h-11 w-auto lg:h-14"
            />
          </Link>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close menu"
            className="flex h-11 w-11 shrink-0 items-center justify-center border border-white/15 text-white transition-colors duration-300 hover:border-brand-gold hover:text-brand-gold lg:h-12 lg:w-12"
          >
            <X className="h-5 w-5" strokeWidth={1.5} />
          </button>
        </div>

        {/* Numbered menu rows */}
        <nav className="flex-1 px-6 pb-6 md:px-10 lg:px-14">
          <ul className="w-full max-w-5xl border-t border-white/10">
            {overlayLinks.map((item, idx) => (
              <li key={item.label} className="border-b border-white/10">
                <Link
                  href={item.href}
                  onClick={onClose}
                  className="group flex items-baseline gap-5 py-5 md:gap-10 md:py-7"
                >
                  <span className="w-6 shrink-0 font-grotesk text-[11px] font-semibold tracking-[0.2em] text-brand-gold md:w-10 md:text-xs">
                    {String(idx + 1).padStart(2, "0")}
                  </span>
                  <span className="font-serif text-3xl font-light leading-none tracking-tight text-white transition-colors duration-300 group-hover:text-brand-gold md:text-5xl lg:text-6xl">
                    {item.label}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* Bottom CTA */}
        <div className="shrink-0 px-6 pb-10 md:px-10 lg:px-14">
          <div className="w-full max-w-5xl">
            <Link
              href={enquireHref}
              onClick={onClose}
              className="inline-flex items-center justify-center border border-white/25 px-10 py-4 font-grotesk text-[11px] font-semibold uppercase tracking-[0.25em] text-white transition-colors duration-300 hover:border-brand-gold hover:text-brand-gold"
            >
              Enquire Now
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
