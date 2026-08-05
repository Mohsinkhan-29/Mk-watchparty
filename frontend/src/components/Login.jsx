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
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="max-w-sm w-full text-center">
        <p className="font-display text-marquee tracking-[0.4em] text-xs mb-2">
          MK watchparty webapp
        </p>
        <h1 className="font-display text-4xl font-semibold mb-3">
          Watch Drive videos, together.
        </h1>
        <p className="text-muted mb-8">
          Sign in with Google, pick a video from your Drive, and share the room
          code — everyone's playback and chat stay in sync.
        </p>
        <button
          onClick={handleSignIn}
          disabled={!ready}
          className="w-full bg-marquee text-void font-display font-semibold tracking-wide py-3 rounded-sm hover:brightness-110 disabled:opacity-50 transition"
        >
          {ready ? 'Continue with Google' : 'Loading Google Sign-In…'}
        </button>
        {error && <p className="text-ember text-sm mt-4">{error}</p>}
      </div>
    </div>
  );
}