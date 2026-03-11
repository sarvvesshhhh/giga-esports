"use server";

import { db } from "@/lib/db";
import { MatchStatus } from "@prisma/client";

const PANDA_BASE_URL = "https://api.pandascore.co";
const LIQUI_BASE_URL = "https://api.liquipedia.net/api/v3/match";

// -----------------------------------------------------------------------------
// 1. DATA NORMALIZATION HELPERS 
// -----------------------------------------------------------------------------

/**
 * Liquipedia Normalization Logic (Specialized for BGMI/PUBGM)
 * Uses official API v3 conditions
 */
async function fetchLiquipediaMatches() {
  const apiKey = process.env.LIQUIPEDIA_API_KEY;
  if (!apiKey) {
    console.warn("⚠️ Missing LIQUIPEDIA_API_KEY - Skipping BGMI sync");
    return [];
  }

  // Conditions: target pubgmobile wiki and ensure we get relevant dates
  const conditions = "[[wiki::pubgmobile]] AND [[date::>2026-01-01]]";
  const url = `${LIQUI_BASE_URL}?wiki=pubgmobile&conditions=${encodeURIComponent(conditions)}`;

  try {
    const res = await fetch(url, {
      method: "GET",
      headers: {
        Authorization: `Apikey ${apiKey}`,
        "Accept-Encoding": "gzip", // Required by Liquipedia
      },
      next: { revalidate: 3600 }, // Cache for 1 hour
    });

    if (!res.ok) {
      console.error("Liquipedia API Error:", res.statusText);
      return [];
    }

    const data = await res.json();
    if (!data.result) return [];

    return data.result.map((m: any) => ({
      externalId: m.id || `lp-${m.date}-${m.opponent1}`,
      tournName: m.tournament || "Liquipedia Pro Event",
      teamA: m.opponent1 || "TBD",
      teamB: m.opponent2 || "TBD",
      startTime: new Date(m.date),
      game: "pubgmobile",
      // Map Liquipedia "finished" string to Prisma Enum
      status: m.finished === "1" ? MatchStatus.FINISHED : MatchStatus.SCHEDULED,
      winner: m.winner === "1" ? m.opponent1 : m.winner === "2" ? m.opponent2 : null,
    }));
  } catch (err) {
    console.error("Liquipedia Fetch Crash:", err);
    return [];
  }
}

/**
 * PandaScore Normalization Logic (For CS2, Valorant, etc.)
 */
async function fetchPandaScoreMatches(gameSlug: string) {
  const apiKey = process.env.PANDASCORE_API_KEY;
  if (!apiKey) {
    console.warn(`⚠️ Missing PANDASCORE_API_KEY - Skipping ${gameSlug} sync`);
    return [];
  }

  try {
    const res = await fetch(
      `${PANDA_BASE_URL}/${gameSlug}/matches/upcoming?token=${apiKey}`,
      { next: { revalidate: 3600 } }
    );

    if (!res.ok) return [];

    const data = await res.json();

    return data.map((m: any) => ({
      externalId: String(m.id),
      tournName: m.league.name,
      teamA: m.opponents[0]?.opponent.name || "TBD",
      teamB: m.opponents[1]?.opponent.name || "TBD",
      startTime: new Date(m.begin_at),
      game: gameSlug,
      status: MatchStatus.SCHEDULED,
    }));
  } catch (err) {
    console.error(`PandaScore Fetch Crash (${gameSlug}):`, err);
    return [];
  }
}

// -----------------------------------------------------------------------------
// 2. SERVER ACTIONS (The Handshake)
// -----------------------------------------------------------------------------

/**
 * CORE SYNC ACTION: The "Memory" Layer
 * Call this via a Cron Job or Admin Button to populate your DB.
 */
export async function syncAllEsportsData() {
  try {
    console.log(">>> GigaEsports: Initiating Multi-Provider Sync...");

    // Execute all fetches in parallel
    const [pubgm, csgo, valorant] = await Promise.all([
      fetchLiquipediaMatches(),
      fetchPandaScoreMatches("csgo"),
      fetchPandaScoreMatches("valorant"),
    ]);

    const allMatches = [...pubgm, ...csgo, ...valorant];

    if (allMatches.length === 0) {
      console.warn(">>> GigaEsports: No matches found to sync.");
      return { success: false, message: "No data retrieved" };
    }

    // Atomic Upsert: This is the "Memory" layer
    const upsertPromises = allMatches.map((match) =>
      db.match.upsert({
        where: { externalId: match.externalId },
        update: {
          status: match.status,
          startTime: match.startTime,
          winner: match.winner,
        },
        create: {
          externalId: match.externalId,
          tournName: match.tournName,
          teamA: match.teamA,
          teamB: match.teamB,
          startTime: match.startTime,
          game: match.game,
          status: match.status,
          winner: match.winner,
        },
      })
    );

    await Promise.all(upsertPromises);

    console.log(
      `>>> GigaEsports Sync Complete: ${allMatches.length} matches normalized.`
    );
    return { success: true, count: allMatches.length };
  } catch (error) {
    console.error(">>> GigaEsports Sync CRITICAL FAILURE:", error);
    return { success: false, error: "Database Synchronization Failed" };
  }
}

/**
 * LIVE MATCHES FETCHER (For Frontend UI Rail)
 * This bypasses the DB for speed to get "Now Playing" streams.
 */
export async function getLiveMatches() {
  const API_KEY = process.env.PANDASCORE_API_KEY;

  if (!API_KEY) return [];

  try {
    // UPDATED: Added /valorant before /matches/running to filter out CSGO/LoL
    const response = await fetch(
      `${PANDA_BASE_URL}/matches/running?sort=-begin_at&page[size]=3`,
      {
        headers: {
          Authorization: `Bearer ${API_KEY}`,
          Accept: "application/json",
        },
        next: { revalidate: 60 },
      }
    );

    if (!response.ok) return [];

    return await response.json();
  } catch (error) {
    console.error("Failed to fetch live matches:", error);
    return [];
  }
}

/**
 * UPCOMING MATCHES FETCHER (For Prediction Queue)
 * Pulls directly from our structured database memory to feed the UI.
 */
export async function getUpcomingMatches() {
  try {
    const upcoming = await db.match.findMany({
      where: {
        status: MatchStatus.SCHEDULED,
        startTime: {
          gt: new Date(), // Only grab matches that haven't started yet
        },
      },
      orderBy: {
        startTime: "asc", 
      },
      take: 6, // Keep the dashboard grid clean
    });
    
    return upcoming;
  } catch (error) {
    console.error("Failed to fetch upcoming matches from DB:", error);
    return [];
  }
}