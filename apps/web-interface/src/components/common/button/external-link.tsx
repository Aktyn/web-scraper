import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/shadcn/tooltip"
import { ExternalLinkIcon } from "lucide-react"

export function ExternalLink({ url }: { url: string }) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="transition-colors hover:text-primary truncate"
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
