import { usePinnedDataStores } from "@/providers/pinned-data-stores.provider"
import type { UserDataStore } from "@web-scraper/common"
import { PinOff } from "lucide-react"
import { useState } from "react"
import { Button } from "../shadcn/button"
import { Tooltip, TooltipContent, TooltipTrigger } from "../shadcn/tooltip"
import { DataStoreDialog } from "./data-store-dialog"
import { Badge } from "../shadcn/badge"
import { Separator } from "../shadcn/separator"

export function PinnedDataStores() {
  const { pinnedDataStores, unpinDataStore } = usePinnedDataStores()

  const [dataStoreTableOpen, setDataStoreTableOpen] = useState(false)
  const [storeToView, setStoreToView] = useState<UserDataStore | null>(null)

  return (
    <>
      {pinnedDataStores.length > 0 && (
        <Separator className="my-2 opacity-50 animate-in zoom-in" />
      )}

      <div className="flex flex-col gap-2 p-2 contain-inline-size">
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
            <Badge className="text-muted-foreground bg-muted">
              {store.recordsCount}
            </Badge>
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
