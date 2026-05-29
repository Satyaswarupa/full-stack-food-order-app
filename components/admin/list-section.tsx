'use client'

import { useState, useCallback, useEffect } from 'react'
import useSWR from 'swr'
import { toast } from 'sonner'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Loader, PageLoader } from '@/components/loader'
import { emitItemsUpdate } from '@/contexts/socket-context'
import { syncItemEnabled, subscribeItemsUpdates, normalizeItemId } from '@/lib/items-sync'
import { Edit2, Trash2, Eye, EyeOff, Search, Package } from 'lucide-react'

interface Item {
  _id: string
  name: string
  description: string
  imageUrl: string
  price: number
  isEnabled: boolean
  createdAt: string
}

const fetcher = (url: string) =>
  fetch(url, { cache: 'no-store' }).then((res) => res.json())

export function ListSection() {
  const { data, isLoading, mutate } = useSWR<{ items: Item[] }>('/api/items?all=true', fetcher, {
    revalidateOnFocus: true,
    keepPreviousData: true,
  })
  const [searchQuery, setSearchQuery] = useState('')
  const [editItem, setEditItem] = useState<Item | null>(null)
  const [isUpdating, setIsUpdating] = useState<string | null>(null)
  const [editForm, setEditForm] = useState({
    name: '',
    description: '',
    imageUrl: '',
    price: ''
  })

  // Refresh when another tab changes items (not same-tab toggle — avoids page loader)
  useEffect(() => {
    const unsub = subscribeItemsUpdates(() => {
      void mutate((current) => current, { revalidate: true })
    })
    return unsub
  }, [mutate])

  const handleToggleEnabled = useCallback(async (item: Item, nextEnabled: boolean) => {
    if (nextEnabled === item.isEnabled) return

    const itemId = normalizeItemId(item._id)
    setIsUpdating(itemId)

    void syncItemEnabled(itemId, nextEnabled)

    try {
      const res = await fetch(`/api/items/${itemId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isEnabled: nextEnabled }),
      })

      if (!res.ok) throw new Error('Failed to update item')

      emitItemsUpdate()
      toast.success(`Item ${nextEnabled ? 'enabled' : 'disabled'}`)
    } catch {
      await syncItemEnabled(itemId, item.isEnabled)
      toast.error('Failed to update item')
    } finally {
      setIsUpdating(null)
    }
  }, [])

  const handleEdit = (item: Item) => {
    setEditItem(item)
    setEditForm({
      name: item.name,
      description: item.description,
      imageUrl: item.imageUrl,
      price: item.price.toString()
    })
  }

  const handleSaveEdit = async () => {
    if (!editItem) return

    setIsUpdating(editItem._id)

    try {
      const res = await fetch(`/api/items/${editItem._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: editForm.name,
          description: editForm.description,
          imageUrl: editForm.imageUrl,
          price: parseFloat(editForm.price)
        })
      })

      if (!res.ok) throw new Error('Failed to update item')

      emitItemsUpdate()
      toast.success('Item updated successfully')
      setEditItem(null)
    } catch {
      toast.error('Failed to update item')
    } finally {
      setIsUpdating(null)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this item?')) return

    setIsUpdating(id)

    try {
      const res = await fetch(`/api/items/${id}`, {
        method: 'DELETE'
      })

      if (!res.ok) throw new Error('Failed to delete item')

      emitItemsUpdate()
      await mutate()
      toast.success('Item deleted successfully')
    } catch {
      toast.error('Failed to delete item')
    } finally {
      setIsUpdating(null)
    }
  }

  if (isLoading && !data) return <PageLoader text="Loading items..." />

  const items = data?.items || []
  const filteredItems = items.filter(item =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.description.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Item List</h1>
          <p className="text-muted-foreground">Manage your menu items</p>
        </div>
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search items..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      {filteredItems.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Package className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-lg font-medium text-foreground">No items found</p>
            <p className="text-sm text-muted-foreground">
              {searchQuery ? 'Try a different search term' : 'Add some items to get started'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="rounded-lg border border-border bg-card divide-y divide-border overflow-hidden">
          {filteredItems.map((item) => (
            <div
              key={item._id}
              className={`flex flex-col sm:flex-row sm:items-center gap-4 p-4 transition-opacity ${
                !item.isEnabled ? 'opacity-60 bg-muted/30' : ''
              }`}
            >
              <div className="flex items-center gap-4 flex-1 min-w-0">
                <div className="relative h-20 w-20 shrink-0 rounded-lg overflow-hidden bg-muted">
                  <img
                    src={item.imageUrl}
                    alt={item.name}
                    className="h-full w-full object-cover"
                    onError={(e) => {
                      ;(e.target as HTMLImageElement).src =
                        'https://placehold.co/80x80?text=No+Image'
                    }}
                  />
                  {!item.isEnabled && (
                    <div className="absolute inset-0 bg-background/70 flex items-center justify-center">
                      <span className="text-[10px] font-medium text-foreground bg-card px-2 py-0.5 rounded">
                        Off
                      </span>
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-foreground truncate">{item.name}</h3>
                  <p className="text-sm text-muted-foreground line-clamp-2 mt-0.5">
                    {item.description}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between sm:justify-end gap-4 sm:gap-6 shrink-0 w-full sm:w-auto">
                <span className="text-lg font-bold text-primary whitespace-nowrap">
                  ₹{item.price.toFixed(2)}
                </span>

                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    <div className="relative flex items-center">
                      <Switch
                        checked={item.isEnabled}
                        onCheckedChange={(checked) => handleToggleEnabled(item, checked)}
                        disabled={isUpdating === normalizeItemId(item._id)}
                      />
                      {isUpdating === normalizeItemId(item._id) && (
                        <Loader size="sm" className="ml-2" />
                      )}
                    </div>
                    <span className="text-xs text-muted-foreground hidden md:flex items-center gap-1">
                      {item.isEnabled ? (
                        <>
                          <Eye className="h-3 w-3" /> Visible
                        </>
                      ) : (
                        <>
                          <EyeOff className="h-3 w-3" /> Hidden
                        </>
                      )}
                    </span>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleEdit(item)}
                    disabled={isUpdating === normalizeItemId(item._id)}
                  >
                    <Edit2 className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-destructive hover:text-destructive"
                    onClick={() => handleDelete(item._id)}
                    disabled={isUpdating === normalizeItemId(item._id)}
                  >
                    {isUpdating === normalizeItemId(item._id) ? (
                      <Loader size="sm" />
                    ) : (
                      <Trash2 className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Edit Dialog */}
      <Dialog open={!!editItem} onOpenChange={(open) => !open && setEditItem(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Item</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Name</Label>
              <Input
                id="edit-name"
                value={editForm.name}
                onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-description">Description</Label>
              <Textarea
                id="edit-description"
                value={editForm.description}
                onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-imageUrl">Image URL</Label>
              <Input
                id="edit-imageUrl"
                value={editForm.imageUrl}
                onChange={(e) => setEditForm({ ...editForm, imageUrl: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-price">Price</Label>
              <Input
                id="edit-price"
                type="number"
                min="0.01"
                step="0.01"
                value={editForm.price}
                onChange={(e) => setEditForm({ ...editForm, price: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditItem(null)}>
              Cancel
            </Button>
            <Button onClick={handleSaveEdit} disabled={isUpdating === editItem?._id}>
              {isUpdating === editItem?._id ? (
                <>
                  <Loader size="sm" className="mr-2" />
                  Saving...
                </>
              ) : (
                'Save Changes'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
