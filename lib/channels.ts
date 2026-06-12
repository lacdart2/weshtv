import dzData from '@/data/channels.dz.json'
import noData from '@/data/channels.no.json'

export type Region = 'dz' | 'no'

interface ChannelInfo {
    name: string
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
/* export function getChannelsForMatch(
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
 */
// Get channels for a specific match based on exact matchup, team, or stage
export function getChannelsForMatch(
    region: Region,
    homeTeamShort: string | null | undefined,
    awayTeamShort: string | null | undefined,
    stage: string | null | undefined
): string[] {
    const data = REGIONS[region]
    const special = data.specialMatches

    const home = homeTeamShort?.toUpperCase() ?? ''
    const away = awayTeamShort?.toUpperCase() ?? ''
    const stageStr = stage?.toLowerCase() ?? ''

    // 1. Exact matchup first: ARG-ALG or ALG-ARG
    if (home && away) {
        const directKey = `${home}-${away}`
        const reverseKey = `${away}-${home}`

        if (special[directKey]) return special[directKey]
        if (special[reverseKey]) return special[reverseKey]
    }

    // 2. Team-specific fallback: ALG, MAR, TUN, NOR
    if (home && special[home]) return special[home]
    if (away && special[away]) return special[away]

    // 3. Stage fallback
    if (stageStr.includes('final') && special['final']) return special['final']
    if (stageStr.includes('semi') && special['semi_final']) return special['semi_final']

    // 4. Default fallback
    return special['default'] ?? data.channels.map((channel) => channel.name)
}
export function getChannelColor(region: Region, channelName: string): string {
    const ch = REGIONS[region].channels.find(c => c.name === channelName)
    return ch?.color ?? '#555555'
}

export function getTimezone(region: Region): string {
    return REGIONS[region].timezone
}