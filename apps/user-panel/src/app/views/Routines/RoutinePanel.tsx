import { Fragment, useCallback, useEffect, useRef, useState } from 'react'
import { EastRounded, ExpandMoreRounded, PreviewRounded } from '@mui/icons-material'
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  CircularProgress,
  IconButton,
  Stack,
  Tooltip,
  Typography,
  alpha,
} from '@mui/material'
import { RoutineExecutionType, upsertRoutineSchema, type Routine } from '@web-scraper/common'
import { ViewTransition } from 'src/app/components/animation/ViewTransition'
import { ProcedureWidget } from 'src/app/components/procedure/ProcedureWidget'
import { RoutinePanelHeaderOptions } from './RoutinePanelHeaderOptions'
import { CustomPopover, type CustomPopoverRef } from '../../components/common/CustomPopover'
import { HorizontallyScrollableContainer } from '../../components/common/HorizontallyScrollableContainer'
import { ExecutionPlanRowsPreview } from '../../components/routine/ExecutionPlanRowsPreview'
import { ExecutionPlanText } from '../../components/routine/ExecutionPlanText'
import { BooleanValue } from '../../components/table/BooleanValue'
import { useApiRequest } from '../../hooks/useApiRequest'
import { useProceduresGroupedBySite } from '../../hooks/useProceduresGroupedBySite'
import { routineExecutionTypeNames } from '../../utils/dictionaries'

interface RoutinePanelProps {
  routineInfo: Pick<Routine, 'name' | 'id'>
  onDeleted?: (routineId: Routine['id']) => void
  onNameChanged?: () => void
}

export const RoutinePanel = ({ routineInfo, onDeleted, onNameChanged }: RoutinePanelProps) => {
  const executionPlanRowsPreviewPopoverRef = useRef<CustomPopoverRef>(null)
  const { submit: getRoutineRequest } = useApiRequest(window.electronAPI.getRoutine)

  const { groupedSiteProcedures } = useProceduresGroupedBySite(true)

  const [routine, setRoutine] = useState<Routine | null>(null)
  const [loadingRoutine, setLoadingRoutine] = useState(true)

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
          <RoutinePanelHeaderOptions
            routine={routine}
            loading={loadingRoutine}
            onEdited={handleEdited}
            onDeleted={onDeleted}
          />
        </Stack>
        {routine && (
          <>
            <Accordion
              defaultExpanded
              disableGutters
              elevation={2}
              slotProps={{
                transition: {
                  unmountOnExit: true,
                },
              }}
              sx={{
                borderBottomLeftRadius: '1rem !important',
                borderBottomRightRadius: '1rem !important',
              }}
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
                  <ProcedureWidget
                    key={procedure.id}
                    procedure={procedure}
                    groupedSiteProcedures={groupedSiteProcedures}
                  />
                </Fragment>
              ))}
            </HorizontallyScrollableContainer>
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
          <CircularProgress color="primary" size="2rem" sx={{ mx: 'auto', my: 2 }} />
        )}
      </Stack>
    </ViewTransition>
  )
}
