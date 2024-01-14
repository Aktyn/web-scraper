import {
  ElectronToRendererMessage,
  ErrorCode,
  REGULAR_ACTION_PREFIX,
  RendererToElectronMessage,
  RoutineExecutionType,
  ValueQueryType,
  isCustomValueQuery,
  isDataSourceValueQuery,
  upsertStandaloneExecutionPlanSchema,
  wait,
  type Action,
  type ApiError,
  type DataSourceItem,
  type DataSourceValueQuery,
  type Procedure,
  upsertMatchSequentiallyExecutionPlanSchema,
  dataSourceFiltersToSqlite,
} from '@web-scraper/common'

import Database from '../../../database'
import { type RawDataSourceItemSchema } from '../../../database/dataSource'
import { Scraper } from '../../../scraper'
import {
  broadcastMessage,
  handleApiRequest,
  successResponse,
  type RequestHandlersSchema,
} from '../helpers'
import { parseDatabaseDataSourceItem } from '../parsers/dataSourceParser'
import { parseDatabaseRoutine } from '../parsers/routineParser'
import { parseDatabaseAction } from '../parsers/siteInstructionsParser'

import { onManualDataRequest, onManualDataSourceItemIdRequest } from './helpers'

export const routineHandler = {
  [RendererToElectronMessage.getRoutines]: handleApiRequest(
    RendererToElectronMessage.getRoutines,
    () => Database.routine.getRoutines(),
  ),
  [RendererToElectronMessage.getRoutine]: handleApiRequest(
    RendererToElectronMessage.getRoutine,
    (routineId) => Database.routine.getRoutine(routineId).then(parseDatabaseRoutine),
  ),
  [RendererToElectronMessage.createRoutine]: handleApiRequest(
    RendererToElectronMessage.createRoutine,
    (data) => Database.routine.createRoutine(data).then(parseDatabaseRoutine),
  ),
  [RendererToElectronMessage.updateRoutine]: handleApiRequest(
    RendererToElectronMessage.updateRoutine,
    (id, data) => Database.routine.updateRoutine(id, data).then(parseDatabaseRoutine),
  ),
  [RendererToElectronMessage.deleteRoutine]: handleApiRequest(
    RendererToElectronMessage.deleteRoutine,
    (id) => Database.routine.deleteRoutine(id).then(() => successResponse),
  ),
  [RendererToElectronMessage.executeRoutine]: handleApiRequest(
    RendererToElectronMessage.executeRoutine,
    async (routineId, preview) => {
      const existingInstance = Array.from(
        Scraper.getInstances(Scraper.Mode.ROUTINE_EXECUTION).values(),
      ).find((instance) => instance.getOptions().routine.id === routineId)

      if (existingInstance) {
        console.warn(
          'Site instructions testing session already started with id:',
          existingInstance.id,
        )
        return { executionId: existingInstance.id }
      }

      const routine = parseDatabaseRoutine(await Database.routine.getRoutine(routineId))

      const procedureActions = await getProcedureActions(routine.procedures)

      const routineExecutionInstance = new Scraper<typeof Scraper.Mode.ROUTINE_EXECUTION>(
        Scraper.Mode.ROUTINE_EXECUTION,
        {
          routine,
          procedureActions,
          preview,
          // onResult: (result) => {
          //   //TODO: save RoutineExecutionResult in database before broadcasting message
          //   broadcastMessage(
          //     ElectronToRendererMessage.routineExecutionResult,
          //     routineExecutionInstance.id,
          //     result,
          //   )
          // },
          onClose: () => {
            broadcastMessage(
              ElectronToRendererMessage.routineExecutionFinished,
              routineExecutionInstance.id,
            )
          },
        },
      )
      await routineExecutionInstance.waitForInit()

      broadcastMessage(
        ElectronToRendererMessage.routineExecutionStarted,
        routineExecutionInstance.id,
        routine,
      )
      await wait(100)

      performRoutineExecution(routineExecutionInstance).catch(console.error)
      // routineExecutionInstance.performRoutine(_, onDataRequest, onDataSourceItemIdRequest)

      return { executionId: routineExecutionInstance.id }
    },
  ),
} satisfies Partial<RequestHandlersSchema>

async function getProcedureActions(procedures: Procedure[]) {
  const procedureActions = new Map<Procedure['id'], Action[]>()

  for (const procedure of procedures) {
    const requiredActionNames = listProcedureActionNames(procedure.flow)

    const actions = (
      await Database.siteInstructions
        .getProcedureActions(procedure)
        .then((actions) => actions.map(parseDatabaseAction))
    ).filter((action) => requiredActionNames.has(action.name))

    for (const requiredActionName of requiredActionNames.values()) {
      if (!actions.some((action) => action.name === requiredActionName)) {
        throw {
          errorCode: ErrorCode.ACTION_REQUIRED_BY_PROCEDURE_NOT_FOUND,
          error: `Action "${requiredActionName}" is required by procedure "${procedure.name}" but not found in site instructions (site instructions id: ${procedure.siteInstructionsId})`,
        } satisfies ApiError
      }
    }

    procedureActions.set(procedure.id, actions)
  }

  return procedureActions
}

