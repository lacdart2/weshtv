const BASE = 'https://api.football-data.org/v4'

export interface APITeam {
    id: number
    name: string
    shortName: string
    tla: string
    crest: string
}

export interface APIMatch {
    id: number
    utcDate: string
    status: 'SCHEDULED' | 'TIMED' | 'IN_PLAY' | 'PAUSED' | 'FINISHED' | 'SUSPENDED' | 'CANCELLED'
    stage: string
    group: string | null
    homeTeam: APITeam
    awayTeam: APITeam
    score: {
        fullTime: { home: number | null; away: number | null }
        halfTime: { home: number | null; away: number | null }
    }
    venue: string | null
}

export interface APIResponse {
    matches: APIMatch[]
}

export async function getWorldCupMatches(): Promise<APIMatch[]> {
    const apiKey = process.env.FOOTBALL_API_KEY

    if (!apiKey) {
        console.warn('[WESHTV] No FOOTBALL_API_KEY found — using mock data')
        return []
    }

    const res = await fetch(`${BASE}/competitions/WC/matches`, {
        headers: { 'X-Auth-Token': apiKey },
        next: { revalidate: 60 },
    })

    if (!res.ok) {
        console.error(`[WESHTV] API error: ${res.status}`)
        return []
    }

    const data: APIResponse = await res.json()
    return data.matches ?? []
}