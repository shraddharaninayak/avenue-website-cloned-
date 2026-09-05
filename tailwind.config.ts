import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#0c0a09",
        foreground: "#ededed",
        brand: {
          gold: "#e0a456",
          bronze: "#b06a35",
          dark: "#14110c",
          surface: "#17140f",
          card: "#1f1a14",
          muted: "#57534d",
          light: "#f5f4f2",
        },
      },
      fontFamily: {
        grotesk: ["var(--font-grotesk)", "Schibsted Grotesk", "sans-serif"],
        hanken: ["var(--font-hanken)", "Hanken Grotesk", "sans-serif"],
        cormorant: ["var(--font-cormorant)", "Cormorant Garamond", "serif"],
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
