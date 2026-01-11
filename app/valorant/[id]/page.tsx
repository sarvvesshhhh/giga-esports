import { getValorantMatch } from "@/lib/vlr";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function ValorantMatchRoom({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const match = await getValorantMatch(id);

  // Helper to split players
  const t1Players = match.players?.filter((p: any) => p.team_id === "team1") || [];
  const t2Players = match.players?.filter((p: any) => p.team_id === "team2") || [];
  
  // If scraper failed to get roster
  const noRoster = t1Players.length === 0 && t2Players.length === 0;

  return (
    <main className="min-h-screen bg-[#0f1923] text-white p-6 pb-20 font-sans">
      {/* NAV */}
      <div className="max-w-7xl mx-auto mb-6 flex justify-between text-xs font-mono text-gray-500 uppercase border-b border-white/5 pb-4">
        <Link href="/valorant" className="hover:text-[#ff4655]">← HQ // PROTOCOL</Link>
        <span>{match.tournament}</span>
      </div>

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* === STREAM === */}
        <div className="lg:col-span-2 flex flex-col gap-4">
            <div className="aspect-video w-full bg-black border border-white/10 rounded shadow-2xl relative">
               <iframe
                  src={`https://player.twitch.tv/?channel=${match.stream_channel}&parent=localhost&parent=giga-esports.vercel.app&muted=false`}
                  height="100%" width="100%" allowFullScreen className="w-full h-full"
               />
               <div className="absolute top-4 left-4 bg-red-600/90 text-white px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest rounded shadow-sm">
                  LIVE // {match.stream_channel}
               </div>
            </div>

            <div className="bg-[#1f2b36] p-5 flex justify-between items-center border border-white/5 rounded">
                <div>
                   <h1 className="text-2xl font-black italic uppercase">
                      {match.team1?.name} <span className="text-[#ff4655]">VS</span> {match.team2?.name}
                   </h1>
                   <p className="text-[10px] text-gray-400 font-mono mt-1">{match.event}</p>
                </div>
                <div className="text-3xl font-black text-[#ff4655]">{match.score1} - {match.score2}</div>
            </div>
        </div>

        {/* === ROSTERS === */}
        <div className="flex flex-col gap-4 h-full">
            {/* Team 1 */}
            <div className="bg-[#1f2b36] border-l-2 border-[#ff4655] p-5 flex-1">
                <h3 className="text-xs font-black uppercase text-gray-400 mb-4">{match.team1?.name}</h3>
                <div className="space-y-3">
                    {t1Players.length > 0 ? t1Players.map((p: any, i: number) => (
                        <div key={i} className="flex items-center gap-3">
                            {p.avatar && <img src={p.avatar} className="w-6 h-6 rounded-full bg-black/20" />}
                            <div>
                                <div className="font-bold text-xs text-gray-200">{p.name}</div>
                                <div className="text-[9px] text-gray-500 uppercase">{p.real_name || p.agent}</div>
                            </div>
                        </div>
                    )) : <div className="text-[10px] text-gray-600 italic">Roster Unavailable</div>}
                </div>
            </div>

            {/* Team 2 */}
            <div className="bg-[#1f2b36] border-l-2 border-white p-5 flex-1">
                <h3 className="text-xs font-black uppercase text-gray-400 mb-4">{match.team2?.name}</h3>
                 <div className="space-y-3">
                    {t2Players.length > 0 ? t2Players.map((p: any, i: number) => (
                        <div key={i} className="flex items-center gap-3">
                            {p.avatar && <img src={p.avatar} className="w-6 h-6 rounded-full bg-black/20" />}
                            <div>
                                <div className="font-bold text-xs text-gray-200">{p.name}</div>
                                <div className="text-[9px] text-gray-500 uppercase">{p.real_name || p.agent}</div>
                            </div>
                        </div>
                    )) : <div className="text-[10px] text-gray-600 italic">Roster Unavailable</div>}
                </div>
            </div>
            
            {/* Disclaimer if empty */}
            {noRoster && (
                 <div className="text-[9px] text-center text-gray-500 font-mono bg-black/20 p-2 rounded">
                    ⚠ VLR DATA ENCRYPTED. CHECK BACK WHEN LIVE.
                 </div>
            )}
        </div>

      </div>
    </main>
  );
}