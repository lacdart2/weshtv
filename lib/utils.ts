export type Region = 'dz' | 'fr' | 'no'

// Every region has a timezone
export const TIMEZONES: Record<Region, string> = {
    dz: 'Africa/Algiers',
    fr: 'Europe/Paris',
    no: 'Europe/Oslo',
}

// Format match time in user's local timezone
export function formatKickoff(utcDate: string, region: Region): string {
    return new Date(utcDate).toLocaleTimeString('fr-FR', {
        hour: '2-digit',
        minute: '2-digit',
        timeZone: TIMEZONES[region],
    })
}

// Format the US local time (where the match physically happens)
export function formatUSTime(utcDate: string): string {
    return new Date(utcDate).toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        timeZone: 'America/New_York',
        hour12: true,
    })
}

// Returns all 3 region times + US time for a match
export interface TimeDisplay {
    local: string       // user's selected region time
    us: string          // US Eastern (where match is played)
    dz: string          // Algeria time
    fr: string          // France time
    no: string          // Norway time
    nextDay: boolean    // true if match is next calendar day vs UTC
}

export function getAllTimes(utcDate: string, userRegion: Region): TimeDisplay {
    const date = new Date(utcDate)

    const get = (tz: string) =>
        date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit', timeZone: tz })

    // Check if local date differs from UTC date (next day problem)
    const utcDay = date.getUTCDate()
    const localDay = new Date(date.toLocaleString('en-US', { timeZone: TIMEZONES[userRegion] })).getDate()

    return {
        local: get(TIMEZONES[userRegion]),
        us: formatUSTime(utcDate),
        dz: get('Africa/Algiers'),
        fr: get('Europe/Paris'),
        no: get('Europe/Oslo'),
        nextDay: localDay > utcDay,
    }
}

export function getDayLabel(dateStr: string): { weekday: string; day: string } {
    const d = new Date(dateStr + 'T12:00:00Z')
    return {
        weekday: d.toLocaleDateString('en', { weekday: 'short' }).toUpperCase(),
        day: d.getDate().toString(),
    }
}

export function getFullDateLabel(dateStr: string): string {
    const d = new Date(dateStr + 'T12:00:00Z')
    return d.toLocaleDateString('en', { weekday: 'long', day: 'numeric', month: 'long' })
}

export function todayStr(): string {
    return new Date().toISOString().split('T')[0]
}
// Check if a match time is late night (00:00 - 06:00) in given region
export function isLateNight(utcDate: string, region: Region): boolean {
    const date = new Date(utcDate)
    const hour = parseInt(
        date.toLocaleTimeString('fr-FR', {
            hour: '2-digit',
            timeZone: TIMEZONES[region],
        })
    )
    return hour >= 0 && hour < 6
}

// Check if match involves a "featured" team for our audience
export const FEATURED_TEAMS = [
    'ALG', 'DZA',
    'TUN',
    'MAR', 'MOR',
    'NOR',
    'EGY',
]

export function isFeaturedMatch(homeShort: string, awayShort: string): boolean {
    const teams = [homeShort?.toUpperCase(), awayShort?.toUpperCase()]
    return teams.some(t => FEATURED_TEAMS.includes(t ?? ''))
}

export function getFeaturedTeam(homeShort: string, awayShort: string): string | null {
    if (FEATURED_TEAMS.includes(homeShort)) return homeShort
    if (FEATURED_TEAMS.includes(awayShort)) return awayShort
    return null
}