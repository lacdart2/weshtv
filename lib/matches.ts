export type MatchStatus = 'SCHEDULED' | 'IN_PLAY' | 'PAUSED' | 'FINISHED'

export interface Match {
    id: number
    utcDate: string       // always UTC — we convert from here
    status: MatchStatus
    stage: string
    group?: string
    venue: string
    homeTeam: { name: string; short: string; flag: string }
    awayTeam: { name: string; short: string; flag: string }
    score: { home: number | null; away: number | null }
}

// Build UTC date string — hour is UTC
function utc(daysFromNow: number, utcHour: number): string {
    const d = new Date()
    d.setDate(d.getDate() + daysFromNow)
    d.setUTCHours(utcHour, 0, 0, 0)
    return d.toISOString()
}

/*
  Real World Cup kickoff times (UTC):
  US East afternoon  = 18:00 UTC  → Algeria 19:00, France 20:00, Norway 20:00
  US East evening    = 21:00 UTC  → Algeria 22:00, France 23:00, Norway 23:00
  US West late       = 00:00 UTC  → Algeria 01:00, France 02:00, Norway 02:00 ⚠️ next day
*/
export const MOCK_MATCHES: Match[] = [
    // TODAY — 3 matches at different times
    {
        id: 1,
        utcDate: utc(0, 18),
        status: 'FINISHED',
        stage: 'GROUP_STAGE', group: 'Group B',
        venue: 'AT&T Stadium, Dallas',
        homeTeam: { name: 'Algeria', short: 'ALG', flag: '🇩🇿' },
        awayTeam: { name: 'Brazil', short: 'BRA', flag: '🇧🇷' },
        score: { home: 2, away: 2 },
    },
    {
        id: 2,
        utcDate: utc(0, 21),
        status: 'IN_PLAY',
        stage: 'GROUP_STAGE', group: 'Group D',
        venue: 'MetLife Stadium, New Jersey',
        homeTeam: { name: 'France', short: 'FRA', flag: '🇫🇷' },
        awayTeam: { name: 'Morocco', short: 'MAR', flag: '🇲🇦' },
        score: { home: 1, away: 0 },
    },
    {
        id: 3,
        utcDate: utc(0, 0),   // midnight UTC = late night US West
        status: 'SCHEDULED',
        stage: 'GROUP_STAGE', group: 'Group A',
        venue: 'Rose Bowl, Los Angeles',
        homeTeam: { name: 'Argentina', short: 'ARG', flag: '🇦🇷' },
        awayTeam: { name: 'Mexico', short: 'MEX', flag: '🇲🇽' },
        score: { home: null, away: null },
    },
    // TOMORROW
    {
        id: 4,
        utcDate: utc(1, 18),
        status: 'SCHEDULED',
        stage: 'GROUP_STAGE', group: 'Group C',
        venue: 'SoFi Stadium, Los Angeles',
        homeTeam: { name: 'Spain', short: 'ESP', flag: '🇪🇸' },
        awayTeam: { name: 'Germany', short: 'GER', flag: '🇩🇪' },
        score: { home: null, away: null },
    },
    {
        id: 5,
        utcDate: utc(1, 21),
        status: 'SCHEDULED',
        stage: 'GROUP_STAGE', group: 'Group E',
        venue: "Levi's Stadium, San Jose",
        homeTeam: { name: 'Portugal', short: 'POR', flag: '🇵🇹' },
        awayTeam: { name: 'Norway', short: 'NOR', flag: '🇳🇴' },
        score: { home: null, away: null },
    },
    {
        id: 6,
        utcDate: utc(1, 0),
        status: 'SCHEDULED',
        stage: 'GROUP_STAGE', group: 'Group F',
        venue: 'Estadio Azteca, Mexico City',
        homeTeam: { name: 'England', short: 'ENG', flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿' },
        awayTeam: { name: 'Senegal', short: 'SEN', flag: '🇸🇳' },
        score: { home: null, away: null },
    },
    // DAY +2
    {
        id: 7,
        utcDate: utc(2, 18),
        status: 'SCHEDULED',
        stage: 'GROUP_STAGE', group: 'Group G',
        venue: 'BC Place, Vancouver',
        homeTeam: { name: 'Netherlands', short: 'NED', flag: '🇳🇱' },
        awayTeam: { name: 'Tunisia', short: 'TUN', flag: '🇹🇳' },
        score: { home: null, away: null },
    },
    {
        id: 8,
        utcDate: utc(2, 21),
        status: 'SCHEDULED',
        stage: 'GROUP_STAGE', group: 'Group H',
        venue: 'AT&T Stadium, Dallas',
        homeTeam: { name: 'Japan', short: 'JPN', flag: '🇯🇵' },
        awayTeam: { name: 'Croatia', short: 'CRO', flag: '🇭🇷' },
        score: { home: null, away: null },
    },
]