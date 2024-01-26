import { Fragment } from 'react'
import { EastRounded } from '@mui/icons-material'
import { Box, Divider, Paper, Stack, Typography, alpha } from '@mui/material'
import { common } from '@mui/material/colors'
import {
  ActionStepErrorType,
  type ActionExecutionResult,
  type RoutineExecutionResult,
} from '@web-scraper/common'
import { ActionStepData } from './ActionStepData'
import { actionStepErrorTypeNames, actionStepTypeNames } from '../../../utils/dictionaries'
import { HorizontallyScrollableContainer } from '../../common/HorizontallyScrollableContainer'
import { UrlButton } from '../../common/button/UrlButton'
import { TermChip } from '../../common/chip/TermChip'
import { BooleanValue } from '../../table/BooleanValue'

interface ActionExecutionResultDetailsProps {
  result: ActionExecutionResult
  source: RoutineExecutionResult['source']
}

export const ActionExecutionResultDetails = ({
  result,
  source,
}: ActionExecutionResultDetailsProps) => {
  result.action.url
  return (
    <Stack py="0.5rem" gap="0.5rem" bgcolor={alpha(common.white, 0.025)}>
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        gap="0.5rem"
        px="0.5rem"
        fontSize="small"
        color="text.secondary"
      >
        <TermChip term="action" />
        <Typography variant="body2" color="text.primary" fontWeight="bold" mr="auto">
          {result.action.name}
        </Typography>
        {result.action.url && (
          // TODO: move parseScrapperStringValue to @common and use it here
          <>
            <Typography variant="caption" color="text.secondary" ml="auto">
              URL:
            </Typography>
            <UrlButton variant="caption" color="text.primary" readOnly>
              {result.action.url}
            </UrlButton>
          </>
        )}
      </Stack>
      <Divider />
      <Stack
        direction="row"
        alignItems="stretch"
        color="text.secondary"
        columnGap="0.25rem"
        px="0.5rem"
      >
        {result.actionStepsResults.map((actionStepResult, index) => (
          <Fragment key={index}>
            {index > 0 && <EastRounded color="inherit" sx={{ alignSelf: 'center' }} />}
            <ActionStepResultDetails result={actionStepResult} source={source} />
          </Fragment>
        ))}
      </Stack>
    </Stack>
  )
}

interface ActionStepResultDetailsProps {
  result: ActionExecutionResult['actionStepsResults'][number]
  source: RoutineExecutionResult['source']
}

const ActionStepResultDetails = ({ result, source }: ActionStepResultDetailsProps) => {
  const failed = result.result.errorType !== ActionStepErrorType.NO_ERROR

  return (
    <Paper
      variant="outlined"
      sx={{
        borderRadius: '0.5rem',
        backgroundColor: (theme) =>
          failed ? alpha(theme.palette.error.main, 0.1) : alpha(common.white, 0.025),
        overflow: 'visible',
        borderColor: failed ? 'error.main' : undefined,
      }}
    >
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: '1fr auto 1fr',
          justifyContent: 'space-between',
          alignItems: 'center',
          columnGap: '0.5rem',
          px: '0.5rem',
        }}
      >
        <Box />
        <Typography
          variant="body1"
          fontWeight="bold"
          textAlign="center"
          whiteSpace="nowrap"
          px="0.5rem"
          py="0.25rem"
        >
          {actionStepTypeNames[result.step.type]}
          {/* TODO: just a <BooleanValue /> indicating success or failure */}
        </Typography>
        <BooleanValue value={!failed} sx={{ justifySelf: 'flex-end' }} />
      </Box>
      <Divider />
      <HorizontallyScrollableContainer
        justifyContent="stretch"
        px="0.5rem"
        py="0.25rem"
        maxWidth="24rem"
        sx={{
          '& p': {
            whiteSpace: 'nowrap',
          },
        }}
      >
        <ActionStepData step={result.step} source={source} />
      </HorizontallyScrollableContainer>
      {failed && (
        <>
          <Divider />
          <Stack px="0.5rem">
            <Typography
              variant="body2"
              color="error"
              fontWeight="bold"
              textAlign="center"
              whiteSpace="nowrap"
            >
              {actionStepErrorTypeNames[result.result.errorType]}
            </Typography>
            {result.result.content && (
              <Typography variant="body2" color="error" textAlign="center" whiteSpace="nowrap">
                {result.result.content}
              </Typography>
            )}
          </Stack>
        </>
      )}
    </Paper>
  )
}
