// lib/feed.ts
import { prisma } from "@/lib/user";

export async function getRecentActivity() {
  return await prisma.prediction.findMany({
    where: {
      status: { in: ["WON", "LOST"] } // Only show completed judgments
    },
    include: {
      user: { select: { username: true } }
    },
    orderBy: { createdAt: 'desc' },
    take: 5
  });
}