// actions/auth.ts
"use server";

import { currentUser } from "@clerk/nextjs/server";
import { db } from "@/lib/db"; // This points to your new root lib folder

export async function syncUser() {
  // 1. Get the current logged-in user from Clerk
  const user = await currentUser();

  if (!user) return null; // Not logged in

  // 2. Check if they exist in our Neon Database by clerkId
  const existingUser = await db.user.findUnique({
    where: {
      clerkId: user.id,
    },
  });

  // 3. If they exist, return them
  if (existingUser) return existingUser;

  const email = user.emailAddresses?.[0]?.emailAddress;

  if (email) {
    // Check if a user with this email already exists (e.g., they logged in with a different provider)
    const existingEmailUser = await db.user.findUnique({
      where: { email },
    });

    if (existingEmailUser) {
      // Update the clerkId so they regain access to their existing account data
      const updatedUser = await db.user.update({
        where: { email },
        data: { clerkId: user.id },
      });
      return updatedUser;
    }
  }

  // 4. If NOT, create them (The "Handshake")
  const newUser = await db.user.create({
    data: {
      clerkId: user.id,
      email: email || `${user.id}@no-email.com`,
      username: user.firstName || user.username || "Rookie",
      gigaScore: 500.0, // The starting score
    },
  });

  return newUser;
}