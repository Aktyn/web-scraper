import { TERMS } from "@/lib/terms"
import { cn } from "@/lib/utils"
import type { LucideProps } from "lucide-react"
import { Info } from "lucide-react"
import { Tooltip, TooltipContent, TooltipTrigger } from "../shadcn/tooltip"

type TermInfoProps = {
  term: keyof typeof TERMS
} & LucideProps

export function TermInfo({ term, ...iconProps }: TermInfoProps) {
  const description = TERMS[term].description

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Info
          {...iconProps}
          className={cn("inline size-5 min-w-5", iconProps.className)}
        />
      </TooltipTrigger>
      <TooltipContent className="whitespace-pre-wrap max-w-128">
        {description}
      </TooltipContent>
    </Tooltip>
  )
}
