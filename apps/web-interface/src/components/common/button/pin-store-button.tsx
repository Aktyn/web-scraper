import { Button } from "@/components/shadcn/button"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/shadcn/tooltip"
import { cn } from "@/lib/utils"
import { usePinnedDataStores } from "@/providers/pinned-data-stores-provider"
import { type UserDataStore } from "@web-scraper/common"
import { Pin } from "lucide-react"

export function PinStoreButton({ store }: { store: UserDataStore }) {
  const { pinnedDataStores, pinDataStore, unpinDataStore } = usePinnedDataStores()

  const isPinned = pinnedDataStores.some((pinnedStore) => pinnedStore.tableName === store.tableName)

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          tabIndex={-1}
          onClick={(event) => {
            event.stopPropagation()

            if (isPinned) {
              unpinDataStore(store)
            } else {
              pinDataStore(store)
            }
          }}
        >
          <Pin className={cn(isPinned && "text-primary")} />
        </Button>
      </TooltipTrigger>
      <TooltipContent>{isPinned ? "Unpin from sidebar" : "Pin to sidebar"}</TooltipContent>
    </Tooltip>
  )
}
