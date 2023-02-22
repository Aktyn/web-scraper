import { CircularProgress, Stack } from '@mui/material'

export const FullViewLoader = () => {
  return (
    <Stack flexGrow={1} height="100%" alignItems="center" justifyContent="center">
      <CircularProgress color="primary" size="2rem" />
    </Stack>
  )
}
