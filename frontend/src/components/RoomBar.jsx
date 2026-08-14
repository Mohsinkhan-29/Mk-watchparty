import React, { useCallback } from 'react';
import useDrivePicker from 'react-google-drive-picker';

const CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';
const DEVELOPER_KEY = import.meta.env.VITE_GOOGLE_API_KEY || '';

export default function RoomBar({
  roomId,
  connected,
  latency,
  users = [],
  currentFile,
  accessToken,
  isHost,
  onFileSelect,
  onLeaveRoom,
}) {
  const [openPicker] = useDrivePicker();

  const handleOpenDrivePicker = useCallback(() => {
    const activeToken = accessToken || localStorage.getItem('auth_token');

    if (!activeToken) {
      alert('Please log in with Google to select files from Google Drive.');
      return;
    }

    openPicker({
      clientId: CLIENT_ID,
      developerKey: DEVELOPER_KEY,
      viewId: 'DOCS_VIDEOS',
      token: activeToken,
      showUploadView: true,
      showUploadFolders: true,
      supportDrives: true,
      multiselect: false,
      callbackFunction: (data) => {
        if (data.action === 'picked' && data.docs?.[0]) {
          const file = data.docs[0];

          onFileSelect?.({
            fileId: file.id,
            fileName: file.name,
            url: file.url || '',
            mimeType: file.mimeType,
            accessToken: activeToken,
          });
        }
      },
    });
  }, [accessToken, openPicker, onFileSelect]);

  return (
    <div className="h-16 bg-[#110726]/90 border-b border-purple-500/20 px-4 flex items-center justify-between backdrop-blur-md">
      {/* Left: Room Status & Current Media Details */}
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2">
          <span
            className={`w-3 h-3 rounded-full ${
              connected ? 'bg-green-500 animate-pulse' : 'bg-red-500'
            }`}
          />
          <span className="font-bold text-lg text-purple-300">Room: {roomId}</span>
          {latency !== null && latency !== undefined && (
            <span className="text-xs text-purple-400/60 ml-1">({latency}ms)</span>
          )}
        </div>

        {currentFile && (
          <div className="hidden md:flex items-center space-x-2 bg-purple-900/30 border border-purple-500/30 px-3 py-1 rounded-full">
            <span className="text-xs text-purple-400">Playing:</span>
            <span className="text-sm text-purple-200 truncate max-w-[200px]">
              {currentFile.fileName || currentFile.name || 'Untitled File'}
            </span>
          </div>
        )}
      </div>

      {/* Right: Controls & Member Count */}
      <div className="flex items-center space-x-3">
        {/* Drive Picker Button (Host only) */}
        {isHost && (
          <button
            type="button"
            onClick={handleOpenDrivePicker}
            className="bg-purple-600 hover:bg-purple-500 text-white px-3 py-1.5 rounded-lg text-sm font-medium transition flex items-center space-x-2 shadow-lg shadow-purple-900/20 cursor-pointer"
          >
            <svg
              className="w-4 h-4 text-fuchsia-200 fill-current"
              viewBox="0 0 24 24"
            >
              <path d="M19.35 10.04C18.67 6.59 15.64 4 12 4 9.11 4 6.6 5.64 5.35 8.04 2.34 8.36 0 10.91 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96zM19 18H6c-2.21 0-4-1.79-4-4 0-2.05 1.53-3.76 3.56-3.97l1.07-.11.5-.95C8.08 7.14 9.94 6 12 6c2.62 0 4.88 1.86 5.39 4.43l.3 1.5 1.53.11c1.56.1 2.78 1.41 2.78 2.96 0 1.65-1.35 3-3 3z" />
            </svg>
            <span>Select Media</span>
          </button>
        )}

        {/* Member Counter */}
        <div className="flex items-center space-x-1.5 bg-purple-900/20 px-3 py-1.5 rounded-lg border border-purple-500/20">
          <svg
            className="w-4 h-4 text-purple-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
            />
          </svg>
          <span className="text-sm font-medium text-purple-200">{users.length}</span>
        </div>

        {/* Leave Room Button */}
        <button
          type="button"
          onClick={onLeaveRoom}
          className="bg-red-500/20 hover:bg-red-500/30 text-red-300 border border-red-500/30 px-3 py-1.5 rounded-lg text-sm font-medium transition cursor-pointer"
        >
          Leave
        </button>
      </div>
    </div>
  );
}