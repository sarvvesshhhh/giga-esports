import { getValorantMatch } from "@/lib/vlr"; 
import { prisma } from "@/lib/user"; 

export async function syncMatchToDatabase(matchId: string) {
  const matchData = await getValorantMatch(matchId);

  if (!matchData) {
    console.error("FAILED TO FETCH SOURCE DATA");
    return;
  }

  // SAVE TO NEON
  // Note: If 'match' still shows red, Restart your TS Server (Ctrl+Shift+P)
  const savedMatch = await prisma.match.upsert({
    where: { externalId: matchId },
    update: {
      score1: parseInt(matchData.score1) || 0,
      score2: parseInt(matchData.score2) || 0,
      status: matchData.status, 
    },
    create: {
      externalId: matchId,
      team1: matchData.team1.name,
      team2: matchData.team2.name,
      tournament: matchData.tournament,
      status: matchData.status,
    },
  });

  console.log(`✅ MATCH ${matchId} SYNCED TO PROTOCOL`);
  return savedMatch;
}