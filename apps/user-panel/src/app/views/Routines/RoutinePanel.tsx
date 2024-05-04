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
import {
  RoutineExecutionType,
  upsertRoutineSchema,
  type Routine,
  type ScraperExecutionScope,
} from '@web-scraper/common'
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
import { type ParsedScraperExecutionTree } from '../../components/scraperExecution/helpers'
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
  console.log('scraperExecutionTree:', scraperExecutionTree) //TODO: remove

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
            {/* {scraperExecution && <RoutineExecutionMonitor scraperExecutionTree={scraperExecutionTree} executing={executing} mt="auto" />} */}
            {/* TODO: restore above after developing this component */}
            <RoutineExecutionMonitor
              scraperExecutionTree={executionTreeMock}
              executing={executing}
              maxWidth="100%"
              mt="auto"
            />
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

//TODO: use for developing this view
const executionTreeMock = {
  root: {
    start: {
      id: '58bd8a1b-9d0c-43d5-986c-ddd93f925cb6',
      event: 'scraperExecutionStarted',
      scope: 'routine',
      routine: {
        id: 1,
        name: 'Example routine',
        description: 'Example routine generated by seeding database',
        stopOnError: true,
        procedures: [
          {
            id: 1,
            name: 'Get title from example site',
            startUrl: '{{URL.ORIGIN}}',
            waitFor: 'body > div:nth-child(1) > h1',
            siteInstructionsId: 1,
            type: 'dataRetrieval',
            flow: {
              id: 3,
              globalReturnValues: [],
              actionName: 'action.Get title',
              onSuccess: {
                id: 1,
                globalReturnValues: [],
                actionName: 'global.finishProcedure',
                onSuccess: null,
                onFailure: null,
              },
              onFailure: {
                id: 2,
                globalReturnValues: [],
                actionName: 'global.finishProcedureWithError',
                onSuccess: null,
                onFailure: null,
              },
            },
          },
        ],
        executionPlan: {
          type: 'specificIds',
          dataSourceName: 'Example',
          ids: [1],
        },
      },
      iterationIndex: 0,
    },
    result: {
      id: '58bd8a1b-9d0c-43d5-986c-ddd93f925cb6',
      event: 'scraperExecutionResult',
      scope: 'routine',
      routineResult: {
        routine: {
          id: 1,
          name: 'Example routine',
          description: 'Example routine generated by seeding database',
          stopOnError: true,
          procedures: [
            {
              id: 1,
              name: 'Get title from example site',
              startUrl: '{{URL.ORIGIN}}',
              waitFor: 'body > div:nth-child(1) > h1',
              siteInstructionsId: 1,
              type: 'dataRetrieval',
              flow: {
                id: 3,
                globalReturnValues: [],
                actionName: 'action.Get title',
                onSuccess: {
                  id: 1,
                  globalReturnValues: [],
                  actionName: 'global.finishProcedure',
                  onSuccess: null,
                  onFailure: null,
                },
                onFailure: {
                  id: 2,
                  globalReturnValues: [],
                  actionName: 'global.finishProcedureWithError',
                  onSuccess: null,
                  onFailure: null,
                },
              },
            },
          ],
          executionPlan: {
            type: 'specificIds',
            dataSourceName: 'Example',
            ids: [1],
          },
        },
        source: {
          dataSource: {
            name: 'Example',
            columns: [
              {
                name: 'Title',
                type: 'TEXT',
              },
              {
                name: 'Timestamp',
                type: 'INTEGER',
              },
              {
                name: 'Custom',
                type: 'TEXT',
              },
            ],
          },
          item: {
            id: 1,
            data: [
              {
                columnName: 'Title',
                value: 'Example Domain',
              },
              {
                columnName: 'Timestamp',
                value: 1714692232,
              },
              {
                columnName: 'Custom',
                value: 'Custom value from siteInstructions seed',
              },
            ],
          },
        },
        proceduresExecutionResults: [
          {
            procedure: {
              id: 1,
              name: 'Get title from example site',
              startUrl: '{{URL.ORIGIN}}',
              waitFor: 'body > div:nth-child(1) > h1',
              siteInstructionsId: 1,
              type: 'dataRetrieval',
              flow: {
                id: 3,
                globalReturnValues: [],
                actionName: 'action.Get title',
                onSuccess: {
                  id: 1,
                  globalReturnValues: [],
                  actionName: 'global.finishProcedure',
                  onSuccess: null,
                  onFailure: null,
                },
                onFailure: {
                  id: 2,
                  globalReturnValues: [],
                  actionName: 'global.finishProcedureWithError',
                  onSuccess: null,
                  onFailure: null,
                },
              },
            },
            flowExecutionResult: {
              flow: {
                id: 3,
                globalReturnValues: [],
                actionName: 'action.Get title',
                onSuccess: {
                  id: 1,
                  globalReturnValues: [],
                  actionName: 'global.finishProcedure',
                  onSuccess: null,
                  onFailure: null,
                },
                onFailure: {
                  id: 2,
                  globalReturnValues: [],
                  actionName: 'global.finishProcedureWithError',
                  onSuccess: null,
                  onFailure: null,
                },
              },
              flowStepsResults: [
                {
                  flowStep: {
                    id: 3,
                    globalReturnValues: [],
                    actionName: 'action.Get title',
                  },
                  actionResult: {
                    action: {
                      id: 1,
                      name: 'Get title',
                      url: '{{URL.ORIGIN}}',
                      siteInstructionsId: 1,
                      actionSteps: [
                        {
                          id: 1,
                          orderIndex: 1,
                          actionId: 1,
                          type: 'saveToDataSource',
                          data: {
                            dataSourceQuery: 'DataSource.Example.Title',
                            saveDataType: 'elementContent',
                            saveToDataSourceValue: 'body > div:nth-child(1) > h1',
                          },
                        },
                        {
                          id: 2,
                          orderIndex: 2,
                          actionId: 1,
                          type: 'wait',
                          data: {
                            duration: 5000,
                          },
                        },
                        {
                          id: 3,
                          orderIndex: 3,
                          actionId: 1,
                          type: 'saveToDataSource',
                          data: {
                            dataSourceQuery: 'DataSource.Example.Timestamp',
                            saveDataType: 'currentTimestamp',
                          },
                        },
                        {
                          id: 4,
                          orderIndex: 4,
                          actionId: 1,
                          type: 'wait',
                          data: {
                            duration: 5000,
                          },
                        },
                        {
                          id: 5,
                          orderIndex: 5,
                          actionId: 1,
                          type: 'saveToDataSource',
                          data: {
                            dataSourceQuery: 'DataSource.Example.Custom',
                            saveDataType: 'custom',
                            saveToDataSourceValue: 'Custom value from siteInstructions seed',
                          },
                        },
                        {
                          id: 6,
                          orderIndex: 6,
                          actionId: 1,
                          type: 'wait',
                          data: {
                            duration: 5000,
                          },
                        },
                      ],
                    },
                    actionStepsResults: [
                      {
                        step: {
                          id: 1,
                          orderIndex: 1,
                          actionId: 1,
                          type: 'saveToDataSource',
                          data: {
                            dataSourceQuery: 'DataSource.Example.Title',
                            saveDataType: 'elementContent',
                            saveToDataSourceValue: 'body > div:nth-child(1) > h1',
                          },
                        },
                        result: {
                          errorType: 'error.common.noError',
                        },
                      },
                      {
                        step: {
                          id: 2,
                          orderIndex: 2,
                          actionId: 1,
                          type: 'wait',
                          data: {
                            duration: 5000,
                          },
                        },
                        result: {
                          errorType: 'error.common.noError',
                        },
                      },
                      {
                        step: {
                          id: 3,
                          orderIndex: 3,
                          actionId: 1,
                          type: 'saveToDataSource',
                          data: {
                            dataSourceQuery: 'DataSource.Example.Timestamp',
                            saveDataType: 'currentTimestamp',
                          },
                        },
                        result: {
                          errorType: 'error.common.noError',
                        },
                      },
                      {
                        step: {
                          id: 4,
                          orderIndex: 4,
                          actionId: 1,
                          type: 'wait',
                          data: {
                            duration: 5000,
                          },
                        },
                        result: {
                          errorType: 'error.common.noError',
                        },
                      },
                      {
                        step: {
                          id: 5,
                          orderIndex: 5,
                          actionId: 1,
                          type: 'saveToDataSource',
                          data: {
                            dataSourceQuery: 'DataSource.Example.Custom',
                            saveDataType: 'custom',
                            saveToDataSourceValue: 'Custom value from siteInstructions seed',
                          },
                        },
                        result: {
                          errorType: 'error.common.noError',
                        },
                      },
                      {
                        step: {
                          id: 6,
                          orderIndex: 6,
                          actionId: 1,
                          type: 'wait',
                          data: {
                            duration: 5000,
                          },
                        },
                        result: {
                          errorType: 'error.common.noError',
                        },
                      },
                    ],
                  },
                  returnedValues: [],
                  succeeded: true,
                },
                {
                  flowStep: {
                    id: 1,
                    globalReturnValues: [],
                    actionName: 'global.finishProcedure',
                  },
                  actionResult: null,
                  returnedValues: [],
                  succeeded: true,
                },
              ],
            },
          },
        ],
      },
      iterationIndex: 0,
    },
    finish: {
      id: '58bd8a1b-9d0c-43d5-986c-ddd93f925cb6',
      event: 'scraperExecutionFinished',
      scope: 'routine',
      iterationIndex: 0,
    },
  },
  nodes: [
    {
      root: {
        start: {
          id: '5217a5ea-c016-4bab-9383-2f740822de01',
          event: 'scraperExecutionStarted',
          scope: 'procedure',
          procedure: {
            id: 1,
            name: 'Get title from example site',
            startUrl: '{{URL.ORIGIN}}',
            waitFor: 'body > div:nth-child(1) > h1',
            siteInstructionsId: 1,
            type: 'dataRetrieval',
            flow: {
              id: 3,
              globalReturnValues: [],
              actionName: 'action.Get title',
              onSuccess: {
                id: 1,
                globalReturnValues: [],
                actionName: 'global.finishProcedure',
                onSuccess: null,
                onFailure: null,
              },
              onFailure: {
                id: 2,
                globalReturnValues: [],
                actionName: 'global.finishProcedureWithError',
                onSuccess: null,
                onFailure: null,
              },
            },
          },
        },
        result: {
          id: '5217a5ea-c016-4bab-9383-2f740822de01',
          event: 'scraperExecutionResult',
          scope: 'procedure',
          procedureResult: {
            flow: {
              id: 3,
              globalReturnValues: [],
              actionName: 'action.Get title',
              onSuccess: {
                id: 1,
                globalReturnValues: [],
                actionName: 'global.finishProcedure',
                onSuccess: null,
                onFailure: null,
              },
              onFailure: {
                id: 2,
                globalReturnValues: [],
                actionName: 'global.finishProcedureWithError',
                onSuccess: null,
                onFailure: null,
              },
            },
            flowStepsResults: [
              {
                flowStep: {
                  id: 3,
                  globalReturnValues: [],
                  actionName: 'action.Get title',
                },
                actionResult: {
                  action: {
                    id: 1,
                    name: 'Get title',
                    url: '{{URL.ORIGIN}}',
                    siteInstructionsId: 1,
                    actionSteps: [
                      {
                        id: 1,
                        orderIndex: 1,
                        actionId: 1,
                        type: 'saveToDataSource',
                        data: {
                          dataSourceQuery: 'DataSource.Example.Title',
                          saveDataType: 'elementContent',
                          saveToDataSourceValue: 'body > div:nth-child(1) > h1',
                        },
                      },
                      {
                        id: 2,
                        orderIndex: 2,
                        actionId: 1,
                        type: 'wait',
                        data: {
                          duration: 5000,
                        },
                      },
                      {
                        id: 3,
                        orderIndex: 3,
                        actionId: 1,
                        type: 'saveToDataSource',
                        data: {
                          dataSourceQuery: 'DataSource.Example.Timestamp',
                          saveDataType: 'currentTimestamp',
                        },
                      },
                      {
                        id: 4,
                        orderIndex: 4,
                        actionId: 1,
                        type: 'wait',
                        data: {
                          duration: 5000,
                        },
                      },
                      {
                        id: 5,
                        orderIndex: 5,
                        actionId: 1,
                        type: 'saveToDataSource',
                        data: {
                          dataSourceQuery: 'DataSource.Example.Custom',
                          saveDataType: 'custom',
                          saveToDataSourceValue: 'Custom value from siteInstructions seed',
                        },
                      },
                      {
                        id: 6,
                        orderIndex: 6,
                        actionId: 1,
                        type: 'wait',
                        data: {
                          duration: 5000,
                        },
                      },
                    ],
                  },
                  actionStepsResults: [
                    {
                      step: {
                        id: 1,
                        orderIndex: 1,
                        actionId: 1,
                        type: 'saveToDataSource',
                        data: {
                          dataSourceQuery: 'DataSource.Example.Title',
                          saveDataType: 'elementContent',
                          saveToDataSourceValue: 'body > div:nth-child(1) > h1',
                        },
                      },
                      result: {
                        errorType: 'error.common.noError',
                      },
                    },
                    {
                      step: {
                        id: 2,
                        orderIndex: 2,
                        actionId: 1,
                        type: 'wait',
                        data: {
                          duration: 5000,
                        },
                      },
                      result: {
                        errorType: 'error.common.noError',
                      },
                    },
                    {
                      step: {
                        id: 3,
                        orderIndex: 3,
                        actionId: 1,
                        type: 'saveToDataSource',
                        data: {
                          dataSourceQuery: 'DataSource.Example.Timestamp',
                          saveDataType: 'currentTimestamp',
                        },
                      },
                      result: {
                        errorType: 'error.common.noError',
                      },
                    },
                    {
                      step: {
                        id: 4,
                        orderIndex: 4,
                        actionId: 1,
                        type: 'wait',
                        data: {
                          duration: 5000,
                        },
                      },
                      result: {
                        errorType: 'error.common.noError',
                      },
                    },
                    {
                      step: {
                        id: 5,
                        orderIndex: 5,
                        actionId: 1,
                        type: 'saveToDataSource',
                        data: {
                          dataSourceQuery: 'DataSource.Example.Custom',
                          saveDataType: 'custom',
                          saveToDataSourceValue: 'Custom value from siteInstructions seed',
                        },
                      },
                      result: {
                        errorType: 'error.common.noError',
                      },
                    },
                    {
                      step: {
                        id: 6,
                        orderIndex: 6,
                        actionId: 1,
                        type: 'wait',
                        data: {
                          duration: 5000,
                        },
                      },
                      result: {
                        errorType: 'error.common.noError',
                      },
                    },
                  ],
                },
                returnedValues: [],
                succeeded: true,
              },
              {
                flowStep: {
                  id: 1,
                  globalReturnValues: [],
                  actionName: 'global.finishProcedure',
                },
                actionResult: null,
                returnedValues: [],
                succeeded: true,
              },
            ],
          },
        },
        finish: {
          id: '5217a5ea-c016-4bab-9383-2f740822de01',
          event: 'scraperExecutionFinished',
          scope: 'procedure',
        },
      },
      nodes: [
        {
          root: {
            start: {
              id: 'e07b8990-830b-4225-9c5f-d9953bbb08e2',
              event: 'scraperExecutionStarted',
              scope: 'flow',
              flow: {
                id: 3,
                globalReturnValues: [],
                actionName: 'action.Get title',
                onSuccess: {
                  id: 1,
                  globalReturnValues: [],
                  actionName: 'global.finishProcedure',
                  onSuccess: null,
                  onFailure: null,
                },
                onFailure: {
                  id: 2,
                  globalReturnValues: [],
                  actionName: 'global.finishProcedureWithError',
                  onSuccess: null,
                  onFailure: null,
                },
              },
            },
            result: {
              id: 'e07b8990-830b-4225-9c5f-d9953bbb08e2',
              event: 'scraperExecutionResult',
              scope: 'flow',
              flowResult: [
                {
                  flowStep: {
                    id: 3,
                    globalReturnValues: [],
                    actionName: 'action.Get title',
                  },
                  actionResult: {
                    action: {
                      id: 1,
                      name: 'Get title',
                      url: '{{URL.ORIGIN}}',
                      siteInstructionsId: 1,
                      actionSteps: [
                        {
                          id: 1,
                          orderIndex: 1,
                          actionId: 1,
                          type: 'saveToDataSource',
                          data: {
                            dataSourceQuery: 'DataSource.Example.Title',
                            saveDataType: 'elementContent',
                            saveToDataSourceValue: 'body > div:nth-child(1) > h1',
                          },
                        },
                        {
                          id: 2,
                          orderIndex: 2,
                          actionId: 1,
                          type: 'wait',
                          data: {
                            duration: 5000,
                          },
                        },
                        {
                          id: 3,
                          orderIndex: 3,
                          actionId: 1,
                          type: 'saveToDataSource',
                          data: {
                            dataSourceQuery: 'DataSource.Example.Timestamp',
                            saveDataType: 'currentTimestamp',
                          },
                        },
                        {
                          id: 4,
                          orderIndex: 4,
                          actionId: 1,
                          type: 'wait',
                          data: {
                            duration: 5000,
                          },
                        },
                        {
                          id: 5,
                          orderIndex: 5,
                          actionId: 1,
                          type: 'saveToDataSource',
                          data: {
                            dataSourceQuery: 'DataSource.Example.Custom',
                            saveDataType: 'custom',
                            saveToDataSourceValue: 'Custom value from siteInstructions seed',
                          },
                        },
                        {
                          id: 6,
                          orderIndex: 6,
                          actionId: 1,
                          type: 'wait',
                          data: {
                            duration: 5000,
                          },
                        },
                      ],
                    },
                    actionStepsResults: [
                      {
                        step: {
                          id: 1,
                          orderIndex: 1,
                          actionId: 1,
                          type: 'saveToDataSource',
                          data: {
                            dataSourceQuery: 'DataSource.Example.Title',
                            saveDataType: 'elementContent',
                            saveToDataSourceValue: 'body > div:nth-child(1) > h1',
                          },
                        },
                        result: {
                          errorType: 'error.common.noError',
                        },
                      },
                      {
                        step: {
                          id: 2,
                          orderIndex: 2,
                          actionId: 1,
                          type: 'wait',
                          data: {
                            duration: 5000,
                          },
                        },
                        result: {
                          errorType: 'error.common.noError',
                        },
                      },
                      {
                        step: {
                          id: 3,
                          orderIndex: 3,
                          actionId: 1,
                          type: 'saveToDataSource',
                          data: {
                            dataSourceQuery: 'DataSource.Example.Timestamp',
                            saveDataType: 'currentTimestamp',
                          },
                        },
                        result: {
                          errorType: 'error.common.noError',
                        },
                      },
                      {
                        step: {
                          id: 4,
                          orderIndex: 4,
                          actionId: 1,
                          type: 'wait',
                          data: {
                            duration: 5000,
                          },
                        },
                        result: {
                          errorType: 'error.common.noError',
                        },
                      },
                      {
                        step: {
                          id: 5,
                          orderIndex: 5,
                          actionId: 1,
                          type: 'saveToDataSource',
                          data: {
                            dataSourceQuery: 'DataSource.Example.Custom',
                            saveDataType: 'custom',
                            saveToDataSourceValue: 'Custom value from siteInstructions seed',
                          },
                        },
                        result: {
                          errorType: 'error.common.noError',
                        },
                      },
                      {
                        step: {
                          id: 6,
                          orderIndex: 6,
                          actionId: 1,
                          type: 'wait',
                          data: {
                            duration: 5000,
                          },
                        },
                        result: {
                          errorType: 'error.common.noError',
                        },
                      },
                    ],
                  },
                  returnedValues: [],
                  succeeded: true,
                },
                {
                  flowStep: {
                    id: 1,
                    globalReturnValues: [],
                    actionName: 'global.finishProcedure',
                  },
                  actionResult: null,
                  returnedValues: [],
                  succeeded: true,
                },
              ],
            },
            finish: {
              id: 'e07b8990-830b-4225-9c5f-d9953bbb08e2',
              event: 'scraperExecutionFinished',
              scope: 'flow',
            },
          },
          nodes: [
            {
              root: {
                start: {
                  id: '9e15a086-e149-41e6-b98d-f852bd834693',
                  event: 'scraperExecutionStarted',
                  scope: 'action',
                  action: {
                    id: 1,
                    name: 'Get title',
                    url: '{{URL.ORIGIN}}',
                    siteInstructionsId: 1,
                    actionSteps: [
                      {
                        id: 1,
                        orderIndex: 1,
                        actionId: 1,
                        type: 'saveToDataSource',
                        data: {
                          dataSourceQuery: 'DataSource.Example.Title',
                          saveDataType: 'elementContent',
                          saveToDataSourceValue: 'body > div:nth-child(1) > h1',
                        },
                      },
                      {
                        id: 2,
                        orderIndex: 2,
                        actionId: 1,
                        type: 'wait',
                        data: {
                          duration: 5000,
                        },
                      },
                      {
                        id: 3,
                        orderIndex: 3,
                        actionId: 1,
                        type: 'saveToDataSource',
                        data: {
                          dataSourceQuery: 'DataSource.Example.Timestamp',
                          saveDataType: 'currentTimestamp',
                        },
                      },
                      {
                        id: 4,
                        orderIndex: 4,
                        actionId: 1,
                        type: 'wait',
                        data: {
                          duration: 5000,
                        },
                      },
                      {
                        id: 5,
                        orderIndex: 5,
                        actionId: 1,
                        type: 'saveToDataSource',
                        data: {
                          dataSourceQuery: 'DataSource.Example.Custom',
                          saveDataType: 'custom',
                          saveToDataSourceValue: 'Custom value from siteInstructions seed',
                        },
                      },
                      {
                        id: 6,
                        orderIndex: 6,
                        actionId: 1,
                        type: 'wait',
                        data: {
                          duration: 5000,
                        },
                      },
                    ],
                  },
                },
                result: {
                  id: '9e15a086-e149-41e6-b98d-f852bd834693',
                  event: 'scraperExecutionResult',
                  scope: 'action',
                  actionResult: [
                    {
                      step: {
                        id: 1,
                        orderIndex: 1,
                        actionId: 1,
                        type: 'saveToDataSource',
                        data: {
                          dataSourceQuery: 'DataSource.Example.Title',
                          saveDataType: 'elementContent',
                          saveToDataSourceValue: 'body > div:nth-child(1) > h1',
                        },
                      },
                      result: {
                        errorType: 'error.common.noError',
                      },
                    },
                    {
                      step: {
                        id: 2,
                        orderIndex: 2,
                        actionId: 1,
                        type: 'wait',
                        data: {
                          duration: 5000,
                        },
                      },
                      result: {
                        errorType: 'error.common.noError',
                      },
                    },
                    {
                      step: {
                        id: 3,
                        orderIndex: 3,
                        actionId: 1,
                        type: 'saveToDataSource',
                        data: {
                          dataSourceQuery: 'DataSource.Example.Timestamp',
                          saveDataType: 'currentTimestamp',
                        },
                      },
                      result: {
                        errorType: 'error.common.noError',
                      },
                    },
                    {
                      step: {
                        id: 4,
                        orderIndex: 4,
                        actionId: 1,
                        type: 'wait',
                        data: {
                          duration: 5000,
                        },
                      },
                      result: {
                        errorType: 'error.common.noError',
                      },
                    },
                    {
                      step: {
                        id: 5,
                        orderIndex: 5,
                        actionId: 1,
                        type: 'saveToDataSource',
                        data: {
                          dataSourceQuery: 'DataSource.Example.Custom',
                          saveDataType: 'custom',
                          saveToDataSourceValue: 'Custom value from siteInstructions seed',
                        },
                      },
                      result: {
                        errorType: 'error.common.noError',
                      },
                    },
                    {
                      step: {
                        id: 6,
                        orderIndex: 6,
                        actionId: 1,
                        type: 'wait',
                        data: {
                          duration: 5000,
                        },
                      },
                      result: {
                        errorType: 'error.common.noError',
                      },
                    },
                  ],
                },
                finish: {
                  id: '9e15a086-e149-41e6-b98d-f852bd834693',
                  event: 'scraperExecutionFinished',
                  scope: 'action',
                },
              },
              nodes: [
                {
                  root: {
                    start: {
                      id: '0925260a-e34e-4d3a-b6fa-d29035ce1690',
                      event: 'scraperExecutionStarted',
                      scope: 'actionStep',
                      actionStep: {
                        id: 1,
                        orderIndex: 1,
                        actionId: 1,
                        type: 'saveToDataSource',
                        data: {
                          dataSourceQuery: 'DataSource.Example.Title',
                          saveDataType: 'elementContent',
                          saveToDataSourceValue: 'body > div:nth-child(1) > h1',
                        },
                      },
                    },
                    result: {
                      id: '0925260a-e34e-4d3a-b6fa-d29035ce1690',
                      event: 'scraperExecutionResult',
                      scope: 'actionStep',
                      actionStepResult: {
                        errorType: 'error.common.noError',
                      },
                    },
                    finish: {
                      id: '0925260a-e34e-4d3a-b6fa-d29035ce1690',
                      event: 'scraperExecutionFinished',
                      scope: 'actionStep',
                    },
                  },
                  nodes: null,
                },
                {
                  root: {
                    start: {
                      id: '70b5ec53-2cca-418e-b5e4-13c902bd2a8a',
                      event: 'scraperExecutionStarted',
                      scope: 'actionStep',
                      actionStep: {
                        id: 2,
                        orderIndex: 2,
                        actionId: 1,
                        type: 'wait',
                        data: {
                          duration: 5000,
                        },
                      },
                    },
                    result: {
                      id: '70b5ec53-2cca-418e-b5e4-13c902bd2a8a',
                      event: 'scraperExecutionResult',
                      scope: 'actionStep',
                      actionStepResult: {
                        errorType: 'error.common.noError',
                      },
                    },
                    finish: {
                      id: '70b5ec53-2cca-418e-b5e4-13c902bd2a8a',
                      event: 'scraperExecutionFinished',
                      scope: 'actionStep',
                    },
                  },
                  nodes: null,
                },
                {
                  root: {
                    start: {
                      id: 'ab611ae3-c8ad-4724-a558-4fa857f1c265',
                      event: 'scraperExecutionStarted',
                      scope: 'actionStep',
                      actionStep: {
                        id: 3,
                        orderIndex: 3,
                        actionId: 1,
                        type: 'saveToDataSource',
                        data: {
                          dataSourceQuery: 'DataSource.Example.Timestamp',
                          saveDataType: 'currentTimestamp',
                        },
                      },
                    },
                    result: {
                      id: 'ab611ae3-c8ad-4724-a558-4fa857f1c265',
                      event: 'scraperExecutionResult',
                      scope: 'actionStep',
                      actionStepResult: {
                        errorType: 'error.common.noError',
                      },
                    },
                    finish: {
                      id: 'ab611ae3-c8ad-4724-a558-4fa857f1c265',
                      event: 'scraperExecutionFinished',
                      scope: 'actionStep',
                    },
                  },
                  nodes: null,
                },
                {
                  root: {
                    start: {
                      id: '2e14319c-f642-4c1a-abcc-543c61687172',
                      event: 'scraperExecutionStarted',
                      scope: 'actionStep',
                      actionStep: {
                        id: 4,
                        orderIndex: 4,
                        actionId: 1,
                        type: 'wait',
                        data: {
                          duration: 5000,
                        },
                      },
                    },
                    result: {
                      id: '2e14319c-f642-4c1a-abcc-543c61687172',
                      event: 'scraperExecutionResult',
                      scope: 'actionStep',
                      actionStepResult: {
                        errorType: 'error.common.noError',
                      },
                    },
                    finish: {
                      id: '2e14319c-f642-4c1a-abcc-543c61687172',
                      event: 'scraperExecutionFinished',
                      scope: 'actionStep',
                    },
                  },
                  nodes: null,
                },
                {
                  root: {
                    start: {
                      id: '81839321-753a-4048-93f4-1bc4e6d50a7f',
                      event: 'scraperExecutionStarted',
                      scope: 'actionStep',
                      actionStep: {
                        id: 5,
                        orderIndex: 5,
                        actionId: 1,
                        type: 'saveToDataSource',
                        data: {
                          dataSourceQuery: 'DataSource.Example.Custom',
                          saveDataType: 'custom',
                          saveToDataSourceValue: 'Custom value from siteInstructions seed',
                        },
                      },
                    },
                    result: {
                      id: '81839321-753a-4048-93f4-1bc4e6d50a7f',
                      event: 'scraperExecutionResult',
                      scope: 'actionStep',
                      actionStepResult: {
                        errorType: 'error.common.noError',
                      },
                    },
                    finish: {
                      id: '81839321-753a-4048-93f4-1bc4e6d50a7f',
                      event: 'scraperExecutionFinished',
                      scope: 'actionStep',
                    },
                  },
                  nodes: null,
                },
                {
                  root: {
                    start: {
                      id: '84b3e43c-1f69-4481-ba97-5029884fc84a',
                      event: 'scraperExecutionStarted',
                      scope: 'actionStep',
                      actionStep: {
                        id: 6,
                        orderIndex: 6,
                        actionId: 1,
                        type: 'wait',
                        data: {
                          duration: 5000,
                        },
                      },
                    },
                    result: {
                      id: '84b3e43c-1f69-4481-ba97-5029884fc84a',
                      event: 'scraperExecutionResult',
                      scope: 'actionStep',
                      actionStepResult: {
                        errorType: 'error.common.noError',
                      },
                    },
                    finish: {
                      id: '84b3e43c-1f69-4481-ba97-5029884fc84a',
                      event: 'scraperExecutionFinished',
                      scope: 'actionStep',
                    },
                  },
                  nodes: null,
                },
              ],
            },
          ],
        },
        {
          root: {
            start: {
              id: '23915132-068c-4c08-9e09-ccc486f4f113',
              event: 'scraperExecutionStarted',
              scope: 'flow',
              flow: {
                id: 1,
                globalReturnValues: [],
                actionName: 'global.finishProcedure',
                onSuccess: null,
                onFailure: null,
              },
            },
            result: {
              id: '23915132-068c-4c08-9e09-ccc486f4f113',
              event: 'scraperExecutionResult',
              scope: 'flow',
              flowResult: [
                {
                  flowStep: {
                    id: 1,
                    globalReturnValues: [],
                    actionName: 'global.finishProcedure',
                  },
                  actionResult: null,
                  returnedValues: [],
                  succeeded: true,
                },
              ],
            },
            finish: {
              id: '23915132-068c-4c08-9e09-ccc486f4f113',
              event: 'scraperExecutionFinished',
              scope: 'flow',
            },
          },
          nodes: null,
        },
      ],
    },
  ],
} as ParsedScraperExecutionTree<ScraperExecutionScope.ROUTINE>
