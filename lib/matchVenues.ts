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
    'BRA-MAR': 'MetLife Stadium',
    'HAI-SCO': 'Gillette Stadium',
    'SCO-MAR': 'Gillette Stadium',
    'BRA-HAI': 'Lincoln Financial Field',
    'SCO-BRA': 'Hard Rock Stadium',
    'MAR-HAI': 'Mercedes-Benz Stadium',

    // Group D
    'USA-PAR': 'SoFi Stadium',
    'AUS-TUR': 'BC Place',
    'USA-AUS': 'Lumen Field',
    'TUR-PAR': "Levi's Stadium",
    'TUR-USA': 'SoFi Stadium',
    'PAR-AUS': "Levi's Stadium",

    // Group E
    'GER-CUW': 'NRG Stadium',
    'CIV-ECU': 'Lincoln Financial Field',
    'GER-CIV': 'BMO Field',
    'ECU-CUW': 'Arrowhead Stadium',
    'ECU-GER': 'MetLife Stadium',
    'CUW-CIV': 'Lincoln Financial Field',

    // Group F
    'NED-JPN': 'AT&T Stadium',
    'SWE-TUN': 'Estadio BBVA',
    'NED-SWE': 'NRG Stadium',
    'TUN-JPN': 'Estadio BBVA',
    'JPN-SWE': 'AT&T Stadium',
    'TUN-NED': 'Arrowhead Stadium',

    // Group G
    'BEL-EGY': 'Lumen Field',
    'IRN-NZL': 'SoFi Stadium',
    'BEL-IRN': 'SoFi Stadium',
    'NZL-EGY': 'BC Place',
    'EGY-IRN': 'Lumen Field',
    'NZL-BEL': 'BC Place',

    // Group H
    'ESP-CPV': 'Mercedes-Benz Stadium',
    'SAU-URY': 'Hard Rock Stadium',
    'ESP-SAU': 'Mercedes-Benz Stadium',
    'URY-CPV': 'Hard Rock Stadium',
    'CPV-SAU': 'NRG Stadium',
    'URY-ESP': 'Estadio Akron',

    // Group I
    'FRA-SEN': 'MetLife Stadium',
    'IRQ-NOR': 'Gillette Stadium',
    'FRA-IRQ': 'Lincoln Financial Field',
    'NOR-SEN': 'MetLife Stadium',
    'NOR-FRA': 'Gillette Stadium',
    'SEN-IRQ': 'BMO Field',

    // Group J
    'ARG-ALG': 'Arrowhead Stadium',
    'AUT-JOR': "Levi's Stadium",
    'ARG-AUT': 'AT&T Stadium',
    'JOR-ALG': "Levi's Stadium",
    'ALG-AUT': 'Arrowhead Stadium',
    'JOR-ARG': 'AT&T Stadium',

    // Group K
    'POR-DRC': 'NRG Stadium',
    'UZB-COL': 'Estadio Azteca',
    'POR-UZB': 'NRG Stadium',
    'COL-DRC': 'Estadio Akron',
    'COL-POR': 'Hard Rock Stadium',
    'DRC-UZB': 'Mercedes-Benz Stadium',

    // Group L
    'ENG-CRO': 'AT&T Stadium',
    'GHA-PAN': 'BMO Field',
    'ENG-GHA': 'Gillette Stadium',
    'PAN-CRO': 'BMO Field',
    'PAN-ENG': 'MetLife Stadium',
    'CRO-GHA': 'Lincoln Financial Field',
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