import { NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import Item from '@/lib/models/Item'
import { getCurrentUser } from '@/lib/auth'

export async function GET(request: Request) {
  try {
    await connectDB()
    
    const { searchParams } = new URL(request.url)
    const all = searchParams.get('all') === 'true'
    
    const user = await getCurrentUser()
    
    // If admin and requesting all, show all items
    // Otherwise only show enabled items
    const query = (all && user?.role === 'admin') ? {} : { isEnabled: true }
    
    const items = await Item.find(query).sort({ createdAt: -1 })
    
    return NextResponse.json(
      { items },
      {
        headers: {
          'Cache-Control': 'no-store, max-age=0',
        },
      }
    )
  } catch (error) {
    console.error('Get items error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser()
    
    if (!user || user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      )
    }

    const { name, description, imageUrl, price } = await request.json()

    if (!name || !description || !imageUrl || !price) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      )
    }

    await connectDB()

    const item = await Item.create({
      name,
      description,
      imageUrl,
      price: parseFloat(price),
      isEnabled: true
    })

    return NextResponse.json({ item })
  } catch (error) {
    console.error('Create item error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
