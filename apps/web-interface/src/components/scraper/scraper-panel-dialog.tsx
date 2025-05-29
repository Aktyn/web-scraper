import type { ScraperType } from "@web-scraper/common"
import { type ComponentProps } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../shadcn/dialog"
import { ScraperPanel } from "./scraper-panel"
import { ScrollArea } from "../shadcn/scroll-area"

type ScraperPanelDialogProps = {
  scraper: ScraperType
} & ComponentProps<typeof Dialog>

export function ScraperPanelDialog({ scraper, ...dialogProps }: ScraperPanelDialogProps) {
  return (
    <Dialog {...dialogProps}>
      <DialogContent
        aria-describedby={undefined}
        className="max-h-full overflow-hidden grid grid-rows-[auto_1fr] p-0"
      >
        <DialogHeader className="p-6 pb-0">
          <DialogTitle>{scraper.name}</DialogTitle>
          {scraper.description && <DialogDescription>{scraper.description}</DialogDescription>}
        </DialogHeader>
        <ScrollArea className="max-h-full overflow-hidden **:data-[radix-scroll-area-viewport]:px-6">
          <ScraperPanel scraper={scraper} />
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}
