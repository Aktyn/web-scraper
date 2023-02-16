import { Button, Stack } from '@mui/material'
import { ViewTransition } from '../components/animation/ViewTransition'
import { useView } from '../hooks/useView'

const DashboardView = () => {
  const view = useView()

  return (
    <ViewTransition targets={(element) => element.querySelectorAll('button')}>
      <Stack alignItems="center" p={4} spacing={4}>
        <Button
          className="test1"
          variant="contained"
          color="primary"
          onClick={() => view.requestViewChange('DATA_MANAGER')}>
          Manage data
        </Button>
        <Button
          className="test1"
          variant="contained"
          color="primary"
          onClick={() => view.requestViewChange('DATA_MANAGER')}>
          Manage data
        </Button>
        <Button
          className="test1"
          variant="contained"
          color="primary"
          onClick={() => view.requestViewChange('DATA_MANAGER')}>
          Manage data
        </Button>
      </Stack>
    </ViewTransition>
  )
}
export default DashboardView
