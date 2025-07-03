import { formatDuration } from "@/lib/utils"
import { useEffect, useState } from "react"

export function Countdown({ timestamp }: { timestamp: number }) {
  const [now, setNow] = useState(Date.now())

  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(interval)
  }, [])

  return <span>{formatDuration(timestamp - now)}</span>
}
