import { useEffect, useState } from 'react';

const CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;
const SCOPES = 'https://www.googleapis.com/auth/drive.readonly https://www.googleapis.com/auth/drive.file';

export default function Login({ onAuth }) {
  const [ready, setReady] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const check = setInterval(() => {
      if (window.google?.accounts?.oauth2) {
        setReady(true);
        clearInterval(check);
      }
    }, 150);
    return () => clearInterval(check);
  }, []);

  const handleSignIn = () => {
    if (!CLIENT_ID) {
      setError('Missing VITE_GOOGLE_CLIENT_ID — see README for setup.');
      return;
    }

    const tokenClient = window.google.accounts.oauth2.initTokenClient({
      client_id: CLIENT_ID,
      scope: SCOPES, // Fixed variable name (SCOPES instead of SCOPE)
      prompt: 'consent', // Forces Google to fetch up-to-date scopes and permissions
      callback: (resp) => {
        if (resp.error) {
          setError(resp.error);
          return;
        }
        onAuth({ accessToken: resp.access_token });
      },
    });

    tokenClient.requestAccessToken();
  };

  return (
    <div className="min-h-screen bg-[#070312] text-violet-50 font-['Plus_Jakarta_Sans',sans-serif] flex items-center justify-center px-4 relative overflow-hidden">
      {/* Background Ambient Glows */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-purple-600/25 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-fuchsia-600/20 rounded-full blur-[120px] pointer-events-none" />

      {/* Main Glassmorphic Card */}
      <div className="max-w-md w-full bg-[#110726]/70 backdrop-blur-2xl border border-purple-500/20 rounded-2xl p-8 sm:p-10 shadow-2xl shadow-purple-950/80 text-center relative z-10">
        
        {/* Header Pill */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 mb-6">
          <span className="w-1.5 h-1.5 rounded-full bg-fuchsia-400 animate-pulse" />
          <p className="font-semibold text-fuchsia-300 tracking-[0.3em] text-[10px] uppercase">
            MK watchparty webapp
          </p>
        </div>

        {/* Title with Violet Gradient Accent */}
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white mb-3">
          Watch Drive videos, <span className="bg-gradient-to-r from-purple-400 via-fuchsia-300 to-indigo-300 bg-clip-text text-transparent">together.</span>
        </h1>

        {/* Subtext */}
        <p className="text-purple-200/60 text-sm leading-relaxed mb-8">
          Sign in with Google, pick a video from your Drive, and share the room
          code — everyone's playback and chat stay in sync.
        </p>

        {/* Action Button */}
        <button
          onClick={handleSignIn}
          disabled={!ready}
          className="w-full relative group overflow-hidden bg-gradient-to-r from-purple-600 via-purple-500 to-fuchsia-600 text-white font-semibold text-sm tracking-wide py-3.5 px-6 rounded-xl shadow-lg shadow-purple-600/30 hover:shadow-purple-500/50 hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 disabled:hover:scale-100 transition-all duration-200"
        >
          <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out" />
          <span className="relative z-10 flex items-center justify-center gap-2">
            {ready ? (
              <>
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M12.545,10.239v3.821h5.445c-0.712,2.315-2.647,3.972-5.445,3.972c-3.332,0-6.033-2.701-6.033-6.032s2.701-6.032,6.033-6.032c1.498,0,2.866,0.549,3.921,1.453l2.814-2.814C17.503,2.988,15.139,2,12.545,2C7.021,2,2.545,6.477,2.545,12s4.476,10,10,10c5.768,0,9.602-4.053,9.602-9.771c0-0.686-0.063-1.353-0.18-1.99H12.545z"/>
                </svg>
                Continue with Google
              </>
            ) : (
              'Loading Google Sign-In…'
            )}
          </span>
        </button>

        {/* Error State */}
        {error && (
          <div className="mt-4 p-3 bg-red-500/10 border border-red-500/30 rounded-xl">
            <p className="text-red-300 text-xs font-medium">{error}</p>
          </div>
        )}
      </div>
    </div>
  );
}