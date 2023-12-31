import { pick, type Routine } from '@web-scraper/common'

import { type getRoutine } from '../../../database/routine'

import { parseDatabaseProcedure } from './siteInstructionsParser'

export function parseDatabaseRoutine(routineData: Awaited<ReturnType<typeof getRoutine>>): Routine {
  return {
    ...pick(routineData, 'id', 'name', 'description', 'stopOnError'),
    procedures: routineData.Procedures.map(parseDatabaseProcedure),
    executionPlan: JSON.parse(routineData.executionPlan),
  }
}
