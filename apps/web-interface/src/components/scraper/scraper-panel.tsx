import { ScraperProvider } from "@/providers/scraper.provider"
import type { ExecutionIterator } from "@web-scraper/common"
import { type ScraperType } from "@web-scraper/common"
import { CopyButton } from "../common/button/copy-button"
import { LabeledValue } from "../common/labeled-value"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "../shadcn/accordion"
import { Separator } from "../shadcn/separator"
import { ScraperExecutionPanel } from "./execution/scraper-execution-panel"
import { ScraperDataSource } from "./scraper-data-source"
import { ScraperInstructionsTree } from "./scraper-instructions-tree"
import { ScraperExecutionHistory } from "./execution/scraper-execution-history"
import { Button } from "../shadcn/button"
import { IteratorDescription } from "../iterator/iterator-description"
import { Settings2 } from "lucide-react"
import { Tooltip, TooltipContent, TooltipTrigger } from "../shadcn/tooltip"
import { useState } from "react"
import { IteratorFormDialog } from "../iterator/iterator-form-dialog"

type ScraperPanelProps = {
  scraper: ScraperType
  onEditSuccess?: (scraper: ScraperType) => void
}

export function ScraperPanel({ scraper, onEditSuccess }: ScraperPanelProps) {
  const [iterator, setIterator] = useState<ExecutionIterator | null>(null)
  const [iteratorDialogOpen, setIteratorDialogOpen] = useState(false)

  return (
    <ScraperProvider scraper={scraper}>
      <div className="flex flex-col gap-4">
        {/* TODO: consider adding small form to configure number of scraper iterations and sequence of row indices to iterate over */}
        <div className="flex flex-row items-center gap-2">
          <IteratorDescription iterator={iterator} />

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                tabIndex={-1}
                onClick={() => setIteratorDialogOpen(true)}
              >
                <Settings2 />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Configure iterator</TooltipContent>
          </Tooltip>

          <IteratorFormDialog
            open={iteratorDialogOpen}
            onOpenChange={setIteratorDialogOpen}
            iterator={iterator}
            onChange={setIterator}
            dataSources={scraper.dataSources}
          />
        </div>
        <ScraperExecutionPanel onEditSuccess={onEditSuccess} />

        {scraper.userDataDirectory && (
          <>
            <Separator />
            <LabeledValue
              label={
                <div className="space-x-1">
                  <span>Custom</span>
                  <b>userData</b>
                  <span>directory</span>
                </div>
              }
            >
              <div className="flex flex-row items-center gap-2 overflow-hidden contain-inline-size">
                <pre dir="rtl" className="truncate leading-none">
                  {scraper.userDataDirectory}
                </pre>
                <CopyButton value={scraper.userDataDirectory} />
              </div>
            </LabeledValue>
          </>
        )}

        <Separator />

        <Accordion
          type="multiple"
          defaultValue={["execution-history"]}
          className="w-full *:data-[slot=accordion-item]:border-b-0"
        >
          <AccordionItem
            value="execution-history"
            className="grid grid-cols-1 grid-rows-[auto_1fr] -mx-6 "
          >
            <AccordionTrigger className="px-6">
              Execution History
            </AccordionTrigger>
            <AccordionContent className="pb-0">
              <ScraperExecutionHistory
                scraperId={scraper.id}
                className="max-h-160"
              />
            </AccordionContent>
          </AccordionItem>

          {scraper.dataSources.length > 0 && (
            <AccordionItem value="sources">
              <AccordionTrigger>Data Sources</AccordionTrigger>
              <AccordionContent className="flex flex-col items-stretch gap-2">
                {scraper.dataSources.map((dataSource) => (
                  <ScraperDataSource
                    key={dataSource.dataStoreTableName}
                    dataSource={dataSource}
                  />
                ))}
              </AccordionContent>
            </AccordionItem>
          )}

          <AccordionItem value="instructions">
            <AccordionTrigger>
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
    </ScraperProvider>
  )
}
