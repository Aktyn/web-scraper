import { forwardRef } from 'react'
import { CircularProgress, IconButton, type IconButtonProps } from '@mui/material'

type LoadingIconButtonProps = IconButtonProps & { loading?: boolean }

export const LoadingIconButton = forwardRef<HTMLButtonElement, LoadingIconButtonProps>(
  ({ loading, disabled, children, ...iconButtonProps }, ref) => {
    return (
      <IconButton ref={ref} disabled={disabled || loading} {...iconButtonProps}>
        {loading ? <CircularProgress color="inherit" size="1.5rem" /> : children}
      </IconButton>
    )
  },
)
