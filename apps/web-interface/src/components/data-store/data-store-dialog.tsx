import type { UserDataStore } from "@web-scraper/common"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../shadcn/dialog"
import { DataStoreTable } from "./data-store-table"
import { PinStoreButton } from "../common/button/pin-store-button"

type DataStoreDialogProps = {
  store: UserDataStore
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function DataStoreDialog({ store, open, onOpenChange }: DataStoreDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        aria-describedby={undefined}
        className="sm:max-w-[calc(100%-2rem)] sm:w-4xl max-h-full overflow-hidden grid grid-rows-[auto_1fr]"
      >
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {store.name}
            <PinStoreButton store={store} />
          </DialogTitle>
          {store.description && <DialogDescription>{store.description}</DialogDescription>}
        </DialogHeader>
        <DataStoreTable store={store} className="-m-6 mt-0" />
      </DialogContent>
    </Dialog>
  )
}
