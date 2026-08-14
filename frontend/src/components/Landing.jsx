export default function Landing({ onGetStarted }) {
  return (
    <div className="min-h-screen bg-[#070312] text-violet-50 font-['Plus_Jakarta_Sans',sans-serif] flex flex-col items-center justify-center px-4 relative overflow-hidden">
      {/* Background Ambient Glows */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-purple-600/25 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-fuchsia-600/20 rounded-full blur-[120px] pointer-events-none" />

      {/* Hero Glassmorphic Container */}
      <div className="max-w-2xl w-full bg-[#110726]/70 backdrop-blur-2xl border border-purple-500/20 rounded-3xl p-8 sm:p-12 shadow-2xl shadow-purple-950/80 text-center relative z-10">
        
        {/* Header Pill */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 mb-8">
          <span className="w-1.5 h-1.5 rounded-full bg-fuchsia-400 animate-pulse" />
          <p className="font-semibold text-fuchsia-300 tracking-[0.3em] text-[10px] uppercase">
            MK Watchparty Platform
          </p>
        </div>

        {/* Title */}
        <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-white mb-6 leading-tight">
          Synchronized streaming, <br />
          <span className="bg-gradient-to-r from-purple-400 via-fuchsia-300 to-indigo-300 bg-clip-text text-transparent">
            right from your Drive.
          </span>
        </h1>

        {/* Subtext */}
        <p className="text-purple-200/60 text-base leading-relaxed mb-10 max-w-lg mx-auto">
          Watch movies and videos together with real-time video playback sync, voice interaction, and shared live chat.
        </p>

        {/* CTA Button */}
        <button
          onClick={onGetStarted}
          className="relative inline-flex items-center justify-center gap-3 bg-gradient-to-r from-purple-600 via-purple-500 to-fuchsia-600 text-white font-bold text-sm tracking-wide py-4 px-10 rounded-2xl shadow-xl shadow-purple-600/30 hover:shadow-purple-500/50 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
        >
          <span>Get Started Now</span>
          <svg className="w-4 h-4 text-fuchsia-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
          </svg>
        </button>
      </div>
    </div>
  );
}