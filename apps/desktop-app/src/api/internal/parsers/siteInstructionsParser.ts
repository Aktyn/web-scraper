import type { ActionStep as DatabaseActionStep } from '@prisma/client'
import {
  type Action,
  type ActionStep,
  type ActionStepType,
  type FlowStep,
  pick,
  type Procedure,
  type ProcedureType,
  type SiteInstructions,
  tryParseJSON,
} from '@web-scraper/common'

import type { getSiteInstructions } from '../../../database/siteInstructions'

type GetSiteInstructionsResponse = Awaited<ReturnType<typeof getSiteInstructions>>

export function parseDatabaseSiteInstructions(
  siteInstructionsData: GetSiteInstructionsResponse,
): SiteInstructions {
  return {
    ...pick(siteInstructionsData, 'id', 'createdAt', 'siteId'),
    actions: siteInstructionsData.Actions.map(parseDatabaseAction),
    procedures: siteInstructionsData.Procedures.map(parseDatabaseProcedure),
  }
}

export function parseDatabaseAction(
  action: GetSiteInstructionsResponse['Actions'][number],
): Action {
  return {
    ...pick(action, 'id', 'name', 'url', 'siteInstructionsId'),
    actionSteps: action.ActionSteps.map(parseDatabaseActionStep),
  }
}

function parseDatabaseActionStep(actionStep: DatabaseActionStep): ActionStep {
  return {
    ...pick(actionStep, 'id', 'orderIndex', 'actionId'),
    type: actionStep.type as ActionStepType,
    data: tryParseJSON<ActionStep['data']>(actionStep.data) as never,
  }
}

export function parseDatabaseProcedure(
  procedure: GetSiteInstructionsResponse['Procedures'][number],
): Procedure {
  return {
    ...pick(procedure, 'id', 'name', 'startUrl', 'waitFor', 'siteInstructionsId'),
    type: procedure.type as ProcedureType,
    flow: parseDatabaseFlowStep(procedure.FlowStep),
  }
}

function parseDatabaseFlowStep(
  flowStep: GetSiteInstructionsResponse['Procedures'][number]['FlowStep'],
): FlowStep | null {
  if (!flowStep) {
    return null
  }
  return {
    ...pick(flowStep, 'id'),
    globalReturnValues: tryParseJSON<FlowStep['globalReturnValues']>(
      flowStep.globalReturnValues,
      [],
    ),
    actionName: flowStep.actionName as FlowStep['actionName'],
    onSuccess: parseDatabaseFlowStep(flowStep.OnSuccessFlowStep),
    onFailure: parseDatabaseFlowStep(flowStep.OnFailureFlowStep),
  }
}
