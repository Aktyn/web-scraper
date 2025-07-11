import type { UserDataStore } from "@web-scraper/common"
import { useState, type ComponentProps } from "react"
import { Button } from "../shadcn/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../shadcn/dialog"
import { RadioGroup, RadioGroupItem } from "../shadcn/radio-group"
import { Label } from "../shadcn/label"
import { Switch } from "../shadcn/switch"
import { usePost } from "@/hooks/api/usePost"

enum ExportFormat {
  CSV = "csv",
  JSON = "json",
}

type DataStoreExportDialogProps = {
  store: UserDataStore
} & ComponentProps<typeof Dialog>

export function DataStoreExportDialog({
  store,
  children,
  ...dialogProps
}: DataStoreExportDialogProps) {
  const { postItem: exportDataStore, isPosting: exportingDataStore } = usePost(
    "/user-data-stores/:tableName/export",
    { successMessage: "Data store exported successfully" },
  )

  const [format, setFormat] = useState(ExportFormat.CSV)
  const [includeColumnDefinitions, setIncludeColumnDefinitions] =
    useState(false)

  return (
    <Dialog {...dialogProps}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent aria-describedby={undefined}>
        <DialogHeader>
          <DialogTitle>Export Data Store</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-4">
          <RadioGroup
            value={format}
            onValueChange={(value) => setFormat(value as ExportFormat)}
            className="**:[label]:cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <RadioGroupItem value={ExportFormat.CSV} id="csv" />
              <Label htmlFor="csv">CSV</Label>
            </div>
            <div className="flex items-center gap-2">
              <RadioGroupItem value={ExportFormat.JSON} id="json" />
              <Label htmlFor="json">JSON</Label>
            </div>
          </RadioGroup>
          <div className="flex items-center gap-2">
            <Switch
              id="include-column-definitions"
              checked={includeColumnDefinitions}
              onCheckedChange={setIncludeColumnDefinitions}
              disabled={format !== ExportFormat.JSON}
            />
            <Label htmlFor="include-column-definitions">
              Include column definitions
            </Label>
          </div>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Cancel</Button>
          </DialogClose>
          <Button
            onClick={() =>
              exportDataStore(
                {
                  format,
                  includeColumnDefinitions,
                },
                { tableName: store.tableName },
              )
            }
            disabled={exportingDataStore}
          >
            Export as {format.toUpperCase()}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
