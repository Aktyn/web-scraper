import { useCachedState } from "@/hooks/useCachedState"
import { useSizer } from "@/hooks/useSizer"
import { cn } from "@/lib/utils"
import { usePinnedDataStores } from "@/providers/pinned-data-stores-provider"
import { type UserDataStore } from "@web-scraper/common"
import { PanelRightClose, PinOff } from "lucide-react"
import { useState } from "react"
import { DataStoreDialog } from "../data-store/data-store-dialog"
import { Badge } from "../shadcn/badge"
import { Button } from "../shadcn/button"
import { ScrollArea } from "../shadcn/scroll-area"
import { Separator } from "../shadcn/separator"
import { Tooltip, TooltipContent, TooltipTrigger } from "../shadcn/tooltip"
import { Footer } from "./footer"
import { NavigationMenu } from "./navigation-menu"

export function Sidebar() {
  const { ref, width } = useSizer()

  const [isOpen, setIsOpen] = useCachedState("sidebar-open", true, localStorage)
  const [isInitiallyOpen] = useState(isOpen)

  return (
    <aside
      ref={ref}
      className={cn(
        "z-20 border-r flex flex-col items-stretch relative transition-[margin,border-color,box-shadow] duration-400 ease-in-out bg-background-darker",
        isInitiallyOpen && "animate-in delay-100 slide-in-from-left fill-mode-both",
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
        <PinnedDataStores />
      </ScrollArea>
      <Separator />
      <Footer isOpen={isOpen} />
    </aside>
  )
}

function PinnedDataStores() {
  const { pinnedDataStores, unpinDataStore } = usePinnedDataStores()

  const [dataStoreTableOpen, setDataStoreTableOpen] = useState(false)
  const [storeToView, setStoreToView] = useState<UserDataStore | null>(null)

  return (
    <>
      {pinnedDataStores.length > 0 && <Separator className="my-2 opacity-50 animate-in zoom-in" />}

      <div className="grow flex flex-col gap-2 p-2 contain-inline-size">
        {pinnedDataStores.map((store) => (
          <Button
            key={store.tableName}
            variant="outline"
            size="sm"
            className="animate-in fade-in max-w-full overflow-hidden"
            onClick={() => {
              setStoreToView(store)
              setDataStoreTableOpen(true)
            }}
          >
            <strong className="truncate">{store.name}</strong>
            <Badge className="text-muted-foreground bg-muted">{store.recordsCount}</Badge>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  asChild
                  variant="ghost"
                  size="icon"
                  tabIndex={-1}
                  onClick={(event) => {
                    event.stopPropagation()
                    unpinDataStore(store)
                  }}
                >
                  <div>
                    <PinOff />
                  </div>
                </Button>
              </TooltipTrigger>
              <TooltipContent>Unpin</TooltipContent>
            </Tooltip>
          </Button>
        ))}
      </div>

      {storeToView && (
        <DataStoreDialog
          store={storeToView}
          open={dataStoreTableOpen}
          onOpenChange={(openState) => {
            setDataStoreTableOpen(openState)
          }}
        />
      )}
    </>
  )
}
