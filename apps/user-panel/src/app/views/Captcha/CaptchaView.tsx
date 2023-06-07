import { Stack } from '@mui/material'
import { ViewTransition } from '../../components/animation/ViewTransition'
import type { ViewComponentProps } from '../helpers'

const CaptchaView = ({ doNotRender }: ViewComponentProps) => {
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
        TODO - manage the queue of captchas that need to be solved manually
      </Stack>
    </ViewTransition>
  )
}
export default CaptchaView
