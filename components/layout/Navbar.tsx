"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import MenuOverlay from "./MenuOverlay";

/**
 * The header: the logo, a Contact pill and a two-line menu button. Everything
 * else lives in the side menu (MenuOverlay).
 *
 * The logo is The Avenue's logo in its white form, with the "Reason to
 * Smile!" line as on the office signage: white lettering and the yellow bar,
 * redrawn from the brochure vector artwork. No filter is applied to it.
 *
 * On smaller screens, where the page's type runs the full width beneath it,
 * the header takes a dark glass backing once the page scrolls, so the logo
 * never sits on a cream section or tangles with a heading passing under it.
 * Over a full-bleed hero (marked data-header="clear") — and on large screens
 * — it stays clear.
 */
export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [solid, setSolid] = useState(false);
  const headerRef = useRef<HTMLElement>(null);
  const menuButtonRef = useRef<HTMLButtonElement>(null);

  // Whether the header is over the page's content, or over its hero.
  useEffect(() => {
    let raf: number | null = null;
    const probe = () => {
      raf = null;
      const header = headerRef.current;
      if (!header) return;
      const underHero = document
        .elementsFromPoint(window.innerWidth / 2, header.offsetHeight / 2)
        .some((el) => !header.contains(el) && el.closest('[data-header="clear"]'));
      setSolid(!underHero && window.scrollY > 8);
    };
    const onScroll = () => {
      if (raf === null) raf = requestAnimationFrame(probe);
    };
    probe();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (raf !== null) cancelAnimationFrame(raf);
    };
  }, []);

  const closeMenu = useCallback(() => {
    setMenuOpen(false);
    // Back to where the visitor was.
    menuButtonRef.current?.focus();
  }, []);

  return (
    <>
      <header
        ref={headerRef}
        className={`fixed inset-x-0 top-0 z-50 bg-transparent transition-[background-color,backdrop-filter] duration-500 ${
          solid ? "max-lg:bg-[#584738]/80 max-lg:backdrop-blur-md" : ""
        }`}
      >
        <div className="mx-auto flex h-[80px] w-full items-center justify-between px-6 md:px-10 lg:h-[92px] lg:px-12">
          <Link href="/" aria-label="The Avenue Builders & Developers — home" className="shrink-0">
            <Image
              src="/logo-avenue.png"
              alt="The Avenue Builders & Developers — Reason to Smile!"
              width={1942}
              height={810}
              priority
              className="h-[58px] w-auto lg:h-[75px]"
            />
          </Link>

          <div className="flex items-center gap-4 lg:gap-7">
            <Link
              href="/contact"
              className="flex h-10 items-center justify-center rounded-full border border-white/80 px-6 font-grotesk text-[11px] font-semibold uppercase tracking-[0.16em] text-white transition-colors duration-300 hover:bg-white hover:text-[#B59E7D] focus-visible:bg-white focus-visible:text-[#B59E7D] focus-visible:outline-none lg:h-11 lg:px-7"
            >
              Contact
            </Link>

            <button
              ref={menuButtonRef}
              type="button"
              onClick={() => setMenuOpen(true)}
              aria-label="Open menu"
              aria-expanded={menuOpen}
              aria-controls="avenue-menu"
              className="group flex h-11 w-11 shrink-0 flex-col items-end justify-center gap-[7px] bg-transparent lg:w-12"
            >
              <span className="block h-px w-9 bg-white transition-all duration-300 group-hover:w-10 lg:w-10 lg:group-hover:w-11" />
              <span className="block h-px w-9 bg-white transition-all duration-300 group-hover:w-7 lg:w-10 lg:group-hover:w-8" />
            </button>
          </div>
        </div>
      </header>

      <MenuOverlay open={menuOpen} onClose={closeMenu} />
    </>
  );
}
