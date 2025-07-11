import type { UserDataStore } from "@web-scraper/common"
import { FileDown, FileUp } from "lucide-react"
import { useRef, type ComponentProps } from "react"
import { PinStoreButton } from "../common/button/pin-store-button"
import { Button } from "../shadcn/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../shadcn/dialog"
import { DataStoreExportDialog } from "./data-store-export-dialog"
import { DataStoreImportDialog } from "./data-store-import-dialog"
import type { DataStoreTableInterface } from "./data-store-table"
import { DataStoreTable } from "./data-store-table"

type DataStoreDialogProps = {
  store: UserDataStore
} & ComponentProps<typeof Dialog>

export function DataStoreDialog({
  store,
  ...dialogProps
}: DataStoreDialogProps) {
  const tableRef = useRef<DataStoreTableInterface>(null)

  return (
    <Dialog {...dialogProps}>
      <DialogContent
        aria-describedby={undefined}
        className="sm:max-w-[calc(100%-2rem)] sm:w-4xl max-h-full overflow-hidden grid grid-rows-[auto_1fr]"
      >
        <DialogHeader>
          <DialogTitle className="flex flex-row items-center justify-between gap-2">
            <div className="flex flex-row items-center gap-2">
              {store.name}
              <PinStoreButton store={store} />
            </div>
            <div className="flex flex-row items-center gap-2">
              <DataStoreExportDialog store={store}>
                <Button variant="outline" size="sm" tabIndex={-1}>
                  <FileDown className="w-4 h-4" />
                  Export Data Store
                </Button>
              </DataStoreExportDialog>
              <DataStoreImportDialog
                store={store}
                onSuccess={() => tableRef.current?.refresh()}
              >
                <Button variant="outline" size="sm" tabIndex={-1}>
                  <FileUp className="w-4 h-4" />
                  Import data from file
                </Button>
              </DataStoreImportDialog>
            </div>
          </DialogTitle>
          {store.description && (
            <DialogDescription>{store.description}</DialogDescription>
          )}
        </DialogHeader>
        <DataStoreTable ref={tableRef} store={store} className="-m-6 mt-0" />
      </DialogContent>
    </Dialog>
  )
}
