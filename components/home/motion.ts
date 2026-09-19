"use client";

import { useEffect, useRef, useState, type RefObject } from "react";

/**
 * Shared scroll helpers for the homepage sections.
 *
 * Same approach as the rest of the site's sections — an IntersectionObserver
 * for one-off reveals, and a scroll listener feeding a critically damped
 * follow for anything tied to scroll position — so there is no animation
 * library, and everything reverses when the visitor scrolls back up.
 */

export const clamp01 = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v);
export const span = (a: number, b: number, p: number) => clamp01((p - a) / (b - a));
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
export const smoothstep = (a: number, b: number, p: number) => {
  const t = span(a, b, p);
  return t * t * (3 - 2 * t);
};
export const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);

export const prefersReducedMotion = () =>
  typeof window !== "undefined" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/** True once the element has come into view; stays true. */
export function useReveal<T extends Element>(threshold = 0.2, rootMargin = "0px 0px -8% 0px") {
  const ref = useRef<T>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          io.disconnect();
        }
      },
      { threshold, rootMargin },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [threshold, rootMargin]);

  return [ref, visible] as const;
}

/**
 * Calls `apply` with the element's progress through the viewport: 0 as its
 * top enters at the bottom of the screen, 1 as its bottom leaves at the top.
 * Eased toward the scroll position, so wheel steps glide.
 */
export function useViewportProgress(
  ref: RefObject<Element>,
  apply: (p: number) => void,
  follow = 0.14,
) {
  const applyRef = useRef(apply);
  applyRef.current = apply;

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const reduce = prefersReducedMotion();
    let target = 0;
    let current = -1;
    let raf: number | null = null;

    const read = () => {
      const r = el.getBoundingClientRect();
      const vh = window.innerHeight;
      target = clamp01((vh - r.top) / (vh + r.height));
    };
    const tick = () => {
      raf = null;
      const diff = target - current;
      current = reduce || current < 0 || Math.abs(diff) < 0.0005 ? target : current + diff * follow;
      applyRef.current(current);
      if (current !== target) raf = requestAnimationFrame(tick);
    };
    const onScroll = () => {
      read();
      if (raf === null) raf = requestAnimationFrame(tick);
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (raf !== null) cancelAnimationFrame(raf);
    };
  }, [ref, follow]);
}

/**
 * Class list for a one-off rise-and-fade reveal. The hidden state applies
 * only when motion is allowed, so reduced-motion visitors see content as is.
 */
export const revealClass = (visible: boolean, delay = "") =>
  `transition-[opacity,transform] duration-[1100ms] ease-[cubic-bezier(0.22,1,0.36,1)] ${delay} motion-reduce:transition-none ${
    visible ? "opacity-100 translate-y-0" : "motion-safe:opacity-0 motion-safe:translate-y-8"
  }`;
