"use client";

import { useEffect, useRef } from "react";

export default function AvenueIntro() {
  const sectionRef = useRef<HTMLElement>(null);
  const avenueRef = useRef<HTMLDivElement>(null);
  const whiteTextRef = useRef<SVGTextElement>(null);
  const videoLayerRef = useRef<SVGForeignObjectElement>(null);
  const fullVideoRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    const avenue = avenueRef.current;
    const whiteText = whiteTextRef.current;
    const videoLayer = videoLayerRef.current;
    const fullVideo = fullVideoRef.current;

    if (!section || !avenue || !whiteText || !videoLayer || !fullVideo) {
      return;
    }

    const handleScroll = () => {
      const rect = section.getBoundingClientRect();

      const totalScroll = rect.height - window.innerHeight;

      const progress = Math.max(0, Math.min(1, -rect.top / totalScroll));

      /* ==========================================
         AVENUE ZOOM
         ========================================== */

      const zoomProgress = Math.min(progress / 0.78, 1);

      const scale = 1 + zoomProgress * 4.2;

      avenue.style.transform = `translate3d(-50%, -50%, 0) scale(${scale})`;

      /* ==========================================
         VIDEO ENTERS AVENUE
         ========================================== */

      const videoStart = 0.18;
      const videoEnd = 0.36;

      const videoProgress = Math.max(
        0,
        Math.min(1, (progress - videoStart) / (videoEnd - videoStart)),
      );

      videoLayer.style.opacity = String(videoProgress);

      /* ==========================================
         WHITE AVENUE FADES OUT
         ========================================== */

      const textStart = 0.18;
      const textEnd = 0.34;

      const textProgress = Math.max(
        0,
        Math.min(1, (progress - textStart) / (textEnd - textStart)),
      );

      whiteText.style.opacity = String(1 - textProgress);

      /* ==========================================
         FULL SCREEN VIDEO
         ========================================== */

      const fullStart = 0.72;
      const fullEnd = 0.9;

      const fullProgress = Math.max(
        0,
        Math.min(1, (progress - fullStart) / (fullEnd - fullStart)),
      );

      fullVideo.style.opacity = String(fullProgress);

      /* ==========================================
         VIDEO LETTERS FADE INTO FULL VIDEO
         ========================================== */

      if (progress >= fullStart) {
        const fade =
          1 - Math.min(1, (progress - fullStart) / (fullEnd - fullStart));

        videoLayer.style.opacity = String(fade);
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });

    handleScroll();

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <section ref={sectionRef} className="relative h-[300vh] bg-black">
      <div className="sticky top-0 h-screen w-full overflow-hidden bg-black">
        {/* ==========================================
            FULL SCREEN VIDEO
            ========================================== */}

        <div
          ref={fullVideoRef}
          className="absolute inset-0 z-10"
          style={{
            opacity: 0,
            pointerEvents: "none",
          }}
        >
          <video
            src="/avenue-intro.mp4.mp4"
            autoPlay
            muted
            loop
            playsInline
            className="h-full w-full object-cover"
          />
        </div>

        {/* ==========================================
            SINGLE AVENUE COMPOSITION
            ========================================== */}

        <div
          ref={avenueRef}
          className="absolute left-1/2 top-1/2"
          style={{
            width: "68vw",
            maxWidth: "1250px",
            aspectRatio: "1200 / 300",

            transform: "translate3d(-50%, -50%, 0) scale(1)",

            transformOrigin: "center center",

            willChange: "transform",
          }}
        >
          <svg
            viewBox="0 0 1200 300"
            width="100%"
            height="100%"
            preserveAspectRatio="none"
            className="absolute inset-0"
          >
            <defs>
              {/* ==================================
                  VIDEO MASK
                  ================================== */}

              <mask id="avenueVideoMask">
                {/* Everything hidden */}
                <rect x="0" y="0" width="1200" height="300" fill="black" />

                {/* Only AVENUE reveals video */}
                <text
                  x="600"
                  y="210"
                  textAnchor="middle"
                  fill="white"
                  fontFamily="Arial, Helvetica, sans-serif"
                  fontSize="210"
                  fontWeight="700"
                  letterSpacing="-8"
                >
                  AVENUE
                </text>
              </mask>
            </defs>

            {/* ==================================
                WHITE AVENUE
                ================================== */}

            <text
              ref={whiteTextRef}
              x="600"
              y="210"
              textAnchor="middle"
              fill="#ffffff"
              fontFamily="Arial, Helvetica, sans-serif"
              fontSize="210"
              fontWeight="700"
              letterSpacing="-8"
              opacity="1"
            >
              AVENUE
            </text>

            {/* ==================================
                VIDEO INSIDE SAME AVENUE
                ================================== */}

            <foreignObject
              ref={videoLayerRef}
              x="0"
              y="0"
              width="1200"
              height="300"
              mask="url(#avenueVideoMask)"
              style={{
                opacity: 0,
              }}
            >
              <div
                style={{
                  width: "100%",
                  height: "100%",
                }}
              >
                <video
                  src="/avenue-intro.mp4.mp4"
                  autoPlay
                  muted
                  loop
                  playsInline
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                  }}
                />
              </div>
            </foreignObject>
          </svg>
        </div>
      </div>
    </section>
  );
}
