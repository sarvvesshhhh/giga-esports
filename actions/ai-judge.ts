"use server";

import { Groq } from "groq-sdk";
import { db } from "@/lib/db";
import { auth } from "@clerk/nextjs/server";

// 1. Robust Initialization
const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY || "dummy_key_for_build",
});

export async function generateDailyVerdict() {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) return { success: false, error: "Unauthorized" };

    // 2. Fetch User Data
    const user = await db.user.findUnique({
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

    if (!user) return { success: false, error: "User profile not found" };

    // 3. Check if we already have a verdict for today
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const existingVerdict = await db.dailyVerdict.findFirst({
      where: {
        userId: user.id,
        date: { gte: startOfDay },
      },
    });

    if (existingVerdict) {
      return { success: true, data: existingVerdict };
    }

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
      const mockVerdict = await db.dailyVerdict.create({
        data: {
          userId: user.id,
          narrative: "SYSTEM OPERATIONAL. WAITING FOR JUDGMENT PROTOCOLS.",
          mood: "NEUTRAL",
        },
      });
      return { success: true, data: mockVerdict };
    }

    // 6. The "Giga" System Prompt
    const systemPrompt = `
      You are the GigaEsports AI. You represent the peak of esports discipline and excellence. 
      Your tone is stoic, powerful, and heavily influenced by "Gigachad" internet culture.

      Your Task: Judge the user's recent performance data.

      Directives:
      - **High Performance (Score Up/Winning):** Use terms like "King," "Mogging," "Locked in," "Pure cinema."
      - **Low Performance (Score Down/Losing):** Be brutally honest. "Hit the aim trainer," "Fix the mental," "Stop throwing."
      - **Inactivity:** Express disappointment. "The grind does not stop," "Beta mindset detected."
      
      Constraints:
      - Keep it under 20 words. Short. Punchy.
      - Output JSON only.

      Output format:
      {
        "narrative": "Your short Giga text here.",
        "mood": "IMPRESSED" | "NEUTRAL" | "WARNING" | "CRITICAL"
      }
    `;

    // 7. Call Groq (UPDATED MODEL HERE)
    try {
      const chatCompletion = await groq.chat.completions.create({
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: `Judge this user:\n${contextSummary}` },
        ],
        // UPDATED: Using the latest supported model
        model: "llama-3.3-70b-versatile", 
        temperature: 0.8,
        response_format: { type: "json_object" },
      });

      const aiResponse = JSON.parse(
        chatCompletion.choices[0]?.message?.content || "{}"
      );

      const narrative =
        aiResponse.narrative ||
        "Silence. The data is unclear. Return to the lobby.";
      const mood = aiResponse.mood || "NEUTRAL";

      // 8. Persist to DB
      const verdict = await db.dailyVerdict.create({
        data: {
          userId: user.id,
          narrative: narrative,
          mood: mood,
        },
      });

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