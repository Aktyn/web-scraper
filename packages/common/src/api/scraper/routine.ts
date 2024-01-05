import * as yup from 'yup'

import { transformNanToUndefined } from '../common'

import { DataSourceColumnType, type DataSourceItem } from './dataSource'
import type { Procedure } from './procedure'

export interface Routine {
  id: number
  name: string
  description?: string | null
  stopOnError?: boolean
  procedures: Procedure[]
  executionPlan:
    | {
        type: RoutineExecutionType.MATCH_SEQUENTIALLY
        dataSourceName: string
        filters: DataSourceFilter[]
        maximumIterations?: number
      }
    | {
        type: RoutineExecutionType.SPECIFIC_IDS | RoutineExecutionType.EXCEPT_SPECIFIC_IDS
        dataSourceName: string
        ids: DataSourceItem['id'][]
      }
    | {
        type: RoutineExecutionType.STANDALONE
        /** @default 1 */
        repeat?: number
      }
}

export enum RoutineExecutionType {
  /** Executes sequence of procedures sequentially for each filtered item in the data source */
  MATCH_SEQUENTIALLY = 'matchSequentially',

  /** Executes sequence of procedures according to a specified list of ids */
  SPECIFIC_IDS = 'specificIds',

  /** Executes sequence of procedures for all items in the data source except the ones specified in the list */
  EXCEPT_SPECIFIC_IDS = 'exceptSpecificIds',

  /**
   * Executes sequence of procedures without input data source.
   * Action steps relying on data source input will receive null.
   * This type of execution can be used for generating new data source items from static websites.
   */
  STANDALONE = 'standalone',
}

type DataSourceFilter =
  | {
      columnName: string
      columnType: DataSourceColumnType.TEXT
      where: DataSourceWhereFilter<DataSourceStringFilter>
    }
  | {
      columnName: string
      columnType: DataSourceColumnType.INTEGER | DataSourceColumnType.REAL
      where: DataSourceWhereFilter<DataSourceNumberFilter>
    }

type DataSourceWhereFilter<TypedFilter> =
  | TypedFilter
  | { AND: DataSourceWhereFilter<TypedFilter>[] }
  | { OR: DataSourceWhereFilter<TypedFilter>[] }

type DataSourceStringFilter =
  | string
  | {
      //TODO: remove unsupported filters
      equals?: string
      notEquals?: string
      in?: string[]
      notIn?: string[]
      contains?: string
      startsWith?: string
      endsWith?: string
      null?: true
      notNull?: true
    }

type DataSourceNumberFilter =
  | string
  | {
      //TODO: remove unsupported filters
      equals?: number
      notEquals?: number
      in?: number[]
      notIn?: number[]
      lt?: number
      lte?: number
      gt?: number
      gte?: number
      null?: true
      notNull?: true
    }

const buildWhereFilterSchema = <T extends yup.Lazy<unknown>>(typedSchema: T) =>
  yup.lazy((value) => {
    if (!value) {
      return typedSchema
    }
    if ('AND' in value) {
      return yup.object({
        //NOTE: yup.object() is meant here to be the upsertDataSourceFilterSchema recursively
        AND: yup.array().of(yup.object().required()).required().default([]),
      })
    } else if ('OR' in value) {
      return yup.object({
        //NOTE: yup.object() is meant here to be the upsertDataSourceFilterSchema recursively
        OR: yup.array().of(yup.object().required()).required().default([]),
      })
    }
    return typedSchema
  })

const upsertDataSourceStringFilterSchema = yup.lazy((value) => {
  if (typeof value === 'string') {
    return yup.string().required().default('')
  }
  return yup
    .object({
      equals: yup.string(),
      notEquals: yup.string(),
      in: yup.array().of(yup.string().default('').required()),
      notIn: yup.array().of(yup.string().default('').required()),
      contains: yup.string(),
      startsWith: yup.string(),
      endsWith: yup.string(),
      null: yup.boolean(),
      notNull: yup.boolean(),
    })
    .required()
})
export type UpsertDataSourceStringFilterSchema = yup.InferType<
  typeof upsertDataSourceStringFilterSchema
>

const upsertDataSourceStringWhereFilterSchema = buildWhereFilterSchema(
  upsertDataSourceStringFilterSchema,
)

