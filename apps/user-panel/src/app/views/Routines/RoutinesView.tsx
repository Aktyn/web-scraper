import { Stack } from '@mui/material'
import { ViewTransition } from '../../components/animation/ViewTransition'
import type { ViewComponentProps } from '../helpers'

const RoutinesView = ({ doNotRender }: ViewComponentProps) => {
  if (doNotRender) {
    return null
  }

  return (
    <ViewTransition>
      <Stack
        direction="row"
        flexWrap="wrap"
        justifyContent="flex-start"
        maxHeight="100%"
        overflow="auto"
        p={4}
      >
        TODO: Create, delete, modify, or test routines, and select existing data sources or create
        new ones.
        <br />
        Routine will contain information about how data should be retrieved from data source which
        is related to how many times routine will execute (eg.: running routine sequentially for
        each item in data source).
        <br />
        Data source will be attached to routine when it is running.
        <br />
        Routine will expose method for currently performing action step which requires external data
        in some cases (eg.: fill input action step).
        <br />
        This method will return data from data source according to current state of routine
        execution which will be monitored.
      </Stack>
    </ViewTransition>
  )
}
export default RoutinesView
