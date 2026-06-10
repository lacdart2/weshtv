import dzData from '@/data/channels.dz.json'
import noData from '@/data/channels.no.json'

export type Region = 'dz' | 'no'

interface ChannelInfo {
    name: string
    type: string
    coverage: string
    color: string
}

interface RegionData {
    region: string
    flag: string
    timezone: string
    note: string
    channels: ChannelInfo[]
    specialMatches: Record<string, string[]>
}

export const REGIONS: Record<Region, RegionData> = {
    dz: dzData as RegionData,
    no: noData as RegionData,
}

// Get channels for a specific match based on teams playing
export function getChannelsForMatch(
    region: Region,
    homeTeamShort: string | null | undefined,
    awayTeamShort: string | null | undefined,
    stage: string | null | undefined
): string[] {
    const data = REGIONS[region]
    const special = data.specialMatches

    // Safe fallback if teams not determined yet
    const home = homeTeamShort?.toUpperCase() ?? ''
    const away = awayTeamShort?.toUpperCase() ?? ''
    const stageStr = stage ?? ''

    if (home && special[home]) return special[home]
    if (away && special[away]) return special[away]

    if (stageStr.includes('FINAL') && special['final']) return special['final']
    if (stageStr.includes('SEMI') && special['semi_final']) return special['semi_final']

    return special['default'] ?? data.channels.map(c => c.name)
}

export function getChannelColor(region: Region, channelName: string): string {
    const ch = REGIONS[region].channels.find(c => c.name === channelName)
    return ch?.color ?? '#555555'
}

export function getTimezone(region: Region): string {
    return REGIONS[region].timezone
}