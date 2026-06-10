import type { Match } from './matches'
import { MOCK_MATCHES } from './matches'

const BASE = 'https://api.football-data.org/v4'
const KEY = process.env.NEXT_PUBLIC_FOOTBALL_API_KEY ?? ''

// Shape from football-data.org API
interface APIMatch {
    id: number
    utcDate: string
    status: string
    stage: string
    group?: string
    homeTeam: { shortName: string; name: string; crest: string }
    awayTeam: { shortName: string; name: string; crest: string }
    score: {
        fullTime: { home: number | null; away: number | null }
    }
    venue?: string
}

// Map API shape → our internal Match shape
function mapMatch(m: APIMatch): Match {
    return {
        id: m.id,
        utcDate: m.utcDate,
        status: m.status as Match['status'],
        stage: m.stage,
        group: m.group,
        venue: m.venue ?? 'TBC',
        homeTeam: {
            name: m.homeTeam.name,
            short: m.homeTeam.shortName,
            flag: m.homeTeam.crest, // crest URL from API, we use emoji in mock
        },
        awayTeam: {
            name: m.awayTeam.name,
            short: m.awayTeam.shortName,
            flag: m.awayTeam.crest,
        },
        score: {
            home: m.score.fullTime.home,
            away: m.score.fullTime.away,
        },
    }
}

// Fetch World Cup 2026 matches — falls back to mock if no API key
export async function fetchMatches(): Promise<Match[]> {
    if (!KEY) {
        console.info('[WESHTV] No API key — using mock data')
        return MOCK_MATCHES
    }

    try {
        const res = await fetch(`${BASE}/competitions/WC/matches`, {
            headers: { 'X-Auth-Token': KEY },
            next: { revalidate: 60 }, // cache 60s, Next.js ISR
        })

        if (!res.ok) {
            console.warn(`[WESHTV] API error ${res.status} — falling back to mock`)
            return MOCK_MATCHES
        }

        const data = await res.json()
        return (data.matches as APIMatch[]).map(mapMatch)
    } catch (err) {
        console.warn('[WESHTV] Fetch failed — falling back to mock', err)
        return MOCK_MATCHES
    }
}

// Get matches for a specific date (YYYY-MM-DD)
export function filterByDate(matches: Match[], date: string): Match[] {
    return matches.filter(m => m.utcDate.startsWith(date))
}

// Get unique sorted dates from match list
export function getUniqueDates(matches: Match[]): string[] {
    const seen = new Set<string>()
    matches.forEach(m => seen.add(m.utcDate.split('T')[0]))
    return Array.from(seen).sort()
}