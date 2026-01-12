import { auth, currentUser } from "@clerk/nextjs/server";
import { PrismaClient } from "@prisma/client";

// This prevents multiple instances of Prisma Client in development
const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma = globalForPrisma.prisma || new PrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

// 🛡️ PROTOCOL: Fetches or Creates a Giga User based on Clerk Auth
export async function getGigaUser() {
  const { userId } = await auth(); 
  const user = await currentUser();

  if (!userId || !user) return null;

  let gigaUser = await prisma.user.findUnique({
    where: { clerkId: userId },
    include: { predictions: true } 
  });

  if (!gigaUser) {
    console.log("🆕 INITIALIZING NEW SUBJECT INTO PROTOCOL...");
    gigaUser = await prisma.user.create({
      data: {
        clerkId: userId,
        username: user.username || user.firstName || "Agent",
        gigaScore: 1000,
        archetype: "INITIATE",
      },
      include: { predictions: true }
    });
  }

  return gigaUser;
}