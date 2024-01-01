import { RendererToElectronMessage } from '@web-scraper/common'

import Database from '../../../database'
import { handleApiRequest, successResponse, type RequestHandlersSchema } from '../helpers'
import { parseDatabaseRoutine } from '../parsers/routineParser'

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
} satisfies Partial<RequestHandlersSchema>
