import type { Config } from "tailwindcss";

const SYSTEM_FONTS = [
  "-apple-system",
  "BlinkMacSystemFont",
  '"Segoe UI"',
  "Roboto",
  "Oxygen-Sans",
  "Ubuntu",
  "Cantarell",
  '"Helvetica Neue"',
  "sans-serif",
];

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#F4F1E8",
        foreground: "#2D3A1F",
        brand: {
          gold:    "#B8A678",
          bronze:  "#B8A678",
          dark:    "#2D3A1F",
          surface: "#E8E2D0",
          card:    "#FFFFFF",
          muted:   "#5F684F",
          light:   "#F4F1E8",
          border:  "#D5CFBC",
        },
      },
      fontFamily: {
        serif:     SYSTEM_FONTS,
        sans:      SYSTEM_FONTS,
        grotesk:   SYSTEM_FONTS,
        cormorant: SYSTEM_FONTS,
        hanken:    SYSTEM_FONTS,
      },
      keyframes: {
        // The track holds the cards twice. Travelling from -50% to 0 moves the
        // cards LEFT to RIGHT, and because -50% is exactly one copy width it
        // lands on an identical frame, so the loop has no seam.
        "avenue-marquee": {
          from: { transform: "translate3d(-50%, 0, 0)" },
          to: { transform: "translate3d(0, 0, 0)" },
        },
      },
      animation: {
        "avenue-marquee":
          "avenue-marquee var(--marquee-duration, 48s) linear infinite",
      },
    },
  },
  plugins: [],
};

export default config;
