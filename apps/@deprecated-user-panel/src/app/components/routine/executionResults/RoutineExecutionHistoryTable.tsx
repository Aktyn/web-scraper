import { useCallback } from 'react'
import { Box, Divider, Paper, Stack, Typography } from '@mui/material'
import {
  hasProcedureExecutionFailed,
  type ProcedureExecutionResult,
  type Routine,
  type RoutineExecutionHistory,
} from '@web-scraper/common'
import { RoutineExecutionResultDetails } from './RoutineExecutionResultDetails'
import { ResultChip } from '../../common/chip/ResultChip'
import { TermChipLabel } from '../../common/chip/TermChip'
import { Table, useTableColumns } from '../../table'

export const RoutineExecutionHistoryTable = ({ routine }: { routine?: Routine }) => {
  const routineId = routine?.id

  const dataFetcher = useCallback<typeof window.electronAPI.getRoutineExecutionHistory>(
    (request) => {
      return window.electronAPI.getRoutineExecutionHistory({
        ...request,
        filters:
          typeof request.filters === 'string' || !routineId
            ? request.filters
            : [...(request.filters ?? []), { routineId }],
      })
    },
    [routineId],
  )

  const columns = useTableColumns<RoutineExecutionHistory[number]>(
    {
      definitions: [
        {
          id: 'id',
          header: 'ID',
          accessor: 'id',
        },
        ...(routineId
          ? []
          : ([{ id: 'routineName', header: 'Routine', accessor: 'routineName' }] as const)),
        {
          id: 'createdAt',
          header: 'Created',
          accessor: 'createdAt',
          cellSx: { whiteSpace: 'nowrap' },
        },
        {
          id: 'iterationIndex',
          header: 'Iteration',
          accessor: 'iterationIndex',
        },
        {
          id: 'results',
          header: 'Results',
          accessor: (row) => (
            <Stack direction="row" alignItems="center" columnGap="0.5rem">
              {row.results.proceduresExecutionResults.map((procedureExecutionResult, index) => (
                <ProcedureExecutionResultCompact
                  key={`${procedureExecutionResult.procedure.id}-${index}`}
                  result={procedureExecutionResult}
                />
              ))}
            </Stack>
          ),
          cellSx: { py: '0.5rem' },
        },
      ],
    },
    [],
  )

  const handleRowExpand = useCallback(
    (row: RoutineExecutionHistory[number]) => (
      <RoutineExecutionResultDetails result={row.results} iterationIndex={row.iterationIndex} />
    ),
    [],
  )

  // TODO: allow clearing history and deleting individual results
  return (
    <Table
      name={`routine-execution-history-${routine?.id ?? 'all'}`}
      columns={columns}
      keyProperty="id"
      data={dataFetcher}
      onRowExpand={handleRowExpand}
      expandOnRowClick
      expandButtonTooltip="Open execution details"
    />
  )
}

const ProcedureExecutionResultCompact = ({ result }: { result: ProcedureExecutionResult }) => {
  return (
    <Paper
      variant="outlined"
      sx={{ px: '0.5rem', display: 'flex', alignItems: 'center', columnGap: '0.5rem' }}
    >
      <Stack alignItems="flex-start" gap="0.25rem" py="0.5rem">
        <Typography variant="caption" color="text.secondary">
          <TermChipLabel term="procedure" />
        </Typography>
        <Typography variant="body2" whiteSpace="nowrap">
          {result.procedure.name}
        </Typography>
      </Stack>
      <Divider orientation="vertical" flexItem />
      <Box py="0.5rem">
        <ResultChip
          size="small"
          type={hasProcedureExecutionFailed(result) ? 'failure' : 'success'}
        />
      </Box>
    </Paper>
  )
}
