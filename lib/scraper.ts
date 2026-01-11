import * as cheerio from 'cheerio';

export async function scrapeMatchData(matchId: string) {
  const url = `https://www.vlr.gg/${matchId}`;
  console.log(`🕷️ GIGA SCRAPER: Infiltrating ${url}...`);

  try {
    const res = await fetch(url, { 
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      },
      cache: 'no-store' 
    });

    if (!res.ok) throw new Error(`Failed to load page: ${res.status}`);
    
    const html = await res.text();
    const $ = cheerio.load(html);

    // 1. SCRAPE TEAMS
    const teamNames = $('.match-header-link-name').map((i, el) => $(el).text().trim()).get();
    const team1Name = teamNames[0] || "Team A";
    const team2Name = teamNames[1] || "Team B";

    // 2. SCRAPE SCORES
    const scores = $('.match-header-vs-score span').map((i, el) => $(el).text().trim()).get();
    const score1 = scores[0] || "0";
    const score2 = scores[2] || "0"; // index 1 is usually a separator

    // 3. SCRAPE PLAYERS
    // VLR lists players in tables. We grab the 'text-of' class inside tables.
    const allPlayers: any[] = [];
    
    // Iterate over both team tables
    $('.vm-stats-game').first().find('.mod-t').each((teamIndex, table) => {
        const teamName = teamIndex === 0 ? team1Name : team2Name;
        // In VLR, team ID isn't easy to get, so we assign by name
        const teamId = teamIndex === 0 ? "team1" : "team2"; 

        $(table).find('tbody tr').each((rowIndex, row) => {
            const playerName = $(row).find('.text-of').first().text().trim().split('\n')[0];
            const agentImg = $(row).find('img').attr('src') || "";
            // Extract agent name from image src (e.g., /img/v1/agents/jett.png)
            const agent = agentImg.split('/').pop()?.split('.')[0] || "unknown";

            if (playerName) {
                allPlayers.push({
                    name: playerName,
                    agent: agent,
                    team_id: teamId // artificial ID to group them later
                });
            }
        });
    });

    console.log(`✅ SCRAPE SUCCESS: Found ${allPlayers.length} players.`);

    return {
        id: matchId,
        team1: { id: "team1", name: team1Name },
        team2: { id: "team2", name: team2Name },
        score1,
        score2,
        status: "LIVE", // Assumed if we are scraping
        players: allPlayers,
        event: $('.match-header-super div').first().text().trim() || "Valorant Event",
        tournament: $('.match-header-super div').last().text().trim() || "Tournament"
    };

  } catch (err) {
    console.error("❌ SCRAPE FAILED:", err);
    return null;
  }
}