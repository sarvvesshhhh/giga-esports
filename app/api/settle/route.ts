import { NextResponse } from "next/server";
import { prisma } from "@/lib/user";

export async function GET(request: Request) {
  // 1. SECURITY HANDSHAKE
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response('Unauthorized Protocol Access', { status: 401 });
  }

  try {
    // 2. FETCH COMPLETED MATCHES
    const completedMatches = await prisma.match.findMany({
      where: { status: "COMPLETED" }
    });

    let settledCount = 0;

    for (const match of completedMatches) {
      // 3. FIND PENDING PREDICTIONS
      const predictions = await prisma.prediction.findMany({
        where: { 
          matchId: match.externalId,
          status: "PENDING"
        }
      });

      const winner = (match.score1 ?? 0) > (match.score2 ?? 0) ? match.team1 : match.team2;

      for (const pred of predictions) {
        const isCorrect = pred.teamPick === winner;
        
        // 4. POINT CALCULATION
        let points = isCorrect 
          ? (pred.confidence === "HIGH" ? 50 : 25) 
          : (pred.confidence === "HIGH" ? -40 : -20);

        // 5. ATOMIC UPDATE
        await prisma.$transaction([
          prisma.user.update({
            where: { id: pred.userId },
            data: { gigaScore: { increment: points } }
          }),
          prisma.prediction.update({
            where: { id: pred.id },
            data: { status: isCorrect ? "WON" : "LOST" }
          })
        ]);
        
        settledCount++;
      }
    }

    return NextResponse.json({ settled: settledCount });

  } catch (error) {
    return NextResponse.json({ error: "Protocol Error" }, { status: 500 });
  }
}