import { useCallback, useEffect, useRef } from 'react'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function useDebounce<T extends (...args: any[]) => never>(
  func: T,
  delay = 0,
  deps?: unknown[],
) {
  const isLoaded = useRef(true)
  const timeout = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    return () => {
      isLoaded.current = false
    }
  }, [])

  return useCallback(
    (...args: Parameters<typeof func>) => {
      if (timeout.current) {
        window.clearTimeout(timeout.current)
      }
      timeout.current = setTimeout(() => {
        if (isLoaded.current) {
          func(...args)
        }
      }, delay)
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [delay, ...(deps ?? [func])],
  )
}
