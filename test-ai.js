// test-ai.js
require('dotenv').config();
const { GoogleGenerativeAI } = require("@google/generative-ai");

const apiKey = process.env.GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(apiKey);

async function testModel(modelName) {
  console.log(`\n👉 Testing model: "${modelName}"...`);
  try {
    const model = genAI.getGenerativeModel({ model: modelName });
    const result = await model.generateContent("Say 'Success' if you can hear me.");
    console.log(`✅ SUCCESS! ${modelName} is working.`);
    console.log(`   Response: ${result.response.text()}`);
    return true;
  } catch (error) {
    console.log(`❌ FAILED: ${modelName}`);
    if (error.message.includes("404")) {
      console.log("   Reason: Model not found (404).");
    } else {
      console.log(`   Reason: ${error.message}`);
    }
    return false;
  }
}

async function main() {
  console.log("🔍 DIAGNOSTIC MODE STARTING...");
  console.log(`🔑 Key detected: ${apiKey ? apiKey.substring(0, 8) + "..." : "NONE"}`);

  // Test the 3 standard models
  const worked1 = await testModel("gemini-1.5-flash");
  if (worked1) return;

  const worked2 = await testModel("gemini-1.5-flash-001");
  if (worked2) return;

  const worked3 = await testModel("gemini-1.0-pro");
}

main();