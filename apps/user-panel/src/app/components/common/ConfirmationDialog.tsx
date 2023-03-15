import type { ReactNode } from 'react'
import { LoadingButton } from '@mui/lab'
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  type DialogProps,
  DialogTitle,
} from '@mui/material'

type ConfirmationDialogProps = Omit<DialogProps, 'onClose'> & {
  onClose: () => void
  onConfirm: () => void
  titleContent: ReactNode | Element
  cancelButtonText?: string
  confirmButtonText?: string
  loading?: boolean
}

export function ConfirmationDialog({
  onClose,
  onConfirm,
  titleContent,
  children,
  loading,
  cancelButtonText = 'Cancel',
  confirmButtonText = 'Confirm',
  ...dialogProps
}: ConfirmationDialogProps) {
  //TODO: auto closing dialog

  return (
    <Dialog onClose={onClose} {...dialogProps}>
      <>
        {typeof titleContent === 'string' ? (
          <DialogTitle color="text.secondary">{titleContent}</DialogTitle>
        ) : (
          titleContent
        )}
        <DialogContent sx={{ pt: 0 }}>
          {typeof children === 'string' ? (
            <DialogContentText color="text.primary" whiteSpace="pre-wrap">
              {children}
            </DialogContentText>
          ) : (
            children
          )}
        </DialogContent>
        <DialogActions>
          <Button variant="outlined" color="secondary" onClick={onClose}>
            {cancelButtonText}
          </Button>
          <LoadingButton
            variant="outlined"
            color="primary"
            onClick={onConfirm}
            loading={loading}
            loadingPosition="center"
          >
            {confirmButtonText}
          </LoadingButton>
        </DialogActions>
      </>
    </Dialog>
  )
}
