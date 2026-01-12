// app/page.tsx
import { auth, currentUser } from "@clerk/nextjs/server";
import { prisma } from "@/lib/user"; // Points to your singleton
import IdentityCard from "@/components/IdentityCard";
import Leaderboard from "@/components/Leaderboard";
import { getVerdict } from "@/lib/judge";

export const dynamic = "force-dynamic";

export default async function Home() {
  const { userId } = await auth();
  const clerkUser = await currentUser();

  // 1. GUEST ACCESS PROTOCOL
  if (!userId || !clerkUser) {
    return (
      <main className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-6 gap-6">
        <h1 className="text-red-600 tracking-[0.5em] text-xs uppercase font-bold animate-pulse">
          Access Denied // Identify Yourself
        </h1>
        {/* Sign-in handled by Navbar or Clerk middleware */}
      </main>
    );
  }

  // 2. FETCH/INITIALIZE USER via clerkId (NOT email)
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

  // 3. FETCH GLOBAL RANKINGS
  const topPlayers = await prisma.user.findMany({
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
  });

  // 4. GENERATE AI JUDGMENT
  const verdict = await getVerdict(
    user.username ?? "Agent", 
    `Current Rank: Top ${topPlayers.findIndex(p => p.clerkId === userId) + 1}. Score: ${user.gigaScore}.`
  );

  return (
    <main className="min-h-screen bg-black text-white flex flex-col items-center p-6 pt-32 gap-12 overflow-x-hidden">
      
      {/* IDENTITY MODULE - Fallbacks prevent TS errors */}
      <IdentityCard 
        username={user.username ?? "Unknown Agent"} 
        score={user.gigaScore} 
        archetype={user.archetype} 
        bias={`BIAS: ${user.bias}`} 
      />

      {/* VERDICT MODULE */}
      <div className="max-w-md text-center">
        <div className="w-px h-12 bg-gradient-to-b from-red-600 to-transparent mx-auto mb-6"></div>
        <p className="text-xl font-light italic text-gray-400 animate-in fade-in duration-1000">
          "{verdict}"
        </p>
      </div>

      {/* LEADERBOARD MODULE */}
      <div className="w-full max-w-2xl bg-[#0f1923] border border-white/5 rounded-sm overflow-hidden shadow-2xl">
        <Leaderboard 
          users={topPlayers} 
          currentUser={user.username ?? "Agent"} 
        />
      </div>

    </main>
  );
}