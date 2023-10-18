import { forwardRef, type MouseEventHandler, useCallback, useRef, useState } from 'react'
import { LoadingButton, type LoadingButtonProps } from '@mui/lab'
import { useMounted } from '../../../hooks/useMounted'
import { CircularCountdown } from '../CircularCountdown'

interface ConfirmableButtonProps extends Omit<LoadingButtonProps, 'onClick'> {
  onConfirm: MouseEventHandler<HTMLButtonElement>
  duration?: number
}

export const ConfirmableButton = forwardRef<HTMLButtonElement, ConfirmableButtonProps>(
  ({ children, onConfirm, duration = 5_000, ...buttonProps }, forwardedRef) => {
    const targetRef = useRef<HTMLButtonElement>(null)
    const ref = forwardedRef ?? targetRef

    const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

    const mounted = useMounted()

    const [awaitConfirmation, setAwaitConfirmation] = useState(false)
    const [start, setStart] = useState(Date.now())
    const [now, setNow] = useState(start)
    const [minWidth, setMinWidth] = useState(0)

    const handleClick = useCallback<MouseEventHandler<HTMLButtonElement>>(
      (event) => {
        if (awaitConfirmation) {
          if (timeoutRef.current) {
            clearTimeout(timeoutRef.current)
            timeoutRef.current = null
          }
          setAwaitConfirmation(false)
          onConfirm(event)
        } else {
          setAwaitConfirmation(true)
          const start = Date.now()
          setStart(start)
          setNow(start)
          if (typeof ref !== 'function' && ref.current) {
            setMinWidth(ref.current?.getBoundingClientRect().width)
          }
          const tick = () => {
            if (!mounted.current) {
              return
            }

            const now = Date.now()
            if (now - start >= duration) {
              setAwaitConfirmation(false)
              setMinWidth(0)
              timeoutRef.current = null
              return
            }

            setNow(now)
            timeoutRef.current = setTimeout(tick, 1000)
          }
          timeoutRef.current = setTimeout(tick, 1000)
        }
      },
      [awaitConfirmation, mounted, onConfirm, ref, duration],
    )

    const progress = Math.min(
      1,
      Math.max(0, 1 - (Math.ceil((now - start) / 1000 - 1) * 1000) / Math.max(1, duration - 1000)),
    )

    return (
      <LoadingButton
        ref={ref}
        {...buttonProps}
        sx={{ minWidth: awaitConfirmation ? minWidth : undefined, ...(buttonProps.sx ?? {}) }}
        onClick={handleClick}
        endIcon={
          awaitConfirmation ? (
            <CircularCountdown
              progress={progress}
              label={Math.max(0, Math.round((duration - (now - start)) / 1000))}
            />
          ) : (
            buttonProps.endIcon
          )
        }
      >
        {awaitConfirmation ? 'Confirm' : children}
      </LoadingButton>
    )
  },
)
