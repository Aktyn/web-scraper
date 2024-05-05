import { Stack } from '@mui/material'
import { DashboardPanelHeaderOptions } from './DashboardPanelHeaderOptions'
import { ExecutionsMonitoring } from './ExecutionsMonitoring'
import { ViewTransition } from '../../components/animation/ViewTransition'
import type { ViewComponentProps } from '../helpers'

const DashboardView = ({ doNotRender }: ViewComponentProps) => {
  if (doNotRender) {
    return null
  }

  return (
    <ViewTransition>
      <Stack
        flexGrow={1}
        p="1rem"
        gap="1rem"
        sx={{
          overflowY: 'auto',
          overflowX: 'hidden',
          '& > *': {
            flexShrink: 0,
          },
        }}
      >
        <DashboardPanelHeaderOptions />
        <ExecutionsMonitoring />
      </Stack>
    </ViewTransition>
  )
}
export default DashboardView
