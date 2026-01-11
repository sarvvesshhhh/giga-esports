export default function IdentityCard({
  username,
  score,
  archetype,
  bias,
}: {
  username: string;
  score: number;
  archetype: string;
  bias: string;
}) {
  return (
    <div className="w-full max-w-md bg-[#0a0a0a] border border-[#1f1f1f] p-6 rounded-lg relative overflow-hidden group hover:border-red-900 transition-colors duration-500">
      
      {/* GLOW EFFECT */}
      <div className="absolute top-0 right-0 w-24 h-24 bg-red-600 blur-[80px] opacity-10 group-hover:opacity-20 transition-opacity"></div>

      {/* HEADER: NAME & SCORE */}
      <div className="flex justify-between items-start mb-8">
        <div>
          <h3 className="text-[10px] text-gray-500 uppercase tracking-widest mb-1">Subject</h3>
          <h1 className="text-3xl font-bold text-white tracking-tight">{username}</h1>
        </div>
        <div className="text-right">
          <h3 className="text-[10px] text-gray-500 uppercase tracking-widest mb-1">GigaScore</h3>
          <div className="text-2xl font-mono text-red-500">{score}</div>
        </div>
      </div>

      {/* STATS GRID */}
      <div className="grid grid-cols-2 gap-4 mb-8">
        {/* Archetype */}
        <div className="bg-[#111] p-3 rounded border border-[#222]">
          <div className="text-[9px] text-gray-400 uppercase mb-1">Archetype</div>
          <div className="text-sm text-gray-200 font-bold">{archetype}</div>
        </div>
        
        {/* Bias */}
        <div className="bg-[#111] p-3 rounded border border-[#222]">
          <div className="text-[9px] text-gray-400 uppercase mb-1">Detected Bias</div>
          <div className="text-sm text-gray-200 font-bold">{bias}</div>
        </div>
      </div>

      {/* FOOTER DECORATION */}
      <div className="flex items-center justify-between border-t border-[#1a1a1a] pt-4">
        <div className="flex gap-1">
          <div className="w-1 h-1 bg-red-600 rounded-full animate-pulse"></div>
          <div className="w-1 h-1 bg-gray-800 rounded-full"></div>
          <div className="w-1 h-1 bg-gray-800 rounded-full"></div>
        </div>
        <div className="text-[9px] text-gray-600 font-mono">ID_VERIFIED</div>
      </div>
    </div>
  );
}