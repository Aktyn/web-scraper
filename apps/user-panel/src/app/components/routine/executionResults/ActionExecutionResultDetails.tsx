import { Fragment } from 'react'
import { EastRounded, ErrorRounded, ExpandMoreRounded } from '@mui/icons-material'
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Divider,
  Paper,
  Stack,
  Typography,
  accordionSummaryClasses,
  alpha,
} from '@mui/material'
import { common } from '@mui/material/colors'
import {
  ActionStepErrorType,
  parseScrapperStringValue,
  type ActionExecutionResult,
  type RoutineExecutionResult,
  type Site,
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
  site?: Site
}

export const ActionExecutionResultDetails = ({
  result,
  source,
  site,
}: ActionExecutionResultDetailsProps) => {
  result.action.url
  return (
    <Accordion
      variant="outlined"
      disableGutters
      slotProps={{
        transition: { unmountOnExit: true },
      }}
      sx={{
        backgroundColor: alpha(common.white, 0.025),
        border: 'none',
        borderRadius: 0,
      }}
    >
      <AccordionSummary
        expandIcon={<ExpandMoreRounded />}
        sx={{
          px: '0.5rem',
          fontSize: 'small',
          [`& > .${accordionSummaryClasses.content}`]: {
            my: 0,
            pr: '0.5rem',
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'flex-start',
            gap: '0.5rem',
            color: 'text.secondary',
            whiteSpace: 'nowrap',
          },
        }}
      >
        <TermChip term="action" />
        <Typography variant="body2" color="text.primary" fontWeight="bold" whiteSpace="nowrap">
          {result.action.name}
        </Typography>
        {result.action.url && (
          <>
            <Divider orientation="vertical" flexItem />
            <Typography variant="caption" color="text.secondary">
              URL:
            </Typography>
            <UrlButton variant="caption" color="text.primary" readOnly>
              {parseScrapperStringValue(result.action.url, { siteURL: site?.url }) || '-'}
            </UrlButton>
          </>
        )}
        <Divider orientation="vertical" flexItem />
        {result.actionStepsResults.length} action steps
      </AccordionSummary>
      <AccordionDetails>
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
      </AccordionDetails>
    </Accordion>
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
        </Typography>
        <BooleanValue value={!failed} falseIcon={ErrorRounded} sx={{ justifySelf: 'flex-end' }} />
      </Box>
      <Divider />
      <HorizontallyScrollableContainer
        justifyContent="stretch"
        px="0.5rem"
        py="0.25rem"
        maxWidth="26rem"
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
