"use server";

import { db } from "@/lib/db";
import { auth } from "@clerk/nextjs/server";
import { syncUser } from "./auth";

export async function getDashboardData() {
  const { userId: clerkId } = await auth();
  if (!clerkId) return { success: false, error: "Unauthorized" };

  let user = await db.user.findUnique({
    where: { clerkId },
    select: {
      gigaScore: true,
      currentStreak: true,
      // 1. Fetch Daily Verdicts
      dailyVerdicts: {
        take: 5,
        orderBy: { date: "desc" },
        select: { id: true, narrative: true, mood: true, date: true }
      },
      // 2. Fetch Score History (Corrected Field Names)
      scoreHistory: {
        take: 5,
        orderBy: { timestamp: "desc" }, // ✅ FIXED: timestamp
        select: { 
          id: true, 
          reason: true, 
          changeAmount: true, // ✅ FIXED: changeAmount
          timestamp: true     // ✅ FIXED: timestamp
        }
      }
    },
  });

  if (!user) {
    await syncUser();
    user = await db.user.findUnique({
      where: { clerkId },
      select: {
        gigaScore: true,
        currentStreak: true,
        dailyVerdicts: { take: 5, orderBy: { date: "desc" }, select: { id: true, narrative: true, mood: true, date: true } },
        scoreHistory: { take: 5, orderBy: { timestamp: "desc" }, select: { id: true, reason: true, changeAmount: true, timestamp: true } }
      },
    });
  }

  if (!user) return { success: false, error: "User not found" };

  // Calculate Rank
  let rank = "INITIATE";
  if (user.gigaScore >= 1000) rank = "BRONZE";
  if (user.gigaScore >= 2000) rank = "SILVER";
  if (user.gigaScore >= 5000) rank = "GIGA";

  // Combine logs for the feed
  const logs = [
    // Map Verdicts
    ...user.dailyVerdicts.map((v) => ({
      id: v.id,
      event: "AI JUDGMENT",
      delta: 0, 
      type: v.mood === "CRITICAL" ? "loss" : "neutral",
      time: v.date
    })),
    // Map Score History (Using corrected fields)
    ...user.scoreHistory.map((s) => ({
      id: s.id,
      event: s.reason || "SCORE UPDATE",
      delta: s.changeAmount, // ✅ FIXED
      type: s.changeAmount >= 0 ? "win" : "loss", // ✅ FIXED
      time: s.timestamp // ✅ FIXED
    }))
  ]
  .sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime())
  .slice(0, 5);

  return {
    success: true,
    data: {
      score: user.gigaScore,
      streak: user.currentStreak,
      rank: rank,
      logs: logs, 
    },
  };
}