import { useEffect, useMemo, useRef } from 'react'
import { Box, Divider, Stack, Typography, lighten, type BoxProps } from '@mui/material'
import type { RoutineExecutionResult } from '@web-scraper/common'
import { ProcedureExecutionResultDetails } from './ProcedureExecutionResultDetails'
import { useDataSourceTableColumns } from '../../../hooks/useDataSourceTableColumns'
import { routineExecutionTypeNames } from '../../../utils/dictionaries'
import { HorizontallyScrollableContainer } from '../../common/HorizontallyScrollableContainer'
import { Table } from '../../table'

interface RoutineExecutionResultDetailsProps {
  result: RoutineExecutionResult
  iterationIndex: number
}

export const RoutineExecutionResultDetails = ({
  result,
  iterationIndex,
}: RoutineExecutionResultDetailsProps) => {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (containerRef.current) {
        containerRef.current.scrollIntoView({
          behavior: 'smooth',
          block: 'nearest',
        })
      }
    }, 400)

    return () => clearTimeout(timeout)
  }, [])

  return (
    <Stack ref={containerRef}>
      <Stack direction="row" alignItems="center" gap="1rem" px="1rem">
        <Typography variant="body1" whiteSpace="nowrap" py="1rem">
          Execution plan:{' '}
          <strong>{routineExecutionTypeNames[result.routine.executionPlan.type]}</strong>
        </Typography>
        <Divider orientation="vertical" flexItem />
        <Typography variant="body1" whiteSpace="nowrap" py="1rem">
          Iteration: <strong>{iterationIndex}</strong>
        </Typography>
      </Stack>
      {result.source && (
        <Box
          mx="1rem"
          overflow="hidden"
          borderRadius="0.5rem"
          border={(theme) => `1px solid ${lighten(theme.palette.background.paper, 0.2)}`}
        >
          <RoutineExecutionResultSource source={result.source} mb="-1px" />
        </Box>
      )}
      <Stack py="1rem" rowGap="0.5rem">
        {result.proceduresExecutionResults.map((procedureExecutionResult, index) => (
          <HorizontallyScrollableContainer
            key={`${procedureExecutionResult.procedure.id}-${index}`}
            alignItems="center"
            px="1rem"
          >
            <ProcedureExecutionResultDetails
              result={procedureExecutionResult}
              source={result.source}
            />
          </HorizontallyScrollableContainer>
        ))}
      </Stack>
    </Stack>
  )
}

interface RoutineExecutionResultSourceProps extends BoxProps {
  source: NonNullable<RoutineExecutionResult['source']>
}

const RoutineExecutionResultSource = ({
  source,
  ...boxProps
}: RoutineExecutionResultSourceProps) => {
  const columns = useDataSourceTableColumns(source.dataSource.columns)
  const data = useMemo(() => [source.item], [source.item])

  return (
    <Box width="100%" {...boxProps}>
      <Table columns={columns} keyProperty="id" hideRefreshButton data={data} />
    </Box>
  )
}
