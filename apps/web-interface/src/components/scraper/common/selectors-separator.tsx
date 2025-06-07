import { Separator } from "@/components/shadcn/separator"
import { Ampersands } from "lucide-react"

export function SelectorsSeparator() {
  return (
    <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2">
      <Separator />
      <Ampersands className="size-4" />
      <Separator />
    </div>
  )
}
