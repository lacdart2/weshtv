export interface Venue {
    name: string
    city: string
    country: string
    lat: number
    lon: number
    capacity: number
    timezone: string
}

export const VENUES: Record<string, Venue> = {
    // USA — Eastern (ET)
    'MetLife Stadium': { name: 'MetLife Stadium', city: 'New York / New Jersey', country: 'USA', lat: 40.8135, lon: -74.0745, capacity: 82500, timezone: 'America/New_York' },
    'New York New Jersey Stadium': { name: 'MetLife Stadium', city: 'New York / New Jersey', country: 'USA', lat: 40.8135, lon: -74.0745, capacity: 82500, timezone: 'America/New_York' },
    'Lincoln Financial Field': { name: 'Lincoln Financial Field', city: 'Philadelphia', country: 'USA', lat: 39.9007, lon: -75.1675, capacity: 69176, timezone: 'America/New_York' },
    'Philadelphia Stadium': { name: 'Lincoln Financial Field', city: 'Philadelphia', country: 'USA', lat: 39.9007, lon: -75.1675, capacity: 69176, timezone: 'America/New_York' },
    'Hard Rock Stadium': { name: 'Hard Rock Stadium', city: 'Miami', country: 'USA', lat: 25.9580, lon: -80.2388, capacity: 65326, timezone: 'America/New_York' },
    'Miami Stadium': { name: 'Hard Rock Stadium', city: 'Miami', country: 'USA', lat: 25.9580, lon: -80.2388, capacity: 65326, timezone: 'America/New_York' },
    'Gillette Stadium': { name: 'Gillette Stadium', city: 'Boston', country: 'USA', lat: 42.0909, lon: -71.2643, capacity: 65878, timezone: 'America/New_York' },
    'Boston Stadium': { name: 'Gillette Stadium', city: 'Boston', country: 'USA', lat: 42.0909, lon: -71.2643, capacity: 65878, timezone: 'America/New_York' },
    'Mercedes-Benz Stadium': { name: 'Mercedes-Benz Stadium', city: 'Atlanta', country: 'USA', lat: 33.7555, lon: -84.4010, capacity: 71000, timezone: 'America/New_York' },
    'Atlanta Stadium': { name: 'Mercedes-Benz Stadium', city: 'Atlanta', country: 'USA', lat: 33.7555, lon: -84.4010, capacity: 71000, timezone: 'America/New_York' },
    // USA — Central (CT)
    'AT&T Stadium': { name: 'AT&T Stadium', city: 'Dallas', country: 'USA', lat: 32.7480, lon: -97.0930, capacity: 80000, timezone: 'America/Chicago' },
    'Dallas Stadium': { name: 'AT&T Stadium', city: 'Dallas', country: 'USA', lat: 32.7480, lon: -97.0930, capacity: 80000, timezone: 'America/Chicago' },
    'Arrowhead Stadium': { name: 'Arrowhead Stadium', city: 'Kansas City', country: 'USA', lat: 39.0490, lon: -94.4839, capacity: 76416, timezone: 'America/Chicago' },
    'Kansas City Stadium': { name: 'Arrowhead Stadium', city: 'Kansas City', country: 'USA', lat: 39.0490, lon: -94.4839, capacity: 76416, timezone: 'America/Chicago' },
    'NRG Stadium': { name: 'NRG Stadium', city: 'Houston', country: 'USA', lat: 29.6847, lon: -95.4107, capacity: 72220, timezone: 'America/Chicago' },
    'Houston Stadium': { name: 'NRG Stadium', city: 'Houston', country: 'USA', lat: 29.6847, lon: -95.4107, capacity: 72220, timezone: 'America/Chicago' },
    // USA — Pacific (PT)
    'Rose Bowl': { name: 'Rose Bowl', city: 'Los Angeles', country: 'USA', lat: 34.1614, lon: -118.1676, capacity: 88565, timezone: 'America/Los_Angeles' },
    'SoFi Stadium': { name: 'SoFi Stadium', city: 'Los Angeles', country: 'USA', lat: 33.9535, lon: -118.3392, capacity: 70240, timezone: 'America/Los_Angeles' },
    'Los Angeles Stadium': { name: 'SoFi Stadium', city: 'Los Angeles', country: 'USA', lat: 33.9535, lon: -118.3392, capacity: 70240, timezone: 'America/Los_Angeles' },
    "Levi's Stadium": { name: "Levi's Stadium", city: 'San Francisco Bay Area', country: 'USA', lat: 37.4030, lon: -121.9697, capacity: 68500, timezone: 'America/Los_Angeles' },
    'Lumen Field': { name: 'Lumen Field', city: 'Seattle', country: 'USA', lat: 47.5952, lon: -122.3316, capacity: 69000, timezone: 'America/Los_Angeles' },
    'Seattle Stadium': { name: 'Lumen Field', city: 'Seattle', country: 'USA', lat: 47.5952, lon: -122.3316, capacity: 69000, timezone: 'America/Los_Angeles' },
    // Canada
    'BC Place': { name: 'BC Place', city: 'Vancouver', country: 'Canada', lat: 49.2767, lon: -123.1117, capacity: 54500, timezone: 'America/Vancouver' },
    'Vancouver Stadium': { name: 'BC Place', city: 'Vancouver', country: 'Canada', lat: 49.2767, lon: -123.1117, capacity: 54500, timezone: 'America/Vancouver' },
    'BMO Field': { name: 'BMO Field', city: 'Toronto', country: 'Canada', lat: 43.6333, lon: -79.4189, capacity: 45000, timezone: 'America/Toronto' },
    'Toronto Stadium': { name: 'BMO Field', city: 'Toronto', country: 'Canada', lat: 43.6333, lon: -79.4189, capacity: 45000, timezone: 'America/Toronto' },
    // Mexico — Central (CT)
    'Estadio Azteca': { name: 'Estadio Azteca', city: 'Mexico City', country: 'Mexico', lat: 19.3029, lon: -99.1505, capacity: 87523, timezone: 'America/Mexico_City' },
    'Mexico City Stadium': { name: 'Estadio Azteca', city: 'Mexico City', country: 'Mexico', lat: 19.3029, lon: -99.1505, capacity: 87523, timezone: 'America/Mexico_City' },
    'Estadio Akron': { name: 'Estadio Akron', city: 'Guadalajara', country: 'Mexico', lat: 20.6863, lon: -103.4667, capacity: 46232, timezone: 'America/Mexico_City' },
    'Guadalajara Stadium': { name: 'Estadio Akron', city: 'Guadalajara', country: 'Mexico', lat: 20.6863, lon: -103.4667, capacity: 46232, timezone: 'America/Mexico_City' },
    'Estadio BBVA': { name: 'Estadio BBVA', city: 'Monterrey', country: 'Mexico', lat: 25.6693, lon: -100.2438, capacity: 53500, timezone: 'America/Monterrey' },
    'Monterrey Stadium': { name: 'Estadio BBVA', city: 'Monterrey', country: 'Mexico', lat: 25.6693, lon: -100.2438, capacity: 53500, timezone: 'America/Monterrey' },
}

export function getVenue(venueName: string | undefined): Venue | null {
    if (!venueName || venueName === 'TBC') return null
    if (VENUES[venueName]) return VENUES[venueName]
    const key = Object.keys(VENUES).find(k =>
        venueName.toLowerCase().includes(k.toLowerCase()) ||
        k.toLowerCase().includes(venueName.toLowerCase())
    )
    return key ? VENUES[key] : null
}