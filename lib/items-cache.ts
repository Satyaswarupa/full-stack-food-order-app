import type { KeyedMutator } from 'swr'

interface ItemRecord {
  _id: string
  isEnabled: boolean
  [key: string]: unknown
}

export function patchItemInCache<T extends { items?: ItemRecord[] }>(
  mutate: KeyedMutator<T>,
  itemId: string,
  patch: Partial<ItemRecord>
) {
  return mutate(
    (current) => {
      if (!current?.items) return current
      return {
        ...current,
        items: current.items.map((i) =>
          i._id === itemId ? { ...i, ...patch } : i
        ),
      } as T
    },
    { revalidate: true }
  )
}
