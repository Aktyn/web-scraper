import { Fragment, useCallback, useEffect, useRef, useState } from 'react'
import { EastRounded, ExpandMoreRounded, HistoryRounded, PreviewRounded } from '@mui/icons-material'
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Button,
  CircularProgress,
  IconButton,
  Stack,
  Tooltip,
  Typography,
  alpha,
  useTheme,
} from '@mui/material'
import { RoutineExecutionType, upsertRoutineSchema, type Routine } from '@web-scraper/common'
import { AnimatedBorder } from 'src/app/components/common/effect/AnimatedBorder'
import { RoutineExecutionMonitor } from './RoutineExecutionMonitor'
import { RoutinePanelHeaderOptions } from './RoutinePanelHeaderOptions'
import { ViewTransition } from '../../components/animation/ViewTransition'
import { CustomDrawer, type CustomDrawerRef } from '../../components/common/CustomDrawer'
import { CustomPopover, type CustomPopoverRef } from '../../components/common/CustomPopover'
import { HorizontallyScrollableContainer } from '../../components/common/HorizontallyScrollableContainer'
import { ProcedureWidget } from '../../components/procedure/ProcedureWidget'
import { ExecutionPlanRowsPreview } from '../../components/routine/ExecutionPlanRowsPreview'
import { ExecutionPlanText } from '../../components/routine/ExecutionPlanText'
import { RoutineExecutionHistoryTable } from '../../components/routine/executionResults/RoutineExecutionHistoryTable'
import { BooleanValue } from '../../components/table/BooleanValue'
import { useActiveRoutineExecution } from '../../hooks/useActiveRoutineExecution'
import { useApiRequest } from '../../hooks/useApiRequest'
import { useProceduresGroupedBySite } from '../../hooks/useProceduresGroupedBySite'
import { routineExecutionTypeNames } from '../../utils/dictionaries'

interface RoutinePanelProps {
  routineInfo: Pick<Routine, 'name' | 'id'>
  onDeleted?: (routineId: Routine['id']) => void
  onNameChanged?: () => void
}

