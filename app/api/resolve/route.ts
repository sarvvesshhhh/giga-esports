import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(req: Request) {
  try {
    const apiKey = process.env.PANDASCORE_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "Missing PANDASCORE_API_KEY" }, { status: 500 });
    }

    const pendingPredictions = await db.prediction.findMany({
      where: { outcome: "PENDING" },
      include: { user: true },
    });

    if (pendingPredictions.length === 0) {
      return NextResponse.json({ message: "No pending predictions to resolve." });
    }

    // 1. Group predictions by Match ID to avoid hammering the PandaScore API
    const predictionsByMatch: Record<string, typeof pendingPredictions> = {};
    for (const p of pendingPredictions) {
      if (!predictionsByMatch[p.matchId]) {
        predictionsByMatch[p.matchId] = [];
      }
      predictionsByMatch[p.matchId].push(p);
    }

    let processedCount = 0;

    // 2. Process each unique match
    for (const matchId of Object.keys(predictionsByMatch)) {
      
      // Fetch actual live match data from PandaScore
      const res = await fetch(`https://api.pandascore.co/matches/${matchId}?token=${apiKey}`);
      
      if (!res.ok) {
        console.warn(`Failed to fetch match ${matchId}. Status: ${res.status}`);
        continue; // Skip this match, try again next time
      }

      const matchData = await res.json();

      // Only resolve if the match is officially finished
      if (matchData.status !== "finished") {
        continue;
      }

      // Extract the real winner (PandaScore usually provides both an acronym and full name)
      const winnerName = matchData.winner?.name || "";
      const winnerAcronym = matchData.winner?.acronym || "";

      if (!winnerName && !winnerAcronym) {
        // E.g., match was canceled or a draw
        console.warn(`Match ${matchId} finished but has no clear winner.`);
        continue; 
      }

      // 3. Resolve all predictions for this specific match
      for (const prediction of predictionsByMatch[matchId]) {
        const user = prediction.user;
        
        // User pick could have been stored as the acronym or the full name depending on UI
        const isCorrect = prediction.pick === winnerAcronym || prediction.pick === winnerName;
        
        let scoreDelta = 0;
        let newStreak = user.currentStreak;

        // THE GIGASCORE MATH
        if (isCorrect) {
          scoreDelta = Math.round(15 * (1 + (user.currentStreak * 0.05)));
          newStreak += 1;
          await db.prediction.update({ where: { id: prediction.id }, data: { outcome: "CORRECT" } });
        } else {
          scoreDelta = -10;
          newStreak = 0;
          await db.prediction.update({ where: { id: prediction.id }, data: { outcome: "INCORRECT" } });
        }

        // Calculate new total using the GigaScoreLog history
        const latestScoreRecord = await db.gigaScoreLog.findFirst({
          where: { userId: user.id },
          orderBy: { timestamp: "desc" }
        });
        
        const currentTotal = latestScoreRecord ? latestScoreRecord.newScore : user.gigaScore;
        const finalScore = Math.max(0, currentTotal + scoreDelta);

        // Save Identity Data
        await db.user.update({ 
          where: { id: user.id }, 
          data: { 
            currentStreak: newStreak,
            gigaScore: finalScore 
          } 
        });

        // Log the history using the CORRECT model and CORRECT field names
        await db.gigaScoreLog.create({
          data: {
            userId: user.id,
            changeAmount: scoreDelta, 
            newScore: finalScore,
            reason: isCorrect ? "PREDICTION_HIT" : "PREDICTION_MISS"
          }
        });

        processedCount++;
      }
    }

    return NextResponse.json({ message: "Identity Protocol Evaluated.", processed: processedCount });

  } catch (error) {
    console.error("Resolution Engine Error:", error);
    return NextResponse.json({ error: "System failure.", details: String(error) }, { status: 500 });
  }
}