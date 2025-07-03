import { RoutineStatus, type Routine } from "@web-scraper/common"
import { useEffect, useState, type ComponentProps } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../shadcn/dialog"
import { ScrollArea } from "../shadcn/scroll-area"
import { RoutinePanel } from "./routine-panel"
import { Button } from "../shadcn/button"
import { Edit, Pause, Play } from "lucide-react"
import { RoutineFormDialog } from "./routine-form-dialog"
import { usePost } from "@/hooks/api/usePost"

type ScraperPanelDialogProps = {
  routine: Routine
} & ComponentProps<typeof Dialog>

export function RoutinePanelDialog({
  routine: routineSource,
  ...dialogProps
}: ScraperPanelDialogProps) {
  const { postItem: pauseRoutine, isPosting: isPausingRoutine } = usePost(
    "/routines/:id/pause",
  )
  const { postItem: resumeRoutine, isPosting: isResumingRoutine } = usePost(
    "/routines/:id/resume",
  )

  const [routine, setRoutine] = useState<Routine>(routineSource)
  const [editDialogOpen, setEditDialogOpen] = useState(false)

  useEffect(() => {
    setRoutine(routineSource)
  }, [routineSource])

  return (
    <>
      <Dialog {...dialogProps}>
        <DialogContent
          aria-describedby={undefined}
          className="overflow-hidden grid grid-rows-[auto_1fr] p-0 sm:max-w-3xl"
        >
          <DialogHeader className="p-6 pb-0">
            <DialogTitle className="flex items-center justify-between gap-2">
              <span className="text-left mr-auto">
                Routine for scraper: <b>{routine.scraperName}</b>
              </span>
              <Button
                variant="outline"
                onClick={() => {
                  if (routine.status === RoutineStatus.Active) {
                    void pauseRoutine(null, { id: routine.id }).then((res) =>
                      setRoutine((prev) => res?.data ?? prev),
                    )
                  } else {
                    void resumeRoutine(null, { id: routine.id }).then((res) =>
                      setRoutine((prev) => res?.data ?? prev),
                    )
                  }
                }}
                tabIndex={-1}
                disabled={
                  routine.status === RoutineStatus.Executing ||
                  isPausingRoutine ||
                  isResumingRoutine
                }
              >
                {routine.status === RoutineStatus.Active ? (
                  <>
                    <Pause />
                    Pause routine
                  </>
                ) : (
                  <>
                    <Play />
                    Resume routine
                  </>
                )}
              </Button>
              <Button
                variant="outline"
                onClick={() => setEditDialogOpen(true)}
                tabIndex={-1}
              >
                <Edit />
                Edit routine
              </Button>
            </DialogTitle>
            {routine.description && (
              <DialogDescription>{routine.description}</DialogDescription>
            )}
          </DialogHeader>
          <ScrollArea className="max-h-full overflow-hidden *:data-[radix-scroll-area-viewport]:px-6 pb-4">
            <RoutinePanel routine={routine} onRoutineExecuted={setRoutine} />
          </ScrollArea>
        </DialogContent>
      </Dialog>
      <RoutineFormDialog
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        onSuccess={setRoutine}
        editRoutine={routine}
      />
    </>
  )
}
