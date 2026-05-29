'use client'

import { useState, useEffect } from 'react'
import useSWR from 'swr'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { PageLoader } from '@/components/loader'
import { ItemCard } from '@/components/item-card'
import { Search, ShoppingBag } from 'lucide-react'
import { revalidateAllItemCaches, subscribeItemsUpdates } from '@/lib/items-sync'

interface Item {
  _id: string
  name: string
  description: string
  imageUrl: string
  price: number
  isEnabled: boolean
}

const fetcher = (url: string) =>
  fetch(url, { cache: 'no-store' }).then((res) => res.json())

export function ItemsGrid() {
  const { data, isLoading, mutate } = useSWR<{ items: Item[] }>('/api/items', fetcher, {
    revalidateOnFocus: true,
    refreshInterval: 4000,
    dedupingInterval: 1000,
    keepPreviousData: true,
  })
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    const refresh = () => {
      void revalidateAllItemCaches()
      void mutate()
    }

    window.addEventListener('items-update', refresh)
    const unsubBroadcast = subscribeItemsUpdates(refresh)

    return () => {
      window.removeEventListener('items-update', refresh)
      unsubBroadcast()
    }
  }, [mutate])

  if (isLoading && !data) return <PageLoader text="Loading menu..." />

  const items = data?.items || []
  const filteredItems = items.filter(
    (item) =>
      item.isEnabled !== false &&
      (item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description.toLowerCase().includes(searchQuery.toLowerCase()))
  )

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search menu items..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10 h-12 rounded-xl bg-input border-border/60"
        />
      </div>

      {filteredItems.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <ShoppingBag className="h-16 w-16 text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold text-foreground mb-2">
              {searchQuery ? 'No items found' : 'No items available'}
            </h3>
            <p className="text-muted-foreground text-center max-w-sm">
              {searchQuery
                ? 'Try a different search term or browse all items'
                : 'Check back soon for delicious items!'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="flex flex-col gap-3">
          {filteredItems.map((item) => (
            <ItemCard key={item._id} item={item} />
          ))}
        </div>
      )}
    </div>
  )
}
