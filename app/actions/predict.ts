"use server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/user"; // Your Prisma singleton
import { revalidatePath } from "next/cache";

export async function lockInPrediction(formData: FormData) {
  const { userId: clerkId } = await auth(); // Get logged in user
  if (!clerkId) throw new Error("Unauthorized");

  const matchId = formData.get("matchId") as string;
  const teamPick = formData.get("teamPick") as string;
  const confidence = formData.get("confidence") as string;

  // 1. Find our internal User ID via the Clerk ID
  const user = await prisma.user.findUnique({
    where: { clerkId },
  });

  if (!user) throw new Error("User not found in Protocol");

  // 2. Prevent Double-Dipping (Check if already predicted)
  const existing = await prisma.prediction.findFirst({
    where: { userId: user.id, matchId },
  });

  if (existing) throw new Error("Verdict already locked.");

  // 3. Create the Prediction record
  await prisma.prediction.create({
    data: {
      userId: user.id,
      matchId,
      teamPick,
      confidence,
    },
  });

  revalidatePath(`/valorant/${matchId}`);
}