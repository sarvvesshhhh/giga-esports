const GRID_ENDPOINT = "https://api-op.grid.gg/central-data/graphql";
const API_KEY = process.env.GRID_API_KEY;

export async function getValorantSchedule() {
  if (!API_KEY) {
    console.error("❌ GRID API KEY MISSING. Add GRID_API_KEY to .env.local");
    return [];
  }

  // GraphQL Query: Fetch upcoming Series (Matches)
  const query = `
    query GetUpcomingMatches {
      series(
        filter: { titleIds: [3], startScheduled: { gt: "${new Date().toISOString()}" } }
        orderBy: startScheduled_ASC
        first: 10
      ) {
        edges {
          node {
            id
            startScheduled
            title { name }
            tournament { name }
            teams {
              base {
                id
                name
                logoUrl
              }
            }
            format {
              name 
            }
          }
        }
      }
    }
  `;

  try {
    const res = await fetch(GRID_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-grid-token": API_KEY // Official Header for GRID
      },
      body: JSON.stringify({ query }),
      next: { revalidate: 60 }
    });

    if (!res.ok) throw new Error(`GRID API Error: ${res.statusText}`);
    
    const json = await res.json();
    
    if (json.errors) {
        console.error("❌ GRID GQL ERROR:", json.errors);
        return [];
    }

    // Transform GRID Data to Our App Format
    return json.data.series.edges.map(({ node }: any) => {
      // GRID returns teams in an array. We map them to team1/team2.
      const t1 = node.teams[0]?.base;
      const t2 = node.teams[1]?.base;

      return {
        id: node.id,
        team1: { name: t1?.name || "TBD", logo: t1?.logoUrl },
        team2: { name: t2?.name || "TBD", logo: t2?.logoUrl },
        time: new Date(node.startScheduled).toLocaleString('en-US', { 
            month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' 
        }),
        event: "Valorant Champions Tour", // Generic fallback or parse from tournament
        tournament: node.tournament?.name || "Official Match",
        match_page: `/valorant/${node.id}`,
        source: "grid"
      };
    });

  } catch (err) {
    console.error("❌ GRID ENGINE FAILED:", err);
    return [];
  }
}

export async function getValorantMatch(id: string) {
  if (!API_KEY) return null;

  // Query specific match details
  const query = `
    query GetMatchDetails {
      series(id: "${id}") {
        id
        startScheduled
        tournament { name }
        teams {
          base {
            id
            name
            logoUrl
            players {
               nickname
               firstName
               lastName
               imageUrl
            }
          }
        }
      }
    }
  `;

  try {
     const res = await fetch(GRID_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-grid-token": API_KEY },
      body: JSON.stringify({ query }),
      cache: "no-store"
    });
    const json = await res.json();
    const node = json.data?.series; // For single ID, GQL usually returns object or list filtered

    if (!node) return null;

    // Map Teams & Rosters
    const t1 = node.teams[0]?.base;
    const t2 = node.teams[1]?.base;

    // Helper to format roster
    const formatRoster = (teamData: any, teamId: string) => {
        if (!teamData?.players) return [];
        return teamData.players.map((p: any) => ({
            name: p.nickname,
            real_name: `${p.firstName || ''} ${p.lastName || ''}`,
            avatar: p.imageUrl,
            team_id: teamId,
            agent: "Active"
        }));
    };

    const players = [
        ...formatRoster(t1, "team1"),
        ...formatRoster(t2, "team2")
    ];

    return {
        id: node.id,
        team1: { name: t1?.name || "TBD", logo: t1?.logoUrl },
        team2: { name: t2?.name || "TBD", logo: t2?.logoUrl },
        score1: "0", // Upcoming matches usually 0-0
        score2: "0",
        status: "UPCOMING",
        players: players,
        event: "Valorant",
        tournament: node.tournament?.name,
        stream_channel: "valorant" // GRID doesn't always give stream links, safe default
    };

  } catch (err) {
      console.error("❌ GRID MATCH DETAIL FAILED:", err);
      return null;
  }
}