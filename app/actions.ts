"use server";

import { prisma } from "@/lib/user"; // Ensure this matches your singleton path
import { getVerdict, judgePrediction, judgeArchetype } from "@/lib/judge"; 
import { revalidatePath } from "next/cache";
import { auth } from "@clerk/nextjs/server";

// Helper to get current Giga User safely
async function getAuthenticatedUser() {
  const { userId } = await auth();
  if (!userId) throw new Error("UNAUTHORIZED_ACCESS");
  
  const user = await prisma.user.findUnique({ where: { clerkId: userId } });
  if (!user) throw new Error("USER_NOT_FOUND_IN_PROTOCOL");
  return user;
}

// --- ACTION 1: MANUAL ROAST BUTTON ---
export async function roastUserAction() {
  const user = await getAuthenticatedUser();

  // Update using unique clerkId
  const updatedUser = await prisma.user.update({
    where: { clerkId: user.clerkId },
    data: { gigaScore: { decrement: 50 } },
  });

  const verdict = await getVerdict(
    updatedUser.username ?? "Agent",
    `The user just asked for another roast. Their score dropped to ${updatedUser.gigaScore}. Mock them.`
  );

  revalidatePath("/");
  return verdict;
}

// --- ACTION 2: BETTING TERMINAL ---
export async function placeBetAction(team: string, amount: number) {
  const user = await getAuthenticatedUser();

  if (user.gigaScore < amount) {
    return { success: false, message: "INSUFFICIENT FUNDS. You are broke." };
  }

  const isWin = Math.random() > 0.6; 
  let pointChange = isWin ? amount : -amount;
  
  const updatedUser = await prisma.user.update({
    where: { clerkId: user.clerkId },
    data: { gigaScore: { increment: pointChange } },
  });

  const verdictContext = isWin 
    ? `User bet ${amount} on ${team} and WON. Lucky fool.` 
    : `User bet ${amount} on ${team} and LOST. Crushed.`;

  const verdict = await getVerdict(updatedUser.username ?? "Agent", verdictContext);
  revalidatePath("/");
  return { success: true, message: verdict, isWin };
}

// --- ACTION 3: TEXT PREDICTION ENGINE ---
export async function submitPredictionAction(predictionText: string) {
  const user = await getAuthenticatedUser();

  const { score, text } = await judgePrediction(predictionText);
  const pointChange = (score - 50) * 2;

  await prisma.user.update({
    where: { clerkId: user.clerkId },
    data: { gigaScore: { increment: pointChange } },
  });

  revalidatePath("/");
  return { success: true, iq: score, points: pointChange, verdict: text };
}

// --- ACTION 4: FLASH DECISIONS ---
export async function judgeFlashAction(scenario: string, choice: string) {
  const user = await getAuthenticatedUser();

  // AI calculates Score + Archetype
  const { score, archetype, text } = await judgeArchetype(scenario, choice);
  const pointChange = (score - 50) * 3;

  await prisma.user.update({
    where: { clerkId: user.clerkId },
    data: { 
      gigaScore: { increment: pointChange },
      archetype: archetype // Updates their Title
    },
  });

  revalidatePath("/");
  return { success: true, iq: score, points: pointChange, verdict: text };
}

// --- ACTION 5: ESPORTS ANALYST AI ---
export async function predictMatchAction(matchData: any) {
  const teamA = matchData.team1?.name || "Team A";
  const teamB = matchData.team2?.name || "Team B";
  const tournament = matchData.tournament || "Valorant Protocol";

  const prompt = `
    Match: ${teamA} vs ${teamB}
    Tournament: ${tournament}
    
    Task: Predict the winner as a GigaEsports Analyst.
    FORMAT: WINNER | CONFIDENCE | EXPLANATION
  `;
  
  const { text } = await judgePrediction(prompt);
  const parts = text.split("|");

  return {
    winner: parts[0]?.trim() || "TBD",
    confidence: parts[1]?.trim() || "50%",
    reason: parts[2]?.trim() || text
  };
}