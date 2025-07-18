import { Button } from "@/components/shadcn/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/shadcn/dialog"
import type { ComponentProps, ReactNode } from "react"

type ConfirmationDialogProps = ComponentProps<typeof Dialog> & {
  title: string
  description: ReactNode
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
  children,
  ...dialogProps
}: ConfirmationDialogProps) {
  return (
    <Dialog {...dialogProps}>
      {children && <DialogTrigger asChild>{children}</DialogTrigger>}
      <DialogContent aria-describedby={undefined} className={className}>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">{cancelText}</Button>
          </DialogClose>
          <Button variant={variant} onClick={onConfirm}>
            {confirmText}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
