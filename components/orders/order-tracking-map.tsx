'use client'

import dynamic from 'next/dynamic'
import useSWR from 'swr'
import { Badge } from '@/components/ui/badge'
import { Radio } from 'lucide-react'
import type { MapLocation } from '@/components/map/location-picker'

const DeliveryRouteMap = dynamic(
  () => import('@/components/map/delivery-route-map').then((m) => m.DeliveryRouteMap),
  { ssr: false, loading: () => <div className="h-56 rounded-lg bg-muted animate-pulse" /> }
)

interface OrderTrackingMapProps {
  customerLocation: MapLocation
  courierLocation?: { lat: number; lng: number } | null
  isDeliveryTracking?: boolean
}

const shopFetcher = (url: string) => fetch(url).then((res) => res.json())

export function OrderTrackingMap({
  customerLocation,
  courierLocation,
  isDeliveryTracking,
}: OrderTrackingMapProps) {
  const { data: shopData } = useSWR('/api/shop', shopFetcher)

  const shop = shopData?.shop
    ? { lat: shopData.shop.lat, lng: shopData.shop.lng }
    : null

  if (!shop) return null

  const courier = courierLocation
    ? { lat: courierLocation.lat, lng: courierLocation.lng }
    : null

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-2">
        <p className="text-sm font-medium text-foreground">Live delivery map</p>
        {isDeliveryTracking && (
          <Badge variant="secondary" className="gap-1 text-xs">
            <Radio className="h-3 w-3 animate-pulse" />
            On the way
          </Badge>
        )}
      </div>
      <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
        <span className="flex items-center gap-1">
          <span className="h-2 w-2 rounded-full bg-red-500" />
          Restaurant
        </span>
        <span className="flex items-center gap-1">
          <span className="h-2 w-2 rounded-full bg-green-500" />
          Your location
        </span>
        {courier && (
          <span className="flex items-center gap-1">
            <span className="h-2 w-2 rounded-full bg-blue-500" />
            Delivery partner
          </span>
        )}
      </div>
      <DeliveryRouteMap
        shop={shop}
        customer={customerLocation}
        courier={courier}
        height="240px"
        showRoute={Boolean(courier)}
      />
      {isDeliveryTracking && !courier && (
        <p className="text-xs text-muted-foreground">Waiting for delivery partner location…</p>
      )}
    </div>
  )
}
