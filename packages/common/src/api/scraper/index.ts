import { type Action, type ActionExecutionResult, type ActionStep } from './action'
import { type MapSiteError } from './common'
import type {
  FlowExecutionResult,
  FlowStep,
  Procedure,
  ProcedureExecutionResult,
} from './procedure'

export * from './common'
export * from './action'
export * from './procedure'
export * from './siteInstructions'
export * from './routine'
export * from './dataSource'

export enum ScraperMode {
  DEFAULT,
  TESTING,
  PREVIEW,
}

export enum ScraperExecutionScope {
  ACTION_STEP = 'actionStep',
  ACTION = 'action',
  FLOW = 'flow',
  PROCEDURE = 'procedure',
}

export type ScraperExecutionStartSchema =
  | {
      scope: ScraperExecutionScope.ACTION_STEP
      actionStep: ActionStep
    }
  | {
      scope: ScraperExecutionScope.ACTION
      action: Action
    }
  | {
      scope: ScraperExecutionScope.FLOW
      flow: FlowStep
    }
  | {
      scope: ScraperExecutionScope.PROCEDURE
      procedure: Procedure
    }

export type ScraperExecutionResultSchema =
  | {
      scope: ScraperExecutionScope.ACTION_STEP
      actionStepResult: MapSiteError
    }
  | {
      scope: ScraperExecutionScope.ACTION
      actionResult: ActionExecutionResult['actionStepsResults']
    }
  | {
      scope: ScraperExecutionScope.FLOW
      flowResult: FlowExecutionResult['flowStepsResults']
    }
  | {
      scope: ScraperExecutionScope.PROCEDURE
      procedureResult: ProcedureExecutionResult['flowExecutionResult']
    }

export type ScraperExecutionFinishedSchema = {
  scope: ScraperExecutionScope
}
