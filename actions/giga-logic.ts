"use server";

import { db } from "@/lib/db";
import { differenceInDays } from "date-fns";
import { syncUser } from "./auth";

/**
 * GigaScore Algorithm: Behavioral Identity Metric
 * Handles: Accuracy, Consistency (Streaks), and Time-Decay
 */
export async function calculateGigaScore(userId: string, isCorrect?: boolean) {
  let user = await db.user.findUnique({
    where: { id: userId },
    select: { 
      id: true, 
      gigaScore: true, 
      lastActiveDate: true, 
      currentStreak: true 
    }
  });

  if (!user) {
    await syncUser();
    user = await db.user.findUnique({
      where: { id: userId },
      select: { 
        id: true, 
        gigaScore: true, 
        lastActiveDate: true, 
        currentStreak: true 
      }
    });
  }

  if (!user) throw new Error("User not found");

  let newScore = user.gigaScore;
  let newStreak = user.currentStreak;
  const now = new Date();

  // --- 1. TIME-DECAY: Penalty for Inactivity [Source 178] ---
  const daysInactive = differenceInDays(now, user.lastActiveDate);
  if (daysInactive > 1) {
    // 2% Decay per day of total inactivity after 24 hours [Source 178]
    const decayFactor = Math.pow(0.98, daysInactive - 1);
    newScore = newScore * decayFactor;
    newStreak = 0; // Reset consistency streak [Source 175]
  }

  // --- 2. ACCURACY & CONSISTENCY: Prediction Logic [Source 176] ---
  if (isCorrect !== undefined) {
    const BASE_REWARD = 10;
    // Multiplier: 10% bonus per streak point, capped at 2.0x [Source 175]
    const streakMultiplier = Math.min(1 + (newStreak * 0.1), 2.0);

    if (isCorrect) {
      newScore += (BASE_REWARD * streakMultiplier);
      newStreak += 1;
    } else {
      // Wrong predictions hurt more if you broke a high streak [Source 176]
      newScore -= (BASE_REWARD / 2) * (1 / streakMultiplier);
      newStreak = 0; 
    }
  }

  // --- 3. PERSISTENCE: Database as Memory [Source 196] ---
  return await db.user.update({
    where: { id: userId },
    data: {
      gigaScore: Math.max(0, newScore),
      currentStreak: newStreak,
      lastActiveDate: now,
      // Log for long-term behavior analysis [Source 248]
      scoreHistory: {
        create: {
          changeAmount: newScore - user.gigaScore,
          newScore: newScore,
          reason: isCorrect === undefined ? "Inactivity Decay" : (isCorrect ? "Prediction Win" : "Prediction Loss")
        }
      }
    }
  });
}