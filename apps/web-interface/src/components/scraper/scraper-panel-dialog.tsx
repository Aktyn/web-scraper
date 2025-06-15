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
import { Edit, FileDown, FoldHorizontal, UnfoldHorizontal } from "lucide-react"
import { Tooltip, TooltipContent, TooltipTrigger } from "../shadcn/tooltip"
import { cn } from "@/lib/utils"
import { useCachedState } from "@/hooks/useCachedState"
import { ScraperFormDialog } from "./scraper-form-dialog"
import { usePost } from "@/hooks/api/usePost"

type ScraperPanelDialogProps = {
  scraper: ScraperType
} & ComponentProps<typeof Dialog>

export function ScraperPanelDialog({
  scraper: scraperSource,
  ...dialogProps
}: ScraperPanelDialogProps) {
  const { postItem: exportScraper, isPosting: exportingScraper } = usePost(
    "/scrapers/:id/export",
    { successMessage: "Scraper exported successfully" },
  )

  const [scraper, setScraper] = useState<ScraperType>(scraperSource)
  const [stretched, setStretched] = useCachedState(
    "scraper-panel-dialog-stretched",
    false,
    localStorage,
  )

  const [editDialogOpen, setEditDialogOpen] = useState(false)

  useEffect(() => {
    setScraper(scraperSource)
  }, [scraperSource])

  return (
    <>
      <Dialog {...dialogProps}>
        <DialogContent
          aria-describedby={undefined}
          className={cn(
            "overflow-hidden grid grid-rows-[auto_1fr] p-0 sm:max-w-3xl",
            stretched && "w-full sm:max-w-[calc(100%-2rem)]",
          )}
        >
          <DialogHeader className="p-6 pb-0">
            <DialogTitle className="flex items-center justify-end gap-2">
              <span className="whitespace-normal mr-auto">{scraper.name}</span>
              <Button
                variant="outline"
                onClick={() => exportScraper(null, { id: scraper.id })}
                disabled={exportingScraper}
                tabIndex={-1}
              >
                <FileDown />
                Export Scraper
              </Button>
              <Button
                variant="outline"
                onClick={() => setEditDialogOpen(true)}
                tabIndex={-1}
              >
                <Edit />
                Edit Scraper
              </Button>
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
            <ScraperPanel scraper={scraper} />
          </ScrollArea>
        </DialogContent>
      </Dialog>
      <ScraperFormDialog
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        onSuccess={setScraper}
        editScraper={scraper}
      />
    </>
  )
}
