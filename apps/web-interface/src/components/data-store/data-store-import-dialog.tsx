import { usePost } from "@/hooks/api/usePost"
import type { UserDataStore } from "@web-scraper/common"
import { useState, type ComponentProps } from "react"
import { Button } from "../shadcn/button.js"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../shadcn/dialog.js"
import { Label } from "../shadcn/label.js"
import { Switch } from "../shadcn/switch.js"

type DataStoreImportDialogProps = {
  store: UserDataStore
  onSuccess?: () => void
} & ComponentProps<typeof Dialog>

export function DataStoreImportDialog({
  store,
  children,
  onSuccess,
  ...dialogProps
}: DataStoreImportDialogProps) {
  const { postItem: importDataStore, isPosting: importingDataStore } = usePost(
    "/user-data-stores/:tableName/import",
    { successMessage: "Data store imported successfully" },
  )

  const [open, setOpen] = useState(false)
  const [updateRows, setUpdateRows] = useState(false)

  return (
    <Dialog open={open} onOpenChange={setOpen} {...dialogProps}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent aria-describedby={undefined}>
        <DialogHeader>
          <DialogTitle>Import Data Store</DialogTitle>
        </DialogHeader>
        <div className="flex items-center gap-2">
          <Switch
            id="update-rows"
            checked={updateRows}
            onCheckedChange={setUpdateRows}
          />
          <Label htmlFor="update-rows">
            If selected - existing rows with same ID will be updated instead of
            ignored
          </Label>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Cancel</Button>
          </DialogClose>
          <Button
            onClick={() =>
              importDataStore(
                {
                  updateRows,
                },
                { tableName: store.tableName },
              ).then((res) => {
                if (res?.data === null) {
                  setOpen(false)
                  onSuccess?.()
                }
              })
            }
            disabled={importingDataStore}
          >
            Import
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
