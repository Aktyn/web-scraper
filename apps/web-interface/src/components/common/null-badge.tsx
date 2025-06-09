import type { ReactNode } from "react"
import { Badge } from "../shadcn/badge"

export function NullBadge({ children = "Null" }: { children?: ReactNode }) {
  return (
    <Badge className="bg-background-lighter text-muted-foreground font-bold">
      {children}
    </Badge>
  )
}
