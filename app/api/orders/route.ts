import { NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import Order from '@/lib/models/Order'
import User from '@/lib/models/User'
import { getCurrentUser } from '@/lib/auth'

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

    // Admin sees all orders, users see only their orders
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

    const { items, deliveryAddress, saveAddress } = await request.json()

    if (!items || items.length === 0 || !deliveryAddress) {
      return NextResponse.json(
        { error: 'Items and delivery address are required' },
        { status: 400 }
      )
    }

    await connectDB()

    const total = items.reduce((sum: number, item: { price: number; quantity: number }) => 
      sum + (item.price * item.quantity), 0
    )

    const order = await Order.create({
      userId: user._id,
      userName: user.name,
      userEmail: user.email,
      items,
      total,
      status: 'pending',
      deliveryAddress
    })

    // Save address to user profile if requested
    if (saveAddress) {
      const addressExists = user.addresses?.some(
        addr => addr.fullAddress === deliveryAddress.fullAddress && 
                addr.mobile === deliveryAddress.mobile
      )
      
      if (!addressExists) {
        await User.findByIdAndUpdate(user._id, {
          $push: {
            addresses: {
              label: deliveryAddress.label || 'Home',
              mobile: deliveryAddress.mobile,
              fullAddress: deliveryAddress.fullAddress,
              isDefault: user.addresses?.length === 0
            }
          }
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
