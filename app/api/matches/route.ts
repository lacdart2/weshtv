import { NextResponse } from 'next/server'
import { getWorldCupMatches } from '@/lib/football-data'
import { MOCK_MATCHES } from '@/lib/matches'
import type { Match } from '@/lib/matches'

// Map API shape → our internal Match type

type APIMatchWithExtraStats = Awaited<ReturnType<typeof getWorldCupMatches>>[0] & {
    minute?: number | null
    score: Awaited<ReturnType<typeof getWorldCupMatches>>[0]['score'] & {
        halfTime?: {
            home: number | null
            away: number | null
        } | null
        duration?: 'REGULAR' | 'EXTRA_TIME' | 'PENALTY_SHOOTOUT' | string | null
    }
}
function mapToMatch(m: Awaited<ReturnType<typeof getWorldCupMatches>>[0]): Match {
    const apiMatch = m as APIMatchWithExtraStats

    return {
        id: apiMatch.id,
        utcDate: apiMatch.utcDate,
        status: apiMatch.status as Match['status'],
        stage: apiMatch.stage,
        group: apiMatch.group ?? undefined,
        venue: apiMatch.venue ?? 'TBC',
        homeTeam: {
            name: apiMatch.homeTeam.name,
            short: apiMatch.homeTeam.tla,
            flag: apiMatch.homeTeam.crest,
        },
        awayTeam: {
            name: apiMatch.awayTeam.name,
            short: apiMatch.awayTeam.tla,
            flag: apiMatch.awayTeam.crest,
        },
        score: {
            home: apiMatch.score.fullTime.home,
            away: apiMatch.score.fullTime.away,
        },
        minute: apiMatch.minute ?? undefined,
        halfTime: {
            home: apiMatch.score.halfTime?.home ?? null,
            away: apiMatch.score.halfTime?.away ?? null,
        },
        duration:
            apiMatch.score.duration === 'REGULAR' ||
                apiMatch.score.duration === 'EXTRA_TIME' ||
                apiMatch.score.duration === 'PENALTY_SHOOTOUT'
                ? apiMatch.score.duration
                : undefined,
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