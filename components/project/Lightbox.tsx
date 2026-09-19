"use client";

import { useCallback, useEffect, useRef } from "react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import type { Media } from "@/data/projectDetails";

/**
 * Full-screen viewer for the image story, the location image and the floor
 * plans. Arrow keys and the on-screen arrows step through; Escape, the close
 * button or a click on the backdrop closes it. Page scroll is held while open,
 * and focus returns to whatever opened it.
 */
export default function Lightbox({
  items,
  index,
  onIndex,
  onClose,
  label,
  light = false,
}: {
  items: Media[];
  index: number | null;
  onIndex: (i: number) => void;
  onClose: () => void;
  label: string;
  /** Plans read better on a light ground. */
  light?: boolean;
}) {
  const closeRef = useRef<HTMLButtonElement>(null);
  const returnRef = useRef<Element | null>(null);
  const open = index !== null;
  const count = items.length;

  const step = useCallback(
    (d: number) => {
      if (index === null || count < 2) return;
      onIndex((index + d + count) % count);
    },
    [index, count, onIndex],
  );

  useEffect(() => {
    if (!open) return;
    returnRef.current = document.activeElement;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      else if (e.key === "ArrowRight") step(1);
      else if (e.key === "ArrowLeft") step(-1);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
      (returnRef.current as HTMLElement | null)?.focus?.();
    };
  }, [open, onClose, step]);

  if (!open || index === null) return null;
  const item = items[index];

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={label}
      className={`fixed inset-0 z-[70] flex flex-col ${light ? "bg-[#f3f0eb]" : "bg-[#0c0a09]/[0.97]"}`}
      onClick={onClose}
    >
      <div
        className={`flex items-center justify-between gap-4 px-5 py-4 text-[10px] uppercase tracking-[0.24em] md:px-8 ${
          light ? "text-black/55" : "text-white/55"
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        <span className="min-w-0 truncate">
          <span className={light ? "text-black" : "text-white"}>{String(index + 1).padStart(2, "0")}</span> /{" "}
          {String(count).padStart(2, "0")}
          {item.caption ? <span className="ml-4 normal-case tracking-[0.02em]">{item.caption}</span> : null}
        </span>
        <button
          ref={closeRef}
          type="button"
          onClick={onClose}
          aria-label="Close"
          className={`flex h-10 w-10 shrink-0 items-center justify-center border transition-colors ${
            light ? "border-black/20 text-black hover:border-black" : "border-white/20 text-white hover:border-brand-gold hover:text-brand-gold"
          }`}
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="relative flex min-h-0 flex-1 items-center justify-center px-4 pb-6 md:px-20">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          key={item.src}
          src={item.src}
          alt={item.alt}
          className="max-h-full max-w-full object-contain"
          onClick={(e) => e.stopPropagation()}
        />
        {count > 1 ? (
          <>
            <button
              type="button"
              aria-label="Previous"
              onClick={(e) => {
                e.stopPropagation();
                step(-1);
              }}
              className={`absolute left-2 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center border md:left-6 ${
                light ? "border-black/15 bg-white/70 text-black" : "border-white/15 bg-black/40 text-white hover:border-brand-gold"
              }`}
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              type="button"
              aria-label="Next"
              onClick={(e) => {
                e.stopPropagation();
                step(1);
              }}
              className={`absolute right-2 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center border md:right-6 ${
                light ? "border-black/15 bg-white/70 text-black" : "border-white/15 bg-black/40 text-white hover:border-brand-gold"
              }`}
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </>
        ) : null}
      </div>
    </div>
  );
}
