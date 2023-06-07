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
        TODO - create, delete, modify, or test routines, and select existing data sources or create
        new ones
      </Stack>
    </ViewTransition>
  )
}
export default RoutinesView
