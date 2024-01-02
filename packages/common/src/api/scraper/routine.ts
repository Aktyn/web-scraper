import * as yup from 'yup'

import { transformNanToUndefined } from '../common'

import type { DataSourceColumnType, DataSourceItem } from './dataSource'
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
        filter: DataSourceFilter
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
      valueType: DataSourceColumnType.TEXT
      where: DataSourceWhereFilter<DataSourceStringFilter>
    }
  | {
      columnName: string
      valueType: DataSourceColumnType.INTEGER | DataSourceColumnType.REAL
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
      equals?: string | null
      notEquals?: string | null
      in?: string[]
      notIn?: string[]
      lt?: string
      lte?: string
      gt?: string
      gte?: string
      contains?: string
      startsWith?: string
      endsWith?: string
    }

type DataSourceNumberFilter =
  | string
  | {
      //TODO: remove unsupported filters
      equals?: number | null
      notEquals?: number | null
      in?: number[]
      notIn?: number[]
      lt?: number
      lte?: number
      gt?: number
      gte?: number
    }

export const upsertMatchSequentiallyExecutionPlanSchema = yup.object({
  type: yup.string().oneOf([RoutineExecutionType.MATCH_SEQUENTIALLY]).required(),
  dataSourceName: yup.string().required().default(''),
  filter: yup.object().required(), //TODO: more detailed validation
  maximumIterations: yup
    .number()
    .integer()
    .min(1)
    .default(1)
    .notRequired()
    .transform(transformNanToUndefined),
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
