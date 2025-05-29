import type { UserDataStore } from "@web-scraper/common"
import type { ComponentProps } from "react"
import { PinStoreButton } from "../common/button/pin-store-button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../shadcn/dialog"
import { DataStoreTable } from "./data-store-table"

type DataStoreDialogProps = {
  store: UserDataStore
} & ComponentProps<typeof Dialog>

export function DataStoreDialog({ store, ...dialogProps }: DataStoreDialogProps) {
  return (
    <Dialog {...dialogProps}>
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
