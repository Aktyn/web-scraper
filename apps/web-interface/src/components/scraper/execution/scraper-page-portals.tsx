import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/shadcn/accordion"
import { Button } from "@/components/shadcn/button"
import { Label } from "@/components/shadcn/label"
import { useGet } from "@/hooks/api/useGet"
import type { ScraperInstructionsExecutionInfo } from "@web-scraper/common"
import {
  defaultPreferences,
  ScraperInstructionsExecutionInfoType,
} from "@web-scraper/common"
import { ExternalLinkIcon } from "lucide-react"
import { useEffect, useMemo, useRef } from "react"

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
  const containerRef = useRef<HTMLDivElement>(null)

  const { data: userPreferences, isLoading } = useGet("/preferences")

  const width =
    (userPreferences?.data.find((p) => p.key === "viewportWidth")
      ?.value as number) ?? defaultPreferences.viewportWidth.value
  const height =
    (userPreferences?.data.find((p) => p.key === "viewportHeight")
      ?.value as number) ?? defaultPreferences.viewportHeight.value

  useEffect(() => {
    const container = containerRef.current
    const iframe = container?.querySelector("iframe")

    if (!container || !iframe || isLoading) {
      return
    }

    const observer = new ResizeObserver((entries) => {
      const entry = entries[0]
      if (entry) {
        const widthRatio = entry.contentRect.width / width
        const heightRatio = entry.contentRect.height / height

        iframe.style.transform = `scale(${widthRatio}, ${heightRatio})`
      }
    })

    observer.observe(container)

    return () => {
      observer.disconnect()
    }
  }, [height, isLoading, width])

  return (
    <div
      ref={containerRef}
      className="bg-background-darker border rounded-xl overflow-hidden w-full aspect-video flex items-stretch justify-stretch relative"
    >
      {!isLoading && (
        <iframe
          src={url}
          width={width}
          height={height}
          className="border-none absolute left-0 top-0 overflow-hidden origin-top-left"
          title={`Page ${pageIndex}`}
        />
      )}
    </div>
  )
}
