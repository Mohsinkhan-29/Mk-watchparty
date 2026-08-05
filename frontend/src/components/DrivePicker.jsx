import { useState } from 'react';

const API_KEY = import.meta.env.VITE_GOOGLE_API_KEY;
const APP_ID = import.meta.env.VITE_GOOGLE_APP_ID; // Google Cloud project number

export default function DrivePicker({ accessToken, onPick }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');


  window.gapi.load("picker", () => {
    console.log("Picker loaded");
  });
  const openPicker = () => {
    if (!window.google?.picker) {
      setError('Picker API not loaded yet — try again in a moment.');
      return;
    }
    if (!API_KEY) {
      setError('Missing VITE_GOOGLE_API_KEY — see README for setup.');
      return;
    }
    setLoading(true);

    const view = new window.google.picker.DocsView(window.google.picker.ViewId.DOCS_VIDEOS)
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
        if (data.action === window.google.picker.Action.CANCEL || data.action === window.google.picker.Action.PICKED) {
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
        className="bg-panel2 border border-marquee/40 text-marquee font-display tracking-wide px-4 py-2 rounded-sm hover:bg-marquee hover:text-void transition text-sm"
      >
        {loading ? 'Opening Drive…' : 'Pick a video from Drive'}
      </button>
      {error && <p className="text-ember text-xs mt-2">{error}</p>}
    </div>
  );
}
