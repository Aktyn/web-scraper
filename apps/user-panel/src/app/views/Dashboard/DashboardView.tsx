import { Button, Stack } from '@mui/material'
import { ViewTransition } from '../../components/animation/ViewTransition'
import { useView } from '../../hooks/useView'
import type { ViewComponentProps } from '../helpers'

const DashboardView = ({ doNotRender }: ViewComponentProps) => {
  const view = useView()

  if (doNotRender) {
    return null
  }

  return (
    <Stack alignItems="center" p={4} spacing={4}>
      <ViewTransition>
        <Button
          className="test1"
          variant="contained"
          color="primary"
          onClick={() => view.requestViewChange('DATA_MANAGER')}
        >
          Manage data
        </Button>
      </ViewTransition>
    </Stack>
  )
}
export default DashboardView
