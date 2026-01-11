import { getTournaments } from "@/lib/pandascore";

export const dynamic = "force-dynamic";

export default async function TournamentsPage() {
  const tournaments = await getTournaments();

  return (
    <main className="min-h-screen bg-black text-white p-6 max-w-4xl mx-auto">
      <h1 className="text-3xl font-black italic tracking-tighter mb-8 text-white">
        ACTIVE <span className="text-red-600">LEAGUES</span>
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {tournaments && tournaments.map((t: any) => (
          <div key={t.id} className="bg-[#0a0a0a] border border-[#222] p-6 rounded hover:border-gray-600 transition">
            <div className="text-[10px] text-red-500 font-bold uppercase tracking-widest mb-2">
              {t.videogame.name}
            </div>
            <h2 className="text-xl font-bold mb-1">{t.league.name}</h2>
            <p className="text-sm text-gray-400">{t.name}</p>
            
            <div className="mt-6 flex justify-between items-end border-t border-[#222] pt-4">
               <div className="text-[10px] text-gray-600">
                  PRIZE POOL: <span className="text-gray-300">UNKNOWN</span>
               </div>
               <div className="text-[10px] bg-green-900/20 text-green-500 px-2 py-1 rounded">
                  LIVE NOW
               </div>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}