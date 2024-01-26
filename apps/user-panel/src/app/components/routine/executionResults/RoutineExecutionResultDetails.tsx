import { useMemo } from 'react'
import { Box, Divider, Stack, Typography } from '@mui/material'
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
  return (
    <Stack py="1rem" gap="1rem">
      <HorizontallyScrollableContainer px="1rem" alignItems="center">
        <Typography variant="h5" whiteSpace="nowrap" fontWeight="bold">
          {result.routine.name}
        </Typography>
      </HorizontallyScrollableContainer>
      <Divider />
      <Stack direction="row" alignItems="center" gap="1rem" px="1rem">
        <Typography variant="body1">
          Execution plan:{' '}
          <strong>{routineExecutionTypeNames[result.routine.executionPlan.type]}</strong>
        </Typography>
        <Divider orientation="vertical" flexItem />
        <Typography variant="body1" whiteSpace="nowrap">
          Iteration: <strong>{iterationIndex}</strong>
        </Typography>
      </Stack>
      <Divider />
      {result.source && (
        <>
          <RoutineExecutionResultSource source={result.source} />
          <Divider />
        </>
      )}
      <Stack gap="0.5rem">
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

interface RoutineExecutionResultSourceProps {
  source: NonNullable<RoutineExecutionResult['source']>
}

const RoutineExecutionResultSource = ({ source }: RoutineExecutionResultSourceProps) => {
  const columns = useDataSourceTableColumns(source.dataSource.columns)
  const data = useMemo(() => [source.item], [source.item])

  return (
    <Box width="100%" my="-1rem">
      <Table columns={columns} keyProperty="id" hideRefreshButton data={data} />
    </Box>
  )
}
