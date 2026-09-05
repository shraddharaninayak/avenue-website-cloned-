"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import MenuOverlay from "./MenuOverlay";
import { barLayout, headerLinks } from "./navigation";

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <>
      <header className="fixed inset-x-0 top-0 z-50 border-b border-white/10 bg-transparent">
        <div className={barLayout}>
          {/* Brand */}
          <Link href="/" aria-label="The Avenue Builders & Developers — home">
            {/* Intrinsic size is the 2x display size (source is 1499x622, same
                ratio) so the bar keeps its proportions even before CSS lands. */}
            <Image
              src="/logo-avenue.webp"
              alt="The Avenue Builders & Developers"
              width={270}
              height={112}
              priority
              className="h-[52px] w-auto lg:h-[64px]"
            />
          </Link>

          <div className="flex items-center gap-6 lg:gap-10 xl:gap-14">
            <nav className="hidden items-center gap-8 lg:flex xl:gap-12">
              {headerLinks.map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  className="font-grotesk text-[11px] font-medium uppercase tracking-[0.22em] text-white/85 transition-colors duration-300 hover:text-brand-gold"
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            {/* Square menu button */}
            <button
              type="button"
              onClick={() => setMenuOpen(true)}
              aria-label="Open menu"
              aria-expanded={menuOpen}
              aria-controls="avenue-menu"
              className="flex h-11 w-11 shrink-0 items-center justify-center bg-brand-gold text-black transition-colors duration-300 hover:bg-white lg:h-12 lg:w-12"
            >
              <svg
                viewBox="0 0 20 20"
                aria-hidden="true"
                fill="currentColor"
                className="h-[15px] w-[15px] lg:h-4 lg:w-4"
              >
                <rect x="0" y="0" width="8" height="8" />
                <rect x="12" y="0" width="8" height="8" />
                <rect x="0" y="12" width="8" height="8" />
                <rect x="12" y="12" width="8" height="8" />
              </svg>
            </button>
          </div>
        </div>
      </header>

      <MenuOverlay open={menuOpen} onClose={() => setMenuOpen(false)} />
    </>
  );
}
