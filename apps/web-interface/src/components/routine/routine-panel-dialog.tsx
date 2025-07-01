import type { Routine } from "@web-scraper/common"
import { type ComponentProps } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../shadcn/dialog.js"
import { ScrollArea } from "../shadcn/scroll-area.js"

type ScraperPanelDialogProps = {
  routine: Routine
} & ComponentProps<typeof Dialog>

export function RoutinePanelDialog({
  routine,
  ...dialogProps
}: ScraperPanelDialogProps) {
  return (
    <Dialog {...dialogProps}>
      <DialogContent
        aria-describedby={undefined}
        className="overflow-hidden grid grid-rows-[auto_1fr] p-0 sm:max-w-3xl"
      >
        <DialogHeader className="p-6 pb-0">
          <DialogTitle>
            Routine for scraper: <b>{routine.scraperName}</b>
          </DialogTitle>
          {routine.description && (
            <DialogDescription>{routine.description}</DialogDescription>
          )}
        </DialogHeader>
        <ScrollArea className="max-h-full overflow-hidden *:data-[radix-scroll-area-viewport]:px-6">
          <div>TODO</div>
          {/* <RoutinePanel routine={routine} /> */}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}
