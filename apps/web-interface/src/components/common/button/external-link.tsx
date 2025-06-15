import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/shadcn/tooltip"
import { cn } from "@/lib/utils"
import { ExternalLinkIcon } from "lucide-react"

type ExternalLinkProps = {
  url: string
  className?: string
}

export function ExternalLink({ url, className }: ExternalLinkProps) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className={cn(
            "transition-colors hover:text-primary truncate",
            className,
          )}
        >
          {url}
        </a>
      </TooltipTrigger>
      <TooltipContent>
        <span className="leading-none">Click to open URL in new tab&ensp;</span>
        <ExternalLinkIcon className="size-3.5 inline" />
      </TooltipContent>
    </Tooltip>
  )
}
