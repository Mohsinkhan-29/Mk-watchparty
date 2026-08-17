import { useState } from 'react';

export default function Dashboard({
  auth,
  history = [],
  watchTimeSeconds = 0,
  displayName,
  setDisplayName,
  roomId,
  setRoomId,
  onJoinRoom,
  onCreateRoom,
  onLogout,
}) {
  const [activeTab, setActiveTab] = useState('join');

  // Format watch time seconds to human-readable format
  const formatWatchTime = (totalSeconds) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    if (hours === 0) return `${minutes}m`;
    return `${hours}h ${minutes}m`;
  };

  // Sign out logic: wipe local data and redirect to Landing page
  const handleLogoutAndRedirect = () => {
    // 1. Wipe local and session data
    localStorage.removeItem('auth_token');
    localStorage.removeItem('oauth_user');
    localStorage.removeItem('wp_history');
    localStorage.removeItem('wp_watch_time');
    localStorage.clear();
    sessionStorage.clear();

    // 2. Reset input states
    if (setDisplayName) setDisplayName('');
    if (setRoomId) setRoomId('');

    // 3. Trigger logout callback (switches App view to 'landing')
    if (onLogout) {
      onLogout();
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (activeTab === 'join') {
      if (displayName.trim() && roomId.trim()) onJoinRoom();
    } else {
      if (displayName.trim()) onCreateRoom();
    }
  };

  return (
    <div className="min-h-screen bg-[#070312] text-violet-50 font-['Plus_Jakarta_Sans',sans-serif] relative overflow-hidden flex flex-col">
      {/* Background Ambient Glows */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-purple-600/20 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute top-1/2 -right-40 w-96 h-96 bg-fuchsia-600/15 rounded-full blur-[140px] pointer-events-none" />

      {/* Navigation Header */}
      <header className="relative z-10 border-b border-purple-500/15 bg-[#110726]/40 backdrop-blur-xl px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">

          <div
            className="
              w-10
              h-10
              rounded-lg
              flex
              items-center
              justify-center
            "
          >
            <img
              src="/minilogo.png"
              alt="Logo"
            />
          </div>

          <span
            className="
              text-lg
              font-bold
              tracking-tight
              text-white
            "
          >
            Stream
            <span className="text-purple-400">lo</span>
          </span>

        </div>

        {/* User Status & Sign Out Button */}
        <div className="flex items-center gap-4">
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-purple-500/10 border border-purple-500/20">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span className="text-xs text-purple-200 font-medium">Authenticated</span>
          </div>
          <button
            type="button"
            onClick={handleLogoutAndRedirect}
            className="text-xs text-purple-300/70 hover:text-rose-300 hover:bg-rose-500/10 px-3 py-1.5 rounded-xl border border-transparent hover:border-rose-500/20 transition-all duration-200 cursor-pointer"
          >
            Sign Out
          </button>
        </div>
      </header>

      {/* Main Section */}
      <main className="relative z-10 flex-1 w-full mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <video
          autoPlay muted loop playsInline
          className="absolute inset-0 w-full h-full object-cover -z-40"
          style={{ objectPosition: "80% 20%", opacity: 0.4 }}
        >
          <source
            src="https://demo.awaikenthemes.com/assets/videos/artistic-video.mp4"
            type="video/mp4"
          />
        </video>
        {/* Left Column: Metrics & Watch History */}
        <div className="lg:col-span-7 space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-[#110726]/70 backdrop-blur-2xl border border-purple-500/20 rounded-2xl p-5 shadow-xl shadow-purple-950/40">
              <p className="text-xs text-purple-200/60 font-semibold tracking-wider uppercase mb-1">Total Watch Time</p>
              <h2 className="text-2xl font-black text-white bg-gradient-to-r from-purple-300 to-fuchsia-200 bg-clip-text text-transparent">
                {formatWatchTime(watchTimeSeconds)}
              </h2>
            </div>
            <div className="bg-[#110726]/70 backdrop-blur-2xl border border-purple-500/20 rounded-2xl p-5 shadow-xl shadow-purple-950/40">
              <p className="text-xs text-purple-200/60 font-semibold tracking-wider uppercase mb-1">Videos Watched</p>
              <h2 className="text-2xl font-black text-white bg-gradient-to-r from-purple-300 to-fuchsia-200 bg-clip-text text-transparent">
                {history.length}
              </h2>
            </div>
          </div>

          <div className="bg-[#110726]/70 backdrop-blur-2xl border border-purple-500/20 rounded-2xl p-6 shadow-xl shadow-purple-950/40">
            <h3 className="text-sm font-bold text-white tracking-wide mb-4 flex items-center gap-2">
              <svg className="w-4 h-4 text-fuchsia-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Recently Watched
            </h3>

            {history.length === 0 ? (
              <div className="py-10 text-center border border-dashed border-purple-500/20 rounded-xl bg-purple-950/10">
                <p className="text-xs text-purple-300/50">No recent watch history yet. Join or start a room to begin!</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-[280px] overflow-y-auto pr-1">
                {history.map((item, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3.5 rounded-xl bg-purple-950/30 border border-purple-500/15 hover:border-purple-500/30 transition-all duration-150"
                  >
                    <div className="flex items-center gap-3 overflow-hidden">
                      <div className="w-8 h-8 rounded-lg bg-purple-600/20 border border-purple-500/30 flex items-center justify-center shrink-0">
                        <svg className="w-4 h-4 text-fuchsia-300" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M8 5v14l11-7z" />
                        </svg>
                      </div>
                      <div className="truncate">
                        <p className="text-xs font-semibold text-purple-100 truncate">{item.fileName}</p>
                        <p className="text-[10px] text-purple-300/50">Room: {item.roomId}</p>
                      </div>
                    </div>
                    <span className="text-[10px] text-purple-300/60 shrink-0 font-mono bg-purple-900/40 px-2 py-1 rounded-md">
                      {new Date(item.timestamp).toLocaleDateString()}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Room Entry Controls */}
        <div className="lg:col-span-5 bg-[#110726]/70 backdrop-blur-2xl border border-purple-500/20 rounded-2xl p-6 sm:p-8 shadow-2xl shadow-purple-950/80">
          <div className="mb-6">
            <h2 className="text-xl font-extrabold text-white mb-1">Enter Watch Room</h2>
            <p className="text-xs text-purple-200/60 leading-relaxed">
              Create a new room or enter an existing room code to join your friends.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-1 bg-purple-950/40 p-1 rounded-xl border border-purple-500/20 mb-6">
            <button
              type="button"
              onClick={() => setActiveTab('join')}
              className={`py-2 text-xs font-semibold rounded-lg transition-all ${activeTab === 'join'
                ? 'bg-purple-600 text-white shadow-md'
                : 'text-purple-300/70 hover:text-white'
                }`}
            >
              Join Room
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('create')}
              className={`py-2 text-xs font-semibold rounded-lg transition-all ${activeTab === 'create'
                ? 'bg-fuchsia-600 text-white shadow-md'
                : 'text-purple-300/70 hover:text-white'
                }`}
            >
              Create Room
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-purple-200/80 mb-2">Display Name</label>
              <input
                type="text"
                placeholder="e.g. Alex"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="w-full bg-[#070312]/60 border border-purple-500/30 rounded-xl px-4 py-3 text-xs text-white placeholder-purple-300/30 focus:outline-none focus:border-purple-400 focus:ring-1 focus:ring-purple-400 transition-all"
              />
            </div>

            {activeTab === 'join' && (
              <div>
                <label className="block text-xs font-semibold text-purple-200/80 mb-2">Room Code</label>
                <input
                  type="text"
                  placeholder="Enter 6-character room code"
                  value={roomId}
                  onChange={(e) => setRoomId(e.target.value)}
                  className="w-full bg-[#070312]/60 border border-purple-500/30 rounded-xl px-4 py-3 text-xs text-white placeholder-purple-300/30 font-mono tracking-wider focus:outline-none focus:border-purple-400 focus:ring-1 focus:ring-purple-400 transition-all"
                />
              </div>
            )}

            {activeTab === 'join' ? (
              <button
                type="submit"
                disabled={!displayName.trim() || !roomId.trim()}
                className="w-full mt-2 relative group overflow-hidden bg-gradient-to-r from-purple-600 to-fuchsia-600 text-white font-semibold text-xs py-3.5 px-6 rounded-xl shadow-lg shadow-purple-600/30 hover:scale-[1.01] active:scale-[0.99] disabled:opacity-40 disabled:hover:scale-100 transition-all duration-200"
              >
                Join Watch Room
              </button>
            ) : (
              <button
                type="submit"
                disabled={!displayName.trim()}
                className="w-full mt-2 relative group overflow-hidden bg-gradient-to-r from-fuchsia-600 to-purple-600 text-white font-semibold text-xs py-3.5 px-6 rounded-xl shadow-lg shadow-fuchsia-600/30 hover:scale-[1.01] active:scale-[0.99] disabled:opacity-40 disabled:hover:scale-100 transition-all duration-200"
              >
                Generate & Join Room
              </button>
            )}
          </form>
        </div>
      </main>
    </div>
  );
}