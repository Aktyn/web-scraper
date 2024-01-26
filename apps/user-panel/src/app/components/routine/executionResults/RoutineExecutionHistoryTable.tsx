import { useCallback, useRef, useState } from 'react'
import { MoreRounded } from '@mui/icons-material'
import { Box, Divider, Paper, Stack, Typography } from '@mui/material'
import {
  hasProcedureExecutionFailed,
  type ProcedureExecutionResult,
  type Routine,
  type RoutineExecutionHistory,
  type RoutineExecutionResult,
} from '@web-scraper/common'
import { RoutineExecutionResultDetails } from './RoutineExecutionResultDetails'
import { CustomPopover, type CustomPopoverRef } from '../../common/CustomPopover'
import { ToggleIconButton } from '../../common/button/ToggleIconButton'
import { ResultChip } from '../../common/chip/ResultChip'
import { TermChipLabel } from '../../common/chip/TermChip'
import { Table, useTableColumns } from '../../table'

export const RoutineExecutionHistoryTable = ({ routine }: { routine: Routine }) => {
  const dataFetcher = useCallback<typeof window.electronAPI.getRoutineExecutionHistory>(
    (request) => {
      return window.electronAPI.getRoutineExecutionHistory({
        ...request,
        filters:
          typeof request.filters === 'string'
            ? request.filters
            : [...(request.filters ?? []), { routineId: routine.id }],
      })
    },
    [routine.id],
  )

  const columns = useTableColumns<RoutineExecutionHistory[number]>(
    {
      definitions: [
        {
          id: 'id',
          header: 'ID',
          accessor: 'id',
        },
        {
          id: 'createdAt',
          header: 'Created',
          accessor: 'createdAt',
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
              <OpenExecutionDetailsButton
                result={row.results}
                iterationIndex={row.iterationIndex}
              />
            </Stack>
          ),
          cellSx: { py: '0.5rem' },
        },
      ],
    },
    [],
  )

  return (
    <Table
      name={`routine-execution-history-${routine.id}`}
      columns={columns}
      keyProperty="id"
      data={dataFetcher}
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

interface OpenExecutionDetailsButtonProps {
  result: RoutineExecutionResult
  iterationIndex: number
}

const OpenExecutionDetailsButton = ({
  result,
  iterationIndex,
}: OpenExecutionDetailsButtonProps) => {
  const executionPlanRowsPreviewPopoverRef = useRef<CustomPopoverRef>(null)

  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      <ToggleIconButton
        open={isOpen}
        onToggle={(open, event) => {
          executionPlanRowsPreviewPopoverRef.current?.open(event.currentTarget)
          setIsOpen(open)
        }}
        closedStateIcon={MoreRounded}
        closeTooltip="Open execution details"
        openTooltip="Close execution details"
        boxProps={{ sx: { ml: 'auto' } }}
      />
      <CustomPopover
        ref={executionPlanRowsPreviewPopoverRef}
        onClose={() => setIsOpen(false)}
        TransitionProps={{ unmountOnExit: true }}
        slotProps={{ paper: { sx: { overflow: 'auto' } } }}
        anchorOrigin={{
          vertical: 'top',
          horizontal: 'left',
        }}
        transformOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
      >
        <RoutineExecutionResultDetails result={result} iterationIndex={iterationIndex} />
      </CustomPopover>
    </>
  )
}
