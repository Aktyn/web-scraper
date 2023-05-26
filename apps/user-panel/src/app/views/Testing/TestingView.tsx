import { Stack } from '@mui/material'
import { TestingSessionsList } from './TestingSessionsList'
import { ViewTransition } from '../../components/animation/ViewTransition'
import type { ViewComponentProps } from '../helpers'

const TestingView = ({ doNotRender }: ViewComponentProps) => {
  if (doNotRender) {
    return null
  }

  return (
    <ViewTransition targets={(element) => element.querySelectorAll('.testing-section')}>
      <Stack
        direction="row"
        flexWrap="wrap"
        justifyContent="flex-start"
        maxHeight="100%"
        overflow="auto"
      >
        <TestingSessionsList />
      </Stack>
    </ViewTransition>
  )
}
export default TestingView
