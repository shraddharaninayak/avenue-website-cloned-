"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { X } from "lucide-react";
import { enquireHref, overlayLinks } from "./navigation";

type MenuOverlayProps = {
  open: boolean;
  onClose: () => void;
};

/**
 * Off-canvas navigation drawer.
 *
 * A fixed panel pinned to the right edge — 420px on desktop, widening to 88vw
 * on a phone — that slides in on translateX rather than resizing, so it never
 * reflows the page or introduces horizontal scroll. The site stays visible
 * behind a dimmed scrim, which closes the drawer on click.
 */
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
    <div id="avenue-menu" aria-hidden={!open}>
      {/* SCRIM — keeps the site visible behind the drawer */}
      <div
        onClick={onClose}
        aria-hidden="true"
        className={`fixed inset-0 z-[60] bg-black/60 transition-opacity duration-500 ${
          open ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      />

      {/* DRAWER */}
      <aside
        role="dialog"
        aria-modal="true"
        aria-label="Site menu"
        className={`fixed right-0 top-0 z-[61] flex h-[100dvh] w-[88vw] max-w-[420px] flex-col border-l border-white/10 bg-[#0c0a09] shadow-[0_0_60px_rgba(0,0,0,0.5)] transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
        // Keep the panel out of the tab order while it is closed.
        {...(open ? {} : { inert: "" as unknown as boolean })}
      >
        {/* TOP BAR */}
        <div className="flex shrink-0 items-center justify-between gap-4 px-7 pb-6 pt-7 md:px-9">
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
              className="h-10 w-auto"
            />
          </Link>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close menu"
            className="flex h-10 w-10 shrink-0 items-center justify-center border border-white/15 text-white transition-colors duration-300 hover:border-brand-gold hover:text-brand-gold"
          >
            <X className="h-4.5 w-4.5" strokeWidth={1.5} />
          </button>
        </div>

        {/* MENU ROWS */}
        <nav className="flex-1 overflow-y-auto px-7 md:px-9">
          <ul className="border-t border-white/10">
            {overlayLinks.map((item, idx) => (
              <li key={item.label} className="border-b border-white/10">
                <Link
                  href={item.href}
                  onClick={onClose}
                  className="group flex items-baseline gap-4 py-4"
                >
                  <span className="w-6 shrink-0 font-grotesk text-[10px] font-semibold tracking-[0.2em] text-brand-gold">
                    {String(idx + 1).padStart(2, "0")}
                  </span>
                  <span className="font-serif text-2xl font-light leading-none tracking-tight text-white transition-colors duration-300 group-hover:text-brand-gold">
                    {item.label}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* BOTTOM CTA */}
        <div className="shrink-0 px-7 pb-8 pt-6 md:px-9">
          <Link
            href={enquireHref}
            onClick={onClose}
            className="inline-flex w-full items-center justify-center border border-white/25 px-8 py-3.5 font-grotesk text-[11px] font-semibold uppercase tracking-[0.25em] text-white transition-colors duration-300 hover:border-brand-gold hover:text-brand-gold"
          >
            Enquire Now
          </Link>
        </div>
      </aside>
    </div>
  );
}
