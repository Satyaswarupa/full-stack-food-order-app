export async function reverseGeocode(lat: number, lng: number): Promise<string> {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`,
      { headers: { 'Accept-Language': 'en' } }
    )
    if (!res.ok) return ''
    const data = await res.json()
    return data.display_name || ''
  } catch {
    return ''
  }
}
