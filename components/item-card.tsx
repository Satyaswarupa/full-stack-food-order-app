'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { useCart } from '@/contexts/cart-context'
import { useAuth } from '@/contexts/auth-context'
import { Button } from '@/components/ui/button'
import { Plus, Minus, ShoppingCart, Check } from 'lucide-react'
import { cn } from '@/lib/utils'

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

  const cartItem = items.find((i) => i.itemId === item._id)
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
      imageUrl: item.imageUrl,
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
    <div
      className={cn(
        'flex items-center gap-3 sm:gap-4 p-3 sm:p-4 glass-panel rounded-xl',
        'active:scale-[0.99] transition-transform'
      )}
    >
      <div className="relative h-16 w-16 sm:h-20 sm:w-20 shrink-0 rounded-xl overflow-hidden bg-muted ring-1 ring-border/50">
        {!imageLoaded && <div className="absolute inset-0 animate-pulse bg-muted" />}
        <img
          src={item.imageUrl}
          alt={item.name}
          className={cn(
            'h-full w-full object-cover transition-opacity',
            imageLoaded ? 'opacity-100' : 'opacity-0'
          )}
          onLoad={() => setImageLoaded(true)}
          onError={(e) => {
            ;(e.target as HTMLImageElement).src =
              'https://placehold.co/80x80?text=No+Image'
            setImageLoaded(true)
          }}
        />
        {quantity > 0 && (
          <div className="absolute top-1 right-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
            {quantity}
          </div>
        )}
      </div>

      <div className="flex-1 min-w-0">
        <h3 className="font-semibold text-foreground truncate">{item.name}</h3>
        <p className="text-sm text-muted-foreground line-clamp-2 mt-0.5">{item.description}</p>
      </div>

      <div className="flex items-center gap-3 sm:gap-4 shrink-0">
        <span className="text-lg font-bold text-primary whitespace-nowrap">
          ₹{item.price.toFixed(2)}
        </span>

        {quantity === 0 ? (
          <Button
            onClick={handleAddToCart}
            size="sm"
            className="gap-2 shrink-0"
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
                <span className="hidden sm:inline">Add</span>
              </>
            )}
          </Button>
        ) : (
          <div className="flex items-center gap-1 bg-muted rounded-lg p-1 shrink-0">
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleDecrement}>
              <Minus className="h-4 w-4" />
            </Button>
            <span className="w-7 text-center font-semibold text-foreground text-sm">
              {quantity}
            </span>
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleIncrement}>
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
