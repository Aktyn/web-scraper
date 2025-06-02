import type { ScraperType } from "@web-scraper/common"
import { CopyButton } from "../common/button/copy-button"
import { LabeledValue } from "../common/labeled-value"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "../shadcn/accordion"
import { Separator } from "../shadcn/separator"
import { ScraperDataSource } from "./scraper-data-source"
import { ScraperInstructionsTree } from "./scraper-instructions-tree"
import { Button } from "../shadcn/button"
import { Edit, Play } from "lucide-react"
import { usePost } from "@/hooks/api/usePost"
import { useState } from "react"
import { ScraperFormDialog } from "./scraper-form-dialog"

type ScraperPanelProps = {
  scraper: ScraperType
  onEditSuccess?: (scraper: ScraperType) => void
}

export function ScraperPanel({ scraper, onEditSuccess }: ScraperPanelProps) {
  const { postItem, isPosting } = usePost("/scrapers/:id/execute")

  const [editDialogOpen, setEditDialogOpen] = useState(false)

  const handleExecute = async () => {
    await postItem(undefined, { id: scraper.id })
  }

  //TODO: manage running state scraper instances on the server
  // Scraper are stored in the database. It can be run by api endpoint, also paused etc. Use SSE to get realtime scraper state.

  return (
    <>
      <div className="flex flex-col gap-4">
        <div className="flex flex-row items-center gap-2">
          {/* TODO: run and watch for scraper updates in real time with SSE */}
          {/* TODO: consider adding small form to configure number of scraper iterations and sequence of row indices to iterate over */}
          <Button
            variant="default"
            onClick={handleExecute}
            disabled={isPosting}
          >
            <Play />
            {isPosting ? "Executing..." : "Execute"}
          </Button>
          <Button
            variant="outline"
            className="ml-auto"
            onClick={() => setEditDialogOpen(true)}
          >
            <Edit />
            Edit
          </Button>
        </div>

        {/* TODO: load and show this scraper's execution history */}

        <Separator />

        {scraper.userDataDirectory && (
          <>
            <LabeledValue
              label={
                <>
                  Custom <b>userData</b> directory
                </>
              }
            >
              <div className="flex flex-row items-center gap-2 overflow-hidden contain-inline-size">
                <pre dir="rtl" className="truncate">
                  {scraper.userDataDirectory}
                </pre>
                <CopyButton value={scraper.userDataDirectory} />
              </div>
            </LabeledValue>
            <Separator />
          </>
        )}

        {scraper.dataSources.length > 0 && (
          <>
            <Accordion
              type="single"
              collapsible
              defaultValue="sources"
              className="w-full"
            >
              <AccordionItem value="sources">
                <AccordionTrigger tabIndex={-1}>Data Sources</AccordionTrigger>
                <AccordionContent className="pb-0 flex flex-col items-stretch gap-2">
                  {scraper.dataSources.map((dataSource) => (
                    <ScraperDataSource
                      key={dataSource.dataStoreTableName}
                      dataSource={dataSource}
                    />
                  ))}
                </AccordionContent>
              </AccordionItem>
            </Accordion>
            <Separator />
          </>
        )}

        <Accordion
          type="single"
          collapsible
          defaultValue="instructions"
          className="w-full"
        >
          <AccordionItem value="instructions">
            <AccordionTrigger tabIndex={-1}>
              <div className="flex flex-row items-baseline gap-2">
                <span>Instructions</span>
                <span className="text-xs text-muted-foreground mr-auto">
                  ({scraper.instructions.length})
                </span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="flex flex-col items-stretch gap-2">
              <ScraperInstructionsTree instructions={scraper.instructions} />
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
      <ScraperFormDialog
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        onSuccess={onEditSuccess}
        editScraper={scraper}
      />
    </>
  )
}
