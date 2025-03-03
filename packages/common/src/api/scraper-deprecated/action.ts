//TODO: remove this file and all unused types
import { z } from 'zod'

import type { MapSiteError } from './common'

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
  DATA_SOURCE_NOT_FOUND = 'error.common.dataSourceNotFound',
  DATA_SOURCE_COLUMN_NOT_FOUND = 'error.common.dataSourceColumnNotFound',
}

export enum ActionStepType {
  WAIT = 'wait',
  WAIT_FOR_ELEMENT = 'waitForElement',
  FILL_INPUT = 'fillInput',
  // UPLOAD_FILE = 'uploadFile', //TODO: support for file fields
  SELECT_OPTION = 'selectOption',
  PRESS_BUTTON = 'pressButton',
  // SOLVE_CAPTCHA = 'solveCaptcha', //TODO: support for captcha fields
  SAVE_TO_DATA_SOURCE = 'saveToDataSource',
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

export enum ValueQueryType {
  DATA_SOURCE = 'DataSource',
  CUSTOM = 'Custom',
}

/** DataSource.DataSourceName.ColumnName */
export type DataSourceValueQuery = `${ValueQueryType.DATA_SOURCE}.${string}.${string}`
type CustomValueQuery = `${ValueQueryType.CUSTOM}.${string}`
export type ValueQuery = DataSourceValueQuery | CustomValueQuery

export function isCustomValueQuery(valueQuery: ValueQuery): valueQuery is CustomValueQuery {
  return valueQuery.startsWith(ValueQueryType.CUSTOM + '.')
}

export function isDataSourceValueQuery(valueQuery: ValueQuery): valueQuery is DataSourceValueQuery {
  return valueQuery.startsWith(ValueQueryType.DATA_SOURCE + '.')
}

export enum SaveDataType {
  ELEMENT_CONTENT = 'elementContent',
  CUSTOM = 'custom',
  CURRENT_TIMESTAMP = 'currentTimestamp',
  SET_NULL = 'setNull',
}

export type ActionStep =
  | ActionStepBase<ActionStepType.WAIT, { duration: number }>
  | ActionStepBase<ActionStepType.WAIT_FOR_ELEMENT, { element: string; timeout?: number }>
  | ActionStepBase<
      ActionStepType.FILL_INPUT,
      {
        element: string
        valueQuery: ValueQuery
        pressEnter?: boolean
        delayEnter?: number
        waitForNavigation?: boolean
        waitForNavigationTimeout?: number
        waitForElementTimeout?: number
      }
    >
  // | ActionStepBase<ActionStepType.UPLOAD_FILE, { element: string; value: string }>
  | ActionStepBase<
      ActionStepType.SELECT_OPTION,
      { element: string; valueQuery: ValueQuery; waitForElementTimeout?: number }
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
      ActionStepType.SAVE_TO_DATA_SOURCE,
      {
        dataSourceQuery: DataSourceValueQuery
        saveDataType: SaveDataType
        /**
         ** Element JS path if saveDataType == SaveDataType.ELEMENT_CONTENT
         ** Any user provided string if saveDataType == SaveDataType.CUSTOM
         ** Not used for other dataTypes
         * */
        saveToDataSourceValue?: string
      }
    >
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

export const valueQueryRegex = new RegExp(
  `^(${ValueQueryType.DATA_SOURCE}\\.[^.]+\\.[^.]+)|(${ValueQueryType.CUSTOM}\\..*)$`,
  'u',
)
export const dataSourceQueryRegex = new RegExp(
  `^${ValueQueryType.DATA_SOURCE}\\.[^.]+\\.[^.]+$`,
  'u',
)

const mapSiteErrorSchema = z.object({
  content: z.string().min(1, 'Content is required'),
  errorType: z.enum(Object.values(ActionStepErrorType) as [string, ...string[]]),
})

export const upsertActionStepSchema = z.object({
  type: z.enum(Object.values(ActionStepType) as [string, ...string[]]),
  data: z
    .object({
      duration: z.number().nullable().default(null).optional(),
      element: z.string().nullable().default(null).optional(),
      valueQuery: z
        .string()
        .nullable()
        .default(null)
        .optional()
        .refine(
          (val) => !val || valueQueryRegex.test(val),
          'Must be a path to data source column or Custom.anything',
        ),
      dataSourceQuery: z
        .string()
        .nullable()
        .default(null)
        .optional()
        .refine((val) => !val || dataSourceQueryRegex.test(val), 'Must be a path to data source'),
      saveDataType: z
        .enum(Object.values(SaveDataType) as [string, ...string[]])
        .nullable()
        .default(null)
        .optional(),
      saveToDataSourceValue: z.string().nullable().default(null).optional(),
      waitForNavigation: z.boolean().nullable().default(null).optional(),
      pressEnter: z.boolean().nullable().default(null).optional(),
      delayEnter: z.number().nullable().default(null).optional(),
      solver: z
        .enum(Object.values(CaptchaSolverType) as [string, ...string[]])
        .nullable()
        .default(null)
        .optional(),
      elements: z.array(z.string()).nullable().default([]).optional(),
      mapError: z.array(mapSiteErrorSchema).nullable().default([]).optional(),
      mapSuccess: z
        .array(mapSiteErrorSchema.omit({ errorType: true }))
        .nullable()
        .default([])
        .optional(),
      timeout: z.number().nullable().default(null).optional(),
      waitForElementTimeout: z.number().nullable().default(null).optional(),
      waitForNavigationTimeout: z.number().nullable().default(null).optional(),
    })
    .partial()
    .nullable()
    .default(null)
    .optional(),
  orderIndex: z.number(),
  actionId: z.number(),
})

export const upsertActionSchema = z.object({
  name: z.string().min(1, 'Name is required').default(''),
  url: z.string().nullable().default(null).optional(),
  siteInstructionsId: z.number(),
  actionSteps: z
    .array(upsertActionStepSchema.omit({ actionId: true, orderIndex: true }))
    .default([]),
})

export type UpsertActionSchema = z.infer<typeof upsertActionSchema>
