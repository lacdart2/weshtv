export interface Venue {
    name: string
    city: string
    country: string
    lat: number
    lon: number
    capacity: number
}

export const VENUES: Record<string, Venue> = {
    'MetLife Stadium': { name: 'MetLife Stadium', city: 'New York / New Jersey', country: 'USA', lat: 40.8135, lon: -74.0745, capacity: 82500 },
    'AT&T Stadium': { name: 'AT&T Stadium', city: 'Dallas', country: 'USA', lat: 32.7480, lon: -97.0930, capacity: 80000 },
    'Rose Bowl': { name: 'Rose Bowl', city: 'Los Angeles', country: 'USA', lat: 34.1614, lon: -118.1676, capacity: 88565 },
    'SoFi Stadium': { name: 'SoFi Stadium', city: 'Los Angeles', country: 'USA', lat: 33.9535, lon: -118.3392, capacity: 70240 },
    "Levi's Stadium": { name: "Levi's Stadium", city: 'San Francisco Bay', country: 'USA', lat: 37.4030, lon: -121.9697, capacity: 68500 },
    'Arrowhead Stadium': { name: 'Arrowhead Stadium', city: 'Kansas City', country: 'USA', lat: 39.0490, lon: -94.4839, capacity: 76416 },
    'BC Place': { name: 'BC Place', city: 'Vancouver', country: 'Canada', lat: 49.2767, lon: -123.1117, capacity: 54500 },
    'Estadio Azteca': { name: 'Estadio Azteca', city: 'Mexico City', country: 'Mexico', lat: 19.3029, lon: -99.1505, capacity: 87523 },
    'Lumen Field': { name: 'Lumen Field', city: 'Seattle', country: 'USA', lat: 47.5952, lon: -122.3316, capacity: 69000 },
    'Lincoln Financial Field': { name: 'Lincoln Financial Field', city: 'Philadelphia', country: 'USA', lat: 39.9007, lon: -75.1675, capacity: 69176 },
    'Mercedes-Benz Stadium': { name: 'Mercedes-Benz Stadium', city: 'Atlanta', country: 'USA', lat: 33.7555, lon: -84.4010, capacity: 71000 },
    'Hard Rock Stadium': { name: 'Hard Rock Stadium', city: 'Miami', country: 'USA', lat: 25.9580, lon: -80.2388, capacity: 65326 },
    'Gillette Stadium': { name: 'Gillette Stadium', city: 'Boston', country: 'USA', lat: 42.0909, lon: -71.2643, capacity: 65878 },
    'NRG Stadium': { name: 'NRG Stadium', city: 'Houston', country: 'USA', lat: 29.6847, lon: -95.4107, capacity: 72220 },
    'Allegiant Stadium': { name: 'Allegiant Stadium', city: 'Las Vegas', country: 'USA', lat: 36.0909, lon: -115.1833, capacity: 65000 },
    'Q2 Stadium': { name: 'Q2 Stadium', city: 'Austin', country: 'USA', lat: 30.3872, lon: -97.7194, capacity: 20738 },
}

export function getVenue(venueName: string | undefined): Venue | null {
    if (!venueName) return null
    // exact match first
    if (VENUES[venueName]) return VENUES[venueName]
    if (!venueName || venueName === 'TBC') return null
    // partial match
    const key = Object.keys(VENUES).find(k =>
        venueName.toLowerCase().includes(k.toLowerCase()) ||
        k.toLowerCase().includes(venueName.toLowerCase())
    )
    return key ? VENUES[key] : null
}