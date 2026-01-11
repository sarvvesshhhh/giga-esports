"use server";

import { prisma } from "@/lib/db";
import { getVerdict, judgePrediction, judgeArchetype } from "@/lib/judge"; // Import all tools
import { revalidatePath } from "next/cache";

// --- ACTION 1: MANUAL ROAST BUTTON ---
export async function roastUserAction(username: string) {
  const user = await prisma.user.findUnique({ where: { username } });
  if (!user) return "User not found.";

  await prisma.user.update({
    where: { username },
    data: { gigaScore: { decrement: 50 } },
  });

  const verdict = await getVerdict(
    user.username,
    `The user just asked for another roast. Their score dropped to ${user.gigaScore - 50}. Mock them.`
  );

  revalidatePath("/");
  return verdict;
}

// --- ACTION 2: BETTING TERMINAL (Legacy) ---
export async function placeBetAction(username: string, team: string, amount: number) {
  const user = await prisma.user.findUnique({ where: { username } });
  if (!user) return { success: false, message: "User not found." };

  if (user.gigaScore < amount) {
    return { success: false, message: "INSUFFICIENT FUNDS. You are broke." };
  }

  const isWin = Math.random() > 0.6; 
  let newScore = user.gigaScore;
  let verdictContext = "";

  if (isWin) {
    newScore += amount; 
    verdictContext = `User bet ${amount} on ${team} and WON. They got lucky.`;
  } else {
    newScore -= amount;
    verdictContext = `User bet ${amount} on ${team} and LOST. They were crushed.`;
  }

  await prisma.user.update({
    where: { username },
    data: { gigaScore: newScore },
  });

  const verdict = await getVerdict(username, verdictContext);
  revalidatePath("/");
  return { success: true, message: verdict, isWin };
}

// --- ACTION 3: TEXT PREDICTION ENGINE ---
export async function submitPredictionAction(username: string, predictionText: string) {
  const user = await prisma.user.findUnique({ where: { username } });
  if (!user) return { success: false, message: "User not found." };

  const { score, text } = await judgePrediction(predictionText);
  const pointChange = (score - 50) * 2;

  await prisma.user.update({
    where: { username },
    data: { gigaScore: user.gigaScore + pointChange },
  });

  revalidatePath("/");
  return { success: true, iq: score, points: pointChange, verdict: text };
}

// --- ACTION 4: FLASH DECISIONS (The one that crashed) ---
export async function judgeFlashAction(username: string, scenario: string, choice: string) {
  const user = await prisma.user.findUnique({ where: { username } });
  if (!user) return { success: false, message: "User not found." };

  // 1. CALL THE NEW AI FUNCTION (Calculates Score + Archetype)
  const { score, archetype, text } = await judgeArchetype(scenario, choice);

  // 2. CALCULATE POINTS
  const pointChange = (score - 50) * 3;

  // 3. UPDATE DB (With new Archetype!)
  await prisma.user.update({
    where: { username },
    data: { 
      gigaScore: user.gigaScore + pointChange,
      archetype: archetype // <--- UPDATES YOUR TITLE
    },
  });

  revalidatePath("/");
  return { success: true, iq: score, points: pointChange, verdict: text };
}

// ... keep existing imports ...

export async function predictMatchAction(matchData: any) {
  const teamA = matchData.opponents[0]?.opponent?.name || "Team A";
  const teamB = matchData.opponents[1]?.opponent?.name || "Team B";
  const game = matchData.videogame.name;
  const league = matchData.league.name;

  const prompt = `
    Match: ${teamA} vs ${teamB}
    Game: ${game}
    League: ${league}
    
    Task: Predict the winner.
    Analyze the teams based on your esports knowledge.
    Be decisive. Pick one winner and explain why in 2 sentences.
    Then, give a confidence percentage.
    
    FORMAT: WINNER | CONFIDENCE | EXPLANATION
    Example: SENTINELS | 85% | TenZ is mechanically superior...
  `;

  // Reuse our judgePrediction helper (it parses the text roughly)
  // or just use judgeArchetype for cleaner split if you prefer.
  // Let's stick to judgeArchetype logic since we want structured data.
  
  const { text } = await judgePrediction(prompt);
  // Expected: "SENTINELS | 85% | Reason..."
  
  const parts = text.split("|");
  return {
    winner: parts[0]?.trim() || "UNKNOWN",
    confidence: parts[1]?.trim() || "50%",
    reason: parts[2]?.trim() || text
  };
}