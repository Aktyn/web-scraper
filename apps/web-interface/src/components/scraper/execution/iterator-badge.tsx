import { NullBadge } from "@/components/common/null-badge"
import { IteratorDescription } from "@/components/iterator/iterator-description"
import { Button } from "@/components/shadcn/button"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/shadcn/popover"
import type { ExecutionIterator } from "@web-scraper/common"
import { ExternalLink, SquareMousePointer } from "lucide-react"

type IteratorBadgeProps = {
  iterator: ExecutionIterator | null
  onApplyIterator?: (iterator: ExecutionIterator) => void
}

export function IteratorBadge({
  iterator,
  onApplyIterator,
}: IteratorBadgeProps) {
  return iterator ? (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="h-auto"
          onClick={(event) => event.stopPropagation()}
        >
          Iterator
          <ExternalLink />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-auto max-w-xl"
        onClick={(event) => event.stopPropagation()}
      >
        <IteratorDescription iterator={iterator} className="text-sm">
          {onApplyIterator && (
            <Button
              variant="secondary"
              size="sm"
              onClick={(event) => {
                event.stopPropagation()
                if (iterator) {
                  onApplyIterator(iterator)
                }
              }}
            >
              <SquareMousePointer />
              Apply to new execution
            </Button>
          )}
        </IteratorDescription>
      </PopoverContent>
    </Popover>
  ) : (
    <NullBadge>No iterator</NullBadge>
  )
}
