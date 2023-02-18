import { type Dispatch, type SetStateAction, useEffect, useState } from 'react'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const store = new Map<string, any>()

export function usePersistentState<T>(
  /** If name is null or any other falsy value this hook will behave as regular useState */
  name: string | null,
  initialValue?: T,
): [T, Dispatch<SetStateAction<T>>] {
  const [value, setValue] = useState(name && store.has(name) ? store.get(name) : initialValue)
  useEffect(() => {
    if (name) {
      store.set(name, value)
    }
  }, [name, value])
  return [value, setValue]
}
