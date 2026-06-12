export const TEAM_FLAGS: Record<string, string> = {
    ALG: '🇩🇿', DZA: '🇩🇿',
    TUN: '🇹🇳', MAR: '🇲🇦', MOR: '🇲🇦',
    NOR: '🇳🇴', EGY: '🇪🇬', FRA: '🇫🇷',
    BRA: '🇧🇷', ARG: '🇦🇷', ESP: '🇪🇸',
    GER: '🇩🇪', ENG: '🇬🇧', POR: '🇵🇹',
    USA: '🇺🇸', MEX: '🇲🇽', CAN: '🇨🇦',
    JPN: '🇯🇵', KOR: '🇰🇷', AUS: '🇦🇺',
    NED: '🇳🇱', BEL: '🇧🇪', SUI: '🇨🇭',
    CRO: '🇭🇷', SEN: '🇸🇳', URY: '🇺🇾',
    COL: '🇨🇴', ECU: '🇪🇨', PAR: '🇵🇾',
    QAT: '🇶🇦', IRN: '🇮🇷', SWE: '🇸🇪',
    DEN: '🇩🇰', SCO: '🇬🇧', RSA: '🇿🇦',
    GHA: '🇬🇭', CMR: '🇨🇲', CIV: '🇨🇮',
    TUR: '🇹🇷', POL: '🇵🇱', SRB: '🇷🇸',
    UKR: '🇺🇦', HAI: '🇭🇹', JAM: '🇯🇲',
    CPV: '🇨🇻', CUW: '🇨🇼', BIH: '🇧🇦',
    UZB: '🇺🇿', JOR: '🇯🇴', IRQ: '🇮🇶',
    NZL: '🇳🇿',
}

export function getTeamFlag(code: string | null | undefined): string | null {
    if (!code) return null
    return TEAM_FLAGS[code.toUpperCase()] ?? null
}