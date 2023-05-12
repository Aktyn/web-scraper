import type { ReactNode } from 'react'
import { Fragment } from 'react'
import { Divider, dividerClasses, Stack, Typography } from '@mui/material'
import { TransitionType, ViewTransition } from '../../components/animation/ViewTransition'

interface InfoContentBaseProps {
  sections: readonly { title: string; content: ReactNode }[]
}

export const InfoContentBase = ({ sections }: InfoContentBaseProps) => {
  return (
    <ViewTransition targets={(element) => element.querySelectorAll('.info-section')}>
      <ViewTransition
        targets={(element) => element.querySelectorAll(`.${dividerClasses.root}`)}
        type={TransitionType.SCALE_X}
      >
        <Stack alignItems="stretch" p={0} spacing={0} overflow="hidden" minHeight="100%">
          {sections.map((section, index) => (
            <Fragment key={section.title}>
              {index > 0 && <Divider />}
              <Stack className="info-section" alignItems="flex-start" p={2} spacing={0}>
                <Typography variant="h6" color="text.secondary">
                  {section.title}
                </Typography>
                <Typography component="div" variant="body1" whiteSpace="pre-wrap">
                  {section.content}
                </Typography>
              </Stack>
            </Fragment>
          ))}
        </Stack>
      </ViewTransition>
    </ViewTransition>
  )
}
