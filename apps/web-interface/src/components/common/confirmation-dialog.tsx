import { Button } from "@/components/shadcn/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/shadcn/dialog"
import type { ComponentProps } from "react"

type ConfirmationDialogProps = ComponentProps<typeof Dialog> & {
  title: string
  description: string
  confirmText?: string
  cancelText?: string
  onConfirm: () => void
  variant?: ComponentProps<typeof Button>["variant"]
  className?: string
}

export function ConfirmationDialog({
  title,
  description,
  confirmText = "Confirm",
  cancelText = "Cancel",
  onConfirm,
  variant = "default",
  className,
  ...dialogProps
}: ConfirmationDialogProps) {
  return (
    <Dialog {...dialogProps}>
      <DialogContent aria-describedby={undefined} className={className}>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => dialogProps.onOpenChange?.(false)}>
            {cancelText}
          </Button>
          <Button variant={variant} onClick={onConfirm}>
            {confirmText}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
