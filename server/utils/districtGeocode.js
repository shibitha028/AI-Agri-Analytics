/**
 * Lightweight offline district matcher for Tamil Nadu districts, used when
 * no external geocoding API key is configured. Uses approximate bounding
 * boxes - good enough for a demo/college-project scale. If GEOCODING_API_KEY
 * is set, a real reverse-geocoding provider should be called instead (see
 * locationController.js for the integration point).
 */

const DISTRICT_BOUNDS = [
  { district: 'Coimbatore', minLat: 10.75, maxLat: 11.35, minLng: 76.75, maxLng: 77.15 },
  { district: 'Erode', minLat: 11.15, maxLat: 11.6, minLng: 77.4, maxLng: 77.9 },
  { district: 'Salem', minLat: 11.5, maxLat: 11.85, minLng: 78.0, maxLng: 78.35 },
  { district: 'Madurai', minLat: 9.8, maxLat: 10.05, minLng: 77.9, maxLng: 78.25 },
  { district: 'Thanjavur', minLat: 10.6, maxLat: 10.9, minLng: 79.0, maxLng: 79.3 },
  { district: 'Tiruchirappalli', minLat: 10.7, maxLat: 10.95, minLng: 78.6, maxLng: 78.85 }
];

function estimateDistrict(latitude, longitude) {
  const match = DISTRICT_BOUNDS.find(
    (b) => latitude >= b.minLat && latitude <= b.maxLat && longitude >= b.minLng && longitude <= b.maxLng
  );
  return match ? match.district : null;
}

module.exports = { estimateDistrict, DISTRICT_BOUNDS };
