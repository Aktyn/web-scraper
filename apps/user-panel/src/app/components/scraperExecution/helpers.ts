import {
  ActionStepErrorType,
  ElectronToRendererMessage,
  ScraperExecutionScope,
} from '@web-scraper/common'
import { type AnyScraperExecutionType } from '../../modules/ScraperExecutionModule'

export type ParsedScraperExecution = {
  start: AnyScraperExecutionType & { event: ElectronToRendererMessage.scraperExecutionStarted }
  result?: AnyScraperExecutionType & { event: ElectronToRendererMessage.scraperExecutionResult }
  finish?: AnyScraperExecutionType & { event: ElectronToRendererMessage.scraperExecutionFinished }
}

export function parseScraperExecution(execution: AnyScraperExecutionType[]) {
  const parsed: ParsedScraperExecution[] = []

  if (!execution.length) {
    return parsed
  }

  for (let s = 0; s < execution.length; s++) {
    const start = execution[s]
    if (start.event === ElectronToRendererMessage.scraperExecutionStarted) {
      const parsedItem: ParsedScraperExecution = { start }
      for (let r = s + 1; r < execution.length; r++) {
        const result = execution[r]
        if (
          result.event === ElectronToRendererMessage.scraperExecutionResult &&
          result.scope === start.scope &&
          result.id === start.id
        ) {
          parsedItem.result = result
          for (let f = r + 1; f < execution.length; f++) {
            const finish = execution[f]
            if (
              finish.event === ElectronToRendererMessage.scraperExecutionFinished &&
              finish.scope === result.scope &&
              finish.id === result.id
            ) {
              parsedItem.finish = finish
              break
            }
          }
          break
        }
      }
      parsed.push(parsedItem)
    }
  }

  return parsed
}

export function executionItemResultFailed(executionItem: ParsedScraperExecution) {
  if (!executionItem.result) {
    return false
  }

  switch (executionItem.result.scope) {
    case ScraperExecutionScope.ACTION_STEP:
      return executionItem.result.actionStepResult.errorType !== ActionStepErrorType.NO_ERROR
    case ScraperExecutionScope.ACTION:
      return executionItem.result.actionResult.some((actionStepResult) => {
        return actionStepResult.result.errorType !== ActionStepErrorType.NO_ERROR
      })
    case ScraperExecutionScope.FLOW:
      return executionItem.result.flowResult.some((flowStepResult) => !flowStepResult.succeeded)
    case ScraperExecutionScope.PROCEDURE:
      return 'errorType' in executionItem.result.procedureResult
        ? executionItem.result.procedureResult.errorType !== ActionStepErrorType.NO_ERROR
        : executionItem.result.procedureResult.flowStepsResults.some((result) => !result.succeeded)
  }

  return false
}
