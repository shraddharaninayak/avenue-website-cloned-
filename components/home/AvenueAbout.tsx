"use client";

import { useEffect, useRef, useState } from "react";

export default function AvenueAbout() {
  const sectionRef = useRef<HTMLElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const section = sectionRef.current;

    if (!section) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      {
        threshold: 0.15,
      },
    );

    observer.observe(section);

    return () => observer.disconnect();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative overflow-hidden bg-[#F1EADA] text-[#584738]"
    >
      <div className="mx-auto max-w-[1450px] px-6 py-20 md:px-10 md:py-28 lg:px-12 lg:py-32">
        {/* =========================================
            TOP LABEL
        ========================================= */}

        <div
          className={`mb-14 flex items-center gap-5 transition-all duration-1000 md:mb-20 ${
            visible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
          }`}
        >
          <span className="h-px w-12 bg-[#584738]/40" />

          <span className="text-[11px] font-medium uppercase tracking-[0.28em] text-[#584738]/50">
            About Avenue
          </span>
        </div>

        {/* =========================================
            MAIN HEADING
        ========================================= */}

        <div
          className={`max-w-[850px] transition-all delay-100 duration-1000 ${
            visible ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"
          }`}
        >
          <h2 className="font-serif text-[clamp(48px,7vw,96px)] font-light leading-[0.92] tracking-[-0.055em]">
            A developer
            <br />
            shaped by Nashik.
          </h2>
        </div>

        {/* =========================================
            MAIN CONTENT
        ========================================= */}

        <div className="mt-20 grid gap-16 lg:mt-24 lg:grid-cols-[0.95fr_1.05fr] lg:gap-20">
          {/* =======================================
              LEFT IMAGE AREA
          ======================================= */}

          <div
            className={`relative transition-all delay-200 duration-1200 ${
              visible ? "translate-y-0 opacity-100" : "translate-y-12 opacity-0"
            }`}
          >
            {/* MAIN IMAGE */}

            <div className="relative aspect-[0.88] w-full overflow-hidden">
              <img
                src="/avenue-about-main.jpg.webp"
                alt="Avenue development"
                className="h-full w-full object-cover"
              />
            </div>

            {/* SMALL OVERLAPPING IMAGE */}

            <div className="absolute -bottom-8 right-[-4%] w-[42%] border-[8px] border-[#F1EADA] bg-[#F1EADA] shadow-[0_20px_50px_rgba(0,0,0,0.12)] md:-bottom-10 md:right-[-5%]">
              <div className="aspect-[0.9] overflow-hidden">
                <img
                  src="/avenue-about-secondary.jpg.webp"
                  alt="Avenue property"
                  className="h-full w-full object-cover"
                />
              </div>
            </div>
          </div>

          {/* =======================================
              RIGHT CONTENT
          ======================================= */}

          <div className="flex flex-col justify-between lg:pt-2">
            {/* INTRO HEADING */}

            <div
              className={`transition-all delay-300 duration-1000 ${
                visible
                  ? "translate-y-0 opacity-100"
                  : "translate-y-10 opacity-0"
              }`}
            >
              <h3 className="max-w-[650px] font-serif text-[clamp(30px,3.2vw,50px)] font-light leading-[1.08] tracking-[-0.035em]">
                Excellence in property
                <br />
                development and investment
                <br />
                across Nashik since 2007.
              </h3>
            </div>

            {/* DESCRIPTION */}

            <div
              className={`mt-12 transition-all delay-400 duration-1000 ${
                visible
                  ? "translate-y-0 opacity-100"
                  : "translate-y-10 opacity-0"
              }`}
            >
              <p className="max-w-[720px] text-[16px] leading-[1.8] text-[#AAA396] md:text-[18px]">
                The Avenue Builders & Developers is a Nashik-based real estate
                development company established in 2007. Since then, we have
                delivered residential, commercial and industrial projects across
                Nashik, including more than 1 million sq. ft. of developed
                space. At The Avenue, we understand the evolving needs of our
                clients. Our dedicated team stays informed about the latest
                trends and products in the international market, allowing us to
                meet the high demands of the local market with innovative
                solutions. With 50+ years of combined leadership experience,
                our principals and executive team bring a wealth of expertise
                to every development.
              </p>
            </div>

            {/* =====================================
                INFORMATION GRID
            ===================================== */}

            <div
              className={`mt-14 border-t border-[#584738]/15 pt-10 transition-all delay-500 duration-1000 ${
                visible
                  ? "translate-y-0 opacity-100"
                  : "translate-y-10 opacity-0"
              }`}
            >
              <div className="grid grid-cols-2 gap-x-8 gap-y-10 md:grid-cols-4">
                {/* ESTABLISHED */}

                <div>
                  <span className="text-[10px] uppercase tracking-[0.22em] text-[#AAA396]">
                    Established
                  </span>

                  <p className="mt-4 font-serif text-[34px] font-light tracking-[-0.03em]">
                    2007
                  </p>
                </div>

                {/* BASED IN */}

                <div>
                  <span className="text-[10px] uppercase tracking-[0.22em] text-[#AAA396]">
                    Based in
                  </span>

                  <p className="mt-4 font-serif text-[34px] font-light tracking-[-0.03em]">
                    Nashik
                  </p>
                </div>

                {/* DISCIPLINE */}

                <div>
                  <span className="text-[10px] uppercase tracking-[0.22em] text-[#AAA396]">
                    Discipline
                  </span>

                  <p className="mt-4 max-w-[150px] text-[15px] leading-[1.55] text-[#584738]">
                    Real estate
                    <br />
                    development
                  </p>
                </div>

                {/* PORTFOLIO */}

                <div>
                  <span className="text-[10px] uppercase tracking-[0.22em] text-[#AAA396]">
                    Portfolio
                  </span>

                  <p className="mt-4 max-w-[160px] text-[15px] leading-[1.55] text-[#584738]">
                    Residential ·
                    <br />
                    Commercial ·
                    <br />
                    Industrial
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* =========================================
            BOTTOM LINE
        ========================================= */}

        <div className="mt-24 border-t border-[#584738]/15 pt-6 md:mt-32">
          <div className="flex items-center justify-between text-[10px] uppercase tracking-[0.24em] text-[#AAA396]">
            <span>The Avenue Portfolio</span>

            <span>Nashik</span>
          </div>
        </div>
      </div>
    </section>
  );
}
