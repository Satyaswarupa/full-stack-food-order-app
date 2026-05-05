'use client'

import { useState, useCallback } from 'react'
import useSWR from 'swr'
import { toast } from 'sonner'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
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

const fetcher = (url: string) => fetch(url).then(res => res.json())

export function ListSection() {
  const { data, isLoading, mutate } = useSWR<{ items: Item[] }>('/api/items?all=true', fetcher)
  const [searchQuery, setSearchQuery] = useState('')
  const [editItem, setEditItem] = useState<Item | null>(null)
  const [isUpdating, setIsUpdating] = useState<string | null>(null)
  const [editForm, setEditForm] = useState({
    name: '',
    description: '',
    imageUrl: '',
    price: ''
  })

  const handleToggleEnabled = useCallback(async (item: Item) => {
    setIsUpdating(item._id)
    
    try {
      const res = await fetch(`/api/items/${item._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isEnabled: !item.isEnabled })
      })

      if (!res.ok) throw new Error('Failed to update item')

      emitItemsUpdate()
      mutate()
      toast.success(`Item ${!item.isEnabled ? 'enabled' : 'disabled'}`)
    } catch {
      toast.error('Failed to update item')
    } finally {
      setIsUpdating(null)
    }
  }, [mutate])

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
      mutate()
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
      mutate()
      toast.success('Item deleted successfully')
    } catch {
      toast.error('Failed to delete item')
    } finally {
      setIsUpdating(null)
    }
  }

  if (isLoading) return <PageLoader text="Loading items..." />

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
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredItems.map((item) => (
            <Card key={item._id} className={`overflow-hidden transition-opacity ${!item.isEnabled ? 'opacity-60' : ''}`}>
              <div className="aspect-video relative">
                <img
                  src={item.imageUrl}
                  alt={item.name}
                  className="object-cover w-full h-full"
                />
                {!item.isEnabled && (
                  <div className="absolute inset-0 bg-background/60 flex items-center justify-center">
                    <span className="text-sm font-medium text-foreground bg-card px-3 py-1 rounded-full">
                      Disabled
                    </span>
                  </div>
                )}
              </div>
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between gap-2">
                  <CardTitle className="text-base line-clamp-1">{item.name}</CardTitle>
                  <span className="text-lg font-bold text-primary shrink-0">
                    ₹{item.price.toFixed(2)}
                  </span>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                  {item.description}
                </p>
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={item.isEnabled}
                      onCheckedChange={() => handleToggleEnabled(item)}
                      disabled={isUpdating === item._id}
                    />
                    <span className="text-sm text-muted-foreground flex items-center gap-1">
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
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleEdit(item)}
                      disabled={isUpdating === item._id}
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-destructive hover:text-destructive"
                      onClick={() => handleDelete(item._id)}
                      disabled={isUpdating === item._id}
                    >
                      {isUpdating === item._id ? (
                        <Loader size="sm" />
                      ) : (
                        <Trash2 className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
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
