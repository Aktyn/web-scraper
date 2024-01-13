import {
  ElectronToRendererMessage,
  REGULAR_ACTION_PREFIX,
  RendererToElectronMessage,
  type Action,
  type Procedure,
  ErrorCode,
  type ApiError,
} from '@web-scraper/common'

import Database from '../../../database'
import { Scraper } from '../../../scraper'
import {
  broadcastMessage,
  handleApiRequest,
  successResponse,
  type RequestHandlersSchema,
} from '../helpers'
import { parseDatabaseRoutine } from '../parsers/routineParser'
import { parseDatabaseAction } from '../parsers/siteInstructionsParser'

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

      const routineExecutionInstance = new Scraper(Scraper.Mode.ROUTINE_EXECUTION, {
        routine,
        procedureActions,
        preview,
        onResult: (result) => {
          //TODO: save RoutineExecutionResult in database before broadcasting message
          broadcastMessage(
            ElectronToRendererMessage.routineExecutionResult,
            routineExecutionInstance.id,
            result,
          )
        },
        onClose: () => {
          broadcastMessage(
            ElectronToRendererMessage.routineExecutionFinished,
            routineExecutionInstance.id,
          )
        },
      })
      await routineExecutionInstance.waitForInit()

      broadcastMessage(
        ElectronToRendererMessage.routineExecutionStarted,
        routineExecutionInstance.id,
        routine,
      )

      //TODO: perform routine according to execution plan
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
          error: `${requiredActionName} is required by procedure ${procedure.name} but not found in site instructions (${procedure.siteInstructionsId})`,
        } satisfies ApiError
      }
    }

    procedureActions.set(procedure.id, actions)
  }

  return procedureActions
}

function listProcedureActionNames(
  procedureFlow: Procedure['flow'],
  actionNames = new Set<string>(),
) {
  if (procedureFlow && procedureFlow.actionName.startsWith(REGULAR_ACTION_PREFIX)) {
    actionNames.add(procedureFlow.actionName)
  }
  for (const flowStep of [procedureFlow?.onFailure, procedureFlow?.onSuccess]) {
    if (flowStep) {
      listProcedureActionNames(flowStep, actionNames)
    }
  }
  return actionNames
}
