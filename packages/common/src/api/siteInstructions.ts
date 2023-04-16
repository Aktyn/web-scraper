import * as yup from 'yup'

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
  INCORRECT_CAPTCHA = 'error.common.incorrectCaptcha',
  INCORRECT_LOGIN_OR_PASSWORD = 'error.common.incorrectLoginOrPassword',
  INCORRECT_VERIFICATION_CODE = 'error.common.incorrectVerificationCode',
  CAPTCHA_RECOGNITION_FAILED = 'error.internal.captchaRecognitionFailed',
  UNKNOWN_INTERNAL_ERROR = 'error.internal.unknown',
  INCORRECT_DATA = 'error.internal.incorrectData',
}

export interface MapSiteError {
  /** Regexp pattern allowed */
  content: string
  errorType: ActionStepErrorType
}

export enum ActionStepType {
  WAIT = 'wait',
  WAIT_FOR_ELEMENT = 'waitForElement',
  FILL_INPUT = 'fillInput',
  UPLOAD_FILE = 'uploadFile',
  SELECT_OPTION = 'selectOption',
  PRESS_BUTTON = 'pressButton',
  SOLVE_CAPTCHA = 'solveCaptcha',
  CHECK_ERROR = 'checkError',
  CHECK_SUCCESS = 'checkSuccess',
}

type ActionStepBase<Type extends ActionStepType, Data> = {
  id: number
  type: Type
  data: Data | null
  orderIndex: number
  actionId: number
}

export type ActionStep =
  | ActionStepBase<ActionStepType.WAIT, { duration: number }>
  | ActionStepBase<ActionStepType.WAIT_FOR_ELEMENT, { element: string }>
  | ActionStepBase<ActionStepType.FILL_INPUT, { element: string; value: string }>
  | ActionStepBase<ActionStepType.UPLOAD_FILE, { element: string; value: string }>
  | ActionStepBase<ActionStepType.SELECT_OPTION, { element: string; value: string }>
  | ActionStepBase<ActionStepType.PRESS_BUTTON, { element: string; waitForNavigation?: boolean }>
  | ActionStepBase<ActionStepType.SOLVE_CAPTCHA, { solver: CaptchaSolverType; elements: string[] }>
  | ActionStepBase<ActionStepType.CHECK_ERROR, { element: string; mapError: MapSiteError[] }>
  | ActionStepBase<ActionStepType.CHECK_SUCCESS, { element: string; mapSuccess: MapSiteError[] }>

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
}

export enum ProcedureType {
  LOGIN = 'login',
}

export interface Procedure {
  id: number
  type: ProcedureType
  startUrl: string
  waitFor: string | null
  siteInstructionsId: number
  flow: FlowStep | null
}

export interface FlowStep {
  id: number
  actionName: `action.${Action['name']}` | `global.${GlobalActionType}`
  globalReturnValues: string[]
  onSuccess: FlowStep | null
  onFailure: FlowStep | null
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
      duration: yup.number().nullable().default(null).notRequired(),
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
      mapSuccess: yup.array().of(mapSiteErrorSchema).nullable().default([]).notRequired(),
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
