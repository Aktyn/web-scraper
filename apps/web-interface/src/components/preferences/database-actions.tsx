import { DatabaseZap, Shredder, TriangleAlert } from "lucide-react"
import { ConfirmationDialog } from "../common/confirmation-dialog"
import { Button } from "../shadcn/button"
import { usePost } from "@/hooks/api/usePost"
import { useState } from "react"
import { Label } from "../shadcn/label"
import { Switch } from "../shadcn/switch"

export function DatabaseActions() {
  const { postItem: resetDatabase, isPosting: isResettingDatabase } =
    usePost("/reset-database")
  const { postItem: seedDatabase, isPosting: isSeedingDatabase } =
    usePost("/seed-database")

  const [openResetDatabaseDialog, setOpenResetDatabaseDialog] = useState(false)
  const [openSeedDatabaseDialog, setOpenSeedDatabaseDialog] = useState(false)
  const [removeSecondaryData, setRemoveSecondaryData] = useState(false)

  return (
    <div
      data-transition-direction="top"
      className="view-transition flex flex-row items-center gap-2 p-2"
    >
      <ConfirmationDialog
        open={openResetDatabaseDialog}
        onOpenChange={setOpenResetDatabaseDialog}
        title="Reset database"
        description="Are you sure you want to reset the database? This will remove all records and data stores from the database. Make sure to backup database file before resetting."
        content={
          <div className="flex flex-row items-center gap-2">
            <Switch
              id="reset-secondary-data"
              checked={removeSecondaryData}
              onCheckedChange={setRemoveSecondaryData}
            />
            <Label
              htmlFor="reset-secondary-data"
              className="cursor-pointer flex flex-col items-start gap-1"
            >
              Remove only secondary data
              <span className="text-muted-foreground text-xs">
                This will delete only dynamic data like notifications and
                execution history.
                <br />
                The scrapers, routines, data stores, and preferences will not be
                affected.
              </span>
            </Label>
          </div>
        }
        confirmText={
          isResettingDatabase
            ? "Resetting..."
            : removeSecondaryData
              ? "Remove secondary data"
              : "Reset"
        }
        variant="destructive"
        onConfirm={() => {
          if (isResettingDatabase) {
            return
          }

          resetDatabase({ removeSecondaryData })
            .then(() => {
              setOpenResetDatabaseDialog(false)
            })
            .catch(console.error)
        }}
      >
        <Button variant="outline" disabled={isResettingDatabase}>
          <Shredder />
          Reset database
        </Button>
      </ConfirmationDialog>
      <ConfirmationDialog
        open={openSeedDatabaseDialog}
        onOpenChange={setOpenSeedDatabaseDialog}
        title="Seed example data"
        description={
          <span className="flex flex-col gap-2">
            <span className="block">
              Are you sure you want to seed the database with example data?
              <br />
              This will insert example scrapers, routines etc.
              <br />
              This is useful for onboarding new users.
            </span>
            <span className="flex flex-row items-start gap-2 text-warning">
              <TriangleAlert />
              <span className="block">
                Seeding is best to perform on empty database, otherwise it will
                conflict with existing data.
              </span>
            </span>
          </span>
        }
        confirmText={isSeedingDatabase ? "Seeding..." : "Seed"}
        onConfirm={() => {
          if (isSeedingDatabase) {
            return
          }

          seedDatabase(null)
            .then(() => {
              setOpenSeedDatabaseDialog(false)
            })
            .catch(console.error)
        }}
      >
        <Button variant="outline" disabled={isSeedingDatabase}>
          <DatabaseZap />
          Seed example data
        </Button>
      </ConfirmationDialog>
    </div>
  )
}
