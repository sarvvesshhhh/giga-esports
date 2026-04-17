"use server";

import { Groq } from "groq-sdk";
import { db } from "@/lib/db";
import { auth } from "@clerk/nextjs/server";
import { syncUser } from "./auth";

// 1. Robust Initialization
const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY || "dummy_key_for_build",
});

export async function generateDailyVerdict() {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) return { success: false, error: "Unauthorized" };

    // 2. Fetch User Data
    let user = await db.user.findUnique({
      where: { clerkId },
      include: {
        scoreHistory: {
          orderBy: { timestamp: "desc" },
          take: 2,
        },
        predictions: {
          orderBy: { createdAt: "desc" },
          take: 5,
        },
      },
    });

    if (!user) {
      await syncUser();
      user = await db.user.findUnique({
        where: { clerkId },
        include: {
          scoreHistory: { orderBy: { timestamp: "desc" }, take: 2 },
          predictions: { orderBy: { createdAt: "desc" }, take: 5 },
        },
      });
    }

    if (!user) return { success: false, error: "User profile not found" };

    // 3. Find if we already have a verdict for today (to prevent DB bloat)
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const existingVerdict = await db.dailyVerdict.findFirst({
      where: {
        userId: user.id,
        date: { gte: startOfDay },
      },
    });

    // NOTE: We REMOVED the early return here. We want a fresh Groq call EVERY time.

    // 4. Data Synthesis
    const currentScore = user.scoreHistory[0]?.newScore || 500;
    const previousScore = user.scoreHistory[1]?.newScore || 500;
    const scoreDelta = currentScore - previousScore;

    const recentPredictions = user.predictions
      .map((p) => {
        if (p.outcome === "CORRECT") return "W";
        if (p.outcome === "INCORRECT") return "L";
        return "-";
      })
      .join(" ");

    const contextSummary = `
      Current GigaScore: ${currentScore}
      Delta: ${scoreDelta > 0 ? "+" : ""}${scoreDelta}
      Recent Form: ${recentPredictions}
      Streak: ${user.currentStreak || 0} days
    `;

    // 5. SAFETY CHECK: Missing API Key Fallback
    if (!process.env.GROQ_API_KEY) {
      console.warn("⚠️ NO GROQ_API_KEY FOUND. USING FALLBACK.");
      return { 
        success: true, 
        data: { narrative: "SYSTEM OPERATIONAL. AWAITING API KEY.", mood: "NEUTRAL" } 
      };
    }

    // 6. The "Giga" System Prompt - UPDATED FOR EXTREME VARIETY
    const systemPrompt = `
      You are the GigaEsports AI. You represent the absolute peak of esports discipline, brutal truth, and elite performance. 
      Your tone is stoic, powerful, and heavily influenced by "Gigachad" internet culture.

      CRITICAL DIRECTIVE: NEVER REPEAT YOURSELF. Be highly creative, unpredictable, and use varied vocabulary. 

      Your Task: Judge the user's recent performance data.

      Guidelines:
      - High Performance (Score Up/Winning): Praise them like a warlord. Use terms like "Absolute Cinema," "Mogging the grid," "Aura expanding," "Unstoppable force."
      - Low Performance (Score Down/Losing): Be brutally honest but varied. "Hit the aim trainer," "Tactical disaster," "Fix your mental," "Embarrassing read."
      - Inactivity/0 Streak: DO NOT just say "Beta mindset". Invent new insults for laziness. "Ghosting the grid? Pathetic," "Your aura is fading," "Status: AFK. Honor: Depleted," "The grind does not pause."
      
      Constraints:
      - Keep it under 15 words. Short. Punchy. Devastating.
      - Output JSON only.

      Output format:
      {
        "narrative": "Your short, unique Giga text here.",
        "mood": "IMPRESSED" | "NEUTRAL" | "WARNING" | "CRITICAL"
      }
    `;

    // 7. Call Groq
    try {
      const chatCompletion = await groq.chat.completions.create({
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: `Judge this user:\n${contextSummary}` },
        ],
        model: "llama-3.3-70b-versatile", 
        // Bumped temperature slightly for more creative, chaotic responses
        temperature: 0.9,
        response_format: { type: "json_object" },
      });

      const aiResponse = JSON.parse(
        chatCompletion.choices[0]?.message?.content || "{}"
      );

      const narrative =
        aiResponse.narrative ||
        "SILENCE. THE DATA IS UNCLEAR. RETURN TO LOBBY.";
      const mood = aiResponse.mood || "NEUTRAL";

      // 8. Persist to DB (Update today's record if it exists, otherwise create)
      let verdict;
      if (existingVerdict) {
        verdict = await db.dailyVerdict.update({
          where: { id: existingVerdict.id },
          data: {
            narrative: narrative,
            mood: mood,
          },
        });
      } else {
        verdict = await db.dailyVerdict.create({
          data: {
            userId: user.id,
            narrative: narrative,
            mood: mood,
          },
        });
      }

      return { success: true, data: verdict };

    } catch (apiError) {
      console.error("❌ Groq API Failed:", apiError);
      return {
        success: true,
        data: {
          narrative: "NEURAL LINK SEVERED. JUDGMENT PENDING.",
          mood: "WARNING",
        },
      };
    }
  } catch (error) {
    console.error("AI Judge Fatal Error:", error);
    return { success: false, error: "Internal Server Error" };
  }
}