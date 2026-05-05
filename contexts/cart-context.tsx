'use client'

import { createContext, useContext, useCallback, ReactNode, useEffect, useState } from 'react'

interface CartItem {
  itemId: string
  name: string
  price: number
  quantity: number
  imageUrl: string
}

interface CartContextType {
  items: CartItem[]
  addItem: (item: Omit<CartItem, 'quantity'>) => void
  removeItem: (itemId: string) => void
  updateQuantity: (itemId: string, quantity: number) => void
  clearCart: () => void
  total: number
  itemCount: number
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])
  const [isLoaded, setIsLoaded] = useState(false)

  // Load cart from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem('cart')
    if (savedCart) {
      try {
        setItems(JSON.parse(savedCart))
      } catch {
        setItems([])
      }
    }
    setIsLoaded(true)
  }, [])

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem('cart', JSON.stringify(items))
    }
  }, [items, isLoaded])

  const addItem = useCallback((item: Omit<CartItem, 'quantity'>) => {
    setItems(prev => {
      const existing = prev.find(i => i.itemId === item.itemId)
      if (existing) {
        return prev.map(i =>
          i.itemId === item.itemId
            ? { ...i, quantity: i.quantity + 1 }
            : i
        )
      }
      return [...prev, { ...item, quantity: 1 }]
    })
  }, [])

  const removeItem = useCallback((itemId: string) => {
    setItems(prev => prev.filter(i => i.itemId !== itemId))
  }, [])

  const updateQuantity = useCallback((itemId: string, quantity: number) => {
    if (quantity < 1) {
      setItems(prev => prev.filter(i => i.itemId !== itemId))
      return
    }
    setItems(prev =>
      prev.map(i =>
        i.itemId === itemId ? { ...i, quantity } : i
      )
    )
  }, [])

  const clearCart = useCallback(() => {
    setItems([])
  }, [])

  const total = items.reduce((sum, item) => sum + (item.price * item.quantity), 0)
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0)

  return (
    <CartContext.Provider value={{
      items,
      addItem,
      removeItem,
      updateQuantity,
      clearCart,
      total,
      itemCount
    }}>
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider')
  }
  return context
}
