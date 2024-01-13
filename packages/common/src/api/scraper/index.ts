import { type Action, type ActionExecutionResult, type ActionStep } from './action'
import { type MapSiteError } from './common'
import type {
  FlowExecutionResult,
  FlowStep,
  Procedure,
  ProcedureExecutionResult,
} from './procedure'
import type { Routine, RoutineExecutionResult } from './routine'

export * from './action'
export * from './common'
export * from './dataSource'
export * from './procedure'
export * from './routine'
export * from './siteInstructions'

export enum ScraperMode {
  ROUTINE_EXECUTION,
  TESTING,
  PREVIEW,
}

export enum ScraperExecutionScope {
  ACTION_STEP = 'actionStep',
  ACTION = 'action',
  FLOW = 'flow',
  PROCEDURE = 'procedure',
  ROUTINE = 'routine',
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
  | {
      scope: ScraperExecutionScope.ROUTINE
      routine: Routine
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
  | {
      scope: ScraperExecutionScope.ROUTINE
      routineResult: RoutineExecutionResult
    }

export type ScraperExecutionFinishedSchema = {
  scope: ScraperExecutionScope
}
