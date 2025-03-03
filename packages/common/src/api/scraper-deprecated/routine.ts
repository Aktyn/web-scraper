import { z } from 'zod'

import { ErrorCode } from '../../error'
import type { ApiError } from '../common'

import { DataSourceColumnType, type DataSourceItem, type DataSourceStructure } from './dataSource'
import type { Procedure, ProcedureExecutionResult } from './procedure'

function transformNanToUndefined(value: number | null | undefined) {
  return value === undefined || value === null ? undefined : Number(value)
}

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

/** Result for single iteration of routine execution */
export interface RoutineExecutionResult {
  routine: Routine
  source: { dataSource: DataSourceStructure; item: DataSourceItem } | null
  proceduresExecutionResults: ProcedureExecutionResult[]
}

export type RoutineExecutionHistory = {
  id: number
  createdAt: Date
  routineName: string
  routineId: Routine['id']
  iterationIndex: number
  results: RoutineExecutionResult
}[]

export enum RoutineExecutionType {
  /** Executes sequence of procedures sequentially for each filtered item in the data source */
  MATCH_SEQUENTIALLY = 'matchSequentially',

  /** Executes sequence of procedures according to a specified list of ids */
  SPECIFIC_IDS = 'specificIds',

  /** Executes sequence of procedures for all items in the data source except the ones specified in the list */
  EXCEPT_SPECIFIC_IDS = 'exceptSpecificIds',

  /**
   * Executes sequence of procedures without input data source.
   * Action steps relying on data source input will request user for data (similarly to testing site instructions).
   * This type of execution can be used for generating new data source items from static websites.
   */
  STANDALONE = 'standalone',
}

export type DataSourceFilter =
  | {
      columnName: string
      columnType: DataSourceColumnType.TEXT
      /** String value will be interpreted as custom sqlite code */
      where: DataSourceWhereFilter<DataSourceStringFilter>
    }
  | {
      columnName: string
      columnType: DataSourceColumnType.INTEGER | DataSourceColumnType.REAL
      /** String value will be interpreted as custom sqlite code */
      where: DataSourceWhereFilter<DataSourceNumberFilter>
    }

type DataSourceWhereFilter<TypedFilter> =
  | TypedFilter
  | { AND: DataSourceFilter[] }
  | { OR: DataSourceFilter[] }

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
      null?: boolean
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
      null?: boolean
    }

const buildWhereFilterSchema = <T extends z.ZodType>(typedSchema: T) =>
  z.lazy(() => {
    return z.union([
      typedSchema,
      z.object({
        AND: z.array(z.lazy(() => upsertDataSourceFilterSchema)).min(1),
      }),
      z.object({
        OR: z.array(z.lazy(() => upsertDataSourceFilterSchema)).min(1),
      }),
    ])
  })

const upsertDataSourceStringFilterSchema = z.lazy(() =>
  z.union([
    z.string().default(''),
    z.object({
      equals: z.string().optional(),
      notEquals: z.string().optional(),
      in: z.array(z.string()).optional(),
      notIn: z.array(z.string()).optional(),
      contains: z.string().optional(),
      startsWith: z.string().optional(),
      endsWith: z.string().optional(),
      null: z.boolean().optional(),
    }),
  ]),
)
export type UpsertDataSourceStringFilterSchema = z.infer<typeof upsertDataSourceStringFilterSchema>

const upsertDataSourceNumberFilterSchema = z.lazy(() =>
  z.union([
    z.string().default(''),
    z.object({
      equals: z.preprocess((val) => Number(val), z.number()).optional(),
      notEquals: z.preprocess((val) => Number(val), z.number()).optional(),
      in: z.array(z.preprocess((val) => Number(val), z.number())).optional(),
      notIn: z.array(z.preprocess((val) => Number(val), z.number())).optional(),
      lt: z.preprocess((val) => Number(val), z.number()).optional(),
      lte: z.preprocess((val) => Number(val), z.number()).optional(),
      gt: z.preprocess((val) => Number(val), z.number()).optional(),
      gte: z.preprocess((val) => Number(val), z.number()).optional(),
      null: z.boolean().optional(),
    }),
  ]),
)
export type UpsertDataSourceNumberFilterSchema = z.infer<typeof upsertDataSourceNumberFilterSchema>

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const upsertDataSourceFilterSchema = z.lazy((): any =>
  z.object({
    columnName: z.string().min(1),
    columnType: z.enum(Object.values(DataSourceColumnType) as [string, ...string[]]),
    where: buildWhereFilterSchema(
      z.union([upsertDataSourceStringFilterSchema, upsertDataSourceNumberFilterSchema]),
    ),
  }),
)

export type UpsertDataSourceFilterSchema = z.infer<typeof upsertDataSourceFilterSchema>

export const upsertMatchSequentiallyExecutionPlanSchema = z.object({
  type: z.literal(RoutineExecutionType.MATCH_SEQUENTIALLY),
  dataSourceName: z.string().default(''),
  maximumIterations: z
    .number()
    .int()
    .transform((value) => value)
    .nullable()
    .transform((value) => (value === null ? null : value < 1 ? 1 : value))
    .default(null)
    .optional()
    .transform(transformNanToUndefined),
  filters: z.array(upsertDataSourceFilterSchema).nullable().default([]).optional(),
})

