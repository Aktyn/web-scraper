import { usePost } from "@/hooks/api/usePost"
import { ListRestart } from "lucide-react"
import { useRef, useState } from "react"
import { ConfirmationDialog } from "../common/confirmation-dialog"
import type { PreferencesTableInterface } from "../preferences/preferences-table"
import { PreferencesTable } from "../preferences/preferences-table"
import { Button } from "../shadcn/button"
import { Label } from "../shadcn/label"
import { Separator } from "../shadcn/separator"

export function Preferences() {
  const preferencesTableRef = useRef<PreferencesTableInterface>(null)

  const { postItem: resetPreferences, isPosting } =
    usePost("/preferences/reset")

  const [openConfirmationDialog, setOpenConfirmationDialog] = useState(false)

  return (
    <div className="size-full flex flex-col overflow-hidden">
      <div
        data-transition-direction="top"
        className="view-transition flex flex-row items-center gap-2 p-2"
      >
        todo
      </div>
      <Separator className="view-transition" />
      <div
        data-transition-direction="left"
        className="view-transition delay-100 flex flex-row items-center justify-between gap-2 p-2"
      >
        <Label className="text-lg font-semibold text-muted-foreground">
          Config
        </Label>
        <ConfirmationDialog
          open={openConfirmationDialog}
          onOpenChange={setOpenConfirmationDialog}
          title="Reset config"
          description="Are you sure you want to reset the config to the default values?"
          confirmText={isPosting ? "Resetting..." : "Confirm reset"}
          onConfirm={() => {
            if (isPosting) {
              return
            }

            resetPreferences(null)
              .then(() => {
                setOpenConfirmationDialog(false)
                preferencesTableRef.current?.refetch()
              })
              .catch(console.error)
          }}
        >
          <Button variant="outline">
            <ListRestart />
            Reset to default
          </Button>
        </ConfirmationDialog>
      </div>
      <PreferencesTable ref={preferencesTableRef} />
    </div>
  )
}
