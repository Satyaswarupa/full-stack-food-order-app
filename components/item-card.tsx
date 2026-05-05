'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { useCart } from '@/contexts/cart-context'
import { useAuth } from '@/contexts/auth-context'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Plus, Minus, ShoppingCart, Check } from 'lucide-react'

interface ItemCardProps {
  item: {
    _id: string
    name: string
    description: string
    imageUrl: string
    price: number
  }
}

export function ItemCard({ item }: ItemCardProps) {
  const { user } = useAuth()
  const { items, addItem, updateQuantity, removeItem } = useCart()
  const [imageLoaded, setImageLoaded] = useState(false)
  const [justAdded, setJustAdded] = useState(false)

  const cartItem = items.find(i => i.itemId === item._id)
  const quantity = cartItem?.quantity || 0

  const handleAddToCart = () => {
    if (!user) {
      toast.error('Please login to add items to cart')
      return
    }

    addItem({
      itemId: item._id,
      name: item.name,
      price: item.price,
      imageUrl: item.imageUrl
    })
    
    setJustAdded(true)
    setTimeout(() => setJustAdded(false), 1000)
    toast.success(`${item.name} added to cart`)
  }

  const handleIncrement = () => {
    updateQuantity(item._id, quantity + 1)
  }

  const handleDecrement = () => {
    if (quantity === 1) {
      removeItem(item._id)
      toast.info(`${item.name} removed from cart`)
    } else {
      updateQuantity(item._id, quantity - 1)
    }
  }

  return (
    <Card className="overflow-hidden group hover:shadow-lg transition-all duration-300">
      <div className="aspect-[4/3] relative overflow-hidden bg-muted">
        {!imageLoaded && (
          <div className="absolute inset-0 animate-pulse bg-muted" />
        )}
        <img
          src={item.imageUrl}
          alt={item.name}
          className={`object-cover w-full h-full transition-all duration-300 group-hover:scale-105 ${
            imageLoaded ? 'opacity-100' : 'opacity-0'
          }`}
          onLoad={() => setImageLoaded(true)}
          onError={(e) => {
            (e.target as HTMLImageElement).src = 'https://placehold.co/400x300?text=No+Image'
            setImageLoaded(true)
          }}
        />
        {quantity > 0 && (
          <div className="absolute top-2 right-2 flex h-6 w-6 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground shadow-sm">
            {quantity}
          </div>
        )}
      </div>
      <CardContent className="p-4">
        <div className="mb-3">
          <h3 className="font-semibold text-foreground text-lg line-clamp-1 group-hover:text-primary transition-colors">
            {item.name}
          </h3>
          <p className="text-sm text-muted-foreground line-clamp-2 mt-1 min-h-[2.5rem]">
            {item.description}
          </p>
        </div>
        <div className="flex items-center justify-between gap-2">
          <span className="text-xl font-bold text-primary">
            ₹{item.price.toFixed(2)}
          </span>
          {quantity === 0 ? (
            <Button
              onClick={handleAddToCart}
              size="sm"
              className="gap-2 transition-all"
              disabled={justAdded}
            >
              {justAdded ? (
                <>
                  <Check className="h-4 w-4" />
                  Added
                </>
              ) : (
                <>
                  <ShoppingCart className="h-4 w-4" />
                  Add to Cart
                </>
              )}
            </Button>
          ) : (
            <div className="flex items-center gap-1 bg-muted rounded-lg p-1">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 rounded-md"
                onClick={handleDecrement}
              >
                <Minus className="h-4 w-4" />
              </Button>
              <span className="w-8 text-center font-semibold text-foreground">
                {quantity}
              </span>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 rounded-md"
                onClick={handleIncrement}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
