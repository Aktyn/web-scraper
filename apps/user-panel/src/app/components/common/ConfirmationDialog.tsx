import { memo, type ReactNode, useState } from 'react'
import { LoadingButton } from '@mui/lab'
import {
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  type DialogProps,
  DialogTitle,
  Stack,
  Typography,
} from '@mui/material'
import { useInterval } from '../../hooks/useInterval'

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
  return (
    <Dialog onClose={onClose} {...dialogProps}>
      <Stack direction="row" alignItems="center" justifyContent="space-between" pr="1.5rem">
        <>
          {typeof titleContent === 'string' ? (
            <DialogTitle color="text.secondary">{titleContent}</DialogTitle>
          ) : (
            titleContent
          )}
          <AutoCloseCountdown duration={10_000} onClose={onClose} />
        </>
      </Stack>
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
    </Dialog>
  )
}

interface AutoCloseCountdownProps {
  /** Milliseconds */
  duration: number
  onClose: () => void
}

const AutoCloseCountdown = memo(({ duration, onClose }: AutoCloseCountdownProps) => {
  const [start] = useState(Date.now())
  const [now, setNow] = useState(start)

  useInterval(
    () => {
      const now = Date.now()
      if (now - start >= duration) {
        onClose()
        return
      }
      setNow(now)
    },
    16,
    [onClose, start],
  )

  const progress = Math.max(0, 1 - (Math.floor((now - start) / 1000 + 1) * 1000) / duration)

  return (
    <Stack direction="row" alignItems="center" gap={1}>
      <Typography variant="caption" color="text.secondary">
        Auto close in
      </Typography>
      <Box sx={{ position: 'relative', display: 'inline-flex' }}>
        <CircularProgress variant="determinate" size={20} value={progress * 100} />
        <Box
          sx={{
            top: 0,
            left: 0,
            bottom: 0,
            right: 0,
            position: 'absolute',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Typography variant="caption" component="span" textAlign="center" color="text.secondary">
            {Math.max(0, Math.floor((duration - (now - start)) / 1000))}
          </Typography>
        </Box>
      </Box>
    </Stack>
  )
})
