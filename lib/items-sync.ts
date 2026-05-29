import { mutate as globalMutate } from 'swr'

export function normalizeItemId(id: unknown): string {
  if (id == null) return ''
  if (typeof id === 'string') return id
  if (typeof id === 'object' && id !== null && '_id' in id) {
    return normalizeItemId((id as { _id: unknown })._id)
  }
  return String(id)
}

const isItemsKey = (key: unknown): key is string =>
  typeof key === 'string' && key.startsWith('/api/items')

type ItemsCache = { items?: Array<{ _id: unknown; isEnabled?: boolean; [key: string]: unknown }> }

/** Refetch every SWR cache that loads menu items (store + admin list). */
export async function revalidateAllItemCaches() {
  await globalMutate(isItemsKey, undefined, { revalidate: true })
}

/** Update all item caches immediately, then revalidate from server. */
export async function syncItemEnabled(itemId: string, isEnabled: boolean) {
  const id = normalizeItemId(itemId)

  await globalMutate<ItemsCache>(
    isItemsKey,
    (current, key) => {
      if (!current?.items || !isItemsKey(key)) return current

      if (key.includes('all=true')) {
        return {
          items: current.items.map((item) =>
            normalizeItemId(item._id) === id ? { ...item, isEnabled } : item
          ),
        }
      }

      if (!isEnabled) {
        return {
          items: current.items.filter((item) => normalizeItemId(item._id) !== id),
        }
      }

      return current
    },
    { revalidate: true }
  )
}

const BROADCAST_CHANNEL = 'food-order-app'
let itemsBroadcast: BroadcastChannel | null = null
const itemsListeners = new Set<() => void>()

function initItemsBroadcast() {
  if (typeof window === 'undefined' || itemsBroadcast) return
  try {
    itemsBroadcast = new BroadcastChannel(BROADCAST_CHANNEL)
    itemsBroadcast.onmessage = (event: MessageEvent<{ type?: string }>) => {
      if (event.data?.type === 'items-update') {
        itemsListeners.forEach((fn) => fn())
        void revalidateAllItemCaches()
      }
    }
  } catch {
    // BroadcastChannel unsupported
  }
}

export function subscribeItemsUpdates(listener: () => void): () => void {
  initItemsBroadcast()
  itemsListeners.add(listener)
  return () => itemsListeners.delete(listener)
}

export function notifyItemsUpdated() {
  if (typeof window === 'undefined') return

  window.dispatchEvent(new CustomEvent('items-update'))

  try {
    const channel = new BroadcastChannel(BROADCAST_CHANNEL)
    channel.postMessage({ type: 'items-update' })
    channel.close()
  } catch {
    // ignore
  }

  void revalidateAllItemCaches()
}
