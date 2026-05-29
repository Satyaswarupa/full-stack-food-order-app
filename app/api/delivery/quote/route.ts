import { NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import { getOrCreateShopSettings } from '@/lib/models/ShopSettings'
import { fetchDrivingDistanceMeters } from '@/lib/routing'
import { getDeliveryFee, isDeliverable, MAX_DELIVERY_DISTANCE_M } from '@/lib/delivery'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const lat = parseFloat(searchParams.get('lat') ?? '')
    const lng = parseFloat(searchParams.get('lng') ?? '')

    if (Number.isNaN(lat) || Number.isNaN(lng)) {
      return NextResponse.json({ error: 'lat and lng are required' }, { status: 400 })
    }

    await connectDB()
    const shop = await getOrCreateShopSettings()

    const distanceMeters = await fetchDrivingDistanceMeters(
      { lat: shop.lat, lng: shop.lng },
      { lat, lng }
    )

    const deliveryFee = getDeliveryFee(distanceMeters)
    const deliverable = isDeliverable(distanceMeters)

    return NextResponse.json({
      distanceMeters,
      deliveryFee: deliveryFee < 0 ? null : deliveryFee,
      deliverable,
      maxDistanceMeters: MAX_DELIVERY_DISTANCE_M,
      distanceType: 'driving',
    })
  } catch (error) {
    console.error('Delivery quote error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
