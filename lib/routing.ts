import type { MapLocation } from '@/components/map/location-picker'

export async function fetchDrivingRoute(
  from: MapLocation,
  to: MapLocation
): Promise<[number, number][]> {
  try {
    const url = `https://router.project-osrm.org/route/v1/driving/${from.lng},${from.lat};${to.lng},${to.lat}?overview=full&geometries=geojson`
    const res = await fetch(url)
    if (!res.ok) return []
    const data = await res.json()
    const coords = data.routes?.[0]?.geometry?.coordinates as [number, number][] | undefined
    if (!coords?.length) return []
    return coords.map(([lng, lat]) => [lat, lng])
  } catch {
    return []
  }
}

export function googleMapsDirectionsUrl(
  origin: MapLocation,
  destination: MapLocation
): string {
  return `https://www.google.com/maps/dir/?api=1&origin=${origin.lat},${origin.lng}&destination=${destination.lat},${destination.lng}&travelmode=driving`
}
