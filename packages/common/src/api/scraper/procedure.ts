import * as yup from 'yup'

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

type FlowSchemaTypeHelper = yup.ObjectSchema<
  {
    actionName: string
    globalReturnValues: string[]
    onSuccess: object | null
    onFailure: object | null
  },
  yup.AnyObject,
  {
    actionName: undefined
    globalReturnValues: string[]
    onSuccess: null
    onFailure: null
  },
  ''
>

const upsertFlowSchema: FlowSchemaTypeHelper = yup.object({
  actionName: yup
    .string()
    .matches(/^(action|global)\.[^.]+$/, 'Action name is invalid')
    .required('Action name is required'),
  globalReturnValues: yup
    .array()
    .of(yup.string().required('Value is required'))
    .default([])
    .required('Global return values are required'),
  onSuccess: yup.lazy(() =>
    upsertFlowSchema.nullable().default(null).notRequired(),
  ) as unknown as yup.ObjectSchema<yup.AnyObject>,
  onFailure: yup.lazy(() =>
    upsertFlowSchema.nullable().default(null).notRequired(),
  ) as unknown as yup.ObjectSchema<yup.AnyObject>,
})

export const upsertProcedureSchema = yup.object({
  name: yup.string().required('Name is required'),
  type: yup.mixed<ProcedureType>().oneOf(Object.values(ProcedureType)).required('Type is required'),
  startUrl: yup.string().default('').required('Start URL is required'),
  waitFor: yup.string().nullable().default(null).notRequired(),
  siteInstructionsId: yup.number().required(),
  flow: upsertFlowSchema.nullable().default(null).notRequired(),
})

export function isFinishGlobalAction(actionName: FlowStep['actionName']) {
  return (
    actionName === `${GLOBAL_ACTION_PREFIX}.${GlobalActionType.FINISH}` ||
    actionName === `${GLOBAL_ACTION_PREFIX}.${GlobalActionType.FINISH_WITH_ERROR}` ||
    actionName === `${GLOBAL_ACTION_PREFIX}.${GlobalActionType.FINISH_WITH_NOTIFICATION}`
  )
}
