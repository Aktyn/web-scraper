import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/shadcn/accordion"
import { Button } from "@/components/shadcn/button"
import { Label } from "@/components/shadcn/label"
import type { ScraperInstructionsExecutionInfo } from "@web-scraper/common"
import { ScraperInstructionsExecutionInfoType } from "@web-scraper/common"
import { ExternalLinkIcon } from "lucide-react"
import { useMemo } from "react"

type ScraperPagePortalsProps = {
  executionInfo: ScraperInstructionsExecutionInfo
}

export function ScraperPagePortals({ executionInfo }: ScraperPagePortalsProps) {
  const pagePortals = useMemo(() => {
    return executionInfo.filter(
      (info) =>
        info.type === ScraperInstructionsExecutionInfoType.PagePortalOpened,
    )
  }, [executionInfo])

  if (!pagePortals.length) {
    return null
  }

  return (
    <Accordion
      type="multiple"
      defaultValue={pagePortals.map((portal) => portal.pageIndex.toString())}
    >
      {pagePortals.map((portal) => (
        <AccordionItem key={portal.url} value={portal.pageIndex.toString()}>
          <AccordionTrigger className="gap-2 flex flex-row items-center justify-between gap-x-4">
            <Label>
              Page <b>{portal.pageIndex}</b> portal
            </Label>
            <Button
              asChild
              variant="ghost"
              size="sm"
              className="mr-auto"
              onClick={(event) => {
                event.stopPropagation()
              }}
            >
              <a href={portal.url} target="_blank" rel="noopener noreferrer">
                <ExternalLinkIcon />
                Open in new tab
              </a>
            </Button>
          </AccordionTrigger>
          <AccordionContent>
            <PagePortal url={portal.url} pageIndex={portal.pageIndex} />
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  )

  // if (pagePortals.length === 1) {
  //   return (
  //     <PagePortal
  //       url={pagePortals[0].url}
  //       pageIndex={pagePortals[0].pageIndex}
  //     />
  //   )
  // }

  // return (
  //   <Tabs defaultValue="1">
  //     <TabsList>
  //       {pagePortals.map((portal) => (
  //         <TabsTrigger key={portal.url} value={portal.pageIndex.toString()}>
  //           Page {portal.pageIndex}
  //         </TabsTrigger>
  //       ))}
  //     </TabsList>
  //     {pagePortals.map((portal) => (
  //       <TabsContent key={portal.url} value={portal.pageIndex.toString()}>
  //         <PagePortal url={portal.url} pageIndex={portal.pageIndex} />
  //       </TabsContent>
  //     ))}
  //   </Tabs>
  // )
}

type PagePortalProps = {
  url: string
  pageIndex: number
}

function PagePortal({ url, pageIndex }: PagePortalProps) {
  return (
    <div className="bg-background-darker border rounded-xl overflow-hidden w-full aspect-video flex items-stretch justify-stretch">
      <iframe
        src={url}
        className="w-full h-full border-none"
        title={`Page ${pageIndex}`}
      />
    </div>
  )
}
