import { useCachedState } from "@/hooks/useCachedState"
import { useSizer } from "@/hooks/useSizer"
import { cn } from "@/lib/utils"
import { ServerEventsProvider } from "@/providers/server-events.provider"
import { PanelRightClose } from "lucide-react"
import { useState } from "react"
import { PinnedDataStores } from "../data-store/pinned-data-stores"
import { Button } from "../shadcn/button"
import { ScrollArea } from "../shadcn/scroll-area"
import { Separator } from "../shadcn/separator"
import { Tooltip, TooltipContent, TooltipTrigger } from "../shadcn/tooltip"
import { Footer } from "./footer"
import { NavigationMenu } from "./navigation-menu"
import { ExecutingScrapersCompactInfo } from "../scraper/executing-scrapers-compact-info"
import { QuickSettings } from "../common/quick-settings"

const { ConnectionStatus } = ServerEventsProvider

export function Sidebar() {
  const { ref, width } = useSizer()

  const { status } = ServerEventsProvider.useContext()

  const [isOpen, setIsOpen] = useCachedState("sidebar-open", true, localStorage)
  const [isInitiallyOpen] = useState(isOpen)

  return (
    <aside
      ref={ref}
      className={cn(
        "z-20 border-r flex flex-col items-stretch relative transition-[margin,border-color,box-shadow] duration-400 ease-in-out bg-background-darker",
        isInitiallyOpen &&
          "animate-in delay-100 slide-in-from-left fill-mode-both",
      )}
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
              className={cn(
                "ml-auto absolute z-50 w-9 right-4 transition-[translate,background-color,border-color,color] border border-transparent",
                status === ConnectionStatus.Connecting && "border-muted",
                status === ConnectionStatus.Error && "border-destructive",
              )}
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
          <TooltipContent>
            Toggle sidebar
            {status === ConnectionStatus.Connecting &&
              " (establishing server connection)"}
            {status === ConnectionStatus.Error && " (sever connection error)"}
          </TooltipContent>
        </Tooltip>
      </header>
      <Separator />
      <ScrollArea className="grow">
        <NavigationMenu compact={!isOpen} />
        <PinnedDataStores />
        <ExecutingScrapersCompactInfo />
      </ScrollArea>
      <Separator
        className={cn(
          "transition-opacity",
          isOpen ? "opacity-70" : "opacity-0",
        )}
      />
      <div
        className={cn(
          "transition-opacity",
          isOpen ? "opacity-100" : "opacity-0",
        )}
      >
        <QuickSettings />
      </div>
      <Separator className="opacity-70" />
      <Footer isOpen={isOpen} />
    </aside>
  )
}
