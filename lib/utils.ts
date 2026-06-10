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