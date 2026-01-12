import { prisma } from "@/lib/user";
import { getGigaUser } from "@/lib/user";

export const dynamic = "force-dynamic";

export default async function Leaderboard() {
  const topUsers = await prisma.user.findMany({
    orderBy: { gigaScore: 'desc' }, // Rank by highest score
    take: 20
  });
  
  const currentUser = await getGigaUser();

  return (
    <main className="min-h-screen bg-[#0f1923] text-white p-10 pt-32 flex flex-col items-center font-sans">
      <div className="w-full max-w-4xl">
        <h1 className="text-4xl font-black uppercase italic mb-8 border-l-4 border-[#ff4655] pl-4">
          Global <span className="text-[#ff4655]">Protocol</span> Rankings
        </h1>

        <div className="bg-[#1f2b36] border border-white/10 rounded-sm overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-black/40 text-[10px] uppercase tracking-widest text-gray-500 border-b border-white/5">
              <tr>
                <th className="px-6 py-4">Rank</th>
                <th className="px-6 py-4">Subject</th>
                <th className="px-6 py-4">Archetype</th>
                <th className="px-6 py-4 text-right">GigaScore</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {topUsers.map((u, i) => (
                <tr key={u.id} className={`hover:bg-white/5 transition ${u.clerkId === currentUser?.clerkId ? 'bg-[#ff4655]/10' : ''}`}>
                  <td className="px-6 py-4 font-black italic text-[#ff4655]">#{i + 1}</td>
                  <td className="px-6 py-4 font-bold uppercase">{u.username} {u.clerkId === currentUser?.clerkId && "(YOU)"}</td>
                  <td className="px-6 py-4 text-[10px] font-mono text-gray-400">{u.archetype}</td>
                  <td className="px-6 py-4 text-right font-black text-xl">{u.gigaScore}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}