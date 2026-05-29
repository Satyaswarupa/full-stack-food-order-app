import { NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import Order from '@/lib/models/Order'
import { getCurrentUser } from '@/lib/auth'

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser()
    
    if (!user || user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      )
    }

    const { id } = await params
    const { status } = await request.json()

    await connectDB()

    const update: Record<string, unknown> = { $set: { status } }

    if (status === 'delivered' || status === 'cancelled') {
      update.$set = { status, isDeliveryTracking: false }
      update.$unset = { courierLocation: 1 }
    }

    const order = await Order.findByIdAndUpdate(id, update, { new: true })

    if (!order) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ order })
  } catch (error) {
    console.error('Update order error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
