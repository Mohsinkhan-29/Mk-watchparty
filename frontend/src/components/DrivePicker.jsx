import { useEffect, useState } from 'react';

const API_KEY = import.meta.env.VITE_GOOGLE_API_KEY;
const APP_ID = import.meta.env.VITE_GOOGLE_APP_ID;

export default function DrivePicker({ accessToken, onPick }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [pickerReady, setPickerReady] = useState(false);

  useEffect(() => {
    const loadGapi = () => {
      if (window.gapi) {
        window.gapi.load('picker', {
          callback: () => setPickerReady(true),
          onerror: () => setError('Failed to load Google Picker library.'),
        });
      }
    };

    if (!window.gapi) {
      const script = document.createElement('script');
      script.src = 'https://apis.google.com/js/api.js';
      script.onload = loadGapi;
      script.onerror = () => setError('Failed to load Google API script.');
      document.body.appendChild(script);
    } else {
      loadGapi();
    }
  }, []);

  const openPicker = () => {
    setError('');

    if (!window.google?.picker || !pickerReady) {
      setError('Picker API not loaded yet — try again in a moment.');
      return;
    }
    if (!API_KEY) {
      setError('Missing VITE_GOOGLE_API_KEY — see README for setup.');
      return;
    }

    setLoading(true);

    // Filter strictly to videos owned by the current user
    const view = new window.google.picker.DocsView(window.google.picker.ViewId.DOCS_VIDEOS)
      .setOwnedByMe(true)
      .setIncludeFolders(true)
      .setSelectFolderEnabled(false);

    const picker = new window.google.picker.PickerBuilder()
      .addView(view)
      .setOAuthToken(accessToken)
      .setDeveloperKey(API_KEY)
      .setAppId(APP_ID || '')
      .setCallback((data) => {
        if (data.action === window.google.picker.Action.PICKED) {
          const file = data.docs[0];
          onPick({ fileId: file.id, fileName: file.name });
        }
        if (
          data.action === window.google.picker.Action.CANCEL ||
          data.action === window.google.picker.Action.PICKED
        ) {
          setLoading(false);
        }
      })
      .build();

    picker.setVisible(true);
  };

  return (
    <div className="font-['Plus_Jakarta_Sans',sans-serif]">
      <button
        onClick={openPicker}
        disabled={loading}
        className="relative group overflow-hidden bg-gradient-to-r from-purple-600 via-purple-500 to-fuchsia-600 text-white font-semibold text-xs tracking-wide px-4 py-2.5 rounded-xl shadow-md shadow-purple-950/50 border border-purple-400/30 hover:border-purple-300 hover:shadow-purple-600/40 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 disabled:opacity-50 disabled:hover:scale-100"
      >
        <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out" />
        <span className="relative z-10 flex items-center justify-center gap-2">
          {loading ? (
            <>
              <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Opening Drive…
            </>
          ) : (
            <>
              <svg className="w-4 h-4 fill-current text-fuchsia-200" viewBox="0 0 24 24">
                <path d="M19.35 10.04C18.67 6.59 15.64 4 12 4 9.11 4 6.6 5.64 5.35 8.04 2.34 8.36 0 10.91 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96zM19 18H6c-2.21 0-4-1.79-4-4 0-2.05 1.53-3.76 3.56-3.97l1.07-.11.5-.95C8.08 7.14 9.94 6 12 6c2.62 0 4.88 1.86 5.39 4.43l.3 1.5 1.53.11c1.56.1 2.78 1.41 2.78 2.96 0 1.65-1.35 3-3 3z" />
              </svg>
              Pick a video from Drive
            </>
          )}
        </span>
      </button>

      {error && (
        <div className="mt-2 p-2 bg-rose-500/10 border border-rose-500/30 rounded-lg">
          <p className="text-rose-300 text-xs font-medium">{error}</p>
        </div>
      )}
    </div>
  );
}