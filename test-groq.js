require('dotenv').config();
const Groq = require("groq-sdk");

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

async function main() {
  console.log("Checking Groq Connection...");
  try {
    const chatCompletion = await groq.chat.completions.create({
      messages: [{ role: "user", content: "Roast me in one sentence." }],
      model: "llama3-8b-8192",
    });
    console.log("✅ SUCCESS!");
    console.log("AI Says:", chatCompletion.choices[0]?.message?.content);
  } catch (error) {
    console.log("❌ ERROR:", error.message);
    if (error.message.includes("401")) {
        console.log("👉 FIX: Your API Key is invalid or missing from .env");
    }
  }
}

main();