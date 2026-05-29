'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import dynamic from 'next/dynamic'
import useSWR from 'swr'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { formatDistance, haversineDistanceMeters } from '@/lib/delivery'
import { googleMapsDirectionsUrl } from '@/lib/routing'
import { ExternalLink, Map, Navigation2, Radio, Square } from 'lucide-react'
import type { MapLocation } from '@/components/map/location-picker'

const DeliveryRouteMap = dynamic(
  () => import('@/components/map/delivery-route-map').then((m) => m.DeliveryRouteMap),
  { ssr: false, loading: () => <div className="h-64 rounded-lg bg-muted animate-pulse" /> }
)

interface CourierLocation {
  lat: number
  lng: number
  updatedAt?: string
}

interface OrderDeliveryPanelProps {
  orderId: string
  orderStatus: string
  customerLocation: MapLocation
  courierLocation?: CourierLocation | null
  isDeliveryTracking?: boolean
  onTrackingChange?: () => void
}

const shopFetcher = (url: string) => fetch(url).then((res) => res.json())

export function OrderDeliveryPanel({
  orderId,
  orderStatus,
  customerLocation,
  courierLocation,
  isDeliveryTracking,
  onTrackingChange,
}: OrderDeliveryPanelProps) {
  const { data: shopData } = useSWR('/api/shop', shopFetcher)
  const [tracking, setTracking] = useState(isDeliveryTracking ?? false)
  const [localCourier, setLocalCourier] = useState<MapLocation | null>(
    courierLocation ? { lat: courierLocation.lat, lng: courierLocation.lng } : null
  )
  const [saving, setSaving] = useState(false)
  const watchIdRef = useRef<number | null>(null)
  const lastSentRef = useRef(0)

  const shop = shopData?.shop
    ? { lat: shopData.shop.lat, lng: shopData.shop.lng }
    : null

  const isClosed = orderStatus === 'delivered' || orderStatus === 'cancelled'

  useEffect(() => {
    setTracking(isDeliveryTracking ?? false)
  }, [isDeliveryTracking])

  useEffect(() => {
    if (courierLocation) {
      setLocalCourier({ lat: courierLocation.lat, lng: courierLocation.lng })
    }
  }, [courierLocation?.lat, courierLocation?.lng])

  const postLocation = useCallback(
    async (lat: number, lng: number, trackingActive: boolean) => {
      const res = await fetch(`/api/orders/${orderId}/courier-location`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lat, lng, tracking: trackingActive }),
      })
      if (!res.ok) throw new Error('Failed to update location')
      onTrackingChange?.()
    },
    [orderId, onTrackingChange]
  )

  const stopTracking = useCallback(async () => {
    if (watchIdRef.current != null) {
      navigator.geolocation.clearWatch(watchIdRef.current)
      watchIdRef.current = null
    }
    setTracking(false)
    try {
      const res = await fetch(`/api/orders/${orderId}/courier-location`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tracking: false }),
      })
      if (!res.ok) throw new Error()
      onTrackingChange?.()
    } catch {
      toast.error('Failed to stop tracking')
    }
  }, [orderId, onTrackingChange])

  const startTracking = useCallback(() => {
    if (!navigator.geolocation) {
      toast.error('Geolocation is not supported on this device')
      return
    }

    setTracking(true)

    watchIdRef.current = navigator.geolocation.watchPosition(
      (pos) => {
        const loc = { lat: pos.coords.latitude, lng: pos.coords.longitude }
        setLocalCourier(loc)

        const now = Date.now()
        if (now - lastSentRef.current < 4000) return
        lastSentRef.current = now

        setSaving(true)
        postLocation(loc.lat, loc.lng, true)
          .catch(() => toast.error('Could not sync location'))
          .finally(() => setSaving(false))
      },
      () => {
        toast.error('Allow location access to track delivery')
        setTracking(false)
      },
      { enableHighAccuracy: true, maximumAge: 2000, timeout: 15000 }
    )
  }, [postLocation])

  useEffect(() => {
    if (isClosed && tracking) {
      stopTracking()
    }
    return () => {
      if (watchIdRef.current != null) {
        navigator.geolocation.clearWatch(watchIdRef.current)
      }
    }
  }, [isClosed, tracking, stopTracking])

  if (!shop) return null

  const courier = localCourier
  const distanceToCustomer =
    courier != null
      ? haversineDistanceMeters(courier.lat, courier.lng, customerLocation.lat, customerLocation.lng)
      : null

  const directionsUrl = courier
    ? googleMapsDirectionsUrl(courier, customerLocation)
    : googleMapsDirectionsUrl(shop, customerLocation)

  const mapBlock = (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2 text-xs">
        <span className="inline-flex items-center gap-1">
          <span className="h-2.5 w-2.5 rounded-full bg-red-500" />
          Shop
        </span>
        <span className="inline-flex items-center gap-1">
          <span className="h-2.5 w-2.5 rounded-full bg-green-500" />
          Customer
        </span>
        {(courier || tracking) && (
          <span className="inline-flex items-center gap-1">
            <span className="h-2.5 w-2.5 rounded-full bg-blue-500" />
            You
          </span>
        )}
      </div>

      <DeliveryRouteMap shop={shop} customer={customerLocation} courier={courier} height="280px" />

      {distanceToCustomer != null && tracking && (
        <p className="text-sm text-muted-foreground flex items-center gap-1">
          <Navigation2 className="h-4 w-4" />
          {formatDistance(distanceToCustomer)} to customer
          {saving && <span className="text-xs"> · syncing…</span>}
        </p>
      )}
    </div>
  )

  return (
    <div className="space-y-3 pt-3 border-t border-border">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h4 className="text-sm font-medium text-foreground flex items-center gap-2">
          <Map className="h-4 w-4" />
          Delivery map
        </h4>
        {tracking && (
          <Badge variant="secondary" className="gap-1 animate-pulse">
            <Radio className="h-3 w-3" />
            Live
          </Badge>
        )}
      </div>

      {mapBlock}

      {!isClosed && (
        <div className="flex flex-wrap gap-2">
          {!tracking ? (
            <Button type="button" size="sm" className="gap-2" onClick={startTracking}>
              <Navigation2 className="h-4 w-4" />
              Start delivery (share my location)
            </Button>
          ) : (
            <Button type="button" size="sm" variant="outline" className="gap-2" onClick={stopTracking}>
              <Square className="h-4 w-4" />
              Stop sharing location
            </Button>
          )}
          <Button type="button" size="sm" variant="outline" className="gap-2" asChild>
            <a href={directionsUrl} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="h-4 w-4" />
              Open in Google Maps
            </a>
          </Button>
          <Dialog>
            <DialogTrigger asChild>
              <Button type="button" size="sm" variant="outline">
                Full screen map
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl w-[95vw]">
              <DialogHeader>
                <DialogTitle>Delivery navigation</DialogTitle>
              </DialogHeader>
              <DeliveryRouteMap shop={shop} customer={customerLocation} courier={courier} height="70vh" />
            </DialogContent>
          </Dialog>
        </div>
      )}

      {isClosed && courier && (
        <p className="text-xs text-muted-foreground">Delivery completed — map shows last known route.</p>
      )}
    </div>
  )
}
