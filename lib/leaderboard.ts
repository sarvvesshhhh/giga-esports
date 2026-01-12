import { prisma } from "@/lib/user";

export async function getTopGigaUsers(limit: number = 20) {
  return await prisma.user.findMany({
    orderBy: {
      gigaScore: 'desc', // Sort highest score first
    },
    take: limit, // Only fetch the top 20 for performance
    select: {
      id: true,
      username: true,
      gigaScore: true,
      archetype: true,
      // Exclude sensitive data like clerkId
    },
  });
}