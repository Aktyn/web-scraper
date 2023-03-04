import { Button, Stack } from '@mui/material'
import { ViewTransition } from '../../components/animation/ViewTransition'
import type { ViewComponentProps } from '../helpers'

const DashboardView = ({ doNotRender }: ViewComponentProps) => {
  if (doNotRender) {
    return null
  }

  return (
    <Stack alignItems="center" p={4} spacing={4}>
      <ViewTransition>
        <Button variant="contained" color="primary">
          NOOP
        </Button>
      </ViewTransition>
    </Stack>
  )
}
export default DashboardView
