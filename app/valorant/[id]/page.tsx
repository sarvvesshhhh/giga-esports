import { getValorantMatch } from "@/lib/vlr";
import { lockInPrediction } from "@/app/actions/predict"; // We'll ensure this exists
import { getGigaUser } from "@/lib/user";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function ValorantMatchRoom({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const match = await getValorantMatch(id);
  const user = await getGigaUser();

  // Helper to split players
  const t1Players = match.players?.filter((p: any) => p.team_id === "team1") || [];
  const t2Players = match.players?.filter((p: any) => p.team_id === "team2") || [];
  
  // Check if user already predicted this match
  const userPrediction = user?.predictions?.find((p: any) => p.matchId === id);
  const noRoster = t1Players.length === 0 && t2Players.length === 0;

  return (
    <main className="min-h-screen bg-[#0f1923] text-white p-6 pb-20 font-sans">
      {/* NAV */}
      <div className="max-w-7xl mx-auto mb-6 flex justify-between text-xs font-mono text-gray-500 uppercase border-b border-white/5 pb-4">
        <Link href="/valorant" className="hover:text-[#ff4655]">← HQ // PROTOCOL</Link>
        <span>{match.tournament}</span>
      </div>

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* === LEFT COLUMN: STREAM & PREDICTION === */}
        <div className="lg:col-span-2 flex flex-col gap-4">
            {/* STREAM PLAYER */}
            <div className="aspect-video w-full bg-black border border-white/10 rounded shadow-2xl relative overflow-hidden">
               <iframe
                  src={`https://player.twitch.tv/?channel=${match.stream_channel}&parent=localhost&parent=giga-esports.vercel.app&muted=false`}
                  height="100%" width="100%" allowFullScreen className="w-full h-full"
               />
               <div className="absolute top-4 left-4 bg-red-600/90 text-white px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest rounded shadow-sm">
                  LIVE // {match.stream_channel}
               </div>
            </div>

            {/* SCORE & PREDICT SECTION */}
            <div className="bg-[#1f2b36] p-6 border border-white/5 rounded flex flex-col md:flex-row justify-between items-center gap-6">
                <div className="flex-1">
                   <h1 className="text-3xl font-black italic uppercase leading-none">
                      {match.team1?.name} <span className="text-[#ff4655]">VS</span> {match.team2?.name}
                   </h1>
                   <p className="text-[10px] text-gray-400 font-mono mt-2 tracking-widest">{match.event} // STATUS: {match.status}</p>
                </div>

                {/* GIGA PREDICTION ENGINE */}
                <div className="w-full md:w-auto min-w-[300px]">
                    {userPrediction ? (
                        <div className="bg-black/40 border border-[#ff4655]/30 p-4 rounded text-center">
                            <span className="text-[10px] font-mono text-gray-500 uppercase block mb-1">Verdict Locked In</span>
                            <span className="text-xl font-black italic uppercase text-white">
                                {userPrediction.teamPick}
                            </span>
                        </div>
                    ) : (
                        <form action={lockInPrediction} className="flex flex-col gap-2">
                            <input type="hidden" name="matchId" value={id} />
                            <div className="grid grid-cols-2 gap-2">
                                <button 
                                    name="teamPick" 
                                    value={match.team1.name}
                                    className="bg-white/5 hover:bg-[#ff4655] border border-white/10 hover:border-transparent p-3 text-[10px] font-black uppercase italic transition-all"
                                >
                                    Pick {match.team1.name}
                                </button>
                                <button 
                                    name="teamPick" 
                                    value={match.team2.name}
                                    className="bg-white/5 hover:bg-white hover:text-black border border-white/10 hover:border-transparent p-3 text-[10px] font-black uppercase italic transition-all"
                                >
                                    Pick {match.team2.name}
                                </button>
                            </div>
                            <select name="confidence" className="bg-black/50 border border-white/10 text-[9px] uppercase font-mono p-2 outline-none">
                                <option value="LOW">Low Confidence (-10 GS)</option>
                                <option value="MID" selected>Mid Confidence (+25 GS)</option>
                                <option value="HIGH">High Confidence (+50 GS)</option>
                            </select>
                        </form>
                    )}
                </div>
            </div>
        </div>

        {/* === RIGHT COLUMN: ROSTERS === */}
        <div className="flex flex-col gap-4 h-full">
            {/* Team 1 Roster */}
            <div className="bg-[#1f2b36] border-l-2 border-[#ff4655] p-5 flex-1">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xs font-black uppercase text-gray-200">{match.team1?.name}</h3>
                    <span className="text-[24px] font-black text-[#ff4655]">{match.score1}</span>
                </div>
                <div className="space-y-4">
                    {t1Players.length > 0 ? t1Players.map((p: any, i: number) => (
                        <div key={i} className="flex items-center gap-3 group">
                            <div className="w-8 h-8 rounded-full bg-black/40 border border-white/5 overflow-hidden">
                                {p.avatar ? <img src={p.avatar} alt="" className="w-full h-full object-cover" /> : <div className="w-full h-full bg-[#ff4655]/10" />}
                            </div>
                            <div>
                                <div className="font-bold text-xs text-gray-200 group-hover:text-[#ff4655] transition-colors">{p.name}</div>
                                <div className="text-[9px] text-gray-500 uppercase font-mono">{p.real_name || p.agent}</div>
                            </div>
                        </div>
                    )) : <div className="text-[10px] text-gray-600 font-mono italic">DATA ENCRYPTED...</div>}
                </div>
            </div>

            {/* Team 2 Roster */}
            <div className="bg-[#1f2b36] border-l-2 border-white p-5 flex-1">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xs font-black uppercase text-gray-200">{match.team2?.name}</h3>
                    <span className="text-[24px] font-black text-white">{match.score2}</span>
                </div>
                <div className="space-y-4">
                    {t2Players.length > 0 ? t2Players.map((p: any, i: number) => (
                        <div key={i} className="flex items-center gap-3 group">
                            <div className="w-8 h-8 rounded-full bg-black/40 border border-white/5 overflow-hidden">
                                {p.avatar ? <img src={p.avatar} alt="" className="w-full h-full object-cover" /> : <div className="w-full h-full bg-white/10" />}
                            </div>
                            <div>
                                <div className="font-bold text-xs text-gray-200 group-hover:text-white transition-colors">{p.name}</div>
                                <div className="text-[9px] text-gray-500 uppercase font-mono">{p.real_name || p.agent}</div>
                            </div>
                        </div>
                    )) : <div className="text-[10px] text-gray-600 font-mono italic">DATA ENCRYPTED...</div>}
                </div>
            </div>
            
            {noRoster && (
                 <div className="text-[9px] text-center text-gray-500 font-mono bg-black/20 p-3 border border-dashed border-white/5 rounded">
                    ⚠ UPLINK UNSTABLE: Detailed roster data unavailable for upcoming matches.
                 </div>
            )}
        </div>

      </div>
    </main>
  );
}