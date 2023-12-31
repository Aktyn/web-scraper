import { RendererToElectronMessage } from '@web-scraper/common'

import Database from '../../../database'
import { handleApiRequest, type RequestHandlersSchema } from '../helpers'
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
} satisfies Partial<RequestHandlersSchema>
