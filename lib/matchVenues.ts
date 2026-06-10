// Manual venue mapping since football-data.org returns TBC
// Source: FIFA official schedule
const MATCH_VENUES: Record<string, string> = {
    // Group A
    'MEX-RSA': 'Estadio Azteca',
    'KOR-CZE': 'Estadio Akron',
    'CZE-RSA': 'Mercedes-Benz Stadium',
    'MEX-KOR': 'Estadio Akron',
    'CZE-MEX': 'Estadio Azteca',
    'RSA-KOR': 'Estadio BBVA',
    // Group B
    'CAN-BIH': 'BMO Field',
    'QAT-SUI': "Levi's Stadium",
    'SUI-BIH': 'SoFi Stadium',
    'CAN-QAT': 'BC Place',
    'SUI-CAN': 'BC Place',
    'BIH-QAT': 'Lumen Field',
    // Group C
    'USA-PAR': 'SoFi Stadium',
    'AUS-TUR': 'BC Place',
    'TUR-PAR': 'Arrowhead Stadium',
    'USA-AUS': 'SoFi Stadium',
    'TUR-USA': 'SoFi Stadium',
    'PAR-AUS': 'AT&T Stadium',
    // Group D
    'FRA-IRQ': 'Lincoln Financial Field',
    'NOR-SEN': 'MetLife Stadium',
    'IRQ-SEN': 'NRG Stadium',
    'FRA-NOR': 'Gillette Stadium',
    'IRQ-NOR': 'AT&T Stadium',
    'SEN-FRA': 'Lincoln Financial Field',
    // Group E
    'ARG-AUT': 'AT&T Stadium',
    'JOR-ALG': "Levi's Stadium",
    'AUT-ALG': 'Hard Rock Stadium',
    'ARG-JOR': 'Mercedes-Benz Stadium',
    'AUT-ARG': 'AT&T Stadium',
    'ALG-JOR': 'MetLife Stadium',
    // Group F
    'POR-UZB': 'NRG Stadium',
    'ENG-GHA': 'Gillette Stadium',
    'GHA-UZB': 'Arrowhead Stadium',
    'ENG-POR': 'MetLife Stadium',
    'GHA-POR': 'Hard Rock Stadium',
    'UZB-ENG': 'AT&T Stadium',
    // Group G
    'ESP-ARG': 'MetLife Stadium',
    'NED-TUN': 'BC Place',
    'ARG-TUN': 'Lumen Field',
    'ESP-NED': 'AT&T Stadium',
    'ARG-ESP': 'AT&T Stadium',
    'TUN-NED': 'Arrowhead Stadium',
    // Group H
    'URY-CPV': 'Hard Rock Stadium',
    'NZL-BEL': 'Lumen Field',
    'BEL-CPV': 'Mercedes-Benz Stadium',
    'URY-NZL': 'MetLife Stadium',
    'BEL-URY': 'Hard Rock Stadium',
    'CPV-NZL': "Levi's Stadium",
    // Group I
    'BRA-IRN': 'SoFi Stadium',
    'JPN-CRO': 'Estadio Akron',
    'CRO-IRN': 'BC Place',
    'BRA-JPN': 'AT&T Stadium',
    'CRO-BRA': 'MetLife Stadium',
    'IRN-JPN': 'Arrowhead Stadium',
    // Group J
    'ECU-GER': 'SoFi Stadium',
    'CUW-CIV': "Levi's Stadium",
    'GER-CIV': 'NRG Stadium',
    'ECU-CUW': 'AT&T Stadium',
    'GER-ECU': 'AT&T Stadium',
    'CIV-CUW': 'Gillette Stadium',
    // Group K
    'EGY-IRN2': 'Gillette Stadium',
    'SCO-BRA2': 'Hard Rock Stadium',
    'MAR-HAI': 'Hard Rock Stadium',
    'MAR-SCO': 'BC Place',
    // Group L
    'PAN-ENG': 'BMO Field',
    'ENG-CRO2': 'Lincoln Financial Field',
    'ENG-GHA2': 'Mercedes-Benz Stadium',
    'PAN-CRO2': 'Estadio Akron',
}

export function getVenueByTeams(
    homeShort: string | undefined,
    awayShort: string | undefined
): string | null {
    if (!homeShort || !awayShort) return null
    const key1 = `${homeShort}-${awayShort}`
    const key2 = `${awayShort}-${homeShort}`
    return MATCH_VENUES[key1] ?? MATCH_VENUES[key2] ?? null
}