export const RoutinePanel = ({ routineInfo, onDeleted, onNameChanged }: RoutinePanelProps) => {
  const theme = useTheme()
  const executionPlanRowsPreviewPopoverRef = useRef<CustomPopoverRef>(null)
  const executionHistoryDrawerRef = useRef<CustomDrawerRef>(null)
  const { submit: getRoutineRequest } = useApiRequest(window.electronAPI.getRoutine)

  const { groupedSiteProcedures } = useProceduresGroupedBySite(true)

  const [routine, setRoutine] = useState<Routine | null>(null)
  const [loadingRoutine, setLoadingRoutine] = useState(true)

  const { scraperExecution, scraperExecutionTree, executing } = useActiveRoutineExecution(routine)

  const loadRoutine = useCallback(() => {
    getRoutineRequest(
      {
        onSuccess: setRoutine,
        onEnd: () => setLoadingRoutine(false),
      },
      routineInfo.id,
    )
  }, [getRoutineRequest, routineInfo.id])

  useEffect(() => {
    loadRoutine()
  }, [loadRoutine])

  const handleEdited = useCallback(
    (updatedRoutine: Routine) => {
      if (routine?.name !== updatedRoutine.name) {
        onNameChanged?.()
      }
      loadRoutine()
    },
    [loadRoutine, onNameChanged, routine?.name],
  )

  return (
    <ViewTransition targets={(element) => element.querySelectorAll(`& > *`)}>
      <Stack
        p="1rem"
        gap="1rem"
        height="100%"
        sx={{
          overflowY: 'auto',
          overflowX: 'hidden',
          '& > *': {
            flexShrink: 0,
          },
        }}
      >
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="flex-start"
          flexWrap="wrap"
          gap="1rem"
          m="-1rem"
          p="1rem"
          mb={0}
          sx={{
            backgroundColor: (theme) => alpha(theme.palette.background.default, 0.5),
            borderBottom: (theme) => `1px solid ${theme.palette.divider}`,
            backdropFilter: 'blur(4px)',
            position: 'sticky',
            top: '-1rem',
            zIndex: 1,
          }}
        >
          <Stack maxWidth="100%" overflow="hidden">
            <HorizontallyScrollableContainer>
              <Typography variant="h4" whiteSpace="nowrap">
                {routine?.name ?? routineInfo.name}
              </Typography>
            </HorizontallyScrollableContainer>
            {routine && (
              <>
                <HorizontallyScrollableContainer>
                  <Typography variant="h6" whiteSpace="nowrap" color="text.secondary">
                    {routine.description ?? '-'}
                  </Typography>
                </HorizontallyScrollableContainer>
                <Tooltip title="Stops execution of next procedure and routine iteration if a procedure finishes with an error">
                  <Typography variant="body1">
                    Stop on error:&nbsp;
                    <BooleanValue
                      component="span"
                      value={
                        routine.stopOnError ?? upsertRoutineSchema.getDefault().stopOnError ?? false
                      }
                      sx={{ display: 'inline-flex', verticalAlign: 'bottom' }}
                    />
                  </Typography>
                </Tooltip>
              </>
            )}
          </Stack>
          <Stack gap="1rem" alignItems="flex-end">
            <RoutinePanelHeaderOptions
              routine={routine}
              loading={loadingRoutine}
              onEdited={handleEdited}
              onDeleted={onDeleted}
              active={executing}
            />
            <Button
              size="large"
              endIcon={<HistoryRounded />}
              onClick={() => {
                if (routine) {
                  executionHistoryDrawerRef.current?.open()
                }
              }}
            >
              Show execution history
            </Button>
            <CustomDrawer
              ref={executionHistoryDrawerRef}
              title={
                <Stack direction="row" alignItems="center" gap="0.5rem">
                  <Box>Routine execution history</Box>
                  <Box color="text.primary">{routine?.name}</Box>
                </Stack>
              }
              anchor="bottom"
            >
              {routine && <RoutineExecutionHistoryTable routine={routine} />}
            </CustomDrawer>
          </Stack>
        </Stack>
        {routine && (
          <>
            <Accordion
              defaultExpanded
              disableGutters
              elevation={2}
              slotProps={{ transition: { unmountOnExit: true } }}
              sx={{ borderRadius: '1rem !important' }}
            >
              <AccordionSummary expandIcon={<ExpandMoreRounded />}>
                <Stack direction="row" alignItems="center" gap="0.5rem">
                  <Typography variant="body1">
                    Execution plan:{' '}
                    <strong>{routineExecutionTypeNames[routine.executionPlan.type]}</strong>
                  </Typography>
                  {routine.executionPlan.type !== RoutineExecutionType.STANDALONE && (
                    <Tooltip title="Preview rows">
                      <IconButton
                        size="small"
                        onClick={(event) => {
                          executionPlanRowsPreviewPopoverRef.current?.open(event.currentTarget)
                          event.stopPropagation()
                        }}
                      >
                        <PreviewRounded fontSize="inherit" />
                      </IconButton>
                    </Tooltip>
                  )}
                </Stack>
              </AccordionSummary>
              <AccordionDetails>
                <Typography variant="body1">
                  <ExecutionPlanText executionPlan={routine.executionPlan} />
                </Typography>
              </AccordionDetails>
            </Accordion>
            <HorizontallyScrollableContainer
              allowVerticalScroll
              alignItems="flex-start"
              gap="0.5rem"
              py="0.5rem"
              my="-0.5rem"
              px="1rem"
              mx="-1rem"
              color="text.secondary"
            >
              {routine.procedures.map((procedure, index) => (
                <Fragment key={procedure.id}>
                  {index > 0 && (
                    <EastRounded color="inherit" sx={{ alignSelf: 'flex-start', mt: '1rem' }} />
                  )}
                  <AnimatedBorder
                    active={
                      !!scraperExecution?.some(
                        (executionEntry) =>
                          executionEntry.start.scope === 'procedure' &&
                          executionEntry.start.procedure.id === procedure.id &&
                          !executionEntry.finish,
                      )
                    }
                    borderRadius="1rem"
                    animationDuration={800}
                    offset={-1}
                    rectProps={{
                      strokeWidth: 2,
                      strokeDasharray: [12, 9],
                      stroke: theme.palette.secondary.main,
                    }}
                  >
                    <ProcedureWidget
                      key={procedure.id}
                      procedure={procedure}
                      groupedSiteProcedures={groupedSiteProcedures}
                    />
                  </AnimatedBorder>
                </Fragment>
              ))}
            </HorizontallyScrollableContainer>
            {scraperExecutionTree && (
              <RoutineExecutionMonitor
                scraperExecutionTree={scraperExecutionTree}
                executing={executing}
                maxWidth="100%"
                mt="auto"
                mb="-1rem"
              />
            )}
            <CustomPopover
              ref={executionPlanRowsPreviewPopoverRef}
              TransitionProps={{ unmountOnExit: true }}
              anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'center',
              }}
              transformOrigin={{
                vertical: 'top',
                horizontal: 'center',
              }}
              slotProps={{
                paper: { sx: { display: 'flex' } },
              }}
            >
              {routine.executionPlan.type === RoutineExecutionType.STANDALONE ? (
                <Typography variant="body1">
                  There is no data source input for this routine execution type
                </Typography>
              ) : (
                <ExecutionPlanRowsPreview executionPlan={routine.executionPlan} />
              )}
            </CustomPopover>
          </>
        )}
        {loadingRoutine && (
          <CircularProgress color="primary" size="2rem" sx={{ mx: 'auto', my: '1rem' }} />
        )}
      </Stack>
    </ViewTransition>
  )
}
