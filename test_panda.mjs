import fetch from "node-fetch";
import dotenv from "dotenv";
dotenv.config();

async function testPandaScore() {
  const token = process.env.PANDASCORE_API_KEY;
  if (!token) {
    console.error("No token");
    return;
  }
  
  try {
    // Let's get some past matches to see what a "finished" match looks like
    const res = await fetch(`https://api.pandascore.co/matches/past?page[size]=1&token=${token}`);
    const data = await res.json();
    console.log(JSON.stringify(data, null, 2));
  } catch (error) {
    console.error(error);
  }
}

testPandaScore();
