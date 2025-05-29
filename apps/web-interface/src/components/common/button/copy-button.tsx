import { Button } from "@/components/shadcn/button"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/shadcn/tooltip"
import { cn } from "@/lib/utils"
import { Check, Copy } from "lucide-react"
import { type ComponentProps, useRef, useState } from "react"
import { toast } from "sonner"

type CopyButtonProps = {
  value: string
} & ComponentProps<typeof Button>

export function CopyButton({ value, ...buttonProps }: CopyButtonProps) {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)

  const [copied, setCopied] = useState(false)

  const handleSuccess = () => {
    setCopied(true)
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }
    timeoutRef.current = setTimeout(() => {
      setCopied(false)
      timeoutRef.current = null
    }, 1000)
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          tabIndex={-1}
          onClick={() => {
            navigator.clipboard
              .writeText(value)
              .then(handleSuccess)
              .catch((error) => {
                toast.error("Failed to copy to clipboard", {
                  description: error.message,
                })
              })
          }}
          {...buttonProps}
          className={cn("relative", buttonProps.className)}
        >
          <Copy
            className={cn(
              "transition-[opacity,rotate]",
              copied ? "opacity-0 -rotate-180" : "opacity-100 rotate-0",
            )}
          />
          <Check
            className={cn(
              "absolute inset-0 m-auto size-5",
              "transition-[opacity,rotate] text-success",
              copied ? "opacity-100 rotate-0" : "opacity-0 rotate-180",
            )}
          />
        </Button>
      </TooltipTrigger>
      <TooltipContent>Copy to clipboard</TooltipContent>
    </Tooltip>
  )
}
