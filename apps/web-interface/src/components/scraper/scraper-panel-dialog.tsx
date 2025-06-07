import type { ScraperType } from "@web-scraper/common"
import { useEffect, useState, type ComponentProps } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../shadcn/dialog"
import { ScraperPanel } from "./scraper-panel"
import { ScrollArea } from "../shadcn/scroll-area"
import { Button } from "../shadcn/button"
import { FoldHorizontal, UnfoldHorizontal } from "lucide-react"
import { Tooltip, TooltipContent, TooltipTrigger } from "../shadcn/tooltip"
import { cn } from "@/lib/utils"
import { useCachedState } from "@/hooks/useCachedState"

type ScraperPanelDialogProps = {
  scraper: ScraperType
} & ComponentProps<typeof Dialog>

export function ScraperPanelDialog({
  scraper: scraperSource,
  ...dialogProps
}: ScraperPanelDialogProps) {
  const [scraper, setScraper] = useState<ScraperType>(scraperSource)
  const [stretched, setStretched] = useCachedState(
    "scraper-panel-dialog-stretched",
    false,
    localStorage,
  )

  useEffect(() => {
    setScraper(scraperSource)
  }, [scraperSource])

  return (
    <Dialog {...dialogProps}>
      <DialogContent
        aria-describedby={undefined}
        className={cn(
          "overflow-hidden grid grid-rows-[auto_1fr] p-0 sm:max-w-3xl",
          stretched && "w-full sm:max-w-[calc(100%-2rem)]",
        )}
      >
        <DialogHeader className="p-6 pb-0">
          <DialogTitle className="flex items-center justify-between gap-2">
            <span>{scraper.name}</span>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  tabIndex={-1}
                  onClick={(event) => {
                    event.stopPropagation()
                    setStretched((prev) => !prev)
                  }}
                >
                  {stretched ? <FoldHorizontal /> : <UnfoldHorizontal />}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                {stretched ? "Fit width" : "Stretch"}
              </TooltipContent>
            </Tooltip>
          </DialogTitle>
          {scraper.description && (
            <DialogDescription>{scraper.description}</DialogDescription>
          )}
        </DialogHeader>
        <ScrollArea className="max-h-full overflow-hidden *:data-[radix-scroll-area-viewport]:px-6">
          <ScraperPanel scraper={scraper} onEditSuccess={setScraper} />
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}
