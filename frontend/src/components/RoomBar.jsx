export default function RoomBar({ roomId, users, latency = 0 }) {
  // Color code based on latency
  const getLatencyColor = () => {
    if (latency < 100) return 'text-green-600';
    if (latency < 500) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getLatencyLabel = () => {
    if (latency < 100) return 'LIVE';
    return `${latency}ms`;
  };

  return (
    <div className="flex items-center justify-between flex-wrap gap-3 mb-4">
      <div className="flex items-center gap-3">
        <span className={`flex items-center gap-1.5 bg-ember/15 ${getLatencyColor()} text-xs font-display tracking-widest px-2.5 py-1 rounded-sm`}>
          <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
          {getLatencyLabel()}
        </span>
        <div className="border border-dashed border-marquee/50 px-3 py-1 rounded-sm">
          <span className="marquee-code font-display text-marquee text-sm">{roomId}</span>
        </div>
      </div>
      <p className="text-xs text-muted">
        {users.length} watching · {users.join(', ')}
      </p>
    </div>
  );
}