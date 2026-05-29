import { NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import { getCurrentUser } from '@/lib/auth'
import { getOrCreateShopSettings } from '@/lib/models/ShopSettings'

export async function GET() {
  try {
    await connectDB()
    const settings = await getOrCreateShopSettings()
    return NextResponse.json({
      shop: {
        shopName: settings.shopName,
        address: settings.address,
        lat: settings.lat,
        lng: settings.lng,
        isConfigured: Boolean(settings.address),
      },
    })
  } catch (error) {
    console.error('Get shop settings error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  try {
    const user = await getCurrentUser()
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { shopName, address, lat, lng } = await request.json()

    if (typeof lat !== 'number' || typeof lng !== 'number') {
      return NextResponse.json({ error: 'Valid map location is required' }, { status: 400 })
    }

    await connectDB()

    const settings = await getOrCreateShopSettings()
    settings.shopName = shopName ?? settings.shopName
    settings.address = address ?? settings.address
    settings.lat = lat
    settings.lng = lng
    await settings.save()

    return NextResponse.json({
      shop: {
        shopName: settings.shopName,
        address: settings.address,
        lat: settings.lat,
        lng: settings.lng,
        isConfigured: true,
      },
    })
  } catch (error) {
    console.error('Update shop settings error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
