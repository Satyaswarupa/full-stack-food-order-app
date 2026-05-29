'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
import dynamic from 'next/dynamic'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import useSWR from 'swr'
import { toast } from 'sonner'
import { useCart } from '@/contexts/cart-context'
import { useAuth } from '@/contexts/auth-context'
import { emitNewOrder } from '@/contexts/socket-context'
import { Card, CardContent, CardHeader, CardTitle, CardFooter, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Loader, OverlayLoader } from '@/components/loader'
import { ArrowLeft, MapPin, Phone, Check, Plus, Navigation2 } from 'lucide-react'
import {
  DELIVERY_FEE_TIERS,
  formatDistance,
  getDeliveryFee,
  haversineDistanceMeters,
  isDeliverable,
} from '@/lib/delivery'
import { reverseGeocode } from '@/lib/geocode'
import type { MapLocation } from '@/components/map/location-picker'

const LocationPicker = dynamic(
  () => import('@/components/map/location-picker').then((m) => m.LocationPicker),
  { ssr: false, loading: () => <div className="h-72 rounded-lg bg-muted animate-pulse" /> }
)

interface SavedAddress {
  _id: string
  label: string
  mobile: string
  fullAddress: string
  lat?: number
  lng?: number
  isDefault: boolean
}

const shopFetcher = (url: string) => fetch(url).then((res) => res.json())

