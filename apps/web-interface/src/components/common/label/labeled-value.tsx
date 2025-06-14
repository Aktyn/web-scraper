import { Label } from "@/components/shadcn/label"
import { cn } from "@/lib/utils"
import type { PropsWithChildren, ReactNode } from "react"

type LabeledValueProps = PropsWithChildren<{
  label: ReactNode
  className?: string
}>

export function LabeledValue({
  label,
  children,
  className,
}: LabeledValueProps) {
  return (
    <div className={cn("flex flex-col", className)}>
      <Label className="text-sm text-muted-foreground">{label}</Label>
      <div>{children}</div>
    </div>
  )
}
