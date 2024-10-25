import { forwardRef, useEffect, useRef, useState, type HTMLAttributes, type ReactNode } from 'react'

type MeasurerProps = {
  children: (width: number, height: number) => ReactNode
} & Omit<HTMLAttributes<HTMLDivElement>, 'children' | 'ref'>

export const Measurer = forwardRef<HTMLDivElement, MeasurerProps>(
  ({ children, ...divProps }, forwardedRef) => {
    const internalRef = useRef<HTMLDivElement>(null)

    const ref = forwardedRef ?? internalRef

    const [width, setWidth] = useState(0)
    const [height, setHeight] = useState(0)

    useEffect(() => {
      if (typeof ref === 'function' || !ref.current) {
        return
      }
      const element = ref.current

      const updateDimensions = () => {
        setWidth(element.offsetWidth)
        setHeight(element.offsetHeight)
      }

      updateDimensions()

      const resizeObserver = new ResizeObserver(updateDimensions)
      resizeObserver.observe(element)

      return () => resizeObserver.disconnect()
    }, [ref])

    return (
      <div ref={ref} {...divProps}>
        {children(width, height)}
      </div>
    )
  },
)

Measurer.displayName = 'Measurer'
