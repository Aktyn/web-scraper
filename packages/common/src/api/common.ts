import type { ErrorCode } from '../error'

export const MAX_SQLITE_INTEGER = 2147483647 as const

export interface ApiError {
  errorCode: ErrorCode
  error?: Error | string | null
}

export function isApiError(error: unknown): error is ApiError {
  return !!error && typeof error === 'object' && 'errorCode' in error
}

export type PaginatedApiResponse<DataType, IdProperty extends keyof DataType> =
  | ApiError
  | {
      data: DataType[]
      next?: DataType[IdProperty]
    }

// Note: this should be compatible with prisma type of the same name
export type StringFilter =
  | {
      equals?: string
      in?: string[]
      notIn?: string[]
      lt?: string
      lte?: string
      gt?: string
      gte?: string
      contains?: string
      startsWith?: string
      endsWith?: string
      not?: StringFilter | string
    }
  | string
export type NumberFilter =
  | {
      //TODO: support for other comparators
      in?: number[]
      notIn?: number[]
    }
  | number
type TypedFilter<ValueType> = ValueType extends string
  ? StringFilter
  : ValueType extends number
    ? NumberFilter
    : never

export type DataFilter<DataType> = Partial<{
  [key in keyof DataType]: DataType[key] | TypedFilter<DataType[key]>
}>

export type PaginatedRequest<
  DataType,
  IdProperty extends keyof DataType,
  OmitInFilters extends keyof DataType = never,
> = {
  count: number
  cursor?: DataType[IdProperty]
  filters?: DataFilter<Omit<DataType, OmitInFilters>>[] | string
}

export type PaginatedApiFunction<
  DataType,
  IdProperty extends keyof DataType,
  OmitInFilters extends keyof DataType = never,
  AdditionalArgumentType extends Array<unknown> = [],
> = (
  request: PaginatedRequest<DataType, IdProperty, OmitInFilters>,
  ...args: AdditionalArgumentType
) => Promise<PaginatedApiResponse<DataType, IdProperty>>

export type PaginatedApiFunctionWithEncryptedData<
  DataType,
  IdProperty extends keyof DataType,
  OmitInFilters extends keyof DataType = never,
> = (
  request: PaginatedRequest<DataType, IdProperty, OmitInFilters>,
  password: string | null,
) => Promise<PaginatedApiResponse<DataType, IdProperty>>

//TODO: possibly deprecated type
export type ApiResponse<DataType> =
  | ApiError
  | {
      data: DataType
    }
