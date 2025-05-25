import { useSizer } from "@/hooks/useSizer"
import { cn } from "@/lib/utils"
import { ExternalLink, PanelRightClose } from "lucide-react"
import { useState } from "react"
import { Button } from "../shadcn/button"
import { ScrollArea } from "../shadcn/scroll-area"
import { Separator } from "../shadcn/separator"
import { Tooltip, TooltipContent, TooltipTrigger } from "../shadcn/tooltip"
import { NavigationMenu } from "./navigation-menu"

export function Sidebar() {
  const { ref, width } = useSizer()

  //TODO: store in local storage
  const [isOpen, setIsOpen] = useState(true)

  return (
    <aside
      ref={ref}
      className="z-20 border-r flex flex-col items-stretch relative transition-[margin,border-color,box-shadow] duration-400 ease-in-out bg-background-darker animate-in slide-in-from-left fill-mode-both"
      style={{
        marginLeft: isOpen ? "0px" : `calc(-${width}px + var(--spacing)*16)`,
      }}
    >
      <header
        className={cn(
          "flex flex-row flex-wrap items-center justify-start h-16 py-2 px-4 gap-4",
          "pr-17", // toggle button width + gap-x + right padding
        )}
      >
        <img src="/web-scraper-icon.png" className="max-h-full" />
        <h1 className="text-lg font-bold">Web Scraper</h1>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="ml-auto absolute z-50 w-9 right-4 transition-[translate,background-color,color]"
              onClick={() => setIsOpen(!isOpen)}
            >
              <PanelRightClose
                className={cn(
                  "transition-transform duration-bounce ease-bounce",
                  isOpen ? "rotate-180" : "rotate-0",
                )}
              />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Toggle sidebar</TooltipContent>
        </Tooltip>
      </header>
      <Separator />
      <ScrollArea className="grow">
        <NavigationMenu compact={!isOpen} />
      </ScrollArea>
      <Separator />
      <footer
        className={cn(
          "p-2 text-sm text-muted-foreground flex flex-row flex-nowrap items-center justify-start gap-2 *:not-first:transition-opacity overflow-hidden whitespace-nowrap",
          isOpen ? "*:not-first:opacity-100" : "*:not-first:opacity-0",
        )}
      >
        <img
          src="/aktyn-icon.png"
          className={cn(
            "h-8 transition-[margin] duration-400 ease-in-out",
            isOpen ? "ml-[0%]" : "ml-[calc(100%-var(--spacing)*10)]",
          )}
        />
        <span className="font-semibold">Aktyn</span>
        <Button asChild variant="link" size="sm" className="px-0! h-auto text-muted-foreground">
          <a href="https://github.com/Aktyn" target="_blank">
            GitHub
            <ExternalLink />
          </a>
        </Button>
        <Separator orientation="vertical" className="ml-auto" />
        <span className="font-light">v{getAppVersion()}</span>
      </footer>
    </aside>
  )
}

declare const __APP_VERSION__: string
function getAppVersion() {
  try {
    return __APP_VERSION__
  } catch {
    return "unknown"
  }
}
