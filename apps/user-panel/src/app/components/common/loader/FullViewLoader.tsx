import { forwardRef } from 'react'
import { CircularProgress, Stack } from '@mui/material'

export const FullViewLoader = forwardRef<HTMLDivElement>((_, forwardedRef) => {
  return (
    <Stack
      ref={forwardedRef}
      flexGrow={1}
      height="100%"
      alignItems="center"
      justifyContent="center"
    >
      <CircularProgress color="primary" size="2rem" />
    </Stack>
  )
})
