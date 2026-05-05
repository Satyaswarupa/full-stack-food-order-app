'use client'

import { useState, useEffect, useCallback } from 'react'
import useSWR from 'swr'
import { toast } from 'sonner'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Loader, PageLoader } from '@/components/loader'
import { emitOrderUpdate } from '@/contexts/socket-context'
import { Package, Phone, MapPin, Clock, RefreshCw } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'

interface OrderItem {
  itemId: string
  name: string
  price: number
  quantity: number
  imageUrl: string
}

interface Order {
  _id: string
  userId: string
  userName: string
  userEmail: string
  items: OrderItem[]
  total: number
  status: 'pending' | 'confirmed' | 'preparing' | 'ready' | 'delivered' | 'cancelled'
  deliveryAddress: {
    mobile: string
    fullAddress: string
  }
  createdAt: string
}

const statusOptions = [
  { value: 'pending', label: 'Pending', color: 'bg-yellow-500' },
  { value: 'confirmed', label: 'Confirmed', color: 'bg-blue-500' },
  { value: 'preparing', label: 'Preparing', color: 'bg-orange-500' },
  { value: 'ready', label: 'Ready', color: 'bg-green-500' },
  { value: 'delivered', label: 'Delivered', color: 'bg-primary' },
  { value: 'cancelled', label: 'Cancelled', color: 'bg-destructive' },
]

const fetcher = (url: string) => fetch(url).then(res => res.json())

export function OrdersSection() {
  const { data, isLoading, mutate } = useSWR<{ orders: Order[] }>('/api/orders', fetcher, {
    refreshInterval: 5000 // Poll every 5 seconds for real-time updates
  })
  const [updatingOrders, setUpdatingOrders] = useState<Set<string>>(new Set())
  const [filter, setFilter] = useState<string>('all')

  const handleStatusChange = useCallback(async (orderId: string, newStatus: string) => {
    setUpdatingOrders(prev => new Set(prev).add(orderId))
    
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      })

      if (!res.ok) throw new Error('Failed to update order')

      const { order } = await res.json()
      
      // Emit socket event for real-time update
      emitOrderUpdate(order)
      
      mutate()
      toast.success(`Order status updated to ${newStatus}`)
    } catch {
      toast.error('Failed to update order status')
    } finally {
      setUpdatingOrders(prev => {
        const next = new Set(prev)
        next.delete(orderId)
        return next
      })
    }
  }, [mutate])

  // Listen for new orders
  useEffect(() => {
    const handleNewOrder = () => {
      mutate()
      toast.info('New order received!')
    }

    window.addEventListener('new-order', handleNewOrder)
    return () => window.removeEventListener('new-order', handleNewOrder)
  }, [mutate])

  if (isLoading) return <PageLoader text="Loading orders..." />

  const orders = data?.orders || []
  const filteredOrders = filter === 'all' 
    ? orders 
    : orders.filter(o => o.status === filter)

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Orders</h1>
          <p className="text-muted-foreground">Manage and track all orders in real-time</p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={filter} onValueChange={setFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Orders</SelectItem>
              {statusOptions.map(s => (
                <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button variant="outline" size="icon" onClick={() => mutate()}>
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {filteredOrders.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Package className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-lg font-medium text-foreground">No orders found</p>
            <p className="text-sm text-muted-foreground">Orders will appear here in real-time</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {filteredOrders.map((order) => (
            <Card key={order._id} className="overflow-hidden">
              <CardHeader className="pb-3 bg-muted/30">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <CardTitle className="text-base flex items-center gap-2">
                      Order #{order._id.slice(-6).toUpperCase()}
                      <Badge className={`${statusOptions.find(s => s.value === order.status)?.color} text-white`}>
                        {order.status}
                      </Badge>
                    </CardTitle>
                    <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                      <span>{order.userName}</span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {formatDistanceToNow(new Date(order.createdAt), { addSuffix: true })}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Select
                      value={order.status}
                      onValueChange={(value) => handleStatusChange(order._id, value)}
                      disabled={updatingOrders.has(order._id)}
                    >
                      <SelectTrigger className="w-36">
                        {updatingOrders.has(order._id) ? (
                          <Loader size="sm" />
                        ) : (
                          <SelectValue />
                        )}
                      </SelectTrigger>
                      <SelectContent>
                        {statusOptions.map(s => (
                          <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="text-sm font-medium text-foreground mb-2">Items</h4>
                    <div className="space-y-2">
                      {order.items.map((item, idx) => (
                        <div key={idx} className="flex items-center gap-3 p-2 rounded-lg bg-muted/50">
                          <img
                            src={item.imageUrl}
                            alt={item.name}
                            className="h-10 w-10 rounded object-cover"
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
                    <div className="mt-3 pt-3 border-t border-border flex justify-between">
                      <span className="font-medium text-foreground">Total</span>
                      <span className="font-bold text-primary">₹{order.total.toFixed(2)}</span>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <h4 className="text-sm font-medium text-foreground">Delivery Details</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-start gap-2">
                        <Phone className="h-4 w-4 text-muted-foreground mt-0.5" />
                        <span className="text-foreground">{order.deliveryAddress.mobile}</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                        <span className="text-foreground">{order.deliveryAddress.fullAddress}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
