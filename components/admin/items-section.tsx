'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Loader } from '@/components/loader'
import { emitItemsUpdate } from '@/contexts/socket-context'
import { Plus, ImageIcon, FileText, Tag, IndianRupeeIcon } from 'lucide-react'

export function ItemsSection() {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [imageUrl, setImageUrl] = useState('')
  const [price, setPrice] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [preview, setPreview] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!name || !description || !imageUrl || !price) {
      toast.error('Please fill in all fields')
      return
    }

    if (parseFloat(price) <= 0) {
      toast.error('Price must be greater than 0')
      return
    }

    setIsLoading(true)

    try {
      const res = await fetch('/api/items', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, description, imageUrl, price: parseFloat(price) })
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to create item')
      }

      // Emit socket event for real-time update
      emitItemsUpdate()

      toast.success('Item created successfully!')
      setName('')
      setDescription('')
      setImageUrl('')
      setPrice('')
      setPreview(false)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to create item')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">Add New Item</h1>
        <p className="text-muted-foreground">Create a new menu item for your store</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5" />
              Item Details
            </CardTitle>
            <CardDescription>Fill in the details for your new item</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="flex items-center gap-2">
                  <Tag className="h-4 w-4" />
                  Item Name
                </Label>
                <Input
                  id="name"
                  placeholder="e.g., Margherita Pizza"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description" className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Description
                </Label>
                <Textarea
                  id="description"
                  placeholder="Describe your item..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="imageUrl" className="flex items-center gap-2">
                  <ImageIcon className="h-4 w-4" />
                  Image URL
                </Label>
                <Input
                  id="imageUrl"
                  type="url"
                  placeholder="https://example.com/image.jpg"
                  value={imageUrl}
                  onChange={(e) => {
                    setImageUrl(e.target.value)
                    setPreview(true)
                  }}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="price" className="flex items-center gap-2">
                  <IndianRupeeIcon className="h-4 w-4" />
                  Price
                </Label>
                <Input
                  id="price"
                  type="number"
                  min="0.01"
                  step="0.01"
                  placeholder="9.99"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  required
                />
              </div>

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader size="sm" className="mr-2" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Item
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Preview</CardTitle>
            <CardDescription>See how your item will look</CardDescription>
          </CardHeader>
          <CardContent>
            {preview && imageUrl ? (
              <div className="space-y-4">
                <div className="aspect-video relative rounded-lg overflow-hidden bg-muted">
                  <img
                    src={imageUrl}
                    alt={name || 'Item preview'}
                    className="object-cover w-full h-full"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'https://placehold.co/400x300?text=Invalid+Image'
                    }}
                  />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-foreground">
                    {name || 'Item Name'}
                  </h3>
                  <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                    {description || 'Item description will appear here...'}
                  </p>
                  <p className="text-xl font-bold text-primary mt-2">
                    ${parseFloat(price || '0').toFixed(2)}
                  </p>
                </div>
              </div>
            ) : (
              <div className="aspect-video flex items-center justify-center rounded-lg bg-muted/50 border-2 border-dashed border-border">
                <div className="text-center text-muted-foreground">
                  <ImageIcon className="h-12 w-12 mx-auto mb-2" />
                  <p>Add an image URL to see preview</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
