import { cn, formatDateTime } from "@/lib/utils"
import { useEffect, useState } from "react"

export function TimestampValue({ value }: { value: number }) {
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
    <span className={cn(isNew && "text-success-foreground-light")}>
      {formatDateTime(value)}
    </span>
  )
}

const NEW_TIMESTAMP_THRESHOLD = 1000 * 60 * 15 // 15 minutes
function isTimestampNew(value: number) {
  return Date.now() - value < NEW_TIMESTAMP_THRESHOLD
}
