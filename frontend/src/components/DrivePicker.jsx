import { useEffect, useState } from 'react';

const API_KEY = import.meta.env.VITE_GOOGLE_API_KEY;
const APP_ID = import.meta.env.VITE_GOOGLE_APP_ID; // Google Cloud project number

export default function DrivePicker({ accessToken, onPick }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [pickerReady, setPickerReady] = useState(false);

  // Safely load the gapi picker library inside useEffect
  useEffect(() => {
    const loadGapi = () => {
      if (window.gapi) {
        window.gapi.load('picker', {
          callback: () => setPickerReady(true),
          onerror: () => setError('Failed to load Google Picker library.'),
        });
      }
    };

    // If gapi script isn't on window yet, attach it dynamically
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

    // Using DOCS view with explicit video MIME types ensures newly uploaded, 
    // unprocessed videos are not hidden by Google's automatic filters.
    const view = new window.google.picker.DocsView(window.google.picker.ViewId.DOCS)
      .setMimeTypes('video/mp4,video/webm,video/x-matroska,video/quicktime,video/avi')
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
    <div>
      <button
        onClick={openPicker}
        disabled={loading}
        className="bg-panel2 border border-marquee/40 text-marquee font-display tracking-wide px-4 py-2 rounded-sm hover:bg-marquee hover:text-void transition text-sm disabled:opacity-50"
      >
        {loading ? 'Opening Drive…' : 'Pick a video from Drive'}
      </button>
      {error && <p className="text-ember text-xs mt-2">{error}</p>}
    </div>
  );
}