"use server";

import { db } from "@/lib/db";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";

// Updated to accept the new Tactical fields
export async function submitPrediction(
  matchId: string, 
  pick: string, 
  gameName: string, 
  teamA: string, 
  teamB: string, 
  tournName: string
) {
  try {
    // 1. Authenticate the user via Clerk
    const { userId: clerkId } = await auth();
    if (!clerkId) {
      return { success: false, error: "Unauthorized. Please log in." };
    }

    // 2. Find the internal Database User
    const user = await db.user.findUnique({
      where: { clerkId },
    });
    if (!user) {
      return { success: false, error: "User profile not synced." };
    }

    // 3. Check if they already predicted this match
    const existingPrediction = await db.prediction.findFirst({
      where: {
        userId: user.id,
        matchId: matchId, // This is now the PandaScore ID
      },
    });

    if (existingPrediction) {
      // If it exists, update it (assuming the match hasn't started yet)
      await db.prediction.update({
        where: { id: existingPrediction.id },
        data: { pick },
      });
    } else {
      // 4. Create the new prediction memory with the tactical data
      await db.prediction.create({
        data: {
          userId: user.id,
          matchId: matchId, 
          game: gameName,   
          teamA: teamA,         // <--- SAVING TEAM A
          teamB: teamB,         // <--- SAVING TEAM B
          tournName: tournName, // <--- SAVING TOURNAMENT NAME
          pick: pick,
          outcome: "PENDING",
        },
      });
    }

    // 5. Refresh the UI across all relevant pages
    revalidatePath("/schedule");
    revalidatePath("/dashboard");
    revalidatePath("/gigascore"); 
    
    return { success: true };
  } catch (error) {
    console.error("Prediction Error:", error);
    return { success: false, error: "System failure. Could not lock in prediction." };
  }
}