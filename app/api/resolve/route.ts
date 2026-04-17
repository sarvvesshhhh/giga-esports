import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(req: Request) {
  try {
    const pendingPredictions = await db.prediction.findMany({
      where: { outcome: "PENDING" },
      include: { user: true },
    });

    if (pendingPredictions.length === 0) {
      return NextResponse.json({ message: "No pending predictions to resolve." });
    }

    let processedCount = 0;

    for (const prediction of pendingPredictions) {
      const user = prediction.user;
      
      // Simulated winner for testing (50/50 coin flip)
      const simulatedWinner = Math.random() > 0.5 ? prediction.pick : "OTHER_TEAM";
      
      const isCorrect = prediction.pick === simulatedWinner;
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

      // Calculate new total using the CORRECT model: gigaScoreLog
      const latestScoreRecord = await db.gigaScoreLog.findFirst({
        where: { userId: user.id },
        orderBy: { timestamp: "desc" }
      });
      
      const currentTotal = latestScoreRecord ? latestScoreRecord.newScore : user.gigaScore;
      const finalScore = Math.max(0, currentTotal + scoreDelta);

      // Save Identity Data (Also updating the gigaScore on the User table!)
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
          changeAmount: scoreDelta, // Changed from delta to changeAmount
          newScore: finalScore,
          reason: isCorrect ? "PREDICTION_HIT" : "PREDICTION_MISS"
        }
      });

      processedCount++;
    }

    return NextResponse.json({ message: "Identity Protocol Evaluated.", processed: processedCount });

  } catch (error) {
    console.error("Resolution Engine Error:", error);
    // Now it will print the EXACT error to your browser if it fails!
    return NextResponse.json({ error: "System failure.", details: String(error) }, { status: 500 });
  }
}