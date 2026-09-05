"use client";

import { useEffect, useRef } from "react";

const developments = [
  {
    name: "Urbania",
    image: "/urbania.jpg",
  },
  {
    name: "Flora",
    image: "/flora.jpg",
  },
  {
    name: "Aura",
    image: "/aura.jpg",
  },
  {
    name: "Bliss",
    image: "/bliss.jpg",
  },
];

export default function AvenuePillars() {
  const sectionRef = useRef<HTMLElement>(null);
  const singleRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    const single = singleRef.current;
    const cards = cardsRef.current;

    if (!section || !single || !cards) return;

    const handleScroll = () => {
      const rect = section.getBoundingClientRect();

      const totalScroll =
        rect.height - window.innerHeight;

      if (totalScroll <= 0) return;

      const progress = Math.max(
        0,
        Math.min(
          1,
          -rect.top / totalScroll
        )
      );

      /* ==========================================
         1. SINGLE IMAGE
         ========================================== */

      const splitStart = 0.18;
      const splitEnd = 0.48;

      const splitProgress = Math.max(
        0,
        Math.min(
          1,
          (progress - splitStart) /
            (splitEnd - splitStart)
        )
      );

      single.style.opacity =
        String(1 - splitProgress);


      /* ==========================================
         2. FOUR PROJECT CARDS
         ========================================== */

      cards.style.opacity =
        String(splitProgress);

      const cardsScale =
        0.72 +
        splitProgress * 0.28;

      cards.style.transform =
        `translate(-50%, -50%) scale(${cardsScale})`;


      /* ==========================================
         3. SPREAD FOUR CARDS
         ========================================== */

      const cardElements =
        cards.querySelectorAll<HTMLElement>(
          ".avenue-project-card"
        );

      const positions = [
        -1.5,
        -0.5,
        0.5,
        1.5,
      ];

      cardElements.forEach(
        (card, index) => {
          const x =
            positions[index] *
            170 *
            splitProgress;

          card.style.transform =
            `translateX(${x}px)`;
        }
      );


      /* ==========================================
         4. TEXT REVEAL
         ========================================== */

      const textStart = 0.42;
      const textEnd = 0.70;

      const textProgress = Math.max(
        0,
        Math.min(
          1,
          (progress - textStart) /
            (textEnd - textStart)
        )
      );

      cardElements.forEach(
        (card) => {
          const content =
            card.querySelector<HTMLElement>(
              ".avenue-project-content"
            );

          if (!content) return;

          content.style.opacity =
            String(textProgress);

          content.style.transform =
            `translateY(${30 - textProgress * 30}px)`;
        }
      );
    };

    window.addEventListener(
      "scroll",
      handleScroll,
      { passive: true }
    );

    handleScroll();

    return () => {
      window.removeEventListener(
        "scroll",
        handleScroll
      );
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative h-[300vh] overflow-hidden bg-[#f3f0eb]"
    >

      <div className="sticky top-0 h-screen w-full overflow-hidden">

        {/* ========================================
            SECTION TITLE
        ======================================== */}

        <div className="absolute left-0 right-0 top-10 z-30 px-6 md:px-10">

          <div className="mx-auto flex max-w-[1450px] items-center gap-4">

            <span className="h-px w-10 bg-black/40" />

            <span className="text-[10px] uppercase tracking-[0.28em] text-black/50">
              Places We've Shaped
            </span>

          </div>

        </div>


        {/* ========================================
            LARGE IMAGE
        ======================================== */}

        <div
          ref={singleRef}
          className="absolute left-1/2 top-1/2 z-10 w-[68vw] max-w-[1050px] -translate-x-1/2 -translate-y-1/2"
        >

          <div className="aspect-[16/8] overflow-hidden">

            <img
              src="/urbania.jpg"
              alt="Urbania"
              className="h-full w-full object-cover"
            />

          </div>

        </div>


        {/* ========================================
            FOUR PROJECT CARDS
        ======================================== */}

        <div
          ref={cardsRef}
          className="absolute left-1/2 top-1/2 z-20 flex -translate-x-1/2 -translate-y-1/2 items-center justify-center gap-4"
          style={{
            opacity: 0,
            transform:
              "translate(-50%, -50%) scale(0.72)",
          }}
        >

          {developments.map(
            (development) => (
              <div
                key={development.name}
                className="avenue-project-card relative w-[19vw] max-w-[290px]"
                style={{
                  transform:
                    "translateX(0px)",
                }}
              >

                {/* IMAGE */}

                <div className="relative aspect-[0.68] overflow-hidden bg-black">

                  <img
                    src={development.image}
                    alt={development.name}
                    className="h-full w-full object-cover"
                  />

                  {/* OVERLAY */}

                  <div className="absolute inset-0 bg-black/15" />


                  {/* TEXT */}

                  <div
                    className="avenue-project-content absolute inset-x-0 bottom-0 p-6 text-white"
                    style={{
                      opacity: 0,
                      transform:
                        "translateY(30px)",
                    }}
                  >

                    <span className="text-[9px] uppercase tracking-[0.22em] text-white/70">
                      Avenue Development
                    </span>

                    <h3 className="mt-2 font-serif text-[28px] font-light">
                      {development.name}
                    </h3>

                  </div>

                </div>

              </div>
            )
          )}

        </div>


        {/* ========================================
            BOTTOM LABEL
        ======================================== */}

        <div className="absolute bottom-8 left-0 right-0 z-30 px-6 md:px-10">

          <div className="mx-auto flex max-w-[1450px] items-center justify-between border-t border-black/15 pt-5">

            <span className="text-[10px] uppercase tracking-[0.22em] text-black/45">
              The Avenue
            </span>

            <span className="text-[10px] uppercase tracking-[0.22em] text-black/45">
              Nashik
            </span>

          </div>

        </div>

      </div>

    </section>
  );
}