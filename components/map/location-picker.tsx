'use client'

import { useEffect, useMemo, useState } from 'react'
import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from 'react-leaflet'
import L from 'leaflet'
import { Button } from '@/components/ui/button'
import { Loader } from '@/components/loader'
import { Navigation, MapPin } from 'lucide-react'
import 'leaflet/dist/leaflet.css'

const defaultIcon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
})

const shopIcon = L.icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
})

export interface MapLocation {
  lat: number
  lng: number
}

interface LocationPickerProps {
  value: MapLocation | null
  onChange: (location: MapLocation) => void
  shopLocation?: MapLocation | null
  center?: MapLocation
  height?: string
  showShopMarker?: boolean
}

function MapClickHandler({ onChange }: { onChange: (loc: MapLocation) => void }) {
  useMapEvents({
    click(e) {
      onChange({ lat: e.latlng.lat, lng: e.latlng.lng })
    },
  })
  return null
}

function MapRecenter({ center }: { center: [number, number] }) {
  const map = useMap()
  useEffect(() => {
    map.setView(center, map.getZoom())
  }, [center, map])
  return null
}

export function LocationPicker({
  value,
  onChange,
  shopLocation,
  center,
  height = '320px',
  showShopMarker = true,
}: LocationPickerProps) {
  const [locating, setLocating] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const mapCenter = useMemo<[number, number]>(() => {
    if (value) return [value.lat, value.lng]
    if (center) return [center.lat, center.lng]
    if (shopLocation) return [shopLocation.lat, shopLocation.lng]
    return [28.6139, 77.209]
  }, [value, center, shopLocation])

  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) return
    setLocating(true)
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        onChange({ lat: pos.coords.latitude, lng: pos.coords.longitude })
        setLocating(false)
      },
      () => setLocating(false),
      { enableHighAccuracy: true, timeout: 15000 }
    )
  }

  if (!mounted) {
    return (
      <div
        className="flex items-center justify-center rounded-lg border border-border bg-muted"
        style={{ height }}
      >
        <Loader size="sm" />
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="gap-2"
          onClick={handleUseCurrentLocation}
          disabled={locating}
        >
          {locating ? <Loader size="sm" /> : <Navigation className="h-4 w-4" />}
          Use current location
        </Button>
        <p className="text-xs text-muted-foreground flex items-center gap-1 self-center">
          <MapPin className="h-3 w-3" />
          Tap the map to set delivery location
        </p>
      </div>
      <div className="rounded-lg overflow-hidden border border-border z-0" style={{ height }}>
        <MapContainer
          center={mapCenter}
          zoom={15}
          className="h-full w-full"
          scrollWheelZoom
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <MapRecenter center={mapCenter} />
          <MapClickHandler onChange={onChange} />
          {showShopMarker && shopLocation && (
            <Marker position={[shopLocation.lat, shopLocation.lng]} icon={shopIcon} />
          )}
          {value && <Marker position={[value.lat, value.lng]} icon={defaultIcon} />}
        </MapContainer>
      </div>
    </div>
  )
}