export const upsertSpecificIdsExecutionPlanSchema = z.object({
  type: z.enum([RoutineExecutionType.SPECIFIC_IDS, RoutineExecutionType.EXCEPT_SPECIFIC_IDS]),
  dataSourceName: z.string().default(''),
  ids: z.array(z.number()).min(1, 'There must be at least one id selected').default([]),
})

export const upsertStandaloneExecutionPlanSchema = z.object({
  type: z.literal(RoutineExecutionType.STANDALONE),
  repeat: z
    .number()
    .int()
    .min(1)
    .default(1)
    .nullable()
    .optional()
    .transform(transformNanToUndefined),
})

export const upsertRoutineSchema = z
  .object({
    name: z.string().min(1, 'Name is required'),
    description: z.string().nullable().default(null).optional(),
    stopOnError: z.boolean().default(true).optional(),
    procedureIds: z
      .array(z.number().min(0))
      .min(1, 'There must be at least one procedure selected')
      .default([]),
    executionPlan: z.lazy(() =>
      z.discriminatedUnion('type', [
        z.object({
          type: z.literal(RoutineExecutionType.MATCH_SEQUENTIALLY),
          dataSourceName: z.string().default(''),
          maximumIterations: z
            .number()
            .int()
            .transform((value) => value)
            .nullable()
            .transform((value) => (value === null ? null : value < 1 ? 1 : value))
            .default(null)
            .optional()
            .transform(transformNanToUndefined),
          filters: z.array(upsertDataSourceFilterSchema).nullable().default([]).optional(),
        }),
        z.object({
          type: z.enum([
            RoutineExecutionType.SPECIFIC_IDS,
            RoutineExecutionType.EXCEPT_SPECIFIC_IDS,
          ]),
          dataSourceName: z.string().default(''),
          ids: z.array(z.number()).min(1, 'There must be at least one id selected').default([]),
        }),
        z.object({
          type: z.literal(RoutineExecutionType.STANDALONE),
          repeat: z
            .number()
            .int()
            .min(1)
            .default(1)
            .nullable()
            .optional()
            .transform(transformNanToUndefined),
        }),
      ]),
    ),
  })
  .required()

export type UpsertRoutineSchema = z.infer<typeof upsertRoutineSchema>

function dataSourceFilterToSqlite(filter: DataSourceFilter) {
  if (typeof filter.where === 'string') {
    return filter.where
  }

  const safeColumnName = `\`${filter.columnName}\``

  if ('AND' in filter.where) {
    return `(${
      typeof filter.where.AND === 'string'
        ? filter.where.AND
        : dataSourceFiltersToSqlite(filter.where.AND)
    })`
  }
  if ('OR' in filter.where) {
    return `(${
      typeof filter.where.OR === 'string'
        ? filter.where.OR
        : dataSourceFiltersToSqlite(filter.where.OR, 'OR')
    })`
  }

  if (filter.where.null !== undefined) {
    return `${safeColumnName} IS ${filter.where.null ? 'NULL' : 'NOT NULL'}`
  }

  switch (filter.columnType) {
    case DataSourceColumnType.TEXT:
      if (filter.where.equals !== undefined) return `${safeColumnName} = '${filter.where.equals}'`
      if (filter.where.notEquals !== undefined)
        return `${safeColumnName} != '${filter.where.notEquals}'`
      if (filter.where.in !== undefined)
        return `${safeColumnName} IN (${filter.where.in.map((v) => `'${v}'`).join(', ')})`
      if (filter.where.notIn !== undefined)
        return `${safeColumnName} NOT IN (${filter.where.notIn.map((v) => `'${v}'`).join(', ')})`
      if (filter.where.contains !== undefined)
        return `${safeColumnName} LIKE '%${filter.where.contains}%'`
      if (filter.where.startsWith !== undefined)
        return `${safeColumnName} LIKE '${filter.where.startsWith}%'`
      if (filter.where.endsWith !== undefined)
        return `${safeColumnName} LIKE '%${filter.where.endsWith}'`

      return null
    case DataSourceColumnType.INTEGER:
    case DataSourceColumnType.REAL:
      if (filter.where.equals !== undefined) return `${safeColumnName} = ${filter.where.equals}`
      if (filter.where.notEquals !== undefined)
        return `${safeColumnName} != ${filter.where.notEquals}`
      if (filter.where.in !== undefined)
        return `${safeColumnName} IN (${filter.where.in.join(', ')})`
      if (filter.where.notIn !== undefined)
        return `${safeColumnName} NOT IN (${filter.where.notIn.join(', ')})`
      if (filter.where.lt !== undefined) return `${safeColumnName} < ${filter.where.lt}`
      if (filter.where.lte !== undefined) return `${safeColumnName} <= ${filter.where.lte}`
      if (filter.where.gt !== undefined) return `${safeColumnName} > ${filter.where.gt}`
      if (filter.where.gte !== undefined) return `${safeColumnName} >= ${filter.where.gte}`

      return null
  }

  throw { errorCode: ErrorCode.INCORRECT_DATA, error: 'Unknown column type' } satisfies ApiError
}

export function dataSourceFiltersToSqlite(
  filters: DataSourceFilter[],
  operator: 'AND' | 'OR' = 'AND',
): string {
  return filters.map(dataSourceFilterToSqlite).filter(Boolean).join(` ${operator} `)
}
