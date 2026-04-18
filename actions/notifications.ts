"use server";

import { db } from "@/lib/db";
import { auth } from "@clerk/nextjs/server";

export async function getRecentNotifications() {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) return [];

    const user = await db.user.findUnique({
      where: { clerkId },
      select: { id: true }
    });

    if (!user) return [];

    // Fetch the 5 most recent GigaScore logs to act as notifications
    const recentLogs = await db.gigaScoreLog.findMany({
      where: { userId: user.id },
      orderBy: { timestamp: "desc" },
      take: 5,
    });

    return recentLogs;
  } catch (error) {
    console.error("Failed to fetch notifications:", error);
    return [];
  }
}
