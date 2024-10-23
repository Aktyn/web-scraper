//TODO: remove this file and all unused types

import * as yup from 'yup'

import { transformNanToUndefined } from '../common'

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
        .notRequired()
        .nullable()
        .default(null)
        .transform(transformNanToUndefined),
      element: yup.string().notRequired().nullable().default(null),
      valueQuery: yup
        .string()
        .notRequired()
        .nullable()
        .default(null)
        .matches(valueQueryRegex, 'Must be a path to data source column or Custom.anything'),
      dataSourceQuery: yup
        .string()
        .notRequired()
        .nullable()
        .default(null)
        .matches(dataSourceQueryRegex, 'Must be a path to data source'),
      saveDataType: yup
        .mixed<SaveDataType>()
        .notRequired()
        .oneOf(Object.values(SaveDataType))
        .nullable()
        .default(null),
      saveToDataSourceValue: yup.string().notRequired().nullable().default(null),
      waitForNavigation: yup.boolean().nullable().default(null).notRequired(),
      pressEnter: yup.boolean().nullable().default(null).notRequired(),
      delayEnter: yup
        .number()
        .transform(transformNanToUndefined)
        .nullable()
        .default(null)
        .notRequired(),
      solver: yup
        .mixed<CaptchaSolverType>()
        .notRequired()
        .oneOf(Object.values(CaptchaSolverType))
        .nullable()
        .default(null),
      elements: yup.array().of(yup.string()).notRequired().nullable().default([]),
      mapError: yup.array().of(mapSiteErrorSchema).notRequired().nullable().default([]),
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
