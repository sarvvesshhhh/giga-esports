const BASE_URL = "https://api.pandascore.co";
const TOKEN = process.env.PANDASCORE_TOKEN;

async function fetchPanda(endpoint: string) {
  if (!TOKEN) {
    console.error("❌ PANDASCORE_TOKEN is missing in .env");
    return null;
  }
  
  const url = `${BASE_URL}${endpoint}`;
  console.log(`📡 Fetching: ${url}`); // Log what we are fetching

  try {
    const res = await fetch(url, {
      headers: {
        Authorization: `Bearer ${TOKEN}`,
        Accept: "application/json",
      },
      next: { revalidate: 60 },
    });

    if (!res.ok) {
      console.error(`❌ PandaScore Error [${res.status}]: ${res.statusText}`);
      // Don't throw error, just return null so UI handles it gracefully
      return null;
    }
    
    return res.json();
  } catch (err) {
    console.error("❌ API Network Error:", err);
    return null;
  }
}

export async function getUpcomingMatches() {
  // Filter for: Valorant, PUBG Mobile, Free Fire
  const games = "valorant,pubg-mobile,pubg,free-fire";
  return fetchPanda(`/matches/upcoming?sort=begin_at&filter[videogame]=${games}&per_page=10`);
}

export async function getTournaments() {
  return fetchPanda("/tournaments/running?sort=begin_at&per_page=10");
}

export async function getMatchDetails(matchId: string) {
  // Fetch single match
  return fetchPanda(`/matches/${matchId}`);
}