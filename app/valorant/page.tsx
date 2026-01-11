import { getValorantSchedule } from "@/lib/vlr";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function ValorantHQ() {
  const matches = await getValorantSchedule();

  // ERROR STATE: If API is down or empty
  if (!matches || matches.length === 0) {
    return (
      <main className="min-h-screen bg-[#0f1923] text-white p-20 flex flex-col items-center justify-center">
        <h1 className="text-4xl font-black uppercase text-[#ff4655]">NO SIGNAL</h1>
        <p className="text-gray-400 font-mono mt-4">VLR.GG CONNECTION SILENT. RETRY LATER.</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#0f1923] text-white p-6 pb-20 font-sans">
      
      {/* HEADER */}
      <div className="max-w-5xl mx-auto mb-10 border-b border-white/10 pb-6 flex flex-col md:flex-row justify-between items-end gap-4">
        <div>
          <h1 className="text-6xl font-black uppercase tracking-tighter text-[#ff4655] leading-none">
            Valorant <span className="text-white">Protocol</span>
          </h1>
          <p className="text-gray-400 font-mono text-xs mt-2 tracking-widest">
            VLR.GG ORACLE // TIER 1 INTELLIGENCE
          </p>
        </div>
        
        <div className="bg-[#ff4655] text-white px-4 py-2 font-bold font-mono text-sm uppercase tracking-widest">
            NEXT MATCH: {matches[0]?.time || "SOON"}
        </div>
      </div>

      {/* MATCH GRID */}
      <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-4">
        {matches.map((match: any) => {
          // 1. LINK SAFETY LOGIC
          // Only create a valid link if we have a real ID
          const isValidId = match.id && match.id !== "unknown";
          const linkHref = isValidId ? `/valorant/${match.id}` : "#";
          
          // 2. TIME FORMATTING
          const displayTime = match.time ? match.time.replace("upcoming", "").replace("from now", "").trim() : "TBD";

          return (
            <Link href={linkHref} key={match.id} className={`group block h-full ${!isValidId ? 'cursor-default' : ''}`}>
              <div className="bg-[#1f2b36] border border-white/5 h-full relative overflow-hidden transition-all duration-300 group-hover:border-[#ff4655] group-hover:-translate-y-1">
                
                {/* HOVER GLOW (Only if valid link) */}
                {isValidId && (
                    <div className="absolute inset-0 bg-gradient-to-r from-[#ff4655]/0 via-[#ff4655]/0 to-[#ff4655]/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                )}

                <div className="p-6 flex items-center justify-between z-10 relative">
                  
                  {/* TEAM A */}
                  <div className="w-5/12 text-right">
                     <div className="font-black text-xl md:text-2xl uppercase leading-none text-white truncate">
                       {match.team1.name}
                     </div>
                     <div className="text-[10px] text-gray-400 font-mono mt-1">
                       REGION: {match.event ? match.event.split(':')[0] : "INTL"}
                     </div>
                  </div>

                  {/* VS & ID DEBUG */}
                  <div className="w-2/12 text-center flex flex-col items-center justify-center">
                     <span className="text-2xl font-black italic text-[#ff4655]">VS</span>
                     <span className="text-[9px] bg-black/40 px-2 py-1 rounded mt-1 font-mono text-gray-300 border border-white/10 whitespace-nowrap">
                        {displayTime}
                     </span>
                     {/* DEBUG: Show ID to confirm it works */}
                     <span className="text-[8px] text-gray-600 font-mono mt-2 uppercase tracking-widest">
                        ID: {match.id}
                     </span>
                  </div>

                  {/* TEAM B */}
                  <div className="w-5/12 text-left">
                     <div className="font-black text-xl md:text-2xl uppercase leading-none text-white truncate">
                       {match.team2.name}
                     </div>
                     <div className="text-[10px] text-gray-400 font-mono mt-1">
                        SERIES: {match.tournament ? match.tournament.split(':')[0] : "PRO"}
                     </div>
                  </div>

                </div>

                {/* FOOTER */}
                <div className="bg-black/30 p-2 text-center text-[9px] uppercase tracking-widest text-gray-500 font-bold border-t border-white/5 group-hover:text-white group-hover:bg-[#ff4655] transition-colors truncate px-4">
                  {match.event} • {match.tournament}
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </main>
  );
}