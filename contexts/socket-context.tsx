'use client'

import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react'

interface SocketContextType {
  isConnected: boolean
  lastOrderUpdate: unknown | null
  lastNewOrder: unknown | null
  lastItemsUpdate: number
  lastUsersUpdate: number
}

const SocketContext = createContext<SocketContextType | undefined>(undefined)

// Since Socket.IO doesn't work well with serverless, we'll use polling
export function SocketProvider({ children }: { children: ReactNode }) {
  const [isConnected, setIsConnected] = useState(false)
  const [lastOrderUpdate, setLastOrderUpdate] = useState<unknown | null>(null)
  const [lastNewOrder, setLastNewOrder] = useState<unknown | null>(null)
  const [lastItemsUpdate, setLastItemsUpdate] = useState(Date.now())
  const [lastUsersUpdate, setLastUsersUpdate] = useState(Date.now())
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  // Poll for updates
  const pollUpdates = useCallback(async () => {
    if (!isClient) return

    try {
      // This is a simple polling mechanism
      // In production, you might want to use Server-Sent Events or WebSockets
      setIsConnected(true)
    } catch {
      setIsConnected(false)
    }
  }, [isClient])

  useEffect(() => {
    if (!isClient) return
    pollUpdates()
    const interval = setInterval(pollUpdates, 5000)
    return () => clearInterval(interval)
  }, [pollUpdates, isClient])

  // Expose methods to trigger updates manually
  useEffect(() => {
    const handleOrderUpdate = (e: CustomEvent) => setLastOrderUpdate(e.detail)
    const handleNewOrder = (e: CustomEvent) => setLastNewOrder(e.detail)
    const handleItemsUpdate = () => {
      setLastItemsUpdate(Date.now())
      import('@/lib/items-sync').then(({ revalidateAllItemCaches }) =>
        revalidateAllItemCaches()
      )
    }
    const handleUsersUpdate = () => setLastUsersUpdate(Date.now())

    window.addEventListener('order-update', handleOrderUpdate as EventListener)
    window.addEventListener('new-order', handleNewOrder as EventListener)
    window.addEventListener('items-update', handleItemsUpdate)
    window.addEventListener('users-update', handleUsersUpdate)

    const unsubscribe = subscribeToBroadcast((type, detail) => {
      if (type === 'order-update') setLastOrderUpdate(detail)
      if (type === 'new-order') setLastNewOrder(detail)
      if (type === 'items-update') {
        setLastItemsUpdate(Date.now())
        import('@/lib/items-sync').then(({ revalidateAllItemCaches }) =>
          revalidateAllItemCaches()
        )
      }
      if (type === 'users-update') setLastUsersUpdate(Date.now())
    })

    return () => {
      window.removeEventListener('order-update', handleOrderUpdate as EventListener)
      window.removeEventListener('new-order', handleNewOrder as EventListener)
      window.removeEventListener('items-update', handleItemsUpdate)
      window.removeEventListener('users-update', handleUsersUpdate)
      unsubscribe()
    }
  }, [])

  return (
    <SocketContext.Provider value={{
      isConnected,
      lastOrderUpdate,
      lastNewOrder,
      lastItemsUpdate,
      lastUsersUpdate
    }}>
      {children}
    </SocketContext.Provider>
  )
}

export function useSocket() {
  const context = useContext(SocketContext)
  if (context === undefined) {
    throw new Error('useSocket must be used within a SocketProvider')
  }
  return context
}

const BROADCAST_CHANNEL = 'food-order-app'

function broadcast(type: string, detail?: unknown) {
  if (typeof window === 'undefined') return
  try {
    const channel = new BroadcastChannel(BROADCAST_CHANNEL)
    channel.postMessage({ type, detail })
    channel.close()
  } catch {
    // BroadcastChannel not supported
  }
}

// Helper functions to emit events (same tab + other tabs)
export function emitOrderUpdate(order: unknown) {
  window.dispatchEvent(new CustomEvent('order-update', { detail: order }))
  broadcast('order-update', order)
}

export function emitNewOrder(order: unknown) {
  window.dispatchEvent(new CustomEvent('new-order', { detail: order }))
  broadcast('new-order', order)
}

export function emitItemsUpdate() {
  import('@/lib/items-sync').then(({ notifyItemsUpdated }) => notifyItemsUpdated())
}

export function emitUsersUpdate() {
  window.dispatchEvent(new CustomEvent('users-update'))
  broadcast('users-update')
}

export function subscribeToBroadcast(
  handler: (type: string, detail?: unknown) => void
): () => void {
  if (typeof window === 'undefined') return () => {}

  try {
    const channel = new BroadcastChannel(BROADCAST_CHANNEL)
    const onMessage = (event: MessageEvent<{ type: string; detail?: unknown }>) => {
      handler(event.data.type, event.data.detail)
    }
    channel.addEventListener('message', onMessage)
    return () => {
      channel.removeEventListener('message', onMessage)
      channel.close()
    }
  } catch {
    return () => {}
  }
}
