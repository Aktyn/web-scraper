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
  globalReturnValues: string | null
  onSuccess: FlowStep | null
  onFailure: FlowStep | null
}
