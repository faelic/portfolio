export interface LocationPoint {
  name: string;
  lng: number;
  lat: number;
}

export const locationHub: LocationPoint = { name: "Lagos", lng: 3.3792, lat: 6.5244 };

const globalLocations: LocationPoint[] = [
  { name: "New York", lng: -74.006, lat: 40.7128 },
  { name: "São Paulo", lng: -46.6333, lat: -23.5505 },
  { name: "Cape Town", lng: 18.4241, lat: -33.9249 },
  { name: "Dubai", lng: 55.2708, lat: 25.2048 },
  { name: "Mumbai", lng: 72.8777, lat: 19.076 },
  { name: "Singapore", lng: 103.8198, lat: 1.3521 },
  { name: "Tokyo", lng: 139.6917, lat: 35.6895 },
  { name: "Sydney", lng: 151.2093, lat: -33.8688 },
  { name: "London", lng: -0.1276, lat: 51.5074 },
  { name: "Paris", lng: 2.3522, lat: 48.8566 },
  { name: "Cairo", lng: 31.2357, lat: 30.0444 },
  { name: "Nairobi", lng: 36.8219, lat: -1.2921 },
];

export const locationLevels = [
  { id: "global", maxZoom: 2.25, limit: 7, locations: globalLocations },
  {
    id: "regional",
    maxZoom: 4.9,
    limit: 7,
    locations: [
      { name: "Accra", lng: -0.187, lat: 5.6037 }, { name: "Abidjan", lng: -4.0083, lat: 5.36 },
      { name: "Dakar", lng: -17.4677, lat: 14.7167 }, { name: "Casablanca", lng: -7.5898, lat: 33.5731 },
      { name: "Cairo", lng: 31.2357, lat: 30.0444 }, { name: "Nairobi", lng: 36.8219, lat: -1.2921 },
      { name: "Johannesburg", lng: 28.0473, lat: -26.2041 }, { name: "Cape Town", lng: 18.4241, lat: -33.9249 },
      { name: "Lisbon", lng: -9.1393, lat: 38.7223 }, { name: "London", lng: -0.1276, lat: 51.5074 },
      { name: "Dubai", lng: 55.2708, lat: 25.2048 },
    ],
  },
  {
    id: "nigeria",
    maxZoom: 8.2,
    limit: 7,
    locations: [
      { name: "Abuja", lng: 7.3986, lat: 9.0765 }, { name: "Ibadan", lng: 3.947, lat: 7.3775 },
      { name: "Abeokuta", lng: 3.348, lat: 7.1475 }, { name: "Ilorin", lng: 4.5418, lat: 8.4966 },
      { name: "Akure", lng: 5.195, lat: 7.2571 }, { name: "Benin City", lng: 5.6037, lat: 6.335 },
      { name: "Port Harcourt", lng: 7.0498, lat: 4.8156 }, { name: "Enugu", lng: 7.4988, lat: 6.4584 },
      { name: "Jos", lng: 8.8583, lat: 9.8965 }, { name: "Kaduna", lng: 7.4388, lat: 10.5105 },
      { name: "Kano", lng: 8.5167, lat: 12.0022 },
    ],
  },
  {
    id: "lagos",
    maxZoom: Number.POSITIVE_INFINITY,
    limit: 8,
    locations: [
      { name: "Ikeja", lng: 3.3515, lat: 6.6018 }, { name: "Yaba", lng: 3.3792, lat: 6.5095 },
      { name: "Surulere", lng: 3.3502, lat: 6.4969 }, { name: "Ikoyi", lng: 3.4378, lat: 6.4541 },
      { name: "Victoria Island", lng: 3.4219, lat: 6.4281 }, { name: "Lekki", lng: 3.4723, lat: 6.4698 },
      { name: "Badagry", lng: 2.8876, lat: 6.415 }, { name: "Epe", lng: 3.9834, lat: 6.5841 },
    ],
  },
] as const;

export const continentLabels: LocationPoint[] = [
  { name: "North America", lng: -103, lat: 45 }, { name: "South America", lng: -61, lat: -18 },
  { name: "Europe", lng: 17, lat: 51 }, { name: "Africa", lng: 20, lat: 4 },
  { name: "Asia", lng: 88, lat: 43 }, { name: "Oceania", lng: 134, lat: -24 },
];
