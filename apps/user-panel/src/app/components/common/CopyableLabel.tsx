import { memo, useCallback, useRef } from 'react'
import { ContentCopyRounded } from '@mui/icons-material'
import { Box, IconButton, Stack, type StackProps, Tooltip, useTheme } from '@mui/material'
import anime from 'animejs'
import { useCancellablePromise } from '../../hooks/useCancellablePromise'
import { copyToClipboard } from '../../utils'

interface CopyableLabelProps extends StackProps {
  children: string
}

export const CopyableLabel = memo(({ children, ...stackProps }: CopyableLabelProps) => {
  const buttonRef = useRef<HTMLButtonElement>(null)
  const cancellable = useCancellablePromise()
  const theme = useTheme()

  const handleCopy = useCallback(() => {
    cancellable(copyToClipboard(children)).then((success) => {
      const commonParams: anime.AnimeParams = {
        targets: buttonRef.current,
        easing: 'easeInOutExpo',
      }

      if (buttonRef.current) {
        anime.remove(buttonRef.current)
      }
      anime({
        ...commonParams,
        color: success ? theme.palette.success.main : theme.palette.error.main,
        scale: success ? 1.2 : 1,
        duration: 400,
        complete: () => {
          anime({
            ...commonParams,
            color: theme.palette.text.secondary,
            scale: 1,
            duration: 1000,
          })
        },
      })
    })
  }, [
    cancellable,
    children,
    theme.palette.error.main,
    theme.palette.success.main,
    theme.palette.text.secondary,
  ])

  return (
    <Stack direction="row" alignItems="center" gap={1} {...stackProps}>
      <Box sx={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
        {children}
      </Box>
      <Tooltip title="Copy to clipboard" disableInteractive>
        <IconButton
          ref={buttonRef}
          size="small"
          onClick={handleCopy}
          sx={{ color: 'text.secondary' }}
        >
          <ContentCopyRounded fontSize="small" color="inherit" />
        </IconButton>
      </Tooltip>
    </Stack>
  )
})