/** Doesn't include global actions */
function listProcedureActionNames(
  procedureFlow: Procedure['flow'],
  actionNames = new Set<string>(),
) {
  if (procedureFlow && procedureFlow.actionName.startsWith(REGULAR_ACTION_PREFIX)) {
    const name = procedureFlow.actionName.replace(
      new RegExp(`^${REGULAR_ACTION_PREFIX}\\.`, 'i'),
      '',
    )
    actionNames.add(name)
  }
  for (const flowStep of [procedureFlow?.onFailure, procedureFlow?.onSuccess]) {
    if (flowStep) {
      listProcedureActionNames(flowStep, actionNames)
    }
  }
  return actionNames
}

function getColumnValue(
  columns: DataSourceItem['data'],
  columnName: string,
  valueQuery: DataSourceValueQuery,
) {
  const columnData = columns.find((column) => column.columnName === columnName)
  if (!columnData) {
    throw {
      errorCode: ErrorCode.INCORRECT_DATA,
      error: `Invalid value query: "${valueQuery}" (column not found)`,
    }
  }
  return columnData.value
}

async function runForEachDataSourceItem(
  scraperInstance: Scraper<typeof Scraper.Mode.ROUTINE_EXECUTION>,
  dataSourceName: string,
  items: RawDataSourceItemSchema[],
) {
  const { routine } = scraperInstance.getOptions()

  const parsedItems = items.map(parseDatabaseDataSourceItem)
  for (const item of parsedItems) {
    await scraperInstance.performRoutineIteration(
      routine,
      async (valueQuery) => {
        if (isCustomValueQuery(valueQuery)) {
          return valueQuery.replace(new RegExp(`^${ValueQueryType.CUSTOM}\\.`, 'u'), '')
        }

        if (isDataSourceValueQuery(valueQuery)) {
          const [, queryDataSourceName, queryColumnName] = valueQuery.split('.')
          if (dataSourceName === queryDataSourceName) {
            return getColumnValue(item.data, queryColumnName, valueQuery)
          } else {
            // Return value from another data source with the same id as source item from this routine iteration
            const anotherDataSourceItems = await Database.dataSource.getDataSourceItems(
              {
                count: 1,
                filters: [{ id: item.id }],
              },
              queryDataSourceName,
            )
            if (!anotherDataSourceItems.length) {
              throw {
                errorCode: ErrorCode.INCORRECT_DATA,
                error: `Invalid value query: "${valueQuery}" (item with id ${item.id} not found in data source ${queryDataSourceName})`,
              }
            }

            return getColumnValue(
              parseDatabaseDataSourceItem(anotherDataSourceItems[0]).data,
              queryColumnName,
              valueQuery,
            )
          }
        }

        throw {
          errorCode: ErrorCode.INCORRECT_DATA,
          error: `Invalid value query: "${valueQuery}" (incorrect format)`,
        }
      },
      async () => item.id,
    )
  }
}

async function performRoutineExecution(
  scraperInstance: Scraper<typeof Scraper.Mode.ROUTINE_EXECUTION>,
) {
  const { routine } = scraperInstance.getOptions()

  switch (routine.executionPlan.type) {
    case RoutineExecutionType.STANDALONE:
      {
        const repeat =
          routine.executionPlan.repeat ?? upsertStandaloneExecutionPlanSchema.getDefault().repeat
        for (let i = 0; i < repeat; i++) {
          await scraperInstance.performRoutineIteration(
            routine,
            onManualDataRequest,
            onManualDataSourceItemIdRequest,
          )
        }
      }
      break

    case RoutineExecutionType.EXCEPT_SPECIFIC_IDS:
      {
        const dataSourceItems = await Database.dataSource.getDataSourceItems(
          {
            count: ~(1 << 31),
            filters: [{ id: { notIn: routine.executionPlan.ids } }],
          },
          routine.executionPlan.dataSourceName,
        )
        await runForEachDataSourceItem(
          scraperInstance,
          routine.executionPlan.dataSourceName,
          dataSourceItems,
        )
      }
      break
    case RoutineExecutionType.SPECIFIC_IDS:
      {
        const dataSourceItems = await Database.dataSource.getDataSourceItems(
          {
            count: routine.executionPlan.ids.length,
            filters: [{ id: { in: routine.executionPlan.ids } }],
          },
          routine.executionPlan.dataSourceName,
        )
        await runForEachDataSourceItem(
          scraperInstance,
          routine.executionPlan.dataSourceName,
          dataSourceItems,
        )
      }
      break

    case RoutineExecutionType.MATCH_SEQUENTIALLY:
      {
        const executionPlanFilters =
          routine.executionPlan.filters ??
          upsertMatchSequentiallyExecutionPlanSchema.getDefault().filters
        const whereQuery = dataSourceFiltersToSqlite(executionPlanFilters)

        const dataSourceItems = await Database.dataSource.getDataSourceItems(
          {
            count: routine.executionPlan.maximumIterations ?? ~(1 << 31),
            filters: whereQuery,
          },
          routine.executionPlan.dataSourceName,
        )
        await runForEachDataSourceItem(
          scraperInstance,
          routine.executionPlan.dataSourceName,
          dataSourceItems,
        )
      }
      break
  }

  await scraperInstance.destroy()
}
