import { NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import Order from '@/lib/models/Order'
import { getCurrentUser } from '@/lib/auth'

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser()

    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    const { id } = await params
    const { lat, lng, tracking } = await request.json()

    await connectDB()

    const order = await Order.findById(id)
    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    if (order.status === 'delivered' || order.status === 'cancelled') {
      return NextResponse.json({ error: 'Order is already closed' }, { status: 400 })
    }

    const $set: Record<string, unknown> = {}
    const $unset: Record<string, 1> = {}

    if (typeof tracking === 'boolean') {
      $set.isDeliveryTracking = tracking
      if (!tracking) {
        $unset.courierLocation = 1
      }
    }

    if (typeof lat === 'number' && typeof lng === 'number') {
      $set.courierLocation = { lat, lng, updatedAt: new Date() }
      if (tracking !== false) {
        $set.isDeliveryTracking = true
      }
    }

    if (Object.keys($set).length === 0 && Object.keys($unset).length === 0) {
      return NextResponse.json({ error: 'No updates provided' }, { status: 400 })
    }

    const update: Record<string, unknown> = {}
    if (Object.keys($set).length) update.$set = $set
    if (Object.keys($unset).length) update.$unset = $unset

    const updated = await Order.findByIdAndUpdate(id, update, { new: true })

    return NextResponse.json({ order: updated })
  } catch (error) {
    console.error('Update courier location error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
