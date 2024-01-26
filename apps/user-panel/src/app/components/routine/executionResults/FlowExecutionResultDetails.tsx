import { Fragment } from 'react'
import { EastRounded, ErrorRounded, LabelRounded } from '@mui/icons-material'
import { Box, Divider, List, ListItem, ListItemIcon, Paper, Stack, Typography } from '@mui/material'
import {
  GLOBAL_ACTION_PREFIX,
  type FlowExecutionResult,
  type GlobalActionType,
  type RoutineExecutionResult,
} from '@web-scraper/common'
import { ActionExecutionResultDetails } from './ActionExecutionResultDetails'
import { globalActionTypeNames } from '../../../utils/dictionaries'
import { ResultChip } from '../../common/chip/ResultChip'
import { TermChipLabel } from '../../common/chip/TermChip'
import { ReadonlyField } from '../../common/input/ReadonlyField'

interface FlowExecutionResultDetailsProps {
  result: FlowExecutionResult
  source: RoutineExecutionResult['source']
}

export const FlowExecutionResultDetails = ({ result, source }: FlowExecutionResultDetailsProps) => {
  return (
    <Stack direction="row" alignItems="stretch" color="text.secondary" columnGap="0.25rem">
      {result.flowStepsResults.map((flowStepResult, index) => (
        <Fragment key={index}>
          {index > 0 && <EastRounded color="inherit" sx={{ alignSelf: 'center' }} />}
          <FlowStepResultDetails result={flowStepResult} source={source} />
        </Fragment>
      ))}
    </Stack>
  )
}

interface FlowStepResultDetailsProps {
  result: FlowExecutionResult['flowStepsResults'][number]
  source: RoutineExecutionResult['source']
}

const FlowStepResultDetails = ({ result, source }: FlowStepResultDetailsProps) => {
  const [prefix, actionName] = result.flowStep.actionName.split('.') ?? ['', '']

  return (
    <Paper
      variant="outlined"
      sx={{
        borderRadius: '0.5rem',
        display: 'flex',
        flexDirection: 'column',
        py: '0.5rem',
        gap: '0.5rem',
        overflow: 'visible',
      }}
    >
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        columnGap="0.5rem"
        px="0.5rem"
        fontSize="small"
        color="text.secondary"
      >
        <TermChipLabel term="flowStep" />
        <ResultChip size="small" type={result.succeeded ? 'success' : 'failure'} />
      </Stack>

      {prefix === GLOBAL_ACTION_PREFIX && (
        <>
          <Divider />
          <Box px="0.5rem">
            <ReadonlyField
              label="Action name"
              value={`Global.${
                prefix === GLOBAL_ACTION_PREFIX
                  ? globalActionTypeNames[actionName as GlobalActionType]
                  : actionName
              }`}
              showBorder
              icon={<LabelRounded />}
            />
          </Box>
        </>
      )}
      {result.actionResult && (
        <>
          <Divider />
          <Box my="-0.5rem">
            <ActionExecutionResultDetails result={result.actionResult} source={source} />
          </Box>
        </>
      )}
      {result.returnedValues.length > 0 && (
        <>
          <Divider />
          <Stack px="0.5rem">
            <Typography variant="body2" fontWeight="bold" color="text.secondary">
              Returned values:
            </Typography>
            <List disablePadding>
              {result.returnedValues.map((returnedValue, index) => (
                <ListItem key={index} disablePadding>
                  <ListItemIcon sx={{ minWidth: '2rem' }}>
                    {typeof returnedValue === 'string' ? (
                      <LabelRounded fontSize="small" />
                    ) : (
                      <ErrorRounded fontSize="small" color="error" />
                    )}
                  </ListItemIcon>
                  {typeof returnedValue === 'string' ? (
                    <Typography variant="body2" color="text.primary">
                      {returnedValue}
                    </Typography>
                  ) : (
                    <Typography variant="body2" color="error">
                      {returnedValue.error}
                    </Typography>
                  )}
                </ListItem>
              ))}
            </List>
          </Stack>
        </>
      )}
    </Paper>
  )
}
