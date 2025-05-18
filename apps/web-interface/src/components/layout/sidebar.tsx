import { ExternalLink, PanelLeftClose, PanelRightClose } from "lucide-react"
import { Button } from "../shadcn/button"
import { ScrollArea } from "../shadcn/scroll-area"
import { Separator } from "../shadcn/separator"
import { Tooltip, TooltipContent, TooltipTrigger } from "../shadcn/tooltip"
import { useState } from "react"
import { cn } from "@/lib/utils"
import { useSizer } from "@/hooks/useSizer"
import { NavigationMenu } from "./navigation-menu"

export function Sidebar() {
  const { ref, width } = useSizer()

  const [isOpen, setIsOpen] = useState(true)

  return (
    <aside
      ref={ref}
      className={cn(
        "border-r flex flex-col items-stretch relative transition-[margin,border-color,box-shadow] duration-400 bg-background-darker",
        isOpen
          ? "ease-in-out"
          : "ease-in hover:border-primary shadow-[-1rem_0_1rem] hover:shadow-[0rem_0_1rem] shadow-primary cursor-pointer",
      )}
      style={{
        marginLeft: isOpen ? "0px" : `-${width}px`,
      }}
      onClick={() => {
        if (!isOpen) {
          setIsOpen(true)
        }
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
                "ml-auto absolute z-50 w-9 right-4 transition-[translate,background-color,color]",
                isOpen ? "translate-x-0" : "translate-x-15",
              )}
              onClick={() => setIsOpen(!isOpen)}
            >
              {isOpen ? <PanelLeftClose /> : <PanelRightClose />}
            </Button>
          </TooltipTrigger>
          <TooltipContent>Toggle sidebar</TooltipContent>
        </Tooltip>
      </header>
      <Separator />
      <ScrollArea className="grow">
        <NavigationMenu />
      </ScrollArea>
      <Separator />
      <footer className="p-2 text-sm text-muted-foreground flex flex-row flex-wrap items-center justify-start gap-2">
        <img src="/aktyn-icon.png" className="h-8" />
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
