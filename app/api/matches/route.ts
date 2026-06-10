import { NextResponse } from 'next/server'
import { getWorldCupMatches } from '@/lib/football-data'
import { MOCK_MATCHES } from '@/lib/matches'
import type { Match } from '@/lib/matches'

// Map API shape → our internal Match type
function mapToMatch(m: Awaited<ReturnType<typeof getWorldCupMatches>>[0]): Match {
    return {
        id: m.id,
        utcDate: m.utcDate,
        status: m.status as Match['status'],
        stage: m.stage,
        group: m.group ?? undefined,
        venue: m.venue ?? 'TBC',
        homeTeam: {
            name: m.homeTeam.name,
            short: m.homeTeam.tla,
            flag: m.homeTeam.crest,
        },
        awayTeam: {
            name: m.awayTeam.name,
            short: m.awayTeam.tla,
            flag: m.awayTeam.crest,
        },
        score: {
            home: m.score.fullTime.home,
            away: m.score.fullTime.away,
        },
    }
}

export async function GET() {
    try {
        const apiMatches = await getWorldCupMatches()

        // If API returned nothing, fall back to mock
        if (!apiMatches.length) {
            return NextResponse.json({
                source: 'mock',
                matches: MOCK_MATCHES,
            })
        }

        return NextResponse.json({
            source: 'api',
            matches: apiMatches.map(mapToMatch),
        })
    } catch (err) {
        console.error('[WESHTV] Route error:', err)
        return NextResponse.json({
            source: 'mock',
            matches: MOCK_MATCHES,
        })
    }
}