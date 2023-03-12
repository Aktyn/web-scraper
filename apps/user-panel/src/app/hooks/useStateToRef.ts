import { useEffect, useRef } from 'react'

export function useStateToRef<Type>(state: Type) {
  const ref = useRef(state)
  useEffect(() => {
    ref.current = state
  }, [state])
  return ref
}
