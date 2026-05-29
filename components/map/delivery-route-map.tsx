'use client'

import { useEffect, useMemo, useState } from 'react'
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet'
import type { MapLocation } from '@/components/map/location-picker'
import { shopMarkerIcon, customerMarkerIcon, courierMarkerIcon } from '@/lib/map-icons'
import { fetchDrivingRoute } from '@/lib/routing'
import 'leaflet/dist/leaflet.css'

interface DeliveryRouteMapProps {
  shop: MapLocation
  customer: MapLocation
  courier?: MapLocation | null
  height?: string
  /** Route from courier to customer if courier set; else shop to customer */
  showRoute?: boolean
}

function FitAllMarkers({ points }: { points: [number, number][] }) {
  const map = useMap()
  useEffect(() => {
    if (points.length === 0) return
    if (points.length === 1) {
      map.setView(points[0], 16)
      return
    }
    const bounds = points as [number, number][]
    map.fitBounds(bounds, { padding: [48, 48], maxZoom: 17 })
  }, [points, map])
  return null
}

function FollowCourier({ courier }: { courier: MapLocation | null | undefined }) {
  const map = useMap()
  useEffect(() => {
    if (courier) {
      map.panTo([courier.lat, courier.lng], { animate: true, duration: 0.5 })
    }
  }, [courier?.lat, courier?.lng, map, courier])
  return null
}

export function DeliveryRouteMap({
  shop,
  customer,
  courier,
  height = '320px',
  showRoute = true,
}: DeliveryRouteMapProps) {
  const [routeLine, setRouteLine] = useState<[number, number][]>([])
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const routeFrom = courier ?? shop

  useEffect(() => {
    if (!showRoute) {
      setRouteLine([])
      return
    }
    let cancelled = false
    fetchDrivingRoute(routeFrom, customer).then((line) => {
      if (!cancelled) {
        setRouteLine(line.length > 0 ? line : [[routeFrom.lat, routeFrom.lng], [customer.lat, customer.lng]])
      }
    })
    return () => {
      cancelled = true
    }
  }, [routeFrom.lat, routeFrom.lng, customer.lat, customer.lng, showRoute])

  const allPoints = useMemo(() => {
    const pts: [number, number][] = [
      [shop.lat, shop.lng],
      [customer.lat, customer.lng],
    ]
    if (courier) pts.push([courier.lat, courier.lng])
    return pts
  }, [shop, customer, courier])

  if (!mounted) {
    return (
      <div
        className="rounded-lg border border-border bg-muted animate-pulse"
        style={{ height }}
      />
    )
  }

  return (
    <div className="rounded-lg overflow-hidden border border-border z-0" style={{ height }}>
      <MapContainer
        center={[customer.lat, customer.lng]}
        zoom={14}
        className="h-full w-full"
        scrollWheelZoom
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <FitAllMarkers points={allPoints} />
        {courier && <FollowCourier courier={courier} />}

        <Marker position={[shop.lat, shop.lng]} icon={shopMarkerIcon}>
          <Popup>Shop</Popup>
        </Marker>
        <Marker position={[customer.lat, customer.lng]} icon={customerMarkerIcon}>
          <Popup>Customer</Popup>
        </Marker>
        {courier && (
          <Marker position={[courier.lat, courier.lng]} icon={courierMarkerIcon}>
            <Popup>Delivery (you)</Popup>
          </Marker>
        )}

        {showRoute && routeLine.length > 0 && (
          <>
            <Polyline positions={routeLine} pathOptions={{ color: '#3b82f6', weight: 5, opacity: 0.85 }} />
            <Polyline
              positions={routeLine}
              pathOptions={{ color: '#93c5fd', weight: 9, opacity: 0.4 }}
            />
          </>
        )}
      </MapContainer>
    </div>
  )
}
