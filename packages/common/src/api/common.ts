import type { ErrorCode } from '../error'

export interface ApiError {
  errorCode: ErrorCode
}

export type PaginatedApiResponse<DataType, IdProperty extends keyof DataType> =
  | ApiError
  | {
      data: DataType[]
      cursor?: {
        [key in IdProperty]: DataType[IdProperty]
      }
    }

export type PaginatedRequest<DataType, IdProperty extends keyof DataType> = {
  count: number
  cursor?: {
    [key in IdProperty]: DataType[IdProperty]
  }
}

export type PaginatedApiFunction<DataType, IdProperty extends keyof DataType> = (
  request: PaginatedRequest<DataType, IdProperty>,
) => Promise<PaginatedApiResponse<DataType, IdProperty>>

export type PaginatedApiFunctionWithEncryptedData<DataType, IdProperty extends keyof DataType> = (
  request: PaginatedRequest<DataType, IdProperty>,
  password: string | null,
) => Promise<PaginatedApiResponse<DataType, IdProperty>>

export type ApiResponse<DataType> =
  | ApiError
  | {
      data: DataType
    }
