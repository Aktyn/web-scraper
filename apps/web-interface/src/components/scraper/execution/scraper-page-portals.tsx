import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/shadcn/accordion"
import { Button } from "@/components/shadcn/button"
import { Label } from "@/components/shadcn/label"
import { useGet } from "@/hooks/api/useGet"
import { palette } from "@/lib/palette"
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

type PageOpenedExecutionInfo = Required<
  Extract<
    ScraperInstructionsExecutionInfo[number],
    { type: ScraperInstructionsExecutionInfoType.PageOpened }
  >
>

export function ScraperPagePortals({ executionInfo }: ScraperPagePortalsProps) {
  const pagesWithPortals = useMemo(() => {
    return executionInfo.filter(
      (info) =>
        info.type === ScraperInstructionsExecutionInfoType.PageOpened &&
        !!info.portalUrl,
    ) as PageOpenedExecutionInfo[]
  }, [executionInfo])

  if (!pagesWithPortals.length) {
    return null
  }

  return (
    <Accordion type="multiple">
      {pagesWithPortals.map((portal) => (
        <AccordionItem
          key={`${portal.portalUrl}-${portal.pageIndex}`}
          value={portal.pageIndex.toString()}
        >
          <AccordionTrigger className="gap-2 flex flex-row items-center justify-between gap-x-4 py-2">
            <span
              className="size-4 rounded-full"
              style={{
                backgroundColor: palette[portal.pageIndex % palette.length],
              }}
            />
            <Label>
              Page <b>{portal.pageIndex}</b> portal
            </Label>
            <Button
              asChild
              variant="ghost"
              size="sm"
              className="mr-auto"
              tabIndex={-1}
              onClick={(event) => {
                event.stopPropagation()
              }}
            >
              <a
                href={portal.portalUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                <ExternalLinkIcon />
                Open in new tab
              </a>
            </Button>
          </AccordionTrigger>
          <AccordionContent>
            <PagePortal url={portal.portalUrl} pageIndex={portal.pageIndex} />
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  )
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
      className="bg-background-darker border-2 rounded-xl overflow-hidden w-full aspect-video flex items-stretch justify-stretch relative"
      style={
        pageIndex > 0
          ? {
              borderColor: `${palette[pageIndex % palette.length]}`,
              backgroundColor: `${palette[pageIndex % palette.length]}08`,
            }
          : undefined
      }
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
