// app/page.tsx
import { auth, currentUser } from "@clerk/nextjs/server";
import { prisma } from "@/lib/user"; // Singleton instance
import IdentityCard from "@/components/IdentityCard";
import Leaderboard from "@/components/Leaderboard";
import GigaFeed from "@/components/GigaFeed";
import { getVerdict } from "@/lib/judge";
import { getRecentActivity } from "@/lib/feed";

export const dynamic = "force-dynamic";

export default async function Home() {
  const { userId } = await auth();
  const clerkUser = await currentUser();

  // 1. ACCESS CONTROL: Identity Verification
  if (!userId || !clerkUser) {
    return (
      <main className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-6 gap-6">
        <h1 className="text-red-600 tracking-[0.5em] text-[10px] uppercase font-bold animate-pulse">
          Access Denied // Identify Yourself
        </h1>
        <p className="text-gray-600 text-[10px] uppercase font-mono">Sign-in required to initialize GigaScore.</p>
      </main>
    );
  }

  // 2. DATA LAYER: Initialize or Fetch Participant
  let user = await prisma.user.findUnique({
    where: { clerkId: userId },
    include: { predictions: true }
  });

  if (!user) {
    user = await prisma.user.create({
      data: {
        clerkId: userId,
        username: clerkUser.username || clerkUser.firstName || "Agent",
        gigaScore: 1000,
        archetype: "INITIATE",
        bias: 0, 
      },
      include: { predictions: true }
    });
  }

  // 3. AGGREGATION: Fetch Rankings & Live Protocol Log
  const [topPlayers, activities] = await Promise.all([
    prisma.user.findMany({
      take: 10,
      orderBy: { gigaScore: "desc" },
      select: {
        id: true,
        clerkId: true,
        username: true,
        gigaScore: true,
        archetype: true,
        bias: true
      }
    }),
    getRecentActivity()
  ]);

  // 4. INTERPRETATION LAYER: AI Behavioral Judgment
  // Uses AI to summarize the consequence of the user's current standing
  const verdict = await getVerdict(
    user.username ?? "Agent", 
    `Rank: ${topPlayers.findIndex(p => p.clerkId === userId) + 1}. Score: ${user.gigaScore}. Archetype: ${user.archetype}.`
  );

  return (
    <main className="min-h-screen bg-black text-white flex flex-col items-center p-6 pt-32 gap-12 overflow-x-hidden">
      
      {/* IDENTITY MODULE: Reflects the user's core USP */}
      <IdentityCard 
        username={user.username ?? "Unknown Agent"} 
        score={user.gigaScore} 
        archetype={user.archetype} 
        bias={`BIAS: ${user.bias}`} 
      />

      {/* VERDICT MODULE: Narrative-driven interpretation */}
      <div className="max-w-md text-center">
        <div className="w-px h-12 bg-gradient-to-b from-red-600 to-transparent mx-auto mb-6"></div>
        <p className="text-xl font-light italic text-gray-400 animate-in fade-in duration-1000">
          "{verdict}"
        </p>
      </div> 

      
      {/* ACCOUNTABILITY FEED: Live record of protocol judgments */}
      <div className="w-full max-w-md">
        <GigaFeed activities={activities} />
      </div>

      {/* GLOBAL RANKINGS: Visualization of the ecosystem */}
      <div className="w-full max-w-2xl bg-[#0f1923] border border-white/5 rounded-sm overflow-hidden shadow-2xl mb-20">
        <div className="p-4 border-b border-white/5 bg-white/5 flex justify-between items-center">
          <h2 className="text-[10px] uppercase tracking-[0.5em] font-black text-red-600">
            Global_Protocol_Rankings
          </h2>
          <span className="text-[9px] font-mono text-gray-600 italic">Visibility Is Earned</span>
        </div>
        <Leaderboard 
          users={topPlayers} 
          currentUser={user.username ?? "Agent"} 
        />
      </div>

    </main>
  );
}