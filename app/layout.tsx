import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import CookieBanner from "@/components/ui/CookieBanner";

const grotesk = localFont({
  src: "../public/fonts/91601dd83defba07-s.p.woff2",
  variable: "--font-grotesk",
  display: "swap",
});

const hanken = localFont({
  src: "../public/fonts/313510e2713fb214-s.p.woff2",
  variable: "--font-hanken",
  display: "swap",
});

export const metadata: Metadata = {
  title: " The Avenue Builders And Developers",
  description:
    "Leading real estate developers in Central India with a 15 year legacy of creating premium residential, commercial spaces and innovative townships in Nagpur.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${grotesk.variable} ${hanken.variable} antialiased`}>
      <body className="bg-black text-white selection:bg-brand-gold selection:text-black">
        <Navbar />
        <main>{children}</main>
        <Footer />
        <CookieBanner />
      </body>
    </html>
  );
}
