// components/Leaderboard.tsx
interface LeaderboardProps {
  users: {
    id: string;
    username: string | null; // Matches Prisma's optional String?
    gigaScore: number;
    archetype: string;
  }[];
  currentUser: string;
}

export default function Leaderboard({ users, currentUser }: LeaderboardProps) {
  return (
    <div className="w-full bg-[#1f2b36] border border-white/10 rounded-sm overflow-hidden">
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
          {users.map((user, index) => (
            <tr 
              key={user.id} 
              className={`hover:bg-white/5 transition ${user.username === currentUser ? 'bg-[#ff4655]/10' : ''}`}
            >
              <td className="px-6 py-4 font-black italic text-[#ff4655]">#{index + 1}</td>
              <td className="px-6 py-4 font-bold uppercase">{user.username ?? "Anonymous"}</td>
              <td className="px-6 py-4 text-[10px] font-mono text-gray-400">{user.archetype}</td>
              <td className="px-6 py-4 text-right font-black text-xl">{user.gigaScore}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}