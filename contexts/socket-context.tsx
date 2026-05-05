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
    // Listen for custom events to trigger updates
    const handleOrderUpdate = (e: CustomEvent) => setLastOrderUpdate(e.detail)
    const handleNewOrder = (e: CustomEvent) => setLastNewOrder(e.detail)
    const handleItemsUpdate = () => setLastItemsUpdate(Date.now())
    const handleUsersUpdate = () => setLastUsersUpdate(Date.now())

    window.addEventListener('order-update', handleOrderUpdate as EventListener)
    window.addEventListener('new-order', handleNewOrder as EventListener)
    window.addEventListener('items-update', handleItemsUpdate)
    window.addEventListener('users-update', handleUsersUpdate)

    return () => {
      window.removeEventListener('order-update', handleOrderUpdate as EventListener)
      window.removeEventListener('new-order', handleNewOrder as EventListener)
      window.removeEventListener('items-update', handleItemsUpdate)
      window.removeEventListener('users-update', handleUsersUpdate)
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

// Helper functions to emit events
export function emitOrderUpdate(order: unknown) {
  window.dispatchEvent(new CustomEvent('order-update', { detail: order }))
}

export function emitNewOrder(order: unknown) {
  window.dispatchEvent(new CustomEvent('new-order', { detail: order }))
}

export function emitItemsUpdate() {
  window.dispatchEvent(new CustomEvent('items-update'))
}

export function emitUsersUpdate() {
  window.dispatchEvent(new CustomEvent('users-update'))
}
