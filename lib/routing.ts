import type { MapLocation } from '@/components/map/location-picker'
import { haversineDistanceMeters } from '@/lib/delivery'

/** Driving distance in meters (same method as Google Maps driving route). */
export async function fetchDrivingDistanceMeters(
  from: MapLocation,
  to: MapLocation
): Promise<number> {
  try {
    const url = `https://router.project-osrm.org/route/v1/driving/${from.lng},${from.lat};${to.lng},${to.lat}?overview=false`
    const res = await fetch(url)
    if (!res.ok) throw new Error('Routing failed')
    const data = await res.json()
    const meters = data.routes?.[0]?.distance as number | undefined
    if (typeof meters === 'number' && meters > 0) return meters
    throw new Error('No route')
  } catch {
    return haversineDistanceMeters(from.lat, from.lng, to.lat, to.lng)
  }
}

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
