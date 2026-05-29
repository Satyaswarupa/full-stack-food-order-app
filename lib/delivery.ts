export const MAX_DELIVERY_DISTANCE_M = 5000

export function haversineDistanceMeters(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 6371000
  const toRad = (deg: number) => (deg * Math.PI) / 180
  const dLat = toRad(lat2 - lat1)
  const dLng = toRad(lng2 - lng1)
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

export function formatDistance(meters: number): string {
  if (meters < 1000) {
    return `${Math.round(meters)} m`
  }
  return `${(meters / 1000).toFixed(1)} km`
}

/** Delivery fee in INR by distance from shop */
export function getDeliveryFee(meters: number): number {
  if (meters <= 500) return 0
  if (meters <= 1000) return 10
  if (meters <= 2000) return 20
  if (meters <= 3000) return 30
  if (meters <= 4000) return 40
  if (meters <= MAX_DELIVERY_DISTANCE_M) return 50
  return -1
}

export function isDeliverable(meters: number): boolean {
  return meters <= MAX_DELIVERY_DISTANCE_M
}

export const DELIVERY_FEE_TIERS = [
  { label: 'Up to 500 m', fee: 0 },
  { label: 'Up to 1 km', fee: 10 },
  { label: 'Up to 2 km', fee: 20 },
  { label: 'Up to 3 km', fee: 30 },
  { label: 'Up to 4 km', fee: 40 },
  { label: 'Up to 5 km', fee: 50 },
] as const
