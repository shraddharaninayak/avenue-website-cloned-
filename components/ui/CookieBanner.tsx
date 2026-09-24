"use client";

import React, { useState, useEffect } from "react";

export default function CookieBanner() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const accepted = localStorage.getItem("cookie_consent");
    if (!accepted) {
      const timer = setTimeout(() => setShow(true), 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  const accept = () => {
    localStorage.setItem("cookie_consent", "accepted");
    setShow(false);
  };

  if (!show) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-[#2D3A1F]/95 backdrop-blur-md border-t border-white/10 px-6 py-4 md:py-5 shadow-2xl animate-in slide-in-from-bottom duration-300">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        <p className="font-hanken text-xs md:text-sm text-white/70 text-center md:text-left leading-relaxed">
          We use cookies to improve your browsing experience and analyze site traffic. By continuing, you agree to our privacy policy.
        </p>
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={accept}
            className="px-5 py-2 border border-white/20 text-white font-grotesk text-[11px] uppercase tracking-[0.15em] hover:bg-white/5 transition-colors"
          >
            Necessary Only
          </button>
          <button
            onClick={accept}
            className="px-6 py-2 bg-[#2D3A1F] text-white font-grotesk text-[11px] uppercase tracking-[0.15em] font-semibold hover:bg-brand-bronze transition-colors"
          >
            Accept All
          </button>
        </div>
      </div>
    </div>
  );
}
