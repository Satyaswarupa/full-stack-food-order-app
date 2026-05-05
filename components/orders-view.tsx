'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import useSWR from 'swr'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { PageLoader } from '@/components/loader'
import { Package, Clock, MapPin, Phone, ArrowLeft, RefreshCw } from 'lucide-react'
import { formatDistanceToNow, format } from 'date-fns'

interface OrderItem {
  itemId: string
  name: string
  price: number
  quantity: number
  imageUrl: string
}

interface Order {
  _id: string
  items: OrderItem[]
  total: number
  status: 'pending' | 'confirmed' | 'preparing' | 'ready' | 'delivered' | 'cancelled'
  deliveryAddress: {
    mobile: string
    fullAddress: string
  }
  createdAt: string
}

const statusConfig: Record<string, { label: string; color: string; step: number }> = {
  pending: { label: 'Pending', color: 'bg-yellow-500', step: 1 },
  confirmed: { label: 'Confirmed', color: 'bg-blue-500', step: 2 },
  preparing: { label: 'Preparing', color: 'bg-orange-500', step: 3 },
  ready: { label: 'Ready', color: 'bg-green-500', step: 4 },
  delivered: { label: 'Delivered', color: 'bg-primary', step: 5 },
  cancelled: { label: 'Cancelled', color: 'bg-destructive', step: -1 }
}

const fetcher = (url: string) => fetch(url).then(res => res.json())

export function OrdersView() {
  const { data, isLoading, mutate } = useSWR<{ orders: Order[] }>('/api/orders', fetcher, {
    refreshInterval: 5000 // Poll every 5 seconds for real-time updates
  })

  // Listen for order status updates
  useEffect(() => {
    const handleOrderUpdate = () => mutate()
    window.addEventListener('order-status-update', handleOrderUpdate)
    return () => window.removeEventListener('order-status-update', handleOrderUpdate)
  }, [mutate])

  if (isLoading) return <PageLoader text="Loading your orders..." />

  const orders = data?.orders || []

  if (orders.length === 0) {
    return (
      <div className="container mx-auto px-4 py-12">
        <Card className="max-w-lg mx-auto">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-muted mb-6">
              <Package className="h-10 w-10 text-muted-foreground" />
            </div>
            <h2 className="text-2xl font-bold text-foreground mb-2">No orders yet</h2>
            <p className="text-muted-foreground mb-6 text-center">
              Start ordering delicious food and your orders will appear here
            </p>
            <Link href="/">
              <Button className="gap-2">
                <ArrowLeft className="h-4 w-4" />
                Browse Menu
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">My Orders</h1>
          <p className="text-muted-foreground">Track your orders in real-time</p>
        </div>
        <Button variant="outline" size="icon" onClick={() => mutate()}>
          <RefreshCw className="h-4 w-4" />
        </Button>
      </div>

      <div className="space-y-4">
        {orders.map((order) => {
          const status = statusConfig[order.status]
          const isActive = order.status !== 'delivered' && order.status !== 'cancelled'

          return (
            <Card key={order._id} className={isActive ? 'border-primary/30' : ''}>
              <CardHeader className="pb-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <CardTitle className="text-base flex items-center gap-2">
                      Order #{order._id.slice(-6).toUpperCase()}
                      <Badge className={`${status.color} text-white`}>
                        {status.label}
                      </Badge>
                    </CardTitle>
                    <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      <span>{format(new Date(order.createdAt), 'MMM d, yyyy h:mm a')}</span>
                      <span className="text-muted-foreground">
                        ({formatDistanceToNow(new Date(order.createdAt), { addSuffix: true })})
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-lg font-bold text-primary">₹{order.total.toFixed(2)}</span>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Progress Steps */}
                {isActive && status.step > 0 && (
                  <div className="flex items-center gap-2 mb-4">
                    {[1, 2, 3, 4, 5].map((step) => (
                      <div key={step} className="flex-1">
                        <div
                          className={`h-2 rounded-full transition-colors ${
                            step <= status.step ? 'bg-primary' : 'bg-muted'
                          }`}
                        />
                        <span className={`text-xs mt-1 block text-center ${
                          step <= status.step ? 'text-primary font-medium' : 'text-muted-foreground'
                        }`}>
                          {step === 1 && 'Pending'}
                          {step === 2 && 'Confirmed'}
                          {step === 3 && 'Preparing'}
                          {step === 4 && 'Ready'}
                          {step === 5 && 'Delivered'}
                        </span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Order Items */}
                <div className="space-y-2">
                  {order.items.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-3 p-2 rounded-lg bg-muted/50">
                      <img
                        src={item.imageUrl}
                        alt={item.name}
                        className="h-12 w-12 rounded-lg object-cover"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">{item.name}</p>
                        <p className="text-xs text-muted-foreground">
                          ₹{item.price.toFixed(2)} x {item.quantity}
                        </p>
                      </div>
                      <p className="text-sm font-medium text-foreground">
                        ₹{(item.price * item.quantity).toFixed(2)}
                      </p>
                    </div>
                  ))}
                </div>

                {/* Delivery Address */}
                <div className="pt-3 border-t border-border">
                  <h4 className="text-sm font-medium text-foreground mb-2">Delivery Address</h4>
                  <div className="space-y-1 text-sm text-muted-foreground">
                    <div className="flex items-start gap-2">
                      <Phone className="h-4 w-4 mt-0.5" />
                      <span>{order.deliveryAddress.mobile}</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <MapPin className="h-4 w-4 mt-0.5" />
                      <span>{order.deliveryAddress.fullAddress}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