export function CheckoutView() {
  const router = useRouter()
  const { items, total, clearCart } = useCart()
  const { user, refreshUser } = useAuth()
  const { data: shopData } = useSWR('/api/shop', shopFetcher)

  const [selectedAddressId, setSelectedAddressId] = useState<string>('')
  const [showNewAddress, setShowNewAddress] = useState(false)
  const [mobile, setMobile] = useState('')
  const [fullAddress, setFullAddress] = useState('')
  const [label, setLabel] = useState('Home')
  const [saveAddress, setSaveAddress] = useState(true)
  const [deliveryLocation, setDeliveryLocation] = useState<MapLocation | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [geocoding, setGeocoding] = useState(false)

  const savedAddresses: SavedAddress[] = user?.addresses || []
  const shopLocation = shopData?.shop
    ? { lat: shopData.shop.lat, lng: shopData.shop.lng }
    : null

  const distanceMeters = useMemo(() => {
    if (!shopLocation || !deliveryLocation) return null
    return haversineDistanceMeters(
      shopLocation.lat,
      shopLocation.lng,
      deliveryLocation.lat,
      deliveryLocation.lng
    )
  }, [shopLocation, deliveryLocation])

  const deliveryFee = useMemo(() => {
    if (distanceMeters === null) return null
    return getDeliveryFee(distanceMeters)
  }, [distanceMeters])

  const orderTotal = total + (deliveryFee ?? 0)

  useEffect(() => {
    if (savedAddresses.length > 0) {
      const defaultAddr = savedAddresses.find((a) => a.isDefault) || savedAddresses[0]
      setSelectedAddressId(defaultAddr._id || '')
      setShowNewAddress(false)
    } else {
      setShowNewAddress(true)
    }
  }, [savedAddresses])

  const handleLocationChange = useCallback(async (loc: MapLocation) => {
    setDeliveryLocation(loc)
    setGeocoding(true)
    const address = await reverseGeocode(loc.lat, loc.lng)
    if (address) setFullAddress(address)
    setGeocoding(false)
  }, [])

  const applySavedAddress = (addr: SavedAddress) => {
    setMobile(addr.mobile)
    setFullAddress(addr.fullAddress)
    setLabel(addr.label)
    if (addr.lat != null && addr.lng != null) {
      setDeliveryLocation({ lat: addr.lat, lng: addr.lng })
    } else {
      setDeliveryLocation(null)
      toast.info('Please confirm delivery location on the map')
    }
  }

  useEffect(() => {
    if (!showNewAddress && selectedAddressId) {
      const addr = savedAddresses.find((a) => a._id === selectedAddressId)
      if (addr) applySavedAddress(addr)
    }
  }, [selectedAddressId, showNewAddress])

  if (shopData?.shop && !shopData.shop.isConfigured) {
    return (
      <div className="container mx-auto px-4 py-12">
        <Card className="max-w-lg mx-auto">
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <MapPin className="h-12 w-12 text-muted-foreground mb-4" />
            <h2 className="text-2xl font-bold text-foreground mb-2">Delivery not ready</h2>
            <p className="text-muted-foreground mb-6">
              The shop location has not been set yet. Please try again later.
            </p>
            <Link href="/cart">
              <Button variant="outline">Back to Cart</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-12">
        <Card className="max-w-lg mx-auto">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <h2 className="text-2xl font-bold text-foreground mb-2">No items in cart</h2>
            <p className="text-muted-foreground mb-6">Add some items before checkout</p>
            <Link href="/">
              <Button>Browse Menu</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!deliveryLocation) {
      toast.error('Please pick your delivery location on the map')
      return
    }

    if (distanceMeters === null || deliveryFee === null || deliveryFee < 0) {
      toast.error('Unable to calculate delivery distance')
      return
    }

    if (!isDeliverable(distanceMeters)) {
      toast.error('Delivery is only available within 5 km of the shop')
      return
    }

    let deliveryAddress: {
      mobile: string
      fullAddress: string
      lat: number
      lng: number
      label?: string
    }

    if (showNewAddress) {
      if (!mobile || !fullAddress) {
        toast.error('Please fill in all delivery details')
        return
      }
      deliveryAddress = {
        mobile,
        fullAddress,
        lat: deliveryLocation.lat,
        lng: deliveryLocation.lng,
        label,
      }
    } else {
      const selectedAddr = savedAddresses.find((a) => a._id === selectedAddressId)
      if (!selectedAddr) {
        toast.error('Please select a delivery address')
        return
      }
      if (!mobile || !fullAddress) {
        toast.error('Please fill in delivery contact details')
        return
      }
      deliveryAddress = {
        mobile,
        fullAddress,
        lat: deliveryLocation.lat,
        lng: deliveryLocation.lng,
        label: selectedAddr.label,
      }
    }

    setIsLoading(true)

    try {
      const orderItems = items.map((item) => ({
        itemId: item.itemId,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        imageUrl: item.imageUrl,
      }))

      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: orderItems,
          deliveryAddress,
          deliveryFee,
          saveAddress: showNewAddress && saveAddress,
        }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to place order')
      }

      const { order } = await res.json()
      emitNewOrder(order)

      if (showNewAddress && saveAddress) {
        refreshUser()
      }

      clearCart()
      toast.success('Order placed successfully!')
      router.push('/orders')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to place order')
    } finally {
      setIsLoading(false)
    }
  }

  const distanceBlock =
    distanceMeters !== null && deliveryFee !== null ? (
      <div
        className={`rounded-lg border p-4 text-sm ${
          !isDeliverable(distanceMeters)
            ? 'border-destructive bg-destructive/5'
            : 'border-border bg-muted/40'
        }`}
      >
        <div className="flex flex-wrap justify-between gap-2">
          <span className="text-muted-foreground flex items-center gap-1">
            <Navigation2 className="h-4 w-4" />
            Distance from shop
          </span>
          <span className="font-medium text-foreground">{formatDistance(distanceMeters)}</span>
        </div>
        <div className="flex flex-wrap justify-between gap-2 mt-2">
          <span className="text-muted-foreground">Delivery charge</span>
          <span className="font-medium text-primary">
            {!isDeliverable(distanceMeters)
              ? 'Not available'
              : deliveryFee === 0
                ? 'Free'
                : `₹${deliveryFee}`}
          </span>
        </div>
      </div>
    ) : (
      <p className="text-sm text-muted-foreground">Pick a location on the map to see distance and fee.</p>
    )

  return (
    <div className="container mx-auto px-4 py-8">
      {isLoading && <OverlayLoader text="Placing your order..." />}

      <div className="mb-6">
        <Link
          href="/cart"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Cart
        </Link>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <form onSubmit={handleSubmit}>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Delivery Location
                </CardTitle>
                <CardDescription>
                  Use your current location or tap the map. Red marker is the shop.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {savedAddresses.length > 0 && !showNewAddress && (
                  <div className="space-y-4">
                    <RadioGroup value={selectedAddressId} onValueChange={setSelectedAddressId}>
                      {savedAddresses.map((addr) => (
                        <div
                          key={addr._id}
                          className={`flex items-start gap-3 p-4 rounded-lg border transition-colors cursor-pointer ${
                            selectedAddressId === addr._id
                              ? 'border-primary bg-primary/5'
                              : 'border-border hover:border-primary/50'
                          }`}
                          onClick={() => setSelectedAddressId(addr._id || '')}
                        >
                          <RadioGroupItem value={addr._id || ''} id={addr._id} className="mt-1" />
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-medium text-foreground">{addr.label}</span>
                              {addr.isDefault && (
                                <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                                  Default
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground">{addr.fullAddress}</p>
                            <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                              <Phone className="h-3 w-3" />
                              {addr.mobile}
                            </p>
                          </div>
                        </div>
                      ))}
                    </RadioGroup>

                    <Button
                      type="button"
                      variant="outline"
                      className="w-full gap-2"
                      onClick={() => {
                        setShowNewAddress(true)
                        setDeliveryLocation(null)
                        setMobile('')
                        setFullAddress('')
                      }}
                    >
                      <Plus className="h-4 w-4" />
                      Add New Address
                    </Button>
                  </div>
                )}

                {(showNewAddress || savedAddresses.length === 0) && (
                  <div className="space-y-4">
                    {savedAddresses.length > 0 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowNewAddress(false)}
                      >
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Use Saved Address
                      </Button>
                    )}

                    {showNewAddress && (
                      <div className="space-y-2">
                        <Label htmlFor="label">Address Label</Label>
                        <Input
                          id="label"
                          placeholder="e.g., Home, Office"
                          value={label}
                          onChange={(e) => setLabel(e.target.value)}
                        />
                      </div>
                    )}
                  </div>
                )}

                <LocationPicker
                  value={deliveryLocation}
                  onChange={handleLocationChange}
                  shopLocation={shopLocation}
                  center={shopLocation ?? undefined}
                />

                {distanceBlock}

                <div className="space-y-2">
                  <Label htmlFor="mobile" className="flex items-center gap-2">
                    <Phone className="h-4 w-4" />
                    Mobile Number
                  </Label>
                  <Input
                    id="mobile"
                    type="tel"
                    placeholder="Enter your mobile number"
                    value={mobile}
                    onChange={(e) => setMobile(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address" className="flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    Address {geocoding && '(updating…)'}
                  </Label>
                  <Textarea
                    id="address"
                    placeholder="Address from map — add landmark or flat no. if needed"
                    value={fullAddress}
                    onChange={(e) => setFullAddress(e.target.value)}
                    rows={3}
                    required
                  />
                </div>

                {showNewAddress && (
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id="save"
                      checked={saveAddress}
                      onCheckedChange={(checked) => setSaveAddress(checked as boolean)}
                    />
                    <Label htmlFor="save" className="text-sm text-muted-foreground cursor-pointer">
                      Save this address for future orders
                    </Label>
                  </div>
                )}

                <details className="text-sm text-muted-foreground">
                  <summary className="cursor-pointer font-medium text-foreground">
                    Delivery fee slabs
                  </summary>
                  <ul className="mt-2 space-y-1 pl-2">
                    {DELIVERY_FEE_TIERS.map((tier) => (
                      <li key={tier.label} className="flex justify-between gap-4">
                        <span>{tier.label}</span>
                        <span>{tier.fee === 0 ? 'Free' : `₹${tier.fee}`}</span>
                      </li>
                    ))}
                  </ul>
                </details>
              </CardContent>
              <CardFooter>
                <Button
                  type="submit"
                  className="w-full gap-2"
                  size="lg"
                  disabled={
                    isLoading ||
                    !deliveryLocation ||
                    deliveryFee === null ||
                    deliveryFee < 0 ||
                    (distanceMeters !== null && !isDeliverable(distanceMeters))
                  }
                >
                  {isLoading ? (
                    <>
                      <Loader size="sm" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <Check className="h-4 w-4" />
                      Place Order — ₹{orderTotal.toFixed(2)}
                    </>
                  )}
                </Button>
              </CardFooter>
            </Card>
          </form>
        </div>

        <div className="lg:col-span-1">
          <Card className="sticky top-24">
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                {items.map((item) => (
                  <div key={item.itemId} className="flex gap-3">
                    <div className="h-12 w-12 rounded-lg overflow-hidden bg-muted shrink-0">
                      <img
                        src={item.imageUrl}
                        alt={item.name}
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{item.name}</p>
                      <p className="text-xs text-muted-foreground">Qty: {item.quantity}</p>
                    </div>
                    <p className="text-sm font-medium text-foreground">
                      ₹{(item.price * item.quantity).toFixed(2)}
                    </p>
                  </div>
                ))}
              </div>
              <div className="border-t border-border pt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="text-foreground">₹{total.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Delivery</span>
                  <span className="text-foreground">
                    {deliveryFee === null
                      ? '—'
                      : deliveryFee === 0
                        ? 'Free'
                        : `₹${deliveryFee.toFixed(2)}`}
                  </span>
                </div>
                {distanceMeters !== null && (
                  <p className="text-xs text-muted-foreground">
                    {formatDistance(distanceMeters)} from shop
                  </p>
                )}
                <div className="flex justify-between text-lg font-bold pt-2 border-t border-border">
                  <span className="text-foreground">Total</span>
                  <span className="text-primary">₹{orderTotal.toFixed(2)}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
