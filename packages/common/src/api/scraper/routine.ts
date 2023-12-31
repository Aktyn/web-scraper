import type { DataSourceColumnType, DataSourceItem, DataSourceStructure } from './dataSource'
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
        dataSource: DataSourceStructure
        filter: DataSourceFilter
        maximumIterations?: number
      }
    | {
        type: RoutineExecutionType.SPECIFIC_IDS
        dataSource: DataSourceStructure
        ids: DataSourceItem['id'][]
      }
    | {
        type: RoutineExecutionType.EXCEPT_SPECIFIC_IDS
        dataSource: DataSourceStructure
        ids: DataSourceItem['id'][]
      }
    | {
        type: RoutineExecutionType.STANDALONE
        /** @default 1 */
        repeat?: number
      }
}

enum RoutineExecutionType {
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
