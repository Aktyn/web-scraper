import { Separator } from "@/components/shadcn/separator"
import { cn } from "@/lib/utils"
import { Ampersands } from "lucide-react"

type SelectorsSeparatorProps = {
  vertical?: boolean
}

export function SelectorsSeparator({ vertical }: SelectorsSeparatorProps) {
  return (
    <div
      className={cn(
        "grid gap-2 items-center justify-center",
        vertical
          ? "grid-rows-[1fr_auto_1fr] *:mx-auto"
          : "grid-cols-[1fr_auto_1fr]",
      )}
    >
      <Separator orientation={vertical ? "vertical" : "horizontal"} />
      <Ampersands className="size-5 text-muted-foreground" />
      <Separator orientation={vertical ? "vertical" : "horizontal"} />
    </div>
  )
}
