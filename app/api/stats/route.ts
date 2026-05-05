import { NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import Order from '@/lib/models/Order'
import User from '@/lib/models/User'
import Item from '@/lib/models/Item'
import { getCurrentUser } from '@/lib/auth'

export async function GET() {
  try {
    const user = await getCurrentUser()
    
    if (!user || user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      )
    }

    await connectDB()

    // Get total counts
    const totalOrders = await Order.countDocuments()
    const totalUsers = await User.countDocuments()
    const totalItems = await Item.countDocuments()

    // Get total revenue
    const revenueResult = await Order.aggregate([
      { $match: { status: { $ne: 'cancelled' } } },
      { $group: { _id: null, total: { $sum: '$total' } } }
    ])
    const totalRevenue = revenueResult[0]?.total || 0

    // Get orders by status
    const ordersByStatus = await Order.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ])

    // Get daily orders for the last 7 days
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

    const dailyOrders = await Order.aggregate([
      { $match: { createdAt: { $gte: sevenDaysAgo } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          orders: { $sum: 1 },
          revenue: { $sum: '$total' }
        }
      },
      { $sort: { _id: 1 } }
    ])

    // Get top selling items
    const topItems = await Order.aggregate([
      { $unwind: '$items' },
      {
        $group: {
          _id: '$items.name',
          quantity: { $sum: '$items.quantity' },
          revenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } }
        }
      },
      { $sort: { quantity: -1 } },
      { $limit: 5 }
    ])

    // Get monthly revenue for the last 6 months
    const sixMonthsAgo = new Date()
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6)

    const monthlyRevenue = await Order.aggregate([
      { $match: { createdAt: { $gte: sixMonthsAgo }, status: { $ne: 'cancelled' } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m', date: '$createdAt' } },
          revenue: { $sum: '$total' },
          orders: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ])

    return NextResponse.json({
      totalOrders,
      totalUsers,
      totalItems,
      totalRevenue,
      ordersByStatus: ordersByStatus.reduce((acc, item) => {
        acc[item._id] = item.count
        return acc
      }, {} as Record<string, number>),
      dailyOrders,
      topItems,
      monthlyRevenue
    })
  } catch (error) {
    console.error('Get stats error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
