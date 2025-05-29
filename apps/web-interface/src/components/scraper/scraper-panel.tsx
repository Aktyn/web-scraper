import type { ScraperType } from "@web-scraper/common"
import { CopyButton } from "../common/button/copy-button"
import { LabeledValue } from "../common/labeled-value"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "../shadcn/accordion"
import { Separator } from "../shadcn/separator"
import { ScraperDataSource } from "./scraper-data-source"
import { ScraperInstructionsTree } from "./scraper-instructions-tree"

type ScraperPanelProps = {
  scraper: ScraperType
}

export function ScraperPanel({ scraper }: ScraperPanelProps) {
  return (
    <div className="flex flex-col gap-4">
      {scraper.userDataDirectory && (
        <>
          <LabeledValue
            label={
              <>
                Custom <b>userData</b> directory
              </>
            }
          >
            <div className="flex flex-row items-center gap-2">
              <pre>{scraper.userDataDirectory}</pre>
              <CopyButton value={scraper.userDataDirectory} />
            </div>
          </LabeledValue>
          <Separator />
        </>
      )}

      <Accordion type="single" collapsible defaultValue="sources" className="w-full">
        <AccordionItem value="sources">
          <AccordionTrigger tabIndex={-1}>Data Sources</AccordionTrigger>
          <AccordionContent className="pb-0 flex flex-col items-stretch gap-2">
            {scraper.dataSources.map((dataSource) => (
              <ScraperDataSource key={dataSource.dataStoreTableName} dataSource={dataSource} />
            ))}
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      <Separator />

      <Accordion type="single" collapsible defaultValue="instructions" className="w-full">
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
  )
}
