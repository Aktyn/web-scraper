import { cn } from "@/lib/utils"
import hljs from "highlight.js/lib/core"
import json from "highlight.js/lib/languages/json"
import sql from "highlight.js/lib/languages/sql"
import type { PropsWithChildren } from "react"
import { useEffect, useRef } from "react"

hljs.registerLanguage("json", json)
hljs.registerLanguage("sql", sql)

type CodeProps = PropsWithChildren<{
  className?: string
}>

export function Code({ children, className }: CodeProps) {
  const ref = useRef<HTMLPreElement>(null)
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    const element = ref.current
    if (!element) {
      return
    }

    timeoutRef.current = setTimeout(() => {
      hljs.highlightElement(element)
    }, 4)

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [])

  return (
    <pre ref={ref} className={cn("bg-transparent!", className)}>
      <code>{children}</code>
    </pre>
  )
}
