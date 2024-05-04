import { useMemo } from 'react'
import {
  ElectronToRendererMessage,
  ScraperExecutionScope,
  ScraperMode,
  type Routine,
} from '@web-scraper/common'
import {
  parseScraperExecution,
  parseScraperExecutionAsTree,
} from '../components/scraperExecution/helpers'
import { ScraperExecutionModule } from '../modules/ScraperExecutionModule'

export function useActiveRoutineExecution(routine: Routine | null) {
  const { scraperExecutions, getExecutionData } =
    ScraperExecutionModule.useScraperExecutionContext()

  const activeExecutionScraperId = useMemo(() => {
    if (!routine) {
      return null
    }

    const routineExecution = scraperExecutions.find(
      (execution) =>
        execution.scope === ScraperExecutionScope.ROUTINE &&
        execution.mode === ScraperMode.ROUTINE_EXECUTION,
    )
    if (!routineExecution) {
      return null
    }

    const executionData = getExecutionData(routineExecution.scraperId, routineExecution.mode)
    if (!executionData || executionData.finished) {
      return null
    }

    if (
      executionData.execution.find(
        (executionEntry) =>
          executionEntry.event === ElectronToRendererMessage.scraperExecutionStarted &&
          executionEntry.scope === ScraperExecutionScope.ROUTINE &&
          executionEntry.routine.id === routine.id,
      )
    ) {
      return routineExecution.scraperId
    }

    return null
  }, [getExecutionData, routine, scraperExecutions])
  const executionData = ScraperExecutionModule.useScraperExecution(
    activeExecutionScraperId,
    ScraperMode.ROUTINE_EXECUTION,
  )

  const [execution, executionTree] = useMemo(() => {
    if (!executionData?.execution) {
      return [null, null]
    }

    const parsedExecution = parseScraperExecution(executionData.execution)

    return [
      parsedExecution,
      parseScraperExecutionAsTree(parsedExecution, ScraperExecutionScope.ROUTINE),
    ]
  }, [executionData?.execution])

  const finished = executionData?.finished ?? false

  return useMemo(
    () => ({
      activeExecutionScraperId,
      scraperExecution: execution,
      scraperExecutionTree: executionTree,
      executing: !!activeExecutionScraperId && !finished,
    }),
    [activeExecutionScraperId, execution, executionTree, finished],
  )
}
