import type { KeyedMutator } from 'swr'
import { normalizeItemId, syncItemEnabled } from '@/lib/items-sync'

interface ItemRecord {
  _id: unknown
  isEnabled: boolean
  [key: string]: unknown
}

export function patchItemInCache<T extends { items?: ItemRecord[] }>(
  mutate: KeyedMutator<T>,
  itemId: string,
  patch: Partial<ItemRecord>
) {
  const id = normalizeItemId(itemId)
  const isEnabled =
    typeof patch.isEnabled === 'boolean' ? patch.isEnabled : undefined

  if (isEnabled !== undefined) {
    return syncItemEnabled(id, isEnabled)
  }

  return mutate(
    (current) => {
      if (!current?.items) return current
      return {
        ...current,
        items: current.items.map((item) =>
          normalizeItemId(item._id) === id ? { ...item, ...patch } : item
        ),
      } as T
    },
    { revalidate: true }
  )
}
