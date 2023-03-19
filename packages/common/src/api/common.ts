import type { ErrorCode } from '../error'

export interface ApiError {
  errorCode: ErrorCode
  error?: Error | string | null
}

export type PaginatedApiResponse<DataType, IdProperty extends keyof DataType> =
  | ApiError
  | {
      data: DataType[]
      cursor?: {
        [key in IdProperty]: DataType[IdProperty]
      }
    }

type DataFilter<DataType> = Partial<{
  [key in keyof DataType]: DataType[key]
}>

export type PaginatedRequest<
  DataType,
  IdProperty extends keyof DataType,
  OmitInFilters extends keyof DataType = never,
> = {
  count: number
  cursor?: {
    [key in IdProperty]: DataType[IdProperty]
  }
  filters?: DataFilter<Omit<DataType, OmitInFilters>>[]
}

export type PaginatedApiFunction<
  DataType,
  IdProperty extends keyof DataType,
  OmitInFilters extends keyof DataType = never,
> = (
  request: PaginatedRequest<DataType, IdProperty, OmitInFilters>,
) => Promise<PaginatedApiResponse<DataType, IdProperty>>

export type PaginatedApiFunctionWithEncryptedData<
  DataType,
  IdProperty extends keyof DataType,
  OmitInFilters extends keyof DataType = never,
> = (
  request: PaginatedRequest<DataType, IdProperty, OmitInFilters>,
  password: string | null,
) => Promise<PaginatedApiResponse<DataType, IdProperty>>

export type ApiResponse<DataType> =
  | ApiError
  | {
      data: DataType
    }
