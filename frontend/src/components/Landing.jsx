import { useEffect, useState } from "react";
import CinematicScene from "./CinematicScene";

export default function Landing({ onGetStarted }) {
  const [showContent, setShowContent] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowContent(true);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen bg-[#05020b] text-violet-50 font-['Plus_Jakarta_Sans',sans-serif] relative overflow-hidden">

      {/* =========================================================
          CINEMATIC 3D BACKGROUND
      ========================================================== */}

      <div className="absolute inset-0 z-0">
        <CinematicScene />

        {/* Readability overlay */}
        <div className="absolute inset-0 bg-black/10 pointer-events-none" />

        {/* Bottom cinematic fade */}
        <div
          className="
            absolute
            inset-x-0
            bottom-0
            h-[45%]
            bg-gradient-to-t
            from-[#05020b]
            via-[#05020b]/40
            to-transparent
            pointer-events-none
          "
        />
      </div>

      {/* =========================================================
          LANDING CONTENT
      ========================================================== */}

      <div
        className="
          relative
          z-10
          min-h-screen
          flex
          items-end
          justify-center
          px-5
          sm:px-8
          pb-2
          sm:pb-14
          lg:pb-8
        "
      >
        <div className="w-full max-w-3xl text-center">

          {/* =================================================
              MAIN CTA
          ================================================== */}

          <div
            className={`
              mt-7
              pb-8
              flex
              flex-col
              sm:flex-row
              items-center
              justify-center
              gap-3

              transition-all
              duration-[1200ms]
              ease-[cubic-bezier(0.22,1,0.36,1)]

              ${
                showContent
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-12 pointer-events-none"
              }
            `}
          >
            <button
              onClick={onGetStarted}
              className="
                group
                relative
                inline-flex
                items-center
                justify-center
                gap-3
                min-w-[190px]
                px-7
                py-3.5
                rounded-xl

                bg-gradient-to-r
                from-purple-600
                via-violet-600
                to-fuchsia-600

                border
                border-purple-300/20

                text-white
                text-sm
                font-bold
                tracking-wide

                shadow-[0_0_35px_rgba(139,92,246,0.25)]

                hover:shadow-[0_0_45px_rgba(168,85,247,0.45)]
                hover:scale-[1.025]

                active:scale-[0.98]

                transition-all
                duration-300
              "
            >
              <span>Start Watching</span>

              <svg
                className="
                  w-4
                  h-4
                  text-purple-100
                  transition-transform
                  duration-300
                  group-hover:translate-x-1
                "
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M14 5l7 7m0 0l-7 7m7-7H3"
                />
              </svg>
            </button>
          </div>

          {/* =================================================
              FEATURE ROW
          ================================================== */}

          <div
            className={`
              mt-6
              flex
              flex-wrap
              justify-center
              items-center
              gap-x-5
              gap-y-2
              text-[10px]
              uppercase
              tracking-[0.18em]
              text-purple-200/35

              transition-all
              duration-[1200ms]
              delay-200
              ease-[cubic-bezier(0.22,1,0.36,1)]

              ${
                showContent
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-8 pointer-events-none"
              }
            `}
          >
            <span>Real-time sync</span>

            <span className="w-1 h-1 rounded-full bg-purple-500/40" />

            <span>Live chat</span>

            <span className="w-1 h-1 rounded-full bg-purple-500/40" />

            <span>Voice interaction</span>
          </div>

        </div>
      </div>
    </div>
  );
}