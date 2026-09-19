"use client";

import React, { useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { X, Instagram, Facebook, Youtube } from "lucide-react";
import { overlayLinks } from "./navigation";
import { socials } from "@/data/avenue";

/**
 * The side menu: a compact cream panel that slides in from the right — full
 * width on phones, about 480px on tablets, 540–560px on desktop — with the
 * logo and a round close button, a thin rule, the links set in italic serif,
 * and the social profiles at the foot.
 *
 * The logo here is The Avenue's full-colour logo (navy with the yellow bar),
 * exported unaltered from the vector artwork in the brochures: the white
 * logo used on the dark header would not show on cream.
 */

/** The cream shared with the intro screen. */
export const MENU_CREAM = "#f8f5ef";

const socialIcons = {
  Instagram,
  Facebook,
  YouTube: Youtube,
} as const;

type MenuOverlayProps = {
  open: boolean;
  onClose: () => void;
};

export default function MenuOverlay({ open, onClose }: MenuOverlayProps) {
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKeyDown);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    // Focus lands on the close button once the panel has started to move.
    const t = window.setTimeout(() => closeRef.current?.focus(), 60);

    return () => {
      window.clearTimeout(t);
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [open, onClose]);

  // Items enter one after another as the panel arrives, and leave together.
  const stagger = (i: number) => ({ transitionDelay: open ? `${220 + i * 60}ms` : "0ms" });

  return (
    <div
      id="avenue-menu"
      aria-hidden={!open}
      className={`fixed inset-0 z-[100] ${open ? "pointer-events-auto" : "pointer-events-none"}`}
    >
      {/* Backdrop: a light veil over the page; a click on it closes the menu. */}
      <div
        onClick={onClose}
        aria-hidden="true"
        className={`absolute inset-0 bg-[#1a1511]/25 transition-opacity duration-500 ${open ? "opacity-100" : "opacity-0"}`}
      />

      <aside
        role="dialog"
        aria-modal="true"
        aria-label="Site menu"
        {...(!open ? { inert: "" as unknown as boolean } : {})}
        className={`absolute right-0 top-0 flex h-[100dvh] w-full flex-col overflow-hidden border-l border-[#e6ddd1] shadow-[-24px_0_80px_rgba(0,0,0,0.12)] transition-[transform,opacity] duration-[700ms] ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none md:w-[480px] lg:w-[540px] xl:w-[560px] ${
          open ? "translate-x-0 opacity-100" : "translate-x-full opacity-0"
        }`}
        style={{ backgroundColor: MENU_CREAM }}
      >
        {/* Logo and close */}
        <div className="flex shrink-0 items-center justify-between px-7 pb-6 pt-6 md:px-10 md:pt-8 lg:px-14 lg:pb-7 lg:pt-9">
          <Link href="/" onClick={onClose} aria-label="The Avenue Builders & Developers — home" className="block">
            <Image
              src="/logo-avenue-colour.webp"
              alt="The Avenue Builders & Developers"
              width={1400}
              height={596}
              className="h-[46px] w-auto md:h-[52px] lg:h-[56px]"
            />
          </Link>

          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            aria-label="Close menu"
            className="group flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#efe8de] text-[#a08a76] transition-colors duration-300 hover:bg-[#a08a76] hover:text-white focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#a08a76] focus-visible:ring-offset-2 focus-visible:ring-offset-[#f8f5ef] lg:h-14 lg:w-14"
          >
            <X className="h-5 w-5 transition-transform duration-300 group-hover:rotate-90" strokeWidth={1.3} />
          </button>
        </div>

        {/* Rule */}
        <div
          aria-hidden="true"
          className={`mx-7 h-px shrink-0 origin-left bg-[#ded4c7] transition-transform delay-150 duration-[900ms] ease-[cubic-bezier(0.22,1,0.36,1)] md:mx-10 lg:mx-14 ${
            open ? "scale-x-100" : "scale-x-0"
          }`}
        />

        {/* Links */}
        <nav aria-label="Main navigation" className="flex-1 overflow-y-auto px-7 py-8 md:px-10 md:py-10 lg:px-14 lg:py-12">
          <ul className="flex flex-col gap-1 md:gap-1.5">
            {overlayLinks.map((item, i) => (
              <li key={item.label}>
                <Link
                  href={item.href}
                  onClick={onClose}
                  style={stagger(i)}
                  className={`group inline-block py-2 transition-[transform,opacity] duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none md:py-2.5 ${
                    open ? "translate-x-0 opacity-100" : "translate-x-8 opacity-0"
                  }`}
                >
                  <span className="block font-serif text-[28px] font-light italic leading-[1.1] tracking-[-0.02em] text-[#ac9482] transition-[color,transform] duration-300 group-hover:translate-x-1.5 group-hover:text-[#7f6755] group-focus-visible:translate-x-1.5 group-focus-visible:text-[#7f6755] md:text-[34px] lg:text-[42px]">
                    {item.label}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* Social profiles */}
        <div
          style={stagger(overlayLinks.length)}
          className={`mx-7 flex shrink-0 items-center justify-between border-t border-[#ded4c7] pb-7 pt-6 transition-[transform,opacity] duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] md:mx-10 md:pb-9 lg:mx-14 lg:pb-10 ${
            open ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
          }`}
        >
          <span className="font-grotesk text-[10px] font-medium uppercase tracking-[0.22em] text-[#a08a76]">Follow us</span>
          <ul className="flex items-center gap-2.5">
            {socials.map((social) => {
              const Icon = socialIcons[social.label];
              return (
                <li key={social.label}>
                  <a
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`The Avenue on ${social.label}`}
                    className="flex h-10 w-10 items-center justify-center rounded-full bg-[#a8917d] text-white transition-[background-color,transform] duration-300 hover:-translate-y-0.5 hover:bg-[#8f7762] focus-visible:bg-[#8f7762] focus-visible:outline-none"
                  >
                    <Icon className="h-4 w-4" strokeWidth={1.7} />
                  </a>
                </li>
              );
            })}
          </ul>
        </div>
      </aside>
    </div>
  );
}
