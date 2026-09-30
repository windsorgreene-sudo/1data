export interface Location {
  name: string;
  country: string;
  region: string;
  code: string;
  lat: number;
  lng: number;
  hub: boolean;
}

export const REGION_ORDER = [
  "North America",
  "South America",
  "Europe",
  "Middle East",
  "Africa",
  "Asia",
  "Asia Pacific",
  "Oceania",
];

export const DEFAULT_LOCATIONS: Location[] = [
  { name: "New York", country: "United States", region: "North America", code: "NYC", lat: 40.7128, lng: -74.006, hub: true },
  { name: "San Francisco", country: "United States", region: "North America", code: "SFO", lat: 37.7749, lng: -122.4194, hub: true },
  { name: "London", country: "United Kingdom", region: "Europe", code: "LON", lat: 51.5074, lng: -0.1278, hub: true },
  { name: "Frankfurt", country: "Germany", region: "Europe", code: "FRA", lat: 50.1109, lng: 8.6821, hub: true },
  { name: "Singapore", country: "Singapore", region: "Asia Pacific", code: "SIN", lat: 1.3521, lng: 103.8198, hub: true },
  { name: "Tokyo", country: "Japan", region: "Asia Pacific", code: "TYO", lat: 35.6762, lng: 139.6503, hub: true },
  { name: "Sydney", country: "Australia", region: "Oceania", code: "SYD", lat: -33.8688, lng: 151.2093, hub: true },
  { name: "Mumbai", country: "India", region: "Asia", code: "BOM", lat: 19.076, lng: 72.8777, hub: true },
  { name: "São Paulo", country: "Brazil", region: "South America", code: "GRU", lat: -23.5505, lng: -46.6333, hub: true },
  { name: "Toronto", country: "Canada", region: "North America", code: "YYZ", lat: 43.6532, lng: -79.3832, hub: false },
  { name: "Los Angeles", country: "United States", region: "North America", code: "LAX", lat: 34.0522, lng: -118.2437, hub: false },
  { name: "Chicago", country: "United States", region: "North America", code: "ORD", lat: 41.8781, lng: -87.6298, hub: false },
  { name: "Dallas", country: "United States", region: "North America", code: "DFW", lat: 32.7767, lng: -96.797, hub: false },
  { name: "Miami", country: "United States", region: "North America", code: "MIA", lat: 25.7617, lng: -80.1918, hub: false },
  { name: "Paris", country: "France", region: "Europe", code: "PAR", lat: 48.8566, lng: 2.3522, hub: false },
  { name: "Amsterdam", country: "Netherlands", region: "Europe", code: "AMS", lat: 52.3676, lng: 4.9041, hub: false },
  { name: "Stockholm", country: "Sweden", region: "Europe", code: "ARN", lat: 59.3293, lng: 18.0686, hub: false },
  { name: "Warsaw", country: "Poland", region: "Europe", code: "WAW", lat: 52.2297, lng: 21.0122, hub: false },
  { name: "Dubai", country: "United Arab Emirates", region: "Middle East", code: "DXB", lat: 25.2048, lng: 55.2708, hub: false },
  { name: "Hong Kong", country: "Hong Kong", region: "Asia", code: "HKG", lat: 22.3193, lng: 114.1694, hub: false },
  { name: "Seoul", country: "South Korea", region: "Asia", code: "ICN", lat: 37.5665, lng: 126.978, hub: false },
  { name: "Bangalore", country: "India", region: "Asia", code: "BLR", lat: 12.9716, lng: 77.5946, hub: false },
  { name: "Jakarta", country: "Indonesia", region: "Asia Pacific", code: "CGK", lat: -6.2088, lng: 106.8456, hub: false },
  { name: "Cape Town", country: "South Africa", region: "Africa", code: "CPT", lat: -33.9249, lng: 18.4241, hub: false },
  { name: "Johannesburg", country: "South Africa", region: "Africa", code: "JNB", lat: -26.2041, lng: 28.0473, hub: false },
];

const KNOWN = new Map(DEFAULT_LOCATIONS.map((l) => [l.name.toLowerCase(), l]));

export const enrichLocation = (row: {
  name: string;
  region: string;
  latitude: number;
  longitude: number;
  is_primary_hub: boolean | null;
}): Location => {
  const known = KNOWN.get(row.name.toLowerCase());
  return {
    name: row.name,
    region: row.region || known?.region || "Global",
    country: known?.country ?? row.region ?? "",
    code:
      known?.code ??
      row.name
        .normalize("NFD")
        .replace(/[^A-Za-z]/g, "")
        .slice(0, 3)
        .toUpperCase(),
    lat: Number(row.latitude),
    lng: Number(row.longitude),
    hub: Boolean(row.is_primary_hub),
  };
};

export const summarize = (locations: Location[]) => {
  const hubs = locations.filter((l) => l.hub).length;
  const continents = new Set(
    locations.map((l) => {
      if (l.region === "Asia Pacific" || l.region === "Middle East") return "Asia";
      return l.region;
    }),
  );
  return { total: locations.length, hubs, edges: locations.length - hubs, continents: continents.size };
};

export const ARCS: [string, string][] = [
  ["NYC", "LON"],
  ["LON", "FRA"],
  ["FRA", "BOM"],
  ["BOM", "SIN"],
  ["SIN", "TYO"],
  ["SIN", "SYD"],
  ["SFO", "TYO"],
  ["NYC", "SFO"],
  ["NYC", "GRU"],
  ["FRA", "DXB"],
  ["LON", "JNB"],
  ["SFO", "SYD"],
];
