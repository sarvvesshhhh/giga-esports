// actions/submit-prediction.ts
"use server";

import { db } from "@/lib/db";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";

export async function submitPrediction(matchId: string, pick: string) {
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

    // 3. Validate the Match
    const match = await db.match.findUnique({
      where: { id: matchId },
    });
    if (!match) {
      return { success: false, error: "Match protocol not found." };
    }

    // Prevent predicting if the match has already started (Discipline metric!)
    if (new Date() >= match.startTime || match.status !== "SCHEDULED") {
      return { success: false, error: "Match has already begun. Lock-in failed." };
    }

    // 4. Check if they already predicted this match
    const existingPrediction = await db.prediction.findFirst({
      where: {
        userId: user.id,
        matchId: matchId,
      },
    });

    if (existingPrediction) {
      // If it exists, they are just changing their mind before it starts
      await db.prediction.update({
        where: { id: existingPrediction.id },
        data: { pick },
      });
    } else {
      // 5. Create the new prediction memory
      await db.prediction.create({
        data: {
          userId: user.id,
          matchId: matchId,
          pick: pick,
          outcome: "PENDING",
        },
      });
    }

    // 6. Tell Next.js to refresh the dashboard so the UI updates instantly
    revalidatePath("/dashboard");
    
    return { success: true };
  } catch (error) {
    console.error("Prediction Error:", error);
    return { success: false, error: "System failure. Could not lock in prediction." };
  }
}