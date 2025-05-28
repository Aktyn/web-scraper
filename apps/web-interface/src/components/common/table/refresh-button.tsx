import { Button } from "@/components/shadcn/button"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/shadcn/tooltip"
import { cn } from "@/lib/utils"
import { RefreshCcw } from "lucide-react"
import { type ComponentProps } from "react"

type RefreshButtonProps = ComponentProps<typeof Button> & { refreshing?: boolean }

export function RefreshButton({ refreshing, ...buttonProps }: RefreshButtonProps) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          size="icon"
          variant="ghost"
          tabIndex={-1}
          {...buttonProps}
          className={cn("ml-auto", buttonProps.className)}
        >
          <RefreshCcw className={cn(refreshing && "animate-spin-ccw")} />
        </Button>
      </TooltipTrigger>
      <TooltipContent>Refresh table</TooltipContent>
    </Tooltip>
  )
}
