'use client'

import useSWR from 'swr'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { PageLoader } from '@/components/loader'
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts'
import { DollarSign, Package, Users, ShoppingBag, TrendingUp, TrendingDown } from 'lucide-react'
import { format } from 'date-fns'

interface Stats {
  totalOrders: number
  totalUsers: number
  totalItems: number
  totalRevenue: number
  ordersByStatus: Record<string, number>
  dailyOrders: Array<{ _id: string; orders: number; revenue: number }>
  topItems: Array<{ _id: string; quantity: number; revenue: number }>
  monthlyRevenue: Array<{ _id: string; revenue: number; orders: number }>
}

const fetcher = (url: string) => fetch(url).then(res => res.json())

const COLORS = ['hsl(142, 76%, 36%)', 'hsl(35, 92%, 53%)', 'hsl(200, 74%, 50%)', 'hsl(320, 72%, 55%)', 'hsl(0, 72%, 51%)']

const statusColors: Record<string, string> = {
  pending: '#eab308',
  confirmed: '#3b82f6',
  preparing: '#f97316',
  ready: '#22c55e',
  delivered: '#16a34a',
  cancelled: '#ef4444'
}

export function ChartsSection() {
  const { data, isLoading } = useSWR<Stats>('/api/stats', fetcher, {
    refreshInterval: 30000 // Refresh every 30 seconds
  })

  if (isLoading) return <PageLoader text="Loading analytics..." />

  const stats = data || {
    totalOrders: 0,
    totalUsers: 0,
    totalItems: 0,
    totalRevenue: 0,
    ordersByStatus: {},
    dailyOrders: [],
    topItems: [],
    monthlyRevenue: []
  }

  const statusData = Object.entries(stats.ordersByStatus).map(([name, value]) => ({
    name: name.charAt(0).toUpperCase() + name.slice(1),
    value,
    color: statusColors[name] || '#gray'
  }))

  const dailyData = stats.dailyOrders.map(d => ({
    date: format(new Date(d._id), 'MMM d'),
    orders: d.orders,
    revenue: d.revenue
  }))

  const monthlyData = stats.monthlyRevenue.map(m => ({
    month: format(new Date(m._id + '-01'), 'MMM yyyy'),
    revenue: m.revenue,
    orders: m.orders
  }))

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground">Overview of your store performance</p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Revenue</p>
                <p className="text-2xl font-bold text-foreground">₹{stats.totalRevenue.toFixed(2)}</p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                <DollarSign className="h-6 w-6 text-primary" />
              </div>
            </div>
            <div className="mt-2 flex items-center text-sm text-muted-foreground">
              <TrendingUp className="mr-1 h-4 w-4 text-green-500" />
              <span className="text-green-500 font-medium">+12%</span>
              <span className="ml-1">from last month</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Orders</p>
                <p className="text-2xl font-bold text-foreground">{stats.totalOrders}</p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-accent/10">
                <Package className="h-6 w-6 text-accent" />
              </div>
            </div>
            <div className="mt-2 flex items-center text-sm text-muted-foreground">
              <TrendingUp className="mr-1 h-4 w-4 text-green-500" />
              <span className="text-green-500 font-medium">+8%</span>
              <span className="ml-1">from last month</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Users</p>
                <p className="text-2xl font-bold text-foreground">{stats.totalUsers}</p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-500/10">
                <Users className="h-6 w-6 text-blue-500" />
              </div>
            </div>
            <div className="mt-2 flex items-center text-sm text-muted-foreground">
              <TrendingUp className="mr-1 h-4 w-4 text-green-500" />
              <span className="text-green-500 font-medium">+5%</span>
              <span className="ml-1">new users this week</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Menu Items</p>
                <p className="text-2xl font-bold text-foreground">{stats.totalItems}</p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-purple-500/10">
                <ShoppingBag className="h-6 w-6 text-purple-500" />
              </div>
            </div>
            <div className="mt-2 flex items-center text-sm text-muted-foreground">
              <TrendingDown className="mr-1 h-4 w-4 text-muted-foreground" />
              <span>No change this week</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Daily Orders & Revenue */}
        <Card>
          <CardHeader>
            <CardTitle>Daily Overview</CardTitle>
            <CardDescription>Orders and revenue for the last 7 days</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={dailyData}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(142, 76%, 36%)" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="hsl(142, 76%, 36%)" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="date" className="text-xs" />
                  <YAxis className="text-xs" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }}
                  />
                  <Legend />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    name="Revenue ($)"
                    stroke="hsl(142, 76%, 36%)"
                    fillOpacity={1}
                    fill="url(#colorRevenue)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Orders by Status */}
        <Card>
          <CardHeader>
            <CardTitle>Orders by Status</CardTitle>
            <CardDescription>Distribution of order statuses</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={2}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {statusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bottom Row */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Top Selling Items */}
        <Card>
          <CardHeader>
            <CardTitle>Top Selling Items</CardTitle>
            <CardDescription>Best performing menu items</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.topItems} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis type="number" className="text-xs" />
                  <YAxis type="category" dataKey="_id" className="text-xs" width={100} />
                  <Tooltip
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }}
                  />
                  <Bar dataKey="quantity" name="Quantity Sold" fill="hsl(142, 76%, 36%)" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Monthly Revenue */}
        <Card>
          <CardHeader>
            <CardTitle>Monthly Revenue</CardTitle>
            <CardDescription>Revenue trend over the last 6 months</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="month" className="text-xs" />
                  <YAxis className="text-xs" />
                  <Tooltip
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }}
                    formatter={(value: number) => [`₹${value.toFixed(2)}`, 'Revenue']}
                  />
                  <Bar dataKey="revenue" name="Revenue" fill="hsl(35, 92%, 53%)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
