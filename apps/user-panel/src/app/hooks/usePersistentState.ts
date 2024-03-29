import { type Dispatch, type SetStateAction, useEffect, useState } from 'react'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const localStore = new Map<string, any>()

export function usePersistentState<T>(
  /** If name is null or any other falsy value this hook will behave as regular useState */
  name: string | null,
  initialValue: T,
  store: Storage | typeof localStore = localStore,
): [T, Dispatch<SetStateAction<T>>] {
  const [value, setValue] = useState<T>(name && has(store, name) ? get(store, name) : initialValue)
  useEffect(() => {
    if (name) {
      set(store, name, value)
    }
  }, [name, store, value])
  return [value, setValue]
}

function has(store: Storage | typeof localStore, name: string): boolean {
  return store instanceof Storage ? store.getItem(name) !== null : store.has(name)
}

function set(store: Storage | typeof localStore, name: string, value: unknown): void {
  if (store instanceof Storage) {
    store.setItem(name, value as string)
  } else {
    store.set(name, value)
  }
}

function get<T>(store: Storage | typeof localStore, name: string): T {
  return store instanceof Storage ? store.getItem(name) : store.get(name)
}
