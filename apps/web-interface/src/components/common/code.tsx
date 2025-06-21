import { cn } from "@/lib/utils"
import hljs from "highlight.js/lib/core"
import json from "highlight.js/lib/languages/json"
import sql from "highlight.js/lib/languages/sql"
import javascript from "highlight.js/lib/languages/javascript"

hljs.registerLanguage("json", json)
hljs.registerLanguage("sql", sql)
hljs.registerLanguage("javascript", javascript)

type CodeProps = {
  children: string
  className?: string
}

export function Code({ children, className }: CodeProps) {
  return (
    <pre className={cn("bg-transparent!", className)}>
      <code
        dangerouslySetInnerHTML={{ __html: hljs.highlightAuto(children).value }}
      />
    </pre>
  )
}
