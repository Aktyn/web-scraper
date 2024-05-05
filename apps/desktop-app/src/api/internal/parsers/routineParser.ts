import { pick, type Routine, type RoutineExecutionHistory } from '@web-scraper/common'

import type { getRoutine, getRoutineExecutionHistory } from '../../../database/routine'

import { parseDatabaseProcedure } from './siteInstructionsParser'

export function parseDatabaseRoutine(routineData: Awaited<ReturnType<typeof getRoutine>>): Routine {
  return {
    ...pick(routineData, 'id', 'name', 'description', 'stopOnError'),
    procedures: routineData.Procedures.map(parseDatabaseProcedure),
    executionPlan: JSON.parse(routineData.executionPlan),
  }
}

export function parseDatabaseRoutineExecutionHistory(
  routineExecutionHistoryData: Awaited<ReturnType<typeof getRoutineExecutionHistory>>,
): RoutineExecutionHistory {
  return routineExecutionHistoryData.map((historyItem) => ({
    ...pick(historyItem, 'id', 'createdAt', 'routineId', 'iterationIndex'),
    routineName: historyItem.Routine.name,
    results: JSON.parse(historyItem.results),
  }))
}
