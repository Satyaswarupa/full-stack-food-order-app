'use client'

import { useEffect, useState } from 'react'
import dynamic from 'next/dynamic'
import useSWR from 'swr'
import { toast } from 'sonner'
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Loader, PageLoader } from '@/components/loader'
import { MapPin, Store, Save } from 'lucide-react'
import { DELIVERY_FEE_TIERS } from '@/lib/delivery'
import type { MapLocation } from '@/components/map/location-picker'

const LocationPicker = dynamic(
  () => import('@/components/map/location-picker').then((m) => m.LocationPicker),
  { ssr: false, loading: () => <div className="h-80 rounded-lg bg-muted animate-pulse" /> }
)

const fetcher = (url: string) => fetch(url).then((res) => res.json())

export function ShopSettingsSection() {
  const { data, isLoading, mutate } = useSWR('/api/shop', fetcher)
  const [shopName, setShopName] = useState('')
  const [address, setAddress] = useState('')
  const [location, setLocation] = useState<MapLocation | null>(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (data?.shop) {
      setShopName(data.shop.shopName || '')
      setAddress(data.shop.address || '')
      setLocation({ lat: data.shop.lat, lng: data.shop.lng })
    }
  }, [data])

  const handleSave = async () => {
    if (!location) {
      toast.error('Please set the shop location on the map')
      return
    }

    setSaving(true)
    try {
      const res = await fetch('/api/shop', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ shopName, address, lat: location.lat, lng: location.lng }),
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || 'Failed to save')
      }
      toast.success('Shop location saved')
      mutate()
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Failed to save shop settings')
    } finally {
      setSaving(false)
    }
  }

  if (isLoading) return <PageLoader text="Loading shop settings..." />

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Shop Location</h1>
        <p className="text-muted-foreground">
          Set your restaurant on the map. Delivery fees are calculated from this point.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Store className="h-5 w-5" />
            Restaurant Details
          </CardTitle>
          <CardDescription>
            Red marker on the map is your shop. Customers pick delivery points relative to it.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="shopName">Shop Name</Label>
              <Input
                id="shopName"
                value={shopName}
                onChange={(e) => setShopName(e.target.value)}
                placeholder="Restaurant name"
              />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="shopAddress" className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                Shop Address
              </Label>
              <Textarea
                id="shopAddress"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Street, area, city"
                rows={2}
              />
            </div>
          </div>

          <LocationPicker
            value={location}
            onChange={setLocation}
            showShopMarker={false}
            height="360px"
          />
        </CardContent>
        <CardFooter>
          <Button onClick={handleSave} disabled={saving} className="gap-2">
            {saving ? <Loader size="sm" /> : <Save className="h-4 w-4" />}
            Save Shop Location
          </Button>
        </CardFooter>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Delivery Fee Slabs</CardTitle>
          <CardDescription>Applied automatically based on distance from shop</CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="grid sm:grid-cols-2 gap-2 text-sm">
            {DELIVERY_FEE_TIERS.map((tier) => (
              <li
                key={tier.label}
                className="flex justify-between rounded-lg border border-border px-3 py-2"
              >
                <span className="text-muted-foreground">{tier.label}</span>
                <span className="font-medium text-foreground">
                  {tier.fee === 0 ? 'Free' : `₹${tier.fee}`}
                </span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}
