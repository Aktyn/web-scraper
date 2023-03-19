import { type DependencyList, useEffect, useRef } from 'react'

export function useInterval(
  func: (callIndex: number) => void,
  delayMs: number,
  deps: DependencyList = [],
): null {
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    let indexCounter = 0
    func(indexCounter++)
    if (delayMs <= 0) {
      return
    }
    intervalRef.current = setInterval(() => func(indexCounter++), delayMs)
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [delayMs, ...deps])

  return null
}
