import Groq from "groq-sdk";

const apiKey = process.env.GROQ_API_KEY;

const groq = new Groq({
  apiKey: apiKey || "dummy_key", 
  dangerouslyAllowBrowser: true 
});

const SYSTEM_PROMPT = `
You are the "GigaEsports Judge". 
Analyze the user's Esports prediction for logic, probability, and confidence.
Assign a "GigaIQ" score from 0 (Delusional) to 100 (Genius).

FORMAT YOUR RESPONSE EXACTLY LIKE THIS:
SCORE | ROAST

Examples:
10 | That prediction is so bad I deleted it from my memory.
85 | Bold strategy. The data supports your arrogance.
40 | You are confusing hope with probability.
`;

export async function judgePrediction(prediction: string) {
  if (!apiKey) return { score: 0, text: "System Error" };

  try {
    const completion = await groq.chat.completions.create({
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: `Prediction: ${prediction}` },
      ],
      model: "llama-3.3-70b-versatile",
    });

    const raw = completion.choices[0]?.message?.content || "50 | System Glitch.";
    
    // Parse the "85 | Text" format
    const [scoreStr, text] = raw.split("|");
    const score = parseInt(scoreStr.trim());

    return { 
      score: isNaN(score) ? 50 : score, 
      text: text.trim() 
    };

  } catch (error) {
    console.error("GROQ ERROR:", error);
    return { score: 0, text: "System Overload." };
  }
}

// Keep the old simple function for general roasts
export async function getVerdict(userName: string, context: string) {
  // reusing the logic for simple text returns
  const res = await judgePrediction(`User: ${userName}. Context: ${context}`);
  return res.text;
}

// Add this to lib/judge.ts

export async function judgeArchetype(scenario: string, choice: string) {
  if (!apiKey) return { score: 50, archetype: "UNKNOWN", text: "AI Offline" };

  try {
    const completion = await groq.chat.completions.create({
      messages: [
        { 
          role: "system", 
          content: "You are an Esports Analyst. Return ONLY this format: SCORE (0-100) | ARCHETYPE (Max 2 words) | 1 Sentence Roast." 
        },
        { 
          role: "user", 
          content: `Scenario: ${scenario}. Choice: ${choice}` 
        },
      ],
      model: "llama-3.3-70b-versatile",
    });

    const raw = completion.choices[0]?.message?.content || "50 | ERROR | System Fail";
    const parts = raw.split("|");
    
    return {
      score: parseInt(parts[0]) || 50,
      archetype: parts[1]?.trim().toUpperCase().substring(0, 20) || "WILD CARD",
      text: parts[2]?.trim() || "The AI is speechless."
    };

  } catch (error) {
    return { score: 50, archetype: "GLITCH", text: "System Overload." };
  }
}