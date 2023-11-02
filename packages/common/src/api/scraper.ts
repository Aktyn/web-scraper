import * as yup from 'yup'

import { transformNanToUndefined } from './common'

export enum ScraperMode {
  DEFAULT,
  TESTING,
  PREVIEW,
}

export interface SiteInstructions {
  id: number
  createdAt: Date
  siteId: number
  actions: Action[]
  procedures: Procedure[]
}

export enum CaptchaSolverType {
  SIMPLE = 'simpleCaptchaSolver',
}

export enum ActionStepErrorType {
  NO_ERROR = 'error.common.noError',
  UNKNOWN = 'error.common.unknown',
  UNKNOWN_STEP_TYPE = 'error.common.unknownStepType',
  ELEMENT_NOT_FOUND = 'error.common.elementNotFound',
  WAIT_FOR_NAVIGATION_ERROR = 'error.common.waitForNavigationError',
  INCORRECT_CAPTCHA = 'error.common.incorrectCaptcha',
  INCORRECT_LOGIN_OR_PASSWORD = 'error.common.incorrectLoginOrPassword',
  INCORRECT_VERIFICATION_CODE = 'error.common.incorrectVerificationCode',
  CAPTCHA_RECOGNITION_FAILED = 'error.internal.captchaRecognitionFailed',
  UNKNOWN_INTERNAL_ERROR = 'error.internal.unknown',
  INCORRECT_DATA = 'error.internal.incorrectData',
  OPTION_NOT_SELECTED = 'error.common.optionNotSelected',
}

export interface MapSiteError {
  /** Regexp pattern allowed */
  content?: string
  errorType: ActionStepErrorType
}

export enum ActionStepType {
  WAIT = 'wait',
  WAIT_FOR_ELEMENT = 'waitForElement',
  FILL_INPUT = 'fillInput',
  // UPLOAD_FILE = 'uploadFile', //TODO: support for file fields
  SELECT_OPTION = 'selectOption',
  PRESS_BUTTON = 'pressButton',
  // SOLVE_CAPTCHA = 'solveCaptcha', //TODO: support for captcha fields
  CHECK_ERROR = 'checkError',
  CHECK_SUCCESS = 'checkSuccess',
}

type ActionStepBase<Type extends ActionStepType, Data> = {
  id: number
  type: Type
  data: Data
  orderIndex: number
  actionId: number
}

export type ActionStep =
  | ActionStepBase<ActionStepType.WAIT, { duration: number }>
  | ActionStepBase<ActionStepType.WAIT_FOR_ELEMENT, { element: string; timeout?: number }>
  | ActionStepBase<
      ActionStepType.FILL_INPUT,
      { element: string; value: string; waitForElementTimeout?: number }
    >
  // | ActionStepBase<ActionStepType.UPLOAD_FILE, { element: string; value: string }>
  | ActionStepBase<
      ActionStepType.SELECT_OPTION,
      { element: string; value: string; waitForElementTimeout?: number }
    >
  | ActionStepBase<
      ActionStepType.PRESS_BUTTON,
      {
        element: string
        waitForNavigation?: boolean
        waitForElementTimeout?: number
        waitForNavigationTimeout?: number
      }
    >
  // | ActionStepBase<ActionStepType.SOLVE_CAPTCHA, { solver: CaptchaSolverType; elements: string[] }>
  | ActionStepBase<
      ActionStepType.CHECK_ERROR,
      { element: string; mapError: MapSiteError[]; waitForElementTimeout?: number }
    >
  | ActionStepBase<
      ActionStepType.CHECK_SUCCESS,
      {
        element: string
        mapSuccess: Omit<MapSiteError, 'errorType'>[]
        waitForElementTimeout?: number
      }
    >

export interface ActionExecutionResult {
  action: Action
  actionStepsResults: {
    step: ActionStep
    result: MapSiteError
  }[]
}

export interface Action {
  id: number
  name: string
  url: string | null
  siteInstructionsId: number
  actionSteps: ActionStep[]
}

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
  type: ProcedureType
  startUrl: string
  waitFor: string | null
  siteInstructionsId: number
  flow: FlowStep | null
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

const mapSiteErrorSchema = yup.object({
  content: yup.string().required('Content is required'),
  errorType: yup
    .mixed<ActionStepErrorType>()
    .oneOf(Object.values(ActionStepErrorType))
    .required('Error type is required'),
})

export const upsertActionStepSchema = yup.object({
  type: yup
    .mixed<ActionStepType>()
    .oneOf(Object.values(ActionStepType))
    .required('Type is required'),
  data: yup
    .object({
      duration: yup
        .number()
        .transform(transformNanToUndefined)
        .nullable()
        .default(null)
        .notRequired(),
      element: yup.string().nullable().default(null).notRequired(),
      value: yup.string().nullable().default(null).notRequired(),
      waitForNavigation: yup.boolean().nullable().default(null).notRequired(),
      solver: yup
        .mixed<CaptchaSolverType>()
        .oneOf(Object.values(CaptchaSolverType))
        .nullable()
        .default(null)
        .notRequired(),
      elements: yup.array().of(yup.string()).nullable().default([]).notRequired(),
      mapError: yup.array().of(mapSiteErrorSchema).nullable().default([]).notRequired(),
      mapSuccess: yup
        .array()
        .of(mapSiteErrorSchema.omit(['errorType']))
        .nullable()
        .default([])
        .notRequired(),
      timeout: yup
        .number()
        .transform(transformNanToUndefined)
        .nullable()
        .default(null)
        .notRequired(),
      waitForElementTimeout: yup
        .number()
        .transform(transformNanToUndefined)
        .nullable()
        .default(null)
        .notRequired(),
      waitForNavigationTimeout: yup
        .number()
        .transform(transformNanToUndefined)
        .nullable()
        .default(null)
        .notRequired(),
    })
    .partial()
    .nullable()
    .default(null)
    .notRequired(),
  orderIndex: yup.number().required(),
  actionId: yup.number().required(),
})

export const upsertActionSchema = yup.object({
  name: yup.string().default('').required('Name is required'),
  url: yup.string().nullable().default(null).notRequired(),
  siteInstructionsId: yup.number().required(),
  actionSteps: yup
    .array()
    .of(upsertActionStepSchema.omit(['actionId', 'orderIndex']))
    .default([])
    .required(),
})

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
    .matches(/^(action|global)\.[^.].*/, 'Action name is invalid')
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
  type: yup.mixed<ProcedureType>().oneOf(Object.values(ProcedureType)).required('Type is required'),
  startUrl: yup.string().default('').required('Start URL is required'),
  waitFor: yup.string().nullable().default(null).notRequired(),
  siteInstructionsId: yup.number().required(),
  flow: upsertFlowSchema.nullable().default(null).notRequired(),
})

export const upsertSiteInstructionsSchema = yup
  .object({
    procedures: yup
      .array()
      .of(upsertProcedureSchema.omit(['siteInstructionsId']))
      .default([])
      .required(),
    actions: yup
      .array()
      .of(upsertActionSchema.omit(['siteInstructionsId']))
      .test('unique', 'Multiple actions with the same name are not allowed', (value) =>
        value ? value.length === new Set(value.map((v) => v.name))?.size : true,
      )
      .default([])
      .required(),
  })
  .required()

export type UpsertSiteInstructionsSchema = yup.InferType<typeof upsertSiteInstructionsSchema>
