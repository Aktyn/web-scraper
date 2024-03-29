import { useMemo } from 'react'
import { ExpandMoreRounded } from '@mui/icons-material'
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Chip,
  LinearProgress,
  Stack,
  Typography,
  alpha,
} from '@mui/material'
import {
  hasProcedureExecutionFailed,
  isMapSiteError,
  type MapSiteError,
  type ProcedureExecutionResult,
  type RoutineExecutionResult,
} from '@web-scraper/common'
import { FlowExecutionResultDetails } from './FlowExecutionResultDetails'
import { useProceduresGroupedBySite } from '../../../hooks/useProceduresGroupedBySite'
import { actionStepErrorTypeNames } from '../../../utils/dictionaries'
import { type TermKey } from '../../../utils/terms'
import { HorizontallyScrollableContainer } from '../../common/HorizontallyScrollableContainer'
import { UrlButton } from '../../common/button/UrlButton'
import { ResultChip } from '../../common/chip/ResultChip'
import { TermChip } from '../../common/chip/TermChip'

interface ProcedureExecutionResultDetailsProps {
  result: ProcedureExecutionResult
  source: RoutineExecutionResult['source']
}

export const ProcedureExecutionResultDetails = ({
  result,
  source,
}: ProcedureExecutionResultDetailsProps) => {
  const { groupedSiteProcedures } = useProceduresGroupedBySite()

  const site = useMemo(() => {
    const group = groupedSiteProcedures.find((group) =>
      group.procedures.some(({ id }) => id === result.procedure.id),
    )
    return group?.site
  }, [groupedSiteProcedures, result.procedure.id])

  return (
    <Accordion
      defaultExpanded
      disableGutters
      slotProps={{
        transition: { unmountOnExit: true },
      }}
      sx={{ width: '100%', maxWidth: '100%', overflow: 'hidden' }}
    >
      <AccordionSummary expandIcon={<ExpandMoreRounded />}>
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
          columnGap="1rem"
          width="100%"
          pr="1rem"
        >
          <Stack alignItems="flex-start">
            <Typography
              variant="body1"
              fontWeight="bold"
              whiteSpace="nowrap"
              textOverflow="ellipsis"
              overflow="hidden"
            >
              {result.procedure.name}
            </Typography>
            {site ? (
              <UrlButton variant="caption" color="text.secondary">
                {site.url}
              </UrlButton>
            ) : (
              <LinearProgress />
            )}
          </Stack>
          <Stack direction="row" alignItems="center" gap="0.5rem">
            <TermChip term="procedure" />
            <ResultChip
              size="small"
              type={hasProcedureExecutionFailed(result) ? 'failure' : 'success'}
            />
          </Stack>
        </Stack>
      </AccordionSummary>
      <AccordionDetails
        sx={{
          px: '1rem',
          pb: '1rem',
          display: 'grid',
          gridTemplateColumns: '100%',
          justifyContent: 'center',
        }}
      >
        <HorizontallyScrollableContainer
          alignItems="center"
          justifyContent="flex-start"
          px="1rem"
          mx="-1rem"
          pb="1rem"
          mb="-1rem"
        >
          {isMapSiteError(result.flowExecutionResult) ? (
            <MapSiteErrorBlock term="flowStep" mapSiteError={result.flowExecutionResult} />
          ) : (
            <FlowExecutionResultDetails
              result={result.flowExecutionResult}
              source={source}
              site={site}
            />
          )}
        </HorizontallyScrollableContainer>
      </AccordionDetails>
    </Accordion>
  )
}

interface MapSiteErrorBlockProps {
  mapSiteError: MapSiteError
  term: TermKey
}

const MapSiteErrorBlock = ({ mapSiteError, term }: MapSiteErrorBlockProps) => {
  return (
    <Stack
      alignItems="flex-start"
      rowGap="0.5rem"
      sx={{
        color: (theme) => theme.palette.error.light,
        backgroundColor: (theme) => alpha(theme.palette.error.main, 0.1),
        border: (theme) => `1px solid ${theme.palette.error.main}`,
        borderRadius: '0.5rem',
        p: '0.5rem',
      }}
    >
      <Stack direction="row" alignItems="center" gap="0.5rem">
        <TermChip term={term} color="error" />
        <Chip label="Map site error" variant="outlined" size="small" color="error" />
      </Stack>
      <Stack>
        <Typography variant="body1" fontWeight="bold" color="inherit">
          {actionStepErrorTypeNames[mapSiteError.errorType]}
        </Typography>
        {mapSiteError.content && (
          <Typography variant="body2" color="inherit">
            {mapSiteError.content}
          </Typography>
        )}
      </Stack>
    </Stack>
  )
}
