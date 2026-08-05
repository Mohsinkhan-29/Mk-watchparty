export default function RoomBar({ roomId, users = [], latency = 0 }) {
  // Color code based on latency tailored for dark purple background
  const getLatencyStyle = () => {
    if (latency < 100) {
      return {
        badge: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400',
        dot: 'bg-emerald-400',
      };
    }
    if (latency < 500) {
      return {
        badge: 'bg-amber-500/10 border-amber-500/20 text-amber-400',
        dot: 'bg-amber-400',
      };
    }
    return {
      badge: 'bg-rose-500/10 border-rose-500/20 text-rose-400',
      dot: 'bg-rose-400',
    };
  };

  const getLatencyLabel = () => {
    if (latency < 100) return 'LIVE';
    return `${latency}ms`;
  };

  const { badge, dot } = getLatencyStyle();

  return (
    <div className="flex items-center justify-between flex-wrap gap-3 mb-4 p-3 bg-[#110726]/60 backdrop-blur-xl border border-purple-500/20 rounded-xl font-['Plus_Jakarta_Sans',sans-serif]">
      <div className="flex items-center gap-3">
        {/* Latency / Live Status Indicator */}
        <span className={`flex items-center gap-1.5 border ${badge} text-[10px] font-bold tracking-widest px-2.5 py-1 rounded-full uppercase`}>
          <span className={`w-1.5 h-1.5 rounded-full ${dot} animate-pulse`} />
          {getLatencyLabel()}
        </span>

        {/* Room ID Badge */}
        <div className="bg-purple-950/40 border border-purple-500/30 px-3 py-1 rounded-lg flex items-center gap-2">
          <span className="text-purple-300/60 text-xs font-semibold">ROOM:</span>
          <span className="font-mono font-bold text-fuchsia-300 text-sm tracking-wider">
            {roomId}
          </span>
        </div>
      </div>

      {/* Connected Users List */}
      <div className="flex items-center gap-2 text-xs text-purple-200/70">
        <span className="inline-flex items-center justify-center bg-purple-500/20 text-purple-300 border border-purple-500/30 w-5 h-5 rounded-full font-bold text-[10px]">
          {users.length}
        </span>
        <span className="font-medium text-purple-200/90">
          watching {users.length > 0 && `· ${users.join(', ')}`}
        </span>
      </div>
    </div>
  );
}