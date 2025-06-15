import { cn, formatDateTime } from "@/lib/utils"
import type { ComponentProps } from "react"
import { useEffect, useState } from "react"

type TimestampValueProps = {
  value: number
} & ComponentProps<"span">

export function TimestampValue({ value, ...props }: TimestampValueProps) {
  const [isNew, setIsNew] = useState(isTimestampNew(value))

  useEffect(() => {
    if (!isNew) {
      return
    }

    const timeout = setTimeout(
      () => {
        setIsNew(false)
      },
      NEW_TIMESTAMP_THRESHOLD - (Date.now() - value),
    )

    return () => clearTimeout(timeout)
  }, [value, isNew])

  return (
    <span
      {...props}
      className={cn(isNew && "text-success-foreground-light", props.className)}
    >
      {formatDateTime(value)}
    </span>
  )
}

const NEW_TIMESTAMP_THRESHOLD = 1000 * 60 * 15 // 15 minutes
function isTimestampNew(value: number) {
  return Date.now() - value < NEW_TIMESTAMP_THRESHOLD
}
