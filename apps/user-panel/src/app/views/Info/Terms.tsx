import { Fragment } from 'react'
import { Divider, dividerClasses, Stack, Typography } from '@mui/material'
import { TransitionType, ViewTransition } from '../../components/animation/ViewTransition'

export const Terms = () => {
  return (
    <ViewTransition targets={(element) => element.querySelectorAll('.info-section')}>
      <ViewTransition
        targets={(element) => element.querySelectorAll(`.${dividerClasses.root}`)}
        type={TransitionType.SCALE_X}
      >
        <Stack alignItems="stretch" p={0} spacing={0} overflow="hidden">
          {termsDescriptions.map((info, index) => (
            <Fragment key={info.title}>
              {index > 0 && <Divider />}
              <Stack className="info-section" alignItems="flex-start" p={2} spacing={0}>
                <Typography variant="h6" color="text.secondary">
                  {info.title}
                </Typography>
                <Typography variant="body1" whiteSpace="pre-wrap">
                  {info.description}
                </Typography>
              </Stack>
            </Fragment>
          ))}
        </Stack>
      </ViewTransition>
    </ViewTransition>
  )
}

const termsDescriptions = [
  {
    title: 'Chore',
    description:
      'Scheduled routines. Allows you to run a routine repeatedly at any specified time interval.\nThe chore can be repeated indefinitely or until a specified condition is met.',
  },
  {
    title: 'Routine',
    description:
      //TODO: specify data source types
      'Sequence of procedures to be performed with given data (optional) for a single site.\nData source can be defined in several ways.\nRoutine can be run manually a selected number of times or for each element in the data source.',
  },
  // TODO: add multi site routine description or remove this comment from code
  // {
  //   title: 'Multi site routine',
  //   description: 'Routine running on multiple sites with sequence of procedures defined by its type',
  // },
  {
    title: 'Site instructions',
    description: 'A set of procedures and actions that are created for a specific site.',
  },
  {
    title: 'Procedure',
    description:
      'A procedure starts at a given URL and executes a flow of actions that leads to the fulfillment of a desired goal, such as finding information about a new promotion at a nearby restaurant.',
  },
  {
    title: 'Flow step',
    description:
      "Part of a procedure that is used for flow control.\nIt calls an action by name and, depending on the result of that action, executes the next step in the procedure's flow.\nFinally, the last step in the flow returns some retrieved data from the page.",
  },
  {
    title: 'Action',
    description:
      'A named list of action steps that are performed on the site at a given URL.\nAn action step is a basic website operation, such as filling in a text field, pressing a button, reading and returning text from an element, etc.',
  },
]
