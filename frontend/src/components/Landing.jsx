import { useState } from "react";

export default function Landing({ onGetStarted }) {
  const [videoFinished, setVideoFinished] = useState(false);

  return (
    <div className="min-h-screen bg-[#05020b] text-violet-50 font-['Plus_Jakarta_Sans',sans-serif] relative overflow-hidden">

      {/* =========================================================
          BACKGROUND VIDEO
      ========================================================== */}
      <div className="absolute inset-0 z-0">

        <video
          className="absolute inset-0 w-full h-full object-cover"
          src="/background.mp4"
          autoPlay
          muted
          playsInline
          onEnded={() => setVideoFinished(true)}
        />

        {/* Very subtle readability overlay.
            NO blur is applied to the video. */}
        <div className="absolute inset-0 bg-black/10 pointer-events-none" />

        {/* Bottom cinematic fade */}
        <div
          // className={`
          //   absolute inset-x-0 bottom-0 h-[55%]
          //   bg-gradient-to-t from-[#05020b] via-[#05020b]/50 to-transparent
          //   pointer-events-none
          //   transition-opacity duration-1000
          //   ${videoFinished ? "opacity-100" : "opacity-0"}
          // `}
        />

      </div>


      {/* =========================================================
          LANDING CONTENT
      ========================================================== */}
      <div
        className={`
          relative z-10
          min-h-screen
          flex items-end justify-center
          px-5 sm:px-8
          pb-2 sm:pb-14 lg:pb-8
          transition-all
          duration-[1400ms]
          ease-[cubic-bezier(0.22,1,0.36,1)]
          ${videoFinished
            ? "opacity-100 translate-y-0"
            : "opacity-0 translate-y-10 pointer-events-none"
          }
        `}
      >

        {/* =====================================================
            HERO CONTENT
        ====================================================== */}
        <div className="w-full max-w-3xl text-center">


          {/* Main heading */}

          {/* <h1
            className="
              text-3xl
              sm:text-4xl
              lg:text-5xl
              font-extrabold
              tracking-tight
              leading-[1.05]
              text-white
            "
          >Stream<span
              className="
                bg-gradient-to-r
                from-purple-400
                via-fuchsia-300
                to-violet-300
                bg-clip-text
                text-transparent
              "
            >lo
            </span>
          </h1>


          <h1
            className="
              text-3xl
              sm:text-4xl
              lg:text-5xl
              font-extrabold
              tracking-tight
              leading-[1.05]
              text-white
            "
          >
            Watch together.
            <span
              className="
                ml-2
                bg-gradient-to-r
                from-purple-400
                via-fuchsia-300
                to-violet-300
                bg-clip-text
                text-transparent
              "
            >
              Anywhere.
            </span>
          </h1> */}


          {/* Description */}
          {/* <p
            className="
              max-w-xl
              mx-auto
              mt-4
              text-sm
              sm:text-base
              leading-relaxed
              text-purple-100/65
            "
          >
            Turn your Google Drive videos into a shared cinema.
            Sync playback in real time, talk with friends, and chat
            while you watch.
          </p> */}


          {/* =================================================
              ACTION AREA
          ================================================== */}
          <div
            className="
              mt-7
              pb-8
              flex
              flex-col
              sm:flex-row
              items-center
              justify-center
              gap-3
            "
          >

            {/* Main CTA */}
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


          {/* Tiny feature row */}
          <div
            className="
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
            "
          >
            <span>Real-time sync</span>

            <span className="w-1 h-1 rounded-full bg-purple-500/40" />

            <span>Live chat</span>

            <span className="w-1 h-1 rounded-full bg-purple-500/40" />

            <span>Voice interaction</span>
          </div>

        </div>
      </div>


      {/* =========================================================
          TOP BRAND MARK
          Appears only after video ends.
      ========================================================== */}
      {/* <div
        className={`
          absolute
          top-6
          left-6
          sm:top-8
          sm:left-8
          z-20

          transition-all
          duration-1000
          ${videoFinished
            ? "opacity-100 translate-y-0"
            : "opacity-0 -translate-y-3"
          }
        `}
      >
        <div className="flex items-center gap-2">

          <div
            className="
              w-7
              h-7
              rounded-lg
              flex
              items-center
              justify-center
            "
          >
            <img
              src="../../public/minilogo.png"
              alt="Logo"
            />
          </div>

          <span
            className="
              text-sm
              font-bold
              tracking-tight
              text-white
            "
          >
            Stream
            <span className="text-purple-400">lo</span>
          </span>

        </div>
      </div> */}

    </div >
  );
}