import hljs from "highlight.js/lib/core"
import type { PropsWithChildren } from "react"
import { useEffect, useRef } from "react"

import json from "highlight.js/lib/languages/json"
import { ScrollArea } from "../ui/scroll-area"
import { cn } from "@/lib/utils"
hljs.registerLanguage("json", json)

type CodeProps = PropsWithChildren<{
  className?: string
}>

//TODO: utilize or remove this component

export function Code({ children, className }: CodeProps) {
  const ref = useRef<HTMLPreElement>(null)

  useEffect(() => {
    if (ref.current) {
      hljs.highlightElement(ref.current)
    }
  }, [])

  return (
    <ScrollArea className={cn("overflow-hidden max-h-screen", className)}>
      <pre ref={ref} className="bg-transparent!">
        <code>{children}</code>
      </pre>
    </ScrollArea>
  )
}
