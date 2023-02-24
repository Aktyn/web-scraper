import type { Theme } from '@mui/material'
import { Config } from '../config'

function viewTransitionFactory(props: string | string[]) {
  return (theme: Theme) =>
    theme.transitions.create(props, {
      duration: Config.VIEW_TRANSITION_DURATION / 2,
    })
}

export const commonLayoutTransitions = {
  color: viewTransitionFactory('color'),
  fill: viewTransitionFactory('fill'),
  opacity: viewTransitionFactory('opacity'),
  backgroundColor: viewTransitionFactory('background-color'),
}
