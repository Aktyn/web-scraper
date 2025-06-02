import { type Dispatch, type SetStateAction, useEffect, useState } from "react"

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const localStore = new Map<string, any>()

export function useCachedState<T>(
  name: string | null,
  defaultValue: T,
  store: Storage | typeof localStore = localStore,
): [T, Dispatch<SetStateAction<T>>] {
  const [value, setValue] = useState<T>(
    name && has(store, name)
      ? (get(store, name) ?? defaultValue)
      : defaultValue,
  )
  useEffect(() => {
    if (name) {
      set(store, name, value)
    }
  }, [name, store, value])

  return [value, setValue]
}

function has(store: Storage | typeof localStore, name: string): boolean {
  return store instanceof Storage
    ? store.getItem(name) !== null
    : store.has(name)
}

function set(store: Storage | typeof localStore, name: string, value: unknown) {
  if (store instanceof Storage) {
    store.setItem(name, JSON.stringify(value))
  } else {
    store.set(name, JSON.stringify(value))
  }
}

function get<T>(store: Storage | typeof localStore, name: string): T | null {
  try {
    return JSON.parse(
      store instanceof Storage ? store.getItem(name) : store.get(name),
    )
  } catch {
    return null
  }
}
