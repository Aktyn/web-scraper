import { z } from 'zod'

import type { Site } from '../site'

import type { Action, ActionExecutionResult } from './action'
import type { MapSiteError } from './common'

export enum GlobalActionType {
  FINISH = 'finishProcedure',
  FINISH_WITH_ERROR = 'finishProcedureWithError',
  FINISH_WITH_NOTIFICATION = 'finishProcedureWithNotification',
}

export interface FlowExecutionResult {
  flow: FlowStep
  flowStepsResults: {
    flowStep: ShallowFlowStep
    actionResult: ActionExecutionResult | null
    returnedValues: (string | { error: string })[]
    succeeded: boolean
  }[]
}

export const REGULAR_ACTION_PREFIX = 'action' as const
export const GLOBAL_ACTION_PREFIX = 'global' as const

export function isRegularAction(
  actionName: FlowStep['actionName'],
): actionName is FlowStep['actionName'] & `${typeof REGULAR_ACTION_PREFIX}.${string}` {
  return actionName.startsWith(`${REGULAR_ACTION_PREFIX}.`)
}

export function isGlobalAction(
  actionName: FlowStep['actionName'],
): actionName is FlowStep['actionName'] & `${typeof GLOBAL_ACTION_PREFIX}.${GlobalActionType}` {
  return actionName.startsWith(`${GLOBAL_ACTION_PREFIX}.`)
}

export function isFinishGlobalAction(actionName: FlowStep['actionName']) {
  return (
    actionName === `${GLOBAL_ACTION_PREFIX}.${GlobalActionType.FINISH}` ||
    actionName === `${GLOBAL_ACTION_PREFIX}.${GlobalActionType.FINISH_WITH_ERROR}` ||
    actionName === `${GLOBAL_ACTION_PREFIX}.${GlobalActionType.FINISH_WITH_NOTIFICATION}`
  )
}

export interface FlowStep {
  id: number
  actionName:
    | `${typeof REGULAR_ACTION_PREFIX}.${Action['name']}`
    | `${typeof GLOBAL_ACTION_PREFIX}.${GlobalActionType}`

  /** Regex pattern allowed */
  globalReturnValues: string[]
  onSuccess: FlowStep | null
  onFailure: FlowStep | null
}

export type ShallowFlowStep = Omit<FlowStep, 'onSuccess' | 'onFailure'>

export enum ProcedureType {
  ACCOUNT_CHECK = 'accountCheck',
  DATA_RETRIEVAL = 'dataRetrieval',
  MONITORING = 'monitoring',
  CUSTOM = 'custom',
}

export interface ProcedureExecutionResult {
  procedure: Procedure
  flowExecutionResult: FlowExecutionResult | MapSiteError
}

export function hasProcedureExecutionFailed(procedureExecutionResult: ProcedureExecutionResult) {
  return 'errorType' in procedureExecutionResult.flowExecutionResult
    ? true
    : !procedureExecutionResult.flowExecutionResult.flowStepsResults.at(-1)?.succeeded
}

export interface Procedure {
  id: number
  name: string
  type: ProcedureType
  startUrl: string
  waitFor: string | null
  siteInstructionsId: number
  flow: FlowStep | null
}

export interface SiteProcedures {
  site: Site
  procedures: Procedure[]
}

type FlowSchemaTypeHelper = z.ZodObject<{
  actionName: z.ZodString
  globalReturnValues: z.ZodArray<z.ZodString, 'many'>
  onSuccess: z.ZodUnion<[z.ZodObject<Record<string, z.ZodTypeAny>>, z.ZodNull]>
  onFailure: z.ZodUnion<[z.ZodObject<Record<string, z.ZodTypeAny>>, z.ZodNull]>
}>

const upsertFlowSchema = z.object({
  actionName: z.string().regex(/^(action|global)\.[^.]+$/, 'Action name is invalid'),
  globalReturnValues: z.array(z.string().min(1, 'Value is required')),
  onSuccess: z.lazy(() => z.union([upsertFlowSchema, z.null()])),
  onFailure: z.lazy(() => z.union([upsertFlowSchema, z.null()])),
}) as unknown as FlowSchemaTypeHelper

export const upsertProcedureSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  type: z.enum(Object.values(ProcedureType) as [string, ...string[]]),
  startUrl: z.string().default('{{URL.ORIGIN}}'),
  waitFor: z.string().nullable().default(null).optional(),
  siteInstructionsId: z.number(),
  flow: z.union([upsertFlowSchema, z.null()]).default(null).optional(),
})

export type UpsertProcedureSchema = z.infer<typeof upsertProcedureSchema>