const upsertDataSourceNumberFilterSchema = yup.lazy((value) => {
  if (typeof value === 'string') {
    return yup.string().required().default('')
  }
  return yup
    .object({
      equals: yup.number().transform(transformNanToUndefined),
      notEquals: yup.number().transform(transformNanToUndefined),
      in: yup.array().of(yup.number().default(0).required().transform(transformNanToUndefined)),
      notIn: yup.array().of(yup.number().default(0).required().transform(transformNanToUndefined)),
      lt: yup.number().transform(transformNanToUndefined),
      lte: yup.number().transform(transformNanToUndefined),
      gt: yup.number().transform(transformNanToUndefined),
      gte: yup.number().transform(transformNanToUndefined),
      null: yup.boolean(),
      notNull: yup.boolean(),
    })
    .required()
})
export type UpsertDataSourceNumberFilterSchema = yup.InferType<
  typeof upsertDataSourceNumberFilterSchema
>

const upsertDataSourceNumberWhereFilterSchema = buildWhereFilterSchema(
  upsertDataSourceNumberFilterSchema,
)

const upsertDataSourceFilterSchema = yup.lazy((value) => {
  const columnNameSchema = yup.string().required().default('')

  switch (value?.columnType as DataSourceColumnType) {
    case DataSourceColumnType.TEXT:
      return yup.object({
        columnName: columnNameSchema,
        columnType: yup.string().oneOf([DataSourceColumnType.TEXT]).required(),
        where: upsertDataSourceStringWhereFilterSchema,
      })
    case DataSourceColumnType.INTEGER:
    case DataSourceColumnType.REAL:
      return yup.object({
        columnName: columnNameSchema,
        columnType: yup
          .string()
          .oneOf([DataSourceColumnType.INTEGER, DataSourceColumnType.REAL])
          .required(),
        where: upsertDataSourceNumberWhereFilterSchema,
      })
  }
  return yup.object().strip()
})

export type UpsertDataSourceFilterSchema = yup.InferType<typeof upsertDataSourceFilterSchema>

export const upsertMatchSequentiallyExecutionPlanSchema = yup.object({
  type: yup.string().oneOf([RoutineExecutionType.MATCH_SEQUENTIALLY]).required(),
  dataSourceName: yup.string().required().default(''),
  maximumIterations: yup
    .number()
    .integer()
    .min(1)
    .default(1)
    .notRequired()
    .transform(transformNanToUndefined),
  filters: yup.array().of(upsertDataSourceFilterSchema).nullable().default([]).notRequired(),
})

export const upsertSpecificIdsExecutionPlanSchema = yup.object({
  type: yup
    .string()
    .oneOf([RoutineExecutionType.SPECIFIC_IDS, RoutineExecutionType.EXCEPT_SPECIFIC_IDS])
    .required(),
  dataSourceName: yup.string().required().default(''),
  ids: yup
    .array()
    .of(yup.number().required())
    .min(1, 'There must be at least one id selected')
    .default([])
    .required(),
})

export const upsertStandaloneExecutionPlanSchema = yup.object({
  type: yup.string().oneOf([RoutineExecutionType.STANDALONE]).required(),
  repeat: yup
    .number()
    .integer()
    .min(1)
    .default(1)
    .nullable()
    .notRequired()
    .transform(transformNanToUndefined),
})

export const upsertRoutineSchema = yup
  .object({
    name: yup.string().required('Name is required'),
    description: yup.string().nullable().default(null).notRequired(),
    stopOnError: yup.boolean().default(false).required(),
    procedureIds: yup
      .array()
      .of(yup.number().min(0).required())
      .min(1, 'There must be at least one procedure selected')
      .default([])
      .required(),
    executionPlan: yup.lazy((value) => {
      switch (value?.type as RoutineExecutionType) {
        case RoutineExecutionType.MATCH_SEQUENTIALLY:
          return upsertMatchSequentiallyExecutionPlanSchema
        case RoutineExecutionType.SPECIFIC_IDS:
        case RoutineExecutionType.EXCEPT_SPECIFIC_IDS:
          return upsertSpecificIdsExecutionPlanSchema
        case RoutineExecutionType.STANDALONE:
          return upsertStandaloneExecutionPlanSchema
      }
      return yup.object().strip()
    }),
  })
  .required()

export type UpsertRoutineSchema = yup.InferType<typeof upsertRoutineSchema>
