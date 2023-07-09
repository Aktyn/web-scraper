import { ElectronToRendererMessage } from '@web-scraper/common'
import { type AnyScraperExecutionType } from '../../api/ScraperExecutionModule'

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
