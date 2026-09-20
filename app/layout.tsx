import type { Metadata } from "next";
import Script from "next/script";
import localFont from "next/font/local";
import "./globals.css";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import CookieBanner from "@/components/ui/CookieBanner";
import IntroLoader from "@/components/IntroLoader";

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
    "Leading real estate developers in Central India with a 15 year legacy of creating premium residential, commercial spaces and innovative townships in Nashik.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${grotesk.variable} ${hanken.variable} antialiased`}
    >
      <body className="bg-black text-white selection:bg-brand-gold selection:text-black">
        {/* Google Tag Manager */}
        <Script id="google-tag-manager" strategy="beforeInteractive">
          {`
            (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
            new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
            j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
            'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
            })(window,document,'script','dataLayer','GTM-T8V7BRWX');
          `}
        </Script>

        {/* Google Tag Manager (noscript) */}
        <noscript>
          <iframe
            src="https://www.googletagmanager.com/ns.html?id=GTM-T8V7BRWX"
            height="0"
            width="0"
            style={{ display: "none", visibility: "hidden" }}
          />
        </noscript>
        {/* End Google Tag Manager (noscript) */}

        {/* First in the body, so it is painted before the page beneath it. */}
        <IntroLoader />
        <Navbar />
        <main>{children}</main>
        <Footer />
        <CookieBanner />
      </body>
    </html>
  );
}
