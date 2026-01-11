import { getVerdict } from "@/lib/judge";
import IdentityCard from "@/components/IdentityCard";
import FlashDecisions from "@/components/FlashDecisions";
import Leaderboard from "@/components/Leaderboard"; // <--- IMPORT THIS
import { prisma } from "@/lib/db";
import { currentUser } from "@clerk/nextjs/server";
import { SignInButton } from "@clerk/nextjs";

export const dynamic = "force-dynamic";

export default async function Home() {
  const clerkUser = await currentUser();

  if (!clerkUser) {
    return (
      <main className="min-h-screen bg-black flex flex-col items-center justify-center p-6 gap-6">
        <h1 className="text-red-600 tracking-[0.5em] text-xs uppercase font-bold">Access Denied</h1>
        <div className="bg-white text-black px-6 py-2 rounded font-bold hover:bg-gray-200 transition">
          <SignInButton mode="modal" />
        </div>
      </main>
    );
  }

  // 1. GET CURRENT USER
  let user = await prisma.user.findUnique({
    where: { email: clerkUser.emailAddresses[0].emailAddress },
  });

  if (!user) {
    user = await prisma.user.create({
      data: {
        username: clerkUser.firstName || "Anonymous",
        email: clerkUser.emailAddresses[0].emailAddress,
        clerkId: clerkUser.id,
        archetype: "UNRANKED",
        biasRating: 0,
        gigaScore: 1000,
      },
    });
  }

  // 2. FETCH LIVE SCENARIO
  const activeScenario = await prisma.liveScenario.findFirst({
    where: { isActive: true },
    orderBy: { createdAt: "desc" }
  });

  // 3. FETCH TOP 10 PLAYERS (For Leaderboard)
  const topPlayers = await prisma.user.findMany({
    take: 10,
    orderBy: { gigaScore: "desc" }, // Highest score first
    select: { id: true, username: true, gigaScore: true, archetype: true } // Only get what we need
  });

  const verdict = await getVerdict(
    user.username, 
    `Score: ${user.gigaScore}. Waiting for live decision.`
  );

  return (
    <main className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-6 gap-8">
      
      {/* IDENTITY */}
      <IdentityCard 
        username={user.username}
        score={user.gigaScore}
        archetype={user.archetype}
        bias={`Rated ${user.biasRating}%`}
      />

      {/* GAME AREA */}
      <FlashDecisions username={user.username} scenarioData={activeScenario} />

      {/* AI VERDICT */}
      <div className="max-w-md text-center mt-4">
        <div className="w-px h-8 bg-gray-800 mx-auto mb-6"></div>
        <p className="text-xl font-light italic text-gray-400 animate-in fade-in">
          "{verdict}"
        </p>
      </div>

      {/* LEADERBOARD (At the bottom) */}
      <Leaderboard users={topPlayers} currentUser={user.username} />

    </main>
  );
}