import { useEffect, useRef, useState } from "react"

export function useSizer() {
  const elementRef = useRef<HTMLDivElement>(null)

  const [width, setWidth] = useState(0)
  const [height, setHeight] = useState(0)

  useEffect(() => {
    if (!elementRef.current) {
      return
    }

    const observer = new ResizeObserver((entries) => {
      const entry = entries.at(0)
      if (entry) {
        setWidth(entry.contentRect.width)
        setHeight(entry.contentRect.height)
      }
    })
    observer.observe(elementRef.current)

    return () => {
      observer.disconnect()
    }
  }, [])

  return { ref: elementRef, width, height }
}
