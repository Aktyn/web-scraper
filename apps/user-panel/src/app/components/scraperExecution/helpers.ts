import {
  ActionStepErrorType,
  ElectronToRendererMessage,
  ScraperExecutionScope,
} from '@web-scraper/common'
import type { AnyScraperExecutionType } from '../../modules/ScraperExecutionModule'

type ScraperExecutionType<Scope extends ScraperExecutionScope> = AnyScraperExecutionType & {
  scope: Scope
}

export type ParsedScraperExecution<Scope extends ScraperExecutionScope = ScraperExecutionScope> = {
  start: ScraperExecutionType<Scope> & { event: ElectronToRendererMessage.scraperExecutionStarted }
  result?: ScraperExecutionType<Scope> & { event: ElectronToRendererMessage.scraperExecutionResult }
  finish?: ScraperExecutionType<Scope> & {
    event: ElectronToRendererMessage.scraperExecutionFinished
  }
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

type GetNestedExecutionScope<Scope extends ScraperExecutionScope> =
  Scope extends ScraperExecutionScope.ROUTINE
    ? ScraperExecutionScope.PROCEDURE
    : Scope extends ScraperExecutionScope.PROCEDURE
      ? ScraperExecutionScope.FLOW
      : Scope extends ScraperExecutionScope.FLOW
        ? ScraperExecutionScope.ACTION
        : Scope extends ScraperExecutionScope.ACTION
          ? ScraperExecutionScope.ACTION_STEP
          : never

export type ParsedScraperExecutionTree<
  Scope extends ScraperExecutionScope = ScraperExecutionScope,
> = {
  root: ParsedScraperExecution<Scope>
  nodes: Scope extends ScraperExecutionScope.ACTION_STEP
    ? null
    : ParsedScraperExecutionTree<GetNestedExecutionScope<Scope>>[]
}

const scopePriority: { [key in ScraperExecutionScope]: number } = {
  [ScraperExecutionScope.ROUTINE]: 5,
  [ScraperExecutionScope.PROCEDURE]: 4,
  [ScraperExecutionScope.FLOW]: 3,
  [ScraperExecutionScope.ACTION]: 2,
  [ScraperExecutionScope.ACTION_STEP]: 1,
}

function getScraperExecutionNodes(
  execution: ParsedScraperExecution[],
  fromIndex: number,
): ParsedScraperExecutionTree[] | null {
  if (fromIndex >= execution.length) {
    return []
  }

  const targetScopePriority = scopePriority[execution[fromIndex].start.scope]
  if (targetScopePriority < scopePriority[ScraperExecutionScope.ACTION_STEP]) {
    return null
  }

  const nodes: ParsedScraperExecutionTree[] = []

  for (let i = fromIndex; i < execution.length; i++) {
    if (scopePriority[execution[i].start.scope] === targetScopePriority) {
      nodes.push({
        root: execution[i],
        nodes:
          targetScopePriority <= scopePriority[ScraperExecutionScope.ACTION_STEP]
            ? null
            : ((i + 1 < execution.length &&
              scopePriority[execution[i + 1].start.scope] === targetScopePriority - 1
                ? getScraperExecutionNodes(execution, i + 1)
                : []) as ParsedScraperExecutionTree['nodes']),
      })
    } else if (scopePriority[execution[i].start.scope] > targetScopePriority) {
      break
    }
  }

  return nodes
}

export function parseScraperExecutionAsTree<Scope extends ScraperExecutionScope>(
  execution: ParsedScraperExecution[],
  rootScope: Scope,
): ParsedScraperExecutionTree<Scope>
export function parseScraperExecutionAsTree(
  execution: ParsedScraperExecution[],
): ParsedScraperExecutionTree
export function parseScraperExecutionAsTree<Scope extends ScraperExecutionScope>(
  execution: ParsedScraperExecution[],
  rootScope?: Scope,
) {
  if (rootScope) {
    while (
      execution.length &&
      scopePriority[execution[0].start.scope] !== scopePriority[rootScope]
    ) {
      execution.shift()
    }
  }

  if (!execution.length) {
    return null
  }

  const nodes = getScraperExecutionNodes(execution, 0)
  return nodes?.length ? (nodes[0] as ParsedScraperExecutionTree<Scope>) : null
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
