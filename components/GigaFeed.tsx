// components/GigaFeed.tsx
export default function GigaFeed({ activities }: { activities: any[] }) {
  return (
    <div className="w-full max-w-md bg-black/20 border border-white/5 p-4 rounded-sm">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-2 h-2 bg-red-600 animate-ping rounded-full" />
        <h3 className="text-[10px] font-mono uppercase tracking-[0.3em] text-gray-500">
          Live_Protocol_Feed
        </h3>
      </div>
      
      <div className="space-y-3">
        {activities.length === 0 ? (
          <p className="text-[10px] font-mono text-gray-700 italic">No recent protocol activity detected...</p>
        ) : (
          activities.map((act) => (
            <div key={act.id} className="font-mono text-[11px] border-l border-red-900/30 pl-3 py-1">
              <span className="text-gray-500">[{new Date(act.createdAt).toLocaleTimeString()}]</span>{" "}
              <span className="text-white uppercase font-bold">{act.user.username}</span>{" "}
              <span className={act.status === "WON" ? "text-green-500" : "text-red-500"}>
                {act.status === "WON" ? "VERIFIED" : "REJECTED"}
              </span>
              <div className="text-gray-600 tracking-tighter italic">
                Prediction on {act.teamPick} resolved.
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}