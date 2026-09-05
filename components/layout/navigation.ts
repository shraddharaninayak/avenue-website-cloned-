export type NavLink = {
  label: string;
  href: string;
};

/** Inline links shown on the right of the desktop header. */
export const headerLinks: NavLink[] = [
  { label: "Projects", href: "/#projects" },
  { label: "About", href: "/our-story" },
  { label: "Leadership", href: "/#leadership" },
  { label: "Contact", href: "/contact" },
];

/**
 * Rows of the full-screen overlay menu, numbered 01..06 in this order.
 * Every href points at a route or section that already exists — there is no
 * dedicated "completed projects" page yet, so that row goes to West 19, the
 * delivered landmark closest in meaning.
 */
export const overlayLinks: NavLink[] = [
  { label: "Home", href: "/" },
  { label: "About Us", href: "/our-story" },
  { label: "Projects", href: "/#projects" },
  { label: "Completed Project", href: "/west-19" },
  { label: "Career", href: "/careers" },
  { label: "Contact Us", href: "/contact" },
];

export const enquireHref = "/contact";

/** Header bar metrics. */
export const barLayout =
  "flex h-[72px] items-center justify-between px-6 md:px-10 lg:h-[88px] lg:px-14";
