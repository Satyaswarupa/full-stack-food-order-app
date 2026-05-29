import { NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import Order from '@/lib/models/Order'
import User from '@/lib/models/User'
import { getCurrentUser } from '@/lib/auth'
import { getOrCreateShopSettings } from '@/lib/models/ShopSettings'
import {
  getDeliveryFee,
  haversineDistanceMeters,
  isDeliverable,
} from '@/lib/delivery'

export async function GET() {
  try {
    const user = await getCurrentUser()
    
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    await connectDB()

    const query = user.role === 'admin' ? {} : { userId: user._id }
    
    const orders = await Order.find(query).sort({ createdAt: -1 })

    return NextResponse.json({ orders })
  } catch (error) {
    console.error('Get orders error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser()
    
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { items, deliveryAddress, saveAddress, deliveryFee: clientDeliveryFee } =
      await request.json()

    if (!items || items.length === 0 || !deliveryAddress) {
      return NextResponse.json(
        { error: 'Items and delivery address are required' },
        { status: 400 }
      )
    }

    const { mobile, fullAddress, lat, lng, label } = deliveryAddress

    if (!mobile || !fullAddress || typeof lat !== 'number' || typeof lng !== 'number') {
      return NextResponse.json(
        { error: 'Delivery location on map, mobile, and address are required' },
        { status: 400 }
      )
    }

    await connectDB()

    const shop = await getOrCreateShopSettings()
    const distanceMeters = haversineDistanceMeters(shop.lat, shop.lng, lat, lng)

    if (!isDeliverable(distanceMeters)) {
      return NextResponse.json(
        { error: 'Delivery is only available within 5 km of the shop' },
        { status: 400 }
      )
    }

    const deliveryFee = getDeliveryFee(distanceMeters)
    if (deliveryFee < 0) {
      return NextResponse.json(
        { error: 'Unable to calculate delivery fee for this location' },
        { status: 400 }
      )
    }

    if (typeof clientDeliveryFee === 'number' && clientDeliveryFee !== deliveryFee) {
      return NextResponse.json(
        { error: 'Delivery fee has changed. Please review and try again.' },
        { status: 400 }
      )
    }

    const itemsTotal = items.reduce(
      (sum: number, item: { price: number; quantity: number }) =>
        sum + item.price * item.quantity,
      0
    )
    const total = itemsTotal + deliveryFee

    const order = await Order.create({
      userId: user._id,
      userName: user.name,
      userEmail: user.email,
      items,
      total,
      deliveryFee,
      distanceMeters,
      status: 'pending',
      deliveryAddress: { mobile, fullAddress, lat, lng, label },
    })

    if (saveAddress) {
      const addressExists = user.addresses?.some(
        (addr) =>
          addr.fullAddress === fullAddress &&
          addr.mobile === mobile &&
          addr.lat === lat &&
          addr.lng === lng
      )
      
      if (!addressExists) {
        await User.findByIdAndUpdate(user._id, {
          $push: {
            addresses: {
              label: label || 'Home',
              mobile,
              fullAddress,
              lat,
              lng,
              isDefault: user.addresses?.length === 0,
            },
          },
        })
      }
    }

    return NextResponse.json({ order })
  } catch (error) {
    console.error('Create order error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
