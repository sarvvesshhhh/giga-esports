"use server";

import { db } from "@/lib/db"; 
// Assuming this exports your initialized Prisma Client: 
// export const db = new PrismaClient();

export async function syncUpcomingValorantMatches() {
  try {
    // 1. Fetching from an open-source VLR.gg API wrapper
    // (You can swap this URL if you find a different wrapper you prefer)
    const res = await fetch("https://vlrggapi.vercel.app/match/upcoming", {
      next: { revalidate: 3600 }, // Cache the fetch for 1 hour to prevent rate limits
    });

    if (!res.ok) {
      throw new Error("Failed to fetch upcoming Valorant matches");
    }

    const json = await res.json();
    
    // Most VLR APIs return the array inside a 'data' or 'segments' property.
    // Adjust these property names if the JSON structure of your specific wrapper differs slightly.
    const matches = json.data?.segments || json.data || [];
    let syncedCount = 0;

    for (const match of matches) {
      // 2. Data Cleaning: Skip matches where teams are "TBD" (To Be Decided)
      if (match.team1 === "TBD" || match.team2 === "TBD") continue;
      if (!match.match_id) continue; 

      // 3. Write to Database (Memory) using Upsert
      await db.match.upsert({
        where: {
          externalId: match.match_id.toString(), // The unique ID from VLR [cite: 142]
        },
        update: {
          // If the match already exists, just update the time in case it was rescheduled
          startTime: new Date(match.unix_timestamp * 1000), 
          tournName: match.tournament_name,
        },
        create: {
          // If it's a new match, create it using your exact Prisma schema
          externalId: match.match_id.toString(),
          game: "VALORANT", 
          tournName: match.tournament_name,
          teamA: match.team1,
          teamB: match.team2,
          startTime: new Date(match.unix_timestamp * 1000),
          status: "SCHEDULED", // Matches your enum MatchStatus.SCHEDULED
          processedForScore: false,
        },
      });
      
      syncedCount++;
    }

    return { success: true, message: `Successfully synced ${syncedCount} upcoming matches.` };

  } catch (error) {
    console.error("Error syncing matches:", error);
    return { success: false, message: "Failed to sync matches." };
  }
}