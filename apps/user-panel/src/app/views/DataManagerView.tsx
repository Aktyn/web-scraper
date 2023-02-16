import { Button, Stack, Typography } from '@mui/material'
import { ViewTransition } from '../components/animation/ViewTransition'
import { useView } from '../hooks/useView'

export const DataManagerView = () => {
  const view = useView()

  return (
    <Stack alignItems="center" p={4} spacing={4}>
      <ViewTransition targets={(element) => element}>
        <Button
          variant="contained"
          color="primary"
          onClick={() => view.requestViewChange('DASHBOARD')}>
          Return to dashboard
        </Button>
      </ViewTransition>
      <Typography variant="body1">TODO</Typography>
    </Stack>
  )
}
export default DataManagerView
